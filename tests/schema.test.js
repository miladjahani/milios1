import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SETTINGS_BY_KEY,
  defaultSettings,
  detectConflicts,
  isPrivateHost,
  validateSettings
} from '../src/config/schema.js';

test('validateSettings normalizes booleans and ignores unknown keys', () => {
  const result = validateSettings({ ev: true, et: 'no', unknownKey: 'x' }, defaultSettings());
  assert.equal(result.errors.length, 0);
  assert.equal(result.values.ev, 'yes');
  assert.equal(result.values.et, 'no');
  assert.equal('unknownKey' in result.values, false);
});

test('validateSettings rejects invalid numbers, ports and options', () => {
  const base = defaultSettings();
  assert.ok(validateSettings({ sessionHours: 0 }, base).errors.some(e => e.code === 'INVALID_NUMBER'));
  assert.ok(validateSettings({ ports: '443,70000' }, base).errors.some(e => e.code === 'INVALID_PORTS'));
  assert.ok(validateSettings({ language: 'klingon' }, base).errors.some(e => e.code === 'INVALID_OPTION'));
  assert.equal(validateSettings({ unknownKey: 'x' }, base).errors.length, 0);
});

test('validateSettings rejects dangerous homepage URLs', () => {
  const base = defaultSettings();
  assert.ok(validateSettings({ homepage: 'javascript:alert(1)' }, base).errors.some(e => e.code === 'INVALID_URL'));
  assert.ok(validateSettings({ homepage: 'http://127.0.0.1/' }, base).errors.some(e => e.code === 'URL_NOT_ALLOWED'));
  assert.ok(validateSettings({ homepage: 'https://nginx.com/' }, base).errors.length === 0);
});

test('conflict detection: no protocol, no address family, ECH without DoH', () => {
  const noProtocol = detectConflicts({ ev: 'no', et: 'no', ex: 'no', es: 'no' });
  assert.ok(noProtocol.some(c => c.code === 'NO_PROTOCOL'));

  const noFamily = detectConflicts({ ipv4: 'no', ipv6: 'no', ev: 'yes' });
  assert.ok(noFamily.some(c => c.code === 'NO_ADDRESS_FAMILY'));

  const ech = detectConflicts({ ev: 'yes', ech: 'yes', customDNS: '', dkby: 'yes' });
  assert.ok(ech.some(c => c.code === 'ECH_WITHOUT_DOH'));
});

test('conflict detection warns about auto ciphers that cannot fit and fake-IP in sing-box', () => {
  const cfg = { ev: 'yes', es: 'yes', ssmethod: 'auto', subNodeCount: 2, dnsMode: 'fakeip', subFormats: 'singbox,clash' };
  const conflicts = detectConflicts(cfg);
  assert.ok(conflicts.some(c => c.code === 'SS_FEW_NODES' && c.severity === 'warning'));
  assert.ok(conflicts.some(c => c.code === 'FAKEIP_SINGBOX' && c.severity === 'warning'));
  const singleCipher = detectConflicts({ ...cfg, ssmethod: 'aes-256-gcm' });
  assert.equal(singleCipher.some(c => c.code === 'SS_FEW_NODES'), false);
});

test('every CFnew input the generator reads is editable in settings', () => {
  const keys = [
    'sspass', 'ssmethod', 'tp', 's', 'scu', 'wk', 'ae', 'jk',
    'yx', 'yxURL', 'epi', 'epd', 'egi', 'ena', 'yxby',
    'ispMobile', 'ispUnicom', 'ispTelecom', 'locationNodeCount',
    'fragmentLength', 'fragmentInterval', 'fragmentPackets',
    'ports', 'dkby', 'patt', 'frag', 'fragmentPreset', 'ipRotation', 'ipv4', 'ipv6'
  ];
  for (const key of keys) {
    assert.ok(SETTINGS_BY_KEY.has(key), `${key} must be editable`);
    assert.equal(SETTINGS_BY_KEY.get(key).section === 'cfnew' || SETTINGS_BY_KEY.get(key).section === 'proxy' || SETTINGS_BY_KEY.get(key).section === 'network', true, `${key} has a panel section`);
  }
  // yx is a list, so the panel renders it as a textarea instead of one-line input.
  assert.equal(SETTINGS_BY_KEY.get('yx').type, 'textarea');
});

test('private host detection blocks loopback and RFC1918 ranges', () => {
  assert.equal(isPrivateHost('localhost'), true);
  assert.equal(isPrivateHost('127.0.0.1'), true);
  assert.equal(isPrivateHost('192.168.1.1'), true);
  assert.equal(isPrivateHost('172.16.0.1'), true);
  assert.equal(isPrivateHost('example.com'), false);
});
