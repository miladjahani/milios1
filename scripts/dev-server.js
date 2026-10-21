// ============================================================================
// miliconfigOS v4.0 - Local development / preview server
// Runs the real Worker entry point on Node with a persistent SQLite database
// behind the D1 interface. This is a *development* harness: production
// deployments use Cloudflare Workers + D1 via wrangler.
//   PORT=3000 node scripts/dev-server.js
// ============================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createD1 } from './lib/sqlite-d1.js';

// The Worker imports `cloudflare:sockets`; alias it to the local stub so the
// control plane can run under Node. Proxy tunnelling stays Worker-only.
register('./lib/sockets-hook.mjs', pathToFileURL(fileURLToPath(import.meta.url)));
const worker = (await import('../src/index.js')).default;

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';
const DATA_DIR = path.join(ROOT_DIR, '.dev');
const DB_FILE = process.env.MILI_DEV_DB || path.join(DATA_DIR, 'miliconfig.sqlite');

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const env = {
  DB: createD1(DB_FILE),
  MILI_ENCRYPTION_KEY: process.env.MILI_ENCRYPTION_KEY || 'local-development-only-encryption-key',
  MILI_DEV_MODE: '1'
};

const ctx = {
  waitUntil(promise) {
    Promise.resolve(promise).catch(() => {});
  },
  passThroughOnException() {}
};

function headersToObject(nodeHeaders) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (value === undefined) continue;
    if (key === 'connection' || key === 'transfer-encoding' || key === 'host') continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  }
  return headers;
}

const server = http.createServer(async (req, res) => {
  const origin = `http://${req.headers.host || `127.0.0.1:${PORT}`}`;
  const url = origin + req.url;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  let request;
  try {
    request = new Request(url, {
      method: req.method,
      headers: headersToObject(req.headers),
      body: body && body.length ? body : undefined,
      duplex: 'half',
      redirect: 'manual'
    });
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Bad request: ${err.message}`);
    return;
  }

  try {
    const response = await worker.fetch(request, env, ctx);
    const headers = {};
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return;
      if (key.toLowerCase() === 'content-encoding' || key.toLowerCase() === 'content-length') return;
      headers[key] = value;
    });
    const cookies = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
    if (cookies.length) headers['set-cookie'] = cookies;
    const buffer = Buffer.from(await response.arrayBuffer());
    res.writeHead(response.status, headers);
    res.end(req.method === 'HEAD' ? undefined : buffer);
  } catch (err) {
    console.error('[dev-server] unhandled error', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal error. See the dev server logs.');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[dev-server] MiliconfigOS running on http://${HOST}:${PORT}`);
  console.log(`[dev-server] SQLite database: ${DB_FILE}`);
  console.log('[dev-server] Production uses Cloudflare Workers + D1; see docs/DEPLOYMENT.md.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
