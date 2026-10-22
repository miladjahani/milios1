// ============================================================================
// miliconfig v3.1 - استخر منابع زنده اسکنر (پروکسی‌های کشوری، لیست‌های عمومی و رنج‌های IP)
// همه لیست‌ها هر بار به‌صورت زنده خوانده می‌شوند (بدون کش سمت سرور) و اسکنر
// از هر استخر یک برش چرخشی برمی‌دارد تا سقف subrequest کلادفلر رعایت شود.
// ============================================================================

const ZEUS_VIP = code => `https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/${code}.txt`;
const TRIO = (code, kind) => `https://raw.githubusercontent.com/trio666/proxy-checker/main/country/${code}/${kind}.txt`;

// منابع اختصاصی هر کشور (Z-E-U-S vip + trio666 کشوری)
export const COUNTRY_EXTRA_PROXY_SOURCES = {
  AE: [ZEUS_VIP('AE')],
  BG: [ZEUS_VIP('BG')],
  CA: [ZEUS_VIP('CA')],
  DE: [ZEUS_VIP('DE'), TRIO('DE', 'socks5'), TRIO('DE', 'http')],
  GB: [ZEUS_VIP('GB')],
  IT: [ZEUS_VIP('IT')],
  KZ: [ZEUS_VIP('KZ')],
  LV: [ZEUS_VIP('LV')],
  NL: [ZEUS_VIP('NL'), TRIO('NL', 'socks5'), TRIO('NL', 'http')],
  NO: [ZEUS_VIP('NO')],
  SE: [ZEUS_VIP('SE')],
  TH: [ZEUS_VIP('TH'), TRIO('TH', 'socks5'), TRIO('TH', 'http')],
  TR: [ZEUS_VIP('TR'), 'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/TR.txt'],
  US: [ZEUS_VIP('US'), TRIO('US', 'socks5'), TRIO('US', 'http')],
  UZ: [ZEUS_VIP('UZ')],
  FR: ['https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/FR.txt'],
  FI: [TRIO('FI', 'socks5'), TRIO('FI', 'http')],
  SG: [TRIO('SG', 'socks5'), TRIO('SG', 'http')],
  RU: [TRIO('RU', 'socks5'), TRIO('RU', 'http'), 'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/RU.txt'],
  CN: [TRIO('CN', 'socks5'), TRIO('CN', 'http')],
  CH: [TRIO('CH', 'socks5'), TRIO('CH', 'http')],
  KR: [TRIO('KR', 'socks5'), TRIO('KR', 'http')],
  UA: [TRIO('UA', 'socks5'), TRIO('UA', 'http')],
  VN: [TRIO('VN', 'socks5'), TRIO('VN', 'http')],
  BR: [TRIO('BR', 'socks5'), TRIO('BR', 'http')],
  IN: [TRIO('IN', 'socks5'), TRIO('IN', 'http')],
  RS: [TRIO('RS', 'socks5'), TRIO('RS', 'http')],
  SK: [TRIO('SK', 'socks5'), TRIO('SK', 'http')]
};

export const COUNTRY_META = {
  AE: { name: 'امارات متحده عربی', flag: '🇦🇪' },
  BG: { name: 'بلغارستان', flag: '🇧🇬' },
  CA: { name: 'کانادا', flag: '🇨🇦' },
  DE: { name: 'آلمان', flag: '🇩🇪' },
  GB: { name: 'بریتانیا', flag: '🇬🇧' },
  IT: { name: 'ایتالیا', flag: '🇮🇹' },
  KZ: { name: 'قزاقستان', flag: '🇰🇿' },
  LV: { name: 'لتونی', flag: '🇱🇻' },
  NL: { name: 'هلند', flag: '🇳🇱' },
  NO: { name: 'نروژ', flag: '🇳🇴' },
  SE: { name: 'سوئد', flag: '🇸🇪' },
  TH: { name: 'تایلند', flag: '🇹🇭' },
  TR: { name: 'ترکیه', flag: '🇹🇷' },
  US: { name: 'ایالات متحده آمریکا', flag: '🇺🇸' },
  UZ: { name: 'ازبکستان', flag: '🇺🇿' },
  FR: { name: 'فرانسه', flag: '🇫🇷' },
  FI: { name: 'فنلاند', flag: '🇫🇮' },
  SG: { name: 'سنگاپور', flag: '🇸🇬' },
  RU: { name: 'روسیه', flag: '🇷🇺' },
  CN: { name: 'چین', flag: '🇨🇳' },
  CH: { name: 'سوئیس', flag: '🇨🇭' },
  KR: { name: 'کره‌جنوبی', flag: '🇰🇷' },
  UA: { name: 'اوکراین', flag: '🇺🇦' },
  VN: { name: 'ویتنام', flag: '🇻🇳' },
  BR: { name: 'برزیل', flag: '🇧🇷' },
  IN: { name: 'هند', flag: '🇮🇳' },
  RS: { name: 'صربستان', flag: '🇷🇸' },
  SK: { name: 'اسلواکی', flag: '🇸🇰' }
};

// لیست‌های عمومی SOCKS5 (هر بار زنده، برش چرخشی)
export const GLOBAL_SOCKS5_SOURCES = [
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/socks5.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_geolocation/socks5.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_geolocation_anonymous/socks5.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/socks5.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_anonymous/socks5.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_geolocation/socks5.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_geolocation_anonymous/socks5.txt',
  'https://raw.githubusercontent.com/zloi-user/hideip.me/main/socks5.txt',
  'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/socks5.txt',
  'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt',
  'https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5.txt',
  'https://raw.githubusercontent.com/Noctiro/getproxy/master/file/socks5.txt',
  'https://raw.githubusercontent.com/Noctiro/getproxy/master/file/socks5_with_protocol.txt',
  'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5_RAW.txt',
  'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5.txt',
  'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/generated/socks5_proxies.txt',
  'https://sunny9577.github.io/proxy-scraper/generated/socks5_proxies.txt',
  'https://raw.githubusercontent.com/trio666/proxy-checker/main/socks5.txt',
  'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt',
  'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/socks5/data.txt',
  'https://raw.githubusercontent.com/ikimono-afk/proxy-api/main/proxies/socks5.txt',
  'https://raw.githubusercontent.com/ikimono-afk/proxy-api/main/proxies_anonymous/socks5.txt',
  'https://raw.githubusercontent.com/ikimono-afk/proxy-api/main/proxies_geolocation/socks5.txt',
  'https://raw.githubusercontent.com/ikimono-afk/proxy-api/main/proxies_geolocation_anonymous/socks5.txt',
  'https://raw.githubusercontent.com/ProxyScraper/ProxyScraper/main/socks5.txt',
  'https://raw.githubusercontent.com/r00tee/Proxy-List/main/Socks5.txt',
  'https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies-socks5.txt',
  'https://raw.githubusercontent.com/iplocate/free-proxy-list/main/protocols/socks5.txt',
  'https://raw.githubusercontent.com/officialputuid/KangProxy/main/socks5/socks5.txt',
  'https://raw.githubusercontent.com/karimi-mohammad/SOCKS5-Proxy-Checker/main/socks5.txt',
  'https://raw.githubusercontent.com/FosterG4/proxy-list/main/socks5.txt',
  'https://raw.githubusercontent.com/yosephplex/proxy-updater/main/proxies/socks5.txt',
  'https://raw.githubusercontent.com/readloud/clauneck/main/PROXY-List/socks5.txt',
  'https://raw.githubusercontent.com/ItzRazvyy/ProxyList/main/socks5.txt',
  'https://raw.githubusercontent.com/i-am-unbekannt/BLITZPROXY/main/out-files/socks5.txt',
  'https://raw.githubusercontent.com/caedencode/proxy-list/main/socks5.txt',
  'https://raw.githubusercontent.com/ProxyListt/PROXY-list/main/socks5.txt',
  'https://raw.githubusercontent.com/Daniel3356/Proxy_Full-list/main/socks5.txt',
  'https://raw.githubusercontent.com/proxygenerator1/ProxyGenerator/main/MostStable/socks5.txt',
  'https://raw.githubusercontent.com/proxygenerator1/ProxyGenerator/main/Stable/socks5.txt'
];

// لیست‌های عمومی HTTP/HTTPS
export const GLOBAL_HTTP_SOURCES = [
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/http.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_geolocation/http.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_geolocation_anonymous/http.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/http.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_anonymous/http.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_geolocation/http.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_geolocation_anonymous/http.txt',
  'https://raw.githubusercontent.com/zloi-user/hideip.me/main/http.txt',
  'https://raw.githubusercontent.com/zloi-user/hideip.me/main/https.txt',
  'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt',
  'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/https.txt',
  'https://raw.githubusercontent.com/Vadim287/free-proxy/main/proxies/http.txt',
  'https://raw.githubusercontent.com/Vadim287/free-proxy/main/proxies/https.txt',
  'https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/http.txt',
  'https://raw.githubusercontent.com/Noctiro/getproxy/master/file/http.txt',
  'https://raw.githubusercontent.com/Noctiro/getproxy/master/file/https.txt',
  'https://raw.githubusercontent.com/Noctiro/getproxy/master/file/http_with_protocol.txt',
  'https://raw.githubusercontent.com/Noctiro/getproxy/master/file/https_with_protocol.txt',
  'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt',
  'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS.txt',
  'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/generated/http_proxies.txt',
  'https://sunny9577.github.io/proxy-scraper/generated/http_proxies.txt',
  'https://raw.githubusercontent.com/trio666/proxy-checker/main/http.txt',
  'https://raw.githubusercontent.com/trio666/proxy-checker/main/https.txt',
  'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
  'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt',
  'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/https/data.txt',
  'https://raw.githubusercontent.com/ikimono-afk/proxy-api/main/proxies/http.txt',
  'https://raw.githubusercontent.com/ikimono-afk/proxy-api/main/proxies_anonymous/http.txt',
  'https://raw.githubusercontent.com/ikimono-afk/proxy-api/main/proxies_geolocation/http.txt',
  'https://raw.githubusercontent.com/ikimono-afk/proxy-api/main/proxies_geolocation_anonymous/http.txt',
  'https://raw.githubusercontent.com/ProxyScraper/ProxyScraper/main/http.txt',
  'https://raw.githubusercontent.com/r00tee/Proxy-List/main/Https.txt',
  'https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies-http.txt',
  'https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies-https.txt',
  'https://raw.githubusercontent.com/iplocate/free-proxy-list/main/protocols/http.txt',
  'https://raw.githubusercontent.com/iplocate/free-proxy-list/main/protocols/https.txt',
  'https://raw.githubusercontent.com/officialputuid/KangProxy/main/http/http.txt',
  'https://raw.githubusercontent.com/officialputuid/KangProxy/main/https/https.txt',
  'https://raw.githubusercontent.com/elliottophellia/yakumo/master/results/http/global/http_checked.txt',
  'https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/http.txt',
  'https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/https.txt',
  'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt',
  'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/https_proxies.txt',
  'https://raw.githubusercontent.com/dpangestuw/Free-Proxy/main/http_proxies.txt',
  'https://raw.githubusercontent.com/Tsprnay/Proxy-lists/master/proxies/http.txt',
  'https://raw.githubusercontent.com/Tsprnay/Proxy-lists/master/proxies/https.txt',
  'https://raw.githubusercontent.com/mzyui/proxy-list/main/http.txt',
  'https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/http.txt',
  'https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/https.txt',
  'https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/http.txt',
  'https://raw.githubusercontent.com/Skillter/ProxyGather/master/proxies/working-proxies-http.txt',
  'https://raw.githubusercontent.com/SevenworksDev/proxy-list/main/proxies/http.txt',
  'https://raw.githubusercontent.com/SevenworksDev/proxy-list/main/proxies/https.txt',
  'https://raw.githubusercontent.com/Vann-Dev/proxy-list/main/proxies/http.txt',
  'https://raw.githubusercontent.com/Vann-Dev/proxy-list/main/proxies/https.txt',
  'https://raw.githubusercontent.com/TuanMinPay/live-proxy/master/http.txt',
  'https://raw.githubusercontent.com/vmheaven/VMHeaven-Free-Proxy-Updated/main/http.txt',
  'https://raw.githubusercontent.com/vmheaven/VMHeaven-Free-Proxy-Updated/main/https.txt',
  'https://raw.githubusercontent.com/yosephplex/proxy-updater/main/proxies/http.txt',
  'https://raw.githubusercontent.com/readloud/clauneck/main/PROXY-List/http.txt',
  'https://raw.githubusercontent.com/ItzRazvyy/ProxyList/main/http.txt',
  'https://raw.githubusercontent.com/i-am-unbekannt/BLITZPROXY/main/out-files/http.txt',
  'https://raw.githubusercontent.com/caedencode/proxy-list/main/http.txt',
  'https://raw.githubusercontent.com/ProxyListt/PROXY-list/main/http.txt',
  'https://raw.githubusercontent.com/Daniel3356/Proxy_Full-list/main/http.txt',
  'https://raw.githubusercontent.com/proxygenerator1/ProxyGenerator/main/MostStable/http.txt',
  'https://raw.githubusercontent.com/proxygenerator1/ProxyGenerator/main/Stable/http.txt'
];

// لیست‌های مسکونی (residential) — به‌عنوان استخر مکمل
export const RESIDENTIAL_SOURCES = [
  'https://raw.githubusercontent.com/shadowsock/proxy-lists/main/residential.txt',
  'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/types/residential/data.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/types/residential.txt',
  'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_types/residential.txt',
  'https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/residential.txt',
  'https://raw.githubusercontent.com/parser-free/proxy-list/main/residential/proxy.txt',
  'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/residential.txt'
];

// لیست‌های آی‌پی/دامنه ثابت کلادفلر (هر خط یک آدرس) — نمونه‌گیری زنده برای yx
// منبع Z-E-U-S شامل هزاران آی‌پی فرانت‌شده کلادفلر است که به‌عنوان آدرس نود پاسخ می‌دهند.
export const IP_CANDIDATE_SOURCES = [
  'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/ips.txt',
  // dimzon publishes its CF address lists as cf.lst / all-sort.txt (the plain
  // ipv6.txt and any.txt paths from older guides return 404).
  'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/cf.lst',
  'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/all-sort.txt'
];

// لیست‌های ترکیبی (هم SOCKS5 و هم HTTP در یک فایل) — فقط برای اسکنر/اسنپ‌شات زنده
// استفاده می‌شوند و در ساخت yx به‌عنوان آدرس نود به کار نمی‌روند.
export const MIXED_PROXY_SOURCES = [
  'https://raw.githubusercontent.com/proxygenerator1/ProxyGenerator/main/MostStable/ALL.txt',
  'https://raw.githubusercontent.com/proxygenerator1/ProxyGenerator/main/Stable/ALL.txt',
  'https://raw.githubusercontent.com/proxygenerator1/ProxyGenerator/main/ALL/all.json'
];



// رنج‌های IPv4/IPv6 کلادفلر برای تست و انتخاب آی‌پی ثابت
export const IP_RANGE_SOURCES = {
  ipv4: [
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/cloudflare/ipv4.txt',
    'https://raw.githubusercontent.com/mrkhachaturov/ipranges/main/cloudflare/ipv4.txt'
  ],
  ipv6: [
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/cloudflare/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/cloudflare/ipv6_merged.txt',
    'https://raw.githubusercontent.com/mrkhachaturov/ipranges/main/cloudflare/ipv6.txt',
    'https://raw.githubusercontent.com/mrkhachaturov/ipranges/main/cloudflare/ipv6_merged.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/telegram/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/telegram/ipv6_merged.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/google/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/google/ipv6_merged.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/apple-proxy/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/apple-proxy/ipv6_merged.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/microsoft/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/microsoft/ipv6_merged.txt',
    'https://raw.githubusercontent.com/XIU2/CloudflareSpeedTest/master/ipv6.txt'
  ],
  // رنج‌های IPv6 سایر ارائه‌دهندگان (برای تست دستی/پیشرفته)
  extraIpv6: [
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/all/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/apple-proxy/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/digitalocean/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/linode/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/vultr/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/oracle/ipv6.txt',
    'https://raw.githubusercontent.com/lord-alfred/ipranges/main/amazon/ipv6.txt',
    'https://raw.githubusercontent.com/mrkhachaturov/ipranges/main/all/ipv6.txt',
    'https://raw.githubusercontent.com/dibdot/DoH-IP-blocklists/master/doh-ipv6.txt',
    'https://raw.githubusercontent.com/oneoffdallas/dohservers/master/ipv6list.txt'
  ]
};

// ============================================================================
// Source catalog — یک ثبت ماژولار برای همهٔ لیست‌های زنده
// دسته‌هایی که `appliesToYx: true` دارند، استخر ساخت yx (نودهای ترجیحی CFnew)
// را می‌سازند و می‌توان آن‌ها را دستی یا با اتوماسیون اعمال کرد. بقیهٔ دسته‌ها
// ورودی اسکنر/جستجوی زنده‌اند. شناسهٔ هر منبع ثابت است تا وضعیت هر منبع را
// بتوان در پنل و در گزارش اتوماسیون ذخیره کرد.
// ============================================================================

export const SOURCE_CATEGORIES = [
  { id: 'cf-vip', label: 'CF VIP کشوری (Z-E-U-S)', labelEn: 'CF VIP per country', kind: 'proxy', appliesToYx: false },
  { id: 'socks5', label: 'SOCKS5 عمومی', labelEn: 'Public SOCKS5', kind: 'proxy', appliesToYx: false },
  { id: 'http', label: 'HTTP/HTTPS عمومی', labelEn: 'Public HTTP/HTTPS', kind: 'proxy', appliesToYx: false },
  { id: 'mixed', label: 'لیست ترکیبی (ALL)', labelEn: 'Mixed (ALL)', kind: 'proxy', appliesToYx: false },
  { id: 'residential', label: 'پروکسی مسکونی', labelEn: 'Residential', kind: 'proxy', appliesToYx: false },
  { id: 'cf-ip', label: 'آی‌پی/دامنهٔ فرانت‌شدهٔ CF', labelEn: 'CF-fronted IPs', kind: 'address', appliesToYx: true, family: 'any' },
  { id: 'ipv6-range', label: 'رنج IPv6', labelEn: 'IPv6 ranges', kind: 'range', appliesToYx: false, family: 'ipv6' },
  { id: 'ip-range', label: 'رنج IPv4', labelEn: 'IPv4 ranges', kind: 'range', appliesToYx: false, family: 'ipv4' }
];

const SOURCE_CATEGORY_BY_ID = new Map(SOURCE_CATEGORIES.map(category => [category.id, category]));

function labelForUrl(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const file = parts[parts.length - 1] || 'list';
    const repo = parts[1] || new URL(url).hostname;
    return `${repo}/${file}`;
  } catch (_e) {
    return String(url || '');
  }
}

function entriesFor(categoryId, items = []) {
  const category = SOURCE_CATEGORY_BY_ID.get(categoryId);
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const url = typeof item === 'string' ? item : item.url;
    const labelPrefix = typeof item === 'string' ? '' : String(item.labelPrefix || '').trim();
    return {
      id: `${categoryId}-${index + 1}`,
      category: categoryId,
      kind: category?.kind || 'proxy',
      family: category?.family || 'any',
      label: labelPrefix ? `${labelPrefix} · ${labelForUrl(url)}` : labelForUrl(url),
      url
    };
  });
}

// Ids are unique per category, so country lists are flattened first.
const COUNTRY_ENTRIES = entriesFor(
  'cf-vip',
  Object.entries(COUNTRY_EXTRA_PROXY_SOURCES).flatMap(([code, urls]) =>
    (urls || []).map(url => ({ url, labelPrefix: `${COUNTRY_META[code]?.flag || ''} ${code}`.trim() }))
  )
);

export const SOURCE_CATALOG = [
  ...COUNTRY_ENTRIES,
  ...entriesFor('socks5', GLOBAL_SOCKS5_SOURCES),
  ...entriesFor('http', GLOBAL_HTTP_SOURCES),
  ...entriesFor('mixed', MIXED_PROXY_SOURCES),
  ...entriesFor('residential', RESIDENTIAL_SOURCES),
  ...entriesFor('cf-ip', IP_CANDIDATE_SOURCES),
  ...entriesFor('ipv6-range', [...IP_RANGE_SOURCES.ipv6, ...(IP_RANGE_SOURCES.extraIpv6 || [])]),
  ...entriesFor('ip-range', IP_RANGE_SOURCES.ipv4)
];

export const SOURCE_CATALOG_BY_ID = new Map(SOURCE_CATALOG.map(entry => [entry.id, entry]));

export const SOURCE_COUNTS = SOURCE_CATEGORIES.reduce((counts, category) => {
  counts[category.id] = SOURCE_CATALOG.filter(entry => entry.category === category.id).length;
  return counts;
}, {});

export function getSourcesByCategory(categoryId) {
  return SOURCE_CATALOG.filter(entry => entry.category === categoryId);
}

/**
 * Resolve a request for sources into catalog entries.
 * @param {{ids?: string[], categories?: string[]}} selector
 */
export function resolveSourceEntries(selector = {}) {
  const ids = Array.isArray(selector.ids) ? selector.ids.filter(Boolean) : [];
  const categories = Array.isArray(selector.categories) ? selector.categories.filter(Boolean) : [];
  if (!ids.length && !categories.length) return SOURCE_CATALOG.slice();
  return SOURCE_CATALOG.filter(entry => ids.includes(entry.id) || categories.includes(entry.category));
}

export const CFNEW_CATEGORIES = SOURCE_CATEGORIES.filter(category => category.appliesToYx).map(category => category.id);
