// ============================================================================
// miliconfigOS v4.0 - Configuration engine
// Turns stored user permissions + endpoint catalog + settings into validated,
// explainable configuration plans. No network calls and no fabrication: every
// rejection carries a machine-readable code and a bilingual reason.
// ============================================================================

import { normalizeEffectiveConfig } from '../config/defaults.js';
import { getDnsProfile, formatById, protocolById, TRANSPORTS } from '../config/catalog.js';
import { effectiveSettings } from '../config/schema.js';
import { isValidDomain, isValidIpAddress, isValidUuid, normalizeNodeHost } from './utils.js';

const PLAINTEXT_PORTS = new Set([80, 8080, 8880, 2052, 2082, 2086, 2095]);
const MAX_CHAIN_HOPS = 3;

export const OPTIMIZATION_POLICIES = {
  balanced: { health: 0.45, latency: 0.35, stability: 0.20 },
  latency: { health: 0.25, latency: 0.60, stability: 0.15 },
  stability: { health: 0.50, latency: 0.15, stability: 0.35 }
};

export function protocolEnabled(cfg, protocol) {
  const on = key => String(cfg[key] ?? '').toLowerCase() === 'yes';
  switch (protocol) {
    case 'vless': return on('ev');
    case 'trojan': return on('et');
    case 'xhttp': return on('ex');
    case 'shadowsocks': return on('es');
    default: return false;
  }
}

export function endpointFamily(host) {
  const clean = normalizeNodeHost(host);
  if (!clean) return 'invalid';
  if (clean.includes(':')) return 'ipv6';
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) return 'ipv4';
  return isValidDomain(clean) ? 'domain' : 'invalid';
}

export function parseChain(value) {
  const raw = String(value || '').trim();
  if (!raw) return { ok: true, hops: [] };
  const hops = [];
  for (const chunk of raw.split(',').map(item => item.trim()).filter(Boolean)) {
    let url;
    try {
      url = new URL(chunk);
    } catch (_e) {
      return { ok: false, error: { code: 'CHAIN_INVALID_URL', message: `Invalid proxy URL: ${chunk}` }, hops: [] };
    }
    const protocol = url.protocol.replace(':', '').toLowerCase();
    if (!['socks5', 'socks', 'http', 'https'].includes(protocol)) {
      return { ok: false, error: { code: 'CHAIN_UNSUPPORTED_PROTOCOL', message: `Unsupported chain protocol: ${protocol}` }, hops: [] };
    }
    const port = parseInt(url.port || (protocol === 'https' ? '443' : '80'), 10);
    if (!url.hostname || !Number.isFinite(port) || port < 1 || port > 65535) {
      return { ok: false, error: { code: 'CHAIN_INVALID_TARGET', message: `Invalid chain target: ${chunk}` }, hops: [] };
    }
    hops.push({
      protocol,
      host: url.hostname,
      port,
      auth: Boolean(url.username || url.password)
    });
  }
  if (hops.length > MAX_CHAIN_HOPS) {
    return { ok: false, error: { code: 'CHAIN_TOO_LONG', message: `At most ${MAX_CHAIN_HOPS} hops are supported.` }, hops };
  }
  return { ok: true, hops };
}

function dedupeKey(plan) {
  return [plan.protocol, plan.transport, plan.tlsMode, plan.endpointId, plan.dnsProfile].join('|');
}

/**
 * Validate a single candidate combination.
 */
export function validateCandidate(candidate, user = {}, settings = {}) {
  const cfg = normalizeEffectiveConfig({ ...(user.config || {}), ...settings });
  const issues = [];
  const add = (severity, code, en, fa) => issues.push({ severity, code, en, fa });

  const protocol = protocolById(candidate.protocol);
  if (!protocol) {
    add('error', 'PROTOCOL_UNKNOWN', 'Unknown protocol.', 'پروتکل ناشناخته است.');
    return { valid: false, issues };
  }
  if (!protocol.runtime) {
    add('error', 'PROTOCOL_NOT_IMPLEMENTED', `${protocol.label} is not implemented by this Worker.`, `${protocol.label} در این ورکر پیاده‌سازی نشده است.`);
  }
  if (!protocolEnabled(cfg, protocol.id)) {
    add('error', 'PROTOCOL_NOT_ALLOWED', `${protocol.label} is disabled for this user.`, `${protocol.label} برای این کاربر فعال نیست.`);
  }
  if (user.enabled === false) {
    add('error', 'USER_DISABLED', 'User is disabled.', 'کاربر غیرفعال است.');
  }
  if (Number(user.expireAt) > 0 && Number(user.expireAt) < Date.now()) {
    add('error', 'USER_EXPIRED', 'User subscription has expired.', 'اشتراک کاربر منقضی شده است.');
  }
  if (Number(user.dataLimitGb) > 0 && Number(user.usedBytes || 0) >= Number(user.dataLimitGb) * 1073741824) {
    add('error', 'USER_QUOTA_EXCEEDED', 'User quota is exhausted.', 'حجم مجاز کاربر تمام شده است.');
  }

  // Credentials
  if (protocol.requiresCredential === 'uuid' && !isValidUuid(user.uuid)) {
    add('error', 'MISSING_UUID', 'User UUID is missing or invalid.', 'UUID کاربر موجود یا معتبر نیست.');
  }
  if (protocol.requiresCredential === 'password') {
    const password = candidate.protocol === 'trojan' ? cfg.tp : cfg.sspass;
    const effective = password || user.uuid;
    if (!effective || String(effective).length < 8) {
      add('error', 'MISSING_PASSWORD', 'A credential with at least 8 characters is required.', 'یک اعتبارنامه با حداقل ۸ کاراکتر لازم است.');
    }
  }

  // Endpoint
  const host = normalizeNodeHost(candidate.host);
  const family = endpointFamily(host);
  if (!host || family === 'invalid') {
    add('error', 'ENDPOINT_INVALID', 'Endpoint host is not a valid IP address or domain.', 'میزبان اندپوینت IP یا دامنه معتبر نیست.');
  }
  if (family === 'ipv4' && String(cfg.ipv4) === 'no') {
    add('error', 'IPV4_DISABLED', 'IPv4 endpoints are disabled.', 'اندپوینت‌های IPv4 غیرفعال هستند.');
  }
  if (family === 'ipv6' && String(cfg.ipv6) === 'no') {
    add('error', 'IPV6_DISABLED', 'IPv6 endpoints are disabled.', 'اندپوینت‌های IPv6 غیرفعال هستند.');
  }
  const port = Number(candidate.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    add('error', 'PORT_INVALID', 'Endpoint port must be between 1 and 65535.', 'پورت اندپوینت باید بین ۱ تا ۶۵۵۳۵ باشد.');
  }

  // Transport
  const transport = TRANSPORTS[candidate.transport];
  if (!transport) {
    add('error', 'TRANSPORT_UNKNOWN', 'Unknown transport.', 'ترنسپورت ناشناخته است.');
  } else {
    if (!transport.runtime) {
      add('error', 'TRANSPORT_NOT_IMPLEMENTED', `${transport.label} is not implemented by this Worker.`, `${transport.label} در این ورکر پیاده‌سازی نشده است.`);
    }
    if (!transport.protocols.includes(protocol.id)) {
      add('error', 'TRANSPORT_PROTOCOL_MISMATCH', `${transport.label} cannot carry ${protocol.label}.`, `${transport.label} نمی‌تواند ${protocol.label} را حمل کند.`);
    }
  }

  const tlsMode = String(candidate.tlsMode || 'tls');
  if (!['tls', 'none'].includes(tlsMode)) {
    add('error', 'TLS_MODE_INVALID', 'TLS mode must be "tls" or "none".', 'حالت TLS باید «tls» یا «none» باشد.');
  }
  if (candidate.transport === 'xhttp' && tlsMode !== 'tls') {
    add('error', 'XHTTP_REQUIRES_TLS', 'xHTTP requires TLS.', 'xHTTP به TLS نیاز دارد.');
  }
  if (tlsMode === 'none' && PLAINTEXT_PORTS.has(port) === false) {
    add('warning', 'PLAINTEXT_ON_TLS_PORT', 'A plaintext node on a TLS port will fail; choose a Cloudflare plaintext port.', 'نود بدون TLS روی پورت TLS کار نمی‌کند؛ پورت بدون‌رمز کلادفلر انتخاب کنید.');
  }
  if (protocol.id === 'trojan' && tlsMode !== 'tls') {
    add('warning', 'TROJAN_PLAINTEXT', 'Trojan without TLS is detectable and not recommended.', 'تروجان بدون TLS قابل شناسایی است و توصیه نمی‌شود.');
  }

  // ECH
  const echOn = String(cfg.ech) === 'yes';
  if (echOn) {
    if (!tlsMode || tlsMode === 'none') {
      add('error', 'ECH_WITHOUT_TLS', 'ECH requires TLS.', 'ECH به TLS نیاز دارد.');
    }
    if (!getDnsProfile(String(cfg.dnsProfileId || '')) && !/^https:\/\/.+\/dns-query/.test(String(cfg.customDNS || ''))) {
      add('error', 'ECH_WITHOUT_DOH', 'ECH requires a DNS-over-HTTPS resolver.', 'ECH به DNS-over-HTTPS نیاز دارد.');
    }
    if (!String(cfg.customECHDomain || '').trim()) {
      add('error', 'ECH_CONFIG_MISSING', 'No ECH configuration domain is set.', 'دامنه پیکربندی ECH تعیین نشده است.');
    }
    add('warning', 'ECH_CLIENT_SUPPORT', 'ECH only works with clients that support it and a hostname publishing an HTTPS/SVCB record.', 'ECH فقط با کلاینت سازگار و میزبانی که رکورد HTTPS/SVCB منتشر می‌کند کار می‌کند.');
  }

  // DNS
  const dnsMode = String(cfg.dnsMode || 'remote');
  const dns = getDnsProfile(String(cfg.dnsProfileId || '')) || null;
  if (dns && dns.doh && !/^https:\/\//.test(dns.doh)) {
    add('warning', 'DNS_NOT_DOH', 'DNS profile has no DoH endpoint.', 'پروفایل DNS نقطه DoH ندارد.');
  }
  if (dnsMode === 'fakeip' && candidate.format === 'singbox') {
    add('warning', 'FAKEIP_UNSUPPORTED_FORMAT', 'Fake-IP is not available in sing-box output.', 'Fake-IP در خروجی sing-box پشتیبانی نمی‌شود.');
  }

  // Output format
  const format = candidate.format ? formatById(candidate.format) : null;
  if (candidate.format && !format) {
    add('error', 'FORMAT_UNKNOWN', 'Unknown subscription format.', 'فرمت اشتراک ناشناخته است.');
  } else if (format) {
    if (!format.supports.includes(protocol.id)) {
      add('error', 'FORMAT_PROTOCOL_UNSUPPORTED', `${format.label} cannot represent ${protocol.label}.`, `${format.label} نمی‌تواند ${protocol.label} را نمایش دهد.`);
    } else if (protocol.id === 'xhttp' && format.xhttp === false) {
      add('warning', 'FORMAT_XHTTP_UNSUPPORTED', `${format.label} cannot represent xHTTP; the node will be omitted in that output.`, `${format.label} از xHTTP پشتیبانی نمی‌کند؛ این نود در آن خروجی حذف می‌شود.`);
    }
  }

  // Chain
  const chain = parseChain(candidate.chain || cfg.s || '');
  if (!chain.ok) {
    add('error', chain.error.code, chain.error.message, chain.error.message);
  } else if (chain.hops.length) {
    for (const hop of chain.hops) {
      if (hop.host === host && hop.port === port) {
        add('error', 'CHAIN_LOOP', 'The proxy chain loops back to the endpoint.', 'زنجیره پروکسی به خود اندپوینت برمی‌گردد.');
      }
      if (String(cfg.jk) !== 'yes') {
        add('warning', 'CHAIN_REQUIRES_FLAG', 'A proxy chain is configured but the home-chain flag (jk) is off; the chain is not used by clients.', 'زنجیره پروکسی تنظیم شده اما گزینه jk خاموش است؛ کلاینت از آن استفاده نمی‌کند.');
      }
    }
  }

  return {
    valid: !issues.some(issue => issue.severity === 'error'),
    issues
  };
}

function hashString(text) {
  let hash = 2166136261;
  const value = String(text || '');
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function scoreCandidate({ endpoint, protocol, policy = 'balanced', user }) {
  const weights = OPTIMIZATION_POLICIES[policy] || OPTIMIZATION_POLICIES.balanced;
  const checked = Number(endpoint.lastCheckAt || 0) > 0;
  const health = checked ? Math.max(0, Math.min(100, Number(endpoint.healthScore || 0))) : 40;
  const latency = Number(endpoint.lastLatencyMs || 0);
  const latencyScore = latency > 0 ? Math.max(0, Math.min(100, 100 - latency / 5)) : 30;
  const failures = Math.max(0, Number(endpoint.failureCount || 0));
  const stability = Math.max(0, Math.min(100, 100 - failures * 12));
  const protocolBonus = { vless: 5, xhttp: 4, trojan: 3, shadowsocks: 1 }[protocol] || 0;
  const freshness = checked ? Math.max(0, 1 - (Date.now() - Number(endpoint.lastCheckAt)) / (7 * 86400000)) : 0;
  const tieBreak = hashString(`${user?.id || ''}:${endpoint.id || endpoint.host}`);

  const score = (
    health * weights.health +
    latencyScore * weights.latency +
    stability * weights.stability +
    protocolBonus +
    freshness * 3 +
    tieBreak * 2
  );
  return Math.round(Math.max(0, Math.min(100, score)) * 100) / 100;
}

export function explainSelection({ endpoint, protocol, format, score, policy }) {
  const reasons = [
    {
      code: 'POLICY',
      en: `Selected under the "${policy}" optimization policy.`,
      fa: `انتخاب‌شده بر اساس سیاست بهینه‌سازی «${policy}».`
    },
    {
      code: 'SCORE',
      en: `Compatibility score ${score} (health ${endpoint.healthScore || 0}, latency ${endpoint.lastLatencyMs || 0} ms, failures ${endpoint.failureCount || 0}).`,
      fa: `امتیاز سازگاری ${score} (سلامت ${endpoint.healthScore || 0}، تأخیر ${endpoint.lastLatencyMs || 0} میلی‌ثانیه، خطا ${endpoint.failureCount || 0}).`
    }
  ];
  if (!Number(endpoint.lastCheckAt || 0)) {
    reasons.push({
      code: 'UNVERIFIED_ENDPOINT',
      en: 'Endpoint has not been health-checked yet; it is not advertised as fast.',
      fa: 'سلامت اندپوینت هنوز بررسی نشده و به‌عنوان سریع معرفی نمی‌شود.'
    });
  }
  if (protocol === 'xhttp') {
    reasons.push({
      code: 'XHTTP_TRANSPORT',
      en: 'xHTTP is delivered as a VLESS transport and is unsupported in some client formats.',
      fa: 'xHTTP به‌صورت ترنسپورت VLESS ارائه می‌شود و در برخی فرمت‌های کلاینت پشتیبانی نمی‌شود.'
    });
  }
  if (format) {
    reasons.push({
      code: 'FORMAT',
      en: `Output format ${format.label}.`,
      fa: `فرمت خروجی ${format.label}.`
    });
  }
  return reasons;
}

/**
 * Build and validate all candidate plans for a user.
 * @returns {{ valid: Array, rejected: Array, formats: Array }}
 */
export function buildPlans({ user, endpoints = [], settings = {}, formats = [], limit = 24 }) {
  const cfg = normalizeEffectiveConfig({ ...(user.config || {}), ...settings });
  const merged = effectiveSettings(cfg);
  const policy = String(merged.optimizationPolicy || 'balanced');
  const allowedFormats = (formats.length ? formats : String(merged.subFormats || 'uri').split(','))
    .map(id => formatById(id))
    .filter(Boolean);
  const tlsModeFor = endpoint => (PLAINTEXT_PORTS.has(Number(endpoint.port)) ? 'none' : 'tls');
  const dnsProfile = getDnsProfile(String(cfg.dnsProfileId || 'cloudflare'))?.id || 'custom';
  const chain = String(cfg.s || '');

  const protocolsToTry = ['vless', 'trojan', 'shadowsocks', 'xhttp'].filter(id => protocolEnabled(cfg, id));
  const candidates = [];
  const rejected = [];
  const seen = new Set();

  for (const endpoint of endpoints) {
    if (!endpoint || endpoint.enabled === false) continue;
    const base = {
      endpointId: endpoint.id || '',
      host: endpoint.host,
      port: endpoint.port,
      chain: chain || '',
      dnsProfile
    };
    const combos = [];
    for (const protocol of protocolsToTry) {
      if (protocol === 'xhttp') {
        combos.push({ ...base, protocol, transport: 'xhttp', tlsMode: 'tls' });
      } else if (protocol === 'trojan') {
        combos.push({ ...base, protocol, transport: 'ws', tlsMode: tlsModeFor(endpoint) });
      } else {
        combos.push({ ...base, protocol, transport: 'ws', tlsMode: tlsModeFor(endpoint) });
      }
    }

    for (const combo of combos) {
      for (const format of allowedFormats) {
        const candidate = { ...combo, format: format.id };
        const key = dedupeKey(candidate) + '|' + format.id;
        if (seen.has(key)) continue;
        seen.add(key);
        const validation = validateCandidate(candidate, user, cfg);
        if (!validation.valid) {
          rejected.push({
            ...candidate,
            endpointName: endpoint.name,
            reason: validation.issues.find(issue => issue.severity === 'error')
          });
          continue;
        }
        const score = scoreCandidate({ endpoint, protocol: candidate.protocol, policy, user });
        candidates.push({
          ...candidate,
          endpointName: endpoint.name,
          country: endpoint.country || '',
          score,
          healthScore: Number(endpoint.healthScore || 0),
          latencyMs: Number(endpoint.lastLatencyMs || 0),
          issues: validation.issues,
          reasons: explainSelection({ endpoint, protocol: candidate.protocol, format, score, policy })
        });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.endpointId.localeCompare(b.endpointId));
  const valid = candidates.slice(0, Math.max(1, limit));
  return {
    valid,
    rejected: rejected.slice(0, 50),
    formats: allowedFormats.map(format => format.id),
    policy
  };
}

export function configurationRow(plan, userId, now = Date.now(), index = 0) {
  // Two plans can share the same dedupe key while differing in client format,
  // so the position in the generated batch is part of the identifier.
  const finger = Math.round(hashString(`${userId}|${dedupeKey(plan)}|${now}`) * 0xffffffff) >>> 0;
  const id = `cfg-${finger.toString(36)}-${Number(index || 0).toString(36)}`;
  return {
    id,
    userId,
    protocol: plan.protocol,
    endpointId: plan.endpointId || '',
    transport: plan.transport,
    tlsMode: plan.tlsMode,
    dnsProfile: plan.dnsProfile || '',
    chain: JSON.stringify(plan.chain ? [plan.chain] : []),
    clientFormat: plan.format || '',
    valid: 1,
    validation: JSON.stringify({
      issues: plan.issues || [],
      reasons: plan.reasons || [],
      score: plan.score || 0
    }),
    reason: (plan.reasons || []).map(item => item.en).join(' '),
    score: Math.round(Number(plan.score || 0)),
    createdAt: now
  };
}

export function summarizeRejections(rejected = []) {
  const counts = new Map();
  for (const item of rejected) {
    const code = item.reason?.code || 'UNKNOWN';
    counts.set(code, (counts.get(code) || 0) + 1);
  }
  return [...counts.entries()].map(([code, count]) => ({ code, count }));
}
