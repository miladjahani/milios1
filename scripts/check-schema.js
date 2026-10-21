// ============================================================================
// miliconfigOS v4.0 - schema & migration validation
// Applies schema.sql and every migrations/*.sql file to a throwaway SQLite
// database and asserts the tables the Worker depends on actually exist.
// Exits non-zero on any SQL error, so CI catches broken migrations.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createD1 } from './lib/sqlite-d1.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED_TABLES = [
  'admin_sessions',
  'audit_logs',
  'automation_jobs',
  'automation_runs',
  'cloudflare_resources',
  'configurations',
  'endpoint_health',
  'endpoints',
  'login_attempts',
  'schema_meta',
  'subscriptions',
  'system_config',
  'usage_daily',
  'users'
];

const REQUIRED_USER_COLUMNS = [
  'id',
  'username',
  'uuid',
  'used_bytes',
  'data_limit_gb',
  'expire_at',
  'config_json'
];

async function main() {
  const db = createD1(':memory:');
  const files = ['schema.sql', ...fs.readdirSync(path.join(ROOT_DIR, 'migrations')).filter(f => f.endsWith('.sql')).sort().map(f => path.join('migrations', f))];

  for (const relative of files) {
    const sql = fs.readFileSync(path.join(ROOT_DIR, relative), 'utf8');
    await db.exec(sql);
    console.log(`✓ applied ${relative}`);
  }

  const tables = (await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results.map(row => row.name);
  const missingTables = REQUIRED_TABLES.filter(name => !tables.includes(name));
  if (missingTables.length) {
    throw new Error(`missing tables after migrations: ${missingTables.join(', ')}`);
  }

  const columns = (await db.prepare('PRAGMA table_info(users)').all()).results.map(row => row.name);
  const missingColumns = REQUIRED_USER_COLUMNS.filter(name => !columns.includes(name));
  if (missingColumns.length) {
    throw new Error(`users table is missing columns: ${missingColumns.join(', ')}`);
  }

  console.log(`✓ schema OK: ${tables.length} tables, ${columns.length} user columns`);
}

main().catch(err => {
  console.error(`✗ schema check failed: ${err.message}`);
  process.exit(1);
});
