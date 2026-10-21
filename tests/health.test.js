import test from 'node:test';
import assert from 'node:assert/strict';
import { mapLimit, parseDohAnswer, scoreHealth } from '../src/core/health.js';

test('invalid syntax scores zero', () => {
  const result = scoreHealth({ checks: { syntax: { ok: false, performed: true } } });
  assert.equal(result.score, 0);
  assert.equal(result.status, 'invalid');
});

test('TCP reachability alone is capped and never called a working proxy', () => {
  const result = scoreHealth({
    checks: {
      syntax: { ok: true, performed: true },
      tcp: { ok: true, performed: true, latencyMs: 50 }
    }
  });
  assert.equal(result.status, 'reachable');
  assert.ok(result.score <= 55);
  assert.ok(result.score > 0);
  assert.equal(result.verifiedLevel, 'tcp');
});

test('TCP plus TLS scores higher and reports tls-ok', () => {
  const result = scoreHealth({
    checks: {
      syntax: { ok: true, performed: true },
      dns: { ok: true, performed: true },
      tcp: { ok: true, performed: true, latencyMs: 40 },
      tls: { ok: true, performed: true }
    }
  });
  assert.equal(result.status, 'tls-ok');
  assert.ok(result.score > 55);
  assert.deepEqual(result.performed, ['syntax', 'dns', 'tcp', 'tls']);
});

test('DNS-only result is reported as dns-only', () => {
  const result = scoreHealth({
    checks: {
      syntax: { ok: true, performed: true },
      dns: { ok: true, performed: true },
      tcp: { ok: false, performed: true }
    }
  });
  assert.equal(result.status, 'dns-only');
  assert.ok(result.score <= 55);
});

test('DoH answer parsing', () => {
  const parsed = parseDohAnswer({ Answer: [{ type: 1, data: '104.16.0.1' }, { type: 28, data: '2606:4700::1' }] });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.addresses.length, 2);
  assert.equal(parseDohAnswer({}).ok, false);
});

test('mapLimit bounds concurrency', async () => {
  let active = 0;
  let maxActive = 0;
  const results = await mapLimit([1, 2, 3, 4, 5, 6, 7], 3, async value => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise(resolve => setTimeout(resolve, 10));
    active -= 1;
    return value * 2;
  });
  assert.deepEqual(results, [2, 4, 6, 8, 10, 12, 14]);
  assert.ok(maxActive <= 3);
  assert.ok(maxActive > 1);
});
