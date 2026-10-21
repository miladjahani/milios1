# Compatibility matrix

The server data in this table comes from `src/config/catalog.js` and is exposed at
`GET /api/v1/capabilities`. Runtime flags describe what this Worker actually implements; they are
not marketing claims.

## Protocols and transports

| Protocol | Credential | Transport | Config generation | Worker runtime | Client support | UDP |
| --- | --- | --- | --- | --- | --- | --- |
| VLESS | UUID | WebSocket | Yes | Yes | sing-box, Clash/Mihomo, v2rayNG, Streisand, Shadowrocket, Surge, Loon, Quantumult X, URI clients | DNS only |
| VLESS | UUID | xHTTP | Yes | Yes (`handleXhttpPostRequest`) | Clash (partial), URI, sing-box ≥ 1.10 with xHTTP builds | DNS only |
| Trojan | Password | WebSocket over TLS | Yes | Yes | sing-box, Clash/Mihomo, Surge, Loon, Quantumult X, URI clients | DNS only |
| Shadowsocks | Password | WebSocket via `v2ray-plugin` | Yes | Yes — **plain header only (`cipher: none`)** | sing-box, Clash/Mihomo, Surge, Loon, Quantumult X | No |

Unsupported transports are rejected, not silently substituted: **gRPC** and **HTTP/2** are marked
`runtime: false` with the reason "Not implemented by this Worker", and `validateCandidate()` refuses
them.

### Not implemented

- **REALITY** — requires a native Xray/sing-box server and raw TCP; Cloudflare Workers cannot host
  it. The capability matrix returns `reality: false`; the UI does not offer it as a selectable mode.
- **AEAD Shadowsocks ciphers** (AES-GCM, ChaCha20-Poly1305) — the Worker parses the plain Shadowsocks
  header only. Generated Shadowsocks links use `none` with the WebSocket plugin. Do not expect
  cipher-negotiated AEAD support.
- **Multiplexing (mux/smux)**, arbitrary raw TCP forwarding, general UDP relay — not available in the
  Workers runtime.
- **ECH as a server feature** — client-side ECH parameters are emitted only when TLS, a DoH resolver
  and an ECH configuration domain are all configured and validated. Selecting ECH never marks it
  "active" on its own.

## Output formats

| Format | VLESS | Trojan | Shadowsocks | xHTTP | Notes |
| --- | --- | --- | --- | --- | --- |
| sing-box JSON | Yes | Yes | Yes | No | Full outbound/route/DNS document; xHTTP nodes are omitted with a warning. |
| Clash / Mihomo YAML | Yes | Yes | Yes | Partial | xHTTP emitted through Clash's `ws-opts` compatibility path where supported. |
| URI list | Yes | Yes | Yes | Yes | Canonical `vless://`, `trojan://`, `ss://` links. |
| Surge | Yes | Yes | Yes | No | Trojan/VMess-style policy lines. |
| Loon | Yes | Yes | Yes | No | Loon policy format. |
| Quantumult X | Yes | Yes | Yes | No | `vless=`/`trojan=`/`shadowsocks=` lines. |

Unsupported protocol/format pairs are rejected by the engine with `FORMAT_PROTOCOL_UNSUPPORTED`
instead of producing a broken document.

## Endpoint types

| Endpoint kind | Supported | Constraint |
| --- | --- | --- |
| IPv4 address | Yes | Blocked when `ipv4 = no`. |
| IPv6 address | Yes | Serialized in brackets; blocked when `ipv6 = no`. |
| Domain | Yes | Must be a valid hostname; no wildcards. |
| Cloudflare anycast IP | Yes | Only works when the Worker is actually deployed on that hostname path. |
| Static IP with VLESS/Trojan/Shadowsocks | Yes | Requires a reachable Worker deployment; the panel does not claim the node is live. |
| Proxy chain hop | Yes (validation only) | `socks5://`/`http://` hops are validated for syntax, loops and client compatibility. Reachability is checked only when the runtime can connect. |
| Custom DNS profile | Yes | DoH endpoint must be HTTPS; server-side test hits the profile's DoH endpoint. |

## DNS catalog

`GET /api/v1/dns` returns provider name, IPv4/IPv6 resolvers, DoH and DoT endpoints, filtering
behaviour, source documentation, and last verification. Included: Cloudflare, Google Public DNS,
Quad9, AdGuard DNS, and other public resolvers listed in `src/config/catalog.js`. The catalog version
is `2026-10-catalog-1`. Reachability tests run from the Worker, which does **not** prove reachability
from an end user's network — the UI states this.

DNS modes: `remote`, `direct`, `split`, `fakeip` (client-dependent). `fakeip` is warned about for
sing-box output because that core does not support it in the generated document.

## TLS fingerprints

Fingerprints come from a documented catalog (Chrome, Safari, Firefox, Edge, iOS, Android, random) with
client/version notes. Selecting a fingerprint changes the emitted `fp`/`utls` parameter; it does not
guarantee the traffic becomes indistinguishable from that browser.

## Client compatibility summary

- **sing-box / Hiddify / Karing** — native JSON with route rules and DNS block.
- **Clash Verge / Mihomo / FlClash** — YAML with proxies, proxy groups and rules.
- **v2rayNG / Streisand / Shadowrocket / Amnezia** — base64 URI list (default response) or `target=raw`.
- **Surge / Loon / Quantumult X** — dedicated text formats.

Clients that do not support a feature (for example xHTTP or Shadowsocks `none`) will fail to connect
even though the configuration is syntactically valid; the panel warns instead of hiding it.

## Runtime capability honesty

| Capability | Status |
| --- | --- |
| Configuration generation | Implemented and tested |
| Subscription delivery | Implemented and tested |
| Endpoint syntax/DNS/TCP/TLS/HTTP checks | Implemented; results labelled per level |
| Proxy protocol validation | Only where the runtime can complete a handshake; otherwise reported as not performed |
| Traffic accounting | Implemented for streams proxied by this Worker |
| Cloudflare API integration | Implemented HTTP client; "connected" requires a verified token |
| Native proxy cores (Xray/sing-box server) | Not available in Workers |
| REALITY | Not available |
| Arbitrary UDP forwarding | Not available |
