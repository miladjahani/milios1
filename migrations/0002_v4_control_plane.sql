-- ============================================================================
-- miliconfigOS v4.0 - Migration 0002: control-plane tables
-- Safe to run repeatedly (every statement is IF NOT EXISTS). The Worker also
-- applies these statements at runtime, so a hand-run migration is optional but
-- recommended for CI/deploy visibility.
-- Apply with: wrangler d1 execute miliconfig-db --remote --file migrations/0002_v4_control_plane.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  ip TEXT DEFAULT '',
  revoked INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  ok INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip, created_at DESC);

CREATE TABLE IF NOT EXISTS endpoints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 443,
  family TEXT NOT NULL DEFAULT 'ipv4',
  kind TEXT NOT NULL DEFAULT 'cloudflare',
  country TEXT DEFAULT '',
  region TEXT DEFAULT '',
  provider TEXT DEFAULT '',
  protocol TEXT DEFAULT 'vless',
  transport TEXT DEFAULT 'ws',
  tls_mode TEXT DEFAULT 'tls',
  source TEXT DEFAULT 'manual',
  enabled INTEGER NOT NULL DEFAULT 1,
  health_score INTEGER NOT NULL DEFAULT 0,
  last_latency_ms INTEGER DEFAULT 0,
  last_check_at INTEGER DEFAULT 0,
  last_check_level TEXT DEFAULT '',
  failure_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_endpoints_enabled ON endpoints(enabled, health_score DESC);

CREATE TABLE IF NOT EXISTS endpoint_health (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint_id TEXT NOT NULL,
  level TEXT NOT NULL,
  ok INTEGER NOT NULL,
  latency_ms INTEGER DEFAULT 0,
  detail TEXT DEFAULT '',
  checked_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_endpoint_health ON endpoint_health(endpoint_id, checked_at DESC);

CREATE TABLE IF NOT EXISTS configurations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  protocol TEXT NOT NULL,
  endpoint_id TEXT DEFAULT '',
  transport TEXT NOT NULL,
  tls_mode TEXT NOT NULL,
  dns_profile TEXT DEFAULT '',
  chain_json TEXT DEFAULT '[]',
  client_format TEXT DEFAULT '',
  valid INTEGER NOT NULL DEFAULT 0,
  validation_json TEXT DEFAULT '{}',
  reason TEXT DEFAULT '',
  score INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_configurations_user ON configurations(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  formats TEXT NOT NULL DEFAULT 'singbox,clash,uri',
  revoked INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  last_access_at INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  rotated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS usage_daily (
  user_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  bytes INTEGER NOT NULL DEFAULT 0,
  requests INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'worker-stream',
  PRIMARY KEY (user_id, day_key, source)
);

CREATE TABLE IF NOT EXISTS automation_jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  interval_minutes INTEGER NOT NULL DEFAULT 60,
  last_run_at INTEGER DEFAULT 0,
  next_run_at INTEGER DEFAULT 0,
  last_status TEXT DEFAULT '',
  last_error TEXT DEFAULT '',
  run_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  status TEXT NOT NULL,
  detail TEXT DEFAULT '',
  started_at INTEGER NOT NULL,
  finished_at INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_automation_runs ON automation_runs(job_id, started_at DESC);

CREATE TABLE IF NOT EXISTS cloudflare_resources (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  account_id TEXT DEFAULT '',
  zone_id TEXT DEFAULT '',
  name TEXT DEFAULT '',
  status TEXT DEFAULT '',
  detail TEXT DEFAULT '',
  checked_at INTEGER DEFAULT 0
);
