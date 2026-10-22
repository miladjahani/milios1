// ============================================================================
// miliconfigOS v4.0 - ECH finder
// Reads the ECHConfigList published for a hostname in its HTTPS (type 65) or
// SVCB (type 64) DNS record through DNS-over-HTTPS, so generated links can
// carry the real config instead of only the "domain + resolver" lookup form.
// ============================================================================

import { isPrivateHost } from '../config/schema.js';
import { isValidDomain, normalizeNodeHost } from './utils.js';

// Both endpoints speak the JSON DoH API. Google's JSON API lives on /resolve;
// /dns-query on that host is the binary wireformat endpoint and answers 400.
const DOH_RESOLVERS = [
  'https://cloudflare-dns.com/dns-query',
  'https://dns.google/resolve'
];

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

export function clearEchCache() {
  cache.clear();
}

/**
 * Parse the presentation form of an HTTPS/SVCB record:
 *   "1 . alpn=h3,h2 ipv4hint=104.21.0.1 ech=AEX+... ipv6hint=2606:4700::1"
 */
export function parseHttpsRecord(data) {
  const text = String(data || '').trim();
  if (!text) return { target: '', alpn: [], ipv4hint: [], ipv6hint: [], echConfig: '' };
  const parts = text.split(/\s+/);
  const target = parts[1] && parts[1] !== '.' ? parts[1] : '';
  const params = new Map();
  for (const part of parts.slice(2)) {
    const eq = part.indexOf('=');
    const key = (eq > -1 ? part.slice(0, eq) : part).toLowerCase();
    // SvcParam values may be quoted; ech base64 can contain + / = so keep it intact.
    let value = eq > -1 ? part.slice(eq + 1) : '';
    if (value.startsWith('"') && value.endsWith('"') && value.length > 1) value = value.slice(1, -1);
    params.set(key, value);
  }
  const splitList = key => String(params.get(key) || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return {
    target,
    alpn: splitList('alpn'),
    ipv4hint: splitList('ipv4hint'),
    ipv6hint: splitList('ipv6hint'),
    echConfig: String(params.get('ech') || '').trim()
  };
}

function httpsAnswers(payload) {
  const answers = Array.isArray(payload?.Answer) ? payload.Answer : [];
  // 65 = HTTPS, 64 = SVCB. HTTPS wins when both are present.
  const https = answers.filter(record => Number(record?.type) === 65);
  const svcb = answers.filter(record => Number(record?.type) === 64);
  return [...https, ...svcb];
}

async function queryResolver(resolver, host) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${resolver}?name=${encodeURIComponent(host)}&type=HTTPS`, {
      headers: {
        Accept: 'application/dns-json',
        'User-Agent': 'miliconfigos-echfinder/4.0'
      },
      signal: controller.signal
    });
    if (!res.ok) return { ok: false, detail: `DoH HTTP ${res.status}` };
    const payload = await res.json().catch(() => ({}));
    const records = httpsAnswers(payload);
    if (!records.length) return { ok: false, detail: 'No HTTPS/SVCB record' };
    for (const record of records) {
      const parsed = parseHttpsRecord(record?.data);
      if (parsed.echConfig) {
        return { ok: true, detail: 'HTTPS/SVCB record publishes an ech parameter', parsed, record: record.data, resolver };
      }
    }
    return { ok: false, detail: 'HTTPS record found but no ech parameter', record: records[0]?.data || '', resolver };
  } catch (err) {
    return { ok: false, detail: String(err?.message || err).slice(0, 120), resolver };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Find the ECHConfigList for a hostname.
 * @returns {Promise<{ok: boolean, host: string, echConfig: string, record: string,
 *   alpn: string[], ipv4hint: string[], ipv6hint: string[], detail: string,
 *   resolver: string, cached: boolean}>}
 */
export async function findEchConfig(hostname, options = {}) {
  const host = normalizeNodeHost(hostname);
  const base = {
    ok: false,
    host,
    echConfig: '',
    record: '',
    alpn: [],
    ipv4hint: [],
    ipv6hint: [],
    detail: '',
    resolver: '',
    cached: false
  };
  if (!host || !isValidDomain(host)) {
    return { ...base, detail: 'Not a DNS name' };
  }
  if (isPrivateHost(host)) {
    return { ...base, detail: 'Private hostnames are not resolved' };
  }

  if (options.refresh !== true) {
    const hit = cache.get(host);
    if (hit && hit.expiresAt > Date.now()) {
      return { ...hit.value, cached: true };
    }
  }

  let last = null;
  for (const resolver of DOH_RESOLVERS) {
    const result = await queryResolver(resolver, host);
    // Keep the first resolver's verdict for the failure report; later resolvers
    // are only a fallback for transport errors.
    if (!last) last = result;
    if (result.ok) {
      const value = {
        ...base,
        ok: true,
        echConfig: result.parsed.echConfig,
        record: result.record || '',
        alpn: result.parsed.alpn,
        ipv4hint: result.parsed.ipv4hint,
        ipv6hint: result.parsed.ipv6hint,
        detail: result.detail,
        resolver
      };
      cache.set(host, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return { ...value, cached: false };
    }
  }

  const value = {
    ...base,
    record: last?.record || '',
    detail: last?.detail || 'ECH lookup failed',
    resolver: last?.resolver || ''
  };
  // Cache negative results briefly so a broken record is not queried per request.
  cache.set(host, { value, expiresAt: Date.now() + 60 * 1000 });
  return { ...value, cached: false };
}
