import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPlans,
  configurationRow,
  parseChain,
  validateCandidate
} from '../src/core/engine.js';

const UUID = '11111111-2222-4333-8444-555555555555';

function makeUser(overrides = {}) {
  return {
    id: 'user-1',
    username: 'tester',
    uuid: UUID,
    enabled: true,
    dataLimitGb: 0,
    usedBytes: 0,
    expireAt: 0,
    config: {
      ev: 'yes', et: 'yes', ex: 'yes', es: 'yes',
      ipv4: 'yes', ipv6: 'yes', ech: 'no', dkby: 'yes',
      customDNS: 'https://cloudflare-dns.com/dns-query',
      fp: 'chrome', ports: '443', subFormats: 'singbox,clash,uri',
      ...(overrides.config || {})
    },
    ...overrides
  };
}

function makeEndpoint(overrides = {}) {
  return {
    id: 'ep-1',
    name: 'CF anycast 1',
    host: '104.16.0.1',
    port: 443,
    family: 'ipv4',
    enabled: true,
    healthScore: 80,
    lastLatencyMs: 40,
    lastCheckAt: Date.now() - 60000,
    failureCount: 0,
    country: '',
    ...overrides
  };
}

test('valid VLESS/WS/TLS candidate passes', () => {
  const result = validateCandidate({
    protocol: 'vless', transport: 'ws', tlsMode: 'tls',
    host: '104.16.0.1', port: 443, format: 'singbox', chain: ''
  }, makeUser(), {});
  assert.equal(result.valid, true);
  assert.equal(result.issues.filter(i => i.severity === 'error').length, 0);
});

test('unsupported transports and protocols are rejected', () => {
  const grpc = validateCandidate({
    protocol: 'vless', transport: 'grpc', tlsMode: 'tls',
    host: '104.16.0.1', port: 443, format: 'singbox'
  }, makeUser(), {});
  assert.equal(grpc.valid, false);
  assert.ok(grpc.issues.some(i => i.code === 'TRANSPORT_NOT_IMPLEMENTED'));

  const disabled = validateCandidate({
    protocol: 'trojan', transport: 'ws', tlsMode: 'tls',
    host: '104.16.0.1', port: 443, format: 'singbox'
  }, makeUser({ config: { ev: 'yes', et: 'no', ex: 'no', es: 'no' } }), {});
  assert.equal(disabled.valid, false);
  assert.ok(disabled.issues.some(i => i.code === 'PROTOCOL_NOT_ALLOWED'));
});

test('IPv6 endpoints are rejected when IPv6 is disabled', () => {
  const result = validateCandidate({
    protocol: 'vless', transport: 'ws', tlsMode: 'tls',
    host: '2606:4700:4700::1111', port: 443, format: 'uri'
  }, makeUser({ config: { ipv6: 'no' } }), {});
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(i => i.code === 'IPV6_DISABLED'));
});

test('xHTTP requires TLS and a supported format', () => {
  const noTls = validateCandidate({
    protocol: 'xhttp', transport: 'xhttp', tlsMode: 'none',
    host: '104.16.0.1', port: 443, format: 'uri'
  }, makeUser(), {});
  assert.equal(noTls.valid, false);
  assert.ok(noTls.issues.some(i => i.code === 'XHTTP_REQUIRES_TLS'));

  const badFormat = validateCandidate({
    protocol: 'xhttp', transport: 'xhttp', tlsMode: 'tls',
    host: '104.16.0.1', port: 443, format: 'surge'
  }, makeUser(), {});
  assert.equal(badFormat.valid, false);
  assert.ok(badFormat.issues.some(i => i.code === 'FORMAT_PROTOCOL_UNSUPPORTED'));
});

test('expired users and quota-exhausted users cannot receive a plan', () => {
  const expired = validateCandidate({
    protocol: 'vless', transport: 'ws', tlsMode: 'tls',
    host: '104.16.0.1', port: 443, format: 'uri'
  }, makeUser({ expireAt: Date.now() - 1000 }), {});
  assert.equal(expired.valid, false);
  assert.ok(expired.issues.some(i => i.code === 'USER_EXPIRED'));

  const quota = validateCandidate({
    protocol: 'vless', transport: 'ws', tlsMode: 'tls',
    host: '104.16.0.1', port: 443, format: 'uri'
  }, makeUser({ dataLimitGb: 1, usedBytes: 2 * 1073741824 }), {});
  assert.equal(quota.valid, false);
  assert.ok(quota.issues.some(i => i.code === 'USER_QUOTA_EXCEEDED'));
});

test('proxy chain parsing detects loops and unsupported schemes', () => {
  assert.equal(parseChain('socks5://1.2.3.4:1080').ok, true);
  assert.equal(parseChain('ftp://1.2.3.4:21').ok, false);
  assert.equal(parseChain('socks5://1.2.3.4:1080,socks5://5.6.7.8:1080,socks5://9.9.9.9:1080,socks5://1.1.1.1:1080').ok, false);

  const loop = validateCandidate({
    protocol: 'vless', transport: 'ws', tlsMode: 'tls',
    host: '1.1.1.1', port: 443, format: 'uri', chain: 'socks5://1.1.1.1:443'
  }, makeUser({ config: { jk: 'yes' } }), {});
  assert.equal(loop.valid, false);
  assert.ok(loop.issues.some(i => i.code === 'CHAIN_LOOP'));
});

test('buildPlans is deterministic, deduplicated and respects IPv6 settings', () => {
  const user = makeUser({ config: { ev: 'yes', et: 'no', ex: 'yes', es: 'no', ipv6: 'no' } });
  const endpoints = [
    makeEndpoint(),
    makeEndpoint({ id: 'ep-2', host: '2606:4700:4700::1111', family: 'ipv6', healthScore: 95 })
  ];
  const settings = { optimizationPolicy: 'latency', subFormats: 'singbox,clash,uri' };

  const first = buildPlans({ user, endpoints, settings, formats: ['singbox', 'clash', 'uri'] });
  const second = buildPlans({ user, endpoints, settings, formats: ['singbox', 'clash', 'uri'] });

  assert.ok(first.valid.length >= 3);
  assert.deepEqual(first.valid.map(p => p.endpointId + '|' + p.protocol + '|' + p.format), second.valid.map(p => p.endpointId + '|' + p.protocol + '|' + p.format));
  assert.equal(first.valid.some(p => p.endpointId === 'ep-2'), false);
  assert.equal(first.valid.some(p => p.protocol === 'xhttp' && p.format !== 'uri'), false);
  assert.ok(first.rejected.some(item => item.reason && item.reason.code === 'IPV6_DISABLED'));
});

test('configurationRow records validation and reason', () => {
  const plan = {
    protocol: 'vless', endpointId: 'ep-1', transport: 'ws', tlsMode: 'tls',
    dnsProfile: 'cloudflare', chain: '', format: 'singbox', score: 72.5,
    issues: [], reasons: [{ code: 'POLICY', en: 'Selected', fa: 'انتخاب شد' }]
  };
  const row = configurationRow(plan, 'user-1', 1700000000000);
  assert.match(row.id, /^cfg-/);
  assert.equal(row.valid, 1);
  assert.equal(row.score, 73);
  const validation = JSON.parse(row.validation);
  assert.equal(validation.score, 72.5);
  assert.equal(validation.reasons[0].code, 'POLICY');
});
