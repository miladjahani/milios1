import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decryptSecret,
  encryptSecret,
  hashPassword,
  passwordPolicy,
  sha256HexDigest,
  timingSafeEqual,
  verifyPassword
} from '../src/core/security.js';

test('PBKDF2 password hash verifies and rejects wrong password', async () => {
  const hash = await hashPassword('Correct-Horse-42');
  assert.match(hash, /^pbkdf2\$sha256\$210000\$/);
  const good = await verifyPassword('Correct-Horse-42', hash);
  assert.equal(good.ok, true);
  assert.equal(good.scheme, 'pbkdf2');
  const bad = await verifyPassword('Correct-Horse-43', hash);
  assert.equal(bad.ok, false);
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
