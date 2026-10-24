// ============================================================================
// miliconfigOS v4.0 - live source access for the CFnew pool
//
// Every list in src/config/sources.js can be read live (no server-side cache),
// probed for availability and turned into preferred-node candidates. Applying a
// selection writes the usual `yx` setting, so the result is visible in generated
// subscriptions immediately and can also be produced automatically by the
// `sources-sync` automation job.
// ============================================================================

import {
  CFNEW_CATEGORIES,
  SOURCE_CATALOG,
  SOURCE_CATEGORIES,
  SOURCE_COUNTS,
  getSourcesByCategory,
  resolveSourceEntries
} from '../config/sources.js';
import { parseAddressAndPort, isValidDomain, isValidIpAddress, normalizeNodeHost } from './utils.js';
import { loadGlobalConfig, saveGlobalConfig } from '../db/d1.js';
import { getMeta, setMeta } from '../db/v4.js';

export const MAX_SOURCES_PER_REQUEST = 12;
export const MAX_CANDIDATES_PER_SOURCE = 40;

export const SOURCES_AUTO_DEFAULTS = {
  enabled: false,
  intervalMinutes: 360,
  categories: ['cf-ip'],
  family: 'any',
  limit: 24,
  replace: false
};

const SOURCES_AUTO_KEY = 'sources_auto';
const LAST_CHECK_KEY = 'sources_last_check';

function clampNumber(value, min, max, fallback) {
  const num = parseInt(value, 10);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function normalizeSourcesAuto(raw = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const categories = (Array.isArray(source.categories) ? source.categories : String(source.categories || '').split(','))
    .map(item => String(item || '').trim())
    .filter(id => SOURCE_CATEGORIES.some(category => category.id === id));
  const family = ['any', 'ipv4', 'ipv6'].includes(String(source.family || '').toLowerCase())
    ? String(source.family).toLowerCase()
    : 'any';
  return {
    enabled: source.enabled === true || source.enabled === 'yes' || source.enabled === 'true',
    intervalMinutes: clampNumber(source.intervalMinutes, 15, 10080, SOURCES_AUTO_DEFAULTS.intervalMinutes),
    categories: categories.length ? [...new Set(categories)] : [...SOURCES_AUTO_DEFAULTS.categories],
    family,
    limit: clampNumber(source.limit, 1, 200, SOURCES_AUTO_DEFAULTS.limit),
    replace: source.replace === true || source.replace === 'yes' || source.replace === 'true'
  };
}

export async function getSourcesAuto(env) {
  const stored = await getMeta(env, SOURCES_AUTO_KEY);
  return normalizeSourcesAuto({ ...SOURCES_AUTO_DEFAULTS, ...(stored || {}) });
}

export async function saveSourcesAuto(env, patch = {}) {
  const current = await getSourcesAuto(env);
  const next = normalizeSourcesAuto({ ...current, ...patch });
  await setMeta(env, SOURCES_AUTO_KEY, next);
  return next;
}

/** Catalog metadata for the API and the panel. */
export function sourcesOverview() {
  return {
    categories: SOURCE_CATEGORIES.map(category => ({
      ...category,
      count: SOURCE_COUNTS[category.id] || 0,
      appliesToYx: CFNEW_CATEGORIES.includes(category.id)
    })),
    counts: { ...SOURCE_COUNTS },
    total: SOURCE_CATALOG.length
  };
}

function withTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, done: () => clearTimeout(timer) };
}

/**
 * Read one source live. A cache-busting query and `cache: 'no-store'` make sure
 * the Worker never answers from an edge cache, matching the "live" contract.
 */
export async function fetchSourceLive(entry, options = {}) {
  const timeoutMs = clampNumber(options.timeoutMs, 1000, 15000, 6000);
  const maxBytes = clampNumber(options.maxBytes, 4096, 2048 * 1024, 512 * 1024);
  const started = Date.now();
  const { controller, done } = withTimeoutSignal(timeoutMs);
  try {
    const separator = String(entry.url).includes('?') ? '&' : '?';
    const res = await fetch(`${entry.url}${separator}_mili=${Date.now()}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'miliconfigos-sources/4.0',
        'Cache-Control': 'no-cache'
      }
    });
    const text = await res.text().catch(() => '');
    const trimmed = text.length > maxBytes ? text.slice(0, maxBytes) : text;
    const lines = trimmed.split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#'));
    return {
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
      bytes: text.length,
      truncated: text.length > maxBytes,
      lines: lines.length,
      text: trimmed
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      latencyMs: Date.now() - started,
      bytes: 0,
      truncated: false,
      lines: 0,
      text: '',
      error: String(err?.message || err).slice(0, 140)
    };
  } finally {
    done();
  }
}

// Local name avoids colliding with health.js mapLimit in the flattened bundle.
async function mapWithLimit(items, limit, worker) {
  const list = Array.isArray(items) ? items : [];
  const out = new Array(list.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (cursor < list.length) {
      const index = cursor++;
      out[index] = await worker(list[index], index);
    }
  });
  await Promise.all(runners);
  return out;
}

/** Probe the selected sources live and report per-source status. */
export async function probeSources(entries, options = {}) {
  const list = (Array.isArray(entries) ? entries : []).slice(0, MAX_SOURCES_PER_REQUEST);
  const concurrency = clampNumber(options.concurrency, 1, 8, 4);
  const results = await mapWithLimit(list, concurrency, async entry => {
    const live = await fetchSourceLive(entry, options);
    const sample = live.text
      ? live.text.split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#')).slice(0, 3)
      : [];
    return {
      id: entry.id,
      category: entry.category,
      label: entry.label,
      url: entry.url,
      ok: live.ok && live.lines > 0,
      status: live.status,
      latencyMs: live.latencyMs,
      lines: live.lines,
      bytes: live.bytes,
      truncated: live.truncated,
      sample,
      error: live.error || (live.ok && live.lines === 0 ? 'empty list' : '')
    };
  });
  return {
    results,
    okCount: results.filter(item => item.ok).length,
    checkedAt: Date.now()
  };
}

/**
 * Parse list lines into preferred-node candidates.
 * Address lists yield plain nodes; proxy lists also keep the full proxy URL so
 * the generator can chain through the country egress instead of dropping them.
 */
export function parseAddressLines(text, options = {}) {
  const family = options.family === 'ipv4' || options.family === 'ipv6' ? options.family : 'any';
  const limit = clampNumber(options.limit, 1, MAX_CANDIDATES_PER_SOURCE, MAX_CANDIDATES_PER_SOURCE);
  const kind = options.kind === 'proxy' ? 'proxy' : 'address';
  const scheme = options.scheme || 'socks5';
  const fallbackPort = kind === 'proxy' ? 1080 : 443;
  const out = [];
  const seen = new Set();
  for (const raw of String(text || '').split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    let proxy = '';
    if (line.includes('://')) {
      let parsed;
      try { parsed = new URL(line.split('#')[0].trim()); } catch (_e) { continue; }
      const proto = parsed.protocol.replace(/:$/, '').toLowerCase();
      if (kind === 'proxy' && ['socks5', 'socks', 'http', 'https'].includes(proto)) {
        proxy = line.split('#')[0].trim();
      } else if (kind === 'proxy' && !['socks5', 'socks', 'http', 'https'].includes(proto)) {
        // vless://, ss:// and friends are node links, not egress lists.
        continue;
      }
      line = parsed.hostname;
      if (parsed.port) line = `${line}:${parsed.port}`;
    }
    line = line.split('#')[0].trim();
    // user:pass@host:port lists keep their credentials in the egress URL.
    let auth = '';
    if (line.includes('@')) {
      const parts = line.split('@');
      auth = parts.slice(0, -1).join('@');
      line = parts[parts.length - 1];
    }
    line = line.split('/')[0].trim();
    if (!line) continue;
    const { address, port } = parseAddressAndPort(line);
    const host = normalizeNodeHost(address || line);
    if (!host) continue;
    const isV6 = host.includes(':');
    const isV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
    if (family === 'ipv4' && !isV4) continue;
    if (family === 'ipv6' && !isV6) continue;
    if (!isValidIpAddress(host) && !isValidDomain(host)) continue;
    const resolvedPort = Number(port) || fallbackPort;
    const proxyUrl = kind === 'proxy'
      ? (proxy || `${scheme}://${auth ? `${auth}@` : ''}${isV6 ? `[${host}]` : host}:${resolvedPort}`)
      : '';
    const key = `${host}:${resolvedPort}${proxyUrl ? `|${proxyUrl}` : ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      host,
      port: resolvedPort,
      family: isV6 ? 'ipv6' : (isV4 ? 'ipv4' : 'domain'),
      ...(proxyUrl ? { proxy: proxyUrl } : {})
    });
    if (out.length >= limit) break;
  }
  return out;
}

/** Read the selected sources live and turn them into candidate addresses. */
export async function collectSourceAddresses(entries, options = {}) {
  const list = (Array.isArray(entries) ? entries : []).slice(0, MAX_SOURCES_PER_REQUEST);
  const perSource = clampNumber(options.perSource, 1, MAX_CANDIDATES_PER_SOURCE, 12);
  const limit = clampNumber(options.limit, 1, 200, 24);
  const family = options.family || 'any';
  const concurrency = clampNumber(options.concurrency, 1, 6, 4);

  const perEntry = await mapWithLimit(list, concurrency, async entry => {
    const live = await fetchSourceLive(entry, options);
    if (!live.ok) return { entry, ok: false, error: live.error || `HTTP ${live.status}`, items: [] };
    const items = parseAddressLines(live.text, {
      family,
      limit: perSource,
      kind: entry.feeds === 'proxy' || entry.kind === 'proxy' ? 'proxy' : 'address',
      scheme: entry.scheme || 'socks5'
    });
    return { entry, ok: true, lines: live.lines, items };
  });

  const seen = new Set();
  const candidates = [];
  for (const result of perEntry) {
    for (const item of result.items) {
      const key = item.proxy || `${item.host}:${item.port}`;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({
        ...item,
        country: result.entry.country || '',
        sourceId: result.entry.id,
        category: result.entry.category,
        feeds: result.entry.feeds || 'scanner'
      });
      if (candidates.length >= limit) break;
    }
    if (candidates.length >= limit) break;
  }

  return {
    candidates,
    sources: perEntry.map(result => ({
      id: result.entry.id,
      label: result.entry.label,
      category: result.entry.category,
      ok: result.ok,
      lines: result.lines || 0,
      found: result.items.length,
      error: result.error || ''
    })),
    okCount: perEntry.filter(result => result.ok).length,
    checkedAt: Date.now()
  };
}

function preferredEntry(item) {
  // Proxy entries become chained location nodes: the static CF address stays the
  // node address and the country egress rides along in the path.
  if (item.proxy) {
    const code = String(item.country || '').trim().toUpperCase();
    const label = /^[A-Z]{2}$/.test(code) ? code : 'Loc';
    return `${item.proxy}#${label}-${item.sourceId || 'scan'}`;
  }
  const name = item.family === 'ipv6' ? `CF6-${item.sourceId || 'src'}` : `CF-${item.sourceId || 'src'}`;
  return `${item.host}#${name}`;
}

/**
 * Merge candidates into the `yx` setting (the CFnew preferred-node pool).
 * Existing entries are kept unless `replace` is set, so a manual list is never
 * destroyed by an automatic run.
 */
export async function applySourcesToPreferred(env, candidates, options = {}) {
  const list = Array.isArray(candidates) ? candidates : [];
  const cfg = await loadGlobalConfig(env);
  const existing = String(cfg.yx || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  const base = options.replace === true ? [] : existing;
  const seen = new Set(base.map(item => item.split('#')[0].trim().toLowerCase()));
  const added = [];
  for (const item of list) {
    const entry = preferredEntry(item);
    // Proxies share hosts across ports, so the full egress URL is the identity.
    const key = (item.proxy ? item.proxy : item.host).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    added.push(entry);
  }
  const merged = [...base, ...added];
  if (added.length || options.replace === true) {
    await saveGlobalConfig(env, { yx: merged.join(', ') });
  }
  return {
    added,
    total: merged.length,
    yx: merged.join(', '),
    replace: options.replace === true
  };
}

/** Records the last live check so the panel can show status without refetching. */
export async function storeSourceCheck(env, summary) {
  await setMeta(env, LAST_CHECK_KEY, summary);
  return summary;
}

export async function getLastSourceCheck(env) {
  return await getMeta(env, LAST_CHECK_KEY);
}

export { CFNEW_CATEGORIES as SOURCE_CFNEW_CATEGORIES, getSourcesByCategory, resolveSourceEntries };
