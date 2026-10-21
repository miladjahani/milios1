// ============================================================================
// miliconfigOS v4.0 - Health scoring (pure, testable)
// A successful TCP connect is not a working proxy. The score reflects only the
// checks that were actually performed and is capped by the highest verified
// check level.
// ============================================================================

export const CHECK_LEVELS = ['syntax', 'dns', 'tcp', 'tls', 'http', 'proxy'];

const LEVEL_WEIGHT = {
  syntax: 5,
  dns: 15,
  tcp: 30,
  tls: 25,
  http: 15,
  proxy: 10
};

export function rankLevel(level) {
  const idx = CHECK_LEVELS.indexOf(level);
  return idx < 0 ? -1 : idx;
}

/**
 * @param {object} result { checks: { syntax:{ok}, dns:{ok}, tcp:{ok}, tls:{ok}, http:{ok}, proxy:{ok} } }
 * @returns {{ score:number, status:string, verifiedLevel:string, performed:string[] }}
 */
export function scoreHealth(result = {}) {
  const checks = result.checks || {};
  const performed = CHECK_LEVELS.filter(level => checks[level] && checks[level].performed !== false);
  const syntaxOk = checks.syntax ? checks.syntax.ok : true;
  if (!syntaxOk) {
    return { score: 0, status: 'invalid', verifiedLevel: 'syntax', performed };
  }

  let score = 0;
  let highest = 'syntax';
  for (const level of performed) {
    if (!checks[level].ok) continue;
    score += LEVEL_WEIGHT[level] || 0;
    if (rankLevel(level) > rankLevel(highest)) highest = level;
  }

  const tcp = checks.tcp;
  const tls = checks.tls;
  let status = 'unreachable';
  if (checks.proxy && checks.proxy.ok) status = 'proxy-verified';
  else if (checks.http && checks.http.ok) status = 'http-ok';
  else if (tls && tls.ok) status = 'tls-ok';
  else if (tcp && tcp.ok) status = 'reachable';
  else if (checks.dns && checks.dns.ok) status = 'dns-only';

  // Never label an endpoint healthy from TCP alone: the proxy protocol was not
  // exercised from the Worker.
  const latency = Number(tcp?.latencyMs || 0);
  const latencyPenalty = latency > 0 ? Math.min(20, Math.floor(latency / 50)) : 0;
  score = Math.max(0, Math.min(95, Math.round(score - latencyPenalty)));
  if (status === 'reachable' || status === 'dns-only') score = Math.min(score, 55);

  return { score, status, verifiedLevel: highest, performed };
}

/**
 * Interpret a certificate-less TLS probe.
 * `fetch()` performs the TLS handshake; a response or an HTTP error proves the
 * handshake succeeded, a network error does not.
 */
export function interpretTlsProbe(outcome = {}) {
  if (outcome.error) {
    return { ok: false, performed: true, detail: String(outcome.error).slice(0, 160) };
  }
  return { ok: true, performed: true, detail: `TLS handshake completed (HTTP ${outcome.status || 'unknown'})`, latencyMs: outcome.latencyMs || 0 };
}

export function parseDohAnswer(payload) {
  if (!payload || !Array.isArray(payload.Answer)) return { ok: false, addresses: [], detail: 'No answer section' };
  const addresses = payload.Answer
    .filter(record => record && (record.type === 1 || record.type === 28 || record.type === 5))
    .map(record => String(record.data || '').trim())
    .filter(Boolean);
  return {
    ok: addresses.length > 0,
    addresses,
    detail: addresses.length ? addresses.slice(0, 4).join(', ') : 'No A/AAAA/CNAME records'
  };
}

/** Map over items with a bounded number of in-flight promises. */
export async function mapLimit(items, limit, worker) {
  const list = Array.isArray(items) ? items.slice() : [];
  const concurrency = Math.max(1, Math.min(32, Number(limit) || 1));
  const results = new Array(list.length);
  let cursor = 0;

  async function run() {
    while (cursor < list.length) {
      const index = cursor++;
      try {
        results[index] = await worker(list[index], index);
      } catch (err) {
        results[index] = { error: String(err?.message || err) };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, run));
  return results;
}

export function healthLabel(status) {
  const labels = {
    invalid: { en: 'Invalid', fa: 'نامعتبر' },
    unreachable: { en: 'Unreachable', fa: 'غیرقابل دسترس' },
    'dns-only': { en: 'DNS only', fa: 'فقط DNS' },
    reachable: { en: 'TCP reachable (proxy unverified)', fa: 'TCP قابل دسترس (پروکسی تأیید نشده)' },
    'tls-ok': { en: 'TLS handshake OK', fa: 'دست‌دهی TLS موفق' },
    'http-ok': { en: 'HTTP response OK', fa: 'پاسخ HTTP موفق' },
    'proxy-verified': { en: 'Proxy protocol verified', fa: 'پروتکل پروکسی تأیید شد' }
  };
  return labels[status] || { en: status, fa: status };
}
