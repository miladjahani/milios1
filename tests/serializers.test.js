import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateClashConfig,
  generateLoonConfig,
  generateQuanxConfig,
  generateSingboxConfig,
  generateSurgeConfig,
  parseShareLink
} from '../src/subscription/converters.js';

const VLESS = 'vless://11111111-2222-4333-8444-555555555555@104.16.0.1:443?encryption=none&security=tls&type=ws&host=example.com&sni=example.com&fp=chrome&path=%2F%3Fed%3D2048#1%2Bmiliconfig';
const TROJAN = 'trojan://trojan-password@104.16.0.1:443?security=tls&type=ws&host=example.com&sni=example.com&path=%2F#2%2Bmiliconfig';
const SS = 'ss://bm9uZTpzZWNyZXRwYXNz@104.16.0.1:443/?plugin=v2ray-plugin%3Bmode%3Dwebsocket%3Bhost%3Dexample.com%3Bpath%3D%2F%3Btls#3%2Bmiliconfig';
const XHTTP = 'vless://11111111-2222-4333-8444-555555555555@104.16.0.1:443?encryption=none&security=tls&type=xhttp&host=example.com&path=%2F#4%2Bmiliconfig';

const LINKS = [VLESS, TROJAN, SS, XHTTP];

test('share links parse into distinct protocols', () => {
  assert.equal(parseShareLink(VLESS).proto, 'vless');
  assert.equal(parseShareLink(TROJAN).proto, 'trojan');
  assert.equal(parseShareLink(SS).proto, 'ss');
  assert.equal(parseShareLink(XHTTP).network, 'xhttp');
});

test('sing-box output is valid JSON and excludes unrepresentable xHTTP', () => {
  const output = generateSingboxConfig(LINKS, { customDNS: 'https://cloudflare-dns.com/dns-query' });
  const parsed = JSON.parse(output);
  assert.ok(Array.isArray(parsed.outbounds));
  const tags = parsed.outbounds.map(item => item.tag);
  assert.ok(tags.includes('1+miliconfig'));
  assert.ok(tags.includes('2+miliconfig'));
  assert.ok(tags.includes('3+miliconfig'));
  assert.equal(tags.includes('4+miliconfig'), false);
  const ss = parsed.outbounds.find(item => item.type === 'shadowsocks');
  assert.equal(ss.method, 'none');
});

test('Clash output is YAML with proxies and groups, without xHTTP', () => {
  const output = generateClashConfig(LINKS, { customDNS: 'https://cloudflare-dns.com/dns-query' });
  assert.match(output, /^proxies:/m);
  assert.match(output, /^proxy-groups:/m);
  assert.match(output, /^rules:/m);
  assert.ok(output.includes('1+miliconfig'));
  assert.ok(output.includes('3+miliconfig'));
  assert.equal(output.includes('4+miliconfig'), false);
});

test('Surge, Loon and Quantumult X serializers emit their own formats', () => {
  const surge = generateSurgeConfig(LINKS, {});
  const loon = generateLoonConfig(LINKS, {});
  const quanx = generateQuanxConfig(LINKS, {});
  // Surge نمي‌تواند VLESS را بازنمايي كند، پس فقط نودهاي ۲ و ۳ در آن هستند
  assert.ok(surge.includes('3+miliconfig'));
  assert.equal(surge.includes('1+miliconfig'), false);
  assert.ok(loon.includes('1+miliconfig'));
  assert.ok(quanx.includes('1+miliconfig'));
  assert.notEqual(surge, loon);
  assert.notEqual(loon, quanx);
  assert.ok(surge.startsWith('[General]'));
  assert.equal(surge.includes('4+miliconfig'), false);
  assert.equal(loon.includes('4+miliconfig'), false);
});
