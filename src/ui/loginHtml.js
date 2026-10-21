// ============================================================================
// miliconfigOS v4.0 - Admin gateway
// The configured homepage is shown first, then blurred while the login window
// fades in. A persistent "skip" control keeps the 3-second sequence from
// trapping anyone, and reduced-motion preferences skip the transition.
// ============================================================================

import { FAVICON_DATA_URI } from './icons.js';
import { BRAND_NAME, VERSION } from '../config/defaults.js';

const LOGIN_I18N = {
  fa: {
    title: 'ورود مدیر',
    setupTitle: 'راه‌اندازی اولیه',
    subtitle: 'درگاه امن مرکز کنترل',
    setupSubtitle: 'یک رمز عبور قوی برای مدیر تعیین کنید',
    password: 'رمز عبور',
    newPassword: 'رمز عبور جدید',
    confirm: 'تکرار رمز عبور',
    login: 'ورود به مرکز کنترل',
    setup: 'ذخیره رمز و ساخت حساب مدیر',
    working: 'در حال بررسی…',
    skip: 'ورود مدیر',
    hint: 'حداقل ۱۰ کاراکتر و حداقل دو نوع نویسه (حرف، رقم، نماد).',
    policy: 'رمز عبور حداقل ۱۰ کاراکتر باشد و حداقل دو نوع نویسه داشته باشد.',
    mismatch: 'رمزهای عبور یکسان نیستند.',
    wrong: 'رمز عبور نادرست است.',
    network: 'خطای شبکه؛ دوباره تلاش کنید.',
    done: 'پنل آماده است',
    doneHint: 'این شناسه مسیر مدیریت است؛ در جای امن نگه دارید.',
    open: 'باز کردن پنل مدیریت',
    copy: 'کپی شناسه',
    copied: 'کپی شد',
    theme: 'پوسته',
    light: 'روشن', dark: 'تیره', system: 'سیستم',
    lang: 'English',
    customHomepage: 'صفحه خانه',
    back: 'بازگشت',
    dbMissing: 'پایگاه‌داده Cloudflare D1 متصل نیست. برای فعال‌سازی احراز هویت، بایندینگ D1 با نام DB را اضافه کنید.'
  },
  en: {
    title: 'Admin sign in',
    setupTitle: 'First-run setup',
    subtitle: 'Secure control center gateway',
    setupSubtitle: 'Choose a strong administrator password',
    password: 'Password',
    newPassword: 'New password',
    confirm: 'Confirm password',
    login: 'Enter control center',
    setup: 'Save password and create admin',
    working: 'Checking…',
    skip: 'Admin sign in',
    hint: 'At least 10 characters and two character classes (letters, digits, symbols).',
    policy: 'Password must be at least 10 characters and use two character classes.',
    mismatch: 'Passwords do not match.',
    wrong: 'Incorrect password.',
    network: 'Network error; try again.',
    done: 'Panel is ready',
    doneHint: 'This is your admin path. Keep it somewhere safe.',
    open: 'Open admin panel',
    copy: 'Copy path',
    copied: 'Copied',
    theme: 'Theme',
    light: 'Light', dark: 'Dark', system: 'System',
    lang: 'فارسی',
    customHomepage: 'Homepage',
    back: 'Back',
    dbMissing: 'Cloudflare D1 is not bound. Add a D1 binding named DB before authentication can work.'
  }
};

export function renderLoginGatewayHtml(options = {}) {
  const initialized = options.initialized !== false;
  const homepage = String(options.homepage || 'https://nginx.com');
  const defaultLang = 'fa';
  const boot = {
    initialized,
    lang: defaultLang,
    homepage,
    version: VERSION,
    databaseAvailable: options.databaseAvailable !== false
  };

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${initialized ? 'Welcome to nginx!' : 'MiliconfigOS · Setup'}</title>
<link rel="icon" href="${FAVICON_DATA_URI}">
<script>
(function(){
  try {
    var t = localStorage.getItem('mili.theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    var l = localStorage.getItem('mili.lang');
    if (l === 'en' || l === 'fa') { document.documentElement.lang = l; document.documentElement.dir = l === 'fa' ? 'rtl' : 'ltr'; }
  } catch (e) {}
})();
</script>
<style>
:root{
  --font:"Vazirmatn","Segoe UI",system-ui,-apple-system,"Noto Sans Arabic",sans-serif;
  --accent:#34d399; --accent-2:#22d3ee; --accent-ink:#052e22; --accent-soft:rgba(52,211,153,.14);
}
html[data-theme="dark"]{
  --bg:#050b08; --surface:#0b1712; --surface-2:#0f2018; --border:rgba(148,163,184,.18);
  --border-strong:rgba(148,163,184,.32); --text:#e7f4ec; --muted:#8ca79a; --faint:#5c7568;
  --input:#08130e; --shadow:0 30px 80px rgba(0,0,0,.55); color-scheme:dark;
}
html[data-theme="light"]{
  --bg:#eef4f0; --surface:#ffffff; --surface-2:#f5f9f6; --border:rgba(15,42,30,.12);
  --border-strong:rgba(15,42,30,.22); --text:#0d2118; --muted:#5c7268; --faint:#8b9d93;
  --input:#f9fcfa; --shadow:0 24px 60px rgba(15,42,30,.16); color-scheme:light;
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;font-family:var(--font);background:var(--bg);color:var(--text);overflow:hidden}
.frame{position:fixed;inset:0;background:var(--bg)}
.homepage{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff;transition:filter .9s ease, transform .9s ease, opacity .9s ease}
body.veiled .homepage{filter:blur(9px) brightness(.55) saturate(.9);transform:scale(1.02);opacity:.55}
.scrim{position:absolute;inset:0;background:
  radial-gradient(900px 500px at 15% 10%, rgba(52,211,153,.16), transparent 60%),
  radial-gradient(800px 500px at 90% 90%, rgba(34,211,238,.12), transparent 60%),
  linear-gradient(180deg, rgba(2,8,5,.15), rgba(2,8,5,.65));
  opacity:0;transition:opacity .9s ease;pointer-events:none}
body.veiled .scrim{opacity:1}
.topbar{position:absolute;inset-block-start:0;inset-inline:0;display:flex;justify-content:space-between;align-items:center;padding:16px 20px;z-index:5}
.brand{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:rgba(6,14,10,.55);border:1px solid var(--border);backdrop-filter:blur(8px);color:#eaf6ee;font-size:.8rem}
html[data-theme="light"] .brand{background:rgba(255,255,255,.72);color:#0d2118}
.brand svg{width:26px;height:26px}
.brand b{font-weight:800;letter-spacing:.2px}
.brand span{color:var(--muted);font-size:.68rem}
.tools{display:flex;gap:8px}
.tools button{
  border:1px solid var(--border);background:rgba(6,14,10,.55);color:#dcece2;border-radius:999px;
  padding:6px 11px;font:inherit;font-size:.72rem;cursor:pointer;backdrop-filter:blur(8px);
}
html[data-theme="light"] .tools button{background:rgba(255,255,255,.72);color:#0d2118}
.tools button:hover{border-color:var(--accent);color:var(--accent)}
.skip{
  position:absolute;inset-block-end:18px;inset-inline-start:50%;transform:translateX(-50%);
  z-index:6;border:1px solid var(--border-strong);background:rgba(6,14,10,.6);color:#dcece2;
  border-radius:999px;padding:8px 18px;font:inherit;font-size:.76rem;cursor:pointer;backdrop-filter:blur(8px);
}
html[dir="rtl"] .skip{transform:translateX(50%)}
html[data-theme="light"] .skip{background:rgba(255,255,255,.8);color:#0d2118}
.skip:hover{border-color:var(--accent);color:var(--accent)}
.gate{
  position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;padding:22px;
  opacity:0;visibility:hidden;transition:opacity .75s ease, visibility 0s linear .75s;
}
.gate.visible{opacity:1;visibility:visible;transition:opacity .75s ease, visibility 0s}
html[data-reduced="1"] .gate,html[data-reduced="1"] .homepage{transition:none}
.card{
  width:min(440px,100%);background:var(--surface);border:1px solid var(--border-strong);border-radius:18px;
  box-shadow:var(--shadow);overflow:hidden;transform:translateY(16px) scale(.975);transition:transform .75s cubic-bezier(.16,1,.3,1);
  position:relative;
}
.gate.visible .card{transform:none}
.card::before{content:"";position:absolute;inset-block-start:0;inset-inline:0;height:3px;background:linear-gradient(90deg,var(--accent),var(--accent-2))}
.card-head{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid var(--border);background:linear-gradient(90deg,var(--accent-soft),transparent 60%)}
.dots{display:inline-flex;gap:6px}.dots i{width:9px;height:9px;border-radius:50%;display:block}
.dots i:nth-child(1){background:#ff6464}.dots i:nth-child(2){background:#f5c451}.dots i:nth-child(3){background:#4ade80}
.head-tag{font-size:.68rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
.card-body{padding:24px 22px 22px}
.brand-line{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.logo{width:46px;height:46px;flex:none}
.brand-line h1{margin:0;font-size:1.02rem;letter-spacing:.01em}
.brand-line p{margin:2px 0 0;color:var(--muted);font-size:.74rem}
.err{display:none;margin-bottom:12px;padding:9px 11px;border-radius:10px;border:1px solid rgba(239,68,68,.5);background:rgba(239,68,68,.1);color:#fca5a5;font-size:.76rem;line-height:1.6}
html[data-theme="light"] .err{color:#b91c1c}
.field{margin-bottom:12px}
.field label{display:block;font-size:.75rem;color:var(--muted);margin-bottom:6px;font-weight:600}
.field input{width:100%;padding:11px 12px;border-radius:11px;border:1px solid var(--border-strong);background:var(--input);color:var(--text);font:inherit;font-size:.88rem;outline:none;direction:ltr;text-align:left}
.field input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.cta{width:100%;margin-top:6px;padding:11px 16px;border:0;border-radius:11px;background:linear-gradient(180deg,var(--accent),var(--accent-2));color:var(--accent-ink);font:inherit;font-weight:800;font-size:.86rem;cursor:pointer}
.cta:hover{filter:brightness(1.05)}
.cta:disabled{opacity:.6;cursor:not-allowed}
.hint{margin-top:14px;padding-top:12px;border-top:1px dashed var(--border);font-size:.7rem;line-height:1.8;color:var(--faint)}
.hidden{display:none!important}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:.76rem;padding:10px 12px;border-radius:9px;border:1px dashed var(--border-strong);background:var(--surface-2);word-break:break-all;direction:ltr;text-align:left}
.ghost{display:inline-block;margin-top:12px;background:none;border:0;color:var(--accent);font:inherit;font-size:.74rem;cursor:pointer;padding:0}
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}
@media(max-width:520px){
  .card-body{padding:20px 16px 18px}
  .topbar{padding:10px 12px}
  .brand span{display:none}
}
</style>
</head>
<body>
<div class="frame">
  <iframe class="homepage" id="homepage" src="/__homepage" title="Homepage" tabindex="-1" referrerpolicy="no-referrer"></iframe>
  <div class="scrim"></div>
</div>

<div class="topbar">
  <div class="brand">
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 4l15 5.5v12.8C39 33 32.6 40 24 44 15.4 40 9 33 9 22.3V9.5z" fill="rgba(52,211,153,.16)" stroke="#34d399" stroke-width="2.2"/>
      <circle cx="24" cy="22" r="2.6" fill="#34d399"/>
      <circle cx="16" cy="16" r="2" fill="#22d3ee"/><circle cx="32" cy="16" r="2" fill="#22d3ee"/>
      <circle cx="17" cy="29" r="2" fill="#22d3ee"/><circle cx="31" cy="29" r="2" fill="#22d3ee"/>
    </svg>
    <div><b>${BRAND_NAME}OS</b><br><span>${VERSION} · Milad Jahani</span></div>
  </div>
  <div class="tools">
    <button type="button" id="langBtn"></button>
    <button type="button" id="themeBtn"></button>
  </div>
</div>

<button class="skip" id="skipBtn" type="button"></button>

<div class="gate" id="gate">
  <div class="card" role="dialog" aria-modal="true" aria-labelledby="gateTitle">
    <div class="card-head"><span class="dots"><i></i><i></i><i></i></span><span class="head-tag">secure gateway</span></div>
    <div class="card-body">
      <div class="brand-line">
        <svg class="logo" viewBox="0 0 48 48" aria-hidden="true">
          <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
          <path d="M24 4l15 5.5v12.8C39 33 32.6 40 24 44 15.4 40 9 33 9 22.3V9.5z" fill="none" stroke="url(#lg)" stroke-width="2.2"/>
          <path d="M17 22l4.5 4.5L32 17" fill="none" stroke="url(#lg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div><h1 id="gateTitle"></h1><p id="gateSubtitle"></p></div>
      </div>

      <div class="err" id="errBox" role="alert"></div>
      <div class="err" id="dbBox" role="alert" style="display:none;border-color:rgba(245,158,11,.5);background:rgba(245,158,11,.1);color:#fbbf24"></div>

      <form id="loginForm" class="${initialized ? '' : 'hidden'}">
        <div class="field">
          <label for="password" id="lblPassword"></label>
          <input type="password" id="password" autocomplete="current-password" required>
        </div>
        <button class="cta" type="submit" id="loginBtn"></button>
      </form>

      <form id="setupForm" class="${initialized ? 'hidden' : ''}">
        <div class="field">
          <label for="newPassword" id="lblNewPassword"></label>
          <input type="password" id="newPassword" autocomplete="new-password" minlength="10" required>
        </div>
        <div class="field">
          <label for="confirmPassword" id="lblConfirm"></label>
          <input type="password" id="confirmPassword" autocomplete="new-password" minlength="10" required>
        </div>
        <button class="cta" type="submit" id="setupBtn"></button>
      </form>

      <div id="doneCard" class="hidden">
        <p class="hint" style="border:0;padding:0;margin:0 0 8px" id="doneText"></p>
        <div class="mono" id="adminPath"></div>
        <button class="cta" type="button" id="openBtn" style="margin-top:14px"></button>
        <button class="ghost" type="button" id="copyBtn"></button>
      </div>

      <div class="hint" id="hintBox"></div>
    </div>
  </div>
</div>

<script>
var I18N = ${JSON.stringify(LOGIN_I18N).replace(/</g, '\\u003c')};
var BOOT = ${JSON.stringify(boot).replace(/</g, '\\u003c')};
(function(){
  'use strict';
  var S = { lang: localStorage.getItem('mili.lang') === 'en' ? 'en' : 'fa', theme: localStorage.getItem('mili.theme') || 'system' };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.documentElement.dataset.reduced = '1';
  function t(key){ return (I18N[S.lang] || I18N.fa)[key] || key; }
  function el(id){ return document.getElementById(id); }
  function apply(){
    document.documentElement.lang = S.lang;
    document.documentElement.dir = S.lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('mili.lang', S.lang);
    var dark = S.theme === 'dark' || (S.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('mili.theme', S.theme);
    el('langBtn').textContent = t('lang');
    el('themeBtn').textContent = t('theme') + ': ' + t(S.theme);
    el('skipBtn').textContent = t('skip');
    el('gateTitle').textContent = BOOT.initialized ? t('title') : t('setupTitle');
    el('gateSubtitle').textContent = BOOT.initialized ? t('subtitle') : t('setupSubtitle');
    el('lblPassword').textContent = t('password');
    el('lblNewPassword').textContent = t('newPassword');
    el('lblConfirm').textContent = t('confirm');
    el('loginBtn').textContent = t('login');
    el('setupBtn').textContent = t('setup');
    el('loginBtn').disabled = !BOOT.databaseAvailable;
    el('setupBtn').disabled = !BOOT.databaseAvailable;
    el('hintBox').textContent = BOOT.initialized ? t('hint') : t('policy');
    if (!BOOT.databaseAvailable) {
      el('dbBox').textContent = t('dbMissing');
      el('dbBox').style.display = 'block';
      el('loginBtn').disabled = true;
      el('setupBtn').disabled = true;
    }
    el('doneText').textContent = t('done') + ' — ' + t('doneHint');
    el('openBtn').textContent = t('open');
    el('copyBtn').textContent = t('copy');
    el('setupBtn').textContent = t('setup');
    document.title = BOOT.initialized ? 'Welcome to nginx!' : 'MiliconfigOS · Setup';
  }
  function showError(message){
    var box = el('errBox');
    box.textContent = message;
    box.style.display = 'block';
  }
  function clearError(){ el('errBox').style.display = 'none'; }
  function reveal(){
    document.body.classList.add('veiled');
    el('gate').classList.add('visible');
    document.title = 'MiliconfigOS · ' + (BOOT.initialized ? t('title') : t('setupTitle'));
    var focus = BOOT.initialized ? el('password') : el('newPassword');
    setTimeout(function(){ try { focus.focus(); } catch (e) {} }, reduced ? 0 : 300);
  }
  function post(path, payload){
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    }).then(function(res){
      return res.json().catch(function(){ return {}; }).then(function(data){
        return { ok: res.ok, data: data, status: res.status };
      });
    });
  }

  document.getElementById('loginForm').addEventListener('submit', function(event){
    event.preventDefault();
    clearError();
    var password = el('password').value;
    if (!password) { showError(t('wrong')); return; }
    var btn = el('loginBtn');
    btn.disabled = true; btn.textContent = t('working');
    post('/api/v1/auth/login', { password: password }).then(function(result){
      if (result.ok && result.data.ok) {
        window.location.href = result.data.redirect || location.pathname;
        return;
      }
      showError(result.data && result.data.error ? result.data.error.message : t('wrong'));
      btn.disabled = false; btn.textContent = t('login');
    }).catch(function(){
      showError(t('network'));
      btn.disabled = false; btn.textContent = t('login');
    });
  });

  document.getElementById('setupForm').addEventListener('submit', function(event){
    event.preventDefault();
    clearError();
    var p1 = el('newPassword').value;
    var p2 = el('confirmPassword').value;
    if (p1.length < 10) { showError(t('policy')); return; }
    if (p1 !== p2) { showError(t('mismatch')); return; }
    var btn = el('setupBtn');
    btn.disabled = true; btn.textContent = t('working');
    post('/api/v1/auth/setup', { password: p1, confirmPassword: p2 }).then(function(result){
      if (result.ok && result.data.ok) {
        BOOT.initialized = true;
        el('setupForm').classList.add('hidden');
        el('loginForm').classList.add('hidden');
        el('doneCard').classList.remove('hidden');
        el('adminPath').textContent = result.data.adminPath || '';
        el('openBtn').onclick = function(){ window.location.href = result.data.redirect || ('/' + (result.data.adminPath || '')); };
        el('copyBtn').onclick = function(){
          if (navigator.clipboard && result.data.adminPath) {
            navigator.clipboard.writeText(result.data.adminPath).then(function(){ el('copyBtn').textContent = t('copied'); });
          }
        };
        el('skipBtn').style.display = 'none';
        btn.disabled = false; btn.textContent = t('setup');
        return;
      }
      showError((result.data && result.data.error && result.data.error.message) || t('network'));
      btn.disabled = false; btn.textContent = t('setup');
    }).catch(function(){
      showError(t('network'));
      btn.disabled = false; btn.textContent = t('setup');
    });
  });

  el('skipBtn').addEventListener('click', reveal);
  el('themeBtn').addEventListener('click', function(){
    S.theme = S.theme === 'dark' ? 'light' : S.theme === 'light' ? 'system' : 'dark';
    apply();
  });
  el('langBtn').addEventListener('click', function(){
    S.lang = S.lang === 'fa' ? 'en' : 'fa';
    apply();
  });
  document.addEventListener('keydown', function(event){
    if ((event.key === 'Enter' || event.key === ' ') && !el('gate').classList.contains('visible')) {
      event.preventDefault();
      reveal();
    }
  });

  apply();
  if (!BOOT.initialized || reduced) {
    document.body.classList.add('veiled');
    el('gate').classList.add('visible');
    setTimeout(function(){ try { (BOOT.initialized ? el('password') : el('newPassword')).focus(); } catch (e) {} }, 0);
  } else {
    setTimeout(reveal, 3000);
  }
})();
</script>
</body>
</html>`;
}
