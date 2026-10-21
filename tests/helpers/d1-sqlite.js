// Test helper: re-export the shared SQLite-backed D1 adapter so tests and the
// local dev server exercise exactly the same storage implementation.
export { SqliteD1, createD1 } from '../../scripts/lib/sqlite-d1.js';
