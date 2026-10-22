// ============================================================================
// miliconfigOS v4.0 - Layered endpoint scanner
// Levels are independent and reported separately:
//   syntax -> dns -> tcp -> tls -> http
// "proxy" is only reported when an actual protocol exchange is performed, which
// this Worker does not implement for third-party endpoints.
// ============================================================================

import { connect } from 'cloudflare:sockets';
import { findEchConfig } from './ech.js';
import { interpretTlsProbe, mapLimit, parseDohAnswer, scoreHealth } from './health.js';
import { isValidDomain, isValidIpAddress, normalizeNodeHost } from './utils.js';

const DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

function withTimeout(promise, ms, message = 'timeout') {
  return Promise.race([
    promise,
    new Promise((_resolve, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
}

export async function probeTcpPort(host, port, timeoutMs = 2500) {
  const started = Date.now();
  let socket;
  try {
    socket = connect({ hostname: host, port });
    await withTimeout(socket.opened, timeoutMs, 'tcp-timeout');
    const latencyMs = Date.now() - started;
    try { socket.close(); } catch (_e) {}
    return { ok: true, performed: true, latencyMs, detail: 'TCP connection established' };
  } catch (err) {
    try { if (socket) socket.close(); } catch (_e2) {}
    return { ok: false, performed: true, latencyMs: 0, detail: String(err?.message || err).slice(0, 120) };
  }
}

export async function probeDns(host, timeoutMs = 3000) {
  if (isValidIpAddress(host)) {
    return { ok: true, performed: true, detail: 'Host is already an IP address', addresses: [host] };
  }
  if (!isValidDomain(host)) {
    return { ok: false, performed: true, detail: 'Not a DNS name' };
  }
  try {
    const res = await withTimeout(
      fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(host)}&type=A`, {
        headers: { Accept: 'application/dns-json', 'User-Agent': 'miliconfigos-scanner/4.0' }
      }),
      timeoutMs,
      'dns-timeout'
    );
    if (!res.ok) {
      return { ok: false, performed: true, detail: `DoH HTTP ${res.status}` };
    }
    const payload = await res.json();
    const parsed = parseDohAnswer(payload);
    return { ok: parsed.ok, performed: true, detail: parsed.detail, addresses: parsed.addresses };
  } catch (err) {
    return { ok: false, performed: true, detail: String(err?.message || err).slice(0, 120) };
  }
}

export async function probeTls(host, port, timeoutMs = 4000) {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const safeHost = host.includes(':') ? `[${host}]` : host;
    const res = await fetch(`https://${safeHost}:${port}/`, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': 'miliconfigos-scanner/4.0' }
    });
    clearTimeout(timer);
    return interpretTlsProbe({ status: res.status, latencyMs: Date.now() - started });
  } catch (err) {
    return interpretTlsProbe({ error: err?.message || err });
  }
}

export async function probeHttp(host, port, timeoutMs = 4000) {
  const started = Date.now();
  const safeHost = host.includes(':') ? `[${host}]` : host;
  const schemes = port === 80 ? ['http'] : ['https', 'http'];
  let lastError = 'no-attempt';
  for (const scheme of schemes) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${scheme}://${safeHost}:${port}/`, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'miliconfigos-scanner/4.0' }
      });
      clearTimeout(timer);
      return {
        ok: res.status > 0 && res.status < 500,
        performed: true,
        status: res.status,
        latencyMs: Date.now() - started,
        detail: `${scheme.toUpperCase()} ${res.status}`
      };
    } catch (err) {
      lastError = String(err?.message || err);
    }
  }
  return { ok: false, performed: true, detail: lastError.slice(0, 120) };
}

/**
 * Run the requested layers against one host.
 * @param {object} target { host, port, levels?: string[], tls?: boolean }
 */
export async function checkTarget(target, options = {}) {
  const host = normalizeNodeHost(target?.host);
  const port = parseInt(target?.port, 10) || 443;
  const timeoutMs = Math.min(15000, Math.max(500, Number(options.timeoutMs) || 4000));
  const requested = Array.isArray(target?.levels) && target.levels.length
    ? target.levels
    : ['syntax', 'dns', 'tcp', 'tls', 'http'];

  const checks = {};
  const syntaxOk = Boolean(host) && port >= 1 && port <= 65535 && (isValidIpAddress(host) || isValidDomain(host));
  checks.syntax = {
    performed: true,
    ok: syntaxOk,
    detail: syntaxOk ? 'Address and port are well formed' : 'Invalid host or port'
  };
  if (!syntaxOk) {
    return { host, port, checks, ...scoreHealth({ checks }), checkedAt: Date.now() };
  }

  if (requested.includes('dns')) checks.dns = await probeDns(host, timeoutMs);

  const tcpEnabled = requested.some(level => ['tcp', 'tls', 'http'].includes(level));
  if (tcpEnabled) {
    checks.tcp = await probeTcpPort(host, port, Math.min(timeoutMs, 4000));
    if (!checks.tcp.ok) {
      return { host, port, checks, ...scoreHealth({ checks }), checkedAt: Date.now() };
    }
  }
  if (requested.includes('tls') && port !== 80) checks.tls = await probeTls(host, port, timeoutMs);
  if (requested.includes('http')) checks.http = await probeHttp(host, port, timeoutMs);

  return {
    host,
    port,
    checks,
    ...scoreHealth({ checks }),
    checkedAt: Date.now()
  };
}

/**
 * Scan many endpoints with bounded concurrency.
 */
export async function scanTargets(targets = [], options = {}) {
  const concurrency = Math.min(8, Math.max(1, Number(options.concurrency) || 4));
  const started = Date.now();
  const results = await mapLimit(targets, concurrency, target => checkTarget(target, options));
  return {
    results,
    concurrency,
    durationMs: Date.now() - started,
    checkedAt: Date.now()
  };
}

/**
 * ECH verification: look for an HTTPS/SVCB record through DoH and return the
 * ECHConfigList when the record publishes one.
 */
export async function checkEchRecord(hostname) {
  const host = normalizeNodeHost(hostname);
  if (!isValidDomain(host)) {
    return { ok: false, detail: 'Not a DNS name', record: null, echConfig: '' };
  }
  const found = await findEchConfig(host);
  return {
    ok: found.ok,
    detail: found.detail,
    record: found.record || null,
    echConfig: found.echConfig || '',
    alpn: found.alpn,
    ipv4hint: found.ipv4hint,
    ipv6hint: found.ipv6hint,
    resolver: found.resolver || ''
  };
}
