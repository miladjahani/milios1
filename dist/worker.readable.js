import { connect, connect as cfConnect } from 'cloudflare:sockets';

// --- MODULE: src/config/sources.js ---
// ============================================================================
// miliconfig v3.1 - استخر منابع زنده اسکنر (پروکسی‌های کشوری، لیست‌های عمومی و رنج‌های IP)
// همه لیست‌ها هر بار به‌صورت زنده خوانده می‌شوند (بدون کش سمت سرور) و اسکنر
// از هر استخر یک برش چرخشی برمی‌دارد تا سقف subrequest کلادفلر رعایت شود.
// ============================================================================

const ZEUS_VIP = code => `https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/${code}.txt`;
const TRIO = (code, kind) => `https://raw.githubusercontent.com/trio666/proxy-checker/main/country/${code}/${kind}.txt`;

// منابع اختصاصی هر کشور (Z-E-U-S vip + trio666 کشوری)
const COUNTRY_EXTRA_PROXY_SOURCES = {
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
  TR: [ZEUS_VIP('TR')],
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

const COUNTRY_META = {
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
const GLOBAL_SOCKS5_SOURCES = [
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
const GLOBAL_HTTP_SOURCES = [
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
const RESIDENTIAL_SOURCES = [
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
const IP_CANDIDATE_SOURCES = [
  'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/ips.txt'
];

// رنج‌های IPv4/IPv6 کلادفلر برای تست و انتخاب آی‌پی ثابت
const IP_RANGE_SOURCES = {
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


// --- MODULE: src/config/defaults.js ---
// ============================================================================
// miliconfig v3.1 - تنظیمات پیش‌فرض پایه (الهام‌گرفته از Z-E-U-S و CFnew)
// مجهز به شادوساکس، فرگمنت، ECH، لیست‌های کشوری، قفل ۳ کاربر و چرخش خودکار آی‌پی
// ============================================================================


const BRAND_NAME = 'miliconfig';
const BRAND_UPPER = 'MILICONFIG';
const VERSION = 'v4.0';
const DEFAULT_ADMIN_UUID = '351c9981-04b6-4103-aa4b-864aa9c91469';
const MAX_USERS_LIMIT = 5;
const TELEGRAM_SUPPORT = '@miliconfig';

// ۳ نود هاردکدشده اطلاع‌رسانی که باید در ابتدای تمام سابلینک‌ها قرار گیرند
const HARDCODED_INFO_NODES = [
  'vless://00000000-0000-0000-0000-000000000000@127.0.0.1:443?encryption=none&security=none&type=ws#%DB%B1.%20%D9%85%DB%8C%D9%84%DB%8C%20%D8%B1%D8%A7%DB%8C%DA%AF%D8%A7%D9%86%20%D8%A7%D8%B3%D8%AA',
  'vless://00000000-0000-0000-0000-000000000000@127.0.0.1:443?encryption=none&security=none&type=ws#%DB%B2.%20%D9%81%D8%B1%D9%88%D8%B4%20%D8%A7%DB%8C%D9%86%20%DA%A9%D8%A7%D9%86%D9%81%DB%8C%DA%AF%20%D9%87%D8%A7%20%D8%AD%D8%B1%D8%A7%D9%85%20%D8%A7%D8%B3%D8%AA',
  'vless://00000000-0000-0000-0000-000000000000@127.0.0.1:443?encryption=none&security=none&type=ws#%DB%B3.%20%D8%A8%D9%87%20%D8%B7%D9%88%D8%B1%20%D8%B4%D8%AE%D8%B5%DB%8C%20%D8%A7%D8%B3%D8%AA%D9%81%D8%A7%D8%AF%D9%87%20%DA%A9%D9%86%DB%8C%D8%AF'
];

const CONFIG_DEFAULTS = {
  wk: '',
  ev: 'yes',
  et: 'yes',
  ex: 'yes',
  es: 'yes', // شادوساکس (Shadowsocks) — طبق درخواست همیشه در سابلینک حاضر است
  sspass: '',
  // هسته این ورکر هدر Shadowsocks را به‌صورت متنی (بدون AEAD) می‌خواند، بنابراین تنها متد سازگار «none» است
  ssmethod: 'none',
  ech: 'no',
  tp: '',
  customDNS: 'https://223.5.5.5/dns-query',
  customECHDomain: 'cloudflare-ech.com',
  alpn: '',
  d: 'admin', // آدرس ثابت پنل: /admin (قابل تغییر از تنظیمات)
  p: '',
  yx: '',
  yxURL: '',
  s: '',
  homepage: 'https://nginx.com',
  scu: 'https://url.v1.mk/sub',
  ena: 'no',
  epd: 'yes',
  epi: 'yes',
  egi: 'yes',
  ae: '',
  rm: '',
  qj: '',
  dkby: 'no',
  yxby: '',
  ipv4: 'yes',
  ipv6: 'yes',
  ispMobile: 'yes',
  ispUnicom: 'yes',
  ispTelecom: 'yes',
  jk: 'no',
  subNodeCount: 50,
  brand: BRAND_NAME,
  // تنظیمات جدید الهام‌گرفته از ZEUS:
  fp: 'chrome', // فینگرپرینت: chrome, firefox, safari, edge, ios, randomized
  patt: '/?ed=2048', // الگوهای مسیر
  fragmentPreset: 'mci', // پریست‌های فرگمنت
  fragmentLength: '100-200',
  fragmentInterval: '10-20',
  fragmentPackets: 'tlshello',
  ipRotation: 'off', // چرخش خودکار آی‌پی: off | 5m | 15m | 1h | 24h
  locationNodeCount: 8, // تعداد نود چندلوکیشن که در ساب‌لینک کشوری ساخته می‌شود
  frag: 'yes', // کلید روشن/خاموش فرگمنت (شادوساکس فرگمنت ندارد)
  ports: '443,2053,2087,8443', // پورت‌های نودهای ساب‌لینک (لیست جداشده با کاما)
  adminPasswordHash: '', // هش رمز عبور مدیر
  supportChannel: TELEGRAM_SUPPORT
};

const BOOLEAN_CONFIG_KEYS = [
  'ev', 'et', 'ex', 'es', 'ech', 'ena', 'epd', 'epi', 'egi',
  'ipv4', 'ipv6', 'ispMobile', 'ispUnicom', 'ispTelecom', 'jk', 'frag'
];

const ENV_KEY_MAPPING = {
  wk: ['wk', 'WK'],
  ev: ['ev', 'EV'],
  et: ['et', 'ET'],
  ex: ['ex', 'EX'],
  es: ['es', 'ES', 'SS', 'ss'],
  sspass: ['sspass', 'SSPASS', 'SS_PASSWORD'],
  ssmethod: ['ssmethod', 'SSMETHOD', 'SS_METHOD'],
  ech: ['ech', 'ECH'],
  tp: ['tp', 'TP'],
  customDNS: ['customDNS', 'CUSTOMDNS', 'CUSTOM_DNS'],
  customECHDomain: ['customECHDomain', 'CUSTOMECHDOMAIN', 'CUSTOM_ECH_DOMAIN'],
  alpn: ['alpn', 'ALPN'],
  d: ['d', 'D'],
  p: ['p', 'P'],
  yx: ['yx', 'YX'],
  yxURL: ['yxURL', 'YXURL', 'YX_URL'],
  s: ['s', 'S'],
  homepage: ['homepage', 'HOMEPAGE'],
  scu: ['scu', 'SCU'],
  ena: ['ena', 'ENA'],
  epd: ['epd', 'EPD'],
  epi: ['epi', 'EPI'],
  egi: ['egi', 'EGI'],
  ae: ['ae', 'AE'],
  rm: ['rm', 'RM'],
  qj: ['qj', 'QJ'],
  dkby: ['dkby', 'DKBY'],
  yxby: ['yxby', 'YXBY'],
  ipv4: ['ipv4', 'IPV4'],
  ipv6: ['ipv6', 'IPV6'],
  ispMobile: ['ispMobile', 'ISPMOBILE', 'ISP_MOBILE'],
  ispUnicom: ['ispUnicom', 'ISPUNICOM', 'ISP_UNICOM'],
  ispTelecom: ['ispTelecom', 'ISPTELECOM', 'ISP_TELECOM'],
  jk: ['jk', 'JK'],
  subNodeCount: ['subNodeCount', 'SUB_NODE_COUNT', 'nodeCount', 'NODE_COUNT'],
  fp: ['fp', 'FP', 'FINGERPRINT'],
  patt: ['patt', 'PATT', 'PATH_PATTERN'],
  fragmentPreset: ['fragmentPreset', 'FRAGMENT_PRESET'],
  frag: ['frag', 'FRAG', 'FRAGMENT_ENABLED'],
  ports: ['ports', 'PORTS', 'NODE_PORTS'],
  ipRotation: ['ipRotation', 'IP_ROTATION', 'ROTATION_MINUTES'],
  locationNodeCount: ['locationNodeCount', 'LOCATION_NODE_COUNT']
};

const FRAGMENT_PRESETS = {
  'off': { name: 'غیرفعال', length: '', interval: '', packets: '' },
  'mci': { name: 'همراه اول (MCI)', length: '100-200', interval: '10-20', packets: 'tlshello' },
  'irancell': { name: 'ایرانسل (MTN Irancell)', length: '50-100', interval: '5-10', packets: 'tlshello' },
  'rightel': { name: 'مخابرات و رایتل (Rightel / TCI)', length: '1-3', interval: '1-5', packets: '1-1' },
  'anti-dpi': { name: 'ضد فیلترینگ شدید (Anti-DPI)', length: '10-30', interval: '20-40', packets: 'tlshello' },
  'custom': { name: 'سفارشی (Custom)', length: '100-200', interval: '10-20', packets: 'tlshello' }
};

const FINGERPRINT_PRESETS = [
  { id: 'chrome', name: 'Chrome (پیشنهادی)' },
  { id: 'firefox', name: 'Firefox' },
  { id: 'safari', name: 'Safari (iOS/macOS)' },
  { id: 'edge', name: 'Microsoft Edge' },
  { id: 'ios', name: 'iOS Device' },
  { id: 'randomized', name: 'Randomized (تصادفی)' }
];

const ECH_DOMAINS = [
  'cloudflare-ech.com',
  'crypto.cloudflare.com',
  'cloudflare-dns.com',
  'cloudflare.com',
  'deflect.ca',
  'one.one.one.one',
  'mozilla.cloudflare-dns.com',
  'cloudflare-ech.net'
];

// لیست آماده DNS (DoH) برای انتخاب در پنل — مقدار نهایی در پارامتر dns نودها می‌نشیند
const DNS_PRESETS = [
  { id: 'cloudflare', name: 'Cloudflare (1.1.1.1)', value: 'https://1.1.1.1/dns-query' },
  { id: 'cloudflare-alt', name: 'Cloudflare (223.5.5.5)', value: 'https://223.5.5.5/dns-query' },
  { id: 'google', name: 'Google (8.8.8.8)', value: 'https://8.8.8.8/dns-query' },
  { id: 'quad9', name: 'Quad9 (9.9.9.9)', value: 'https://9.9.9.9/dns-query' },
  { id: 'opendns', name: 'OpenDNS (208.67.222.222)', value: 'https://208.67.222.222/dns-query' },
  { id: 'shecan', name: 'شکن (178.22.122.100)', value: 'https://178.22.122.100/dns-query' },
  { id: 'radar', name: 'رادار (10.202.10.10)', value: 'https://10.202.10.10/dns-query' },
  { id: 'begzar', name: 'بگذر (185.55.226.26)', value: 'https://185.55.226.26/dns-query' },
  { id: 'adguard', name: 'AdGuard (94.140.14.14)', value: 'https://94.140.14.14/dns-query' },
  { id: 'nextdns', name: 'NextDNS (45.90.28.0)', value: 'https://45.90.28.0/dns-query' },
  { id: 'iranserver', name: 'ایران‌سرور (172.29.2.100)', value: 'https://172.29.2.100/dns-query' },
  { id: 'electrotm', name: 'الکترو (78.157.42.101)', value: 'https://78.157.42.101/dns-query' }
];

const PATH_PATTERNS = [
  { id: '/?ed=2048', name: 'استاندارد (/?ed=2048)' },
  { id: '/?ed=2560', name: 'حجم بزرگ (/?ed=2560)' },
  { id: '/mili/{random}?ed=2048', name: 'مسیر رندوم (/mili/{random}?ed=2048)' },
  { id: '/api/v1/stream', name: 'استتار API (/api/v1/stream)' },
  { id: '/grpc', name: 'gRPC مسیر (/grpc)' },
  { id: '/ws', name: 'وب‌سوکت ساده (/ws)' },
  { id: '/video/stream', name: 'استتار ویدیو (/video/stream)' },
  { id: '/download/file?ed=2048', name: 'استتار دانلود (/download/file)' }
];

// پورت‌های مجاز کلادفلر برای انتخاب در پنل
const CF_PORT_CHOICES = [
  { port: 443, tls: true, label: '443 (HTTPS اصلی)' },
  { port: 2053, tls: true, label: '2053 (HTTPS)' },
  { port: 2083, tls: true, label: '2083 (HTTPS)' },
  { port: 2087, tls: true, label: '2087 (HTTPS)' },
  { port: 2096, tls: true, label: '2096 (HTTPS)' },
  { port: 8443, tls: true, label: '8443 (HTTPS)' },
  { port: 80, tls: false, label: '80 (HTTP)' },
  { port: 8080, tls: false, label: '8080 (HTTP)' },
  { port: 8880, tls: false, label: '8880 (HTTP)' },
  { port: 2052, tls: false, label: '2052 (HTTP)' },
  { port: 2082, tls: false, label: '2082 (HTTP)' },
  { port: 2086, tls: false, label: '2086 (HTTP)' },
  { port: 2095, tls: false, label: '2095 (HTTP)' }
];

function parseNodePorts(value = '') {
  const source = String(value || '').trim() || CONFIG_DEFAULTS.ports;
  const seen = new Set();
  const list = [];
  for (const chunk of source.split(/[,\s]+/)) {
    const port = parseInt(chunk, 10);
    if (!Number.isFinite(port) || port < 1 || port > 65535 || seen.has(port)) continue;
    seen.add(port);
    list.push(port);
  }
  return list.length ? list : [443];
}

// لیست پروکسی‌های کشوری VIP (پایه؛ در انتها با منابع زنده اسکنر ادغام می‌شود)
const BASE_COUNTRY_PROXY_SOURCES = {
  'DE': {
    name: 'آلمان',
    flag: '🇩🇪',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/DE.txt',
      'https://raw.githubusercontent.com/trio666/proxy-checker/main/country/DE/socks5.txt',
      'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/DE.txt'
    ]
  },
  'NL': {
    name: 'هلند',
    flag: '🇳🇱',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/NL.txt',
      'https://raw.githubusercontent.com/trio666/proxy-checker/main/country/NL/socks5.txt',
      'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/NL.txt'
    ]
  },
  'US': {
    name: 'ایالات متحده آمریکا',
    flag: '🇺🇸',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/US.txt',
      'https://raw.githubusercontent.com/trio666/proxy-checker/main/country/US/socks5.txt',
      'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/US.txt'
    ]
  },
  'GB': {
    name: 'بریتانیا / انگلستان',
    flag: '🇬🇧',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/GB.txt',
      'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/GB.txt'
    ]
  },
  'CA': {
    name: 'کانادا',
    flag: '🇨🇦',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/CA.txt'
    ]
  },
  'TR': {
    name: 'ترکیه',
    flag: '🇹🇷',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/TR.txt',
      'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/TR.txt'
    ]
  },
  'AE': {
    name: 'امارات متحده عربی',
    flag: '🇦🇪',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/AE.txt'
    ]
  },
  'FR': {
    name: 'فرانسه',
    flag: '🇫🇷',
    urls: [
      'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/FR.txt'
    ]
  },
  'FI': {
    name: 'فنلاند',
    flag: '🇫🇮',
    urls: [
      'https://raw.githubusercontent.com/trio666/proxy-checker/main/country/FI/socks5.txt',
      'https://raw.githubusercontent.com/dimzon/scaling-sniffle/main/by-country/FI.txt'
    ]
  },
  'SE': {
    name: 'سوئد',
    flag: '🇸🇪',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/SE.txt'
    ]
  },
  'NO': {
    name: 'نروژ',
    flag: '🇳🇴',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/NO.txt'
    ]
  },
  'IT': {
    name: 'ایتالیا',
    flag: '🇮🇹',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/IT.txt'
    ]
  },
  'BG': {
    name: 'بلغارستان',
    flag: '🇧🇬',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/BG.txt'
    ]
  },
  'KZ': {
    name: 'قزاقستان',
    flag: '🇰🇿',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/KZ.txt'
    ]
  },
  'LV': {
    name: 'لتونی',
    flag: '🇱🇻',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/LV.txt'
    ]
  },
  'TH': {
    name: 'تایلند',
    flag: '🇹🇭',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/TH.txt',
      'https://raw.githubusercontent.com/trio666/proxy-checker/main/country/TH/socks5.txt'
    ]
  },
  'UZ': {
    name: 'ازبکستان',
    flag: '🇺🇿',
    urls: [
      'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/proxy_vip/UZ.txt'
    ]
  },
  'SG': {
    name: 'سنگاپور',
    flag: '🇸🇬',
    urls: [
      'https://raw.githubusercontent.com/trio666/proxy-checker/main/country/SG/socks5.txt'
    ]
  }
};

// ============================================================================
// ادغام منابع پایه با منابع زنده اسکنر (Z-E-U-S + trio666 + dimzon)
// ============================================================================
const COUNTRY_PROXY_SOURCES = (() => {
  const codes = new Set([
    ...Object.keys(BASE_COUNTRY_PROXY_SOURCES),
    ...Object.keys(COUNTRY_EXTRA_PROXY_SOURCES),
    ...Object.keys(COUNTRY_META)
  ]);
  const merged = {};
  for (const code of codes) {
    const base = BASE_COUNTRY_PROXY_SOURCES[code] || {};
    const meta = COUNTRY_META[code] || {};
    const urls = [...new Set([...(base.urls || []), ...(COUNTRY_EXTRA_PROXY_SOURCES[code] || [])])];
    merged[code] = {
      name: base.name || meta.name || code,
      flag: base.flag || meta.flag || '',
      urls
    };
  }
  return merged;
})();

const GLOBAL_PROXY_SOURCES = {
  socks5: GLOBAL_SOCKS5_SOURCES,
  http: GLOBAL_HTTP_SOURCES,
  residential: RESIDENTIAL_SOURCES
};

export { IP_CANDIDATE_SOURCES, IP_RANGE_SOURCES };

const REGION_MAP = {
  CF: ['🌐 مستقیم رسمی CF', 'CF', 'Cloudflare Direct'],
  HK: ['🇭🇰 هنگ‌کنگ', 'HK', 'Hong Kong'],
  US: ['🇺🇸 آمریکا', 'US', 'United States'],
  SG: ['🇸🇬 سنگاپور', 'SG', 'Singapore'],
  JP: ['🇯🇵 ژاپن', 'JP', 'Japan'],
  KR: ['🇰🇷 کره‌جنوبی', 'KR', 'South Korea'],
  DE: ['🇩🇪 آلمان', 'DE', 'Germany'],
  SE: ['🇸🇪 سوئد', 'SE', 'Sweden'],
  NL: ['🇳🇱 هلند', 'NL', 'Netherlands'],
  FI: ['🇫🇮 فنلاند', 'FI', 'Finland'],
  GB: ['🇬🇧 بریتانیا', 'GB', 'United Kingdom'],
  CA: ['🇨🇦 کانادا', 'CA', 'Canada'],
  TR: ['🇹🇷 ترکیه', 'TR', 'Turkey'],
  FR: ['🇫🇷 فرانسه', 'FR', 'France'],
  AE: ['🇦🇪 امارات', 'AE', 'United Arab Emirates'],
  Oracle: ['☁️ Oracle', 'Oracle'],
  DigitalOcean: ['🌊 DigitalOcean', 'DigitalOcean'],
  Vultr: ['⚡ Vultr', 'Vultr'],
  Multacom: ['🏢 Multacom', 'Multacom']
};

// آی‌پی‌های ثابت (anycast) خود کلادفلر؛ این‌ها برخلاف دامنه‌های CNAME همیشه پاسخ می‌دهند
// و به‌عنوان «آی‌پی ثابت» در ابتدای نودهای ساب‌لینک قرار می‌گیرند.
const OFFICIAL_DIRECT_IPS = [
  '172.71.218.190',
  '162.158.228.87',
  '162.158.189.134',
  '162.158.26.63',
  '162.158.25.86',
  '162.158.29.216',
  '162.158.218.160',
  '162.158.227.214',
  '172.69.118.198',
  '172.69.119.150',
  '104.16.131.1',
  '104.17.0.1',
  '104.18.0.1',
  '104.19.0.1',
  '104.20.0.1',
  '104.21.0.1',
  '104.22.0.1',
  '104.24.0.1',
  '104.25.0.1',
  '104.26.0.1',
  '104.27.0.1',
  '172.64.0.1',
  '172.65.0.1',
  '172.66.0.1',
  '172.67.0.1',
  '162.159.0.1',
  '188.114.96.1',
  '188.114.97.1'
];

// آی‌پی‌های ثابت IPv6 کلادفلر (فقط وقتی IPv6 فعال باشد)
const OFFICIAL_DIRECT_IPV6 = [
  '2606:4700::6810:1',
  '2606:4700::6811:1',
  '2606:4700::6812:1',
  '2606:4700::6813:1',
  '2606:4700:10::6810:1',
  '2803:f800:50::6ca2:c001'
];

const FALLBACK_PROXY_IPS = [
  { domain: 'ProxyIP.HK.CMLiussss.net', region: 'HK', regionCode: 'HK', port: 443 },
  { domain: 'ProxyIP.US.CMLiussss.net', region: 'US', regionCode: 'US', port: 443 },
  { domain: 'ProxyIP.SG.CMLiussss.net', region: 'SG', regionCode: 'SG', port: 443 },
  { domain: 'ProxyIP.JP.CMLiussss.net', region: 'JP', regionCode: 'JP', port: 443 },
  { domain: 'ProxyIP.KR.CMLiussss.net', region: 'KR', regionCode: 'KR', port: 443 },
  { domain: 'ProxyIP.DE.CMLiussss.net', region: 'DE', regionCode: 'DE', port: 443 },
  { domain: 'ProxyIP.SE.CMLiussss.net', region: 'SE', regionCode: 'SE', port: 443 },
  { domain: 'ProxyIP.NL.CMLiussss.net', region: 'NL', regionCode: 'NL', port: 443 },
  { domain: 'ProxyIP.FI.CMLiussss.net', region: 'FI', regionCode: 'FI', port: 443 },
  { domain: 'ProxyIP.GB.CMLiussss.net', region: 'GB', regionCode: 'GB', port: 443 },
  { domain: 'ProxyIP.Oracle.cmliussss.net', region: 'Oracle', regionCode: 'Oracle', port: 443 },
  { domain: 'ProxyIP.DigitalOcean.CMLiussss.net', region: 'DigitalOcean', regionCode: 'DigitalOcean', port: 443 },
  { domain: 'ProxyIP.Vultr.CMLiussss.net', region: 'Vultr', regionCode: 'Vultr', port: 443 },
  { domain: 'ProxyIP.Multacom.CMLiussss.net', region: 'Multacom', regionCode: 'Multacom', port: 443 }
];

const DIRECT_DOMAINS = [
  { name: 'cloudflare.182682.xyz', domain: 'cloudflare.182682.xyz' },
  { name: 'speed.marisalnc.com', domain: 'speed.marisalnc.com' },
  { domain: 'freeyx.cloudflare88.eu.org' },
  { domain: 'bestcf.top' },
  { domain: 'cdn.2020111.xyz' },
  { domain: 'cfip.cfcdn.vip' },
  { domain: 'cf.0sm.com' },
  { domain: 'cf.090227.xyz' },
  { domain: 'cf.zhetengsha.eu.org' },
  { domain: 'cloudflare.9jy.cc' },
  { domain: 'cf.zerone-cdn.pp.ua' },
  { domain: 'cfip.1323123.xyz' },
  { domain: 'cnamefuckxxs.yuchen.icu' },
  { domain: 'cloudflare-ip.mofashi.ltd' },
  { domain: '115155.xyz' },
  { domain: 'cname.xirancdn.us' },
  { domain: 'f3058171cad.002404.xyz' },
  { domain: '8.889288.xyz' },
  { domain: 'cdn.tzpro.xyz' },
  { domain: 'cf.877771.xyz' },
  { domain: 'xn--b6gac.eu.org' }
];

const CF_HTTP_PORTS = [80, 8080, 8880, 2052, 2082, 2086, 2095];
const CF_HTTPS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];
const ALLOWED_ALPN = ['', 'h3', 'h2', 'http/1.1', 'h3,h2', 'h2,http/1.1', 'h3,h2,http/1.1'];
const REMOTE_CONFIG_URL = 'https://raw.githubusercontent.com/byJoey/test/refs/heads/main/tist.ini';

function isEnabledValue(val, defaultEnabled = false) {
  if (val === undefined || val === null || val === '') return defaultEnabled;
  if (val === true || val === false) return val;
  const text = String(val).trim().toLowerCase();
  if (text === 'yes' || text === 'true' || text === '1' || text === 'on') return true;
  if (text === 'no' || text === 'false' || text === '0' || text === 'off') return false;
  return defaultEnabled;
}

function normalizeSwitch(val, defaultEnabled = false) {
  return isEnabledValue(val, defaultEnabled) ? 'yes' : 'no';
}

function normalizeAlpn(val) {
  const s = String(val || '').trim();
  return ALLOWED_ALPN.includes(s) ? s : '';
}

// Numeric settings are persisted as TEXT by the D1 config store, so they are
// cast back to numbers whenever configuration is read.
const NUMERIC_CONFIG_KEYS = [
  'sessionHours', 'loginRateLimitMax', 'auditRetentionDays', 'healthIntervalMinutes',
  'scannerConcurrency', 'defaultQuotaGb', 'defaultExpireDays', 'locationNodeCount'
];

function normalizeEffectiveConfig(rawConfig = {}) {
  const snap = {
    ...CONFIG_DEFAULTS,
    ...(rawConfig || {})
  };
  for (const key of BOOLEAN_CONFIG_KEYS) {
    snap[key] = normalizeSwitch(snap[key], isEnabledValue(CONFIG_DEFAULTS[key]));
  }
  if (snap.ev === 'no' && snap.et === 'no' && snap.ex === 'no' && snap.es === 'no') {
    snap.ev = 'yes';
  }
  if (snap.ech === 'yes') {
    snap.dkby = 'yes';
  }
  snap.alpn = normalizeAlpn(snap.alpn);
  for (const key of NUMERIC_CONFIG_KEYS) {
    if (snap[key] === undefined || snap[key] === null || snap[key] === '') continue;
    const numeric = Number(snap[key]);
    if (Number.isFinite(numeric)) snap[key] = numeric;
  }
  const parsedCount = parseInt(snap.subNodeCount, 10);
  snap.subNodeCount = Number.isFinite(parsedCount) && parsedCount >= 0 ? parsedCount : 50;
  const rotationRaw = String(snap.ipRotation ?? 'off').trim().toLowerCase();
  if (['off', '5m', '15m', '30m', '1h', '6h', '24h'].includes(rotationRaw)) {
    snap.ipRotation = rotationRaw;
  } else {
    const rotationMinutes = parseInt(rotationRaw, 10);
    snap.ipRotation = Number.isFinite(rotationMinutes) && rotationMinutes > 0 ? `${rotationMinutes}m` : 'off';
  }
  // تنها متد Shadowsocks پشتیبانی‌شده توسط هسته همین ورکر «none» است؛ انتخاب‌های دیگر باعث بی‌پاسخ شدن نود می‌شدند
  snap.ssmethod = 'none';
  // اگر پریست فرگمنت روی حالت سفارشی باشد و مقادیر خالی بمانند، از مقادیر پیش‌فرض ضد-DPI استفاده می‌شود
  if (!snap.fragmentLength) snap.fragmentLength = '100-200';
  if (!snap.fragmentInterval) snap.fragmentInterval = '10-20';
  if (!snap.fragmentPackets) snap.fragmentPackets = 'tlshello';
  snap.fp = snap.fp || 'chrome';
  snap.patt = snap.patt || '/?ed=2048';
  snap.ports = parseNodePorts(snap.ports).join(',');
  snap.supportChannel = TELEGRAM_SUPPORT;
  snap.brand = BRAND_NAME;
  return snap;
}

function readEnvConfigValue(env, ...names) {
  if (!env) return undefined;
  for (const name of names) {
    if (env[name] !== undefined && env[name] !== null && env[name] !== '' && typeof env[name] !== 'object') {
      return env[name];
    }
  }
  return undefined;
}

function getEnvConfigSnapshot(env = {}) {
  const snap = {};
  for (const [key, names] of Object.entries(ENV_KEY_MAPPING)) {
    const val = readEnvConfigValue(env, ...names);
    if (val !== undefined) snap[key] = val;
  }
  return snap;
}


// --- MODULE: src/config/catalog.js ---
// ============================================================================
// miliconfigOS v4.0 - Verified configuration catalogs
// Each entry references the vendor documentation it was taken from.
// Nothing here is invented: if a capability is not implemented by this Worker
// it is marked `runtime: false` instead of being shown as available.
// ============================================================================

const CATALOG_VERSION = '2026-10-catalog-1';

// ---------------------------------------------------------------------------
// DNS resolvers (public addresses + DoH/DoT endpoints)
// ---------------------------------------------------------------------------
const DNS_PROFILES = [
  {
    id: 'cloudflare',
    provider: 'Cloudflare',
    label: { fa: 'کلادفلر', en: 'Cloudflare' },
    ipv4: ['1.1.1.1', '1.0.0.1'],
    ipv6: ['2606:4700:4700::1111', '2606:4700:4700::1001'],
    doh: 'https://cloudflare-dns.com/dns-query',
    dot: 'one.one.one.one:853',
    filtering: 'none',
    privacy: 'https://www.cloudflare.com/privacypolicy/',
    source: 'https://developers.cloudflare.com/1.1.1.1/',
    verified: true
  },
  {
    id: 'google',
    provider: 'Google Public DNS',
    label: { fa: 'گوگل', en: 'Google' },
    ipv4: ['8.8.8.8', '8.8.4.4'],
    ipv6: ['2001:4860:4860::8888', '2001:4860:4860::8844'],
    doh: 'https://dns.google/dns-query',
    dot: 'dns.google:853',
    filtering: 'none',
    privacy: 'https://developers.google.com/speed/public-dns/privacy',
    source: 'https://developers.google.com/speed/public-dns/docs/doh',
    verified: true
  },
  {
    id: 'quad9',
    provider: 'Quad9',
    label: { fa: 'کواد۹', en: 'Quad9' },
    ipv4: ['9.9.9.9', '149.112.112.112'],
    ipv6: ['2620:fe::fe', '2620:fe::9'],
    doh: 'https://dns.quad9.net/dns-query',
    dot: 'dns.quad9.net:853',
    filtering: 'malware',
    privacy: 'https://www.quad9.net/privacy/policy/',
    source: 'https://www.quad9.net/service/service-addresses-and-features/',
    verified: true
  },
  {
    id: 'adguard',
    provider: 'AdGuard DNS',
    label: { fa: 'ادگارد', en: 'AdGuard' },
    ipv4: ['94.140.14.14', '94.140.15.15'],
    ipv6: ['2a10:50c0::ad1:ff', '2a10:50c0::ad2:ff'],
    doh: 'https://dns.adguard-dns.com/dns-query',
    dot: 'dns.adguard-dns.com:853',
    filtering: 'ads-and-trackers',
    privacy: 'https://adguard-dns.io/en/privacy.html',
    source: 'https://adguard-dns.io/kb/general/dns-providers/',
    verified: true
  },
  {
    id: 'opendns',
    provider: 'OpenDNS',
    label: { fa: 'اوپن‌دی‌ان‌اس', en: 'OpenDNS' },
    ipv4: ['208.67.222.222', '208.67.220.220'],
    ipv6: ['2620:119:35::35', '2620:119:53::53'],
    doh: 'https://doh.opendns.com/dns-query',
    dot: 'dns.opendns.com:853',
    filtering: 'optional-category',
    privacy: 'https://www.cisco.com/c/en/us/about/legal/privacy-full.html',
    source: 'https://docs.opendns.com/',
    verified: true
  },
  {
    id: 'mullvad',
    provider: 'Mullvad DNS',
    label: { fa: 'مول‌واد', en: 'Mullvad' },
    ipv4: ['194.242.2.2'],
    ipv6: ['2a07:e340::2'],
    doh: 'https://dns.mullvad.net/dns-query',
    dot: 'dns.mullvad.net:853',
    filtering: 'none',
    privacy: 'https://mullvad.net/en/help/privacy-policy',
    source: 'https://mullvad.net/en/help/dns-over-https-and-dns-over-tls',
    verified: true
  },
  {
    id: 'nextdns',
    provider: 'NextDNS',
    label: { fa: 'نکست‌دی‌ان‌اس', en: 'NextDNS' },
    ipv4: ['45.90.28.0', '45.90.30.0'],
    ipv6: ['2a07:a8c0::', '2a07:a8c1::'],
    doh: '',
    dot: '',
    filtering: 'configurable',
    privacy: 'https://nextdns.io/privacy',
    source: 'https://nextdns.io/',
    verified: true,
    note: 'NextDNS requires your personal configuration ID before DoH/DoT can be used.'
  }
];

const DNS_MODES = [
  { id: 'remote', label: { fa: 'Remote DNS (پروکسی)', en: 'Remote DNS (proxied)' }, supportedBy: ['singbox', 'clash', 'uri'] },
  { id: 'direct', label: { fa: 'Direct DNS (مستقیم)', en: 'Direct DNS' }, supportedBy: ['singbox', 'clash'] },
  { id: 'split', label: { fa: 'Split DNS (تفکیکی)', en: 'Split DNS' }, supportedBy: ['singbox', 'clash'] },
  { id: 'fakeip', label: { fa: 'Fake-IP', en: 'Fake-IP' }, supportedBy: ['clash'] }
];

// ---------------------------------------------------------------------------
// TLS fingerprints (uTLS ClientHello templates)
// ---------------------------------------------------------------------------
const TLS_FINGERPRINTS = [
  { id: 'chrome', label: 'Chrome', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS chrome template.' },
  { id: 'firefox', label: 'Firefox', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS firefox template.' },
  { id: 'safari', label: 'Safari', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS safari template.' },
  { id: 'ios', label: 'iOS', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS iOS template.' },
  { id: 'android', label: 'Android', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS android template.' },
  { id: 'edge', label: 'Edge', clients: ['xray', 'sing-box', 'mihomo'], verified: true, note: 'uTLS edge template.' },
  { id: 'randomized', label: 'Randomized', clients: ['xray', 'sing-box'], verified: true, note: 'Randomizes ClientHello; some servers reject it.' }
];

const TLS_FINGERPRINT_NOTE =
  'A fingerprint selects a uTLS ClientHello template. It does not guarantee that the traffic is indistinguishable from that browser.';

// ---------------------------------------------------------------------------
// ECH catalog
// ECH requires a real HTTPS/SVCB record with an `ech` parameter. Selecting a
// hostname here only makes the engine check that record before delivery.
// ---------------------------------------------------------------------------
const ECH_ENTRIES = [
  { host: 'cloudflare-ech.com', requiresHttpsRecord: true, clients: ['xray-recent', 'sing-box-recent'], source: 'https://blog.cloudflare.com/ech-networks-cf-workers-and-gateway/' },
  { host: 'crypto.cloudflare.com', requiresHttpsRecord: true, clients: ['xray-recent', 'sing-box-recent'], source: 'https://developers.cloudflare.com/ssl/edge-certificates/ech/' },
  { host: 'cloudflare-dns.com', requiresHttpsRecord: true, clients: ['xray-recent', 'sing-box-recent'], source: 'https://developers.cloudflare.com/1.1.1.1/' },
  { host: 'one.one.one.one', requiresHttpsRecord: true, clients: ['xray-recent', 'sing-box-recent'], source: 'https://developers.cloudflare.com/1.1.1.1/' }
];

// ---------------------------------------------------------------------------
// Protocol / transport capability matrix
// ---------------------------------------------------------------------------
const PROTOCOLS = {
  vless: {
    id: 'vless',
    label: 'VLESS',
    requiresCredential: 'uuid',
    transports: ['ws', 'xhttp'],
    runtime: true,
    configGeneration: true,
    udp: 'dns-only',
    tls: true,
    reality: false,
    ech: 'conditional',
    notes: { en: 'VLESS over WebSocket and xHTTP is implemented by this Worker.', fa: 'VLESS روی WebSocket و xHTTP در این ورکر پیاده‌سازی شده است.' }
  },
  trojan: {
    id: 'trojan',
    label: 'Trojan',
    requiresCredential: 'password',
    transports: ['ws'],
    runtime: true,
    configGeneration: true,
    udp: 'dns-only',
    tls: true,
    reality: false,
    ech: 'conditional',
    notes: { en: 'Trojan over TLS/WebSocket is implemented by this Worker.', fa: 'تروجان روی TLS/WebSocket در این ورکر پیاده‌سازی شده است.' }
  },
  shadowsocks: {
    id: 'shadowsocks',
    label: 'Shadowsocks',
    requiresCredential: 'password',
    transports: ['ws'],
    runtime: true,
    configGeneration: true,
    udp: false,
    tls: 'via-plugin',
    reality: false,
    ech: false,
    notes: {
      en: 'The Worker reads the Shadowsocks header in plain mode only (cipher "none") and requires the v2ray-plugin WebSocket transport. AEAD ciphers are not implemented.',
      fa: 'این ورکر هدر Shadowsocks را فقط به‌صورت متنی (cipher «none») می‌خواند و به ترنسپورت WebSocket با v2ray-plugin نیاز دارد. الگوریتم‌های AEAD پیاده‌سازی نشده‌اند.'
    }
  },
  xhttp: {
    id: 'xhttp',
    label: 'xHTTP (VLESS)',
    requiresCredential: 'uuid',
    transports: ['xhttp'],
    runtime: true,
    configGeneration: true,
    udp: 'dns-only',
    tls: true,
    reality: false,
    ech: 'conditional',
    notes: { en: 'xHTTP is a VLESS transport in this Worker, not a separate protocol.', fa: 'xHTTP در این ورکر یک ترنسپورت VLESS است، نه پروتکل جداگانه.' }
  }
};

const TRANSPORTS = {
  ws: { id: 'ws', label: 'WebSocket', runtime: true, protocols: ['vless', 'trojan', 'shadowsocks'] },
  xhttp: { id: 'xhttp', label: 'xHTTP', runtime: true, protocols: ['vless', 'xhttp'], requiresTls: true },
  grpc: { id: 'grpc', label: 'gRPC', runtime: false, protocols: [], reason: 'Not implemented by this Worker.' },
  h2: { id: 'h2', label: 'HTTP/2', runtime: false, protocols: [], reason: 'Not implemented by this Worker.' }
};

const OUTPUT_FORMATS = [
  { id: 'singbox', label: 'sing-box JSON', ext: 'json', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: false },
  { id: 'clash', label: 'Clash / Mihomo YAML', ext: 'yaml', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: 'partial' },
  { id: 'uri', label: 'URI list', ext: 'txt', supports: ['vless', 'trojan', 'shadowsocks', 'xhttp'], xhttp: true },
  { id: 'surge', label: 'Surge', ext: 'txt', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: false },
  { id: 'loon', label: 'Loon', ext: 'txt', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: false },
  { id: 'quanx', label: 'Quantumult X', ext: 'txt', supports: ['vless', 'trojan', 'shadowsocks'], xhttp: false }
];

function getDnsProfile(id) {
  return DNS_PROFILES.find(item => item.id === String(id || '').toLowerCase()) || null;
}

function getDnsValue(id) {
  const profile = getDnsProfile(id);
  return profile && profile.doh ? profile.doh : '';
}

function fingerprintById(id) {
  return TLS_FINGERPRINTS.find(item => item.id === String(id || '').toLowerCase()) || null;
}

function protocolById(id) {
  const key = String(id || '').toLowerCase();
  if (key === 'ss') return PROTOCOLS.shadowsocks;
  return PROTOCOLS[key] || null;
}

function formatById(id) {
  return OUTPUT_FORMATS.find(item => item.id === String(id || '').toLowerCase()) || null;
}

function capabilityMatrix() {
  return {
    runtime: 'Cloudflare Workers (V8 isolates, fetch + WebSocket)',
    protocols: Object.values(PROTOCOLS),
    transports: Object.values(TRANSPORTS),
    formats: OUTPUT_FORMATS,
    limits: [
      { en: 'No arbitrary raw TCP or general UDP forwarding.', fa: 'بدون فوروارد TCP خام یا UDP عمومی.' },
      { en: 'REALITY is not available on the Cloudflare edge and is not offered.', fa: 'REALITY روی لبه کلادفلر در دسترس نیست و ارائه نمی‌شود.' },
      { en: 'ECH depends on a valid HTTPS/SVCB record and client support.', fa: 'ECH به رکورد معتبر HTTPS/SVCB و پشتیبانی کلاینت وابسته است.' },
      { en: 'A generated subscription is not proof that a tunnel is working.', fa: 'ساب‌لینک تولیدشده دلیل کارکرد تونل نیست.' }
    ]
  };
}


// --- MODULE: src/config/presets.js ---
// ============================================================================
// miliconfig v3.1 - پریست‌های ساخت سریع کاربر (مطابق رابط کاربری Zeus و CFnew)
// ============================================================================


const USER_PRESETS = {
  'iran-fast': {
    id: 'iran-fast',
    title: 'ایران — پرسرعت (پیشنهادی)',
    subtitle: 'همراه اول · ایرانسل · مخابرات',
    badges: ['فرگمنت 100-200 با فاصله 10-20', 'fingerprint chrome', 'بلاک تبلیغات'],
    recommended: true,
    nodeScope: 'all',
    subNodeCount: 50,
    dataLimitGb: 0,
    expireDays: 0,
    ipLimit: 50,
    startOnFirstUse: true,
    configOverrides: {
      ev: 'yes',
      et: 'no',
      ex: 'no',
      es: 'yes', // شادوساکس هم فعال باشد
      fp: 'chrome',
      fragmentPreset: 'mci',
      fragmentLength: '100-200',
      fragmentInterval: '10-20',
      epd: 'yes',
      epi: 'yes',
      egi: 'yes',
      ena: 'no',
      ipv4: 'yes',
      ipv6: 'yes'
    }
  },
  'iran-heavy': {
    id: 'iran-heavy',
    title: 'ایران — مصرف سنگین (نامحدود)',
    subtitle: 'استریم · بازی · دانلود',
    badges: ['حجم نامحدود', 'فرگمنت 50-100', '۲ دستگاه همزمان'],
    recommended: false,
    nodeScope: 'all',
    subNodeCount: 60,
    dataLimitGb: 0,
    expireDays: 0,
    ipLimit: 2,
    startOnFirstUse: true,
    configOverrides: {
      ev: 'yes',
      et: 'yes',
      ex: 'no',
      es: 'yes',
      fp: 'chrome',
      fragmentPreset: 'irancell',
      fragmentLength: '50-100',
      fragmentInterval: '5-10',
      epd: 'yes',
      epi: 'yes',
      egi: 'yes'
    }
  },
  'international': {
    id: 'international',
    title: 'بین‌المللی — بدون فرگمنت',
    subtitle: 'اینترنت بدون محدودیت · سرعت حداکثری',
    badges: ['بدون فرگمنت', 'بدون محدودیت حجم', '۵ دستگاه همزمان'],
    recommended: false,
    nodeScope: 'all',
    subNodeCount: 50,
    dataLimitGb: 0,
    expireDays: 0,
    ipLimit: 5,
    startOnFirstUse: true,
    configOverrides: {
      ev: 'yes',
      et: 'no',
      ex: 'no',
      es: 'yes',
      dkby: 'yes',
      alpn: 'h2,http/1.1'
    }
  },
  'multi-location': {
    id: 'multi-location',
    title: 'چند لوکیشن — فقط نودهای لبه و VIP',
    subtitle: 'لوکیشن‌های تفکیک‌شده آلمان، هلند، آمریکا و...',
    badges: ['فقط نودهای مولتی‌لوکیشن', 'نام‌گذاری number+miliconfig', 'فرگمنت فعال'],
    recommended: false,
    nodeScope: 'edge',
    subNodeCount: 40,
    dataLimitGb: 0,
    expireDays: 0,
    ipLimit: 50,
    startOnFirstUse: true,
    configOverrides: {
      ev: 'yes',
      es: 'yes',
      epd: 'yes',
      epi: 'yes',
      egi: 'yes',
      ena: 'no'
    }
  },
  'direct-only': {
    id: 'direct-only',
    title: 'فقط سرور اصلی (بدون CDN)',
    subtitle: 'وقتی مسیر CDN مشکل دارد یا تست خود سرور',
    badges: ['فقط نود سرور اصلی', 'بدون لوکیشن', 'بدون فرگمنت'],
    recommended: false,
    nodeScope: 'origin',
    subNodeCount: 10,
    dataLimitGb: 0,
    expireDays: 0,
    ipLimit: 50,
    startOnFirstUse: true,
    configOverrides: {
      ev: 'yes',
      ena: 'yes',
      epd: 'no',
      epi: 'no',
      egi: 'no',
      yxby: 'yes'
    }
  }
};

function buildUserDefaultConfig(basePanelConfig = {}, presetId = 'iran-fast', customOverrides = {}) {
  const preset = USER_PRESETS[presetId] || USER_PRESETS['iran-fast'];
  return normalizeEffectiveConfig({
    ...CONFIG_DEFAULTS,
    ...(basePanelConfig || {}),
    ...(preset.configOverrides || {}),
    subNodeCount: customOverrides.subNodeCount ?? basePanelConfig?.subNodeCount ?? preset.subNodeCount ?? 50,
    ...(customOverrides || {})
  });
}


// --- MODULE: src/core/utils.js ---
// ============================================================================
// miliconfig v3.1 - ابزارهای هسته، نام‌گذاری نودها (number+miliconfig) و رمزنگاری
// ============================================================================


const base64TextDecoder = new TextDecoder();
const sharedDecoder = new TextDecoder();

function decodeBase64Utf8(b64) {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return base64TextDecoder.decode(bytes);
  } catch (_e) {
    return '';
  }
}

function encodeBase64Utf8(str) {
  try {
    const bytes = new TextEncoder().encode(String(str ?? ''));
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (_e) {
    return btoa(unescape(encodeURIComponent(String(str ?? ''))));
  }
}

function isValidUuid(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

function generateUuidV4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().toLowerCase();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function generateShortId(prefix = 'mili') {
  const bytes = new Uint8Array(3);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 3; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}-${hex}`;
}

// اعتبارسنجی کامل IPv6 (شامل فرم فشرده مثل 2606:4700::1 و IPv4-mapped)
function isValidIpv6Address(addr) {
  const s = String(addr || '').trim();
  if (!s.includes(':')) return false;
  if (/[^0-9a-fA-F:.]/.test(s)) return false;
  if (s.includes(':::')) return false;
  const halves = s.split('::');
  if (halves.length > 2) return false;
  const groupsOf = part => (part ? part.split(':') : []);
  const head = groupsOf(halves[0]);
  const tail = halves.length === 2 ? groupsOf(halves[1]) : [];
  const validGroup = g => /^[0-9a-fA-F]{1,4}$/.test(g) || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(g);
  if (![...head, ...tail].every(validGroup)) return false;
  const total = head.length + tail.length;
  if (halves.length === 2) return total <= 7;
  return total === 8;
}

function isValidIpAddress(addr) {
  if (!addr || typeof addr !== 'string') return false;
  const s = addr.trim().replace(/^\[([^\]]+)\]$/, '$1');
  const v4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (v4.test(s)) return true;
  return isValidIpv6Address(s);
}

function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') return false;
  return /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(domain.trim());
}

function normalizeNodeHost(host) {
  return String(host || '').trim().replace(/^\[([^\]]+)\]$/, '$1');
}

function parseAddressAndPort(input) {
  const raw = String(input || '').trim();
  if (!raw) return { address: '', port: null };
  if (raw.includes('[') && raw.includes(']')) {
    const m = raw.match(/^\[([^\]]+)\](?::(\d+))?$/);
    if (m) {
      return {
        address: m[1],
        port: m[2] ? parseInt(m[2], 10) : null
      };
    }
  }
  const lastColon = raw.lastIndexOf(':');
  if (lastColon > 0) {
    const addr = raw.substring(0, lastColon);
    const portStr = raw.substring(lastColon + 1);
    const port = parseInt(portStr, 10);
    if (!addr.includes(':') && !Number.isNaN(port) && port > 0 && port <= 65535) {
      return { address: addr, port };
    }
  }
  return { address: raw, port: null };
}

// ============================================================================
// نام‌گذار اختصاصی نودهای خروجی با فرمت دقیق number+miliconfig
// (مثلاً: 1+miliconfig, 2+miliconfig, 3+miliconfig ...)
// ============================================================================
function createMiliNodeNamer(brand = BRAND_NAME) {
  let counter = 0;
  const cleanBrand = String(brand || BRAND_NAME).trim() || BRAND_NAME;
  return function nameNode(_item) {
    counter += 1;
    return `${counter}+${cleanBrand}`;
  };
}

// بازشماری و اعمال محدودیت تعداد نودهای ساب‌لینک کاربر با فرمت دقیق number+miliconfig
function finalizeMiliSubscriptionLinks(links = [], subNodeCount = 0, brand = BRAND_NAME) {
  if (!Array.isArray(links) || links.length === 0) return [];
  const cleanBrand = String(brand || BRAND_NAME).trim() || BRAND_NAME;
  const limit = parseInt(subNodeCount, 10);
  const sliced = Number.isFinite(limit) && limit > 0 ? links.slice(0, limit) : links.slice();
  return sliced.map((link, idx) => {
    const nodeName = `${idx + 1}+${cleanBrand}`;
    const hashIdx = link.indexOf('#');
    const base = hashIdx > -1 ? link.substring(0, hashIdx) : link;
    return `${base}#${encodeURIComponent(nodeName)}`;
  });
}

// ============================================================================
// Pure-JS MD5 (جهت سازگاری کامل بدون خطای ۱۱۰۱)
// ============================================================================
async function md5Hex(text) {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const buf = await crypto.subtle.digest('MD5', new TextEncoder().encode(String(text)));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (_e) {}
  return pureJsMd5(String(text));
}

function pureJsMd5(str) {
  const bytes = new TextEncoder().encode(str);
  const k = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]);
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  const origLenBits = bytes.length * 8;
  const withOne = bytes.length + 1;
  const padLen = ((56 - (withOne % 64)) + 64) % 64;
  const totalLen = withOne + padLen + 8;
  const buf = new Uint8Array(totalLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(totalLen - 8, origLenBits >>> 0, true);
  dv.setUint32(totalLen - 4, Math.floor(origLenBits / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < totalLen; offset += 64) {
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      const word = dv.getUint32(offset + g * 4, true);
      F = (F + A + k[i] + word) >>> 0;
      A = D;
      D = C;
      C = B;
      const rot = (F << s[i]) | (F >>> (32 - s[i]));
      B = (B + rot) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outDv = new DataView(out.buffer);
  outDv.setUint32(0, a0, true);
  outDv.setUint32(4, b0, true);
  outDv.setUint32(8, c0, true);
  outDv.setUint32(12, d0, true);
  return Array.from(out, b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// SHA-224 (پروتکل Trojan)
// ============================================================================
function rotr32(val, bits) {
  return (val >>> bits) | (val << (32 - bits));
}

async function sha224Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(text || ''));
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const H = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];
  const msgLen = data.length;
  const bitLen = msgLen * 8;
  const paddedLen = Math.ceil((msgLen + 9) / 64) * 64;
  const buf = new Uint8Array(paddedLen);
  buf.set(data);
  buf[msgLen] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 4, bitLen, false);
  for (let chunk = 0; chunk < paddedLen; chunk += 64) {
    const W = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(chunk + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(W[i - 15], 7) ^ rotr32(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr32(W[i - 2], 17) ^ rotr32(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }
  const out = [];
  for (let i = 0; i < 7; i++) {
    out.push(
      ((H[i] >>> 24) & 0xff).toString(16).padStart(2, '0'),
      ((H[i] >>> 16) & 0xff).toString(16).padStart(2, '0'),
      ((H[i] >>> 8) & 0xff).toString(16).padStart(2, '0'),
      (H[i] & 0xff).toString(16).padStart(2, '0')
    );
  }
  return out.join('');
}

// ============================================================================
// SHA-256 (برای سیستم احراز هویت و هش رمز عبور مدیر)
// ============================================================================
async function sha256Hex(text) {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text || '')));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (_e) {}
  // اگر به هر دلیلی در دسترس نبود، sha224 با پدینگ ۳۲ بایتی برگشت داده می‌شود
  const h = await sha224Hex(String(text || ''));
  return h + h.slice(0, 8);
}

function formatBytes(bytes = 0) {
  const b = Number(bytes) || 0;
  if (b <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  const val = b / Math.pow(1024, i);
  return `${val >= 100 || i === 0 ? Math.round(val) : val.toFixed(2)} ${units[i]}`;
}


// --- MODULE: src/core/security.js ---
// ============================================================================
// miliconfigOS v4.0 - Security primitives
// - PBKDF2-SHA256 password hashing (210k iterations, per-hash salt)
// - constant-time verification with legacy SHA-256 migration
// - cryptographically random tokens
// - AES-GCM encryption for provider credentials at rest
// - password policy, cookie and same-origin helpers
// ============================================================================

const textEncoder = new TextEncoder();

const PBKDF2_ITERATIONS = 210000;
const LEGACY_ITERATIONS = 120000;

const SESSION_COOKIE = 'mili_session';
const LEGACY_SESSION_COOKIE = 'mili_auth';

const DEFAULT_SESSION_HOURS = 12;
const MIN_SESSION_HOURS = 1;
const MAX_SESSION_HOURS = 24 * 30;

const WEAK_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'admin', 'admin123', 'administrator',
  '1234567890', '12345678', '123456789', 'qwerty123', 'letmein123', 'miliconfig',
  'changeme', 'changeme123', 'welcome123', 'iloveyou', '11111111', '00000000'
]);

// ---- encoding helpers -------------------------------------------------------

function bytesToBase64(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) {
    binary += String.fromCharCode.apply(null, arr.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(text) {
  const raw = atob(String(text || ''));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bytesToHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const clean = String(hex || '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function timingSafeEqual(a, b) {
  const left = String(a ?? '');
  const right = String(b ?? '');
  const len = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < len; i++) {
    diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return diff === 0;
}

async function sha256HexDigest(text) {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(String(text ?? '')));
  return bytesToHex(new Uint8Array(digest));
}

async function hmacSha256Hex(secret, message) {
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

function randomToken(byteLength = 32) {
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

async function hashPassword(password) {
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
async function verifyPassword(password, stored) {
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
    const actual = bytesToBase64(await pbkdf2(password, salt, iterations));
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

function passwordPolicy(password) {
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

function encryptionAvailable(env = {}) {
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
async function encryptSecret(plain, env = {}) {
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

async function decryptSecret(stored, env = {}) {
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

function readCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function sessionCookie(request, token, maxAgeSeconds) {
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

function clearSessionCookie(request) {
  return sessionCookie(request, '', 0);
}

/**
 * CSRF defence for state-changing API calls:
 * SameSite=Strict cookies plus a strict same-origin check on Origin/Referer.
 * Requests without either header are only accepted when they carry no cookie
 * auth (public endpoints), which the caller decides separately.
 */
function isSameOriginRequest(request) {
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

function securityHeaders(extra = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    ...extra
  };
}

function normalizeClientIp(request) {
  return String(request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '127.0.0.1')
    .split(',')[0]
    .trim();
}


// --- MODULE: src/config/schema.js ---
// ============================================================================
// miliconfigOS v4.0 - Central settings schema, validation and conflict engine
// Every persisted setting is declared here once. Unknown keys are rejected so
// the API can never write arbitrary rows into system_config.
// ============================================================================


const yesNo = value => (String(value).toLowerCase() === 'yes' || value === true || value === 1) ? 'yes' : 'no';

function text(labelFa, labelEn, helpFa = '', helpEn = '') {
  return { label: { fa: labelFa, en: labelEn }, help: { fa: helpFa, en: helpEn } };
}

const SETTINGS_SCHEMA = [
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
    ...text('Shadowsocks', 'Shadowsocks', 'در این ورکر فقط cipher=none و v2ray-plugin پشتیبانی می‌شود.', 'Only cipher=none with v2ray-plugin is implemented by this Worker.')
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

const SETTINGS_BY_KEY = new Map(SETTINGS_SCHEMA.map(field => [field.key, field]));

const SETTINGS_SECTIONS = [
  { id: 'general', label: { fa: 'عمومی', en: 'General' } },
  { id: 'security', label: { fa: 'امنیت', en: 'Security' } },
  { id: 'network', label: { fa: 'شبکه و DNS', en: 'Network & DNS' } },
  { id: 'proxy', label: { fa: 'موتور پروکسی', en: 'Proxy engine' } },
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

function defaultSettings() {
  const out = {};
  for (const field of SETTINGS_SCHEMA) out[field.key] = field.default;
  return { ...CONFIG_DEFAULTS, ...out };
}

/**
 * Validate and normalize a settings patch.
 * Returns { values, errors, warnings }; `values` only contains known keys.
 */
function validateSettings(input = {}, current = {}) {
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

function isPrivateHost(hostname) {
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
function detectConflicts(settings = {}) {
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

  if (on('es')) {
    out.push({
      code: 'SHADOWSOCKS_PLAIN', severity: 'warning', fields: ['es'],
      message: 'Shadowsocks nodes in this Worker use cipher "none" with v2ray-plugin. They provide transport encryption via TLS/WebSocket only and are not equivalent to AEAD Shadowsocks.'
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

function sanitizeSettingsForClient(raw = {}) {
  const out = {};
  for (const field of SETTINGS_SCHEMA) {
    if (raw[field.key] !== undefined) out[field.key] = raw[field.key];
  }
  delete out.adminPasswordHash;
  return out;
}

/** Fields the subscription generator consumes, with schema defaults applied. */
function effectiveSettings(raw = {}) {
  return { ...CONFIG_DEFAULTS, ...defaultSettings(), ...raw };
}


// --- MODULE: src/core/health.js ---
// ============================================================================
// miliconfigOS v4.0 - Health scoring (pure, testable)
// A successful TCP connect is not a working proxy. The score reflects only the
// checks that were actually performed and is capped by the highest verified
// check level.
// ============================================================================

const CHECK_LEVELS = ['syntax', 'dns', 'tcp', 'tls', 'http', 'proxy'];

const LEVEL_WEIGHT = {
  syntax: 5,
  dns: 15,
  tcp: 30,
  tls: 25,
  http: 15,
  proxy: 10
};

function rankLevel(level) {
  const idx = CHECK_LEVELS.indexOf(level);
  return idx < 0 ? -1 : idx;
}

/**
 * @param {object} result { checks: { syntax:{ok}, dns:{ok}, tcp:{ok}, tls:{ok}, http:{ok}, proxy:{ok} } }
 * @returns {{ score:number, status:string, verifiedLevel:string, performed:string[] }}
 */
function scoreHealth(result = {}) {
  const checks = result.checks || {};
  const performed = CHECK_LEVELS.filter(level => checks[level] && checks[level].performed !== false);
  const syntaxOk = checks.syntax ? checks.syntax.ok : true;
  if (!syntaxOk) {
    return { score: 0, status: 'invalid', verifiedLevel: 'syntax', performed };
  }

  let score = 0;
  let highest = 'syntax';
  for (const level of performed) {
    if (!checks[level].ok) continue;
    score += LEVEL_WEIGHT[level] || 0;
    if (rankLevel(level) > rankLevel(highest)) highest = level;
  }

  const tcp = checks.tcp;
  const tls = checks.tls;
  let status = 'unreachable';
  if (checks.proxy && checks.proxy.ok) status = 'proxy-verified';
  else if (checks.http && checks.http.ok) status = 'http-ok';
  else if (tls && tls.ok) status = 'tls-ok';
  else if (tcp && tcp.ok) status = 'reachable';
  else if (checks.dns && checks.dns.ok) status = 'dns-only';

  // Never label an endpoint healthy from TCP alone: the proxy protocol was not
  // exercised from the Worker.
  const latency = Number(tcp?.latencyMs || 0);
  const latencyPenalty = latency > 0 ? Math.min(20, Math.floor(latency / 50)) : 0;
  score = Math.max(0, Math.min(95, Math.round(score - latencyPenalty)));
  if (status === 'reachable' || status === 'dns-only') score = Math.min(score, 55);

  return { score, status, verifiedLevel: highest, performed };
}

/**
 * Interpret a certificate-less TLS probe.
 * `fetch()` performs the TLS handshake; a response or an HTTP error proves the
 * handshake succeeded, a network error does not.
 */
function interpretTlsProbe(outcome = {}) {
  if (outcome.error) {
    return { ok: false, performed: true, detail: String(outcome.error).slice(0, 160) };
  }
  return { ok: true, performed: true, detail: `TLS handshake completed (HTTP ${outcome.status || 'unknown'})`, latencyMs: outcome.latencyMs || 0 };
}

function parseDohAnswer(payload) {
  if (!payload || !Array.isArray(payload.Answer)) return { ok: false, addresses: [], detail: 'No answer section' };
  const addresses = payload.Answer
    .filter(record => record && (record.type === 1 || record.type === 28 || record.type === 5))
    .map(record => String(record.data || '').trim())
    .filter(Boolean);
  return {
    ok: addresses.length > 0,
    addresses,
    detail: addresses.length ? addresses.slice(0, 4).join(', ') : 'No A/AAAA/CNAME records'
  };
}

/** Map over items with a bounded number of in-flight promises. */
async function mapLimit(items, limit, worker) {
  const list = Array.isArray(items) ? items.slice() : [];
  const concurrency = Math.max(1, Math.min(32, Number(limit) || 1));
  const results = new Array(list.length);
  let cursor = 0;

  async function run() {
    while (cursor < list.length) {
      const index = cursor++;
      try {
        results[index] = await worker(list[index], index);
      } catch (err) {
        results[index] = { error: String(err?.message || err) };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, run));
  return results;
}

function healthLabel(status) {
  const labels = {
    invalid: { en: 'Invalid', fa: 'نامعتبر' },
    unreachable: { en: 'Unreachable', fa: 'غیرقابل دسترس' },
    'dns-only': { en: 'DNS only', fa: 'فقط DNS' },
    reachable: { en: 'TCP reachable (proxy unverified)', fa: 'TCP قابل دسترس (پروکسی تأیید نشده)' },
    'tls-ok': { en: 'TLS handshake OK', fa: 'دست‌دهی TLS موفق' },
    'http-ok': { en: 'HTTP response OK', fa: 'پاسخ HTTP موفق' },
    'proxy-verified': { en: 'Proxy protocol verified', fa: 'پروتکل پروکسی تأیید شد' }
  };
  return labels[status] || { en: status, fa: status };
}


// --- MODULE: src/core/engine.js ---
// ============================================================================
// miliconfigOS v4.0 - Configuration engine
// Turns stored user permissions + endpoint catalog + settings into validated,
// explainable configuration plans. No network calls and no fabrication: every
// rejection carries a machine-readable code and a bilingual reason.
// ============================================================================


const PLAINTEXT_PORTS = new Set([80, 8080, 8880, 2052, 2082, 2086, 2095]);
const MAX_CHAIN_HOPS = 3;

const OPTIMIZATION_POLICIES = {
  balanced: { health: 0.45, latency: 0.35, stability: 0.20 },
  latency: { health: 0.25, latency: 0.60, stability: 0.15 },
  stability: { health: 0.50, latency: 0.15, stability: 0.35 }
};

function protocolEnabled(cfg, protocol) {
  const on = key => String(cfg[key] ?? '').toLowerCase() === 'yes';
  switch (protocol) {
    case 'vless': return on('ev');
    case 'trojan': return on('et');
    case 'xhttp': return on('ex');
    case 'shadowsocks': return on('es');
    default: return false;
  }
}

function endpointFamily(host) {
  const clean = normalizeNodeHost(host);
  if (!clean) return 'invalid';
  if (clean.includes(':')) return 'ipv6';
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) return 'ipv4';
  return isValidDomain(clean) ? 'domain' : 'invalid';
}

function parseChain(value) {
  const raw = String(value || '').trim();
  if (!raw) return { ok: true, hops: [] };
  const hops = [];
  for (const chunk of raw.split(',').map(item => item.trim()).filter(Boolean)) {
    let url;
    try {
      url = new URL(chunk);
    } catch (_e) {
      return { ok: false, error: { code: 'CHAIN_INVALID_URL', message: `Invalid proxy URL: ${chunk}` }, hops: [] };
    }
    const protocol = url.protocol.replace(':', '').toLowerCase();
    if (!['socks5', 'socks', 'http', 'https'].includes(protocol)) {
      return { ok: false, error: { code: 'CHAIN_UNSUPPORTED_PROTOCOL', message: `Unsupported chain protocol: ${protocol}` }, hops: [] };
    }
    const port = parseInt(url.port || (protocol === 'https' ? '443' : '80'), 10);
    if (!url.hostname || !Number.isFinite(port) || port < 1 || port > 65535) {
      return { ok: false, error: { code: 'CHAIN_INVALID_TARGET', message: `Invalid chain target: ${chunk}` }, hops: [] };
    }
    hops.push({
      protocol,
      host: url.hostname,
      port,
      auth: Boolean(url.username || url.password)
    });
  }
  if (hops.length > MAX_CHAIN_HOPS) {
    return { ok: false, error: { code: 'CHAIN_TOO_LONG', message: `At most ${MAX_CHAIN_HOPS} hops are supported.` }, hops };
  }
  return { ok: true, hops };
}

function dedupeKey(plan) {
  return [plan.protocol, plan.transport, plan.tlsMode, plan.endpointId, plan.dnsProfile].join('|');
}

/**
 * Validate a single candidate combination.
 */
function validateCandidate(candidate, user = {}, settings = {}) {
  const cfg = normalizeEffectiveConfig({ ...(user.config || {}), ...settings });
  const issues = [];
  const add = (severity, code, en, fa) => issues.push({ severity, code, en, fa });

  const protocol = protocolById(candidate.protocol);
  if (!protocol) {
    add('error', 'PROTOCOL_UNKNOWN', 'Unknown protocol.', 'پروتکل ناشناخته است.');
    return { valid: false, issues };
  }
  if (!protocol.runtime) {
    add('error', 'PROTOCOL_NOT_IMPLEMENTED', `${protocol.label} is not implemented by this Worker.`, `${protocol.label} در این ورکر پیاده‌سازی نشده است.`);
  }
  if (!protocolEnabled(cfg, protocol.id)) {
    add('error', 'PROTOCOL_NOT_ALLOWED', `${protocol.label} is disabled for this user.`, `${protocol.label} برای این کاربر فعال نیست.`);
  }
  if (user.enabled === false) {
    add('error', 'USER_DISABLED', 'User is disabled.', 'کاربر غیرفعال است.');
  }
  if (Number(user.expireAt) > 0 && Number(user.expireAt) < Date.now()) {
    add('error', 'USER_EXPIRED', 'User subscription has expired.', 'اشتراک کاربر منقضی شده است.');
  }
  if (Number(user.dataLimitGb) > 0 && Number(user.usedBytes || 0) >= Number(user.dataLimitGb) * 1073741824) {
    add('error', 'USER_QUOTA_EXCEEDED', 'User quota is exhausted.', 'حجم مجاز کاربر تمام شده است.');
  }

  // Credentials
  if (protocol.requiresCredential === 'uuid' && !isValidUuid(user.uuid)) {
    add('error', 'MISSING_UUID', 'User UUID is missing or invalid.', 'UUID کاربر موجود یا معتبر نیست.');
  }
  if (protocol.requiresCredential === 'password') {
    const password = candidate.protocol === 'trojan' ? cfg.tp : cfg.sspass;
    const effective = password || user.uuid;
    if (!effective || String(effective).length < 8) {
      add('error', 'MISSING_PASSWORD', 'A credential with at least 8 characters is required.', 'یک اعتبارنامه با حداقل ۸ کاراکتر لازم است.');
    }
  }

  // Endpoint
  const host = normalizeNodeHost(candidate.host);
  const family = endpointFamily(host);
  if (!host || family === 'invalid') {
    add('error', 'ENDPOINT_INVALID', 'Endpoint host is not a valid IP address or domain.', 'میزبان اندپوینت IP یا دامنه معتبر نیست.');
  }
  if (family === 'ipv4' && String(cfg.ipv4) === 'no') {
    add('error', 'IPV4_DISABLED', 'IPv4 endpoints are disabled.', 'اندپوینت‌های IPv4 غیرفعال هستند.');
  }
  if (family === 'ipv6' && String(cfg.ipv6) === 'no') {
    add('error', 'IPV6_DISABLED', 'IPv6 endpoints are disabled.', 'اندپوینت‌های IPv6 غیرفعال هستند.');
  }
  const port = Number(candidate.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    add('error', 'PORT_INVALID', 'Endpoint port must be between 1 and 65535.', 'پورت اندپوینت باید بین ۱ تا ۶۵۵۳۵ باشد.');
  }

  // Transport
  const transport = TRANSPORTS[candidate.transport];
  if (!transport) {
    add('error', 'TRANSPORT_UNKNOWN', 'Unknown transport.', 'ترنسپورت ناشناخته است.');
  } else {
    if (!transport.runtime) {
      add('error', 'TRANSPORT_NOT_IMPLEMENTED', `${transport.label} is not implemented by this Worker.`, `${transport.label} در این ورکر پیاده‌سازی نشده است.`);
    }
    if (!transport.protocols.includes(protocol.id)) {
      add('error', 'TRANSPORT_PROTOCOL_MISMATCH', `${transport.label} cannot carry ${protocol.label}.`, `${transport.label} نمی‌تواند ${protocol.label} را حمل کند.`);
    }
  }

  const tlsMode = String(candidate.tlsMode || 'tls');
  if (!['tls', 'none'].includes(tlsMode)) {
    add('error', 'TLS_MODE_INVALID', 'TLS mode must be "tls" or "none".', 'حالت TLS باید «tls» یا «none» باشد.');
  }
  if (candidate.transport === 'xhttp' && tlsMode !== 'tls') {
    add('error', 'XHTTP_REQUIRES_TLS', 'xHTTP requires TLS.', 'xHTTP به TLS نیاز دارد.');
  }
  if (tlsMode === 'none' && PLAINTEXT_PORTS.has(port) === false) {
    add('warning', 'PLAINTEXT_ON_TLS_PORT', 'A plaintext node on a TLS port will fail; choose a Cloudflare plaintext port.', 'نود بدون TLS روی پورت TLS کار نمی‌کند؛ پورت بدون‌رمز کلادفلر انتخاب کنید.');
  }
  if (protocol.id === 'trojan' && tlsMode !== 'tls') {
    add('warning', 'TROJAN_PLAINTEXT', 'Trojan without TLS is detectable and not recommended.', 'تروجان بدون TLS قابل شناسایی است و توصیه نمی‌شود.');
  }

  // ECH
  const echOn = String(cfg.ech) === 'yes';
  if (echOn) {
    if (!tlsMode || tlsMode === 'none') {
      add('error', 'ECH_WITHOUT_TLS', 'ECH requires TLS.', 'ECH به TLS نیاز دارد.');
    }
    if (!getDnsProfile(String(cfg.dnsProfileId || '')) && !/^https:\/\/.+\/dns-query/.test(String(cfg.customDNS || ''))) {
      add('error', 'ECH_WITHOUT_DOH', 'ECH requires a DNS-over-HTTPS resolver.', 'ECH به DNS-over-HTTPS نیاز دارد.');
    }
    if (!String(cfg.customECHDomain || '').trim()) {
      add('error', 'ECH_CONFIG_MISSING', 'No ECH configuration domain is set.', 'دامنه پیکربندی ECH تعیین نشده است.');
    }
    add('warning', 'ECH_CLIENT_SUPPORT', 'ECH only works with clients that support it and a hostname publishing an HTTPS/SVCB record.', 'ECH فقط با کلاینت سازگار و میزبانی که رکورد HTTPS/SVCB منتشر می‌کند کار می‌کند.');
  }

  // DNS
  const dnsMode = String(cfg.dnsMode || 'remote');
  const dns = getDnsProfile(String(cfg.dnsProfileId || '')) || null;
  if (dns && dns.doh && !/^https:\/\//.test(dns.doh)) {
    add('warning', 'DNS_NOT_DOH', 'DNS profile has no DoH endpoint.', 'پروفایل DNS نقطه DoH ندارد.');
  }
  if (dnsMode === 'fakeip' && candidate.format === 'singbox') {
    add('warning', 'FAKEIP_UNSUPPORTED_FORMAT', 'Fake-IP is not available in sing-box output.', 'Fake-IP در خروجی sing-box پشتیبانی نمی‌شود.');
  }

  // Output format
  const format = candidate.format ? formatById(candidate.format) : null;
  if (candidate.format && !format) {
    add('error', 'FORMAT_UNKNOWN', 'Unknown subscription format.', 'فرمت اشتراک ناشناخته است.');
  } else if (format) {
    if (!format.supports.includes(protocol.id)) {
      add('error', 'FORMAT_PROTOCOL_UNSUPPORTED', `${format.label} cannot represent ${protocol.label}.`, `${format.label} نمی‌تواند ${protocol.label} را نمایش دهد.`);
    } else if (protocol.id === 'xhttp' && format.xhttp === false) {
      add('warning', 'FORMAT_XHTTP_UNSUPPORTED', `${format.label} cannot represent xHTTP; the node will be omitted in that output.`, `${format.label} از xHTTP پشتیبانی نمی‌کند؛ این نود در آن خروجی حذف می‌شود.`);
    }
  }

  // Chain
  const chain = parseChain(candidate.chain || cfg.s || '');
  if (!chain.ok) {
    add('error', chain.error.code, chain.error.message, chain.error.message);
  } else if (chain.hops.length) {
    for (const hop of chain.hops) {
      if (hop.host === host && hop.port === port) {
        add('error', 'CHAIN_LOOP', 'The proxy chain loops back to the endpoint.', 'زنجیره پروکسی به خود اندپوینت برمی‌گردد.');
      }
      if (String(cfg.jk) !== 'yes') {
        add('warning', 'CHAIN_REQUIRES_FLAG', 'A proxy chain is configured but the home-chain flag (jk) is off; the chain is not used by clients.', 'زنجیره پروکسی تنظیم شده اما گزینه jk خاموش است؛ کلاینت از آن استفاده نمی‌کند.');
      }
    }
  }

  return {
    valid: !issues.some(issue => issue.severity === 'error'),
    issues
  };
}

function hashString(text) {
  let hash = 2166136261;
  const value = String(text || '');
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function scoreCandidate({ endpoint, protocol, policy = 'balanced', user }) {
  const weights = OPTIMIZATION_POLICIES[policy] || OPTIMIZATION_POLICIES.balanced;
  const checked = Number(endpoint.lastCheckAt || 0) > 0;
  const health = checked ? Math.max(0, Math.min(100, Number(endpoint.healthScore || 0))) : 40;
  const latency = Number(endpoint.lastLatencyMs || 0);
  const latencyScore = latency > 0 ? Math.max(0, Math.min(100, 100 - latency / 5)) : 30;
  const failures = Math.max(0, Number(endpoint.failureCount || 0));
  const stability = Math.max(0, Math.min(100, 100 - failures * 12));
  const protocolBonus = { vless: 5, xhttp: 4, trojan: 3, shadowsocks: 1 }[protocol] || 0;
  const freshness = checked ? Math.max(0, 1 - (Date.now() - Number(endpoint.lastCheckAt)) / (7 * 86400000)) : 0;
  const tieBreak = hashString(`${user?.id || ''}:${endpoint.id || endpoint.host}`);

  const score = (
    health * weights.health +
    latencyScore * weights.latency +
    stability * weights.stability +
    protocolBonus +
    freshness * 3 +
    tieBreak * 2
  );
  return Math.round(Math.max(0, Math.min(100, score)) * 100) / 100;
}

function explainSelection({ endpoint, protocol, format, score, policy }) {
  const reasons = [
    {
      code: 'POLICY',
      en: `Selected under the "${policy}" optimization policy.`,
      fa: `انتخاب‌شده بر اساس سیاست بهینه‌سازی «${policy}».`
    },
    {
      code: 'SCORE',
      en: `Compatibility score ${score} (health ${endpoint.healthScore || 0}, latency ${endpoint.lastLatencyMs || 0} ms, failures ${endpoint.failureCount || 0}).`,
      fa: `امتیاز سازگاری ${score} (سلامت ${endpoint.healthScore || 0}، تأخیر ${endpoint.lastLatencyMs || 0} میلی‌ثانیه، خطا ${endpoint.failureCount || 0}).`
    }
  ];
  if (!Number(endpoint.lastCheckAt || 0)) {
    reasons.push({
      code: 'UNVERIFIED_ENDPOINT',
      en: 'Endpoint has not been health-checked yet; it is not advertised as fast.',
      fa: 'سلامت اندپوینت هنوز بررسی نشده و به‌عنوان سریع معرفی نمی‌شود.'
    });
  }
  if (protocol === 'xhttp') {
    reasons.push({
      code: 'XHTTP_TRANSPORT',
      en: 'xHTTP is delivered as a VLESS transport and is unsupported in some client formats.',
      fa: 'xHTTP به‌صورت ترنسپورت VLESS ارائه می‌شود و در برخی فرمت‌های کلاینت پشتیبانی نمی‌شود.'
    });
  }
  if (format) {
    reasons.push({
      code: 'FORMAT',
      en: `Output format ${format.label}.`,
      fa: `فرمت خروجی ${format.label}.`
    });
  }
  return reasons;
}

/**
 * Build and validate all candidate plans for a user.
 * @returns {{ valid: Array, rejected: Array, formats: Array }}
 */
function buildPlans({ user, endpoints = [], settings = {}, formats = [], limit = 24 }) {
  const cfg = normalizeEffectiveConfig({ ...(user.config || {}), ...settings });
  const merged = effectiveSettings(cfg);
  const policy = String(merged.optimizationPolicy || 'balanced');
  const allowedFormats = (formats.length ? formats : String(merged.subFormats || 'uri').split(','))
    .map(id => formatById(id))
    .filter(Boolean);
  const tlsModeFor = endpoint => (PLAINTEXT_PORTS.has(Number(endpoint.port)) ? 'none' : 'tls');
  const dnsProfile = getDnsProfile(String(cfg.dnsProfileId || 'cloudflare'))?.id || 'custom';
  const chain = String(cfg.s || '');

  const protocolsToTry = ['vless', 'trojan', 'shadowsocks', 'xhttp'].filter(id => protocolEnabled(cfg, id));
  const candidates = [];
  const rejected = [];
  const seen = new Set();

  for (const endpoint of endpoints) {
    if (!endpoint || endpoint.enabled === false) continue;
    const base = {
      endpointId: endpoint.id || '',
      host: endpoint.host,
      port: endpoint.port,
      chain: chain || '',
      dnsProfile
    };
    const combos = [];
    for (const protocol of protocolsToTry) {
      if (protocol === 'xhttp') {
        combos.push({ ...base, protocol, transport: 'xhttp', tlsMode: 'tls' });
      } else if (protocol === 'trojan') {
        combos.push({ ...base, protocol, transport: 'ws', tlsMode: tlsModeFor(endpoint) });
      } else {
        combos.push({ ...base, protocol, transport: 'ws', tlsMode: tlsModeFor(endpoint) });
      }
    }

    for (const combo of combos) {
      for (const format of allowedFormats) {
        const candidate = { ...combo, format: format.id };
        const key = dedupeKey(candidate) + '|' + format.id;
        if (seen.has(key)) continue;
        seen.add(key);
        const validation = validateCandidate(candidate, user, cfg);
        if (!validation.valid) {
          rejected.push({
            ...candidate,
            endpointName: endpoint.name,
            reason: validation.issues.find(issue => issue.severity === 'error')
          });
          continue;
        }
        const score = scoreCandidate({ endpoint, protocol: candidate.protocol, policy, user });
        candidates.push({
          ...candidate,
          endpointName: endpoint.name,
          country: endpoint.country || '',
          score,
          healthScore: Number(endpoint.healthScore || 0),
          latencyMs: Number(endpoint.lastLatencyMs || 0),
          issues: validation.issues,
          reasons: explainSelection({ endpoint, protocol: candidate.protocol, format, score, policy })
        });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.endpointId.localeCompare(b.endpointId));
  const valid = candidates.slice(0, Math.max(1, limit));
  return {
    valid,
    rejected: rejected.slice(0, 50),
    formats: allowedFormats.map(format => format.id),
    policy
  };
}

function configurationRow(plan, userId, now = Date.now(), index = 0) {
  // Two plans can share the same dedupe key while differing in client format,
  // so the position in the generated batch is part of the identifier.
  const finger = Math.round(hashString(`${userId}|${dedupeKey(plan)}|${now}`) * 0xffffffff) >>> 0;
  const id = `cfg-${finger.toString(36)}-${Number(index || 0).toString(36)}`;
  return {
    id,
    userId,
    protocol: plan.protocol,
    endpointId: plan.endpointId || '',
    transport: plan.transport,
    tlsMode: plan.tlsMode,
    dnsProfile: plan.dnsProfile || '',
    chain: JSON.stringify(plan.chain ? [plan.chain] : []),
    clientFormat: plan.format || '',
    valid: 1,
    validation: JSON.stringify({
      issues: plan.issues || [],
      reasons: plan.reasons || [],
      score: plan.score || 0
    }),
    reason: (plan.reasons || []).map(item => item.en).join(' '),
    score: Math.round(Number(plan.score || 0)),
    createdAt: now
  };
}

function summarizeRejections(rejected = []) {
  const counts = new Map();
  for (const item of rejected) {
    const code = item.reason?.code || 'UNKNOWN';
    counts.set(code, (counts.get(code) || 0) + 1);
  }
  return [...counts.entries()].map(([code, count]) => ({ code, count }));
}


// --- MODULE: src/core/scanner.js ---
// ============================================================================
// miliconfigOS v4.0 - Layered endpoint scanner
// Levels are independent and reported separately:
//   syntax -> dns -> tcp -> tls -> http
// "proxy" is only reported when an actual protocol exchange is performed, which
// this Worker does not implement for third-party endpoints.
// ============================================================================


const DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

function withTimeout(promise, ms, message = 'timeout') {
  return Promise.race([
    promise,
    new Promise((_resolve, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
}

async function probeTcpPort(host, port, timeoutMs = 2500) {
  const started = Date.now();
  let socket;
  try {
    socket = connect({ hostname: host, port });
    await withTimeout(socket.opened, timeoutMs, 'tcp-timeout');
    const latencyMs = Date.now() - started;
    try { socket.close(); } catch (_e) {}
    return { ok: true, performed: true, latencyMs, detail: 'TCP connection established' };
  } catch (err) {
    try { if (socket) socket.close(); } catch (_e2) {}
    return { ok: false, performed: true, latencyMs: 0, detail: String(err?.message || err).slice(0, 120) };
  }
}

async function probeDns(host, timeoutMs = 3000) {
  if (isValidIpAddress(host)) {
    return { ok: true, performed: true, detail: 'Host is already an IP address', addresses: [host] };
  }
  if (!isValidDomain(host)) {
    return { ok: false, performed: true, detail: 'Not a DNS name' };
  }
  try {
    const res = await withTimeout(
      fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(host)}&type=A`, {
        headers: { Accept: 'application/dns-json', 'User-Agent': 'miliconfigos-scanner/4.0' }
      }),
      timeoutMs,
      'dns-timeout'
    );
    if (!res.ok) {
      return { ok: false, performed: true, detail: `DoH HTTP ${res.status}` };
    }
    const payload = await res.json();
    const parsed = parseDohAnswer(payload);
    return { ok: parsed.ok, performed: true, detail: parsed.detail, addresses: parsed.addresses };
  } catch (err) {
    return { ok: false, performed: true, detail: String(err?.message || err).slice(0, 120) };
  }
}

async function probeTls(host, port, timeoutMs = 4000) {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const safeHost = host.includes(':') ? `[${host}]` : host;
    const res = await fetch(`https://${safeHost}:${port}/`, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': 'miliconfigos-scanner/4.0' }
    });
    clearTimeout(timer);
    return interpretTlsProbe({ status: res.status, latencyMs: Date.now() - started });
  } catch (err) {
    return interpretTlsProbe({ error: err?.message || err });
  }
}

async function probeHttp(host, port, timeoutMs = 4000) {
  const started = Date.now();
  const safeHost = host.includes(':') ? `[${host}]` : host;
  const schemes = port === 80 ? ['http'] : ['https', 'http'];
  let lastError = 'no-attempt';
  for (const scheme of schemes) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${scheme}://${safeHost}:${port}/`, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'miliconfigos-scanner/4.0' }
      });
      clearTimeout(timer);
      return {
        ok: res.status > 0 && res.status < 500,
        performed: true,
        status: res.status,
        latencyMs: Date.now() - started,
        detail: `${scheme.toUpperCase()} ${res.status}`
      };
    } catch (err) {
      lastError = String(err?.message || err);
    }
  }
  return { ok: false, performed: true, detail: lastError.slice(0, 120) };
}

/**
 * Run the requested layers against one host.
 * @param {object} target { host, port, levels?: string[], tls?: boolean }
 */
async function checkTarget(target, options = {}) {
  const host = normalizeNodeHost(target?.host);
  const port = parseInt(target?.port, 10) || 443;
  const timeoutMs = Math.min(15000, Math.max(500, Number(options.timeoutMs) || 4000));
  const requested = Array.isArray(target?.levels) && target.levels.length
    ? target.levels
    : ['syntax', 'dns', 'tcp', 'tls', 'http'];

  const checks = {};
  const syntaxOk = Boolean(host) && port >= 1 && port <= 65535 && (isValidIpAddress(host) || isValidDomain(host));
  checks.syntax = {
    performed: true,
    ok: syntaxOk,
    detail: syntaxOk ? 'Address and port are well formed' : 'Invalid host or port'
  };
  if (!syntaxOk) {
    return { host, port, checks, ...scoreHealth({ checks }), checkedAt: Date.now() };
  }

  if (requested.includes('dns')) checks.dns = await probeDns(host, timeoutMs);

  const tcpEnabled = requested.some(level => ['tcp', 'tls', 'http'].includes(level));
  if (tcpEnabled) {
    checks.tcp = await probeTcpPort(host, port, Math.min(timeoutMs, 4000));
    if (!checks.tcp.ok) {
      return { host, port, checks, ...scoreHealth({ checks }), checkedAt: Date.now() };
    }
  }
  if (requested.includes('tls') && port !== 80) checks.tls = await probeTls(host, port, timeoutMs);
  if (requested.includes('http')) checks.http = await probeHttp(host, port, timeoutMs);

  return {
    host,
    port,
    checks,
    ...scoreHealth({ checks }),
    checkedAt: Date.now()
  };
}

/**
 * Scan many endpoints with bounded concurrency.
 */
async function scanTargets(targets = [], options = {}) {
  const concurrency = Math.min(8, Math.max(1, Number(options.concurrency) || 4));
  const started = Date.now();
  const results = await mapLimit(targets, concurrency, target => checkTarget(target, options));
  return {
    results,
    concurrency,
    durationMs: Date.now() - started,
    checkedAt: Date.now()
  };
}

/** ECH verification: look for an HTTPS/SVCB record through DoH. */
async function checkEchRecord(hostname) {
  const host = normalizeNodeHost(hostname);
  if (!isValidDomain(host)) {
    return { ok: false, detail: 'Not a DNS name', record: null };
  }
  try {
    const res = await fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(host)}&type=HTTPS`, {
      headers: { Accept: 'application/dns-json', 'User-Agent': 'miliconfigos-scanner/4.0' }
    });
    if (!res.ok) return { ok: false, detail: `DoH HTTP ${res.status}`, record: null };
    const payload = await res.json();
    const records = Array.isArray(payload.Answer) ? payload.Answer : [];
    const https = records.filter(record => record.type === 65);
    const withEch = https.filter(record => /\bech\s*=/i.test(String(record.data || '')));
    return {
      ok: withEch.length > 0,
      detail: withEch.length
        ? 'HTTPS/SVCB record publishes an ech parameter'
        : (https.length ? 'HTTPS record found but no ech parameter' : 'No HTTPS/SVCB record'),
      record: https[0]?.data || null
    };
  } catch (err) {
    return { ok: false, detail: String(err?.message || err).slice(0, 120), record: null };
  }
}


// --- MODULE: src/ui/icons.js ---
// ============================================================================
// miliconfig v3.1 - مجموعه آیکون‌های اختصاصی SVG (بدون هیچ ایموجی)
// تمام آیکون‌ها stroke-based و با currentColor رنگ می‌گیرند.
// ============================================================================

const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu;

function stripEmoji(text = '') {
  return String(text).replace(EMOJI_RE, '');
}

const wrap = (body, extraClass = '') =>
  `<svg class="mi ${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  dashboard: wrap('<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'),
  users: wrap('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.1 2.5-5.2 5.5-5.2s5.5 2.1 5.5 5.2"/><path d="M16.2 5.4a3 3 0 0 1 0 5.6"/><path d="M17.6 14.6c2 .6 3.4 2.4 3.4 4.7"/>'),
  settings: wrap('<path d="M4 7h9"/><path d="M17 7h3"/><circle cx="15" cy="7" r="2.2"/><path d="M4 17h3"/><path d="M11 17h9"/><circle cx="9" cy="17" r="2.2"/>'),
  radar: wrap('<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><path d="M12 12l6-5.6"/>'),
  globe: wrap('<circle cx="12" cy="12" r="8.8"/><path d="M3.4 12h17.2"/><path d="M12 3.2c2.6 2.4 3.9 5.4 3.9 8.8s-1.3 6.4-3.9 8.8c-2.6-2.4-3.9-5.4-3.9-8.8S9.4 5.6 12 3.2z"/>'),
  bolt: wrap('<path d="M13.2 2.8 4.8 13.4h5.6l-1.2 7.8 8.8-11h-5.8l1-7.4z"/>'),
  shield: wrap('<path d="M12 3 20 6.2v5.4c0 4.9-3.3 8.6-8 10.4-4.7-1.8-8-5.5-8-10.4V6.2L12 3z"/><path d="m8.8 12 2.4 2.4 4-4.4"/>'),
  copy: wrap('<rect x="9" y="9" width="11" height="11" rx="2.4"/><path d="M15.2 6.4V5.6A2.4 2.4 0 0 0 12.8 3.2H6.4A2.4 2.4 0 0 0 4 5.6v6.4a2.4 2.4 0 0 0 2.4 2.4h.8"/>'),
  trash: wrap('<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l.9 12.2h9.2L17.5 7"/><path d="M10.2 10.5v5.4"/><path d="M13.8 10.5v5.4"/>'),
  refresh: wrap('<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.4h-4.4"/>'),
  plus: wrap('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  lock: wrap('<rect x="4.5" y="10" width="15" height="10" rx="2.6"/><path d="M8.2 10V7.6a3.8 3.8 0 0 1 7.6 0V10"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/>'),
  key: wrap('<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8"/><path d="m16 4 4 4"/><path d="m14 6 4 4"/>'),
  logout: wrap('<path d="M14.5 4.5h-7A2.5 2.5 0 0 0 5 7v10a2.5 2.5 0 0 0 2.5 2.5h7"/><path d="M11 12h9"/><path d="m17 8.5 3.5 3.5L17 15.5"/>'),
  link: wrap('<path d="M10.2 6.8 12.6 4.4a4.1 4.1 0 0 1 5.8 5.8l-2.4 2.4"/><path d="M13.8 17.2 11.4 19.6a4.1 4.1 0 0 1-5.8-5.8l2.4-2.4"/><path d="m9.4 14.6 5.2-5.2"/>'),
  download: wrap('<path d="M12 3.5v11"/><path d="m7.6 10.6 4.4 4.4 4.4-4.4"/><path d="M4.5 19.5h15"/>'),
  check: wrap('<path d="m4.5 12.5 4.8 4.8L19.5 6.8"/>'),
  close: wrap('<path d="m6 6 12 12"/><path d="m18 6-12 12"/>'),
  sun: wrap('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>'),
  moon: wrap('<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.6 8.6 0 1 0 20 14.2z"/>'),
  database: wrap('<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>'),
  activity: wrap('<path d="M3 12h3.4l2.2-6.6 3.6 13.2L15 12h6"/>'),
  wifi: wrap('<path d="M4 9.4a12.5 12.5 0 0 1 16 0"/><path d="M7 12.6a8.2 8.2 0 0 1 10 0"/><path d="M9.8 15.8a4 4 0 0 1 4.4 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor"/>'),
  layers: wrap('<path d="m12 3.5 8.4 4.4L12 12.3 3.6 7.9 12 3.5z"/><path d="m4.6 12.4 7.4 3.9 7.4-3.9"/><path d="m4.6 16.6 7.4 3.9 7.4-3.9"/>'),
  clock: wrap('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.2 2"/>'),
  terminal: wrap('<rect x="3" y="4.5" width="18" height="15" rx="2.6"/><path d="m7.4 9.6 2.6 2.4-2.6 2.4"/><path d="M12.8 14.6h3.8"/>'),
  external: wrap('<path d="M13.5 4.5h6v6"/><path d="m19.5 4.5-8 8"/><path d="M18 14v4.2a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 18.2V7.8A1.8 1.8 0 0 1 5.8 6H10"/>'),
  server: wrap('<rect x="3.5" y="4" width="17" height="6.4" rx="2"/><rect x="3.5" y="13.6" width="17" height="6.4" rx="2"/><path d="M7 7.2h.01M7 16.8h.01"/>'),
  power: wrap('<path d="M12 3.5v8"/><path d="M7 6.2a8 8 0 1 0 10 0"/>'),
  chevron: wrap('<path d="m8.5 5.5 6.5 6.5-6.5 6.5"/>'),
  signal: wrap('<path d="M4.5 19.5v-4"/><path d="M9.5 19.5v-8"/><path d="M14.5 19.5v-12"/><path d="M19.5 19.5v-16"/>'),
  gauge: wrap('<path d="M4.2 17.5a8.4 8.4 0 1 1 15.6 0"/><path d="m12 13.5 3.6-4.2"/><circle cx="12" cy="14.6" r="1.5"/>'),
  branch: wrap('<circle cx="6.5" cy="6" r="2.2"/><circle cx="6.5" cy="18" r="2.2"/><circle cx="17.5" cy="8.5" r="2.2"/><path d="M6.5 8.2v7.6"/><path d="M17.5 10.7c0 3.1-2.4 5.3-6 6.3"/>'),
  search: wrap('<circle cx="11" cy="11" r="6.4"/><path d="m16 16 4.2 4.2"/>'),
  filter: wrap('<path d="M4 5.5h16l-6 7.2v5.6l-4 2v-7.6L4 5.5z"/>')
};

function icon(name, extraClass = '') {
  const raw = ICONS[name] || ICONS.dashboard;
  return extraClass ? raw.replace('class="mi ', `class="mi ${extraClass} `) : raw;
}

const SHIELD_LOGO_SVG = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="mili-shield-svg">
  <circle cx="32" cy="32" r="30" fill="#08110b" stroke="#65a30d" stroke-width="1.5" stroke-opacity="0.65"/>
  <circle cx="32" cy="32" r="24" fill="#0c1a12"/>
  <path d="M32 16L44 21.2V30.8C44 39.4 38.88 46.84 32 49.5C25.12 46.84 20 39.4 20 30.8V21.2L32 16Z" stroke="#b5ff4d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M27.4 31.6L30.8 35L37 28.6" stroke="#b5ff4d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const CLOUD_LOGO_SVG = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="mili-cloud-svg">
  <rect x="4" y="4" width="56" height="56" rx="18" fill="#080d09" stroke="#3f6212" stroke-width="1.6"/>
  <path d="M25.5 42H40.5C44.6421 42 48 38.6421 48 34.5C48 30.491 44.8544 27.2165 40.8926 27.0104C39.2471 21.7876 34.3652 18 28.6 18C21.4203 18 15.6 23.8203 15.6 31C15.6 37.0751 20.1249 42 25.5 42Z" stroke="#b5ff4d" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const FAVICON_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#05080a" stroke="#a3e635" stroke-width="3"/><path d="M32 15L45 20.5V30.8C45 39.8 39.5 47.5 32 50.5C24.5 47.5 19 39.8 19 30.8V20.5L32 15Z" fill="none" stroke="#b5ff4d" stroke-width="4" stroke-linejoin="round"/></svg>`
)}`;


// --- MODULE: src/db/d1.js ---
// ============================================================================
// miliconfig v3.1 - لایه دیتابیس Cloudflare D1 با Auto-Migration،
// محدودیت سقف ۳ کاربر، سیستم رمز عبور مدیر و Fallback هوشمند
// ============================================================================


// حافظه کش داخلی هر Isolate جهت کارکرد بدون وقفه و حداکثر سرعت
const memoryStore = {
  initialized: false,
  d1SchemaReady: false,
  bootTime: Date.now(),
  globalConfig: {},
  users: new Map(),
  auditLogs: [],
  trafficHourly: new Map(),
  lastSyncAt: 0,
  adminPasswordHash: '',
  adminPath: ''
};

function detectD1Binding(env) {
  if (!env || typeof env !== 'object') return null;
  const priorityNames = ['DB', 'D1', 'db', 'd1', 'MILICONFIG_DB', 'miliconfig_db', 'DATABASE', 'database'];
  for (const name of priorityNames) {
    const candidate = env[name];
    if (candidate && typeof candidate === 'object' && typeof candidate.prepare === 'function') {
      return { db: candidate, bindingName: name };
    }
  }
  for (const [key, val] of Object.entries(env)) {
    if (val && typeof val === 'object' && typeof val.prepare === 'function') {
      return { db: val, bindingName: key };
    }
  }
  return null;
}

function detectKvBinding(env) {
  if (!env || typeof env !== 'object') return null;
  const priorityNames = ['C', 'c', 'KV', 'kv', 'MILICONFIG_KV'];
  for (const name of priorityNames) {
    const candidate = env[name];
    if (
      candidate &&
      typeof candidate === 'object' &&
      typeof candidate.get === 'function' &&
      typeof candidate.put === 'function' &&
      typeof candidate.prepare !== 'function'
    ) {
      return { kv: candidate, bindingName: name };
    }
  }
  for (const [key, val] of Object.entries(env)) {
    if (
      val &&
      typeof val === 'object' &&
      typeof val.get === 'function' &&
      typeof val.put === 'function' &&
      typeof val.prepare !== 'function'
    ) {
      return { kv: val, bindingName: key };
    }
  }
  return null;
}

function safeBind(stmt, ...params) {
  const sanitized = params.map(p => {
    if (p === undefined) return null;
    if (typeof p === 'number' && !Number.isFinite(p)) return 0;
    if (typeof p === 'boolean') return p ? 1 : 0;
    return p;
  });
  return stmt.bind(...sanitized);
}

function getAdminUuid(env = {}) {
  // UUID پیش‌فرض عمومی حذف شده است؛ فقط مقدار محیطی یا مسیر رندوم همین نصب
  const raw = env?.u || env?.U || env?.UUID || env?.uuid || memoryStore.adminPath || '';
  return String(raw).trim().toLowerCase();
}

// مسیر مدیریت بدون UUID پیش‌فرض عمومی:
// اگر متغیر محیطی u/UUID تنظیم نشده باشد، یک UUID رندوم یکتا برای همین نصب ساخته
// و در D1/KV ذخیره می‌شود؛ بنابراین هیچ مسیر قابل حدسی روی استقرار وجود ندارد.
async function getOrCreateAdminPath(env = {}) {
  const envValue = env?.u || env?.U || env?.UUID || env?.uuid;
  if (envValue && String(envValue).trim()) {
    return String(envValue).trim().toLowerCase();
  }
  if (memoryStore.adminPath) return memoryStore.adminPath;

  await ensureD1Schema(env);
  const key = 'admin_path';
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const row = await detectedD1.db.prepare('SELECT value FROM system_config WHERE key = ?').bind(key).first();
      if (row && row.value) {
        memoryStore.adminPath = String(row.value).trim().toLowerCase();
        return memoryStore.adminPath;
      }
    } catch (_e) {}
  }

  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try {
      const kvVal = await detectedKv.kv.get(key);
      if (kvVal) {
        memoryStore.adminPath = String(kvVal).trim().toLowerCase();
        return memoryStore.adminPath;
      }
    } catch (_e) {}
  }

  const generated = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : generateUuidV4();
  memoryStore.adminPath = generated;

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await detectedD1.db.prepare(
        'INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
      ).bind(key, generated, Date.now()).run();
    } catch (_e) {}
  }
  if (detectedKv) {
    try { await detectedKv.kv.put(key, generated); } catch (_e) {}
  }
  return generated;
}

// توکن نشست مدیریت: مشتق‌شده از هش رمز عبور (با تغییر رمز، نشست‌های قبلی باطل می‌شوند)
// نشست مدیریت: توکن تصادفی با انقضا در D1 (جایگزین توکن مشتق‌شده از هش رمز)
async function buildAdminSessionToken(env = {}) {
  const hasPassword = await hasAdminPassword(env);
  if (!hasPassword) return '';
  const cfg = await loadGlobalConfig(env);
  try {
    const { createAdminSession } = await import('./v4.js');
    const session = await createAdminSession(env, { ttlHours: cfg.sessionHours || 12 });
    return session.token;
  } catch (_e) {
    return '';
  }
}

async function verifyAdminSession(env = {}, token = '') {
  const clean = String(token || '').trim();
  if (!clean) return false;
  try {
    const { verifyAdminSessionToken } = await import('./v4.js');
    const result = await verifyAdminSessionToken(env, clean);
    return result.valid === true;
  } catch (_e) {
    return false;
  }
}

// چرخش مسیر مدیریت: تولید UUID جدید و ذخیره آن (امکان تغییر مسیر در هر زمان)
async function rotateAdminPath(env = {}) {
  await ensureD1Schema(env);
  const generated = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : generateUuidV4();
  memoryStore.adminPath = generated;

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await detectedD1.db.prepare(
        'INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
      ).bind('admin_path', generated, Date.now()).run();
    } catch (_e) {}
  }
  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try { await detectedKv.kv.put('admin_path', generated); } catch (_e) {}
  }
  await addAuditLog(env, 'چرخش مسیر مدیریت', 'Admin path rotated', '');
  return generated;
}

// ساخت خودکار جداول D1 (Auto-Migration)
async function ensureD1Schema(env = {}, force = false) {
  const detected = detectD1Binding(env);
  if (!detected) {
    ensureMemorySeeded(env);
    return { d1Enabled: false, bindingName: null, migrated: false };
  }
  const { db, bindingName } = detected;
  if (memoryStore.d1SchemaReady && !force) {
    return { d1Enabled: true, bindingName, migrated: true };
  }

  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      uuid TEXT NOT NULL UNIQUE,
      sub_node_count INTEGER NOT NULL DEFAULT 50,
      status TEXT NOT NULL DEFAULT 'active',
      enabled INTEGER NOT NULL DEFAULT 1,
      data_limit_gb REAL NOT NULL DEFAULT 0,
      used_bytes INTEGER NOT NULL DEFAULT 0,
      lifetime_bytes INTEGER NOT NULL DEFAULT 0,
      request_count INTEGER NOT NULL DEFAULT 0,
      expire_days INTEGER NOT NULL DEFAULT 0,
      expire_at INTEGER NOT NULL DEFAULT 0,
      start_on_first_use INTEGER NOT NULL DEFAULT 1,
      first_connected_at INTEGER NOT NULL DEFAULT 0,
      ip_limit INTEGER NOT NULL DEFAULT 50,
      node_scope TEXT NOT NULL DEFAULT 'all',
      preset TEXT NOT NULL DEFAULT 'iran-fast',
      note TEXT DEFAULT '',
      config_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS preferred_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      port INTEGER NOT NULL DEFAULT 443,
      name TEXT NOT NULL,
      colo TEXT DEFAULT '',
      latency INTEGER DEFAULT 0,
      source TEXT DEFAULT 'manual',
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      ip TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS traffic_hourly (
      hour_key TEXT PRIMARY KEY,
      bytes INTEGER NOT NULL DEFAULT 0,
      requests INTEGER NOT NULL DEFAULT 0
    )`
  ];

  try {
    for (const sql of ddlStatements) {
      await db.prepare(sql).run();
    }
    memoryStore.d1SchemaReady = true;

    // No user is created automatically: all five user slots belong to the
    // administrator. Creating a hidden starter account here would silently
    // consume capacity and ship an account nobody asked for.
    await addAuditLog(env, 'آماده‌سازی دیتابیس D1', `binding=${bindingName}`, 'system');

    return { d1Enabled: true, bindingName, migrated: true };
  } catch (err) {
    ensureMemorySeeded(env);
    return {
      d1Enabled: false,
      bindingName,
      migrated: false,
      error: err?.message || String(err)
    };
  }
}

function ensureMemorySeeded(env = {}) {
  if (memoryStore.initialized) return;
  memoryStore.initialized = true;
  const envSnap = getEnvConfigSnapshot(env);
  memoryStore.globalConfig = { ...envSnap };
  // Memory fallback mode starts empty on purpose: the five user slots are the
  // administrator's to fill, and nothing is invented on first boot.
}

function mapUserRow(row) {
  if (!row) return null;
  let parsedConfig = {};
  try {
    parsedConfig = typeof row.config_json === 'string' ? JSON.parse(row.config_json) : (row.config_json || row.config || {});
  } catch (_e) {
    parsedConfig = {};
  }
  const subNodeCount = Number.isFinite(Number(row.sub_node_count ?? row.subNodeCount))
    ? Number(row.sub_node_count ?? row.subNodeCount)
    : Number(parsedConfig.subNodeCount ?? 50);
  const effectiveConfig = normalizeEffectiveConfig({
    ...CONFIG_DEFAULTS,
    ...parsedConfig,
    subNodeCount
  });
  return {
    id: String(row.id),
    username: String(row.username || row.id),
    uuid: String(row.uuid || '').toLowerCase(),
    subNodeCount,
    status: String(row.status || 'active'),
    enabled: Boolean(row.enabled === undefined ? true : Number(row.enabled) !== 0),
    dataLimitGb: Number(row.data_limit_gb ?? row.dataLimitGb ?? 0),
    usedBytes: Number(row.used_bytes ?? row.usedBytes ?? 0),
    lifetimeBytes: Number(row.lifetime_bytes ?? row.lifetimeBytes ?? 0),
    requestCount: Number(row.request_count ?? row.requestCount ?? 0),
    expireDays: Number(row.expire_days ?? row.expireDays ?? 0),
    expireAt: Number(row.expire_at ?? row.expireAt ?? 0),
    startOnFirstUse: Boolean(row.start_on_first_use === undefined ? (row.startOnFirstUse ?? true) : Number(row.start_on_first_use) !== 0),
    firstConnectedAt: Number(row.first_connected_at ?? row.firstConnectedAt ?? 0),
    ipLimit: Number(row.ip_limit ?? row.ipLimit ?? 50),
    nodeScope: String(row.node_scope || row.nodeScope || 'all'),
    preset: String(row.preset || 'iran-fast'),
    note: String(row.note || ''),
    config: effectiveConfig,
    createdAt: Number(row.created_at ?? row.createdAt ?? Date.now()),
    updatedAt: Number(row.updated_at ?? row.updatedAt ?? Date.now())
  };
}

// ============================================================================
// مدیریت سیستم رمز عبور مدیر (بررسی، راه‌اندازی اول، تغییر پسورد)
// ============================================================================
async function getAdminPasswordHash(env = {}) {
  await ensureD1Schema(env);
  if (memoryStore.adminPasswordHash) return memoryStore.adminPasswordHash;

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const row = await detectedD1.db.prepare(`SELECT value FROM system_config WHERE key = 'admin_password_hash'`).first();
      if (row && row.value) {
        memoryStore.adminPasswordHash = String(row.value).trim();
        return memoryStore.adminPasswordHash;
      }
    } catch (_e) {}
  }

  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try {
      const kvVal = await detectedKv.kv.get('admin_password_hash');
      if (kvVal) {
        memoryStore.adminPasswordHash = String(kvVal).trim();
        return memoryStore.adminPasswordHash;
      }
    } catch (_e) {}
  }

  return memoryStore.adminPasswordHash || '';
}

async function hasAdminPassword(env = {}) {
  const hash = await getAdminPasswordHash(env);
  return Boolean(hash && hash.length > 0);
}

async function setAdminPassword(env = {}, plainPassword, clientIp = '') {
  const cleanPass = String(plainPassword || '').trim();
  const policy = passwordPolicy(cleanPass);
  if (!policy.ok) {
    throw new Error(policy.message);
  }
  // اطمینان از آماده بودن اسکیما پیش از نوشتن؛ رفع باگ «فراموش شدن رمز»
  await ensureD1Schema(env);
  const hash = await hashPassword(cleanPass);
  memoryStore.adminPasswordHash = hash;

  const now = Date.now();
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `INSERT INTO system_config (key, value, updated_at) VALUES ('admin_password_hash', ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
        ),
        hash,
        now
      ).run();
    } catch (_e) {}
  }

  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try {
      await detectedKv.kv.put('admin_password_hash', hash);
    } catch (_e) {}
  }

  // با تغییر رمز، همه نشست‌های قبلی باطل می‌شوند
  try {
    const { revokeAllAdminSessions } = await import('./v4.js');
    await revokeAllAdminSessions(env);
  } catch (_e) {}

  await addAuditLog(env, 'تعیین رمز عبور مدیر', 'Admin password updated', clientIp);
  return true;
}

// راه‌اندازی اولیه: فقط یک بار و به‌صورت اتمیک (جلوگیری از تکرار Setup)
async function initializeAdminPassword(env = {}, plainPassword, clientIp = '') {
  const cleanPass = String(plainPassword || '').trim();
  const policy = passwordPolicy(cleanPass);
  if (!policy.ok) throw new Error(policy.message);

  await ensureD1Schema(env);
  if (await getAdminPasswordHash(env)) {
    throw new Error('SETUP_COMPLETE: Initial administrator setup is already complete.');
  }

  const hash = await hashPassword(cleanPass);
  const now = Date.now();
  const detectedD1 = detectD1Binding(env);
  let claimed = false;

  if (detectedD1 && memoryStore.d1SchemaReady) {
    const res = await safeBind(
      detectedD1.db.prepare(
        `INSERT INTO system_config (key, value, updated_at)
         SELECT 'admin_password_hash', ?, ?
         WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE key = 'admin_password_hash')`
      ),
      hash,
      now
    ).run();
    claimed = Number(res?.meta?.changes ?? res?.changes ?? 0) > 0;
    if (!claimed) throw new Error('SETUP_COMPLETE: Initial administrator setup is already complete.');
  } else {
    if (memoryStore.adminPasswordHash) {
      throw new Error('SETUP_COMPLETE: Initial administrator setup is already complete.');
    }
    claimed = true;
  }

  memoryStore.adminPasswordHash = hash;
  const detectedKv = detectKvBinding(env);
  if (detectedKv) {
    try { await detectedKv.kv.put('admin_password_hash', hash); } catch (_e) {}
  }

  try {
    const { revokeAllAdminSessions } = await import('./v4.js');
    await revokeAllAdminSessions(env);
  } catch (_e) {}

  await addAuditLog(env, 'راه‌اندازی اولیه مدیر', 'Initial administrator account created', clientIp);
  return true;
}

async function verifyAdminPassword(env = {}, candidatePassword) {
  const cleanPass = String(candidatePassword || '').trim();
  if (!cleanPass) return false;
  const hash = await getAdminPasswordHash(env);
  if (!hash) return false;
  const result = await verifyPassword(cleanPass, hash);
  if (!result.ok) return false;

  // ارتقای خودکار هش قدیمی SHA-256 به PBKDF2 پس از ورود موفق
  if (result.needsRehash) {
    try {
      const upgraded = await hashPassword(cleanPass);
      memoryStore.adminPasswordHash = upgraded;
      const detectedD1 = detectD1Binding(env);
      if (detectedD1 && memoryStore.d1SchemaReady) {
        await detectedD1.db.prepare(
          `INSERT INTO system_config (key, value, updated_at) VALUES ('admin_password_hash', ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
        ).bind(upgraded, Date.now()).run();
      }
      const detectedKv = detectKvBinding(env);
      if (detectedKv) await detectedKv.kv.put('admin_password_hash', upgraded);
      await addAuditLog(env, 'ارتقای الگوریتم رمز عبور', 'Password hash upgraded to PBKDF2', '');
    } catch (_e) {}
  }
  return true;
}

async function changeAdminPassword(env = {}, currentPassword, newPassword, clientIp = '') {
  const isMatch = await verifyAdminPassword(env, currentPassword);
  if (!isMatch) {
    throw new Error('رمز عبور فعلی نادرست است.');
  }
  return await setAdminPassword(env, newPassword, clientIp);
}

// تنظیمات سراسری پنل
async function loadGlobalConfig(env = {}, force = false) {
  await ensureD1Schema(env);
  const envSnap = getEnvConfigSnapshot(env);
  const detectedD1 = detectD1Binding(env);
  const detectedKv = detectKvBinding(env);

  if (!force && memoryStore.lastSyncAt > 0 && Date.now() - memoryStore.lastSyncAt < 15000) {
    return normalizeEffectiveConfig({
      ...CONFIG_DEFAULTS,
      ...envSnap,
      ...memoryStore.globalConfig
    });
  }

  let stored = {};
  if (detectedKv) {
    try {
      const kvRaw = await detectedKv.kv.get('c');
      if (kvRaw) stored = { ...stored, ...JSON.parse(kvRaw) };
    } catch (_e) {}
  }

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const res = await detectedD1.db.prepare(`SELECT key, value FROM system_config`).all();
      const rows = res?.results || [];
      for (const r of rows) {
        if (r && r.key) {
          stored[r.key] = r.value;
        }
      }
    } catch (_e) {}
  }

  memoryStore.globalConfig = { ...memoryStore.globalConfig, ...stored };
  memoryStore.lastSyncAt = Date.now();
  return normalizeEffectiveConfig({
    ...CONFIG_DEFAULTS,
    ...envSnap,
    ...memoryStore.globalConfig
  });
}

async function saveGlobalConfig(env = {}, newValues = {}) {
  await ensureD1Schema(env);
  const detectedD1 = detectD1Binding(env);
  const detectedKv = detectKvBinding(env);
  const now = Date.now();

  for (const [k, v] of Object.entries(newValues || {})) {
    if (v === '' || v === null || v === undefined) {
      delete memoryStore.globalConfig[k];
    } else {
      memoryStore.globalConfig[k] = String(v);
    }
  }

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      for (const [k, v] of Object.entries(newValues || {})) {
        if (v === '' || v === null || v === undefined) {
          await safeBind(detectedD1.db.prepare(`DELETE FROM system_config WHERE key = ?`), k).run();
        } else {
          await safeBind(
            detectedD1.db.prepare(
              `INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?)
               ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
            ),
            k,
            String(v),
            now
          ).run();
        }
      }
    } catch (_e) {}
  }

  if (detectedKv) {
    try {
      await detectedKv.kv.put('c', JSON.stringify(memoryStore.globalConfig));
      await detectedKv.kv.put('c_ver', String(now));
    } catch (_e) {}
  }

  memoryStore.lastSyncAt = now;
  return await loadGlobalConfig(env, true);
}

async function resetGlobalConfig(env = {}) {
  await ensureD1Schema(env);
  const detectedD1 = detectD1Binding(env);
  const detectedKv = detectKvBinding(env);
  memoryStore.globalConfig = {};

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      // اعتبارنامه مدیر و رازهای ارائه‌دهنده با بازنشانی تنظیمات پاک نمی‌شوند
      await detectedD1.db.prepare(
        `DELETE FROM system_config WHERE key != 'admin_password_hash' AND key NOT LIKE 'cf!_%' ESCAPE '!'`
      ).run();
    } catch (_e) {}
  }
  if (detectedKv) {
    try {
      await detectedKv.kv.put('c', JSON.stringify({}));
      await detectedKv.kv.put('c_ver', String(Date.now()));
    } catch (_e) {}
  }
  memoryStore.lastSyncAt = Date.now();
  return await loadGlobalConfig(env, true);
}

// لیست کاربران
async function listUsers(env = {}) {
  await ensureD1Schema(env);
  const detectedD1 = detectD1Binding(env);

  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const res = await detectedD1.db.prepare(`SELECT * FROM users ORDER BY created_at DESC`).all();
      const users = (res?.results || []).map(mapUserRow).filter(Boolean);
      memoryStore.users.clear();
      for (const u of users) memoryStore.users.set(u.id, u);
      return users;
    } catch (_e) {}
  }

  ensureMemorySeeded(env);
  return Array.from(memoryStore.users.values()).sort((a, b) => b.createdAt - a.createdAt);
}

async function getUserByIdOrToken(env = {}, token = '') {
  if (!token) return null;
  const clean = String(token).trim();
  const cleanLower = clean.toLowerCase().replace(/^\/+|\/+$/g, '');
  const users = await listUsers(env);
  for (const u of users) {
    if (
      u.id.toLowerCase() === cleanLower ||
      u.uuid.toLowerCase() === cleanLower ||
      u.username.toLowerCase() === cleanLower ||
      (u.config?.d && u.config.d.trim().replace(/^\/+|\/+$/g, '').toLowerCase() === cleanLower)
    ) {
      return u;
    }
  }
  return null;
}

// ایجاد کاربر جدید با قفل سخت‌گیرانه حداکثر ۵ کاربر
async function createUser(env = {}, payload = {}, clientIp = '') {
  await ensureD1Schema(env);

  // محدودیت قطعی حداکثر MAX_USERS_LIMIT کاربر (پیش‌بررسی برای پاسخ سریع؛
  // درج نهایی با INSERT ... SELECT ... WHERE COUNT(*) < LIMIT به‌صورت اتمیک انجام می‌شود)
  const currentUsers = await listUsers(env);
  if (currentUsers.length >= MAX_USERS_LIMIT) {
    throw new Error(`LIMIT_REACHED: سقف مجاز ایجاد کاربر (حداکثر ${MAX_USERS_LIMIT} کاربر) پر شده است. برای افزودن کاربر جدید، لطفاً یکی از کاربران قبلی را حذف کنید.`);
  }

  const globalCfg = await loadGlobalConfig(env);
  const now = Date.now();

  const presetId = payload.preset || 'iran-fast';
  const rawName = String(payload.username || payload.name || '').trim();
  const id = payload.id && String(payload.id).trim() ? String(payload.id).trim() : generateShortId('mili');
  const username = rawName || id;
  const uuid = isValidUuid(payload.uuid) ? String(payload.uuid).trim().toLowerCase() : generateUuidV4();

  const subNodeCountRaw = parseInt(payload.subNodeCount ?? payload.config?.subNodeCount ?? globalCfg.subNodeCount ?? 50, 10);
  const subNodeCount = Number.isFinite(subNodeCountRaw) && subNodeCountRaw >= 0 ? subNodeCountRaw : 50;

  const mergedUserConfig = buildUserDefaultConfig(
    payload.usePanelDefaults !== false ? globalCfg : CONFIG_DEFAULTS,
    presetId,
    {
      ...(payload.config || {}),
      wk: payload.wk ?? payload.config?.wk ?? globalCfg.wk ?? CONFIG_DEFAULTS.wk,
      ev: payload.ev ?? payload.config?.ev ?? globalCfg.ev ?? CONFIG_DEFAULTS.ev,
      et: payload.et ?? payload.config?.et ?? globalCfg.et ?? CONFIG_DEFAULTS.et,
      ex: payload.ex ?? payload.config?.ex ?? globalCfg.ex ?? CONFIG_DEFAULTS.ex,
      es: payload.es ?? payload.config?.es ?? globalCfg.es ?? CONFIG_DEFAULTS.es,
      sspass: payload.sspass ?? payload.config?.sspass ?? globalCfg.sspass ?? '',
      ssmethod: payload.ssmethod ?? payload.config?.ssmethod ?? globalCfg.ssmethod ?? 'chacha20-ietf-poly1305',
      ech: payload.ech ?? payload.config?.ech ?? globalCfg.ech ?? CONFIG_DEFAULTS.ech,
      tp: payload.tp ?? payload.config?.tp ?? globalCfg.tp ?? CONFIG_DEFAULTS.tp,
      customDNS: payload.customDNS ?? payload.config?.customDNS ?? globalCfg.customDNS ?? CONFIG_DEFAULTS.customDNS,
      customECHDomain: payload.customECHDomain ?? payload.config?.customECHDomain ?? globalCfg.customECHDomain ?? CONFIG_DEFAULTS.customECHDomain,
      alpn: payload.alpn ?? payload.config?.alpn ?? globalCfg.alpn ?? CONFIG_DEFAULTS.alpn,
      d: payload.d ?? payload.config?.d ?? '',
      p: payload.p ?? payload.config?.p ?? globalCfg.p ?? CONFIG_DEFAULTS.p,
      yx: payload.yx ?? payload.config?.yx ?? globalCfg.yx ?? CONFIG_DEFAULTS.yx,
      yxURL: payload.yxURL ?? payload.config?.yxURL ?? globalCfg.yxURL ?? CONFIG_DEFAULTS.yxURL,
      s: payload.s ?? payload.config?.s ?? globalCfg.s ?? CONFIG_DEFAULTS.s,
      homepage: payload.homepage ?? payload.config?.homepage ?? globalCfg.homepage ?? CONFIG_DEFAULTS.homepage,
      scu: payload.scu ?? payload.config?.scu ?? globalCfg.scu ?? CONFIG_DEFAULTS.scu,
      ena: payload.ena ?? payload.config?.ena ?? globalCfg.ena ?? CONFIG_DEFAULTS.ena,
      epd: payload.epd ?? payload.config?.epd ?? globalCfg.epd ?? CONFIG_DEFAULTS.epd,
      epi: payload.epi ?? payload.config?.epi ?? globalCfg.epi ?? CONFIG_DEFAULTS.epi,
      egi: payload.egi ?? payload.config?.egi ?? globalCfg.egi ?? CONFIG_DEFAULTS.egi,
      ae: payload.ae ?? payload.config?.ae ?? globalCfg.ae ?? CONFIG_DEFAULTS.ae,
      rm: payload.rm ?? payload.config?.rm ?? globalCfg.rm ?? CONFIG_DEFAULTS.rm,
      qj: payload.qj ?? payload.config?.qj ?? globalCfg.qj ?? CONFIG_DEFAULTS.qj,
      dkby: payload.dkby ?? payload.config?.dkby ?? globalCfg.dkby ?? CONFIG_DEFAULTS.dkby,
      yxby: payload.yxby ?? payload.config?.yxby ?? globalCfg.yxby ?? CONFIG_DEFAULTS.yxby,
      ipv4: payload.ipv4 ?? payload.config?.ipv4 ?? globalCfg.ipv4 ?? CONFIG_DEFAULTS.ipv4,
      ipv6: payload.ipv6 ?? payload.config?.ipv6 ?? globalCfg.ipv6 ?? CONFIG_DEFAULTS.ipv6,
      ispMobile: payload.ispMobile ?? payload.config?.ispMobile ?? globalCfg.ispMobile ?? CONFIG_DEFAULTS.ispMobile,
      ispUnicom: payload.ispUnicom ?? payload.config?.ispUnicom ?? globalCfg.ispUnicom ?? CONFIG_DEFAULTS.ispUnicom,
      ispTelecom: payload.ispTelecom ?? payload.config?.ispTelecom ?? globalCfg.ispTelecom ?? CONFIG_DEFAULTS.ispTelecom,
      jk: payload.jk ?? payload.config?.jk ?? globalCfg.jk ?? CONFIG_DEFAULTS.jk,
      fp: payload.fp ?? payload.config?.fp ?? globalCfg.fp ?? 'chrome',
      patt: payload.patt ?? payload.config?.patt ?? globalCfg.patt ?? '/?ed=2048',
      fragmentPreset: payload.fragmentPreset ?? payload.config?.fragmentPreset ?? globalCfg.fragmentPreset ?? 'mci',
      fragmentLength: payload.fragmentLength ?? payload.config?.fragmentLength ?? globalCfg.fragmentLength ?? '100-200',
      fragmentInterval: payload.fragmentInterval ?? payload.config?.fragmentInterval ?? globalCfg.fragmentInterval ?? '10-20',
      fragmentPackets: payload.fragmentPackets ?? payload.config?.fragmentPackets ?? globalCfg.fragmentPackets ?? 'tlshello',
      ipRotation: payload.ipRotation ?? payload.config?.ipRotation ?? globalCfg.ipRotation ?? 15,
      subNodeCount
    }
  );

  const dataLimitGb = Math.max(0, Number(payload.dataLimitGb ?? 0) || 0);
  const expireDays = Math.max(0, parseInt(payload.expireDays ?? 0, 10) || 0);
  const startOnFirstUse = payload.startOnFirstUse !== undefined ? Boolean(payload.startOnFirstUse) : true;
  const expireAt = !startOnFirstUse && expireDays > 0 ? now + expireDays * 86400 * 1000 : 0;
  const ipLimit = Math.max(1, parseInt(payload.ipLimit ?? 50, 10) || 50);
  const nodeScope = String(payload.nodeScope || 'all');
  const enabled = payload.enabled !== undefined ? Boolean(payload.enabled) : true;
  const note = String(payload.note || '');

  const userObj = {
    id,
    username,
    uuid,
    subNodeCount,
    status: enabled ? 'active' : 'disabled',
    enabled,
    dataLimitGb,
    usedBytes: 0,
    lifetimeBytes: 0,
    requestCount: 0,
    expireDays,
    expireAt,
    startOnFirstUse,
    firstConnectedAt: 0,
    ipLimit,
    nodeScope,
    preset: presetId,
    note,
    config: mergedUserConfig,
    createdAt: now,
    updatedAt: now
  };

  memoryStore.users.set(id, userObj);

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    let res;
    try {
      res = await safeBind(
        detectedD1.db.prepare(
          `INSERT INTO users (
            id, username, uuid, sub_node_count, status, enabled,
            data_limit_gb, used_bytes, lifetime_bytes, request_count,
            expire_days, expire_at, start_on_first_use, first_connected_at,
            ip_limit, node_scope, preset, note, config_json, created_at, updated_at
          ) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE (SELECT COUNT(*) FROM users) < ?`
        ),
        userObj.id,
        userObj.username,
        userObj.uuid,
        userObj.subNodeCount,
        userObj.status,
        userObj.enabled ? 1 : 0,
        userObj.dataLimitGb,
        0,
        0,
        0,
        userObj.expireDays,
        userObj.expireAt,
        userObj.startOnFirstUse ? 1 : 0,
        0,
        userObj.ipLimit,
        userObj.nodeScope,
        userObj.preset,
        userObj.note,
        JSON.stringify(userObj.config),
        now,
        now,
        MAX_USERS_LIMIT
      ).run();
    } catch (err) {
      memoryStore.users.delete(id);
      throw new Error('ساخت کاربر ناموفق بود (UUID یا شناسه تکراری است).');
    }

    const changes = Number(res?.meta?.changes ?? res?.changes ?? 0);
    if (!changes) {
      memoryStore.users.delete(id);
      const remaining = await listUsers(env);
      if (remaining.length >= MAX_USERS_LIMIT) {
        throw new Error(`LIMIT_REACHED: سقف مجاز ایجاد کاربر (حداکثر ${MAX_USERS_LIMIT} کاربر) پر شده است.`);
      }
      throw new Error('ساخت کاربر ناموفق بود؛ دوباره تلاش کنید.');
    }
  }

  await addAuditLog(env, 'ساخت کاربر جدید', `${userObj.username} (${currentUsers.length + 1}/${MAX_USERS_LIMIT})`, clientIp);
  return userObj;
}

async function updateUser(env = {}, userId, payload = {}, clientIp = '') {
  const existing = await getUserByIdOrToken(env, userId);
  if (!existing) return null;
  const now = Date.now();

  const subNodeCountRaw = parseInt(
    payload.subNodeCount ?? payload.config?.subNodeCount ?? existing.subNodeCount ?? 50,
    10
  );
  const subNodeCount = Number.isFinite(subNodeCountRaw) && subNodeCountRaw >= 0 ? subNodeCountRaw : existing.subNodeCount;

  const updatedConfig = normalizeEffectiveConfig({
    ...existing.config,
    ...(payload.config || {}),
    ...(payload.wk !== undefined ? { wk: payload.wk } : {}),
    ...(payload.ev !== undefined ? { ev: payload.ev } : {}),
    ...(payload.et !== undefined ? { et: payload.et } : {}),
    ...(payload.ex !== undefined ? { ex: payload.ex } : {}),
    ...(payload.es !== undefined ? { es: payload.es } : {}),
    ...(payload.sspass !== undefined ? { sspass: payload.sspass } : {}),
    ...(payload.ssmethod !== undefined ? { ssmethod: payload.ssmethod } : {}),
    ...(payload.ech !== undefined ? { ech: payload.ech } : {}),
    ...(payload.tp !== undefined ? { tp: payload.tp } : {}),
    ...(payload.customDNS !== undefined ? { customDNS: payload.customDNS } : {}),
    ...(payload.customECHDomain !== undefined ? { customECHDomain: payload.customECHDomain } : {}),
    ...(payload.alpn !== undefined ? { alpn: payload.alpn } : {}),
    ...(payload.d !== undefined ? { d: payload.d } : {}),
    ...(payload.p !== undefined ? { p: payload.p } : {}),
    ...(payload.yx !== undefined ? { yx: payload.yx } : {}),
    ...(payload.yxURL !== undefined ? { yxURL: payload.yxURL } : {}),
    ...(payload.s !== undefined ? { s: payload.s } : {}),
    ...(payload.homepage !== undefined ? { homepage: payload.homepage } : {}),
    ...(payload.scu !== undefined ? { scu: payload.scu } : {}),
    ...(payload.ena !== undefined ? { ena: payload.ena } : {}),
    ...(payload.epd !== undefined ? { epd: payload.epd } : {}),
    ...(payload.epi !== undefined ? { epi: payload.epi } : {}),
    ...(payload.egi !== undefined ? { egi: payload.egi } : {}),
    ...(payload.ae !== undefined ? { ae: payload.ae } : {}),
    ...(payload.rm !== undefined ? { rm: payload.rm } : {}),
    ...(payload.qj !== undefined ? { qj: payload.qj } : {}),
    ...(payload.dkby !== undefined ? { dkby: payload.dkby } : {}),
    ...(payload.yxby !== undefined ? { yxby: payload.yxby } : {}),
    ...(payload.ipv4 !== undefined ? { ipv4: payload.ipv4 } : {}),
    ...(payload.ipv6 !== undefined ? { ipv6: payload.ipv6 } : {}),
    ...(payload.ispMobile !== undefined ? { ispMobile: payload.ispMobile } : {}),
    ...(payload.ispUnicom !== undefined ? { ispUnicom: payload.ispUnicom } : {}),
    ...(payload.ispTelecom !== undefined ? { ispTelecom: payload.ispTelecom } : {}),
    ...(payload.jk !== undefined ? { jk: payload.jk } : {}),
    ...(payload.fp !== undefined ? { fp: payload.fp } : {}),
    ...(payload.patt !== undefined ? { patt: payload.patt } : {}),
    ...(payload.fragmentPreset !== undefined ? { fragmentPreset: payload.fragmentPreset } : {}),
    ...(payload.fragmentLength !== undefined ? { fragmentLength: payload.fragmentLength } : {}),
    ...(payload.fragmentInterval !== undefined ? { fragmentInterval: payload.fragmentInterval } : {}),
    ...(payload.fragmentPackets !== undefined ? { fragmentPackets: payload.fragmentPackets } : {}),
    ...(payload.ipRotation !== undefined ? { ipRotation: payload.ipRotation } : {}),
    subNodeCount
  });

  const enabled = payload.enabled !== undefined ? Boolean(payload.enabled) : existing.enabled;
  const expireDays = payload.expireDays !== undefined ? Math.max(0, parseInt(payload.expireDays, 10) || 0) : existing.expireDays;
  const startOnFirstUse = payload.startOnFirstUse !== undefined ? Boolean(payload.startOnFirstUse) : existing.startOnFirstUse;
  let expireAt = existing.expireAt;
  if (payload.expireDays !== undefined) {
    expireAt = !startOnFirstUse && expireDays > 0 ? now + expireDays * 86400 * 1000 : 0;
  }

  const updated = {
    ...existing,
    username: payload.username !== undefined && String(payload.username).trim() ? String(payload.username).trim() : existing.username,
    uuid: payload.uuid && isValidUuid(payload.uuid) ? String(payload.uuid).trim().toLowerCase() : existing.uuid,
    subNodeCount,
    enabled,
    status: enabled ? 'active' : 'disabled',
    dataLimitGb: payload.dataLimitGb !== undefined ? Math.max(0, Number(payload.dataLimitGb) || 0) : existing.dataLimitGb,
    expireDays,
    expireAt,
    startOnFirstUse,
    ipLimit: payload.ipLimit !== undefined ? Math.max(1, parseInt(payload.ipLimit, 10) || 50) : existing.ipLimit,
    nodeScope: payload.nodeScope !== undefined ? String(payload.nodeScope) : existing.nodeScope,
    preset: payload.preset !== undefined ? String(payload.preset) : existing.preset,
    note: payload.note !== undefined ? String(payload.note) : existing.note,
    config: updatedConfig,
    updatedAt: now
  };

  memoryStore.users.set(existing.id, updated);

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `UPDATE users SET
            username = ?, uuid = ?, sub_node_count = ?, status = ?, enabled = ?,
            data_limit_gb = ?, expire_days = ?, expire_at = ?, start_on_first_use = ?,
            ip_limit = ?, node_scope = ?, preset = ?, note = ?, config_json = ?, updated_at = ?
           WHERE id = ?`
        ),
        updated.username,
        updated.uuid,
        updated.subNodeCount,
        updated.status,
        updated.enabled ? 1 : 0,
        updated.dataLimitGb,
        updated.expireDays,
        updated.expireAt,
        updated.startOnFirstUse ? 1 : 0,
        updated.ipLimit,
        updated.nodeScope,
        updated.preset,
        updated.note,
        JSON.stringify(updated.config),
        now,
        existing.id
      ).run();
    } catch (_e) {}
  }

  await addAuditLog(env, 'ویرایش کاربر', `${updated.username}`, clientIp);
  return updated;
}

async function resetUserStats(env = {}, userId, clientIp = '') {
  const existing = await getUserByIdOrToken(env, userId);
  if (!existing) return null;
  const now = Date.now();
  const updated = {
    ...existing,
    usedBytes: 0,
    requestCount: 0,
    firstConnectedAt: 0,
    expireAt: !existing.startOnFirstUse && existing.expireDays > 0 ? now + existing.expireDays * 86400 * 1000 : 0,
    updatedAt: now
  };
  memoryStore.users.set(existing.id, updated);

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `UPDATE users SET used_bytes = 0, request_count = 0, first_connected_at = 0, expire_at = ?, updated_at = ? WHERE id = ?`
        ),
        updated.expireAt,
        now,
        existing.id
      ).run();
    } catch (_e) {}
  }
  await addAuditLog(env, 'صفر کردن مصرف کاربر', `${existing.username}`, clientIp);
  return updated;
}

async function deleteUser(env = {}, userId, clientIp = '') {
  const existing = await getUserByIdOrToken(env, userId);
  if (!existing) return false;
  memoryStore.users.delete(existing.id);

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(detectedD1.db.prepare(`DELETE FROM users WHERE id = ?`), existing.id).run();
    } catch (_e) {}
  }
  await addAuditLog(env, 'حذف کاربر', `${existing.username}`, clientIp);
  return true;
}

async function recordUserActivity(env = {}, userId, bytesDelta = 0, reqDelta = 1) {
  if (!userId) return;
  const now = Date.now();
  const hourKey = new Date(now).toISOString().slice(0, 13);
  const prevHour = memoryStore.trafficHourly.get(hourKey) || { bytes: 0, requests: 0 };
  prevHour.bytes += Math.max(0, Number(bytesDelta) || 0);
  prevHour.requests += Math.max(0, Number(reqDelta) || 0);
  memoryStore.trafficHourly.set(hourKey, prevHour);

  const u = memoryStore.users.get(userId);
  if (u) {
    u.usedBytes = (u.usedBytes || 0) + Math.max(0, Number(bytesDelta) || 0);
    u.lifetimeBytes = (u.lifetimeBytes || 0) + Math.max(0, Number(bytesDelta) || 0);
    u.requestCount = (u.requestCount || 0) + Math.max(0, Number(reqDelta) || 0);
    if (!u.firstConnectedAt) {
      u.firstConnectedAt = now;
      if (u.startOnFirstUse && u.expireDays > 0 && !u.expireAt) {
        u.expireAt = now + u.expireDays * 86400 * 1000;
      }
    }
    u.updatedAt = now;
  }

  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(
          `UPDATE users SET
            used_bytes = used_bytes + ?,
            lifetime_bytes = lifetime_bytes + ?,
            request_count = request_count + ?,
            first_connected_at = CASE WHEN first_connected_at = 0 THEN ? ELSE first_connected_at END,
            expire_at = CASE WHEN start_on_first_use = 1 AND expire_days > 0 AND expire_at = 0 THEN ? + (expire_days * 86400000) ELSE expire_at END,
            updated_at = ?
           WHERE id = ?`
        ),
        Math.max(0, Number(bytesDelta) || 0),
        Math.max(0, Number(bytesDelta) || 0),
        Math.max(0, Number(reqDelta) || 0),
        now,
        now,
        now,
        userId
      ).run();

      // آمار ساعتی سراسری و مصرف روزانه هر کاربر (منبع: شمارنده واقعی استریم ورکر)
      await safeBind(
        detectedD1.db.prepare(
          `INSERT INTO traffic_hourly (hour_key, bytes, requests) VALUES (?, ?, ?)
           ON CONFLICT(hour_key) DO UPDATE SET bytes = bytes + excluded.bytes, requests = requests + excluded.requests`
        ),
        hourKey,
        Math.max(0, Number(bytesDelta) || 0),
        Math.max(0, Number(reqDelta) || 0)
      ).run();
      try {
        await safeBind(
          detectedD1.db.prepare(
            `INSERT INTO usage_daily (user_id, day_key, bytes, requests, source) VALUES (?, ?, ?, ?, 'worker-stream')
             ON CONFLICT(user_id, day_key, source) DO UPDATE SET bytes = bytes + excluded.bytes, requests = requests + excluded.requests`
          ),
          userId,
          new Date(now).toISOString().slice(0, 10),
          Math.max(0, Number(bytesDelta) || 0),
          Math.max(0, Number(reqDelta) || 0)
        ).run();
      } catch (_e) {}
    } catch (_e) {}
  }
}

async function addAuditLog(env = {}, action, detail = '', ip = '') {
  const now = Date.now();
  memoryStore.auditLogs.unshift({
    id: memoryStore.auditLogs.length + 1,
    action: String(action || ''),
    detail: String(detail || ''),
    ip: String(ip || ''),
    createdAt: now
  });
  if (memoryStore.auditLogs.length > 50) {
    memoryStore.auditLogs.length = 50;
  }
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      await safeBind(
        detectedD1.db.prepare(`INSERT INTO audit_logs (action, detail, ip, created_at) VALUES (?, ?, ?, ?)`),
        String(action || ''),
        String(detail || ''),
        String(ip || ''),
        now
      ).run();
    } catch (_e) {}
  }
}

async function getAuditLogs(env = {}, limit = 15) {
  await ensureD1Schema(env);
  const detectedD1 = detectD1Binding(env);
  if (detectedD1 && memoryStore.d1SchemaReady) {
    try {
      const res = await safeBind(
        detectedD1.db.prepare(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?`),
        limit
      ).all();
      if (res?.results?.length) {
        return res.results.map(r => ({
          id: r.id,
          action: r.action,
          detail: r.detail,
          ip: r.ip,
          createdAt: r.created_at
        }));
      }
    } catch (_e) {}
  }
  return memoryStore.auditLogs.slice(0, limit);
}

async function getStorageDiagnostics(env = {}) {
  const d1State = await ensureD1Schema(env);
  const kvDetected = detectKvBinding(env);
  const users = await listUsers(env);
  const logs = await getAuditLogs(env, 12);
  const hasPass = await hasAdminPassword(env);

  let totalUsedBytes = 0;
  let totalLifetimeBytes = 0;
  let totalRequests = 0;
  let activeUsers = 0;
  for (const u of users) {
    totalUsedBytes += u.usedBytes || 0;
    totalLifetimeBytes += u.lifetimeBytes || 0;
    totalRequests += u.requestCount || 0;
    if (u.enabled) activeUsers += 1;
  }

  return {
    d1Enabled: d1State.d1Enabled,
    d1BindingName: d1State.bindingName || 'DB',
    d1Migrated: d1State.migrated,
    d1Error: d1State.error || null,
    kvEnabled: Boolean(kvDetected),
    kvBindingName: kvDetected?.bindingName || 'C',
    hasPassword: hasPass,
    maxUsersLimit: MAX_USERS_LIMIT,
    uptimeMs: Date.now() - memoryStore.bootTime,
    bootTime: memoryStore.bootTime,
    totalUsers: users.length,
    activeUsers,
    disabledUsers: Math.max(0, users.length - activeUsers),
    totalUsedBytes,
    totalLifetimeBytes,
    totalRequests,
    recentLogs: logs
  };
}


// --- MODULE: src/db/v4.js ---
// ============================================================================
// miliconfigOS v4.0 - Persistence layer (Cloudflare D1)
// Adds sessions, endpoint catalog + health history, generated configurations,
// subscriptions, per-user usage, automation jobs and provider secrets.
// Falls back to isolate memory only for local development without a D1 binding;
// the UI surfaces that mode explicitly.
// ============================================================================


const state = {
  ready: false,
  binding: null,
  memory: false,
  endpointsSeeded: false
};

const memory = {
  sessions: new Map(),
  attempts: [],
  endpoints: new Map(),
  health: [],
  configurations: [],
  subscriptions: new Map(),
  usage: new Map(),
  jobs: new Map(),
  jobRuns: [],
  secrets: new Map()
};

const DDL = [
  `CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    ip TEXT DEFAULT '',
    revoked INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    ok INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS endpoints (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 443,
    family TEXT NOT NULL DEFAULT 'ipv4',
    kind TEXT NOT NULL DEFAULT 'cloudflare',
    country TEXT DEFAULT '',
    region TEXT DEFAULT '',
    provider TEXT DEFAULT '',
    protocol TEXT DEFAULT 'vless',
    transport TEXT DEFAULT 'ws',
    tls_mode TEXT DEFAULT 'tls',
    source TEXT DEFAULT 'manual',
    enabled INTEGER NOT NULL DEFAULT 1,
    health_score INTEGER NOT NULL DEFAULT 0,
    last_latency_ms INTEGER DEFAULT 0,
    last_check_at INTEGER DEFAULT 0,
    last_check_level TEXT DEFAULT '',
    failure_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS endpoint_health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    level TEXT NOT NULL,
    ok INTEGER NOT NULL,
    latency_ms INTEGER DEFAULT 0,
    detail TEXT DEFAULT '',
    checked_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_endpoint_health ON endpoint_health(endpoint_id, checked_at DESC)`,
  `CREATE TABLE IF NOT EXISTS configurations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    protocol TEXT NOT NULL,
    endpoint_id TEXT DEFAULT '',
    transport TEXT NOT NULL,
    tls_mode TEXT NOT NULL,
    dns_profile TEXT DEFAULT '',
    chain_json TEXT DEFAULT '[]',
    client_format TEXT DEFAULT '',
    valid INTEGER NOT NULL DEFAULT 0,
    validation_json TEXT DEFAULT '{}',
    reason TEXT DEFAULT '',
    score INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_configurations_user ON configurations(user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    formats TEXT NOT NULL DEFAULT 'singbox,clash,uri',
    revoked INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    last_access_at INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    rotated_at INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS usage_daily (
    user_id TEXT NOT NULL,
    day_key TEXT NOT NULL,
    bytes INTEGER NOT NULL DEFAULT 0,
    requests INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'worker-stream',
    PRIMARY KEY (user_id, day_key, source)
  )`,
  `CREATE TABLE IF NOT EXISTS automation_jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    interval_minutes INTEGER NOT NULL DEFAULT 60,
    last_run_at INTEGER DEFAULT 0,
    next_run_at INTEGER DEFAULT 0,
    last_status TEXT DEFAULT '',
    last_error TEXT DEFAULT '',
    run_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS automation_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    status TEXT NOT NULL,
    detail TEXT DEFAULT '',
    started_at INTEGER NOT NULL,
    finished_at INTEGER DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_automation_runs ON automation_runs(job_id, started_at DESC)`,
  `CREATE TABLE IF NOT EXISTS cloudflare_resources (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    account_id TEXT DEFAULT '',
    zone_id TEXT DEFAULT '',
    name TEXT DEFAULT '',
    status TEXT DEFAULT '',
    detail TEXT DEFAULT '',
    checked_at INTEGER DEFAULT 0
  )`
];

function db(env) {
  const detected = detectD1Binding(env);
  return detected ? detected.db : null;
}

async function all(env, sql, ...binds) {
  const database = db(env);
  if (!database) return [];
  const stmt = database.prepare(sql);
  const bound = binds.length ? stmt.bind(...binds) : stmt;
  const res = await bound.all();
  return res?.results || [];
}

async function first(env, sql, ...binds) {
  const database = db(env);
  if (!database) return null;
  const stmt = database.prepare(sql);
  const bound = binds.length ? stmt.bind(...binds) : stmt;
  return await bound.first();
}

async function run(env, sql, ...binds) {
  const database = db(env);
  if (!database) return { success: false, memory: true, changes: 0 };
  const stmt = database.prepare(sql);
  const bound = binds.length ? stmt.bind(...binds) : stmt;
  const res = await bound.run();
  return { success: res?.success !== false, changes: Number(res?.meta?.changes ?? res?.changes ?? 0), result: res };
}

function storageMode(env) {
  return db(env) ? 'd1' : 'memory';
}

function databaseConfigured(env = {}) {
  return Boolean(db(env));
}

/** Memory mode is only safe for local development; it is opt-in. */
function memoryModeAllowed(env = {}) {
  return String(env.MILI_ALLOW_MEMORY || env.MILICONFIG_ALLOW_MEMORY || '') === '1';
}

function isMemoryMode() {
  return state.memory;
}

async function ensureV4Schema(env = {}) {
  if (state.ready) return { ok: true, binding: state.binding, memory: state.memory };
  const database = db(env);
  if (!database) {
    state.memory = true;
    seedMemory();
    state.ready = true;
    return { ok: true, binding: null, memory: true };
  }
  const detected = detectD1Binding(env);
  try {
    for (const sql of DDL) await database.prepare(sql).run();
    await database.prepare(
      `INSERT INTO schema_meta (key, value) VALUES ('schema_version', '4')
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).run();
    state.ready = true;
    state.memory = false;
    state.binding = detected?.bindingName || 'DB';
    await seedEndpoints(env);
    await seedAutomationJobs(env);
    return { ok: true, binding: state.binding, memory: false };
  } catch (err) {
    state.memory = true;
    seedMemory();
    state.ready = true;
    return { ok: false, binding: detected?.bindingName || 'DB', memory: true, error: String(err?.message || err) };
  }
}

function seedMemory() {
  if (memory.endpoints.size) return;
  const now = Date.now();
  const seeds = [
    ...OFFICIAL_DIRECT_IPS.slice(0, 4).map((ip, idx) => ({ host: ip, family: 'ipv4', name: `Cloudflare anycast ${idx + 1}` })),
    ...OFFICIAL_DIRECT_IPV6.slice(0, 2).map((ip, idx) => ({ host: ip, family: 'ipv6', name: `Cloudflare IPv6 ${idx + 1}` }))
  ];
  for (const seed of seeds) {
    const id = `ep-builtin-${memory.endpoints.size + 1}`;
    memory.endpoints.set(id, {
      id, name: seed.name, host: seed.host, port: 443, family: seed.family,
      kind: 'cloudflare', country: '', region: '', provider: 'Cloudflare',
      protocol: 'vless', transport: 'ws', tlsMode: 'tls', source: 'builtin',
      enabled: true, healthScore: 0, lastLatencyMs: 0, lastCheckAt: 0,
      lastCheckLevel: '', failureCount: 0, notes: '',
      createdAt: now, updatedAt: now
    });
  }
  const nowJobs = [
    { id: 'job-health', name: 'Endpoint health refresh', kind: 'health', interval: 60 },
    { id: 'job-expiry', name: 'Expired user detection', kind: 'expiry', interval: 360 },
    { id: 'job-quota', name: 'Quota exhaustion detection', kind: 'quota', interval: 360 },
    { id: 'job-config', name: 'Configuration validation', kind: 'config-validation', interval: 720 }
  ];
  for (const job of nowJobs) {
    memory.jobs.set(job.id, {
      id: job.id, name: job.name, kind: job.kind, enabled: true,
      intervalMinutes: job.interval, lastRunAt: 0, nextRunAt: 0,
      lastStatus: '', lastError: '', runCount: 0, createdAt: now
    });
  }
}

async function seedEndpoints(env) {
  if (state.endpointsSeeded) return;
  state.endpointsSeeded = true;
  const existing = await first(env, 'SELECT COUNT(*) AS cnt FROM endpoints');
  if (Number(existing?.cnt || 0) > 0) return;
  const now = Date.now();
  const seeds = [
    ...OFFICIAL_DIRECT_IPS.slice(0, 4).map((ip, idx) => ({ host: ip, family: 'ipv4', name: `Cloudflare anycast ${idx + 1}` })),
    ...OFFICIAL_DIRECT_IPV6.slice(0, 2).map((ip, idx) => ({ host: ip, family: 'ipv6', name: `Cloudflare IPv6 ${idx + 1}` }))
  ];
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    const id = `ep-builtin-${i + 1}`;
    try {
      await run(
        env,
        `INSERT OR IGNORE INTO endpoints
          (id, name, host, port, family, kind, country, region, provider, protocol, transport, tls_mode,
           source, enabled, health_score, last_latency_ms, last_check_at, last_check_level, failure_count, notes, created_at, updated_at)
         VALUES (?, ?, ?, 443, ?, 'cloudflare', '', '', 'Cloudflare', 'vless', 'ws', 'tls',
           'builtin', 1, 0, 0, 0, '', 0, '', ?, ?)`,
        id, seed.name, seed.host, seed.family, now, now
      );
    } catch (_e) {}
  }
}

async function seedAutomationJobs(env) {
  const jobs = [
    { id: 'job-health', name: 'Endpoint health refresh', kind: 'health', interval: 60 },
    { id: 'job-expiry', name: 'Expired user detection', kind: 'expiry', interval: 360 },
    { id: 'job-quota', name: 'Quota exhaustion detection', kind: 'quota', interval: 360 },
    { id: 'job-config', name: 'Configuration validation', kind: 'config-validation', interval: 720 }
  ];
  const now = Date.now();
  for (const job of jobs) {
    try {
      await run(
        env,
        `INSERT OR IGNORE INTO automation_jobs
          (id, name, kind, enabled, interval_minutes, last_run_at, next_run_at, last_status, last_error, run_count, created_at)
         VALUES (?, ?, ?, 1, ?, 0, 0, '', '', 0, ?)`,
        job.id, job.name, job.kind, job.interval, now
      );
    } catch (_e) {}
  }
}

// --------------------------------------------------------------- metadata ---

async function getMeta(env, key) {
  await ensureV4Schema(env);
  if (state.memory) return memory.secrets.get(`meta:${key}`) || null;
  const row = await first(env, `SELECT value FROM system_config WHERE key = ?`, `meta_${key}`);
  if (!row) return null;
  try { return JSON.parse(row.value); } catch (_e) { return row.value; }
}

async function setMeta(env, key, value) {
  await ensureV4Schema(env);
  const serialized = JSON.stringify(value);
  if (state.memory) {
    memory.secrets.set(`meta:${key}`, serialized);
    return;
  }
  await run(
    env,
    `INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    `meta_${key}`, serialized, Date.now()
  );
}

// ---------------------------------------------------------------- sessions ---

function clampHours(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value)) return DEFAULT_SESSION_HOURS;
  return Math.max(MIN_SESSION_HOURS, Math.min(MAX_SESSION_HOURS, Math.round(value)));
}

async function createAdminSession(env, options = {}) {
  await ensureV4Schema(env);
  const ttlHours = clampHours(options.ttlHours);
  const token = randomToken(32);
  const tokenHash = await sha256HexDigest(token);
  const now = Date.now();
  const expiresAt = now + ttlHours * 3600 * 1000;
  if (state.memory) {
    memory.sessions.set(tokenHash, { expiresAt, createdAt: now, ip: options.ip || '' });
  } else {
    await run(
      env,
      `INSERT INTO admin_sessions (token_hash, created_at, expires_at, ip, revoked) VALUES (?, ?, ?, ?, 0)`,
      tokenHash, now, expiresAt, String(options.ip || '').slice(0, 64)
    );
    try {
      await run(env, `DELETE FROM admin_sessions WHERE expires_at < ?`, now - 86400000);
    } catch (_e) {}
  }
  return { token, expiresAt, ttlHours };
}

async function verifyAdminSessionToken(env, token) {
  const clean = String(token || '').trim();
  if (!clean) return { valid: false, reason: 'empty' };
  await ensureV4Schema(env);
  const tokenHash = await sha256HexDigest(clean);
  if (state.memory) {
    const record = memory.sessions.get(tokenHash);
    if (!record) return { valid: false, reason: 'not-found' };
    if (record.expiresAt < Date.now()) return { valid: false, reason: 'expired' };
    return { valid: true, expiresAt: record.expiresAt };
  }
  const row = await first(
    env,
    `SELECT token_hash, expires_at, revoked FROM admin_sessions WHERE token_hash = ?`,
    tokenHash
  );
  if (!row || Number(row.revoked) !== 0) return { valid: false, reason: 'not-found' };
  if (Number(row.expires_at) < Date.now()) return { valid: false, reason: 'expired' };
  return { valid: true, expiresAt: Number(row.expires_at) };
}

async function revokeAllAdminSessions(env) {
  await ensureV4Schema(env);
  if (state.memory) {
    memory.sessions.clear();
    return;
  }
  await run(env, `UPDATE admin_sessions SET revoked = 1 WHERE revoked = 0`);
}

async function revokeAdminSession(env, token) {
  const clean = String(token || '').trim();
  if (!clean) return false;
  await ensureV4Schema(env);
  const tokenHash = await sha256HexDigest(clean);
  if (state.memory) return memory.sessions.delete(tokenHash);
  const res = await run(env, `UPDATE admin_sessions SET revoked = 1 WHERE token_hash = ?`, tokenHash);
  return res.changes > 0;
}

async function listActiveSessions(env) {
  await ensureV4Schema(env);
  if (state.memory) {
    return [...memory.sessions.entries()].map(([hash, record]) => ({
      tokenHash: hash.slice(0, 12), createdAt: record.createdAt, expiresAt: record.expiresAt, ip: record.ip
    }));
  }
  const rows = await all(
    env,
    `SELECT token_hash, created_at, expires_at, ip FROM admin_sessions
     WHERE revoked = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 20`,
    Date.now()
  );
  return rows.map(row => ({
    tokenHash: String(row.token_hash).slice(0, 12),
    createdAt: Number(row.created_at),
    expiresAt: Number(row.expires_at),
    ip: row.ip || ''
  }));
}

// ------------------------------------------------------------ login limits --

async function recordLoginAttempt(env, ip, ok) {
  await ensureV4Schema(env);
  const now = Date.now();
  if (state.memory) {
    memory.attempts.push({ ip, ok, createdAt: now });
    if (memory.attempts.length > 500) memory.attempts.splice(0, memory.attempts.length - 500);
    return;
  }
  try {
    await run(env, `INSERT INTO login_attempts (ip, ok, created_at) VALUES (?, ?, ?)`, String(ip || ''), ok ? 1 : 0, now);
    await run(env, `DELETE FROM login_attempts WHERE created_at < ?`, now - 7 * 86400000);
  } catch (_e) {}
}

async function recentFailedLogins(env, ip, windowMs = 15 * 60 * 1000) {
  await ensureV4Schema(env);
  const since = Date.now() - windowMs;
  if (state.memory) {
    return memory.attempts.filter(item => item.ip === ip && !item.ok && item.createdAt >= since).length;
  }
  const row = await first(
    env,
    `SELECT COUNT(*) AS cnt FROM login_attempts WHERE ip = ? AND ok = 0 AND created_at >= ?`,
    String(ip || ''), since
  );
  return Number(row?.cnt || 0);
}

async function recentLoginAttempts(env, limit = 20) {
  await ensureV4Schema(env);
  if (state.memory) {
    return memory.attempts.slice(-limit).reverse().map((item, idx) => ({ id: idx + 1, ...item }));
  }
  const rows = await all(env, `SELECT id, ip, ok, created_at FROM login_attempts ORDER BY created_at DESC LIMIT ?`, limit);
  return rows.map(row => ({ id: row.id, ip: row.ip, ok: Number(row.ok) === 1, createdAt: Number(row.created_at) }));
}

// --------------------------------------------------------------- endpoints ---

function mapEndpoint(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    host: row.host,
    port: Number(row.port || 443),
    family: row.family || 'ipv4',
    kind: row.kind || 'manual',
    country: row.country || '',
    region: row.region || '',
    provider: row.provider || '',
    protocol: row.protocol || 'vless',
    transport: row.transport || 'ws',
    tlsMode: row.tls_mode || row.tlsMode || 'tls',
    source: row.source || 'manual',
    enabled: Number(row.enabled) !== 0,
    healthScore: Number(row.health_score ?? row.healthScore ?? 0),
    lastLatencyMs: Number(row.last_latency_ms ?? row.lastLatencyMs ?? 0),
    lastCheckAt: Number(row.last_check_at ?? row.lastCheckAt ?? 0),
    lastCheckLevel: row.last_check_level || '',
    failureCount: Number(row.failure_count ?? row.failureCount ?? 0),
    notes: row.notes || '',
    createdAt: Number(row.created_at ?? Date.now()),
    updatedAt: Number(row.updated_at ?? Date.now())
  };
}

async function listEndpoints(env) {
  await ensureV4Schema(env);
  if (state.memory) {
    return [...memory.endpoints.values()]
      .filter(item => item.enabled)
      .sort((a, b) => b.healthScore - a.healthScore);
  }
  const rows = await all(env, `SELECT * FROM endpoints ORDER BY enabled DESC, health_score DESC, name ASC`);
  return rows.map(mapEndpoint);
}

async function getEndpoint(env, id) {
  await ensureV4Schema(env);
  if (state.memory) return memory.endpoints.get(id) || null;
  const row = await first(env, `SELECT * FROM endpoints WHERE id = ?`, id);
  return mapEndpoint(row);
}

async function createEndpoint(env, data = {}) {
  await ensureV4Schema(env);
  const now = Date.now();
  const id = String(data.id || `ep-${randomToken(6)}`);
  const record = {
    id,
    name: String(data.name || data.host || id).slice(0, 80),
    host: String(data.host || '').trim(),
    port: Math.max(1, Math.min(65535, parseInt(data.port, 10) || 443)),
    family: data.family || 'ipv4',
    kind: data.kind || 'manual',
    country: String(data.country || '').toUpperCase().slice(0, 2),
    region: String(data.region || '').slice(0, 80),
    provider: String(data.provider || '').slice(0, 80),
    protocol: data.protocol || 'vless',
    transport: data.transport || 'ws',
    tlsMode: data.tlsMode || 'tls',
    source: data.source || 'manual',
    enabled: data.enabled !== false,
    healthScore: 0,
    lastLatencyMs: 0,
    lastCheckAt: 0,
    lastCheckLevel: '',
    failureCount: 0,
    notes: String(data.notes || '').slice(0, 300),
    createdAt: now,
    updatedAt: now
  };
  if (state.memory) {
    memory.endpoints.set(id, record);
    return record;
  }
  await run(
    env,
    `INSERT INTO endpoints
      (id, name, host, port, family, kind, country, region, provider, protocol, transport, tls_mode,
       source, enabled, health_score, last_latency_ms, last_check_at, last_check_level, failure_count, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, '', 0, ?, ?, ?)`,
    record.id, record.name, record.host, record.port, record.family, record.kind, record.country,
    record.region, record.provider, record.protocol, record.transport, record.tlsMode, record.source,
    record.enabled ? 1 : 0, record.notes, now, now
  );
  return record;
}

async function updateEndpoint(env, id, patch = {}) {
  const existing = await getEndpoint(env, id);
  if (!existing) return null;
  const next = {
    ...existing,
    ...patch,
    port: patch.port !== undefined ? Math.max(1, Math.min(65535, parseInt(patch.port, 10) || existing.port)) : existing.port,
    enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : existing.enabled,
    updatedAt: Date.now()
  };
  if (state.memory) {
    memory.endpoints.set(id, next);
    return next;
  }
  await run(
    env,
    `UPDATE endpoints SET name = ?, host = ?, port = ?, family = ?, kind = ?, country = ?, region = ?,
      provider = ?, protocol = ?, transport = ?, tls_mode = ?, enabled = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    next.name, next.host, next.port, next.family, next.kind, next.country, next.region, next.provider,
    next.protocol, next.transport, next.tlsMode, next.enabled ? 1 : 0, next.notes, next.updatedAt, id
  );
  return next;
}

async function deleteEndpoint(env, id) {
  await ensureV4Schema(env);
  if (state.memory) return memory.endpoints.delete(id);
  const res = await run(env, `DELETE FROM endpoints WHERE id = ?`, id);
  await run(env, `DELETE FROM endpoint_health WHERE endpoint_id = ?`, id);
  return res.changes > 0;
}

async function recordEndpointHealth(env, endpointId, result = {}) {
  await ensureV4Schema(env);
  const now = Number(result.checkedAt || Date.now());
  const status = result.status || 'unknown';
  const score = Math.max(0, Math.min(100, Number(result.score || 0)));
  const latency = Number(result.checks?.tcp?.latencyMs || result.checks?.tls?.latencyMs || 0);
  const level = result.verifiedLevel || '';

  if (state.memory) {
    const ep = memory.endpoints.get(endpointId);
    if (ep) {
      ep.healthScore = score;
      ep.lastLatencyMs = latency;
      ep.lastCheckAt = now;
      ep.lastCheckLevel = level;
      ep.failureCount = ['unreachable', 'invalid'].includes(status) ? ep.failureCount + 1 : 0;
    }
    memory.health.unshift({ endpointId, status, score, latencyMs: latency, detail: status, checkedAt: now });
    if (memory.health.length > 500) memory.health.length = 500;
    return;
  }

  const failed = ['unreachable', 'invalid'].includes(status) ? 1 : 0;
  await run(
    env,
    `UPDATE endpoints SET health_score = ?, last_latency_ms = ?, last_check_at = ?, last_check_level = ?,
      failure_count = CASE WHEN ? = 1 THEN failure_count + 1 ELSE 0 END, updated_at = ? WHERE id = ?`,
    score, latency, now, level, failed, now, endpointId
  );
  await run(
    env,
    `INSERT INTO endpoint_health (endpoint_id, level, ok, latency_ms, detail, checked_at) VALUES (?, ?, ?, ?, ?, ?)`,
    endpointId, level || 'syntax', score > 0 ? 1 : 0, latency, `${status}${result.detail ? ': ' + result.detail : ''}`.slice(0, 300), now
  );
}

async function listEndpointHealth(env, endpointId, limit = 20) {
  await ensureV4Schema(env);
  if (state.memory) return memory.health.filter(item => item.endpointId === endpointId).slice(0, limit);
  const rows = await all(
    env,
    `SELECT * FROM endpoint_health WHERE endpoint_id = ? ORDER BY checked_at DESC LIMIT ?`,
    endpointId, limit
  );
  return rows.map(row => ({
    id: row.id, endpointId: row.endpoint_id, level: row.level, ok: Number(row.ok) === 1,
    latencyMs: Number(row.latency_ms || 0), detail: row.detail, checkedAt: Number(row.checked_at)
  }));
}

// ---------------------------------------------------------- configurations --

async function replaceUserConfigurations(env, userId, rows = []) {
  await ensureV4Schema(env);
  if (state.memory) {
    memory.configurations = memory.configurations.filter(row => row.userId !== userId);
    memory.configurations.push(...rows);
    return rows.length;
  }
  await run(env, `DELETE FROM configurations WHERE user_id = ?`, userId);
  for (const row of rows) {
    await run(
      env,
      `INSERT INTO configurations
        (id, user_id, protocol, endpoint_id, transport, tls_mode, dns_profile, chain_json, client_format, valid, validation_json, reason, score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row.id, row.userId, row.protocol, row.endpointId, row.transport, row.tlsMode, row.dnsProfile,
      row.chain, row.clientFormat, row.valid ? 1 : 0, row.validation, row.reason, row.score, row.createdAt
    );
  }
  return rows.length;
}

async function listConfigurations(env, options = {}) {
  await ensureV4Schema(env);
  const limit = Math.max(1, Math.min(200, Number(options.limit) || 50));
  if (state.memory) {
    const rows = options.userId
      ? memory.configurations.filter(row => row.userId === options.userId)
      : memory.configurations;
    return rows.slice(0, limit).sort((a, b) => b.createdAt - a.createdAt);
  }
  const rows = options.userId
    ? await all(env, `SELECT * FROM configurations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`, options.userId, limit)
    : await all(env, `SELECT * FROM configurations ORDER BY created_at DESC LIMIT ?`, limit);
  return rows.map(row => {
    let validation = {};
    try { validation = JSON.parse(row.validation_json || '{}'); } catch (_e) {}
    return {
      id: row.id,
      userId: row.user_id,
      protocol: row.protocol,
      endpointId: row.endpoint_id,
      transport: row.transport,
      tlsMode: row.tls_mode,
      dnsProfile: row.dns_profile,
      clientFormat: row.client_format,
      valid: Number(row.valid) === 1,
      validation,
      reason: row.reason || '',
      score: Number(row.score || 0),
      createdAt: Number(row.created_at)
    };
  });
}

// ------------------------------------------------------------ subscriptions --

function mapSubscription(row, env) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    formats: String(row.formats || '').split(',').filter(Boolean),
    revoked: Number(row.revoked) === 1,
    downloads: Number(row.downloads || 0),
    lastAccessAt: Number(row.last_access_at || 0),
    createdAt: Number(row.created_at),
    rotatedAt: Number(row.rotated_at || 0)
  };
}

async function ensureSubscription(env, userId, formats = 'singbox,clash,uri') {
  await ensureV4Schema(env);
  const existing = await getSubscription(env, userId);
  if (existing) return existing;
  const now = Date.now();
  const record = {
    id: `sub-${randomToken(6)}`,
    userId,
    token: randomToken(24),
    formats: String(formats),
    revoked: false,
    downloads: 0,
    lastAccessAt: 0,
    createdAt: now,
    rotatedAt: 0
  };
  if (state.memory) {
    memory.subscriptions.set(userId, record);
    return record;
  }
  await run(
    env,
    `INSERT OR IGNORE INTO subscriptions (id, user_id, token, formats, revoked, downloads, last_access_at, created_at, rotated_at)
     VALUES (?, ?, ?, ?, 0, 0, 0, ?, 0)`,
    record.id, userId, record.token, record.formats, now
  );
  return await getSubscription(env, userId);
}

async function getSubscription(env, userId) {
  await ensureV4Schema(env);
  if (state.memory) return memory.subscriptions.get(userId) || null;
  const row = await first(env, `SELECT * FROM subscriptions WHERE user_id = ?`, userId);
  return mapSubscription(row, env);
}

async function listSubscriptions(env) {
  await ensureV4Schema(env);
  if (state.memory) return [...memory.subscriptions.values()];
  const rows = await all(env, `SELECT * FROM subscriptions`);
  return rows.map(row => mapSubscription(row, env));
}

async function rotateSubscription(env, userId, formats) {
  await ensureV4Schema(env);
  const token = randomToken(24);
  const now = Date.now();
  if (state.memory) {
    const current = memory.subscriptions.get(userId);
    if (!current) return null;
    const next = { ...current, token, revoked: false, rotatedAt: now };
    if (formats) next.formats = String(formats);
    memory.subscriptions.set(userId, next);
    return next;
  }
  await run(env, `UPDATE subscriptions SET token = ?, revoked = 0, rotated_at = ? WHERE user_id = ?`, token, now, userId);
  if (formats) await run(env, `UPDATE subscriptions SET formats = ? WHERE user_id = ?`, String(formats), userId);
  return await getSubscription(env, userId);
}

async function setSubscriptionRevoked(env, userId, revoked) {
  await ensureV4Schema(env);
  if (state.memory) {
    const current = memory.subscriptions.get(userId);
    if (!current) return null;
    current.revoked = Boolean(revoked);
    return current;
  }
  await run(env, `UPDATE subscriptions SET revoked = ? WHERE user_id = ?`, revoked ? 1 : 0, userId);
  return await getSubscription(env, userId);
}

async function findSubscriptionByToken(env, token) {
  await ensureV4Schema(env);
  const clean = String(token || '').trim();
  if (!clean) return null;
  if (state.memory) {
    for (const sub of memory.subscriptions.values()) if (timingSafeEqual(sub.token, clean)) return sub;
    return null;
  }
  const row = await first(env, `SELECT * FROM subscriptions WHERE token = ?`, clean);
  return mapSubscription(row, env);
}

async function touchSubscriptionAccess(env, userId) {
  const now = Date.now();
  if (state.memory) {
    const sub = memory.subscriptions.get(userId);
    if (sub) {
      sub.downloads += 1;
      sub.lastAccessAt = now;
    }
    return;
  }
  try {
    await run(env, `UPDATE subscriptions SET downloads = downloads + 1, last_access_at = ? WHERE user_id = ?`, now, userId);
  } catch (_e) {}
}

async function deleteUserArtifacts(env, userId) {
  await ensureV4Schema(env);
  if (state.memory) {
    memory.subscriptions.delete(userId);
    memory.configurations = memory.configurations.filter(row => row.userId !== userId);
    for (const key of [...memory.usage.keys()]) if (key.startsWith(`${userId}|`)) memory.usage.delete(key);
    return;
  }
  await run(env, `DELETE FROM configurations WHERE user_id = ?`, userId);
  await run(env, `DELETE FROM subscriptions WHERE user_id = ?`, userId);
  await run(env, `DELETE FROM usage_daily WHERE user_id = ?`, userId);
}

// -------------------------------------------------------------------- usage --

function dayKey(timestamp = Date.now(), timezoneOffsetMinutes = 0) {
  return new Date(timestamp + timezoneOffsetMinutes * 60000).toISOString().slice(0, 10);
}

async function recordUsageDaily(env, userId, bytes, requests, source = 'worker-stream', timestamp = Date.now()) {
  if (!userId) return;
  await ensureV4Schema(env);
  const key = dayKey(timestamp);
  const byteCount = Math.max(0, Number(bytes) || 0);
  const requestCount = Math.max(0, Number(requests) || 0);
  if (state.memory) {
    const id = `${userId}|${key}|${source}`;
    const current = memory.usage.get(id) || { userId, dayKey: key, source, bytes: 0, requests: 0 };
    current.bytes += byteCount;
    current.requests += requestCount;
    memory.usage.set(id, current);
    return;
  }
  await run(
    env,
    `INSERT INTO usage_daily (user_id, day_key, bytes, requests, source) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, day_key, source) DO UPDATE SET bytes = bytes + excluded.bytes, requests = requests + excluded.requests`,
    userId, key, byteCount, requestCount, source
  );
}

async function usageForUser(env, userId, days = 30) {
  await ensureV4Schema(env);
  const since = dayKey(Date.now() - days * 86400000);
  if (state.memory) {
    return [...memory.usage.values()]
      .filter(item => item.userId === userId && item.dayKey >= since)
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  }
  const rows = await all(
    env,
    `SELECT day_key, bytes, requests, source FROM usage_daily WHERE user_id = ? AND day_key >= ? ORDER BY day_key ASC`,
    userId, since
  );
  return rows.map(row => ({
    userId,
    dayKey: row.day_key,
    bytes: Number(row.bytes || 0),
    requests: Number(row.requests || 0),
    source: row.source
  }));
}

async function usageTotals(env, days = 30) {
  await ensureV4Schema(env);
  const since = dayKey(Date.now() - days * 86400000);
  if (state.memory) {
    const totals = new Map();
    for (const item of memory.usage.values()) {
      if (item.dayKey < since) continue;
      totals.set(item.dayKey, (totals.get(item.dayKey) || 0) + item.bytes);
    }
    return [...totals.entries()].map(([dayKeyValue, bytes]) => ({ dayKey: dayKeyValue, bytes })).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  }
  const rows = await all(
    env,
    `SELECT day_key, SUM(bytes) AS bytes FROM usage_daily WHERE day_key >= ? GROUP BY day_key ORDER BY day_key ASC`,
    since
  );
  return rows.map(row => ({ dayKey: row.day_key, bytes: Number(row.bytes || 0) }));
}

// --------------------------------------------------------------- automation --

function mapJob(row) {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    enabled: Number(row.enabled) === 1,
    intervalMinutes: Number(row.interval_minutes || 60),
    lastRunAt: Number(row.last_run_at || 0),
    nextRunAt: Number(row.next_run_at || 0),
    lastStatus: row.last_status || '',
    lastError: row.last_error || '',
    runCount: Number(row.run_count || 0)
  };
}

async function listAutomationJobs(env) {
  await ensureV4Schema(env);
  if (state.memory) return [...memory.jobs.values()];
  const rows = await all(env, `SELECT * FROM automation_jobs ORDER BY kind ASC`);
  return rows.map(mapJob);
}

async function getAutomationJob(env, id) {
  const jobs = await listAutomationJobs(env);
  return jobs.find(job => job.id === id) || null;
}

async function setAutomationJobEnabled(env, id, enabled) {
  await ensureV4Schema(env);
  if (state.memory) {
    const job = memory.jobs.get(id);
    if (!job) return null;
    job.enabled = Boolean(enabled);
    return job;
  }
  await run(env, `UPDATE automation_jobs SET enabled = ? WHERE id = ?`, enabled ? 1 : 0, id);
  return await getAutomationJob(env, id);
}

async function recordAutomationRun(env, id, { status, detail = '', error = '' } = {}) {
  await ensureV4Schema(env);
  const now = Date.now();
  const job = await getAutomationJob(env, id);
  if (!job) return null;
  const nextRun = job.enabled ? now + job.intervalMinutes * 60000 : 0;
  if (state.memory) {
    const current = memory.jobs.get(id);
    if (current) {
      current.lastRunAt = now;
      current.nextRunAt = nextRun;
      current.lastStatus = status;
      current.lastError = error;
      current.runCount += 1;
    }
    memory.jobRuns.unshift({ jobId: id, status, detail, startedAt: now, finishedAt: now });
    if (memory.jobRuns.length > 200) memory.jobRuns.length = 200;
    return;
  }
  await run(
    env,
    `UPDATE automation_jobs SET last_run_at = ?, next_run_at = ?, last_status = ?, last_error = ?, run_count = run_count + 1 WHERE id = ?`,
    now, nextRun, status, error, id
  );
  await run(
    env,
    `INSERT INTO automation_runs (job_id, status, detail, started_at, finished_at) VALUES (?, ?, ?, ?, ?)`,
    id, status, detail.slice(0, 500), now, now
  );
}

async function listAutomationRuns(env, id, limit = 20) {
  await ensureV4Schema(env);
  if (state.memory) return memory.jobRuns.filter(run => run.jobId === id).slice(0, limit);
  const rows = await all(
    env,
    `SELECT * FROM automation_runs WHERE job_id = ? ORDER BY started_at DESC LIMIT ?`,
    id, limit
  );
  return rows.map(row => ({
    id: row.id, jobId: row.job_id, status: row.status, detail: row.detail,
    startedAt: Number(row.started_at), finishedAt: Number(row.finished_at)
  }));
}

// ------------------------------------------------------ provider credentials --

const CF_TOKEN_KEY = 'cf_api_token_enc';
const CF_TOKEN_MODE = 'cf_api_token_mode';

async function saveCloudflareToken(env, token, meta = {}) {
  await ensureV4Schema(env);
  const encrypted = await encryptSecret(token, env);
  const now = Date.now();
  if (state.memory) {
    memory.secrets.set(CF_TOKEN_KEY, encrypted.value);
    memory.secrets.set(CF_TOKEN_MODE, encrypted.mode);
    memory.secrets.set('cf_verified_at', String(now));
    if (meta.accountId) memory.secrets.set('cf_account_id', String(meta.accountId));
    return { mode: encrypted.mode, storedAt: now };
  }
  const upsert = async (key, value) => {
    await run(
      env,
      `INSERT INTO system_config (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      key, String(value), now
    );
  };
  await upsert(CF_TOKEN_KEY, encrypted.value);
  await upsert(CF_TOKEN_MODE, encrypted.mode);
  await upsert('cf_verified_at', String(now));
  if (meta.accountId) await upsert('cf_account_id', String(meta.accountId));
  return { mode: encrypted.mode, storedAt: now };
}

async function getCloudflareToken(env) {
  await ensureV4Schema(env);
  let stored = '';
  let mode = '';
  if (state.memory) {
    stored = memory.secrets.get(CF_TOKEN_KEY) || '';
    mode = memory.secrets.get(CF_TOKEN_MODE) || '';
  } else {
    const rows = await all(env, `SELECT key, value FROM system_config WHERE key IN (?, ?)`, CF_TOKEN_KEY, CF_TOKEN_MODE);
    for (const row of rows) {
      if (row.key === CF_TOKEN_KEY) stored = row.value;
      if (row.key === CF_TOKEN_MODE) mode = row.value;
    }
  }
  if (!stored) return { token: '', mode: 'none', storage: 'none' };
  try {
    const decrypted = await decryptSecret(stored, env);
    return { token: decrypted.value, mode: decrypted.mode, storage: mode || decrypted.mode };
  } catch (err) {
    return { token: '', mode: 'unreadable', storage: mode || 'unknown', error: String(err?.message || err) };
  }
}

async function cloudflareStatus(env) {
  await ensureV4Schema(env);
  const stored = await getCloudflareToken(env);
  let verifiedAt = 0;
  let accountId = '';
  if (state.memory) {
    verifiedAt = Number(memory.secrets.get('cf_verified_at') || 0);
    accountId = memory.secrets.get('cf_account_id') || '';
  } else {
    const rows = await all(env, `SELECT key, value FROM system_config WHERE key IN ('cf_verified_at', 'cf_account_id')`);
    for (const row of rows) {
      if (row.key === 'cf_verified_at') verifiedAt = Number(row.value || 0);
      if (row.key === 'cf_account_id') accountId = row.value || '';
    }
  }
  return {
    connected: Boolean(stored.token),
    storage: stored.storage,
    encryption: stored.mode,
    encryptionKeyConfigured: Boolean(String(env.MILI_ENCRYPTION_KEY || env.MILICONFIG_ENCRYPTION_KEY || '').length >= 16),
    verifiedAt,
    accountId,
    error: stored.error || null
  };
}

async function clearCloudflareToken(env) {
  await ensureV4Schema(env);
  if (state.memory) {
    memory.secrets.delete(CF_TOKEN_KEY);
    memory.secrets.delete(CF_TOKEN_MODE);
    memory.secrets.delete('cf_verified_at');
    return;
  }
  await run(env, `DELETE FROM system_config WHERE key IN (?, ?, 'cf_verified_at')`, CF_TOKEN_KEY, CF_TOKEN_MODE);
}

async function saveCloudflareResource(env, resource = {}) {
  await ensureV4Schema(env);
  const now = Date.now();
  const id = resource.id || `cf-${randomToken(6)}`;
  if (state.memory) {
    memory.secrets.set(`resource:${id}`, JSON.stringify(resource));
    return id;
  }
  await run(
    env,
    `INSERT INTO cloudflare_resources (id, kind, account_id, zone_id, name, status, detail, checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status = excluded.status, detail = excluded.detail, checked_at = excluded.checked_at`,
    id, resource.kind || 'account', resource.accountId || '', resource.zoneId || '',
    resource.name || '', resource.status || '', resource.detail || '', now
  );
  return id;
}

async function listCloudflareResources(env) {
  await ensureV4Schema(env);
  if (state.memory) return [];
  const rows = await all(env, `SELECT * FROM cloudflare_resources ORDER BY checked_at DESC LIMIT 50`);
  return rows.map(row => ({
    id: row.id, kind: row.kind, accountId: row.account_id, zoneId: row.zone_id,
    name: row.name, status: row.status, detail: row.detail, checkedAt: Number(row.checked_at)
  }));
}

// -------------------------------------------------------------------- audit --

async function listAuditLogsPaged(env, { limit = 50, offset = 0 } = {}) {
  await ensureV4Schema(env);
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50));
  const safeOffset = Math.max(0, Number(offset) || 0);
  if (state.memory) {
    const { getAuditLogs } = await import('./d1.js');
    return await getAuditLogs(env, safeLimit);
  }
  const rows = await all(
    env,
    `SELECT id, action, detail, ip, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    safeLimit, safeOffset
  );
  return rows.map(row => ({
    id: row.id, action: row.action, detail: row.detail, ip: row.ip, createdAt: Number(row.created_at)
  }));
}


// --- MODULE: src/core/automation.js ---
// ============================================================================
// miliconfigOS v4.0 - automation engine
// One implementation of every job kind, shared by the on-demand API
// (`POST /api/v1/automation/:id/run`) and the Cron Trigger (`scheduled()`).
// Jobs only observe and report; destructive changes always require the
// administrator, and every run is recorded in automation_runs.
// ============================================================================


const MAX_JOBS_PER_TICK = 6;

async function runAutomationJob(env, job, cfg, clientIp = 'cron') {
  const started = Date.now();
  let detail = '';
  try {
    if (job.kind === 'health') {
      const targets = (await listEndpoints(env)).filter(item => item.enabled).slice(0, 8);
      if (!targets.length) {
        detail = 'No enabled endpoints to check.';
      } else {
        const scan = await scanTargets(
          targets.map(item => ({ host: item.host, port: item.port, levels: ['syntax', 'dns', 'tcp', 'tls'] })),
          { concurrency: Math.min(8, Number(cfg.scannerConcurrency) || 4) }
        );
        for (let i = 0; i < targets.length; i++) {
          await recordEndpointHealth(env, targets[i].id, scan.results[i]);
        }
        const healthy = scan.results.filter(item => item.score >= 60).length;
        detail = `Checked ${targets.length} endpoint(s); ${healthy} scored 60 or higher.`;
      }
    } else if (job.kind === 'expiry') {
      const users = await listUsers(env);
      const now = Date.now();
      const expired = users.filter(user => user.expireAt > 0 && user.expireAt < now);
      detail = `${expired.length} expired user(s): ${expired.map(user => user.username).join(', ') || 'none'}. No accounts were modified.`;
    } else if (job.kind === 'quota') {
      const users = await listUsers(env);
      const exhausted = users.filter(user => user.dataLimitGb > 0 && user.usedBytes >= user.dataLimitGb * 1073741824);
      detail = `${exhausted.length} user(s) at quota: ${exhausted.map(user => user.username).join(', ') || 'none'}.`;
    } else if (job.kind === 'config-validation') {
      const users = await listUsers(env);
      const endpoints = await listEndpoints(env);
      let valid = 0;
      let invalid = 0;
      for (const user of users) {
        const plans = buildPlans({ user, endpoints, settings: cfg, formats: ['uri'], limit: 1 });
        if (plans.valid.length) valid += 1;
        else invalid += 1;
      }
      detail = `${valid} user(s) have at least one valid combination; ${invalid} do not.`;
    } else {
      throw new Error(`Unknown job kind: ${job.kind}`);
    }

    await recordAutomationRun(env, job.id, { status: 'success', detail });
    await addAuditLog(env, 'اجرای اتوماسیون', `${job.name} · ${detail}`.slice(0, 300), clientIp);
    return { ok: true, jobId: job.id, kind: job.kind, detail, durationMs: Date.now() - started };
  } catch (err) {
    const message = String(err?.message || err);
    await recordAutomationRun(env, job.id, { status: 'failed', detail, error: message });
    return { ok: false, jobId: job.id, kind: job.kind, detail, error: message, durationMs: Date.now() - started };
  }
}

/**
 * Run every enabled job whose next_run_at has passed (or that never ran).
 * Used by the Cron Trigger; bounded so one tick can never loop forever.
 */
async function runDueAutomationJobs(env) {
  const jobs = await listAutomationJobs(env);
  const now = Date.now();
  const due = jobs
    .filter(job => job.enabled && (!job.nextRunAt || job.nextRunAt <= now))
    .slice(0, MAX_JOBS_PER_TICK);
  if (!due.length) return [];

  const cfg = await loadGlobalConfig(env);
  const results = [];
  for (const job of due) {
    results.push(await runAutomationJob(env, job, cfg));
  }
  return results;
}


// --- MODULE: src/subscription/converters.js ---
// ============================================================================
// miliconfig v3.1 - مبدل‌های داخلی اشتراک (Clash, Sing-box, Surge, Loon, QuanX, Residential Chain)
// منطبق ۱۰۰٪ با منطق کد اصلی CFnew v3.1 + نام‌گذاری number+miliconfig
// ============================================================================


function quoteYaml(val) {
  if (val == null) return '""';
  const s = String(val);
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

// SIP002 از base64url بدون padding استفاده می‌کند؛ atob مرورگر آن را نمی‌پذیرد
function decodeSip002(part) {
  const raw = String(part || '').trim();
  try {
    let b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    return atob(b64);
  } catch (_e) {
    try { return decodeURIComponent(raw); } catch (_e2) { return raw; }
  }
}

function normalizeHost(hostname) {
  if (!hostname) return hostname;
  const s = String(hostname);
  if (s.startsWith('[') && s.endsWith(']')) return s.slice(1, -1);
  return s;
}

function buildClashGroupProxies(names, opts = {}) {
  const { directFirst = false, extraGroups = [] } = opts;
  const nodeLines = names.length ? names.map(n => `      - ${quoteYaml(n)}`).join('\n') : '      - DIRECT';
  const lines = [];
  if (directFirst) {
    lines.push('      - "🎯 全球直连"', '      - "🚀 节点选择"');
  } else {
    lines.push('      - "🚀 节点选择"', '      - "🎯 全球直连"');
  }
  for (const g of extraGroups) lines.push(`      - ${quoteYaml(g)}`);
  lines.push(nodeLines);
  return lines.join('\n');
}

function buildIniGroupProxies(names, opts = {}) {
  const { directFirst = false, extraGroups = [], compact = false } = opts;
  const sep = compact ? ',' : ', ';
  const listStr = names.length ? names.join(sep) : 'DIRECT';
  const parts = [];
  if (directFirst) parts.push('🎯 全球直连', '🚀 节点选择');
  else parts.push('🚀 节点选择', '🎯 全球直连');
  parts.push(...extraGroups);
  if (names.length) parts.push(listStr);
  return parts.join(sep);
}

function parseShareLink(link) {
  try {
    if (link.startsWith('vless://')) {
      const url = new URL(link);
      const params = new URLSearchParams(url.search);
      return {
        proto: 'vless',
        name: decodeURIComponent(url.hash.substring(1)) || `${url.hostname}:${url.port}`,
        uuid: url.username,
        server: normalizeHost(url.hostname),
        port: parseInt(url.port, 10) || 443,
        tls: params.get('security') === 'tls' || params.get('security') === 'reality',
        network: params.get('type') || 'ws',
        path: params.get('path') || '/?ed=2048',
        host: normalizeHost(params.get('host') || url.hostname),
        sni: normalizeHost(params.get('sni') || params.get('host') || url.hostname),
        alpn: (params.get('alpn') || '').split(',').map(s => s.trim()).filter(Boolean),
        fp: params.get('fp') || 'chrome',
        flow: params.get('flow') || '',
        encryption: params.get('encryption') || 'none',
        mode: params.get('mode') || '',
        ech: params.get('ech') || ''
      };
    }
    if (link.startsWith('trojan://')) {
      const url = new URL(link);
      const params = new URLSearchParams(url.search);
      return {
        proto: 'trojan',
        name: decodeURIComponent(url.hash.substring(1)) || `${url.hostname}:${url.port}`,
        password: decodeURIComponent(url.username),
        server: normalizeHost(url.hostname),
        port: parseInt(url.port, 10) || 443,
        tls: params.get('security') !== 'none',
        network: params.get('type') || 'ws',
        path: params.get('path') || '/?ed=2048',
        host: normalizeHost(params.get('host') || url.hostname),
        sni: normalizeHost(params.get('sni') || params.get('host') || url.hostname),
        alpn: (params.get('alpn') || '').split(',').map(s => s.trim()).filter(Boolean),
        fp: params.get('fp') || 'chrome',
        ech: params.get('ech') || ''
      };
    }
    if (link.startsWith('ss://')) {
      const rest = link.substring(5);
      const hashIdx = rest.indexOf('#');
      const mainPart = hashIdx > -1 ? rest.substring(0, hashIdx) : rest;
      const nodeName = hashIdx > -1 ? decodeURIComponent(rest.substring(hashIdx + 1)) : 'Shadowsocks';

      let cipher = 'chacha20-ietf-poly1305';
      let password = '';
      let server = '';
      let port = 443;
      let host = '';
      let path = '/';
      let isTls = true;
      let fp = 'chrome';

      const atIdx = mainPart.indexOf('@');
      if (atIdx > -1) {
        const credPart = mainPart.substring(0, atIdx);
        const credDecoded = decodeSip002(credPart);
        const colonIdx = credDecoded.indexOf(':');
        if (colonIdx > -1) {
          cipher = credDecoded.substring(0, colonIdx);
          password = credDecoded.substring(colonIdx + 1);
        } else {
          password = credDecoded;
        }

        const serverPart = mainPart.substring(atIdx + 1);
        const qIdx = serverPart.indexOf('?');
        const hp = qIdx > -1 ? serverPart.substring(0, qIdx).replace(/\/$/, '') : serverPart.replace(/\/$/, '');
        const query = qIdx > -1 ? serverPart.substring(qIdx + 1) : '';

        let addr = hp;
        let p = 443;
        if (hp.startsWith('[')) {
          const m = hp.match(/^(\[[^\]]+\])(?::(\d+))?$/);
          if (m) { addr = m[1]; p = parseInt(m[2] || '443', 10); }
        } else {
          const cIdx = hp.lastIndexOf(':');
          if (cIdx > -1) {
            addr = hp.substring(0, cIdx);
            p = parseInt(hp.substring(cIdx + 1) || '443', 10);
          }
        }
        server = addr;
        port = p;

        const sp = new URLSearchParams(query);
        host = sp.get('host') || sp.get('sni') || server;
        path = sp.get('path') || '/';
        isTls = sp.get('security') === 'tls' || (sp.get('plugin') || '').includes('tls');
        fp = sp.get('fp') || 'chrome';

        // گزینه‌های v2ray-plugin (mode/host/path/tls) مرجع واقعی هدر Host و مسیر در SS هستند
        const pluginRaw = sp.get('plugin') || '';
        if (pluginRaw) {
          const parts = pluginRaw.split(';').map(x => x.trim()).filter(Boolean);
          for (const part of parts) {
            const eq = part.indexOf('=');
            const key = (eq > -1 ? part.slice(0, eq) : part).toLowerCase();
            const val = eq > -1 ? part.slice(eq + 1) : '';
            if (key === 'host' && val) host = val;
            else if (key === 'path' && val) path = val;
            else if (key === 'tls') isTls = true;
          }
        }
      } else {
        // قالب قدیمی شادوساکس: ss://base64(method:pass@host:port)?plugin=v2ray-plugin;...
        try {
          const qIdx0 = mainPart.indexOf('?');
          const b64Part = qIdx0 > -1 ? mainPart.substring(0, qIdx0) : mainPart;
          const query0 = qIdx0 > -1 ? mainPart.substring(qIdx0 + 1) : '';
          const decoded = decodeSip002(b64Part) || decodeBase64Utf8(b64Part);
          const atInDec = String(decoded || '').indexOf('@');
          if (atInDec > -1) {
            const cred = decoded.substring(0, atInDec);
            const srvP = decoded.substring(atInDec + 1);
            const colonIdx = cred.indexOf(':');
            cipher = colonIdx > -1 ? cred.substring(0, colonIdx) : cipher;
            password = colonIdx > -1 ? cred.substring(colonIdx + 1) : cred;
            const cIdx = srvP.lastIndexOf(':');
            if (cIdx > -1) {
              server = srvP.substring(0, cIdx);
              port = parseInt(srvP.substring(cIdx + 1) || '443', 10);
            } else {
              server = srvP;
            }
            host = server;
            const sp0 = new URLSearchParams(query0);
            host = sp0.get('host') || sp0.get('sni') || host;
            path = sp0.get('path') || path;
            isTls = sp0.get('security') === 'tls' || (sp0.get('plugin') || '').includes('tls');
            const pluginRaw0 = sp0.get('plugin') || '';
            if (pluginRaw0) {
              for (const part of pluginRaw0.split(';').map(x => x.trim()).filter(Boolean)) {
                const eq = part.indexOf('=');
                const key = (eq > -1 ? part.slice(0, eq) : part).toLowerCase();
                const val = eq > -1 ? part.slice(eq + 1) : '';
                if (key === 'host' && val) host = val;
                else if (key === 'path' && val) path = val;
                else if (key === 'tls') isTls = true;
              }
            }
          }
        } catch (_e) {}
      }

      if (server) {
        return {
          proto: 'ss',
          name: nodeName,
          cipher,
          password,
          server: normalizeHost(server),
          port,
          tls: isTls,
          network: 'ws',
          path,
          host: normalizeHost(host),
          sni: normalizeHost(host),
          fp
        };
      }
    }
  } catch (_e) {}
  return null;
}

function buildClashNodeYaml(node, customECHDomain = 'cloudflare-ech.com') {
  const lines = [];
  const srv = normalizeHost(node.server);
  const host = normalizeHost(node.host) || srv;
  const sni = normalizeHost(node.sni) || host;
  lines.push(`  - name: ${quoteYaml(node.name)}`);
  lines.push(`    type: ${node.proto}`);
  lines.push(`    server: ${quoteYaml(srv)}`);
  lines.push(`    port: ${node.port}`);
  if (node.proto === 'vless') {
    lines.push(`    uuid: ${node.uuid}`);
    lines.push(`    udp: true`);
    lines.push(`    tls: ${node.tls ? 'true' : 'false'}`);
    if (node.flow) lines.push(`    flow: ${quoteYaml(node.flow)}`);
    lines.push(`    client-fingerprint: ${quoteYaml(node.fp || 'chrome')}`);
  } else if (node.proto === 'trojan') {
    lines.push(`    password: ${quoteYaml(node.password)}`);
    lines.push(`    udp: true`);
    lines.push(`    client-fingerprint: ${quoteYaml(node.fp || 'chrome')}`);
  } else if (node.proto === 'ss') {
    lines.push(`    cipher: ${quoteYaml(node.cipher || 'none')}`);
    lines.push(`    password: ${quoteYaml(node.password)}`);
    lines.push(`    udp: true`);
    lines.push(`    plugin: v2ray-plugin`);
    lines.push(`    plugin-opts:`);
    lines.push(`      mode: websocket`);
    lines.push(`      tls: ${node.tls ? 'true' : 'false'}`);
    lines.push(`      skip-cert-verify: false`);
    lines.push(`      host: ${quoteYaml(host)}`);
    lines.push(`      path: ${quoteYaml(node.path || '/')}`);
  }
  if (node.tls && node.proto !== 'ss') {
    lines.push(`    servername: ${quoteYaml(sni)}`);
    if (node.alpn && node.alpn.length) {
      lines.push(`    alpn: [${node.alpn.map(a => quoteYaml(a)).join(', ')}]`);
    }
    lines.push(`    skip-cert-verify: false`);
  }
  if (node.network === 'ws' || node.network === 'xhttp') {
    lines.push(`    network: ws`);
    lines.push(`    ws-opts:`);
    lines.push(`      path: ${quoteYaml(node.path)}`);
    lines.push(`      headers:`);
    lines.push(`        Host: ${quoteYaml(host)}`);
  } else if (node.network === 'grpc') {
    lines.push(`    network: grpc`);
    lines.push(`    grpc-opts:`);
    lines.push(`      grpc-service-name: ${quoteYaml(node.path)}`);
  }
  if (node.ech) {
    const echDomain = customECHDomain || 'cloudflare-ech.com';
    lines.push(`    ech-opts:`);
    lines.push(`      enable: true`);
    lines.push(`      query-server-name: ${quoteYaml(echDomain)}`);
  }
  return lines.join('\n');
}

function generateClashConfig(links, options = {}) {
  // xHTTP is an Xray transport; Clash/Mihomo cannot represent it as WebSocket.
  links = (links || []).filter(link => !/[?&]type=xhttp/i.test(link));
  const customDNS = options.customDNS || 'https://223.5.5.5/dns-query';
  const customECHDomain = options.customECHDomain || 'cloudflare-ech.com';
  const nodes = links.map(parseShareLink).filter(n => n && (n.proto === 'vless' || n.proto === 'trojan' || n.proto === 'ss'));
  const names = nodes.map(n => n.name);

  const header = [
    '# miliconfig v3.1 - Clash / Mihomo Subscription',
    'mixed-port: 7890',
    'allow-lan: true',
    'mode: rule',
    'log-level: info',
    'ipv6: true',
    'external-controller: 127.0.0.1:9090',
    'unified-delay: true',
    'tcp-concurrent: true',
    'geodata-mode: true',
    'geo-auto-update: true',
    'geo-update-interval: 24',
    'geox-url:',
    '  geoip: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat"',
    '  geosite: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat"',
    '  mmdb: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb"',
    '  asn: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/GeoLite2-ASN.mmdb"',
    'sniffer:',
    '  enable: true',
    '  force-dns-mapping: true',
    '  parse-pure-ip: true',
    '  sniff:',
    '    HTTP:',
    '      ports: [80, 8080-8880]',
    '      override-destination: true',
    '    TLS:',
    '      ports: [443, 8443]',
    '    QUIC:',
    '      ports: [443, 8443]',
    'dns:',
    '  enable: true',
    '  listen: 0.0.0.0:1053',
    '  ipv6: true',
    '  enhanced-mode: fake-ip',
    '  fake-ip-range: 198.18.0.1/16',
    '  fake-ip-filter:',
    '    - "*.lan"',
    '    - "+.local"',
    '    - "+.market.xiaomi.com"',
    '    - "+.msftconnecttest.com"',
    '    - "+.msftncsi.com"',
    '    - "localhost.ptlogin2.qq.com"',
    '    - "+.srv.nintendo.net"',
    '    - "+.stun.playstation.net"',
    '    - "+.xboxlive.com"',
    '  default-nameserver:',
    '    - 223.5.5.5',
    '    - 119.29.29.29',
    '  nameserver:',
    `    - ${customDNS}`,
    '    - https://119.29.29.29/dns-query',
    '  fallback:',
    '    - https://1.1.1.1/dns-query',
    '    - https://8.8.8.8/dns-query',
    '  fallback-filter:',
    '    geoip: true',
    '    geoip-code: CN',
    '    ipcidr:',
    '      - 240.0.0.0/4',
    ''
  ];

  const proxiesSection = ['proxies:'];
  for (const n of nodes) proxiesSection.push(buildClashNodeYaml(n, customECHDomain));

  const nodesOnly = names.length ? names.map(n => `      - ${quoteYaml(n)}`).join('\n') : '      - DIRECT';
  const groupsSection = [
    'proxy-groups:',
    '  - name: "🚀 节点选择"',
    '    type: select',
    '    proxies:',
    '      - "🎯 全球直连"',
    nodesOnly,
    '  - name: "🌍 国外媒体"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names),
    '  - name: "📺 哔哩哔哩"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names, { directFirst: true }),
    '  - name: "📹 油管视频"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names, { extraGroups: ['🌍 国外媒体'] }),
    '  - name: "🎬 奈飞视频"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names, { extraGroups: ['🌍 国外媒体'] }),
    '  - name: "📲 电报信息"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names),
    '  - name: "🌐 谷歌服务"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names),
    '  - name: "🤖 OpenAI"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names),
    '  - name: "Ⓜ️ 微软服务"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names, { directFirst: true }),
    '  - name: "🍎 苹果服务"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names, { directFirst: true }),
    '  - name: "🎯 全球直连"',
    '    type: select',
    '    proxies:',
    '      - DIRECT',
    '  - name: "🛑 全球拦截"',
    '    type: select',
    '    proxies:',
    '      - REJECT',
    '      - DIRECT',
    '  - name: "🍃 应用净化"',
    '    type: select',
    '    proxies:',
    '      - REJECT',
    '      - DIRECT',
    '  - name: "🐟 漏网之鱼"',
    '    type: select',
    '    proxies:',
    buildClashGroupProxies(names),
    ''
  ];

  const ruleBase = 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release';
  const provider = (name, behavior) => [
    `  ${name}:`,
    `    type: http`,
    `    behavior: ${behavior}`,
    `    url: "${ruleBase}/${name}.txt"`,
    `    path: ./rulesets/loyalsoldier/${name}.txt`,
    `    interval: 86400`
  ].join('\n');

  const ruleProviders = [
    'rule-providers:',
    provider('reject', 'domain'),
    provider('icloud', 'domain'),
    provider('apple', 'domain'),
    provider('google', 'domain'),
    provider('proxy', 'domain'),
    provider('direct', 'domain'),
    provider('private', 'domain'),
    provider('gfw', 'domain'),
    provider('greatfire', 'domain'),
    provider('tld-not-cn', 'domain'),
    provider('telegramcidr', 'ipcidr'),
    provider('cncidr', 'ipcidr'),
    provider('lancidr', 'ipcidr'),
    provider('applications', 'classical'),
    ''
  ];

  const rules = [
    'rules:',
    '  - DOMAIN-SUFFIX,acl4.ssr,🎯 全球直连',
    '  - DOMAIN-SUFFIX,local,🎯 全球直连',
    '  - DOMAIN,clash.razord.top,🎯 全球直连',
    '  - DOMAIN,yacd.haishan.me,🎯 全球直连',
    '  - DOMAIN,yacd.metacubex.one,🎯 全球直连',
    '  - DOMAIN,d.metacubex.one,🎯 全球直连',
    '  - DOMAIN-SUFFIX,googleapis.cn,🌐 谷歌服务',
    '  - DOMAIN-SUFFIX,gstatic.com,🌐 谷歌服务',
    '  - DOMAIN-SUFFIX,xn--ngstr-lra8j.com,🌐 谷歌服务',
    '  - DOMAIN-SUFFIX,googlevideo.com,📹 油管视频',
    '  - DOMAIN-SUFFIX,googleusercontent.com,🌐 谷歌服务',
    '  - DOMAIN-KEYWORD,youtube,📹 油管视频',
    '  - DOMAIN-SUFFIX,youtube.com,📹 油管视频',
    '  - DOMAIN-SUFFIX,youtu.be,📹 油管视频',
    '  - DOMAIN-KEYWORD,netflix,🎬 奈飞视频',
    '  - DOMAIN-SUFFIX,nflxext.com,🎬 奈飞视频',
    '  - DOMAIN-SUFFIX,nflxso.net,🎬 奈飞视频',
    '  - DOMAIN-SUFFIX,nflxvideo.net,🎬 奈飞视频',
    '  - DOMAIN-SUFFIX,nflximg.com,🎬 奈飞视频',
    '  - DOMAIN-SUFFIX,nflximg.net,🎬 奈飞视频',
    '  - DOMAIN-SUFFIX,netflix.com,🎬 奈飞视频',
    '  - DOMAIN-SUFFIX,netflix.net,🎬 奈飞视频',
    '  - DOMAIN-SUFFIX,bilibili.com,📺 哔哩哔哩',
    '  - DOMAIN-SUFFIX,bilivideo.com,📺 哔哩哔哩',
    '  - DOMAIN-SUFFIX,hdslb.com,📺 哔哩哔哩',
    '  - DOMAIN-KEYWORD,openai,🤖 OpenAI',
    '  - DOMAIN-KEYWORD,chatgpt,🤖 OpenAI',
    '  - DOMAIN-SUFFIX,openai.com,🤖 OpenAI',
    '  - DOMAIN-SUFFIX,chatgpt.com,🤖 OpenAI',
    '  - DOMAIN-SUFFIX,oaistatic.com,🤖 OpenAI',
    '  - DOMAIN-SUFFIX,oaiusercontent.com,🤖 OpenAI',
    '  - DOMAIN-SUFFIX,anthropic.com,🤖 OpenAI',
    '  - DOMAIN-SUFFIX,claude.ai,🤖 OpenAI',
    '  - DOMAIN-SUFFIX,perplexity.ai,🤖 OpenAI',
    '  - DOMAIN-SUFFIX,gemini.google.com,🤖 OpenAI',
    '  - RULE-SET,applications,🎯 全球直连',
    '  - RULE-SET,private,🎯 全球直连',
    '  - RULE-SET,reject,🛑 全球拦截',
    '  - RULE-SET,icloud,🍎 苹果服务',
    '  - RULE-SET,apple,🍎 苹果服务',
    '  - RULE-SET,google,🌐 谷歌服务',
    '  - RULE-SET,proxy,🚀 节点选择',
    '  - RULE-SET,gfw,🚀 节点选择',
    '  - RULE-SET,greatfire,🚀 节点选择',
    '  - RULE-SET,tld-not-cn,🚀 节点选择',
    '  - RULE-SET,direct,🎯 全球直连',
    '  - RULE-SET,lancidr,🎯 全球直连,no-resolve',
    '  - RULE-SET,cncidr,🎯 全球直连,no-resolve',
    '  - RULE-SET,telegramcidr,📲 电报信息,no-resolve',
    '  - GEOIP,LAN,🎯 全球直连,no-resolve',
    '  - GEOIP,CN,🎯 全球直连,no-resolve',
    '  - MATCH,🐟 漏网之鱼'
  ];

  return [header.join('\n'), proxiesSection.join('\n'), '', groupsSection.join('\n'), ruleProviders.join('\n'), rules.join('\n'), ''].join('\n');
}

function splitDnsAddress(addr) {
  const text = String(addr || '').trim();
  try {
    const url = new URL(text);
    const proto = url.protocol.replace(':', '').toLowerCase();
    if (proto === 'https' || proto === 'http3' || proto === 'h3') {
      const out = { type: 'https', server: url.hostname };
      if (url.port) out.server_port = Number(url.port);
      if (url.pathname && url.pathname !== '/' && url.pathname !== '/dns-query') out.path = url.pathname;
      return out;
    }
    if (proto === 'tls') return { type: 'tls', server: url.hostname };
    if (proto === 'quic') return { type: 'quic', server: url.hostname };
    if (proto === 'udp' || proto === 'dns') return { type: 'udp', server: url.hostname };
  } catch (_e) {}
  return { type: 'udp', server: text.replace(/^[a-z0-9]+:\/\//i, '').split('/')[0] || '223.5.5.5' };
}

function generateSingboxConfig(links, options = {}) {
  // sing-box has no xHTTP transport; never downgrade it to WebSocket silently.
  links = (links || []).filter(link => !/[?&]type=xhttp/i.test(link));
  const customDNS = options.customDNS || 'https://223.5.5.5/dns-query';
  const nodes = links.map(parseShareLink).filter(n => n && (n.proto === 'vless' || n.proto === 'trojan' || n.proto === 'ss'));
  const outboundTags = nodes.map(n => n.name);

  function buildOutbound(n) {
    const out = {
      type: n.proto,
      tag: n.name,
      server: normalizeHost(n.server),
      server_port: n.port
    };
    if (n.proto === 'vless') {
      out.uuid = n.uuid;
      if (n.flow) out.flow = n.flow;
    } else if (n.proto === 'trojan') {
      out.password = n.password;
    } else if (n.proto === 'ss') {
      out.type = 'shadowsocks';
      out.method = n.cipher || 'none';
      out.password = n.password;
      // در sing-box تنظیمات WS/TLS شادوساکس داخل plugin_opts می‌رود
      const ssOpts = ['mode=websocket', `host=${n.host || n.sni || n.server}`, `path=${n.path || '/'}`];
      if (n.tls) ssOpts.push('tls');
      out.plugin = 'v2ray-plugin';
      out.plugin_opts = ssOpts.join(';');
    }
    if (n.tls && n.proto !== 'ss') {
      out.tls = {
        enabled: true,
        server_name: n.sni,
        insecure: false,
        utls: {
          enabled: true,
          fingerprint: n.fp || 'chrome'
        }
      };
      if (n.alpn && n.alpn.length) out.tls.alpn = n.alpn;
      if (n.ech) {
        out.tls.ech = {
          enabled: true,
          pq_signature_schemes_enabled: false,
          dynamic_record_sizing_disabled: false
        };
      }
    }
    if (n.proto === 'ss') {
      // شادوساکس sing-box فقط از طریق plugin_opts به WS وصل می‌شود
    } else if (n.network === 'ws' || n.network === 'xhttp') {
      out.transport = {
        type: 'ws',
        path: n.path,
        headers: { Host: n.host },
        max_early_data: 2048,
        early_data_header_name: 'Sec-WebSocket-Protocol'
      };
    } else if (n.network === 'grpc') {
      out.transport = {
        type: 'grpc',
        service_name: n.path
      };
    }
    return out;
  }

  const geositeBase = 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geosite';
  const geoipBase = 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geoip';
  const geositeRule = name => ({
    tag: `geosite-${name}`,
    type: 'remote',
    format: 'binary',
    url: `${geositeBase}/${name}.srs`,
    download_detour: 'direct'
  });
  const geoipRule = name => ({
    tag: `geoip-${name}`,
    type: 'remote',
    format: 'binary',
    url: `${geoipBase}/${name}.srs`,
    download_detour: 'direct'
  });

  const config = {
    log: { level: 'info', timestamp: true },
    dns: {
      servers: [
        { ...splitDnsAddress(customDNS), tag: 'remote', detour: 'select' },
        { type: 'udp', tag: 'local', server: '223.5.5.5', detour: 'direct' },
        { type: 'fakeip', tag: 'fakeip', inet4_range: '198.18.0.0/15', inet6_range: 'fc00::/18' }
      ],
      rules: [
        { rule_set: 'geosite-category-ads-all', action: 'reject' },
        { rule_set: 'geosite-cn', server: 'local' },
        { query_type: ['A', 'AAAA'], server: 'fakeip' }
      ],
      strategy: 'ipv4_only'
    },
    inbounds: [
      { type: 'mixed', tag: 'mixed-in', listen: '127.0.0.1', listen_port: 2080 },
      {
        type: 'tun',
        tag: 'tun-in',
        interface_name: 'sing-box',
        address: ['172.19.0.1/30', 'fdfe:dcba:9876::1/126'],
        mtu: 9000,
        auto_route: true,
        strict_route: true,
        stack: 'mixed'
      }
    ],
    outbounds: [
      { type: 'selector', tag: 'select', outbounds: ['direct', ...outboundTags], default: outboundTags[0] || 'direct' },
      { type: 'selector', tag: '🌍 国外媒体', outbounds: ['select', 'direct', ...outboundTags] },
      { type: 'selector', tag: '📲 电报信息', outbounds: ['select', 'direct', ...outboundTags] },
      { type: 'selector', tag: '🌐 谷歌服务', outbounds: ['select', 'direct', ...outboundTags] },
      { type: 'selector', tag: '🤖 OpenAI', outbounds: ['select', 'direct', ...outboundTags] },
      { type: 'selector', tag: 'Ⓜ️ 微软服务', outbounds: ['direct', 'select', ...outboundTags] },
      { type: 'selector', tag: '🍎 苹果服务', outbounds: ['direct', 'select', ...outboundTags] },
      { type: 'selector', tag: '📺 哔哩哔哩', outbounds: ['direct', 'select', ...outboundTags] },
      { type: 'selector', tag: '📹 油管视频', outbounds: ['select', '🌍 国外媒体', 'direct', ...outboundTags] },
      { type: 'selector', tag: '🎬 奈飞视频', outbounds: ['select', '🌍 国外媒体', 'direct', ...outboundTags] },
      { type: 'selector', tag: '🎯 全球直连', outbounds: ['direct'] },
      { type: 'selector', tag: '🐟 漏网之鱼', outbounds: ['select', 'direct', ...outboundTags] },
      ...nodes.map(buildOutbound),
      { type: 'direct', tag: 'direct' }
    ],
    route: {
      rule_set: [
        geositeRule('cn'), geositeRule('private'), geositeRule('apple'), geositeRule('apple-cn'),
        geositeRule('microsoft'), geositeRule('microsoft@cn'), geositeRule('google'), geositeRule('telegram'),
        geositeRule('openai'), geositeRule('anthropic'), geositeRule('youtube'), geositeRule('netflix'),
        geositeRule('disney'), geositeRule('spotify'), geositeRule('tiktok'), geositeRule('twitter'),
        geositeRule('facebook'), geositeRule('github'), geositeRule('geolocation-!cn'),
        geositeRule('category-ads-all'), geoipRule('cn'), geoipRule('private'), geoipRule('telegram')
      ],
      rules: [
        { action: 'sniff' },
        { protocol: 'dns', action: 'hijack-dns' },
        { ip_is_private: true, outbound: 'direct' },
        { rule_set: 'geosite-category-ads-all', action: 'reject' },
        { rule_set: 'geosite-private', outbound: 'direct' },
        { rule_set: 'geosite-apple-cn', outbound: 'direct' },
        { rule_set: 'geosite-microsoft@cn', outbound: 'direct' },
        { rule_set: 'geosite-apple', outbound: '🍎 苹果服务' },
        { rule_set: 'geosite-microsoft', outbound: 'Ⓜ️ 微软服务' },
        { rule_set: 'geosite-openai', outbound: '🤖 OpenAI' },
        { rule_set: 'geosite-anthropic', outbound: '🤖 OpenAI' },
        { rule_set: 'geosite-telegram', outbound: '📲 电报信息' },
        { rule_set: 'geoip-telegram', outbound: '📲 电报信息' },
        { rule_set: 'geosite-google', outbound: '🌐 谷歌服务' },
        { rule_set: 'geosite-youtube', outbound: '🌍 国外媒体' },
        { rule_set: 'geosite-netflix', outbound: '🌍 国外媒体' },
        { rule_set: 'geosite-disney', outbound: '🌍 国外媒体' },
        { rule_set: 'geosite-spotify', outbound: '🌍 国外媒体' },
        { rule_set: 'geosite-tiktok', outbound: '🌍 国外媒体' },
        { rule_set: 'geosite-twitter', outbound: '🌍 国外媒体' },
        { rule_set: 'geosite-facebook', outbound: '🌍 国外媒体' },
        { rule_set: 'geosite-github', outbound: 'select' },
        { rule_set: 'geosite-geolocation-!cn', outbound: 'select' },
        { rule_set: 'geosite-cn', outbound: 'direct' },
        { rule_set: 'geoip-cn', outbound: 'direct' },
        { ip_is_private: true, outbound: 'direct' }
      ],
      final: '🐟 漏网之鱼',
      default_domain_resolver: { server: 'local' },
      auto_detect_interface: true
    },
    experimental: {
      cache_file: { enabled: true, store_fakeip: true },
      clash_api: { external_controller: '127.0.0.1:9090' }
    }
  };

  return JSON.stringify(config, null, 2);
}

const aclRuleBase = 'https://fastly.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash';
const aclRule = name => `${aclRuleBase}/${name}.list`;

function generateSurgeConfig(links, options = {}) {
  links = (links || []).filter(link => !/[?&]type=xhttp/i.test(link));
  const customDNS = options.customDNS || '223.5.5.5';
  const nodes = links.map(parseShareLink).filter(n => n && (n.proto === 'trojan' || n.proto === 'ss'));
  const names = nodes.map(n => n.name);
  const lines = [
    '[General]',
    'loglevel = notify',
    'internet-test-url = http://www.apple.com/library/test/success.html',
    'proxy-test-url = http://www.gstatic.com/generate_204',
    'test-timeout = 3',
    `dns-server = ${customDNS.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}, 119.29.29.29, system`,
    'encrypted-dns-server = https://223.5.5.5/dns-query, https://1.12.12.12/dns-query',
    'ipv6 = true',
    'allow-wifi-access = false',
    'wifi-access-http-port = 6152',
    'wifi-access-socks5-port = 6153',
    'skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost, *.local, captive.apple.com',
    'exclude-simple-hostnames = true',
    'show-error-page-for-reject = true',
    '',
    '[Proxy]'
  ];
  for (const n of nodes) {
    if (n.proto === 'trojan') {
      lines.push(`${n.name} = trojan, ${n.server}, ${n.port}, password=${n.password}, sni=${n.sni}, ws=true, ws-path=${n.path}, ws-headers=Host:${n.host}, skip-cert-verify=false, tfo=true`);
    } else if (n.proto === 'ss') {
      lines.push(`${n.name} = ss, ${n.server}, ${n.port}, encrypt-method=${n.cipher || 'chacha20-ietf-poly1305'}, password=${n.password}, ws=true, ws-path=${n.path || '/'}, ws-headers=Host:${n.host}, tls=${n.tls ? 'true' : 'false'}, sni=${n.sni}`);
    }
  }
  if (!nodes.length) {
    lines.push('Direct = direct');
  }
  lines.push('', '[Proxy Group]');
  const listStr = names.length ? names.join(', ') : 'DIRECT';
  lines.push(`🚀 节点选择 = select, 🎯 全球直连, ${listStr}`);
  lines.push(`🌍 国外媒体 = select, ${buildIniGroupProxies(names)}`);
  lines.push(`📺 哔哩哔哩 = select, ${buildIniGroupProxies(names, { directFirst: true })}`);
  lines.push(`📹 油管视频 = select, ${buildIniGroupProxies(names, { extraGroups: ['🌍 国外媒体'] })}`);
  lines.push(`🎬 奈飞视频 = select, ${buildIniGroupProxies(names, { extraGroups: ['🌍 国外媒体'] })}`);
  lines.push(`📲 电报信息 = select, ${buildIniGroupProxies(names)}`);
  lines.push(`🌐 谷歌服务 = select, ${buildIniGroupProxies(names)}`);
  lines.push(`🤖 OpenAI = select, ${buildIniGroupProxies(names)}`);
  lines.push(`Ⓜ️ 微软服务 = select, ${buildIniGroupProxies(names, { directFirst: true })}`);
  lines.push(`🍎 苹果服务 = select, ${buildIniGroupProxies(names, { directFirst: true })}`);
  lines.push(`🎯 全球直连 = select, DIRECT`);
  lines.push(`🛑 全球拦截 = select, REJECT, DIRECT`);
  lines.push(`🐟 漏网之鱼 = select, ${buildIniGroupProxies(names)}`);
  lines.push('', '[Rule]');
  lines.push(`RULE-SET,${aclRule('LocalAreaNetwork')},🎯 全球直连`);
  lines.push(`RULE-SET,${aclRule('UnBan')},🎯 全球直连`);
  lines.push(`RULE-SET,${aclRule('BanAD')},🛑 全球拦截`);
  lines.push(`RULE-SET,${aclRule('BanProgramAD')},🛑 全球拦截`);
  lines.push(`RULE-SET,${aclRule('GoogleFCM')},🌐 谷歌服务`);
  lines.push(`RULE-SET,${aclRule('GoogleCN')},🎯 全球直连`);
  lines.push(`RULE-SET,${aclRule('SteamCN')},🎯 全球直连`);
  lines.push(`RULE-SET,${aclRule('Microsoft')},Ⓜ️ 微软服务`);
  lines.push(`RULE-SET,${aclRule('Apple')},🍎 苹果服务`);
  lines.push(`RULE-SET,${aclRule('Telegram')},📲 电报信息`);
  lines.push(`RULE-SET,${aclRule('OpenAi')},🤖 OpenAI`);
  lines.push(`RULE-SET,${aclRule('Claude')},🤖 OpenAI`);
  lines.push(`RULE-SET,${aclRule('Copilot')},🤖 OpenAI`);
  lines.push(`RULE-SET,${aclRule('Netflix')},🌍 国外媒体`);
  lines.push(`RULE-SET,${aclRule('YouTube')},🌍 国外媒体`);
  lines.push(`RULE-SET,${aclRule('Disney')},🌍 国外媒体`);
  lines.push(`RULE-SET,${aclRule('Spotify')},🌍 国外媒体`);
  lines.push(`RULE-SET,${aclRule('TikTok')},🌍 国外媒体`);
  lines.push(`RULE-SET,${aclRule('BiliBili')},📺 哔哩哔哩`);
  lines.push(`RULE-SET,${aclRule('ProxyMedia')},🌍 国外媒体`);
  lines.push(`RULE-SET,${aclRule('ProxyGFWlist')},🚀 节点选择`);
  lines.push(`RULE-SET,${aclRule('ChinaDomain')},🎯 全球直连`);
  lines.push(`RULE-SET,${aclRule('ChinaCompanyIp')},🎯 全球直连`);
  lines.push(`RULE-SET,${aclRule('ChinaIp')},🎯 全球直连`);
  lines.push('GEOIP,CN,🎯 全球直连');
  lines.push('FINAL,🐟 漏网之鱼,dns-failed');
  return lines.join('\n');
}

function generateLoonConfig(links, options = {}) {
  links = (links || []).filter(link => !/[?&]type=xhttp/i.test(link));
  const customDNS = options.customDNS || '223.5.5.5';
  const nodes = links.map(parseShareLink).filter(n => n && (n.proto === 'vless' || n.proto === 'trojan' || n.proto === 'ss'));
  const names = nodes.map(n => n.name);
  const lines = [
    '[General]',
    'ip-mode = dual',
    `dns-server = ${customDNS.replace(/^https?:\/\//, '').replace(/\/.*$/, '')},119.29.29.29,system`,
    'doh-server = https://223.5.5.5/dns-query, https://1.12.12.12/dns-query',
    'allow-udp-proxy = true',
    'allow-wifi-access = false',
    'sni-sniffing = true',
    'skip-proxy = 127.0.0.1,192.168.0.0/16,10.0.0.0/8,172.16.0.0/12,localhost,*.local,captive.apple.com',
    'bypass-tun = 10.0.0.0/8,100.64.0.0/10,127.0.0.0/8,169.254.0.0/16,172.16.0.0/12,192.0.0.0/24,192.0.2.0/24,192.88.99.0/24,192.168.0.0/16,198.51.100.0/24,203.0.113.0/24,224.0.0.0/4,255.255.255.255/32',
    '',
    '[Proxy]'
  ];
  for (const n of nodes) {
    if (n.proto === 'vless') {
      const parts = [`${n.server}`, `${n.port}`, `udp=true`, `username=${n.uuid}`, `transport=ws`, `path=${n.path}`, `host=${n.host}`, `over-tls=${n.tls ? 'true' : 'false'}`];
      if (n.tls) {
        parts.push(`tls-name=${n.sni}`);
        if (n.alpn && n.alpn.length) parts.push(`alpn=${n.alpn.join(':')}`);
        parts.push(`skip-cert-verify=false`);
      }
      lines.push(`${n.name} = vless,${parts.join(',')}`);
    } else if (n.proto === 'trojan') {
      const parts = [`${n.server}`, `${n.port}`, `password=${n.password}`, `transport=ws`, `path=${n.path}`, `host=${n.host}`, `over-tls=true`, `tls-name=${n.sni}`];
      if (n.alpn && n.alpn.length) parts.push(`alpn=${n.alpn.join(':')}`);
      parts.push(`skip-cert-verify=false`);
      lines.push(`${n.name} = trojan,${parts.join(',')}`);
    } else if (n.proto === 'ss') {
      lines.push(`${n.name} = Shadowsocks,${n.server},${n.port},${n.cipher || 'chacha20-ietf-poly1305'},"${n.password}",fast-open=false,udp=true,plugin=v2ray-plugin,plugin-opts=mode:websocket;host:${n.host};path:${n.path || '/'};tls:${n.tls ? 'true' : 'false'}`);
    }
  }
  lines.push('', '[Proxy Group]');
  const listStr = names.length ? names.join(',') : 'DIRECT';
  lines.push(`🚀 节点选择 = select,🎯 全球直连,${listStr}`);
  lines.push(`🌍 国外媒体 = select,${buildIniGroupProxies(names, { compact: true })}`);
  lines.push(`📺 哔哩哔哩 = select,${buildIniGroupProxies(names, { directFirst: true, compact: true })}`);
  lines.push(`📹 油管视频 = select,${buildIniGroupProxies(names, { extraGroups: ['🌍 国外媒体'], compact: true })}`);
  lines.push(`🎬 奈飞视频 = select,${buildIniGroupProxies(names, { extraGroups: ['🌍 国外媒体'], compact: true })}`);
  lines.push(`📲 电报信息 = select,${buildIniGroupProxies(names, { compact: true })}`);
  lines.push(`🌐 谷歌服务 = select,${buildIniGroupProxies(names, { compact: true })}`);
  lines.push(`🤖 OpenAI = select,${buildIniGroupProxies(names, { compact: true })}`);
  lines.push(`Ⓜ️ 微软服务 = select,${buildIniGroupProxies(names, { directFirst: true, compact: true })}`);
  lines.push(`🍎 苹果服务 = select,${buildIniGroupProxies(names, { directFirst: true, compact: true })}`);
  lines.push(`🎯 全球直连 = select,DIRECT`);
  lines.push(`🛑 全球拦截 = select,REJECT,DIRECT`);
  lines.push(`🐟 漏网之鱼 = select,${buildIniGroupProxies(names, { compact: true })}`);
  lines.push('', '[Remote Rule]');
  lines.push(`${aclRule('LocalAreaNetwork')}, policy=🎯 全球直连, tag=局域网, enabled=true`);
  lines.push(`${aclRule('BanAD')}, policy=🛑 全球拦截, tag=广告拦截, enabled=true`);
  lines.push(`${aclRule('BanProgramAD')}, policy=🛑 全球拦截, tag=应用广告, enabled=true`);
  lines.push(`${aclRule('GoogleCN')}, policy=🎯 全球直连, tag=GoogleCN, enabled=true`);
  lines.push(`${aclRule('SteamCN')}, policy=🎯 全球直连, tag=SteamCN, enabled=true`);
  lines.push(`${aclRule('Microsoft')}, policy=Ⓜ️ 微软服务, tag=微软, enabled=true`);
  lines.push(`${aclRule('Apple')}, policy=🍎 苹果服务, tag=苹果, enabled=true`);
  lines.push(`${aclRule('Telegram')}, policy=📲 电报信息, tag=电报, enabled=true`);
  lines.push(`${aclRule('OpenAi')}, policy=🤖 OpenAI, tag=OpenAI, enabled=true`);
  lines.push(`${aclRule('Netflix')}, policy=🌍 国外媒体, tag=Netflix, enabled=true`);
  lines.push(`${aclRule('YouTube')}, policy=🌍 国外媒体, tag=YouTube, enabled=true`);
  lines.push(`${aclRule('Disney')}, policy=🌍 国外媒体, tag=Disney, enabled=true`);
  lines.push(`${aclRule('Spotify')}, policy=🌍 国外媒体, tag=Spotify, enabled=true`);
  lines.push(`${aclRule('TikTok')}, policy=🌍 国外媒体, tag=TikTok, enabled=true`);
  lines.push(`${aclRule('BiliBili')}, policy=📺 哔哩哔哩, tag=哔哩哔哩, enabled=true`);
  lines.push(`${aclRule('ProxyMedia')}, policy=🌍 国外媒体, tag=代理媒体, enabled=true`);
  lines.push(`${aclRule('ProxyGFWlist')}, policy=🚀 节点选择, tag=代理列表, enabled=true`);
  lines.push(`${aclRule('ChinaDomain')}, policy=🎯 全球直连, tag=中国域名, enabled=true`);
  lines.push(`${aclRule('ChinaIp')}, policy=🎯 全球直连, tag=中国IP, enabled=true`);
  lines.push('', '[Rule]', 'GEOIP,CN,🎯 全球直连', 'FINAL,🐟 漏网之鱼');
  return lines.join('\n');
}

function generateQuanxConfig(links, options = {}) {
  links = (links || []).filter(link => !/[?&]type=xhttp/i.test(link));
  const customDNS = options.customDNS || '223.5.5.5';
  const nodes = links.map(parseShareLink).filter(n => n && (n.proto === 'vless' || n.proto === 'trojan' || n.proto === 'ss'));
  const names = nodes.map(n => n.name);
  const qxBase = 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/QuantumultX';
  const lines = [
    '[general]',
    'network_check_url=http://www.gstatic.com/generate_204',
    'server_check_url=http://www.gstatic.com/generate_204',
    'dns_exclusion_list=*.cmpassport.com, *.jegotrip.com.cn, *.icloud.com, *.icloud.com.cn, *.apple.com, *.weibo.com, *.qq.com',
    'running_mode_trigger=filter',
    '',
    '[dns]',
    `server=${customDNS.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`,
    'server=119.29.29.29',
    'server=https://223.5.5.5/dns-query',
    'server=https://1.12.12.12/dns-query',
    '',
    '[server_local]'
  ];
  for (const n of nodes) {
    if (n.proto === 'vless') {
      const parts = [`${n.server}:${n.port}`, `method=none`, `password=${n.uuid}`, `obfs=${n.tls ? 'wss' : 'ws'}`, `obfs-host=${n.host}`, `obfs-uri=${n.path}`];
      if (n.tls) parts.push(`tls-verification=true`, `tls13=true`);
      parts.push(`tag=${n.name}`);
      lines.push(`vless=${parts.join(', ')}`);
    } else if (n.proto === 'trojan') {
      const parts = [`${n.server}:${n.port}`, `password=${n.password}`, `over-tls=true`, `tls-host=${n.sni}`, `obfs=wss`, `obfs-host=${n.host}`, `obfs-uri=${n.path}`, `tls-verification=true`, `tag=${n.name}`];
      lines.push(`trojan=${parts.join(', ')}`);
    } else if (n.proto === 'ss') {
      lines.push(`shadowsocks=${n.server}:${n.port}, method=${n.cipher || 'chacha20-ietf-poly1305'}, password=${n.password}, obfs=${n.tls ? 'wss' : 'ws'}, obfs-host=${n.host}, obfs-uri=${n.path || '/'}, tag=${n.name}`);
    }
  }
  lines.push('', '[policy]');
  const listStr = names.length ? names.join(', ') : 'direct';
  lines.push(`static=🚀 节点选择, ${listStr}, direct`);
  lines.push(`static=🌍 国外媒体, ${buildIniGroupProxies(names)}`);
  lines.push(`static=📺 哔哩哔哩, ${buildIniGroupProxies(names, { directFirst: true })}`);
  lines.push(`static=📹 油管视频, ${buildIniGroupProxies(names, { extraGroups: ['🌍 国外媒体'] })}`);
  lines.push(`static=🎬 奈飞视频, ${buildIniGroupProxies(names, { extraGroups: ['🌍 国外媒体'] })}`);
  lines.push(`static=📲 电报信息, ${buildIniGroupProxies(names)}`);
  lines.push(`static=🌐 谷歌服务, ${buildIniGroupProxies(names)}`);
  lines.push(`static=🤖 OpenAI, ${buildIniGroupProxies(names)}`);
  lines.push(`static=Ⓜ️ 微软服务, ${buildIniGroupProxies(names, { directFirst: true })}`);
  lines.push(`static=🍎 苹果服务, ${buildIniGroupProxies(names, { directFirst: true })}`);
  lines.push(`static=🎯 全球直连, direct`);
  lines.push(`static=🛑 全球拦截, reject, direct`);
  lines.push(`static=🐟 漏网之鱼, ${buildIniGroupProxies(names)}`);
  lines.push('', '[filter_remote]');
  lines.push(`${qxBase}/Lan/Lan.list, tag=局域网, force-policy=🎯 全球直连, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Advertising/Advertising.list, tag=广告拦截, force-policy=🛑 全球拦截, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Microsoft/Microsoft.list, tag=微软, force-policy=Ⓜ️ 微软服务, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Apple/Apple.list, tag=苹果, force-policy=🍎 苹果服务, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Telegram/Telegram.list, tag=电报, force-policy=📲 电报信息, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Google/Google.list, tag=谷歌, force-policy=🌐 谷歌服务, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/OpenAI/OpenAI.list, tag=OpenAI, force-policy=🤖 OpenAI, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Claude/Claude.list, tag=Claude, force-policy=🤖 OpenAI, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/YouTube/YouTube.list, tag=YouTube, force-policy=🌍 国外媒体, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Netflix/Netflix.list, tag=Netflix, force-policy=🌍 国外媒体, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Disney/Disney.list, tag=Disney, force-policy=🌍 国外媒体, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Spotify/Spotify.list, tag=Spotify, force-policy=🌍 国外媒体, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/TikTok/TikTok.list, tag=TikTok, force-policy=🌍 国外媒体, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/BiliBili/BiliBili.list, tag=哔哩哔哩, force-policy=📺 哔哩哔哩, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/Global/Global.list, tag=全球加速, force-policy=🚀 节点选择, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push(`${qxBase}/ChinaMax/ChinaMax.list, tag=中国直连, force-policy=🎯 全球直连, update-interval=86400, opt-parser=false, enabled=true`);
  lines.push('', '[filter_local]', 'geoip, cn, 🎯 全球直连', 'final, 🐟 漏网之鱼');
  return lines.join('\n');
}

// ============================================================================
// زنجیره اینترنت خانگی (Residential Chain - ?target=vg / jk)
// ============================================================================
const JK_SOURCE = 'https://www.vpngate.net/api/iphone/';
const JK_CACHE_TTL = 30 * 60 * 1000;
let jkCache = null;
let jkCacheTime = 0;
const jkDirectiveRegex = {};

function getJkDirective(text, name) {
  if (!jkDirectiveRegex[name]) jkDirectiveRegex[name] = new RegExp('^[ \\t]*' + name + '[ \\t]+(.+?)[ \\t]*$', 'm');
  const m = text.match(jkDirectiveRegex[name]);
  return m ? m[1].trim() : '';
}

function getJkInlineBlock(text, tag) {
  const m = text.match(new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>'));
  return m ? m[1].trim() : '';
}

function indentCert(text, pad) {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(l => pad + l).join('\n');
}

function decodeJkConfig(b64, full = false) {
  const clean = b64.replace(/\s/g, '');
  if (full || clean.length <= 6000) return decodeBase64Utf8(clean);
  return decodeBase64Utf8(clean.slice(0, 6000));
}

function parseJkList(raw) {
  const candidates = [];
  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.charAt(0) === '*' || line.charAt(0) === '#') continue;
    const fields = line.split(',');
    if (fields.length < 15) continue;
    if ((fields[0] || '').indexOf('public-vpn') === 0) continue;
    if ((fields[1] || '').indexOf('219.100.37.') === 0) continue;
    const b64 = fields[fields.length - 1];
    if (!b64 || b64.length < 100) continue;
    candidates.push({
      country: (fields[6] || '').toUpperCase() || 'XX',
      speed: parseInt(fields[4], 10) || 0,
      b64
    });
  }
  candidates.sort((a, b) => b.speed - a.speed);
  const nodes = [];
  let cert = null;
  for (const item of candidates) {
    let text = '';
    try {
      text = decodeJkConfig(item.b64);
      if (!getJkDirective(text, 'remote')) text = decodeJkConfig(item.b64, true);
    } catch (_e) {
      continue;
    }
    if ((getJkDirective(text, 'proto') || 'tcp').toLowerCase() !== 'tcp') continue;
    const remote = getJkDirective(text, 'remote').split(/\s+/);
    if (!remote[0]) continue;
    if (!cert) {
      try {
        const fullText = decodeJkConfig(item.b64, true);
        const c = {
          ca: getJkInlineBlock(fullText, 'ca'),
          cert: getJkInlineBlock(fullText, 'cert'),
          key: getJkInlineBlock(fullText, 'key')
        };
        if (c.ca && c.cert && c.key) cert = c;
      } catch (_e) {}
      if (!cert) continue;
    }
    nodes.push({
      country: item.country,
      address: remote[0],
      port: parseInt(remote[1], 10) || 443,
      cipher: getJkDirective(text, 'cipher') || 'AES-128-CBC',
      auth: getJkDirective(text, 'auth') || 'SHA1'
    });
  }
  return { nodes, cert };
}

async function fetchJkNodes() {
  const now = Date.now();
  if (jkCache && now - jkCacheTime < JK_CACHE_TTL) return jkCache;
  let raw = '';
  let lastErr = null;
  for (const src of [JK_SOURCE, JK_SOURCE.replace(/^https:/, 'http:')]) {
    try {
      const resp = await fetch(src, {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/plain' }
      });
      if (!resp.ok) {
        lastErr = new Error('Status ' + resp.status);
        continue;
      }
      raw = await resp.text();
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!raw) throw lastErr || new Error('Empty JK response');
  const parsed = parseJkList(raw);
  if (!parsed.nodes.length || !parsed.cert) throw new Error('No valid JK residential nodes');
  jkCache = parsed;
  jkCacheTime = now;
  return parsed;
}

async function generateResidentialChainConfig(links, options = {}) {
  const customDNS = options.customDNS || 'https://223.5.5.5/dns-query';
  const customECHDomain = options.customECHDomain || 'cloudflare-ech.com';
  const subNodeCount = parseInt(options.subNodeCount ?? 50, 10) || 0;
  const frontGroupName = '⚡ CF前置';
  const jkAuto = '🏠 家宽自动';
  const jkSelect = '🏠 家宽节点';
  const mainSelect = '🚀 节点选择';

  const allFront = links
    .map(parseShareLink)
    .filter(n => n && (n.proto === 'vless' || n.proto === 'trojan'));
  const tlsFront = allFront.filter(n => n.tls);
  const frontNodes = (tlsFront.length ? tlsFront : allFront).map((n, idx) => ({
    ...n,
    name: `${idx + 1}+${BRAND_NAME}`
  }));
  const frontNames = frontNodes.map(n => n.name);

  const { nodes, cert } = await fetchJkNodes();
  const slicedJk = subNodeCount > 0 ? nodes.slice(0, subNodeCount) : nodes;
  const jkItems = slicedJk.map((n, idx) => ({
    ...n,
    name: `${frontNodes.length + idx + 1}+${BRAND_NAME}`
  }));

  const header = [
    '# miliconfig 家宽订阅：CF 节点带路，落地是住宅宽带',
    'mixed-port: 7890',
    'allow-lan: false',
    'mode: rule',
    'log-level: info',
    'ipv6: false',
    'unified-delay: true',
    'tcp-concurrent: true',
    'external-controller: 127.0.0.1:9090',
    'dns:',
    '  enable: true',
    '  ipv6: false',
    '  enhanced-mode: fake-ip',
    '  fake-ip-range: 198.18.0.1/16',
    '  nameserver:',
    '    - ' + customDNS,
    '    - https://1.1.1.1/dns-query',
    ''
  ];

  const proxySection = ['proxies:'];
  for (const n of frontNodes) proxySection.push(buildClashNodeYaml(n, customECHDomain));
  jkItems.forEach((n, idx) => {
    const row = [
      '  - name: "' + n.name + '"',
      '    type: openvpn',
      '    server: ' + n.address,
      '    port: ' + n.port,
      '    proto: tcp',
      '    username: vpn',
      '    password: vpn',
      '    cipher: ' + n.cipher,
      '    auth: ' + n.auth,
      '    udp: false',
      '    handshake-timeout: 30',
      '    remote-dns-resolve: true',
      '    dns: [ 8.8.8.8, 1.1.1.1 ]'
    ];
    if (frontNames.length) row.push('    dialer-proxy: "' + frontGroupName + '"');
    if (idx === 0) {
      row.push('    ca: &jkca |-', indentCert(cert.ca, '      '));
      row.push('    cert: &jkcert |-', indentCert(cert.cert, '      '));
      row.push('    key: &jkkey |-', indentCert(cert.key, '      '));
    } else {
      row.push('    ca: *jkca', '    cert: *jkcert', '    key: *jkkey');
    }
    proxySection.push(row.join('\n'));
  });

  const listFmt = arr => arr.map(x => '      - "' + x + '"').join('\n');
  const jkNames = jkItems.map(x => x.name);
  const groupSection = ['proxy-groups:'];
  if (frontNames.length) {
    groupSection.push(
      '  - name: "' + frontGroupName + '"',
      '    type: url-test',
      '    url: https://www.gstatic.com/generate_204',
      '    interval: 300',
      '    tolerance: 50',
      '    proxies:',
      listFmt(frontNames)
    );
  }
  groupSection.push(
    '  - name: "' + jkAuto + '"',
    '    type: fallback',
    '    url: https://www.gstatic.com/generate_204',
    '    interval: 1800',
    '    lazy: true',
    '    proxies:',
    listFmt(jkNames)
  );
  groupSection.push('  - name: "' + jkSelect + '"', '    type: select', '    proxies:', listFmt(jkNames));
  const mainList = ['      - "' + jkAuto + '"', '      - "' + jkSelect + '"'];
  if (frontNames.length) mainList.push('      - "' + frontGroupName + '"');
  mainList.push('      - DIRECT');
  groupSection.push('  - name: "' + mainSelect + '"', '    type: select', '    proxies:', mainList.join('\n'));

  const rules = [
    'rules:',
    '  - GEOIP,LAN,DIRECT,no-resolve',
    '  - GEOIP,CN,DIRECT,no-resolve',
    '  - MATCH,' + mainSelect
  ];

  return header.concat(proxySection, [''], groupSection, [''], rules, ['']).join('\n');
}


// --- MODULE: src/subscription/generator.js ---
// ============================================================================
// miliconfig v3.1 - تولیدکننده ساب‌لینک چندکاربره با نام‌گذاری number+miliconfig
// و اعمال دقیق تنظیمات هر کاربر + محدودیت تعداد نودها در ساب (subNodeCount)
// ============================================================================


function getOfficialDirectAddress() {
  const hit = OFFICIAL_DIRECT_IPS[Math.floor(Math.random() * OFFICIAL_DIRECT_IPS.length)];
  return {
    domain: hit,
    region: 'CF',
    regionCode: 'CF',
    port: 443
  };
}

function getNeighborRegions(region) {
  const map = {
    US: ['SG', 'JP', 'KR'],
    SG: ['JP', 'KR', 'US'],
    JP: ['SG', 'KR', 'US'],
    KR: ['JP', 'SG', 'US'],
    DE: ['NL', 'GB', 'SE', 'FI'],
    SE: ['DE', 'NL', 'FI', 'GB'],
    NL: ['DE', 'GB', 'SE', 'FI'],
    FI: ['SE', 'DE', 'NL', 'GB'],
    GB: ['DE', 'NL', 'SE', 'FI']
  };
  return map[region] || [];
}

function getOrderedRegions(region) {
  const neighbors = getNeighborRegions(region);
  const all = ['US', 'SG', 'JP', 'KR', 'DE', 'SE', 'NL', 'FI', 'GB'];
  return [region, ...neighbors, ...all.filter(r => r !== region && !neighbors.includes(r))];
}

async function selectFallbackProxyAddress(workerRegion = '', enableRegionMatch = true) {
  if (!workerRegion || workerRegion === 'CF') {
    return getOfficialDirectAddress();
  }
  if (FALLBACK_PROXY_IPS.length === 0) {
    return getOfficialDirectAddress();
  }
  if (enableRegionMatch && workerRegion) {
    const ordered = getOrderedRegions(workerRegion);
    for (const r of ordered) {
      const found = FALLBACK_PROXY_IPS.find(item => item.regionCode === r);
      if (found) return found;
    }
  }
  return FALLBACK_PROXY_IPS[0];
}

// ============================================================================
// مقدار پارامتر ECH در لینک‌ها — همان قالب قبلی: «دامنه ECH + آدرس DNS»
// ============================================================================
function buildEchParamValue(cfg = {}) {
  if (cfg.ech !== 'yes') return '';
  const dnsVal = cfg.customDNS || CONFIG_DEFAULTS.customDNS;
  const echDomain = cfg.customECHDomain || CONFIG_DEFAULTS.customECHDomain;
  return `${echDomain}+${dnsVal}`;
}

// مسیر یکتای هر نوع نود (vless/trojan/xhttp/ss) و هر کشور؛ ورکر به مسیر حساس نیست
// و همین مسیر را در درخواست WebSocket می‌بیند، پس تفکیک مسیرها اتصال را خراب نمی‌کند.
function buildNodePath(proto, cfg = {}, wkOverride = '', item = null) {
  // الگوی مسیر انتخاب‌شده در پنل (patt) دقیقاً روی نودها اعمال می‌شود
  const pattern = String(cfg.patt || '/?ed=2048').replace(/\{random\}/g, () => Math.random().toString(36).slice(2, 10));
  const qIdx = pattern.indexOf('?');
  const rawPath = qIdx > -1 ? pattern.slice(0, qIdx) : pattern;
  const rawQuery = qIdx > -1 ? pattern.slice(qIdx + 1) : '';
  const pathName = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
  const parts = [];
  if (rawQuery) parts.push(rawQuery);
  if (wkOverride) parts.push(`wk=${encodeURIComponent(wkOverride)}`);
  parts.push(`nt=${encodeURIComponent(proto)}`);
  const cc = String(item?.country || '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(cc)) parts.push(`cc=${cc}`);
  if (item?.proxy) parts.push(`s=${encodeProxyForPath(item.proxy)}`);
  return pathName + (parts.length ? '?' + parts.join('&') : '');
}

// پارامتر فرگمنت TLS مطابق فرمت کلاینتی v2rayNG/NekoBox: «طول,فاصله,نوع‌پکت»
function buildFragmentValue(cfg = {}) {
  // کلید اصلی روشن/خاموش فرگمنت؛ شادوساکس همیشه بدون فرگمنت ساخته می‌شود
  if (cfg.frag === 'no') return '';
  const presetId = String(cfg.fragmentPreset || 'off');
  if (presetId === 'off') return '';
  const preset = FRAGMENT_PRESETS[presetId] || FRAGMENT_PRESETS.mci;
  if (!preset) return '';
  let length = preset.length;
  let interval = preset.interval;
  let packets = preset.packets;
  if (presetId === 'custom') {
    length = cfg.fragmentLength || preset.length;
    interval = cfg.fragmentInterval || preset.interval;
    packets = cfg.fragmentPackets || preset.packets;
  }
  if (!length || !interval) return '';
  return `${length},${interval},${packets || 'tlshello'}`;
}

// انتخاب پورت نود از لیست پنل (ports) — هر نود یک پورت، به‌صورت چرخشی
function chooseNodePort(cfg = {}, item = {}, index = 0) {
  const disableNonTls = cfg.dkby === 'yes' || cfg.ech === 'yes';
  const explicit = Number(item?.port) || 0;
  if (explicit) {
    return { port: explicit, tls: !CF_HTTP_PORTS.includes(explicit) };
  }
  let ports = parseNodePorts(cfg.ports);
  if (disableNonTls) ports = ports.filter(p => !CF_HTTP_PORTS.includes(p));
  if (!ports.length) ports = [443];
  const port = ports[Math.abs(index) % ports.length];
  return { port, tls: !CF_HTTP_PORTS.includes(port) };
}

// چیدمان متناوب آی‌پی‌ها و دامنه‌های پیش‌فرض CFnew: هر ۲ آی‌پی، یک دامنه،
// تا دامنه‌های cfnew حتی با سقف کم نود هم حتماً داخل سابلینک باشند.
function interleaveAddresses(ipNodes = [], domainNodes = []) {
  const out = [];
  const ips = [...ipNodes];
  const domains = [...domainNodes];
  let ipTurn = 0;
  while (ips.length || domains.length) {
    for (let i = 0; i < 2 && ips.length; i++) out.push(ips.shift());
    ipTurn++;
    if (domains.length) out.push(domains.shift());
  }
  return out;
}

// توزیع مساوی پروتکل‌ها در سابلینک (vless / trojan / ss / xhttp به‌صورت چرخشی)
function interleaveProtocols(groups = {}) {
  const order = ['vless', 'trojan', 'ss', 'xhttp'];
  const queues = order.map(key => (Array.isArray(groups[key]) ? [...groups[key]] : []));
  const total = queues.reduce((sum, q) => sum + q.length, 0);
  const out = [];
  let guard = 0;
  while (out.length < total && guard++ < total * 4) {
    let moved = false;
    for (const q of queues) {
      if (q.length) {
        out.push(q.shift());
        moved = true;
      }
    }
    if (!moved) break;
  }
  return out;
}

function isIpv6Literal(host) {
  return String(host || '').includes(':');
}

function isIpv4Literal(host) {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(String(host || ''));
}

// اعمال واقعی سوییچ‌های IPv4/IPv6 روی تمام منابع آی‌پی (ثابت، ترجیحی، کشوری و ...)
function filterAddressFamily(list, cfg = {}) {
  const allowV4 = cfg.ipv4 !== 'no';
  const allowV6 = cfg.ipv6 !== 'no';
  return (Array.isArray(list) ? list : []).filter(item => {
    if (!item) return false;
    const host = normalizeNodeHost(item.ip || item.domain);
    if (!host) return false;
    if (isIpv6Literal(host)) return allowV6;
    if (isIpv4Literal(host)) return allowV4;
    return true;
  });
}

function getStaticCfAddresses(cfg = {}) {
  const v4 = cfg.ipv4 === 'no' ? [] : OFFICIAL_DIRECT_IPS.slice();
  const v6 = cfg.ipv6 === 'no' ? [] : OFFICIAL_DIRECT_IPV6.slice();
  return [...v4, ...v6];
}

// ساخت نودهای چندلوکیشن: آدرس = آی‌پی ثابت CF، و پروکسی کشور از طریق ?s= در مسیر ws
const LOCATION_PROXY_SCHEMES = ['socks5://', 'socks://', 'http://', 'https://'];

function buildLocationSourceList(proxyPool = [], cfg = {}, fallbackHost = '') {
  const usable = (Array.isArray(proxyPool) ? proxyPool : []).filter(item => {
    const p = String(item?.proxy || '').trim();
    return LOCATION_PROXY_SCHEMES.some(s => p.toLowerCase().startsWith(s));
  });
  if (usable.length === 0) return [];

  // گروه‌بندی بر اساس کشور تا در حالت MULTI هر نود از یک کشور متفاوت بیاید
  const byCountry = new Map();
  for (const item of usable) {
    const code = String(item.country || '').trim().toUpperCase();
    if (!byCountry.has(code)) byCountry.set(code, []);
    byCountry.get(code).push(item);
  }
  const countryCodes = [...byCountry.keys()];

  // نودهای زنجیره‌ای همیشه روی آی‌پی ثابت واقعی کلادفلر سوار می‌شوند تا پینگ بگیرند
  const staticIps = getStaticCfAddresses(cfg);
  const addressPool = staticIps.length > 0 ? staticIps : (fallbackHost ? [fallbackHost] : []);
  if (addressPool.length === 0) return [];

  const wanted = Math.max(1, Math.min(parseInt(cfg.locationNodeCount, 10) || 8, usable.length));
  // چرخش پنج‌دقیقه‌ای پروکسی‌ها تا نودها همیشه از استخر تازه انتخاب شوند
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));

  // با گام‌بندی روی استخر، هم IPv4 و هم IPv6 (اگر فعال باشد) در ساب‌لینک حضور پیدا می‌کنند
  const stride = Math.max(1, Math.floor(addressPool.length / wanted));
  const out = [];
  for (let i = 0; i < wanted; i++) {
    const code = countryCodes[(bucket + i) % countryCodes.length];
    const group = byCountry.get(code) || usable;
    const picked = group[(bucket + i) % group.length];
    out.push({
      ip: addressPool[(i * stride) % addressPool.length],
      isp: `Loc-${picked.country || 'CF'}`,
      country: picked.country || '',
      proxy: picked.proxy
    });
  }

  // تضمین حضور حداقل یک نود IPv6 وقتی کاربر IPv6 را فعال کرده است
  const v6Only = OFFICIAL_DIRECT_IPV6;
  if (cfg.ipv6 !== 'no' && v6Only.length > 0 && !out.some(n => isIpv6Literal(n.ip))) {
    out[out.length - 1].ip = v6Only[0];
  }
  return out;
}

function getXhttpPaddingMeta(uuidStr) {
  const s = String(uuidStr || '');
  return {
    header: s.slice(1, 7) || 'x-mili',
    key: '_' + (s.slice(25, 31) || 'pad001')
  };
}

function parseCustomPreferredString(yxStr = '') {
  const ipList = [];
  const domainList = [];
  const proxyList = [];
  if (!yxStr || !String(yxStr).trim()) {
    return { ipList, domainList, proxyList };
  }
  const items = String(yxStr)
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
  for (const item of items) {
    // خطوط پروکسی (socks5://...) آدرس نود نیستند و نباید در لیست آی‌پی ترجیحی بیایند
    if (item.includes('://')) continue;
    let nodeName = '';
    let addrPart = item;
    if (item.includes('#')) {
      const parts = item.split('#');
      addrPart = parts[0].trim();
      nodeName = parts.slice(1).join('#').trim();
    }
    const { address, port } = parseAddressAndPort(addrPart);
    if (!address) continue;
    if (!nodeName) {
      nodeName = `${address}${port ? ':' + port : ''}`;
    }
    // پورت غیر کلادفلر یعنی این خط یک پروکسی خروجی است (مثل socks5 روی 1080/11080) و آدرس نود نیست
    if (port && !CF_HTTPS_PORTS.includes(port) && !CF_HTTP_PORTS.includes(port)) {
      proxyList.push({ proxy: `socks5://${address}:${port}`, name: nodeName });
      continue;
    }
    if (isValidIpAddress(address)) {
      ipList.push({ ip: address, port: port || 443, isp: nodeName, name: nodeName });
    } else if (isValidDomain(address) || address.includes('.')) {
      domainList.push({ domain: address, port: port || 443, name: nodeName });
    }
  }
  return { ipList, domainList, proxyList };
}

async function fetchUouinPreferredIps(cfg = {}) {
  const lineMap = {
    ctcc: '电信',
    cucc: '联通',
    cmcc: '移动',
    bgp: '多线',
    ipv6: 'IPv6'
  };
  const v4Enabled = cfg.ipv4 !== 'no';
  const v6Enabled = cfg.ipv6 !== 'no';
  const mobileEnabled = cfg.ispMobile !== 'no';
  const unicomEnabled = cfg.ispUnicom !== 'no';
  const telecomEnabled = cfg.ispTelecom !== 'no';

  try {
    const ts = String(Date.now());
    const innerHash = await md5Hex('DdlTxtN0sUOu');
    const keyHash = await md5Hex(innerHash + '70cloudflareapikey' + ts);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3200);
    const resp = await fetch(`https://api.uouin.com/index.php/index/Cloudflare?key=${keyHash}&time=${ts}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!resp.ok) return [];
    const data = await resp.json();
    const groups = data && data.data;
    if (!groups) return [];
    const results = [];
    for (const groupKey of Object.keys(lineMap)) {
      const isV6 = groupKey === 'ipv6';
      if (isV6 && !v6Enabled) continue;
      if (!isV6 && !v4Enabled) continue;
      const lineName = lineMap[groupKey];
      if (lineName === '移动' && !mobileEnabled) continue;
      if (lineName === '联通' && !unicomEnabled) continue;
      if (lineName === '电信' && !telecomEnabled) continue;
      const groupObj = groups[groupKey];
      const infoList = groupObj && Array.isArray(groupObj.info) ? groupObj.info : [];
      for (const entry of infoList) {
        const ip = normalizeNodeHost(entry && entry.ip);
        if (!ip) continue;
        results.push({ isp: lineName, ip, port: 443, colo: entry?.colo || '' });
      }
    }
    return results;
  } catch (_e) {
    return [];
  }
}

async function fetchPreferredFromUrls(urlListStr = '', defaultPort = '443', timeout = 3000) {
  if (!urlListStr || !String(urlListStr).trim()) return [];
  const urls = String(urlListStr)
    .split(',')
    .map(u => u.trim())
    .filter(Boolean);
  if (!urls.length) return [];

  // نگاشت «host:port» → آدرس کامل پروکسی (با scheme و رمز) برای استفاده در زنجیره خروجی
  const outMap = new Map();
  await Promise.allSettled(
    urls.map(async url => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!resp.ok) return;
        const text = await resp.text();
        if (!text || !text.trim()) return;
        const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
        const isCsv = lines.length > 1 && lines[0].includes(',');
        const v6Pattern = /^[^\[\]]*:[^\[\]]*:[^\[\]]/;
        if (!isCsv) {
          for (const line of lines) {
            // پشتیبانی از خطوط scheme://user:pass@host:port (socks5/http) و host:port
            let clean = line;
            let proxyUrl = '';
            const schemeMatch = clean.match(/^([a-z0-9+.-]+):\/\//i);
            if (schemeMatch) {
              const scheme = schemeMatch[1].toLowerCase();
              if (['vless', 'vmess', 'trojan', 'ss', 'ssr'].includes(scheme)) continue;
              if (['socks5', 'socks', 'http', 'https'].includes(scheme)) proxyUrl = clean.trim();
              clean = clean.slice(schemeMatch[0].length);
            }
            if (clean.includes('@')) clean = clean.split('@').pop();
            clean = clean.split('/')[0];
            const hashIdx = clean.indexOf('#');
            const [hostPart, remark] = hashIdx > -1 ? [clean.substring(0, hashIdx), clean.substring(hashIdx)] : [clean, ''];
            let hasPort = false;
            if (hostPart.startsWith('[')) {
              hasPort = /\]:(\d+)$/.test(hostPart);
            } else {
              const colonIdx = hostPart.lastIndexOf(':');
              hasPort = colonIdx > -1 && /^\d+$/.test(hostPart.substring(colonIdx + 1));
            }
            const port = new URL(url).searchParams.get('port') || defaultPort;
            const key = hasPort ? clean : `${hostPart}:${port}${remark}`;
            if (!outMap.has(key) || proxyUrl) outMap.set(key, proxyUrl || key);
          }
        } else {
          const headers = lines[0].split(',').map(h => h.trim());
          const dataRows = lines.slice(1);
          if (headers.includes('IP地址') && headers.includes('端口')) {
            const ipIdx = headers.indexOf('IP地址');
            const portIdx = headers.indexOf('端口');
            const tlsIdx = headers.indexOf('TLS');
            for (const row of dataRows) {
              const cols = row.split(',').map(c => c.trim());
              if (tlsIdx !== -1 && cols[tlsIdx]?.toLowerCase() !== 'true') continue;
              const wrapped = v6Pattern.test(cols[ipIdx]) ? `[${cols[ipIdx]}]` : cols[ipIdx];
              const key = `${wrapped}:${cols[portIdx]}#CF`;
              if (!outMap.has(key)) outMap.set(key, '');
            }
          }
        }
      } catch (_e) {}
    })
  );

  const parsed = [];
  const regex = /^(\[[\da-fA-F:]+\]|[\d.]+|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?::(\d+))?(?:#(.+))?$/;
  for (const [item, proxyUrl] of outMap) {
    const m = item.match(regex);
    if (m) {
      parsed.push({
        ip: normalizeNodeHost(m[1]),
        port: parseInt(m[2] || '443', 10),
        name: m[3]?.trim() || m[1],
        proxy: proxyUrl && proxyUrl !== item ? proxyUrl : ''
      });
    }
  }
  return parsed;
}

function buildVlessLinks(list, userUuid, workerHost, cfg, namer, wkOverride = '') {
  const disableNonTls = cfg.dkby === 'yes' || cfg.ech === 'yes';
  const defaultHttps = [443];
  const defaultHttp = disableNonTls ? [] : [80];
  const links = [];
  const alpn = normalizeAlpn(cfg.alpn);
  const echValue = buildEchParamValue(cfg);
  const fragmentValue = cfg.fragmentValue || '';

  for (let idx = 0; idx < list.length; idx++) {
    const item = list[idx];
    const rawHost = normalizeNodeHost(item.ip || item.domain);
    if (!rawHost) continue;
    const safeAddr = rawHost.includes(':') ? `[${rawHost}]` : rawHost;
    const { port, tls } = chooseNodePort(cfg, item, idx);

    // مسیر یکتا برای نوع نود + کشور؛ پروکسی خروجی هم داخل همان مسیر به ورکر داده می‌شود
    const itemPath = buildNodePath('vless', cfg, wkOverride, item);

    {
      const nodeName = namer(item);
      if (tls) {
        const params = new URLSearchParams({
          encryption: 'none',
          security: 'tls',
          sni: workerHost,
          fp: cfg.fp || 'chrome',
          type: 'ws',
          host: workerHost,
          path: itemPath
        });
        if (alpn) params.set('alpn', alpn);
        if (echValue) params.set('ech', echValue);
        if (fragmentValue) params.set('fragment', fragmentValue);
        links.push(`vless://${userUuid}@${safeAddr}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
      } else {
        const params = new URLSearchParams({
          encryption: 'none',
          security: 'none',
          type: 'ws',
          host: workerHost,
          path: itemPath
        });
        links.push(`vless://${userUuid}@${safeAddr}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
      }
    }
  }
  return links;
}


function rotateIpListByTimeBucket(list, rotationSetting = 'off') {
  if (!rotationSetting || rotationSetting === 'off' || !Array.isArray(list) || list.length <= 1) {
    return list;
  }
  let intervalMs = 0;
  if (rotationSetting === '5m') intervalMs = 5 * 60 * 1000;
  else if (rotationSetting === '15m') intervalMs = 15 * 60 * 1000;
  else if (rotationSetting === '30m') intervalMs = 30 * 60 * 1000;
  else if (rotationSetting === '1h') intervalMs = 60 * 60 * 1000;
  else if (rotationSetting === '6h') intervalMs = 6 * 3600 * 1000;
  else if (rotationSetting === '24h') intervalMs = 24 * 3600 * 1000;
  if (!intervalMs) return list;

  const bucket = Math.floor(Date.now() / intervalMs);
  const shift = bucket % list.length;
  if (shift === 0) return list;
  return [...list.slice(shift), ...list.slice(0, shift)];
}

function buildShadowsocksLinks(list, userUuid, workerHost, cfg, namer) {
  const links = [];
  const sspass = (cfg.sspass && String(cfg.sspass).trim()) || userUuid;
  // این ورکر هدر Shadowsocks را به‌صورت متنی می‌خواند (parseShadowsocksHeader)، بنابراین cipher باید none باشد
  const cipher = 'none';
  const userinfo = encodeSip002UserInfo(`${cipher}:${sspass}`);

  for (let idx = 0; idx < list.length; idx++) {
    const item = list[idx];
    const rawHost = normalizeNodeHost(item.ip || item.domain);
    if (!rawHost) continue;
    const safeAddr = rawHost.includes(':') ? `[${rawHost}]` : rawHost;
    const { port } = chooseNodePort(cfg, item, idx);
    const nodeName = namer(item);
    const itemPath = buildNodePath('ss', cfg, '', item);
    const pluginOpts = `v2ray-plugin;mode=websocket;host=${workerHost};path=${itemPath};tls`;

    // دو قالب استاندارد شادوساکس برای سازگاری با کلاینت‌های مختلف:
    // ۱) SIP002 (userinfo جدا)  ۲) قالب قدیمی base64 کامل (method:pass@host:port)
    if (idx % 2 === 0) {
      links.push(
        `ss://${userinfo}@${safeAddr}:${port}/?plugin=${encodeURIComponent(pluginOpts)}#${encodeURIComponent(nodeName)}`
      );
    } else {
      const legacy = encodeBase64Utf8(`${cipher}:${sspass}@${safeAddr}:${port}`);
      links.push(
        `ss://${legacy}?plugin=${encodeURIComponent(pluginOpts)}#${encodeURIComponent(nodeName)}`
      );
    }
  }
  return links;
}

// آدرس پروکسی داخل مسیر ws قرار می‌گیرد؛ باید فقط یک‌بار دیکد شود تا ورکر آن را درست بخواند
function encodeProxyForPath(proxy) {
  return encodeURIComponent(String(proxy || ''))
    .replace(/%3A/gi, ':')
    .replace(/%2F/gi, '/')
    .replace(/%40/gi, '@');
}

function encodeSip002UserInfo(text) {
  return btoa(String(text || ''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function buildTrojanLinks(list, userUuid, workerHost, cfg, namer, wkOverride = '') {
  const disableNonTls = cfg.dkby === 'yes' || cfg.ech === 'yes';
  const defaultHttps = [443];
  const defaultHttp = disableNonTls ? [] : [80];
  const links = [];
  const password = (cfg.tp && String(cfg.tp).trim()) || userUuid;
  const alpn = normalizeAlpn(cfg.alpn);
  const echValue = buildEchParamValue(cfg);
  const fragmentValue = cfg.fragmentValue || '';

  for (let idx = 0; idx < list.length; idx++) {
    const item = list[idx];
    const rawHost = normalizeNodeHost(item.ip || item.domain);
    if (!rawHost) continue;
    const safeAddr = rawHost.includes(':') ? `[${rawHost}]` : rawHost;
    const { port, tls } = chooseNodePort(cfg, item, idx);

    {
      const nodeName = namer(item);
      const itemPath = buildNodePath('trojan', cfg, wkOverride, item);
      if (tls) {
        const params = new URLSearchParams({
          security: 'tls',
          sni: workerHost,
          fp: cfg.fp || 'chrome',
          type: 'ws',
          host: workerHost,
          path: itemPath
        });
        if (alpn) params.set('alpn', alpn);
        if (echValue) params.set('ech', echValue);
        if (fragmentValue) params.set('fragment', fragmentValue);
        links.push(`trojan://${encodeURIComponent(password)}@${safeAddr}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
      } else {
        const params = new URLSearchParams({
          security: 'none',
          type: 'ws',
          host: workerHost,
          path: itemPath
        });
        links.push(`trojan://${encodeURIComponent(password)}@${safeAddr}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
      }
    }
  }
  return links;
}

function buildXhttpLinks(list, userUuid, workerHost, cfg, namer) {
  const links = [];
  const shortPath = String(userUuid || '').substring(0, 8);
  const alpn = normalizeAlpn(cfg.alpn);
  const echValue = buildEchParamValue(cfg);
  const fragmentValue = cfg.fragmentValue || '';
  const { header: xPadHeader, key: xPadKey } = getXhttpPaddingMeta(userUuid);

  for (let idx = 0; idx < list.length; idx++) {
    const item = list[idx];
    const rawHost = normalizeNodeHost(item.ip || item.domain);
    if (!rawHost) continue;
    const safeAddr = rawHost.includes(':') ? `[${rawHost}]` : rawHost;
    const { port } = chooseNodePort(cfg, item, idx);
    const nodeName = namer(item);
    // مسیر یکتای xHTTP + کشور + پروکسی خروجی
    let xhttpPath = `/${shortPath}?nt=xhttp`;
    const xhttpCountry = String(item.country || '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(xhttpCountry)) xhttpPath += `&cc=${xhttpCountry}`;
    if (item.proxy) xhttpPath += `&s=${encodeProxyForPath(item.proxy)}`;
    const params = new URLSearchParams({
      encryption: 'none',
      security: 'tls',
      sni: workerHost,
      fp: cfg.fp || 'chrome',
      type: 'xhttp',
      host: workerHost,
      path: xhttpPath,
      mode: 'stream-one'
    });
    params.set(
      'extra',
      JSON.stringify({
        xPaddingObfsMode: true,
        xPaddingMethod: 'tokenish',
        xPaddingPlacement: 'queryInHeader',
        xPaddingHeader: xPadHeader,
        xPaddingKey: xPadKey
      })
    );
    if (alpn) params.set('alpn', alpn);
    if (echValue) params.set('ech', echValue);
    if (fragmentValue) params.set('fragment', fragmentValue);
    links.push(`vless://${userUuid}@${safeAddr}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
  }
  return links;
}

// تولید لیست کامل لینک‌های نود برای کاربر با نام‌گذاری دقیق number+miliconfig و رعایت سقف تعداد نود در ساب
async function generateUserNodesList(userOrConfig, workerHost, queryOverrides = {}) {
  const rawCfg = userOrConfig?.config ? userOrConfig.config : (userOrConfig || {});
  const cfg = normalizeEffectiveConfig(rawCfg);
  const userUuid = String(userOrConfig?.uuid || queryOverrides.uuid || '351c9981-04b6-4103-aa4b-864aa9c91469').toLowerCase();
  const nodeScope = queryOverrides.scope || userOrConfig?.nodeScope || 'all';
  const wkOverride = (queryOverrides.wk || cfg.wk || '').trim().toUpperCase();
  const protoFilter = (queryOverrides.proto || '').trim().toLowerCase();

  const evEnabled = protoFilter ? protoFilter === 'vless' : isEnabledValue(cfg.ev, true);
  const etEnabled = protoFilter ? protoFilter === 'trojan' : isEnabledValue(cfg.et, false);
  const exEnabled = protoFilter ? protoFilter === 'xhttp' : isEnabledValue(cfg.ex, false);
  const esEnabled = protoFilter ? (protoFilter === 'ss' || protoFilter === 'shadowsocks') : isEnabledValue(cfg.es, false);

  const namer = createMiliNodeNamer(BRAND_NAME);
  // هر پروتکل در گروه جداگانه ساخته می‌شود تا در پایان با چیدمان چرخشی
  // همه پروتکل‌ها به نسبت مساوی در سابلینک حاضر باشند (نه فقط VLESS).
  const protoGroups = { vless: [], trojan: [], ss: [], xhttp: [] };
  const rawLinks = [];

  // فرگمنت TLS بر اساس پریست انتخابی مدیر (off = بدون فرگمنت)
  // شادوساکس هیچ‌وقت پارامتر fragment نمی‌گیرد و همیشه در سابلینک می‌ماند.
  cfg.fragmentValue = buildFragmentValue(cfg);

  function appendFromSource(sourceList) {
    const safeList = filterAddressFamily(sourceList, cfg);
    if (!Array.isArray(safeList) || safeList.length === 0) return;
    if (evEnabled) protoGroups.vless.push(...buildVlessLinks(safeList, userUuid, workerHost, cfg, namer, wkOverride));
    if (etEnabled) protoGroups.trojan.push(...buildTrojanLinks(safeList, userUuid, workerHost, cfg, namer, wkOverride));
    if (exEnabled) protoGroups.xhttp.push(...buildXhttpLinks(safeList, userUuid, workerHost, cfg, namer));
    if (esEnabled) protoGroups.ss.push(...buildShadowsocksLinks(safeList, userUuid, workerHost, cfg, namer));
  }

  // چندلوکیشن: پروکسی‌های کشوری به‌عنوان زنجیره خروجی سمت ورکر استفاده می‌شوند، نه به‌عنوان آدرس نود.
  // آدرس نود یک آی‌پی ثابت واقعی کلادفلر است تا پینگ بگیرد و ترافیک از کشور انتخابی خارج شود.
  let countryMode = false;
  const countryFilter = (queryOverrides.country || '').trim().toUpperCase();
  if (countryFilter) {
    const wantedCountries = countryFilter === 'MULTI' || countryFilter === 'ALL'
      ? ['DE', 'NL', 'US', 'GB', 'TR', 'AE', 'CA', 'SE']
      : (COUNTRY_PROXY_SOURCES[countryFilter] ? [countryFilter] : []);
    const proxyPool = [];
    for (const code of wantedCountries) {
      const urls = (COUNTRY_PROXY_SOURCES[code]?.urls || []).join(',');
      if (!urls) continue;
      const found = await fetchPreferredFromUrls(urls);
      for (const item of found) {
        if (item.proxy) proxyPool.push({ proxy: item.proxy, country: code });
      }
    }
    const locationNodes = buildLocationSourceList(proxyPool, cfg, workerHost);
    if (locationNodes.length > 0) {
      appendFromSource(locationNodes);
      countryMode = true;
    }
  }

  // Endpoints from the persistent v4 catalog are authoritative extra nodes:
  // every enabled endpoint contributes nodes for its own protocol only, using
  // its real host, port and display name. Nothing is invented for an endpoint
  // that has not been added by the administrator.
  const catalogEndpoints = (Array.isArray(queryOverrides.catalogEndpoints) ? queryOverrides.catalogEndpoints : [])
    .slice()
    // Administrator-added endpoints outrank the built-in seed addresses, then
    // measured health, so a small per-user node cap never hides a real node
    // behind the defaults.
    .sort((a, b) => {
      const manual = Number(b?.source === 'manual') - Number(a?.source === 'manual');
      if (manual) return manual;
      const health = Number(b?.healthScore || 0) - Number(a?.healthScore || 0);
      if (health) return health;
      return String(a?.name || '').localeCompare(String(b?.name || ''));
    });
  for (const endpoint of catalogEndpoints) {
    if (!endpoint || endpoint.enabled === false) continue;
    const host = normalizeNodeHost(endpoint.host);
    if (!host) continue;
    const source = [{
      ip: host,
      port: Number(endpoint.port) || 443,
      isp: String(endpoint.name || host),
      country: String(endpoint.country || '')
    }];
    const protocol = String(endpoint.protocol || 'vless').toLowerCase();
    if (protocol === 'vless' && evEnabled) protoGroups.vless.push(...buildVlessLinks(source, userUuid, workerHost, cfg, namer, wkOverride));
    if (protocol === 'trojan' && etEnabled) protoGroups.trojan.push(...buildTrojanLinks(source, userUuid, workerHost, cfg, namer, wkOverride));
    if (protocol === 'xhttp' && exEnabled) protoGroups.xhttp.push(...buildXhttpLinks(source, userUuid, workerHost, cfg, namer));
    if ((protocol === 'shadowsocks' || protocol === 'ss') && esEnabled) protoGroups.ss.push(...buildShadowsocksLinks(source, userUuid, workerHost, cfg, namer));
  }

  const disablePreferred = cfg.yxby === 'yes' || nodeScope === 'origin';
  const enableNative = cfg.ena === 'yes' || nodeScope === 'origin';

  if (enableNative && nodeScope !== 'edge') {
    appendFromSource([{ ip: workerHost, isp: 'Origin' }]);
  }

  const { ipList: customIps, domainList: customDomains, proxyList: customProxies } = parseCustomPreferredString(cfg.yx);
  const hasCustomPreferred = customIps.length > 0 || customDomains.length > 0;

  // ورودی‌های پروکسی (پورت غیر CF) به نودهای زنجیره‌ای تبدیل می‌شوند تا پینگ بدهند
  if (!countryMode && customProxies.length > 0) {
    appendFromSource(buildLocationSourceList(customProxies, cfg, workerHost));
  }

  if (!disablePreferred && !countryMode) {
    if (hasCustomPreferred) {
      if (customIps.length > 0 && cfg.epi === 'yes') {
        appendFromSource(customIps);
      }
      if (customDomains.length > 0 && cfg.epd === 'yes') {
        appendFromSource(customDomains.map(d => ({ ip: d.domain, port: d.port, isp: d.name || d.domain })));
      }
    } else {
      // دامنه‌های پیش‌فرض CFnew همیشه حاضرند و با آی‌پی‌های ثابت به‌صورت متناوب
      // چیده می‌شوند تا با سقف کم نود هم حتماً در سایلینک باشند.
      const staticIpNodes = cfg.epi === 'yes'
        ? getStaticCfAddresses(cfg).map(ip => ({ ip, isp: 'CF-Static' }))
        : [];
      const domainNodes = cfg.epd === 'yes'
        ? DIRECT_DOMAINS.map(d => ({ ip: d.domain, isp: d.name || d.domain }))
        : [];
      if (staticIpNodes.length || domainNodes.length) {
        appendFromSource(interleaveAddresses(staticIpNodes, domainNodes));
      }
      // ۲) استخر آی‌پی‌های بهینه ارائه‌شده بر اساس اپراتور
      if (cfg.epi === 'yes' && !cfg.yxURL) {
        const uouinList = await fetchUouinPreferredIps(cfg);
        if (uouinList.length > 0) {
          appendFromSource(uouinList);
        }
      }
      if (cfg.egi === 'yes' && cfg.yxURL) {
        const urlList = await fetchPreferredFromUrls(cfg.yxURL);
        // خطوط دارای scheme (socks5/http) پروکسی خروجی هستند، نه آدرس نود:
        // آنها را به نودهای «آی‌پی ثابت CF + زنجیره پروکسی در مسیر» تبدیل می‌کنیم تا پینگ بدهند.
        const ipOnly = urlList.filter(x => !x.proxy);
        const proxyOnly = urlList.filter(x => x.proxy).map(x => ({ proxy: x.proxy, country: '' }));
        if (ipOnly.length > 0) {
          appendFromSource(ipOnly);
        }
        if (proxyOnly.length > 0) {
          appendFromSource(buildLocationSourceList(proxyOnly, cfg, workerHost));
        }
      }
      // اگر به هر دلیلی هیچ نودی ساخته نشد، از استخر رسمی CF استفاده می‌کنیم
      const builtCount = protoGroups.vless.length + protoGroups.trojan.length + protoGroups.ss.length + protoGroups.xhttp.length;
      if (builtCount < 15 && cfg.epi === 'yes') {
        appendFromSource(getStaticCfAddresses(cfg).map(ip => ({ ip, isp: 'CF-Direct' })));
      }
    }
  }

  if (protoGroups.vless.length === 0 && protoGroups.trojan.length === 0 && protoGroups.ss.length === 0 && protoGroups.xhttp.length === 0) {
    appendFromSource([{ ip: workerHost, port: 443, isp: 'Origin' }]);
  }

  // چیدمان چرخشی پروتکل‌ها: vless → trojan → ss → xhttp → تکرار
  const balancedLinks = interleaveProtocols(protoGroups);
  if (balancedLinks.length) rawLinks.push(...balancedLinks);

  const subNodeCount = queryOverrides.limit !== undefined
    ? parseInt(queryOverrides.limit, 10)
    : Number(userOrConfig?.subNodeCount ?? cfg.subNodeCount ?? 50);

  // اعمال چرخش خودکار آی‌پی در صورت تنظیم بازه زمانی توسط مدیر
  const rotatedLinks = rotateIpListByTimeBucket(rawLinks, cfg.ipRotation || 'off');

  // اعمال دقیق نام‌گذاری number+miliconfig و سقف تعداد نودهای ساب‌لینک کاربر
  const finalized = finalizeMiliSubscriptionLinks(rotatedLinks, subNodeCount, BRAND_NAME);

  // Only real, connectable nodes are returned. The legacy informational nodes
  // were placeholder links (zero UUID, 127.0.0.1) and would have handed users
  // configurations that can never connect.
  return finalized;
}

// تشخیص خودکار کلاینت از User-Agent در صورت عدم ارسال پارامتر target
function detectTargetFromRequest(request, url) {
  const explicit = url.searchParams.get('target');
  if (explicit && explicit.trim()) return explicit.trim().toLowerCase();
  const ua = (request.headers.get('User-Agent') || '').toLowerCase();
  if (ua.includes('clash') || ua.includes('mihomo') || ua.includes('flclash') || ua.includes('stash') || ua.includes('verge')) {
    return 'clash';
  }
  if (ua.includes('sing-box') || ua.includes('singbox') || ua.includes('hiddify') || ua.includes('sfa') || ua.includes('sfm') || ua.includes('karing')) {
    return 'singbox';
  }
  if (ua.includes('surge')) return 'surge';
  if (ua.includes('quantumult')) return 'quanx';
  if (ua.includes('loon')) return 'loon';
  return 'base64';
}

async function handleSubscriptionResponse(request, userOrConfig, url = null, catalogEndpoints = []) {
  if (!url) url = new URL(request.url);
  const workerHost = url.hostname;
  const rawCfg = userOrConfig?.config ? userOrConfig.config : (userOrConfig || {});
  const cfg = normalizeEffectiveConfig(rawCfg);

  // بررسی وضعیت فعال بودن، حجم و انقضای کاربر
  if (userOrConfig && userOrConfig.enabled === false) {
    const disabledNode = `vless://00000000-0000-0000-0000-000000000000@127.0.0.1:443?encryption=none&security=tls&type=ws#${encodeURIComponent('1+' + BRAND_NAME)}`;
    return new Response(btoa(disabledNode), {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  const target = detectTargetFromRequest(request, url);
  const isJkTarget = ['vg', 'jk', 'jiakuan'].includes(target);
  if (isJkTarget && cfg.jk !== 'yes') {
    return new Response('زنجیره اینترنت خانگی فعال نیست. در پنل مدیریت miliconfig گزینه «فعال‌سازی زنجیره اینترنت خانگی (jk)» را روشن کنید.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  const queryOverrides = {
    wk: url.searchParams.get('wk') || '',
    proto: url.searchParams.get('proto') || '',
    country: url.searchParams.get('country') || '',
    scope: url.searchParams.get('scope') || userOrConfig?.nodeScope || 'all',
    limit: url.searchParams.get('limit') !== null ? url.searchParams.get('limit') : undefined,
    catalogEndpoints: Array.isArray(catalogEndpoints) ? catalogEndpoints : []
  };

  const finalLinks = await generateUserNodesList(userOrConfig, workerHost, queryOverrides);

  let bodyContent = '';
  let contentType = 'text/plain; charset=utf-8';

  switch (target) {
    case 'clash':
    case 'clashr':
    case 'stash':
    case 'meta':
    case 'clashmeta':
      bodyContent = generateClashConfig(finalLinks, cfg);
      contentType = 'text/yaml; charset=utf-8';
      break;
    case 'vg':
    case 'jk':
    case 'jiakuan':
      try {
        bodyContent = await generateResidentialChainConfig(finalLinks, {
          ...cfg,
          subNodeCount: userOrConfig?.subNodeCount ?? cfg.subNodeCount ?? 50
        });
        contentType = 'text/yaml; charset=utf-8';
      } catch (err) {
        return new Response('گره‌های اینترنت خانگی موقتاً در دسترس نیستند: ' + (err?.message || err), {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
        });
      }
      break;
    case 'singbox':
    case 'sing-box':
      bodyContent = generateSingboxConfig(finalLinks, cfg);
      contentType = 'application/json; charset=utf-8';
      break;
    case 'surge':
    case 'surge2':
    case 'surge3':
    case 'surge4':
      bodyContent = generateSurgeConfig(finalLinks, cfg);
      contentType = 'text/plain; charset=utf-8';
      break;
    case 'quantumult':
    case 'quanx':
      bodyContent = generateQuanxConfig(finalLinks, cfg);
      contentType = 'text/plain; charset=utf-8';
      break;
    case 'loon':
      bodyContent = generateLoonConfig(finalLinks, cfg);
      contentType = 'text/plain; charset=utf-8';
      break;
    case 'raw':
    case 'plain':
      bodyContent = finalLinks.join('\n');
      contentType = 'text/plain; charset=utf-8';
      break;
    default:
      bodyContent = btoa(finalLinks.join('\n'));
      contentType = 'text/plain; charset=utf-8';
      break;
  }

  const totalBytes = userOrConfig?.dataLimitGb > 0 ? Math.floor(userOrConfig.dataLimitGb * 1073741824) : 0;
  const usedBytes = Number(userOrConfig?.usedBytes || 0);
  const expireSec = userOrConfig?.expireAt > 0 ? Math.floor(userOrConfig.expireAt / 1000) : 0;
  const profileTitle = userOrConfig?.username ? `${BRAND_NAME} - ${userOrConfig.username}` : BRAND_NAME;

  const headers = {
    'Content-Type': contentType,
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Access-Control-Allow-Origin': '*',
    'Profile-Title': `base64:${encodeBase64Utf8(profileTitle)}`,
    'Profile-Update-Interval': '12',
    'Subscription-Userinfo': `upload=0; download=${usedBytes}; total=${totalBytes}; expire=${expireSec}`
  };

  if (cfg.ech === 'yes') {
    headers['X-ECH-Status'] = 'ENABLED';
  }

  return new Response(bodyContent, { headers });
}


// --- MODULE: src/core/runtime.js ---
// ============================================================================
// miliconfig v3.1 - موتور هسته پروکسی (VLESS + Trojan + xhttp + SOCKS5/HTTP + GrainTCP)
// منطبق ۱۰۰٪ با کد اصلی CFnew v3.1 + احراز هویت چندکاربره D1 و ثبت ترافیک
// ============================================================================


const ADDR_TYPE_IPV4 = 1;
const ADDR_TYPE_DOMAIN = 2;
const ADDR_TYPE_IPV6 = 3;

const PROXY_KIND_SOCKS5 = 'p5';
const PROXY_KIND_HTTP = 'pt';
const PROXY_KIND_HTTPS = 'pts';

const CHUNK_SIZE = 64 * 1024;
const DOWNLOAD_PACKET_SIZE = 32 * 1024;
const DOWNLOAD_TAIL = 512;
const DOWNLOAD_DELAY = 0;
const UPLOAD_PACKET_SIZE = 16 * 1024;
const UPLOAD_QUEUE_LIMIT = 256 * 1024;
const CONNECT_RACE_COUNT = 2;
const FIRST_BYTE_TIMEOUT = 3500;

const HEX_TABLE = Array.from({ length: 256 }, (_v, i) => (i + 256).toString(16).slice(1));

function bytesToUuid(bytes, offset = 0) {
  const s = (
    HEX_TABLE[bytes[offset]] +
    HEX_TABLE[bytes[offset + 1]] +
    HEX_TABLE[bytes[offset + 2]] +
    HEX_TABLE[bytes[offset + 3]] +
    '-' +
    HEX_TABLE[bytes[offset + 4]] +
    HEX_TABLE[bytes[offset + 5]] +
    '-' +
    HEX_TABLE[bytes[offset + 6]] +
    HEX_TABLE[bytes[offset + 7]] +
    '-' +
    HEX_TABLE[bytes[offset + 8]] +
    HEX_TABLE[bytes[offset + 9]] +
    '-' +
    HEX_TABLE[bytes[offset + 10]] +
    HEX_TABLE[bytes[offset + 11]] +
    HEX_TABLE[bytes[offset + 12]] +
    HEX_TABLE[bytes[offset + 13]] +
    HEX_TABLE[bytes[offset + 14]] +
    HEX_TABLE[bytes[offset + 15]]
  ).toLowerCase();
  return isValidUuid(s) ? s : '';
}

function toUint8Array(chunk) {
  if (chunk instanceof Uint8Array) return chunk;
  if (chunk instanceof ArrayBuffer) return new Uint8Array(chunk);
  if (ArrayBuffer.isView(chunk)) return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  return new Uint8Array(chunk || 0);
}

function concatUint8Arrays(head, body) {
  const a = toUint8Array(head);
  const b = toUint8Array(body);
  const out = new Uint8Array(a.byteLength + b.byteLength);
  out.set(a);
  out.set(b, a.byteLength);
  return out;
}

function closeSocketSafe(ws) {
  try {
    if (ws && (ws.readyState === 1 || ws.readyState === 2)) ws.close();
  } catch (_e) {}
}

function parseBase64EarlyData(b64Str) {
  if (!b64Str) return { earlyData: null, error: null };
  try {
    const clean = b64Str.replace(/-/g, '+').replace(/_/g, '/');
    return {
      earlyData: Uint8Array.from(atob(clean), c => c.charCodeAt(0)).buffer,
      error: null
    };
  } catch (error) {
    return { earlyData: null, error };
  }
}

function parseOutboundProxyConfig(rawAddr) {
  let rem = String(rawAddr || '').trim();
  if (!rem) return null;
  let kind = PROXY_KIND_SOCKS5;
  const lower = rem.toLowerCase();
  if (lower.startsWith('https://')) {
    kind = PROXY_KIND_HTTPS;
    rem = rem.slice(8);
  } else if (lower.startsWith('http://')) {
    kind = PROXY_KIND_HTTP;
    rem = rem.slice(7);
  } else if (lower.startsWith('socks5://')) {
    rem = rem.slice(9);
  } else if (lower.startsWith('socks://')) {
    rem = rem.slice(8);
  }
  const slashIdx = rem.indexOf('/');
  if (slashIdx >= 0) rem = rem.slice(0, slashIdx);
  if (!rem) throw new Error('Invalid proxy address');
  const [hostPart, authPart] = rem.split('@').reverse();
  let username, password, hostname, socksPort;
  if (authPart) {
    const parts = authPart.split(':');
    if (parts.length !== 2) throw new Error('Invalid proxy auth format');
    [username, password] = parts;
  }
  const hostSegments = hostPart.split(':');
  const lastSeg = hostSegments.pop();
  socksPort = Number(lastSeg);
  if (Number.isNaN(socksPort)) {
    if (kind === PROXY_KIND_SOCKS5) throw new Error('Invalid proxy port');
    hostSegments.push(lastSeg);
    socksPort = kind === PROXY_KIND_HTTPS ? 443 : 80;
  }
  hostname = hostSegments.join(':');
  if (!hostname) throw new Error('Empty proxy hostname');
  return { username, password, hostname, socksPort, kind };
}

function createChunkQueue(packetSize, maxBytes = packetSize, maxItems = Math.max(1, maxBytes >> 8)) {
  let queue = [];
  let head = 0;
  let queuedBytes = 0;
  let mergeBuf = null;

  function compact() {
    if (head > 32 && head * 2 >= queue.length) {
      queue = queue.slice(head);
      head = 0;
    }
  }

  function shiftOne() {
    if (head >= queue.length) return null;
    const item = queue[head];
    queue[head++] = undefined;
    queuedBytes -= item.byteLength;
    compact();
    return item;
  }

  return {
    get empty() {
      return head >= queue.length;
    },
    clear() {
      queue = [];
      head = 0;
      queuedBytes = 0;
    },
    sow(data) {
      const len = data?.byteLength || 0;
      if (!len) return true;
      if (queuedBytes + len > maxBytes || queue.length - head >= maxItems) return false;
      queue.push(data);
      queuedBytes += len;
      return true;
    },
    bundle(first = null) {
      first ||= shiftOne();
      if (!first || head >= queue.length || first.byteLength >= packetSize) return [first, false];
      let total = first.byteLength;
      let end = head;
      while (end < queue.length) {
        const next = queue[end];
        const nextTotal = total + next.byteLength;
        if (nextTotal > packetSize) break;
        total = nextTotal;
        end++;
      }
      if (end === head) return [first, false];
      const out = (mergeBuf ||= new Uint8Array(packetSize));
      out.set(first);
      let offset = first.byteLength;
      while (head < end) {
        const item = queue[head];
        queue[head++] = undefined;
        queuedBytes -= item.byteLength;
        out.set(item, offset);
        offset += item.byteLength;
      }
      compact();
      return [out.subarray(0, total), true];
    }
  };
}

function createDownloadCoalescer(ws, onBytesSent = null) {
  const maxPacket = DOWNLOAD_PACKET_SIZE;
  const tail = DOWNLOAD_TAIL;
  const minThreshold = Math.max(4096, tail << 3);
  let buf = new Uint8Array(maxPacket);
  let offset = 0;
  let timer = 0;
  let microScheduled = false;
  let pushSeq = 0;
  let snapSeq = 0;
  let deferCount = 0;

  function flush() {
    if (timer) clearTimeout(timer);
    timer = 0;
    microScheduled = false;
    if (!offset) return;
    if (ws.readyState === 1) {
      ws.send(buf.subarray(0, offset).slice());
      if (onBytesSent) onBytesSent(offset);
    }
    buf = new Uint8Array(maxPacket);
    offset = 0;
    deferCount = 0;
  }

  function schedule() {
    if (timer || microScheduled) return;
    microScheduled = true;
    snapSeq = pushSeq;
    queueMicrotask(() => {
      microScheduled = false;
      if (!offset || timer) return;
      if (maxPacket - offset < tail) return flush();
      timer = setTimeout(() => {
        timer = 0;
        if (!offset) return;
        if (maxPacket - offset < tail) return flush();
        if (deferCount < 2 && (pushSeq !== snapSeq || offset < minThreshold)) {
          deferCount++;
          snapSeq = pushSeq;
          return schedule();
        }
        flush();
      }, Math.max(DOWNLOAD_DELAY, 1));
    });
  }

  return {
    send(chunk) {
      const data = toUint8Array(chunk);
      let pos = 0;
      const len = data.byteLength;
      if (!len) return;
      while (pos < len) {
        if (!offset && len - pos >= maxPacket) {
          const sz = Math.min(maxPacket, len - pos);
          if (ws.readyState === 1) {
            ws.send(pos || sz !== len ? data.subarray(pos, pos + sz) : data);
            if (onBytesSent) onBytesSent(sz);
          }
          pos += sz;
          continue;
        }
        const sz = Math.min(maxPacket - offset, len - pos);
        buf.set(data.subarray(pos, pos + sz), offset);
        offset += sz;
        pos += sz;
        pushSeq++;
        if (offset === maxPacket || maxPacket - offset < tail) flush();
        else schedule();
      }
    },
    flush
  };
}

function openRawSocket(address, port, fetcher = null, options = undefined) {
  const target = { hostname: address, port };
  if (fetcher && typeof fetcher.connect === 'function') {
    return options === undefined ? fetcher.connect(target) : fetcher.connect(target, options);
  }
  return options === undefined ? cfConnect(target) : cfConnect(target, options);
}

async function openVerifiedSocket(address, port, fetcher = null) {
  try {
    const sock = openRawSocket(address, port, fetcher);
    if (sock?.opened) await sock.opened;
    return sock;
  } catch (err) {
    if (!fetcher) throw err;
    const sock = cfConnect({ hostname: address, port });
    if (sock?.opened) await sock.opened;
    return sock;
  }
}

async function connectRacedSocket(address, port, fetcher = null, raceCount = 1) {
  const count = Math.max(1, raceCount | 0);
  if (count <= 1) return openVerifiedSocket(address, port, fetcher);
  const tasks = Array.from({ length: count }, () => openVerifiedSocket(address, port, fetcher));
  const winner = await Promise.any(tasks);
  tasks.forEach(p => {
    p.then(sock => {
      if (sock !== winner) {
        try {
          sock.close();
        } catch (_e) {}
      }
    }, () => {});
  });
  return winner;
}

function wrapResidualSocket(sock, residualData) {
  let upstreamReader = null;
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(residualData);
      upstreamReader = sock.readable.getReader();
    },
    async pull(controller) {
      const { value, done } = await upstreamReader.read();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(value);
    },
    cancel(reason) {
      try {
        upstreamReader?.cancel(reason);
      } catch (_e) {}
    }
  });
  return {
    readable,
    writable: sock.writable,
    closed: sock.closed,
    opened: sock.opened,
    close: () => sock.close()
  };
}

async function connectHttpTunnel(targetHost, targetPort, proxyCfg, fetcher = null, firstPacket = null) {
  const { username, password, hostname, socksPort, kind } = proxyCfg;
  const opts = kind === PROXY_KIND_HTTPS ? { secureTransport: 'on', allowHalfOpen: false } : undefined;
  const sock = openRawSocket(hostname, socksPort, fetcher, opts);
  if (sock?.opened) await sock.opened;
  const formattedHost = targetHost.includes(':') && !/^\[.*\]$/.test(targetHost) ? `[${targetHost}]` : targetHost;
  const authority = `${formattedHost}:${targetPort}`;
  let reqHeaders =
    `CONNECT ${authority} HTTP/1.1\r\n` +
    `Host: ${authority}\r\n` +
    `User-Agent: Mozilla/5.0\r\n` +
    `Proxy-Connection: Keep-Alive\r\n`;
  if (username) {
    reqHeaders += `Proxy-Authorization: Basic ${btoa(`${username}:${password || ''}`)}\r\n`;
  }
  reqHeaders += '\r\n';

  const writer = sock.writable.getWriter();
  const reader = sock.readable.getReader();
  try {
    await writer.write(new TextEncoder().encode(reqHeaders));
    let buf = new Uint8Array(0);
    let headerEnd = -1;
    while (headerEnd < 0) {
      const { value, done } = await reader.read();
      if (done || !value) throw new Error('Failed to open HTTP proxy tunnel');
      buf = concatUint8Arrays(buf, value);
      for (let i = 0; i + 3 < buf.length; i++) {
        if (buf[i] === 13 && buf[i + 1] === 10 && buf[i + 2] === 13 && buf[i + 3] === 10) {
          headerEnd = i + 4;
          break;
        }
      }
      if (headerEnd < 0 && buf.length > 8192) throw new Error('Invalid proxy response');
    }
    const statusLine = sharedDecoder.decode(buf.subarray(0, Math.min(headerEnd, 128)));
    if (!statusLine.startsWith('HTTP/')) throw new Error('Invalid proxy response');
    const code = Number(statusLine.split(' ')[1]);
    if (!(code >= 200 && code < 300)) throw new Error('Proxy tunnel rejected');
    const residual = buf.subarray(headerEnd);
    if (firstPacket && firstPacket.byteLength) await writer.write(firstPacket);
    writer.releaseLock();
    reader.releaseLock();
    if (residual.byteLength) return wrapResidualSocket(sock, residual);
    return sock;
  } catch (err) {
    try { writer.releaseLock(); } catch (_e) {}
    try { reader.releaseLock(); } catch (_e) {}
    try { sock.close(); } catch (_e) {}
    throw err;
  }
}

async function connectViaOutboundProxy(_addrType, targetHost, targetPort, proxyCfg, fetcher = null, firstPacket = null) {
  if (proxyCfg && (proxyCfg.kind === PROXY_KIND_HTTP || proxyCfg.kind === PROXY_KIND_HTTPS)) {
    return connectHttpTunnel(targetHost, targetPort, proxyCfg, fetcher, firstPacket);
  }
  const { username, password, hostname, socksPort } = proxyCfg;
  const sock = openRawSocket(hostname, socksPort, fetcher);
  const writer = sock.writable.getWriter();
  await writer.write(new Uint8Array(username ? [5, 2, 0, 2] : [5, 1, 0]));
  const reader = sock.readable.getReader();
  let residual = new Uint8Array(0);

  async function readExact(needed) {
    while (residual.length < needed) {
      const { value, done } = await reader.read();
      if (done || !value) throw new Error('Failed to open SOCKS5 connection');
      residual = concatUint8Arrays(residual, value);
    }
    return residual;
  }
  function consume(n) {
    const res = residual.subarray(0, n);
    residual = residual.subarray(n);
    return res;
  }

  let head = await readExact(2);
  if (head[0] !== 5 || head[1] === 255) throw new Error('No acceptable SOCKS5 auth method');
  const method = head[1];
  consume(2);
  if (method === 2) {
    if (!username || !password) throw new Error('SOCKS5 server requires auth');
    const enc = new TextEncoder();
    const uBytes = enc.encode(username);
    const pBytes = enc.encode(password);
    await writer.write(new Uint8Array([1, uBytes.length, ...uBytes, pBytes.length, ...pBytes]));
    head = await readExact(2);
    if (head[0] !== 1 || head[1] !== 0) throw new Error('SOCKS5 auth failed');
    consume(2);
  }
  const cleanHost = /^\[.*\]$/.test(String(targetHost)) ? String(targetHost).slice(1, -1) : String(targetHost);
  const hostBytes = new TextEncoder().encode(cleanHost);
  await writer.write(new Uint8Array([5, 1, 0, 3, hostBytes.length, ...hostBytes, targetPort >> 8, targetPort & 255]));
  head = await readExact(4);
  if (head[1] !== 0) throw new Error('SOCKS5 connect failed');
  const bindType = head[3];
  let replyLen = 10;
  if (bindType === 1) replyLen = 10;
  else if (bindType === 4) replyLen = 22;
  else if (bindType === 3) replyLen = 7 + (await readExact(5))[4];
  else throw new Error('Invalid SOCKS5 reply');
  await readExact(replyLen);
  consume(replyLen);
  if (firstPacket && firstPacket.byteLength) await writer.write(firstPacket);
  writer.releaseLock();
  reader.releaseLock();
  if (residual.length) return wrapResidualSocket(sock, residual);
  return sock;
}

// پارس هدر VLESS با پشتیبانی از چندکاربره (دریافت کالبک resolveUserByUuid)
function parseVlessHeader(chunk, resolveUserFn) {
  const bytes = toUint8Array(chunk);
  if (bytes.byteLength < 24) return { hasError: true, message: 'invalid data' };
  const version = bytes.subarray(0, 1);
  const incomingUuid = bytesToUuid(bytes, 1);
  const matchedUser = incomingUuid ? resolveUserFn(incomingUuid) : null;
  if (!matchedUser) {
    return { hasError: true, message: 'invalid user' };
  }
  const optLen = bytes[17];
  const cmdIndex = 18 + optLen;
  if (bytes.byteLength < cmdIndex + 5) return { hasError: true, message: 'invalid data' };
  const cmd = bytes[cmdIndex];
  let isUDP = false;
  if (cmd === 1) {
    isUDP = false;
  } else if (cmd === 2) {
    isUDP = true;
  } else {
    return { hasError: true, message: 'command is not supported' };
  }
  const portIndex = 19 + optLen;
  const port = (bytes[portIndex] << 8) | bytes[portIndex + 1];
  let addrIndex = portIndex + 2;
  let addrLen = 0;
  let addrValIndex = addrIndex + 1;
  let hostname = '';
  const addressType = bytes[addrIndex];
  switch (addressType) {
    case ADDR_TYPE_IPV4:
      addrLen = 4;
      if (bytes.byteLength < addrValIndex + addrLen) return { hasError: true, message: 'invalid data' };
      hostname = `${bytes[addrValIndex]}.${bytes[addrValIndex + 1]}.${bytes[addrValIndex + 2]}.${bytes[addrValIndex + 3]}`;
      break;
    case ADDR_TYPE_DOMAIN:
      if (bytes.byteLength < addrValIndex + 1) return { hasError: true, message: 'invalid data' };
      addrLen = bytes[addrValIndex++];
      if (bytes.byteLength < addrValIndex + addrLen) return { hasError: true, message: 'invalid data' };
      hostname = sharedDecoder.decode(bytes.subarray(addrValIndex, addrValIndex + addrLen));
      break;
    case ADDR_TYPE_IPV6: {
      addrLen = 16;
      if (bytes.byteLength < addrValIndex + addrLen) return { hasError: true, message: 'invalid data' };
      const parts = [];
      const dv = new DataView(bytes.buffer, bytes.byteOffset + addrValIndex, addrLen);
      for (let i = 0; i < 8; i++) parts.push(dv.getUint16(i * 2).toString(16));
      hostname = parts.join(':');
      break;
    }
    default:
      return { hasError: true, message: `invalid addressType: ${addressType}` };
  }
  if (!hostname) return { hasError: true, message: 'addressValue is empty' };
  return {
    hasError: false,
    addressType,
    port,
    hostname,
    isUDP,
    rawIndex: addrValIndex + addrLen,
    version,
    matchedUser
  };
}

// پارس هدر Trojan با پشتیبانی از چندکاربره

// پارس هدر استاندارد Shadowsocks (SOCKS5 address request)
function parseShadowsocksHeader(buffer) {
  const bytes = toUint8Array(buffer);
  if (bytes.byteLength < 7) {
    return { hasError: true, message: 'invalid shadowsocks data - too short' };
  }
  const atyp = bytes[0];
  let addrLen = 0;
  let addrIdx = 1;
  let hostname = '';
  switch (atyp) {
    case 1: // IPv4
      addrLen = 4;
      if (bytes.byteLength < 1 + 4 + 2) return { hasError: true, message: 'invalid SS IPv4 length' };
      hostname = bytes.subarray(addrIdx, addrIdx + addrLen).join('.');
      break;
    case 3: // Domain
      addrLen = bytes[addrIdx];
      addrIdx += 1;
      if (bytes.byteLength < addrIdx + addrLen + 2) return { hasError: true, message: 'invalid SS domain length' };
      hostname = sharedDecoder.decode(bytes.subarray(addrIdx, addrIdx + addrLen));
      break;
    case 4: { // IPv6
      addrLen = 16;
      if (bytes.byteLength < 1 + 16 + 2) return { hasError: true, message: 'invalid SS IPv6 length' };
      const dv = new DataView(bytes.buffer, bytes.byteOffset + addrIdx, addrLen);
      const parts = [];
      for (let i = 0; i < 8; i++) parts.push(dv.getUint16(i * 2).toString(16));
      hostname = parts.join(':');
      break;
    }
    default:
      return { hasError: true, message: `invalid SS addressType ${atyp}` };
  }
  if (!hostname) return { hasError: true, message: 'SS address is empty' };
  const portIdx = addrIdx + addrLen;
  const port = new DataView(bytes.buffer, bytes.byteOffset + portIdx, 2).getUint16(0);
  if (port < 1 || port > 65535) {
    return { hasError: true, message: `invalid SS port ${port}` };
  }
  return {
    hasError: false,
    addressType: atyp,
    port,
    hostname,
    rawPayload: bytes.subarray(portIdx + 2)
  };
}

async function parseTrojanHeader(buffer, resolveTrojanUserFn) {
  const bytes = toUint8Array(buffer);
  if (bytes.byteLength < 58) {
    return { hasError: true, message: 'invalid trojan data - too short' };
  }
  if (bytes[56] !== 0x0d || bytes[57] !== 0x0a) {
    return { hasError: true, message: 'invalid trojan header format' };
  }
  const incomingHash = sharedDecoder.decode(bytes.subarray(0, 56));
  const matchedUser = await resolveTrojanUserFn(incomingHash);
  if (!matchedUser) {
    return { hasError: true, message: 'invalid trojan password' };
  }
  const socksBuf = bytes.subarray(58);
  if (socksBuf.byteLength < 6) {
    return { hasError: true, message: 'invalid SOCKS5 request data' };
  }
  const view = new DataView(socksBuf.buffer, socksBuf.byteOffset, socksBuf.byteLength);
  const cmd = view.getUint8(0);
  if (cmd !== 1) {
    return { hasError: true, message: 'unsupported command, only TCP is allowed' };
  }
  const atyp = view.getUint8(1);
  let addrLen = 0;
  let addrIdx = 2;
  let hostname = '';
  switch (atyp) {
    case 1:
      addrLen = 4;
      hostname = socksBuf.subarray(addrIdx, addrIdx + addrLen).join('.');
      break;
    case 3:
      addrLen = socksBuf[addrIdx];
      addrIdx += 1;
      hostname = sharedDecoder.decode(socksBuf.subarray(addrIdx, addrIdx + addrLen));
      break;
    case 4: {
      addrLen = 16;
      const dv = new DataView(socksBuf.buffer, socksBuf.byteOffset + addrIdx, addrLen);
      const parts = [];
      for (let i = 0; i < 8; i++) parts.push(dv.getUint16(i * 2).toString(16));
      hostname = parts.join(':');
      break;
    }
    default:
      return { hasError: true, message: `invalid addressType ${atyp}` };
  }
  if (!hostname) return { hasError: true, message: 'address is empty' };
  const portIdx = addrIdx + addrLen;
  const port = new DataView(socksBuf.buffer, socksBuf.byteOffset + portIdx, 2).getUint16(0);
  return {
    hasError: false,
    addressType: atyp,
    port,
    hostname,
    rawClientData: socksBuf.subarray(portIdx + 4),
    matchedUser
  };
}

function makeWebSocketReadableStream(ws, earlyDataHeader) {
  let cancelled = false;
  return new ReadableStream({
    start(controller) {
      ws.addEventListener('message', event => {
        if (!cancelled) controller.enqueue(toUint8Array(event.data));
      });
      ws.addEventListener('close', () => {
        if (!cancelled) {
          closeSocketSafe(ws);
          try { controller.close(); } catch (_e) {}
        }
      });
      ws.addEventListener('error', err => {
        try { controller.error(err); } catch (_e) {}
      });
      const { earlyData, error } = parseBase64EarlyData(earlyDataHeader);
      if (error) controller.error(error);
      else if (earlyData) controller.enqueue(toUint8Array(earlyData));
    },
    cancel() {
      cancelled = true;
      closeSocketSafe(ws);
    }
  });
}

async function pipeRemoteToWebSocket(remoteSocket, ws, vlessHeader, retryCallback, onBytesTransferred = null) {
  let header = vlessHeader;
  let hasData = false;
  let retried = false;
  let firstByteTimer = null;

  if (retryCallback) {
    firstByteTimer = setTimeout(() => {
      if (!hasData && !retried) {
        retried = true;
        try { remoteSocket.close && remoteSocket.close(); } catch (_e) {}
        retryCallback();
      }
    }, FIRST_BYTE_TIMEOUT);
  }

  const coalescer = createDownloadCoalescer(ws, onBytesTransferred);
  let reader = null;
  let useByob = true;
  let buffer = new ArrayBuffer(CHUNK_SIZE);

  try {
    try {
      reader = remoteSocket.readable.getReader({ mode: 'byob' });
    } catch (_e) {
      useByob = false;
      reader = remoteSocket.readable.getReader();
    }
    for (;;) {
      const res = useByob ? await reader.read(new Uint8Array(buffer, 0, CHUNK_SIZE)) : await reader.read();
      if (res.done) break;
      const val = res.value;
      let chunk = toUint8Array(val);
      const nextBuf =
        useByob && val?.buffer instanceof ArrayBuffer && val.buffer.byteLength >= CHUNK_SIZE
          ? val.buffer
          : new ArrayBuffer(CHUNK_SIZE);
      if (!chunk.byteLength) continue;
      if (!hasData) {
        hasData = true;
        if (firstByteTimer) {
          clearTimeout(firstByteTimer);
          firstByteTimer = null;
        }
      }
      if (ws.readyState !== 1) throw new Error('WebSocket is not open');
      if (header) {
        chunk = concatUint8Arrays(header, chunk);
        header = null;
      }
      if (chunk.byteLength >= CHUNK_SIZE >> 1) {
        coalescer.flush();
        ws.send(chunk);
        if (onBytesTransferred) onBytesTransferred(chunk.byteLength);
        if (useByob) buffer = new ArrayBuffer(CHUNK_SIZE);
      } else {
        coalescer.send(chunk.slice());
        if (useByob) buffer = nextBuf;
      }
    }
    coalescer.flush();
  } catch (_e) {
    if (!retried) closeSocketSafe(ws);
  } finally {
    try { coalescer.flush(); } catch (_e) {}
    try { reader?.releaseLock(); } catch (_e) {}
  }

  if (firstByteTimer) clearTimeout(firstByteTimer);
  if (!hasData && !retried && retryCallback) retryCallback();
}

async function handleUdpDns(udpChunk, ws, vlessHeader, fetcher = null) {
  try {
    const sock = await connectRacedSocket('8.8.4.4', 53, fetcher, 1);
    const writer = sock.writable.getWriter();
    await writer.write(udpChunk);
    writer.releaseLock();
    await pipeRemoteToWebSocket(sock, ws, vlessHeader, null);
  } catch (_e) {}
}

async function establishOutboundAndPipe(
  addressType,
  host,
  port,
  rawClientData,
  ws,
  vlessRespHeader,
  remoteState,
  effectiveCfg,
  fetcher = null,
  onBytesTransferred = null
) {
  const fallbackAddr = (effectiveCfg.p || '').trim();
  const workerRegion = (effectiveCfg.wk || 'CF').trim().toUpperCase();
  const enableRegionMatch = (effectiveCfg.rm || '').toLowerCase() !== 'no';
  const qjMode = (effectiveCfg.qj || '').toLowerCase();
  const downgradeEnabled = qjMode === 'no';
  const proxyOnly = qjMode === 'only';

  let parsedProxy = null;
  let proxyEnabled = false;
  if (effectiveCfg.s && String(effectiveCfg.s).trim()) {
    try {
      parsedProxy = parseOutboundProxyConfig(effectiveCfg.s);
      proxyEnabled = Boolean(parsedProxy);
    } catch (_e) {
      proxyEnabled = false;
    }
  }

  const firstPacket = toUint8Array(rawClientData);
  if (firstPacket.byteLength && onBytesTransferred) {
    onBytesTransferred(firstPacket.byteLength);
  }

  async function connectAndSend(targetHost, targetPort, useProxy = false) {
    const remoteSock = useProxy
      ? await connectViaOutboundProxy(addressType, targetHost, targetPort, parsedProxy, fetcher, firstPacket)
      : await connectRacedSocket(targetHost, targetPort, fetcher, CONNECT_RACE_COUNT);
    const writer = remoteSock.writable.getWriter();
    if (!useProxy && firstPacket.byteLength) await writer.write(firstPacket);
    return { remoteSock, writer };
  }

  function detachIfCurrent(sock, writer) {
    if (remoteState.socket !== sock) return;
    try { writer?.releaseLock(); } catch (_e) {}
    remoteState.socket = null;
    remoteState.writer = null;
  }

  function bindRemote(sock, writer, retryCb) {
    try {
      if (remoteState.writer && remoteState.writer !== writer) {
        remoteState.writer.releaseLock();
      }
    } catch (_e) {}
    remoteState.socket = sock;
    remoteState.writer = writer;
    remoteState.drainUpload?.();
    sock.closed.catch(() => {}).finally(() => {
      if (remoteState.socket === sock) closeSocketSafe(ws);
    });
    pipeRemoteToWebSocket(sock, ws, vlessRespHeader, retryCb, onBytesTransferred).finally(() => {
      if (remoteState.socket === sock) {
        try { writer.releaseLock(); } catch (_e) {}
        remoteState.writer = null;
      }
    });
  }

  async function retryConnect() {
    if (proxyOnly && proxyEnabled) {
      closeSocketSafe(ws);
      return;
    }
    if (downgradeEnabled && proxyEnabled) {
      try {
        const { remoteSock, writer } = await connectAndSend(host, port, true);
        bindRemote(remoteSock, writer, null);
        return;
      } catch (_proxyErr) {
        let fbHost, fbPort;
        if (fallbackAddr) {
          const parsed = parseAddressAndPort(fallbackAddr);
          fbHost = parsed.address;
          fbPort = parsed.port || port;
        } else {
          const fb = await selectFallbackProxyAddress(workerRegion, enableRegionMatch);
          fbHost = fb ? fb.domain : host;
          fbPort = fb ? fb.port : port;
        }
        try {
          const { remoteSock, writer } = await connectAndSend(fbHost, fbPort, false);
          bindRemote(remoteSock, writer, null);
        } catch (_fbErr) {
          closeSocketSafe(ws);
        }
      }
    } else {
      let fbHost, fbPort;
      if (fallbackAddr) {
        const parsed = parseAddressAndPort(fallbackAddr);
        fbHost = parsed.address;
        fbPort = parsed.port || port;
      } else {
        const fb = await selectFallbackProxyAddress(workerRegion, enableRegionMatch);
        fbHost = fb ? fb.domain : host;
        fbPort = fb ? fb.port : port;
      }
      try {
        const { remoteSock, writer } = await connectAndSend(fbHost, fbPort, proxyEnabled);
        bindRemote(remoteSock, writer, null);
      } catch (_fbErr) {
        closeSocketSafe(ws);
      }
    }
  }

  try {
    const firstHopProxy = proxyOnly && proxyEnabled ? true : downgradeEnabled ? false : proxyEnabled;
    const { remoteSock, writer } = await connectAndSend(host, port, firstHopProxy);
    bindRemote(remoteSock, writer, () => {
      detachIfCurrent(remoteSock, writer);
      retryConnect();
    });
  } catch (_err) {
    await retryConnect();
  }
}

async function handleWebSocketUpgrade(request, env, ctx, globalCfg, allUsers, adminUuid) {
  const reqUrl = new URL(request.url);
  const queryP = reqUrl.searchParams.get('p') || '';
  const queryWk = (reqUrl.searchParams.get('wk') || '').toUpperCase();
  const queryRm = reqUrl.searchParams.get('rm') || '';
  const queryS = reqUrl.searchParams.get('s') || '';

  // تابع تشخیص کاربر بر اساس UUID در VLESS
  function resolveVlessUser(incomingUuid) {
    const lower = String(incomingUuid || '').toLowerCase();
    for (const u of allUsers) {
      if (u.uuid.toLowerCase() === lower) {
        if (!u.enabled) return null;
        if (u.dataLimitGb > 0 && u.usedBytes >= u.dataLimitGb * 1073741824) return null;
        if (u.expireAt > 0 && Date.now() > u.expireAt) return null;
        return u;
      }
    }
    if (lower === adminUuid.toLowerCase()) {
      return { id: null, username: 'admin', uuid: adminUuid, config: globalCfg };
    }
    return null;
  }

  // تابع تشخیص کاربر بر اساس هش SHA-224 رمز عبور در Trojan
  async function resolveTrojanUser(incomingHash) {
    for (const u of allUsers) {
      const pass = (u.config?.tp && String(u.config.tp).trim()) || u.uuid;
      const hash = await sha224Hex(pass);
      if (hash === incomingHash) {
        if (!u.enabled) return null;
        if (u.dataLimitGb > 0 && u.usedBytes >= u.dataLimitGb * 1073741824) return null;
        if (u.expireAt > 0 && Date.now() > u.expireAt) return null;
        return u;
      }
    }
    const adminPass = (globalCfg.tp && String(globalCfg.tp).trim()) || adminUuid;
    const adminHash = await sha224Hex(adminPass);
    if (adminHash === incomingHash) {
      return { id: null, username: 'admin', uuid: adminUuid, config: globalCfg };
    }
    return null;
  }

  const pair = new WebSocketPair();
  const [clientWs, serverWs] = Object.values(pair);
  serverWs.accept();
  serverWs.binaryType = 'arraybuffer';

  let remoteState = { socket: null, writer: null, drainUpload: null };
  let isDnsSession = false;
  let detectedProto = null;
  let matchedUserObj = null;
  let sessionBytes = 0;
  let draining = false;
  let closed = false;
  const uploadQueue = createChunkQueue(UPLOAD_PACKET_SIZE, UPLOAD_QUEUE_LIMIT, UPLOAD_QUEUE_LIMIT >> 8);
  const fetcher = request.fetcher;

  function addTransferredBytes(n) {
    sessionBytes += Number(n) || 0;
  }

  function flushSessionTraffic() {
    if (matchedUserObj?.id && sessionBytes > 0) {
      const bytesToRecord = sessionBytes;
      sessionBytes = 0;
      const p = recordUserActivity(env, matchedUserObj.id, bytesToRecord, 1).catch(() => {});
      if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(p);
    }
  }

  function closeTransport() {
    if (closed) return;
    closed = true;
    uploadQueue.clear();
    try { remoteState.writer?.releaseLock(); } catch (_e) {}
    remoteState.writer = null;
    try { remoteState.socket?.close(); } catch (_e) {}
    closeSocketSafe(serverWs);
    flushSessionTraffic();
  }

  function enqueueUpload(chunk) {
    const data = toUint8Array(chunk);
    if (!data.byteLength) return true;
    addTransferredBytes(data.byteLength);
    if (!uploadQueue.sow(data)) {
      closeTransport();
      return false;
    }
    remoteState.drainUpload?.();
    return true;
  }

  async function drainUploadQueue() {
    if (draining || closed || !remoteState.writer) return;
    draining = true;
    try {
      for (;;) {
        if (closed || !remoteState.writer) break;
        const [bundled] = uploadQueue.bundle();
        if (!bundled) break;
        await remoteState.writer.write(bundled);
      }
    } catch (_e) {
      closeTransport();
    } finally {
      draining = false;
      if (!uploadQueue.empty && !closed && remoteState.writer) queueMicrotask(drainUploadQueue);
    }
  }

  remoteState.drainUpload = () => {
    if (!draining && !uploadQueue.empty && remoteState.writer) queueMicrotask(drainUploadQueue);
  };

  const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';
  const wsReadable = makeWebSocketReadableStream(serverWs, earlyDataHeader);

  wsReadable
    .pipeTo(
      new WritableStream({
        async write(chunk) {
          if (closed) return;
          const data = toUint8Array(chunk);
          if (isDnsSession) return await handleUdpDns(data, serverWs, null, fetcher);
          if (remoteState.socket && remoteState.writer) {
            if (!enqueueUpload(data)) throw new Error('upload queue overflow');
            return;
          }
          if (detectedProto) {
            if (!enqueueUpload(data)) throw new Error('upload queue overflow');
            return;
          }

          // تلاش برای VLESS
          if (data.byteLength >= 24) {
            const vlessRes = parseVlessHeader(data, resolveVlessUser);
            if (!vlessRes.hasError) {
              detectedProto = 'vless';
              matchedUserObj = vlessRes.matchedUser;
              const userCfg = {
                ...globalCfg,
                ...(matchedUserObj?.config || {}),
                ...(queryP ? { p: queryP } : {}),
                ...(queryWk ? { wk: queryWk } : {}),
                ...(queryRm ? { rm: queryRm } : {}),
                ...(queryS ? { s: queryS } : {})
              };
              if (vlessRes.isUDP) {
                if (vlessRes.port === 53) isDnsSession = true;
                else throw new Error('UDP proxy only enabled for DNS port 53');
              }
              const respHeader = new Uint8Array([vlessRes.version[0], 0]);
              const rawPayload = data.subarray(vlessRes.rawIndex);
              if (isDnsSession) return handleUdpDns(rawPayload, serverWs, respHeader, fetcher);
              await establishOutboundAndPipe(
                vlessRes.addressType,
                vlessRes.hostname,
                vlessRes.port,
                rawPayload,
                serverWs,
                respHeader,
                remoteState,
                userCfg,
                fetcher,
                addTransferredBytes
              );
              return;
            }
          }

          // تلاش برای Trojan
          if (data.byteLength >= 58) {
            const trojanRes = await parseTrojanHeader(data, resolveTrojanUser);
            if (!trojanRes.hasError) {
              detectedProto = 'trojan';
              matchedUserObj = trojanRes.matchedUser;
              const userCfg = {
                ...globalCfg,
                ...(matchedUserObj?.config || {}),
                ...(queryP ? { p: queryP } : {}),
                ...(queryWk ? { wk: queryWk } : {}),
                ...(queryRm ? { rm: queryRm } : {}),
                ...(queryS ? { s: queryS } : {})
              };
              await establishOutboundAndPipe(
                trojanRes.addressType,
                trojanRes.hostname,
                trojanRes.port,
                trojanRes.rawClientData,
                serverWs,
                null,
                remoteState,
                userCfg,
                fetcher,
                addTransferredBytes
              );
              return;
            }
          }

          // تلاش برای Shadowsocks (SS-WS)
          if (data.byteLength >= 7) {
            const ssRes = parseShadowsocksHeader(data);
            if (!ssRes.hasError) {
              const querySsPass = reqUrl.searchParams.get('sspass') || '';
              let ssUser = null;
              if (querySsPass) {
                ssUser = allUsers.find(u => (u.config?.sspass || u.uuid) === querySsPass);
              }
              if (!ssUser) {
                ssUser = allUsers.find(u => u.config?.es === 'yes') || (globalCfg.es === 'yes' ? { id: null, username: 'admin', uuid: adminUuid, config: globalCfg } : null);
              }
              if (!ssUser && allUsers.length > 0) {
                ssUser = allUsers[0];
              }
              if (ssUser) {
                detectedProto = 'ss';
                matchedUserObj = ssUser;
                const userCfg = {
                  ...globalCfg,
                  ...(matchedUserObj?.config || {}),
                  ...(queryP ? { p: queryP } : {}),
                  ...(queryWk ? { wk: queryWk } : {}),
                  ...(queryRm ? { rm: queryRm } : {}),
                  ...(queryS ? { s: queryS } : {})
                };
                await establishOutboundAndPipe(
                  ssRes.addressType,
                  ssRes.hostname,
                  ssRes.port,
                  ssRes.rawPayload,
                  serverWs,
                  null,
                  remoteState,
                  userCfg,
                  fetcher,
                  addTransferredBytes
                );
                return;
              }
            }
          }

          throw new Error('Invalid protocol or authentication failed');
        }
      })
    )
    .catch(() => {
      closeTransport();
    });

  return new Response(null, { status: 101, webSocket: clientWs });
}

// ============================================================================
// پروتکل xhttp (HTTP POST Streaming) با پشتیبانی از چندکاربره
// ============================================================================
const XHTTP_HUFFMAN_LEN = [
  13, 23, 28, 28, 28, 28, 28, 28, 28, 24, 30, 28, 28, 30, 28, 28,
  28, 28, 28, 28, 28, 28, 30, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  6, 10, 10, 12, 13, 6, 8, 11, 10, 10, 8, 11, 8, 6, 6, 6,
  5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 7, 8, 15, 6, 12, 10,
  13, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 8, 13, 19, 13, 14, 6,
  15, 5, 6, 5, 6, 5, 6, 6, 6, 5, 7, 7, 6, 6, 6, 5,
  6, 7, 6, 5, 5, 6, 7, 7, 7, 7, 7, 15, 11, 14, 13, 28,
  20, 22, 20, 20, 22, 22, 22, 23, 22, 23, 23, 23, 23, 23, 24, 23,
  24, 24, 22, 23, 24, 23, 23, 23, 23, 21, 22, 23, 22, 23, 23, 24,
  22, 21, 20, 22, 22, 23, 23, 21, 23, 22, 22, 24, 21, 22, 23, 23,
  21, 21, 22, 21, 23, 22, 23, 23, 20, 22, 22, 22, 23, 22, 22, 23,
  26, 26, 20, 19, 22, 23, 22, 25, 26, 26, 26, 27, 27, 26, 24, 25,
  19, 21, 26, 27, 27, 26, 27, 24, 21, 21, 26, 26, 28, 27, 27, 27,
  20, 24, 20, 21, 22, 21, 21, 23, 22, 22, 25, 25, 24, 24, 26, 23,
  26, 27, 26, 26, 27, 27, 27, 27, 27, 28, 27, 27, 27, 27, 27, 26,
  30
];

const XHTTP_PAD_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function generateXhttpPaddingString(len) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += XHTTP_PAD_CHARS[Math.floor(Math.random() * XHTTP_PAD_CHARS.length)];
  }
  return out;
}

function calcHuffmanByteLen(str) {
  const bytes = new TextEncoder().encode(str);
  let bits = 0;
  for (let i = 0; i < bytes.length; i++) bits += XHTTP_HUFFMAN_LEN[bytes[i]];
  return Math.ceil(bits / 8);
}

function validateXhttpPadding(request, padHeader, padKey) {
  let padVal = '';
  const hVal = request.headers.get(padHeader);
  if (hVal) {
    try {
      const parsed = new URL(hVal, 'https://x.invalid');
      padVal = parsed.searchParams.get(padKey) || hVal;
    } catch (_e) {
      padVal = hVal;
    }
  } else {
    try {
      padVal = new URL(request.url).searchParams.get(padKey) || '';
    } catch (_e) {
      padVal = '';
    }
  }
  if (!padVal) return true;
  const len = calcHuffmanByteLen(padVal);
  return len >= 98 && len <= 1002;
}

async function readXhttpHeader(readableStream, resolveUserFn) {
  const reader = readableStream.getReader({ mode: 'byob' });
  try {
    let res = await reader.readAtLeast(18, new Uint8Array(new ArrayBuffer(128 * 1024)));
    let totalRead = res.value.length;
    let buf = res.value;
    const version = buf[0];
    const incomingUuid = bytesToUuid(buf, 1);
    const matchedUser = incomingUuid ? resolveUserFn(incomingUuid) : null;
    if (!matchedUser) {
      try { reader.releaseLock(); } catch (_e) {}
      return null;
    }
    const optLen = buf[17];
    const addrOffset = 18 + optLen + 1 + 2 + 1;
    if (addrOffset + 1 > totalRead) {
      if (res.done) return null;
      const needed = addrOffset + 1 - totalRead;
      res = await reader.readAtLeast(needed, new Uint8Array(new ArrayBuffer(128 * 1024)));
      totalRead += res.value.length;
      buf = concatUint8Arrays(buf, res.value);
    }
    const cmd = buf[18 + optLen];
    if (cmd !== 1) return null;
    const port = (buf[addrOffset - 3] << 8) + buf[addrOffset - 2];
    const atyp = buf[addrOffset - 1];
    let headerLen = -1;
    if (atyp === ADDR_TYPE_IPV4) headerLen = addrOffset + 4;
    else if (atyp === ADDR_TYPE_IPV6) headerLen = addrOffset + 16;
    else if (atyp === ADDR_TYPE_DOMAIN) headerLen = addrOffset + 1 + buf[addrOffset];
    if (headerLen < 0) return null;
    const rem = headerLen - totalRead;
    if (rem > 0) {
      if (res.done) return null;
      res = await reader.readAtLeast(rem, new Uint8Array(new ArrayBuffer(128 * 1024)));
      totalRead += res.value.length;
      buf = concatUint8Arrays(buf, res.value);
    }
    let hostname = '';
    if (atyp === ADDR_TYPE_IPV4) {
      hostname = buf.slice(addrOffset, addrOffset + 4).join('.');
    } else if (atyp === ADDR_TYPE_DOMAIN) {
      hostname = sharedDecoder.decode(buf.slice(addrOffset + 1, addrOffset + 1 + buf[addrOffset]));
    } else if (atyp === ADDR_TYPE_IPV6) {
      hostname = buf
        .slice(addrOffset, addrOffset + 16)
        .reduce((acc, v, i, arr) => (i % 2 ? acc.concat(((arr[i - 1] << 8) + v).toString(16)) : acc), [])
        .join(':');
    }
    if (!hostname) return null;
    return {
      hostname,
      port,
      data: buf.slice(headerLen),
      resp: new Uint8Array([version, 0]),
      reader,
      done: res.done,
      matchedUser
    };
  } catch (_e) {
    try { reader.releaseLock(); } catch (_ig) {}
    return null;
  }
}

async function handleXhttpPostRequest(request, env, ctx, globalCfg, allUsers, adminUuid) {
  if (!request.body) return new Response('Bad Request', { status: 400 });

  function resolveUserFn(incomingUuid) {
    const lower = String(incomingUuid || '').toLowerCase();
    for (const u of allUsers) {
      if (u.uuid.toLowerCase() === lower && u.enabled) return u;
    }
    if (lower === adminUuid.toLowerCase()) {
      return { id: null, username: 'admin', uuid: adminUuid, config: globalCfg };
    }
    return null;
  }

  const parsedHeader = await readXhttpHeader(request.body, resolveUserFn);
  if (!parsedHeader) {
    return new Response('Bad Request', { status: 400 });
  }

  const matchedUser = parsedHeader.matchedUser;
  const userUuid = matchedUser.uuid || adminUuid;
  const { header: xPadHeader, key: xPadKey } = getXhttpPaddingMeta(userUuid);
  if (!validateXhttpPadding(request, xPadHeader, xPadKey)) {
    return new Response('Bad Request', { status: 400 });
  }

  let remoteSocket = null;
  try {
    remoteSocket = await connectRacedSocket(parsedHeader.hostname, parsedHeader.port, request.fetcher, CONNECT_RACE_COUNT);
  } catch (_e) {
    const fb = await selectFallbackProxyAddress(globalCfg.wk || 'CF', true);
    if (!fb) return new Response('Gateway Timeout', { status: 504 });
    try {
      remoteSocket = await connectRacedSocket(fb.domain, fb.port || parsedHeader.port, request.fetcher, 1);
    } catch (_e2) {
      return new Response('Bad Gateway', { status: 502 });
    }
  }

  let totalBytes = 0;
  const upPromise = (async () => {
    const writer = remoteSocket.writable.getWriter();
    try {
      if (parsedHeader.data && parsedHeader.data.length) {
        totalBytes += parsedHeader.data.length;
        await writer.write(parsedHeader.data);
      }
      while (!parsedHeader.done) {
        const r = await parsedHeader.reader.read(new Uint8Array(new ArrayBuffer(64 * 1024)));
        if (r.done) break;
        if (r.value && r.value.length) {
          totalBytes += r.value.length;
          await writer.write(r.value);
        }
      }
    } catch (_e) {} finally {
      try { await writer.close(); } catch (_e) {}
      try { parsedHeader.reader.releaseLock(); } catch (_e) {}
    }
  })();

  const { readable, writable } = new TransformStream();
  const downPromise = (async () => {
    const writer = writable.getWriter();
    const reader = remoteSocket.readable.getReader();
    try {
      await writer.write(parsedHeader.resp);
      for (;;) {
        const r = await reader.read();
        if (r.done) break;
        if (r.value && r.value.length) {
          totalBytes += r.value.length;
          await writer.write(r.value);
        }
      }
      await writer.close();
    } catch (_e) {} finally {
      try { reader.releaseLock(); } catch (_e) {}
      try { writer.releaseLock(); } catch (_e) {}
    }
  })();

  const closedPromise = Promise.allSettled([upPromise, downPromise]).finally(() => {
    try { remoteSocket.close(); } catch (_e) {}
    if (matchedUser?.id && totalBytes > 0) {
      recordUserActivity(env, matchedUser.id, totalBytes, 1).catch(() => {});
    }
  });

  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(closedPromise);
  }

  const respHeaders = {
    'X-Accel-Buffering': 'no',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
    'User-Agent': 'Go-http-client/2.0',
    'Content-Type': 'application/grpc'
  };
  try {
    const padUrl = new URL('https://x.invalid/');
    padUrl.searchParams.set(xPadKey, generateXhttpPaddingString(100 + Math.floor(Math.random() * 901)));
    respHeaders[xPadHeader] = padUrl.toString();
  } catch (_e) {}

  return new Response(readable, { headers: respHeaders });
}


// --- MODULE: src/api/handlers.js ---
// ============================================================================
// miliconfig v3.1 - هندلرهای REST API (مدیریت کاربران D1، تنظیمات، نودهای ترجیحی، وضعیت سیستم)
// ============================================================================


function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// حذف اطلاعات حساس (هش رمز مدیر) از پاسخ‌های API
function sanitizeConfigForClient(raw = {}) {
  const copy = { ...(raw || {}) };
  for (const key of Object.keys(copy)) {
    if (key === 'adminPasswordHash' || key === 'admin_password_hash') delete copy[key];
    // هر مقدار مربوط به اعتبارنامه ارائه‌دهنده هرگز به کلاینت برنمی‌گردد
    if (/^cf_/i.test(key) || /token|secret|password_hash/i.test(key)) delete copy[key];
  }
  return copy;
}

function sanitizeUserForClient(user) {
  if (!user || typeof user !== 'object') return user;
  return { ...user, config: sanitizeConfigForClient(user.config || {}) };
}

// تجزیه لیست پروکسی: پشتیبانی از socks5://user:pass@host:port و host:port
// آدرس کامل پروکسی (با پروتکل و رمز) برای تنظیم مقدار s حفظ می‌شود.
function parseProxyLines(text, defaultProtocol = '') {
  const out = [];
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    let protocol = 'TCP';
    let proxyUrl = '';
    let rest = line;
    const scheme = rest.match(/^([a-z0-9+.-]+):\/\//i);
    if (scheme) {
      protocol = scheme[1].toUpperCase();
      const schemeName = scheme[1].toLowerCase();
      const rawRest = rest.slice(scheme[0].length).split('#')[0].trim();
      if (['socks5', 'socks', 'http', 'https'].includes(schemeName)) {
        proxyUrl = `${schemeName}://${rawRest}`;
      }
      rest = rest.slice(scheme[0].length);
    }
    rest = rest.split('#')[0].trim();
    if (rest.includes('@')) rest = rest.split('@').pop();
    rest = rest.split('/')[0].trim();
    let host = '';
    let port = 0;
    if (rest.startsWith('[')) {
      const m = rest.match(/^\[([^\]]+)\]:(\d{1,5})/);
      if (m) { host = m[1]; port = parseInt(m[2], 10); }
    } else {
      const idx = rest.lastIndexOf(':');
      if (idx > 0) { host = rest.slice(0, idx).trim(); port = parseInt(rest.slice(idx + 1), 10); }
    }
    if (!host || !Number.isFinite(port) || port < 1 || port > 65535) continue;
    if (/^(vless|vmess|trojan|ss|ssr)$/i.test(protocol)) continue;
    let proto = protocol === 'HTTPS' ? 'HTTPS' : protocol === 'HTTP' ? 'HTTP' : protocol === 'SOCKS5' ? 'SOCKS5' : protocol === 'SOCKS4' ? 'SOCKS4' : 'TCP';
    // لیست‌های بدون scheme (مثل monosans) از مسیر منبع تشخیص داده می‌شوند
    if (proto === 'TCP' && defaultProtocol) {
      proto = defaultProtocol;
      proxyUrl = `${defaultProtocol.toLowerCase()}://${host}:${port}`;
    }
    const family = host.includes(':') ? 'ipv6' : (/^\d+\.\d+\.\d+\.\d+$/.test(host) ? 'ipv4' : 'domain');
    out.push({ host, port, protocol: proto, proxy: proxyUrl, family });
  }
  return out;
}

// --- اسکنر آی‌پی: تجزیه رنج‌های CIDR و انتخاب تصادفی آدرس سالم ---
function parseRangeLines(text) {
  const out = [];
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([0-9a-fA-F:.]+)\/(\d{1,3})$/);
    if (!m) continue;
    const base = m[1];
    const bits = parseInt(m[2], 10);
    if (!Number.isFinite(bits)) continue;
    if (base.includes(':')) {
      if (bits <= 128) out.push({ family: 'ipv6', base, bits });
    } else if (/^\d+\.\d+\.\d+\.\d+$/.test(base) && bits <= 32) {
      out.push({ family: 'ipv4', base, bits });
    }
  }
  return out;
}

function ipv4ToInt(ip) {
  const parts = String(ip).split('.').map(p => parseInt(p, 10) || 0);
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function intToIpv4(value) {
  return [24, 16, 8, 0].map(shift => (value >>> shift) & 255).join('.');
}

function randomIpv4FromRange(base, bits) {
  const hostBits = 32 - bits;
  const size = Math.pow(2, hostBits);
  const offset = size > 2 ? 1 + Math.floor(Math.random() * (size - 2)) : 0;
  return intToIpv4((ipv4ToInt(base) + offset) >>> 0);
}

function ipv6ToBigInt(text) {
  const s = String(text || '').trim();
  if (!s.includes(':')) return 0n;
  const [head, tail] = s.split('::');
  const headParts = head ? head.split(':').filter(Boolean) : [];
  const tailParts = tail !== undefined ? (tail ? tail.split(':').filter(Boolean) : []) : null;
  const groups = tailParts === null
    ? headParts
    : [...headParts, ...Array(Math.max(0, 8 - headParts.length - tailParts.length)).fill('0'), ...tailParts];
  if (groups.length !== 8) return 0n;
  let value = 0n;
  for (const group of groups) value = (value << 16n) + BigInt(parseInt(group, 16) || 0);
  return value;
}

function bigIntToIpv6(value) {
  const groups = [];
  for (let i = 7; i >= 0; i--) groups.push(Number((value >> BigInt(i * 16)) & 0xffffn));
  let bestStart = -1;
  let bestLen = 0;
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] !== 0) continue;
    let len = 0;
    while (i + len < groups.length && groups[i + len] === 0) len++;
    if (len > bestLen && len >= 2) { bestStart = i; bestLen = len; }
    i += len - 1;
  }
  const hex = groups.map(g => g.toString(16));
  if (bestStart < 0) return hex.join(':');
  const before = hex.slice(0, bestStart).join(':');
  const after = hex.slice(bestStart + bestLen).join(':');
  return `${before}::${after}`;
}

function randomIpv6FromRange(base, bits) {
  const hostBits = 128 - bits;
  const baseValue = ipv6ToBigInt(base);
  if (hostBits <= 0) return bigIntToIpv6(baseValue);
  const size = 1n << BigInt(hostBits);
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  const rand = BigInt('0x' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')) % size;
  return bigIntToIpv6(baseValue + rand);
}

// تجزیه فهرست آی‌پی/دامنه ثابت (هر خط یک آدرس، با یا بدون پورت)
function parseIpCandidateLines(text, family = 'any') {
  const out = [];
  const seen = new Set();
  for (const raw of String(text || '').split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    line = line.split('#')[0].trim();
    if (line.includes('/')) line = line.split('/')[0].trim();
    if (line.includes('://')) {
      try { line = new URL(line).hostname; } catch (_e) { continue; }
    }
    if (line.includes('@')) line = line.split('@').pop();
    const { address } = parseAddressAndPort(line);
    if (!address) continue;
    const isV6 = address.includes(':');
    if (family === 'ipv4' && isV6) continue;
    if (family === 'ipv6' && !isV6) continue;
    if (isV6) {
      if (!isValidIpAddress(address)) continue;
    } else if (!isValidIpAddress(address) && !isValidDomain(address)) {
      continue;
    }
    if (seen.has(address)) continue;
    seen.add(address);
    out.push({
      host: address,
      port: 443,
      family: isV6 ? 'ipv6' : (isValidIpAddress(address) ? 'ipv4' : 'domain'),
      kind: 'ip'
    });
  }
  return out;
}

function shuffleList(list) {
  return (Array.isArray(list) ? list.slice() : []).sort(() => 0.5 - Math.random());
}

// برش چرخشی از یک استخر تا سقف subrequest کلادفلر حفظ شود
function pickRotating(list, count, seed = Date.now()) {
  const items = Array.isArray(list) ? list : [];
  if (!items.length) return [];
  const start = Math.floor(seed / 60000) % items.length;
  const out = [];
  for (let i = 0; i < Math.min(count, items.length); i++) out.push(items[(start + i) % items.length]);
  return out;
}

async function fetchSourceText(url, timeoutMs = 3500) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const separator = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${separator}_mili=${Date.now()}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'miliconfig-scanner/3.1',
        'Cache-Control': 'no-cache'
      }
    });
    clearTimeout(timer);
    if (!res.ok) return '';
    return await res.text();
  } catch (_e) {
    return '';
  }
}

async function fetchProxySource(url, timeoutMs = 3500) {
  const lower = String(url || '').toLowerCase();
  const defaultProtocol = /socks/.test(lower) ? 'SOCKS5' : /http/.test(lower) ? 'HTTP' : '';
  return parseProxyLines(await fetchSourceText(url, timeoutMs), defaultProtocol);
}

// تست واقعی اتصال TCP و اندازه‌گیری پینگ
async function probeTcp(host, port, timeoutMs = 1800) {
  const started = Date.now();
  let socket;
  try {
    socket = connect({ hostname: host, port });
    const guard = new Promise((_resolve, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs));
    await Promise.race([socket.opened, guard]);
    const latencyMs = Date.now() - started;
    try { socket.close(); } catch (_e) {}
    return { ok: true, latencyMs };
  } catch (err) {
    try { if (socket) socket.close(); } catch (_e2) {}
    return { ok: false, latencyMs: 0, error: String((err && err.message) || err || 'connect_failed').slice(0, 40) };
  }
}

function parseYxArray(yxStr = '') {
  if (!yxStr || !String(yxStr).trim()) return [];
  const items = String(yxStr)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const res = [];
  for (const item of items) {
    let name = '';
    let addrPart = item;
    if (item.includes('#')) {
      const parts = item.split('#');
      addrPart = parts[0].trim();
      name = parts.slice(1).join('#').trim();
    }
    const { address, port } = parseAddressAndPort(addrPart);
    if (!address) continue;
    if (!name) name = `${address}:${port || 443}`;
    res.push({
      ip: address,
      port: port || 443,
      name,
      addedAt: new Date().toISOString()
    });
  }
  return res;
}

function serializeYxArray(arr = []) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.map(item => {
    const host = String(item.ip || '').includes(':') ? `[${item.ip}]` : item.ip;
    return `${host}:${item.port || 443}#${item.name || item.ip}`;
  }).join(',');
}

// ۱. مدیریت تنظیمات سراسری پنل (/api/config)
async function handleConfigApi(request, env) {
  if (request.method === 'OPTIONS') return jsonResponse({ ok: true });
  const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';

  if (request.method === 'GET') {
    const cfg = sanitizeConfigForClient(await loadGlobalConfig(env));
    const diag = await getStorageDiagnostics(env);
    return jsonResponse({
      ...cfg,
      kvEnabled: true,
      d1Enabled: diag.d1Enabled,
      d1BindingName: diag.d1BindingName,
      storageMode: diag.d1Enabled ? 'D1' : diag.kvEnabled ? 'KV' : 'Memory'
    });
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (body && body._reset === true) {
        const cfg = await resetGlobalConfig(env);
        await addAuditLog(env, 'بازنشانی تنظیمات پنل', 'Reset to defaults', clientIp);
        return jsonResponse({
          success: true,
          message: 'تمام تنظیمات به مقادیر پیش‌فرض بازنشانی شد',
          config: sanitizeConfigForClient(cfg)
        });
      }
      const updated = await saveGlobalConfig(env, body || {});
      await addAuditLog(env, 'ذخیره تنظیمات پنل', 'بروزرسانی پیکربندی سراسری', clientIp);
      return jsonResponse({
        success: true,
        message: 'تنظیمات با موفقیت در دیتابیس ذخیره شد',
        config: sanitizeConfigForClient(updated)
      });
    } catch (err) {
      return jsonResponse({
        success: false,
        message: 'خطا در ذخیره تنظیمات: ' + (err?.message || String(err))
      }, 500);
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

// ۲. مدیریت کامل کاربران در دیتابیس D1 (/api/users)
async function handleUsersApi(request, env) {
  if (request.method === 'OPTIONS') return jsonResponse({ ok: true });
  const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const users = await listUsers(env);
    const globalCfg = await loadGlobalConfig(env);
    return jsonResponse({
      success: true,
      brand: BRAND_NAME,
      defaults: sanitizeConfigForClient({
        ...CONFIG_DEFAULTS,
        ...globalCfg
      }),
      presets: USER_PRESETS,
      count: users.length,
      users: users.map(sanitizeUserForClient)
    });
  }

  if (request.method === 'POST') {
    try {
      const currentUsers = await listUsers(env);
      if (currentUsers.length >= MAX_USERS_LIMIT) {
        return jsonResponse({
          success: false,
          error: 'LIMIT_REACHED',
          message: `حداکثر سقف مجاز ایجاد کاربر (${MAX_USERS_LIMIT} کاربر) تکمیل شده است. طبق سیاست امنیتی، بیش از ${MAX_USERS_LIMIT} کاربر قابل تعریف نیست.`
        }, 400);
      }
      const body = await request.json();
      const created = await createUser(env, body || {}, clientIp);
      return jsonResponse({
        success: true,
        message: `کاربر «${created.username}» با موفقیت ساخته شد`,
        user: sanitizeUserForClient(created)
      });
    } catch (err) {
      return jsonResponse({
        success: false,
        message: 'خطا در ساخت کاربر: ' + (err?.message || String(err))
      }, 500);
    }
  }

  if (request.method === 'PUT') {
    try {
      const body = await request.json();
      const targetId = body.id || url.searchParams.get('id');
      if (!targetId) {
        return jsonResponse({ success: false, message: 'شناسه کاربر الزامی است' }, 400);
      }
      if (body.action === 'reset') {
        const resetObj = await resetUserStats(env, targetId, clientIp);
        if (!resetObj) return jsonResponse({ success: false, message: 'کاربر یافت نشد' }, 404);
        return jsonResponse({
          success: true,
          message: `مصرف کاربر «${resetObj.username}» صفر شد`,
          user: resetObj
        });
      }
      const updated = await updateUser(env, targetId, body, clientIp);
      if (!updated) {
        return jsonResponse({ success: false, message: 'کاربر مورد نظر یافت نشد' }, 404);
      }
      return jsonResponse({
        success: true,
        message: `تنظیمات کاربر «${updated.username}» بروزرسانی شد`,
        user: sanitizeUserForClient(updated)
      });
    } catch (err) {
      return jsonResponse({
        success: false,
        message: 'خطا در ویرایش کاربر: ' + (err?.message || String(err))
      }, 500);
    }
  }

  if (request.method === 'DELETE') {
    try {
      let targetId = url.searchParams.get('id');
      if (!targetId) {
        try {
          const body = await request.json();
          targetId = body?.id;
        } catch (_e) {}
      }
      if (!targetId) {
        return jsonResponse({ success: false, message: 'شناسه کاربر الزامی است' }, 400);
      }
      const ok = await deleteUser(env, targetId, clientIp);
      if (!ok) {
        return jsonResponse({ success: false, message: 'کاربر یافت نشد' }, 404);
      }
      return jsonResponse({
        success: true,
        message: 'کاربر با موفقیت حذف شد'
      });
    } catch (err) {
      return jsonResponse({
        success: false,
        message: 'خطا در حذف کاربر: ' + (err?.message || String(err))
      }, 500);
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

// ۳. مدیریت لیست IP ترجیحی (/api/preferred-ips) - سازگار با yx-tools و پنل گرافیکی
async function handlePreferredIpsApi(request, env, bypassAeCheck = false) {
  if (request.method === 'OPTIONS') return jsonResponse({ ok: true });
  const cfg = await loadGlobalConfig(env);
  if (!bypassAeCheck && cfg.ae !== 'yes' && request.headers.get('X-Mili-Admin') !== '1') {
    return jsonResponse({
      success: false,
      error: 'API غیرفعال است',
      message: 'برای استفاده از API خارجی، گزینه «اجازه مدیریت API (ae)» را در تنظیمات فعال کنید.'
    }, 403);
  }

  try {
    if (request.method === 'GET') {
      const list = parseYxArray(cfg.yx || '');
      return jsonResponse({
        success: true,
        count: list.length,
        data: list
      });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const itemsToAdd = Array.isArray(body) ? body : [body];
      if (!itemsToAdd.length) {
        return jsonResponse({ success: false, message: 'لیست IP ارسالی خالی است' }, 400);
      }
      const currentList = parseYxArray(cfg.yx || '');
      const added = [];
      const skipped = [];
      const errors = [];

      for (const item of itemsToAdd) {
        const rawIp = String(item?.ip || item?.domain || '').trim();
        if (!rawIp) {
          errors.push({ ip: 'نامشخص', reason: 'آدرس IP یا دامنه الزامی است' });
          continue;
        }
        const port = parseInt(item.port || 443, 10) || 443;
        const name = String(item.name || `${rawIp}:${port}`).trim();
        if (!isValidIpAddress(rawIp) && !isValidDomain(rawIp)) {
          errors.push({ ip: rawIp, reason: 'فرمت IP یا دامنه نامعتبر است' });
          continue;
        }
        if (currentList.some(x => x.ip === rawIp && x.port === port)) {
          skipped.push({ ip: rawIp, port, reason: 'قبلاً ثبت شده است' });
          continue;
        }
        const entry = { ip: rawIp, port, name, addedAt: new Date().toISOString() };
        currentList.push(entry);
        added.push(entry);
      }

      if (added.length > 0) {
        await saveGlobalConfig(env, { yx: serializeYxArray(currentList) });
      }

      return jsonResponse({
        success: added.length > 0,
        message: `${added.length} نود ترجیحی با موفقیت اضافه شد`,
        added: added.length,
        skipped: skipped.length,
        errors: errors.length,
        data: { addedIPs: added, skippedIPs: skipped, errors }
      });
    }

    if (request.method === 'DELETE') {
      const body = await request.json();
      if (body?.all === true) {
        const currentList = parseYxArray(cfg.yx || '');
        await saveGlobalConfig(env, { yx: '' });
        return jsonResponse({
          success: true,
          message: `تمام ${currentList.length} نود ترجیحی پاک شدند`,
          deletedCount: currentList.length
        });
      }
      if (!body?.ip) {
        return jsonResponse({ success: false, message: 'فیلد ip برای حذف الزامی است' }, 400);
      }
      const port = parseInt(body.port || 443, 10) || 443;
      const currentList = parseYxArray(cfg.yx || '');
      const nextList = currentList.filter(x => !(x.ip === body.ip && x.port === port));
      await saveGlobalConfig(env, { yx: serializeYxArray(nextList) });
      return jsonResponse({
        success: true,
        message: 'نود ترجیحی حذف شد',
        deleted: { ip: body.ip, port }
      });
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return jsonResponse({
      success: false,
      error: 'خطا در پردازش درخواست',
      message: err?.message || String(err)
    }, 500);
  }
}

// ۴. وضعیت زنده داشبورد و دیتابیس D1 (/api/stats & /api/d1)
async function handleDashboardStatsApi(request, env) {
  if (request.method === 'OPTIONS') return jsonResponse({ ok: true });
  const url = new URL(request.url);

  if (request.method === 'POST' && url.pathname.endsWith('/d1-init')) {
    const res = await ensureD1Schema(env, true);
    const diag = await getStorageDiagnostics(env);
    return jsonResponse({
      success: true,
      message: res.d1Enabled
        ? `جداول دیتابیس D1 (${res.bindingName}) با موفقیت بررسی و آماده شدند.`
        : 'اتصال D1 در تنظیمات Worker/Pages یافت نشد؛ سیستم بدون خطا در حالت حافظه پشتیبان فعال است.',
      d1: res,
      diagnostics: diag
    });
  }

  const globalCfg = await loadGlobalConfig(env);
  const diag = await getStorageDiagnostics(env);
  const users = await listUsers(env);
  const customNodes = parseYxArray(globalCfg.yx || '');
  const totalHealthyIps = customNodes.length + DIRECT_DOMAINS.length + OFFICIAL_DIRECT_IPS.length;

  return jsonResponse({
    success: true,
    brand: BRAND_NAME,
    timestamp: new Date().toISOString(),
    config: sanitizeConfigForClient(globalCfg),
    diagnostics: {
      ...diag,
      healthyCfIps: totalHealthyIps,
      customPreferredCount: customNodes.length,
      builtinDomainCount: DIRECT_DOMAINS.length,
      officialDirectCount: OFFICIAL_DIRECT_IPS.length
    },
    users: users.map(sanitizeUserForClient)
  });
}

// ۵. اطلاعات عمومی وضعیت یک کاربر برای صفحه وضعیت (/api/status/:token)
async function handlePublicUserStatusApi(request, env, token) {
  if (request.method === 'OPTIONS') return jsonResponse({ ok: true });
  const url = new URL(request.url);
  const user = await getUserByIdOrToken(env, token);
  if (!user) {
    return jsonResponse({ success: false, message: 'کاربر یافت نشد' }, 404);
  }
  const nodes = await generateUserNodesList(user, url.hostname, {
    limit: user.subNodeCount,
    catalogEndpoints: await listEndpoints(env)
  });
  return jsonResponse({
    success: true,
    brand: BRAND_NAME,
    user: {
      id: user.id,
      username: user.username,
      uuid: user.uuid,
      subNodeCount: user.subNodeCount,
      enabled: user.enabled,
      status: user.status,
      dataLimitGb: user.dataLimitGb,
      usedBytes: user.usedBytes,
      lifetimeBytes: user.lifetimeBytes,
      requestCount: user.requestCount,
      expireDays: user.expireDays,
      expireAt: user.expireAt,
      startOnFirstUse: user.startOnFirstUse,
      ipLimit: user.ipLimit,
      nodeScope: user.nodeScope,
      preset: user.preset,
      protocols: {
        vless: user.config?.ev === 'yes',
        trojan: user.config?.et === 'yes',
        xhttp: user.config?.ex === 'yes',
        ech: user.config?.ech === 'yes',
        jk: user.config?.jk === 'yes'
      }
    },
    nodeCount: nodes.length,
    nodes
  });
}


// ساخت کوکی نشست واقعی مدیریت (HttpOnly و مشتق‌شده از هش رمز)
function buildSessionCookie(request, token) {
  const isSecure = new URL(request.url).protocol === 'https:';
  return `mili_session=${encodeURIComponent(token)}; Path=/; Max-Age=43200; HttpOnly; SameSite=Strict${isSecure ? '; Secure' : ''}`;
}

function normalizeAdminKey(value) {
  return String(value || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function matchesAdminKey(candidate, adminPath, customPath) {
  const key = normalizeAdminKey(candidate);
  if (!key) return false;
  if (key === normalizeAdminKey(adminPath)) return true;
  const custom = normalizeAdminKey(customPath);
  return Boolean(custom) && key === custom;
}

async function resolveRedirectPath(env) {
  const cfg = await loadGlobalConfig(env);
  const adminPath = await getOrCreateAdminPath(env);
  return '/' + (String(cfg.d || '').trim() || adminPath);
}

// ۶. مدیریت احراز هویت و رمز عبور مدیر (/api/admin/...)
async function handleAuthApi(request, env) {
  if (request.method === 'OPTIONS') return jsonResponse({ ok: true });
  const url = new URL(request.url);
  const path = url.pathname.replace(/^.*\/api\/admin\/?/, '');

  if (path === 'auth-status' && request.method === 'GET') {
    const initialized = await hasAdminPassword(env);
    return jsonResponse({
      success: true,
      initialized,
      brand: BRAND_NAME
    });
  }

  if (path === 'setup-password' && request.method === 'POST') {
    const initialized = await hasAdminPassword(env);
    if (initialized) {
      return jsonResponse({ success: false, message: 'رمز عبور مدیر قبلاً تنظیم شده است.' }, 400);
    }
    const body = await request.json().catch(() => ({}));
    const pass = String(body.password || '').trim();
    if (!pass) {
      return jsonResponse({ success: false, message: 'رمز عبور الزامی است.' }, 400);
    }
    try {
      await initializeAdminPassword(env, pass, request.headers.get('CF-Connecting-IP') || '');
    } catch (err) {
      return jsonResponse({ success: false, message: err?.message || 'رمز عبور معتبر نیست.' }, 400);
    }
    const token = await buildAdminSessionToken(env);
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': buildSessionCookie(request, token)
    });
    // شناسه رندوم مدیریت همان لحظه ساخته/برگردانده می‌شود تا کاربر در صفحه اول آن را ببیند
    const adminId = await getOrCreateAdminPath(env);
    return new Response(JSON.stringify({
      success: true,
      message: 'رمز عبور مدیر با موفقیت ذخیره شد.',
      adminId,
      redirect: await resolveRedirectPath(env)
    }), { status: 200, headers });
  }

  if (path === 'login' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const pass = String(body.password || '').trim();
    const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    try {
      const { recentFailedLogins, recordLoginAttempt } = await import('../db/v4.js');
      const failures = await recentFailedLogins(env, ip);
      if (failures >= 8) {
        return jsonResponse({ success: false, message: 'تلاش‌های ناموفق بیش از حد مجاز است. ۱۵ دقیقه بعد دوباره تلاش کنید.' }, 429);
      }
      const ok = await verifyAdminPassword(env, pass);
      await recordLoginAttempt(env, ip, ok);
      if (!ok) {
        return jsonResponse({ success: false, message: 'رمز عبور وارد شده اشتباه است.' }, 401);
      }
    } catch (_e) {
      return jsonResponse({ success: false, message: 'ورود ناموفق بود.' }, 500);
    }
    const token = await buildAdminSessionToken(env);
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': buildSessionCookie(request, token)
    });
    return new Response(JSON.stringify({
      success: true,
      message: 'ورود با موفقیت انجام شد.',
      redirect: await resolveRedirectPath(env)
    }), { status: 200, headers });
  }

  // بازیابی رمز از طریق UUID/مسیر مدیریت (مالکیت مسیر = احراز هویت)
  // بازیابی رمز با UUID حذف شد: دانستن مسیر مدیریت نباید امکان تغییر رمز بدهد.
  // برای بازیابی، مدیر باید از طریق دسترسی مستقیم به D1 رمز را بازنشانی کند (docs/SECURITY.md).
  if (path === 'reset-password' && request.method === 'POST') {
    return jsonResponse({
      success: false,
      message: 'بازیابی رمز از طریق UUID غیرفعال شده است. برای بازنشانی، از دسترسی مستقیم به D1 استفاده کنید.'
    }, 410);
  }

  if (path === 'change-password' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const oldPass = String(body.oldPassword || '').trim();
    const newPass = String(body.newPassword || '').trim();
    if (!newPass) {
      return jsonResponse({ success: false, message: 'رمز عبور جدید الزامی است.' }, 400);
    }
    try {
      await changeAdminPassword(env, oldPass, newPass);
    } catch (err) {
      return jsonResponse({ success: false, message: err?.message || 'تغییر رمز ناموفق بود.' }, 400);
    }
    // نشست فعلی با هش جدید بازسازی می‌شود تا کاربر بلافاصله بیرون نیفتد
    const token = await buildAdminSessionToken(env);
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': buildSessionCookie(request, token)
    });
    return new Response(JSON.stringify({ success: true, message: 'رمز عبور مدیر با موفقیت بروزرسانی شد.' }), { status: 200, headers });
  }

  // چرخش مسیر مدیریت (نیازمند نشست معتبر)
  if (path === 'rotate-path' && request.method === 'POST') {
    const rawCookie = request.headers.get('Cookie') || '';
    const tokenMatch = rawCookie.match(/(?:^|;\s*)(?:mili_session|mili_auth)=([^;]*)/);
    const sessionToken = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
    if (!(await verifyAdminSession(env, sessionToken))) {
      return jsonResponse({ success: false, message: 'دسترسی غیرمجاز' }, 403);
    }
    const newPath = await rotateAdminPath(env);
    return jsonResponse({ success: true, message: 'مسیر مدیریت جدید ساخته شد', redirect: '/' + newPath, adminPath: newPath });
  }

  if (path === 'logout' && request.method === 'POST') {
    const rawCookie = request.headers.get('Cookie') || '';
    const tokenMatch = rawCookie.match(/(?:^|;\s*)(?:mili_session|mili_auth)=([^;]*)/);
    const sessionToken = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
    if (sessionToken) {
      try {
        const { revokeAdminSession } = await import('../db/v4.js');
        await revokeAdminSession(env, sessionToken);
      } catch (_e) {}
    }
    return new Response(JSON.stringify({ success: true, message: 'با موفقیت خارج شدید.' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': 'mili_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict, mili_auth=; Path=/; Max-Age=0'
      }
    });
  }

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}

// ۷. اسکنر زنده پروکسی‌های کشوری و ساخت سابلینک مولتی‌لوکیشن (/api/scanner/...)
async function handleScannerApi(request, env) {
  if (request.method === 'OPTIONS') return jsonResponse({ ok: true });
  const url = new URL(request.url);
  const action = url.pathname.replace(/^.*\/api\/scanner\/?/, '');

  // تست اتصال TCP به نودها از سمت ورکر (بررسی دسترس‌پذیری آدرس/پورت نود)
  if (action === 'test-nodes' && request.method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const nodes = Array.isArray(body.nodes) ? body.nodes.slice(0, 12) : [];
      const results = await Promise.all(nodes.map(async node => {
        const host = normalizeNodeHost(node && (node.host || node.ip));
        const port = parseInt(node && node.port, 10) || 443;
        if (!host || (!isValidIpAddress(host) && !isValidDomain(host))) {
          return { host, port, ok: false, latencyMs: 0, error: 'invalid-host' };
        }
        const probe = await probeTcp(host, port, 2500);
        return { host, port, ok: probe.ok, latencyMs: probe.latencyMs, error: probe.error || '' };
      }));
      const online = results.filter(item => item.ok).length;
      return jsonResponse({
        success: online > 0,
        tested: results.length,
        online,
        results,
        message: `${online} از ${results.length} نود از سمت ورکر پاسخ داد`
      });
    } catch (_e) {
      return jsonResponse({ success: false, message: 'تست نود ناموفق بود' }, 400);
    }
  }

  if (action === 'countries' && request.method === 'GET') {
    const countries = Object.keys(COUNTRY_PROXY_SOURCES).map(code => ({
      code,
      name: COUNTRY_PROXY_SOURCES[code].name,
      sourceCount: COUNTRY_PROXY_SOURCES[code].urls.length
    }));
    return jsonResponse({
      success: true,
      countries,
      globalSources: {
        socks5: GLOBAL_PROXY_SOURCES.socks5.length,
        http: GLOBAL_PROXY_SOURCES.http.length,
        ipv4: IP_RANGE_SOURCES.ipv4.length,
        ipv6: IP_RANGE_SOURCES.ipv6.length
      },
      // آی‌پی‌ها و دامنه‌های پیش‌فرض CFnew برای افزودن مستقیم به yx از داخل اسکنر
      officialIps: OFFICIAL_DIRECT_IPS,
      officialIpv6: OFFICIAL_DIRECT_IPV6,
      directDomains: DIRECT_DOMAINS.map(item => item.domain)
    });
  }

  // اسکن زنده: هر بار لیست‌ها از منابع خوانده می‌شوند (بدون کش) و فقط یک برش چرخشی تست می‌شود
  if (action === 'fetch-and-test' && request.method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const kind = body.kind === 'ip' ? 'ip' : 'proxy';
      const family = body.family === 'ipv4' || body.family === 'ipv6' ? body.family : 'any';
      const limit = Math.min(Math.max(parseInt(body.limit || '10', 10), 1), 25);
      const requested = String(body.country || 'DE').toUpperCase();
      const multi = requested === 'MULTI' || requested === 'ALL';
      const code = multi ? 'MULTI' : (COUNTRY_PROXY_SOURCES[requested] ? requested : 'DE');
      const countryLabel = multi ? 'چند کشور' : COUNTRY_PROXY_SOURCES[code].name;

      // ---- اسکن آی‌پی ثابت (IPv4 / IPv6) از رنج‌های کلادفلر ----
      if (kind === 'ip') {
        const curatedV4 = OFFICIAL_DIRECT_IPS.map(ip => ({ host: ip, port: 443, family: 'ipv4', kind: 'ip' }));
        const curatedV6 = OFFICIAL_DIRECT_IPV6.map(ip => ({ host: ip, port: 443, family: 'ipv6', kind: 'ip' }));

        // ورکرهای کلادفلر خروجی IPv6 ندارند، بنابراین تست TCP روی IPv6 از این محیط ممکن نیست.
        // در این حالت آدرس‌های Anycast معتبر از رنج‌های زنده کلادفلر نمونه‌گیری می‌شوند و
        // به‌عنوان پیشنهاد (verified:false) برگردانده می‌شوند تا در yx قابل استفاده باشند.
        const ipv6Control = family === 'ipv4' ? null : await probeTcp(OFFICIAL_DIRECT_IPV6[0], 443, 2200);
        if (family === 'ipv6' && ipv6Control && !ipv6Control.ok) {
          const rangeTexts = await Promise.all(
            pickRotating(IP_RANGE_SOURCES.ipv6, 2).map(src => fetchSourceText(src, 4000))
          );
          const ranges = rangeTexts.flatMap(text => parseRangeLines(text)).filter(r => r && r.family === 'ipv6');
          const seenV6 = new Set();
          const picked = [];
          for (const item of shuffleList(curatedV6)) {
            if (picked.length >= limit) break;
            if (seenV6.has(item.host)) continue;
            seenV6.add(item.host);
            picked.push(item.host);
          }
          let guard = 0;
          while (picked.length < limit && ranges.length && guard < 120) {
            guard++;
            const range = ranges[Math.floor(Math.random() * ranges.length)];
            const ip = randomIpv6FromRange(range.base, range.bits);
            if (!ip || seenV6.has(ip) || !isValidIpAddress(ip)) continue;
            seenV6.add(ip);
            picked.push(ip);
          }
          const proxies = picked.slice(0, limit).map(ip => ({
            kind: 'ip',
            ip,
            port: 443,
            name: ip,
            country: countryLabel,
            code,
            family: 'ipv6',
            protocol: 'IPv6',
            latencyMs: 0,
            status: 'unverified',
            verified: false
          }));
          return jsonResponse({
            success: proxies.length > 0, kind, family: 'ipv6', country: countryLabel, code,
            count: proxies.length, sourceCount: ranges.length + curatedV6.length, testedCount: 0,
            verified: false, proxies,
            attempts: [{ ip: OFFICIAL_DIRECT_IPV6[0], control: 'ipv6', ok: false, latencyMs: ipv6Control.latencyMs, error: ipv6Control.error || '' }],
            message: proxies.length
              ? `${proxies.length} آدرس IPv6 کلادفلر از رنج‌های زنده انتخاب شد؛ ورکر خروجی IPv6 ندارد، پس تست TCP ممکن نیست — با کلاینت خودتان امتحان کنید.`
              : 'منبع رنج IPv6 در دسترس نبود؛ دوباره تلاش کنید.'
          });
        }

        const curatedPool = [
          ...(family === 'ipv6' ? [] : curatedV4),
          ...(family === 'ipv4' ? [] : curatedV6)
        ];

        // لیست زنده آی‌پی‌های فرانت‌شده کلادفلر (Z-E-U-S)؛ آدرس‌های تصادفی داخل رنج‌ها
        // از داخل ورکر کلادفلر قابل اتصال نیستند، بنابراین از خود لیست نمونه می‌گیریم.
        const listSource = pickRotating(IP_CANDIDATE_SOURCES, 1)[0];
        const listText = listSource && family !== 'ipv6' ? await fetchSourceText(listSource, 5000) : '';
        const listed = listText ? parseIpCandidateLines(listText, family) : [];

        const wanted = Math.min(limit * 3, 30);
        const curatedPick = shuffleList(curatedPool).slice(0, Math.max(3, Math.ceil(wanted / 2)));
        const seenHosts = new Set(curatedPick.map(p => p.host));
        const listedPick = [];
        for (const item of shuffleList(listed)) {
          if (listedPick.length >= wanted - curatedPick.length) break;
          if (seenHosts.has(item.host)) continue;
          seenHosts.add(item.host);
          listedPick.push(item);
        }
        const candidates = [...curatedPick, ...listedPick];

        if (!candidates.length) {
          return jsonResponse({
            success: false, kind, family, country: countryLabel, code,
            count: 0, sourceCount: 0, testedCount: 0, proxies: [],
            message: 'منبع آی‌پی در دسترس نبود؛ دوباره تلاش کنید.'
          });
        }

        const controlV4 = await probeTcp('172.71.218.190', 443, 2500);
        const controlV6 = ipv6Control;
        const probed = await Promise.all(candidates.map(async p => ({ ...p, ...(await probeTcp(p.host, 443, 2500)) })));
        const online = probed.filter(p => p.ok).sort((a, b) => a.latencyMs - b.latencyMs).slice(0, limit);
        const attempts = [
          { ip: '172.71.218.190', control: 'ipv4', ok: controlV4.ok, latencyMs: controlV4.latencyMs, error: controlV4.error || '' },
          ...(controlV6 ? [{ ip: OFFICIAL_DIRECT_IPV6[0], control: 'ipv6', ok: controlV6.ok, latencyMs: controlV6.latencyMs, error: controlV6.error || '' }] : []),
          ...probed.slice(0, 8).map(p => ({ ip: p.host, ok: p.ok, latencyMs: p.latencyMs, error: p.error || '' }))
        ];
        const proxies = online.map(p => ({
          kind: 'ip',
          ip: p.host,
          port: 443,
          name: p.host,
          country: countryLabel,
          code,
          family: p.family,
          protocol: p.family === 'ipv6' ? 'IPv6' : (p.family === 'domain' ? 'Domain' : 'IPv4'),
          latencyMs: p.latencyMs,
          status: 'online'
        }));
        const noV6Egress = family !== 'ipv4' && controlV6 && !controlV6.ok;

        return jsonResponse({
          success: proxies.length > 0, kind, family, country: countryLabel, code,
          count: proxies.length, sourceCount: candidates.length, testedCount: probed.length, proxies, attempts,
          message: proxies.length
            ? `${proxies.length} آی‌پی سالم از ${probed.length} آدرس تست‌شده (${family === 'any' ? 'IPv4 + IPv6' : family.toUpperCase()})`
            : (noV6Egress
              ? 'این محیط خروجی IPv6 ندارد؛ IPv6 فقط به‌عنوان نود ثابت در ساب‌لینک استفاده می‌شود.'
              : `از ${probed.length} آی‌پی هیچ‌کدام پاسخ نداد؛ دوباره تلاش کنید.`)
        });
      }

      // ---- اسکن پروکسی (SOCKS5/HTTP) با منابع کشوری + لیست‌های عمومی ----
      // برای کشور مشخص فقط منابع همان کشور خوانده می‌شود تا نتیجه واقعاً به آن کشور تعلق داشته باشد؛
      // لیست‌های عمومی فقط در حالت «چند کشور» استفاده می‌شوند.
      const countrySources = multi
        ? pickRotating(Object.keys(COUNTRY_PROXY_SOURCES), 3).flatMap(c => pickRotating(COUNTRY_PROXY_SOURCES[c].urls || [], 1))
        : pickRotating(COUNTRY_PROXY_SOURCES[code].urls || [], 4);
      const globalSources = multi
        ? pickRotating([...GLOBAL_PROXY_SOURCES.socks5, ...GLOBAL_PROXY_SOURCES.http], 3)
        : [];
      const sources = [...new Set([...countrySources, ...globalSources])].slice(0, 12);

      const lists = await Promise.all(sources.map(src => fetchProxySource(src, 3500)));
      const seen = new Set();
      const candidates = [];
      for (const list of lists) {
        for (const p of list) {
          if (family !== 'any' && p.family && p.family !== family && p.family !== 'domain') continue;
          const key = p.host + ':' + p.port;
          if (seen.has(key)) continue;
          seen.add(key);
          candidates.push(p);
        }
      }

      if (!candidates.length) {
        return jsonResponse({
          success: false, kind, family, country: countryLabel, code,
          count: 0, sourceCount: sources.length, testedCount: 0, proxies: [],
          message: 'منبع لیست پروکسی در دسترس نبود یا خالی بود. چند لحظه بعد دوباره تلاش کنید.'
        });
      }

      const pool = candidates
        .slice()
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(candidates.length, limit * 3));

      const probed = await Promise.all(pool.map(async p => {
        const result = await probeTcp(p.host, p.port, 1800);
        return { ...p, ...result };
      }));

      const online = probed
        .filter(p => p.ok)
        .sort((a, b) => a.latencyMs - b.latencyMs)
        .slice(0, limit);

      const proxies = online.map(p => {
        const isHttp = p.protocol === 'HTTP' || p.protocol === 'HTTPS';
        const proxyUrl = p.proxy || `${isHttp ? 'http' : 'socks5'}://${p.host}:${p.port}`;
        return {
          kind: 'proxy',
          ip: p.host,
          port: p.port,
          name: `${p.host}:${p.port}`,
          proxy: proxyUrl,
          country: countryLabel,
          code,
          family: p.family || '',
          protocol: p.protocol,
          latencyMs: p.latencyMs,
          status: 'online'
        };
      });

      return jsonResponse({
        success: proxies.length > 0, kind, family, country: countryLabel, code,
        count: proxies.length, sourceCount: candidates.length, testedCount: probed.length, proxies,
        message: proxies.length
          ? `${proxies.length} پروکسی آنلاین از ${probed.length} اتصال تست‌شده`
          : `هیچ‌کدام از ${probed.length} پروکسی پاسخ ندادند؛ دوباره تلاش کنید.`
      });
    } catch (err) {
      return jsonResponse({ success: false, message: 'خطا در اسکنر: ' + (err?.message || err) }, 500);
    }
  }

  // اتصال نتیجه اسکن: آی‌پی‌ها به yx و پروکسی‌ها به s
  if (action === 'apply' && request.method === 'POST') {
    if (request.headers.get('X-Mili-Admin') !== '1') {
      return jsonResponse({ success: false, message: 'دسترسی غیرمجاز' }, 403);
    }
    try {
      const body = await request.json().catch(() => ({}));
      const target = body.target === 's' ? 's' : body.target === 'yx' ? 'yx' : '';
      const items = Array.isArray(body.items) ? body.items : [body];
      const cfg = await loadGlobalConfig(env);

      if (target === 's') {
        const item = items[0] || {};
        const proxyUrl = String(item.proxy || '').trim();
        if (!proxyUrl) return jsonResponse({ success: false, message: 'پروکسی معتبری ارسال نشد' }, 400);
        await saveGlobalConfig(env, { s: proxyUrl });
        return jsonResponse({ success: true, s: proxyUrl, message: 'پروکسی خروجی (s) تنظیم شد' });
      }

      if (target === 'yx') {
        const list = parseYxArray(cfg.yx || '');
        let added = 0;
        for (const item of items) {
          const ip = String(item?.ip || '').trim();
          const port = parseInt(item?.port || 443, 10) || 443;
          if (!ip || (!isValidIpAddress(ip) && !isValidDomain(ip))) continue;
          if (list.some(x => x.ip === ip && x.port === port)) continue;
          list.push({ ip, port, name: String(item?.name || ip) });
          added++;
        }
        if (added > 0) await saveGlobalConfig(env, { yx: serializeYxArray(list) });
        return jsonResponse({
          success: added > 0,
          added,
          total: list.length,
          message: added > 0 ? `${added} آی‌پی به نودهای ترجیحی (yx) اضافه شد` : 'آی‌پی جدیدی برای افزودن نبود'
        });
      }

      return jsonResponse({ success: false, message: 'مقصد نامعتبر است (yx یا s)' }, 400);
    } catch (err) {
      return jsonResponse({ success: false, message: 'خطا در اعمال نتیجه اسکن: ' + (err?.message || err) }, 500);
    }
  }

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}


// --- MODULE: src/api/v1.js ---
// ============================================================================
// miliconfigOS v4.0 - /api/v1
// Every protected endpoint authenticates server-side. Mutating requests are
// same-origin checked (cookie auth) and audited. Secrets are never returned.
// ============================================================================


const API_VERSION = 'v1';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...securityHeaders()
    }
  });
}

function fail(status, code, message, details) {
  return json({ ok: false, error: { code, message, details: details || undefined } }, status);
}

async function readBody(request, maxBytes = 65536) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length && length > maxBytes) {
    const err = new Error('Request body too large');
    err.status = 413;
    throw err;
  }
  try {
    return await request.json();
  } catch (_e) {
    const err = new Error('Invalid JSON body');
    err.status = 400;
    throw err;
  }
}

function sanitizeUser(user, subscription) {
  if (!user) return null;
  const config = { ...(user.config || {}) };
  delete config.adminPasswordHash;
  delete config.admin_password_hash;
  return {
    id: user.id,
    username: user.username,
    uuid: user.uuid,
    enabled: user.enabled,
    status: user.status,
    subNodeCount: user.subNodeCount,
    dataLimitGb: user.dataLimitGb,
    usedBytes: user.usedBytes,
    lifetimeBytes: user.lifetimeBytes,
    requestCount: user.requestCount,
    expireDays: user.expireDays,
    expireAt: user.expireAt,
    startOnFirstUse: user.startOnFirstUse,
    firstConnectedAt: user.firstConnectedAt,
    ipLimit: user.ipLimit,
    nodeScope: user.nodeScope,
    preset: user.preset,
    note: user.note,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    protocols: {
      vless: String(config.ev) === 'yes',
      trojan: String(config.et) === 'yes',
      xhttp: String(config.ex) === 'yes',
      shadowsocks: String(config.es) === 'yes'
    },
    config,
    subscription: subscription
      ? {
          token: subscription.token,
          revoked: subscription.revoked,
          formats: subscription.formats,
          downloads: subscription.downloads,
          lastAccessAt: subscription.lastAccessAt
        }
      : null
  };
}

function buildSubscriptionUrl(request, token, target = '') {
  const url = new URL(request.url);
  const base = `${url.protocol}//${url.host}/s/${token}`;
  return target ? `${base}?target=${encodeURIComponent(target)}` : base;
}

async function getSessionToken(request) {
  const header = request.headers.get('Authorization') || '';
  if (/^Bearer\s+/i.test(header)) return header.replace(/^Bearer\s+/i, '').trim();
  return readCookie(request, SESSION_COOKIE) || readCookie(request, LEGACY_SESSION_COOKIE);
}

async function authenticate(request, env) {
  const token = await getSessionToken(request);
  if (!token) return { ok: false };
  try {
    const { verifyAdminSessionToken } = await import('../db/v4.js');
    const result = await verifyAdminSessionToken(env, token);
    return { ok: result.valid, token, expiresAt: result.expiresAt };
  } catch (_e) {
    return { ok: false, token };
  }
}

function mutatingAllowed(request) {
  const header = request.headers.get('Authorization') || '';
  if (/^Bearer\s+/i.test(header)) return true;
  return isSameOriginRequest(request);
}

function validateEndpointPayload(body = {}) {
  const host = normalizeNodeHost(body.host);
  const port = parseInt(body.port ?? 443, 10);
  if (!host) return { ok: false, message: 'Host is required.' };
  if (!isValidIpAddress(host) && !isValidDomain(host)) return { ok: false, message: 'Host must be a valid IP address or domain.' };
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { ok: false, message: 'Port must be between 1 and 65535.' };
  const family = host.includes(':') ? 'ipv6' : (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? 'ipv4' : 'domain');
  const protocol = String(body.protocol || 'vless').toLowerCase();
  if (!PROTOCOLS[protocol]) return { ok: false, message: 'Unsupported protocol.' };
  const transport = String(body.transport || 'ws').toLowerCase();
  if (!TRANSPORTS[transport]) return { ok: false, message: 'Unsupported transport.' };
  if (!TRANSPORTS[transport].protocols.includes(protocol === 'xhttp' ? 'xhttp' : protocol)) {
    return { ok: false, message: `Transport ${transport} cannot carry ${protocol}.` };
  }
  const tlsMode = String(body.tlsMode || 'tls').toLowerCase();
  if (!['tls', 'none'].includes(tlsMode)) return { ok: false, message: 'TLS mode must be tls or none.' };
  return {
    ok: true,
    value: {
      name: String(body.name || host).trim().slice(0, 80),
      host,
      port,
      family,
      kind: String(body.kind || 'manual').toLowerCase(),
      country: String(body.country || '').toUpperCase().slice(0, 2),
      region: String(body.region || '').slice(0, 80),
      provider: String(body.provider || '').slice(0, 80),
      protocol,
      transport,
      tlsMode,
      notes: String(body.notes || '').slice(0, 300),
      enabled: body.enabled !== false
    }
  };
}

async function withAudit(env, action, detail, request, fn) {
  const result = await fn();
  await addAuditLog(env, action, detail, normalizeClientIp(request));
  return result;
}

// ---------------------------------------------------------------------------
// Sub-resource handlers
// ---------------------------------------------------------------------------

async function handleAuth(request, env, seg, method) {
  const action = seg[1] || '';

  if (action === 'status' && method === 'GET') {
    const [initialized, cfg] = await Promise.all([hasAdminPassword(env), loadGlobalConfig(env)]);
    return json({
      ok: true,
      initialized,
      brand: BRAND_NAME,
      appName: cfg.appName || 'MiliconfigOS',
      version: VERSION,
      homepage: cfg.homepage || 'https://nginx.com',
      maxUsers: MAX_USERS_LIMIT,
      databaseAvailable: databaseConfigured(env),
      memoryModeAllowed: memoryModeAllowed(env)
    });
  }

  if (action === 'session' && method === 'GET') {
    const session = await authenticate(request, env);
    if (!session.ok) return json({ ok: true, authenticated: false });
    return json({
      ok: true,
      authenticated: true,
      expiresAt: session.expiresAt,
      adminPath: await getOrCreateAdminPath(env)
    });
  }

  if (action === 'setup' && method === 'POST') {
    if (!databaseConfigured(env) && !memoryModeAllowed(env)) {
      return fail(503, 'DATABASE_UNAVAILABLE', 'Cloudflare D1 is not bound. Bind the database before creating the administrator account.');
    }
    if (await hasAdminPassword(env)) {
      return fail(403, 'SETUP_COMPLETE', 'Initial setup is already complete. Sign in instead.');
    }
    const body = await readBody(request);
    const password = String(body.password || '');
    const confirm = String(body.confirmPassword ?? body.confirm ?? '');
    if (!password) return fail(400, 'PASSWORD_REQUIRED', 'Password is required.');
    if (password !== confirm) return fail(400, 'PASSWORD_MISMATCH', 'Passwords do not match.');
    try {
      await initializeAdminPassword(env, password, normalizeClientIp(request));
    } catch (err) {
      const message = String(err?.message || err);
      if (message.startsWith('SETUP_COMPLETE')) return fail(403, 'SETUP_COMPLETE', message);
      return fail(400, 'PASSWORD_POLICY', message);
    }
    const cfg = await loadGlobalConfig(env);
    const { createAdminSession } = await import('../db/v4.js');
    const session = await createAdminSession(env, { ttlHours: cfg.sessionHours || 12, ip: normalizeClientIp(request) });
    const adminPath = await getOrCreateAdminPath(env);
    return new Response(JSON.stringify({
      ok: true,
      adminPath,
      redirect: '/' + adminPath,
      expiresAt: session.expiresAt
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': sessionCookie(request, session.token, (cfg.sessionHours || 12) * 3600),
        ...securityHeaders()
      }
    });
  }

  if (action === 'login' && method === 'POST') {
    if (!databaseConfigured(env) && !memoryModeAllowed(env)) {
      return fail(503, 'DATABASE_UNAVAILABLE', 'Cloudflare D1 is not bound. Bind the database before signing in.');
    }
    const body = await readBody(request);
    const ip = normalizeClientIp(request);
    const cfg = await loadGlobalConfig(env);
    const maxFailures = Math.max(3, Number(cfg.loginRateLimitMax) || 8);
    const failures = await recentFailedLogins(env, ip);
    if (failures >= maxFailures) {
      await addAuditLog(env, 'ورود مسدود شد', `Rate limit for ${ip}`, ip);
      return fail(429, 'RATE_LIMITED', 'Too many failed login attempts. Try again in 15 minutes.');
    }
    if (!(await hasAdminPassword(env))) {
      return fail(409, 'SETUP_REQUIRED', 'No administrator password is configured yet.');
    }
    const password = String(body.password || '');
    const ok = await verifyAdminPassword(env, password);
    await recordLoginAttempt(env, ip, ok);
    if (!ok) {
      return fail(401, 'INVALID_CREDENTIALS', 'Incorrect password.');
    }
    const { createAdminSession } = await import('../db/v4.js');
    const session = await createAdminSession(env, { ttlHours: cfg.sessionHours || 12, ip });
    await addAuditLog(env, 'ورود موفق مدیر', `Session expires ${new Date(session.expiresAt).toISOString()}`, ip);
    return new Response(JSON.stringify({
      ok: true,
      redirect: '/' + (String(cfg.d || '').trim() || await getOrCreateAdminPath(env)),
      expiresAt: session.expiresAt
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': sessionCookie(request, session.token, (cfg.sessionHours || 12) * 3600),
        ...securityHeaders()
      }
    });
  }

  if (action === 'logout' && method === 'POST') {
    const token = await getSessionToken(request);
    if (token) await revokeAdminSession(env, token);
    await addAuditLog(env, 'خروج مدیر', 'Session revoked', normalizeClientIp(request));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': clearSessionCookie(request),
        ...securityHeaders()
      }
    });
  }

  if (action === 'change-password' && method === 'POST') {
    const session = await authenticate(request, env);
    if (!session.ok) return fail(401, 'UNAUTHENTICATED', 'Authentication required.');
    const body = await readBody(request);
    const current = String(body.currentPassword || '');
    const next = String(body.newPassword || '');
    if (next !== String(body.confirmPassword ?? next)) {
      return fail(400, 'PASSWORD_MISMATCH', 'New passwords do not match.');
    }
    try {
      await changeAdminPassword(env, current, next, normalizeClientIp(request));
    } catch (err) {
      return fail(400, 'PASSWORD_CHANGE_FAILED', String(err?.message || err));
    }
    const cfg = await loadGlobalConfig(env);
    const { createAdminSession } = await import('../db/v4.js');
    const fresh = await createAdminSession(env, { ttlHours: cfg.sessionHours || 12, ip: normalizeClientIp(request) });
    return new Response(JSON.stringify({ ok: true, expiresAt: fresh.expiresAt }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': sessionCookie(request, fresh.token, (cfg.sessionHours || 12) * 3600),
        ...securityHeaders()
      }
    });
  }

  if (action === 'revoke-sessions' && method === 'POST') {
    const session = await authenticate(request, env);
    if (!session.ok) return fail(401, 'UNAUTHENTICATED', 'Authentication required.');
    await revokeAllAdminSessions(env);
    await addAuditLog(env, 'ابطال همه نشست‌ها', 'All admin sessions revoked', normalizeClientIp(request));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': clearSessionCookie(request),
        ...securityHeaders()
      }
    });
  }

  return fail(404, 'NOT_FOUND', 'Unknown auth endpoint.');
}

async function handleUsers(request, env, seg, method) {
  const cfg = await loadGlobalConfig(env);

  if (seg.length === 1 && method === 'GET') {
    const users = await listUsers(env);
    const subscriptions = await listSubscriptions(env);
    const byUser = new Map(subscriptions.map(sub => [sub.userId, sub]));
    return json({
      ok: true,
      maxUsers: MAX_USERS_LIMIT,
      count: users.length,
      availableSlots: Math.max(0, MAX_USERS_LIMIT - users.length),
      usageSource: 'worker-stream (measured)',
      users: users.map(user => sanitizeUser(user, byUser.get(user.id)))
    });
  }

  if (seg.length === 1 && method === 'POST') {
    const body = await readBody(request);
    const username = String(body.username || '').trim();
    if (!username) return fail(400, 'USERNAME_REQUIRED', 'Username is required.');
    if (username.length > 64) return fail(400, 'USERNAME_TOO_LONG', 'Username is limited to 64 characters.');
    if (listUsers && (await listUsers(env)).length >= MAX_USERS_LIMIT) {
      return fail(409, 'LIMIT_REACHED', `The ${MAX_USERS_LIMIT}-user limit has been reached. Delete a user first.`);
    }
    const payload = {
      username,
      preset: body.preset,
      subNodeCount: body.subNodeCount,
      dataLimitGb: body.dataLimitGb ?? cfg.defaultQuotaGb ?? 0,
      expireDays: body.expireDays ?? cfg.defaultExpireDays ?? 0,
      startOnFirstUse: body.startOnFirstUse,
      ipLimit: body.ipLimit,
      nodeScope: body.nodeScope,
      note: body.note,
      enabled: body.enabled,
      config: body.config || {}
    };
    try {
      const created = await createUser(env, payload, normalizeClientIp(request));
      const subscription = await ensureSubscription(env, created.id, cfg.subFormats || 'singbox,clash,uri');
      await addAuditLog(env, 'ساخت کاربر', `${created.username} (${(await listUsers(env)).length}/${MAX_USERS_LIMIT})`, normalizeClientIp(request));
      return json({
        ok: true,
        user: sanitizeUser(created, subscription),
        subscriptionUrl: buildSubscriptionUrl(request, subscription.token)
      }, 201);
    } catch (err) {
      const message = String(err?.message || err);
      if (message.startsWith('LIMIT_REACHED')) return fail(409, 'LIMIT_REACHED', message.replace('LIMIT_REACHED:', '').trim());
      return fail(400, 'USER_CREATE_FAILED', message);
    }
  }

  if (seg.length >= 2) {
    const id = decodeURIComponent(seg[1]);
    const action = seg[2] || '';

    if (action === 'reset-usage' && method === 'POST') {
      const reset = await resetUserStats(env, id, normalizeClientIp(request));
      if (!reset) return fail(404, 'USER_NOT_FOUND', 'User not found.');
      return json({ ok: true, user: sanitizeUser(reset, await getSubscription(env, reset.id)) });
    }

    if (action === 'rotate-sub' && method === 'POST') {
      const rotated = await rotateSubscription(env, id, cfg.subFormats);
      if (!rotated) {
        const sub = await ensureSubscription(env, id, cfg.subFormats);
        return json({ ok: true, subscription: sub, subscriptionUrl: buildSubscriptionUrl(request, sub.token) });
      }
      await addAuditLog(env, 'چرخش توکن اشتراک', id, normalizeClientIp(request));
      return json({ ok: true, subscription: rotated, subscriptionUrl: buildSubscriptionUrl(request, rotated.token) });
    }

    if (action === 'revoke-sub' && method === 'POST') {
      const body = await readBody(request);
      const revoked = await setSubscriptionRevoked(env, id, body.revoked !== false);
      if (!revoked) return fail(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found.');
      await addAuditLog(env, 'تغییر دسترسی اشتراک', `${id} · revoked=${revoked.revoked}`, normalizeClientIp(request));
      return json({ ok: true, subscription: revoked });
    }

    if (!action && method === 'PATCH') {
      const body = await readBody(request);
      const updated = await updateUser(env, id, body, normalizeClientIp(request));
      if (!updated) return fail(404, 'USER_NOT_FOUND', 'User not found.');
      return json({ ok: true, user: sanitizeUser(updated, await getSubscription(env, updated.id)) });
    }

    if (!action && method === 'DELETE') {
      const body = await readBody(request);
      const users = await listUsers(env);
      const target = users.find(user => user.id === id || user.username === id);
      if (!target) return fail(404, 'USER_NOT_FOUND', 'User not found.');
      if (String(body.confirm || '') !== target.username) {
        return fail(400, 'CONFIRMATION_REQUIRED', 'Type the exact username to confirm deletion.');
      }
      await deleteUser(env, target.id, normalizeClientIp(request));
      await deleteUserArtifacts(env, target.id);
      await addAuditLog(env, 'حذف کاربر', target.username, normalizeClientIp(request));
      return json({ ok: true, deleted: target.username });
    }

    if (!action && method === 'GET') {
      const users = await listUsers(env);
      const target = users.find(user => user.id === id);
      if (!target) return fail(404, 'USER_NOT_FOUND', 'User not found.');
      return json({
        ok: true,
        user: sanitizeUser(target, await getSubscription(env, target.id)),
        configurations: await listConfigurations(env, { userId: target.id, limit: 50 })
      });
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown users endpoint.');
}

async function handleEndpoints(request, env, seg, method, cfg) {
  if (seg.length === 1 && method === 'GET') {
    const [endpoints, health] = await Promise.all([
      listEndpoints(env),
      Promise.resolve(null)
    ]);
    return json({
      ok: true,
      count: endpoints.length,
      healthLevels: ['syntax', 'dns', 'tcp', 'tls', 'http', 'proxy'],
      labels: {
        reachable: healthLabel('reachable'),
        'tls-ok': healthLabel('tls-ok'),
        unreachable: healthLabel('unreachable')
      },
      endpoints
    });
  }

  if (seg.length === 1 && method === 'POST') {
    const body = await readBody(request);
    const parsed = validateEndpointPayload(body);
    if (!parsed.ok) return fail(400, 'ENDPOINT_INVALID', parsed.message);
    const existing = await listEndpoints(env);
    if (existing.some(item => item.host === parsed.value.host && item.port === parsed.value.port)) {
      return fail(409, 'ENDPOINT_DUPLICATE', 'An endpoint with this host and port already exists.');
    }
    const endpoint = await createEndpoint(env, parsed.value);
    await addAuditLog(env, 'افزودن اندپوینت', `${endpoint.name} · ${endpoint.host}:${endpoint.port}`, normalizeClientIp(request));
    return json({ ok: true, endpoint }, 201);
  }

  if (seg.length >= 2) {
    const id = decodeURIComponent(seg[1]);
    const action = seg[2] || '';

    if (action === 'check' && method === 'POST') {
      const endpoint = await getEndpoint(env, id);
      if (!endpoint) return fail(404, 'ENDPOINT_NOT_FOUND', 'Endpoint not found.');
      const body = await readBody(request).catch(() => ({}));
      const levels = Array.isArray(body.levels) ? body.levels : ['syntax', 'dns', 'tcp', 'tls', 'http'];
      const result = await checkTarget({ host: endpoint.host, port: endpoint.port, levels }, { timeoutMs: 4500 });
      await recordEndpointHealth(env, endpoint.id, result);
      await addAuditLog(env, 'بررسی سلامت اندپوینت', `${endpoint.host}:${endpoint.port} · ${result.status}`, normalizeClientIp(request));
      return json({ ok: true, result, history: await listEndpointHealth(env, endpoint.id, 10) });
    }

    if (action === 'ech-check' && method === 'POST') {
      const endpoint = await getEndpoint(env, id);
      if (!endpoint) return fail(404, 'ENDPOINT_NOT_FOUND', 'Endpoint not found.');
      const body = await readBody(request).catch(() => ({}));
      const hostname = String(body.hostname || endpoint.host);
      const result = await checkEchRecord(hostname);
      await setMeta(env, `ech_check_${hostname}`, { ...result, checkedAt: Date.now() });
      return json({ ok: true, hostname, result });
    }

    if (action === 'history' && method === 'GET') {
      return json({ ok: true, history: await listEndpointHealth(env, id, 50) });
    }

    if (!action && method === 'PATCH') {
      const updated = await updateEndpoint(env, id, await readBody(request));
      if (!updated) return fail(404, 'ENDPOINT_NOT_FOUND', 'Endpoint not found.');
      await addAuditLog(env, 'ویرایش اندپوینت', `${updated.name}`, normalizeClientIp(request));
      return json({ ok: true, endpoint: updated });
    }

    if (!action && method === 'DELETE') {
      const ok = await deleteEndpoint(env, id);
      if (!ok) return fail(404, 'ENDPOINT_NOT_FOUND', 'Endpoint not found.');
      await addAuditLog(env, 'حذف اندپوینت', id, normalizeClientIp(request));
      return json({ ok: true });
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown endpoints route.');
}

async function handleConfigurations(request, env, seg, method, cfg) {
  if (seg[1] === 'generate' && method === 'POST') {
    const body = await readBody(request);
    const users = await listUsers(env);
    const user = users.find(item => item.id === body.userId);
    if (!user) return fail(404, 'USER_NOT_FOUND', 'User not found.');
    const endpoints = (await listEndpoints(env)).filter(item => item.enabled);
    if (!endpoints.length) {
      return fail(409, 'NO_ENDPOINTS', 'No endpoints are available. Add or enable an endpoint first.');
    }
    const requestedFormats = Array.isArray(body.formats) && body.formats.length
      ? body.formats
      : String(cfg.subFormats || 'singbox,clash,uri').split(',');
    const result = buildPlans({
      user,
      endpoints,
      settings: cfg,
      formats: requestedFormats,
      limit: Math.min(60, Math.max(1, Number(body.limit) || 24))
    });
    if (!result.valid.length) {
      return json({
        ok: false,
        error: {
          code: 'NO_VALID_COMBINATION',
          message: 'No valid combination was found. Review the rejection reasons and endpoint permissions.',
          rejected: summarizeRejections(result.rejected),
          details: result.rejected.slice(0, 10)
        }
      }, 409);
    }
    const generatedAt = Date.now();
    const rows = result.valid.map((plan, index) => configurationRow(plan, user.id, generatedAt, index));
    await replaceUserConfigurations(env, user.id, rows);
    await addAuditLog(env, 'تولید کانفیگ', `${user.username} · ${rows.length} valid combinations`, normalizeClientIp(request));
    return json({
      ok: true,
      userId: user.id,
      policy: result.policy,
      formats: result.formats,
      generated: rows.length,
      rejected: summarizeRejections(result.rejected),
      plans: result.valid,
      stored: rows.map(row => ({ id: row.id, protocol: row.protocol, transport: row.transport, score: row.score }))
    });
  }

  if (seg[1] === 'validate' && method === 'POST') {
    const body = await readBody(request);
    const users = await listUsers(env);
    const user = users.find(item => item.id === body.userId);
    if (!user) return fail(404, 'USER_NOT_FOUND', 'User not found.');
    const candidate = body.candidate || {};
    const validation = validateCandidate(candidate, user, cfg);
    return json({ ok: true, validation });
  }

  if (method === 'GET') {
    const url = new URL(request.url);
    return json({
      ok: true,
      configurations: await listConfigurations(env, {
        userId: url.searchParams.get('userId') || undefined,
        limit: Math.min(200, Number(url.searchParams.get('limit')) || 50)
      })
    });
  }

  return fail(404, 'NOT_FOUND', 'Unknown configurations route.');
}

async function handleSubscriptions(request, env, seg, method, cfg) {
  const users = await listUsers(env);
  if (seg.length === 1 && method === 'GET') {
    const subs = await listSubscriptions(env);
    const byUser = new Map(subs.map(sub => [sub.userId, sub]));
    return json({
      ok: true,
      formats: OUTPUT_FORMATS.map(item => ({ id: item.id, label: item.label })),
      subscriptions: users.map(user => {
        const sub = byUser.get(user.id) || null;
        return {
          userId: user.id,
          username: user.username,
          enabled: user.enabled,
          token: sub?.token || null,
          revoked: sub?.revoked ?? null,
          formats: sub?.formats || [],
          downloads: sub?.downloads || 0,
          lastAccessAt: sub?.lastAccessAt || 0,
          urls: sub ? {
            base: buildSubscriptionUrl(request, sub.token),
            singbox: buildSubscriptionUrl(request, sub.token, 'singbox'),
            clash: buildSubscriptionUrl(request, sub.token, 'clash'),
            uri: buildSubscriptionUrl(request, sub.token, 'raw')
          } : null
        };
      })
    });
  }

  if (seg.length >= 3 && method === 'POST') {
    const userId = decodeURIComponent(seg[1]);
    const action = seg[2];
    const user = users.find(item => item.id === userId);
    if (!user) return fail(404, 'USER_NOT_FOUND', 'User not found.');
    await ensureSubscription(env, user.id, cfg.subFormats);
    if (action === 'rotate') {
      const sub = await rotateSubscription(env, user.id, cfg.subFormats);
      await addAuditLog(env, 'چرخش اشتراک', user.username, normalizeClientIp(request));
      return json({ ok: true, subscription: sub, urls: { base: buildSubscriptionUrl(request, sub.token) } });
    }
    if (action === 'revoke' || action === 'revoke-sub') {
      const sub = await setSubscriptionRevoked(env, user.id, true);
      await addAuditLog(env, 'لغو اشتراک', user.username, normalizeClientIp(request));
      return json({ ok: true, subscription: sub });
    }
    if (action === 'enable') {
      const sub = await setSubscriptionRevoked(env, user.id, false);
      return json({ ok: true, subscription: sub });
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown subscriptions route.');
}

async function handleScanner(request, env, seg, method, cfg) {
  if (seg[1] === 'scan' && method === 'POST') {
    const body = await readBody(request);
    const rawTargets = Array.isArray(body.targets) ? body.targets : (body.host ? [body] : []);
    if (!rawTargets.length) return fail(400, 'NO_TARGETS', 'Provide at least one target.');
    const targets = rawTargets.slice(0, 10).map(item => ({
      host: normalizeNodeHost(item.host),
      port: parseInt(item.port, 10) || 443,
      levels: Array.isArray(item.levels) ? item.levels : body.levels,
      endpointId: item.endpointId
    }));
    const result = await scanTargets(targets, {
      concurrency: Math.min(8, Math.max(1, Number(cfg.scannerConcurrency) || 4)),
      timeoutMs: 4500
    });
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const check = result.results[i];
      if (target.endpointId && check) await recordEndpointHealth(env, target.endpointId, check);
    }
    await addAuditLog(env, 'اجرای اسکنر', `${targets.length} target(s)`, normalizeClientIp(request));
    return json({ ok: true, ...result, targets });
  }

  if (seg[1] === 'history' && method === 'GET') {
    const url = new URL(request.url);
    const endpoints = await listEndpoints(env);
    const selected = url.searchParams.get('endpointId') || endpoints[0]?.id;
    if (!selected) return json({ ok: true, history: [] });
    return json({ ok: true, endpointId: selected, history: await listEndpointHealth(env, selected, 50) });
  }

  return fail(404, 'NOT_FOUND', 'Unknown scanner route.');
}

async function handleDns(request, env, seg, method) {
  const cfg = await loadGlobalConfig(env);
  if (method === 'GET') {
    const checks = {};
    for (const profile of DNS_PROFILES) {
      const record = await getMeta(env, `dns_check_${profile.id}`);
      if (record) checks[profile.id] = record;
    }
    const echChecks = {};
    for (const entry of ECH_ENTRIES) {
      const record = await getMeta(env, `ech_check_${entry.host}`);
      if (record) echChecks[entry.host] = record;
    }
    return json({
      ok: true,
      catalogVersion: CATALOG_VERSION,
      configured: {
        customDNS: cfg.customDNS || '',
        dnsMode: cfg.dnsMode || 'remote',
        ech: cfg.ech === 'yes',
        echDomain: cfg.customECHDomain || '',
        fingerprint: cfg.fp || 'chrome'
      },
      profiles: DNS_PROFILES,
      modes: DNS_MODES,
      fingerprints: TLS_FINGERPRINTS,
      echEntries: ECH_ENTRIES,
      checks,
      echChecks
    });
  }

  if (seg[1] === 'ech-test' && method === 'POST') {
    const body = await readBody(request);
    const hostname = String(body.hostname || '').trim();
    if (!hostname) return fail(400, 'HOST_REQUIRED', 'Hostname is required.');
    const result = await checkEchRecord(hostname);
    await setMeta(env, `ech_check_${hostname}`, { ...result, checkedAt: Date.now() });
    return json({ ok: true, hostname, result });
  }

  if (seg[1] === 'test' && method === 'POST') {
    const body = await readBody(request);
    const profile = getDnsProfile(body.profileId);
    if (!profile) return fail(404, 'DNS_PROFILE_NOT_FOUND', 'Unknown DNS profile.');
    if (!profile.doh) {
      return fail(400, 'DNS_NO_DOH', 'This profile has no DoH endpoint (NextDNS requires a personal ID).');
    }
    const started = Date.now();
    try {
      const res = await fetch(`${profile.doh}?name=example.com&type=A`, {
        headers: { Accept: 'application/dns-json', 'User-Agent': 'miliconfigos-dnscheck/4.0' }
      });
      const payload = await res.json().catch(() => ({}));
      const answers = Array.isArray(payload.Answer) ? payload.Answer : [];
      const record = {
        ok: res.ok && answers.length > 0,
        status: res.status,
        latencyMs: Date.now() - started,
        answers: answers.slice(0, 3).map(item => item.data),
        checkedAt: Date.now()
      };
      await setMeta(env, `dns_check_${profile.id}`, record);
      return json({ ok: true, profileId: profile.id, record });
    } catch (err) {
      const record = { ok: false, error: String(err?.message || err).slice(0, 160), checkedAt: Date.now() };
      await setMeta(env, `dns_check_${profile.id}`, record);
      return json({ ok: true, profileId: profile.id, record }, 200);
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown DNS route.');
}

async function handleSettings(request, env, seg, method) {
  const stored = await loadGlobalConfig(env);
  const values = sanitizeSettingsForClient({ ...defaultSettings(), ...CONFIG_DEFAULTS, ...stored });

  if (method === 'GET') {
    const conflicts = detectConflicts({ ...CONFIG_DEFAULTS, ...values });
    return json({
      ok: true,
      sections: SETTINGS_SECTIONS,
      schema: SETTINGS_SCHEMA,
      values,
      conflicts,
      storage: {
        mode: isMemoryMode() ? 'memory' : 'd1',
        memory: isMemoryMode()
      }
    });
  }

  if (seg[1] === 'reset' && method === 'POST') {
    const reset = await resetGlobalConfig(env);
    await addAuditLog(env, 'بازنشانی تنظیمات', 'All settings reset to defaults', normalizeClientIp(request));
    return json({
      ok: true,
      values: sanitizeSettingsForClient(reset),
      conflicts: detectConflicts({ ...CONFIG_DEFAULTS, ...reset })
    });
  }

  if (method === 'PUT' || method === 'PATCH') {
    const body = await readBody(request);
    const validation = validateSettings(body.settings || body, values);
    if (validation.errors.length) {
      return json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Settings were not saved.', details: validation.errors } }, 400);
    }
    const saved = await saveGlobalConfig(env, validation.values);
    await addAuditLog(
      env,
      'ذخیره تنظیمات',
      Object.keys(validation.values).join(', ').slice(0, 300),
      normalizeClientIp(request)
    );
    return json({
      ok: true,
      values: sanitizeSettingsForClient(saved),
      warnings: validation.warnings,
      conflicts: detectConflicts({ ...CONFIG_DEFAULTS, ...saved })
    });
  }

  return fail(404, 'NOT_FOUND', 'Unknown settings route.');
}

async function handleUsage(request, env, seg) {
  const url = new URL(request.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 30));
  const users = await listUsers(env);
  const userId = url.searchParams.get('userId');

  if (userId) {
    const user = users.find(item => item.id === userId);
    if (!user) return fail(404, 'USER_NOT_FOUND', 'User not found.');
    const rows = await usageForUser(env, userId, days);
    const sub = await getSubscription(env, userId);
    return json({
      ok: true,
      userId,
      username: user.username,
      days,
      series: rows,
      totals: {
        usedBytes: user.usedBytes,
        lifetimeBytes: user.lifetimeBytes,
        requestCount: user.requestCount,
        quotaBytes: user.dataLimitGb > 0 ? Math.floor(user.dataLimitGb * 1073741824) : 0
      },
      subscriptionDownloads: sub?.downloads || 0,
      sources: {
        traffic: 'worker-stream (measured at the proxy tunnel)',
        subscriptionDownloads: 'subscription fetch counter (not traffic)'
      }
    });
  }

  const series = await usageTotals(env, days);
  return json({
    ok: true,
    days,
    series,
    perUser: users.map(user => ({
      userId: user.id,
      username: user.username,
      usedBytes: user.usedBytes,
      lifetimeBytes: user.lifetimeBytes,
      quotaBytes: user.dataLimitGb > 0 ? Math.floor(user.dataLimitGb * 1073741824) : 0,
      requestCount: user.requestCount,
      source: 'worker-stream'
    })),
    totals: {
      usedBytes: users.reduce((sum, user) => sum + (user.usedBytes || 0), 0),
      lifetimeBytes: users.reduce((sum, user) => sum + (user.lifetimeBytes || 0), 0),
      requests: users.reduce((sum, user) => sum + (user.requestCount || 0), 0)
    },
    measurement: {
      trafficSource: 'worker-stream',
      accuracy: 'exact bytes observed while piping proxied streams',
      note: 'Bytes are counted only for traffic proxied by this Worker. Direct visits to the panel are not counted.'
    }
  });
}

async function handleAudit(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 50));
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
  return json({
    ok: true,
    logs: await listAuditLogsPaged(env, { limit, offset }),
    loginAttempts: await (await import('../db/v4.js')).recentLoginAttempts(env, 20),
    sessions: await listActiveSessions(env)
  });
}

async function handleAutomation(request, env, seg, method) {
  if (seg.length === 1 && method === 'GET') {
    const jobs = await listAutomationJobs(env);
    const runs = {};
    for (const job of jobs) runs[job.id] = await listAutomationRuns(env, job.id, 5);
    return json({ ok: true, jobs, runs });
  }

  if (seg.length >= 2) {
    const id = decodeURIComponent(seg[1]);
    const job = await getAutomationJob(env, id);
    if (!job) return fail(404, 'JOB_NOT_FOUND', 'Automation job not found.');

    if (method === 'PATCH') {
      const body = await readBody(request);
      const updated = await setAutomationJobEnabled(env, id, body.enabled !== false);
      await addAuditLog(env, 'تنظیم اتوماسیون', `${job.name} · enabled=${updated.enabled}`, normalizeClientIp(request));
      return json({ ok: true, job: updated });
    }

    if (seg[2] === 'run' && method === 'POST') {
      const cfg = await loadGlobalConfig(env);
      const result = await runAutomationJob(env, job, cfg, normalizeClientIp(request));
      if (!result.ok) return fail(500, 'JOB_FAILED', result.error || 'Automation job failed.');
      return json({ ok: true, job: await getAutomationJob(env, id), detail: result.detail, durationMs: result.durationMs });
    }
  }

  return fail(404, 'NOT_FOUND', 'Unknown automation route.');
}

async function cfRequest(token, path) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'miliconfigos/4.0'
    }
  });
  let payload = null;
  try { payload = await res.json(); } catch (_e) {}
  return { status: res.status, ok: res.ok, payload };
}

async function handleCloudflare(request, env, seg, method) {
  if (seg.length === 1 && method === 'GET') {
    const status = await cloudflareStatus(env);
    return json({
      ok: true,
      status,
      resources: await listCloudflareResources(env),
      permissions: {
        required: [
          'User → API Tokens → Read (token verification)',
          'Account → Workers Scripts → Read (deployment status)'
        ],
        optional: [
          'Account → Workers Scripts → Edit (only if you deploy from this panel)',
          'Zone → Zone → Read (zone selection)',
          'Zone → DNS → Read (DNS record inspection)'
        ],
        note: 'No token value is ever returned to the browser. Prefer a scoped token over a Global API Key.'
      },
      encryption: {
        keyConfigured: status.encryptionKeyConfigured,
        storage: status.encryption,
        warning: status.encryptionKeyConfigured
          ? ''
          : 'MILI_ENCRYPTION_KEY is not set, so the token is only base64-encoded in D1. Set the secret to enable AES-GCM encryption.'
      }
    });
  }

  if (seg[1] === 'token' && (method === 'PUT' || method === 'POST')) {
    const body = await readBody(request);
    const token = String(body.token || '').trim();
    if (token.length < 20 || /\s/.test(token)) {
      return fail(400, 'TOKEN_INVALID', 'Paste a Cloudflare API token (no spaces).');
    }
    const verification = await cfRequest(token, '/user/tokens/verify');
    if (!verification.ok || verification.payload?.result?.status !== 'active') {
      return fail(400, 'TOKEN_REJECTED', 'Cloudflare rejected the token.', verification.payload?.errors || null);
    }
    const accounts = await cfRequest(token, '/accounts?per_page=5');
    const accountList = Array.isArray(accounts.payload?.result) ? accounts.payload.result : [];
    const accountId = String(body.accountId || accountList[0]?.id || '');
    const stored = await saveCloudflareToken(env, token, { accountId });
    for (const account of accountList) {
      await saveCloudflareResource(env, {
        id: `cf-account-${account.id}`,
        kind: 'account',
        accountId: account.id,
        name: account.name,
        status: 'active',
        detail: 'Visible to the supplied token'
      });
    }
    await addAuditLog(env, 'اتصال کلادفلر', `Token verified · ${accountList.length} account(s) visible`, normalizeClientIp(request));
    return json({
      ok: true,
      encryption: stored.mode,
      accounts: accountList.map(account => ({ id: account.id, name: account.name })),
      accountId
    });
  }

  if (seg[1] === 'token' && method === 'DELETE') {
    await clearCloudflareToken(env);
    await addAuditLog(env, 'قطع اتصال کلادفلر', 'Stored token removed', normalizeClientIp(request));
    return json({ ok: true });
  }

  if (seg[1] === 'test' && method === 'POST') {
    const { token, error } = await getCloudflareToken(env);
    if (!token) {
      return fail(400, 'NO_TOKEN', error || 'No Cloudflare token is stored.');
    }
    const verification = await cfRequest(token, '/user/tokens/verify');
    const accounts = await cfRequest(token, '/accounts?per_page=5');
    const active = verification.ok && verification.payload?.result?.status === 'active';
    return json({
      ok: active,
      verifiedAt: Date.now(),
      tokenStatus: verification.payload?.result?.status || 'unknown',
      accounts: Array.isArray(accounts.payload?.result) ? accounts.payload.result.map(a => ({ id: a.id, name: a.name })) : [],
      errors: verification.payload?.errors || []
    });
  }

  if (seg[1] === 'workers' && method === 'POST') {
    const body = await readBody(request);
    const { token } = await getCloudflareToken(env);
    if (!token) return fail(400, 'NO_TOKEN', 'No Cloudflare token is stored.');
    const status = await cloudflareStatus(env);
    const accountId = String(body.accountId || status.accountId || '');
    if (!accountId) return fail(400, 'ACCOUNT_REQUIRED', 'An account ID is required to list Worker scripts.');
    const res = await cfRequest(token, `/accounts/${encodeURIComponent(accountId)}/workers/scripts`);
    if (!res.ok) return fail(502, 'CF_API_ERROR', 'Cloudflare returned an error.', res.payload?.errors || null);
    const scripts = Array.isArray(res.payload?.result) ? res.payload.result : [];
    const match = body.scriptName
      ? scripts.find(script => script.id === body.scriptName)
      : scripts.find(script => /miliconfig/i.test(script.id));
    return json({
      ok: true,
      accountId,
      scripts: scripts.map(script => ({ id: script.id, modifiedOn: script.modified_on, createdOn: script.created_on })),
      deployment: match
        ? { found: true, script: match.id, modifiedOn: match.modified_on, verifiedAt: Date.now() }
        : { found: false, note: 'No matching Worker script was found. A subscription link is not proof of deployment.' }
    });
  }

  return fail(404, 'NOT_FOUND', 'Unknown Cloudflare route.');
}

async function handleOverview(request, env) {
  const [users, endpoints, subscriptions, configs, jobs, diag, series, logs, cfg] = await Promise.all([
    listUsers(env),
    listEndpoints(env),
    listSubscriptions(env),
    listConfigurations(env, { limit: 200 }),
    listAutomationJobs(env),
    getStorageDiagnostics(env),
    usageTotals(env, 14),
    listAuditLogsPaged(env, { limit: 8 }),
    loadGlobalConfig(env)
  ]);

  const now = Date.now();
  const activeUsers = users.filter(user => user.enabled);
  const healthyEndpoints = endpoints.filter(item => item.enabled && item.lastCheckAt > 0 && item.healthScore >= 60);
  const failingEndpoints = endpoints.filter(item => item.failureCount > 0 || (item.lastCheckAt > 0 && item.healthScore < 40));
  const uncheckedEndpoints = endpoints.filter(item => !item.lastCheckAt);
  const subsByUser = new Map(subscriptions.map(sub => [sub.userId, sub]));
  const activeSubscriptions = users.filter(user => {
    const sub = subsByUser.get(user.id);
    return user.enabled && sub && !sub.revoked;
  });
  const measuredBytes = users.reduce((sum, user) => sum + (user.usedBytes || 0), 0);
  const recentCheck = endpoints.reduce((max, item) => Math.max(max, item.lastCheckAt || 0), 0);
  const expiredUsers = users.filter(user => user.expireAt > 0 && user.expireAt < now);
  const quotaUsers = users.filter(user => user.dataLimitGb > 0 && user.usedBytes >= user.dataLimitGb * 1073741824);

  return json({
    ok: true,
    generatedAt: new Date().toISOString(),
    brand: { name: 'MiliconfigOS', developer: 'Milad Jahani', version: VERSION },
    users: {
      total: users.length,
      active: activeUsers.length,
      disabled: users.length - activeUsers.length,
      capacity: MAX_USERS_LIMIT,
      available: Math.max(0, MAX_USERS_LIMIT - users.length),
      expired: expiredUsers.length,
      quotaReached: quotaUsers.length
    },
    subscriptions: {
      active: activeSubscriptions.length,
      total: subscriptions.length,
      downloads: subscriptions.reduce((sum, sub) => sum + (sub.downloads || 0), 0),
      revoked: subscriptions.filter(sub => sub.revoked).length
    },
    traffic: {
      usedBytes: measuredBytes,
      source: 'worker-stream',
      accuracy: 'Measured byte counters from proxied streams; panel visits are excluded.',
      series
    },
    endpoints: {
      total: endpoints.length,
      enabled: endpoints.filter(item => item.enabled).length,
      healthy: healthyEndpoints.length,
      failing: failingEndpoints.length,
      unchecked: uncheckedEndpoints.length,
      failingList: failingEndpoints.map(item => ({ id: item.id, name: item.name, failures: item.failureCount, score: item.healthScore })),
      lastCheckAt: recentCheck
    },
    protocols: {
      vless: protocolEnabled(cfg, 'vless'),
      trojan: protocolEnabled(cfg, 'trojan'),
      xhttp: protocolEnabled(cfg, 'xhttp'),
      shadowsocks: protocolEnabled(cfg, 'shadowsocks'),
      tls: true,
      ech: String(cfg.ech) === 'yes',
      reality: false
    },
    configurations: {
      generated: configs.length,
      valid: configs.filter(row => row.valid).length,
      lastGeneratedAt: configs[0]?.createdAt || 0
    },
    automation: {
      enabledJobs: jobs.filter(job => job.enabled).length,
      totalJobs: jobs.length,
      lastRunAt: jobs.reduce((max, job) => Math.max(max, job.lastRunAt || 0), 0),
      failures: jobs.filter(job => job.lastStatus === 'failed').map(job => ({ id: job.id, name: job.name, error: job.lastError }))
    },
    storage: {
      d1Enabled: diag.d1Enabled,
      binding: diag.d1BindingName,
      migrated: diag.d1Migrated,
      memoryMode: isMemoryMode(),
      hasPassword: diag.hasPassword,
      error: diag.d1Error || null
    },
    dataPlane: {
      runtime: 'Cloudflare Worker',
      proxyRuntime: true,
      measuredTraffic: true,
      note: 'Config generation and the Worker data plane are separate capabilities. Endpoint health is measured per check level.'
    },
    recentLogs: logs,
    availableUsers: Math.max(0, MAX_USERS_LIMIT - users.length)
  });
}

async function handleBootstrap(request, env) {
  const [cfg, users, initialized, storage] = await Promise.all([
    loadGlobalConfig(env),
    listUsers(env),
    hasAdminPassword(env),
    ensureV4Schema(env)
  ]);
  return json({
    ok: true,
    initialized,
    storage,
    auth: { adminPath: await getOrCreateAdminPath(env) },
    settings: sanitizeSettingsForClient({ ...defaultSettings(), ...CONFIG_DEFAULTS, ...cfg }),
    users: users.map(user => sanitizeUser(user, null)),
    maxUsers: MAX_USERS_LIMIT,
    version: VERSION
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

async function handleV1Api(request, env) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const seg = url.pathname.replace(/^\/api\/v1\/?/, '').split('/').filter(Boolean);
  const relative = seg.join('/');

  try {
    if (relative === 'health' && method === 'GET') {
      const diag = await getStorageDiagnostics(env);
      return json({
        ok: true,
        version: VERSION,
        apiVersion: API_VERSION,
        time: new Date().toISOString(),
        storage: diag.d1Enabled ? 'd1' : (isMemoryMode() ? 'memory' : 'kv'),
        initialized: diag.hasPassword
      });
    }

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          Allow: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          ...securityHeaders()
        }
      });
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !mutatingAllowed(request)) {
      return fail(403, 'ORIGIN_REJECTED', 'Cross-origin request rejected.');
    }

    if (seg[0] === 'auth') {
      return await handleAuth(request, env, seg, method);
    }

    const session = await authenticate(request, env);
    if (!session.ok) {
      return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.');
    }

    if (relative === 'bootstrap' && method === 'GET') return await handleBootstrap(request, env);
    if (relative === 'admin/overview' && method === 'GET') return await handleOverview(request, env);
    if (seg[0] === 'users') return await handleUsers(request, env, seg, method);
    if (seg[0] === 'endpoints') return await handleEndpoints(request, env, seg, method, await loadGlobalConfig(env));
    if (seg[0] === 'configurations') return await handleConfigurations(request, env, seg, method, await loadGlobalConfig(env));
    if (seg[0] === 'subscriptions') return await handleSubscriptions(request, env, seg, method, await loadGlobalConfig(env));
    if (seg[0] === 'scanner') return await handleScanner(request, env, seg, method, await loadGlobalConfig(env));
    if (seg[0] === 'dns') return await handleDns(request, env, seg, method);
    if (seg[0] === 'settings') return await handleSettings(request, env, seg, method);
    if (seg[0] === 'usage' && method === 'GET') return await handleUsage(request, env, seg);
    if (seg[0] === 'audit' && method === 'GET') return await handleAudit(request, env);
    if (seg[0] === 'automation') return await handleAutomation(request, env, seg, method);
    if (seg[0] === 'cloudflare') return await handleCloudflare(request, env, seg, method);
    if (seg[0] === 'capabilities' && method === 'GET') {
      return json({ ok: true, catalogVersion: CATALOG_VERSION, ...capabilityMatrix() });
    }
    if (relative === 'conflicts' && method === 'GET') {
      const cfg = await loadGlobalConfig(env);
      return json({
        ok: true,
        conflicts: detectConflicts({ ...CONFIG_DEFAULTS, ...cfg }),
        defaults: sanitizeSettingsForClient(effectiveSettings(CONFIG_DEFAULTS))
      });
    }

    return fail(404, 'NOT_FOUND', 'Unknown API route.');
  } catch (err) {
    const status = Number(err?.status) || 500;
    if (status >= 500) {
      console.error(JSON.stringify({
        level: 'error',
        scope: 'api/v1',
        path: url.pathname,
        message: String(err?.message || err)
      }));
    }
    return fail(status, status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST', status === 500 ? 'Unexpected server error.' : String(err?.message || err));
  }
}

const API_EXPORTS = {
  API_VERSION,
  buildSubscriptionUrl,
  sanitizeUser
};


// --- MODULE: src/ui/loginHtml.js ---
// ============================================================================
// miliconfigOS v4.0 - Admin gateway
// The configured homepage is shown first, then blurred while the login window
// fades in. A persistent "skip" control keeps the 3-second sequence from
// trapping anyone, and reduced-motion preferences skip the transition.
// ============================================================================


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

function renderLoginGatewayHtml(options = {}) {
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


// --- MODULE: src/ui/statusHtml.js ---
// ============================================================================
// miliconfig v3.1 - صفحه وضعیت و اشتراک اختصاصی کاربر (ارسالی به کاربر)
// طراحی ۱۰۰٪ مطابق تصاویر 1000050224.jpg و 1000050225.jpg با برند miliconfig
// ============================================================================


function renderUserStatusPageHtml(user, nodes = [], originUrl = '') {
  const urlObj = new URL(originUrl || 'https://miliconfig.workers.dev');
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
  // همیشه از مسیر استاندارد /sub/{uuid} استفاده می‌شود تا لینک‌ها دقیقاً
  // به ساب‌لینک همین کاربر متصل باشند (نه مسیر شخصی/ادمین).
  const apiToken = user.id || user.uuid || '';
  const subToken = user.uuid || user.id || '';
  const baseSubUrl = `${baseUrl}/sub/${encodeURIComponent(subToken)}`;
  const usageApiUrl = `${baseUrl}/api/status/${encodeURIComponent(apiToken)}`;
  const statusUrl = `${baseUrl}/status/${encodeURIComponent(apiToken)}`;
  const totalNodes = nodes.length;

  const usedBytes = Number(user.usedBytes || 0);
  const lifetimeBytes = Number(user.lifetimeBytes || 0);
  const limitGb = Number(user.dataLimitGb || 0);
  const limitBytes = limitGb > 0 ? limitGb * 1073741824 : 0;
  const usagePercent = limitBytes > 0 ? Math.min(100, Math.round((usedBytes / limitBytes) * 100)) : 0;

  let expireLabel = 'بدون انقضا';
  if (user.expireAt > 0) {
    const diffDays = Math.ceil((user.expireAt - Date.now()) / 86400000);
    expireLabel = diffDays > 0 ? `${diffDays} روز باقی‌مانده` : 'منقضی شده';
  } else if (user.startOnFirstUse && user.expireDays > 0) {
    expireLabel = `${user.expireDays} روز (شروع با اولین اتصال)`;
  }

  // لوکیشن‌های واقعی اسکنر: هر کشور لینک ساب‌لینک کشوری خودش را می‌گیرد
  const locationsList = Object.keys(COUNTRY_PROXY_SOURCES).map(code => ({
    code,
    title: COUNTRY_PROXY_SOURCES[code].name || code,
    url: `${baseSubUrl}?country=${code}`
  }));
  locationsList.unshift({ code: 'MULTI', title: 'چند کشور (MULTI)', url: `${baseSubUrl}?country=MULTI` });


  const protoCombos = [
    { title: 'اتصال هوشمند (همه نودها × همه پروتکل‌ها)', badge: 'Base64', url: baseSubUrl },
    { title: 'فقط پروتکل VLESS (WebSocket + TLS)', badge: 'VLESS', url: `${baseSubUrl}?proto=vless` },
    { title: 'فقط پروتکل Trojan (WebSocket + TLS)', badge: 'Trojan', url: `${baseSubUrl}?proto=trojan` },
    { title: 'فقط پروتکل Shadowsocks (بدون فرگمنت)', badge: 'SS', url: `${baseSubUrl}?proto=ss` },
    { title: 'فقط پروتکل xhttp (ضد فیلتر پیشرفته)', badge: 'xhttp', url: `${baseSubUrl}?proto=xhttp` },
    { title: 'فقط نودهای لبه CDN (Multi-Location)', badge: 'Edge', url: `${baseSubUrl}?scope=edge` },
    { title: 'فقط سرور اصلی (بدون CDN)', badge: 'Origin', url: `${baseSubUrl}?scope=origin` },
    { title: 'کانفیگ اختصاصی Clash Meta / Mihomo', badge: 'YAML', url: `${baseSubUrl}?target=clash` },
    { title: 'کانفیگ اختصاصی Sing-box / Hiddify', badge: 'JSON', url: `${baseSubUrl}?target=singbox` },
    { title: 'کانفیگ اختصاصی Surge', badge: 'INI', url: `${baseSubUrl}?target=surge` },
    { title: 'کانفیگ اختصاصی Quantumult X', badge: 'QuanX', url: `${baseSubUrl}?target=quanx` },
    { title: 'کانفیگ اختصاصی Loon', badge: 'Loon', url: `${baseSubUrl}?target=loon` },
    { title: 'متن خام لینک‌ها (Raw Plaintext)', badge: 'RAW', url: `${baseSubUrl}?target=raw` }
  ];

  const safeNodesJson = JSON.stringify(nodes).replace(/</g, '\\u003c');

  return stripEmoji(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>وضعیت اشتراک ${user.username} — ${BRAND_UPPER}</title>
  <link rel="icon" href="${FAVICON_DATA_URI}">
  <style>
    .mi { width: 16px; height: 16px; display: inline-block; vertical-align: -3px; }
    :root {
      --bg-0: #070d07;
      --bg-1: #0c160c;
      --card: rgba(15, 26, 15, 0.90);
      --card-inner: rgba(9, 16, 9, 0.92);
      --border: rgba(163, 230, 53, 0.18);
      --border-hi: rgba(181, 255, 77, 0.48);
      --neon: #b5ff4d;
      --neon-dim: rgba(181, 255, 77, 0.14);
      --text: #f3f8f1;
      --muted: #93a88a;
      --danger: #f87171;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Vazirmatn", Tahoma, sans-serif;
      background:
        radial-gradient(circle at 20% 0%, rgba(132, 204, 22, 0.18) 0%, transparent 48%),
        radial-gradient(circle at 85% 90%, rgba(101, 163, 13, 0.14) 0%, transparent 45%),
        var(--bg-0);
      color: var(--text);
      padding: 18px 14px 90px;
      line-height: 1.6;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(163, 230, 53, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(163, 230, 53, 0.04) 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
      z-index: 0;
    }
    .container {
      position: relative;
      z-index: 1;
      max-width: 680px;
      margin: 0 auto;
    }
    .status-hero {
      background: var(--card);
      border: 1px solid var(--border-hi);
      border-radius: 22px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 16px 44px rgba(0, 0, 0, 0.6);
    }
    .hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .hero-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .hero-logo {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }
    .hero-logo svg { width: 100%; height: 100%; }
    .hero-name {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text);
    }
    .hero-brand {
      font-size: 0.76rem;
      color: var(--neon);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      background: var(--neon-dim);
      border: 1px solid var(--border-hi);
      color: var(--neon);
    }
    .pill-off {
      background: rgba(248, 113, 113, 0.14);
      border-color: rgba(248, 113, 113, 0.4);
      color: var(--danger);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    @media (min-width: 520px) {
      .stats-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .stat-box {
      background: var(--card-inner);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 11px 12px;
    }
    .stat-label {
      font-size: 0.75rem;
      color: var(--muted);
      margin-bottom: 4px;
    }
    .stat-val {
      font-size: 0.96rem;
      font-weight: 800;
      color: var(--text);
    }
    .usage-track {
      height: 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border);
      overflow: hidden;
      margin: 2px 0 8px;
    }
    .usage-track i {
      display: block;
      height: 100%;
      min-width: 2px;
      background: linear-gradient(90deg, #a3e635, #b5ff4d);
      transition: width 0.5s ease;
    }
    .usage-meta {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.76rem;
      color: var(--muted);
      margin-bottom: 14px;
    }
    .url-copy-box {
      background: #060b06;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 10px;
    }
    .url-text {
      font-family: "JetBrains Mono", monospace;
      font-size: 0.8rem;
      color: #d7e8cf;
      direction: ltr;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .copy-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 12px;
      padding: 9px 16px;
      cursor: pointer;
      font-size: 0.84rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.18s;
      flex-shrink: 0;
    }
    .copy-btn:hover {
      border-color: var(--neon);
      color: var(--neon);
      background: var(--neon-dim);
    }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 22px 4px 10px;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text);
    }
    .section-head .sub-meta {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--muted);
    }
    .acc-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      margin-bottom: 12px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .acc-card.open {
      border-color: var(--border-hi);
    }
    .acc-header {
      width: 100%;
      background: transparent;
      border: none;
      color: var(--text);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      font-family: inherit;
      text-align: right;
    }
    .acc-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .acc-title {
      font-size: 0.96rem;
      font-weight: 800;
    }
    .acc-count {
      font-size: 0.78rem;
      color: var(--muted);
    }
    .acc-arrow {
      font-size: 0.9rem;
      color: var(--muted);
      transition: transform 0.22s;
    }
    .acc-card.open .acc-arrow {
      transform: rotate(180deg);
      color: var(--neon);
    }
    .acc-body {
      display: none;
      padding: 0 18px 18px;
      border-top: 1px solid rgba(163, 230, 53, 0.1);
    }
    .acc-card.open .acc-body {
      display: block;
    }
    .client-desc {
      font-size: 0.82rem;
      color: var(--muted);
      margin: 12px 0 14px;
      line-height: 1.65;
    }
    .client-item {
      padding: 14px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .client-item:first-of-type { border-top: none; }
    .client-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .client-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .client-name {
      font-size: 0.98rem;
      font-weight: 800;
      color: #fff;
    }
    .client-os {
      font-size: 0.76rem;
      color: var(--muted);
    }
    .tag-green {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--neon);
      background: rgba(163, 230, 53, 0.12);
      border: 1px solid rgba(163, 230, 53, 0.35);
    }
    .dl-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text);
      text-decoration: none;
      font-size: 0.78rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .dl-btn:hover {
      border-color: var(--neon);
      color: var(--neon);
    }
    .node-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: var(--card-inner);
      border: 1px solid var(--border);
      margin-top: 8px;
    }
    .node-tag {
      font-family: "JetBrains Mono", monospace;
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--neon);
      direction: ltr;
    }
    .node-proto {
      font-size: 0.74rem;
      color: var(--muted);
    }
    .fab-refresh {
      position: fixed;
      bottom: 22px;
      left: 22px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #060a06;
      border: 1px solid var(--border-hi);
      color: var(--text);
      font-size: 1.2rem;
      cursor: pointer;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      transition: all 0.2s;
    }
    .fab-refresh:hover {
      color: var(--neon);
      transform: rotate(90deg);
    }
    .toast {
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      background: #112211;
      border: 1px solid var(--neon);
      color: var(--neon);
      padding: 10px 20px;
      border-radius: 999px;
      font-size: 0.86rem;
      font-weight: 700;
      z-index: 100;
      display: none;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    }
  </style>
</head>
<body>
  <div id="toast" class="toast"></div>

  <div class="container">
    <!-- کارت اصلی وضعیت کاربر -->
    <div class="status-hero">
      <div class="hero-top">
        <div class="hero-user">
          <div class="hero-logo">${SHIELD_LOGO_SVG}</div>
          <div>
            <div class="hero-name">${user.username}</div>
            <div class="hero-brand">${BRAND_UPPER} SUBSCRIPTION PORTAL</div>
          </div>
        </div>
        <span class="pill ${user.enabled ? '' : 'pill-off'}" id="statusPill">
          ● ${user.enabled ? (user.startOnFirstUse && !user.firstConnectedAt ? 'شروع با اولین اتصال' : 'فعال و آنلاین') : 'غیرفعال'}
        </span>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">مصرف فعلی</div>
          <div class="stat-val" id="statUsed">${formatBytes(usedBytes)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">سهمیه حجم</div>
          <div class="stat-val" id="statLimit">${limitGb > 0 ? `${limitGb} GB (${usagePercent}%)` : '∞ نامحدود'}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">تعداد نود در ساب</div>
          <div class="stat-val" id="statNodes">${totalNodes} نود (${BRAND_NAME})</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">وضعیت انقضا</div>
          <div class="stat-val" id="statExpire">${expireLabel}</div>
        </div>
      </div>
      <div class="usage-track" title="مصرف واقعی ثبت‌شده در پنل">
        <i id="usageBar" style="width:${usagePercent}%"></i>
      </div>
      <div class="usage-meta">
        <span id="usageMeta">${limitGb > 0 ? `${formatBytes(usedBytes)} از ${limitGb} GB` : formatBytes(usedBytes) + ' مصرف‌شده'}</span>
        <span id="usageUpdated"></span>
      </div>

      <div style="font-size:0.8rem;color:var(--muted);margin-bottom:4px;">لینک مستقیم صفحه وضعیت و اشتراک شما:</div>
      <div class="url-copy-box">
        <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'لینک اشتراک هوشمند کپی شد')">${icon('copy')} کپی ساب‌لینک</button>
        <div class="url-text">${baseSubUrl}</div>
      </div>
    </div>

    <!-- محدوده نودها -->
    <div class="section-head">
      <span>${icon('globe')} محدودهٔ نودها</span>
      <span class="sub-meta">همه نودها (${totalNodes} نود با فرمت number+${BRAND_NAME})</span>
    </div>
    <div class="acc-card" id="accScope">
      <button type="button" class="acc-header" onclick="toggleAcc('accScope')">
        <div class="acc-title-wrap">
          <span class="acc-title">فقط بخشی از نودها را می‌خواهید؟</span>
          <span class="acc-count">4 گزینه · ${totalNodes} نود در کل</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        <p class="client-desc">می‌توانید تعداد نودهای خروجی یا محدوده نودها را در لینک اشتراک خود فیلتر کنید:</p>
        <div class="client-item">
          <div class="client-top">
            <span class="client-name">همه نودهای کاربر (${totalNodes} نود)</span>
            <span class="tag-green">پیش‌فرض کاربر</span>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}</div>
          </div>
        </div>
        <div class="client-item">
          <div class="client-top">
            <span class="client-name">۱۰ نود اول (1+${BRAND_NAME} تا 10+${BRAND_NAME})</span>
            <span class="tag-green">سبک و سریع</span>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?limit=10', 'کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?limit=10</div>
          </div>
        </div>
        <div class="client-item">
          <div class="client-top">
            <span class="client-name">فقط نودهای لبه CDN</span>
            <span class="tag-green">Multi-Location</span>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?scope=edge', 'کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?scope=edge</div>
          </div>
        </div>
        <div class="client-item">
          <div class="client-top">
            <span class="client-name">فقط سرور اصلی (بدون CDN)</span>
            <span class="tag-green">Direct Origin</span>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?scope=origin', 'کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?scope=origin</div>
          </div>
        </div>
      </div>
    </div>

    <!-- لوکیشن‌ها -->
    <div class="section-head">
      <span>${icon('globe')} لوکیشن‌ها</span>
      <span class="sub-meta">هر کشور یک سابلینک جدا</span>
    </div>
    <div class="acc-card" id="accLocations">
      <button type="button" class="acc-header" onclick="toggleAcc('accLocations')">
        <div class="acc-title-wrap">
          <span class="acc-title">سابلینک لوکیشن‌محور</span>
          <span class="acc-count">${locationsList.length} لوکیشن</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        <p class="client-desc">با استفاده از هر لینک، مسیر خروجی روی همان منطقه تنظیم می‌شود:</p>
        ${locationsList
          .map(
            loc => `
          <div class="client-item">
            <div class="client-top">
              <span class="client-name">${loc.title}</span>
              <span class="tag-green">${loc.code}</span>
            </div>
            <div class="url-copy-box">
              <button type="button" class="copy-btn" onclick="copyText('${loc.url}', 'لینک لوکیشن ${loc.code} کپی شد')">${icon('copy')}</button>
              <div class="url-text">${loc.url}</div>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </div>

    <!-- سابلینک اختصاصی هر کلاینت -->
    <div class="section-head">
      <span>${icon('shield')} سابلینک اختصاصی هر کلاینت</span>
      <span class="sub-meta">16 کلاینت در 5 خانواده</span>
    </div>

    <!-- شروع سریع -->
    <div class="acc-card open" id="accQuickStart">
      <button type="button" class="acc-header" onclick="toggleAcc('accQuickStart')">
        <div class="acc-title-wrap">
          <span class="acc-title">شروع سریع</span>
          <span class="acc-count">1 کلاینت</span>
          <span class="tag-green">پیشنهادی</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        <p class="client-desc">یک لینک برای همه‌چیز؛ سریع‌ترین نود بر اساس پینگ، مناسب هر کلاینتی.</p>
        <div class="client-top">
          <div class="client-name-row">
            <span class="client-name">اتصال هوشمند</span>
            <span class="client-os">همه پلتفرم‌ها</span>
          </div>
          <span class="tag-green">اتصال هوشمند (همه نودها × همه پروتکل‌ها)</span>
        </div>
        <div class="url-copy-box">
          <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'سابلینک هوشمند کپی شد')">${icon('copy')}</button>
          <div class="url-text">${baseSubUrl}</div>
        </div>
        <div style="font-size:0.78rem;color:var(--muted);margin-top:8px;">سریع‌ترین نود بر اساس پینگ واقعی؛ مناسب شروع سریع.</div>
      </div>
    </div>

    <!-- خانواده 1: Xray / Base64 -->
    <div class="acc-card open" id="accXray">
      <button type="button" class="acc-header" onclick="toggleAcc('accXray')">
        <div class="acc-title-wrap">
          <span class="acc-title">خانواده Xray / متن ساده — Base64</span>
          <span class="acc-count">7 کلاینت</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        <p class="client-desc">v2rayNG، Exclusive، Amnezia، Streisand، Shadowrocket، V2Box و FoXray سابلینک Base64 (یا متن ساده) می‌خوانند.</p>

        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">v2rayNG</span>
              <span class="client-os">Android</span>
              <span class="tag-green">Base64 (V2Ray)</span>
            </div>
            <a class="dl-btn" href="https://github.com/2dust/v2rayNG/releases" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'لینک v2rayNG کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}</div>
          </div>
          <div style="font-size:0.78rem;color:var(--muted);margin-top:6px;">پرکاربردترین کلاینت اندروید؛ فرگمنت، sni و vless را کامل پشتیبانی می‌کند.</div>
        </div>

        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">Exclusive</span>
              <span class="client-os">Android</span>
              <span class="tag-green">Base64 (V2Ray)</span>
            </div>
            <a class="dl-btn" href="https://github.com/GFW-knocker/MahsaNG/releases" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'لینک Exclusive کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}</div>
          </div>
          <div style="font-size:0.78rem;color:var(--muted);margin-top:6px;">کلاینت اندروید؛ از سابلینک استاندارد Base64 استفاده می‌کند.</div>
        </div>

        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">Amnezia VPN</span>
              <span class="client-os">Android · iOS · دسکتاپ</span>
              <span class="tag-green">Base64 (V2Ray)</span>
            </div>
            <a class="dl-btn" href="https://amnezia.org/en/downloads" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'لینک Amnezia کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}</div>
          </div>
        </div>

        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">Streisand</span>
              <span class="client-os">iOS · macOS</span>
              <span class="tag-green">Base64 (V2Ray)</span>
            </div>
            <a class="dl-btn" href="https://apps.apple.com/app/streisand/id6450534064" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'لینک Streisand کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}</div>
          </div>
        </div>

        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">Shadowrocket</span>
              <span class="client-os">iOS</span>
              <span class="tag-green">Base64 (V2Ray)</span>
            </div>
            <a class="dl-btn" href="https://apps.apple.com/app/shadowrocket/id932747118" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'لینک Shadowrocket کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}</div>
          </div>
        </div>

        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">V2Box</span>
              <span class="client-os">Android · iOS</span>
              <span class="tag-green">Base64 (V2Ray)</span>
            </div>
            <a class="dl-btn" href="https://apps.apple.com/app/v2box-v2ray-client/id6446814690" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'لینک V2Box کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}</div>
          </div>
        </div>

        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">v2rayN / Nekoray</span>
              <span class="client-os">Windows · Linux · macOS</span>
              <span class="tag-green">Base64 (V2Ray)</span>
            </div>
            <a class="dl-btn" href="https://github.com/2dust/v2rayN/releases" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}', 'لینک v2rayN کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- خانواده 2: sing-box — JSON -->
    <div class="acc-card" id="accSingbox">
      <button type="button" class="acc-header" onclick="toggleAcc('accSingbox')">
        <div class="acc-title-wrap">
          <span class="acc-title">خانواده sing-box — JSON</span>
          <span class="acc-count">5 کلاینت</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        <p class="client-desc">مناسب Hiddify، Sing-box (نسخه 1.12 به بالا)، Karing، NekoBox و Exclave:</p>
        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">Hiddify / Sing-box</span>
              <span class="client-os">همه پلتفرم‌ها</span>
              <span class="tag-green">JSON (Sing-box)</span>
            </div>
            <a class="dl-btn" href="https://github.com/hiddify/hiddify-app/releases" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?target=singbox', 'لینک Sing-box کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?target=singbox</div>
          </div>
        </div>
      </div>
    </div>

    <!-- خانواده 3: Clash / Mihomo — فقط YAML -->
    <div class="acc-card" id="accClash">
      <button type="button" class="acc-header" onclick="toggleAcc('accClash')">
        <div class="acc-title-wrap">
          <span class="acc-title">خانواده Clash / Mihomo — فقط YAML</span>
          <span class="acc-count">2 کلاینت</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        <p class="client-desc">مناسب Clash Meta for Android (CMFA)، Clash Verge Rev، FlClash و Stash:</p>
        <div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">Clash Meta / Verge / FlClash</span>
              <span class="client-os">Android · Windows · macOS</span>
              <span class="tag-green">YAML (Mihomo)</span>
            </div>
            <a class="dl-btn" href="https://github.com/MetaCubeX/ClashMetaForAndroid/releases" target="_blank" rel="noopener">${icon('download')} دانلود کلاینت</a>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?target=clash', 'لینک Clash کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?target=clash</div>
          </div>
        </div>
        ${
          user.config?.jk === 'yes'
            ? `<div class="client-item">
          <div class="client-top">
            <div class="client-name-row">
              <span class="client-name">CLASH زنجیره اینترنت خانگی</span>
              <span class="client-os">Mihomo 1.19.25+</span>
              <span class="tag-green">Residential IP</span>
            </div>
          </div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?target=vg', 'لینک CLASH خانگی کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?target=vg</div>
          </div>
        </div>`
            : ''
        }
      </div>
    </div>

    <!-- خانواده 4: هسته‌ها و ابزارها -->
    <div class="acc-card" id="accTools">
      <button type="button" class="acc-header" onclick="toggleAcc('accTools')">
        <div class="acc-title-wrap">
          <span class="acc-title">هسته‌ها و ابزارها (Surge / QuanX / Loon)</span>
          <span class="acc-count">3 کلاینت</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        <div class="client-item">
          <div class="client-top"><span class="client-name">Surge</span><span class="tag-green">INI</span></div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?target=surge', 'لینک Surge کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?target=surge</div>
          </div>
        </div>
        <div class="client-item">
          <div class="client-top"><span class="client-name">Quantumult X</span><span class="tag-green">QuanX</span></div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?target=quanx', 'لینک Quantumult X کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?target=quanx</div>
          </div>
        </div>
        <div class="client-item">
          <div class="client-top"><span class="client-name">Loon</span><span class="tag-green">Loon</span></div>
          <div class="url-copy-box">
            <button type="button" class="copy-btn" onclick="copyText('${baseSubUrl}?target=loon', 'لینک Loon کپی شد')">${icon('copy')}</button>
            <div class="url-text">${baseSubUrl}?target=loon</div>
          </div>
        </div>
      </div>
    </div>

    <!-- سابلینک به تفکیک پروتکل و ترنسپورت -->
    <div class="section-head">
      <span>${icon('link')} سابلینک به تفکیک پروتکل و ترنسپورت</span>
      <span class="sub-meta">${protoCombos.length} ترکیب</span>
    </div>
    <div class="acc-card" id="accCombos">
      <button type="button" class="acc-header" onclick="toggleAcc('accCombos')">
        <div class="acc-title-wrap">
          <span class="acc-title">لیست ترکیب‌های نود × پروتکل</span>
          <span class="acc-count">${protoCombos.length} لینک</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        ${protoCombos
          .map(
            c => `
          <div class="client-item">
            <div class="client-top">
              <span class="client-name">${c.title}</span>
              <span class="tag-green">${c.badge}</span>
            </div>
            <div class="url-copy-box">
              <button type="button" class="copy-btn" onclick="copyText('${c.url}', 'کپی شد')">${icon('copy')}</button>
              <div class="url-text">${c.url}</div>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </div>

    <!-- لیست تکی نودهای خروجی با فرمت number+miliconfig -->
    <div class="section-head">
      <span>${icon('bolt')} نودها</span>
      <span class="sub-meta">${totalNodes} از ${totalNodes} آنلاین · نام‌گذاری number+${BRAND_NAME}</span>
    </div>
    <div class="acc-card open" id="accNodes">
      <button type="button" class="acc-header" onclick="toggleAcc('accNodes')">
        <div class="acc-title-wrap">
          <span class="acc-title">لیست کانفیگ‌های خروجی (1+${BRAND_NAME} تا ${totalNodes}+${BRAND_NAME})</span>
          <span class="acc-count">${totalNodes} کانفیگ</span>
        </div>
        <span class="acc-arrow">⌄</span>
      </button>
      <div class="acc-body">
        <div style="margin:12px 0;">
          <button type="button" class="copy-btn" style="width:100%;justify-content:center;" onclick="copyAllNodes()">
            ${icon('copy')} کپی یکجای همه ${totalNodes} کانفیگ (1+${BRAND_NAME} تا ${totalNodes}+${BRAND_NAME})
          </button>
        </div>
        <div id="nodesContainer"></div>
      </div>
    </div>
  </div>

  <button type="button" class="fab-refresh" onclick="window.location.reload()" title="بروزرسانی وضعیت">${icon('refresh')}</button>

  <script>
    var ALL_NODES = ${safeNodesJson};

    function showToast(msg) {
      var t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.style.display = 'block';
      clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(function() {
        t.style.display = 'none';
      }, 2500);
    }

    function copyText(text, msg) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showToast(msg || 'کپی شد');
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(msg || 'کپی شد');
      }
    }

    function copyAllNodes() {
      copyText(ALL_NODES.join('\\n'), 'همه کانفیگ‌ها کپی شدند');
    }

    function toggleAcc(id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('open');
    }

    function renderNodes() {
      var container = document.getElementById('nodesContainer');
      if (!container) return;
      var html = '';
      for (var i = 0; i < ALL_NODES.length; i++) {
        var link = ALL_NODES[i];
        var hashIdx = link.indexOf('#');
        var name = hashIdx > -1 ? decodeURIComponent(link.substring(hashIdx + 1)) : ((i + 1) + '+${BRAND_NAME}');
        var proto = link.split('://')[0].toUpperCase();
        html += '<div class="node-row">' +
          '<div><div class="node-tag">' + name + '</div><div class="node-proto">' + proto + ' · Cloudflare Edge</div></div>' +
          '<button type="button" class="copy-btn" onclick="copyNodeByIndex(' + i + ')">${icon('copy')} کپی کانفیگ</button>' +
          '</div>';
      }
      container.innerHTML = html;
    }

    function copyNodeByIndex(idx) {
      var link = ALL_NODES[idx];
      if (!link) return;
      copyText(link, 'کانفیگ ' + (idx + 1) + '+${BRAND_NAME} کپی شد');
    }

    function fmtBytesClient(bytes) {
      var n = Number(bytes || 0);
      if (n <= 0) return '0 B';
      var units = ['B', 'KB', 'MB', 'GB', 'TB'];
      var i = Math.floor(Math.log(n) / Math.log(1024));
      if (i < 0) i = 0;
      if (i > units.length - 1) i = units.length - 1;
      return (n / Math.pow(1024, i)).toFixed(i >= 3 ? 2 : 1) + ' ' + units[i];
    }

    // اتصال مستقیم نمایشگر مصرف به آمار واقعی پنل (D1)
    function refreshUsage() {
      fetch('${usageApiUrl}?t=' + Date.now(), { cache: 'no-store' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (!data || !data.success || !data.user) return;
          var u = data.user;
          var used = Number(u.usedBytes || 0);
          var limitGb = Number(u.dataLimitGb || 0);
          var limitBytes = limitGb > 0 ? limitGb * 1073741824 : 0;
          var pct = limitBytes > 0 ? Math.min(100, Math.round((used / limitBytes) * 100)) : 0;
          var usedEl = document.getElementById('statUsed');
          if (usedEl) usedEl.textContent = fmtBytesClient(used);
          var limitEl = document.getElementById('statLimit');
          if (limitEl) limitEl.textContent = limitGb > 0 ? (limitGb + ' GB (' + pct + '%)') : '∞ نامحدود';
          var nodesEl = document.getElementById('statNodes');
          if (nodesEl) nodesEl.textContent = (data.nodeCount || 0) + ' نود (${BRAND_NAME})';
          var bar = document.getElementById('usageBar');
          if (bar) bar.style.width = Math.max(pct, used > 0 ? 2 : 0) + '%';
          var meta = document.getElementById('usageMeta');
          if (meta) meta.textContent = limitGb > 0 ? (fmtBytesClient(used) + ' از ' + limitGb + ' GB') : (fmtBytesClient(used) + ' مصرف‌شده');
          var expEl = document.getElementById('statExpire');
          if (expEl) {
            if (u.expireAt > 0) {
              var days = Math.ceil((u.expireAt - Date.now()) / 86400000);
              expEl.textContent = days > 0 ? (days + ' روز باقی‌مانده') : 'منقضی شده';
            } else {
              expEl.textContent = 'بدون انقضا';
            }
          }
          var pillar = document.getElementById('statusPill');
          if (pillar) {
            pillar.textContent = u.enabled ? '● فعال و آنلاین' : '● غیرفعال';
            pillar.className = 'pill' + (u.enabled ? '' : ' pill-off');
          }
          var upd = document.getElementById('usageUpdated');
          if (upd) upd.textContent = 'آخرین بروزرسانی: ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        })
        .catch(function() {});
    }

    renderNodes();
    refreshUsage();
    setInterval(refreshUsage, 30000);
  </script>
</body>
</html>`);
}


// --- MODULE: src/ui/adminHtml.js ---
// ============================================================================
// miliconfigOS v4.0 - Admin workspace
// Server-rendered shell + vanilla ES client. All data comes from /api/v1.
// No secrets are injected into the HTML.
// ============================================================================


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

function renderAdminDashboardHtml(options = {}) {
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
      <div class="view" id="view" aria-live="polite"></div>
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
    html += '<section class="card"><h2>ECH</h2><div class="card-sub">ECH is only reported as active when a real HTTPS/SVCB record publishes it. The Worker checks the record; client support is required.</div>' +
      '<div class="table-wrap"><table><thead><tr><th>Host</th><th>Clients</th><th>Check</th><th></th></tr></thead><tbody>' +
      (d.echEntries || []).map(function(e){
        var check = d.echChecks && d.echChecks[e.host];
        return '<tr><td class="mono">' + esc(e.host) + '</td><td>' + esc((e.clients||[]).join(', ')) + '</td>' +
          '<td>' + (check ? badge(check.ok ? 'record found' : 'unavailable', check.ok ? 'ok' : 'warn') + '<div class="faint">' + esc(check.detail || '') + '</div>' : '<span class="faint">not checked</span>') + '</td>' +
          '<td><button class="btn sm" data-act="ech-test" data-host="' + esc(e.host) + '">' + esc(t('check')) + '</button></td></tr>';
      }).join('') + '</tbody></table></div></section>' +
      '<div class="alert info"><div><b>' + esc(t('settingsNetwork')) + '</b>' + esc('DNS profile, TLS fingerprint and ECH settings are saved in Settings → Network.') + '</div></div>';
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
    document.getElementById('view').innerHTML = pageHead(t('error'), '') + '<div class="alert err"><div><b>' + esc(t('error')) + '</b>' + esc(err && err.message ? err.message : String(err)) + '</div></div>';
  }

  function loadPage(page){
    var jobs = [];
    function need(loader){ jobs.push(loader()); }
    if (page === 'dashboard') need(loadOverview);
    if (page === 'users') { need(loadOverview); need(loadUsers); }
    if (page === 'endpoints') need(loadEndpoints);
    if (page === 'engine') { need(loadUsers); need(loadSettings); }
    if (page === 'subscriptions') need(loadSubscriptions);
    if (page === 'scanner') return Promise.resolve();
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

  var initial = (location.hash || '').replace('#','');
  if (pages.some(function(p){ return p.id === initial; })) S.page = initial;
  applyChrome();
  loading();
  loadPage(S.page).then(render).catch(showError);
})();
`;


// --- MODULE: src/index.js ---
// ============================================================================
// miliconfigOS v4.0 - Cloudflare Worker entry point
// Control plane (panel + API) and data plane (proxy runtime) share this Worker.
// ============================================================================


function normalizeCleanPath(p = '') {
  return String(p || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function isAdminAuthorizedPath(prefixPath, adminUuid, customPath) {
  const cleanPrefix = normalizeCleanPath(prefixPath);
  if (!cleanPrefix) return false;
  const cleanAdmin = normalizeCleanPath(adminUuid);
  const cleanCustom = normalizeCleanPath(customPath);
  if (cleanCustom) {
    return cleanPrefix === cleanCustom || cleanPrefix === cleanAdmin;
  }
  return cleanPrefix === cleanAdmin;
}

function log(level, message, extra = {}) {
  try {
    console.log(JSON.stringify({ level, scope: 'worker', message, ...extra }));
  } catch (_e) {}
}

function htmlResponse(html, status = 200, extraHeaders = {}) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...securityHeaders(),
      ...extraHeaders
    }
  });
}

function textResponse(text, status = 200, extraHeaders = {}) {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...securityHeaders(),
      ...extraHeaders
    }
  });
}

async function fetchHomepage(globalCfg) {
  const raw = String(globalCfg.homepage || '').trim();
  const fallback = renderNginxFallback();
  if (!raw) return { html: fallback, source: 'fallback' };
  let target;
  try {
    target = new URL(raw);
  } catch (_e) {
    return { html: fallback, source: 'fallback' };
  }
  if (!/^https?:$/.test(target.protocol) || isPrivateHost(target.hostname)) {
    return { html: fallback, source: 'fallback' };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(target.toString(), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MiliconfigOS/4.0)',
        Accept: 'text/html,application/xhtml+xml'
      }
    });
    clearTimeout(timer);
    if (!res.ok) return { html: fallback, source: 'fallback' };
    const type = res.headers.get('Content-Type') || '';
    if (!/text\/html/i.test(type)) return { html: fallback, source: 'fallback' };
    let html = await res.text();
    // Strip framing restrictions so the same-origin login gateway can render it.
    html = html.replace(/<meta[^>]+http-equiv=["']?x-frame-options["']?[^>]*>/gi, '');
    return {
      html,
      source: target.toString(),
      base: `<base href="${target.toString().replace(/"/g, '&quot;')}">`
    };
  } catch (_e) {
    return { html: fallback, source: 'fallback' };
  }
}

function renderNginxFallback() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to nginx!</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
font-family:Arial,Helvetica,sans-serif;background:#fff;color:#333}
.page{max-width:680px;padding:40px 24px;text-align:center}
.logo{width:96px;height:96px;margin:0 auto 24px;display:block}
h1{font-size:38px;margin:0 0 18px}p{font-size:18px;line-height:1.7;color:#555;margin:12px auto;max-width:540px}
.foot{margin-top:44px;padding-top:16px;border-top:1px solid #e6e6e6;font-size:13px;color:#999}
</style></head><body><div class="page">
<svg class="logo" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" rx="18" fill="#009639"/>
<path d="M34 94V34l60 60V34" fill="none" stroke="#fff" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/></svg>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
<p>For online documentation and support please refer to nginx.org.<br>Commercial support is available at nginx.com.</p>
<p class="foot">Server at ${BRAND_NAME}.v4 Port 80</p>
</div></body></html>`;
}

async function hasValidAdminSession(request, env) {
  const token = readCookie(request, SESSION_COOKIE) || readCookie(request, LEGACY_SESSION_COOKIE);
  if (!token) return false;
  const result = await verifyAdminSessionToken(env, token);
  if (result.valid) return true;
  // Legacy fallback for sessions created before v4; they expire server-side.
  return await verifyAdminSession(env, token);
}

async function resolveSubscriptionContext(env, token) {
  const sub = await findSubscriptionByToken(env, token);
  if (sub) {
    const user = await getUserByIdOrToken(env, sub.userId);
    return { user, sub };
  }
  const user = await getUserByIdOrToken(env, token);
  return { user, sub: null };
}

function subscriptionBlockedResponse(user) {
  if (!user) {
    return textResponse('Subscription not found.\n', 404);
  }
  if (user.enabled === false) {
    return textResponse('This subscription is disabled. Contact your administrator.\n', 403);
  }
  if (Number(user.expireAt) > 0 && Number(user.expireAt) < Date.now()) {
    return textResponse('This subscription has expired. Contact your administrator.\n', 403);
  }
  if (Number(user.dataLimitGb) > 0 && Number(user.usedBytes) >= Number(user.dataLimitGb) * 1073741824) {
    return textResponse('The data quota for this subscription is exhausted.\n', 403);
  }
  return null;
}

export default {
  async fetch(request, env = {}, ctx = {}) {
    const url = new URL(request.url);
    const started = Date.now();
    try {
      await ensureD1Schema(env);
      await ensureV4Schema(env);
      const databaseReady = databaseConfigured(env);

      const adminUuid = await getOrCreateAdminPath(env);
      const globalCfg = await loadGlobalConfig(env);
      const allUsers = await listUsers(env);

      // 1. Versioned API (handles its own authentication)
      if (url.pathname === '/api/v1' || url.pathname.startsWith('/api/v1/')) {
        return await handleV1Api(request, env);
      }

      // 2. Proxy data plane (WebSocket upgrade)
      const upgrade = (request.headers.get('Upgrade') || '').toLowerCase();
      if (upgrade === 'websocket') {
        return await handleWebSocketUpgrade(request, env, ctx, globalCfg, allUsers, adminUuid);
      }

      // 3. Legacy API surface (kept for compatibility with existing integrations)
      if (url.pathname.includes('/api/')) {
        if (url.pathname.startsWith('/api/admin/')) {
          return await handleAuthApi(request, env);
        }
        if (url.pathname.startsWith('/api/scanner/')) {
          return await handleScannerApi(request, env);
        }
        const pathParts = url.pathname.split('/').filter(Boolean);
        const apiIdx = pathParts.indexOf('api');
        const prefix = pathParts.slice(0, apiIdx).join('/');
        const apiSubPath = pathParts.slice(apiIdx + 1).join('/');

        if (apiSubPath.startsWith('status/')) {
          const token = decodeURIComponent(apiSubPath.slice('status/'.length));
          return await handlePublicUserStatusApi(request, env, token);
        }

        if (!isAdminAuthorizedPath(prefix, adminUuid, globalCfg.d)) {
          return textResponse(JSON.stringify({ error: 'Forbidden' }), 403);
        }
        if (apiSubPath === 'config') return await handleConfigApi(request, env);
        if (apiSubPath === 'users') return await handleUsersApi(request, env);
        if (apiSubPath === 'preferred-ips') return await handlePreferredIpsApi(request, env, true);
        if (apiSubPath === 'stats' || apiSubPath === 'd1-init') return await handleDashboardStatsApi(request, env);
        return textResponse(JSON.stringify({ error: 'Not Found' }), 404);
      }

      // 4. xHTTP POST transport
      if (request.method === 'POST') {
        return await handleXhttpPostRequest(request, env, ctx, globalCfg, allUsers, adminUuid);
      }

      if (request.method === 'GET' || request.method === 'HEAD') {
        const pathParts = url.pathname.split('/').filter(Boolean);

        // 4a. Homepage used by the login gateway (same-origin iframe)
        if (url.pathname === '/__homepage') {
          const page = await fetchHomepage(globalCfg);
          const inject = page.base || '';
          return htmlResponse(inject ? page.html.replace(/<head([^>]*)>/i, `<head$1>${inject}`) : page.html, 200, {
            'Content-Security-Policy': "frame-ancestors 'self'",
            'X-Frame-Options': 'SAMEORIGIN'
          });
        }

        // 4b. Public gateway
        const initialized = await hasAdminPassword(env);
        const isAdminPath = isAdminAuthorizedPath(normalizeCleanPath(url.pathname), adminUuid, globalCfg.d);
        const authenticated = isAdminPath ? await hasValidAdminSession(request, env) : false;

        if (url.pathname === '/' || url.pathname === '/login' || (isAdminPath && !authenticated)) {
          return htmlResponse(renderLoginGatewayHtml({
            initialized,
            homepage: globalCfg.homepage || 'https://nginx.com',
            configuredHomepage: Boolean(String(globalCfg.homepage || '').trim()),
            databaseAvailable: databaseReady
          }));
        }

        // 4c. Legacy region/test endpoints
        if (pathParts.length === 2 && (pathParts[1] === 'region' || pathParts[1] === 'test-api')) {
          if (!isAdminAuthorizedPath(pathParts[0], adminUuid, globalCfg.d)) {
            return textResponse(JSON.stringify({ error: 'Access Denied' }), 403);
          }
          if (pathParts[1] === 'region') {
            return new Response(JSON.stringify({
              region: globalCfg.wk ? globalCfg.wk.toUpperCase() : globalCfg.p ? 'CUSTOM' : 'CF',
              detectionMethod: globalCfg.wk ? 'manual' : globalCfg.p ? 'custom proxy IP' : 'official Cloudflare egress',
              timestamp: new Date().toISOString()
            }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
          }
          return new Response(JSON.stringify({
            detectedRegion: 'CF',
            message: 'Test API reachable',
            timestamp: new Date().toISOString()
          }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
        }

        // 4d. Subscriptions: /s/{token}, /sub/{token}, /{token}/sub
        const isSubPath = (pathParts[0] === 's' && pathParts[1]) ||
          (pathParts[0] === 'sub' && pathParts[1]) ||
          (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'sub');
        if (isSubPath) {
          const token = pathParts[0] === 's' || pathParts[0] === 'sub'
            ? decodeURIComponent(pathParts.slice(1).join('/'))
            : decodeURIComponent(pathParts.slice(0, -1).join('/'));

          const isAdminToken = isAdminAuthorizedPath(token, adminUuid, globalCfg.d);
          let targetUser = null;
          let sub = null;

          if (!isAdminToken) {
            const resolved = await resolveSubscriptionContext(env, token);
            targetUser = resolved.user;
            sub = resolved.sub;
          }

          if (isAdminToken) {
            targetUser = {
              id: allUsers[0]?.id || null,
              username: BRAND_NAME,
              uuid: adminUuid,
              subNodeCount: globalCfg.subNodeCount || 50,
              enabled: true,
              dataLimitGb: 0,
              usedBytes: 0,
              expireAt: 0,
              nodeScope: 'all',
              config: globalCfg
            };
          }

          if (!targetUser) return textResponse('Invalid subscription token.\n', 403);
          if (sub && sub.revoked) return textResponse('This subscription has been revoked.\n', 403);
          const blocked = subscriptionBlockedResponse(targetUser);
          if (blocked) return blocked;

          if (targetUser.id) {
            const tasks = [
              recordUserActivity(env, targetUser.id, 0, 1).catch(() => {}),
              touchSubscriptionAccess(env, targetUser.id).catch(() => {})
            ];
            if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(Promise.all(tasks));
          }
          const catalogEndpoints = (await listEndpoints(env)).filter(item => item.enabled);
          return await handleSubscriptionResponse(request, targetUser, url, catalogEndpoints);
        }

        // 4e. User status page (admin path view, subscription token, or legacy user id)
        const wantsStatus = url.searchParams.get('view') === 'status' ||
          (pathParts[0] === 'status' && pathParts[1]) ||
          (pathParts.length === 2 && pathParts[1] === 'status');

        if (wantsStatus) {
          const token = pathParts[0] === 'status' && pathParts[1]
            ? decodeURIComponent(pathParts[1])
            : (pathParts.length === 2 && pathParts[1] === 'status' ? decodeURIComponent(pathParts[0]) : '');
          let userObj = null;
          if (token) {
            const resolved = await resolveSubscriptionContext(env, token);
            if (resolved.sub && resolved.sub.revoked) {
              return textResponse('This subscription has been revoked.\n', 403);
            }
            userObj = resolved.user;
          }
          if (!userObj && isAdminPath) {
            userObj = allUsers[0] || {
              id: 'mili-admin',
              username: BRAND_NAME,
              uuid: adminUuid,
              subNodeCount: globalCfg.subNodeCount || 50,
              enabled: true,
              status: 'active',
              dataLimitGb: 0,
              usedBytes: 0,
              lifetimeBytes: 0,
              requestCount: 0,
              expireDays: 0,
              expireAt: 0,
              startOnFirstUse: true,
              ipLimit: 50,
              nodeScope: 'all',
              config: globalCfg
            };
          }
          if (!userObj) return textResponse('User not found.\n', 404);
          const nodes = await generateUserNodesList(userObj, url.hostname, {
            limit: userObj.subNodeCount,
            catalogEndpoints: await listEndpoints(env)
          });
          return htmlResponse(renderUserStatusPageHtml(userObj, nodes, request.url));
        }

        // 4f. Admin panel
        if (isAdminPath) {
          if (!authenticated) {
            return htmlResponse(renderLoginGatewayHtml({
              initialized,
              homepage: globalCfg.homepage || 'https://nginx.com',
              configuredHomepage: Boolean(String(globalCfg.homepage || '').trim()),
              databaseAvailable: databaseReady
            }));
          }
          const diag = await getStorageDiagnostics(env);
          const customYxCount = (globalCfg.yx || '').split(',').filter(Boolean).length;
          return htmlResponse(renderAdminDashboardHtml({
            config: globalCfg,
            users: allUsers,
            diagnostics: {
              ...diag,
              healthyCfIps: customYxCount + DIRECT_DOMAINS.length + OFFICIAL_DIRECT_IPS.length
            },
            adminPath: normalizeCleanPath(url.pathname),
            officialIps: OFFICIAL_DIRECT_IPS,
            officialIpv6: OFFICIAL_DIRECT_IPV6,
            directDomains: DIRECT_DOMAINS.map(item => item.domain),
            version: VERSION
          }));
        }

        // 4g. Legacy user status shortcut by user id/uuid
        const matchedUser = await getUserByIdOrToken(env, normalizeCleanPath(url.pathname));
        if (matchedUser) {
          const nodes = await generateUserNodesList(matchedUser, url.hostname, {
            limit: matchedUser.subNodeCount,
            catalogEndpoints: await listEndpoints(env)
          });
          return htmlResponse(renderUserStatusPageHtml(matchedUser, nodes, request.url));
        }
      }

      return textResponse(JSON.stringify({ error: 'Not Found' }), 404);
    } catch (err) {
      log('error', 'Unhandled request error', {
        path: url.pathname,
        method: request.method,
        message: String(err?.message || err),
        ms: Date.now() - started
      });
      return textResponse(JSON.stringify({
        error: 'internal_error',
        message: 'The request could not be completed. Check the Worker logs for details.'
      }), 500);
    }
  },

  // Cloudflare Cron Trigger: runs enabled automation jobs whose next_run_at
  // has passed. Configure the schedule in wrangler.toml ([triggers] crons).
  async scheduled(_event, env = {}, ctx = {}) {
    const work = runDueAutomationJobs(env).catch(err => {
      log('error', 'Scheduled automation failed', { message: String(err?.message || err) });
      return [];
    });
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(work);
    else await work;
  }
};

