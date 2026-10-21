// ============================================================================
// miliconfigOS v4.0 - Verified configuration catalogs
// Each entry references the vendor documentation it was taken from.
// Nothing here is invented: if a capability is not implemented by this Worker
// it is marked `runtime: false` instead of being shown as available.
// ============================================================================

export const CATALOG_VERSION = '2026-10-catalog-1';

// ---------------------------------------------------------------------------
// DNS resolvers (public addresses + DoH/DoT endpoints)
// ---------------------------------------------------------------------------
export const DNS_PROFILES = [
  {
    id: 'cloudflare',
    provider: 'Cloudflare',
    label: { fa: 'کلادفلر', en: 'Cloudflare' },
    ipv4: ['1.1.1.1', '1.0.0.1'],
    ipv6: ['2606:4700:4700::1111', '2606:4700:4700::1001'],
    doh: 'https://cloudflare-dns.com/dns-query',
    dot: 'one.one.one.one:853',
    filtering: 'none',
    privacy: 'https://www.cloudflare.com/privacypolicy/',
    source: 'https://developers.cloudflare.com/1.1.1.1/',
    verified: true
  },
  {
    id: 'google',
    provider: 'Google Public DNS',
    label: { fa: 'گوگل', en: 'Google' },
    ipv4: ['8.8.8.8', '8.8.4.4'],
    ipv6: ['2001:4860:4860::8888', '2001:4860:4860::8844'],
    doh: 'https://dns.google/dns-query',
    dot: 'dns.google:853',
    filtering: 'none',
    privacy: 'https://developers.google.com/speed/public-dns/privacy',
    source: 'https://developers.google.com/speed/public-dns/docs/doh',
    verified: true
  },
  {
    id: 'quad9',
    provider: 'Quad9',
    label: { fa: 'کواد۹', en: 'Quad9' },
    ipv4: ['9.9.9.9', '149.112.112.112'],
    ipv6: ['2620:fe::fe', '2620:fe::9'],
    doh: 'https://dns.quad9.net/dns-query',
    dot: 'dns.quad9.net:853',
    filtering: 'malware',
    privacy: 'https://www.quad9.net/privacy/policy/',
    source: 'https://www.quad9.net/service/service-addresses-and-features/',
    verified: true
  },
  {
    id: 'adguard',
    provider: 'AdGuard DNS',
    label: { fa: 'ادگارد', en: 'AdGuard' },
    ipv4: ['94.140.14.14', '94.140.15.15'],
    ipv6: ['2a10:50c0::ad1:ff', '2a10:50c0::ad2:ff'],
    doh: 'https://dns.adguard-dns.com/dns-query',
    dot: 'dns.adguard-dns.com:853',
    filtering: 'ads-and-trackers',
    privacy: 'https://adguard-dns.io/en/privacy.html',
    source: 'https://adguard-dns.io/kb/general/dns-providers/',
    verified: true
  },
  {
    id: 'opendns',
    provider: 'OpenDNS',
    label: { fa: 'اوپن‌دی‌ان‌اس', en: 'OpenDNS' },
    ipv4: ['208.67.222.222', '208.67.220.220'],
    ipv6: ['2620:119:35::35', '2620:119:53::53'],
    doh: 'https://doh.opendns.com/dns-query',
    dot: 'dns.opendns.com:853',
    filtering: 'optional-category',
    privacy: 'https://www.cisco.com/c/en/us/about/legal/privacy-full.html',
    source: 'https://docs.opendns.com/',
    verified: true
  },
  {
    id: 'mullvad',
    provider: 'Mullvad DNS',
    label: { fa: 'مول‌واد', en: 'Mullvad' },
    ipv4: ['194.242.2.2'],
    ipv6: ['2a07:e340::2'],
    doh: 'https://dns.mullvad.net/dns-query',
    dot: 'dns.mullvad.net:853',
    filtering: 'none',
    privacy: 'https://mullvad.net/en/help/privacy-policy',
    source: 'https://mullvad.net/en/help/dns-over-https-and-dns-over-tls',
    verified: true
  },
  {
    id: 'nextdns',
    provider: 'NextDNS',
    label: { fa: 'نکست‌دی‌ان‌اس', en: 'NextDNS' },
    ipv4: ['45.90.28.0', '45.90.30.0'],
    ipv6: ['2a07:a8c0::', '2a07:a8c1::'],
    doh: '',
    dot: '',
    filtering: 'configurable',
    privacy: 'https://nextdns.io/privacy',
    source: 'https://nextdns.io/',
    verified: true,
    note: 'NextDNS requires your personal configuration ID before DoH/DoT can be used.'
  }
];

export const DNS_MODES = [
  { id: 'remote', label: { fa: 'Remote DNS (پروکسی)', en: 'Remote DNS (proxied)' }, supportedBy: ['singbox', 'clash', 'uri'] },
  { id: 'direct', label: { fa: 'Direct DNS (مستقیم)', en: 'Direct DNS' }, supportedBy: ['singbox', 'clash'] },
  { id: 'split', label: { fa: 'Split DNS (تفکیکی)', en: 'Split DNS' }, supportedBy: ['singbox', 'clash'] },
  { id: 'fakeip', label: { fa: 'Fake-IP', en: 'Fake-IP' }, supportedBy: ['clash'] }
];

// ---------------------------------------------------------------------------
// TLS fingerprints (uTLS ClientHello templates)
// ---------------------------------------------------------------------------
export const TLS_FINGERPRINTS = [
  { id: 'chrome', label: 'Chrome', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS chrome template.' },
  { id: 'firefox', label: 'Firefox', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS firefox template.' },
  { id: 'safari', label: 'Safari', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS safari template.' },
  { id: 'ios', label: 'iOS', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS iOS template.' },
  { id: 'android', label: 'Android', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS android template.' },
  { id: 'edge', label: 'Edge', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS edge template.' },
  { id: 'randomized', label: 'Randomized', clients: ['xray', 'sing-box'], verified: true, note: 'Randomizes ClientHello; some servers reject it.' }
];

export const TLS_FINGERPRINT_NOTE =
  'A fingerprint selects a uTLS ClientHello template. It does not guarantee that the traffic is indistinguishable from that browser.';

// ---------------------------------------------------------------------------
// ECH catalog
// ECH requires a real HTTPS/SVCB record with an `ech` parameter. Selecting a
// hostname here only makes the engine check that record before delivery.
// ---------------------------------------------------------------------------
export const ECH_ENTRIES = [
  { host: 'cloudflare-ech.com', requiresHttpsRecord: true, clients: ['xray-recent', 'sing-box-recent'], source: 'https://blog.cloudflare.com/ech-networks-cf-workers-and-gateway/' },
  { host: 'crypto.cloudflare.com', requiresHttpsRecord: true, clients: ['xray-recent', 'sing-box-recent'], source: 'https://developers.cloudflare.com/ssl/edge-certificates/ech/' },
  { host: 'cloudflare-dns.com', requiresHttpsRecord: true, clients: ['xray-recent', 'sing-box-recent'], source: 'https://developers.cloudflare.com/1.1.1.1/' },
  { host: 'one.one.one.one', requiresHttpsRecord: true, clients: ['xray-recent', 'sing-box-recent'], source: 'https://developers.cloudflare.com/1.1.1.1/' }
];

// ---------------------------------------------------------------------------
// Protocol / transport capability matrix
// ---------------------------------------------------------------------------
export const PROTOCOLS = {
  vless: {
    id: 'vless',
    label: 'VLESS',
    requiresCredential: 'uuid',
    transports: ['ws', 'xhttp'],
    runtime: true,
    configGeneration: true,
    udp: 'dns-only',
    tls: true,
    reality: false,
    ech: 'conditional',
    notes: { en: 'VLESS over WebSocket and xHTTP is implemented by this Worker.', fa: 'VLESS روی WebSocket و xHTTP در این ورکر پیاده‌سازی شده است.' }
  },
  trojan: {
    id: 'trojan',
    label: 'Trojan',
    requiresCredential: 'password',
    transports: ['ws'],
    runtime: true,
    configGeneration: true,
    udp: 'dns-only',
    tls: true,
    reality: false,
    ech: 'conditional',
    notes: { en: 'Trojan over TLS/WebSocket is implemented by this Worker.', fa: 'تروجان روی TLS/WebSocket در این ورکر پیاده‌سازی شده است.' }
  },
  shadowsocks: {
    id: 'shadowsocks',
    label: 'Shadowsocks',
    requiresCredential: 'password',
    transports: ['ws'],
    runtime: true,
    configGeneration: true,
    udp: false,
    tls: 'via-plugin',
    reality: false,
    ech: false,
    notes: {
      en: 'The Worker reads the Shadowsocks header in plain mode only (cipher "none") and requires the v2ray-plugin WebSocket transport. AEAD ciphers are not implemented.',
      fa: 'این ورکر هدر Shadowsocks را فقط به‌صورت متنی (cipher «none») می‌خواند و به ترنسپورت WebSocket با v2ray-plugin نیاز دارد. الگوریتم‌های AEAD پیاده‌سازی نشده‌اند.'
    }
  },
  xhttp: {
    id: 'xhttp',
    label: 'xHTTP (VLESS)',
    requiresCredential: 'uuid',
    transports: ['xhttp'],
    runtime: true,
    configGeneration: true,
    udp: 'dns-only',
    tls: true,
    reality: false,
    ech: 'conditional',
    notes: { en: 'xHTTP is a VLESS transport in this Worker, not a separate protocol.', fa: 'xHTTP در این ورکر یک ترنسپورت VLESS است، نه پروتکل جداگانه.' }
  }
};

export const TRANSPORTS = {
  ws: { id: 'ws', label: 'WebSocket', runtime: true, protocols: ['vless', 'trojan', 'shadowsocks'] },
  xhttp: { id: 'xhttp', label: 'xHTTP', runtime: true, protocols: ['vless', 'xhttp'], requiresTls: true },
  grpc: { id: 'grpc', label: 'gRPC', runtime: false, protocols: [], reason: 'Not implemented by this Worker.' },
  h2: { id: 'h2', label: 'HTTP/2', runtime: false, protocols: [], reason: 'Not implemented by this Worker.' }
};

export const OUTPUT_FORMATS = [
  { id: 'singbox', label: 'sing-box JSON', ext: 'json', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: false },
  { id: 'clash', label: 'Clash / Mihomo YAML', ext: 'yaml', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: 'partial' },
  { id: 'uri', label: 'URI list', ext: 'txt', supports: ['vless', 'trojan', 'shadowsocks', 'xhttp'], xhttp: true },
  { id: 'surge', label: 'Surge', ext: 'txt', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: false },
  { id: 'loon', label: 'Loon', ext: 'txt', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: false },
  { id: 'quanx', label: 'Quantumult X', ext: 'txt', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: false }
];

export function getDnsProfile(id) {
  return DNS_PROFILES.find(item => item.id === String(id || '').toLowerCase()) || null;
}

export function getDnsValue(id) {
  const profile = getDnsProfile(id);
  return profile && profile.doh ? profile.doh : '';
}

export function fingerprintById(id) {
  return TLS_FINGERPRINTS.find(item => item.id === String(id || '').toLowerCase()) || null;
}

export function protocolById(id) {
  const key = String(id || '').toLowerCase();
  if (key === 'ss') return PROTOCOLS.shadowsocks;
  return PROTOCOLS[key] || null;
}

export function formatById(id) {
  return OUTPUT_FORMATS.find(item => item.id === String(id || '').toLowerCase()) || null;
}

export function capabilityMatrix() {
  return {
    runtime: 'Cloudflare Workers (V8 isolates, fetch + WebSocket)',
    protocols: Object.values(PROTOCOLS),
    transports: Object.values(TRANSPORTS),
    formats: OUTPUT_FORMATS,
    limits: [
      { en: 'No arbitrary raw TCP or general UDP forwarding.', fa: 'بدون فوروارد TCP خام یا UDP عمومی.' },
      { en: 'REALITY is not available on the Cloudflare edge and is not offered.', fa: 'REALITY روی لبه کلادفلر در دسترس نیست و ارائه نمی‌شود.' },
      { en: 'ECH depends on a valid HTTPS/SVCB record and client support.', fa: 'ECH به رکورد معتبر HTTPS/SVCB و پشتیبانی کلاینت وابسته است.' },
      { en: 'A generated subscription is not proof that a tunnel is working.', fa: 'ساب‌لینک تولیدشده دلیل کارکرد تونل نیست.' }
    ]
  };
}
