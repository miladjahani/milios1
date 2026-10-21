# MiliconfigOS v4.0

An honest, auditable control plane for proxy configurations on **Cloudflare Workers + D1**.
Built by **Milad Jahani** under the **miliconfig** brand.

MiliconfigOS generates VLESS / Trojan / Shadowsocks / xHTTP client configurations from a
persistent endpoint catalog, validates every combination before it is delivered, serializes real
sing-box / Clash / URI / Surge / Loon / Quantumult X output, scans endpoints with clearly labelled
health levels, and measures traffic from its own Worker data plane only.

It is **not** a mock dashboard. Every number, list and status in the panel comes from D1 rows,
the Worker's own probe results, or an explicitly labelled "not available" state.

<p align="center">
  <a href="#quick-start-local">Quick start</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a> ·
  <a href="docs/API.md">API</a> ·
  <a href="docs/DEPLOYMENT.md">Deployment</a> ·
  <a href="docs/SECURITY.md">Security</a> ·
  <a href="docs/COMPATIBILITY.md">Compatibility matrix</a> ·
  <a href="docs/TESTING.md">Test report</a>
</p>

---

## What actually works

| Area | Status | Where it is implemented |
| --- | --- | --- |
| First-run administrator setup, no default password | Working | `src/api/v1.js` (`/auth/setup`), `src/db/d1.js` |
| PBKDF2-SHA256 password hashing, session cookies, revocation, login rate limiting | Working | `src/core/security.js`, `src/db/v4.js` |
| Five-user hard limit, enforced transactionally in SQL | Working, covered by tests | `src/db/d1.js` (`INSERT … SELECT … WHERE COUNT(*) < 5`) |
| Persistent user CRUD, quota, expiry, node scope, per-user UUID | Working | `src/api/v1.js`, `src/db/d1.js` |
| Endpoint catalog (IPv4/IPv6/domain, protocol, transport, TLS, country, provider) | Working | `src/db/v4.js`, `src/api/v1.js` |
| Endpoint checks with graded levels (syntax → DNS → TCP → TLS → HTTP → proxy) | Working, never claims more than it measured | `src/core/scanner.js`, `src/core/health.js` |
| Configuration engine with validation, scoring, rejection reasons | Working | `src/core/engine.js` |
| Subscription serializers (sing-box, Clash, URI, Surge, Loon, QuanX) | Working, tests per format | `src/subscription/converters.js` |
| Per-user subscription tokens, rotation, revocation, quotas, expiry headers | Working | `src/api/v1.js`, `src/index.js` |
| Traffic accounting from the Worker data plane | Working for proxied streams; panel visits excluded | `src/core/runtime.js`, `src/db/v4.js` |
| DNS / TLS fingerprint / ECH catalogs, conflict detection | Working catalogs and rules; ECH is labelled conditional | `src/config/catalog.js`, `src/config/schema.js` |
| Automation jobs (validation, expiry, health refresh, quota checks) with run history | Working | `src/db/v4.js`, `src/api/v1.js` |
| Cloudflare token storage (AES-GCM), permission listing, deployment status | Working HTTP client; real API verification required to mark connected | `src/api/v1.js`, `src/core/security.js` |
| Light / dark / system themes, RTL + LTR, reduced motion | Working | `src/ui/adminHtml.js`, `src/ui/loginHtml.js` |
| Tests | 64 tests, all passing (`npm test`) | `tests/` |

### Explicit non-claims

- A configuration link is not proof of a working tunnel. The panel separates *generation*,
  *endpoint reachability*, *protocol validation* and *measured traffic*.
- Cloudflare Workers cannot run arbitrary native proxy cores, raw TCP listeners, or unrestricted
  UDP relays. REALITY is therefore **not implemented**, and is not offered as a selectable mode.
  ECH is offered only as client-side configuration where the data supports it, with warnings.
- Geolocation shown for an endpoint is metadata entered by the administrator or provided by the
  endpoint source; it is not a physical-server measurement.
- Subscription fetches are counted separately from proxied bytes. They are never merged.

---

## Quick start (local)

Requires Node.js **22.5+** (the built-in SQLite module backs the local D1 adapter).

```bash
npm install            # optional: terser/acorn/javascript-obfuscator for the bundle
npm run dev            # http://0.0.0.0:3000 with a persistent SQLite control plane
```

Open the printed URL, choose an administrator password (10+ characters, two character classes),
and the panel opens at `/admin`. The local database lives in `.dev/miliconfig.sqlite`.

```bash
npm test               # 64 automated tests (node:test + real SQLite D1 adapter)
npm run check:schema   # apply schema.sql + migrations/*.sql to a throwaway database
npm run build          # dist/_worker.js, public/_worker.js, _worker.js, dist/worker.readable.js
```

The local server is a development harness: it runs the real Worker `fetch` handler, but the
`cloudflare:sockets` proxy data plane only exists inside the Cloudflare runtime.

## Deploy to Cloudflare

```bash
wrangler d1 create miliconfig-db          # copy the database id into wrangler.toml
wrangler d1 execute miliconfig-db --remote --file schema.sql
wrangler secret put MILI_ENCRYPTION_KEY   # recommended: 32+ random characters
wrangler deploy
```

Open the deployed URL, complete the first-run setup, then sign in. Full instructions, Pages
variant, CI/CD notes and rollback steps: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Project layout

```text
miliconfig/
├── src/
│   ├── index.js                  # Worker entry: routing, login gateway, data plane, status pages
│   ├── config/
│   │   ├── defaults.js           # 31 base-engine defaults, brand + user limit constants
│   │   ├── catalog.js            # verified DNS / TLS-fingerprint / ECH / protocol catalogs
│   │   ├── schema.js             # central settings schema, sanitisation, conflict detection
│   │   ├── presets.js            # user presets
│   │   └── sources.js            # endpoint provider sources (regional, upstream)
│   ├── core/
│   │   ├── engine.js             # combination builder, validation, scoring, run records
│   │   ├── scanner.js            # graded probes (DNS, TCP, TLS, HTTP, ECH)
│   │   ├── health.js             # scoring, labels, bounded concurrency
│   │   ├── security.js           # PBKDF2, cookies, AES-GCM, password policy, CSRF helpers
│   │   ├── runtime.js            # VLESS/Trojan/SS/xHTTP data plane + byte accounting
│   │   └── utils.js              # node naming, UUID/URL helpers, parsers
│   ├── db/
│   │   ├── d1.js                 # binding detection, users, settings, audit, memory fallback
│   │   └── v4.js                 # sessions, catalog, configs, subscriptions, usage, automation
│   ├── subscription/
│   │   ├── generator.js          # per-user node list from settings + endpoint catalog
│   │   └── converters.js         # sing-box, Clash, Surge, Loon, Quantumult X serializers
│   ├── api/
│   │   ├── v1.js                 # versioned API (/api/v1)
│   │   └── handlers.js           # legacy API surface kept for existing integrations
│   └── ui/
│       ├── adminHtml.js          # desktop-style workspace: dashboard, users, catalog, settings…
│       ├── loginHtml.js          # homepage gateway + blurred login dialog
│       ├── statusHtml.js         # per-user subscription status page
│       └── icons.js              # original SVG logo/icon set
├── scripts/
│   ├── build.js                  # deterministic bundler → dist/_worker.js
│   ├── obfuscate.js              # Workers-safe minifier/obfuscator
│   ├── dev-server.js             # local Node harness with SQLite D1
│   ├── check-schema.js           # schema + migration validation
│   ├── test-worker.js            # legacy test entry point → node:test
│   └── lib/                      # SQLite D1 adapter, sockets alias hook
├── tests/                        # unit, integration and API tests
├── migrations/                   # 0001 legacy schema, 0002 v4 control plane
├── schema.sql                    # complete current D1 schema
├── docs/                         # architecture, API, security, deployment, compatibility, test report
├── wrangler.toml                 # Worker deployment
├── wrangler.pages.toml           # Pages deployment variant
└── package.json
```

`snippets` and `edgetunnel…` are the original single-file upstream references that v4 replaced;
they are kept for traceability and are not deployed.

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `DB` (D1 binding) | Yes in production | Cloudflare D1 database. Without it the panel refuses login unless `MILI_ALLOW_MEMORY=1`. |
| `MILI_ENCRYPTION_KEY` | Recommended | AES-GCM key material for the stored Cloudflare token. Unset ⇒ token is stored base64-encoded and the UI reports it. |
| `MILI_ALLOW_MEMORY` | Dev only | `1` allows the isolate-memory fallback when no D1 binding exists. |
| `BRAND` | Optional | Display brand string in the Worker environment. |
| `PORT` | Local dev | Port for `scripts/dev-server.js` (default 3000). |
| `MILI_DEV_DB` | Local dev | Path to the SQLite file (default `.dev/miliconfig.sqlite`). |

There are **no preconfigured application secrets**. No default administrator password, API token or
Cloudflare credential is committed or accepted silently.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — runtime split, data model, request flow
- [API reference](docs/API.md) — `/api/v1` groups, auth, errors, examples
- [Security](docs/SECURITY.md) — threat model, authentication, secrets, logging rules
- [Compatibility matrix](docs/COMPATIBILITY.md) — what each protocol/format/runtime really supports
- [Deployment](docs/DEPLOYMENT.md) — Workers, Pages, migrations, CI/CD, rollback, checklist
- [Test report](docs/TESTING.md) — what ran, what it covered, what it cannot cover here
- [Audit and defect report](docs/AUDIT.md) — original inventory, defects found, fixes applied
- [Quality gate](docs/QUALITY-GATE.md) — item-by-item final verification

## License

MIT — see `package.json`. Brand, logo and interface are original to miliconfig.
