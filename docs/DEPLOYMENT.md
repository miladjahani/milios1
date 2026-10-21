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

## 5. Deploy with Pages (alternative)

```bash
npm run build
wrangler pages deploy dist --project-name miliconfig
```

Pages requirements:

- Build command: `npm run build`
- Output directory: `dist`
- `dist/_worker.js` must exist (the build writes it).
- Bind D1 under **Settings → Functions → D1 database bindings** with variable name `DB`.
- Cron Triggers are not available on Pages; run automation from the panel.

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
