import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PBKDF2_ITERATIONS,
  decryptSecret,
  describePasswordRecord,
  encryptSecret,
  hashPassword,
  passwordPolicy,
  sha256HexDigest,
  timingSafeEqual,
  verifyPassword
} from '../src/core/security.js';

function base64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

async function legacyRecord(password, iterations) {
  const salt = new Uint8Array(16).fill(9);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$sha256$${iterations}$${base64(salt)}$${base64(new Uint8Array(bits))}`;
}

test('PBKDF2 password hash verifies and rejects wrong password', async () => {
  const hash = await hashPassword('Correct-Horse-42');
  assert.match(hash, /^pbkdf2\$sha256\$100000\$/);
  const good = await verifyPassword('Correct-Horse-42', hash);
  assert.equal(good.ok, true);
  assert.equal(good.scheme, 'pbkdf2');
  const bad = await verifyPassword('Correct-Horse-43', hash);
  assert.equal(bad.ok, false);
});

test('hashes never exceed the workerd PBKDF2 ceiling', async () => {
  const hash = await hashPassword('Correct-Horse-42');
  const info = describePasswordRecord(hash);
  assert.equal(info.configured, true);
  assert.equal(info.derivable, true);
  assert.ok(info.iterations <= PBKDF2_ITERATIONS);
  assert.ok(info.iterations >= 1000);
});

test('an over-cap legacy record is reported as unverifiable, not as a wrong password', async () => {
  const record = await legacyRecord('Correct-Horse-42', 210000);
  const info = describePasswordRecord(record);
  assert.equal(info.scheme, 'pbkdf2');
  assert.equal(info.iterations, 210000);
  assert.equal(info.derivable, false);
  const result = await verifyPassword('Correct-Horse-42', record);
  assert.equal(result.ok, false);
  assert.equal(result.unverifiable, true);
  assert.equal(result.scheme, 'pbkdf2-unverifiable');
});

test('a lower-iteration record still verifies and asks for a rehash', async () => {
  const record = await legacyRecord('Correct-Horse-42', 10000);
  const result = await verifyPassword('Correct-Horse-42', record);
  assert.equal(result.ok, true);
  assert.equal(result.needsRehash, true);
});

test('legacy SHA-256 hash still verifies and requests rehash', async () => {
  const legacy = await sha256HexDigest('legacy-password-123');
  const result = await verifyPassword('legacy-password-123', legacy);
  assert.equal(result.ok, true);
  assert.equal(result.needsRehash, true);
  assert.equal(result.scheme, 'sha256-legacy');
});

test('password policy rejects weak passwords and accepts strong ones', () => {
  assert.equal(passwordPolicy('short').ok, false);
  assert.equal(passwordPolicy('password123').ok, false);
  assert.equal(passwordPolicy('aaaaaaaaaaaaaaaa').ok, false);
  assert.equal(passwordPolicy('onlylettershere').ok, false);
  assert.equal(passwordPolicy('Long-Enough-9').ok, true);
});

test('constant-time comparison handles different lengths', () => {
  assert.equal(timingSafeEqual('abc', 'abc'), true);
  assert.equal(timingSafeEqual('abc', 'abd'), false);
  assert.equal(timingSafeEqual('abc', 'abcd'), false);
});

test('AES-GCM secret round-trip with encryption key', async () => {
  const env = { MILI_ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef' };
  const encrypted = await encryptSecret('cf-token-value', env);
  assert.equal(encrypted.mode, 'aes-gcm');
  assert.ok(!encrypted.value.includes('cf-token-value'));
  const decrypted = await decryptSecret(encrypted.value, env);
  assert.equal(decrypted.value, 'cf-token-value');
});

test('secret storage without key is clearly marked base64-only', async () => {
  const encrypted = await encryptSecret('my-token', {});
  assert.equal(encrypted.mode, 'base64-only');
  assert.ok(encrypted.value.startsWith('b64:'));
  const decrypted = await decryptSecret(encrypted.value, {});
  assert.equal(decrypted.value, 'my-token');
});
