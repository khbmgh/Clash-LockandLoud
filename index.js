const fs    = require('fs');
const fetch = require('node-fetch');

// =====================================================
// ۱. تنظیمات
// =====================================================
const FETCH_TIMEOUT    = 15000;
const MAX_PER_PROTOCOL = 250;

// لیست سابسکریپشن‌های خودت رو دقیقاً اینجا کپی کن
const SUBS = [...new Set(`
https://raw.githubusercontent.com/10ium/base64-encoder/main/encoded/10ium_proxy_configs.txt
https://raw.githubusercontent.com/10ium/V2RayAggregator/refs/heads/master/Eternity
https://raw.githubusercontent.com/10ium/base64-encoder/main/encoded/10ium-V2rayCollector-mixed.txt
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_1.txt
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_2.txt
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_3.txt
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_4.txt
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_1.txt
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_2.txt
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_3.txt
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_4.txt
https://raw.githubusercontent.com/hiddify/hiddify-app/refs/heads/main/test.configs/mahsa
https://raw.githubusercontent.com/HenryPorternew/sub/refs/heads/main/raw.txt
https://openproxylist.com/v2ray/rawlist/subscribe
https://openproxylist.com/v2ray/rawlist/text#
https://raw.githubusercontent.com/roosterkid/openproxylist/main/V2RAY_BASE64.txt
https://raw.githubusercontent.com/Ali-Anv1/C-Meta/refs/heads/main/C-Meta.txt
https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/refs/heads/main/BLACK_VLESS_RUS_mobile.txt
https://msk.vless-balancer.ru/sub/dXNlcl82Nzg4MzMxMjQ5LDE3Njk1MzUzMTkBqGm3A1STd#Subscription
https://raw.githubusercontent.com/parvinxs/Submahsanetxsparvin/refs/heads/main/Sub.mahsa.xsparvin
https://msk.vless-balancer.ru/sub/dXNlcl82Nzg4MzMxMjQ5LDE3Njk1MzUzMTkBqGm3A1STd/#KIA_NET
https://raw.githubusercontent.com/Mosifree/-FREE2CONFIG/refs/heads/main/Reality
https://raw.githubusercontent.com/Mosifree/-FREE2CONFIG/refs/heads/main/Clash_Reality
https://gist.githubusercontent.com/senatorpersian/ddb0dc4ceed582630c24ef56197d297a/raw/cb3370e2be7a72cb640d96c7b137029dc05b3739/subscription.txt
https://gist.githubusercontent.com/senatorpersian/ddb0dc4ceed582630c24ef56197d297a/raw/7767ced7587c4f8d203de08b186606eb880f3814/subscription.txt
https://raw.githubusercontent.com/hamedp-71/hy2/refs/heads/main/hp.txt
https://raw.githubusercontent.com/expressalaki/ExpressVPN/refs/heads/main/configs2.txt
https://raw.githubusercontent.com/expressalaki/ExpressVPN/refs/heads/main/configs.txt
https://raw.githubusercontent.com/hamedp-71/For_All_Net/refs/heads/main/hp.txt
https://zood.link/Motasel_Ba_Hame_Chi
https://gist.githubusercontent.com/senatorpersian/85d7bd0e4b64444a655ced36bd3136d5/raw/a4806bb92498ff77ca77b8555b2027dce2d84d51/subscription.txt
https://gist.githubusercontent.com/senatorpersian/85d7bd0e4b64444a655ced36bd3136d5/raw/0974dfe62a75fb7704a292d05c3f5f36ae6e14bf/subscription.txt
https://gist.githubusercontent.com/senatorpersian/85d7bd0e4b64444a655ced36bd3136d5/raw/7b2ce1090b3832102e86d2d0b892644f1dfeec12/subscription.txt
https://raw.githubusercontent.com/justVisiting992/xray-Config-Collector/main/mixed_iran.txt
https://raw.githubusercontent.com/justVisiting992/xray-Config-Collector/main/vless_iran.txt
https://raw.githubusercontent.com/justVisiting992/xray-Config-Collector/main/vmess_iran.txt
https://proxyclouds.vercel.app/get
https://raw.githubusercontent.com/AvenCores/goida-vpn-configs/refs/heads/main/githubmirror/4.txt
https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/refs/heads/main/WHITE-CIDR-RU-checked.txt
https://raw.githubusercontent.com/MrBihal/Channel-Hddify/refs/heads/main/MeLi-Shekan
https://raw.githubusercontent.com/Mosifree/-FREE2CONFIG/refs/heads/main/Reality
https://zaya.io/C-Meta
https://raw.githubusercontent.com/proco2024/channel/main/Telegram%3A%40config_proxy-14041130-026.txt
https://raw.githubusercontent.com/Ali-Anv1/C-Meta/refs/heads/main/C-Meta.txt
https://raw.githubusercontent.com/liketolivefree/kobabi/main/prov_clash.yaml
https://raw.githubusercontent.com/Mosifree/-FREE2CONFIG/main/Clash_Movaghat
https://raw.githubusercontent.com/Mosifree/-FREE2CONFIG/main/Clash_Reality
https://raw.githubusercontent.com/xtoolkit/TVC/main/subscriptions/meta/mix
https://raw.githubusercontent.com/HenryPorternew/sub/refs/heads/main/raw.txt
https://raw.githubusercontent.com/itsyebekhe/PSG/main/subscriptions/meta/mix
https://raw.githubusercontent.com/10ium/ClashFactory/main/providers/10ium-HiN-VPN.txt
https://raw.githubusercontent.com/10ium/ClashFactory/main/providers/10ium-config-fetcher.txt
https://raw.githubusercontent.com/snakem982/proxypool/main/source/clash-meta-2.yaml
https://raw.githubusercontent.com/anaer/Sub/main/proxies.yaml
https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/snippets/nodes.meta.yml
https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/Eternity.yml
https://raw.githubusercontent.com/MrMohebi/xray-proxy-grabber-telegram/master/collected-proxies/clash-meta/all.yaml
https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/refs/heads/main/all_configs.txt
https://raw.githubusercontent.com/NiREvil/vless/refs/heads/main/sub/clash-meta-wg.yml
https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/Eternity.yml
https://raw.githubusercontent.com/lagzian/TVC/main/lite/subscriptions/meta/mix
https://sub.xeton.dev/sub?&url=https://raw.githubusercontent.com/10ium/base64-encoder/main/encoded/arshiacomplus_v2rayExtractor_vmess.txt&target=clash&config=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2FSleepyHeeead%2Fsubconverter-config%40master%2Fremote-config%2Funiversal%2Furltest.ini&emoji=false&append_type=true&append_info=true&scv=true&udp=true&list=true&sort=false&fdn=true&insert=false
https://raw.githubusercontent.com/liketolivefree/kobabi/main/sub_all.txt
https://raw.githubusercontent.com/DarknessShade/WoW/refs/heads/main/clash-wg.yml
https://raw.githubusercontent.com/10ium/ClashFactory/main/providers/hamedvpns-Ali-Anv1-HP71.txt
https://raw.githubusercontent.com/10ium/ClashFactory/main/providers/10ium-configs-collector-ws.txt
https://raw.githubusercontent.com/10ium/free-config/refs/heads/main/free-mihomo-sub/WARP%20%2B%20Ainita_%5BMulti-Profile%5D_%5BFull%5D.yaml
https://raw.githubusercontent.com/10ium/VpnClashFaCollector/main/sub/all/mixed.txt
https://raw.githubusercontent.com/10ium/V2ray-Config/main/All_Configs_Sub.txt
https://raw.githubusercontent.com/maimengmeng/mysub/refs/heads/main/valid_content_all.txt
https://raw.githubusercontent.com/itsyebekhe/PSG/main/subscriptions/xray/base64/reality
https://raw.githubusercontent.com/itsyebekhe/PSG/main/subscriptions/xray/base64/xhttp
https://raw.githubusercontent.com/10ium/telegram-configs-collector/main/splitted/mixed
https://raw.githubusercontent.com/hamedp-71/N_sub_cheker/refs/heads/patch-1/final.txt
https://raw.githubusercontent.com/MrBihal/Channel-Hddify/refs/heads/main/MeLi-Shekan
https://raw.githubusercontent.com/MrBihal/Channel-Hddify/refs/heads/main/Meli
https://raw.githubusercontent.com/darkvpnapp/CloudflarePlus/refs/heads/main/clash.yaml
https://raw.githubusercontent.com/peweza/PUBLICSUB/refs/heads/main/PewezaVPNPubSUB
https://raw.githubusercontent.com/frank-vpl/servers/refs/heads/main/irbox
https://v2.alicivil.workers.dev/?list=mix&count=500&shuffle=false&unique=false
https://raw.githubusercontent.com/parvinxs/Fssociety/refs/heads/main/Fssociety.sub
https://raw.githubusercontent.com/parvinxs/Submahsanetxsparvin/refs/heads/main/Sub.mahsa.xsparvin
https://raw.githubusercontent.com/e
`.split("\n").map(s => s.trim()).filter(Boolean))];

// =====================================================
// ۲. موتور اصلی
// =====================================================
async function main() {
    let allProxies = [];
    console.log(`Starting Full Aggregation at: ${new Date().toISOString()}`);
    console.log(`Total sources: ${SUBS.length}`);

    const fetchPromises = SUBS.map(async (sub) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
        try {
            const res = await fetch(sub, { signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) { return []; }

            const raw     = await res.text();
            const decoded = decodeSub(raw);
            const parsed  = detectAndParse(decoded);

            const cleaned = [];
            for (let p of parsed) {
                p = sanitizeObj(p);

                if (p.type) {
                    p.type = p.type.toLowerCase();
                    if (p.type === "shadowsocks") p.type = "ss";
                    if (p.type === "socks")       p.type = "socks5";
                    if (p.type === "wg")          p.type = "wireguard";
                }

                p = normalizeProxy(p);
                p = fixProxyArrayFields(p);
                p.name = p.name || "Unnamed";

                if (valid(p) && p.type !== 'inline') cleaned.push(p);
            }
            return cleaned;
        } catch (e) {
            clearTimeout(timer);
            return [];
        }
    });

    const results = await Promise.allSettled(fetchPromises);
    results.forEach(r => { if (r.status === "fulfilled") allProxies.push(...r.value); });

    const unique = dedupe(allProxies);
    console.log(`Total unique proxies collected: ${unique.length}`);
    generateFiles(unique);
}

// ... [توابع پارسر و ولیدیشن ۳ تا ۱۱ رو دقیقاً مثل فایل قبلیت بذار بمونه] ...
// فقط تابع generateFiles (بخش ۱۲) رو با این کدی که نوشتم جایگزین کن:

// =====================================================
// ۱۲. تولید فایل خروجی یکپارچه (فقط all.yaml)
// =====================================================
function normalizeTypeName(t) {
    if (!t) return "unknown";
    const s = t.toLowerCase();
    if (s === "hysteria2") return "hy2";
    if (s === "wireguard") return "wg";
    if (s === "socks5")    return "socks";
    return s;
}

function generateFiles(proxies) {
    const protocolOrder = {
        "hy2": 1, "vless": 2, "anytls": 3, "trojan": 4, "ss": 5,
        "vmess": 6, "wg": 7, "tuic": 8, "socks": 9
    };

    const grouped = {};
    for (const p of proxies) {
        if (!grouped[p.type]) grouped[p.type] = [];
        grouped[p.type].push(p);
    }

    // بُر زدن و محدود کردن تعداد کانفیگ‌ها
    const randomized = [];
    for (const type in grouped) {
        const group = grouped[type];
        for (let i = group.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [group[i], group[j]] = [group[j], group[i]];
        }
        randomized.push(...group.slice(0, MAX_PER_PROTOCOL));
    }

    // مرتب‌سازی بر اساس اهمیت پروتکل
    randomized.sort((a, b) =>
        (protocolOrder[normalizeTypeName(a.type)] || 99) -
        (protocolOrder[normalizeTypeName(b.type)] || 99)
    );

    // نام‌گذاری تمیز
    const typeCounters = {};
    const finalProxies = randomized.map((p, globalIdx) => {
        const dt = normalizeTypeName(p.type);
        typeCounters[dt] = (typeCounters[dt] || 0) + 1;
        return { ...p, name: `${dt} ${typeCounters[dt]} - ${globalIdx + 1}` };
    });

    const header = `# Last Update: ${new Date().toISOString()}\n# Proxy Aggregator — Unified Clash Config\n`;
    const content = header + buildProvider(finalProxies);
    fs.writeFileSync('all.yaml', content, 'utf-8');
    console.log(`Created: all.yaml — ${finalProxies.length} proxies`);
}

// ... [ادامه توابع شامل buildProvider و Helperها که تو فایل خودت بود] ...

// Start
main();
