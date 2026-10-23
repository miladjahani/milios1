// ============================================================================
// miliconfigOS v4.0 - built-bundle verification
// Fails the build when the obfuscated artifact cannot run on Cloudflare Workers:
//   - forbidden dynamic code / Node-only APIs (eval, new Function, Buffer, ...)
//   - syntax errors
//   - a cold start that cannot serve the gateway or the bootstrap flow
// This is the guard against an obfuscation change shipping a bundle that only
// fails in production (the origin of Cloudflare Worker error 1101).
// Usage: npm run verify:build
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE_PATH = path.join(ROOT_DIR, 'dist', '_worker.js');

const failures = [];
const checks = [];

function check(name, condition, detail = '') {
  checks.push(`${condition ? 'ok  ' : 'FAIL'} ${name}${condition || !detail ? '' : ` :: ${detail}`}`);
  if (!condition) failures.push(name);
}

function main() {
  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error('❌ dist/_worker.js is missing. Run `npm run build` first.');
    process.exit(1);
  }

  const source = fs.readFileSync(BUNDLE_PATH, 'utf8');
  check('bundle exists', source.length > 1000, `${source.length} bytes`);
  check('bundle size under Workers limit', source.length < 10 * 1024 * 1024, `${(source.length / 1024).toFixed(0)} KB`);

  // Cloudflare disallows dynamic code generation and does not provide Node
  // globals unless a compatibility flag is configured. These strings would all
  // throw at startup or on the first request.
  const forbidden = [
    [/\bnew\s+Function\s*\(/, 'new Function()'],
    [/\beval\s*\(/, 'eval()'],
    [/\brequire\s*\(\s*['"]/, "require('...')"],
    [/\bprocess\.env\b/, 'process.env'],
    [/\bBuffer\.(from|alloc|concat)\b/, 'Buffer.*'],
    [/\b__dirname\b/, '__dirname'],
    [/\bmodule\.exports\b/, 'module.exports']
  ];
  for (const [pattern, label] of forbidden) {
    check(`no ${label}`, !pattern.test(source));
  }
  // A checksum loop in the global scope burns the 1s startup CPU budget.
  check('no string-array rotation loop', !/while\s*\(\s*!!\[\]\s*\)/.test(source));

  const parsed = spawnSync(process.execPath, ['--check', BUNDLE_PATH], { encoding: 'utf8' });
  check('bundle parses as an ES module', parsed.status === 0, (parsed.stderr || '').trim().slice(0, 400));

  return source;
}

async function boot() {
  register(pathToFileURL(path.join(ROOT_DIR, 'tests/helpers/sockets-hook.mjs')));
  const started = Date.now();
  const worker = (await import(`${pathToFileURL(BUNDLE_PATH).href}?verify=${Date.now()}`)).default;
  const startupMs = Date.now() - started;
  check('cold start under 1s', startupMs < 1000, `${startupMs} ms`);
  check('default export has fetch', typeof worker?.fetch === 'function');

  const origin = 'https://verify.miliconfig.test';
  // Deliberately memory-backed: the point is to execute the obfuscated code,
  // not to test D1 (the integration suite owns that).
  const env = { MILI_ALLOW_MEMORY: '1' };
  async function call(route, options = {}) {
    const headers = { Origin: origin, 'Sec-Fetch-Site': 'same-origin' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.cookie) headers.Cookie = options.cookie;
    const response = await worker.fetch(new Request(origin + route, {
      method: options.method || 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }), env, {});
    return response;
  }

  const health = await call('/api/v1/health');
  const healthBody = await health.text();
  check('health responds', health.status === 200, `${health.status} ${healthBody.slice(0, 160)}`);

  const page = await call('/');
  const pageHtml = await page.text();
  check('gateway page renders', page.status === 200 && pageHtml.includes('MiliconfigOS'), `${page.status} ${pageHtml.length}B`);

  const password = 'Verify-Build-2026!';
  const setup = await call('/api/v1/auth/setup', { method: 'POST', body: { password, confirmPassword: password } });
  check('first-run setup works', setup.status === 200, `${setup.status} ${(await setup.text()).slice(0, 160)}`);

  const login = await call('/api/v1/auth/login', { method: 'POST', body: { password } });
  const loginBody = await login.text();
  const cookie = (login.headers.get('Set-Cookie') || '').split(';')[0];
  check('login returns a session', login.status === 200 && cookie.includes('mili_'), `${login.status} ${loginBody.slice(0, 160)}`);

  const bootstrap = await call('/api/v1/bootstrap', { cookie });
  check('bootstrap responds', bootstrap.status === 200, `${bootstrap.status}`);

  const overview = await call('/api/v1/admin/overview', { cookie });
  check('dashboard overview responds', overview.status === 200, `${overview.status}`);

  const adminPath = pageHtml.match(/["']([0-9a-f-]{36})["']/i);
  if (adminPath) {
    const dashboard = await call(`/${adminPath[1]}`, { cookie });
    check('admin panel renders', dashboard.status === 200, `${dashboard.status}`);
  }

  console.log(checks.join('\n'));
  if (failures.length) {
    console.error(`\n❌ verify-build failed: ${failures.join(', ')}`);
    process.exit(1);
  }
  console.log(`\n✅ verify-build passed (${(fs.statSync(BUNDLE_PATH).size / 1024).toFixed(0)} KB bundle).`);
}

try {
  main();
  await boot();
} catch (err) {
  console.error('❌ verify-build crashed:', err);
  process.exit(1);
}
