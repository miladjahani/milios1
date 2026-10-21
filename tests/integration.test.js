// End-to-end control-plane tests.
// Runs the real Worker fetch handler against a real SQLite database through the
// D1 API adapter, so routes, auth, persistence and serializers are exercised
// together instead of being mocked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createD1 } from './helpers/d1-sqlite.js';
import { body, jsonRequest, loadWorker, readSetCookie } from './helpers/workerHarness.js';

const PASSWORD = 'Mili-Config-2026!';
const worker = await loadWorker();
const DB = createD1();
const env = { DB, MILI_ENCRYPTION_KEY: 'integration-test-key-0123456789' };

async function call(path, options = {}) {
  return worker.fetch(jsonRequest(path, options), env, {});
}

test('health endpoint reports storage state before setup', async () => {
  const res = await call('/api/v1/health');
  assert.equal(res.status, 200);
  const data = await body(res);
  assert.equal(data.ok, true);
  assert.equal(data.storage, 'd1');
  assert.equal(data.initialized, false);
});

test('public gateway renders the login page for signed-out visitors', async () => {
  const res = await call('/');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /MiliconfigOS/);
  assert.match(html, /dir="rtl"/);
});

test('protected routes reject anonymous requests', async () => {
  const res = await call('/api/v1/users');
  assert.equal(res.status, 401);
  const data = await body(res);
  assert.equal(data.error.code, 'UNAUTHENTICATED');
});

test('cross-origin mutating requests are rejected', async () => {
  const res = await call('/api/v1/auth/setup', {
    method: 'POST',
    body: { password: PASSWORD, confirmPassword: PASSWORD },
    origin: 'https://evil.example.com'
  });
  assert.equal(res.status, 403);
});

test('first-run setup enforces the password policy', async () => {
  const res = await call('/api/v1/auth/setup', {
    method: 'POST',
    body: { password: 'short', confirmPassword: 'short' }
  });
  assert.equal(res.status, 400);
  const data = await body(res);
  assert.equal(data.error.code, 'PASSWORD_POLICY');
});

let sessionCookie = '';

test('first-run setup creates the administrator and a session', async () => {
  const res = await call('/api/v1/auth/setup', {
    method: 'POST',
    body: { password: PASSWORD, confirmPassword: PASSWORD }
  });
  assert.equal(res.status, 200);
  sessionCookie = readSetCookie(res);
  assert.match(sessionCookie, /mili_/);
  const data = await body(res);
  assert.equal(data.ok, true);
  assert.ok(data.adminPath);

  const stored = DB.db.prepare("SELECT value FROM system_config WHERE key = 'admin_password_hash'").get();
  assert.ok(stored, 'password hash must be persisted');
  assert.ok(String(stored.value).startsWith('pbkdf2$sha256$'), 'hash must use PBKDF2, never plaintext');
  assert.equal(String(stored.value).includes(PASSWORD), false);
});

test('initial setup cannot be replayed', async () => {
  const res = await call('/api/v1/auth/setup', {
    method: 'POST',
    body: { password: 'Another-Password-99!', confirmPassword: 'Another-Password-99!' }
  });
  assert.equal(res.status, 403);
});

test('login rejects a wrong password and accepts the real one', async () => {
  const bad = await call('/api/v1/auth/login', { method: 'POST', body: { password: 'Wrong-Password-1!' } });
  assert.equal(bad.status, 401);

  const good = await call('/api/v1/auth/login', { method: 'POST', body: { password: PASSWORD } });
  assert.equal(good.status, 200);
  sessionCookie = readSetCookie(good);
});

test('bootstrap exposes settings but never secrets', async () => {
  const res = await call('/api/v1/bootstrap', { cookie: sessionCookie });
  assert.equal(res.status, 200);
  const data = await body(res);
  assert.equal(data.ok, true);
  assert.equal(data.maxUsers, 5);
  assert.equal(JSON.stringify(data).includes('admin_password_hash'), false);
  assert.equal(JSON.stringify(data).includes('adminPasswordHash'), false);
});

const createdUsers = [];

test('user management creates exactly five accounts', async () => {
  for (let i = 1; i <= 5; i++) {
    const res = await call('/api/v1/users', {
      method: 'POST',
      cookie: sessionCookie,
      body: { username: `user-${i}`, subNodeCount: 6 }
    });
    assert.equal(res.status, 201, `user-${i} should be created`);
    const data = await body(res);
    assert.equal(data.user.username, `user-${i}`);
    assert.ok(data.subscriptionUrl.includes('/s/'));
    createdUsers.push(data.user);
  }
});

test('the backend enforces the five-user limit transactionally', async () => {
  const res = await call('/api/v1/users', {
    method: 'POST',
    cookie: sessionCookie,
    body: { username: 'user-6' }
  });
  assert.equal(res.status, 409);
  const data = await body(res);
  assert.equal(data.error.code, 'LIMIT_REACHED');

  const list = await call('/api/v1/users', { cookie: sessionCookie });
  const listed = await body(list);
  assert.equal(listed.count, 5);
  assert.equal(listed.availableSlots, 0);
});

test('every user gets an isolated subscription identity', async () => {
  const tokens = new Set(createdUsers.map(user => user.subscription.token));
  const uuids = new Set(createdUsers.map(user => user.uuid));
  assert.equal(tokens.size, 5);
  assert.equal(uuids.size, 5);
});

test('subscription delivery works per format and per user', async () => {
  const target = createdUsers[0];
  const token = target.subscription.token;

  const raw = await worker.fetch(jsonRequest(`/s/${token}?target=raw`), env, {});
  assert.equal(raw.status, 200);
  const links = (await raw.text()).trim().split('\n').filter(Boolean);
  assert.ok(links.length > 0);
  assert.ok(links.every(link => link.startsWith('vless://') || link.startsWith('trojan://') || link.startsWith('ss://')));
  // Each user's nodes carry that user's own credentials.
  assert.ok(links.some(link => link.includes(target.uuid)));

  const clash = await worker.fetch(jsonRequest(`/s/${token}?target=clash`), env, {});
  assert.equal(clash.status, 200);
  const clashText = await clash.text();
  assert.match(clashText, /^proxies:/m);

  const singbox = await worker.fetch(jsonRequest(`/s/${token}?target=singbox`), env, {});
  assert.equal(singbox.status, 200);
  const singboxJson = JSON.parse(await singbox.text());
  assert.ok(Array.isArray(singboxJson.outbounds));

  const other = await worker.fetch(jsonRequest(`/s/${createdUsers[1].subscription.token}?target=raw`), env, {});
  const otherText = await other.text();
  assert.equal(otherText.includes(target.uuid), false, 'users must not see each other credentials');
});

test('revoking a subscription blocks delivery immediately', async () => {
  const target = createdUsers[2];
  const revoke = await call(`/api/v1/users/${target.id}/revoke-sub`, {
    method: 'POST',
    cookie: sessionCookie,
    body: { revoked: true }
  });
  assert.equal(revoke.status, 200);

  const blocked = await worker.fetch(jsonRequest(`/s/${target.subscription.token}?target=raw`), env, {});
  assert.equal(blocked.status, 403);

  await call(`/api/v1/users/${target.id}/revoke-sub`, {
    method: 'POST',
    cookie: sessionCookie,
    body: { revoked: false }
  });
  const restored = await worker.fetch(jsonRequest(`/s/${target.subscription.token}?target=raw`), env, {});
  assert.equal(restored.status, 200);
});

test('configuration engine generates validated combinations from stored endpoints', async () => {
  const res = await call('/api/v1/configurations/generate', {
    method: 'POST',
    cookie: sessionCookie,
    body: { userId: createdUsers[0].id, formats: ['singbox', 'clash', 'uri'], limit: 12 }
  });
  assert.equal(res.status, 200);
  const data = await body(res);
  assert.ok(data.generated > 0);
  assert.ok(data.plans.every(plan => plan.validation?.ok !== false));
  assert.ok(data.plans.every(plan => Array.isArray(plan.reasons) && plan.reasons.length > 0));

  const listed = await body(await call('/api/v1/configurations?limit=20', { cookie: sessionCookie }));
  assert.ok(listed.configurations.length >= data.generated);
});

test('settings persist through the API', async () => {
  const current = await body(await call('/api/v1/settings', { cookie: sessionCookie }));
  assert.equal(current.ok, true);
  const next = {
    ...current.values,
    appName: 'Miliconfig Test Lab',
    sessionHours: 6,
    subNodeCount: 12
  };
  const saved = await call('/api/v1/settings', { method: 'PUT', cookie: sessionCookie, body: { settings: next } });
  assert.equal(saved.status, 200);

  const reloaded = await body(await call('/api/v1/settings', { cookie: sessionCookie }));
  assert.equal(reloaded.values.appName, 'Miliconfig Test Lab');
  assert.equal(reloaded.values.sessionHours, 6);
  assert.equal(reloaded.values.subNodeCount, 12);
});

test('invalid settings are rejected with field details', async () => {
  const res = await call('/api/v1/settings', {
    method: 'PUT',
    cookie: sessionCookie,
    body: { settings: { sessionHours: 9999, homepage: 'not-a-url' } }
  });
  assert.equal(res.status, 400);
  const data = await body(res);
  assert.ok(Array.isArray(data.error.details));
  assert.ok(data.error.details.length >= 2);
});

test('administrative actions are written to the audit log', async () => {
  const data = await body(await call('/api/v1/audit', { cookie: sessionCookie }));
  assert.equal(data.ok, true);
  const actions = data.logs.map(entry => entry.action);
  assert.ok(actions.some(action => action.includes('ساخت کاربر')));
  assert.ok(actions.some(action => action.includes('ورود موفق')));
});

test('dashboard overview is computed from stored records', async () => {
  const data = await body(await call('/api/v1/admin/overview', { cookie: sessionCookie }));
  assert.equal(data.ok, true);
  assert.equal(data.users.total, 5);
  assert.equal(data.users.capacity, 5);
  assert.equal(data.users.available, 0);
  assert.equal(data.subscriptions.total, 5);
  assert.ok(data.endpoints.total >= 1);
  assert.equal(data.dataPlane.measuredTraffic, true);
});

test('logout revokes the session server-side', async () => {
  const out = await call('/api/v1/auth/logout', { method: 'POST', cookie: sessionCookie });
  assert.equal(out.status, 200);
  const after = await call('/api/v1/users', { cookie: sessionCookie });
  assert.equal(after.status, 401);
});

test('login rate limiting blocks repeated failures', async () => {
  let last = 0;
  for (let i = 0; i < 12; i++) {
    const res = await call('/api/v1/auth/login', { method: 'POST', body: { password: 'nope-' + i } });
    last = res.status;
    if (res.status === 429) break;
  }
  assert.equal(last, 429);
});
