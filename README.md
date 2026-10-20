# miliconfig v3.1 — مرکز کنترل زیرساخت پروکسی روی Cloudflare Workers & Pages + D1

![Version](https://img.shields.io/badge/version-v3.1--D1-b5ff4d?style=flat-square&labelColor=0b140b)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers%20%26%20Pages-84cc16?style=flat-square&labelColor=0b140b)
![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare%20D1%20Auto--Migrate-a3e635?style=flat-square&labelColor=0b140b)
![Obfuscation](https://img.shields.io/badge/Security-Advanced%20Obfuscation%20(Zero%201101)-b5ff4d?style=flat-square&labelColor=0b140b)

**زبان:** [فارسی](فارسی.md) | [English](#english-overview)

---

## ویژگی‌های کلیدی نسخه `miliconfig v3.1`

1. **معماری ماژولار چندفایلی (Multi-File Modular Architecture)**:
   - دیگر یک اسکریپت تک‌فایلی شلوغ نیست؛ کدها در دایرکتری `src/` به تفکیک `config/`، `db/`، `core/`، `subscription/`، `api/` و `ui/` سازماندهی شده‌اند.
   - همزمان فایل‌های باندل و مبهم‌سازی‌شده (`_worker.js`, `dist/_worker.js`, `public/_worker.js`, `少年你相信光吗`) به صورت خودکار تولید می‌شوند تا در هر روش استقراری بلافاصله کار کنند.

2. **دیتابیس Cloudflare D1 بدون هیچ خطایی در استقرار دستی یا اتوماتیک**:
   - **تشخیص خودکار بایندینگ D1**: فرقی نمی‌کند نام متغیر D1 را در کلودفلر `DB`، `D1`، `miliconfig` یا هر نام دیگری بگذارید؛ سیستم به صورت خودکار آن را شناسایی می‌کند.
   - **ساخت خودکار جداول (Auto-Migration)**: نیازی به زدن دستورات SQL یا `wrangler d1 execute` نیست! در اولین درخواست، جداول `users`، `system_config`، `preferred_nodes`، `audit_logs` و `traffic_hourly` به صورت خودکار ساخته می‌شوند.
   - **محافظ ضد خطای D1 و ضد خطای `Error 1101`**: حتی اگر قبل از اتصال D1 پروژه را به صورت دستی یا از گیت‌هاب مستقر کنید، برنامه کرش نمی‌کند و بدون خطای ۱۱۰۱ با حافظه پشتیبان کار می‌کند تا هر زمان که خواستید D1 را متصل نمایید.

3. **مدیریت پیشرفته کاربران + کپی تمام تنظیمات پیش‌فرض کد پایه**:
   - با کلیک روی دکمه **«+ کاربر جدید (پیشرفته)»** یا **«ساخت سریع کاربر»**، علاوه بر **نام کاربر (`username`)** و **تعداد نودها در ساب (`subNodeCount`)**، **تمام ۳۱ تنظیم پیش‌فرض کد پایه (`wk`, `ev`, `et`, `ex`, `ech`, `tp`, `customDNS`, `customECHDomain`, `alpn`, `d`, `p`, `yx`, `yxURL`, `s`, `homepage`, `scu`, `ena`, `epd`, `epi`, `egi`, `ae`, `rm`, `qj`, `dkby`, `yxby`, `ipv4`, `ipv6`, `ispMobile`, `ispUnicom`, `ispTelecom`, `jk`)** برای کاربر وجود دارد و قابل شخصی‌سازی است.

4. **برندینگ `miliconfig` و نام‌گذاری کانفیگ‌ها به فرمت `number+miliconfig`**:
   - تمامی کانفیگ‌های خروجی در همه کلاینت‌ها (v2rayNG, Streisand, Shadowrocket, Amnezia, Exclusive, Clash Meta/Mihomo, Sing-box/Hiddify, Surge, Loon, Quantumult X) دقیقاً با فرمت **`1+miliconfig`**، **`2+miliconfig`**، **`3+miliconfig`** تا **`N+miliconfig`** (بر اساس تعداد نودهای تعیین‌شده در تنظیمات کاربر) نام‌گذاری می‌شوند.

5. **صفحه وضعیت اختصاصی برای ارسال به هر کاربر (`/status/{user_id}`)**:
   - هر کاربر دارای یک لینک اختصاصی **پنجره وضعیت** است که می‌توانید مستقیماً برای مشتری ارسال کنید (شامل وضعیت حجم و انقضا، انتخاب محدوده نودها، سابلینک لوکیشن‌محور ۱۱ کشور، سابلینک اختصاصی ۱۶ کلاینت در ۵ خانواده، لینک دانلود کلاینت‌ها و کپی تکی کانفیگ‌ها).

---

## راهنمای استقرار مستقیم از گیت‌هاب (Cloudflare Workers & Pages)

### روش اول: اتصال مستقیم گیت‌هاب به Cloudflare Workers
1. این مخزن را در گیت‌هاب خود آپلود (Push) کنید.
2. در پنل Cloudflare وارد **Workers & Pages** شوید -> **Create** -> **Workers** -> **Import a repository** را بزنید و مخزن گیت‌هاب را متصل کنید.
3. پروژه به لطف فایل استاندارد `wrangler.toml` (`main = "src/index.js"`) بلافاصله بدون هیچ خطایی مستقر می‌شود!
4. برای اتصال دیتابیس D1:
   - در پنل کلودفلر از منوی **Storage & Databases -> D1 SQL Database** یک دیتابیس بسازید (مثلاً `miliconfig-db`).
   - وارد تنظیمات Worker خود شوید -> **Settings -> Bindings -> Add -> D1 database** -> متغیر را `DB` بنامید و دیتابیس را انتخاب و Deploy کنید. (جداول به صورت خودکار ساخته می‌شوند!).

### روش دوم: اتصال مستقیم گیت‌هاب به Cloudflare Pages
1. در پنل Cloudflare وارد **Workers & Pages -> Create -> Pages -> Connect to Git** شوید.
2. مخزن گیت‌هاب خود را انتخاب کنید:
   - **Build command**: `npm run build` (یا خالی بگذارید)
   - **Build output directory**: `dist` (اگر Build command را خالی گذاشتید می‌توانید `/` یا `dist` یا `public` قرار دهید)
3. پس از استقرار، از بخش **Settings -> Functions -> D1 database bindings** دیتابیس D1 خود را با نام `DB` متصل کنید.

---

## ساختار ماژولار پروژه

```text
miliconfig/
├── src/
│   ├── index.js                  # روتر اصلی Cloudflare Worker & Pages + محافظ ضد Error 1101
│   ├── config/
│   │   ├── defaults.js           # تمام ۳۱ تنظیم پیش‌فرض کد اصلی CFnew v3.1 + ثابت‌های miliconfig
│   │   └── presets.js            # ۵ پریست ساخت سریع کاربر (ایران پرسرعت، مصرف سنگین، بین‌المللی و...)
│   ├── db/
│   │   └── d1.js                 # لایه دیتابیس Cloudflare D1 با Auto-Migration و تشخیص هوشمند بایندینگ
│   ├── core/
│   │   ├── runtime.js            # هسته پروکسی VLESS + Trojan + xhttp + SOCKS5/HTTP + احراز هویت چندکاربره D1
│   │   └── utils.js              # نام‌گذار نودها (number+miliconfig)، رمزنگاری MD5/SHA224 خالص و ابزارها
│   ├── subscription/
│   │   ├── generator.js          # تولیدکننده ساب‌لینک چندکاربره با اعمال subNodeCount
│   │   └── converters.js         # مبدل‌های داخلی Clash YAML، Sing-box JSON، Surge، Loon، QuanX و زنجیره خانگی
│   ├── api/
│   │   └── handlers.js           # اندپوینت‌های REST API مدیریت کاربران، تنظیمات و نودها
│   └── ui/
│       ├── icons.js              # لوگوهای نئونی سپر و ابر miliconfig
│       ├── loginHtml.js          # درگاه ورود
│       ├── adminHtml.js          # پنل مدیریت کامل مطابق تصاویر ارسالی
│       └── statusHtml.js         # صفحه وضعیت اختصاصی کاربر برای ارسال به مشتری
├── scripts/
│   ├── build.js                  # باندلر ماژولار و سازگارکننده خودکار Workers / Pages
│   ├── obfuscate.js              # مبهم‌ساز پیشرفته ایمن برای کلودفلر (بدون خطای 1101)
│   └── test-worker.js            # تست خودکار کامل
├── migrations/
│   └── 0001_init_miliconfig.sql  # فایل مایگریشن استاندارد D1
├── schema.sql                    # اسکیمای SQL دیتابیس D1
├── wrangler.toml                 # تنظیمات استقرار مستقیم Cloudflare
└── package.json
```

---

## English Overview

**miliconfig v3.1** is a modular, multi-user Cloudflare Workers & Pages proxy control center powered by **Cloudflare D1** and built on top of the complete **CFnew v3.1** engine (VLESS, Trojan, xhttp, ECH, SOCKS5/HTTP outbound proxy, Residential Chain, and built-in Clash/Sing-box/Surge/QuanX/Loon converters).
- **Brand & Node Naming**: All client subscription nodes are named `1+miliconfig`, `2+miliconfig`, ..., `N+miliconfig`.
- **Per-User Node Count & Full Defaults**: Every user created via D1 inherits all 31 default settings of the base engine plus custom `username` and `subNodeCount`.
- **Zero-Error D1 & 1101 Protection**: Automatic D1 binding detection, runtime table auto-migration, and Worker-safe AST obfuscation.
