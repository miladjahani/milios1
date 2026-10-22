import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEchParamValue,
  buildFragmentValue,
  filterAddressFamily,
  generateUserNodesList,
  getStaticCfAddresses,
  getXhttpPaddingMeta,
  parseCustomPreferredString
} from '../src/subscription/generator.js';
import { OFFICIAL_DIRECT_IPV6, parseNodePorts } from '../src/config/defaults.js';
import { parseHttpsRecord } from '../src/core/ech.js';
import { createMiliNodeNamer, finalizeMiliSubscriptionLinks } from '../src/core/utils.js';

test('node naming is sequential number+brand', () => {
  const namer = createMiliNodeNamer('miliconfig');
  assert.equal(namer({}), '1+miliconfig');
  assert.equal(namer({}), '2+miliconfig');
});

test('subscription finalizer applies limit and renames nodes', () => {
  const links = ['vless://a@1.1.1.1:443#old1', 'vless://b@1.1.1.1:443#old2', 'vless://c@1.1.1.1:443#old3'];
  const out = finalizeMiliSubscriptionLinks(links, 2, 'miliconfig');
  assert.equal(out.length, 2);
  assert.ok(out[0].endsWith('#' + encodeURIComponent('1+miliconfig')));
  assert.ok(out[1].endsWith('#' + encodeURIComponent('2+miliconfig')));
});

test('address family filter respects IPv4/IPv6 switches', () => {
  const list = [
    { ip: '104.16.0.1' },
    { ip: '2606:4700:4700::1111' },
    { ip: 'example.com' }
  ];
  const onlyV4 = filterAddressFamily(list, { ipv4: 'yes', ipv6: 'no' });
  assert.deepEqual(onlyV4.map(item => item.ip), ['104.16.0.1', 'example.com']);
  const onlyV6 = filterAddressFamily(list, { ipv4: 'no', ipv6: 'yes' });
  assert.deepEqual(onlyV6.map(item => item.ip), ['2606:4700:4700::1111', 'example.com']);
});

test('ECH parameter requires enabled flag and DoH resolver', () => {
  assert.equal(buildEchParamValue({ ech: 'no' }), '');
  const value = buildEchParamValue({ ech: 'yes', customDNS: 'https://cloudflare-dns.com/dns-query', customECHDomain: 'cloudflare-ech.com' });
  assert.equal(value, 'cloudflare-ech.com+https://cloudflare-dns.com/dns-query');
});

test('fragment presets and custom fragment values', () => {
  assert.equal(buildFragmentValue({ frag: 'no', fragmentPreset: 'mci' }), '');
  assert.equal(buildFragmentValue({ frag: 'yes', fragmentPreset: 'off' }), '');
  assert.equal(buildFragmentValue({ frag: 'yes', fragmentPreset: 'mci' }), '100-200,10-20,tlshello');
  assert.equal(buildFragmentValue({ frag: 'yes', fragmentPreset: 'custom', fragmentLength: '5-10', fragmentInterval: '20-30', fragmentPackets: '1-1' }), '5-10,20-30,1-1');
});

test('port parser keeps only valid unique ports', () => {
  assert.deepEqual(parseNodePorts('443,443,8443,70000,abc'), [443, 8443]);
  // ورودی بدون پورت معتبر به پورت امن 443 برمی‌گردد
  assert.deepEqual(parseNodePorts('99999'), [443]);
});

test('custom preferred strings separate IPs, domains and proxies', () => {
  const parsed = parseCustomPreferredString('104.16.0.1:443#cf, example.com:8443, 127.0.0.1:1080#local, socks5://10.0.0.1:1080#skip');
  assert.equal(parsed.ipList.length, 1);
  assert.equal(parsed.domainList.length, 1);
  // پورت غیر کلادفلر یعنی پروکسی خروجی، و خطوط دارای اسکیم عمداً رد می‌شوند
  assert.equal(parsed.proxyList.length, 1);
  assert.equal(parsed.proxyList[0].proxy, 'socks5://127.0.0.1:1080');
});

test('static addresses interleave IPv6 so the family survives a node cap', () => {
  const addresses = getStaticCfAddresses({ ipv4: 'yes', ipv6: 'yes' });
  const firstV6 = addresses.findIndex(host => host.includes(':'));
  assert.ok(firstV6 > -1, 'IPv6 addresses are present');
  assert.ok(firstV6 < 12, 'IPv6 appears near the top of the list');
  assert.equal(getStaticCfAddresses({ ipv4: 'yes', ipv6: 'no' }).some(h => h.includes(':')), false);
  assert.deepEqual(getStaticCfAddresses({ ipv4: 'no', ipv6: 'yes' }), OFFICIAL_DIRECT_IPV6);
});

test('subscriptions always carry the worker hostname and an IPv6 node', async () => {
  const host = 'worker.example.workers.dev';
  const links = await generateUserNodesList(
    { uuid: '11111111-2222-4333-8444-555555555555', config: { ipv4: 'yes', ipv6: 'yes', epi: 'no', epd: 'no', egi: 'no', subNodeCount: 24 } },
    host,
    {}
  );
  assert.ok(links.length > 0);
  assert.ok(links.some(link => link.includes(`@${host}:`)), 'worker domain node is present');
  assert.ok(links.some(link => /@\[[0-9a-f:]+\]:/i.test(link)), 'IPv6 node is present');
});

test('a resolved ECH config is embedded in subscription links', async () => {
  const config = 'AEX+DQBBZQAgACDUmCueSsIzuOt4qSVY1vYbcSdiljW6';
  const links = await generateUserNodesList(
    { uuid: '11111111-2222-4333-8444-555555555555', config: { ipv4: 'yes', ipv6: 'no', ech: 'yes', epi: 'no', epd: 'no', egi: 'no', subNodeCount: 8 } },
    'worker.example.workers.dev',
    { echConfigBase64: config }
  );
  assert.ok(links.length > 0);
  assert.ok(links.some(link => link.includes(`ech=${encodeURIComponent(config)}`)), 'links carry the found config');
});

test('IPv6 can be switched off completely', async () => {
  const links = await generateUserNodesList(
    { uuid: '11111111-2222-4333-8444-555555555555', config: { ipv4: 'yes', ipv6: 'no', epi: 'no', epd: 'no', egi: 'no', subNodeCount: 12 } },
    'worker.example.workers.dev',
    {}
  );
  assert.ok(links.length > 0);
  assert.equal(links.some(link => /@\[[0-9a-f:]+\]:/i.test(link)), false);
});

test('ECH finder parses the config from an HTTPS record and links use it', () => {
  const record = '1 . alpn=h3,h2 ipv4hint=104.21.70.196 ech=AEX+DQBBegAgACC7qEZkgW2KJxglVK52B5L+RN3FIyTY0YGe9CBJrCxaRwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA= ipv6hint=2606:4700::1';
  const parsed = parseHttpsRecord(record);
  assert.deepEqual(parsed.alpn, ['h3', 'h2']);
  assert.equal(parsed.ipv4hint[0], '104.21.70.196');
  assert.match(parsed.echConfig, /^AEX\+DQBB/);

  const cfg = { ech: 'yes', customDNS: 'https://1.1.1.1/dns-query', customECHDomain: 'cloudflare-ech.com' };
  assert.equal(
    buildEchParamValue({ ...cfg, echConfigBase64: parsed.echConfig }),
    parsed.echConfig
  );
  assert.equal(buildEchParamValue(cfg), 'cloudflare-ech.com+https://1.1.1.1/dns-query');
  assert.equal(buildEchParamValue({ ...cfg, ech: 'no', echConfigBase64: parsed.echConfig }), '');
});

test('xHTTP padding metadata is derived and stable', () => {
  const meta = getXhttpPaddingMeta('11111111-2222-4333-8444-555555555555');
  assert.equal(meta.header, '111111');
  assert.match(meta.key, /^_/);
});
