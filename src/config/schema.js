// ============================================================================
// miliconfigOS v4.0 - Central settings schema, validation and conflict engine
// Every persisted setting is declared here once. Unknown keys are rejected so
// the API can never write arbitrary rows into system_config.
// ============================================================================

import { CONFIG_DEFAULTS, FRAGMENT_PRESETS, PATH_PATTERNS, CF_PORT_CHOICES, SS_METHOD_OPTIONS } from './defaults.js';
import { DNS_PROFILES, DNS_MODES, OUTPUT_FORMATS, TLS_FINGERPRINTS } from './catalog.js';
import { isValidDomain } from '../core/utils.js';

const yesNo = value => (String(value).toLowerCase() === 'yes' || value === true || value === 1) ? 'yes' : 'no';

function text(labelFa, labelEn, helpFa = '', helpEn = '') {
  return { label: { fa: labelFa, en: labelEn }, help: { fa: helpFa, en: helpEn } };
}

export const SETTINGS_SCHEMA = [
  // ------------------------------------------------------------------ general
  {
    key: 'appName', section: 'general', type: 'text', default: 'MiliconfigOS', maxLength: 48,
    ...text('نام برنامه', 'Application name')
  },
  {
    key: 'homepage', section: 'general', type: 'url', default: 'https://nginx.com',
    ...text('آدرس صفحه خانه', 'Homepage URL', 'محتوای این صفحه پیش از ورود نمایش داده می‌شود.', 'Shown behind the login gateway.')
  },
  {
    key: 'language', section: 'general', type: 'select', default: 'fa',
    options: [{ value: 'fa', label: 'فارسی' }, { value: 'en', label: 'English' }],
    ...text('زبان پیش‌فرض', 'Default language')
  },
  {
    key: 'timezone', section: 'general', type: 'select', default: 'UTC',
    options: ['UTC', 'Asia/Tehran', 'Europe/Berlin', 'Europe/London', 'America/New_York', 'Asia/Dubai'].map(v => ({ value: v, label: v })),
    ...text('منطقه زمانی', 'Time zone')
  },
  {
    key: 'supportChannel', section: 'general', type: 'text', default: '@miliconfig', maxLength: 80,
    ...text('کانال پشتیبانی', 'Support channel')
  },
  {
    key: 'subNodeCount', section: 'general', type: 'number', default: 50, min: 1, max: 500,
    ...text('تعداد نود پیش‌فرض هر کاربر', 'Default nodes per user')
  },

  // ----------------------------------------------------------------- security
  {
    key: 'sessionHours', section: 'security', type: 'number', default: 12, min: 1, max: 720,
    ...text('مدت نشست مدیر (ساعت)', 'Admin session duration (hours)', 'همه نشست‌ها با تغییر رمز باطل می‌شوند.', 'All sessions are revoked when the password changes.')
  },
  {
    key: 'loginRateLimitMax', section: 'security', type: 'number', default: 8, min: 3, max: 60,
    ...text('حداکثر تلاش ناموفق ورود', 'Max failed logins per 15 min')
  },
  {
    key: 'auditRetentionDays', section: 'security', type: 'number', default: 90, min: 7, max: 365,
    ...text('نگهداری لاگ حسابرسی (روز)', 'Audit log retention (days)')
  },

  // ------------------------------------------------------------------ network
  {
    key: 'customDNS', section: 'network', type: 'select', default: CONFIG_DEFAULTS.customDNS,
    options: (() => {
      const catalogOptions = DNS_PROFILES.filter(item => item.doh).map(item => ({ value: item.doh, label: `${item.provider} (${item.doh})` }));
      // Keep the shipped default selectable even though it is not in the catalog.
      if (!catalogOptions.some(item => item.value === CONFIG_DEFAULTS.customDNS)) {
        catalogOptions.push({ value: CONFIG_DEFAULTS.customDNS, label: `223.5.5.5 (legacy default)` });
      }
      return catalogOptions;
    })(),
    // Private resolvers are legitimate; they are accepted only as a well-formed
    // HTTPS DoH URL and are then flagged as unverified custom values.
    allowCustom: true,
    customPattern: /^https:\/\/[a-z0-9.-]+(?::\d+)?\/[^\s"'<>]*$/i,
    ...text('پروفایل DNS', 'DNS profile', 'فهرست از مستندات رسمی ارائه‌دهندگان ساخته شده است.', 'Catalog built from provider documentation.')
  },
  {
    key: 'dnsMode', section: 'network', type: 'select', default: 'remote',
    options: DNS_MODES.map(item => ({ value: item.id, label: item.label.en })),
    ...text('حالت DNS', 'DNS routing mode')
  },
  {
    key: 'fp', section: 'network', type: 'select', default: 'chrome',
    options: TLS_FINGERPRINTS.map(item => ({ value: item.id, label: item.label })),
    ...text('اثر انگشت TLS', 'TLS fingerprint', 'انتخاب اثر انگشت، تضمین عدم شناسایی نیست.', 'A fingerprint does not guarantee indistinguishability.')
  },
  {
    key: 'alpn', section: 'network', type: 'select', default: '',
    options: [
      { value: '', label: 'Default' },
      { value: 'h2,http/1.1', label: 'h2, http/1.1' },
      { value: 'http/1.1', label: 'http/1.1' },
      { value: 'h3,h2,http/1.1', label: 'h3, h2, http/1.1' }
    ],
    ...text('ALPN', 'ALPN')
  },
  {
    key: 'ech', section: 'network', type: 'boolean', default: CONFIG_DEFAULTS.ech,
    ...text('ECH', 'ECH', 'فقط با رکورد HTTPS/SVCB معتبر و کلاینت سازگار قابل استفاده است.', 'Requires a valid HTTPS/SVCB record and a compatible client.')
  },
  {
    key: 'customECHDomain', section: 'network', type: 'select', default: CONFIG_DEFAULTS.customECHDomain,
    options: [
      { value: 'cloudflare-ech.com', label: 'cloudflare-ech.com' },
      { value: 'crypto.cloudflare.com', label: 'crypto.cloudflare.com' },
      { value: 'cloudflare-dns.com', label: 'cloudflare-dns.com' },
      { value: 'one.one.one.one', label: 'one.one.one.one' }
    ],
    ...text('دامنه ECH', 'ECH domain')
  },
  {
    key: 'ipv4', section: 'network', type: 'boolean', default: CONFIG_DEFAULTS.ipv4,
    ...text('فعال‌سازی IPv4', 'Enable IPv4')
  },
  {
    key: 'ipv6', section: 'network', type: 'boolean', default: CONFIG_DEFAULTS.ipv6,
    ...text('فعال‌سازی IPv6', 'Enable IPv6')
  },
  {
    key: 'healthIntervalMinutes', section: 'network', type: 'number', default: 60, min: 5, max: 1440,
    ...text('بازه بررسی سلامت', 'Health-check interval (min)')
  },
  {
    key: 'scannerConcurrency', section: 'network', type: 'number', default: 4, min: 1, max: 8,
    ...text('هم‌زمانی اسکنر', 'Scanner concurrency')
  },

  // -------------------------------------------------------------------- proxy
  {
    key: 'ev', section: 'proxy', type: 'boolean', default: CONFIG_DEFAULTS.ev,
    ...text('VLESS', 'VLESS')
  },
  {
    key: 'et', section: 'proxy', type: 'boolean', default: CONFIG_DEFAULTS.et,
    ...text('Trojan', 'Trojan')
  },
  {
    key: 'ex', section: 'proxy', type: 'boolean', default: CONFIG_DEFAULTS.ex,
    ...text('xHTTP (VLESS)', 'xHTTP (VLESS)')
  },
  {
    key: 'es', section: 'proxy', type: 'boolean', default: CONFIG_DEFAULTS.es,
    ...text('Shadowsocks', 'Shadowsocks', 'روی v2ray-plugin و الگوریتم‌های واقعی AEAD (۲۰۱۷ و ۲۰۲۲).', 'Runs on v2ray-plugin with real AEAD ciphers (2017 and 2022).')
  },
  {
    key: 'ports', section: 'proxy', type: 'ports', default: CONFIG_DEFAULTS.ports,
    ...text('پورت‌های نود', 'Node ports', 'لیست جداشده با کاما؛ فقط پورت‌های مجاز کلادفلر.', 'Comma-separated Cloudflare-supported ports.')
  },
  {
    key: 'dkby', section: 'proxy', type: 'boolean', default: CONFIG_DEFAULTS.dkby,
    ...text('فقط پورت‌های TLS', 'TLS ports only')
  },
  {
    key: 'patt', section: 'proxy', type: 'select', default: CONFIG_DEFAULTS.patt,
    options: PATH_PATTERNS.map(item => ({ value: item.id, label: item.name })),
    ...text('الگوی مسیر', 'Path pattern')
  },
  {
    key: 'frag', section: 'proxy', type: 'boolean', default: CONFIG_DEFAULTS.frag,
    ...text('Fragment', 'Fragment')
  },
  {
    key: 'fragmentPreset', section: 'proxy', type: 'select', default: CONFIG_DEFAULTS.fragmentPreset,
    options: Object.entries(FRAGMENT_PRESETS).map(([id, item]) => ({ value: id, label: item.name })),
    ...text('پریست Fragment', 'Fragment preset')
  },
  {
    key: 'ipRotation', section: 'proxy', type: 'select', default: 'off',
    options: [
      { value: 'off', label: 'Off' },
      { value: '5m', label: '5 minutes' },
      { value: '15m', label: '15 minutes' },
      { value: '1h', label: '1 hour' },
      { value: '24h', label: '24 hours' }
    ],
    ...text('چرخش آدرس', 'Address rotation')
  },
  {
    key: 'optimizationPolicy', section: 'proxy', type: 'select', default: 'balanced',
    options: [
      { value: 'balanced', label: { fa: 'متعادل', en: 'Balanced' } },
      { value: 'latency', label: { fa: 'کمترین تأخیر', en: 'Lowest latency' } },
      { value: 'stability', label: { fa: 'بیشترین پایداری', en: 'Most stable' } }
    ],
    ...text('سیاست بهینه‌سازی', 'Optimization policy')
  },

  // ------------------------------------------------------------------- cfnew
  // Every input the upstream CFnew panel exposes, so nothing has to be edited
  // in the dashboard's raw JSON or through environment variables anymore.
  {
    key: 'yx', section: 'cfnew', type: 'textarea', default: CONFIG_DEFAULTS.yx, maxLength: 8000,
    ...text('آی‌پی/پروکسی ترجیحی (yx)', 'Preferred IPs / proxies (yx)',
      'هر خط یا با کاما: آدرس، آدرس#نام، یا socks5://host:port#DE برای نود چندلوکیشن.',
      'One per line or comma: address, address#name, or socks5://host:port#DE for a location node.')
  },
  {
    key: 'yxURL', section: 'cfnew', type: 'url', default: CONFIG_DEFAULTS.yxURL,
    ...text('آدرس لیست زنده (yxURL)', 'Live list URL (yxURL)',
      'هر بار زنده خوانده می‌شود؛ آدرس‌ها و پروکسی‌های داخلش به نود تبدیل می‌شوند.',
      'Read live on every request; its addresses and proxies become nodes.')
  },
  {
    key: 'epi', section: 'cfnew', type: 'boolean', default: CONFIG_DEFAULTS.epi,
    ...text('آی‌پی‌های ثابت CF', 'Static CF IPs')
  },
  {
    key: 'epd', section: 'cfnew', type: 'boolean', default: CONFIG_DEFAULTS.epd,
    ...text('دامنه‌های مستقیم CF', 'Direct CF domains')
  },
  {
    key: 'egi', section: 'cfnew', type: 'boolean', default: CONFIG_DEFAULTS.egi,
    ...text('خواندن لیست زنده (egi)', 'Read the live list (egi)')
  },
  {
    key: 'ena', section: 'cfnew', type: 'boolean', default: CONFIG_DEFAULTS.ena,
    ...text('نود مستقیم سرور (ena)', 'Direct origin node (ena)')
  },
  {
    key: 'yxby', section: 'cfnew', type: 'boolean', default: 'no',
    ...text('نادیده‌گرفتن yx', 'Bypass yx', 'نودهای ترجیحی و لیست زنده ساخته نمی‌شوند.', 'Preferred and live-list nodes are skipped.')
  },
  {
    key: 'ispMobile', section: 'cfnew', type: 'boolean', default: CONFIG_DEFAULTS.ispMobile,
    ...text('موبایل (UOUIN)', 'Mobile line')
  },
  {
    key: 'ispUnicom', section: 'cfnew', type: 'boolean', default: CONFIG_DEFAULTS.ispUnicom,
    ...text('شبکهٔ دوم (UOUIN)', 'Second ISP line')
  },
  {
    key: 'ispTelecom', section: 'cfnew', type: 'boolean', default: CONFIG_DEFAULTS.ispTelecom,
    ...text('شبکهٔ سوم (UOUIN)', 'Third ISP line')
  },
  {
    key: 'locationNodeCount', section: 'cfnew', type: 'number', default: CONFIG_DEFAULTS.locationNodeCount, min: 1, max: 50,
    ...text('تعداد نود چندلوکیشن', 'Location nodes', 'در حالت MULTI هر نود از یک کشور متفاوت ساخته می‌شود.', 'MULTI builds one node per country before repeating.')
  },
  {
    key: 'sspass', section: 'cfnew', type: 'text', default: CONFIG_DEFAULTS.sspass, maxLength: 200,
    ...text('رمز Shadowsocks (sspass)', 'Shadowsocks password (sspass)', 'خالی بماند از UUID کاربر استفاده می‌شود.', 'Empty means the user UUID is used.')
  },
  {
    key: 'ssmethod', section: 'cfnew', type: 'select', default: CONFIG_DEFAULTS.ssmethod,
    options: SS_METHOD_OPTIONS.map(value => ({ value, label: value === 'auto' ? 'auto (همهٔ الگوریتم‌ها)' : value })),
    ...text('الگوریتم Shadowsocks (ssmethod)', 'Shadowsocks cipher (ssmethod)', 'در حالت auto همهٔ الگوریتم‌ها در ساب‌لینک توزیع می‌شوند.', 'auto spreads every cipher across the subscription.')
  },
  {
    key: 'tp', section: 'cfnew', type: 'text', default: CONFIG_DEFAULTS.tp, maxLength: 200,
    ...text('رمز Trojan (tp)', 'Trojan password (tp)')
  },
  {
    key: 's', section: 'cfnew', type: 'text', default: CONFIG_DEFAULTS.s, maxLength: 400,
    ...text('پروکسی خروجی (s)', 'Outgoing proxy (s)', 'مثل socks5://host:port؛ خروجی همهٔ نودها از آن می‌رود.', 'e.g. socks5://host:port; every node exits through it.')
  },
  {
    key: 'scu', section: 'cfnew', type: 'url', default: CONFIG_DEFAULTS.scu,
    ...text('مبدل اشتراک (scu)', 'Subscription converter (scu)')
  },
  {
    key: 'wk', section: 'cfnew', type: 'text', default: CONFIG_DEFAULTS.wk, maxLength: 8,
    ...text('کد منطقهٔ ورکر (wk)', 'Worker region (wk)', 'اختیاری؛ خالی یعنی خودکار.', 'Optional; empty means automatic.')
  },
  {
    key: 'ae', section: 'cfnew', type: 'boolean', default: 'no',
    ...text('اجازهٔ مسیرهای دلخواه (ae)', 'Allow arbitrary endpoints (ae)')
  },
  {
    key: 'jk', section: 'cfnew', type: 'boolean', default: 'no',
    ...text('زنجیرهٔ اینترنت خانگی (jk)', 'Home-internet chain (jk)', 'فقط برای کلاینتی که آدرس زنجیره را می‌خواهد.', 'Only for clients that request the chained target.')
  },
  {
    key: 'fragmentLength', section: 'cfnew', type: 'text', default: CONFIG_DEFAULTS.fragmentLength, maxLength: 32,
    ...text('طول فرگمنت', 'Fragment length')
  },
  {
    key: 'fragmentInterval', section: 'cfnew', type: 'text', default: CONFIG_DEFAULTS.fragmentInterval, maxLength: 32,
    ...text('فاصلهٔ فرگمنت', 'Fragment interval')
  },
  {
    key: 'fragmentPackets', section: 'cfnew', type: 'text', default: CONFIG_DEFAULTS.fragmentPackets, maxLength: 32,
    ...text('بسته‌های فرگمنت', 'Fragment packets')
  },

  // ------------------------------------------------------------ subscriptions
  {
    key: 'subFormats', section: 'subscriptions', type: 'multiselect', default: 'singbox,clash,uri',
    options: OUTPUT_FORMATS.map(item => ({ value: item.id, label: item.label })),
    ...text('فرمت‌های اشتراک', 'Subscription formats')
  },
  {
    key: 'defaultQuotaGb', section: 'subscriptions', type: 'number', default: 0, min: 0, max: 100000,
    ...text('حجم پیش‌فرض (GB)', 'Default quota (GB)', '۰ یعنی نامحدود.', '0 means unlimited.')
  },
  {
    key: 'defaultExpireDays', section: 'subscriptions', type: 'number', default: 0, min: 0, max: 3650,
    ...text('انقضای پیش‌فرض (روز)', 'Default expiry (days)', '۰ یعنی بدون انقضا.', '0 means no expiry.')
  },

  // -------------------------------------------------------------- appearance
  {
    key: 'accent', section: 'appearance', type: 'select', default: 'emerald',
    options: ['emerald', 'cyan', 'violet', 'amber'].map(v => ({ value: v, label: v })),
    ...text('رنگ تأکید', 'Accent color')
  },
  {
    key: 'animations', section: 'appearance', type: 'boolean', default: 'yes',
    ...text('انیمیشن‌ها', 'Animations', 'حالت کاهش حرکت سیستم‌عامل همیشه رعایت می‌شود.', 'System reduced-motion is always respected.')
  },

  // --------------------------------------------------------------- cloudflare
  {
    key: 'cfAccountId', section: 'cloudflare', type: 'text', default: '', maxLength: 64,
    ...text('شناسه حساب کلادفلر', 'Cloudflare account ID', 'اختیاری؛ برای فهرست Workerها لازم است.', 'Optional; needed to list Worker scripts.')
  }
];

export const SETTINGS_BY_KEY = new Map(SETTINGS_SCHEMA.map(field => [field.key, field]));

export const SETTINGS_SECTIONS = [
  { id: 'general', label: { fa: 'عمومی', en: 'General' } },
  { id: 'security', label: { fa: 'امنیت', en: 'Security' } },
  { id: 'network', label: { fa: 'شبکه و DNS', en: 'Network & DNS' } },
  { id: 'proxy', label: { fa: 'موتور پروکسی', en: 'Proxy engine' } },
  { id: 'cfnew', label: { fa: 'ورودی‌های CFnew', en: 'CFnew inputs' } },
  { id: 'subscriptions', label: { fa: 'اشتراک‌ها', en: 'Subscriptions' } },
  { id: 'appearance', label: { fa: 'ظاهر', en: 'Appearance' } },
  { id: 'cloudflare', label: { fa: 'کلادفلر', en: 'Cloudflare' } }
];

const ALLOWED_PORTS = new Set(CF_PORT_CHOICES.map(item => item.port));

function parsePorts(value) {
  const out = [];
  const seen = new Set();
  for (const chunk of String(value || '').split(/[,\s]+/)) {
    if (!chunk) continue;
    const port = parseInt(chunk, 10);
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
      return { ok: false, ports: [] };
    }
    if (!seen.has(port)) {
      seen.add(port);
      out.push(port);
    }
  }
  return { ok: out.length > 0, ports: out };
}

export function defaultSettings() {
  const out = {};
  for (const field of SETTINGS_SCHEMA) out[field.key] = field.default;
  return { ...CONFIG_DEFAULTS, ...out };
}

/**
 * Validate and normalize a settings patch.
 * Returns { values, errors, warnings }; `values` only contains known keys.
 */
export function validateSettings(input = {}, current = {}) {
  const values = {};
  const errors = [];
  const warnings = [];

  for (const field of SETTINGS_SCHEMA) {
    if (!(field.key in input)) continue;
    let raw = input[field.key];

    if (field.type === 'boolean') {
      values[field.key] = yesNo(raw);
      continue;
    }
    if (field.type === 'number') {
      const num = Number(raw);
      if (!Number.isFinite(num) || num < field.min || num > field.max) {
        errors.push({
          code: 'INVALID_NUMBER',
          field: field.key,
          message: `${field.label.en}: expected a number between ${field.min} and ${field.max}.`
        });
        continue;
      }
      values[field.key] = Math.round(num);
      continue;
    }
    if (field.type === 'ports') {
      const parsed = parsePorts(raw);
      if (!parsed.ok) {
        errors.push({ code: 'INVALID_PORTS', field: field.key, message: 'Ports must be a comma-separated list of valid ports.' });
        continue;
      }
      const unknown = parsed.ports.filter(port => !ALLOWED_PORTS.has(port));
      if (unknown.length) {
        warnings.push({
          code: 'PORT_NOT_CLOUDFLARE',
          field: field.key,
          severity: 'warning',
          message: `Ports not in the Cloudflare supported set: ${unknown.join(', ')}.`
        });
      }
      values[field.key] = parsed.ports.join(',');
      continue;
    }
    if (field.type === 'select') {
      const allowed = field.options.map(item => item.value);
      if (!allowed.includes(String(raw))) {
        // A few selects accept a documented custom value (e.g. a private DoH
        // endpoint). Those are validated by pattern instead of silently kept.
        if (field.allowCustom && field.customPattern && field.customPattern.test(String(raw))) {
          values[field.key] = String(raw);
          warnings.push({
            code: 'CUSTOM_VALUE',
            field: field.key,
            severity: 'warning',
            message: `${field.label.en}: custom value accepted. It is not in the verified catalog, so no reachability claim is made.`
          });
          continue;
        }
        errors.push({ code: 'INVALID_OPTION', field: field.key, message: `${field.label.en}: unsupported value.` });
        continue;
      }
      values[field.key] = String(raw);
      continue;
    }
    if (field.type === 'multiselect') {
      const allowed = new Set(field.options.map(item => item.value));
      const chosen = String(raw || '').split(',').map(v => v.trim()).filter(Boolean);
      const invalid = chosen.filter(v => !allowed.has(v));
      if (invalid.length) {
        errors.push({ code: 'INVALID_OPTION', field: field.key, message: `${field.label.en}: unsupported value(s) ${invalid.join(', ')}.` });
        continue;
      }
      if (chosen.length === 0) {
        errors.push({ code: 'EMPTY_SELECTION', field: field.key, message: `${field.label.en} requires at least one format.` });
        continue;
      }
      values[field.key] = [...new Set(chosen)].join(',');
      continue;
    }
    if (field.type === 'url') {
      const value = String(raw || '').trim();
      if (value === '') {
        values[field.key] = '';
        continue;
      }
      let parsed;
      try {
        parsed = new URL(value);
      } catch (_e) {
        errors.push({ code: 'INVALID_URL', field: field.key, message: `${field.label.en}: invalid URL.` });
        continue;
      }
      if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) {
        errors.push({ code: 'INVALID_URL', field: field.key, message: `${field.label.en}: only http(s) URLs without credentials are allowed.` });
        continue;
      }
      if (isPrivateHost(parsed.hostname)) {
        errors.push({ code: 'URL_NOT_ALLOWED', field: field.key, message: `${field.label.en}: local and private hosts are not allowed.` });
        continue;
      }
      values[field.key] = parsed.toString();
      continue;
    }

    // text
    const value = String(raw ?? '').trim();
    if (value.length > (field.maxLength || 200)) {
      errors.push({ code: 'TEXT_TOO_LONG', field: field.key, message: `${field.label.en}: too long.` });
      continue;
    }
    values[field.key] = value;
  }

  const merged = { ...current, ...values };
  const conflicts = detectConflicts(merged);
  for (const conflict of conflicts) {
    if (conflict.severity === 'error') errors.push(conflict);
    else warnings.push(conflict);
  }

  return { values, errors, warnings };
}

export function isPrivateHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (/^(0|10|127)\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) return true;
  if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) return true;
  return false;
}

/**
 * Cross-field validation. Errors block saving; warnings are shown but saved.
 */
export function detectConflicts(settings = {}) {
  const out = [];
  const cfg = { ...CONFIG_DEFAULTS, ...settings };
  const on = key => yesNo(cfg[key]) === 'yes';

  if (!on('ipv4') && !on('ipv6')) {
    out.push({
      code: 'NO_ADDRESS_FAMILY', severity: 'error', fields: ['ipv4', 'ipv6'],
      message: 'IPv4 and IPv6 are both disabled, so no endpoint can be generated.',
      fix: { ipv4: 'yes' }
    });
  }

  const ports = parsePorts(cfg.ports);
  if (ports.ok && on('dkby') === false) {
    const httpPorts = [80, 8080, 8880, 2052, 2082, 2086, 2095];
    if (ports.ports.some(port => httpPorts.includes(port))) {
      out.push({
        code: 'PLAINTEXT_PORT', severity: 'warning', fields: ['ports'],
        message: 'Plaintext Cloudflare ports are enabled. TLS and ECH will not apply to those nodes.'
      });
    }
  }

  if (on('ech')) {
    const dns = String(cfg.customDNS || '');
    if (!/^https:\/\/.+\/dns-query/.test(dns)) {
      out.push({
        code: 'ECH_WITHOUT_DOH', severity: 'error', fields: ['ech', 'customDNS'],
        message: 'ECH requires a DNS-over-HTTPS resolver so the client can fetch the HTTPS/SVCB record.'
      });
    }
    if (ports.ok && ports.ports.some(port => [80, 8080, 8880, 2052, 2082, 2086, 2095].includes(port)) && !on('dkby')) {
      out.push({
        code: 'ECH_PLAINTEXT_PORTS', severity: 'warning', fields: ['ech', 'ports'],
        message: 'ECH is enabled while plaintext ports are in the node list; those nodes cannot negotiate ECH.'
      });
    }
  }

  if (on('es') && String(cfg.ssmethod || 'auto') === 'auto' && String(cfg.subNodeCount || 50) < 3) {
    out.push({
      code: 'SS_FEW_NODES', severity: 'warning', fields: ['es', 'ssmethod', 'subNodeCount'],
      message: 'ssmethod is auto but the node cap is very low, so not every Shadowsocks cipher fits in one subscription.'
    });
  }

  if (on('frag') && String(cfg.fragmentPreset || 'off') === 'off') {
    out.push({
      code: 'FRAGMENT_NOOP', severity: 'warning', fields: ['frag', 'fragmentPreset'],
      message: 'Fragment is enabled but the preset is "off", so no fragment parameter is emitted.'
    });
  }

  if (!on('ev') && !on('et') && !on('ex') && !on('es')) {
    out.push({
      code: 'NO_PROTOCOL', severity: 'error', fields: ['ev', 'et', 'ex', 'es'],
      message: 'At least one protocol must be enabled.'
    });
  }

  if (String(cfg.dnsMode || 'remote') === 'fakeip' && String(cfg.subFormats || '').includes('singbox')) {
    out.push({
      code: 'FAKEIP_SINGBOX', severity: 'warning', fields: ['dnsMode', 'subFormats'],
      message: 'Fake-IP is a Mihomo/Clash feature. sing-box subscriptions will not receive a fake-ip DNS section.'
    });
  }

  if (String(cfg.homepage || '') && !/^https?:\/\//i.test(String(cfg.homepage))) {
    out.push({
      code: 'INVALID_HOMEPAGE', severity: 'error', fields: ['homepage'],
      message: 'Homepage must be an absolute http(s) URL.'
    });
  }

  if (String(cfg.customECHDomain || '') && !isValidDomain(String(cfg.customECHDomain))) {
    out.push({
      code: 'INVALID_ECH_DOMAIN', severity: 'error', fields: ['customECHDomain'],
      message: 'ECH domain must be a valid DNS name.'
    });
  }

  return out;
}

export function sanitizeSettingsForClient(raw = {}) {
  const out = {};
  for (const field of SETTINGS_SCHEMA) {
    if (raw[field.key] !== undefined) out[field.key] = raw[field.key];
  }
  delete out.adminPasswordHash;
  return out;
}

/** Fields the subscription generator consumes, with schema defaults applied. */
export function effectiveSettings(raw = {}) {
  return { ...CONFIG_DEFAULTS, ...defaultSettings(), ...raw };
}
