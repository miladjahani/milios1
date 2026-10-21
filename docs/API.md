# API reference (`/api/v1`)

All responses are JSON with a top-level `ok` flag. Errors use:

```json
{ "ok": false, "error": { "code": "UNAUTHENTICATED", "message": "Sign in to continue." } }
```

- Authentication: `mili_session` HttpOnly cookie (issued by `/api/v1/auth/login`). `Authorization:
  Bearer <session-token>` is also accepted for automation.
- State-changing requests (`POST`/`PUT`/`PATCH`/`DELETE`) must be same-origin
  (`Origin`/`Referer` or `Sec-Fetch-Site`). Cross-origin mutations return `403 ORIGIN_REJECTED`.
- Session tokens are stored hashed; logout revokes the row immediately.
- Request bodies are limited to 64 KiB and parsed as JSON.
- Mutating endpoints are audited with the normalized client IP.

## Authentication

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/auth/session` | – | `{ authenticated, expiresAt?, adminPath? }` (public). Setup state comes from `/api/v1/health`. |
| POST | `/api/v1/auth/setup` | `{ password, confirmPassword }` | First run only; afterwards answers `403 SETUP_COMPLETE`. Creates the administrator and a session. |
| POST | `/api/v1/auth/login` | `{ password }` | Rate limited per IP (`loginRateLimitMax`, 15-minute window). Returns `redirect`. |
| POST | `/api/v1/auth/logout` | `{}` | Revokes the current session. |
| POST | `/api/v1/auth/change-password` | `{ currentPassword, newPassword, confirmPassword }` | Policy enforced server-side. |
| POST | `/api/v1/auth/revoke-sessions` | `{}` | Revokes every session. |

## Users (maximum five, enforced in SQL)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/users` | List with sanitized config (no credentials). |
| POST | `/api/v1/users` | `{ username, dataLimitGb, expireDays, subNodeCount, preset, note, enabled, startOnFirstUse, ipLimit, nodeScope, … }`. `409 LIMIT_REACHED` when five exist. |
| GET | `/api/v1/users/:id` | Single user + subscription summary. |
| PATCH | `/api/v1/users/:id` | Update fields; server validates ranges and duplicates. |
| DELETE | `/api/v1/users/:id` | Requires `{ confirm: "<username>" }`. Removes configurations and subscription. |
| POST | `/api/v1/users/:id/reset-usage` | Resets `used_bytes`/`request_count`. |
| POST | `/api/v1/users/:id/rotate-sub` | New subscription token; old URL stops working. |
| POST | `/api/v1/users/:id/revoke-sub` | `{ revoked: true|false }`. |

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/endpoints` | Catalog + health levels and labels. |
| POST | `/api/v1/endpoints` | `{ name, host, port, protocol, transport, tlsMode, family, kind, country, region, provider, notes }`. Host must be a valid IPv4/IPv6/domain; no fabricated locations. |
| PATCH | `/api/v1/endpoints/:id` | Update fields. |
| DELETE | `/api/v1/endpoints/:id` | Remove endpoint. |
| POST | `/api/v1/endpoints/:id/check` | Graded probe; stores result and updates score. |
| GET | `/api/v1/endpoints/:id/history` | Latest check history. |
| POST | `/api/v1/endpoints/:id/ech-check` | Inspects the endpoint's HTTPS/SVCB ECH record. |

## Configurations

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/v1/configurations/generate` | `{ userId, formats?, limit? }`. Validates every combination, stores results, returns plans and rejection summaries. `409 NO_VALID_COMBINATION` with reasons when nothing survives. |
| POST | `/api/v1/configurations/validate` | `{ userId, candidate }` → validation issues only. |
| GET | `/api/v1/configurations?userId=&limit=` | Stored plans. |

## Subscriptions

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/subscriptions` | Per-user token, formats, download counter, ready-made URLs. |
| POST | `/api/v1/subscriptions/:userId/rotate` | Rotate token. |
| POST | `/api/v1/subscriptions/:userId/revoke` | Revoke. |
| POST | `/api/v1/subscriptions/:userId/enable` | Re-enable. |

Public delivery (no session, unguessable token):

```text
GET /s/:token                     base64 URI list (client auto-detection by User-Agent)
GET /s/:token?target=singbox      sing-box JSON
GET /s/:token?target=clash        Clash / Mihomo YAML
GET /s/:token?target=raw          plain URI list
GET /s/:token?target=surge|loon|quanx
```

Response headers: `Profile-Title`, `Profile-Update-Interval`, `Subscription-Userinfo`
(`upload/download/total/expire`), `Cache-Control: no-store`. Revoked, expired, disabled or
over-quota users are refused with `403`.

## Scanner

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/v1/scanner/scan` | `{ targets:[{ host, port, endpointId?, levels?:[] }], levels?:[], concurrency? }`. Each result lists `checks` with `performed` flags, `verifiedLevel`, `status`, `score`. |
| GET | `/api/v1/scanner/history?endpointId=` | Stored health history. |

## DNS, TLS, ECH catalogs

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/dns` | DNS profiles (provider, IPv4/IPv6, DoH/DoT, filtering, source), modes, configured values, fingerprint catalog. |
| POST | `/api/v1/dns/test` | `{ profileId }` — resolves through the profile's DoH endpoint from the Worker. |
| POST | `/api/v1/dns/ech-test` | `{ hostname }` — looks for an HTTPS/SVCB ECH configuration. |
| GET | `/api/v1/capabilities` | Capability matrix: per protocol runtime/config/client support, UDP, TLS, REALITY, ECH notes. |
| GET | `/api/v1/conflicts` | Current settings conflicts with severity and recommendation. |

## Settings, usage, audit, automation, Cloudflare

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/settings` | Sections + schema + current sanitized values. |
| PUT | `/api/v1/settings` | `{ settings: { … } }`. Validated against `SETTINGS_SCHEMA`; invalid values rejected with field details. Secrets are never returned. |
| POST | `/api/v1/settings/reset` | Restore defaults (administrator password untouched). |
| GET | `/api/v1/usage?days=14` | Daily series + per-user totals, with explicit measurement source. |
| GET | `/api/v1/usage/:userId?days=30` | Per-user series and subscription-download counter (separate from traffic). |
| GET | `/api/v1/audit?limit=&offset=` | Audit log, recent login attempts, active sessions. |
| GET | `/api/v1/automation` | Jobs + last runs. |
| PATCH | `/api/v1/automation/:id` | `{ enabled }`. |
| POST | `/api/v1/automation/:id/run` | Run now; result recorded in `automation_runs`. |
| GET | `/api/v1/cloudflare` | Connection status, stored resources, required permissions, encryption state. Never returns the token. |
| PUT | `/api/v1/cloudflare/token` | `{ token }` — verified against `GET /user/tokens/verify` before storage. |
| DELETE | `/api/v1/cloudflare/token` | Remove stored token. |
| POST | `/api/v1/cloudflare/test` | Re-verify the stored token with the Cloudflare API. |
| POST | `/api/v1/cloudflare/workers` | `{ scriptName, accountId? }` — reads deployment status for a Worker script. |
| GET | `/api/v1/health` | Public health: version, storage mode, schema readiness. |
| GET | `/api/v1/admin/overview` | Dashboard aggregate (all numbers from D1). |
| GET | `/api/v1/bootstrap` | Initial payload for the workspace. |

## Legacy surface (kept for existing integrations)

`/:adminPath/api/config`, `/api/users`, `/api/stats`, `/api/preferred-ips`,
`/api/status/:token`, `/api/admin/*` (login/logout/password), `/api/scanner/*`. These are
authenticated with the same session cookie; unauthenticated calls return `403`.
