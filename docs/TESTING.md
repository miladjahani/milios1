# Test report

**Run date:** 2026-10-21
**Environment:** Node.js v22.23.2, Linux, SQLite via `node:sqlite` (experimental warning expected)
**Command:** `npm test` → `node --test "tests/*.test.js"`

```text
# tests 64
# pass 64
# fail 0
# cancelled 0
# skipped 0
# duration_ms 3735
```

No test is skipped and no assertion was weakened to make the suite pass.

## Coverage by file

| File | Tests | What it proves |
| --- | --- | --- |
| `tests/security.test.js` | 6 | PBKDF2 verify + wrong-password rejection, legacy SHA-256 rehash path, password policy, constant-time comparison with different lengths, AES-GCM round-trip, base64-only marking when no key exists. |
| `tests/schema.test.js` | 6 | Settings normalisation, rejection of invalid numbers/ports/options, dangerous homepage URLs, conflict detection (no protocol, no address family, ECH without DoH, plaintext Shadowsocks, fake-IP in sing-box), private-host blocking. |
| `tests/catalog.test.js` | 5 | DNS profiles have addresses and sources, ECH entries cite documentation, fingerprints are not sold as identity guarantees, capability matrix flags match runtime reality, formats declare xHTTP support explicitly. |
| `tests/engine.test.js` | 8 | Valid VLESS/WS/TLS passes; gRPC/h2 and unknown protocols rejected; IPv6 rejection when disabled; xHTTP requires TLS and a capable format; expired/quota users cannot get plans; chain loop and unsupported scheme detection; deterministic deduplicated plan building; persisted configuration rows carry reasons. |
| `tests/health.test.js` | 6 | Syntax-only scores zero, TCP-only is capped and never called a working proxy, TCP+TLS ranks higher with `tls-ok`, DNS-only labelled, DoH answer parsing, bounded concurrency. |
| `tests/generator.test.js` | 8 | Node naming (`N+miliconfig`), per-user node cap, IPv4/IPv6 filtering, ECH requires flag + DoH, fragment presets, port parsing, custom preferred-string parsing, stable xHTTP padding. |
| `tests/serializers.test.js` | 4 | Share-link parsing, sing-box JSON structure (xHTTP excluded), Clash YAML with proxies/groups, distinct Surge/Loon/Quantumult X output. |
| `tests/integration.test.js` | 21 | HTTP-level flows against the real Worker and a real SQLite-backed D1 (see below). |

## Integration flows exercised through HTTP

1. `/api/v1/health` reports storage and initialization state.
2. Public gateway renders the login page for signed-out visitors.
3. Protected routes reject anonymous requests with `401`.
4. Cross-origin mutating requests are rejected (`403 ORIGIN_REJECTED`).
5. First-run setup enforces the password policy.
6. First-run setup creates the administrator and a session cookie.
7. Setup cannot be replayed (`403 SETUP_COMPLETE`).
8. Login rejects a wrong password and accepts the real one.
9. `/api/v1/bootstrap` exposes settings but never secrets.
10. User management creates exactly five accounts.
11. A sixth creation is refused by the backend (transactional limit), not only by the UI.
12. Every user gets an isolated subscription identity/token.
13. Subscription delivery works per format (`singbox`, `clash`, `uri`) and per user.
14. Revoking a subscription blocks delivery immediately.
15. Configuration generation produces validated combinations from stored endpoints.
16. Settings persist through the API.
17. Invalid settings are rejected with field-level details.
18. Administrative actions are written to the audit log.
19. Dashboard overview numbers are computed from stored rows (not constants).
20. Logout revokes the session server-side.
21. Login rate limiting blocks repeated failures.

The integration suite registers an ESM loader hook that aliases `cloudflare:sockets` to an explicit
stub, so nothing pretends a socket was opened.

## Additional verification performed manually

Against the local worker harness (`scripts/dev-server.js`, real SQLite database):

| Check | Result |
| --- | --- |
| First-run setup over HTTP | `200`, admin session issued, `adminPath` returned |
| `/admin` workspace HTML | `200`, ~93 KB, brand renders |
| Five users created, sixth attempt | `201 ×5`, then `409 LIMIT_REACHED` |
| `/api/v1/admin/overview` | totals from D1 (`users.total = 5`, capacity 5) |
| `/api/v1/capabilities`, `/dns`, `/endpoints`, `/automation`, `/cloudflare`, `/settings` | `200`, real catalog/status payloads |
| Configuration generation for a user | `12` valid plans stored, rejections summarised with codes |
| `GET /s/:token?target=singbox` | valid JSON (`outbounds` array with selector groups), user's real UUID in links |
| `GET /s/:token?target=clash` | YAML with `mixed-port`, proxies, groups |
| `GET /s/:token?target=raw` | URI list with per-user UUID, no placeholder nodes |
| `Subscription-Userinfo` header | quota/expiry from the user row |
| Automation run (`POST /api/v1/automation/job-config/run`) | success, `run_count` incremented, detail recorded |
| Scanner on `1.1.1.1:443` | syntax `ok`, TCP not performed locally and reported as such, score 5 |
| `node scripts/check-schema.js` | applies `schema.sql` + both migrations, 17 tables, 21 user columns |
| `npm run build` + `node --check build/worker.readable.js` | bundle builds and parses; `dist/` contains only `.nojekyll` and `_worker.js` |
| `npm run deploy:pages:check` | Pages deployer preflight exits `0` offline; without a token the deploy path exits `1` with setup instructions |
| `npm run deploy:pages:check` | Pages deployer preflight passes offline |

## Not verified here (and why)

| Area | Reason |
| --- | --- |
| Real Cloudflare deployment | Requires a Cloudflare account, D1 instance and secrets; local harness cannot emulate the edge. Covered by the deployment checklist instead. |
| `cloudflare:sockets` proxy tunnelling | The module does not exist outside the Workers runtime; local runs report "not available" instead of faking success. |
| End-to-end traffic measurement | Requires live proxied traffic through a deployed Worker. |
| Network scanning against public hosts | The sandbox blocks the Workers socket API; DNS/TCP results shown in the report come from the local harness behaviour, not from a remote scan. |
| Browser automation (themes, mobile layout) | No browser test runner is configured in this project. Theme switching is implemented client-side and was checked by inspecting the rendering/CSS paths, not by an automated visual test. |
| Cloudflare API calls | No token is available in this environment; error paths are unit-tested, success requires a real token. |

## How to reproduce

```bash
npm test
npm run check:schema
npm run dev        # then walk through first-run setup in a browser
npm run build
node --check build/worker.readable.js
npm run deploy:pages:check
```
