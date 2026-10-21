import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DNS_PROFILES,
  ECH_ENTRIES,
  OUTPUT_FORMATS,
  PROTOCOLS,
  TLS_FINGERPRINTS,
  capabilityMatrix,
  getDnsProfile
} from '../src/config/catalog.js';

test('DNS profiles are unique, documented and have addresses', () => {
  const ids = new Set();
  for (const profile of DNS_PROFILES) {
    assert.ok(profile.id);
    assert.equal(ids.has(profile.id), false, `duplicate DNS id ${profile.id}`);
    ids.add(profile.id);
    assert.match(profile.source, /^https:\/\//);
    assert.ok(profile.ipv4.length + profile.ipv6.length > 0);
    if (profile.doh) assert.match(profile.doh, /^https:\/\//);
  }
  assert.equal(getDnsProfile('cloudflare').provider, 'Cloudflare');
  assert.equal(getDnsProfile('nonexistent'), null);
});

test('ECH entries reference a documented source', () => {
  assert.ok(ECH_ENTRIES.length > 0);
  for (const entry of ECH_ENTRIES) {
    assert.match(entry.source, /^https:\/\//);
    assert.equal(entry.requiresHttpsRecord, true);
  }
});

test('TLS fingerprints are not advertised as identity guarantees', () => {
  for (const fp of TLS_FINGERPRINTS) {
    assert.ok(fp.clients.length > 0);
    assert.ok(fp.note);
  }
});

test('capability matrix is honest about runtime support', () => {
  for (const protocol of Object.values(PROTOCOLS)) {
    assert.equal(protocol.reality, false, `${protocol.id} must not claim REALITY`);
    if (protocol.id === 'shadowsocks') assert.equal(protocol.udp, false);
  }
  assert.equal(PROTOCOLS.xhttp.runtime, true);
  const matrix = capabilityMatrix();
  assert.ok(matrix.limits.length >= 3);
  assert.ok(matrix.formats.some(f => f.id === 'singbox'));
});

test('output formats declare xHTTP support explicitly', () => {
  for (const format of OUTPUT_FORMATS) {
    assert.ok(format.supports.length > 0);
    assert.ok(format.xhttp === false || format.xhttp === true || format.xhttp === 'partial');
  }
  assert.equal(OUTPUT_FORMATS.find(f => f.id === 'surge').xhttp, false);
});
