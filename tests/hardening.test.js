// Regression tests for the hardening added around Cloudflare Worker error
// 1101: malformed URLs/cookies must not crash a request, a request that never
// settles must answer instead of hanging, and WebSocket callbacks may never
// throw into the runtime after the stream is closed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isDatabaseQuotaError, safeDecodeURI } from '../src/core/utils.js';
import { createD1 } from './helpers/d1-sqlite.js';
import { jsonRequest, loadWorker } from './helpers/workerHarness.js';

const worker = await loadWorker();

test('safeDecodeURI never throws on malformed escapes', () => {
  assert.equal(safeDecodeURI('%E0%A4%A'), '%E0%A4%A');
  assert.equal(safeDecodeURI('user-%2Fsub'), 'user-/sub');
  assert.equal(safeDecodeURI(''), '');
  assert.equal(safeDecodeURI(undefined), '');
});

test('D1 quota failures are classified, ordinary errors are not', () => {
  assert.equal(isDatabaseQuotaError(new Error('D1_ERROR: Exceeded daily row read limit')), true);
  assert.equal(isDatabaseQuotaError({ code: 'D1_ERROR', message: 'database is locked' }), false);
  assert.equal(isDatabaseQuotaError(new Error('fetch failed')), false);
  assert.equal(isDatabaseQuotaError(null), false);
});

test('a malformed subscription token answers instead of throwing', async () => {
  const env = { DB: createD1(), MILI_ALLOW_MEMORY: '1' };
  const res = await worker.fetch(jsonRequest('/s/%E0%A4%A'), env, {});
  assert.notEqual(res.status, 500);
  assert.equal(res.status, 403);
});

test('the service worker endpoint retires old registrations', async () => {
  const env = { DB: createD1(), MILI_ALLOW_MEMORY: '1' };
  const res = await worker.fetch(jsonRequest('/sw.js'), env, {});
  assert.equal(res.status, 200);
  assert.match(res.headers.get('Content-Type') || '', /javascript/);
  const script = await res.text();
  assert.match(script, /unregister/);
  assert.doesNotThrow(() => new Function(script));
});

test('a malformed session cookie is treated as signed out', async () => {
  const env = { DB: createD1(), MILI_ALLOW_MEMORY: '1' };
  const res = await worker.fetch(jsonRequest('/', { cookie: 'mili_session=%E0%A4%A' }), env, {});
  assert.equal(res.status, 200);
  assert.match(await res.text(), /MiliconfigOS/);
});

test('a stalled database call is cut off with a readable 503', async () => {
  const hanging = {
    prepare() {
      return { bind() { return this; }, run() { return new Promise(() => {}); }, first() { return new Promise(() => {}); }, all() { return new Promise(() => {}); } };
    }
  };
  const env = { DB: hanging, MILI_REQUEST_DEADLINE_MS: '1000' };
  const started = Date.now();
  const res = await worker.fetch(jsonRequest('/api/v1/health'), env, {});
  const elapsed = Date.now() - started;
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.error.code, 'REQUEST_TIMEOUT');
  assert.ok(elapsed >= 900 && elapsed < 10000, `deadline should fire around 1s, took ${elapsed}ms`);
});

test('WebSocket messages after the stream closes are dropped, not thrown', async () => {
  const { makeWebSocketReadableStream } = await import('../src/core/runtime.js');
  const listeners = new Map();
  const ws = {
    readyState: 1,
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    close() {},
    emit(type, event) {
      for (const fn of listeners.get(type) || []) fn(event);
    }
  };
  const stream = makeWebSocketReadableStream(ws, '');
  const reader = stream.getReader();
  ws.emit('message', { data: new Uint8Array([7, 8]).buffer });
  const first = await reader.read();
  assert.deepEqual([...first.value], [7, 8]);

  // Server closes: the controller is closed. A late frame used to throw
  // "Invalid state: Controller is already closed" inside the event listener.
  ws.emit('close');
  assert.equal((await reader.read()).done, true);
  assert.doesNotThrow(() => ws.emit('message', { data: new Uint8Array([9]).buffer }));
  assert.doesNotThrow(() => ws.emit('error', new Error('late')));
});
