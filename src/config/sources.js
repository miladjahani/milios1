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
  'https://raw.githubusercontent.com/panel-zeus/Z-E-U-S/main/ips.txt'
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
