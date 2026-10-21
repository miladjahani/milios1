// ============================================================================
// miliconfigOS v4.0 - /api/v1
// Every protected endpoint authenticates server-side. Mutating requests are
// same-origin checked (cookie auth) and audited. Secrets are never returned.
// ============================================================================

import {
  BRAND_NAME,
  CONFIG_DEFAULTS,
  MAX_USERS_LIMIT,
  VERSION
} from '../config/defaults.js';
import {
  DNS_MODES,
  DNS_PROFILES,
  ECH_ENTRIES,
  OUTPUT_FORMATS,
  TLS_FINGERPRINTS,
  TRANSPORTS,
  PROTOCOLS,
  CATALOG_VERSION,
  capabilityMatrix,
  formatById,
  getDnsProfile
} from '../config/catalog.js';
import {
  SETTINGS_SCHEMA,
  SETTINGS_SECTIONS,
  defaultSettings,
  detectConflicts,
  effectiveSettings,
  sanitizeSettingsForClient,
  validateSettings
} from '../config/schema.js';
import {
  SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
  clearSessionCookie,
  isSameOriginRequest,
  normalizeClientIp,
  readCookie,
  securityHeaders,
  sessionCookie
} from '../core/security.js';
import {
  buildPlans,
  configurationRow,
  validateCandidate,
  summarizeRejections,
  protocolEnabled
} from '../core/engine.js';
import { checkEchRecord, checkTarget, scanTargets } from '../core/scanner.js';
import { runAutomationJob } from '../core/automation.js';
import { healthLabel } from '../core/health.js';
import { isValidDomain, isValidIpAddress, isValidUuid, normalizeNodeHost } from '../core/utils.js';
import {
  addAuditLog,
  changeAdminPassword,
  createUser,
  deleteUser,
  ensureD1Schema,
  getOrCreateAdminPath,
  getStorageDiagnostics,
  hasAdminPassword,
  initializeAdminPassword,
  listUsers,
  loadGlobalConfig,
  resetGlobalConfig,
  resetUserStats,
  saveGlobalConfig,
  updateUser,
  verifyAdminPassword
} from '../db/d1.js';
import {
  cloudflareStatus,
  clearCloudflareToken,
  databaseConfigured,
  memoryModeAllowed,
  createEndpoint,
  deleteEndpoint,
  deleteUserArtifacts,
  ensureSubscription,
  ensureV4Schema,
  findSubscriptionByToken,
  getAutomationJob,
  getCloudflareToken,
  getEndpoint,
  getMeta,
  getSubscription,
  isMemoryMode,
  listActiveSessions,
  listAuditLogsPaged,
  listAutomationJobs,
  listAutomationRuns,
  listCloudflareResources,
  listConfigurations,
  listEndpointHealth,
  listEndpoints,
  listSubscriptions,
  recentFailedLogins,
  recordAutomationRun,
  recordEndpointHealth,
  recordLoginAttempt,
  replaceUserConfigurations,
  revokeAdminSession,
  revokeAllAdminSessions,
  rotateSubscription,
  saveCloudflareResource,
  saveCloudflareToken,
  setAutomationJobEnabled,
  setMeta,
  setSubscriptionRevoked,
  updateEndpoint,
  usageForUser,
  usageTotals
} from '../db/v4.js';

const API_VERSION = 'v1';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...securityHeaders()
    }
  });
}

function fail(status, code, message, details) {
  return json({ ok: false, error: { code, message, details: details || undefined } }, status);
}

async function readBody(request, maxBytes = 65536) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length && length > maxBytes) {
    const err = new Error('Request body too large');
    err.status = 413;
    throw err;
  }
  try {
    return await request.json();
  } catch (_e) {
    const err = new Error('Invalid JSON body');
    err.status = 400;
    throw err;
  }
}

function sanitizeUser(user, subscription) {
  if (!user) return null;
  const config = { ...(user.config || {}) };
  delete config.adminPasswordHash;
  delete config.admin_password_hash;
  return {
    id: user.id,
    username: user.username,
    uuid: user.uuid,
    enabled: user.enabled,
    status: user.status,
    subNodeCount: user.subNodeCount,
    dataLimitGb: user.dataLimitGb,
    usedBytes: user.usedBytes,
    lifetimeBytes: user.lifetimeBytes,
    requestCount: user.requestCount,
    expireDays: user.expireDays,
    expireAt: user.expireAt,
    startOnFirstUse: user.startOnFirstUse,
    firstConnectedAt: user.firstConnectedAt,
    ipLimit: user.ipLimit,
    nodeScope: user.nodeScope,
    preset: user.preset,
    note: user.note,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    protocols: {
      vless: String(config.ev) === 'yes',
      trojan: String(config.et) === 'yes',
      xhttp: String(config.ex) === 'yes',
      shadowsocks: String(config.es) === 'yes'
    },
    config,
    subscription: subscription
      ? {
          token: subscription.token,
          revoked: subscription.revoked,
          formats: subscription.formats,
          downloads: subscription.downloads,
          lastAccessAt: subscription.lastAccessAt
        }
      : null
  };
}

function buildSubscriptionUrl(request, token, target = '') {
  const url = new URL(request.url);
  const base = `${url.protocol}//${url.host}/s/${token}`;
  return target ? `${base}?target=${encodeURIComponent(target)}` : base;
}

async function getSessionToken(request) {
  const header = request.headers.get('Authorization') || '';
  if (/^Bearer\s+/i.test(header)) return header.replace(/^Bearer\s+/i, '').trim();
  return readCookie(request, SESSION_COOKIE) || readCookie(request, LEGACY_SESSION_COOKIE);
}

async function authenticate(request, env) {
  const token = await getSessionToken(request);
  if (!token) return { ok: false };
  try {
    const { verifyAdminSessionToken } = await import('../db/v4.js');
    const result = await verifyAdminSessionToken(env, token);
    return { ok: result.valid, token, expiresAt: result.expiresAt };
  } catch (_e) {
    return { ok: false, token };
  }
}

function mutatingAllowed(request) {
  const header = request.headers.get('Authorization') || '';
  if (/^Bearer\s+/i.test(header)) return true;
  return isSameOriginRequest(request);
}

function validateEndpointPayload(body = {}) {
  const host = normalizeNodeHost(body.host);
  const port = parseInt(body.port ?? 443, 10);
  if (!host) return { ok: false, message: 'Host is required.' };
  if (!isValidIpAddress(host) && !isValidDomain(host)) return { ok: false, message: 'Host must be a valid IP address or domain.' };
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { ok: false, message: 'Port must be between 1 and 65535.' };
  const family = host.includes(':') ? 'ipv6' : (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? 'ipv4' : 'domain');
  const protocol = String(body.protocol || 'vless').toLowerCase();
  if (!PROTOCOLS[protocol]) return { ok: false, message: 'Unsupported protocol.' };
  const transport = String(body.transport || 'ws').toLowerCase();
  if (!TRANSPORTS[transport]) return { ok: false, message: 'Unsupported transport.' };
  if (!TRANSPORTS[transport].protocols.includes(protocol === 'xhttp' ? 'xhttp' : protocol)) {
    return { ok: false, message: `Transport ${transport} cannot carry ${protocol}.` };
  }
  const tlsMode = String(body.tlsMode || 'tls').toLowerCase();
  if (!['tls', 'none'].includes(tlsMode)) return { ok: false, message: 'TLS mode must be tls or none.' };
  return {
    ok: true,
    value: {
      name: String(body.name || host).trim().slice(0, 80),
      host,
      port,
      family,
      kind: String(body.kind || 'manual').toLowerCase(),
      country: String(body.country || '').toUpperCase().slice(0, 2),
      region: String(body.region || '').slice(0, 80),
      provider: String(body.provider || '').slice(0, 80),
      protocol,
      transport,
      tlsMode,
      notes: String(body.notes || '').slice(0, 300),
      enabled: body.enabled !== false
    }
  };
}

async function withAudit(env, action, detail, request, fn) {
  const result = await fn();
  await addAuditLog(env, action, detail, normalizeClientIp(request));
  return result;
}

// ---------------------------------------------------------------------------
// Sub-resource handlers
// ---------------------------------------------------------------------------

async function handleAuth(request, env, seg, method) {
  const action = seg[1] || '';

  if (action === 'status' && method === 'GET') {
    const [initialized, cfg] = await Promise.all([hasAdminPassword(env), loadGlobalConfig(env)]);
    return json({
      ok: true,
      initialized,
      brand: BRAND_NAME,
      appName: cfg.appName || 'MiliconfigOS',
      version: VERSION,
      homepage: cfg.homepage || 'https://nginx.com',
      maxUsers: MAX_USERS_LIMIT,
      databaseAvailable: databaseConfigured(env),
      memoryModeAllowed: memoryModeAllowed(env)
    });
  }

  if (action === 'session' && method === 'GET') {
    const session = await authenticate(request, env);
    if (!session.ok) return json({ ok: true, authenticated: false });
    return json({
      ok: true,
      authenticated: true,
      expiresAt: session.expiresAt,
      adminPath: await getOrCreateAdminPath(env)
    });
  }

  if (action === 'setup' && method === 'POST') {
    if (!databaseConfigured(env) && !memoryModeAllowed(env)) {
      return fail(503, 'DATABASE_UNAVAILABLE', 'Cloudflare D1 is not bound. Bind the database before creating the administrator account.');
    }
    if (await hasAdminPassword(env)) {
      return fail(403, 'SETUP_COMPLETE', 'Initial setup is already complete. Sign in instead.');
    }
    const body = await readBody(request);
    const password = String(body.password || '');
    const confirm = String(body.confirmPassword ?? body.confirm ?? '');
    if (!password) return fail(400, 'PASSWORD_REQUIRED', 'Password is required.');
    if (password !== confirm) return fail(400, 'PASSWORD_MISMATCH', 'Passwords do not match.');
    try {
      await initializeAdminPassword(env, password, normalizeClientIp(request));
    } catch (err) {
      const message = String(err?.message || err);
      if (message.startsWith('SETUP_COMPLETE')) return fail(403, 'SETUP_COMPLETE', message);
      return fail(400, 'PASSWORD_POLICY', message);
    }
    const cfg = await loadGlobalConfig(env);
    const { createAdminSession } = await import('../db/v4.js');
    const session = await createAdminSession(env, { ttlHours: cfg.sessionHours || 12, ip: normalizeClientIp(request) });
    const adminPath = await getOrCreateAdminPath(env);
    return new Response(JSON.stringify({
      ok: true,
      adminPath,
      redirect: '/' + adminPath,
      expiresAt: session.expiresAt
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': sessionCookie(request, session.token, (cfg.sessionHours || 12) * 3600),
        ...securityHeaders()
      }
    });
  }

  if (action === 'login' && method === 'POST') {
    if (!databaseConfigured(env) && !memoryModeAllowed(env)) {
      return fail(503, 'DATABASE_UNAVAILABLE', 'Cloudflare D1 is not bound. Bind the database before signing in.');
    }
    const body = await readBody(request);
    const ip = normalizeClientIp(request);
    const cfg = await loadGlobalConfig(env);
    const maxFailures = Math.max(3, Number(cfg.loginRateLimitMax) || 8);
    const failures = await recentFailedLogins(env, ip);
    if (failures >= maxFailures) {
      await addAuditLog(env, 'ورود مسدود شد', `Rate limit for ${ip}`, ip);
      return fail(429, 'RATE_LIMITED', 'Too many failed login attempts. Try again in 15 minutes.');
    }
    if (!(await hasAdminPassword(env))) {
      return fail(409, 'SETUP_REQUIRED', 'No administrator password is configured yet.');
    }
    const password = String(body.password || '');
    const ok = await verifyAdminPassword(env, password);
    await recordLoginAttempt(env, ip, ok);
    if (!ok) {
      return fail(401, 'INVALID_CREDENTIALS', 'Incorrect password.');
    }
    const { createAdminSession } = await import('../db/v4.js');
    const session = await createAdminSession(env, { ttlHours: cfg.sessionHours || 12, ip });
    await addAuditLog(env, 'ورود موفق مدیر', `Session expires ${new Date(session.expiresAt).toISOString()}`, ip);
    return new Response(JSON.stringify({
      ok: true,
      redirect: '/' + (String(cfg.d || '').trim() || await getOrCreateAdminPath(env)),
      expiresAt: session.expiresAt
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': sessionCookie(request, session.token, (cfg.sessionHours || 12) * 3600),
        ...securityHeaders()
      }
    });
  }

  if (action === 'logout' && method === 'POST') {
    const token = await getSessionToken(request);
    if (token) await revokeAdminSession(env, token);
    await addAuditLog(env, 'خروج مدیر', 'Session revoked', normalizeClientIp(request));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': clearSessionCookie(request),
        ...securityHeaders()
      }
    });
  }

  if (action === 'change-password' && method === 'POST') {
    const session = await authenticate(request, env);
    if (!session.ok) return fail(401, 'UNAUTHENTICATED', 'Authentication required.');
    const body = await readBody(request);
    const current = String(body.currentPassword || '');
    const next = String(body.newPassword || '');
    if (next !== String(body.confirmPassword ?? next)) {
      return fail(400, 'PASSWORD_MISMATCH', 'New passwords do not match.');
    }
    try {
      await changeAdminPassword(env, current, next, normalizeClientIp(request));
    } catch (err) {
      return fail(400, 'PASSWORD_CHANGE_FAILED', String(err?.message || err));
    }
    const cfg = await loadGlobalConfig(env);
    const { createAdminSession } = await import('../db/v4.js');
    const fresh = await createAdminSession(env, { ttlHours: cfg.sessionHours || 12, ip: normalizeClientIp(request) });
    return new Response(JSON.stringify({ ok: true, expiresAt: fresh.expiresAt }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': sessionCookie(request, fresh.token, (cfg.sessionHours || 12) * 3600),
        ...securityHeaders()
      }
    });
  }

  if (action === 'revoke-sessions' && method === 'POST') {
    const session = await authenticate(request, env);
    if (!session.ok) return fail(401, 'UNAUTHENTICATED', 'Authentication required.');
    await revokeAllAdminSessions(env);
    await addAuditLog(env, 'ابطال همه نشست‌ها', 'All admin sessions revoked', normalizeClientIp(request));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': clearSessionCookie(request),
        ...securityHeaders()
      }
    });
  }

  return fail(404, 'NOT_FOUND', 'Unknown auth endpoint.');
}

async function handleUsers(request, env, seg, method) {
  const cfg = await loadGlobalConfig(env);

  if (seg.length === 1 && method === 'GET') {
    const users = await listUsers(env);
    const subscriptions = await listSubscriptions(env);
    const byUser = new Map(subscriptions.map(sub => [sub.userId, sub]));
    return json({
      ok: true,
      maxUsers: MAX_USERS_LIMIT,
      count: users.length,
      availableSlots: Math.max(0, MAX_USERS_LIMIT - users.length),
      usageSource: 'worker-stream (measured)',
      users: users.map(user => sanitizeUser(user, byUser.get(user.id)))
    });
  }

  if (seg.length === 1 && method === 'POST') {
    const body = await readBody(request);
    const username = String(body.username || '').trim();
    if (!username) return fail(400, 'USERNAME_REQUIRED', 'Username is required.');
    if (username.length > 64) return fail(400, 'USERNAME_TOO_LONG', 'Username is limited to 64 characters.');
    if (listUsers && (await listUsers(env)).length >= MAX_USERS_LIMIT) {
      return fail(409, 'LIMIT_REACHED', `The ${MAX_USERS_LIMIT}-user limit has been reached. Delete a user first.`);
    }
    const payload = {
      username,
      preset: body.preset,
      subNodeCount: body.subNodeCount,
      dataLimitGb: body.dataLimitGb ?? cfg.defaultQuotaGb ?? 0,
      expireDays: body.expireDays ?? cfg.defaultExpireDays ?? 0,
      startOnFirstUse: body.startOnFirstUse,
      ipLimit: body.ipLimit,
      nodeScope: body.nodeScope,
      note: body.note,
      enabled: body.enabled,
      config: body.config || {}
    };
    try {
      const created = await createUser(env, payload, normalizeClientIp(request));
      const subscription = await ensureSubscription(env, created.id, cfg.subFormats || 'singbox,clash,uri');
      await addAuditLog(env, 'ساخت کاربر', `${created.username} (${(await listUsers(env)).length}/${MAX_USERS_LIMIT})`, normalizeClientIp(request));
      return json({
        ok: true,
        user: sanitizeUser(created, subscription),
        subscriptionUrl: buildSubscriptionUrl(request, subscription.token)
      }, 201);
    } catch (err) {
      const message = String(err?.message || err);
      if (message.startsWith('LIMIT_REACHED')) return fail(409, 'LIMIT_REACHED', message.replace('LIMIT_REACHED:', '').trim());
      return fail(400, 'USER_CREATE_FAILED', message);
    }
  }

  if (seg.length >= 2) {
    const id = decodeURIComponent(seg[1]);
    const action = seg[2] || '';

    if (action === 'reset-usage' && method === 'POST') {
      const reset = await resetUserStats(env, id, normalizeClientIp(request));
      if (!reset) return fail(404, 'USER_NOT_FOUND', 'User not found.');
      return json({ ok: true, user: sanitizeUser(reset, await getSubscription(env, reset.id)) });
    }

    if (action === 'rotate-sub' && method === 'POST') {
      const rotated = await rotateSubscription(env, id, cfg.subFormats);
      if (!rotated) {
        const sub = await ensureSubscription(env, id, cfg.subFormats);
        return json({ ok: true, subscription: sub, subscriptionUrl: buildSubscriptionUrl(request, sub.token) });
      }
      await addAuditLog(env, 'چرخش توکن اشتراک', id, normalizeClientIp(request));
      return json({ ok: true, subscription: rotated, subscriptionUrl: buildSubscriptionUrl(request, rotated.token) });
    }

    if (action === 'revoke-sub' && method === 'POST') {
      const body = await readBody(request);
      const revoked = await setSubscriptionRevoked(env, id, body.revoked !== false);
      if (!revoked) return fail(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found.');
      await addAuditLog(env, 'تغییر دسترسی اشتراک', `${id} · revoked=${revoked.revoked}`, normalizeClientIp(request));
      return json({ ok: true, subscription: revoked });
    }

    if (!action && method === 'PATCH') {
      const body = await readBody(request);
      const updated = await updateUser(env, id, body, normalizeClientIp(request));
      if (!updated) return fail(404, 'USER_NOT_FOUND', 'User not found.');
      return json({ ok: true, user: sanitizeUser(updated, await getSubscription(env, updated.id)) });
    }

    if (!action && method === 'DELETE') {
      const body = await readBody(request);
      const users = await listUsers(env);
      const target = users.find(user => user.id === id || user.username === id);
      if (!target) return fail(404, 'USER_NOT_FOUND', 'User not found.');
      if (String(body.confirm || '') !== target.username) {
        return fail(400, 'CONFIRMATION_REQUIRED', 'Type the exact username to confirm deletion.');
      }
      await deleteUser(env, target.id, normalizeClientIp(request));
      await deleteUserArtifacts(env, target.id);
      await addAuditLog(env, 'حذف کاربر', target.username, normalizeClientIp(request));
      return json({ ok: true, deleted: target.username });
    }

    if (!action && method === 'GET') {
      const users = await listUsers(env);
      const target = users.find(user => user.id === id);
      if (!target) return fail(404, 'USER_NOT_FOUND', 'User not found.');
      return json({
        ok: true,
        user: sanitizeUser(target, await getSubscription(env, target.id)),
        configurations: await listConfigurations(env, { userId: target.id, limit: 50 })
      });
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown users endpoint.');
}

async function handleEndpoints(request, env, seg, method, cfg) {
  if (seg.length === 1 && method === 'GET') {
    const [endpoints, health] = await Promise.all([
      listEndpoints(env),
      Promise.resolve(null)
    ]);
    return json({
      ok: true,
      count: endpoints.length,
      healthLevels: ['syntax', 'dns', 'tcp', 'tls', 'http', 'proxy'],
      labels: {
        reachable: healthLabel('reachable'),
        'tls-ok': healthLabel('tls-ok'),
        unreachable: healthLabel('unreachable')
      },
      endpoints
    });
  }

  if (seg.length === 1 && method === 'POST') {
    const body = await readBody(request);
    const parsed = validateEndpointPayload(body);
    if (!parsed.ok) return fail(400, 'ENDPOINT_INVALID', parsed.message);
    const existing = await listEndpoints(env);
    if (existing.some(item => item.host === parsed.value.host && item.port === parsed.value.port)) {
      return fail(409, 'ENDPOINT_DUPLICATE', 'An endpoint with this host and port already exists.');
    }
    const endpoint = await createEndpoint(env, parsed.value);
    await addAuditLog(env, 'افزودن اندپوینت', `${endpoint.name} · ${endpoint.host}:${endpoint.port}`, normalizeClientIp(request));
    return json({ ok: true, endpoint }, 201);
  }

  if (seg.length >= 2) {
    const id = decodeURIComponent(seg[1]);
    const action = seg[2] || '';

    if (action === 'check' && method === 'POST') {
      const endpoint = await getEndpoint(env, id);
      if (!endpoint) return fail(404, 'ENDPOINT_NOT_FOUND', 'Endpoint not found.');
      const body = await readBody(request).catch(() => ({}));
      const levels = Array.isArray(body.levels) ? body.levels : ['syntax', 'dns', 'tcp', 'tls', 'http'];
      const result = await checkTarget({ host: endpoint.host, port: endpoint.port, levels }, { timeoutMs: 4500 });
      await recordEndpointHealth(env, endpoint.id, result);
      await addAuditLog(env, 'بررسی سلامت اندپوینت', `${endpoint.host}:${endpoint.port} · ${result.status}`, normalizeClientIp(request));
      return json({ ok: true, result, history: await listEndpointHealth(env, endpoint.id, 10) });
    }

    if (action === 'ech-check' && method === 'POST') {
      const endpoint = await getEndpoint(env, id);
      if (!endpoint) return fail(404, 'ENDPOINT_NOT_FOUND', 'Endpoint not found.');
      const body = await readBody(request).catch(() => ({}));
      const hostname = String(body.hostname || endpoint.host);
      const result = await checkEchRecord(hostname);
      await setMeta(env, `ech_check_${hostname}`, { ...result, checkedAt: Date.now() });
      return json({ ok: true, hostname, result });
    }

    if (action === 'history' && method === 'GET') {
      return json({ ok: true, history: await listEndpointHealth(env, id, 50) });
    }

    if (!action && method === 'PATCH') {
      const updated = await updateEndpoint(env, id, await readBody(request));
      if (!updated) return fail(404, 'ENDPOINT_NOT_FOUND', 'Endpoint not found.');
      await addAuditLog(env, 'ویرایش اندپوینت', `${updated.name}`, normalizeClientIp(request));
      return json({ ok: true, endpoint: updated });
    }

    if (!action && method === 'DELETE') {
      const ok = await deleteEndpoint(env, id);
      if (!ok) return fail(404, 'ENDPOINT_NOT_FOUND', 'Endpoint not found.');
      await addAuditLog(env, 'حذف اندپوینت', id, normalizeClientIp(request));
      return json({ ok: true });
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown endpoints route.');
}

async function handleConfigurations(request, env, seg, method, cfg) {
  if (seg[1] === 'generate' && method === 'POST') {
    const body = await readBody(request);
    const users = await listUsers(env);
    const user = users.find(item => item.id === body.userId);
    if (!user) return fail(404, 'USER_NOT_FOUND', 'User not found.');
    const endpoints = (await listEndpoints(env)).filter(item => item.enabled);
    if (!endpoints.length) {
      return fail(409, 'NO_ENDPOINTS', 'No endpoints are available. Add or enable an endpoint first.');
    }
    const requestedFormats = Array.isArray(body.formats) && body.formats.length
      ? body.formats
      : String(cfg.subFormats || 'singbox,clash,uri').split(',');
    const result = buildPlans({
      user,
      endpoints,
      settings: cfg,
      formats: requestedFormats,
      limit: Math.min(60, Math.max(1, Number(body.limit) || 24))
    });
    if (!result.valid.length) {
      return json({
        ok: false,
        error: {
          code: 'NO_VALID_COMBINATION',
          message: 'No valid combination was found. Review the rejection reasons and endpoint permissions.',
          rejected: summarizeRejections(result.rejected),
          details: result.rejected.slice(0, 10)
        }
      }, 409);
    }
    const generatedAt = Date.now();
    const rows = result.valid.map((plan, index) => configurationRow(plan, user.id, generatedAt, index));
    await replaceUserConfigurations(env, user.id, rows);
    await addAuditLog(env, 'تولید کانفیگ', `${user.username} · ${rows.length} valid combinations`, normalizeClientIp(request));
    return json({
      ok: true,
      userId: user.id,
      policy: result.policy,
      formats: result.formats,
      generated: rows.length,
      rejected: summarizeRejections(result.rejected),
      plans: result.valid,
      stored: rows.map(row => ({ id: row.id, protocol: row.protocol, transport: row.transport, score: row.score }))
    });
  }

  if (seg[1] === 'validate' && method === 'POST') {
    const body = await readBody(request);
    const users = await listUsers(env);
    const user = users.find(item => item.id === body.userId);
    if (!user) return fail(404, 'USER_NOT_FOUND', 'User not found.');
    const candidate = body.candidate || {};
    const validation = validateCandidate(candidate, user, cfg);
    return json({ ok: true, validation });
  }

  if (method === 'GET') {
    const url = new URL(request.url);
    return json({
      ok: true,
      configurations: await listConfigurations(env, {
        userId: url.searchParams.get('userId') || undefined,
        limit: Math.min(200, Number(url.searchParams.get('limit')) || 50)
      })
    });
  }

  return fail(404, 'NOT_FOUND', 'Unknown configurations route.');
}

async function handleSubscriptions(request, env, seg, method, cfg) {
  const users = await listUsers(env);
  if (seg.length === 1 && method === 'GET') {
    const subs = await listSubscriptions(env);
    const byUser = new Map(subs.map(sub => [sub.userId, sub]));
    return json({
      ok: true,
      formats: OUTPUT_FORMATS.map(item => ({ id: item.id, label: item.label })),
      subscriptions: users.map(user => {
        const sub = byUser.get(user.id) || null;
        return {
          userId: user.id,
          username: user.username,
          enabled: user.enabled,
          token: sub?.token || null,
          revoked: sub?.revoked ?? null,
          formats: sub?.formats || [],
          downloads: sub?.downloads || 0,
          lastAccessAt: sub?.lastAccessAt || 0,
          urls: sub ? {
            base: buildSubscriptionUrl(request, sub.token),
            singbox: buildSubscriptionUrl(request, sub.token, 'singbox'),
            clash: buildSubscriptionUrl(request, sub.token, 'clash'),
            uri: buildSubscriptionUrl(request, sub.token, 'raw')
          } : null
        };
      })
    });
  }

  if (seg.length >= 3 && method === 'POST') {
    const userId = decodeURIComponent(seg[1]);
    const action = seg[2];
    const user = users.find(item => item.id === userId);
    if (!user) return fail(404, 'USER_NOT_FOUND', 'User not found.');
    await ensureSubscription(env, user.id, cfg.subFormats);
    if (action === 'rotate') {
      const sub = await rotateSubscription(env, user.id, cfg.subFormats);
      await addAuditLog(env, 'چرخش اشتراک', user.username, normalizeClientIp(request));
      return json({ ok: true, subscription: sub, urls: { base: buildSubscriptionUrl(request, sub.token) } });
    }
    if (action === 'revoke' || action === 'revoke-sub') {
      const sub = await setSubscriptionRevoked(env, user.id, true);
      await addAuditLog(env, 'لغو اشتراک', user.username, normalizeClientIp(request));
      return json({ ok: true, subscription: sub });
    }
    if (action === 'enable') {
      const sub = await setSubscriptionRevoked(env, user.id, false);
      return json({ ok: true, subscription: sub });
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown subscriptions route.');
}

async function handleScanner(request, env, seg, method, cfg) {
  if (seg[1] === 'scan' && method === 'POST') {
    const body = await readBody(request);
    const rawTargets = Array.isArray(body.targets) ? body.targets : (body.host ? [body] : []);
    if (!rawTargets.length) return fail(400, 'NO_TARGETS', 'Provide at least one target.');
    const targets = rawTargets.slice(0, 10).map(item => ({
      host: normalizeNodeHost(item.host),
      port: parseInt(item.port, 10) || 443,
      levels: Array.isArray(item.levels) ? item.levels : body.levels,
      endpointId: item.endpointId
    }));
    const result = await scanTargets(targets, {
      concurrency: Math.min(8, Math.max(1, Number(cfg.scannerConcurrency) || 4)),
      timeoutMs: 4500
    });
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const check = result.results[i];
      if (target.endpointId && check) await recordEndpointHealth(env, target.endpointId, check);
    }
    await addAuditLog(env, 'اجرای اسکنر', `${targets.length} target(s)`, normalizeClientIp(request));
    return json({ ok: true, ...result, targets });
  }

  if (seg[1] === 'history' && method === 'GET') {
    const url = new URL(request.url);
    const endpoints = await listEndpoints(env);
    const selected = url.searchParams.get('endpointId') || endpoints[0]?.id;
    if (!selected) return json({ ok: true, history: [] });
    return json({ ok: true, endpointId: selected, history: await listEndpointHealth(env, selected, 50) });
  }

  return fail(404, 'NOT_FOUND', 'Unknown scanner route.');
}

async function handleDns(request, env, seg, method) {
  const cfg = await loadGlobalConfig(env);
  if (method === 'GET') {
    const checks = {};
    for (const profile of DNS_PROFILES) {
      const record = await getMeta(env, `dns_check_${profile.id}`);
      if (record) checks[profile.id] = record;
    }
    const echChecks = {};
    for (const entry of ECH_ENTRIES) {
      const record = await getMeta(env, `ech_check_${entry.host}`);
      if (record) echChecks[entry.host] = record;
    }
    return json({
      ok: true,
      catalogVersion: CATALOG_VERSION,
      configured: {
        customDNS: cfg.customDNS || '',
        dnsMode: cfg.dnsMode || 'remote',
        ech: cfg.ech === 'yes',
        echDomain: cfg.customECHDomain || '',
        fingerprint: cfg.fp || 'chrome'
      },
      profiles: DNS_PROFILES,
      modes: DNS_MODES,
      fingerprints: TLS_FINGERPRINTS,
      echEntries: ECH_ENTRIES,
      checks,
      echChecks
    });
  }

  if (seg[1] === 'ech-test' && method === 'POST') {
    const body = await readBody(request);
    const hostname = String(body.hostname || '').trim();
    if (!hostname) return fail(400, 'HOST_REQUIRED', 'Hostname is required.');
    const result = await checkEchRecord(hostname);
    await setMeta(env, `ech_check_${hostname}`, { ...result, checkedAt: Date.now() });
    return json({ ok: true, hostname, result });
  }

  if (seg[1] === 'test' && method === 'POST') {
    const body = await readBody(request);
    const profile = getDnsProfile(body.profileId);
    if (!profile) return fail(404, 'DNS_PROFILE_NOT_FOUND', 'Unknown DNS profile.');
    if (!profile.doh) {
      return fail(400, 'DNS_NO_DOH', 'This profile has no DoH endpoint (NextDNS requires a personal ID).');
    }
    const started = Date.now();
    try {
      const res = await fetch(`${profile.doh}?name=example.com&type=A`, {
        headers: { Accept: 'application/dns-json', 'User-Agent': 'miliconfigos-dnscheck/4.0' }
      });
      const payload = await res.json().catch(() => ({}));
      const answers = Array.isArray(payload.Answer) ? payload.Answer : [];
      const record = {
        ok: res.ok && answers.length > 0,
        status: res.status,
        latencyMs: Date.now() - started,
        answers: answers.slice(0, 3).map(item => item.data),
        checkedAt: Date.now()
      };
      await setMeta(env, `dns_check_${profile.id}`, record);
      return json({ ok: true, profileId: profile.id, record });
    } catch (err) {
      const record = { ok: false, error: String(err?.message || err).slice(0, 160), checkedAt: Date.now() };
      await setMeta(env, `dns_check_${profile.id}`, record);
      return json({ ok: true, profileId: profile.id, record }, 200);
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown DNS route.');
}

async function handleSettings(request, env, seg, method) {
  const stored = await loadGlobalConfig(env);
  const values = sanitizeSettingsForClient({ ...defaultSettings(), ...CONFIG_DEFAULTS, ...stored });

  if (method === 'GET') {
    const conflicts = detectConflicts({ ...CONFIG_DEFAULTS, ...values });
    return json({
      ok: true,
      sections: SETTINGS_SECTIONS,
      schema: SETTINGS_SCHEMA,
      values,
      conflicts,
      storage: {
        mode: isMemoryMode() ? 'memory' : 'd1',
        memory: isMemoryMode()
      }
    });
  }

  if (seg[1] === 'reset' && method === 'POST') {
    const reset = await resetGlobalConfig(env);
    await addAuditLog(env, 'بازنشانی تنظیمات', 'All settings reset to defaults', normalizeClientIp(request));
    return json({
      ok: true,
      values: sanitizeSettingsForClient(reset),
      conflicts: detectConflicts({ ...CONFIG_DEFAULTS, ...reset })
    });
  }

  if (method === 'PUT' || method === 'PATCH') {
    const body = await readBody(request);
    const validation = validateSettings(body.settings || body, values);
    if (validation.errors.length) {
      return json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Settings were not saved.', details: validation.errors } }, 400);
    }
    const saved = await saveGlobalConfig(env, validation.values);
    await addAuditLog(
      env,
      'ذخیره تنظیمات',
      Object.keys(validation.values).join(', ').slice(0, 300),
      normalizeClientIp(request)
    );
    return json({
      ok: true,
      values: sanitizeSettingsForClient(saved),
      warnings: validation.warnings,
      conflicts: detectConflicts({ ...CONFIG_DEFAULTS, ...saved })
    });
  }

  return fail(404, 'NOT_FOUND', 'Unknown settings route.');
}

async function handleUsage(request, env, seg) {
  const url = new URL(request.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 30));
  const users = await listUsers(env);
  const userId = url.searchParams.get('userId');

  if (userId) {
    const user = users.find(item => item.id === userId);
    if (!user) return fail(404, 'USER_NOT_FOUND', 'User not found.');
    const rows = await usageForUser(env, userId, days);
    const sub = await getSubscription(env, userId);
    return json({
      ok: true,
      userId,
      username: user.username,
      days,
      series: rows,
      totals: {
        usedBytes: user.usedBytes,
        lifetimeBytes: user.lifetimeBytes,
        requestCount: user.requestCount,
        quotaBytes: user.dataLimitGb > 0 ? Math.floor(user.dataLimitGb * 1073741824) : 0
      },
      subscriptionDownloads: sub?.downloads || 0,
      sources: {
        traffic: 'worker-stream (measured at the proxy tunnel)',
        subscriptionDownloads: 'subscription fetch counter (not traffic)'
      }
    });
  }

  const series = await usageTotals(env, days);
  return json({
    ok: true,
    days,
    series,
    perUser: users.map(user => ({
      userId: user.id,
      username: user.username,
      usedBytes: user.usedBytes,
      lifetimeBytes: user.lifetimeBytes,
      quotaBytes: user.dataLimitGb > 0 ? Math.floor(user.dataLimitGb * 1073741824) : 0,
      requestCount: user.requestCount,
      source: 'worker-stream'
    })),
    totals: {
      usedBytes: users.reduce((sum, user) => sum + (user.usedBytes || 0), 0),
      lifetimeBytes: users.reduce((sum, user) => sum + (user.lifetimeBytes || 0), 0),
      requests: users.reduce((sum, user) => sum + (user.requestCount || 0), 0)
    },
    measurement: {
      trafficSource: 'worker-stream',
      accuracy: 'exact bytes observed while piping proxied streams',
      note: 'Bytes are counted only for traffic proxied by this Worker. Direct visits to the panel are not counted.'
    }
  });
}

async function handleAudit(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 50));
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
  return json({
    ok: true,
    logs: await listAuditLogsPaged(env, { limit, offset }),
    loginAttempts: await (await import('../db/v4.js')).recentLoginAttempts(env, 20),
    sessions: await listActiveSessions(env)
  });
}

async function handleAutomation(request, env, seg, method) {
  if (seg.length === 1 && method === 'GET') {
    const jobs = await listAutomationJobs(env);
    const runs = {};
    for (const job of jobs) runs[job.id] = await listAutomationRuns(env, job.id, 5);
    return json({ ok: true, jobs, runs });
  }

  if (seg.length >= 2) {
    const id = decodeURIComponent(seg[1]);
    const job = await getAutomationJob(env, id);
    if (!job) return fail(404, 'JOB_NOT_FOUND', 'Automation job not found.');

    if (method === 'PATCH') {
      const body = await readBody(request);
      const updated = await setAutomationJobEnabled(env, id, body.enabled !== false);
      await addAuditLog(env, 'تنظیم اتوماسیون', `${job.name} · enabled=${updated.enabled}`, normalizeClientIp(request));
      return json({ ok: true, job: updated });
    }

    if (seg[2] === 'run' && method === 'POST') {
      const cfg = await loadGlobalConfig(env);
      const result = await runAutomationJob(env, job, cfg, normalizeClientIp(request));
      if (!result.ok) return fail(500, 'JOB_FAILED', result.error || 'Automation job failed.');
      return json({ ok: true, job: await getAutomationJob(env, id), detail: result.detail, durationMs: result.durationMs });
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown automation route.');
}

async function cfRequest(token, path) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'miliconfigos/4.0'
    }
  });
  let payload = null;
  try { payload = await res.json(); } catch (_e) {}
  return { status: res.status, ok: res.ok, payload };
}

async function handleCloudflare(request, env, seg, method) {
  if (seg.length === 1 && method === 'GET') {
    const status = await cloudflareStatus(env);
    return json({
      ok: true,
      status,
      resources: await listCloudflareResources(env),
      permissions: {
        required: [
          'User → API Tokens → Read (token verification)',
          'Account → Workers Scripts → Read (deployment status)'
        ],
        optional: [
          'Account → Workers Scripts → Edit (only if you deploy from this panel)',
          'Zone → Zone → Read (zone selection)',
          'Zone → DNS → Read (DNS record inspection)'
        ],
        note: 'No token value is ever returned to the browser. Prefer a scoped token over a Global API Key.'
      },
      encryption: {
        keyConfigured: status.encryptionKeyConfigured,
        storage: status.encryption,
        warning: status.encryptionKeyConfigured
          ? ''
          : 'MILI_ENCRYPTION_KEY is not set, so the token is only base64-encoded in D1. Set the secret to enable AES-GCM encryption.'
      }
    });
  }

  if (seg[1] === 'token' && (method === 'PUT' || method === 'POST')) {
    const body = await readBody(request);
    const token = String(body.token || '').trim();
    if (token.length < 20 || /\s/.test(token)) {
      return fail(400, 'TOKEN_INVALID', 'Paste a Cloudflare API token (no spaces).');
    }
    const verification = await cfRequest(token, '/user/tokens/verify');
    if (!verification.ok || verification.payload?.result?.status !== 'active') {
      return fail(400, 'TOKEN_REJECTED', 'Cloudflare rejected the token.', verification.payload?.errors || null);
    }
    const accounts = await cfRequest(token, '/accounts?per_page=5');
    const accountList = Array.isArray(accounts.payload?.result) ? accounts.payload.result : [];
    const accountId = String(body.accountId || accountList[0]?.id || '');
    const stored = await saveCloudflareToken(env, token, { accountId });
    for (const account of accountList) {
      await saveCloudflareResource(env, {
        id: `cf-account-${account.id}`,
        kind: 'account',
        accountId: account.id,
        name: account.name,
        status: 'active',
        detail: 'Visible to the supplied token'
      });
    }
    await addAuditLog(env, 'اتصال کلادفلر', `Token verified · ${accountList.length} account(s) visible`, normalizeClientIp(request));
    return json({
      ok: true,
      encryption: stored.mode,
      accounts: accountList.map(account => ({ id: account.id, name: account.name })),
      accountId
    });
  }

  if (seg[1] === 'token' && method === 'DELETE') {
    await clearCloudflareToken(env);
    await addAuditLog(env, 'قطع اتصال کلادفلر', 'Stored token removed', normalizeClientIp(request));
    return json({ ok: true });
  }

  if (seg[1] === 'test' && method === 'POST') {
    const { token, error } = await getCloudflareToken(env);
    if (!token) {
      return fail(400, 'NO_TOKEN', error || 'No Cloudflare token is stored.');
    }
    const verification = await cfRequest(token, '/user/tokens/verify');
    const accounts = await cfRequest(token, '/accounts?per_page=5');
    const active = verification.ok && verification.payload?.result?.status === 'active';
    return json({
      ok: active,
      verifiedAt: Date.now(),
      tokenStatus: verification.payload?.result?.status || 'unknown',
      accounts: Array.isArray(accounts.payload?.result) ? accounts.payload.result.map(a => ({ id: a.id, name: a.name })) : [],
      errors: verification.payload?.errors || []
    });
  }

  if (seg[1] === 'workers' && method === 'POST') {
    const body = await readBody(request);
    const { token } = await getCloudflareToken(env);
    if (!token) return fail(400, 'NO_TOKEN', 'No Cloudflare token is stored.');
    const status = await cloudflareStatus(env);
    const accountId = String(body.accountId || status.accountId || '');
    if (!accountId) return fail(400, 'ACCOUNT_REQUIRED', 'An account ID is required to list Worker scripts.');
    const res = await cfRequest(token, `/accounts/${encodeURIComponent(accountId)}/workers/scripts`);
    if (!res.ok) return fail(502, 'CF_API_ERROR', 'Cloudflare returned an error.', res.payload?.errors || null);
    const scripts = Array.isArray(res.payload?.result) ? res.payload.result : [];
    const match = body.scriptName
      ? scripts.find(script => script.id === body.scriptName)
      : scripts.find(script => /miliconfig/i.test(script.id));
    return json({
      ok: true,
      accountId,
      scripts: scripts.map(script => ({ id: script.id, modifiedOn: script.modified_on, createdOn: script.created_on })),
      deployment: match
        ? { found: true, script: match.id, modifiedOn: match.modified_on, verifiedAt: Date.now() }
        : { found: false, note: 'No matching Worker script was found. A subscription link is not proof of deployment.' }
    });
  }

  return fail(404, 'NOT_FOUND', 'Unknown Cloudflare route.');
}

async function handleOverview(request, env) {
  const [users, endpoints, subscriptions, configs, jobs, diag, series, logs, cfg] = await Promise.all([
    listUsers(env),
    listEndpoints(env),
    listSubscriptions(env),
    listConfigurations(env, { limit: 200 }),
    listAutomationJobs(env),
    getStorageDiagnostics(env),
    usageTotals(env, 14),
    listAuditLogsPaged(env, { limit: 8 }),
    loadGlobalConfig(env)
  ]);

  const now = Date.now();
  const activeUsers = users.filter(user => user.enabled);
  const healthyEndpoints = endpoints.filter(item => item.enabled && item.lastCheckAt > 0 && item.healthScore >= 60);
  const failingEndpoints = endpoints.filter(item => item.failureCount > 0 || (item.lastCheckAt > 0 && item.healthScore < 40));
  const uncheckedEndpoints = endpoints.filter(item => !item.lastCheckAt);
  const subsByUser = new Map(subscriptions.map(sub => [sub.userId, sub]));
  const activeSubscriptions = users.filter(user => {
    const sub = subsByUser.get(user.id);
    return user.enabled && sub && !sub.revoked;
  });
  const measuredBytes = users.reduce((sum, user) => sum + (user.usedBytes || 0), 0);
  const recentCheck = endpoints.reduce((max, item) => Math.max(max, item.lastCheckAt || 0), 0);
  const expiredUsers = users.filter(user => user.expireAt > 0 && user.expireAt < now);
  const quotaUsers = users.filter(user => user.dataLimitGb > 0 && user.usedBytes >= user.dataLimitGb * 1073741824);

  return json({
    ok: true,
    generatedAt: new Date().toISOString(),
    brand: { name: 'MiliconfigOS', developer: 'Milad Jahani', version: VERSION },
    users: {
      total: users.length,
      active: activeUsers.length,
      disabled: users.length - activeUsers.length,
      capacity: MAX_USERS_LIMIT,
      available: Math.max(0, MAX_USERS_LIMIT - users.length),
      expired: expiredUsers.length,
      quotaReached: quotaUsers.length
    },
    subscriptions: {
      active: activeSubscriptions.length,
      total: subscriptions.length,
      downloads: subscriptions.reduce((sum, sub) => sum + (sub.downloads || 0), 0),
      revoked: subscriptions.filter(sub => sub.revoked).length
    },
    traffic: {
      usedBytes: measuredBytes,
      source: 'worker-stream',
      accuracy: 'Measured byte counters from proxied streams; panel visits are excluded.',
      series
    },
    endpoints: {
      total: endpoints.length,
      enabled: endpoints.filter(item => item.enabled).length,
      healthy: healthyEndpoints.length,
      failing: failingEndpoints.length,
      unchecked: uncheckedEndpoints.length,
      failingList: failingEndpoints.map(item => ({ id: item.id, name: item.name, failures: item.failureCount, score: item.healthScore })),
      lastCheckAt: recentCheck
    },
    protocols: {
      vless: protocolEnabled(cfg, 'vless'),
      trojan: protocolEnabled(cfg, 'trojan'),
      xhttp: protocolEnabled(cfg, 'xhttp'),
      shadowsocks: protocolEnabled(cfg, 'shadowsocks'),
      tls: true,
      ech: String(cfg.ech) === 'yes',
      reality: false
    },
    configurations: {
      generated: configs.length,
      valid: configs.filter(row => row.valid).length,
      lastGeneratedAt: configs[0]?.createdAt || 0
    },
    automation: {
      enabledJobs: jobs.filter(job => job.enabled).length,
      totalJobs: jobs.length,
      lastRunAt: jobs.reduce((max, job) => Math.max(max, job.lastRunAt || 0), 0),
      failures: jobs.filter(job => job.lastStatus === 'failed').map(job => ({ id: job.id, name: job.name, error: job.lastError }))
    },
    storage: {
      d1Enabled: diag.d1Enabled,
      binding: diag.d1BindingName,
      migrated: diag.d1Migrated,
      memoryMode: isMemoryMode(),
      hasPassword: diag.hasPassword,
      error: diag.d1Error || null
    },
    dataPlane: {
      runtime: 'Cloudflare Worker',
      proxyRuntime: true,
      measuredTraffic: true,
      note: 'Config generation and the Worker data plane are separate capabilities. Endpoint health is measured per check level.'
    },
    recentLogs: logs,
    availableUsers: Math.max(0, MAX_USERS_LIMIT - users.length)
  });
}

async function handleBootstrap(request, env) {
  const [cfg, users, initialized, storage] = await Promise.all([
    loadGlobalConfig(env),
    listUsers(env),
    hasAdminPassword(env),
    ensureV4Schema(env)
  ]);
  return json({
    ok: true,
    initialized,
    storage,
    auth: { adminPath: await getOrCreateAdminPath(env) },
    settings: sanitizeSettingsForClient({ ...defaultSettings(), ...CONFIG_DEFAULTS, ...cfg }),
    users: users.map(user => sanitizeUser(user, null)),
    maxUsers: MAX_USERS_LIMIT,
    version: VERSION
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export async function handleV1Api(request, env) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const seg = url.pathname.replace(/^\/api\/v1\/?/, '').split('/').filter(Boolean);
  const relative = seg.join('/');

  try {
    if (relative === 'health' && method === 'GET') {
      const diag = await getStorageDiagnostics(env);
      return json({
        ok: true,
        version: VERSION,
        apiVersion: API_VERSION,
        time: new Date().toISOString(),
        storage: diag.d1Enabled ? 'd1' : (isMemoryMode() ? 'memory' : 'kv'),
        initialized: diag.hasPassword
      });
    }

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          Allow: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          ...securityHeaders()
        }
      });
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !mutatingAllowed(request)) {
      return fail(403, 'ORIGIN_REJECTED', 'Cross-origin request rejected.');
    }

    if (seg[0] === 'auth') {
      return await handleAuth(request, env, seg, method);
    }

    const session = await authenticate(request, env);
    if (!session.ok) {
      return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.');
    }

    if (relative === 'bootstrap' && method === 'GET') return await handleBootstrap(request, env);
    if (relative === 'admin/overview' && method === 'GET') return await handleOverview(request, env);
    if (seg[0] === 'users') return await handleUsers(request, env, seg, method);
    if (seg[0] === 'endpoints') return await handleEndpoints(request, env, seg, method, await loadGlobalConfig(env));
    if (seg[0] === 'configurations') return await handleConfigurations(request, env, seg, method, await loadGlobalConfig(env));
    if (seg[0] === 'subscriptions') return await handleSubscriptions(request, env, seg, method, await loadGlobalConfig(env));
    if (seg[0] === 'scanner') return await handleScanner(request, env, seg, method, await loadGlobalConfig(env));
    if (seg[0] === 'dns') return await handleDns(request, env, seg, method);
    if (seg[0] === 'settings') return await handleSettings(request, env, seg, method);
    if (seg[0] === 'usage' && method === 'GET') return await handleUsage(request, env, seg);
    if (seg[0] === 'audit' && method === 'GET') return await handleAudit(request, env);
    if (seg[0] === 'automation') return await handleAutomation(request, env, seg, method);
    if (seg[0] === 'cloudflare') return await handleCloudflare(request, env, seg, method);
    if (seg[0] === 'capabilities' && method === 'GET') {
      return json({ ok: true, catalogVersion: CATALOG_VERSION, ...capabilityMatrix() });
    }
    if (relative === 'conflicts' && method === 'GET') {
      const cfg = await loadGlobalConfig(env);
      return json({
        ok: true,
        conflicts: detectConflicts({ ...CONFIG_DEFAULTS, ...cfg }),
        defaults: sanitizeSettingsForClient(effectiveSettings(CONFIG_DEFAULTS))
      });
    }

    return fail(404, 'NOT_FOUND', 'Unknown API route.');
  } catch (err) {
    const status = Number(err?.status) || 500;
    if (status >= 500) {
      console.error(JSON.stringify({
        level: 'error',
        scope: 'api/v1',
        path: url.pathname,
        message: String(err?.message || err)
      }));
    }
    return fail(status, status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST', status === 500 ? 'Unexpected server error.' : String(err?.message || err));
  }
}

export const API_EXPORTS = {
  API_VERSION,
  buildSubscriptionUrl,
  sanitizeUser
};
