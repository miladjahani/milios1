import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEchParamValue,
  buildFragmentValue,
  filterAddressFamily,
  getXhttpPaddingMeta,
  parseCustomPreferredString
} from '../src/subscription/generator.js';
import { parseNodePorts } from '../src/config/defaults.js';
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

test('xHTTP padding metadata is derived and stable', () => {
  const meta = getXhttpPaddingMeta('11111111-2222-4333-8444-555555555555');
  assert.equal(meta.header, '111111');
  assert.match(meta.key, /^_/);
});
