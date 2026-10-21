// ============================================================================
// miliconfigOS v4.0 - backwards-compatible test entry point
// The v3.1 script asserted a 3-user limit and the legacy /api/admin login flow.
// v4 enforces the documented 5-user limit and cookie sessions, so this file now
// delegates to the real node:test suite instead of duplicating stale assertions.
// ============================================================================

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

console.log('🧪 [miliconfig] اجرای مجموعه تست v4 (node:test) ...');
const result = spawnSync(
  process.execPath,
  ['--test', 'tests/*.test.js'],
  { cwd: projectRoot, stdio: 'inherit', shell: false }
);

process.exit(result.status === null ? 1 : result.status);
