// Loads the Worker entry point inside Node by aliasing `cloudflare:sockets`.
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

let loaded = null;

export async function loadWorker() {
  if (loaded) return loaded;
  register('./sockets-hook.mjs', pathToFileURL(import.meta.filename));
  const mod = await import('../../src/index.js');
  loaded = mod.default;
  return loaded;
}

export const ORIGIN = 'https://mili.example.com';

export function jsonRequest(path, { method = 'GET', body, cookie, origin = ORIGIN, headers = {} } = {}) {
  const sameOrigin = origin === ORIGIN;
  const finalHeaders = {
    Origin: origin,
    'Sec-Fetch-Site': sameOrigin ? 'same-origin' : 'cross-site',
    ...headers
  };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';
  if (cookie) finalHeaders.Cookie = cookie;
  return new Request(ORIGIN + path, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

export function readSetCookie(response) {
  const raw = response.headers.get('Set-Cookie') || '';
  const match = raw.match(/^[^=]+=([^;]*)/);
  return match ? `${raw.split('=')[0]}=${match[1]}` : '';
}

export async function body(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (_e) {
    return text;
  }
}
