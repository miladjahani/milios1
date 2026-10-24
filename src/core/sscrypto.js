// ============================================================================
// miliconfigOS v4.0 - Shadowsocks crypto/stream engine (Worker-safe, no deps)
//
// Supports the modern ciphers instead of the old plaintext `none` mode:
//   2017 AEAD (SIP004): aes-128-gcm, aes-256-gcm, chacha20-ietf-poly1305
//   2022 AEAD (SIP022): 2022-blake3-aes-128-gcm, 2022-blake3-aes-256-gcm
//
// Crypto building blocks:
//   - AES-GCM through WebCrypto (native in workerd)
//   - ChaCha20-Poly1305 in plain JS (RFC 8439)
//   - BLAKE3 derive-key in compact JS (single-block inputs, all this protocol
//     ever needs: the context string and psk+salt are at most 64 bytes)
//   - MD5 + EVP_BytesToKey + HKDF-SHA1 only for the legacy SIP004 KDF
//
// The module deliberately avoids eval/new Function and Node-only APIs so the
// bundle stays compatible with the Workers runtime.
// ============================================================================

export const SS_TAG_LEN = 16;
const SS_2017_MAX_PAYLOAD = 0x3fff;
const SS_2022_MAX_PAYLOAD = 0xffff;
const SS_2022_CONTEXT = 'shadowsocks 2022 session subkey';
const SS_2022_TIMESTAMP_DRIFT_SECONDS = 30;

export const SS_METHODS = {
  'aes-128-gcm': { keyLen: 16, saltLen: 16, family: 'aead' },
  'aes-256-gcm': { keyLen: 32, saltLen: 32, family: 'aead' },
  'chacha20-ietf-poly1305': { keyLen: 32, saltLen: 32, family: 'aead' },
  '2022-blake3-aes-128-gcm': { keyLen: 16, saltLen: 16, family: '2022' },
  '2022-blake3-aes-256-gcm': { keyLen: 32, saltLen: 32, family: '2022' }
};

// Every generated subscription cycles through these, so each user receives
// several Shadowsocks node types and none of them says `none`.
export const SS_METHOD_VARIANTS = [
  '2022-blake3-aes-128-gcm',
  'aes-256-gcm',
  '2022-blake3-aes-256-gcm',
  'chacha20-ietf-poly1305',
  'aes-128-gcm'
];

export function isSsMethod(name) {
  return Object.prototype.hasOwnProperty.call(SS_METHODS, String(name || '').toLowerCase());
}

export function ssMethodMeta(name) {
  return SS_METHODS[String(name || '').toLowerCase()] || null;
}

// ---- byte helpers ----------------------------------------------------------

export function ssConcatBytes(...parts) {
  let total = 0;
  for (const part of parts) total += part ? part.byteLength : 0;
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    if (!part || !part.byteLength) continue;
    out.set(part, at);
    at += part.byteLength;
  }
  return out;
}

export function ssRandomBytes(length) {
  const out = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(out);
    return out;
  }
  for (let i = 0; i < length; i++) out[i] = Math.floor(Math.random() * 256);
  return out;
}

export function ssBytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function ssBase64ToBytes(text) {
  const raw = atob(String(text || ''));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function readU16BE(bytes, offset) {
  return ((bytes[offset] << 8) | bytes[offset + 1]) & 0xffff;
}

function encodeU16BE(value) {
  return new Uint8Array([(value >>> 8) & 0xff, value & 0xff]);
}

function readU32LE(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function writeU32LE(bytes, offset, value) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = (value >>> 24) & 0xff;
}

function beBytesToU64(bytes, offset) {
  let value = 0;
  for (let i = 0; i < 8; i++) value = value * 256 + bytes[offset + i];
  return value;
}

function u64ToBeBytes(value) {
  const out = new Uint8Array(8);
  let rest = Math.max(0, Math.floor(Number(value) || 0));
  for (let i = 7; i >= 0; i--) {
    out[i] = rest % 256;
    rest = Math.floor(rest / 256);
  }
  return out;
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ---- BLAKE3 (single-block inputs) -----------------------------------------

const B3_IV = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);
const B3_PERMUTATION = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8];
const B3_CHUNK_START = 1;
const B3_CHUNK_END = 2;
const B3_ROOT = 8;
const B3_DERIVE_KEY_CONTEXT = 32;
const B3_DERIVE_KEY_MATERIAL = 64;

function b3Rotr(value, bits) {
  return (value >>> bits) | (value << (32 - bits));
}

function b3G(state, a, b, c, d, mx, my) {
  state[a] = (state[a] + state[b] + mx) | 0;
  state[d] = b3Rotr(state[d] ^ state[a], 16);
  state[c] = (state[c] + state[d]) | 0;
  state[b] = b3Rotr(state[b] ^ state[c], 12);
  state[a] = (state[a] + state[b] + my) | 0;
  state[d] = b3Rotr(state[d] ^ state[a], 8);
  state[c] = (state[c] + state[d]) | 0;
  state[b] = b3Rotr(state[b] ^ state[c], 7);
}

function b3Compress(cv, block, counter, blockLen, flags) {
  const state = new Uint32Array(16);
  state.set(cv.subarray(0, 8), 0);
  state[8] = B3_IV[0];
  state[9] = B3_IV[1];
  state[10] = B3_IV[2];
  state[11] = B3_IV[3];
  state[12] = counter >>> 0;
  state[13] = 0;
  state[14] = blockLen;
  state[15] = flags;

  let m = block.slice();
  for (let round = 0; round < 7; round++) {
    b3G(state, 0, 4, 8, 12, m[0], m[1]);
    b3G(state, 1, 5, 9, 13, m[2], m[3]);
    b3G(state, 2, 6, 10, 14, m[4], m[5]);
    b3G(state, 3, 7, 11, 15, m[6], m[7]);
    b3G(state, 0, 5, 10, 15, m[8], m[9]);
    b3G(state, 1, 6, 11, 12, m[10], m[11]);
    b3G(state, 2, 7, 8, 13, m[12], m[13]);
    b3G(state, 3, 4, 9, 14, m[14], m[15]);
    if (round < 6) {
      const next = new Uint32Array(16);
      for (let i = 0; i < 16; i++) next[i] = m[B3_PERMUTATION[i]];
      m = next;
    }
  }

  const out = new Uint32Array(16);
  for (let i = 0; i < 8; i++) {
    out[i] = state[i] ^ state[i + 8];
    out[i + 8] = state[i + 8] ^ cv[i];
  }
  return out;
}

function b3WordsLE(bytes, length) {
  const words = new Uint32Array(16);
  for (let i = 0; i < 16; i++) {
    const at = i * 4;
    words[i] = at < length
      ? ((bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0)
      : 0;
  }
  return words;
}

function b3HashSingleBlock(input, keyWords, modeFlags) {
  if (input.length > 64) throw new Error('blake3: input too long for the compact implementation');
  const block = new Uint8Array(64);
  block.set(input);
  const flags = B3_CHUNK_START | B3_CHUNK_END | B3_ROOT | modeFlags;
  const out = b3Compress(keyWords || B3_IV, b3WordsLE(block, input.length), 0, input.length, flags);
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 8; i++) writeU32LE(bytes, i * 4, out[i]);
  return bytes;
}

/** BLAKE3 key-derivation mode, as used by Shadowsocks 2022 session subkeys. */
export function blake3DeriveKey(context, keyMaterial) {
  const contextBytes = new TextEncoder().encode(String(context || ''));
  const contextKey = b3HashSingleBlock(contextBytes, null, B3_DERIVE_KEY_CONTEXT);
  const words = new Uint32Array(8);
  for (let i = 0; i < 8; i++) words[i] = readU32LE(contextKey, i * 4);
  return b3HashSingleBlock(keyMaterial, words, B3_DERIVE_KEY_MATERIAL);
}

// ---- MD5 + HKDF-SHA1 (SIP004 key derivation) -------------------------------

function md5Bytes(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || []);
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array((((bytes.length + 8) >>> 6) + 1) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  // 64-bit little-endian length; JS numbers are safe well beyond message sizes.
  let len = bitLen;
  for (let i = 0; i < 8; i++) {
    padded[padded.length - 8 + i] = len & 0xff;
    len = Math.floor(len / 256);
  }

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];

  for (let offset = 0; offset < padded.length; offset += 64) {
    const m = new Uint32Array(16);
    for (let i = 0; i < 16; i++) m[i] = readU32LE(padded, offset + i * 4);
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const next = d;
      d = c;
      c = b;
      const sum = (a + f + k[i] + m[g]) | 0;
      b = (b + ((sum << s[i]) | (sum >>> (32 - s[i])))) | 0;
      a = next;
    }
    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  const out = new Uint8Array(16);
  writeU32LE(out, 0, a0 >>> 0);
  writeU32LE(out, 4, b0 >>> 0);
  writeU32LE(out, 8, c0 >>> 0);
  writeU32LE(out, 12, d0 >>> 0);
  return out;
}

export function md5HexBytes(text) {
  return Array.from(md5Bytes(new TextEncoder().encode(String(text || ''))), b => b.toString(16).padStart(2, '0')).join('');
}

/** OpenSSL EVP_BytesToKey (count = 1) used by Shadowsocks 2017 AEAD. */
export function evpBytesToKey(password, keyLen) {
  const pass = new TextEncoder().encode(String(password || ''));
  const out = [];
  let prev = new Uint8Array(0);
  while (out.length < keyLen) {
    prev = md5Bytes(ssConcatBytes(prev, pass));
    for (let i = 0; i < prev.length; i++) out.push(prev[i]);
  }
  return Uint8Array.from(out.slice(0, keyLen));
}

const aesKeyCache = new Map();
function cacheCryptoKey(rawKey) {
  const id = ssBytesToBase64(rawKey);
  let pending = aesKeyCache.get(id);
  if (!pending) {
    pending = crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']);
    if (aesKeyCache.size > 256) aesKeyCache.clear();
    aesKeyCache.set(id, pending);
  }
  return pending;
}

export async function aesGcmSeal(rawKey, nonce, plaintext) {
  const key = await cacheCryptoKey(rawKey);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, key, plaintext);
  return new Uint8Array(ciphertext);
}

export async function aesGcmOpen(rawKey, nonce, ciphertext) {
  const key = await cacheCryptoKey(rawKey);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, key, ciphertext);
  return new Uint8Array(plaintext);
}

export async function hkdfSha1(ikm, salt, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-1', salt, info: new TextEncoder().encode(info) },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

// ---- ChaCha20-Poly1305 (RFC 8439) -----------------------------------------

function rotl32(value, bits) {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function chachaQuarter(state, a, b, c, d) {
  state[a] = (state[a] + state[b]) >>> 0; state[d] = rotl32(state[d] ^ state[a], 16);
  state[c] = (state[c] + state[d]) >>> 0; state[b] = rotl32(state[b] ^ state[c], 12);
  state[a] = (state[a] + state[b]) >>> 0; state[d] = rotl32(state[d] ^ state[a], 8);
  state[c] = (state[c] + state[d]) >>> 0; state[b] = rotl32(state[b] ^ state[c], 7);
}

function chachaBlock(key, counter, nonce) {
  const state = new Uint32Array(16);
  state[0] = 0x61707865; state[1] = 0x3320646e; state[2] = 0x79622d32; state[3] = 0x6b206574;
  for (let i = 0; i < 8; i++) state[4 + i] = readU32LE(key, i * 4);
  state[12] = counter >>> 0;
  state[13] = readU32LE(nonce, 0);
  state[14] = readU32LE(nonce, 4);
  state[15] = readU32LE(nonce, 8);
  const working = state.slice();
  for (let i = 0; i < 10; i++) {
    chachaQuarter(working, 0, 4, 8, 12);
    chachaQuarter(working, 1, 5, 9, 13);
    chachaQuarter(working, 2, 6, 10, 14);
    chachaQuarter(working, 3, 7, 11, 15);
    chachaQuarter(working, 0, 5, 10, 15);
    chachaQuarter(working, 1, 6, 11, 12);
    chachaQuarter(working, 2, 7, 8, 13);
    chachaQuarter(working, 3, 4, 9, 14);
  }
  const out = new Uint8Array(64);
  for (let i = 0; i < 16; i++) writeU32LE(out, i * 4, (working[i] + state[i]) >>> 0);
  return out;
}

function chachaXor(key, counter, nonce, input) {
  const out = new Uint8Array(input.length);
  for (let offset = 0; offset < input.length; offset += 64) {
    const block = chachaBlock(key, counter++, nonce);
    const end = Math.min(64, input.length - offset);
    for (let i = 0; i < end; i++) out[offset + i] = input[offset + i] ^ block[i];
  }
  return out;
}

// Poly1305 with ten 13-bit limbs. Every intermediate stays below 2^53, so plain
// JS numbers are exact and this is fast enough for 64 KB chunks.
function poly1305(message, key) {
  // clamp: r &= 0x0ffffffc0ffffffc0ffffffc0fffffff
  const clamped = new Uint8Array(16);
  clamped.set(key.subarray(0, 16));
  clamped[3] &= 15; clamped[7] &= 15; clamped[11] &= 15; clamped[15] &= 15;
  clamped[4] &= 252; clamped[8] &= 252; clamped[12] &= 252;
  const r = new Array(10).fill(0);
  for (let i = 0; i < 10; i++) {
    let word = 0;
    for (let bit = 0; bit < 13; bit++) {
      const at = i * 13 + bit;
      if (at < 128) word |= ((clamped[at >> 3] >> (at & 7)) & 1) << bit;
    }
    r[i] = word;
  }
  const s = new Array(10).fill(0);
  for (let i = 0; i < 10; i++) s[i] = r[i] * 5;

  const h = new Array(10).fill(0);
  for (let offset = 0; offset < message.length; offset += 16) {
    const blockBytes = Math.min(16, message.length - offset);
    const blockBits = blockBytes * 8;
    for (let i = 0; i < 10; i++) {
      let word = 0;
      for (let bit = 0; bit < 13; bit++) {
        const localBit = i * 13 + bit;
        if (localBit < blockBits) {
          const at = offset + (localBit >> 3);
          word |= ((message[at] >> (localBit & 7)) & 1) << bit;
        }
      }
      h[i] += word;
    }
    // Poly1305 appends a 1 bit right after the (possibly partial) block.
    h[Math.floor(blockBits / 13)] += 1 << (blockBits % 13);

    const d = new Array(19).fill(0);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) d[i + j] += h[i] * r[j];
    }
    for (let k = 10; k < 19; k++) d[k - 10] += 5 * d[k];

    let carry = 0;
    for (let i = 0; i < 10; i++) {
      const value = d[i] + carry;
      h[i] = value & 0x1fff;
      carry = Math.floor(value / 8192);
    }
    // 2^130 - 5 fold: a carry out of limb 9 has weight 2^130 ≡ 5.
    while (carry) {
      h[0] += carry * 5;
      carry = 0;
      for (let i = 0; i < 10; i++) {
        const value = h[i] + carry;
        h[i] = value & 0x1fff;
        carry = Math.floor(value / 8192);
      }
    }
  }

  // Final reduction: if h >= 2^130-5 subtract it (result must fit 130 bits).
  // First fully carry to 13-bit limbs; the representation then may hold 2^130.
  let carry = 0;
  for (let i = 0; i < 10; i++) {
    const value = h[i] + carry;
    h[i] = value & 0x1fff;
    carry = Math.floor(value / 8192);
  }
  // fold the carry (bit 130) with *5 until everything fits in ten limbs
  while (carry) {
    h[0] += carry * 5;
    carry = 0;
    for (let i = 0; i < 10; i++) {
      const value = h[i] + carry;
      h[i] = value & 0x1fff;
      carry = Math.floor(value / 8192);
    }
  }
  // subtract p = 2^130-5 if h >= p: add 5 and check overflow past 2^130
  const t = h.slice();
  let sum = 5, c = 0;
  for (let i = 0; i < 10; i++) {
    const value = t[i] + sum + c;
    t[i] = value & 0x1fff;
    c = Math.floor(value / 8192);
    sum = 0;
  }
  if (c) {
    for (let i = 0; i < 10; i++) h[i] = t[i];
  }

  // Add the pad (last 16 key bytes) as a 128-bit little-endian integer.
  const out = new Uint8Array(16);
  const pad = key.subarray(16, 32);
  // Assemble h into 16 bytes by reading 13-bit limbs.
  const full = new Uint8Array(17);
  for (let i = 0; i < 10; i++) {
    for (let bit = 0; bit < 13; bit++) {
      if ((h[i] >> bit) & 1) {
        const at = i * 13 + bit;
        if (at < 136) full[at >> 3] |= 1 << (at & 7);
      }
    }
  }
  let carry2 = 0;
  for (let i = 0; i < 16; i++) {
    const value = full[i] + pad[i] + carry2;
    out[i] = value & 0xff;
    carry2 = value >> 8;
  }
  return out;
}

function poly1305Tag(ciphertext, aad, otk) {
  const ctPad = (16 - (ciphertext.length % 16)) % 16;
  const aadPad = (16 - (aad.length % 16)) % 16;
  const lengths = new Uint8Array(16);
  let aadBytes = aad.length;
  let ctBytes = ciphertext.length;
  for (let i = 0; i < 8; i++) {
    lengths[i] = aadBytes & 0xff;
    lengths[8 + i] = ctBytes & 0xff;
    aadBytes = Math.floor(aadBytes / 256);
    ctBytes = Math.floor(ctBytes / 256);
  }
  const macData = ssConcatBytes(
    aad,
    new Uint8Array(aadPad),
    ciphertext,
    new Uint8Array(ctPad),
    lengths
  );
  return poly1305(macData, otk);
}

export function chacha20Poly1305Seal(key, nonce, plaintext, aad = new Uint8Array(0)) {
  const otk = chachaBlock(key, 0, nonce).subarray(0, 32);
  const ciphertext = chachaXor(key, 1, nonce, plaintext);
  return ssConcatBytes(ciphertext, poly1305Tag(ciphertext, aad, otk));
}

export function chacha20Poly1305Open(key, nonce, sealed, aad = new Uint8Array(0)) {
  if (sealed.length < 16) throw new Error('chacha20poly1305: short input');
  const ciphertext = sealed.subarray(0, sealed.length - 16);
  const tag = sealed.subarray(sealed.length - 16);
  const otk = chachaBlock(key, 0, nonce).subarray(0, 32);
  if (!constantTimeEqual(poly1305Tag(ciphertext, aad, otk), tag)) {
    throw new Error('chacha20poly1305: authentication failed');
  }
  return chachaXor(key, 1, nonce, ciphertext);
}

// ---- per-session AEAD abstraction -----------------------------------------

function nonce12(counter) {
  const nonce = new Uint8Array(12);
  let value = counter >>> 0;
  for (let i = 0; i < 4; i++) {
    nonce[i] = value & 0xff;
    value = Math.floor(value / 256);
  }
  return nonce;
}

function isChachaMethod(method) {
  return method === 'chacha20-ietf-poly1305';
}

async function makeSessionAead(method, subkey) {
  if (isChachaMethod(method)) {
    return {
      seal: async (plaintext, counter) => chacha20Poly1305Seal(subkey, nonce12(counter), plaintext),
      open: async (sealed, counter) => chacha20Poly1305Open(subkey, nonce12(counter), sealed)
    };
  }
  return {
    seal: (plaintext, counter) => aesGcmSeal(subkey, nonce12(counter), plaintext),
    open: (sealed, counter) => aesGcmOpen(subkey, nonce12(counter), sealed)
  };
}

// ---- Shadowsocks 2017 AEAD stream -----------------------------------------

export class Sip004Reader {
  constructor(method, password) {
    this.method = method;
    this.meta = ssMethodMeta(method);
    this.password = String(password || '');
    this.buffer = new Uint8Array(0);
    this.aead = null;
    this.counter = 0;
    this.pendingLength = -1;
  }

  async setup() {
    if (this.aead) return true;
    if (this.buffer.length < this.meta.saltLen + 2 + SS_TAG_LEN) return false;
    const salt = this.buffer.subarray(0, this.meta.saltLen);
    this.buffer = this.buffer.subarray(this.meta.saltLen);
    const master = evpBytesToKey(this.password, this.meta.keyLen);
    const subkey = await hkdfSha1(master, salt, 'ss-subkey', this.meta.keyLen);
    this.aead = await makeSessionAead(this.method, subkey);
    this.counter = 0;
    return true;
  }

  async feed(chunk) {
    this.buffer = ssConcatBytes(this.buffer, chunk);
    const chunks = [];
    for (;;) {
      if (!(await this.setup())) break;
      if (this.pendingLength < 0) {
        if (this.buffer.length < 2 + SS_TAG_LEN) break;
        const frame = this.buffer.subarray(0, 2 + SS_TAG_LEN);
        this.buffer = this.buffer.subarray(2 + SS_TAG_LEN);
        let plain;
        try {
          plain = await this.aead.open(frame, this.counter++);
        } catch (_e) {
          throw new Error('shadowsocks: length chunk authentication failed');
        }
        const length = readU16BE(plain, 0);
        if (!length || length > SS_2017_MAX_PAYLOAD) throw new Error('shadowsocks: invalid chunk length');
        this.pendingLength = length;
      }
      if (this.buffer.length < this.pendingLength + SS_TAG_LEN) break;
      const frame = this.buffer.subarray(0, this.pendingLength + SS_TAG_LEN);
      this.buffer = this.buffer.subarray(this.pendingLength + SS_TAG_LEN);
      let plain;
      try {
        plain = await this.aead.open(frame, this.counter++);
      } catch (_e) {
        throw new Error('shadowsocks: data chunk authentication failed');
      }
      chunks.push(plain);
      this.pendingLength = -1;
    }
    return ssConcatBytes(...chunks);
  }
}

export class Sip004Writer {
  constructor(method, password) {
    this.method = method;
    this.meta = ssMethodMeta(method);
    this.password = String(password || '');
    this.aead = null;
    this.counter = 0;
    this.salt = null;
    this.started = false;
  }

  async init() {
    if (this.aead) return;
    this.salt = ssRandomBytes(this.meta.saltLen);
    const master = evpBytesToKey(this.password, this.meta.keyLen);
    const subkey = await hkdfSha1(master, this.salt, 'ss-subkey', this.meta.keyLen);
    this.aead = await makeSessionAead(this.method, subkey);
    this.counter = 0;
  }

  async encode(data) {
    await this.init();
    const pieces = [];
    if (!this.started) {
      this.started = true;
      pieces.push(this.salt);
    }
    let offset = 0;
    while (offset < data.length) {
      const size = Math.min(SS_2017_MAX_PAYLOAD, data.length - offset);
      const payload = data.subarray(offset, offset + size);
      pieces.push(await this.aead.seal(encodeU16BE(size), this.counter++));
      pieces.push(await this.aead.seal(payload, this.counter++));
      offset += size;
    }
    return ssConcatBytes(...pieces);
  }
}

// ---- Shadowsocks 2022 stream ----------------------------------------------

// Bounded replay cache for 2022 request salts (one minute, enough to cover the
// ±30s timestamp window). Stale salts are pruned on every insert.
const ss2022SaltCache = new Map();

function rememberSs2022Salt(method, salt) {
  const now = Date.now();
  for (const [id, at] of ss2022SaltCache) {
    if (now - at <= 120000) break;
    ss2022SaltCache.delete(id);
  }
  const id = `${method}:${ssBytesToBase64(salt)}`;
  if (ss2022SaltCache.has(id)) return false;
  if (ss2022SaltCache.size >= 4096) ss2022SaltCache.clear();
  ss2022SaltCache.set(id, now);
  return true;
}

function parseSocks5Address(bytes, offset = 0) {
  if (bytes.length < offset + 1) return null;
  const atyp = bytes[offset];
  let cursor = offset + 1;
  let host = '';
  if (atyp === 1) {
    if (bytes.length < cursor + 4 + 2) return null;
    host = `${bytes[cursor]}.${bytes[cursor + 1]}.${bytes[cursor + 2]}.${bytes[cursor + 3]}`;
    cursor += 4;
  } else if (atyp === 3) {
    if (bytes.length < cursor + 1) return null;
    const length = bytes[cursor++];
    if (!length || bytes.length < cursor + length + 2) return null;
    host = new TextDecoder().decode(bytes.subarray(cursor, cursor + length));
    cursor += length;
  } else if (atyp === 4) {
    if (bytes.length < cursor + 16 + 2) return null;
    const parts = [];
    for (let i = 0; i < 8; i++) {
      parts.push(((bytes[cursor + i * 2] << 8) | bytes[cursor + i * 2 + 1]).toString(16));
    }
    host = parts.join(':');
    cursor += 16;
  } else {
    return null;
  }
  const port = readU16BE(bytes, cursor);
  cursor += 2;
  if (!host || !port) return null;
  return { atyp, host, port, next: cursor };
}

export { parseSocks5Address };

export class Sip2022Reader {
  constructor(method, pskBytes, options = {}) {
    this.method = method;
    this.meta = ssMethodMeta(method);
    this.psk = pskBytes;
    this.buffer = new Uint8Array(0);
    this.aead = null;
    this.counter = 0;
    this.pendingLength = -1;
    this.headerDone = false;
    this.address = null;
    this.initialData = new Uint8Array(0);
    this.requestSalt = null;
    this.headerLength = 0;
    this.timestamp = 0;
    this.skipReplayCheck = Boolean(options.skipReplayCheck);
  }

  async consume() {
    const chunks = [];
    if (!this.headerDone) {
      const saltLen = this.meta.saltLen;
      if (!this.aead) {
        if (this.buffer.length < saltLen + 11 + SS_TAG_LEN) return ssConcatBytes();
        const salt = this.buffer.slice(0, saltLen);
        this.buffer = this.buffer.subarray(saltLen);
        const subkey = blake3DeriveKey(SS_2022_CONTEXT, ssConcatBytes(this.psk, salt)).subarray(0, this.meta.keyLen);
        this.aead = await makeSessionAead(this.method, subkey);
        this.counter = 0;
        this.requestSalt = salt;
      }

      if (this.headerLength === 0) {
        if (this.buffer.length < 11 + SS_TAG_LEN) return ssConcatBytes();
        const fixedFrame = this.buffer.subarray(0, 11 + SS_TAG_LEN);
        this.buffer = this.buffer.subarray(11 + SS_TAG_LEN);
        let fixed;
        try {
          fixed = await this.aead.open(fixedFrame, this.counter++);
        } catch (_e) {
          throw new Error('shadowsocks2022: header authentication failed');
        }
        if (fixed[0] !== 0) throw new Error('shadowsocks2022: unexpected stream type');
        this.timestamp = beBytesToU64(fixed, 1);
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - this.timestamp) > SS_2022_TIMESTAMP_DRIFT_SECONDS && !this.skipReplayCheck) {
          throw new Error('shadowsocks2022: stale request timestamp');
        }
        this.headerLength = readU16BE(fixed, 9);
        if (this.headerLength < 7 || this.headerLength > 1200) throw new Error('shadowsocks2022: invalid header length');
      }

      if (this.buffer.length < this.headerLength + SS_TAG_LEN) return ssConcatBytes();
      const variableFrame = this.buffer.subarray(0, this.headerLength + SS_TAG_LEN);
      this.buffer = this.buffer.subarray(this.headerLength + SS_TAG_LEN);
      let variable;
      try {
        variable = await this.aead.open(variableFrame, this.counter++);
      } catch (_e) {
        throw new Error('shadowsocks2022: variable header authentication failed');
      }
      const address = parseSocks5Address(variable, 0);
      if (!address) throw new Error('shadowsocks2022: invalid address header');
      const paddingLength = readU16BE(variable, address.next);
      const headerEnd = address.next + 2 + paddingLength;
      if (headerEnd > variable.length) throw new Error('shadowsocks2022: invalid padding length');
      if (!this.skipReplayCheck && !rememberSs2022Salt(this.method, this.requestSalt)) {
        throw new Error('shadowsocks2022: replayed request salt');
      }
      this.address = { host: address.host, port: address.port, atyp: address.atyp };
      this.initialData = variable.slice(headerEnd);
      this.headerDone = true;
    }

    for (;;) {
      if (this.pendingLength < 0) {
        if (this.buffer.length < 2 + SS_TAG_LEN) break;
        const frame = this.buffer.subarray(0, 2 + SS_TAG_LEN);
        this.buffer = this.buffer.subarray(2 + SS_TAG_LEN);
        let plain;
        try {
          plain = await this.aead.open(frame, this.counter++);
        } catch (_e) {
          throw new Error('shadowsocks2022: length chunk authentication failed');
        }
        const length = readU16BE(plain, 0);
        if (!length || length > SS_2022_MAX_PAYLOAD) throw new Error('shadowsocks2022: invalid chunk length');
        this.pendingLength = length;
      }
      if (this.buffer.length < this.pendingLength + SS_TAG_LEN) break;
      const frame = this.buffer.subarray(0, this.pendingLength + SS_TAG_LEN);
      this.buffer = this.buffer.subarray(this.pendingLength + SS_TAG_LEN);
      let plain;
      try {
        plain = await this.aead.open(frame, this.counter++);
      } catch (_e) {
        throw new Error('shadowsocks2022: data chunk authentication failed');
      }
      chunks.push(plain);
      this.pendingLength = -1;
    }
    return ssConcatBytes(...chunks);
  }

  async feed(chunk) {
    this.buffer = ssConcatBytes(this.buffer, chunk);
    return await this.consume();
  }
}

export class Sip2022Writer {
  constructor(method, pskBytes, requestSalt) {
    this.method = method;
    this.meta = ssMethodMeta(method);
    this.psk = pskBytes;
    this.requestSalt = requestSalt || new Uint8Array(this.meta.keyLen);
    this.aead = null;
    this.counter = 0;
    this.salt = null;
    this.started = false;
  }

  async encode(data) {
    if (!data || !data.length) return new Uint8Array(0);
    const pieces = [];
    let offset = 0;
    if (!this.started) {
      this.started = true;
      this.salt = ssRandomBytes(this.meta.saltLen);
      const subkey = blake3DeriveKey(SS_2022_CONTEXT, ssConcatBytes(this.psk, this.salt)).subarray(0, this.meta.keyLen);
      this.aead = await makeSessionAead(this.method, subkey);
      this.counter = 0;
      const firstSize = Math.min(SS_2022_MAX_PAYLOAD, data.length);
      const header = ssConcatBytes(
        new Uint8Array([1]),
        u64ToBeBytes(Math.floor(Date.now() / 1000)),
        this.requestSalt.subarray(0, this.meta.keyLen),
        encodeU16BE(firstSize)
      );
      pieces.push(this.salt);
      pieces.push(await this.aead.seal(header, this.counter++));
      pieces.push(await this.aead.seal(data.subarray(0, firstSize), this.counter++));
      offset = firstSize;
    }
    while (offset < data.length) {
      const size = Math.min(SS_2022_MAX_PAYLOAD, data.length - offset);
      pieces.push(await this.aead.seal(encodeU16BE(size), this.counter++));
      pieces.push(await this.aead.seal(data.subarray(offset, offset + size), this.counter++));
      offset += size;
    }
    return ssConcatBytes(...pieces);
  }
}

// ---- per-user Shadowsocks credentials -------------------------------------

const ss2022PskCache = new Map();

/** HMAC-SHA256 based, per-user, per-method PSK for Shadowsocks 2022. */
export async function deriveSs2022Psk(secret, identity, method) {
  const meta = ssMethodMeta(method);
  if (!meta || meta.family !== '2022') return '';
  const cacheId = `${secret}|${identity}|${method}`;
  const cached = ss2022PskCache.get(cacheId);
  if (cached) return cached;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(String(secret || '')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = new Uint8Array(await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`miliconfig:ss2022:${identity}:${method}`)
  ));
  const psk = ssBytesToBase64(signature.subarray(0, meta.keyLen));
  if (ss2022PskCache.size > 512) ss2022PskCache.clear();
  ss2022PskCache.set(cacheId, psk);
  return psk;
}

export function ssIdentity(user) {
  return String(user?.uuid || '').toLowerCase();
}

export function ssUserPassword(user, cfg) {
  return String(
    user?.config?.sspass ||
    (cfg && cfg.sspass) ||
    user?.uuid ||
    ''
  );
}

export function ssUserConsumesNetwork(user) {
  return Boolean(user) && user.enabled !== false && !(
    Number(user.dataLimitGb) > 0 && Number(user.usedBytes) >= Number(user.dataLimitGb) * 1073741824
  ) && !(Number(user.expireAt) > 0 && Number(user.expireAt) < Date.now());
}

/**
 * Try to open a Shadowsocks session from the first WebSocket payload.
 * Returns null when the bytes are not one of the supported AEAD ciphers.
 */
export async function probeShadowsocks(buffer, candidates, options = {}) {
  const methods = Array.isArray(options.methods) && options.methods.length
    ? options.methods.filter(isSsMethod)
    : SS_METHOD_VARIANTS;
  const secret = String(options.secret || '');
  for (const method of methods) {
    const meta = ssMethodMeta(method);
    if (!meta) continue;
    for (const candidate of candidates) {
      const user = candidate.user;
      if (!user || !ssUserConsumesNetwork(user)) continue;
      try {
        if (meta.family === '2022') {
          if (buffer.length < meta.saltLen + 11 + SS_TAG_LEN) continue;
          const pskText = await deriveSs2022Psk(secret, ssIdentity(user), method);
          if (!pskText) continue;
          const pskBytes = ssBase64ToBytes(pskText);
          const reader = new Sip2022Reader(method, pskBytes);
          const plain = await reader.feed(buffer);
          if (reader.headerDone && reader.address) {
            return {
              method,
              meta,
              reader,
              user,
              address: reader.address,
              initialData: plain,
              pskBytes,
              password: ''
            };
          }
          continue;
        }
        if (buffer.length < meta.saltLen + 2 + SS_TAG_LEN) continue;
        const password = candidate.password;
        if (!password) continue;
        const reader = new Sip004Reader(method, password);
        const plain = await reader.feed(buffer);
        if (!plain.length) continue;
        const address = parseSocks5Address(plain, 0);
        if (!address) continue;
        return {
          method,
          meta,
          reader,
          user,
          address: { host: address.host, port: address.port, atyp: address.atyp },
          initialData: plain.subarray(address.next),
          pskBytes: null,
          password
        };
      } catch (_e) {
        // Wrong cipher/password: try the next candidate.
      }
    }
  }
  return null;
}

/** Server-wide key-derivation secret for Shadowsocks 2022 PSKs. */
export async function resolveSsSecret(env = {}) {
  const direct = String(env?.MILI_ENCRYPTION_KEY || env?.MILICONFIG_ENCRYPTION_KEY || '').trim();
  if (direct) return `env:${direct}`;
  try {
    if (typeof getAdminPasswordHash === 'function') {
      const hash = await getAdminPasswordHash(env);
      if (hash) return `admin:${hash}`;
    }
  } catch (_e) {}
  return 'admin:unconfigured';
}
