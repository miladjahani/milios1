// ============================================================================
// miliconfigOS v4.0 - D1-compatible adapter backed by Node's built-in SQLite
// Implements exactly the subset the Worker uses: prepare().bind().run()/.first()
// /.all(), plus exec() and batch(). SQL therefore runs for real, so schema DDL,
// constraints and migrations are genuinely exercised locally and in tests.
// ============================================================================

import { DatabaseSync } from 'node:sqlite';

function normalizeValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'bigint') return Number(value);
  return value;
}

class Statement {
  constructor(database, sql, params = []) {
    this.database = database;
    this.sql = sql;
    this.params = params;
  }

  bind(...params) {
    return new Statement(this.database, this.sql, params.map(normalizeValue));
  }

  _statement() {
    return this.database.prepare(this.sql);
  }

  async run() {
    const stmt = this._statement();
    const info = stmt.run(...this.params);
    return {
      success: true,
      meta: {
        changes: Number(info.changes || 0),
        last_row_id: Number(info.lastInsertRowid || 0)
      }
    };
  }

  async first(column) {
    const stmt = this._statement();
    const row = stmt.get(...this.params);
    if (!row) return null;
    return column ? row[column] : row;
  }

  async all() {
    const stmt = this._statement();
    return { success: true, results: stmt.all(...this.params) };
  }

  async raw() {
    const stmt = this._statement();
    const rows = stmt.all(...this.params);
    return rows.map(row => Object.values(row));
  }
}

export class SqliteD1 {
  /** @param {string} [filename] path to a persistent database, defaults to in-memory */
  constructor(filename = ':memory:') {
    this.filename = filename;
    this.db = new DatabaseSync(filename);
    this.db.exec('PRAGMA foreign_keys = ON');
    this.db.exec('PRAGMA journal_mode = WAL');
  }

  prepare(sql) {
    return new Statement(this.db, sql);
  }

  async exec(sql) {
    this.db.exec(sql);
    return { count: 1, duration: 0 };
  }

  async batch(statements) {
    return Promise.all(statements.map(statement => (statement.all ? statement.all() : statement.run())));
  }

  async dump() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

export function createD1(filename) {
  return new SqliteD1(filename);
}
