// ============================================================================
// miliconfig v3.1 - لایه دیتابیس Cloudflare D1 با Auto-Migration،
// محدودیت سقف ۳ کاربر، سیستم رمز عبور مدیر و Fallback هوشمند
// ============================================================================

import {
  BRAND_NAME,
  CONFIG_DEFAULTS,
  DEFAULT_ADMIN_UUID,
  MAX_USERS_LIMIT,
  getEnvConfigSnapshot,
  normalizeEffectiveConfig
} from '../config/defaults.js';
import { buildUserDefaultConfig } from '../config/presets.js';
import { generateShortId, generateUuidV4, isValidUuid, sha256Hex } from '../core/utils.js';
import { describePasswordRecord, hashPassword, passwordPolicy, timingSafeEqual, verifyPassword } from '../core/security.js';
// Session helpers live in the v4 layer; the import is intentional despite the
// module cycle (d1 ↔ v4) because both sides only call each other at request
// time, never during module evaluation.
import { createAdminSession, revokeAllAdminSessions, verifyAdminSessionToken } from './v4.js';

// حافظه کش داخلی هر Isolate جهت کارکرد بدون وقفه و حداکثر سرعت
const memoryStore = {
  initialized: false,
  d1SchemaReady: false,
  bootTime: Date.now(),
  globalConfig: {},
  users: new Map(),
  auditLogs: [],
  trafficHourly: new Map(),
  lastSyncAt: 0,
  adminPasswordHash: '',
  envPasswordDigest: '',
  adminPath: '',
  schemaDb: null,
  schemaLastAttemptAt: 0,
  schemaError: ''
};

// Schema DDL is expensive enough to matter during an outage: without a
// cooldown a quota-limited database was queried dozens of times per request.
const D1_SCHEMA_RETRY_MS = 10000;

export function detectD1Binding(env) {
  if (!env || typeof env !== 'object') return null;
  const priorityNames = ['DB', 'D1', 'db', 'd1', 'MILICONFIG_DB', 'miliconfig_db', 'DATABASE', 'database'];
  for (const name of priorityNames) {
    const candidate = env[name];
    if (candidate && typeof candidate === 'object' && typeof candidate.prepare === 'function') {
      return { db: candidate, bindingName: name };
    }
  }
  for (const [key, val] of Object.entries(env)) {
    if (val && typeof val === 'object' && typeof val.prepare === 'function') {
      return { db: val, bindingName: key };
    }
  }
  return null;
}

export function detectKvBinding(env) {
  if (!env || typeof env !== 'object') return null;
  const priorityNames = ['C', 'c', 'KV', 'kv', 'MILICONFIG_KV'];
  for (const name of priorityNames) {
    const candidate = env[name];
    if (
      candidate &&
      typeof candidate === 'object' &&
      typeof candidate.get === 'function' &&
      typeof candidate.put === 'function' &&
      typeof candidate.prepare !== 'function'
    ) {
      return { kv: candidate, bindingName: name };
    }
  }
  for (const [key, val] of Object.entries(env)) {
    if (
      val &&
      typeof val === 'object' &&
      typeof val.get === 'function' &&
      typeof val.put === 'function' &&
      typeof val.prepare !== 'function'
    ) {
      return { kv: val, bindingName: key };
    }
  }
  return null;
}

function safeBind(stmt, ...params) {
  const sanitized = params.map(p => {
    if (p === undefined) return null;
    if (typeof p === 'number' && !Number.isFinite(p)) return 0;
    if (typeof p === 'boolean') return p ? 1 : 0;
    return p;
  });
  return stmt.bind(...sanitized);
}

export function getAdminUuid(env = {}) {
  // UUID پیش‌فرض عمومی حذف شده است؛ فقط مقدار محیطی یا مسیر رندوم همین نصب
  const raw = env?.u || env?.U || env?.UUID || env?.uuid || memoryStore.adminPath || '';
  return String(raw).trim().toLowerCase();
}

// مسیر مدیریت بدون UUID پیش‌فرض عمومی:
// اگر متغیر محیطی u/UUID تنظیم نشده باشد، یک UUID رندوم یکتا برای همین نصب ساخته
// و در D1/KV ذخیره می‌شود؛ بنابراین هیچ مسیر قابل حدسی روی استقرار وجود ندارد.
export async function getOrCreateAdminPath(env = {}) {
  const envValue = env?.u || env?.U || env?.UUID || env?.uuid;
  if (envValue && String(envValue).trim()) {
    return String(envValue).trim().toLowerCase();
  }
  if (memoryStore.adminPath) return memoryStore.adminPath;

  await ensureD1Schema(env);
  const key = 'admin_path';
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const row = await detectedD1.db.prepare('SELECT value FROM system_config WHERE key = ?').bind(key).first();
      if (row && row.value) {
        memoryStore.adminPath = String(row.value).trim().toLowerCase();
        return memoryStore.adminPath;
      }
    } catch (_e) {}
  }

  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try {
      const kvVal = await detectedKv.kv.get(key);
      if (kvVal) {
        memoryStore.adminPath = String(kvVal).trim().toLowerCase();
        return memoryStore.adminPath;
      }
    } catch (_e) {}
  }

  const generated = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : generateUuidV4();
  memoryStore.adminPath = generated;

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await detectedD1.db.prepare(
        'INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
      ).bind(key, generated, Date.now()).run();
    } catch (_e) {}
  }
  if (detectedKv) {
    try { await detectedKv.kv.put(key, generated); } catch (_e) {}
  }
  return generated;
}

// توکن نشست مدیریت: مشتق‌شده از هش رمز عبور (با تغییر رمز، نشست‌های قبلی باطل می‌شوند)
// نشست مدیریت: توکن تصادفی با انقضا در D1 (جایگزین توکن مشتق‌شده از هش رمز)
export async function buildAdminSessionToken(env = {}) {
  const hasPassword = await hasAdminPassword(env);
  if (!hasPassword) return '';
  const cfg = await loadGlobalConfig(env);
  try {
    const session = await createAdminSession(env, { ttlHours: cfg.sessionHours || 12 });
    return session.token;
  } catch (_e) {
    return '';
  }
}

export async function verifyAdminSession(env = {}, token = '') {
  const clean = String(token || '').trim();
  if (!clean) return false;
  try {
    const result = await verifyAdminSessionToken(env, clean);
    return result.valid === true;
  } catch (_e) {
    return false;
  }
}

// چرخش مسیر مدیریت: تولید UUID جدید و ذخیره آن (امکان تغییر مسیر در هر زمان)
export async function rotateAdminPath(env = {}) {
  await ensureD1Schema(env);
  const generated = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : generateUuidV4();
  memoryStore.adminPath = generated;

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await detectedD1.db.prepare(
        'INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
      ).bind('admin_path', generated, Date.now()).run();
    } catch (_e) {}
  }
  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try { await detectedKv.kv.put('admin_path', generated); } catch (_e) {}
  }
  await addAuditLog(env, 'چرخش مسیر مدیریت', 'Admin path rotated', '');
  return generated;
}

// ساخت خودکار جداول D1 (Auto-Migration)
export async function ensureD1Schema(env = {}, force = false) {
  const detected = detectD1Binding(env);
  if (!detected) {
    ensureMemorySeeded(env);
    return { d1Enabled: false, bindingName: null, migrated: false };
  }
  const { db, bindingName } = detected;
  if (memoryStore.schemaDb !== db) {
    memoryStore.schemaDb = db;
    memoryStore.d1SchemaReady = false;
    memoryStore.schemaError = '';
    memoryStore.schemaLastAttemptAt = 0;
  }
  if (memoryStore.d1SchemaReady && !force) {
    return { d1Enabled: true, bindingName, migrated: true };
  }
  if (!force && memoryStore.schemaError && Date.now() - memoryStore.schemaLastAttemptAt < D1_SCHEMA_RETRY_MS) {
    return { d1Enabled: true, bindingName, migrated: false, error: memoryStore.schemaError };
  }
  memoryStore.schemaLastAttemptAt = Date.now();

  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      uuid TEXT NOT NULL UNIQUE,
      sub_node_count INTEGER NOT NULL DEFAULT 50,
      status TEXT NOT NULL DEFAULT 'active',
      enabled INTEGER NOT NULL DEFAULT 1,
      data_limit_gb REAL NOT NULL DEFAULT 0,
      used_bytes INTEGER NOT NULL DEFAULT 0,
      lifetime_bytes INTEGER NOT NULL DEFAULT 0,
      request_count INTEGER NOT NULL DEFAULT 0,
      expire_days INTEGER NOT NULL DEFAULT 0,
      expire_at INTEGER NOT NULL DEFAULT 0,
      start_on_first_use INTEGER NOT NULL DEFAULT 1,
      first_connected_at INTEGER NOT NULL DEFAULT 0,
      ip_limit INTEGER NOT NULL DEFAULT 50,
      node_scope TEXT NOT NULL DEFAULT 'all',
      preset TEXT NOT NULL DEFAULT 'iran-fast',
      note TEXT DEFAULT '',
      config_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS preferred_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      port INTEGER NOT NULL DEFAULT 443,
      name TEXT NOT NULL,
      colo TEXT DEFAULT '',
      latency INTEGER DEFAULT 0,
      source TEXT DEFAULT 'manual',
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      ip TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS traffic_hourly (
      hour_key TEXT PRIMARY KEY,
      bytes INTEGER NOT NULL DEFAULT 0,
      requests INTEGER NOT NULL DEFAULT 0
    )`
  ];

  try {
    for (const sql of ddlStatements) {
      await db.prepare(sql).run();
    }
    memoryStore.d1SchemaReady = true;
    memoryStore.schemaError = '';

    // No user is created automatically: all five user slots belong to the
    // administrator. Creating a hidden starter account here would silently
    // consume capacity and ship an account nobody asked for.
    await addAuditLog(env, 'آماده‌سازی دیتابیس D1', `binding=${bindingName}`, 'system');

    return { d1Enabled: true, bindingName, migrated: true };
  } catch (err) {
    // Keep the binding visible: "no database" and "database rejected the
    // schema pass" are different failures and the panel must say which.
    memoryStore.schemaError = String(err?.message || err);
    ensureMemorySeeded(env);
    return {
      d1Enabled: true,
      bindingName,
      migrated: false,
      error: memoryStore.schemaError
    };
  }
}

function ensureMemorySeeded(env = {}) {
  if (memoryStore.initialized) return;
  memoryStore.initialized = true;
  const envSnap = getEnvConfigSnapshot(env);
  memoryStore.globalConfig = { ...envSnap };
  // Memory fallback mode starts empty on purpose: the five user slots are the
  // administrator's to fill, and nothing is invented on first boot.
}

function mapUserRow(row) {
  if (!row) return null;
  let parsedConfig = {};
  try {
    parsedConfig = typeof row.config_json === 'string' ? JSON.parse(row.config_json) : (row.config_json || row.config || {});
  } catch (_e) {
    parsedConfig = {};
  }
  const subNodeCount = Number.isFinite(Number(row.sub_node_count ?? row.subNodeCount))
    ? Number(row.sub_node_count ?? row.subNodeCount)
    : Number(parsedConfig.subNodeCount ?? 50);
  const effectiveConfig = normalizeEffectiveConfig({
    ...CONFIG_DEFAULTS,
    ...parsedConfig,
    subNodeCount
  });
  return {
    id: String(row.id),
    username: String(row.username || row.id),
    uuid: String(row.uuid || '').toLowerCase(),
    subNodeCount,
    status: String(row.status || 'active'),
    enabled: Boolean(row.enabled === undefined ? true : Number(row.enabled) !== 0),
    dataLimitGb: Number(row.data_limit_gb ?? row.dataLimitGb ?? 0),
    usedBytes: Number(row.used_bytes ?? row.usedBytes ?? 0),
    lifetimeBytes: Number(row.lifetime_bytes ?? row.lifetimeBytes ?? 0),
    requestCount: Number(row.request_count ?? row.requestCount ?? 0),
    expireDays: Number(row.expire_days ?? row.expireDays ?? 0),
    expireAt: Number(row.expire_at ?? row.expireAt ?? 0),
    startOnFirstUse: Boolean(row.start_on_first_use === undefined ? (row.startOnFirstUse ?? true) : Number(row.start_on_first_use) !== 0),
    firstConnectedAt: Number(row.first_connected_at ?? row.firstConnectedAt ?? 0),
    ipLimit: Number(row.ip_limit ?? row.ipLimit ?? 50),
    nodeScope: String(row.node_scope || row.nodeScope || 'all'),
    preset: String(row.preset || 'iran-fast'),
    note: String(row.note || ''),
    config: effectiveConfig,
    createdAt: Number(row.created_at ?? row.createdAt ?? Date.now()),
    updatedAt: Number(row.updated_at ?? row.updatedAt ?? Date.now())
  };
}

// ============================================================================
// مدیریت سیستم رمز عبور مدیر (بررسی، راه‌اندازی اول، تغییر پسورد)
// ============================================================================
export async function getAdminPasswordHash(env = {}) {
  await ensureD1Schema(env);
  if (memoryStore.adminPasswordHash) return memoryStore.adminPasswordHash;

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const row = await detectedD1.db.prepare(`SELECT value FROM system_config WHERE key = 'admin_password_hash'`).first();
      if (row && row.value) {
        memoryStore.adminPasswordHash = String(row.value).trim();
        return memoryStore.adminPasswordHash;
      }
    } catch (_e) {}
  }

  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try {
      const kvVal = await detectedKv.kv.get('admin_password_hash');
      if (kvVal) {
        memoryStore.adminPasswordHash = String(kvVal).trim();
        return memoryStore.adminPasswordHash;
      }
    } catch (_e) {}
  }

  return memoryStore.adminPasswordHash || '';
}

export async function hasAdminPassword(env = {}) {
  const hash = await getAdminPasswordHash(env);
  return Boolean(hash && hash.length > 0);
}

/**
 * Report how the stored administrator password can be verified. `derivable` is
 * false when the record was written with an iteration count this runtime cannot
 * derive (for example a 210 000-iteration hash from an older build), which is
 * the only state where a correct password can never sign in.
 */
export async function getAdminPasswordDiagnostics(env = {}) {
  const hash = await getAdminPasswordHash(env);
  const info = describePasswordRecord(hash);
  return {
    ...info,
    // The environment override always provides a way back in.
    envOverride: hasEnvAdminPassword(env)
  };
}

function envAdminPassword(env = {}) {
  const raw = env?.MILI_ADMIN_PASSWORD ?? env?.MILICONFIG_ADMIN_PASSWORD ?? env?.ADMIN_PASSWORD;
  if (raw === undefined || raw === null) return '';
  if (typeof raw === 'object') return '';
  return String(raw);
}

export function hasEnvAdminPassword(env = {}) {
  return envAdminPassword(env).trim().length > 0;
}

/**
 * Constant-time check of the environment password. Used to keep the documented
 * recovery path open even after an IP has tripped the login rate limiter, which
 * is easy to do while locked out.
 */
export function matchesEnvAdminPassword(env = {}, candidate = '') {
  const expected = envAdminPassword(env).trim();
  if (!expected) return false;
  return timingSafeEqual(String(candidate || ''), expected);
}

// Marker proving the environment password was already applied, so the (fairly
// expensive) hash is only recomputed when the secret actually changes.
const ENV_PASSWORD_MARKER = 'admin_password_env_digest';

async function readSystemValue(env, key) {
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const row = await detectedD1.db.prepare('SELECT value FROM system_config WHERE key = ?').bind(key).first();
      if (row && row.value !== undefined) return String(row.value);
    } catch (_e) {}
  }
  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try {
      const value = await detectedKv.kv.get(key);
      if (value !== null && value !== undefined) return String(value);
    } catch (_e) {}
  }
  return '';
}

async function writeSystemValue(env, key, value) {
  const now = Date.now();
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
        ),
        key,
        value,
        now
      ).run();
    } catch (_e) {}
  }
  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try { await detectedKv.kv.put(key, value); } catch (_e) {}
  }
}

/**
 * Keep the administrator password in sync with the MILI_ADMIN_PASSWORD secret.
 *
 * This is the documented way back in when the stored hash cannot be derived on
 * this runtime (see getAdminPasswordDiagnostics) and it also lets an operator
 * rotate the password by editing the Worker secret. Passwords changed from the
 * panel stay in force until the secret itself changes.
 */
export async function syncEnvAdminPassword(env = {}) {
  const password = envAdminPassword(env).trim();
  if (!password) return { applied: false, reason: 'no-env-password' };
  const policy = passwordPolicy(password);
  if (!policy.ok) {
    return { applied: false, reason: 'weak-env-password', message: policy.message };
  }

  const digest = await sha256Hex(`env-admin:${password}`);
  if (memoryStore.envPasswordDigest === digest) return { applied: false, reason: 'cached' };

  try {
    await ensureD1Schema(env);
    const stored = await readSystemValue(env, ENV_PASSWORD_MARKER);
    if (stored && stored === digest) {
      memoryStore.envPasswordDigest = digest;
      return { applied: false, reason: 'already-applied' };
    }

    const hash = await hashPassword(password);
    memoryStore.adminPasswordHash = hash;
    await writeSystemValue(env, 'admin_password_hash', hash);
    await writeSystemValue(env, ENV_PASSWORD_MARKER, digest);
    memoryStore.envPasswordDigest = digest;
    try { await revokeAllAdminSessions(env); } catch (_e) {}
    await addAuditLog(env, 'همگام‌سازی رمز مدیر از متغیر محیطی', 'Admin password synced from MILI_ADMIN_PASSWORD', '');
    return { applied: true };
  } catch (err) {
    return { applied: false, reason: 'error', message: String(err?.message || err) };
  }
}

export async function setAdminPassword(env = {}, plainPassword, clientIp = '') {
  const cleanPass = String(plainPassword || '').trim();
  const policy = passwordPolicy(cleanPass);
  if (!policy.ok) {
    throw new Error(policy.message);
  }
  // اطمینان از آماده بودن اسکیما پیش از نوشتن؛ رفع باگ «فراموش شدن رمز»
  await ensureD1Schema(env);
  const hash = await hashPassword(cleanPass);
  memoryStore.adminPasswordHash = hash;

  const now = Date.now();
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `INSERT INTO system_config (key, value, updated_at) VALUES ('admin_password_hash', ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
        ),
        hash,
        now
      ).run();
    } catch (_e) {}
  }

  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try {
      await detectedKv.kv.put('admin_password_hash', hash);
    } catch (_e) {}
  }

  // با تغییر رمز، همه نشست‌های قبلی باطل می‌شوند
  try {
    await revokeAllAdminSessions(env);
  } catch (_e) {}

  await addAuditLog(env, 'تعیین رمز عبور مدیر', 'Admin password updated', clientIp);
  return true;
}

// راه‌اندازی اولیه: فقط یک بار و به‌صورت اتمیک (جلوگیری از تکرار Setup)
export async function initializeAdminPassword(env = {}, plainPassword, clientIp = '') {
  const cleanPass = String(plainPassword || '').trim();
  const policy = passwordPolicy(cleanPass);
  if (!policy.ok) throw new Error(policy.message);

  await ensureD1Schema(env);
  if (await getAdminPasswordHash(env)) {
    throw new Error('SETUP_COMPLETE: Initial administrator setup is already complete.');
  }

  const hash = await hashPassword(cleanPass);
  const now = Date.now();
  const detectedD1 = detectD1Binding(env);
  let claimed = false;

  if (detectedD1 && memoryStore.d1SchemaReady) {
    const res = await safeBind(
      detectedD1.db.prepare(
        `INSERT INTO system_config (key, value, updated_at)
         SELECT 'admin_password_hash', ?, ?
         WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE key = 'admin_password_hash')`
      ),
      hash,
      now
    ).run();
    claimed = Number(res?.meta?.changes ?? res?.changes ?? 0) > 0;
    if (!claimed) throw new Error('SETUP_COMPLETE: Initial administrator setup is already complete.');
  } else {
    if (memoryStore.adminPasswordHash) {
      throw new Error('SETUP_COMPLETE: Initial administrator setup is already complete.');
    }
    claimed = true;
  }

  memoryStore.adminPasswordHash = hash;
  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try { await detectedKv.kv.put('admin_password_hash', hash); } catch (_e) {}
  }

  try {
    await revokeAllAdminSessions(env);
  } catch (_e) {}

  await addAuditLog(env, 'راه‌اندازی اولیه مدیر', 'Initial administrator account created', clientIp);
  return true;
}

export async function verifyAdminPassword(env = {}, candidatePassword) {
  const cleanPass = String(candidatePassword || '').trim();
  if (!cleanPass) return false;
  const hash = await getAdminPasswordHash(env);
  if (!hash) return false;
  const result = await verifyPassword(cleanPass, hash);
  // A record this runtime cannot derive is not a wrong password: the caller
  // reports the reset path from getAdminPasswordDiagnostics instead.
  if (!result.ok) return false;

  // ارتقای خودکار هش قدیمی SHA-256 به PBKDF2 پس از ورود موفق
  if (result.needsRehash) {
    try {
      const upgraded = await hashPassword(cleanPass);
      const upgradedInfo = describePasswordRecord(upgraded);
      // Only replace the record when the new work factor is genuinely stronger;
      // a runtime with a lower PBKDF2 ceiling would otherwise rehash on every login.
      if (upgradedInfo.iterations > (describePasswordRecord(hash).iterations || 0)) {
        memoryStore.adminPasswordHash = upgraded;
        const detectedD1 = detectD1Binding(env);
        if (detectedD1 && memoryStore.d1SchemaReady) {
          await detectedD1.db.prepare(
            `INSERT INTO system_config (key, value, updated_at) VALUES ('admin_password_hash', ?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
          ).bind(upgraded, Date.now()).run();
        }
        const detectedKv = detectKvBinding(env);
        if (detectedKv) await detectedKv.kv.put('admin_password_hash', upgraded);
        await addAuditLog(env, 'ارتقای الگوریتم رمز عبور', 'Password hash upgraded to PBKDF2', '');
      }
    } catch (_e) {}
  }
  return true;
}

export async function changeAdminPassword(env = {}, currentPassword, newPassword, clientIp = '') {
  const isMatch = await verifyAdminPassword(env, currentPassword);
  if (!isMatch) {
    throw new Error('رمز عبور فعلی نادرست است.');
  }
  return await setAdminPassword(env, newPassword, clientIp);
}

// تنظیمات سراسری پنل
export async function loadGlobalConfig(env = {}, force = false) {
  await ensureD1Schema(env);
  const envSnap = getEnvConfigSnapshot(env);
  const detectedD1 = detectD1Binding(env);
  const detectedKv = detectKvBinding(env);

  if (!force && memoryStore.lastSyncAt > 0 && Date.now() - memoryStore.lastSyncAt < 15000) {
    return normalizeEffectiveConfig({
      ...CONFIG_DEFAULTS,
      ...envSnap,
      ...memoryStore.globalConfig
    });
  }

  let stored = {};
  if (detectedKv) {
    try {
      const kvRaw = await detectedKv.kv.get('c');
      if (kvRaw) stored = { ...stored, ...JSON.parse(kvRaw) };
    } catch (_e) {}
  }

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const res = await detectedD1.db.prepare(`SELECT key, value FROM system_config`).all();
      const rows = res?.results || [];
      for (const r of rows) {
        if (r && r.key) {
          stored[r.key] = r.value;
        }
      }
    } catch (_e) {}
  }

  memoryStore.globalConfig = { ...memoryStore.globalConfig, ...stored };
  memoryStore.lastSyncAt = Date.now();
  return normalizeEffectiveConfig({
    ...CONFIG_DEFAULTS,
    ...envSnap,
    ...memoryStore.globalConfig
  });
}

export async function saveGlobalConfig(env = {}, newValues = {}) {
  await ensureD1Schema(env);
  const detectedD1 = detectD1Binding(env);
  const detectedKv = detectKvBinding(env);
  const now = Date.now();

  for (const [k, v] of Object.entries(newValues || {})) {
    if (v === '' || v === null || v === undefined) {
      delete memoryStore.globalConfig[k];
    } else {
      memoryStore.globalConfig[k] = String(v);
    }
  }

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      for (const [k, v] of Object.entries(newValues || {})) {
        if (v === '' || v === null || v === undefined) {
          await safeBind(detectedD1.db.prepare(`DELETE FROM system_config WHERE key = ?`), k).run();
        } else {
          await safeBind(
            detectedD1.db.prepare(
              `INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?)
               ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
            ),
            k,
            String(v),
            now
          ).run();
        }
      }
    } catch (_e) {}
  }

  if (detectedKv) {
    try {
      await detectedKv.kv.put('c', JSON.stringify(memoryStore.globalConfig));
      await detectedKv.kv.put('c_ver', String(now));
    } catch (_e) {}
  }

  memoryStore.lastSyncAt = now;
  return await loadGlobalConfig(env, true);
}

export async function resetGlobalConfig(env = {}) {
  await ensureD1Schema(env);
  const detectedD1 = detectD1Binding(env);
  const detectedKv = detectKvBinding(env);
  memoryStore.globalConfig = {};

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      // اعتبارنامه مدیر و رازهای ارائه‌دهنده با بازنشانی تنظیمات پاک نمی‌شوند
      await detectedD1.db.prepare(
        `DELETE FROM system_config WHERE key != 'admin_password_hash' AND key NOT LIKE 'cf!_%' ESCAPE '!'`
      ).run();
    } catch (_e) {}
  }
  if (detectedKv) {
    try {
      await detectedKv.kv.put('c', JSON.stringify({}));
      await detectedKv.kv.put('c_ver', String(Date.now()));
    } catch (_e) {}
  }
  memoryStore.lastSyncAt = Date.now();
  return await loadGlobalConfig(env, true);
}

// لیست کاربران
export async function listUsers(env = {}) {
  await ensureD1Schema(env);
  const detectedD1 = detectD1Binding(env);

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const res = await detectedD1.db.prepare(`SELECT * FROM users ORDER BY created_at DESC`).all();
      const users = (res?.results || []).map(mapUserRow).filter(Boolean);
      memoryStore.users.clear();
      for (const u of users) memoryStore.users.set(u.id, u);
      return users;
    } catch (_e) {}
  }

  ensureMemorySeeded(env);
  return Array.from(memoryStore.users.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getUserByIdOrToken(env = {}, token = '') {
  if (!token) return null;
  const clean = String(token).trim();
  const cleanLower = clean.toLowerCase().replace(/^\/+|\/+$/g, '');
  const users = await listUsers(env);
  for (const u of users) {
    if (
      u.id.toLowerCase() === cleanLower ||
      u.uuid.toLowerCase() === cleanLower ||
      u.username.toLowerCase() === cleanLower ||
      (u.config?.d && u.config.d.trim().replace(/^\/+|\/+$/g, '').toLowerCase() === cleanLower)
    ) {
      return u;
    }
  }
  return null;
}

// ایجاد کاربر جدید با قفل سخت‌گیرانه حداکثر ۵ کاربر
export async function createUser(env = {}, payload = {}, clientIp = '') {
  await ensureD1Schema(env);

  // محدودیت قطعی حداکثر MAX_USERS_LIMIT کاربر (پیش‌بررسی برای پاسخ سریع؛
  // درج نهایی با INSERT ... SELECT ... WHERE COUNT(*) < LIMIT به‌صورت اتمیک انجام می‌شود)
  const currentUsers = await listUsers(env);
  if (currentUsers.length >= MAX_USERS_LIMIT) {
    throw new Error(`LIMIT_REACHED: سقف مجاز ایجاد کاربر (حداکثر ${MAX_USERS_LIMIT} کاربر) پر شده است. برای افزودن کاربر جدید، لطفاً یکی از کاربران قبلی را حذف کنید.`);
  }

  const globalCfg = await loadGlobalConfig(env);
  const now = Date.now();

  const presetId = payload.preset || 'iran-fast';
  const rawName = String(payload.username || payload.name || '').trim();
  const id = payload.id && String(payload.id).trim() ? String(payload.id).trim() : generateShortId('mili');
  const username = rawName || id;
  const uuid = isValidUuid(payload.uuid) ? String(payload.uuid).trim().toLowerCase() : generateUuidV4();

  const subNodeCountRaw = parseInt(payload.subNodeCount ?? payload.config?.subNodeCount ?? globalCfg.subNodeCount ?? 50, 10);
  const subNodeCount = Number.isFinite(subNodeCountRaw) && subNodeCountRaw >= 0 ? subNodeCountRaw : 50;

  const mergedUserConfig = buildUserDefaultConfig(
    payload.usePanelDefaults !== false ? globalCfg : CONFIG_DEFAULTS,
    presetId,
    {
      ...(payload.config || {}),
      wk: payload.wk ?? payload.config?.wk ?? globalCfg.wk ?? CONFIG_DEFAULTS.wk,
      ev: payload.ev ?? payload.config?.ev ?? globalCfg.ev ?? CONFIG_DEFAULTS.ev,
      et: payload.et ?? payload.config?.et ?? globalCfg.et ?? CONFIG_DEFAULTS.et,
      ex: payload.ex ?? payload.config?.ex ?? globalCfg.ex ?? CONFIG_DEFAULTS.ex,
      es: payload.es ?? payload.config?.es ?? globalCfg.es ?? CONFIG_DEFAULTS.es,
      sspass: payload.sspass ?? payload.config?.sspass ?? globalCfg.sspass ?? '',
      ssmethod: payload.ssmethod ?? payload.config?.ssmethod ?? globalCfg.ssmethod ?? 'auto',
      ech: payload.ech ?? payload.config?.ech ?? globalCfg.ech ?? CONFIG_DEFAULTS.ech,
      tp: payload.tp ?? payload.config?.tp ?? globalCfg.tp ?? CONFIG_DEFAULTS.tp,
      customDNS: payload.customDNS ?? payload.config?.customDNS ?? globalCfg.customDNS ?? CONFIG_DEFAULTS.customDNS,
      customECHDomain: payload.customECHDomain ?? payload.config?.customECHDomain ?? globalCfg.customECHDomain ?? CONFIG_DEFAULTS.customECHDomain,
      alpn: payload.alpn ?? payload.config?.alpn ?? globalCfg.alpn ?? CONFIG_DEFAULTS.alpn,
      d: payload.d ?? payload.config?.d ?? '',
      p: payload.p ?? payload.config?.p ?? globalCfg.p ?? CONFIG_DEFAULTS.p,
      yx: payload.yx ?? payload.config?.yx ?? globalCfg.yx ?? CONFIG_DEFAULTS.yx,
      yxURL: payload.yxURL ?? payload.config?.yxURL ?? globalCfg.yxURL ?? CONFIG_DEFAULTS.yxURL,
      s: payload.s ?? payload.config?.s ?? globalCfg.s ?? CONFIG_DEFAULTS.s,
      homepage: payload.homepage ?? payload.config?.homepage ?? globalCfg.homepage ?? CONFIG_DEFAULTS.homepage,
      scu: payload.scu ?? payload.config?.scu ?? globalCfg.scu ?? CONFIG_DEFAULTS.scu,
      ena: payload.ena ?? payload.config?.ena ?? globalCfg.ena ?? CONFIG_DEFAULTS.ena,
      epd: payload.epd ?? payload.config?.epd ?? globalCfg.epd ?? CONFIG_DEFAULTS.epd,
      epi: payload.epi ?? payload.config?.epi ?? globalCfg.epi ?? CONFIG_DEFAULTS.epi,
      egi: payload.egi ?? payload.config?.egi ?? globalCfg.egi ?? CONFIG_DEFAULTS.egi,
      ae: payload.ae ?? payload.config?.ae ?? globalCfg.ae ?? CONFIG_DEFAULTS.ae,
      rm: payload.rm ?? payload.config?.rm ?? globalCfg.rm ?? CONFIG_DEFAULTS.rm,
      qj: payload.qj ?? payload.config?.qj ?? globalCfg.qj ?? CONFIG_DEFAULTS.qj,
      dkby: payload.dkby ?? payload.config?.dkby ?? globalCfg.dkby ?? CONFIG_DEFAULTS.dkby,
      yxby: payload.yxby ?? payload.config?.yxby ?? globalCfg.yxby ?? CONFIG_DEFAULTS.yxby,
      ipv4: payload.ipv4 ?? payload.config?.ipv4 ?? globalCfg.ipv4 ?? CONFIG_DEFAULTS.ipv4,
      ipv6: payload.ipv6 ?? payload.config?.ipv6 ?? globalCfg.ipv6 ?? CONFIG_DEFAULTS.ipv6,
      ispMobile: payload.ispMobile ?? payload.config?.ispMobile ?? globalCfg.ispMobile ?? CONFIG_DEFAULTS.ispMobile,
      ispUnicom: payload.ispUnicom ?? payload.config?.ispUnicom ?? globalCfg.ispUnicom ?? CONFIG_DEFAULTS.ispUnicom,
      ispTelecom: payload.ispTelecom ?? payload.config?.ispTelecom ?? globalCfg.ispTelecom ?? CONFIG_DEFAULTS.ispTelecom,
      jk: payload.jk ?? payload.config?.jk ?? globalCfg.jk ?? CONFIG_DEFAULTS.jk,
      fp: payload.fp ?? payload.config?.fp ?? globalCfg.fp ?? 'chrome',
      patt: payload.patt ?? payload.config?.patt ?? globalCfg.patt ?? '/?ed=2048',
      fragmentPreset: payload.fragmentPreset ?? payload.config?.fragmentPreset ?? globalCfg.fragmentPreset ?? 'mci',
      fragmentLength: payload.fragmentLength ?? payload.config?.fragmentLength ?? globalCfg.fragmentLength ?? '100-200',
      fragmentInterval: payload.fragmentInterval ?? payload.config?.fragmentInterval ?? globalCfg.fragmentInterval ?? '10-20',
      fragmentPackets: payload.fragmentPackets ?? payload.config?.fragmentPackets ?? globalCfg.fragmentPackets ?? 'tlshello',
      ipRotation: payload.ipRotation ?? payload.config?.ipRotation ?? globalCfg.ipRotation ?? 15,
      subNodeCount
    }
  );

  const dataLimitGb = Math.max(0, Number(payload.dataLimitGb ?? 0) || 0);
  const expireDays = Math.max(0, parseInt(payload.expireDays ?? 0, 10) || 0);
  const startOnFirstUse = payload.startOnFirstUse !== undefined ? Boolean(payload.startOnFirstUse) : true;
  const expireAt = !startOnFirstUse && expireDays > 0 ? now + expireDays * 86400 * 1000 : 0;
  const ipLimit = Math.max(1, parseInt(payload.ipLimit ?? 50, 10) || 50);
  const nodeScope = String(payload.nodeScope || 'all');
  const enabled = payload.enabled !== undefined ? Boolean(payload.enabled) : true;
  const note = String(payload.note || '');

  const userObj = {
    id,
    username,
    uuid,
    subNodeCount,
    status: enabled ? 'active' : 'disabled',
    enabled,
    dataLimitGb,
    usedBytes: 0,
    lifetimeBytes: 0,
    requestCount: 0,
    expireDays,
    expireAt,
    startOnFirstUse,
    firstConnectedAt: 0,
    ipLimit,
    nodeScope,
    preset: presetId,
    note,
    config: mergedUserConfig,
    createdAt: now,
    updatedAt: now
  };

  memoryStore.users.set(id, userObj);

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    let res;
    try {
      res = await safeBind(
        detectedD1.db.prepare(
          `INSERT INTO users (
            id, username, uuid, sub_node_count, status, enabled,
            data_limit_gb, used_bytes, lifetime_bytes, request_count,
            expire_days, expire_at, start_on_first_use, first_connected_at,
            ip_limit, node_scope, preset, note, config_json, created_at, updated_at
          ) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE (SELECT COUNT(*) FROM users) < ?`
        ),
        userObj.id,
        userObj.username,
        userObj.uuid,
        userObj.subNodeCount,
        userObj.status,
        userObj.enabled ? 1 : 0,
        userObj.dataLimitGb,
        0,
        0,
        0,
        userObj.expireDays,
        userObj.expireAt,
        userObj.startOnFirstUse ? 1 : 0,
        0,
        userObj.ipLimit,
        userObj.nodeScope,
        userObj.preset,
        userObj.note,
        JSON.stringify(userObj.config),
        now,
        now,
        MAX_USERS_LIMIT
      ).run();
    } catch (err) {
      memoryStore.users.delete(id);
      throw new Error('ساخت کاربر ناموفق بود (UUID یا شناسه تکراری است).');
    }

    const changes = Number(res?.meta?.changes ?? res?.changes ?? 0);
    if (!changes) {
      memoryStore.users.delete(id);
      const remaining = await listUsers(env);
      if (remaining.length >= MAX_USERS_LIMIT) {
        throw new Error(`LIMIT_REACHED: سقف مجاز ایجاد کاربر (حداکثر ${MAX_USERS_LIMIT} کاربر) پر شده است.`);
      }
      throw new Error('ساخت کاربر ناموفق بود؛ دوباره تلاش کنید.');
    }
  }

  await addAuditLog(env, 'ساخت کاربر جدید', `${userObj.username} (${currentUsers.length + 1}/${MAX_USERS_LIMIT})`, clientIp);
  return userObj;
}

export async function updateUser(env = {}, userId, payload = {}, clientIp = '') {
  const existing = await getUserByIdOrToken(env, userId);
  if (!existing) return null;
  const now = Date.now();

  const subNodeCountRaw = parseInt(
    payload.subNodeCount ?? payload.config?.subNodeCount ?? existing.subNodeCount ?? 50,
    10
  );
  const subNodeCount = Number.isFinite(subNodeCountRaw) && subNodeCountRaw >= 0 ? subNodeCountRaw : existing.subNodeCount;

  const updatedConfig = normalizeEffectiveConfig({
    ...existing.config,
    ...(payload.config || {}),
    ...(payload.wk !== undefined ? { wk: payload.wk } : {}),
    ...(payload.ev !== undefined ? { ev: payload.ev } : {}),
    ...(payload.et !== undefined ? { et: payload.et } : {}),
    ...(payload.ex !== undefined ? { ex: payload.ex } : {}),
    ...(payload.es !== undefined ? { es: payload.es } : {}),
    ...(payload.sspass !== undefined ? { sspass: payload.sspass } : {}),
    ...(payload.ssmethod !== undefined ? { ssmethod: payload.ssmethod } : {}),
    ...(payload.ech !== undefined ? { ech: payload.ech } : {}),
    ...(payload.tp !== undefined ? { tp: payload.tp } : {}),
    ...(payload.customDNS !== undefined ? { customDNS: payload.customDNS } : {}),
    ...(payload.customECHDomain !== undefined ? { customECHDomain: payload.customECHDomain } : {}),
    ...(payload.alpn !== undefined ? { alpn: payload.alpn } : {}),
    ...(payload.d !== undefined ? { d: payload.d } : {}),
    ...(payload.p !== undefined ? { p: payload.p } : {}),
    ...(payload.yx !== undefined ? { yx: payload.yx } : {}),
    ...(payload.yxURL !== undefined ? { yxURL: payload.yxURL } : {}),
    ...(payload.s !== undefined ? { s: payload.s } : {}),
    ...(payload.homepage !== undefined ? { homepage: payload.homepage } : {}),
    ...(payload.scu !== undefined ? { scu: payload.scu } : {}),
    ...(payload.ena !== undefined ? { ena: payload.ena } : {}),
    ...(payload.epd !== undefined ? { epd: payload.epd } : {}),
    ...(payload.epi !== undefined ? { epi: payload.epi } : {}),
    ...(payload.egi !== undefined ? { egi: payload.egi } : {}),
    ...(payload.ae !== undefined ? { ae: payload.ae } : {}),
    ...(payload.rm !== undefined ? { rm: payload.rm } : {}),
    ...(payload.qj !== undefined ? { qj: payload.qj } : {}),
    ...(payload.dkby !== undefined ? { dkby: payload.dkby } : {}),
    ...(payload.yxby !== undefined ? { yxby: payload.yxby } : {}),
    ...(payload.ipv4 !== undefined ? { ipv4: payload.ipv4 } : {}),
    ...(payload.ipv6 !== undefined ? { ipv6: payload.ipv6 } : {}),
    ...(payload.ispMobile !== undefined ? { ispMobile: payload.ispMobile } : {}),
    ...(payload.ispUnicom !== undefined ? { ispUnicom: payload.ispUnicom } : {}),
    ...(payload.ispTelecom !== undefined ? { ispTelecom: payload.ispTelecom } : {}),
    ...(payload.jk !== undefined ? { jk: payload.jk } : {}),
    ...(payload.fp !== undefined ? { fp: payload.fp } : {}),
    ...(payload.patt !== undefined ? { patt: payload.patt } : {}),
    ...(payload.fragmentPreset !== undefined ? { fragmentPreset: payload.fragmentPreset } : {}),
    ...(payload.fragmentLength !== undefined ? { fragmentLength: payload.fragmentLength } : {}),
    ...(payload.fragmentInterval !== undefined ? { fragmentInterval: payload.fragmentInterval } : {}),
    ...(payload.fragmentPackets !== undefined ? { fragmentPackets: payload.fragmentPackets } : {}),
    ...(payload.ipRotation !== undefined ? { ipRotation: payload.ipRotation } : {}),
    subNodeCount
  });

  const enabled = payload.enabled !== undefined ? Boolean(payload.enabled) : existing.enabled;
  const expireDays = payload.expireDays !== undefined ? Math.max(0, parseInt(payload.expireDays, 10) || 0) : existing.expireDays;
  const startOnFirstUse = payload.startOnFirstUse !== undefined ? Boolean(payload.startOnFirstUse) : existing.startOnFirstUse;
  let expireAt = existing.expireAt;
  if (payload.expireDays !== undefined) {
    expireAt = !startOnFirstUse && expireDays > 0 ? now + expireDays * 86400 * 1000 : 0;
  }

  const updated = {
    ...existing,
    username: payload.username !== undefined && String(payload.username).trim() ? String(payload.username).trim() : existing.username,
    uuid: payload.uuid && isValidUuid(payload.uuid) ? String(payload.uuid).trim().toLowerCase() : existing.uuid,
    subNodeCount,
    enabled,
    status: enabled ? 'active' : 'disabled',
    dataLimitGb: payload.dataLimitGb !== undefined ? Math.max(0, Number(payload.dataLimitGb) || 0) : existing.dataLimitGb,
    expireDays,
    expireAt,
    startOnFirstUse,
    ipLimit: payload.ipLimit !== undefined ? Math.max(1, parseInt(payload.ipLimit, 10) || 50) : existing.ipLimit,
    nodeScope: payload.nodeScope !== undefined ? String(payload.nodeScope) : existing.nodeScope,
    preset: payload.preset !== undefined ? String(payload.preset) : existing.preset,
    note: payload.note !== undefined ? String(payload.note) : existing.note,
    config: updatedConfig,
    updatedAt: now
  };

  memoryStore.users.set(existing.id, updated);

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `UPDATE users SET
            username = ?, uuid = ?, sub_node_count = ?, status = ?, enabled = ?,
            data_limit_gb = ?, expire_days = ?, expire_at = ?, start_on_first_use = ?,
            ip_limit = ?, node_scope = ?, preset = ?, note = ?, config_json = ?, updated_at = ?
           WHERE id = ?`
        ),
        updated.username,
        updated.uuid,
        updated.subNodeCount,
        updated.status,
        updated.enabled ? 1 : 0,
        updated.dataLimitGb,
        updated.expireDays,
        updated.expireAt,
        updated.startOnFirstUse ? 1 : 0,
        updated.ipLimit,
        updated.nodeScope,
        updated.preset,
        updated.note,
        JSON.stringify(updated.config),
        now,
        existing.id
      ).run();
    } catch (_e) {}
  }

  await addAuditLog(env, 'ویرایش کاربر', `${updated.username}`, clientIp);
  return updated;
}

export async function resetUserStats(env = {}, userId, clientIp = '') {
  const existing = await getUserByIdOrToken(env, userId);
  if (!existing) return null;
  const now = Date.now();
  const updated = {
    ...existing,
    usedBytes: 0,
    requestCount: 0,
    firstConnectedAt: 0,
    expireAt: !existing.startOnFirstUse && existing.expireDays > 0 ? now + existing.expireDays * 86400 * 1000 : 0,
    updatedAt: now
  };
  memoryStore.users.set(existing.id, updated);

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `UPDATE users SET used_bytes = 0, request_count = 0, first_connected_at = 0, expire_at = ?, updated_at = ? WHERE id = ?`
        ),
        updated.expireAt,
        now,
        existing.id
      ).run();
    } catch (_e) {}
  }
  await addAuditLog(env, 'صفر کردن مصرف کاربر', `${existing.username}`, clientIp);
  return updated;
}

export async function deleteUser(env = {}, userId, clientIp = '') {
  const existing = await getUserByIdOrToken(env, userId);
  if (!existing) return false;
  memoryStore.users.delete(existing.id);

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(detectedD1.db.prepare(`DELETE FROM users WHERE id = ?`), existing.id).run();
    } catch (_e) {}
  }
  await addAuditLog(env, 'حذف کاربر', `${existing.username}`, clientIp);
  return true;
}

export async function recordUserActivity(env = {}, userId, bytesDelta = 0, reqDelta = 1) {
  if (!userId) return;
  const now = Date.now();
  const hourKey = new Date(now).toISOString().slice(0, 13);
  const prevHour = memoryStore.trafficHourly.get(hourKey) || { bytes: 0, requests: 0 };
  prevHour.bytes += Math.max(0, Number(bytesDelta) || 0);
  prevHour.requests += Math.max(0, Number(reqDelta) || 0);
  memoryStore.trafficHourly.set(hourKey, prevHour);

  const u = memoryStore.users.get(userId);
  if (u) {
    u.usedBytes = (u.usedBytes || 0) + Math.max(0, Number(bytesDelta) || 0);
    u.lifetimeBytes = (u.lifetimeBytes || 0) + Math.max(0, Number(bytesDelta) || 0);
    u.requestCount = (u.requestCount || 0) + Math.max(0, Number(reqDelta) || 0);
    if (!u.firstConnectedAt) {
      u.firstConnectedAt = now;
      if (u.startOnFirstUse && u.expireDays > 0 && !u.expireAt) {
        u.expireAt = now + u.expireDays * 86400 * 1000;
      }
    }
    u.updatedAt = now;
  }

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `UPDATE users SET
            used_bytes = used_bytes + ?,
            lifetime_bytes = lifetime_bytes + ?,
            request_count = request_count + ?,
            first_connected_at = CASE WHEN first_connected_at = 0 THEN ? ELSE first_connected_at END,
            expire_at = CASE WHEN start_on_first_use = 1 AND expire_days > 0 AND expire_at = 0 THEN ? + (expire_days * 86400000) ELSE expire_at END,
            updated_at = ?
           WHERE id = ?`
        ),
        Math.max(0, Number(bytesDelta) || 0),
        Math.max(0, Number(bytesDelta) || 0),
        Math.max(0, Number(reqDelta) || 0),
        now,
        now,
        now,
        userId
      ).run();

      // آمار ساعتی سراسری و مصرف روزانه هر کاربر (منبع: شمارنده واقعی استریم ورکر)
      await safeBind(
        detectedD1.db.prepare(
          `INSERT INTO traffic_hourly (hour_key, bytes, requests) VALUES (?, ?, ?)
           ON CONFLICT(hour_key) DO UPDATE SET bytes = bytes + excluded.bytes, requests = requests + excluded.requests`
        ),
        hourKey,
        Math.max(0, Number(bytesDelta) || 0),
        Math.max(0, Number(reqDelta) || 0)
      ).run();
      try {
        await safeBind(
          detectedD1.db.prepare(
            `INSERT INTO usage_daily (user_id, day_key, bytes, requests, source) VALUES (?, ?, ?, ?, 'worker-stream')
             ON CONFLICT(user_id, day_key, source) DO UPDATE SET bytes = bytes + excluded.bytes, requests = requests + excluded.requests`
          ),
          userId,
          new Date(now).toISOString().slice(0, 10),
          Math.max(0, Number(bytesDelta) || 0),
          Math.max(0, Number(reqDelta) || 0)
        ).run();
      } catch (_e) {}
    } catch (_e) {}
  }
}

export async function addAuditLog(env = {}, action, detail = '', ip = '') {
  const now = Date.now();
  memoryStore.auditLogs.unshift({
    id: memoryStore.auditLogs.length + 1,
    action: String(action || ''),
    detail: String(detail || ''),
    ip: String(ip || ''),
    createdAt: now
  });
  if (memoryStore.auditLogs.length > 50) {
    memoryStore.auditLogs.length = 50;
  }
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(`INSERT INTO audit_logs (action, detail, ip, created_at) VALUES (?, ?, ?, ?)`),
        String(action || ''),
        String(detail || ''),
        String(ip || ''),
        now
      ).run();
    } catch (_e) {}
  }
}

export async function getAuditLogs(env = {}, limit = 15) {
  await ensureD1Schema(env);
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const res = await safeBind(
        detectedD1.db.prepare(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?`),
        limit
      ).all();
      if (res?.results?.length) {
        return res.results.map(r => ({
          id: r.id,
          action: r.action,
          detail: r.detail,
          ip: r.ip,
          createdAt: r.created_at
        }));
      }
    } catch (_e) {}
  }
  return memoryStore.auditLogs.slice(0, limit);
}

export async function getStorageDiagnostics(env = {}) {
  const d1State = await ensureD1Schema(env);
  const kvDetected = detectKvBinding(env);
  const users = await listUsers(env);
  const logs = await getAuditLogs(env, 12);
  const hasPass = await hasAdminPassword(env);

  let totalUsedBytes = 0;
  let totalLifetimeBytes = 0;
  let totalRequests = 0;
  let activeUsers = 0;
  for (const u of users) {
    totalUsedBytes += u.usedBytes || 0;
    totalLifetimeBytes += u.lifetimeBytes || 0;
    totalRequests += u.requestCount || 0;
    if (u.enabled) activeUsers += 1;
  }

  return {
    d1Enabled: d1State.d1Enabled,
    d1BindingName: d1State.bindingName || 'DB',
    d1Migrated: d1State.migrated,
    d1Error: d1State.error || null,
    kvEnabled: Boolean(kvDetected),
    kvBindingName: kvDetected?.bindingName || 'C',
    hasPassword: hasPass,
    maxUsersLimit: MAX_USERS_LIMIT,
    uptimeMs: Date.now() - memoryStore.bootTime,
    bootTime: memoryStore.bootTime,
    totalUsers: users.length,
    activeUsers,
    disabledUsers: Math.max(0, users.length - activeUsers),
    totalUsedBytes,
    totalLifetimeBytes,
    totalRequests,
    recentLogs: logs
  };
}
