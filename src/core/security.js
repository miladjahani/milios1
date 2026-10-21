// ============================================================================
// miliconfigOS v4.0 - Security primitives
// - PBKDF2-SHA256 password hashing (100k iterations, per-hash salt)
// - constant-time verification with legacy SHA-256 migration
// - cryptographically random tokens
// - AES-GCM encryption for provider credentials at rest
// - password policy, cookie and same-origin helpers
// ============================================================================

const textEncoder = new TextEncoder();

// Cloudflare Workers (workerd) rejects any single PBKDF2 call above 100000
// iterations with NotSupportedError ("iteration counts above 100000 are not
// supported"), so the work factor is capped at the runtime maximum.
const PBKDF2_ITERATIONS = 100000;
const LEGACY_ITERATIONS = 50000;

export const SESSION_COOKIE = 'mili_session';
export const LEGACY_SESSION_COOKIE = 'mili_auth';

export const DEFAULT_SESSION_HOURS = 12;
export const MIN_SESSION_HOURS = 1;
export const MAX_SESSION_HOURS = 24 * 30;

const WEAK_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'admin', 'admin123', 'administrator',
  '1234567890', '12345678', '123456789', 'qwerty123', 'letmein123', 'miliconfig',
  'changeme', 'changeme123', 'welcome123', 'iloveyou', '11111111', '00000000'
]);

// ---- encoding helpers -------------------------------------------------------

export function bytesToBase64(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) {
    binary += String.fromCharCode.apply(null, arr.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(text) {
  const raw = atob(String(text || ''));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function bytesToHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex) {
  const clean = String(hex || '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function timingSafeEqual(a, b) {
  const left = String(a ?? '');
  const right = String(b ?? '');
  const len = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < len; i++) {
    diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function sha256HexDigest(text) {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(String(text ?? '')));
  return bytesToHex(new Uint8Array(digest));
}

export async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(String(secret ?? '')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(String(message ?? '')));
  return bytesToHex(new Uint8Array(sig));
}

export function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

// ---- password hashing -------------------------------------------------------

async function pbkdf2(password, saltBytes, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(String(password ?? '')),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$sha256$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

/**
 * Verify a stored password hash.
 * Supports `pbkdf2$...` records and legacy plain SHA-256 hex digests so that
 * existing installations can migrate on next successful login.
 */
export async function verifyPassword(password, stored) {
  const value = String(stored || '');
  if (!value) return { ok: false, needsRehash: false, scheme: 'none' };

  if (value.startsWith('pbkdf2$')) {
    const parts = value.split('$');
    if (parts.length !== 5 || parts[1] !== 'sha256') return { ok: false, needsRehash: false, scheme: 'pbkdf2-invalid' };
    const iterations = parseInt(parts[2], 10);
    if (!Number.isFinite(iterations) || iterations < LEGACY_ITERATIONS) {
      return { ok: false, needsRehash: false, scheme: 'pbkdf2-invalid' };
    }
    let salt;
    let expected;
    try {
      salt = base64ToBytes(parts[3]);
      expected = bytesToBase64(base64ToBytes(parts[4]));
    } catch (_e) {
      return { ok: false, needsRehash: false, scheme: 'pbkdf2-invalid' };
    }
    let actual;
    try {
      actual = bytesToBase64(await pbkdf2(password, salt, iterations));
    } catch (_e) {
      // A record stored with more than 100k iterations cannot be derived on
      // workerd at all; report it as invalid instead of bubbling a 500.
      return { ok: false, needsRehash: false, scheme: 'pbkdf2-invalid' };
    }
    const ok = timingSafeEqual(actual, expected);
    return { ok, needsRehash: ok && iterations < PBKDF2_ITERATIONS, scheme: 'pbkdf2' };
  }

  if (/^[0-9a-f]{64}$/i.test(value)) {
    const candidate = await sha256HexDigest(String(password ?? ''));
    const ok = timingSafeEqual(candidate, value.toLowerCase());
    return { ok, needsRehash: ok, scheme: 'sha256-legacy' };
  }

  return { ok: false, needsRehash: false, scheme: 'unknown' };
}

export function passwordPolicy(password) {
  const pw = String(password ?? '');
  if (pw.length < 10) {
    return { ok: false, code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 10 characters.' };
  }
  if (pw.length > 200) {
    return { ok: false, code: 'PASSWORD_TOO_LONG', message: 'Password must be at most 200 characters.' };
  }
  if (WEAK_PASSWORDS.has(pw.toLowerCase())) {
    return { ok: false, code: 'PASSWORD_TOO_COMMON', message: 'This password is too common.' };
  }
  if (/^(.)\1+$/.test(pw)) {
    return { ok: false, code: 'PASSWORD_TOO_REPETITIVE', message: 'Password must not repeat a single character.' };
  }
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(re => re.test(pw)).length;
  if (classes < 2) {
    return { ok: false, code: 'PASSWORD_TOO_SIMPLE', message: 'Use at least two character classes (letters, digits, symbols).' };
  }
  return { ok: true, code: 'OK', message: '' };
}

// ---- secret encryption at rest ---------------------------------------------

function encryptionKeyMaterial(env = {}) {
  return String(
    env.MILI_ENCRYPTION_KEY ||
    env.MILICONFIG_ENCRYPTION_KEY ||
    env.ENCRYPTION_KEY ||
    ''
  ).trim();
}

export function encryptionAvailable(env = {}) {
  return encryptionKeyMaterial(env).length >= 16;
}

async function importAesKey(env) {
  const material = encryptionKeyMaterial(env);
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(material));
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

/**
 * Encrypt a provider credential before storing it.
 * Format: `v1:<iv-b64>:<ciphertext-b64>`.
 * Without MILI_ENCRYPTION_KEY the value is only base64-encoded and the prefix
 * is `b64:`; callers must surface that state to the administrator.
 */
export async function encryptSecret(plain, env = {}) {
  const value = String(plain ?? '');
  if (!value) return { value: '', mode: 'empty' };
  if (!encryptionAvailable(env)) {
    return { value: `b64:${bytesToBase64(textEncoder.encode(value))}`, mode: 'base64-only' };
  }
  const key = await importAesKey(env);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    textEncoder.encode(value)
  );
  return {
    value: `v1:${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(ciphertext))}`,
    mode: 'aes-gcm'
  };
}

export async function decryptSecret(stored, env = {}) {
  const value = String(stored || '');
  if (!value) return { value: '', mode: 'empty' };
  if (value.startsWith('b64:')) {
    return { value: new TextDecoder().decode(base64ToBytes(value.slice(4))), mode: 'base64-only' };
  }
  if (!value.startsWith('v1:')) {
    throw new Error('Unsupported secret format');
  }
  if (!encryptionAvailable(env)) {
    throw new Error('MILI_ENCRYPTION_KEY is required to decrypt this secret');
  }
  const [, ivB64, ctB64] = value.split(':');
  const key = await importAesKey(env);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(ivB64) },
    key,
    base64ToBytes(ctB64)
  );
  return { value: new TextDecoder().decode(plaintext), mode: 'aes-gcm' };
}

// ---- HTTP helpers -----------------------------------------------------------

export function readCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

export function sessionCookie(request, token, maxAgeSeconds) {
  const secure = new URL(request.url).protocol === 'https:';
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
    'HttpOnly',
    'SameSite=Strict'
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(request) {
  return sessionCookie(request, '', 0);
}

/**
 * CSRF defence for state-changing API calls:
 * SameSite=Strict cookies plus a strict same-origin check on Origin/Referer.
 * Requests without either header are only accepted when they carry no cookie
 * auth (public endpoints), which the caller decides separately.
 */
export function isSameOriginRequest(request) {
  const url = new URL(request.url);
  const fetchSite = String(request.headers.get('Sec-Fetch-Site') || '').toLowerCase();
  if (fetchSite === 'same-origin' || fetchSite === 'none') return true;
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  const candidate = origin || referer;
  if (!candidate) return false;
  try {
    return new URL(candidate).host === url.host;
  } catch (_e) {
    return false;
  }
}

export function securityHeaders(extra = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    ...extra
  };
}

export function normalizeClientIp(request) {
  return String(request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '127.0.0.1')
    .split(',')[0]
    .trim();
}
