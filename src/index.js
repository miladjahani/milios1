// ============================================================================
// miliconfigOS v4.0 - Cloudflare Worker entry point
// Control plane (panel + API) and data plane (proxy runtime) share this Worker.
// ============================================================================

import {
  BRAND_NAME,
  DIRECT_DOMAINS,
  OFFICIAL_DIRECT_IPS,
  OFFICIAL_DIRECT_IPV6,
  VERSION
} from './config/defaults.js';
import { isPrivateHost } from './config/schema.js';
import {
  ensureD1Schema,
  getOrCreateAdminPath,
  getStorageDiagnostics,
  getUserByIdOrToken,
  hasAdminPassword,
  listUsers,
  loadGlobalConfig,
  recordUserActivity,
  verifyAdminSession
} from './db/d1.js';
import {
  databaseConfigured,
  ensureV4Schema,
  findSubscriptionByToken,
  listEndpoints,
  touchSubscriptionAccess,
  verifyAdminSessionToken
} from './db/v4.js';
import { handleWebSocketUpgrade, handleXhttpPostRequest } from './core/runtime.js';
import { runDueAutomationJobs } from './core/automation.js';
import { generateUserNodesList, handleSubscriptionResponse } from './subscription/generator.js';
import {
  handleAuthApi,
  handleConfigApi,
  handleDashboardStatsApi,
  handlePreferredIpsApi,
  handlePublicUserStatusApi,
  handleScannerApi,
  handleUsersApi
} from './api/handlers.js';
import { handleV1Api } from './api/v1.js';
import { renderLoginGatewayHtml } from './ui/loginHtml.js';
import { renderUserStatusPageHtml } from './ui/statusHtml.js';
import { renderAdminDashboardHtml } from './ui/adminHtml.js';
import { readCookie, securityHeaders, SESSION_COOKIE, LEGACY_SESSION_COOKIE } from './core/security.js';

function normalizeCleanPath(p = '') {
  return String(p || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function isAdminAuthorizedPath(prefixPath, adminUuid, customPath) {
  const cleanPrefix = normalizeCleanPath(prefixPath);
  if (!cleanPrefix) return false;
  const cleanAdmin = normalizeCleanPath(adminUuid);
  const cleanCustom = normalizeCleanPath(customPath);
  if (cleanCustom) {
    return cleanPrefix === cleanCustom || cleanPrefix === cleanAdmin;
  }
  return cleanPrefix === cleanAdmin;
}

function log(level, message, extra = {}) {
  try {
    console.log(JSON.stringify({ level, scope: 'worker', message, ...extra }));
  } catch (_e) {}
}

function htmlResponse(html, status = 200, extraHeaders = {}) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...securityHeaders(),
      ...extraHeaders
    }
  });
}

function textResponse(text, status = 200, extraHeaders = {}) {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...securityHeaders(),
      ...extraHeaders
    }
  });
}

async function fetchHomepage(globalCfg) {
  const raw = String(globalCfg.homepage || '').trim();
  const fallback = renderNginxFallback();
  if (!raw) return { html: fallback, source: 'fallback' };
  let target;
  try {
    target = new URL(raw);
  } catch (_e) {
    return { html: fallback, source: 'fallback' };
  }
  if (!/^https?:$/.test(target.protocol) || isPrivateHost(target.hostname)) {
    return { html: fallback, source: 'fallback' };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(target.toString(), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MiliconfigOS/4.0)',
        Accept: 'text/html,application/xhtml+xml'
      }
    });
    clearTimeout(timer);
    if (!res.ok) return { html: fallback, source: 'fallback' };
    const type = res.headers.get('Content-Type') || '';
    if (!/text\/html/i.test(type)) return { html: fallback, source: 'fallback' };
    let html = await res.text();
    // Strip framing restrictions so the same-origin login gateway can render it.
    html = html.replace(/<meta[^>]+http-equiv=["']?x-frame-options["']?[^>]*>/gi, '');
    return {
      html,
      source: target.toString(),
      base: `<base href="${target.toString().replace(/"/g, '&quot;')}">`
    };
  } catch (_e) {
    return { html: fallback, source: 'fallback' };
  }
}

function renderNginxFallback() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to nginx!</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
font-family:Arial,Helvetica,sans-serif;background:#fff;color:#333}
.page{max-width:680px;padding:40px 24px;text-align:center}
.logo{width:96px;height:96px;margin:0 auto 24px;display:block}
h1{font-size:38px;margin:0 0 18px}p{font-size:18px;line-height:1.7;color:#555;margin:12px auto;max-width:540px}
.foot{margin-top:44px;padding-top:16px;border-top:1px solid #e6e6e6;font-size:13px;color:#999}
</style></head><body><div class="page">
<svg class="logo" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" rx="18" fill="#009639"/>
<path d="M34 94V34l60 60V34" fill="none" stroke="#fff" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/></svg>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
<p>For online documentation and support please refer to nginx.org.<br>Commercial support is available at nginx.com.</p>
<p class="foot">Server at ${BRAND_NAME}.v4 Port 80</p>
</div></body></html>`;
}

async function hasValidAdminSession(request, env) {
  const token = readCookie(request, SESSION_COOKIE) || readCookie(request, LEGACY_SESSION_COOKIE);
  if (!token) return false;
  const result = await verifyAdminSessionToken(env, token);
  if (result.valid) return true;
  // Legacy fallback for sessions created before v4; they expire server-side.
  return await verifyAdminSession(env, token);
}

async function resolveSubscriptionContext(env, token) {
  const sub = await findSubscriptionByToken(env, token);
  if (sub) {
    const user = await getUserByIdOrToken(env, sub.userId);
    return { user, sub };
  }
  const user = await getUserByIdOrToken(env, token);
  return { user, sub: null };
}

function subscriptionBlockedResponse(user) {
  if (!user) {
    return textResponse('Subscription not found.\n', 404);
  }
  if (user.enabled === false) {
    return textResponse('This subscription is disabled. Contact your administrator.\n', 403);
  }
  if (Number(user.expireAt) > 0 && Number(user.expireAt) < Date.now()) {
    return textResponse('This subscription has expired. Contact your administrator.\n', 403);
  }
  if (Number(user.dataLimitGb) > 0 && Number(user.usedBytes) >= Number(user.dataLimitGb) * 1073741824) {
    return textResponse('The data quota for this subscription is exhausted.\n', 403);
  }
  return null;
}

export default {
  async fetch(request, env = {}, ctx = {}) {
    const url = new URL(request.url);
    const started = Date.now();
    try {
      await ensureD1Schema(env);
      await ensureV4Schema(env);
      const databaseReady = databaseConfigured(env);

      const adminUuid = await getOrCreateAdminPath(env);
      const globalCfg = await loadGlobalConfig(env);
      const allUsers = await listUsers(env);

      // 1. Versioned API (handles its own authentication)
      if (url.pathname === '/api/v1' || url.pathname.startsWith('/api/v1/')) {
        return await handleV1Api(request, env);
      }

      // 2. Proxy data plane (WebSocket upgrade)
      const upgrade = (request.headers.get('Upgrade') || '').toLowerCase();
      if (upgrade === 'websocket') {
        return await handleWebSocketUpgrade(request, env, ctx, globalCfg, allUsers, adminUuid);
      }

      // 3. Legacy API surface (kept for compatibility with existing integrations)
      if (url.pathname.includes('/api/')) {
        if (url.pathname.startsWith('/api/admin/')) {
          return await handleAuthApi(request, env);
        }
        if (url.pathname.startsWith('/api/scanner/')) {
          return await handleScannerApi(request, env);
        }
        const pathParts = url.pathname.split('/').filter(Boolean);
        const apiIdx = pathParts.indexOf('api');
        const prefix = pathParts.slice(0, apiIdx).join('/');
        const apiSubPath = pathParts.slice(apiIdx + 1).join('/');

        if (apiSubPath.startsWith('status/')) {
          const token = decodeURIComponent(apiSubPath.slice('status/'.length));
          return await handlePublicUserStatusApi(request, env, token);
        }

        if (!isAdminAuthorizedPath(prefix, adminUuid, globalCfg.d)) {
          return textResponse(JSON.stringify({ error: 'Forbidden' }), 403);
        }
        if (apiSubPath === 'config') return await handleConfigApi(request, env);
        if (apiSubPath === 'users') return await handleUsersApi(request, env);
        if (apiSubPath === 'preferred-ips') return await handlePreferredIpsApi(request, env, true);
        if (apiSubPath === 'stats' || apiSubPath === 'd1-init') return await handleDashboardStatsApi(request, env);
        return textResponse(JSON.stringify({ error: 'Not Found' }), 404);
      }

      // 4. xHTTP POST transport
      if (request.method === 'POST') {
        return await handleXhttpPostRequest(request, env, ctx, globalCfg, allUsers, adminUuid);
      }

      if (request.method === 'GET' || request.method === 'HEAD') {
        const pathParts = url.pathname.split('/').filter(Boolean);

        // 4a. Homepage used by the login gateway (same-origin iframe)
        if (url.pathname === '/__homepage') {
          const page = await fetchHomepage(globalCfg);
          const inject = page.base || '';
          return htmlResponse(inject ? page.html.replace(/<head([^>]*)>/i, `<head$1>${inject}`) : page.html, 200, {
            'Content-Security-Policy': "frame-ancestors 'self'",
            'X-Frame-Options': 'SAMEORIGIN'
          });
        }

        // 4b. Public gateway
        const initialized = await hasAdminPassword(env);
        const isAdminPath = isAdminAuthorizedPath(normalizeCleanPath(url.pathname), adminUuid, globalCfg.d);
        const authenticated = isAdminPath ? await hasValidAdminSession(request, env) : false;

        if (url.pathname === '/' || url.pathname === '/login' || (isAdminPath && !authenticated)) {
          return htmlResponse(renderLoginGatewayHtml({
            initialized,
            homepage: globalCfg.homepage || 'https://nginx.com',
            configuredHomepage: Boolean(String(globalCfg.homepage || '').trim()),
            databaseAvailable: databaseReady
          }));
        }

        // 4c. Legacy region/test endpoints
        if (pathParts.length === 2 && (pathParts[1] === 'region' || pathParts[1] === 'test-api')) {
          if (!isAdminAuthorizedPath(pathParts[0], adminUuid, globalCfg.d)) {
            return textResponse(JSON.stringify({ error: 'Access Denied' }), 403);
          }
          if (pathParts[1] === 'region') {
            return new Response(JSON.stringify({
              region: globalCfg.wk ? globalCfg.wk.toUpperCase() : globalCfg.p ? 'CUSTOM' : 'CF',
              detectionMethod: globalCfg.wk ? 'manual' : globalCfg.p ? 'custom proxy IP' : 'official Cloudflare egress',
              timestamp: new Date().toISOString()
            }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
          }
          return new Response(JSON.stringify({
            detectedRegion: 'CF',
            message: 'Test API reachable',
            timestamp: new Date().toISOString()
          }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
        }

        // 4d. Subscriptions: /s/{token}, /sub/{token}, /{token}/sub
        const isSubPath = (pathParts[0] === 's' && pathParts[1]) ||
          (pathParts[0] === 'sub' && pathParts[1]) ||
          (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'sub');
        if (isSubPath) {
          const token = pathParts[0] === 's' || pathParts[0] === 'sub'
            ? decodeURIComponent(pathParts.slice(1).join('/'))
            : decodeURIComponent(pathParts.slice(0, -1).join('/'));

          const isAdminToken = isAdminAuthorizedPath(token, adminUuid, globalCfg.d);
          let targetUser = null;
          let sub = null;

          if (!isAdminToken) {
            const resolved = await resolveSubscriptionContext(env, token);
            targetUser = resolved.user;
            sub = resolved.sub;
          }

          if (isAdminToken) {
            targetUser = {
              id: allUsers[0]?.id || null,
              username: BRAND_NAME,
              uuid: adminUuid,
              subNodeCount: globalCfg.subNodeCount || 50,
              enabled: true,
              dataLimitGb: 0,
              usedBytes: 0,
              expireAt: 0,
              nodeScope: 'all',
              config: globalCfg
            };
          }

          if (!targetUser) return textResponse('Invalid subscription token.\n', 403);
          if (sub && sub.revoked) return textResponse('This subscription has been revoked.\n', 403);
          const blocked = subscriptionBlockedResponse(targetUser);
          if (blocked) return blocked;

          if (targetUser.id) {
            const tasks = [
              recordUserActivity(env, targetUser.id, 0, 1).catch(() => {}),
              touchSubscriptionAccess(env, targetUser.id).catch(() => {})
            ];
            if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(Promise.all(tasks));
          }
          const catalogEndpoints = (await listEndpoints(env)).filter(item => item.enabled);
          return await handleSubscriptionResponse(request, targetUser, url, catalogEndpoints);
        }

        // 4e. User status page (admin path view, subscription token, or legacy user id)
        const wantsStatus = url.searchParams.get('view') === 'status' ||
          (pathParts[0] === 'status' && pathParts[1]) ||
          (pathParts.length === 2 && pathParts[1] === 'status');

        if (wantsStatus) {
          const token = pathParts[0] === 'status' && pathParts[1]
            ? decodeURIComponent(pathParts[1])
            : (pathParts.length === 2 && pathParts[1] === 'status' ? decodeURIComponent(pathParts[0]) : '');
          let userObj = null;
          if (token) {
            const resolved = await resolveSubscriptionContext(env, token);
            if (resolved.sub && resolved.sub.revoked) {
              return textResponse('This subscription has been revoked.\n', 403);
            }
            userObj = resolved.user;
          }
          if (!userObj && isAdminPath) {
            userObj = allUsers[0] || {
              id: 'mili-admin',
              username: BRAND_NAME,
              uuid: adminUuid,
              subNodeCount: globalCfg.subNodeCount || 50,
              enabled: true,
              status: 'active',
              dataLimitGb: 0,
              usedBytes: 0,
              lifetimeBytes: 0,
              requestCount: 0,
              expireDays: 0,
              expireAt: 0,
              startOnFirstUse: true,
              ipLimit: 50,
              nodeScope: 'all',
              config: globalCfg
            };
          }
          if (!userObj) return textResponse('User not found.\n', 404);
          const nodes = await generateUserNodesList(userObj, url.hostname, {
            limit: userObj.subNodeCount,
            catalogEndpoints: await listEndpoints(env)
          });
          return htmlResponse(renderUserStatusPageHtml(userObj, nodes, request.url));
        }

        // 4f. Admin panel
        if (isAdminPath) {
          if (!authenticated) {
            return htmlResponse(renderLoginGatewayHtml({
              initialized,
              homepage: globalCfg.homepage || 'https://nginx.com',
              configuredHomepage: Boolean(String(globalCfg.homepage || '').trim()),
              databaseAvailable: databaseReady
            }));
          }
          const diag = await getStorageDiagnostics(env);
          const customYxCount = (globalCfg.yx || '').split(',').filter(Boolean).length;
          return htmlResponse(renderAdminDashboardHtml({
            config: globalCfg,
            users: allUsers,
            diagnostics: {
              ...diag,
              healthyCfIps: customYxCount + DIRECT_DOMAINS.length + OFFICIAL_DIRECT_IPS.length
            },
            adminPath: normalizeCleanPath(url.pathname),
            officialIps: OFFICIAL_DIRECT_IPS,
            officialIpv6: OFFICIAL_DIRECT_IPV6,
            directDomains: DIRECT_DOMAINS.map(item => item.domain),
            version: VERSION
          }));
        }

        // 4g. Legacy user status shortcut by user id/uuid
        const matchedUser = await getUserByIdOrToken(env, normalizeCleanPath(url.pathname));
        if (matchedUser) {
          const nodes = await generateUserNodesList(matchedUser, url.hostname, {
            limit: matchedUser.subNodeCount,
            catalogEndpoints: await listEndpoints(env)
          });
          return htmlResponse(renderUserStatusPageHtml(matchedUser, nodes, request.url));
        }
      }

      return textResponse(JSON.stringify({ error: 'Not Found' }), 404);
    } catch (err) {
      log('error', 'Unhandled request error', {
        path: url.pathname,
        method: request.method,
        message: String(err?.message || err),
        ms: Date.now() - started
      });
      return textResponse(JSON.stringify({
        error: 'internal_error',
        message: 'The request could not be completed. Check the Worker logs for details.'
      }), 500);
    }
  },

  // Cloudflare Cron Trigger: runs enabled automation jobs whose next_run_at
  // has passed. Configure the schedule in wrangler.toml ([triggers] crons).
  async scheduled(_event, env = {}, ctx = {}) {
    const work = runDueAutomationJobs(env).catch(err => {
      log('error', 'Scheduled automation failed', { message: String(err?.message || err) });
      return [];
    });
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(work);
    else await work;
  }
};
