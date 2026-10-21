# Source audit and defect report

## 1. Inventory of the supplied project (v3.1)

| Area | Original implementation |
| --- | --- |
| Runtime | Single Cloudflare Worker (`src/index.js`) also deployable to Pages via `dist/_worker.js`. |
| Framework | None — plain ES modules concatenated by `scripts/build.js`; server-rendered HTML with inline CSS/JS. |
| Database | Cloudflare D1 with runtime auto-migration (`src/db/d1.js`), memory fallback when no binding, optional KV path for the admin path. |
| API | Legacy surface only (`/api/users`, `/api/config`, `/api/stats`, `/api/scanner`, `/api/admin/*`, `/api/status/:token`), admin prefix derived from the configured path. |
| Auth | Single administrator, password hash in `system_config`, session token derived from environment/ID values, cookie `mili_auth`. |
| Users | D1 rows with UUID, quota, expiry, node scope, per-user config JSON; UI exposed creating/editing/deleting. |
| Proxy engine | VLESS over WebSocket, VLESS xHTTP, Trojan over WebSocket, Shadowsocks (plain header), optional outbound SOCKS5/HTTP chain, per-ISP preferred IP pools. |
| Subscriptions | `src/subscription/generator.js` + `converters.js` (Clash, sing-box, Surge, Loon, Quantumult X, base64 URI), per-user node cap and `N+miliconfig` naming. |
| Settings | 31 flat settings in `config_json`/`system_config`, edited through the admin UI. |
| Scanner | `api/scanner` endpoints and preferred-IP collection from public sources. |
| UI | Dark-only admin panel, login gateway with homepage iframe, per-user status page. |
| Build/deploy | `scripts/build.js` (bundle + obfuscate), `wrangler*.toml`, three GitHub workflows (build/obfuscate/release). |
| Tests | `scripts/test-worker.js` — asserted a 3-user limit and the legacy login path. |

## 2. Defects found

### Security

1. **Password hashing** used a single unsalted SHA-256 digest. Fixed with PBKDF2-SHA256 (210k
   iterations, per-hash salt) plus transparent rehash of legacy hashes on login.
2. **No first-run flow.** The administrator hash was set from configuration/environment values; a
   missing credential left the panel in an undefined state. Fixed with an atomic one-time setup that
   refuses replay.
3. **Sessions were derivable** from stable values and could not be revoked individually. Fixed with
   random 32-byte tokens stored as SHA-256 hashes, per-row revocation, expiry and "revoke all".
4. **No CSRF protection** for state-changing calls. Fixed with `SameSite=Strict` cookies and a strict
   same-origin check on every mutating `/api/v1` request.
5. **No login rate limiting.** Fixed with per-IP attempt tracking over a 15-minute window.
6. **Five-user limit did not exist.** Fixed with `MAX_USERS_LIMIT = 5` and a transactional SQL insert;
   the sixth creation is refused by the database, not by the UI.
7. **Phantom starter user.** Database bootstrap created a hidden default account that consumed one of
   the user slots and shipped credentials nobody asked for. Removed; the database starts empty.

### Correctness

8. **Placeholder subscription nodes.** Three informational links with UUID
   `00000000-0000-0000-0000-000000000000` at `127.0.0.1` were prepended to every subscription — they
   can never connect. Removed from delivery.
9. **Endpoint catalog disconnected from subscriptions.** v4 endpoints were used for validation but
   not for delivery. Now enabled catalog endpoints contribute nodes for their own protocol, using
   their real host/port/name.
10. **Setting validation gaps.** `customDNS` and several enum fields accepted values that later broke
    configuration building (`INVALID_OPTION` at generation time). Fixed with a central schema that
    validates and normalises on save, plus conflict detection.
11. **Duplicate configuration identifiers.** Multiple plans could share a dedupe key. Fixed by
    including the batch position in the persisted id.
12. **Automation was manual only.** Jobs existed but nothing scheduled them. Added a shared runner and
    a `scheduled()` Cron Trigger handler.
13. **Stale test entry point.** `scripts/test-worker.js` asserted a 3-user limit and legacy login,
    so it could never pass against v4. It now delegates to the real `node:test` suite.

### Build and repository hygiene

14. **Build mutated deployment config.** `scripts/build.js` rewrote `wrangler.toml` when
    `CF_PAGES=1`, silently changing the Worker config. Removed; builds no longer touch config.
15. **Build wrote stray copies** of the bundle into the repository root with obfuscated filenames.
    Removed; outputs are now exactly `dist/_worker.js`, `public/_worker.js`, `_worker.js` and
    `dist/worker.readable.js`.
16. **Committed database id.** `wrangler.pages.toml` / `wrangler.worker.toml` contained a concrete D1
    database id. Replaced with documented placeholders.
17. **CI workflow paths referenced removed artifacts** and committed them on every push. Rewritten:
    CI tests/builds only; artifact rebuild and deployment are explicit.

## 3. Functionality preserved

- The complete base-engine settings set (31 keys) and per-user configuration inheritance.
- `N+miliconfig` node naming, per-user node cap, protocol interleaving and IP rotation.
- Preferred-IP sources, ISP operator pools, static Cloudflare addresses and outbound proxy chains.
- All six subscription formats and the legacy `/api/*` endpoints used by existing integrations.
- Status pages, login homepage gateway and the obfuscated single-file build.
- Existing D1 data: schema changes are additive; no table is dropped and no user row is rewritten.

## 4. Added in v4

Versioned API (`/api/v1`), administrator sessions and audit, first-run setup, persistent endpoint
catalog with graded health history, configuration engine with validation/scoring/rejection reasons,
per-user subscriptions with rotation/revocation, usage accounting from the Worker data plane,
automation engine + cron, Cloudflare token storage (AES-GCM) with permission/status reporting,
DNS/TLS/ECH catalogs with conflict detection, capability matrix, three themes with RTL/LTR, local
development harness, schema/migration validation, and a 64-test suite.

## 5. Known limitations carried forward or introduced

- Shadowsocks in this Worker is `cipher: none` with the WebSocket plugin; AEAD ciphers are not
  implemented and the capability matrix says so.
- The legacy generator still composes nodes from per-user settings plus the catalog; it does not
  consume the stored `configurations` rows as a delivery manifest. Both are derived from the same
  user/settings/endpoint inputs, and the engine remains the validation gate.
- Cloudflare API "connected" state requires a real token; this environment has none.
- REALITY cannot run on Workers and is not offered.
