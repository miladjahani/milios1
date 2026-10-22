// Recovery path for administrators locked out by a password record this runtime
// cannot derive (a 210 000-iteration PBKDF2 hash written by an older build).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createD1 } from './helpers/d1-sqlite.js';
import { body, jsonRequest, loadWorker, readSetCookie } from './helpers/workerHarness.js';
import { describePasswordRecord } from '../src/core/security.js';

const OLD_PASSWORD = 'Mili-Config-2026!';
const ENV_PASSWORD = 'Recovered-Admin-2026!';

const worker = await loadWorker();
const DB = createD1();
const env = { DB, MILI_ENCRYPTION_KEY: 'recovery-test-key-0123456789' };

function base64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

async function legacyRecord(password, iterations) {
  const salt = new Uint8Array(16).fill(3);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$sha256$${iterations}$${base64(salt)}$${base64(new Uint8Array(bits))}`;
}

async function call(path, options = {}, currentEnv = env) {
  return worker.fetch(jsonRequest(path, options), currentEnv, {});
}

async function storePasswordHash(record) {
  await DB.prepare(
    `INSERT INTO system_config (key, value, updated_at) VALUES ('admin_password_hash', ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(record, Date.now()).run();
}

async function readStoredHash() {
  const row = await DB.prepare(`SELECT value FROM system_config WHERE key = 'admin_password_hash'`).first();
  return row ? String(row.value) : '';
}

test('a 210k-iteration record reports PASSWORD_UNVERIFIABLE instead of a wrong password', async () => {
  // Ensure the schema exists before writing straight into system_config.
  const health = await call('/api/v1/health');
  assert.equal(health.status, 200);

  const legacy = await legacyRecord(OLD_PASSWORD, 210000);
  await storePasswordHash(legacy);
  assert.equal(describePasswordRecord(legacy).derivable, false);

  const res = await call('/api/v1/auth/login', { method: 'POST', body: { password: OLD_PASSWORD } });
  assert.equal(res.status, 409);
  const data = await body(res);
  assert.equal(data.error.code, 'PASSWORD_UNVERIFIABLE');
  assert.match(data.error.message, /210000/);
  assert.match(data.error.message, /MILI_ADMIN_PASSWORD/);
});

test('MILI_ADMIN_PASSWORD restores access and rewrites the record', async () => {
  const res = await call(
    '/api/v1/auth/login',
    { method: 'POST', body: { password: ENV_PASSWORD } },
    { ...env, MILI_ADMIN_PASSWORD: ENV_PASSWORD }
  );
  assert.equal(res.status, 200);
  const data = await body(res);
  assert.equal(data.ok, true);
  assert.ok(readSetCookie(res), 'a session cookie is issued');

  const stored = await readStoredHash();
  const info = describePasswordRecord(stored);
  assert.equal(info.scheme, 'pbkdf2');
  assert.equal(info.derivable, true);
  assert.ok(info.iterations <= 100000);
});

test('the environment password keeps working on later requests without rehashing', async () => {
  const withSecret = { ...env, MILI_ADMIN_PASSWORD: ENV_PASSWORD };
  const first = await call('/api/v1/auth/login', { method: 'POST', body: { password: ENV_PASSWORD } }, withSecret);
  assert.equal(first.status, 200);
  const before = await readStoredHash();

  const second = await call('/api/v1/auth/login', { method: 'POST', body: { password: ENV_PASSWORD } }, withSecret);
  assert.equal(second.status, 200);
  assert.equal(await readStoredHash(), before, 'the stored hash is reused while the secret is unchanged');
});

test('a weak environment password is ignored rather than locking the panel', async () => {
  const res = await call(
    '/api/v1/auth/login',
    { method: 'POST', body: { password: ENV_PASSWORD } },
    { ...env, MILI_ADMIN_PASSWORD: 'short' }
  );
  assert.equal(res.status, 200);
});

test('the environment password still works after the rate limiter trips', async () => {
  for (let i = 0; i < 10; i++) {
    await call('/api/v1/auth/login', { method: 'POST', body: { password: `wrong-${i}-Password!` } });
  }
  const blocked = await call('/api/v1/auth/login', { method: 'POST', body: { password: 'still-Wrong-11!' } });
  assert.equal(blocked.status, 429);

  const recovered = await call(
    '/api/v1/auth/login',
    { method: 'POST', body: { password: ENV_PASSWORD } },
    { ...env, MILI_ADMIN_PASSWORD: ENV_PASSWORD }
  );
  assert.equal(recovered.status, 200);
});
