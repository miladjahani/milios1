// ============================================================================
// miliconfigOS v4.0 - Cloudflare Pages (pages.dev) deployer
//
// One command provisions and deploys the control plane to Cloudflare Pages:
//   • verifies the API token and resolves the account
//   • finds or creates the D1 database, applies schema.sql remotely
//   • finds or creates the Pages project and binds D1 (production + preview)
//   • stores MILI_ENCRYPTION_KEY as a Pages secret (generated once if absent)
//   • builds dist/_worker.js and uploads it with wrangler
//
// Usage:
//   CLOUDFLARE_API_TOKEN=... node scripts/deploy-pages.js
//   ... --create-db              create the D1 database when it does not exist
//   ... --project my-panel       Pages project name (default: miliconfig)
//   ... --skip-build             reuse the existing dist/ directory
//   ... --check                  offline preflight only, never touches Cloudflare
//
// Environment: CLOUDFLARE_API_TOKEN (required to deploy),
//              CLOUDFLARE_ACCOUNT_ID (optional when the token sees one account),
//              D1_DATABASE_ID (optional if --create-db or the name already exists),
//              D1_DATABASE_NAME (default miliconfig-db),
//              MILI_ENCRYPTION_KEY (optional; generated and stored when absent).
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_BASE = 'https://api.cloudflare.com/client/v4';
const PROJECT_DEFAULT = 'miliconfig';
const DB_NAME_DEFAULT = 'miliconfig-db';

const args = process.argv.slice(2);
const flag = name => args.includes(name);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const CHECK_ONLY = flag('--check');
const CREATE_DB = flag('--create-db');
const SKIP_BUILD = flag('--skip-build');
let PROJECT = option('--project', process.env.PAGES_PROJECT || PROJECT_DEFAULT);
const DB_NAME = option('--db-name', process.env.D1_DATABASE_NAME || DB_NAME_DEFAULT);
const TOKEN = String(process.env.CLOUDFLARE_API_TOKEN || '').trim();
const ACCOUNT_ENV = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
const DB_ID_ENV = String(process.env.D1_DATABASE_ID || '').trim();

function log(step, message) {
  console.log(`${step} ${message}`);
}

function fail(message, hint = '') {
  console.error(`\n✗ ${message}`);
  if (hint) console.error(`  ${hint}`);
  process.exit(1);
}

function wranglerBin() {
  const candidates = process.platform === 'win32'
    ? ['wrangler.cmd', 'wrangler.exe']
    : ['wrangler'];
  for (const name of candidates) {
    const candidate = path.join(ROOT_DIR, 'node_modules', '.bin', name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function runWrangler(wrArgs, { input, timeout = 180000, allowFailure = false } = {}) {
  const bin = wranglerBin();
  if (!bin) {
    fail('wrangler is not installed.', 'Run `npm install` (wrangler is a devDependency).');
  }
  const env = {
    ...process.env,
    CLOUDFLARE_API_TOKEN: TOKEN || process.env.CLOUDFLARE_API_TOKEN,
    ...(ACCOUNT_ENV || accountId ? { CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ENV || accountId } : {})
  };
  const result = spawnSync(bin, wrArgs, {
    cwd: ROOT_DIR,
    env,
    input,
    encoding: 'utf8',
    timeout
  });
  if (result.error) fail(`wrangler failed to start: ${result.error.message}`);
  if (result.status !== 0) {
    if (allowFailure) return null;
    const detail = `${result.stdout || ''}\n${result.stderr || ''}`.trim().split('\n').slice(-12).join('\n');
    fail(`wrangler ${wrArgs.slice(0, 2).join(' ')} failed (exit ${result.status}).`, detail);
  }
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

let accountId = '';
let projectSubdomain = '';

async function api(method, endpoint, body) {
  const headers = { Authorization: `Bearer ${TOKEN}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch (_e) {
    payload = null;
  }
  if (!response.ok || !payload?.success) {
    const detail = payload?.errors?.map(item => `${item.code}: ${item.message}`).join('; ') || `HTTP ${response.status}`;
    const err = new Error(detail);
    err.status = response.status;
    err.payload = payload;
    throw err;
  }
  return payload.result;
}

function buildBundle() {
  log('▸', 'Building dist/_worker.js ...');
  const result = spawnSync(process.execPath, [path.join(ROOT_DIR, 'scripts', 'build.js')], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    timeout: 240000
  });
  if (result.status !== 0) {
    fail('Build failed.', `${result.stdout || ''}\n${result.stderr || ''}`.trim().split('\n').slice(-10).join('\n'));
  }
  log('✓', 'Bundle built.');
}

function preflight() {
  const problems = [];
  const warnings = [];

  const major = Number(process.versions.node.split('.')[0]);
  if (major < 22) problems.push(`Node 22.5+ required (running ${process.versions.node}).`);

  if (!fs.existsSync(path.join(ROOT_DIR, 'schema.sql'))) problems.push('schema.sql is missing.');
  if (!fs.existsSync(path.join(ROOT_DIR, 'migrations', '0002_v4_control_plane.sql'))) {
    problems.push('migrations/0002_v4_control_plane.sql is missing.');
  }

  const workerFile = path.join(ROOT_DIR, 'dist', '_worker.js');
  if (!fs.existsSync(workerFile)) {
    if (CHECK_ONLY) warnings.push('dist/_worker.js not built yet; the deploy run will build it.');
    else if (SKIP_BUILD) problems.push('dist/_worker.js is missing but --skip-build was passed.');
    else buildBundle();
  } else if (fs.statSync(workerFile).size < 1000) {
    problems.push('dist/_worker.js is suspiciously small; rebuild it.');
  }

  if (!wranglerBin()) problems.push('wrangler is not installed. Run `npm install`.');
  if (!TOKEN) warnings.push('CLOUDFLARE_API_TOKEN is not set (required for a real deploy).');
  if (!DB_ID_ENV && !CREATE_DB) warnings.push('D1_DATABASE_ID is not set; pass --create-db to create the database.');

  return { problems, warnings };
}

async function verifyToken() {
  log('▸', 'Verifying Cloudflare API token ...');
  try {
    const result = await api('GET', '/user/tokens/verify');
    if (result && result.status === 'active') {
      log('✓', 'Token verified.');
      return;
    }
  } catch (_e) {
    // Account-owned tokens are not allowed to call the user-level endpoint.
    // Account access is verified separately once the account id is known.
  }
  log('!', 'Account-scoped token: user-level verification unavailable, checking account access instead.');
}

async function verifyAccountAccess() {
  log('▸', 'Checking D1 and Pages permissions ...');
  try {
    await api('GET', `/accounts/${accountId}/d1/database`);
  } catch (err) {
    fail('The token cannot read D1 databases on this account.', `Required: Account → D1 → Edit. (${err.message})`);
  }
  try {
    await api('GET', `/accounts/${accountId}/pages/projects?per_page=1`);
  } catch (err) {
    fail('The token cannot read Cloudflare Pages projects on this account.', `Required: Account → Cloudflare Pages → Edit. (${err.message})`);
  }
  log('✓', 'Account permissions look correct.');
}

async function resolveAccount() {
  if (ACCOUNT_ENV) {
    accountId = ACCOUNT_ENV;
    log('✓', `Using account from CLOUDFLARE_ACCOUNT_ID (${accountId}).`);
    return;
  }
  const accounts = await api('GET', '/accounts');
  if (!Array.isArray(accounts) || accounts.length === 0) {
    fail('The token cannot see any Cloudflare account.', 'Grant Account → Account Settings → Read, or set CLOUDFLARE_ACCOUNT_ID.');
  }
  if (accounts.length > 1) {
    const list = accounts.map(item => `${item.name} (${item.id})`).join(', ');
    fail('Multiple accounts are visible to this token.', `Set CLOUDFLARE_ACCOUNT_ID to one of: ${list}`);
  }
  accountId = accounts[0].id;
  log('✓', `Account resolved: ${accounts[0].name} (${accountId}).`);
}

async function resolveDatabase() {
  if (DB_ID_ENV) {
    log('✓', `Using D1 database id from D1_DATABASE_ID (${DB_ID_ENV}).`);
    return { id: DB_ID_ENV, name: DB_NAME };
  }

  const databases = await api('GET', `/accounts/${accountId}/d1/database`);
  const existing = (databases || []).find(item => item.name === DB_NAME);
  if (existing) {
    log('✓', `Found D1 database "${DB_NAME}" (${existing.uuid}).`);
    return { id: existing.uuid, name: existing.name };
  }

  if (!CREATE_DB) {
    fail(`D1 database "${DB_NAME}" does not exist.`, 'Re-run with --create-db, or set D1_DATABASE_ID.');
  }

  log('▸', `Creating D1 database "${DB_NAME}" ...`);
  const created = await api('POST', `/accounts/${accountId}/d1/database`, { name: DB_NAME });
  log('✓', `D1 database created (${created.uuid}).`);
  return { id: created.uuid, name: created.name || DB_NAME };
}

async function applySchema(db) {
  log('▸', 'Applying schema.sql to the remote D1 database (idempotent) ...');
  // The repository's wrangler.toml intentionally contains a placeholder D1 id.
  // Use a minimal config without bindings so wrangler resolves the database by
  // name through the API instead of trying the placeholder binding.
  const configPath = path.join(ROOT_DIR, '.wrangler', 'pages-deploy-d1.toml');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, 'name = "miliconfig-deploy"\ncompatibility_date = "2024-11-06"\n', 'utf8');
  runWrangler(
    ['d1', 'execute', db.name, '--remote', '--file', 'schema.sql', '--yes', '-c', configPath],
    { timeout: 240000 }
  );
  log('✓', 'Schema applied.');
}

async function ensureProject() {
  try {
    const project = await api('GET', `/accounts/${accountId}/pages/projects/${PROJECT}`);
    projectSubdomain = project?.subdomain || '';
    log('✓', `Pages project "${PROJECT}" already exists (${projectSubdomain || PROJECT + '.pages.dev'}).`);
    return project;
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  log('▸', `Creating Pages project "${PROJECT}" ...`);
  try {
    const project = await api('POST', `/accounts/${accountId}/pages/projects`, {
      name: PROJECT,
      production_branch: 'main'
    });
    projectSubdomain = project?.subdomain || '';
    log('✓', `Pages project created (${projectSubdomain || PROJECT + '.pages.dev'}).`);
    return project;
  } catch (err) {
    // pages.dev subdomains are global; fall back to a unique project name.
    const fallback = `${PROJECT}-${crypto.randomBytes(3).toString('hex')}`;
    console.log(`! ${PROJECT}.pages.dev is unavailable (${err.message}); retrying as ${fallback}.`);
    const project = await api('POST', `/accounts/${accountId}/pages/projects`, {
      name: fallback,
      production_branch: 'main'
    });
    PROJECT = fallback;
    projectSubdomain = project?.subdomain || '';
    log('✓', `Pages project created (${projectSubdomain || PROJECT + '.pages.dev'}).`);
    return project;
  }
}

async function bindDatabase(db) {
  log('▸', 'Binding D1 as DB for production and preview deployments ...');
  const bindings = { d1_databases: { DB: { id: db.id } } };
  await api('PATCH', `/accounts/${accountId}/pages/projects/${PROJECT}`, {
    deployment_configs: {
      production: bindings,
      preview: bindings
    }
  });
  log('✓', 'D1 binding set.');
}

function existingSecretNames() {
  const output = runWrangler(['pages', 'secret', 'list', '--project-name', PROJECT], {
    timeout: 90000,
    allowFailure: true
  });
  return output || '';
}

function ensureEncryptionSecret() {
  const listed = existingSecretNames();
  if (/MILI_ENCRYPTION_KEY/.test(listed)) {
    log('✓', 'MILI_ENCRYPTION_KEY already stored on the Pages project.');
    return;
  }
  const key = String(process.env.MILI_ENCRYPTION_KEY || '').trim() || crypto.randomBytes(32).toString('base64url');
  log('▸', 'Storing MILI_ENCRYPTION_KEY as a Pages secret ...');
  runWrangler(['pages', 'secret', 'put', 'MILI_ENCRYPTION_KEY', '--project-name', PROJECT], {
    input: `${key}\n`,
    timeout: 90000
  });
  log('✓', process.env.MILI_ENCRYPTION_KEY
    ? 'MILI_ENCRYPTION_KEY stored from the environment.'
    : 'A new MILI_ENCRYPTION_KEY was generated and stored (the value is not printed).');
}

function deploy() {
  log('▸', `Uploading dist/ to Pages project "${PROJECT}" ...`);
  const output = runWrangler([
    'pages', 'deploy', 'dist',
    '--project-name', PROJECT,
    '--branch', 'main',
    '--commit-dirty=true'
  ], { timeout: 300000 });

  const urls = [...new Set((output.match(/https:\/\/[a-z0-9-]+\.pages\.dev/gi) || []))];
  const productionUrl = `https://${projectSubdomain || PROJECT + '.pages.dev'}`;
  log('✓', 'Deployment uploaded.');
  if (urls.length) {
    for (const url of urls) console.log(`    ${url}`);
  }
  console.log(`\nProduction URL: ${productionUrl}`);
  console.log('Next: open it, complete first-run setup, then sign in at /admin.');
  console.log(`D1 dashboard: https://dash.cloudflare.com/${accountId}/workers/d1/databases`);
  console.log(`Pages dashboard: https://dash.cloudflare.com/${accountId}/pages/view/${PROJECT}`);
}

async function main() {
  console.log('miliconfigOS → Cloudflare Pages deployer');
  console.log(`  project: ${PROJECT}`);
  console.log(`  database: ${DB_NAME}`);
  console.log(`  mode: ${CHECK_ONLY ? 'preflight only' : 'deploy'}\n`);

  const { problems, warnings } = preflight();
  for (const warning of warnings) console.log(`! ${warning}`);
  if (problems.length) {
    for (const problem of problems) console.error(`✗ ${problem}`);
    process.exit(1);
  }

  if (CHECK_ONLY) {
    console.log('\n✓ Preflight passed. Nothing was sent to Cloudflare.');
    console.log('  Deploy with: CLOUDFLARE_API_TOKEN=... node scripts/deploy-pages.js [--create-db]');
    return;
  }

  if (!TOKEN) {
    fail(
      'CLOUDFLARE_API_TOKEN is required for a Pages deployment.',
      'Create a scoped token (Account → Cloudflare Pages → Edit, Account → D1 → Edit, User → User Details → Read) and export it.'
    );
  }

  await verifyToken();
  await resolveAccount();
  await verifyAccountAccess();
  const db = await resolveDatabase();

  if (!SKIP_BUILD) buildBundle();

  await ensureProject();
  await bindDatabase(db);
  await applySchema(db);
  ensureEncryptionSecret();
  deploy();
}

main().catch(err => {
  fail(err?.message || String(err), err?.payload ? JSON.stringify(err.payload.errors || err.payload) : '');
});
