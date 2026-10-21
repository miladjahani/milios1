# Security model

## No preconfigured credentials

- No administrator password is shipped. `initializeAdminPassword()` only inserts when
  `admin_password_hash` does not exist yet and uses `INSERT … SELECT … WHERE NOT EXISTS`, so a
  second first-run setup cannot overwrite an existing administrator.
- No Cloudflare API token, API key or account credential is committed. Tokens are entered by the
  administrator, verified against `GET /user/tokens/verify`, then stored server-side.
- No placeholder credential is accepted silently. The login form cannot sign in before setup, and a
  missing D1 binding returns `503 DATABASE_UNAVAILABLE` instead of granting access.
- `wrangler.toml` contains placeholders only (`REPLACE-WITH-YOUR-D1-DATABASE-UUID`).

## Authentication

| Control | Implementation |
| --- | --- |
| Password hashing | PBKDF2-HMAC-SHA256, 210 000 iterations, 16-byte random salt, recorded as `pbkdf2$sha256$…`. Legacy SHA-256 hashes are verified once and re-hashed on successful login. |
| Password policy | ≥ 10 characters, ≤ 200, two character classes, rejects common passwords and single-character repetition. Enforced server-side for setup and password change. |
| Sessions | 32-byte random token; only its SHA-256 hash is stored in `admin_sessions`. Cookie `mili_session` is `HttpOnly`, `SameSite=Strict`, `Path=/`, and `Secure` on HTTPS. Default lifetime 12 h (configurable 1 h – 30 days). |
| Logout / revocation | Logout and "revoke all sessions" set `revoked = 1` for the matching hash; verification checks expiry and revocation on every request. |
| Rate limiting | Failed logins per IP within a 15-minute window; threshold from `loginRateLimitMax` (default 8, minimum 3). Attempts are recorded in `login_attempts`. |
| CSRF | `SameSite=Strict` cookies plus a strict same-origin check (`Sec-Fetch-Site` / `Origin` / `Referer`) for every mutating `/api/v1` request. Cross-origin mutations return `403 ORIGIN_REJECTED`. |
| Admin path | Panel defaults to `/admin`; the generated UUID path is an alternative, never the only protection. |
| Response headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (except the same-origin homepage frame), `Referrer-Policy: same-origin`, restrictive `Permissions-Policy`, `Cache-Control: no-store` for authenticated HTML/JSON. |

## Secrets at rest

Cloudflare tokens are encrypted with AES-GCM (12-byte random IV per value) using a key derived from
`MILI_ENCRYPTION_KEY`. Without that secret the value is only base64-encoded and the UI explicitly
reports `storage: "base64-only"` with a warning, so the operator knows the difference.

The token is never returned by any endpoint: `GET /api/v1/cloudflare` returns connectivity state,
permissions and encryption mode only.

## Authorization

- Every `/api/v1` route except `auth/*`, `health` and the public subscription/status paths requires
  a valid session; the router checks it centrally before dispatching.
- The five-user limit is enforced in SQL (`INSERT … SELECT … WHERE (SELECT COUNT(*) FROM users) < 5`)
  inside a single statement, so concurrent requests cannot exceed it. The UI limit is only a hint.
- Users cannot read another user's subscription: delivery requires the per-user random token, and
  revoked/expired/over-quota tokens are refused. Rotating a token invalidates the old URL.
- Administrator credentials never appear in subscription output, status pages, audit entries or logs.

## Logging rules

- Structured JSON logs (`level`, `scope`, `message`, path, duration) are emitted for unhandled errors
  and the automation cron.
- Audit entries record the action, a short detail and the client IP. They never include passwords,
  session tokens, API tokens or subscription tokens.
- Errors returned to unauthenticated clients are generic; stack traces are not exposed.

## Threat model and limits

Covered: credential stuffing (rate limit), session theft (HttpOnly/SameSite/Secure + revocation),
CSRF, unauthorized API access, secret leakage through API responses, enumeration of subscription
tokens (32 random bytes), double-setup, and bypassing the user cap.

Not covered / out of scope:

- A compromised administrator browser or a stolen session cookie before revocation.
- Compromise of the Cloudflare account itself; a scoped API token is recommended, and a Global API
  Key should not be used.
- An attacker with write access to the repository or the Worker environment.
- Denial of service above Cloudflare's platform protections.
- Client-side malware on a user's device.

## Operational recommendations

1. Set `MILI_ENCRYPTION_KEY` (32+ random characters) with `wrangler secret put`; rotate by re-entering
   the Cloudflare token afterwards.
2. Use a scoped Cloudflare API token: *User → API Tokens → Read* and *Account → Workers Scripts →
   Read*. Add *Workers Scripts → Edit* only if you deploy through the panel.
3. Keep the D1 database private to the Worker; do not expose SQL access publicly.
4. Review `Security → Audit log` and `active sessions` after administrative changes.
5. Set a session duration that matches your risk tolerance; revoke all sessions after removing an
   administrator device.
6. Restrict who can read the repository's Actions secrets and deploy logs.

## Reporting

Security issues should be reported privately to the project maintainer rather than in a public
issue. Include reproduction steps and the affected version (`/api/v1/health` returns `v4.0`).
