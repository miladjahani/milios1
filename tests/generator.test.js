import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEchParamValue,
  buildFragmentValue,
  applyPanelOwnedConfig,
  buildLocationSourceList,
  filterAddressFamily,
  generateUserNodesList,
  getStaticCfAddresses,
  getXhttpPaddingMeta,
  parseCustomPreferredString,
  pickMultiLocationCountries
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
  const parsed = parseCustomPreferredString('104.16.0.1:443#cf, example.com:8443, 127.0.0.1:1080#local, socks5://10.0.0.1:1080#DE-germany');
  assert.equal(parsed.ipList.length, 1);
  assert.equal(parsed.domainList.length, 1);
  // پورت غیر کلادفلر یعنی پروکسی خروجی؛ خطوط دارای اسکیم هم به نود چندلوکیشن تبدیل می‌شوند
  assert.equal(parsed.proxyList.length, 2);
  assert.equal(parsed.proxyList[0].proxy, 'socks5://127.0.0.1:1080');
  const applied = parsed.proxyList.find(item => item.proxy === 'socks5://10.0.0.1:1080');
  assert.ok(applied, 'a scheme line is kept as an egress proxy');
  assert.equal(applied.country, 'DE');
});

test('multi-location nodes cover distinct real countries and keep their egress proxy', () => {
  const nodes = buildLocationSourceList(
    [
      { proxy: 'socks5://1.2.3.4:1080', country: 'DE' },
      { proxy: 'socks5://5.6.7.8:1080', country: 'NL' },
      { proxy: 'socks5://9.9.9.9:1080', country: 'US' }
    ],
    { ipv4: 'yes', ipv6: 'no', locationNodeCount: 3 },
    'worker.example.workers.dev'
  );
  assert.equal(nodes.length, 3);
  assert.deepEqual([...new Set(nodes.map(node => node.country))].sort(), ['DE', 'NL', 'US']);
  assert.ok(nodes.every(node => /^socks5:\/\//.test(node.proxy)));
  // The node address stays a real Cloudflare address so the node answers.
  assert.ok(nodes.every(node => node.ip && !node.ip.includes('://')));
});

test('a proxy applied to yx becomes chained location nodes in the subscription', async () => {
  const links = await generateUserNodesList(
    {
      uuid: '11111111-2222-4333-8444-555555555555',
      config: {
        ev: 'yes', et: 'no', ex: 'no', es: 'no',
        ipv4: 'yes', ipv6: 'no', epi: 'no', epd: 'no', egi: 'no',
        yx: 'socks5://10.1.1.1:1080#DE-cf-vip-1',
        subNodeCount: 10
      }
    },
    'worker.example.workers.dev',
    {}
  );
  assert.ok(links.some(link => link.includes('s%3Dsocks5')), 'the egress proxy rides in the path');
  assert.ok(links.some(link => link.includes('cc%3DDE')), 'the node is tagged with its real country');
  assert.equal(links.some(link => /@10\.1\.1\.1:/.test(link)), false, 'the proxy is never used as the node address');
});

test('panel CFnew settings win over the per-user config snapshot', async () => {
  const links = await generateUserNodesList(
    {
      uuid: '11111111-2222-4333-8444-555555555555',
      config: {
        ev: 'yes', et: 'no', ex: 'no', es: 'no',
        ipv4: 'yes', ipv6: 'no', epi: 'no', epd: 'no', egi: 'no',
        yx: '', subNodeCount: 8
      }
    },
    'worker.example.workers.dev',
    { panelConfig: { yx: 'socks5://10.1.1.1:1080#NL-panel', locationNodeCount: 2, epi: 'no', epd: 'no', egi: 'no' } }
  );
  assert.ok(links.some(link => link.includes('s%3Dsocks5')), 'the panel pool reaches the subscription');
  assert.ok(links.some(link => link.includes('cc%3DNL')));
  assert.deepEqual(applyPanelOwnedConfig({ yx: 'a', ev: 'no' }, { yx: 'b' }), { yx: 'b', ev: 'no' });
});

test('MULTI rotates a slice of the live country list without repeats', () => {
  const picked = pickMultiLocationCountries(['DE', 'NL', 'US', 'GB', 'TR', 'AE'], 4);
  assert.equal(picked.length, 4);
  assert.equal(new Set(picked).size, 4);
  assert.ok(picked.every(code => /^[A-Z]{2}$/.test(code)));
  assert.deepEqual(pickMultiLocationCountries([], 4), []);
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

test('the IPv6 switch also filters catalog endpoints', async () => {
  const links = await generateUserNodesList(
    { uuid: '11111111-2222-4333-8444-555555555555', config: { ev: 'yes', et: 'no', ex: 'no', es: 'no', ipv4: 'yes', ipv6: 'no', epi: 'no', epd: 'no', egi: 'no', subNodeCount: 20 } },
    'worker.example.workers.dev',
    {
      catalogEndpoints: [
        { host: '2606:4700::1111', port: 443, protocol: 'vless', enabled: true, name: 'v6-endpoint' },
        { host: '104.16.0.1', port: 443, protocol: 'vless', enabled: true, name: 'v4-endpoint' }
      ]
    }
  );
  assert.equal(links.some(link => /@\[/.test(link)), false, 'no IPv6 endpoint sneaks past the switch');
  assert.ok(links.some(link => link.includes('104.16.0.1')), 'the IPv4 endpoint is still there');
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
