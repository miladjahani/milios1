// ============================================================================
// miliconfig v3.1 - مرکز کنترل سیستم‌عامل مدیریت (تم Z-E-U-S)
// بدون ایموجی - تمام آیکون‌ها SVG اختصاصی - دکمه‌ها با event delegation
// ============================================================================

import {
  BRAND_NAME,
  BRAND_UPPER,
  CF_PORT_CHOICES,
  CONFIG_DEFAULTS,
  COUNTRY_PROXY_SOURCES,
  DNS_PRESETS,
  ECH_DOMAINS,
  FINGERPRINT_PRESETS,
  FRAGMENT_PRESETS,
  MAX_USERS_LIMIT,
  PATH_PATTERNS,
  TELEGRAM_SUPPORT,
  VERSION
} from '../config/defaults.js';
import { USER_PRESETS } from '../config/presets.js';
import { FAVICON_DATA_URI, SHIELD_LOGO_SVG, icon, stripEmoji } from './icons.js';

const SUPPORT_URL = `https://t.me/${String(TELEGRAM_SUPPORT).replace(/^@/, '')}`;

// دیکشنری دوزبانه پنل (فارسی / انگلیسی)
const PANEL_I18N = {
  fa: {
    'nav.dashboard': 'داشبورد', 'nav.users': 'کاربران', 'nav.settings': 'تنظیمات',
    'nav.scanner': 'اسکنر', 'nav.locations': 'چندلوکیشن',
    'top.support': 'پشتیبانی', 'top.multi': 'چندلوکیشن', 'top.theme': 'حالت روز', 'top.lang': 'English',
    'panel.dashboard': 'داشبورد', 'panel.dashboardSub': 'وضعیت زنده سیستم و مصرف',
    'panel.users': 'کاربران', 'panel.usersSub': 'مدیریت اشتراک و محدودیت',
    'panel.settings': 'تنظیمات', 'panel.settingsSub': 'هسته پروکسی، شبکه و پنل',
    'panel.scanner': 'اسکنر زنده', 'panel.scannerSub': 'دریافت زنده پروکسی و آی‌پی ثابت (IPv4/IPv6) به تفکیک کشور',
    'panel.locations': 'چندلوکیشن', 'panel.locationsSub': 'ساب‌لینک به تفکیک کشور',
    'btn.reload': 'بروزرسانی', 'btn.createUser': 'ایجاد کاربر', 'btn.newUser': 'کاربر جدید',
    'btn.save': 'ذخیره تنظیمات', 'btn.reset': 'بازنشانی پیش‌فرض', 'btn.copyMaster': 'کپی ساب‌لینک اصلی',
    'btn.scan': 'دریافت و تست', 'btn.password': 'تغییر رمز مدیر',
    'metric.users': 'کاربران فعال', 'metric.traffic': 'حجم مصرف‌شده',
    'metric.ips': 'آی‌پی‌های سالم', 'metric.protocols': 'پروتکل‌های فعال',
    'settings.protocols': 'پروتکل‌ها و قابلیت‌ها', 'settings.network': 'شبکه و ترنسپورت', 'settings.panel': 'پنل و امنیت',
    'scanner.country': 'کشور', 'scanner.kind': 'نوع', 'scanner.family': 'خانواده آی‌پی',
    'scanner.count': 'تعداد', 'scanner.addCfIps': 'افزودن IPهای پیش‌فرض CFnew به yx',
    'scanner.addCfDomains': 'افزودن دامنه‌های پیش‌فرض CFnew به yx',
    'modal.create': 'ایجاد کاربر جدید', 'modal.username': 'نام کاربری', 'modal.preset': 'پریست',
    'modal.limit': 'حجم مجاز (GB) — صفر برای نامحدود', 'modal.days': 'مدت اعتبار (روز) — صفر برای بدون انقضا',
    'modal.nodes': 'تعداد نود در ساب‌لینک', 'modal.createBtn': 'ساخت کاربر', 'modal.cancel': 'انصراف',
    'modal.advanced': 'تنظیمات منحصر به فرد این کاربر',
    'modal.password': 'تغییر رمز مدیر', 'modal.old': 'رمز فعلی', 'modal.new': 'رمز جدید',
    'modal.confirmNew': 'تکرار رمز جدید', 'modal.savePassword': 'ذخیره رمز',
    'field.echDomain': 'دامنه ECH', 'field.dns': 'DNS سفارشی (DoH)', 'field.fragPreset': 'پریست فرگمنت',
    'field.ports': 'پورت‌های نود (ports)', 'field.fp': 'فینگرپرینت TLS', 'field.patt': 'الگوی مسیر (patt)',
    'field.rotation': 'چرخش آی‌پی', 'field.proxyIP': 'ProxyIP سفارشی (p)', 'field.locCount': 'تعداد نود چندلوکیشن',
    'field.outProxy': 'پروکسی خروجی (s)', 'field.dnsHint': 'یک DNS از لیست انتخاب کنید یا مقدار دلخواه DoH بنویسید.',
    'field.adminPath': 'مسیر مدیریت (رندوم)', 'field.customPath': 'مسیر سفارشی پنل (d)',
    'field.homepage': 'صفحه استتار (homepage)', 'field.yx': 'نودهای ترجیحی (yx)', 'field.nodeCount': 'تعداد نود هر کاربر',
    'warn.title': 'هشدار تداخل تنظیمات:',
    'card.usage': 'مصرف', 'card.expiry': 'انقضا', 'card.unlimited': 'نامحدود',
    'card.noExpiry': 'بدون انقضا', 'card.nodes': 'نود', 'card.active': 'فعال',
    'card.inactive': 'غیرفعال', 'card.preset': 'پریست', 'card.subscription': 'اشتراک فعال',
    'btn.copySub': 'ساب', 'btn.status': 'وضعیت', 'btn.resetUser': 'ریست', 'btn.testNodes': 'تست اتصال',
    'btn.rotatePath': 'مسیر جدید', 'btn.addToYx': 'افزودن به yx', 'btn.connectS': 'اتصال به s',
    'scan.colCountry': 'کشور', 'scan.colAddr': 'آدرس / پورت', 'scan.colType': 'نوع / پروتکل',
    'scan.colPing': 'پینگ', 'scan.colStatus': 'وضعیت', 'scan.colAction': 'عملیات',
    'scan.online': 'آنلاین', 'scan.unverified': 'پیشنهادی', 'scan.ipStatic': 'آی‌پی ثابت',
    'scan.proxy': 'پروکسی', 'scan.domain': 'دامنه', 'scan.idle': 'برای شروع، دریافت و تست را بزنید.',
    'scan.testing': 'در حال تست...', 'scan.none': 'موردی یافت نشد.',
    'toast.copied': 'در حافظه کپی شد', 'toast.linkCopied': 'لینک کپی شد',
    'toast.masterCopied': 'ساب‌لینک اصلی کپی شد', 'toast.saveOk': 'تنظیمات ذخیره شد',
    'toast.saveErr': 'خطا در ذخیره تنظیمات', 'toast.network': 'خطای شبکه',
    'toast.testingNodes': 'در حال تست اتصال نودها...', 'toast.rotateConfirm': 'مسیر مدیریت عوض شود؟ مسیر قبلی دیگر کار نمی‌کند.'
  },
  en: {
    'nav.dashboard': 'Dashboard', 'nav.users': 'Users', 'nav.settings': 'Settings',
    'nav.scanner': 'Scanner', 'nav.locations': 'Locations',
    'top.support': 'Support', 'top.multi': 'Locations', 'top.theme': 'Light mode', 'top.lang': 'فارسی',
    'panel.dashboard': 'Dashboard', 'panel.dashboardSub': 'Live system status and usage',
    'panel.users': 'Users', 'panel.usersSub': 'Subscriptions and limits',
    'panel.settings': 'Settings', 'panel.settingsSub': 'Proxy core, network and panel',
    'panel.scanner': 'Live scanner', 'panel.scannerSub': 'Live proxies and static IPs (IPv4/IPv6) by country',
    'panel.locations': 'Locations', 'panel.locationsSub': 'Country-specific subscriptions',
    'btn.reload': 'Refresh', 'btn.createUser': 'Create user', 'btn.newUser': 'New user',
    'btn.save': 'Save settings', 'btn.reset': 'Reset defaults', 'btn.copyMaster': 'Copy master subscription',
    'btn.scan': 'Fetch & test', 'btn.password': 'Change admin password',
    'metric.users': 'Active users', 'metric.traffic': 'Traffic used',
    'metric.ips': 'Healthy IPs', 'metric.protocols': 'Active protocols',
    'settings.protocols': 'Protocols & features', 'settings.network': 'Network & transport', 'settings.panel': 'Panel & security',
    'scanner.country': 'Country', 'scanner.kind': 'Type', 'scanner.family': 'IP family',
    'scanner.count': 'Count', 'scanner.addCfIps': 'Add CFnew default IPs to yx',
    'scanner.addCfDomains': 'Add CFnew default domains to yx',
    'modal.create': 'Create new user', 'modal.username': 'Username', 'modal.preset': 'Preset',
    'modal.limit': 'Data limit (GB) — 0 for unlimited', 'modal.days': 'Validity (days) — 0 for never',
    'modal.nodes': 'Nodes in subscription', 'modal.createBtn': 'Create user', 'modal.cancel': 'Cancel',
    'modal.advanced': 'Unique settings for this user',
    'modal.password': 'Change admin password', 'modal.old': 'Current password', 'modal.new': 'New password',
    'modal.confirmNew': 'Confirm new password', 'modal.savePassword': 'Save password',
    'field.echDomain': 'ECH domain', 'field.dns': 'Custom DNS (DoH)', 'field.fragPreset': 'Fragment preset',
    'field.ports': 'Node ports (ports)', 'field.fp': 'TLS fingerprint', 'field.patt': 'Path pattern (patt)',
    'field.rotation': 'IP rotation', 'field.proxyIP': 'Custom ProxyIP (p)', 'field.locCount': 'Location node count',
    'field.outProxy': 'Outbound proxy (s)', 'field.dnsHint': 'Pick a DNS from the list or type a custom DoH value.',
    'field.adminPath': 'Admin path (random)', 'field.customPath': 'Custom panel path (d)',
    'field.homepage': 'Camouflage page (homepage)', 'field.yx': 'Preferred nodes (yx)', 'field.nodeCount': 'Nodes per user',
    'warn.title': 'Settings conflict warning:',
    'card.usage': 'Usage', 'card.expiry': 'Expiry', 'card.unlimited': 'Unlimited',
    'card.noExpiry': 'No expiry', 'card.nodes': 'nodes', 'card.active': 'Active',
    'card.inactive': 'Disabled', 'card.preset': 'Preset', 'card.subscription': 'Active subscription',
    'btn.copySub': 'Sub', 'btn.status': 'Status', 'btn.resetUser': 'Reset', 'btn.testNodes': 'Test',
    'btn.rotatePath': 'New path', 'btn.addToYx': 'Add to yx', 'btn.connectS': 'Connect to s',
    'scan.colCountry': 'Country', 'scan.colAddr': 'Address / port', 'scan.colType': 'Type / protocol',
    'scan.colPing': 'Ping', 'scan.colStatus': 'Status', 'scan.colAction': 'Action',
    'scan.online': 'Online', 'scan.unverified': 'Suggested', 'scan.ipStatic': 'Static IP',
    'scan.proxy': 'Proxy', 'scan.domain': 'Domain', 'scan.idle': 'Press fetch & test to start.',
    'scan.testing': 'Testing...', 'scan.none': 'Nothing found.',
    'toast.copied': 'Copied', 'toast.linkCopied': 'Link copied',
    'toast.masterCopied': 'Master subscription copied', 'toast.saveOk': 'Settings saved',
    'toast.saveErr': 'Failed to save settings', 'toast.network': 'Network error',
    'toast.testingNodes': 'Testing node connectivity...', 'toast.rotateConfirm': 'Rotate the admin path? The old path will stop working.'
  }
};

function countryOptions() {
  return Object.entries(COUNTRY_PROXY_SOURCES)
    .map(([code, c]) => `<option value="${code}">${c.name} — ${code}</option>`)
    .join('');
}

export function renderAdminDashboardHtml(initialData = {}) {
  const config = initialData.config || CONFIG_DEFAULTS;
  const safeInitialJson = JSON.stringify({
    brand: BRAND_NAME,
    version: VERSION,
    defaults: CONFIG_DEFAULTS,
    presets: USER_PRESETS,
    config,
    users: initialData.users || [],
    diagnostics: initialData.diagnostics || {},
    adminPath: initialData.adminPath || '',
    countrySources: COUNTRY_PROXY_SOURCES,
    maxUsersLimit: MAX_USERS_LIMIT,
    telegramSupport: TELEGRAM_SUPPORT,
    dnsPresets: DNS_PRESETS,
    portChoices: CF_PORT_CHOICES,
    echDomains: ECH_DOMAINS,
    officialIps: initialData.officialIps || [],
    officialIpv6: initialData.officialIpv6 || [],
    directDomains: initialData.directDomains || [],
    i18n: PANEL_I18N
  }).replace(/</g, '\\u003c');

  const clientIcons = JSON.stringify({
    copy: icon('copy'),
    trash: icon('trash'),
    refresh: icon('refresh'),
    plus: icon('plus'),
    link: icon('link'),
    external: icon('external'),
    bolt: icon('bolt'),
    globe: icon('globe'),
    radar: icon('radar'),
    gauge: icon('gauge'),
    check: icon('check'),
    clock: icon('clock'),
    power: icon('power'),
    layers: icon('layers')
  });

  const ssmethods = ['none'];
  const ipRotationOptions = [
    ['off', 'غیرفعال'],
    ['5m', 'هر ۵ دقیقه'],
    ['15m', 'هر ۱۵ دقیقه'],
    ['30m', 'هر ۳۰ دقیقه'],
    ['1h', 'هر ۱ ساعت'],
    ['24h', 'هر ۲۴ ساعت']
  ];

  const presetOptions = Object.entries(USER_PRESETS)
    .map(([id, p]) => `<option value="${id}">${p.title || id}</option>`)
    .join('');

  return stripEmoji(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${BRAND_UPPER} ${VERSION} — مرکز کنترل</title>
<link rel="icon" href="${FAVICON_DATA_URI}">
<style>
  :root {
    --bg: #05080a;
    --bg-soft: #070c0e;
    --panel: rgba(9, 15, 13, 0.92);
    --panel-2: rgba(12, 20, 16, 0.9);
    --line: rgba(181, 255, 77, 0.13);
    --line-strong: rgba(181, 255, 77, 0.34);
    --neon: #b5ff4d;
    --neon-soft: rgba(181, 255, 77, 0.1);
    --neon-glow: rgba(181, 255, 77, 0.28);
    --text: #e9f3e2;
    --muted: #85957f;
    --muted-2: #5d6b59;
    --danger: #ff6262;
    --warn: #ffce5c;
    --info: #63e6d4;
    --radius: 18px;
    --shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    --font: "Vazirmatn", "Segoe UI", Tahoma, system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding-bottom: 108px;
    -webkit-font-smoothing: antialiased;
  }
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -2;
    background:
      radial-gradient(900px 480px at 82% -8%, rgba(181, 255, 77, 0.11), transparent 65%),
      radial-gradient(700px 420px at 8% 4%, rgba(99, 230, 212, 0.06), transparent 60%),
      linear-gradient(180deg, #060a0b 0%, #040607 100%);
  }
  body::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    background-image:
      linear-gradient(rgba(181, 255, 77, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(181, 255, 77, 0.035) 1px, transparent 1px);
    background-size: 46px 46px;
    mask-image: radial-gradient(circle at 50% 0%, #000 0%, transparent 78%);
    opacity: 0.55;
    pointer-events: none;
  }
  /* ---------- light theme (پنل، نه فقط صفحه ورود) ---------- */
  body.light-mode {
    --bg: #eef3f0;
    --bg-soft: #f7faf8;
    --panel: rgba(255, 255, 255, 0.94);
    --panel-2: rgba(248, 252, 249, 0.94);
    --line: rgba(6, 118, 71, 0.16);
    --line-strong: rgba(6, 118, 71, 0.38);
    --neon: #0b8a4b;
    --neon-soft: rgba(11, 138, 75, 0.1);
    --neon-glow: rgba(11, 138, 75, 0.22);
    --text: #0c1a12;
    --muted: #5a6d60;
    --muted-2: #7a8b7f;
    --shadow: 0 20px 50px rgba(15, 40, 25, 0.12);
  }
  body.light-mode::before {
    background:
      radial-gradient(900px 480px at 82% -8%, rgba(11, 138, 75, 0.1), transparent 65%),
      radial-gradient(700px 420px at 8% 4%, rgba(2, 132, 199, 0.08), transparent 60%),
      linear-gradient(180deg, #f7faf8 0%, #eaf0ec 100%);
  }
  body.light-mode::after {
    background-image:
      linear-gradient(rgba(11, 138, 75, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(11, 138, 75, 0.05) 1px, transparent 1px);
    opacity: 0.7;
  }
  body.light-mode .topbar { background: rgba(250, 253, 251, 0.9); }
  body.light-mode .window { background: linear-gradient(180deg, #ffffff, #f6faf7); }
  body.light-mode .metric,
  body.light-mode .card,
  body.light-mode .user-card,
  body.light-mode .loc-card { background: #ffffff; }
  body.light-mode .dock { background: rgba(255, 255, 255, 0.95); }
  body.light-mode .modal-card { background: #ffffff; }
  body.light-mode .toast-body { background: #ffffff; color: #0c1a12; }
  body.light-mode .field input,
  body.light-mode .field select,
  body.light-mode .field textarea { background: #ffffff; color: #0c1a12; border-color: var(--line); }
  body.light-mode .btn { background: #ffffff; color: #0c1a12; }
  body.light-mode .btn.primary { color: #06130b; }
  body.light-mode table.scan th { background: rgba(11, 138, 75, 0.06); }
  body.light-mode .icon-btn { background: #ffffff; color: #0c1a12; }
  body.light-mode .chip { background: #ffffff; }
  body.light-mode .scan-status { color: #5a6d60; }
  body.light-mode .dock-item { color: #4b5c50; }
  body.light-mode .switch i { background: #cfdcd4; }

  .mi { width: 20px; height: 20px; display: inline-block; vertical-align: middle; flex: none; }
  .mi-sm { width: 16px; height: 16px; }
  .mi-lg { width: 26px; height: 26px; }

  /* ---------- top bar ---------- */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 22px;
    background: rgba(5, 8, 10, 0.82);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--line);
  }
  .brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .brand .mili-shield-svg { width: 38px; height: 38px; flex: none; }
  .brand-text { line-height: 1.15; }
  .brand-name { font-size: 1.02rem; font-weight: 800; letter-spacing: 0.4px; }
  .brand-name span { color: var(--neon); }
  .brand-ver {
    font-family: var(--mono);
    font-size: 0.68rem;
    color: var(--muted);
    letter-spacing: 0.6px;
  }
  .topbar-spacer { flex: 1; }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 11px;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.025);
    font-size: 0.76rem;
    color: var(--muted);
    white-space: nowrap;
  }
  .chip b { color: var(--text); font-weight: 700; }
  .chip .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--neon); box-shadow: 0 0 10px var(--neon-glow); }
  .chip.warn .dot { background: var(--warn); box-shadow: 0 0 10px rgba(255, 206, 92, 0.4); }
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 8px 12px;
    border-radius: 11px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.03);
    color: var(--text);
    font-family: inherit;
    font-size: 0.78rem;
    cursor: pointer;
    transition: 0.16s;
  }
  .icon-btn:hover { border-color: var(--line-strong); background: var(--neon-soft); color: var(--neon); }
  .icon-btn.danger:hover { border-color: rgba(255, 98, 98, 0.5); background: rgba(255, 98, 98, 0.1); color: var(--danger); }
  .topbar .hide-sm { display: inline-flex; }

  /* ---------- main ---------- */
  .main { max-width: 1180px; margin: 0 auto; padding: 24px 20px 10px; }
  .panel { display: none; animation: rise 0.32s ease both; }
  .panel.is-active { display: block; }
  @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

  .window {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: linear-gradient(180deg, rgba(12, 19, 16, 0.96), rgba(6, 10, 9, 0.94));
    box-shadow: var(--shadow);
    overflow: hidden;
    margin-bottom: 20px;
  }
  .window-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 18px;
    border-bottom: 1px solid var(--line);
    background: linear-gradient(90deg, rgba(181, 255, 77, 0.06), transparent 55%);
  }
  .dots { display: inline-flex; gap: 6px; margin-inline-start: 2px; }
  .dots i { width: 8px; height: 8px; border-radius: 50%; display: block; background: #2b3a2c; }
  .dots i:nth-child(1) { background: #ff6b6b; }
  .dots i:nth-child(2) { background: #ffce5c; }
  .dots i:nth-child(3) { background: #b5ff4d; }
  .window-title { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 0.95rem; }
  .window-title .mi { color: var(--neon); }
  .window-sub { color: var(--muted); font-size: 0.74rem; margin-inline-start: 4px; font-weight: 500; }
  .window-head .spacer { flex: 1; }
  .window-body { padding: 18px; }

  /* ---------- metrics ---------- */
  .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(215px, 1fr)); gap: 14px; }
  .metric {
    position: relative;
    border: 1px solid var(--line);
    border-radius: 15px;
    padding: 16px 16px 14px;
    background:
      radial-gradient(140px 90px at 100% 0%, rgba(181, 255, 77, 0.09), transparent 70%),
      rgba(255, 255, 255, 0.018);
    overflow: hidden;
  }
  .metric::after {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 16px;
    bottom: 16px;
    width: 2px;
    background: linear-gradient(180deg, var(--neon), transparent);
    opacity: 0.6;
  }
  .metric-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .metric-label { color: var(--muted); font-size: 0.78rem; }
  .metric-icon { color: var(--neon); opacity: 0.9; }
  .metric-value { font-size: 1.7rem; font-weight: 800; margin: 10px 0 2px; letter-spacing: 0.5px; }
  .metric-value small { font-size: 0.86rem; color: var(--muted); font-weight: 600; margin-inline-start: 4px; }
  .metric-foot { font-size: 0.72rem; color: var(--muted-2); }

  .split { display: grid; grid-template-columns: 1.35fr 1fr; gap: 16px; margin-top: 16px; }
  .card {
    border: 1px solid var(--line);
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.016);
    padding: 16px;
  }
  .card h3 { margin: 0 0 12px; font-size: 0.86rem; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .card h3 .mi { color: var(--neon); width: 17px; height: 17px; }
  .kv { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px dashed rgba(181, 255, 77, 0.09); font-size: 0.8rem; }
  .kv:last-child { border-bottom: 0; }
  .kv span { color: var(--muted); }
  .kv b { font-weight: 700; font-family: var(--mono); font-size: 0.78rem; }
  .tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.2px;
    padding: 3px 8px; border-radius: 7px;
    border: 1px solid var(--line);
    color: var(--muted);
    background: rgba(255, 255, 255, 0.02);
  }
  .tag.on { color: var(--neon); border-color: var(--line-strong); background: var(--neon-soft); }
  .tag.off { opacity: 0.55; }
  .tag.mono { font-family: var(--mono); }

  /* ---------- buttons ---------- */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 15px; border-radius: 11px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.025);
    color: var(--text);
    font-family: inherit; font-size: 0.8rem; font-weight: 700;
    cursor: pointer; transition: 0.16s;
  }
  .btn .mi { width: 16px; height: 16px; }
  .btn:hover { border-color: var(--line-strong); background: var(--neon-soft); }
  .btn.primary {
    background: linear-gradient(180deg, rgba(181, 255, 77, 0.95), rgba(139, 209, 42, 0.95));
    color: #0a1206; border-color: transparent;
    box-shadow: 0 8px 22px rgba(181, 255, 77, 0.18);
  }
  .btn.primary:hover { filter: brightness(1.06); background: linear-gradient(180deg, #c7ff72, #98dd33); }
  .btn.ghost { background: transparent; }
  .btn.danger { color: var(--danger); border-color: rgba(255, 98, 98, 0.28); }
  .btn.danger:hover { background: rgba(255, 98, 98, 0.1); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn.sm { padding: 7px 10px; font-size: 0.72rem; border-radius: 9px; }
  .btn.sm .mi { width: 14px; height: 14px; }
  .toolbar { display: flex; flex-wrap: wrap; gap: 9px; align-items: center; }
  .toolbar .spacer { flex: 1; }

  /* ---------- users ---------- */
  .user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  .user-card {
    border: 1px solid var(--line);
    border-radius: 15px;
    padding: 15px;
    background: linear-gradient(180deg, rgba(181, 255, 77, 0.035), rgba(255, 255, 255, 0.012));
  }
  .user-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
  .user-name { font-weight: 800; font-size: 0.94rem; }
  .user-uuid { font-family: var(--mono); font-size: 0.66rem; color: var(--muted-2); direction: ltr; text-align: left; margin-top: 3px; }
  .pill { font-size: 0.68rem; font-weight: 700; padding: 4px 9px; border-radius: 999px; border: 1px solid var(--line); }
  .pill.on { color: var(--neon); border-color: var(--line-strong); background: var(--neon-soft); }
  .pill.off { color: var(--danger); border-color: rgba(255, 98, 98, 0.3); background: rgba(255, 98, 98, 0.08); }
  .usage { display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--muted); margin-top: 4px; }
  .bar { height: 6px; border-radius: 99px; background: rgba(255, 255, 255, 0.07); overflow: hidden; margin: 7px 0 2px; }
  .bar > i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #86c62c, #b5ff4d); }
  .user-tags { display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0; }
  .user-actions { display: flex; flex-wrap: wrap; gap: 6px; }
  .empty { text-align: center; color: var(--muted); padding: 34px 12px; font-size: 0.84rem; }

  /* ---------- forms ---------- */
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 0.76rem; color: var(--muted); }
  .field input[type="text"], .field input[type="number"], .field input[type="password"], .field select {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: rgba(0, 0, 0, 0.35);
    color: var(--text);
    font-family: inherit;
    font-size: 0.82rem;
    outline: none;
    transition: 0.15s;
  }
  .field input:focus, .field select:focus { border-color: var(--line-strong); box-shadow: 0 0 0 3px rgba(181, 255, 77, 0.08); }
  .field .hint { font-size: 0.68rem; color: var(--muted-2); }
  .switch-row {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 10px 12px; border: 1px solid var(--line); border-radius: 11px;
    background: rgba(255, 255, 255, 0.015);
  }
  .switch-row .switch-meta { display: flex; align-items: center; gap: 9px; min-width: 0; }
  .switch-row .switch-meta .mi { color: var(--neon); width: 17px; height: 17px; }
  .switch-row .switch-meta b { font-size: 0.78rem; font-weight: 700; display: block; }
  .switch-row .switch-meta span { font-size: 0.68rem; color: var(--muted-2); display: block; }
  .switch { position: relative; width: 42px; height: 24px; flex: none; }
  .switch input { position: absolute; opacity: 0; inset: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
  .switch i {
    position: absolute; inset: 0; border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--line);
    transition: 0.18s;
  }
  .switch i::after {
    content: ""; position: absolute; top: 3px; inset-inline-start: 3px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #6b7a67; transition: 0.18s;
  }
  .switch input:checked + i { background: rgba(181, 255, 77, 0.26); border-color: var(--line-strong); }
  .switch input:checked + i::after { background: var(--neon); inset-inline-start: 21px; box-shadow: 0 0 10px var(--neon-glow); }
  .group-title { font-size: 0.8rem; font-weight: 800; color: var(--text); margin: 4px 0 12px; display: flex; align-items: center; gap: 8px; }
  .group-title .mi { color: var(--neon); width: 17px; height: 17px; }

  /* ---------- scanner ---------- */
  .scan-controls { display: grid; grid-template-columns: 1.4fr 0.8fr auto; gap: 10px; align-items: end; }
  .table-wrap { overflow-x: auto; margin-top: 14px; border: 1px solid var(--line); border-radius: 12px; }
  table.scan { width: 100%; border-collapse: collapse; font-size: 0.78rem; min-width: 620px; }
  table.scan th {
    text-align: right; padding: 10px 12px; color: var(--muted);
    font-weight: 600; font-size: 0.72rem;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--line);
  }
  table.scan td { padding: 10px 12px; border-bottom: 1px solid rgba(181, 255, 77, 0.07); }
  table.scan tr:last-child td { border-bottom: 0; }
  table.scan tr:hover td { background: rgba(181, 255, 77, 0.03); }
  .mono { font-family: var(--mono); direction: ltr; text-align: left; }
  .lat-fast { color: var(--neon); }
  .lat-med { color: var(--warn); }
  .lat-slow { color: var(--danger); }
  .scan-status { font-size: 0.78rem; color: var(--muted); margin-top: 10px; min-height: 18px; }
  .scan-status.err { color: var(--danger); }
  .warn-box {
    margin-top: 14px; padding: 11px 13px; border-radius: 11px;
    border: 1px solid rgba(255, 206, 92, 0.45);
    background: rgba(255, 206, 92, 0.08);
    color: var(--warn); font-size: 0.78rem; line-height: 1.95;
  }
  .warn-box b { display: block; margin-bottom: 4px; }
  .warn-box ul { margin: 0; padding-inline-start: 18px; }
  .code-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 34px; padding: 3px 6px; border-radius: 7px;
    border: 1px solid var(--line-strong);
    background: var(--neon-soft);
    color: var(--neon); font-family: var(--mono); font-size: 0.68rem; font-weight: 700;
  }

  /* ---------- locations ---------- */
  .loc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(245px, 1fr)); gap: 12px; }
  .loc-card {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    border: 1px solid var(--line); border-radius: 12px; padding: 11px 12px;
    background: rgba(255, 255, 255, 0.015);
  }
  .loc-name { font-size: 0.8rem; font-weight: 700; }
  .loc-meta { font-size: 0.68rem; color: var(--muted-2); margin-top: 2px; }

  /* ---------- dock ---------- */
  .dock-wrap { position: fixed; inset-inline: 0; bottom: 14px; z-index: 60; display: flex; justify-content: center; pointer-events: none; }
  .dock {
    pointer-events: auto;
    display: flex; align-items: center; gap: 4px;
    padding: 7px;
    border-radius: 20px;
    border: 1px solid var(--line);
    background: rgba(6, 10, 9, 0.9);
    backdrop-filter: blur(20px);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.4) inset;
  }
  .dock-item {
    appearance: none; border: 0; background: transparent; color: var(--muted);
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    min-width: 74px; padding: 8px 10px; border-radius: 14px;
    font-family: inherit; font-size: 0.68rem; font-weight: 600; cursor: pointer;
    transition: 0.16s; position: relative;
  }
  .dock-item .mi { width: 21px; height: 21px; }
  .dock-item:hover { color: var(--text); background: rgba(255, 255, 255, 0.04); }
  .dock-item.is-active { color: var(--neon); background: var(--neon-soft); }
  .dock-item.is-active::after {
    content: ""; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%;
    background: var(--neon); box-shadow: 0 0 8px var(--neon-glow);
  }

  /* ---------- modal / toast ---------- */
  .modal { position: fixed; inset: 0; z-index: 90; display: none; align-items: center; justify-content: center; padding: 18px; background: rgba(2, 5, 4, 0.72); backdrop-filter: blur(6px); }
  .modal.is-open { display: flex; }
  .modal-card { width: min(460px, 100%); border-radius: var(--radius); border: 1px solid var(--line-strong); background: #070d0b; box-shadow: var(--shadow); overflow: hidden; }
  .modal-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--line); }
  .modal-head b { font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
  .modal-head .mi { color: var(--neon); }
  .modal-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; max-height: 74vh; overflow-y: auto; }
  .adv-box { border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; background: rgba(255, 255, 255, 0.015); }
  .adv-box summary { cursor: pointer; font-size: 0.8rem; font-weight: 700; color: var(--neon); }
  body.light-mode .adv-box { background: #f8faf9; }
  .modal-foot { padding: 0 16px 16px; display: flex; gap: 8px; justify-content: flex-start; }
  .toast {
    position: fixed; z-index: 120; inset-inline: 0; bottom: 96px;
    display: flex; justify-content: center; pointer-events: none;
  }
  .toast-body {
    transform: translateY(14px); opacity: 0;
    transition: 0.25s; max-width: 90vw;
    padding: 10px 16px; border-radius: 12px;
    border: 1px solid var(--line-strong);
    background: rgba(8, 14, 11, 0.96);
    color: var(--text); font-size: 0.8rem; font-weight: 600;
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
  }
  .toast-body.show { transform: none; opacity: 1; }
  .toast-body.err { border-color: rgba(255, 98, 98, 0.5); color: #ffb3b3; }
  .toast-body.ok { color: var(--neon); }

  @media (max-width: 820px) {
    .main { padding: 16px 12px 6px; }
    .topbar { padding: 10px 13px; gap: 9px; }
    .topbar .hide-sm { display: none; }
    .brand-ver { font-size: 0.62rem; }
    .split { grid-template-columns: 1fr; }
    .scan-controls { grid-template-columns: 1fr; }
    .window-body { padding: 14px; }
    .window-sub { display: none; }
    .dock-item { min-width: 60px; padding: 7px 6px; font-size: 0.62rem; }
    .dock-item .mi { width: 19px; height: 19px; }
  }
</style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      ${SHIELD_LOGO_SVG}
      <div class="brand-text">
        <div class="brand-name">${BRAND_NAME}<span>OS</span></div>
        <div class="brand-ver">${BRAND_UPPER} ${VERSION}</div>
      </div>
    </div>
    <div class="topbar-spacer"></div>
    <div class="chip hide-sm" id="storageChip"><span class="dot"></span><span id="storageText">حافظه</span></div>
    <div class="chip"><span id="userChipText">0 / ${MAX_USERS_LIMIT}</span><span>کاربر</span></div>
    <div class="chip hide-sm" id="clockChip">--:--</div>
    <button class="icon-btn" type="button" data-act="toggle-theme" id="themeBtn" title="حالت روز / شب">${icon('bolt')}<span class="hide-sm" data-i18n="top.theme">حالت روز</span></button>
    <button class="icon-btn" type="button" data-act="toggle-lang" id="langBtn" title="زبان"><span data-i18n="top.lang">English</span></button>
    <a class="icon-btn hide-sm" href="${SUPPORT_URL}" target="_blank" rel="noopener">${icon('signal')}<span data-i18n="top.support">پشتیبانی</span></a>
    <button class="icon-btn" type="button" data-act="open-multi" title="سابلینک چندلوکیشن">${icon('globe')}<span class="hide-sm" data-i18n="top.multi">چندلوکیشن</span></button>
    <button class="icon-btn" type="button" data-act="open-password" title="تغییر رمز مدیر">${icon('key')}</button>
    <button class="icon-btn danger" type="button" data-act="logout" title="خروج">${icon('logout')}</button>
  </header>

  <main class="main">
    <section class="panel is-active" data-panel="dashboard">
      <div class="window">
        <div class="window-head">
          <span class="dots"><i></i><i></i><i></i></span>
          <div class="window-title">${icon('dashboard')} <span data-i18n="panel.dashboard">داشبورد</span> <span class="window-sub" data-i18n="panel.dashboardSub">وضعیت زنده سیستم و مصرف</span></div>
          <div class="spacer"></div>
          <button class="btn sm ghost" type="button" data-act="reload-users">${icon('refresh')} <span data-i18n="btn.reload">بروزرسانی</span></button>
        </div>
        <div class="window-body">
          <div class="metrics">
            <div class="metric">
              <div class="metric-top"><span class="metric-label" data-i18n="metric.users">کاربران فعال</span><span class="metric-icon">${icon('users')}</span></div>
              <div class="metric-value" id="mUsers">0 <small>/ ${MAX_USERS_LIMIT}</small></div>
              <div class="metric-foot" id="mUsersFoot">ظرفیت آزاد</div>
            </div>
            <div class="metric">
              <div class="metric-top"><span class="metric-label" data-i18n="metric.traffic">حجم مصرف‌شده</span><span class="metric-icon">${icon('activity')}</span></div>
              <div class="metric-value" id="mTraffic">0.00 <small>GB</small></div>
              <div class="metric-foot">مجموع مصرف کاربران روی D1</div>
            </div>
            <div class="metric">
              <div class="metric-top"><span class="metric-label" data-i18n="metric.ips">آی‌پی‌های سالم</span><span class="metric-icon">${icon('server')}</span></div>
              <div class="metric-value" id="mIps">0 <small>نود</small></div>
              <div class="metric-foot">CFnew + نودهای ترجیحی</div>
            </div>
            <div class="metric">
              <div class="metric-top"><span class="metric-label" data-i18n="metric.protocols">پروتکل‌های فعال</span><span class="metric-icon">${icon('layers')}</span></div>
              <div class="metric-value" id="mProto" style="font-size: 1.25rem;">—</div>
              <div class="metric-foot">بر پایه تنظیمات ذخیره‌شده</div>
            </div>
          </div>

          <div class="split">
            <div class="card">
              <h3>${icon('terminal')} وضعیت هسته</h3>
              <div class="kv"><span>موتور پروکسی</span><b>VLESS / Trojan / xHTTP</b></div>
              <div class="kv"><span>ذخیره‌سازی</span><b id="kvStorage">—</b></div>
              <div class="kv"><span>بایندینگ دیتابیس</span><b id="kvBinding">—</b></div>
              <div class="kv"><span>مسیر مدیریت</span><b id="kvPath" class="mono">—</b></div>
              <div class="kv"><span>سقف کاربران</span><b>${MAX_USERS_LIMIT}</b></div>
            </div>
            <div class="card">
              <h3>${icon('bolt')} اقدام‌های سریع</h3>
              <div class="toolbar" style="flex-direction: column; align-items: stretch;">
                <button class="btn primary" type="button" data-act="open-create">${icon('plus')} <span data-i18n="btn.newUser">کاربر جدید</span></button>
                <button class="btn" type="button" data-act="go-scan">${icon('radar')} <span data-i18n="nav.scanner">اسکنر</span></button>
                <button class="btn" type="button" data-act="copy-master">${icon('copy')} <span data-i18n="btn.copyMaster">کپی سابلینک اصلی</span></button>
                <button class="btn ghost" type="button" data-act="go-settings">${icon('settings')} <span data-i18n="nav.settings">تنظیمات</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="panel" data-panel="users">
      <div class="window">
        <div class="window-head">
          <span class="dots"><i></i><i></i><i></i></span>
          <div class="window-title">${icon('users')} <span data-i18n="panel.users">کاربران</span> <span class="window-sub" data-i18n="panel.usersSub">مدیریت اشتراک و محدودیت</span></div>
          <div class="spacer"></div>
          <button class="btn sm ghost" type="button" data-act="reload-users">${icon('refresh')} <span data-i18n="btn.reload">بروزرسانی</span></button>
          <button class="btn sm primary" type="button" data-act="open-create">${icon('plus')} <span data-i18n="btn.createUser">ایجاد کاربر</span></button>
        </div>
        <div class="window-body">
          <div class="user-grid" id="usersGrid"></div>
          <div class="empty" id="usersEmpty" style="display:none;">هنوز کاربری ساخته نشده است.</div>
        </div>
      </div>
    </section>

    <section class="panel" data-panel="settings">
      <div class="window">
        <div class="window-head">
          <span class="dots"><i></i><i></i><i></i></span>
          <div class="window-title">${icon('settings')} <span data-i18n="panel.settings">تنظیمات</span> <span class="window-sub" data-i18n="panel.settingsSub">هسته پروکسی، شبکه و پنل</span></div>
        </div>
        <div class="window-body">
          <div class="group-title">${icon('layers')} <span data-i18n="settings.protocols">پروتکل‌ها و قابلیت‌ها</span></div>
          <div class="form-grid">
            <div class="switch-row">
              <div class="switch-meta">${icon('shield')}<div><b>VLESS</b><span>پروتکل اصلی اشتراک</span></div></div>
              <label class="switch"><input type="checkbox" data-key="ev"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('shield')}<div><b>Shadowsocks</b><span>پروتکل جایگزین · بدون فرگمنت</span></div></div>
              <label class="switch"><input type="checkbox" data-key="es"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('shield')}<div><b>Trojan</b><span>پورت و رمز عبور</span></div></div>
              <label class="switch"><input type="checkbox" data-key="et"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('terminal')}<div><b>xHTTP</b><span>استریمینگ HTTP جدید</span></div></div>
              <label class="switch"><input type="checkbox" data-key="ex"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('lock')}<div><b>ECH</b><span>رمزنگاری SNI</span></div></div>
              <label class="switch"><input type="checkbox" data-key="ech"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('bolt')}<div><b>فرگمنت TLS</b><span>ضد DPI — شادوساکس فرگمنت ندارد</span></div></div>
              <label class="switch"><input type="checkbox" data-key="frag"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('wifi')}<div><b>EPI</b><span>IP پیش‌فرض کلاینت</span></div></div>
              <label class="switch"><input type="checkbox" data-key="epi"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('branch')}<div><b>زنجیره خانگی (JK)</b><span>اتصال زنجیره‌ای</span></div></div>
              <label class="switch"><input type="checkbox" data-key="jk"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('wifi')}<div><b>IPv4</b><span>آی‌پی‌های ثابت نسخه ۴</span></div></div>
              <label class="switch"><input type="checkbox" data-key="ipv4"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('wifi')}<div><b>IPv6</b><span>آی‌پی‌های ثابت نسخه ۶</span></div></div>
              <label class="switch"><input type="checkbox" data-key="ipv6"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('globe')}<div><b>دامنه‌های مستقیم (EPD)</b><span>نودهای دامنه CNAME</span></div></div>
              <label class="switch"><input type="checkbox" data-key="epd"><i></i></label>
            </div>
            <div class="switch-row">
              <div class="switch-meta">${icon('globe')}<div><b>لیست آی‌پی خارجی (EGI)</b><span>واکشی از آدرس yxURL</span></div></div>
              <label class="switch"><input type="checkbox" data-key="egi"><i></i></label>
            </div>
          </div>

          <div class="group-title" style="margin-top: 22px;">${icon('sliders')} <span data-i18n="settings.network">شبکه و ترنسپورت</span></div>
          <div class="form-grid">
            <div class="field">
              <label>رمز تروجان (tp)</label>
              <input type="text" data-key="tp" placeholder="اختیاری">
            </div>
            <div class="field">
              <label>متد Shadowsocks</label>
              <select data-key="ssmethod">
                ${ssmethods.map(m => `<option value="${m}">${m} (سازگار با هسته)</option>`).join('')}
              </select>
              <span class="hint">هسته این ورکر فقط هدر متنی SS را می‌خواند؛ متدهای AEAD باعث بی‌پاسخ شدن نود می‌شوند.</span>
            </div>
            <div class="field" data-show-when="ech">
              <label>دامنه ECH</label>
              <select data-key="customECHDomain">
                ${ECH_DOMAINS.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
            <div class="field" data-show-when="frag">
              <label>پریست فرگمنت</label>
              <select data-key="fragmentPreset">
                ${Object.entries(FRAGMENT_PRESETS).map(([id, p]) => `<option value="${id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>فینگرپرینت TLS</label>
              <select data-key="fp">
                ${FINGERPRINT_PRESETS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>الگوی مسیر (patt)</label>
              <select data-key="patt">
                ${PATH_PATTERNS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>چرخش آی‌پی</label>
              <select data-key="ipRotation">
                ${ipRotationOptions.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>ProxyIP سفارشی (p)</label>
              <input type="text" data-key="p" placeholder="domain:port">
            </div>
            <div class="field">
              <label>تعداد نود چندلوکیشن</label>
              <input type="number" data-key="locationNodeCount" min="1" max="40" step="1" placeholder="8">
            </div>
            <div class="field">
              <label>پروکسی خروجی (s)</label>
              <input type="text" data-key="s" placeholder="socks5://user:pass@host:port">
              <span class="hint">ترافیک خروجی از این پروکسی عبور می‌کند (همان مقدار در مسیر نود هم گذاشته می‌شود).</span>
            </div>
            <div class="field" data-show-when="frag">
              <label>طول فرگمنت</label>
              <input type="text" data-key="fragmentLength" placeholder="100-200">
            </div>
            <div class="field" data-show-when="frag">
              <label>فاصله فرگمنت</label>
              <input type="text" data-key="fragmentInterval" placeholder="10-20">
            </div>
            <div class="field" data-show-when="frag">
              <label>نوع پکت فرگمنت</label>
              <input type="text" data-key="fragmentPackets" placeholder="tlshello">
            </div>
            <div class="field">
              <label data-i18n="field.dns">DNS سفارشی (DoH)</label>
              <select id="dnsPreset">
                ${DNS_PRESETS.map(d => `<option value="${d.value}">${d.name}</option>`).join('')}
                <option value="custom">سفارشی (مقدار دلخواه)</option>
              </select>
              <input type="text" data-key="customDNS" placeholder="https://223.5.5.5/dns-query" style="margin-top:8px;">
              <span class="hint" data-i18n="field.dnsHint">یک DNS از لیست انتخاب کنید یا مقدار دلخواه DoH بنویسید.</span>
            </div>
            <div class="field">
              <label data-i18n="field.ports">پورت‌های نود (ports)</label>
              <input type="text" data-key="ports" placeholder="443,2053,2087,8443">
              <span class="hint">لیست پورت‌ها با کاما — مجاز: ${CF_PORT_CHOICES.map(p => p.port).join(' , ')}. پورت HTTP فقط وقتی ECH خاموش است استفاده می‌شود.</span>
            </div>
          </div>

          <div class="group-title" style="margin-top: 22px;">${icon('shield')} <span data-i18n="settings.panel">پنل و امنیت</span></div>
          <div class="form-grid">
            <div class="field">
              <label data-i18n="field.adminPath">مسیر مدیریت (رندوم)</label>
              <div class="toolbar">
                <input type="text" id="adminPathView" class="mono" readonly style="flex:1;">
                <button class="btn sm" type="button" data-act="copy-admin-path">${icon('copy')} کپی</button>
                <button class="btn sm ghost" type="button" data-act="rotate-path">${icon('refresh')} <span data-i18n="btn.rotatePath">مسیر جدید</span></button>
              </div>
              <span class="hint">آدرس ثابت پنل همیشه <b>/admin</b> است؛ مسیر رندوم بالا (یا مسیر سفارشی d) هم به‌عنوان آدرس جایگزین کار می‌کند.</span>
            </div>
            <div class="field">
              <label data-i18n="field.customPath">مسیر سفارشی پنل (d)</label>
              <input type="text" data-key="d" placeholder="admin">
              <span class="hint">در صورت خالی بودن، همان مسیر رندوم بالا استفاده می‌شود.</span>
            </div>
            <div class="field">
              <label>صفحه استتار (homepage)</label>
              <input type="text" data-key="homepage" placeholder="https://example.com">
            </div>
            <div class="field">
              <label>نودهای ترجیحی (yx)</label>
              <input type="text" data-key="yx" placeholder="1.2.3.4:443#Node, 5.6.7.8:443#Node2">
            </div>
            <div class="field">
              <label data-i18n="field.nodeCount">تعداد نود هر کاربر</label>
              <input type="number" data-key="subNodeCount" min="1" max="200" step="1">
            </div>
          </div>

          <div id="configWarnings" class="warn-box" style="display:none;"></div>

          <div class="toolbar" style="margin-top: 18px;">
            <button class="btn primary" type="button" data-act="save-config">${icon('check')} <span data-i18n="btn.save">ذخیره تنظیمات</span></button>
            <button class="btn ghost" type="button" data-act="reset-config">${icon('refresh')} <span data-i18n="btn.reset">بازنشانی پیش‌فرض</span></button>
            <div class="spacer"></div>
            <button class="btn" type="button" data-act="open-password">${icon('key')} <span data-i18n="btn.password">تغییر رمز مدیر</span></button>
          </div>
        </div>
      </div>
    </section>

    <section class="panel" data-panel="scanner">
      <div class="window">
        <div class="window-head">
          <span class="dots"><i></i><i></i><i></i></span>
          <div class="window-title">${icon('radar')} <span data-i18n="panel.scanner">اسکنر زنده</span> <span class="window-sub" data-i18n="panel.scannerSub">دریافت زنده پروکسی و آی‌پی ثابت (IPv4/IPv6) به تفکیک کشور</span></div>
        </div>
        <div class="window-body">
          <div class="scan-controls">
            <div class="field">
              <label data-i18n="scanner.country">کشور</label>
              <select id="scanCountry">${countryOptions()}</select>
            </div>
            <div class="field">
              <label data-i18n="scanner.kind">نوع</label>
              <select id="scanKind">
                <option value="proxy" selected>پروکسی زنده (SOCKS5 / HTTP)</option>
                <option value="ip">آی‌پی ثابت CF</option>
              </select>
            </div>
            <div class="field" id="scanFamilyWrap">
              <label data-i18n="scanner.family">خانواده آی‌پی</label>
              <select id="scanFamily">
                <option value="any" selected>IPv4 + IPv6</option>
                <option value="ipv4">فقط IPv4</option>
                <option value="ipv6">فقط IPv6</option>
              </select>
            </div>
            <div class="field">
              <label data-i18n="scanner.count">تعداد</label>
              <select id="scanLimit">
                <option value="5">۵ مورد</option>
                <option value="10" selected>۱۰ مورد</option>
                <option value="15">۱۵ مورد</option>
                <option value="20">۲۰ مورد</option>
              </select>
            </div>
            <button class="btn primary" type="button" id="btnScan" data-act="run-scan">${icon('bolt')} <span data-i18n="btn.scan">دریافت و تست</span></button>
          </div>
          <div class="scan-status" id="scanHint">آی‌پی‌های سالم با دکمهٔ «افزودن به yx» و پروکسی‌ها با «اتصال به s» در تنظیمات ذخیره می‌شوند.</div>
          <div class="toolbar" style="margin-top: 12px;">
            <button class="btn sm" type="button" data-act="add-cf-ips">${icon('plus')} <span data-i18n="scanner.addCfIps">افزودن IPهای پیش‌فرض CFnew به yx</span></button>
            <button class="btn sm" type="button" data-act="add-cf-domains">${icon('globe')} <span data-i18n="scanner.addCfDomains">افزودن دامنه‌های پیش‌فرض CFnew به yx</span></button>
          </div>
          <div class="scan-status" id="scanStatus"></div>
          <div class="table-wrap">
            <table class="scan">
              <thead>
                <tr>
                  <th data-i18n="scan.colCountry">کشور</th>
                  <th data-i18n="scan.colAddr">آدرس / پورت</th>
                  <th data-i18n="scan.colType">نوع / پروتکل</th>
                  <th data-i18n="scan.colPing">پینگ</th>
                  <th data-i18n="scan.colStatus">وضعیت</th>
                  <th data-i18n="scan.colAction">عملیات</th>
                </tr>
              </thead>
              <tbody id="scanBody">
                <tr><td colspan="6" class="empty">برای شروع، دریافت و تست را بزنید.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section class="panel" data-panel="locations">
      <div class="window">
        <div class="window-head">
          <span class="dots"><i></i><i></i><i></i></span>
          <div class="window-title">${icon('globe')} <span data-i18n="panel.locations">چندلوکیشن</span> <span class="window-sub" data-i18n="panel.locationsSub">سابلینک به تفکیک کشور</span></div>
          <div class="spacer"></div>
          <button class="btn sm ghost" type="button" data-act="copy-master">${icon('copy')} همه لوکیشن‌ها</button>
        </div>
        <div class="window-body">
          <div class="loc-grid" id="locGrid"></div>
        </div>
      </div>
    </section>
  </main>

  <div class="dock-wrap">
    <nav class="dock">
      <button class="dock-item is-active" type="button" data-tab="dashboard">${icon('dashboard')}<span data-i18n="nav.dashboard">داشبورد</span></button>
      <button class="dock-item" type="button" data-tab="users">${icon('users')}<span data-i18n="nav.users">کاربران</span></button>
      <button class="dock-item" type="button" data-tab="settings">${icon('settings')}<span data-i18n="nav.settings">تنظیمات</span></button>
      <button class="dock-item" type="button" data-tab="scanner">${icon('radar')}<span data-i18n="nav.scanner">اسکنر</span></button>
      <button class="dock-item" type="button" data-tab="locations">${icon('globe')}<span data-i18n="nav.locations">چندلوکیشن</span></button>
    </nav>
  </div>

  <div class="modal" id="createModal">
    <div class="modal-card">
      <div class="modal-head"><b>${icon('plus')} ایجاد کاربر جدید</b><button class="icon-btn" type="button" data-act="close-modal" data-modal="createModal">${icon('close')}</button></div>
      <div class="modal-body">
        <div class="field"><label>نام کاربری</label><input type="text" id="newUsername" placeholder="مثلاً ali"></div>
        <div class="field"><label>پریست</label><select id="newPreset">${presetOptions}</select></div>
        <div class="field"><label>حجم مجاز (GB) — صفر برای نامحدود</label><input type="number" id="newLimit" min="0" step="1" value="0"></div>
        <div class="field"><label>مدت اعتبار (روز) — صفر برای بدون انقضا</label><input type="number" id="newDays" min="0" step="1" value="0"></div>
        <div class="field"><label>تعداد نود در سابلینک</label><input type="number" id="newNodes" min="1" max="200" step="1" value="${Number(config.subNodeCount) || 50}"></div>
        <details class="adv-box">
          <summary data-i18n="modal.advanced">تنظیمات منحصر به فرد این کاربر</summary>
          <div class="form-grid" style="margin-top:10px;">
            <div class="field"><label>VLESS</label><select id="cfgEv"><option value="yes">روشن</option><option value="no">خاموش</option></select></div>
            <div class="field"><label>Trojan</label><select id="cfgEt"><option value="yes">روشن</option><option value="no">خاموش</option></select></div>
            <div class="field"><label>Shadowsocks</label><select id="cfgEs"><option value="yes">روشن</option><option value="no">خاموش</option></select></div>
            <div class="field"><label>xHTTP</label><select id="cfgEx"><option value="yes">روشن</option><option value="no">خاموش</option></select></div>
            <div class="field"><label>ECH</label><select id="cfgEch"><option value="yes">روشن</option><option value="no">خاموش</option></select></div>
            <div class="field"><label>فرگمنت</label><select id="cfgFrag"><option value="yes">روشن</option><option value="no">خاموش</option></select></div>
            <div class="field"><label data-i18n="field.dns">DNS سفارشی</label>
              <select id="cfgDNS">${DNS_PRESETS.map(d => `<option value="${d.value}">${d.name}</option>`).join('')}</select>
            </div>
            <div class="field"><label data-i18n="field.echDomain">دامنه ECH</label>
              <select id="cfgEchDomain">${ECH_DOMAINS.map(d => `<option value="${d}">${d}</option>`).join('')}</select>
            </div>
            <div class="field"><label data-i18n="field.ports">پورت‌های نود</label><input type="text" id="cfgPorts" value="${config.ports || '443,2053,2087,8443'}"></div>
            <div class="field"><label data-i18n="field.fp">فینگرپرینت TLS</label>
              <select id="cfgFp">${FINGERPRINT_PRESETS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select>
            </div>
            <div class="field"><label data-i18n="field.patt">الگوی مسیر</label>
              <select id="cfgPatt">${PATH_PATTERNS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select>
            </div>
            <div class="field"><label data-i18n="field.yx">نودهای ترجیحی (yx)</label><input type="text" id="cfgYx" placeholder="1.2.3.4:443#Node"></div>
            <div class="field"><label data-i18n="field.outProxy">پروکسی خروجی (s)</label><input type="text" id="cfgS" placeholder="socks5://host:1080"></div>
          </div>
        </details>
      </div>
      <div class="modal-foot">
        <button class="btn primary" type="button" data-act="create-user">${icon('check')} <span data-i18n="modal.createBtn">ساخت کاربر</span></button>
        <button class="btn ghost" type="button" data-act="close-modal" data-modal="createModal"><span data-i18n="modal.cancel">انصراف</span></button>
      </div>
    </div>
  </div>

  <div class="modal" id="passwordModal">
    <div class="modal-card">
      <div class="modal-head"><b>${icon('key')} تغییر رمز مدیر</b><button class="icon-btn" type="button" data-act="close-modal" data-modal="passwordModal">${icon('close')}</button></div>
      <div class="modal-body">
        <div class="field"><label>رمز فعلی</label><input type="password" id="pwdOld" autocomplete="current-password"></div>
        <div class="field"><label>رمز جدید</label><input type="password" id="pwdNew" autocomplete="new-password"></div>
        <div class="field"><label>تکرار رمز جدید</label><input type="password" id="pwdNew2" autocomplete="new-password"></div>
      </div>
      <div class="modal-foot">
        <button class="btn primary" type="button" data-act="save-password">${icon('check')} ذخیره رمز</button>
        <button class="btn ghost" type="button" data-act="close-modal" data-modal="passwordModal">انصراف</button>
      </div>
    </div>
  </div>

  <div class="toast"><div class="toast-body" id="toastBody"></div></div>

<script>
  var INITIAL_DATA = ${safeInitialJson};
  var ICO = ${clientIcons};
  var MAX_USERS = INITIAL_DATA.maxUsersLimit || 3;
  var ADMIN_PATH = String(INITIAL_DATA.adminPath || '').replace(/^\\/+|\\/+$/g, '');
  var API_BASE = ADMIN_PATH ? '/' + ADMIN_PATH : '';
  var state = {
    config: INITIAL_DATA.config || {},
    users: INITIAL_DATA.users || [],
    diagnostics: INITIAL_DATA.diagnostics || {}
  };
  var scanResults = [];

  function $(id) { return document.getElementById(id); }
  function origin() { return window.location.origin; }
  function userKey(u) { return (u && (u.uuid || u.id)) || ''; }

  function showToast(text, kind) {
    var t = $('toastBody');
    t.textContent = text;
    t.className = 'toast-body show ' + (kind || '');
    clearTimeout(t._timer);
    t._timer = setTimeout(function() { t.className = 'toast-body ' + (kind || ''); }, 2800);
  }

  function copyText(text, okMsg) {
    var done = function() { showToast(okMsg || 'در حافظه کپی شد', 'ok'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function() { legacyCopy(text, done); });
    } else {
      legacyCopy(text, done);
    }
  }
  function legacyCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { showToast('کپی ناموفق بود', 'err'); }
    document.body.removeChild(ta);
  }

  function api(path, options) {
    var opts = options || {};
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch(API_BASE + path, opts).then(function(res) {
      return res.json().catch(function() { return { success: false, message: 'پاسخ نامعتبر از سرور' }; })
        .then(function(data) { data._status = res.status; return data; });
    });
  }

  function fmtGb(bytes) { return (Number(bytes || 0) / 1073741824).toFixed(2); }
  function fmtDate(ms) {
    if (!ms) return t('card.noExpiry');
    try { return new Date(ms).toLocaleDateString('fa-IR'); } catch (e) { return '—'; }
  }

  function activeProtocols() {
    var c = state.config || {};
    var list = [];
    list.push('VLESS');
    if (c.es === 'yes') list.push('SS');
    if (c.et === 'yes') list.push('Trojan');
    if (c.ex === 'yes') list.push('xHTTP');
    if (c.ech === 'yes') list.push('ECH');
    return list;
  }

  function showPanel(name) {
    document.querySelectorAll('.panel').forEach(function(p) {
      p.classList.toggle('is-active', p.getAttribute('data-panel') === name);
    });
    document.querySelectorAll('.dock-item').forEach(function(b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === name);
    });
    if (history.replaceState) history.replaceState(null, '', '#' + name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderMetrics() {
    var users = state.users || [];
    var totalBytes = users.reduce(function(a, u) { return a + Number(u.usedBytes || 0); }, 0);
    $('mUsers').innerHTML = users.length + ' <small>/ ' + MAX_USERS + '</small>';
    $('mUsersFoot').textContent = users.length >= MAX_USERS ? 'سقف کاربران تکمیل است' : (MAX_USERS - users.length) + ' ظرفیت آزاد';
    $('mTraffic').innerHTML = fmtGb(totalBytes) + ' <small>GB</small>';
    $('mIps').innerHTML = (state.diagnostics.healthyCfIps || 0) + ' <small>نود</small>';
    $('mProto').textContent = activeProtocols().join(' + ');
    $('userChipText').textContent = users.length + ' / ' + MAX_USERS;

    var storage = state.diagnostics.storageMode || (state.diagnostics.d1Enabled ? 'D1' : 'Memory');
    $('storageText').textContent = 'ذخیره‌سازی ' + storage;
    $('storageChip').className = 'chip hide-sm' + (storage === 'D1' ? '' : ' warn');
    $('kvStorage').textContent = storage;
    $('kvBinding').textContent = state.diagnostics.d1BindingName || '—';
    $('kvPath').textContent = ADMIN_PATH ? '/' + ADMIN_PATH.slice(0, 6) + '…' + ADMIN_PATH.slice(-4) : '—';
  }

  function renderUsers() {
    var grid = $('usersGrid');
    var users = state.users || [];
    grid.innerHTML = '';
    $('usersEmpty').style.display = users.length ? 'none' : 'block';
    users.forEach(function(u, idx) {
      var used = Number(u.usedBytes || 0);
      var limitGb = Number(u.dataLimitGb || 0);
      var pct = limitGb > 0 ? Math.min(100, Math.round((used / (limitGb * 1073741824)) * 100)) : 0;
      var base = origin() + '/sub/' + userKey(u);
      var statusUrl = origin() + '/status/' + userKey(u);
      var card = document.createElement('div');
      card.className = 'user-card';
      card.innerHTML = [
        '<div class="user-head">',
          '<div><div class="user-name">' + (u.username || ('کاربر ' + (idx + 1))) + '</div>',
          '<div class="user-uuid">' + (u.preset ? t('card.preset') + ': ' + u.preset : t('card.subscription')) + ' · ' + (u.subNodeCount || 0) + ' ' + t('card.nodes') + '</div></div>',
          '<span class="pill ' + (u.enabled ? 'on' : 'off') + '">' + (u.enabled ? t('card.active') : t('card.inactive')) + '</span>',
        '</div>',
        '<div class="usage"><span>' + t('card.usage') + ' ' + fmtGb(used) + ' GB</span><span>' + (limitGb > 0 ? limitGb + ' GB' : t('card.unlimited')) + '</span></div>',
        '<div class="bar"><i style="width:' + Math.max(pct, 2) + '%"></i></div>',
        '<div class="usage"><span>' + t('card.expiry') + ' ' + fmtDate(u.expireAt) + '</span><span>' + (u.subNodeCount || 0) + ' ' + t('card.nodes') + '</span></div>',
        '<div class="user-tags">' + activeProtocols().map(function(p) { return '<span class="tag on">' + p + '</span>'; }).join('') + '</div>',
        '<div class="user-actions">',
          '<button class="btn sm" type="button" data-act="copy" data-url="' + base + '">' + ICO.copy + ' ' + t('btn.copySub') + '</button>',
          '<button class="btn sm" type="button" data-act="copy" data-url="' + base + '?target=clash">' + ICO.layers + ' Clash</button>',
          '<button class="btn sm" type="button" data-act="copy" data-url="' + base + '?target=singbox">' + ICO.bolt + ' Singbox</button>',
          '<a class="btn sm" href="' + statusUrl + '" target="_blank" rel="noopener">' + ICO.external + ' ' + t('btn.status') + '</a>',
          '<button class="btn sm ghost" type="button" data-act="test-nodes" data-user="' + userKey(u) + '">' + ICO.radar + ' ' + t('btn.testNodes') + '</button>',
          '<button class="btn sm ghost" type="button" data-act="reset-user" data-id="' + u.id + '">' + ICO.refresh + ' ' + t('btn.resetUser') + '</button>',
          '<button class="btn sm danger" type="button" data-act="delete-user" data-id="' + u.id + '">' + ICO.trash + '</button>',
        '</div>'
      ].join('');
      grid.appendChild(card);
    });
    renderMetrics();
  }

  function renderLocations() {
    var grid = $('locGrid');
    if (!grid) return;
    var base = origin() + '/sub/' + (userKey(state.users[0]) || ADMIN_PATH);
    var countries = INITIAL_DATA.countrySources || {};
    var html = '<div class="loc-card"><div><div class="loc-name">همه لوکیشن‌ها</div><div class="loc-meta">MULTI</div></div>' +
      '<button class="btn sm" type="button" data-act="copy" data-url="' + base + '?country=MULTI">' + ICO.copy + ' کپی</button></div>';
    Object.keys(countries).forEach(function(code) {
      html += '<div class="loc-card"><div><div class="loc-name">' + countries[code].name + '</div><div class="loc-meta">' + code + '</div></div>' +
        '<div class="toolbar">' +
        '<button class="btn sm" type="button" data-act="copy" data-url="' + base + '?country=' + code + '">' + ICO.copy + ' کپی</button>' +
        '<button class="btn sm ghost" type="button" data-act="country-proxy" data-code="' + code + '">' + ICO.link + ' پروکسی → s</button>' +
        '<button class="btn sm ghost" type="button" data-act="country-ip" data-code="' + code + '">' + ICO.globe + ' آی‌پی → yx</button>' +
        '</div></div>';
    });
    grid.innerHTML = html;
  }

  function fillSettings() {
    var c = state.config || {};
    document.querySelectorAll('.switch input[data-key]').forEach(function(input) {
      input.checked = c[input.getAttribute('data-key')] === 'yes';
    });
    document.querySelectorAll('input[data-key], select[data-key]').forEach(function(input) {
      if (input.type === 'checkbox') return;
      var key = input.getAttribute('data-key');
      var val = c[key];
      if (key === 'ipRotation') {
        var map = { 0: 'off', '0': 'off', 5: '5m', 15: '15m', 30: '30m', 60: '1h', 1440: '24h' };
        val = (typeof val === 'string' && isNaN(Number(val))) ? val : (map[val] || 'off');
      }
      if (val === undefined || val === null) val = '';
      input.value = String(val);
    });
    var pathView = $('adminPathView');
    if (pathView) pathView.value = ADMIN_PATH ? '/' + ADMIN_PATH : '—';
    var dnsSel = $('dnsPreset');
    if (dnsSel) {
      var presets = INITIAL_DATA.dnsPresets || [];
      var match = presets.filter(function(d) { return d.value === c.customDNS; })[0];
      dnsSel.value = match ? c.customDNS : (c.customDNS ? 'custom' : (presets[0] ? presets[0].value : 'custom'));
    }
  }

  var LANG = localStorage.getItem('mili_lang') === 'en' ? 'en' : 'fa';
  function t(key) {
    var dict = (INITIAL_DATA.i18n || {})[LANG] || (INITIAL_DATA.i18n || {}).fa || {};
    return dict[key] || key;
  }
  function updateThemeLabel() {
    var btn = $('themeBtn');
    if (!btn) return;
    var label = btn.querySelector('span[data-i18n]');
    var light = document.body.classList.contains('light-mode');
    var text = LANG === 'en' ? (light ? 'Dark mode' : 'Light mode') : (light ? 'حالت شب' : 'حالت روز');
    if (label) label.textContent = text;
  }
  function applyLanguage() {
    document.documentElement.lang = LANG;
    document.documentElement.dir = LANG === 'en' ? 'ltr' : 'rtl';
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var text = t(key);
      if (text) el.textContent = text;
    });
    updateThemeLabel();
  }
  function toggleTheme() {
    var light = document.body.classList.toggle('light-mode');
    localStorage.setItem('mili_theme', light ? 'light' : 'dark');
    updateThemeLabel();
  }
  function toggleLang() {
    LANG = LANG === 'fa' ? 'en' : 'fa';
    localStorage.setItem('mili_lang', LANG);
    applyLanguage();
    renderUsers();
    renderLocations();
    if (typeof scanResults !== 'undefined' && scanResults.length) renderScanRows(scanResults);
  }

  // هشدار هوشمند تداخل تنظیمات
  function detectConflicts(c) {
    var out = [];
    if (c.es === 'yes' && c.frag === 'yes') out.push('Shadowsocks از فرگمنت پشتیبانی نمی‌کند؛ نودهای SS بدون fragment ساخته می‌شوند (مجاز است).');
    if (c.ech === 'yes' && !/^https:\/\//i.test(String(c.customDNS || ''))) out.push('ECH به یک DNS از نوع DoH (https://) نیاز دارد.');
    if (c.ech === 'yes' && c.dkby === 'no') out.push('با فعال بودن ECH، پورت‌های HTTP خودکار حذف می‌شوند.');
    if (c.frag === 'yes' && (!c.fragmentPreset || c.fragmentPreset === 'off')) out.push('فرگمنت روشن است اما پریست روی «غیرفعال» است؛ پارامتری ساخته نمی‌شود.');
    if (c.epi === 'no' && c.epd === 'no' && !String(c.yx || '').trim()) out.push('همه منابع آدرس خاموش‌اند؛ سابلینک فقط از هاست ورکر ساخته می‌شود.');
    if (c.ev === 'no' && c.et === 'no' && c.ex === 'no' && c.es === 'no') out.push('هیچ پروتکلی روشن نیست؛ هسته به‌ناچار VLESS را فعال می‌کند.');
    if (String(c.s || '').trim() && !/^(socks5?|https?):\/\//i.test(String(c.s).trim())) out.push('آدرس پروکسی خروجی (s) باید با socks5:// یا http:// شروع شود.');
    if (c.yxURL && c.egi === 'no') out.push('آدرس yxURL وارد شده اما لیست آی‌پی خارجی (EGI) خاموش است.');
    var ports = String(c.ports || '').split(/[,\s]+/).filter(Boolean).map(Number).filter(function(p) { return p >= 1 && p <= 65535; });
    if (!ports.length) out.push('لیست پورت‌های نود خالی/نامعتبر است؛ از 443 استفاده می‌شود.');
    if (c.ipRotation && c.ipRotation !== 'off' && !String(c.yx || '').trim()) out.push('چرخش آی‌پی فعال است اما لیست yx خالی است.');
    return out;
  }
  function renderWarnings(list) {
    var box = $('configWarnings');
    if (!box) return;
    if (!list.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.style.display = 'block';
    box.innerHTML = '<b>' + t('warn.title') + '</b><ul>' + list.map(function(w) { return '<li>' + w + '</li>'; }).join('') + '</ul>';
  }

  function saveSettings() {
    var payload = {};
    document.querySelectorAll('.switch input[data-key]').forEach(function(input) {
      payload[input.getAttribute('data-key')] = input.checked ? 'yes' : 'no';
    });
    document.querySelectorAll('input[data-key], select[data-key]').forEach(function(input) {
      if (input.type === 'checkbox') return;
      payload[input.getAttribute('data-key')] = String(input.value || '').trim();
    });
    var warnings = detectConflicts(payload);
    renderWarnings(warnings);
    if (warnings.length && !confirm(t('warn.title') + '\n\n' + warnings.map(function(w, i) { return (i + 1) + '. ' + w; }).join('\n') + '\n\nادامه می‌دهید؟')) return;
    var btn = document.querySelector('[data-act="save-config"]');
    if (btn) btn.disabled = true;
    api('/api/config', { method: 'POST', body: JSON.stringify(payload) })
      .then(function(data) {
        if (data.success) {
          state.config = Object.assign({}, state.config, payload);
          fillSettings();
          renderMetrics();
          showToast('تنظیمات در D1 ذخیره شد', 'ok');
        } else {
          showToast(data.message || 'خطا در ذخیره تنظیمات', 'err');
        }
      })
      .catch(function() { showToast('خطای شبکه در ذخیره تنظیمات', 'err'); })
      .finally(function() { if (btn) btn.disabled = false; });
  }

  function createUser() {
    var username = ($('newUsername').value || '').trim();
    if (username.length < 2) { showToast('نام کاربری باید حداقل ۲ کاراکتر باشد', 'err'); return; }
    var body = {
      username: username,
      preset: $('newPreset').value,
      dataLimitGb: Number($('newLimit').value) || 0,
      expireDays: Number($('newDays').value) || 0,
      subNodeCount: Number($('newNodes').value) || 50,
      config: {
        ev: $('cfgEv') ? $('cfgEv').value : 'yes',
        et: $('cfgEt') ? $('cfgEt').value : 'no',
        es: $('cfgEs') ? $('cfgEs').value : 'yes',
        ex: $('cfgEx') ? $('cfgEx').value : 'no',
        ech: $('cfgEch') ? $('cfgEch').value : 'no',
        frag: $('cfgFrag') ? $('cfgFrag').value : 'yes',
        customDNS: $('cfgDNS') ? $('cfgDNS').value : '',
        customECHDomain: $('cfgEchDomain') ? $('cfgEchDomain').value : '',
        ports: $('cfgPorts') ? $('cfgPorts').value.trim() : '',
        fp: $('cfgFp') ? $('cfgFp').value : 'chrome',
        patt: $('cfgPatt') ? $('cfgPatt').value : '/?ed=2048',
        yx: $('cfgYx') ? $('cfgYx').value.trim() : '',
        s: $('cfgS') ? $('cfgS').value.trim() : ''
      }
    };
    api('/api/users', { method: 'POST', body: JSON.stringify(body) })
      .then(function(data) {
        if (data.success) {
          state.users.push(data.user);
          renderUsers();
          renderLocations();
          closeModal('createModal');
          $('newUsername').value = '';
          showToast(data.message || 'کاربر ساخته شد', 'ok');
        } else {
          showToast(data.message || 'خطا در ساخت کاربر', 'err');
        }
      })
      .catch(function() { showToast('خطای شبکه در ساخت کاربر', 'err'); });
  }

  function deleteUser(id) {
    if (!confirm('این کاربر حذف شود؟')) return;
    api('/api/users?id=' + encodeURIComponent(id), { method: 'DELETE' })
      .then(function(data) {
        if (data.success) {
          state.users = state.users.filter(function(u) { return u.id !== id; });
          renderUsers(); renderLocations();
          showToast('کاربر حذف شد', 'ok');
        } else {
          showToast(data.message || 'خطا در حذف کاربر', 'err');
        }
      })
      .catch(function() { showToast('خطای شبکه در حذف کاربر', 'err'); });
  }

  function resetUser(id) {
    if (!confirm('مصرف این کاربر صفر شود؟')) return;
    api('/api/users', { method: 'PUT', body: JSON.stringify({ id: id, action: 'reset' }) })
      .then(function(data) {
        if (data.success) {
          state.users = state.users.map(function(u) { return u.id === id ? data.user : u; });
          renderUsers();
          showToast(data.message || 'مصرف صفر شد', 'ok');
        } else {
          showToast(data.message || 'خطا در ریست مصرف', 'err');
        }
      })
      .catch(function() { showToast('خطای شبکه در ریست مصرف', 'err'); });
  }

  function reloadUsers() {
    api('/api/users?t=' + Date.now())
      .then(function(data) {
        if (data.success) {
          state.users = data.users || [];
          renderUsers(); renderLocations();
          showToast('لیست کاربران بروزرسانی شد', 'ok');
        }
      })
      .catch(function() { showToast('خطا در دریافت کاربران', 'err'); });
  }

  function renderScanRows(items) {
    var body = $('scanBody');
    if (!items.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty">' + t('scan.none') + '</td></tr>';
      return;
    }
    body.innerHTML = items.map(function(p) {
      var latClass = p.latencyMs < 150 ? 'lat-fast' : (p.latencyMs < 400 ? 'lat-med' : 'lat-slow');
      var isIp = p.kind === 'ip';
      var ipLabel = p.family === 'ipv6' ? 'IPv6' : (p.family === 'domain' ? t('scan.domain') : 'IPv4');
      var typeLabel = isIp ? (t('scan.ipStatic') + ' · ' + ipLabel) : (t('scan.proxy') + ' · ' + p.protocol);
      var action = isIp
        ? '<button class="btn sm" type="button" data-act="add-ip" data-ip="' + p.ip + '" data-port="' + p.port + '">' + ICO.plus + ' ' + t('btn.addToYx') + '</button>'
        : '<button class="btn sm" type="button" data-act="use-proxy" data-proxy="' + String(p.proxy || '').replace(/"/g, '&quot;') + '">' + ICO.link + ' ' + t('btn.connectS') + '</button>';
      return '<tr>' +
        '<td><span class="code-badge">' + p.code + '</span> ' + p.country + '</td>' +
        '<td class="mono">' + (String(p.ip).includes(':') ? '[' + p.ip + ']' : p.ip) + ':' + p.port + '</td>' +
        '<td><span class="tag on">' + typeLabel + '</span></td>' +
        '<td class="mono ' + latClass + '">' + p.latencyMs + ' ms</td>' +
        '<td><span class="tag ' + (p.verified === false ? '' : 'on') + '">' + (p.verified === false ? t('scan.unverified') : t('scan.online')) + '</span></td>' +
        '<td>' + action + '</td>' +
      '</tr>';
    }).join('');
  }

  function scanRequest(payload) {
    return fetch(origin() + '/api/scanner/fetch-and-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(res) { return res.json(); });
  }

  function applyScanItems(target, items) {
    return fetch(origin() + '/api/scanner/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Mili-Admin': '1' },
      body: JSON.stringify({ target: target, items: items })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        showToast(data.message || (data.success ? 'اعمال شد' : 'خطا در اعمال'), data.success ? 'ok' : 'err');
        if (data.success) {
          return api('/api/config').then(function(cfg) {
            if (cfg && typeof cfg === 'object' && !cfg.error) {
              state.config = Object.assign({}, state.config, cfg);
              fillSettings();
            }
            return data;
          });
        }
        return data;
      })
      .catch(function() { showToast('خطای شبکه در اعمال نتیجه اسکن', 'err'); });
  }

  function runScan() {
    var country = $('scanCountry').value;
    var limit = $('scanLimit').value;
    var kind = $('scanKind') ? $('scanKind').value : 'proxy';
    var family = $('scanFamily') ? $('scanFamily').value : 'any';
    var btn = $('btnScan');
    var status = $('scanStatus');
    btn.disabled = true;
    status.className = 'scan-status';
    status.textContent = kind === 'ip'
      ? 'در حال نمونه‌گیری و تست واقعی آی‌پی‌های ثابت...'
      : 'در حال دریافت زنده لیست‌ها و تست واقعی اتصال TCP...';
    $('scanBody').innerHTML = '<tr><td colspan="6" class="empty">در حال تست...</td></tr>';

    scanRequest({ country: country, limit: limit, kind: kind, family: family })
      .then(function(data) {
        if (data.success && data.proxies && data.proxies.length) {
          scanResults = data.proxies;
          renderScanRows(data.proxies);
          status.textContent = data.message || (data.proxies.length + ' مورد آنلاین از ' + data.testedCount + ' تست');
        } else {
          $('scanBody').innerHTML = '<tr><td colspan="6" class="empty">موردی یافت نشد.</td></tr>';
          status.className = 'scan-status err';
          status.textContent = data.message || 'دریافت لیست یا تست ناموفق بود.';
        }
      })
      .catch(function() {
        $('scanBody').innerHTML = '<tr><td colspan="6" class="empty">خطا.</td></tr>';
        status.className = 'scan-status err';
        status.textContent = 'خطای شبکه در اجرای اسکنر.';
      })
      .finally(function() {
        btn.disabled = false;
      });
  }

  function syncConditionalFields() {
    document.querySelectorAll('[data-show-when]').forEach(function(el) {
      var key = el.getAttribute('data-show-when');
      var input = document.querySelector('.switch input[data-key="' + key + '"]');
      el.style.display = (!input || input.checked) ? '' : 'none';
    });
    var famWrap = $('scanFamilyWrap');
    if (famWrap) {
      var kindSel = $('scanKind');
      famWrap.style.display = (kindSel && kindSel.value === 'ip') ? '' : 'none';
    }
  }

  function rotatePath() {
    if (!confirm(t('toast.rotateConfirm'))) return;
    fetch(origin() + '/api/admin/rotate-path', { method: 'POST' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success && data.redirect) {
          window.location.href = data.redirect;
        } else {
          showToast(data.message || t('toast.network'), 'err');
        }
      })
      .catch(function() { showToast(t('toast.network'), 'err'); });
  }

  function testUserNodes(token) {
    if (!token) return;
    showToast(t('toast.testingNodes'), 'ok');
    fetch(origin() + '/sub/' + token + '?target=raw&limit=6')
      .then(function(res) { return res.text(); })
      .then(function(text) {
        var nodes = [];
        var seen = {};
        String(text || '').split(/\r?\n/).forEach(function(line) {
          var match = line.match(/@\[?([0-9a-fA-F:.]+)\]?:(\d+)/);
          if (!match) return;
          var host = match[1];
          var port = parseInt(match[2], 10) || 443;
          var key = host + ':' + port;
          if (seen[key] || host === '127.0.0.1') return;
          seen[key] = true;
          nodes.push({ host: host, port: port });
        });
        if (!nodes.length) { showToast(t('scan.none'), 'err'); return; }
        return fetch(origin() + '/api/scanner/test-nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes: nodes.slice(0, 8) })
        }).then(function(res) { return res.json(); }).then(function(data) {
          showToast(data.message || t('toast.network'), data.success ? 'ok' : 'err');
        });
      })
      .catch(function() { showToast(t('toast.network'), 'err'); });
  }

  function addCfDefaults(kind) {
    var items = kind === 'ips'
      ? (INITIAL_DATA.officialIps || []).concat(INITIAL_DATA.officialIpv6 || []).map(function(ip) { return { ip: ip, port: 443, name: ip }; })
      : (INITIAL_DATA.directDomains || []).map(function(domain) { return { ip: domain, port: 443, name: domain }; });
    if (!items.length) { showToast('لیست پیش‌فرض خالی است', 'err'); return; }
    applyScanItems('yx', items).then(function(data) {
      if (data && data.success) {
        showToast((kind === 'ips' ? 'آی‌پی‌های پیش‌فرض CFnew' : 'دامنه‌های پیش‌فرض CFnew') + ' به yx اضافه شدند', 'ok');
      }
    });
  }

  function addNode(ip, port) {
    return applyScanItems('yx', [{ ip: ip, port: Number(port) || 443, name: ip }]);
  }

  function useProxy(proxyUrl) {
    if (!proxyUrl) { showToast('آدرس پروکسی نامعتبر است', 'err'); return; }
    return applyScanItems('s', [{ proxy: proxyUrl }]);
  }

  function countryProxy(code) {
    showPanel('scanner');
    if ($('scanCountry')) $('scanCountry').value = code;
    if ($('scanKind')) $('scanKind').value = 'proxy';
    syncConditionalFields();
    var status = $('scanStatus');
    status.className = 'scan-status';
    status.textContent = 'در حال یافتن سریع‌ترین پروکسی ' + code + ' ...';
    $('scanBody').innerHTML = '<tr><td colspan="6" class="empty">در حال تست...</td></tr>';
    scanRequest({ country: code, limit: 8, kind: 'proxy', family: 'any' })
      .then(function(data) {
        if (!data.success || !data.proxies || !data.proxies.length) {
          status.className = 'scan-status err';
          status.textContent = data.message || 'پروکسی زنده‌ای برای این کشور پیدا نشد.';
          return;
        }
        renderScanRows(data.proxies);
        status.textContent = 'سریع‌ترین پروکسی ' + code + ' (' + data.proxies[0].latencyMs + ' ms) به s وصل شد.';
        return useProxy(data.proxies[0].proxy);
      })
      .catch(function() {
        status.className = 'scan-status err';
        status.textContent = 'خطای شبکه در دریافت پروکسی کشوری.';
      });
  }

  function countryIp(code) {
    showPanel('scanner');
    if ($('scanCountry')) $('scanCountry').value = code;
    if ($('scanKind')) $('scanKind').value = 'ip';
    if ($('scanFamily')) $('scanFamily').value = 'any';
    syncConditionalFields();
    var status = $('scanStatus');
    status.className = 'scan-status';
    status.textContent = 'در حال تست آی‌پی‌های ثابت...';
    $('scanBody').innerHTML = '<tr><td colspan="6" class="empty">در حال تست...</td></tr>';
    scanRequest({ country: code, limit: 10, kind: 'ip', family: 'any' })
      .then(function(data) {
        if (!data.success || !data.proxies || !data.proxies.length) {
          status.className = 'scan-status err';
          status.textContent = data.message || 'آی‌پی سالمی پیدا نشد.';
          return;
        }
        renderScanRows(data.proxies);
        return applyScanItems('yx', data.proxies.slice(0, 3).map(function(p) { return { ip: p.ip, port: p.port, name: p.ip }; }))
          .then(function() { status.textContent = 'آی‌پی‌های ثابت به yx اضافه شدند (سوییچ EPI را روشن نگه دارید).'; });
      })
      .catch(function() {
        status.className = 'scan-status err';
        status.textContent = 'خطای شبکه در تست آی‌پی‌ها.';
      });
  }

  function savePassword() {
    var oldPwd = ($('pwdOld').value || '').trim();
    var newPwd = ($('pwdNew').value || '').trim();
    var newPwd2 = ($('pwdNew2').value || '').trim();
    if (newPwd.length < 4) { showToast('رمز جدید باید حداقل ۴ کاراکتر باشد', 'err'); return; }
    if (newPwd !== newPwd2) { showToast('تکرار رمز جدید یکسان نیست', 'err'); return; }
    fetch(origin() + '/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          closeModal('passwordModal');
          $('pwdOld').value = ''; $('pwdNew').value = ''; $('pwdNew2').value = '';
          showToast('رمز مدیر تغییر کرد', 'ok');
        } else {
          showToast(data.message || 'خطا در تغییر رمز', 'err');
        }
      })
      .catch(function() { showToast('خطای شبکه در تغییر رمز', 'err'); });
  }

  function logout() {
    fetch(origin() + '/api/admin/logout', { method: 'POST' }).catch(function() {}).finally(function() {
      window.location.href = '/';
    });
  }

  function openModal(id) { var m = $(id); if (m) m.classList.add('is-open'); }
  function closeModal(id) { var m = $(id); if (m) m.classList.remove('is-open'); }

  function masterSub() { return origin() + '/sub/' + (ADMIN_PATH || ''); }

  document.addEventListener('click', function(event) {
    var tab = event.target.closest('[data-tab]');
    if (tab) { showPanel(tab.getAttribute('data-tab')); return; }

    var el = event.target.closest('[data-act]');
    if (!el) return;
    var act = el.getAttribute('data-act');

    if (act === 'copy') { copyText(el.getAttribute('data-url') || '', 'لینک کپی شد'); }
    else if (act === 'copy-master') { copyText(masterSub(), 'سابلینک اصلی کپی شد'); }
    else if (act === 'open-create') { openModal('createModal'); }
    else if (act === 'open-password') { openModal('passwordModal'); }
    else if (act === 'open-multi') { showPanel('locations'); }
    else if (act === 'close-modal') { closeModal(el.getAttribute('data-modal')); }
    else if (act === 'create-user') { createUser(); }
    else if (act === 'delete-user') { deleteUser(el.getAttribute('data-id')); }
    else if (act === 'reset-user') { resetUser(el.getAttribute('data-id')); }
    else if (act === 'reload-users') { reloadUsers(); }
    else if (act === 'save-config') { saveSettings(); }
    else if (act === 'reset-config') { resetConfig(); }
    else if (act === 'save-password') { savePassword(); }
    else if (act === 'logout') { logout(); }
    else if (act === 'go-scan') { showPanel('scanner'); }
    else if (act === 'go-settings') { showPanel('settings'); }
    else if (act === 'run-scan') { runScan(); }
    else if (act === 'add-node' || act === 'add-ip') { addNode(el.getAttribute('data-ip'), el.getAttribute('data-port')); }
    else if (act === 'use-proxy') { useProxy(el.getAttribute('data-proxy')); }
    else if (act === 'country-proxy') { countryProxy(el.getAttribute('data-code')); }
    else if (act === 'country-ip') { countryIp(el.getAttribute('data-code')); }
    else if (act === 'toggle-theme') { toggleTheme(); }
    else if (act === 'toggle-lang') { toggleLang(); }
    else if (act === 'add-cf-ips') { addCfDefaults('ips'); }
    else if (act === 'add-cf-domains') { addCfDefaults('domains'); }
    else if (act === 'copy-admin-path') { copyText('/' + ADMIN_PATH, 'مسیر مدیریت کپی شد'); }
    else if (act === 'rotate-path') { rotatePath(); }
    else if (act === 'test-nodes') { testUserNodes(el.getAttribute('data-user')); }
  });

  document.addEventListener('click', function(event) {
    if (event.target.classList && event.target.classList.contains('modal')) {
      event.target.classList.remove('is-open');
    }
  });

  document.addEventListener('change', function(event) {
    var target = event.target;
    if (!target) return;
    if (target.matches && target.matches('.switch input[data-key]')) {
      var key = target.getAttribute('data-key');
      if (key === 'frag' || key === 'ech') syncConditionalFields();
    }
    if (target.id === 'scanKind') syncConditionalFields();
    if (target.id === 'dnsPreset') {
      var dnsInput = document.querySelector('input[data-key="customDNS"]');
      if (dnsInput && target.value !== 'custom') dnsInput.value = target.value;
    }
  });

  function resetConfig() {
    if (!confirm('همه تنظیمات به مقادیر پیش‌فرض بازگردد؟')) return;
    api('/api/config', { method: 'POST', body: JSON.stringify({ _reset: true }) })
      .then(function(data) {
        if (data.success) {
          state.config = data.config || {};
          fillSettings(); renderMetrics();
          showToast('تنظیمات بازنشانی شد', 'ok');
        } else {
          showToast(data.message || 'خطا در بازنشانی', 'err');
        }
      })
      .catch(function() { showToast('خطای شبکه در بازنشانی', 'err'); });
  }



  function tickClock() {
    var d = new Date();
    var txt = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    var chip = $('clockChip');
    if (chip) chip.textContent = txt;
  }

  if (localStorage.getItem('mili_theme') === 'light') document.body.classList.add('light-mode');
  applyLanguage();
  renderUsers();
  renderLocations();
  fillSettings();
  syncConditionalFields();
  renderMetrics();
  tickClock();
  setInterval(tickClock, 30000);

  var hash = (window.location.hash || '').replace('#', '');
  if (hash && document.querySelector('[data-panel="' + hash + '"]')) showPanel(hash);
</script>
</body>
</html>`);
}
