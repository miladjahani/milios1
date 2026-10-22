// Live CFnew source registry: catalog integrity, parsing, auto config and the
// merge into the preferred-node pool (yx).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SOURCE_CATALOG,
  SOURCE_CATEGORIES,
  SOURCE_COUNTS,
  getSourcesByCategory,
  resolveSourceEntries
} from '../src/config/sources.js';
import {
  normalizeSourcesAuto,
  parseAddressLines,
  applySourcesToPreferred
} from '../src/core/sources.js';
import { loadGlobalConfig } from '../src/db/d1.js';
import { createD1 } from './helpers/d1-sqlite.js';
import { body, jsonRequest, loadWorker, readSetCookie } from './helpers/workerHarness.js';

test('sources API exposes the catalog and auto settings to an admin', async () => {
  const worker = await loadWorker();
  const env = { DB: createD1(), MILI_ENCRYPTION_KEY: 'sources-test-key-0123456789' };
  const password = 'Mili-Config-2026!';
  const setup = await worker.fetch(
    jsonRequest('/api/v1/auth/setup', { method: 'POST', body: { password, confirmPassword: password } }),
    env,
    {}
  );
  const cookie = readSetCookie(setup);
  assert.equal(setup.status, 200);

  const anonymous = await worker.fetch(jsonRequest('/api/v1/sources'), env, {});
  assert.equal(anonymous.status, 401);

  const res = await worker.fetch(jsonRequest('/api/v1/sources', { cookie }), env, {});
  assert.equal(res.status, 200);
  const data = await body(res);
  assert.equal(data.ok, true);
  assert.ok(data.categories.length >= 8);
  assert.equal(data.catalog.length, SOURCE_CATALOG.length);
  assert.equal(data.auto.enabled, false);
  assert.equal(data.categories.find(category => category.id === 'cf-ip').appliesToYx, true);
  assert.equal(data.categories.find(category => category.id === 'socks5').appliesToYx, false);

  const saved = await worker.fetch(
    jsonRequest('/api/v1/sources/auto', { method: 'PUT', cookie, body: { enabled: true, intervalMinutes: 120, limit: 10, categories: ['cf-ip'] } }),
    env,
    {}
  );
  assert.equal(saved.status, 200);
  const savedData = await body(saved);
  assert.equal(savedData.auto.enabled, true);
  assert.equal(savedData.auto.intervalMinutes, 120);

  const reread = await body(await worker.fetch(jsonRequest('/api/v1/sources/auto', { cookie }), env, {}));
  assert.equal(reread.auto.enabled, true);

  // The Cron job follows the panel switch so scheduling and the panel agree.
  const jobs = await body(await worker.fetch(jsonRequest('/api/v1/automation', { cookie }), env, {}));
  const sourceJob = jobs.jobs.find(job => job.id === 'job-sources');
  assert.ok(sourceJob, 'the sources-sync job is seeded');
  assert.equal(sourceJob.enabled, true);
  assert.equal(sourceJob.intervalMinutes, 120);
});

test('every catalog entry is unique, addressable and uses https', () => {
  const ids = new Set();
  for (const entry of SOURCE_CATALOG) {
    assert.match(entry.id, /^[a-z0-9-]+$/);
    assert.equal(ids.has(entry.id), false, `duplicate id ${entry.id}`);
    ids.add(entry.id);
    assert.match(entry.url, /^https:\/\//, `${entry.id} must use https`);
    assert.ok(SOURCE_CATEGORIES.some(category => category.id === entry.category), `${entry.id} has a known category`);
    assert.ok(entry.label.length > 0);
  }
  assert.ok(SOURCE_CATALOG.length > 100, 'the catalog covers the full source list');
  for (const category of SOURCE_CATEGORIES) {
    assert.equal(SOURCE_COUNTS[category.id], getSourcesByCategory(category.id).length);
    assert.ok(SOURCE_COUNTS[category.id] > 0, `${category.id} has sources`);
  }
});

test('source selection resolves by id, category or the whole catalog', () => {
  const first = SOURCE_CATALOG[0];
  assert.deepEqual(resolveSourceEntries({ ids: [first.id] }).map(item => item.id), [first.id]);
  assert.ok(resolveSourceEntries({ categories: ['cf-ip'] }).every(item => item.category === 'cf-ip'));
  assert.equal(resolveSourceEntries({}).length, SOURCE_CATALOG.length);
  assert.equal(resolveSourceEntries({ ids: ['nope'], categories: ['nope'] }).length, 0);
});

test('address lines cover plain IPs, host:port, IPv6 and URLs', () => {
  const text = [
    '# comment',
    '104.16.0.1',
    '104.16.0.2:8443',
    '[2606:4700::6810:1]:443',
    '2606:4700::6811:1',
    'https://example.com/path',
    '1.1.1.1#remark',
    'junk-line',
    '104.16.0.1'
  ].join('\n');
  const parsed = parseAddressLines(text, { family: 'any', limit: 10 });
  assert.deepEqual(parsed.map(item => item.host), [
    '104.16.0.1',
    '104.16.0.2',
    '2606:4700::6810:1',
    '2606:4700::6811:1',
    'example.com',
    '1.1.1.1'
  ]);
  assert.equal(parsed[1].port, 8443);
  assert.equal(parsed[2].family, 'ipv6');
  assert.equal(parseAddressLines(text, { family: 'ipv4' }).every(item => item.family === 'ipv4'), true);
  assert.equal(parseAddressLines(text, { family: 'ipv6', limit: 1 }).length, 1);
  assert.equal(parseAddressLines('', {}).length, 0);
});

test('automatic sync config is clamped and only accepts known categories', () => {
  const auto = normalizeSourcesAuto({
    enabled: 'yes',
    intervalMinutes: '2',
    limit: 5000,
    family: 'nope',
    categories: ['cf-ip', 'unknown', 'cf-ip']
  });
  assert.equal(auto.enabled, true);
  assert.equal(auto.intervalMinutes, 15);
  assert.equal(auto.limit, 200);
  assert.equal(auto.family, 'any');
  assert.deepEqual(auto.categories, ['cf-ip']);

  const fallback = normalizeSourcesAuto({});
  assert.equal(fallback.enabled, false);
  assert.equal(fallback.replace, false);
  assert.deepEqual(fallback.categories, ['cf-ip']);
});

test('applying sources merges into yx without duplicating or clobbering', async () => {
  const env = { DB: createD1() };
  const candidates = [
    { host: '104.16.0.9', family: 'ipv4', sourceId: 'cf-ip-1' },
    { host: '2606:4700::6810:9', family: 'ipv6', sourceId: 'cf-ip-2' }
  ];
  const first = await applySourcesToPreferred(env, candidates, {});
  assert.equal(first.added.length, 2);
  assert.match(first.yx, /104\.16\.0\.9#CF-cf-ip-1/);
  assert.match(first.yx, /2606:4700::6810:9#CF6-cf-ip-2/);

  const second = await applySourcesToPreferred(env, candidates, {});
  assert.equal(second.added.length, 0, 'a repeated apply is a no-op');
  assert.equal(second.total, 2);

  const merged = await applySourcesToPreferred(env, [{ host: '172.64.0.9', family: 'ipv4', sourceId: 'cf-ip-3' }], {});
  assert.equal(merged.total, 3);

  const replaced = await applySourcesToPreferred(env, [{ host: '172.65.0.9', family: 'ipv4', sourceId: 'cf-ip-4' }], { replace: true });
  assert.equal(replaced.total, 1);

  const cfg = await loadGlobalConfig(env, true);
  assert.equal(String(cfg.yx), '172.65.0.9#CF-cf-ip-4');
});
