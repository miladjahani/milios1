// ============================================================================
// miliconfigOS v4.0 - Admin workspace
// Server-rendered shell + vanilla ES client. All data comes from /api/v1.
// No secrets are injected into the HTML.
// ============================================================================

import { FAVICON_DATA_URI } from './icons.js';

const T = {
  fa: {
    dashboard: 'داشبورد', users: 'کاربران', endpoints: 'کاتالوگ نود', engine: 'موتور کانفیگ',
    subscriptions: 'اشتراک‌ها', scanner: 'اسکنر', dns: 'DNS و شبکه', monitoring: 'پایش',
    security: 'امنیت', settings: 'تنظیمات', cloudflare: 'کلادفلر', capabilities: 'ماتریس قابلیت',
    logout: 'خروج', refresh: 'بروزرسانی', loading: 'در حال بارگذاری…', save: 'ذخیره',
    cancel: 'انصراف', close: 'بستن', delete: 'حذف', edit: 'ویرایش', create: 'ساخت',
    totalUsers: 'کاربران فعال', capacity: 'ظرفیت', activeSubs: 'اشتراک فعال',
    traffic: 'ترافیک اندازه‌گیری‌شده', endpointsHealthy: 'نودهای سالم', configs: 'کانفیگ‌های تولیدشده',
    storage: 'ذخیره‌سازی', dataPlane: 'صفحه داده', recent: 'فعالیت اخیر',
    noData: 'داده‌ای موجود نیست', error: 'خطا', saved: 'ذخیره شد', copied: 'کپی شد',
    username: 'نام کاربر', status: 'وضعیت', usage: 'مصرف', quota: 'حجم مجاز', expiry: 'انقضا',
    protocols: 'پروتکل‌ها', actions: 'عملیات', enabled: 'فعال', disabled: 'غیرفعال',
    unlimited: 'نامحدود', never: 'هرگز', addUser: 'کاربر جدید', editUser: 'ویرایش کاربر',
    addEndpoint: 'افزودن نود', check: 'بررسی', host: 'میزبان', port: 'پورت', name: 'نام',
    country: 'کشور', provider: 'ارائه‌دهنده', kind: 'نوع', endpointAdded: 'نود اضافه شد',
    generate: 'تولید کانفیگ', selectUser: 'انتخاب کاربر', score: 'امتیاز', reason: 'دلیل انتخاب',
    format: 'فرمت', protocol: 'پروتکل', transport: 'ترنسپورت', tls: 'TLS', endpoint: 'نود',
    rejected: 'رد شده', valid: 'معتبر', rotate: 'چرخش توکن', revoke: 'لغو', enable: 'فعال‌سازی',
    copy: 'کپی لینک', statusPage: 'صفحه وضعیت', downloads: 'دریافت ساب',
    scanHost: 'میزبان یا دامنه', scanRun: 'اجرای اسکن', levels: 'سطوح بررسی',
    history: 'تاریخچه', lastCheck: 'آخرین بررسی', latency: 'تأخیر', failures: 'خطاها',
    test: 'تست', source: 'منبع', filtering: 'فیلترینگ', ipv4: 'IPv4', ipv6: 'IPv6',
    changePassword: 'تغییر رمز عبور', currentPassword: 'رمز فعلی', newPassword: 'رمز جدید',
    confirmPassword: 'تکرار رمز جدید', sessions: 'نشست‌های فعال', revokeSessions: 'ابطال همه نشست‌ها',
    audit: 'لاگ حسابرسی', loginAttempts: 'تلاش‌های ورود', time: 'زمان', action: 'رویداد', details: 'جزئیات',
    settingsGeneral: 'عمومی', settingsSecurity: 'امنیت', settingsNetwork: 'شبکه',
    resetSettings: 'بازنشانی تنظیمات', confirmReset: 'همه تنظیمات به پیش‌فرض برمی‌گردند. ادامه می‌دهید؟',
    connect: 'اتصال', disconnect: 'قطع اتصال', token: 'توکن API', verify: 'بررسی توکن',
    permissions: 'مجوزهای لازم', encryption: 'رمزنگاری', notConnected: 'متصل نیست',
    connected: 'متصل', accountId: 'شناسه حساب', workersCheck: 'بررسی استقرار Worker',
    scriptName: 'نام اسکریپت', policy: 'سیاست', generateDone: 'کانفیگ‌ها تولید شدند',
    noValidCombination: 'ترکیب معتبری یافت نشد', conflicts: 'تضاد تنظیمات',
    warning: 'هشدار', danger: 'خطا', success: 'موفق', deleting: 'حذف',
    confirmDeleteUser: 'برای حذف، نام کاربر را دقیقاً وارد کنید:', userDeleted: 'کاربر حذف شد',
    usageSource: 'منبع اندازه‌گیری', downloadsNote: 'شمارش دانلود ساب معیار ترافیک نیست.',
    automation: 'اتوماسیون', runNow: 'اجرای فوری', interval: 'بازه (دقیقه)', neverRun: 'اجرا نشده',
    capabilitiesNote: 'قابلیت‌ها بر اساس پیاده‌سازی واقعی این Worker گزارش می‌شوند.',
    theme: 'پوسته', language: 'زبان', light: 'روشن', dark: 'تیره', system: 'سیستم',
    loginRequired: 'نشست منقضی شده است؛ صفحه بازخوانی می‌شود.',
    confirmRevoke: 'توکن اشتراک چرخانده شود؟ لینک قبلی از کار می‌افتد.',
    emerald: 'زمرد', cyan: 'فیروزه‌ای', violet: 'بنفش', amber: 'کهربایی',
    qrNotAvailable: 'نمایش QR در این نسخه ارائه نشده است.', appName: 'میل‌کانفیگ‌اواس', revoked: 'لغو شده',
    measuredTrafficNote: 'بایت‌های شمارش‌شده در تونل پروکسی این Worker؛ بازدید پنل محاسبه نمی‌شود.',
    noTraffic: 'هنوز ترافیک اندازه‌گیری‌شده‌ای ثبت نشده است.', unknown: 'نامشخص'
  },
  en: {
    dashboard: 'Dashboard', users: 'Users', endpoints: 'Node catalog', engine: 'Config engine',
    subscriptions: 'Subscriptions', scanner: 'Scanner', dns: 'DNS & network', monitoring: 'Monitoring',
    security: 'Security', settings: 'Settings', cloudflare: 'Cloudflare', capabilities: 'Capability matrix',
    logout: 'Sign out', refresh: 'Refresh', loading: 'Loading…', save: 'Save',
    cancel: 'Cancel', close: 'Close', delete: 'Delete', edit: 'Edit', create: 'Create',
    totalUsers: 'Active users', capacity: 'Capacity', activeSubs: 'Active subscriptions',
    traffic: 'Measured traffic', endpointsHealthy: 'Healthy endpoints', configs: 'Generated configs',
    storage: 'Storage', dataPlane: 'Data plane', recent: 'Recent activity',
    noData: 'No data available', error: 'Error', saved: 'Saved', copied: 'Copied',
    username: 'Username', status: 'Status', usage: 'Usage', quota: 'Quota', expiry: 'Expiry',
    protocols: 'Protocols', actions: 'Actions', enabled: 'Enabled', disabled: 'Disabled',
    unlimited: 'Unlimited', never: 'Never', addUser: 'New user', editUser: 'Edit user',
    addEndpoint: 'Add endpoint', check: 'Check', host: 'Host', port: 'Port', name: 'Name',
    country: 'Country', provider: 'Provider', kind: 'Kind', endpointAdded: 'Endpoint added',
    generate: 'Generate configurations', selectUser: 'Select user', score: 'Score', reason: 'Selection reason',
    format: 'Format', protocol: 'Protocol', transport: 'Transport', tls: 'TLS', endpoint: 'Endpoint',
    rejected: 'Rejected', valid: 'Valid', rotate: 'Rotate token', revoke: 'Revoke', enable: 'Enable',
    copy: 'Copy link', statusPage: 'Status page', downloads: 'Subscription fetches',
    scanHost: 'Host or domain', scanRun: 'Run scan', levels: 'Check levels',
    history: 'History', lastCheck: 'Last check', latency: 'Latency', failures: 'Failures',
    test: 'Test', source: 'Source', filtering: 'Filtering', ipv4: 'IPv4', ipv6: 'IPv6',
    changePassword: 'Change password', currentPassword: 'Current password', newPassword: 'New password',
    confirmPassword: 'Confirm new password', sessions: 'Active sessions', revokeSessions: 'Revoke all sessions',
    audit: 'Audit log', loginAttempts: 'Login attempts', time: 'Time', action: 'Action', details: 'Details',
    settingsGeneral: 'General', settingsSecurity: 'Security', settingsNetwork: 'Network',
    resetSettings: 'Reset settings', confirmReset: 'All settings will return to defaults. Continue?',
    connect: 'Connect', disconnect: 'Disconnect', token: 'API token', verify: 'Verify token',
    permissions: 'Required permissions', encryption: 'Encryption', notConnected: 'Not connected',
    connected: 'Connected', accountId: 'Account ID', workersCheck: 'Check Worker deployment',
    scriptName: 'Script name', policy: 'Policy', generateDone: 'Configurations generated', noValidCombination: 'No valid combination found',
    conflicts: 'Setting conflicts', warning: 'Warning', danger: 'Error', success: 'Success', deleting: 'Delete',
    confirmDeleteUser: 'Type the exact username to delete:', userDeleted: 'User deleted',
    usageSource: 'Measurement source', downloadsNote: 'Subscription fetches are not traffic.',
    automation: 'Automation', runNow: 'Run now', interval: 'Interval (min)', neverRun: 'Never run',
    capabilitiesNote: 'Capabilities reflect what this Worker actually implements.',
    theme: 'Theme', language: 'Language', light: 'Light', dark: 'Dark', system: 'System',
    loginRequired: 'Your session expired; reloading the page.',
    confirmRevoke: 'Rotate the subscription token? The previous link stops working.',
    emerald: 'Emerald', cyan: 'Cyan', violet: 'Violet', amber: 'Amber',
    qrNotAvailable: 'QR display is not included in this version.', appName: 'MiliconfigOS', revoked: 'Revoked',
    measuredTrafficNote: 'Bytes counted while this Worker pipes proxied traffic; panel visits are excluded.',
    noTraffic: 'No measured traffic recorded yet.', unknown: 'Unknown'
  }
};

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderAdminDashboardHtml(options = {}) {
  const config = options.config || {};
  const diagnostics = options.diagnostics || {};
  const adminPath = String(options.adminPath || 'admin');
  const version = String(options.version || 'v4.0');
  const appName = String(config.appName || 'MiliconfigOS');
  const defaultLang = config.language === 'en' ? 'en' : 'fa';
  const accent = ['emerald', 'cyan', 'violet', 'amber'].includes(config.accent) ? config.accent : 'emerald';
  const animations = config.animations === 'no' ? 'no' : 'yes';
  const boot = {
    lang: defaultLang,
    appName,
    version,
    adminPath,
    storage: diagnostics.d1Enabled ? 'd1' : 'degraded',
    maxUsers: diagnostics.maxUsersLimit || 5
  };

  return `<!DOCTYPE html>
<html lang="${defaultLang}" dir="${defaultLang === 'fa' ? 'rtl' : 'ltr'}" data-theme="dark" data-accent="${esc(accent)}" data-motion="${animations}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${esc(appName)} · ${esc(version)}</title>
<link rel="icon" href="${FAVICON_DATA_URI}">
<script>
(function(){
  try {
    var t = localStorage.getItem('mili.theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    var l = localStorage.getItem('mili.lang');
    if (l === 'en' || l === 'fa') {
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'fa' ? 'rtl' : 'ltr';
    }
  } catch (e) {}
})();
</script>
<style>
${ADMIN_CSS}
</style>
</head>
<body>
<svg class="sprite" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <symbol id="i-dash" viewBox="0 0 24 24"><path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 8h6V4h-6z"/></symbol>
  <symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
  <symbol id="i-nodes" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M10 6.5h4a3 3 0 0 1 3 3v4"/><circle cx="17.5" cy="6.5" r="2.5"/></symbol>
  <symbol id="i-engine" viewBox="0 0 24 24"><path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5"/><circle cx="12" cy="12" r="4"/></symbol>
  <symbol id="i-sub" viewBox="0 0 24 24"><path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><path d="M8 9h8M8 13h5M8 17h3"/></symbol>
  <symbol id="i-scan" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M3 12h18"/></symbol>
  <symbol id="i-dns" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></symbol>
  <symbol id="i-monitor" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l4-5 3 3 5-7"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.3-2.9 7.9-7 9-4.1-1.1-7-4.7-7-9V6z"/><path d="M9 12l2 2 4-4"/></symbol>
  <symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></symbol>
  <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6.5 19z"/></symbol>
  <symbol id="i-matrix" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></symbol>
  <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></symbol>
</svg>

<div class="window">
  <header class="titlebar">
    <div class="tb-left">
      <span class="dots"><i></i><i></i><i></i></span>
      <button class="icon-btn menu-btn" type="button" data-act="menu" aria-label="Menu"><svg class="ico"><use href="#i-menu"/></svg></button>
      <div class="brand">
        <svg viewBox="0 0 48 48" class="logo" aria-hidden="true">
          <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs>
          <path d="M24 4l15 5.5v12.8C39 33 32.6 40 24 44 15.4 40 9 33 9 22.3V9.5z" fill="url(#lg)" opacity=".18"/>
          <path d="M24 4l15 5.5v12.8C39 33 32.6 40 24 44 15.4 40 9 33 9 22.3V9.5z" fill="none" stroke="url(#lg)" stroke-width="2.2"/>
          <circle cx="24" cy="22" r="2.6" fill="var(--accent)"/>
          <circle cx="16" cy="16" r="2" fill="var(--accent-2)"/><circle cx="32" cy="16" r="2" fill="var(--accent-2)"/>
          <circle cx="17" cy="29" r="2" fill="var(--accent-2)"/><circle cx="31" cy="29" r="2" fill="var(--accent-2)"/>
          <path d="M18 17.5l4.4 3.3M30 17.5l-4.4 3.3M18.5 27.7l3.8-2.9M29.5 27.7l-3.8-2.9" stroke="var(--accent)" stroke-width="1.4" opacity=".8"/>
        </svg>
        <div class="brand-text">
          <strong>${esc(appName)}</strong>
          <span>OS ${esc(version)} · miliconfig</span>
        </div>
      </div>
    </div>
    <div class="tb-right">
      <button class="chip" type="button" id="themeBtn" title="Theme"><span id="themeLabel">${defaultLang === 'fa' ? 'سیستم' : 'System'}</span></button>
      <button class="chip" type="button" id="langBtn">${defaultLang === 'fa' ? 'EN' : 'فا'}</button>
      <button class="icon-btn" type="button" data-act="refresh" title="Refresh"><svg class="ico"><use href="#i-refresh"/></svg></button>
      <button class="icon-btn" type="button" data-act="logout" title="Sign out"><svg class="ico"><use href="#i-logout"/></svg></button>
    </div>
  </header>

  <div class="shell">
    <aside class="sidebar" id="sidebar">
      <nav id="nav" class="nav"></nav>
      <div class="side-foot">
        <div class="side-badge" id="storageBadge"></div>
        <div class="side-note">miliconfig · Milad Jahani</div>
      </div>
    </aside>
    <main class="main">
      <div class="view" id="view" aria-live="polite"><div class="page-loading"><span class="spinner"></span>Loading…</div></div>
    </main>
  </div>
</div>

<div class="toasts" id="toasts"></div>
<div class="modal-backdrop" id="modal" hidden>
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head"><h3 id="modalTitle"></h3><button class="icon-btn" type="button" data-act="modal-close" aria-label="Close"><svg class="ico"><use href="#i-x"/></svg></button></div>
    <form id="modalForm"><div class="modal-body" id="modalBody"></div><div class="modal-foot" id="modalFoot"></div></form>
  </div>
</div>

<script>
var I18N = ${JSON.stringify(T).replace(/</g, '\\u003c')};
var BOOT = ${JSON.stringify(boot).replace(/</g, '\\u003c')};
</script>
<script>
${ADMIN_JS}
</script>
</body>
</html>`;
}

const ADMIN_CSS = `
:root{
  --r:14px; --r-sm:10px;
  --font: "Vazirmatn", "Segoe UI", system-ui, -apple-system, "Noto Sans Arabic", sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --ok:#22c55e; --warn:#f59e0b; --danger:#ef4444; --info:#38bdf8;
}
html[data-accent="emerald"]{--accent:#34d399;--accent-2:#22d3ee;--accent-ink:#052e22;--accent-soft:rgba(52,211,153,.14)}
html[data-accent="cyan"]{--accent:#22d3ee;--accent-2:#6366f1;--accent-ink:#042a33;--accent-soft:rgba(34,211,238,.14)}
html[data-accent="violet"]{--accent:#a78bfa;--accent-2:#22d3ee;--accent-ink:#1e1035;--accent-soft:rgba(167,139,250,.16)}
html[data-accent="amber"]{--accent:#fbbf24;--accent-2:#34d399;--accent-ink:#332100;--accent-soft:rgba(251,191,36,.16)}
html[data-theme="dark"]{
  --bg:#050b08; --bg-2:#071410;
  --surface:#0b1712; --surface-2:#0f2018; --surface-3:#12261d;
  --border:rgba(148,163,184,.16); --border-strong:rgba(148,163,184,.3);
  --text:#e7f4ec; --muted:#8ca79a; --faint:#5c7568;
  --shadow:0 24px 60px rgba(0,0,0,.5);
  --nav-active:rgba(255,255,255,.06);
  --input:#08130e;
  color-scheme: dark;
}
html[data-theme="light"]{
  --bg:#eef4f0; --bg-2:#f7faf8;
  --surface:#ffffff; --surface-2:#f5f9f6; --surface-3:#eef5f0;
  --border:rgba(15,42,30,.12); --border-strong:rgba(15,42,30,.22);
  --text:#0d2118; --muted:#5c7268; --faint:#8b9d93;
  --shadow:0 20px 50px rgba(15,42,30,.12);
  --nav-active:rgba(15,42,30,.05);
  --input:#f9fcfa;
  color-scheme: light;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;font-family:var(--font);background:var(--bg);color:var(--text);
  background-image:
    radial-gradient(1200px 600px at 10% -10%, var(--accent-soft), transparent 60%),
    radial-gradient(900px 500px at 110% 10%, rgba(34,211,238,.08), transparent 60%);
  background-attachment:fixed;
}
html[data-motion="no"] *{animation:none!important;transition:none!important}
@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}
.sprite{position:absolute;width:0;height:0;overflow:hidden}
.ico{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
svg.sprite symbol path,svg.sprite symbol rect,svg.sprite symbol circle{stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.window{
  max-width:1680px;margin:18px auto;border:1px solid var(--border-strong);border-radius:20px;
  background:linear-gradient(180deg,var(--surface),var(--bg-2));box-shadow:var(--shadow);overflow:hidden;
  min-height:calc(100vh - 36px);display:flex;flex-direction:column;
}
.titlebar{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:10px 16px;border-bottom:1px solid var(--border);
  background:linear-gradient(90deg,var(--accent-soft),transparent 45%);
}
.tb-left,.tb-right{display:flex;align-items:center;gap:10px}
.dots{display:inline-flex;gap:6px;margin-inline-end:6px}
.dots i{width:10px;height:10px;border-radius:50%;display:block;background:var(--border-strong)}
.dots i:nth-child(1){background:#ff6464}.dots i:nth-child(2){background:#f5c451}.dots i:nth-child(3){background:#4ade80}
.brand{display:flex;align-items:center;gap:10px}
.logo{width:34px;height:34px;flex:none}
.brand-text{display:flex;flex-direction:column;line-height:1.15}
.brand-text strong{font-size:.95rem;letter-spacing:.2px}
.brand-text span{font-size:.68rem;color:var(--muted)}
.chip{
  border:1px solid var(--border);background:var(--surface-2);color:var(--muted);
  border-radius:999px;padding:6px 12px;font:inherit;font-size:.74rem;cursor:pointer;
}
.chip:hover{color:var(--text);border-color:var(--accent)}
.icon-btn{
  width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;
  border:1px solid var(--border);border-radius:10px;background:var(--surface-2);color:var(--muted);cursor:pointer;
}
.icon-btn:hover{color:var(--accent);border-color:var(--accent)}
.menu-btn{display:none}
.shell{display:flex;flex:1;min-height:0}
.sidebar{
  width:232px;flex:none;border-inline-end:1px solid var(--border);padding:16px 12px;
  display:flex;flex-direction:column;gap:14px;background:var(--surface);
}
.nav{display:flex;flex-direction:column;gap:2px;overflow:auto}
.nav-group{font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);padding:10px 12px 4px}
.nav button{
  display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;color:var(--muted);
  padding:9px 11px;border-radius:10px;font:inherit;font-size:.82rem;cursor:pointer;text-align:start;
  border-inline-start:2px solid transparent;
}
.nav button:hover{background:var(--nav-active);color:var(--text)}
.nav button.active{background:var(--nav-active);color:var(--text);border-inline-start-color:var(--accent)}
.nav button.active .ico{color:var(--accent)}
.side-foot{margin-top:auto;padding:10px 8px 4px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px}
.side-badge{font-size:.7rem;padding:7px 10px;border-radius:9px;border:1px dashed var(--border-strong);color:var(--muted);line-height:1.6}
.side-badge b{color:var(--accent)}
.side-note{font-size:.66rem;color:var(--faint)}
.main{flex:1;min-width:0;overflow:auto;padding:22px 24px 40px}
.view{display:flex;flex-direction:column;gap:20px}
.page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.page-head h1{margin:0 0 4px;font-size:1.35rem;letter-spacing:-.01em}
.page-head p{margin:0;color:var(--muted);font-size:.83rem;max-width:70ch;line-height:1.7}
.page-actions{display:flex;gap:8px;flex-wrap:wrap}
.grid{display:grid;gap:14px}
.grid.stats{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}
.grid.two{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}
.card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px;
  display:flex;flex-direction:column;gap:12px;min-width:0;
}
.card h2,.card h3{margin:0;font-size:.92rem;letter-spacing:.01em}
.card-sub{font-size:.74rem;color:var(--muted);line-height:1.6}
.stat{position:relative;overflow:hidden}
.stat .k{font-size:.72rem;color:var(--muted);letter-spacing:.03em}
.stat .v{font-size:1.65rem;font-weight:800;letter-spacing:-.02em;line-height:1.1}
.stat .v small{font-size:.85rem;font-weight:600;color:var(--muted)}
.stat .hint{font-size:.7rem;color:var(--faint)}
.stat::after{content:"";position:absolute;inset-inline-end:-30px;top:-30px;width:110px;height:110px;border-radius:50%;background:var(--accent-soft)}
.stat > *{position:relative;z-index:1}
.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.btn{
  display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-strong);background:var(--surface-2);
  color:var(--text);border-radius:10px;padding:8px 13px;font:inherit;font-size:.79rem;cursor:pointer;line-height:1.2;
}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);font-weight:700}
.btn.primary:hover{filter:brightness(1.05);color:var(--accent-ink)}
.btn.danger{border-color:rgba(239,68,68,.5);color:#f87171}
.btn.ghost{background:transparent}
.btn.sm{padding:5px 9px;font-size:.72rem;border-radius:8px}
.btn:disabled{opacity:.55;cursor:not-allowed}
.field{display:flex;flex-direction:column;gap:6px;min-width:0}
.field label{font-size:.76rem;color:var(--muted);font-weight:600}
.field .help{font-size:.68rem;color:var(--faint);line-height:1.55}
input,select,textarea{
  width:100%;background:var(--input);border:1px solid var(--border-strong);color:var(--text);
  border-radius:10px;padding:9px 11px;font:inherit;font-size:.82rem;outline:none;
}
input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
textarea{min-height:76px;resize:vertical}
label.check{display:flex;align-items:center;gap:8px;font-size:.79rem;color:var(--text);font-weight:500}
label.check input{width:auto;accent-color:var(--accent)}
.form-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
.form-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.table-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:var(--r);background:var(--surface)}
table{width:100%;border-collapse:collapse;font-size:.78rem;min-width:620px}
th,td{padding:10px 12px;text-align:start;border-bottom:1px solid var(--border);vertical-align:middle}
th{font-size:.68rem;letter-spacing:.04em;text-transform:uppercase;color:var(--faint);background:var(--surface-2);white-space:nowrap}
tbody tr:hover{background:var(--nav-active)}
tbody tr:last-child td{border-bottom:0}
.mono{font-family:var(--mono);font-size:.72rem;direction:ltr;unicode-bidi:embed}
.muted{color:var(--muted)}.faint{color:var(--faint)}
.badge{
  display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:3px 9px;
  font-size:.68rem;border:1px solid var(--border-strong);color:var(--muted);white-space:nowrap;
}
.badge.ok{border-color:rgba(34,197,94,.4);color:#4ade80;background:rgba(34,197,94,.08)}
.badge.warn{border-color:rgba(245,158,11,.4);color:#fbbf24;background:rgba(245,158,11,.08)}
.badge.err{border-color:rgba(239,68,68,.4);color:#f87171;background:rgba(239,68,68,.08)}
.badge.info{border-color:rgba(56,189,248,.4);color:#38bdf8;background:rgba(56,189,248,.08)}
.badge.accent{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.btn-row{display:flex;gap:6px;flex-wrap:wrap}
.empty{
  display:flex;flex-direction:column;align-items:center;gap:8px;padding:34px 16px;text-align:center;
  color:var(--muted);border:1px dashed var(--border-strong);border-radius:var(--r);font-size:.82rem;
}
.empty .ico{width:28px;height:28px;color:var(--faint)}
.alert{
  border:1px solid var(--border-strong);border-radius:var(--r-sm);padding:11px 13px;font-size:.78rem;
  line-height:1.7;display:flex;gap:9px;align-items:flex-start;background:var(--surface-2);
}
.alert.err{border-color:rgba(239,68,68,.45);background:rgba(239,68,68,.07)}
.alert.warn{border-color:rgba(245,158,11,.45);background:rgba(245,158,11,.07)}
.alert.ok{border-color:rgba(34,197,94,.4);background:rgba(34,197,94,.07)}
.alert.info{border-color:rgba(56,189,248,.35);background:rgba(56,189,248,.06)}
.alert b{display:block;margin-bottom:2px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:10px}
.tabs button{
  border:1px solid transparent;background:transparent;color:var(--muted);border-radius:9px;
  padding:6px 11px;font:inherit;font-size:.78rem;cursor:pointer;
}
.tabs button.active{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.bars{display:flex;align-items:flex-end;gap:6px;height:130px;padding-top:8px}
.bars .bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;min-width:10px}
.bars .bar i{display:block;width:100%;max-width:30px;background:linear-gradient(180deg,var(--accent),var(--accent-2));border-radius:4px 4px 0 0;min-height:2px;opacity:.85}
.bars .bar span{font-size:.6rem;color:var(--faint);writing-mode:vertical-rl}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:.72rem;color:var(--muted)}
.legend i{display:inline-block;width:9px;height:9px;border-radius:3px;background:var(--accent);margin-inline-end:5px}
.list{display:flex;flex-direction:column;gap:8px}
.list-item{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);font-size:.78rem}
.list-item:last-child{border-bottom:0}
.list-item span{color:var(--muted)}
.modal-backdrop{position:fixed;inset:0;background:rgba(2,8,5,.68);backdrop-filter:blur(6px);z-index:60;display:flex;align-items:center;justify-content:center;padding:18px}
/* Author display:flex would otherwise beat the UA [hidden]{display:none} rule,
   leaving the empty dialog open on page load and un-closable. */
.modal-backdrop[hidden]{display:none}
.modal{width:min(620px,100%);max-height:90vh;overflow:auto;background:var(--surface);border:1px solid var(--border-strong);border-radius:16px;box-shadow:var(--shadow)}
.modal-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border)}
.modal-head h3{margin:0;font-size:.95rem}
.modal-body{padding:18px;display:flex;flex-direction:column;gap:13px}
.modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--surface)}
.toasts{position:fixed;inset-inline-end:18px;bottom:18px;display:flex;flex-direction:column;gap:8px;z-index:80}
.toast{
  padding:10px 14px;border-radius:10px;font-size:.78rem;border:1px solid var(--border-strong);
  background:var(--surface);box-shadow:var(--shadow);animation:pop .18s ease;max-width:340px;
}
.toast.ok{border-color:rgba(34,197,94,.5)}
.toast.err{border-color:rgba(239,68,68,.55)}
@keyframes pop{from{transform:translateY(6px);opacity:0}to{transform:none;opacity:1}}
.spinner{width:16px;height:16px;border:2px solid var(--border-strong);border-top-color:var(--accent);border-radius:50%;display:inline-block;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.page-loading{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.82rem;padding:40px 0}
.kv{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:.78rem}
.kv dt{color:var(--muted)}
.kv dd{margin:0;text-align:end}
.code{font-family:var(--mono);font-size:.72rem;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;padding:8px 10px;direction:ltr;unicode-bidi:embed;overflow-wrap:anywhere}
.section-note{font-size:.74rem;color:var(--faint);line-height:1.7}
.switch{display:inline-flex;align-items:center;gap:8px}
.switch input{width:auto;accent-color:var(--accent)}
@media(max-width:960px){
  .window{margin:0;border-radius:0;border:0;min-height:100vh}
  .menu-btn{display:inline-flex}
  .brand-text span{display:none}
  .sidebar{
    position:fixed;inset-block:0;inset-inline-start:0;z-index:50;width:250px;transform:translateX(-105%);
    transition:transform .2s ease;box-shadow:var(--shadow);padding-top:22px;
  }
  html[dir="rtl"] .sidebar{transform:translateX(105%)}
  .sidebar.open{transform:none!important}
  .main{padding:16px 14px 48px}
  .titlebar{padding:9px 12px}
  .grid.stats{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
  .stat .v{font-size:1.3rem}
  .page-head h1{font-size:1.15rem}
}
@media(max-width:520px){
  .chip{padding:5px 9px}
  .brand-text strong{font-size:.82rem}
  .card{padding:13px}
  .grid.stats{grid-template-columns:1fr 1fr}
}
`;

const ADMIN_JS = `
(function(){
  'use strict';
  var S = {
    lang: localStorage.getItem('mili.lang') === 'en' ? 'en' : (localStorage.getItem('mili.lang') === 'fa' ? 'fa' : BOOT.lang),
    theme: localStorage.getItem('mili.theme') || 'system',
    page: 'dashboard',
    overview: null, users: [], endpoints: [], subscriptions: null, settings: null,
    audit: null, automation: null, cf: null, capabilities: null, dns: null,
    selectedUser: '', settingsTab: 'general', engineResult: null, scanResult: null, busy: false
  };
  var pages = [
    { id:'dashboard', group:'main', icon:'dash' },
    { id:'users', group:'main', icon:'users' },
    { id:'endpoints', group:'main', icon:'nodes' },
    { id:'engine', group:'control', icon:'engine' },
    { id:'subscriptions', group:'control', icon:'sub' },
    { id:'scanner', group:'control', icon:'scan' },
    { id:'dns', group:'control', icon:'dns' },
    { id:'monitoring', group:'control', icon:'monitor' },
    { id:'security', group:'system', icon:'shield' },
    { id:'settings', group:'system', icon:'settings' },
    { id:'cloudflare', group:'system', icon:'cloud' },
    { id:'capabilities', group:'system', icon:'matrix' }
  ];
  var GROUPS = { main:{fa:'مرکز کنترل',en:'Control center'}, control:{fa:'شبکه',en:'Network'}, system:{fa:'سیستم',en:'System'} };

  function t(key){ var d = I18N[S.lang] || I18N.en; return d[key] || key; }
  function esc(v){ return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function csv(v){ return Array.isArray(v) ? v.join(',') : String(v == null ? '' : v); }
  function bytes(n){
    n = Number(n) || 0;
    if (!n) return '0 B';
    var u = ['B','KB','MB','GB','TB'], i = Math.min(u.length-1, Math.floor(Math.log(n)/Math.log(1024)));
    var v = n / Math.pow(1024, i);
    return (v >= 100 || i === 0 ? Math.round(v) : v.toFixed(2)) + ' ' + u[i];
  }
  function when(ts){
    if (!ts) return '—';
    try { return new Date(ts).toLocaleString(S.lang === 'fa' ? 'fa-IR' : 'en-GB'); } catch (e) { return new Date(ts).toISOString(); }
  }
  function icon(name){ return '<svg class="ico"><use href="#i-' + name + '"/></svg>'; }
  function badge(text, kind){ return '<span class="badge ' + (kind || '') + '">' + esc(text) + '</span>'; }
  function sel(obj, val){ return String(obj || '') === String(val) ? ' selected' : ''; }
  function chk(val){ return val ? ' checked' : ''; }
  function optLabel(label){
    if (label == null) return '';
    if (typeof label === 'string') return label;
    return label[S.lang] || label.en || label.fa || '';
  }

  function applyChrome(){
    var html = document.documentElement;
    html.lang = S.lang;
    html.dir = S.lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('mili.lang', S.lang);
    var dark = S.theme === 'dark' || (S.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    html.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('mili.theme', S.theme);
    document.getElementById('langBtn').textContent = S.lang === 'fa' ? 'EN' : 'فا';
    document.getElementById('themeLabel').textContent = t(S.theme);
    document.getElementById('storageBadge').innerHTML = 'DB: <b>' + esc(BOOT.storage === 'd1' ? 'Cloudflare D1' : 'memory fallback') + '</b><br>' + esc(BOOT.version);
    renderNav();
  }

  function renderNav(){
    var nav = document.getElementById('nav');
    var html = '';
    var groups = ['main','control','system'];
    groups.forEach(function(group){
      html += '<div class="nav-group">' + esc(optLabel(GROUPS[group])) + '</div>';
      pages.filter(function(p){ return p.group === group; }).forEach(function(p){
        html += '<button type="button" data-nav="' + p.id + '" class="' + (S.page === p.id ? 'active' : '') + '">' +
          icon(p.icon) + '<span>' + esc(t(p.id)) + '</span></button>';
      });
    });
    nav.innerHTML = html;
  }

  function toast(message, kind){
    var box = document.getElementById('toasts');
    var el = document.createElement('div');
    el.className = 'toast ' + (kind || 'ok');
    el.textContent = message;
    box.appendChild(el);
    setTimeout(function(){ el.remove(); }, 4200);
  }

  function api(path, options){
    options = options || {};
    var init = { method: options.method || 'GET', headers: {}, credentials: 'same-origin' };
    if (options.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(options.body);
    }
    return fetch('/api/v1' + path, init).then(function(res){
      if (res.status === 401) {
        toast(t('loginRequired'), 'err');
        setTimeout(function(){ location.reload(); }, 900);
        throw new Error(t('loginRequired'));
      }
      return res.json().catch(function(){ return { ok:false, error:{ message:'Invalid server response' } }; }).then(function(data){
        if (!res.ok || data.ok === false) {
          var err = new Error((data.error && data.error.message) || data.message || ('HTTP ' + res.status));
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  function loading(){
    document.getElementById('view').innerHTML = '<div class="page-loading"><span class="spinner"></span>' + esc(t('loading')) + '</div>';
  }

  function pageHead(title, subtitle, actions){
    return '<div class="page-head"><div><h1>' + esc(title) + '</h1><p>' + esc(subtitle || '') + '</p></div>' +
      '<div class="page-actions">' + (actions || '') + '</div></div>';
  }

  function statCard(label, value, hint){
    return '<div class="card stat"><div class="k">' + esc(label) + '</div><div class="v">' + value + '</div>' +
      (hint ? '<div class="hint">' + esc(hint) + '</div>' : '') + '</div>';
  }

  function emptyState(text){
    return '<div class="empty">' + icon('matrix') + '<div>' + esc(text || t('noData')) + '</div></div>';
  }

  function bars(series){
    var rows = (series || []).filter(function(x){ return Number(x.bytes) > 0; }).slice(-14);
    if (!rows.length) return '<div class="empty">' + esc(t('noTraffic')) + '</div>';
    var max = Math.max.apply(null, rows.map(function(x){ return Number(x.bytes) || 0; })) || 1;
    var out = '<div class="bars">';
    rows.forEach(function(row){
      var h = Math.max(2, Math.round((Number(row.bytes) || 0) / max * 100));
      out += '<div class="bar" title="' + esc(row.dayKey + ' · ' + bytes(row.bytes)) + '"><i style="height:' + h + '%"></i><span>' + esc(String(row.dayKey).slice(5)) + '</span></div>';
    });
    return out + '</div><div class="legend"><span><i></i>' + esc(t('traffic')) + '</span><span>' + esc(t('measuredTrafficNote')) + '</span></div>';
  }

  function userRow(u){
    var protos = u.protocols || {};
    var tags = ['vless','trojan','xhttp','shadowsocks'].filter(function(k){ return protos[k]; }).map(function(k){
      return badge(k === 'shadowsocks' ? 'SS' : k.toUpperCase(), 'info');
    }).join(' ');
    var quota = Number(u.dataLimitGb) > 0 ? bytes(Number(u.dataLimitGb) * 1073741824) : t('unlimited');
    var exp = Number(u.expireAt) > 0 ? when(u.expireAt) : t('never');
    return '<tr><td><div style="font-weight:700">' + esc(u.username) + '</div><div class="mono faint">' + esc(u.id) + '</div></td>' +
      '<td>' + (u.enabled ? badge(t('enabled'), 'ok') : badge(t('disabled'), 'err')) + '</td>' +
      '<td class="mono">' + esc(bytes(u.usedBytes)) + '<div class="faint">' + esc(quota) + '</div></td>' +
      '<td>' + esc(exp) + '</td><td>' + (tags || '<span class="faint">—</span>') + '</td>' +
      '<td><div class="btn-row">' +
        '<button class="btn sm" data-act="user-edit" data-id="' + esc(u.id) + '">' + esc(t('edit')) + '</button>' +
        '<button class="btn sm" data-act="user-reset" data-id="' + esc(u.id) + '">reset</button>' +
        '<button class="btn sm" data-act="sub-rotate" data-id="' + esc(u.id) + '">' + esc(t('rotate')) + '</button>' +
        '<button class="btn sm" data-act="sub-toggle" data-id="' + esc(u.id) + '" data-revoked="' + (u.subscription && u.subscription.revoked ? '1' : '0') + '">' + esc(u.subscription && u.subscription.revoked ? t('enable') : t('revoke')) + '</button>' +
        '<button class="btn sm danger" data-act="user-del" data-id="' + esc(u.id) + '">' + esc(t('delete')) + '</button>' +
      '</div></td></tr>';
  }

  function pageDashboard(){
    var o = S.overview || {};
    var u = o.users || {}, ep = o.endpoints || {}, sub = o.subscriptions || {}, tr = o.traffic || {};
    var st = o.storage || {};
    var html = pageHead(t('dashboard'), (I18N[S.lang]||{}).appName + ' · ' + BOOT.version, '<button class="btn" data-act="refresh">' + icon('refresh') + esc(t('refresh')) + '</button>');
    html += '<div class="grid stats">' +
      statCard(t('totalUsers'), esc(u.active || 0) + ' <small>/ ' + esc(u.capacity || BOOT.maxUsers) + '</small>', t('capacity') + ': ' + esc(u.available || 0)) +
      statCard(t('activeSubs'), esc(sub.active || 0), t('downloads') + ': ' + esc(sub.downloads || 0)) +
      statCard(t('traffic'), esc(bytes(tr.usedBytes || 0)), (tr.source || '') + ' · ' + t('usageSource')) +
      statCard(t('endpointsHealthy'), esc(ep.healthy || 0) + ' <small>/ ' + esc(ep.enabled || 0) + '</small>', t('failures') + ': ' + esc(ep.failing || 0)) +
      statCard(t('configs'), esc((o.configurations||{}).valid || 0), t('valid')) +
      statCard(t('storage'), '<span style="font-size:1.05rem">' + esc(st.d1Enabled ? 'D1' : 'Memory') + '</span>', st.binding || '') +
      '</div>';

    html += '<div class="grid two">' +
      '<section class="card"><h2>' + esc(t('traffic')) + '</h2><div class="card-sub">' + esc(t('measuredTrafficNote')) + '</div>' + bars(tr.series) + '</section>' +
      '<section class="card"><h2>' + esc(t('endpoints')) + '</h2>' +
        '<div class="kv"><dt>' + esc(t('enabled')) + '</dt><dd>' + esc(ep.enabled || 0) + '</dd>' +
        '<dt>' + esc(t('endpointsHealthy')) + '</dt><dd>' + esc(ep.healthy || 0) + '</dd>' +
        '<dt>' + esc(t('failures')) + '</dt><dd>' + esc(ep.failing || 0) + '</dd>' +
        '<dt>' + esc(t('lastCheck')) + '</dt><dd>' + esc(when(ep.lastCheckAt)) + '</dd></div>' +
        (ep.failingList && ep.failingList.length ? '<div class="list">' + ep.failingList.map(function(x){
          return '<div class="list-item"><strong>' + esc(x.name) + '</strong><span>' + esc(x.failures) + ' ×</span></div>';
        }).join('') + '</div>' : '<div class="card-sub">' + esc(t('noData')) + '</div>') +
      '</section>' +
    '</div>';

    html += '<div class="grid two">' +
      '<section class="card"><h2>' + esc(t('dataPlane')) + '</h2><div class="card-sub">' + esc(((o.dataPlane||{}).note) || '') + '</div>' +
        '<div class="kv"><dt>runtime</dt><dd>' + esc((o.dataPlane||{}).runtime || '—') + '</dd>' +
        '<dt>' + esc(t('measuredTrafficNote').slice(0, 24)) + '</dt><dd>' + esc((o.dataPlane||{}).measuredTraffic ? 'yes' : 'no') + '</dd>' +
        '<dt>REALITY</dt><dd>' + badge('unsupported', 'err') + '</dd>' +
        '<dt>ECH</dt><dd>' + ((o.protocols||{}).ech ? badge('configured', 'warn') : badge('off', '')) + '</dd></div>' +
      '</section>' +
      '<section class="card"><h2>' + esc(t('recent')) + '</h2><div class="list">' +
        ((o.recentLogs || []).length ? o.recentLogs.map(function(log){
          return '<div class="list-item"><div><strong>' + esc(log.action) + '</strong><div class="faint">' + esc(log.detail) + '</div></div><span>' + esc(when(log.createdAt)) + '</span></div>';
        }).join('') : '<div class="faint">' + esc(t('noData')) + '</div>') +
      '</div></section>' +
    '</div>';
    if (o.automation && o.automation.failures && o.automation.failures.length) {
      html += '<div class="alert warn"><div><b>' + esc(t('automation')) + '</b>' + o.automation.failures.map(function(f){ return esc(f.name + ': ' + f.error); }).join('<br>') + '</div></div>';
    }
    return html;
  }

  function pageUsers(){
    var u = S.overview ? S.overview.users : {};
    var html = pageHead(t('users'), 'Active users: ' + (u.active || 0) + ' / ' + (u.capacity || BOOT.maxUsers), '<button class="btn primary" data-act="user-new"' + (S.users.length >= (u.capacity || BOOT.maxUsers) ? ' disabled' : '') + '>' + icon('plus') + esc(t('addUser')) + '</button>');
    if (S.users.length >= (u.capacity || BOOT.maxUsers)) {
      html += '<div class="alert warn"><div><b>' + esc(t('capacity')) + '</b>' + esc('The 5-user limit is enforced by the backend. Delete a user to free a slot.') + '</div></div>';
    }
    html += '<div class="table-wrap"><table><thead><tr><th>' + esc(t('username')) + '</th><th>' + esc(t('status')) + '</th><th>' + esc(t('usage')) + '</th><th>' + esc(t('expiry')) + '</th><th>' + esc(t('protocols')) + '</th><th>' + esc(t('actions')) + '</th></tr></thead><tbody>' +
      (S.users.length ? S.users.map(userRow).join('') : '<tr><td colspan="6">' + emptyState(t('noData')) + '</td></tr>') +
      '</tbody></table></div>';
    return html;
  }

  function pageEndpoints(){
    var rows = S.endpoints.map(function(ep){
      var health = ep.lastCheckAt ? badge(ep.healthScore + '/100', ep.healthScore >= 60 ? 'ok' : (ep.healthScore >= 30 ? 'warn' : 'err')) : badge('unchecked', '');
      return '<tr><td><strong>' + esc(ep.name) + '</strong><div class="faint mono">' + esc(ep.host + ':' + ep.port) + '</div></td>' +
        '<td>' + esc(ep.family) + '</td><td>' + esc(ep.kind) + (ep.country ? ' · ' + esc(ep.country) : '') + '</td>' +
        '<td>' + health + '<div class="faint">' + esc(ep.lastCheckAt ? when(ep.lastCheckAt) : '—') + '</div></td>' +
        '<td class="mono">' + esc(ep.lastLatencyMs ? ep.lastLatencyMs + ' ms' : '—') + '<div class="faint">' + esc(ep.failureCount) + ' ×</div></td>' +
        '<td><div class="btn-row"><button class="btn sm" data-act="endpoint-check" data-id="' + esc(ep.id) + '">' + esc(t('check')) + '</button>' +
        '<button class="btn sm" data-act="endpoint-history" data-id="' + esc(ep.id) + '">' + esc(t('history')) + '</button>' +
        '<button class="btn sm" data-act="endpoint-ech" data-id="' + esc(ep.id) + '">ECH</button>' +
        '<button class="btn sm danger" data-act="endpoint-del" data-id="' + esc(ep.id) + '">' + esc(t('delete')) + '</button></div></td></tr>';
    }).join('');
    return pageHead(t('endpoints'), 'Verified catalog. Health levels are reported separately; a TCP connect alone is not a working proxy.',
      '<button class="btn primary" data-act="endpoint-new">' + icon('plus') + esc(t('addEndpoint')) + '</button>') +
      (S.endpoints.length ? '<div class="table-wrap"><table><thead><tr><th>' + esc(t('name')) + '</th><th>Family</th><th>' + esc(t('kind')) + '</th><th>Health</th><th>' + esc(t('latency')) + '</th><th>' + esc(t('actions')) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : emptyState());
  }

  function pageEngine(){
    var options = S.users.map(function(u){ return '<option value="' + esc(u.id) + '"' + sel(S.selectedUser, u.id) + '>' + esc(u.username) + '</option>'; }).join('');
    var html = pageHead(t('engine'), 'Deterministic optimizer with explicit compatibility rules. Invalid combinations are rejected and explained.');
    html += '<section class="card"><div class="form-row"><div class="field" style="min-width:240px"><label>' + esc(t('selectUser')) + '</label><select id="engineUser">' + options + '</select></div>' +
      '<div class="field" style="max-width:170px"><label>' + esc(t('policy')) + '</label><input id="enginePolicy" value="' + esc((S.settings && S.settings.values && S.settings.values.optimizationPolicy) || 'balanced') + '" disabled></div>' +
      '<button class="btn primary" data-act="engine-generate" style="align-self:flex-end">' + icon('engine') + esc(t('generate')) + '</button></div></section>';

    if (S.engineResult) {
      var r = S.engineResult;
      html += '<section class="card"><h2>' + esc(t('generateDone')) + '</h2><div class="form-row">' + badge(r.generated + ' ' + t('valid'), 'ok') + badge((r.rejected||[]).reduce(function(a,b){return a+b.count;},0) + ' ' + t('rejected'), 'warn') + badge(r.policy, 'info') + '</div>';
      html += '<div class="table-wrap"><table><thead><tr><th>' + esc(t('protocol')) + '</th><th>' + esc(t('transport')) + '</th><th>' + esc(t('tls')) + '</th><th>' + esc(t('endpoint')) + '</th><th>' + esc(t('format')) + '</th><th>' + esc(t('score')) + '</th><th>' + esc(t('reason')) + '</th></tr></thead><tbody>' +
        r.plans.map(function(p){
          return '<tr><td>' + esc(p.protocol) + '</td><td>' + esc(p.transport) + '</td><td>' + esc(p.tlsMode) + '</td>' +
            '<td>' + esc(p.endpointName || p.host) + '<div class="faint mono">' + esc((p.host||'') + ':' + (p.port||'')) + '</div></td>' +
            '<td>' + esc(p.format) + '</td><td class="mono">' + esc(p.score) + '</td>' +
            '<td><div class="card-sub">' + (p.reasons || []).map(function(x){ return esc(optLabel(x)); }).join('<br>') + '</div></td></tr>';
        }).join('') + '</tbody></table></div>';
      if (r.rejected && r.rejected.length) {
        html += '<div class="alert warn"><div><b>' + esc(t('rejected')) + '</b>' + r.rejected.map(function(x){ return esc((x.reason && (optLabel(x.reason) || x.reason.en)) || 'unknown'); }).join('<br>') + '</div></div>';
      }
      html += '</section>';
    }
    html += '<section class="card"><h2>' + esc(t('configs')) + '</h2><div class="card-sub">' + esc('Stored plans for the selected user, with validation results.') + '</div>' +
      '<div id="configList" class="list"><button class="btn sm" data-act="engine-load">' + esc(t('refresh')) + '</button></div></section>';
    return html;
  }

  function pageSubscriptions(){
    var subs = (S.subscriptions && S.subscriptions.subscriptions) || [];
    var html = pageHead(t('subscriptions'), 'Each user has an unguessable token. Rotating a token invalidates the previous links.');
    html += '<div class="table-wrap"><table><thead><tr><th>' + esc(t('username')) + '</th><th>Token</th><th>Links</th><th>' + esc(t('downloads')) + '</th><th>' + esc(t('actions')) + '</th></tr></thead><tbody>' +
      (subs.length ? subs.map(function(s){
        return '<tr><td>' + esc(s.username) + '<div class="faint">' + esc(s.enabled ? t('enabled') : t('disabled')) + '</div></td>' +
          '<td class="mono">' + esc(s.token ? s.token.slice(0, 10) + '…' : '—') + (s.revoked ? '<div>' + badge(t('revoked') || 'revoked', 'err') + '</div>' : '') + '</td>' +
          '<td>' + (s.urls ? '<div class="btn-row">' + ['base','singbox','clash','uri'].map(function(k){
            return '<button class="btn sm" data-act="copy-link" data-url="' + esc(s.urls[k]) + '">' + esc(k) + '</button>';
          }).join('') + '</div>' : '<span class="faint">—</span>') + '</td>' +
          '<td class="mono">' + esc(s.downloads || 0) + '</td>' +
          '<td><div class="btn-row"><button class="btn sm" data-act="sub-rotate" data-id="' + esc(s.userId) + '">' + esc(t('rotate')) + '</button>' +
          '<button class="btn sm" data-act="sub-toggle" data-id="' + esc(s.userId) + '" data-revoked="' + (s.revoked ? '1' : '0') + '">' + esc(s.revoked ? t('enable') : t('revoke')) + '</button>' +
          '<a class="btn sm" target="_blank" rel="noopener" href="/status/' + esc(s.token || '') + '">' + esc(t('statusPage')) + '</a></div></td></tr>';
      }).join('') : '<tr><td colspan="5">' + emptyState() + '</td></tr>') + '</tbody></table></div>' +
      '<div class="card-sub">' + esc(t('downloadsNote')) + '</div>';
    return html;
  }

  function pageScanner(){
    var html = pageHead(t('scanner'), 'Layered checks: syntax, DNS, TCP, TLS and HTTP. Each level is reported independently.');
    html += '<section class="card"><form data-form="scan"><div class="form-grid">' +
      '<div class="field"><label>' + esc(t('scanHost')) + '</label><input name="host" placeholder="1.1.1.1" required></div>' +
      '<div class="field"><label>' + esc(t('port')) + '</label><input name="port" type="number" value="443" min="1" max="65535"></div>' +
      '<div class="field"><label>' + esc(t('levels')) + '</label><div class="form-row">' +
        ['dns','tcp','tls','http'].map(function(l){ return '<label class="check"><input type="checkbox" name="levels" value="' + l + '" checked>' + l.toUpperCase() + '</label>'; }).join('') +
      '</div></div></div><div class="form-row"><button class="btn primary" type="submit">' + icon('scan') + esc(t('scanRun')) + '</button></div></form></section>';
    html += sourcesCard();
    if (S.scanResult) {
      var r = S.scanResult;
      html += '<section class="card"><h2>' + esc(t('history')) + '</h2><div class="table-wrap"><table><thead><tr><th>Host</th><th>' + esc(t('status')) + '</th><th>Score</th><th>' + esc(t('latency')) + '</th><th>Details</th></tr></thead><tbody>' +
        r.results.map(function(x){
          return '<tr><td class="mono">' + esc(x.host + ':' + x.port) + '</td><td>' + badge(x.status || 'unknown', x.status === 'invalid' || x.status === 'unreachable' ? 'err' : 'info') + '</td>' +
            '<td class="mono">' + esc(x.score || 0) + '</td><td class="mono">' + esc((x.checks && x.checks.tcp && x.checks.tcp.latencyMs) ? x.checks.tcp.latencyMs + ' ms' : '—') + '</td>' +
            '<td><div class="card-sub">' + ['syntax','dns','tcp','tls','http'].map(function(level){
              var c = x.checks && x.checks[level];
              if (!c) return '';
              return esc(level + ': ' + (c.ok ? 'ok' : 'fail') + (c.detail ? ' — ' + c.detail : ''));
            }).filter(Boolean).join('<br>') + '</div></td></tr>';
        }).join('') + '</tbody></table></div></section>';
    }
    return html;
  }

  function pageDns(){
    var d = S.dns || { profiles: [], checks: {}, echChecks: {} };
    var html = pageHead(t('dns'), 'Resolver catalog taken from provider documentation. Tests run from the Worker, not from your network.');
    html += '<section class="card"><h2>' + esc(t('dns')) + '</h2><div class="table-wrap"><table><thead><tr><th>' + esc(t('provider')) + '</th><th>' + esc(t('ipv4')) + ' / ' + esc(t('ipv6')) + '</th><th>DoH / DoT</th><th>' + esc(t('filtering')) + '</th><th>' + esc(t('source')) + '</th><th></th></tr></thead><tbody>' +
      (d.profiles || []).map(function(p){
        var check = d.checks && d.checks[p.id];
        return '<tr><td><strong>' + esc(p.provider) + '</strong>' + (check ? '<div>' + badge(check.ok ? 'ok' : 'fail', check.ok ? 'ok' : 'err') + '<span class="faint"> ' + esc(check.latencyMs || 0) + ' ms</span></div>' : '') + '</td>' +
          '<td class="mono">' + esc((p.ipv4||[]).join(', ')) + '<div class="faint">' + esc((p.ipv6||[]).join(', ')) + '</div></td>' +
          '<td class="mono">' + esc(p.doh || '—') + '<div class="faint">' + esc(p.dot || '—') + '</div></td>' +
          '<td>' + esc(p.filtering) + '</td><td><a href="' + esc(p.source) + '" target="_blank" rel="noopener">docs</a></td>' +
          '<td><button class="btn sm" data-act="dns-test" data-id="' + esc(p.id) + '">' + esc(t('test')) + '</button></td></tr>';
      }).join('') + '</tbody></table></div></section>';
    html += '<section class="card"><h2>ECH Finder</h2><div class="card-sub">Reads the ECHConfigList published in a hostname\'s HTTPS/SVCB record through DoH. When ECH is enabled those configs are embedded in the subscription links; if a host has no record the links fall back to the domain + resolver form.</div>' +
      '<div class="form-row"><div class="field" style="min-width:260px"><label for="echFindHost">Hostname</label><input id="echFindHost" class="mono" placeholder="cloudflare-ech.com"></div>' +
      '<div class="field" style="max-width:170px"><label>&nbsp;</label><button class="btn" type="button" data-act="ech-find">Find ECH config</button></div></div>' +
      '<div id="echFindResult" class="faint" style="margin-top:10px"></div></section>' +
      '<section class="card"><h2>ECH</h2><div class="card-sub">ECH is only reported as active when a real HTTPS/SVCB record publishes it. The Worker checks the record; client support is required.</div>' +
      '<div class="table-wrap"><table><thead><tr><th>Host</th><th>Clients</th><th>Check</th><th></th></tr></thead><tbody>' +
      (d.echEntries || []).map(function(e){
        var check = d.echChecks && d.echChecks[e.host];
        return '<tr><td class="mono">' + esc(e.host) + '</td><td>' + esc((e.clients||[]).join(', ')) + '</td>' +
          '<td>' + (check ? badge(check.ok ? 'record found' : 'unavailable', check.ok ? 'ok' : 'warn') + '<div class="faint">' + esc(check.detail || '') + '</div>' + (check.echConfig ? '<div class="mono faint">' + esc(String(check.echConfig).slice(0, 44)) + '…</div>' : '') : '<span class="faint">not checked</span>') + '</td>' +
          '<td><button class="btn sm" data-act="ech-test" data-host="' + esc(e.host) + '">' + esc(t('check')) + '</button></td></tr>';
      }).join('') + '</tbody></table></div></section>' +
      '<div class="alert info"><div><b>' + esc(t('settingsNetwork')) + '</b>' + esc('DNS profile, TLS fingerprint and ECH settings are saved in Settings → Network.') + '</div></div>';
    return html;
  }

  function sourcesCard(){
    var s = S.sources || { categories: [], catalog: [], auto: {}, lastCheck: null };
    var auto = s.auto || {};
    var check = S.sourcesCheck || s.lastCheck || null;
    var categories = s.categories || [];
    var html = '<section class="card"><h2>CFnew sources (live)</h2>' +
      '<div class="card-sub">Every list is read live from its origin, with no server-side cache. <b>Check</b> probes reachability, <b>Apply</b> writes the returned addresses into the preferred-node pool (yx), and the automation job repeats the same apply on a schedule.</div>' +
      '<div class="table-wrap"><table><thead><tr><th>Category</th><th>Lists</th><th>Feeds yx</th><th>Status</th><th></th></tr></thead><tbody>' +
      (categories.length ? categories.map(function(c){
        var row = check && check.results ? check.results.filter(function(x){ return x.category === c.id; })[0] : null;
        var status = row
          ? badge(row.ok ? 'reachable' : 'failed', row.ok ? 'ok' : 'err') + '<div class="faint">' + esc(row.lines || 0) + ' lines · ' + esc(row.latencyMs || 0) + ' ms' + (row.error ? ' · ' + esc(row.error) : '') + '</div>'
          : '<span class="faint">not checked</span>';
        return '<tr><td><strong>' + esc(c.label) + '</strong><div class="faint mono">' + esc(c.id) + '</div></td>' +
          '<td class="mono">' + esc(c.count) + '</td>' +
          '<td>' + (c.appliesToYx ? badge('yes', 'ok') : badge('scanner only', 'info')) + '</td>' +
          '<td>' + status + '</td>' +
          '<td class="nowrap"><button class="btn sm" data-act="sources-check" data-cat="' + esc(c.id) + '">' + esc(t('check')) + '</button> ' +
          (c.appliesToYx ? '<button class="btn sm primary" data-act="sources-apply" data-cat="' + esc(c.id) + '">Apply to yx</button>' : '') + '</td></tr>';
      }).join('') : '<tr><td colspan="5">' + emptyState() + '</td></tr>') +
      '</tbody></table></div></section>';
    html += '<section class="card"><h2>Automatic CFnew sync</h2><div class="card-sub">The <span class="mono">sources-sync</span> job applies the selected categories into yx on the Cron Trigger. Existing manual entries are kept unless “replace” is enabled.</div>' +
      '<div class="form-row"><label class="check"><input type="checkbox" id="srcAutoEnabled"' + (auto.enabled ? ' checked' : '') + '> Enabled</label>' +
      '<label class="check"><input type="checkbox" id="srcAutoReplace"' + (auto.replace ? ' checked' : '') + '> Replace yx</label>' +
      '<div class="field" style="max-width:150px"><label for="srcAutoInterval">Interval (min)</label><input id="srcAutoInterval" type="number" min="15" max="10080" value="' + esc(auto.intervalMinutes || 360) + '"></div>' +
      '<div class="field" style="max-width:150px"><label for="srcAutoFamily">Family</label><select id="srcAutoFamily">' +
        ['any','ipv4','ipv6'].map(function(f){ return '<option value="' + f + '"' + ((auto.family || 'any') === f ? ' selected' : '') + '>' + f.toUpperCase() + '</option>'; }).join('') + '</select></div>' +
      '<div class="field" style="max-width:120px"><label for="srcAutoLimit">Limit</label><input id="srcAutoLimit" type="number" min="1" max="200" value="' + esc(auto.limit || 24) + '"></div></div>' +
      '<div class="form-row" style="margin-top:8px">' +
      categories.filter(function(c){ return c.appliesToYx; }).map(function(c){
        var on = (auto.categories || []).indexOf(c.id) >= 0;
        return '<label class="check"><input type="checkbox" id="srcAutoCat-' + esc(c.id) + '"' + (on ? ' checked' : '') + '> ' + esc(c.label) + '</label>';
      }).join('') + '</div>' +
      '<div class="form-row" style="margin-top:10px"><button class="btn primary" data-act="sources-auto-save">' + esc(t('save')) + '</button>' +
      '<button class="btn" data-act="sources-check" data-cat="' + esc((auto.categories || ['cf-ip'])[0]) + '">' + esc(t('check')) + ' ' + esc((auto.categories || ['cf-ip'])[0]) + '</button></div>' +
      '</section>';
    return html;
  }

  function pageMonitoring(){
    var u = S.overview ? S.overview.users : {};
    var tr = S.overview ? S.overview.traffic : {};
    var html = pageHead(t('monitoring'), 'Traffic is measured at the proxy tunnel. Subscription fetches are shown separately and are not traffic.');
    html += '<div class="grid two"><section class="card"><h2>' + esc(t('traffic')) + '</h2>' + bars(tr.series) + '</section>' +
      '<section class="card"><h2>' + esc(t('users')) + '</h2><div class="kv"><dt>' + esc(t('totalUsers')) + '</dt><dd>' + esc(u.active || 0) + ' / ' + esc(u.capacity || BOOT.maxUsers) + '</dd>' +
      '<dt>Expired</dt><dd>' + esc(u.expired || 0) + '</dd><dt>Quota reached</dt><dd>' + esc(u.quotaReached || 0) + '</dd></div></section></div>';
    html += '<section class="card"><h2>' + esc(t('usage')) + '</h2><div class="table-wrap"><table><thead><tr><th>' + esc(t('username')) + '</th><th>' + esc(t('usage')) + '</th><th>' + esc(t('quota')) + '</th><th>Requests</th><th>' + esc(t('usageSource')) + '</th></tr></thead><tbody>' +
      S.users.map(function(user){
        return '<tr><td>' + esc(user.username) + '</td><td class="mono">' + esc(bytes(user.usedBytes)) + '</td><td class="mono">' + esc(user.dataLimitGb > 0 ? bytes(user.dataLimitGb*1073741824) : t('unlimited')) + '</td>' +
          '<td class="mono">' + esc(user.requestCount || 0) + '</td><td class="faint">worker-stream</td></tr>';
      }).join('') + '</tbody></table></div></section>';
    html += '<section class="card"><h2>' + esc(t('automation')) + '</h2><div id="automationBox"><span class="spinner"></span></div></section>';
    return html;
  }

  function pageSecurity(){
    var a = S.audit || { logs: [], sessions: [], loginAttempts: [] };
    var html = pageHead(t('security'), 'Sessions are HttpOnly, SameSite=Strict and expire server-side. Passwords use PBKDF2-SHA256.');
    html += '<div class="grid two">' +
      '<section class="card"><h2>' + esc(t('changePassword')) + '</h2><form data-form="change-password"><div class="field"><label>' + esc(t('currentPassword')) + '</label><input type="password" name="currentPassword" autocomplete="current-password" required></div>' +
      '<div class="field"><label>' + esc(t('newPassword')) + '</label><input type="password" name="newPassword" autocomplete="new-password" required minlength="10"></div>' +
      '<div class="field"><label>' + esc(t('confirmPassword')) + '</label><input type="password" name="confirmPassword" autocomplete="new-password" required minlength="10"></div>' +
      '<button class="btn primary" type="submit">' + esc(t('save')) + '</button></form></section>' +
      '<section class="card"><h2>' + esc(t('sessions')) + '</h2>' + (a.sessions.length ? '<div class="list">' + a.sessions.map(function(s){
        return '<div class="list-item"><span>' + esc(s.ip || '—') + '</span><span class="faint">' + esc(when(s.expiresAt)) + '</span></div>';
      }).join('') + '</div>' : '<div class="faint">' + esc(t('noData')) + '</div>') +
      '<button class="btn danger" data-act="revoke-sessions">' + esc(t('revokeSessions')) + '</button></section></div>';

    html += '<section class="card"><h2>' + esc(t('loginAttempts')) + '</h2><div class="table-wrap"><table><thead><tr><th>' + esc(t('time')) + '</th><th>IP</th><th>' + esc(t('status')) + '</th></tr></thead><tbody>' +
      (a.loginAttempts.length ? a.loginAttempts.map(function(x){
        return '<tr><td>' + esc(when(x.createdAt)) + '</td><td class="mono">' + esc(x.ip) + '</td><td>' + (x.ok ? badge('ok','ok') : badge('failed','err')) + '</td></tr>';
      }).join('') : '<tr><td colspan="3" class="faint">' + esc(t('noData')) + '</td></tr>') + '</tbody></table></div></section>';

    html += '<section class="card"><h2>' + esc(t('audit')) + '</h2><div class="table-wrap"><table><thead><tr><th>' + esc(t('time')) + '</th><th>' + esc(t('action')) + '</th><th>' + esc(t('details')) + '</th><th>IP</th></tr></thead><tbody>' +
      (a.logs.length ? a.logs.map(function(log){
        return '<tr><td class="faint">' + esc(when(log.createdAt)) + '</td><td>' + esc(log.action) + '</td><td class="faint">' + esc(log.detail) + '</td><td class="mono faint">' + esc(log.ip) + '</td></tr>';
      }).join('') : '<tr><td colspan="4" class="faint">' + esc(t('noData')) + '</td></tr>') + '</tbody></table></div></section>';
    return html;
  }

  function settingsField(field, value){
    var label = optLabel(field.label);
    var help = optLabel(field.help);
    var id = 'sf-' + field.key;
    var input = '';
    if (field.type === 'boolean') {
      input = '<label class="check"><input type="checkbox" name="' + field.key + '" value="yes"' + chk(String(value) === 'yes') + '> ' + esc(field.label[S.lang] || field.label.en) + '</label>';
      return '<div class="field">' + input + (help ? '<div class="help">' + esc(help) + '</div>' : '') + '</div>';
    }
    if (field.type === 'select') {
      input = '<select name="' + field.key + '" id="' + id + '">' + field.options.map(function(o){
        return '<option value="' + esc(o.value) + '"' + sel(value, o.value) + '>' + esc(optLabel(o.label) || o.value) + '</option>';
      }).join('') + '</select>';
    } else if (field.type === 'multiselect') {
      var chosen = csv(value).split(',').map(function(x){return x.trim();});
      input = '<div class="form-row">' + field.options.map(function(o){
        return '<label class="check"><input type="checkbox" name="' + field.key + '" value="' + esc(o.value) + '"' + (chosen.indexOf(o.value) >= 0 ? ' checked' : '') + '>' + esc(optLabel(o.label)) + '</label>';
      }).join('') + '</div>';
    } else if (field.type === 'number') {
      input = '<input type="number" name="' + field.key + '" id="' + id + '" value="' + esc(value) + '" min="' + (field.min != null ? field.min : '') + '" max="' + (field.max != null ? field.max : '') + '">';
    } else if (field.type === 'ports') {
      input = '<input name="' + field.key + '" id="' + id + '" value="' + esc(value) + '" placeholder="443,2053,8443">';
    } else {
      input = '<input type="' + (field.type === 'url' ? 'url' : 'text') + '" name="' + field.key + '" id="' + id + '" value="' + esc(value) + '"' + (field.maxLength ? ' maxlength="' + field.maxLength + '"' : '') + '>';
    }
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' + input + (help ? '<div class="help">' + esc(help) + '</div>' : '') + '</div>';
  }

  function pageSettings(){
    if (!S.settings) return '<div class="page-loading"><span class="spinner"></span>' + esc(t('loading')) + '</div>';
    var schema = S.settings.schema || [];
    var values = S.settings.values || {};
    var conflicts = S.settings.conflicts || [];
    var tabs = ['general','security','network','proxy','subscriptions','appearance','cloudflare'];
    var html = pageHead(t('settings'), 'Every setting is validated server-side. Conflicts are reported before saving.',
      '<button class="btn danger" data-act="settings-reset">' + esc(t('resetSettings')) + '</button>');
    if (conflicts.length) {
      html += conflicts.map(function(c){
        return '<div class="alert ' + (c.severity === 'error' ? 'err' : 'warn') + '"><div><b>' + esc(c.code) + '</b>' + esc(c.message) + '</div></div>';
      }).join('');
    }
    html += '<div class="tabs">' + tabs.map(function(tab){
      var label = tab === 'general' ? t('settingsGeneral') : tab === 'security' ? t('settingsSecurity') : tab === 'network' ? t('settingsNetwork') : tab;
      return '<button type="button" data-act="settings-tab" data-tab="' + tab + '" class="' + (S.settingsTab === tab ? 'active' : '') + '">' + esc(label) + '</button>';
    }).join('') + '</div>';
    var fields = schema.filter(function(f){ return f.section === S.settingsTab && f.key !== 'cfAccountId'; });
    if (S.settingsTab === 'cloudflare') {
      html += '<div class="alert info"><div><b>' + esc(t('cloudflare')) + '</b>' + esc('Cloudflare credentials are managed on the Cloudflare page; the account ID below is optional.') + '</div></div>';
      fields = schema.filter(function(f){ return f.key === 'cfAccountId'; });
    }
    html += '<section class="card"><form data-form="settings" data-section="' + esc(S.settingsTab) + '"><div class="form-grid">' +
      fields.map(function(f){ return settingsField(f, values[f.key]); }).join('') +
      '</div><div class="form-row"><button class="btn primary" type="submit">' + esc(t('save')) + '</button>' +
      '<span class="faint">' + esc(S.settings.storage && S.settings.storage.mode === 'memory' ? 'Memory mode: data is not persistent.' : 'Stored in Cloudflare D1.') + '</span></div></form></section>';
    return html;
  }

  function pageCloudflare(){
    var c = S.cf || { status: {}, permissions: {}, resources: [] };
    var st = c.status || {};
    var html = pageHead(t('cloudflare'), 'Scoped API token only. Tokens are encrypted server-side when MILI_ENCRYPTION_KEY is configured and are never returned.');
    html += '<div class="grid two"><section class="card"><h2>' + esc(t('status')) + '</h2>' +
      '<div class="kv"><dt>' + esc(t('status')) + '</dt><dd>' + (st.connected ? badge(t('connected'), 'ok') : badge(t('notConnected'), 'warn')) + '</dd>' +
      '<dt>' + esc(t('encryption')) + '</dt><dd>' + esc(st.encryption || '—') + '</dd>' +
      '<dt>' + esc(t('accountId')) + '</dt><dd class="mono">' + esc(st.accountId || '—') + '</dd>' +
      '<dt>Verified</dt><dd>' + esc(when(st.verifiedAt)) + '</dd></div>' +
      (st.encryptionKeyConfigured ? '' : '<div class="alert warn"><div><b>' + esc(t('warning')) + '</b>' + esc('MILI_ENCRYPTION_KEY is not configured; the token is base64-encoded at rest. Add the secret and reconnect.') + '</div></div>') +
      '</section>' +
      '<section class="card"><h2>' + esc(t('connect')) + '</h2><form data-form="cf-token"><div class="field"><label>' + esc(t('token')) + '</label><input type="password" name="token" autocomplete="off" placeholder="••••••••••••••••" required></div>' +
      '<div class="field"><label>' + esc(t('accountId')) + ' (optional)</label><input name="accountId" class="mono" placeholder="account id"></div>' +
      '<div class="form-row"><button class="btn primary" type="submit">' + esc(t('verify')) + '</button>' +
      '<button class="btn" type="button" data-act="cf-test">' + esc(t('test')) + '</button>' +
      '<button class="btn danger" type="button" data-act="cf-disconnect">' + esc(t('disconnect')) + '</button></div></form></section></div>';
    html += '<div class="grid two"><section class="card"><h2>' + esc(t('permissions')) + '</h2><ul class="section-note" style="margin:0;padding-inline-start:18px">' +
      ((c.permissions && c.permissions.required) || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') +
      ((c.permissions && c.permissions.optional) || []).map(function(x){ return '<li class="faint">' + esc(x) + '</li>'; }).join('') + '</ul></section>' +
      '<section class="card"><h2>' + esc(t('workersCheck')) + '</h2><form data-form="cf-workers"><div class="field"><label>' + esc(t('scriptName')) + '</label><input name="scriptName" placeholder="miliconfig"></div>' +
      '<div class="field"><label>' + esc(t('accountId')) + '</label><input name="accountId" class="mono" value="' + esc(st.accountId || '') + '"></div>' +
      '<button class="btn" type="submit">' + esc(t('check')) + '</button></form><div class="section-note">Deployment status comes from the Cloudflare API, not from a subscription link.</div></section></div>';
    if (c.resources && c.resources.length) {
      html += '<section class="card"><h2>Resources</h2><div class="list">' + c.resources.map(function(r){
        return '<div class="list-item"><div><strong>' + esc(r.name || r.id) + '</strong><div class="faint mono">' + esc(r.kind + ' ' + (r.accountId || '')) + '</div></div><span>' + esc(r.status) + '</span></div>';
      }).join('') + '</div></section>';
    }
    return html;
  }

  function pageCapabilities(){
    var c = S.capabilities || { protocols: [], transports: [], formats: [], limits: [] };
    var html = pageHead(t('capabilities'), t('capabilitiesNote'));
    html += '<section class="card"><h2>Protocols</h2><div class="table-wrap"><table><thead><tr><th>Protocol</th><th>Runtime</th><th>Generation</th><th>Transports</th><th>UDP</th><th>TLS</th><th>REALITY</th><th>ECH</th></tr></thead><tbody>' +
      (c.protocols || []).map(function(p){
        return '<tr><td><strong>' + esc(p.label) + '</strong><div class="faint">' + esc((p.notes && (p.notes[S.lang] || p.notes.en)) || '') + '</div></td>' +
          '<td>' + (p.runtime ? badge('yes','ok') : badge('no','err')) + '</td><td>' + (p.configGeneration ? badge('yes','ok') : badge('no','err')) + '</td>' +
          '<td>' + esc((p.transports||[]).join(', ')) + '</td><td>' + esc(p.udp || 'no') + '</td><td>' + esc(String(p.tls)) + '</td>' +
          '<td>' + (p.reality ? badge('yes','ok') : badge('no','err')) + '</td><td>' + esc(String(p.ech)) + '</td></tr>';
      }).join('') + '</tbody></table></div></section>';
    html += '<div class="grid two"><section class="card"><h2>Output formats</h2><div class="table-wrap"><table><thead><tr><th>Format</th><th>Protocols</th><th>xHTTP</th></tr></thead><tbody>' +
      (c.formats || []).map(function(f){ return '<tr><td>' + esc(f.label) + '</td><td>' + esc((f.supports||[]).join(', ')) + '</td><td>' + esc(String(f.xhttp)) + '</td></tr>'; }).join('') +
      '</tbody></table></div></section><section class="card"><h2>Limits</h2><div class="list">' +
      (c.limits || []).map(function(l){ return '<div class="list-item"><span>' + esc(l[S.lang] || l.en) + '</span></div>'; }).join('') + '</div></section></div>';
    return html;
  }

  var renderers = {
    dashboard: pageDashboard, users: pageUsers, endpoints: pageEndpoints, engine: pageEngine,
    subscriptions: pageSubscriptions, scanner: pageScanner, dns: pageDns, monitoring: pageMonitoring,
    security: pageSecurity, settings: pageSettings, cloudflare: pageCloudflare, capabilities: pageCapabilities
  };

  function render(){
    renderNav();
    var view = document.getElementById('view');
    view.innerHTML = renderers[S.page] ? renderers[S.page]() : emptyState();
    document.getElementById('sidebar').classList.remove('open');
    if (S.page === 'monitoring') renderAutomation();
    if (S.page === 'engine' && S.selectedUser) loadConfigList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setPage(page){
    S.page = page;
    try { history.replaceState(null, '', '#' + page); } catch (e) {}
    loading();
    loadPage(page).then(render).catch(showError);
  }

  function showError(err){
    // A blank dashboard is useless: always explain what failed and how to check
    // the deployment (the health endpoint needs no session).
    document.getElementById('view').innerHTML = pageHead(t('error'), '') +
      '<div class="alert err"><div><b>' + esc(t('error')) + '</b>' + esc(err && err.message ? err.message : String(err)) +
      '<div class="faint" style="margin-top:6px">If this persists, open <a class="mono" href="/api/v1/health" target="_blank" rel="noopener">/api/v1/health</a> and check that the D1 database is bound to this deployment as <span class="mono">DB</span>.</div>' +
      '</div></div>';
  }

  function loadPage(page){
    var jobs = [];
    function need(loader){ jobs.push(loader()); }
    if (page === 'dashboard') need(loadOverview);
    if (page === 'users') { need(loadOverview); need(loadUsers); }
    if (page === 'endpoints') need(loadEndpoints);
    if (page === 'engine') { need(loadUsers); need(loadSettings); }
    if (page === 'subscriptions') need(loadSubscriptions);
    if (page === 'scanner') { need(loadSources); return Promise.all(jobs); }
    if (page === 'dns') return loadDns();
    if (page === 'monitoring') { need(loadOverview); need(loadUsers); need(loadAutomation); }
    if (page === 'security') { need(loadAudit); }
    if (page === 'settings') { need(loadSettings); }
    if (page === 'cloudflare') { need(loadCloudflare); }
    if (page === 'capabilities') { need(loadCapabilities); }
    return Promise.all(jobs);
  }

  function loadOverview(){ return api('/admin/overview').then(function(d){ S.overview = d; }); }
  function loadUsers(){ return api('/users').then(function(d){ S.users = d.users || []; }); }
  function loadEndpoints(){ return api('/endpoints').then(function(d){ S.endpoints = d.endpoints || []; }); }
  function loadSubscriptions(){ return api('/subscriptions').then(function(d){ S.subscriptions = d; }); }
  function loadSettings(){ return api('/settings').then(function(d){ S.settings = d; }); }
  function loadAudit(){ return api('/audit?limit=50').then(function(d){ S.audit = d; }); }
  function loadCloudflare(){ return api('/cloudflare').then(function(d){ S.cf = d; }); }
  function loadCapabilities(){ return api('/capabilities').then(function(d){ S.capabilities = d; }); }
  function loadDns(){ return api('/dns').then(function(d){ S.dns = d; }); }
  function loadSources(){ return api('/sources').then(function(d){ S.sources = d; }); }
  function loadAutomation(){ return api('/automation').then(function(d){ S.automation = d; }); }

  function renderAutomation(){
    var box = document.getElementById('automationBox');
    if (!box) return;
    if (!S.automation) { box.innerHTML = '<span class="spinner"></span>'; return; }
    box.innerHTML = '<div class="table-wrap"><table><thead><tr><th>' + esc(t('automation')) + '</th><th>' + esc(t('interval')) + '</th><th>' + esc(t('lastCheck')) + '</th><th>' + esc(t('status')) + '</th><th></th></tr></thead><tbody>' +
      S.automation.jobs.map(function(job){
        return '<tr><td><strong>' + esc(job.name) + '</strong><div class="faint">' + esc(job.kind) + '</div></td>' +
          '<td class="mono">' + esc(job.intervalMinutes) + '</td><td>' + esc(job.lastRunAt ? when(job.lastRunAt) : t('neverRun')) + '</td>' +
          '<td>' + (job.lastStatus === 'failed' ? badge('failed','err') : job.lastStatus ? badge(job.lastStatus,'ok') : badge('—','')) + (job.lastError ? '<div class="faint">' + esc(job.lastError) + '</div>' : '') + '</td>' +
          '<td><div class="btn-row"><button class="btn sm" data-act="automation-run" data-id="' + esc(job.id) + '">' + esc(t('runNow')) + '</button>' +
          '<button class="btn sm" data-act="automation-toggle" data-id="' + esc(job.id) + '" data-enabled="' + (job.enabled ? '1' : '0') + '">' + esc(job.enabled ? 'disable' : 'enable') + '</button></div></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function modal(title, bodyHtml, submitLabel, onSubmit, submitClass){
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFoot').innerHTML = '<button class="btn" type="button" data-act="modal-close">' + esc(t('cancel')) + '</button>' +
      '<button class="btn ' + (submitClass || 'primary') + '" type="submit">' + esc(submitLabel || t('save')) + '</button>';
    document.getElementById('modal').hidden = false;
    S.modalSubmit = onSubmit;
    setTimeout(function(){ var first = document.querySelector('#modalBody input, #modalBody select'); if (first) first.focus(); }, 30);
  }
  function closeModal(){
    document.getElementById('modal').hidden = true;
    S.modalSubmit = null;
  }

  function formValues(form){
    var data = new FormData(form);
    var out = {};
    data.forEach(function(value, key){
      if (out[key] === undefined) out[key] = value;
      else if (Array.isArray(out[key])) out[key].push(value);
      else out[key] = [out[key], value];
    });
    return out;
  }

  function userForm(user){
    var u = user || {};
    var c = u.config || {};
    var protocols = ['ev','et','ex','es'];
    return '<div class="form-grid"><div class="field"><label>User name</label><input name="username" value="' + esc(u.username || '') + '" required></div>' +
      '<div class="field"><label>Nodes per subscription</label><input type="number" name="subNodeCount" min="1" max="500" value="' + esc(u.subNodeCount || 50) + '"></div>' +
      '<div class="field"><label>Quota (GB, 0 = unlimited)</label><input type="number" name="dataLimitGb" min="0" step="0.1" value="' + esc(u.dataLimitGb || 0) + '"></div>' +
      '<div class="field"><label>Expiry (days, 0 = never)</label><input type="number" name="expireDays" min="0" value="' + esc(u.expireDays || 0) + '"></div>' +
      '<div class="field"><label>IP limit</label><input type="number" name="ipLimit" min="1" value="' + esc(u.ipLimit || 50) + '"></div>' +
      '<div class="field"><label>Note</label><input name="note" value="' + esc(u.note || '') + '"></div></div>' +
      '<div class="field"><label>Protocols</label><div class="form-row">' + protocols.map(function(k){
        var label = { ev:'VLESS', et:'Trojan', ex:'xHTTP', es:'Shadowsocks' }[k];
        var value = u.id ? String(c[k]) === 'yes' : (k === 'ev');
        return '<label class="check"><input type="checkbox" name="' + k + '"' + (value ? ' checked' : '') + '>' + label + '</label>';
      }).join('') + '</div></div>' +
      '<div class="field"><label class="check"><input type="checkbox" name="enabled"' + ((u.enabled === undefined || u.enabled) ? ' checked' : '') + '> Enabled</label></div>';
  }

  function openUserModal(user){
    modal(user ? t('editUser') : t('addUser'), userForm(user), t('save'), function(values){
      var payload = {
        username: values.username,
        subNodeCount: Number(values.subNodeCount) || 50,
        dataLimitGb: Number(values.dataLimitGb) || 0,
        expireDays: Number(values.expireDays) || 0,
        ipLimit: Number(values.ipLimit) || 50,
        note: values.note || '',
        enabled: Boolean(values.enabled),
        config: {
          ev: values.ev ? 'yes' : 'no', et: values.et ? 'yes' : 'no',
          ex: values.ex ? 'yes' : 'no', es: values.es ? 'yes' : 'no'
        }
      };
      var promise = user
        ? api('/users/' + encodeURIComponent(user.id), { method: 'PATCH', body: payload })
        : api('/users', { method: 'POST', body: payload });
      return promise.then(function(){
        closeModal(); toast(t('saved'), 'ok');
        return Promise.all([loadOverview(), loadUsers()]).then(render);
      });
    });
  }

  function endpointForm(){
    return '<div class="form-grid"><div class="field"><label>Name</label><input name="name" required></div>' +
      '<div class="field"><label>Host / IP</label><input name="host" class="mono" required placeholder="104.16.0.1 or example.com"></div>' +
      '<div class="field"><label>Port</label><input name="port" type="number" value="443" min="1" max="65535"></div>' +
      '<div class="field"><label>Kind</label><select name="kind"><option value="cloudflare">cloudflare</option><option value="static">static</option><option value="domain">domain</option><option value="origin">origin</option><option value="chain">chain</option></select></div>' +
      '<div class="field"><label>Country (optional, ISO-2)</label><input name="country" maxlength="2" placeholder="DE"></div>' +
      '<div class="field"><label>Provider</label><input name="provider"></div>' +
      '<div class="field"><label>Protocol</label><select name="protocol"><option value="vless">VLESS</option><option value="trojan">Trojan</option><option value="shadowsocks">Shadowsocks</option></select></div>' +
      '<div class="field"><label>Transport</label><select name="transport"><option value="ws">WebSocket</option><option value="xhttp">xHTTP</option></select></div>' +
      '<div class="field"><label>TLS</label><select name="tlsMode"><option value="tls">TLS</option><option value="none">None</option></select></div></div>' +
      '<div class="field"><label>Notes</label><textarea name="notes"></textarea></div>' +
      '<div class="alert info"><div>Location is metadata you supply. The panel never invents a country. Testing a TCP port does not prove the proxy protocol works.</div></div>';
  }

  function handleAction(act, el){
    var id = el.getAttribute('data-id');
    if (act === 'refresh') { loading(); loadPage(S.page).then(render).catch(showError); return; }
    if (act === 'logout') { api('/auth/logout', { method:'POST', body:{} }).finally(function(){ location.reload(); }); return; }
    if (act === 'menu') { document.getElementById('sidebar').classList.toggle('open'); return; }
    if (act === 'modal-close') { closeModal(); return; }
    if (act === 'user-new') { openUserModal(null); return; }
    if (act === 'user-edit') { openUserModal(S.users.filter(function(x){return x.id === id;})[0]); return; }
    if (act === 'user-reset') {
      if (!confirm('Reset measured usage for this user?')) return;
      api('/users/' + encodeURIComponent(id) + '/reset-usage', { method:'POST', body:{} }).then(function(){
        toast(t('saved'), 'ok'); return loadPage(S.page);
      }).then(render).catch(showError); return;
    }
    if (act === 'user-del') {
      var u = S.users.filter(function(x){return x.id === id;})[0];
      var typed = prompt(t('confirmDeleteUser'), '');
      if (!typed) return;
      api('/users/' + encodeURIComponent(id), { method:'DELETE', body:{ confirm: typed } }).then(function(){
        toast(t('userDeleted'), 'ok'); return Promise.all([loadOverview(), loadUsers()]);
      }).then(render).catch(function(err){ toast(err.message, 'err'); }); return;
    }
    if (act === 'sub-rotate') {
      if (!confirm(t('confirmRevoke'))) return;
      api('/users/' + encodeURIComponent(id) + '/rotate-sub', { method:'POST', body:{} }).then(function(){
        toast(t('saved'), 'ok'); return loadPage(S.page);
      }).then(render).catch(function(err){ toast(err.message, 'err'); }); return;
    }
    if (act === 'sub-toggle') {
      var revoked = el.getAttribute('data-revoked') === '1';
      api('/users/' + encodeURIComponent(id) + '/revoke-sub', { method:'POST', body:{ revoked: !revoked } }).then(function(){
        toast(t('saved'), 'ok'); return loadPage(S.page);
      }).then(render).catch(function(err){ toast(err.message, 'err'); }); return;
    }
    if (act === 'copy-link') {
      var text = el.getAttribute('data-url') || '';
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function(){ toast(t('copied'), 'ok'); }).catch(function(){});
      return;
    }
    if (act === 'endpoint-new') {
      modal(t('addEndpoint'), endpointForm(), t('create'), function(values){
        return api('/endpoints', { method:'POST', body: values }).then(function(){
          closeModal(); toast(t('endpointAdded'), 'ok'); return loadEndpoints().then(render);
        });
      });
      return;
    }
    if (act === 'endpoint-check') {
      toast(t('loading'), 'ok');
      api('/endpoints/' + encodeURIComponent(id) + '/check', { method:'POST', body:{} }).then(function(d){
        toast((d.result && d.result.status ? d.result.status : 'checked') + ' · ' + (d.result ? d.result.score : 0) + '/100', 'ok');
        return loadEndpoints();
      }).then(render).catch(function(err){ toast(err.message, 'err'); }); return;
    }
    if (act === 'endpoint-history') {
      var ep = S.endpoints.filter(function(x){return x.id === id;})[0];
      api('/endpoints/' + encodeURIComponent(id) + '/history').then(function(d){
        modal((ep ? ep.name : id) + ' · ' + t('history'),
          '<div class="table-wrap"><table><thead><tr><th>' + esc(t('time')) + '</th><th>Level</th><th>Score</th><th>Latency</th><th>Detail</th></tr></thead><tbody>' +
          ((d.history || []).length ? d.history.map(function(h){
            return '<tr><td>' + esc(when(h.checkedAt)) + '</td><td>' + esc(h.level) + '</td><td>' + (h.ok ? badge('ok','ok') : badge('fail','err')) + '</td><td class="mono">' + esc(h.latencyMs) + ' ms</td><td class="faint">' + esc(h.detail) + '</td></tr>';
          }).join('') : '<tr><td colspan="5" class="faint">' + esc(t('noData')) + '</td></tr>') + '</tbody></table></div>',
          t('close'), function(){ closeModal(); });
        var foot = document.getElementById('modalFoot');
        foot.innerHTML = '<button class="btn" type="button" data-act="modal-close">' + esc(t('close')) + '</button>';
      }).catch(function(err){ toast(err.message, 'err'); });
      return;
    }
    if (act === 'endpoint-ech') {
      api('/endpoints/' + encodeURIComponent(id) + '/ech-check', { method:'POST', body:{} }).then(function(d){
        toast(d.hostname + ': ' + (d.result && d.result.ok ? 'ECH record found' : (d.result ? d.result.detail : 'not available')), d.result && d.result.ok ? 'ok' : 'err');
      }).catch(function(err){ toast(err.message, 'err'); }); return;
    }
    if (act === 'endpoint-del') {
      if (!confirm('Delete this endpoint?')) return;
      api('/endpoints/' + encodeURIComponent(id), { method:'DELETE' }).then(function(){ toast(t('saved'),'ok'); return loadEndpoints(); }).then(render).catch(function(err){ toast(err.message,'err'); }); return;
    }
    if (act === 'engine-load') { loadConfigList(); return; }
    if (act === 'engine-generate') {
      var userId = document.getElementById('engineUser').value;
      S.selectedUser = userId;
      toast(t('loading'), 'ok');
      api('/configurations/generate', { method:'POST', body:{ userId: userId, limit: 24 } }).then(function(d){
        S.engineResult = d; toast(t('generateDone'), 'ok'); render();
      }).catch(function(err){
        S.engineResult = null;
        toast(err.message, 'err');
        if (err.data && err.data.error && err.data.error.rejected) {
          var list = err.data.error.rejected.map(function(x){ return x.code + ' (' + x.count + ')'; }).join(', ');
          toast(list, 'err');
        }
      }); return;
    }
    if (act === 'settings-tab') { S.settingsTab = el.getAttribute('data-tab'); render(); return; }
    if (act === 'settings-reset') {
      if (!confirm(t('confirmReset'))) return;
      api('/settings/reset', { method:'POST', body:{} }).then(function(){ toast(t('saved'),'ok'); return loadSettings(); }).then(render).catch(function(err){ toast(err.message,'err'); }); return;
    }
    if (act === 'sources-check') {
      var cat = el.getAttribute('data-cat');
      toast(t('loading'), 'ok');
      api('/sources/check', { method:'POST', body:{ categories:[cat] } }).then(function(d){
        S.sourcesCheck = d;
        toast(cat + ': ' + d.okCount + '/' + d.results.length + ' live list(s) reachable', d.okCount ? 'ok' : 'err');
        render();
      }).catch(function(err){ toast(err.message, 'err'); });
      return;
    }
    if (act === 'sources-apply') {
      var applyCat = el.getAttribute('data-cat');
      toast(t('loading'), 'ok');
      api('/sources/apply', { method:'POST', body:{ categories:[applyCat], limit: 24 } }).then(function(d){
        var added = d.applied ? d.applied.added.length : 0;
        toast(added + ' address(es) added to yx from ' + d.sources.filter(function(x){ return x.ok; }).length + ' live list(s)', added ? 'ok' : 'err');
        return loadSources();
      }).then(render).catch(function(err){ toast(err.message, 'err'); });
      return;
    }
    if (act === 'sources-auto-save') {
      var cats = [];
      Array.prototype.forEach.call(document.querySelectorAll('[id^="srcAutoCat-"]'), function(input){
        if (input.checked) cats.push(input.id.replace('srcAutoCat-', ''));
      });
      var enabled = document.getElementById('srcAutoEnabled');
      var replace = document.getElementById('srcAutoReplace');
      var interval = document.getElementById('srcAutoInterval');
      var family = document.getElementById('srcAutoFamily');
      var limit = document.getElementById('srcAutoLimit');
      api('/sources/auto', { method:'PUT', body:{
        enabled: Boolean(enabled && enabled.checked),
        replace: Boolean(replace && replace.checked),
        intervalMinutes: Number(interval && interval.value) || 360,
        family: (family && family.value) || 'any',
        limit: Number(limit && limit.value) || 24,
        categories: cats
      } }).then(function(d){
        S.sources = S.sources || {};
        S.sources.auto = d.auto;
        toast(t('saved'), 'ok');
        render();
      }).catch(function(err){ toast(err.message, 'err'); });
      return;
    }
    if (act === 'dns-test') {
      toast(t('loading'), 'ok');
      api('/dns/test', { method:'POST', body:{ profileId: id } }).then(function(d){
        toast(d.profileId + ': ' + (d.record.ok ? 'ok ' + (d.record.latencyMs||0) + 'ms' : (d.record.error || 'failed')), d.record.ok ? 'ok' : 'err');
        return loadDns();
      }).then(render).catch(function(err){ toast(err.message,'err'); }); return;
    }
    if (act === 'ech-test') {
      var host = el.getAttribute('data-host');
      api('/dns/ech-test', { method:'POST', body:{ hostname: host } }).then(function(d){
        toast(host + ': ' + (d.result.ok ? 'ECH record found' : (d.result.detail || 'no ECH record')), d.result.ok ? 'ok' : 'err');
        return loadDns();
      }).then(render).catch(function(err){ toast(err.message, 'err'); });
      return;
    }
    if (act === 'ech-find') {
      var echHost = document.getElementById('echFindHost');
      var echValue = echHost ? echHost.value.trim() : '';
      var echOut = document.getElementById('echFindResult');
      if (!echValue) { toast('Enter a hostname first', 'err'); return; }
      if (echOut) echOut.innerHTML = '<span class="faint">' + esc(t('loading')) + '</span>';
      api('/dns/ech-find', { method:'POST', body:{ hostname: echValue, refresh: true } }).then(function(d){
        var r = d.result || {};
        if (echOut) {
          echOut.innerHTML = r.ok
            ? badge(r.host, 'ok') + ' <span class="faint">' + esc(r.resolver || '') + ' · ' + esc((r.alpn || []).join(',')) + '</span>' +
              '<div class="mono" style="margin-top:6px;word-break:break-all">' + esc(r.echConfig || '') + '</div>' +
              '<div class="faint mono">' + esc(String(r.record || '').slice(0, 120)) + '</div>'
            : badge('no ech record', 'warn') + ' <span class="faint">' + esc(r.detail || '') + '</span>';
        }
        toast(r.ok ? 'ECH config found for ' + r.host : (r.detail || 'no ECH record'), r.ok ? 'ok' : 'err');
      }).catch(function(err){
        if (echOut) echOut.innerHTML = '<span class="faint">' + esc(err.message) + '</span>';
        toast(err.message, 'err');
      });
      return;
    }
    if (act === 'revoke-sessions') {
      if (!confirm('Revoke all admin sessions? You will be signed out.')) return;
      api('/auth/revoke-sessions', { method:'POST', body:{} }).finally(function(){ location.reload(); }); return;
    }
    if (act === 'cf-test') {
      api('/cloudflare/test', { method:'POST', body:{} }).then(function(d){
        toast(d.ok ? 'Token active · ' + (d.accounts || []).length + ' account(s)' : 'Token check failed', d.ok ? 'ok' : 'err');
      }).catch(function(err){ toast(err.message,'err'); }); return;
    }
    if (act === 'cf-disconnect') {
      if (!confirm('Remove the stored Cloudflare token?')) return;
      api('/cloudflare/token', { method:'DELETE' }).then(function(){ toast(t('saved'),'ok'); return loadCloudflare(); }).then(render).catch(function(err){ toast(err.message,'err'); }); return;
    }
    if (act === 'automation-run') {
      api('/automation/' + encodeURIComponent(id) + '/run', { method:'POST', body:{} }).then(function(d){
        toast(d.detail, 'ok'); return loadAutomation();
      }).then(renderAutomation).catch(function(err){ toast(err.message,'err'); }); return;
    }
    if (act === 'automation-toggle') {
      var enabled = el.getAttribute('data-enabled') === '1';
      api('/automation/' + encodeURIComponent(id), { method:'PATCH', body:{ enabled: !enabled } }).then(function(){
        toast(t('saved'),'ok'); return loadAutomation();
      }).then(renderAutomation).catch(function(err){ toast(err.message,'err'); }); return;
    }
    if (act === 'refresh-data') { loadPage(S.page).then(render).catch(showError); return; }
  }

  function loadConfigList(){
    var user = S.selectedUser || (S.users[0] && S.users[0].id);
    if (!user) return;
    var el = document.getElementById('configList');
    if (!el) return;
    api('/configurations?userId=' + encodeURIComponent(user)).then(function(d){
      var list = d.configurations || [];
      el.innerHTML = list.length ? list.map(function(c){
        return '<div class="list-item"><div><strong>' + esc(c.protocol + ' · ' + c.transport + ' · ' + c.tlsMode) + '</strong>' +
          '<div class="faint">' + esc(c.endpointId || '—') + ' · ' + esc(c.clientFormat) + ' · ' + esc(when(c.createdAt)) + '</div></div>' +
          '<span>' + badge(String(c.score), c.valid ? 'ok' : 'err') + '</span></div>';
      }).join('') : '<div class="faint">' + esc(t('noData')) + '</div>';
    }).catch(function(err){ el.innerHTML = '<div class="faint">' + esc(err.message) + '</div>'; });
  }

  document.addEventListener('click', function(event){
    var nav = event.target.closest('[data-nav]');
    if (nav) { setPage(nav.getAttribute('data-nav')); return; }
    var act = event.target.closest('[data-act]');
    if (act) { event.preventDefault(); handleAction(act.getAttribute('data-act'), act); }
  });

  document.addEventListener('submit', function(event){
    var form = event.target;
    if (form.id === 'modalForm') {
      event.preventDefault();
      if (!S.modalSubmit) return;
      var buttons = form.querySelectorAll('button[type="submit"]');
      buttons.forEach(function(btn){ btn.disabled = true; });
      Promise.resolve(S.modalSubmit(formValues(form))).catch(function(err){
        toast(err.message || String(err), 'err');
      }).finally(function(){
        buttons.forEach(function(btn){ btn.disabled = false; });
      });
      return;
    }
    if (form.dataset.form === 'settings') {
      event.preventDefault();
      var section = form.getAttribute('data-section');
      var values = formValues(form);
      var payload = {};
      var schema = (S.settings && S.settings.schema) || [];
      schema.filter(function(f){ return f.section === section || (section === 'cloudflare' && f.key === 'cfAccountId'); }).forEach(function(field){
        var raw = values[field.key];
        if (field.type === 'boolean') payload[field.key] = raw ? 'yes' : 'no';
        else if (field.type === 'multiselect') payload[field.key] = Array.isArray(raw) ? raw.join(',') : (raw || '');
        else if (raw !== undefined) payload[field.key] = raw;
      });
      api('/settings', { method:'PUT', body:{ settings: payload } }).then(function(d){
        toast(t('saved'), 'ok');
        (d.warnings || []).forEach(function(w){ toast(w.message, 'err'); });
        S.settings = d; return Promise.all([loadSettings(), loadOverview()]);
      }).then(render).catch(function(err){
        toast(err.message, 'err');
        if (err.data && err.data.error && err.data.error.details) {
          (err.data.error.details || []).forEach(function(detail){ toast((detail.field ? detail.field + ': ' : '') + detail.message, 'err'); });
        }
      });
      return;
    }
    if (form.dataset.form === 'scan') {
      event.preventDefault();
      var values = formValues(form);
      var levels = values.levels ? (Array.isArray(values.levels) ? values.levels : [values.levels]) : ['tcp'];
      api('/scanner/scan', { method:'POST', body:{ targets:[{ host: values.host, port: Number(values.port) || 443, levels: levels }], levels: levels } }).then(function(d){
        S.scanResult = d; render();
      }).catch(function(err){ toast(err.message, 'err'); });
      return;
    }
    if (form.dataset.form === 'change-password') {
      event.preventDefault();
      var v = formValues(form);
      if (v.newPassword !== v.confirmPassword) { toast('Passwords do not match', 'err'); return; }
      api('/auth/change-password', { method:'POST', body: v }).then(function(){ toast(t('saved'), 'ok'); form.reset(); })
        .catch(function(err){ toast(err.message, 'err'); });
      return;
    }
    if (form.dataset.form === 'cf-token') {
      event.preventDefault();
      var data = formValues(form);
      api('/cloudflare/token', { method:'PUT', body: data }).then(function(){ toast(t('connected'), 'ok'); return loadCloudflare(); }).then(render).catch(function(err){ toast(err.message, 'err'); });
      return;
    }
    if (form.dataset.form === 'cf-workers') {
      event.preventDefault();
      api('/cloudflare/workers', { method:'POST', body: formValues(form) }).then(function(d){
        toast(d.deployment && d.deployment.found ? 'Worker deployed · ' + d.deployment.script : 'No matching Worker script found', d.deployment && d.deployment.found ? 'ok' : 'err');
        if (d.scripts) toast(d.scripts.length + ' script(s) visible to this token', 'ok');
      }).catch(function(err){ toast(err.message, 'err'); });
      return;
    }
  });

  document.addEventListener('keydown', function(event){
    if (event.key === 'Escape') closeModal();
  });

  document.getElementById('themeBtn').addEventListener('click', function(){
    S.theme = S.theme === 'dark' ? 'light' : S.theme === 'light' ? 'system' : 'dark';
    applyChrome();
  });
  document.getElementById('langBtn').addEventListener('click', function(){
    S.lang = S.lang === 'fa' ? 'en' : 'fa';
    applyChrome();
    render();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){ if (S.theme === 'system') applyChrome(); });

  // Any uncaught script error must surface on screen instead of leaving the
  // dashboard skeleton showing an empty content area.
  var reportingError = false;
  function reportCrash(reason){
    if (reportingError) return;
    reportingError = true;
    try { showError(reason instanceof Error ? reason : new Error(String(reason))); } catch (e) {}
    reportingError = false;
  }
  window.addEventListener('error', function(event){
    if (event && event.message) reportCrash(event.message);
  });
  window.addEventListener('unhandledrejection', function(event){
    reportCrash(event && event.reason ? event.reason : 'Unhandled rejection');
  });

  var initial = (location.hash || '').replace('#','');
  if (pages.some(function(p){ return p.id === initial; })) S.page = initial;
  applyChrome();
  loading();
  loadPage(S.page).then(render).catch(showError);
})();
`;
