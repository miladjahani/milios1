// Guards the inline browser scripts that ship inside the rendered pages.
// A single unescaped quote in those strings turns the whole dashboard script
// into a SyntaxError, which leaves the panel stuck on "Loading…" with no
// server-side error to look at.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createD1 } from './helpers/d1-sqlite.js';
import { body, jsonRequest, loadWorker, readSetCookie } from './helpers/workerHarness.js';

const PASSWORD = 'Mili-Config-2026!';
const worker = await loadWorker();
const DB = createD1();
const env = { DB, MILI_ENCRYPTION_KEY: 'ui-scripts-test-key-0123456789' };

async function call(path, options = {}) {
  return worker.fetch(jsonRequest(path, options), env, {});
}

function inlineScripts(html) {
  return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
}

function assertCompiles(html, label) {
  const scripts = inlineScripts(html);
  assert.ok(scripts.length > 0, `${label} must ship inline scripts`);
  scripts.forEach((code, index) => {
    assert.doesNotThrow(
      () => new Function(code),
      `${label} inline script #${index + 1} must parse`
    );
  });
}

test('the gateway page ships parseable inline scripts', async () => {
  const res = await call('/');
  assert.equal(res.status, 200);
  assertCompiles(await res.text(), 'login page');
});

test('the dashboard page ships parseable inline scripts after sign-in', async () => {
  const setup = await call('/api/v1/auth/setup', {
    method: 'POST',
    body: { password: PASSWORD, confirmPassword: PASSWORD }
  });
  assert.equal(setup.status, 200);
  const cookie = readSetCookie(setup);

  const login = await call('/api/v1/auth/login', { method: 'POST', body: { password: PASSWORD } });
  assert.equal(login.status, 200);
  const session = readSetCookie(login) || cookie;

  const panel = await call('/admin', { cookie: session });
  assert.equal(panel.status, 200);
  const html = await panel.text();
  assert.match(html, /MiliconfigOS/);
  assertCompiles(html, 'dashboard page');

  // The dashboard must be able to fill its first view once the script runs.
  const overview = await call('/api/v1/admin/overview', { cookie: session });
  assert.equal(overview.status, 200);
  const data = await body(overview);
  assert.equal(data.ok, true);
});
