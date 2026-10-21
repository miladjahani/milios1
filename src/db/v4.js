// ============================================================================
// miliconfigOS v4.0 - Persistence layer (Cloudflare D1)
// Adds sessions, endpoint catalog + health history, generated configurations,
// subscriptions, per-user usage, automation jobs and provider secrets.
// Falls back to isolate memory only for local development without a D1 binding;
// the UI surfaces that mode explicitly.
// ============================================================================

import { OFFICIAL_DIRECT_IPS, OFFICIAL_DIRECT_IPV6 } from '../config/defaults.js';
import {
  DEFAULT_SESSION_HOURS,
  MAX_SESSION_HOURS,
  MIN_SESSION_HOURS,
  decryptSecret,
  encryptSecret,
  randomToken,
  sha256HexDigest,
  timingSafeEqual
} from '../core/security.js';
import { detectD1Binding } from './d1.js';

const state = {
  ready: false,
  binding: null,
  memory: false,
  endpointsSeeded: false
};

const memory = {
  sessions: new Map(),
  attempts: [],
  endpoints: new Map(),
  health: [],
  configurations: [],
  subscriptions: new Map(),
  usage: new Map(),
  jobs: new Map(),
  jobRuns: [],
  secrets: new Map()
};

const DDL = [
  `CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    ip TEXT DEFAULT '',
    revoked INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    ok INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS endpoints (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 443,
    family TEXT NOT NULL DEFAULT 'ipv4',
    kind TEXT NOT NULL DEFAULT 'cloudflare',
    country TEXT DEFAULT '',
    region TEXT DEFAULT '',
    provider TEXT DEFAULT '',
    protocol TEXT DEFAULT 'vless',
    transport TEXT DEFAULT 'ws',
    tls_mode TEXT DEFAULT 'tls',
    source TEXT DEFAULT 'manual',
    enabled INTEGER NOT NULL DEFAULT 1,
    health_score INTEGER NOT NULL DEFAULT 0,
    last_latency_ms INTEGER DEFAULT 0,
    last_check_at INTEGER DEFAULT 0,
    last_check_level TEXT DEFAULT '',
    failure_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS endpoint_health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    level TEXT NOT NULL,
    ok INTEGER NOT NULL,
    latency_ms INTEGER DEFAULT 0,
    detail TEXT DEFAULT '',
    checked_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_endpoint_health ON endpoint_health(endpoint_id, checked_at DESC)`,
  `CREATE TABLE IF NOT EXISTS configurations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    protocol TEXT NOT NULL,
    endpoint_id TEXT DEFAULT '',
    transport TEXT NOT NULL,
    tls_mode TEXT NOT NULL,
    dns_profile TEXT DEFAULT '',
    chain_json TEXT DEFAULT '[]',
    client_format TEXT DEFAULT '',
    valid INTEGER NOT NULL DEFAULT 0,
    validation_json TEXT DEFAULT '{}',
    reason TEXT DEFAULT '',
    score INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_configurations_user ON configurations(user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    formats TEXT NOT NULL DEFAULT 'singbox,clash,uri',
    revoked INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    last_access_at INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    rotated_at INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS usage_daily (
    user_id TEXT NOT NULL,
    day_key TEXT NOT NULL,
    bytes INTEGER NOT NULL DEFAULT 0,
    requests INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'worker-stream',
    PRIMARY KEY (user_id, day_key, source)
  )`,
  `CREATE TABLE IF NOT EXISTS automation_jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    interval_minutes INTEGER NOT NULL DEFAULT 60,
    last_run_at INTEGER DEFAULT 0,
    next_run_at INTEGER DEFAULT 0,
    last_status TEXT DEFAULT '',
    last_error TEXT DEFAULT '',
    run_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS automation_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    status TEXT NOT NULL,
    detail TEXT DEFAULT '',
    started_at INTEGER NOT NULL,
    finished_at INTEGER DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_automation_runs ON automation_runs(job_id, started_at DESC)`,
  `CREATE TABLE IF NOT EXISTS cloudflare_resources (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    account_id TEXT DEFAULT '',
    zone_id TEXT DEFAULT '',
    name TEXT DEFAULT '',
    status TEXT DEFAULT '',
    detail TEXT DEFAULT '',
    checked_at INTEGER DEFAULT 0
  )`
];

function db(env) {
  const detected = detectD1Binding(env);
  return detected ? detected.db : null;
}

async function all(env, sql, ...binds) {
  const database = db(env);
  if (!database) return [];
  const stmt = database.prepare(sql);
  const bound = binds.length ? stmt.bind(...binds) : stmt;
  const res = await bound.all();
  return res?.results || [];
}

async function first(env, sql, ...binds) {
  const database = db(env);
  if (!database) return null;
  const stmt = database.prepare(sql);
  const bound = binds.length ? stmt.bind(...binds) : stmt;
  return await bound.first();
}

async function run(env, sql, ...binds) {
  const database = db(env);
  if (!database) return { success: false, memory: true, changes: 0 };
  const stmt = database.prepare(sql);
  const bound = binds.length ? stmt.bind(...binds) : stmt;
  const res = await bound.run();
  return { success: res?.success !== false, changes: Number(res?.meta?.changes ?? res?.changes ?? 0), result: res };
}

export function storageMode(env) {
  return db(env) ? 'd1' : 'memory';
}

export function databaseConfigured(env = {}) {
  return Boolean(db(env));
}

/** Memory mode is only safe for local development; it is opt-in. */
export function memoryModeAllowed(env = {}) {
  return String(env.MILI_ALLOW_MEMORY || env.MILICONFIG_ALLOW_MEMORY || '') === '1';
}

export function isMemoryMode() {
  return state.memory;
}

export async function ensureV4Schema(env = {}) {
  if (state.ready) return { ok: true, binding: state.binding, memory: state.memory };
  const database = db(env);
  if (!database) {
    state.memory = true;
    seedMemory();
    state.ready = true;
    return { ok: true, binding: null, memory: true };
  }
  const detected = detectD1Binding(env);
  try {
    for (const sql of DDL) await database.prepare(sql).run();
    await database.prepare(
      `INSERT INTO schema_meta (key, value) VALUES ('schema_version', '4')
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).run();
    state.ready = true;
    state.memory = false;
    state.binding = detected?.bindingName || 'DB';
    await seedEndpoints(env);
    await seedAutomationJobs(env);
    return { ok: true, binding: state.binding, memory: false };
  } catch (err) {
    state.memory = true;
    seedMemory();
    state.ready = true;
    return { ok: false, binding: detected?.bindingName || 'DB', memory: true, error: String(err?.message || err) };
  }
}

function seedMemory() {
  if (memory.endpoints.size) return;
  const now = Date.now();
  const seeds = [
    ...OFFICIAL_DIRECT_IPS.slice(0, 4).map((ip, idx) => ({ host: ip, family: 'ipv4', name: `Cloudflare anycast ${idx + 1}` })),
    ...OFFICIAL_DIRECT_IPV6.slice(0, 2).map((ip, idx) => ({ host: ip, family: 'ipv6', name: `Cloudflare IPv6 ${idx + 1}` }))
  ];
  for (const seed of seeds) {
    const id = `ep-builtin-${memory.endpoints.size + 1}`;
    memory.endpoints.set(id, {
      id, name: seed.name, host: seed.host, port: 443, family: seed.family,
      kind: 'cloudflare', country: '', region: '', provider: 'Cloudflare',
      protocol: 'vless', transport: 'ws', tlsMode: 'tls', source: 'builtin',
      enabled: true, healthScore: 0, lastLatencyMs: 0, lastCheckAt: 0,
      lastCheckLevel: '', failureCount: 0, notes: '',
      createdAt: now, updatedAt: now
    });
  }
  const nowJobs = [
    { id: 'job-health', name: 'Endpoint health refresh', kind: 'health', interval: 60 },
    { id: 'job-expiry', name: 'Expired user detection', kind: 'expiry', interval: 360 },
    { id: 'job-quota', name: 'Quota exhaustion detection', kind: 'quota', interval: 360 },
    { id: 'job-config', name: 'Configuration validation', kind: 'config-validation', interval: 720 }
  ];
  for (const job of nowJobs) {
    memory.jobs.set(job.id, {
      id: job.id, name: job.name, kind: job.kind, enabled: true,
      intervalMinutes: job.interval, lastRunAt: 0, nextRunAt: 0,
      lastStatus: '', lastError: '', runCount: 0, createdAt: now
    });
  }
}

async function seedEndpoints(env) {
  if (state.endpointsSeeded) return;
  state.endpointsSeeded = true;
  const existing = await first(env, 'SELECT COUNT(*) AS cnt FROM endpoints');
  if (Number(existing?.cnt || 0) > 0) return;
  const now = Date.now();
  const seeds = [
    ...OFFICIAL_DIRECT_IPS.slice(0, 4).map((ip, idx) => ({ host: ip, family: 'ipv4', name: `Cloudflare anycast ${idx + 1}` })),
    ...OFFICIAL_DIRECT_IPV6.slice(0, 2).map((ip, idx) => ({ host: ip, family: 'ipv6', name: `Cloudflare IPv6 ${idx + 1}` }))
  ];
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    const id = `ep-builtin-${i + 1}`;
    try {
      await run(
        env,
        `INSERT OR IGNORE INTO endpoints
          (id, name, host, port, family, kind, country, region, provider, protocol, transport, tls_mode,
           source, enabled, health_score, last_latency_ms, last_check_at, last_check_level, failure_count, notes, created_at, updated_at)
         VALUES (?, ?, ?, 443, ?, 'cloudflare', '', '', 'Cloudflare', 'vless', 'ws', 'tls',
           'builtin', 1, 0, 0, 0, '', 0, '', ?, ?)`,
        id, seed.name, seed.host, seed.family, now, now
      );
    } catch (_e) {}
  }
}

async function seedAutomationJobs(env) {
  const jobs = [
    { id: 'job-health', name: 'Endpoint health refresh', kind: 'health', interval: 60 },
    { id: 'job-expiry', name: 'Expired user detection', kind: 'expiry', interval: 360 },
    { id: 'job-quota', name: 'Quota exhaustion detection', kind: 'quota', interval: 360 },
    { id: 'job-config', name: 'Configuration validation', kind: 'config-validation', interval: 720 }
  ];
  const now = Date.now();
  for (const job of jobs) {
    try {
      await run(
        env,
        `INSERT OR IGNORE INTO automation_jobs
          (id, name, kind, enabled, interval_minutes, last_run_at, next_run_at, last_status, last_error, run_count, created_at)
         VALUES (?, ?, ?, 1, ?, 0, 0, '', '', 0, ?)`,
        job.id, job.name, job.kind, job.interval, now
      );
    } catch (_e) {}
  }
}

// --------------------------------------------------------------- metadata ---

export async function getMeta(env, key) {
  await ensureV4Schema(env);
  if (state.memory) return memory.secrets.get(`meta:${key}`) || null;
  const row = await first(env, `SELECT value FROM system_config WHERE key = ?`, `meta_${key}`);
  if (!row) return null;
  try { return JSON.parse(row.value); } catch (_e) { return row.value; }
}

export async function setMeta(env, key, value) {
  await ensureV4Schema(env);
  const serialized = JSON.stringify(value);
  if (state.memory) {
    memory.secrets.set(`meta:${key}`, serialized);
    return;
  }
  await run(
    env,
    `INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    `meta_${key}`, serialized, Date.now()
  );
}

// ---------------------------------------------------------------- sessions ---

function clampHours(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value)) return DEFAULT_SESSION_HOURS;
  return Math.max(MIN_SESSION_HOURS, Math.min(MAX_SESSION_HOURS, Math.round(value)));
}

export async function createAdminSession(env, options = {}) {
  await ensureV4Schema(env);
  const ttlHours = clampHours(options.ttlHours);
  const token = randomToken(32);
  const tokenHash = await sha256HexDigest(token);
  const now = Date.now();
  const expiresAt = now + ttlHours * 3600 * 1000;
  if (state.memory) {
    memory.sessions.set(tokenHash, { expiresAt, createdAt: now, ip: options.ip || '' });
  } else {
    await run(
      env,
      `INSERT INTO admin_sessions (token_hash, created_at, expires_at, ip, revoked) VALUES (?, ?, ?, ?, 0)`,
      tokenHash, now, expiresAt, String(options.ip || '').slice(0, 64)
    );
    try {
      await run(env, `DELETE FROM admin_sessions WHERE expires_at < ?`, now - 86400000);
    } catch (_e) {}
  }
  return { token, expiresAt, ttlHours };
}

export async function verifyAdminSessionToken(env, token) {
  const clean = String(token || '').trim();
  if (!clean) return { valid: false, reason: 'empty' };
  await ensureV4Schema(env);
  const tokenHash = await sha256HexDigest(clean);
  if (state.memory) {
    const record = memory.sessions.get(tokenHash);
    if (!record) return { valid: false, reason: 'not-found' };
    if (record.expiresAt < Date.now()) return { valid: false, reason: 'expired' };
    return { valid: true, expiresAt: record.expiresAt };
  }
  const row = await first(
    env,
    `SELECT token_hash, expires_at, revoked FROM admin_sessions WHERE token_hash = ?`,
    tokenHash
  );
  if (!row || Number(row.revoked) !== 0) return { valid: false, reason: 'not-found' };
  if (Number(row.expires_at) < Date.now()) return { valid: false, reason: 'expired' };
  return { valid: true, expiresAt: Number(row.expires_at) };
}

export async function revokeAllAdminSessions(env) {
  await ensureV4Schema(env);
  if (state.memory) {
    memory.sessions.clear();
    return;
  }
  await run(env, `UPDATE admin_sessions SET revoked = 1 WHERE revoked = 0`);
}

export async function revokeAdminSession(env, token) {
  const clean = String(token || '').trim();
  if (!clean) return false;
  await ensureV4Schema(env);
  const tokenHash = await sha256HexDigest(clean);
  if (state.memory) return memory.sessions.delete(tokenHash);
  const res = await run(env, `UPDATE admin_sessions SET revoked = 1 WHERE token_hash = ?`, tokenHash);
  return res.changes > 0;
}

export async function listActiveSessions(env) {
  await ensureV4Schema(env);
  if (state.memory) {
    return [...memory.sessions.entries()].map(([hash, record]) => ({
      tokenHash: hash.slice(0, 12), createdAt: record.createdAt, expiresAt: record.expiresAt, ip: record.ip
    }));
  }
  const rows = await all(
    env,
    `SELECT token_hash, created_at, expires_at, ip FROM admin_sessions
     WHERE revoked = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 20`,
    Date.now()
  );
  return rows.map(row => ({
    tokenHash: String(row.token_hash).slice(0, 12),
    createdAt: Number(row.created_at),
    expiresAt: Number(row.expires_at),
    ip: row.ip || ''
  }));
}

// ------------------------------------------------------------ login limits --

export async function recordLoginAttempt(env, ip, ok) {
  await ensureV4Schema(env);
  const now = Date.now();
  if (state.memory) {
    memory.attempts.push({ ip, ok, createdAt: now });
    if (memory.attempts.length > 500) memory.attempts.splice(0, memory.attempts.length - 500);
    return;
  }
  try {
    await run(env, `INSERT INTO login_attempts (ip, ok, created_at) VALUES (?, ?, ?)`, String(ip || ''), ok ? 1 : 0, now);
    await run(env, `DELETE FROM login_attempts WHERE created_at < ?`, now - 7 * 86400000);
  } catch (_e) {}
}

export async function recentFailedLogins(env, ip, windowMs = 15 * 60 * 1000) {
  await ensureV4Schema(env);
  const since = Date.now() - windowMs;
  if (state.memory) {
    return memory.attempts.filter(item => item.ip === ip && !item.ok && item.createdAt >= since).length;
  }
  const row = await first(
    env,
    `SELECT COUNT(*) AS cnt FROM login_attempts WHERE ip = ? AND ok = 0 AND created_at >= ?`,
    String(ip || ''), since
  );
  return Number(row?.cnt || 0);
}

export async function recentLoginAttempts(env, limit = 20) {
  await ensureV4Schema(env);
  if (state.memory) {
    return memory.attempts.slice(-limit).reverse().map((item, idx) => ({ id: idx + 1, ...item }));
  }
  const rows = await all(env, `SELECT id, ip, ok, created_at FROM login_attempts ORDER BY created_at DESC LIMIT ?`, limit);
  return rows.map(row => ({ id: row.id, ip: row.ip, ok: Number(row.ok) === 1, createdAt: Number(row.created_at) }));
}

// --------------------------------------------------------------- endpoints ---

function mapEndpoint(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    host: row.host,
    port: Number(row.port || 443),
    family: row.family || 'ipv4',
    kind: row.kind || 'manual',
    country: row.country || '',
    region: row.region || '',
    provider: row.provider || '',
    protocol: row.protocol || 'vless',
    transport: row.transport || 'ws',
    tlsMode: row.tls_mode || row.tlsMode || 'tls',
    source: row.source || 'manual',
    enabled: Number(row.enabled) !== 0,
    healthScore: Number(row.health_score ?? row.healthScore ?? 0),
    lastLatencyMs: Number(row.last_latency_ms ?? row.lastLatencyMs ?? 0),
    lastCheckAt: Number(row.last_check_at ?? row.lastCheckAt ?? 0),
    lastCheckLevel: row.last_check_level || '',
    failureCount: Number(row.failure_count ?? row.failureCount ?? 0),
    notes: row.notes || '',
    createdAt: Number(row.created_at ?? Date.now()),
    updatedAt: Number(row.updated_at ?? Date.now())
  };
}

export async function listEndpoints(env) {
  await ensureV4Schema(env);
  if (state.memory) {
    return [...memory.endpoints.values()]
      .filter(item => item.enabled)
      .sort((a, b) => b.healthScore - a.healthScore);
  }
  const rows = await all(env, `SELECT * FROM endpoints ORDER BY enabled DESC, health_score DESC, name ASC`);
  return rows.map(mapEndpoint);
}

export async function getEndpoint(env, id) {
  await ensureV4Schema(env);
  if (state.memory) return memory.endpoints.get(id) || null;
  const row = await first(env, `SELECT * FROM endpoints WHERE id = ?`, id);
  return mapEndpoint(row);
}

export async function createEndpoint(env, data = {}) {
  await ensureV4Schema(env);
  const now = Date.now();
  const id = String(data.id || `ep-${randomToken(6)}`);
  const record = {
    id,
    name: String(data.name || data.host || id).slice(0, 80),
    host: String(data.host || '').trim(),
    port: Math.max(1, Math.min(65535, parseInt(data.port, 10) || 443)),
    family: data.family || 'ipv4',
    kind: data.kind || 'manual',
    country: String(data.country || '').toUpperCase().slice(0, 2),
    region: String(data.region || '').slice(0, 80),
    provider: String(data.provider || '').slice(0, 80),
    protocol: data.protocol || 'vless',
    transport: data.transport || 'ws',
    tlsMode: data.tlsMode || 'tls',
    source: data.source || 'manual',
    enabled: data.enabled !== false,
    healthScore: 0,
    lastLatencyMs: 0,
    lastCheckAt: 0,
    lastCheckLevel: '',
    failureCount: 0,
    notes: String(data.notes || '').slice(0, 300),
    createdAt: now,
    updatedAt: now
  };
  if (state.memory) {
    memory.endpoints.set(id, record);
    return record;
  }
  await run(
    env,
    `INSERT INTO endpoints
      (id, name, host, port, family, kind, country, region, provider, protocol, transport, tls_mode,
       source, enabled, health_score, last_latency_ms, last_check_at, last_check_level, failure_count, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, '', 0, ?, ?, ?)`,
    record.id, record.name, record.host, record.port, record.family, record.kind, record.country,
    record.region, record.provider, record.protocol, record.transport, record.tlsMode, record.source,
    record.enabled ? 1 : 0, record.notes, now, now
  );
  return record;
}

export async function updateEndpoint(env, id, patch = {}) {
  const existing = await getEndpoint(env, id);
  if (!existing) return null;
  const next = {
    ...existing,
    ...patch,
    port: patch.port !== undefined ? Math.max(1, Math.min(65535, parseInt(patch.port, 10) || existing.port)) : existing.port,
    enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : existing.enabled,
    updatedAt: Date.now()
  };
  if (state.memory) {
    memory.endpoints.set(id, next);
    return next;
  }
  await run(
    env,
    `UPDATE endpoints SET name = ?, host = ?, port = ?, family = ?, kind = ?, country = ?, region = ?,
      provider = ?, protocol = ?, transport = ?, tls_mode = ?, enabled = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    next.name, next.host, next.port, next.family, next.kind, next.country, next.region, next.provider,
    next.protocol, next.transport, next.tlsMode, next.enabled ? 1 : 0, next.notes, next.updatedAt, id
  );
  return next;
}

export async function deleteEndpoint(env, id) {
  await ensureV4Schema(env);
  if (state.memory) return memory.endpoints.delete(id);
  const res = await run(env, `DELETE FROM endpoints WHERE id = ?`, id);
  await run(env, `DELETE FROM endpoint_health WHERE endpoint_id = ?`, id);
  return res.changes > 0;
}

export async function recordEndpointHealth(env, endpointId, result = {}) {
  await ensureV4Schema(env);
  const now = Number(result.checkedAt || Date.now());
  const status = result.status || 'unknown';
  const score = Math.max(0, Math.min(100, Number(result.score || 0)));
  const latency = Number(result.checks?.tcp?.latencyMs || result.checks?.tls?.latencyMs || 0);
  const level = result.verifiedLevel || '';

  if (state.memory) {
    const ep = memory.endpoints.get(endpointId);
    if (ep) {
      ep.healthScore = score;
      ep.lastLatencyMs = latency;
      ep.lastCheckAt = now;
      ep.lastCheckLevel = level;
      ep.failureCount = ['unreachable', 'invalid'].includes(status) ? ep.failureCount + 1 : 0;
    }
    memory.health.unshift({ endpointId, status, score, latencyMs: latency, detail: status, checkedAt: now });
    if (memory.health.length > 500) memory.health.length = 500;
    return;
  }

  const failed = ['unreachable', 'invalid'].includes(status) ? 1 : 0;
  await run(
    env,
    `UPDATE endpoints SET health_score = ?, last_latency_ms = ?, last_check_at = ?, last_check_level = ?,
      failure_count = CASE WHEN ? = 1 THEN failure_count + 1 ELSE 0 END, updated_at = ? WHERE id = ?`,
    score, latency, now, level, failed, now, endpointId
  );
  await run(
    env,
    `INSERT INTO endpoint_health (endpoint_id, level, ok, latency_ms, detail, checked_at) VALUES (?, ?, ?, ?, ?, ?)`,
    endpointId, level || 'syntax', score > 0 ? 1 : 0, latency, `${status}${result.detail ? ': ' + result.detail : ''}`.slice(0, 300), now
  );
}

export async function listEndpointHealth(env, endpointId, limit = 20) {
  await ensureV4Schema(env);
  if (state.memory) return memory.health.filter(item => item.endpointId === endpointId).slice(0, limit);
  const rows = await all(
    env,
    `SELECT * FROM endpoint_health WHERE endpoint_id = ? ORDER BY checked_at DESC LIMIT ?`,
    endpointId, limit
  );
  return rows.map(row => ({
    id: row.id, endpointId: row.endpoint_id, level: row.level, ok: Number(row.ok) === 1,
    latencyMs: Number(row.latency_ms || 0), detail: row.detail, checkedAt: Number(row.checked_at)
  }));
}

// ---------------------------------------------------------- configurations --

export async function replaceUserConfigurations(env, userId, rows = []) {
  await ensureV4Schema(env);
  if (state.memory) {
    memory.configurations = memory.configurations.filter(row => row.userId !== userId);
    memory.configurations.push(...rows);
    return rows.length;
  }
  await run(env, `DELETE FROM configurations WHERE user_id = ?`, userId);
  for (const row of rows) {
    await run(
      env,
      `INSERT INTO configurations
        (id, user_id, protocol, endpoint_id, transport, tls_mode, dns_profile, chain_json, client_format, valid, validation_json, reason, score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row.id, row.userId, row.protocol, row.endpointId, row.transport, row.tlsMode, row.dnsProfile,
      row.chain, row.clientFormat, row.valid ? 1 : 0, row.validation, row.reason, row.score, row.createdAt
    );
  }
  return rows.length;
}

export async function listConfigurations(env, options = {}) {
  await ensureV4Schema(env);
  const limit = Math.max(1, Math.min(200, Number(options.limit) || 50));
  if (state.memory) {
    const rows = options.userId
      ? memory.configurations.filter(row => row.userId === options.userId)
      : memory.configurations;
    return rows.slice(0, limit).sort((a, b) => b.createdAt - a.createdAt);
  }
  const rows = options.userId
    ? await all(env, `SELECT * FROM configurations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`, options.userId, limit)
    : await all(env, `SELECT * FROM configurations ORDER BY created_at DESC LIMIT ?`, limit);
  return rows.map(row => {
    let validation = {};
    try { validation = JSON.parse(row.validation_json || '{}'); } catch (_e) {}
    return {
      id: row.id,
      userId: row.user_id,
      protocol: row.protocol,
      endpointId: row.endpoint_id,
      transport: row.transport,
      tlsMode: row.tls_mode,
      dnsProfile: row.dns_profile,
      clientFormat: row.client_format,
      valid: Number(row.valid) === 1,
      validation,
      reason: row.reason || '',
      score: Number(row.score || 0),
      createdAt: Number(row.created_at)
    };
  });
}

// ------------------------------------------------------------ subscriptions --

function mapSubscription(row, env) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    formats: String(row.formats || '').split(',').filter(Boolean),
    revoked: Number(row.revoked) === 1,
    downloads: Number(row.downloads || 0),
    lastAccessAt: Number(row.last_access_at || 0),
    createdAt: Number(row.created_at),
    rotatedAt: Number(row.rotated_at || 0)
  };
}

export async function ensureSubscription(env, userId, formats = 'singbox,clash,uri') {
  await ensureV4Schema(env);
  const existing = await getSubscription(env, userId);
  if (existing) return existing;
  const now = Date.now();
  const record = {
    id: `sub-${randomToken(6)}`,
    userId,
    token: randomToken(24),
    formats: String(formats),
    revoked: false,
    downloads: 0,
    lastAccessAt: 0,
    createdAt: now,
    rotatedAt: 0
  };
  if (state.memory) {
    memory.subscriptions.set(userId, record);
    return record;
  }
  await run(
    env,
    `INSERT OR IGNORE INTO subscriptions (id, user_id, token, formats, revoked, downloads, last_access_at, created_at, rotated_at)
     VALUES (?, ?, ?, ?, 0, 0, 0, ?, 0)`,
    record.id, userId, record.token, record.formats, now
  );
  return await getSubscription(env, userId);
}

export async function getSubscription(env, userId) {
  await ensureV4Schema(env);
  if (state.memory) return memory.subscriptions.get(userId) || null;
  const row = await first(env, `SELECT * FROM subscriptions WHERE user_id = ?`, userId);
  return mapSubscription(row, env);
}

export async function listSubscriptions(env) {
  await ensureV4Schema(env);
  if (state.memory) return [...memory.subscriptions.values()];
  const rows = await all(env, `SELECT * FROM subscriptions`);
  return rows.map(row => mapSubscription(row, env));
}

export async function rotateSubscription(env, userId, formats) {
  await ensureV4Schema(env);
  const token = randomToken(24);
  const now = Date.now();
  if (state.memory) {
    const current = memory.subscriptions.get(userId);
    if (!current) return null;
    const next = { ...current, token, revoked: false, rotatedAt: now };
    if (formats) next.formats = String(formats);
    memory.subscriptions.set(userId, next);
    return next;
  }
  await run(env, `UPDATE subscriptions SET token = ?, revoked = 0, rotated_at = ? WHERE user_id = ?`, token, now, userId);
  if (formats) await run(env, `UPDATE subscriptions SET formats = ? WHERE user_id = ?`, String(formats), userId);
  return await getSubscription(env, userId);
}

export async function setSubscriptionRevoked(env, userId, revoked) {
  await ensureV4Schema(env);
  if (state.memory) {
    const current = memory.subscriptions.get(userId);
    if (!current) return null;
    current.revoked = Boolean(revoked);
    return current;
  }
  await run(env, `UPDATE subscriptions SET revoked = ? WHERE user_id = ?`, revoked ? 1 : 0, userId);
  return await getSubscription(env, userId);
}

export async function findSubscriptionByToken(env, token) {
  await ensureV4Schema(env);
  const clean = String(token || '').trim();
  if (!clean) return null;
  if (state.memory) {
    for (const sub of memory.subscriptions.values()) if (timingSafeEqual(sub.token, clean)) return sub;
    return null;
  }
  const row = await first(env, `SELECT * FROM subscriptions WHERE token = ?`, clean);
  return mapSubscription(row, env);
}

export async function touchSubscriptionAccess(env, userId) {
  const now = Date.now();
  if (state.memory) {
    const sub = memory.subscriptions.get(userId);
    if (sub) {
      sub.downloads += 1;
      sub.lastAccessAt = now;
    }
    return;
  }
  try {
    await run(env, `UPDATE subscriptions SET downloads = downloads + 1, last_access_at = ? WHERE user_id = ?`, now, userId);
  } catch (_e) {}
}

export async function deleteUserArtifacts(env, userId) {
  await ensureV4Schema(env);
  if (state.memory) {
    memory.subscriptions.delete(userId);
    memory.configurations = memory.configurations.filter(row => row.userId !== userId);
    for (const key of [...memory.usage.keys()]) if (key.startsWith(`${userId}|`)) memory.usage.delete(key);
    return;
  }
  await run(env, `DELETE FROM configurations WHERE user_id = ?`, userId);
  await run(env, `DELETE FROM subscriptions WHERE user_id = ?`, userId);
  await run(env, `DELETE FROM usage_daily WHERE user_id = ?`, userId);
}

// -------------------------------------------------------------------- usage --

function dayKey(timestamp = Date.now(), timezoneOffsetMinutes = 0) {
  return new Date(timestamp + timezoneOffsetMinutes * 60000).toISOString().slice(0, 10);
}

export async function recordUsageDaily(env, userId, bytes, requests, source = 'worker-stream', timestamp = Date.now()) {
  if (!userId) return;
  await ensureV4Schema(env);
  const key = dayKey(timestamp);
  const byteCount = Math.max(0, Number(bytes) || 0);
  const requestCount = Math.max(0, Number(requests) || 0);
  if (state.memory) {
    const id = `${userId}|${key}|${source}`;
    const current = memory.usage.get(id) || { userId, dayKey: key, source, bytes: 0, requests: 0 };
    current.bytes += byteCount;
    current.requests += requestCount;
    memory.usage.set(id, current);
    return;
  }
  await run(
    env,
    `INSERT INTO usage_daily (user_id, day_key, bytes, requests, source) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, day_key, source) DO UPDATE SET bytes = bytes + excluded.bytes, requests = requests + excluded.requests`,
    userId, key, byteCount, requestCount, source
  );
}

export async function usageForUser(env, userId, days = 30) {
  await ensureV4Schema(env);
  const since = dayKey(Date.now() - days * 86400000);
  if (state.memory) {
    return [...memory.usage.values()]
      .filter(item => item.userId === userId && item.dayKey >= since)
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  }
  const rows = await all(
    env,
    `SELECT day_key, bytes, requests, source FROM usage_daily WHERE user_id = ? AND day_key >= ? ORDER BY day_key ASC`,
    userId, since
  );
  return rows.map(row => ({
    userId,
    dayKey: row.day_key,
    bytes: Number(row.bytes || 0),
    requests: Number(row.requests || 0),
    source: row.source
  }));
}

export async function usageTotals(env, days = 30) {
  await ensureV4Schema(env);
  const since = dayKey(Date.now() - days * 86400000);
  if (state.memory) {
    const totals = new Map();
    for (const item of memory.usage.values()) {
      if (item.dayKey < since) continue;
      totals.set(item.dayKey, (totals.get(item.dayKey) || 0) + item.bytes);
    }
    return [...totals.entries()].map(([dayKeyValue, bytes]) => ({ dayKey: dayKeyValue, bytes })).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  }
  const rows = await all(
    env,
    `SELECT day_key, SUM(bytes) AS bytes FROM usage_daily WHERE day_key >= ? GROUP BY day_key ORDER BY day_key ASC`,
    since
  );
  return rows.map(row => ({ dayKey: row.day_key, bytes: Number(row.bytes || 0) }));
}

// --------------------------------------------------------------- automation --

function mapJob(row) {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    enabled: Number(row.enabled) === 1,
    intervalMinutes: Number(row.interval_minutes || 60),
    lastRunAt: Number(row.last_run_at || 0),
    nextRunAt: Number(row.next_run_at || 0),
    lastStatus: row.last_status || '',
    lastError: row.last_error || '',
    runCount: Number(row.run_count || 0)
  };
}

export async function listAutomationJobs(env) {
  await ensureV4Schema(env);
  if (state.memory) return [...memory.jobs.values()];
  const rows = await all(env, `SELECT * FROM automation_jobs ORDER BY kind ASC`);
  return rows.map(mapJob);
}

export async function getAutomationJob(env, id) {
  const jobs = await listAutomationJobs(env);
  return jobs.find(job => job.id === id) || null;
}

export async function setAutomationJobEnabled(env, id, enabled) {
  await ensureV4Schema(env);
  if (state.memory) {
    const job = memory.jobs.get(id);
    if (!job) return null;
    job.enabled = Boolean(enabled);
    return job;
  }
  await run(env, `UPDATE automation_jobs SET enabled = ? WHERE id = ?`, enabled ? 1 : 0, id);
  return await getAutomationJob(env, id);
}

export async function recordAutomationRun(env, id, { status, detail = '', error = '' } = {}) {
  await ensureV4Schema(env);
  const now = Date.now();
  const job = await getAutomationJob(env, id);
  if (!job) return null;
  const nextRun = job.enabled ? now + job.intervalMinutes * 60000 : 0;
  if (state.memory) {
    const current = memory.jobs.get(id);
    if (current) {
      current.lastRunAt = now;
      current.nextRunAt = nextRun;
      current.lastStatus = status;
      current.lastError = error;
      current.runCount += 1;
    }
    memory.jobRuns.unshift({ jobId: id, status, detail, startedAt: now, finishedAt: now });
    if (memory.jobRuns.length > 200) memory.jobRuns.length = 200;
    return;
  }
  await run(
    env,
    `UPDATE automation_jobs SET last_run_at = ?, next_run_at = ?, last_status = ?, last_error = ?, run_count = run_count + 1 WHERE id = ?`,
    now, nextRun, status, error, id
  );
  await run(
    env,
    `INSERT INTO automation_runs (job_id, status, detail, started_at, finished_at) VALUES (?, ?, ?, ?, ?)`,
    id, status, detail.slice(0, 500), now, now
  );
}

export async function listAutomationRuns(env, id, limit = 20) {
  await ensureV4Schema(env);
  if (state.memory) return memory.jobRuns.filter(run => run.jobId === id).slice(0, limit);
  const rows = await all(
    env,
    `SELECT * FROM automation_runs WHERE job_id = ? ORDER BY started_at DESC LIMIT ?`,
    id, limit
  );
  return rows.map(row => ({
    id: row.id, jobId: row.job_id, status: row.status, detail: row.detail,
    startedAt: Number(row.started_at), finishedAt: Number(row.finished_at)
  }));
}

// ------------------------------------------------------ provider credentials --

const CF_TOKEN_KEY = 'cf_api_token_enc';
const CF_TOKEN_MODE = 'cf_api_token_mode';

export async function saveCloudflareToken(env, token, meta = {}) {
  await ensureV4Schema(env);
  const encrypted = await encryptSecret(token, env);
  const now = Date.now();
  if (state.memory) {
    memory.secrets.set(CF_TOKEN_KEY, encrypted.value);
    memory.secrets.set(CF_TOKEN_MODE, encrypted.mode);
    memory.secrets.set('cf_verified_at', String(now));
    if (meta.accountId) memory.secrets.set('cf_account_id', String(meta.accountId));
    return { mode: encrypted.mode, storedAt: now };
  }
  const upsert = async (key, value) => {
    await run(
      env,
      `INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      key, String(value), now
    );
  };
  await upsert(CF_TOKEN_KEY, encrypted.value);
  await upsert(CF_TOKEN_MODE, encrypted.mode);
  await upsert('cf_verified_at', String(now));
  if (meta.accountId) await upsert('cf_account_id', String(meta.accountId));
  return { mode: encrypted.mode, storedAt: now };
}

export async function getCloudflareToken(env) {
  await ensureV4Schema(env);
  let stored = '';
  let mode = '';
  if (state.memory) {
    stored = memory.secrets.get(CF_TOKEN_KEY) || '';
    mode = memory.secrets.get(CF_TOKEN_MODE) || '';
  } else {
    const rows = await all(env, `SELECT key, value FROM system_config WHERE key IN (?, ?)`, CF_TOKEN_KEY, CF_TOKEN_MODE);
    for (const row of rows) {
      if (row.key === CF_TOKEN_KEY) stored = row.value;
      if (row.key === CF_TOKEN_MODE) mode = row.value;
    }
  }
  if (!stored) return { token: '', mode: 'none', storage: 'none' };
  try {
    const decrypted = await decryptSecret(stored, env);
    return { token: decrypted.value, mode: decrypted.mode, storage: mode || decrypted.mode };
  } catch (err) {
    return { token: '', mode: 'unreadable', storage: mode || 'unknown', error: String(err?.message || err) };
  }
}

export async function cloudflareStatus(env) {
  await ensureV4Schema(env);
  const stored = await getCloudflareToken(env);
  let verifiedAt = 0;
  let accountId = '';
  if (state.memory) {
    verifiedAt = Number(memory.secrets.get('cf_verified_at') || 0);
    accountId = memory.secrets.get('cf_account_id') || '';
  } else {
    const rows = await all(env, `SELECT key, value FROM system_config WHERE key IN ('cf_verified_at', 'cf_account_id')`);
    for (const row of rows) {
      if (row.key === 'cf_verified_at') verifiedAt = Number(row.value || 0);
      if (row.key === 'cf_account_id') accountId = row.value || '';
    }
  }
  return {
    connected: Boolean(stored.token),
    storage: stored.storage,
    encryption: stored.mode,
    encryptionKeyConfigured: Boolean(String(env.MILI_ENCRYPTION_KEY || env.MILICONFIG_ENCRYPTION_KEY || '').length >= 16),
    verifiedAt,
    accountId,
    error: stored.error || null
  };
}

export async function clearCloudflareToken(env) {
  await ensureV4Schema(env);
  if (state.memory) {
    memory.secrets.delete(CF_TOKEN_KEY);
    memory.secrets.delete(CF_TOKEN_MODE);
    memory.secrets.delete('cf_verified_at');
    return;
  }
  await run(env, `DELETE FROM system_config WHERE key IN (?, ?, 'cf_verified_at')`, CF_TOKEN_KEY, CF_TOKEN_MODE);
}

export async function saveCloudflareResource(env, resource = {}) {
  await ensureV4Schema(env);
  const now = Date.now();
  const id = resource.id || `cf-${randomToken(6)}`;
  if (state.memory) {
    memory.secrets.set(`resource:${id}`, JSON.stringify(resource));
    return id;
  }
  await run(
    env,
    `INSERT INTO cloudflare_resources (id, kind, account_id, zone_id, name, status, detail, checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status = excluded.status, detail = excluded.detail, checked_at = excluded.checked_at`,
    id, resource.kind || 'account', resource.accountId || '', resource.zoneId || '',
    resource.name || '', resource.status || '', resource.detail || '', now
  );
  return id;
}

export async function listCloudflareResources(env) {
  await ensureV4Schema(env);
  if (state.memory) return [];
  const rows = await all(env, `SELECT * FROM cloudflare_resources ORDER BY checked_at DESC LIMIT 50`);
  return rows.map(row => ({
    id: row.id, kind: row.kind, accountId: row.account_id, zoneId: row.zone_id,
    name: row.name, status: row.status, detail: row.detail, checkedAt: Number(row.checked_at)
  }));
}

// -------------------------------------------------------------------- audit --

export async function listAuditLogsPaged(env, { limit = 50, offset = 0 } = {}) {
  await ensureV4Schema(env);
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50));
  const safeOffset = Math.max(0, Number(offset) || 0);
  if (state.memory) {
    const { getAuditLogs } = await import('./d1.js');
    return await getAuditLogs(env, safeLimit);
  }
  const rows = await all(
    env,
    `SELECT id, action, detail, ip, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    safeLimit, safeOffset
  );
  return rows.map(row => ({
    id: row.id, action: row.action, detail: row.detail, ip: row.ip, createdAt: Number(row.created_at)
  }));
}
