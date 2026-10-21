# Deployment guide

Two supported targets: **Cloudflare Workers** (recommended, supports the Cron Trigger) and
**Cloudflare Pages** (static assets + `_worker.js`, no cron). Both use D1.

## 1. Prerequisites

- A Cloudflare account with Workers, D1 and (for Pages) Pages enabled.
- Node.js 22.5+ locally for tests and the build.
- Wrangler 3+: `npm i -g wrangler` (or `npx wrangler`).
- This repository checked out locally.

## 2. Create the database

```bash
wrangler login
wrangler d1 create miliconfig-db
```

Copy the printed `database_id` into **both** `wrangler.toml` and, if you deploy Pages,
`wrangler.pages.toml`, replacing `REPLACE-WITH-YOUR-D1-DATABASE-UUID`.

Apply the schema (safe to run again — statements are `IF NOT EXISTS`):

```bash
wrangler d1 execute miliconfig-db --remote --file schema.sql
# or, statement by statement:
wrangler d1 execute miliconfig-db --remote --file migrations/0001_init_miliconfig.sql
wrangler d1 execute miliconfig-db --remote --file migrations/0002_v4_control_plane.sql
```

The Worker also applies the DDL on first request, so a missed manual step does not break the app; it
just delays table creation to the first request.

## 3. Secrets

```bash
wrangler secret put MILI_ENCRYPTION_KEY
```

Enter 32+ random characters. Without it the panel runs, but a stored Cloudflare token is only
base64-encoded; the Cloudflare page shows `storage: base64-only` and a warning.

Do **not** put a Cloudflare API token, administrator password or any credential in `wrangler.toml`,
`[vars]` or the repository. The administrator password is chosen on first visit; the Cloudflare token
is entered in the panel.

## 4. Deploy the Worker

```bash
npm install
npm test                 # 64 tests must pass
npm run check:schema     # schema + migrations validate
npm run build            # dist/_worker.js, public/_worker.js, _worker.js
wrangler deploy
```

`wrangler.toml` deploys `src/index.js` directly (no build step required on Cloudflare) and enables
observability plus the cron trigger:

```toml
[triggers]
crons = ["*/15 * * * *"]
```

Remove that block if you only want manual automation runs.

## 5. Deploy to Cloudflare Pages (pages.dev)

Pages runs the same Worker as a single `dist/_worker.js` advanced-mode function. The repository
ships a deployer that provisions everything instead of asking you to click through dashboards.

### One command

```bash
# Cloudflare API token: Account → Cloudflare Pages → Edit, Account → D1 → Edit,
# User → User Details → Read (or Account → Account Settings → Read)
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...        # optional when the token sees one account

npm run deploy:pages -- --create-db    # creates D1 if missing, then deploys
```

The deployer (`scripts/deploy-pages.js`) performs, in order:

1. validates the token (`/user/tokens/verify`) and resolves the account;
2. finds the D1 database `miliconfig-db` (or creates it with `--create-db`);
3. builds `dist/_worker.js` unless `--skip-build` is passed;
4. creates the Pages project `miliconfig` when it does not exist;
5. binds D1 as `DB` for **production and preview** deployments via the Pages API;
6. applies `schema.sql` to the remote D1 database (idempotent);
7. stores `MILI_ENCRYPTION_KEY` as a Pages secret — from your environment when provided,
   otherwise a random key is generated once and never printed;
8. uploads `dist/` with `wrangler pages deploy` and prints the real `*.pages.dev` URLs.

If the requested subdomain is already taken by any Cloudflare account, Pages assigns a suffix
(for example `miliconfig-77w.pages.dev`). The deployer reads the project's actual `subdomain` from
the API and prints that URL — never assume `<project>.pages.dev`.

Options:

| Flag / env | Effect |
| --- | --- |
| `--create-db` | Create the D1 database when it does not exist. |
| `--project <name>` / `PAGES_PROJECT` | Pages project name (default `miliconfig`). |
| `--db-name <name>` / `D1_DATABASE_NAME` | D1 database name (default `miliconfig-db`). |
| `D1_DATABASE_ID` | Use an existing D1 database instead of looking it up. |
| `MILI_ENCRYPTION_KEY` | Use this key instead of generating one. |
| `--skip-build` | Upload the existing `dist/` directory. |
| `--check` | Offline preflight only; no network calls, no changes. |

`npm run deploy:pages:check` runs the preflight and is part of CI.

### Deploy from GitHub Actions

`.github/workflows/pages.yml` deploys on a `v*` tag or manual dispatch. Add these repository
secrets/variables:

- secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, optionally `D1_DATABASE_ID`
- variables: `PAGES_PROJECT`, `D1_DATABASE_NAME` (optional)

For the first run, choose **Run workflow → create_database = true** if the database does not exist
yet; later runs reuse it.

### Manual alternative

```bash
npm run build
npx wrangler pages deploy dist --project-name miliconfig
```

Then bind D1 under **Settings → Functions → D1 database bindings** as `DB`, and set
`MILI_ENCRYPTION_KEY` with `npx wrangler pages secret put MILI_ENCRYPTION_KEY --project-name miliconfig`.

Pages notes:

- The build output directory must be `dist` and must contain `_worker.js`.
- Cron Triggers are not available on Pages. Automation jobs can still be run from the panel
  (Automation → Run) or through `POST /api/v1/automation/:id/run`; the Worker variant supports the
  scheduled trigger.
- Preview deployments inherit the same `DB` binding but share the production database unless you
  create a separate D1 database for previews.

## 6. First-run setup

1. Open the deployment URL. The login gateway loads the configured homepage (default
   `https://nginx.com`) and then presents the setup dialog.
2. Choose an administrator password: at least 10 characters, two character classes, not a common
   password.
3. The account is created once; the panel opens at `/admin` (or the generated UUID path).
4. Sign in. A second setup attempt returns `403 SETUP_COMPLETE`.

If the screen reports `DATABASE_UNAVAILABLE`, the D1 binding is missing or misnamed — fix the binding
instead of enabling the memory fallback in production.

## 7. Post-deploy checks

```bash
curl -s https://<your-host>/api/v1/health
# {"ok":true,"version":"v4.0","storage":"d1","initialized":true}

curl -s -o /dev/null -w '%{http_code}\n' https://<your-host>/admin   # 200 (login gateway)
```

In the panel:

1. **Dashboard** — verify storage is `d1`, capacity shows `x / 5`, and endpoint counts look right.
2. **Node catalog** — add an endpoint you control, run *Check*, read the per-level result.
3. **Users** — create a user, generate configurations, open the subscription URL.
4. **Settings** — save a change, reload, confirm it persisted.
5. **Security** — confirm the audit log records your actions.

## 8. CI/CD

- `.github/workflows/ci.yml` — tests, schema validation, build and bundle syntax check on every push.
- `.github/workflows/deploy.yml` — manual or tag-triggered deploy. Requires repository secrets
  `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; it skips with a notice when they are absent.
  Replace the placeholder `database_id` first.
- `.github/workflows/obfuscate.yml` — manual rebuild of the committed `_worker.js` artifacts.

Suggested token scopes: *Account → Workers Scripts → Edit*, *Account → D1 → Edit*, *User → User
Details → Read*. Do not use a Global API Key.

## 9. Upgrades

1. Back up D1: `wrangler d1 export miliconfig-db --remote --output backup.sql`.
2. Deploy the new code (`wrangler deploy`).
3. Apply any new migration files in order.
4. Re-check `/api/v1/health` and the dashboard.
5. Session rows survive deploys; revoke them from the Security page if you rotate credentials.

## 10. Rollback

```bash
wrangler deployments list
wrangler rollback [deployment-id]
```

Code rollback does not revert schema changes. The v4 migrations are additive
(`CREATE TABLE IF NOT EXISTS`), so a rollback to v3 code leaves extra tables untouched and harmless.
Keep the D1 export from step 9 for data rollback.

## 11. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `503 DATABASE_UNAVAILABLE` on setup or login | D1 binding missing or named differently. The Worker detects `DB`, `D1`, `miliconfig`; otherwise add the binding. |
| Setup screen repeats | A `system_config` row named `admin_password_hash` already exists; sign in instead. Clear only if you intentionally reset the install. |
| Subscription returns 403 | Token revoked, user disabled, expired, or over quota. Check the user row and subscription state. |
| Subscription is empty | No enabled endpoints and no default addresses, or every combination was rejected. Run *Configuration engine → Generate* and read the rejection summary. |
| Scanner says TCP not performed | Running outside the Workers runtime (local dev), where `cloudflare:sockets` does not exist. |
| Cron jobs never run | Pages has no cron; on Workers confirm `[triggers]` is deployed and check `automation_runs`. |
| `storage: base64-only` | `MILI_ENCRYPTION_KEY` is not set. |
| Styles/theme look wrong | Check `/admin` is being served (not a cached copy); assets are inline, so a stale CDN cache is the usual cause — hard reload. |

## 12. Deployment checklist

- [ ] `npm test` passes locally.
- [ ] `npm run check:schema` passes.
- [ ] `database_id` replaced in the deployed config.
- [ ] `MILI_ENCRYPTION_KEY` set as a secret.
- [ ] No credential committed in `wrangler*.toml`, `[vars]`, or the repo.
- [ ] Schema/migrations applied to the target database.
- [ ] `/api/v1/health` returns `storage: "d1"`.
- [ ] First-run setup completed; second attempt refused.
- [ ] Login, logout and "revoke all sessions" work.
- [ ] A test user can be created, configured and exported; sixth user is refused.
- [ ] Endpoint check results show explicit levels.
- [ ] Cron trigger (or manual automation run) recorded in `automation_runs`.
- [ ] Backup export taken before the first production change.
