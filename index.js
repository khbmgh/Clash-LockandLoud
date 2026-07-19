const fs    = require('fs');
const fetch = require('node-fetch');
const net   = require('net');
const yaml  = require('js-yaml');// این خط رو اضافه کن
// =====================================================
// ۱. تنظیمات
// =====================================================
const FETCH_TIMEOUT    = 15000;
const MAX_PER_PROTOCOL = 350;

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
https://raw.githubusercontent.com/expressalaki/ExpressVPN/refs/heads/main/configs.txt
https://raw.githubusercontent.com/expressalaki/ExpressVPN/refs/heads/main/configs2.txt
https://raw.githubusercontent.com/expressalaki/ExpressVPN/refs/heads/main/configs3.txt
https://raw.githubusercontent.com/expressalaki/ExpressVPN/refs/heads/main/configs4.txt
https://raw.githubusercontent.com/miladtahanian/V2RayCFGDumper/main/config.txt
https://raw.githubusercontent.com/Mahdi0024/ProxyCollector/master/sub/proxies.txt
https://raw.githubusercontent.com/youfoundamin/V2rayCollector/main/mixed_iran.txt
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

            // 🎲 شافل کردن و جدا کردن تصادفی کانفیگ‌ها از همین سورس
            for (let i = cleaned.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cleaned[i], cleaned[j]] = [cleaned[j], cleaned[i]];
            }
            
            // گرفتن نهایتاً ۲۵۰ عدد (یا کمتر اگر سورس کوچیک بود)
            return cleaned.slice(0, 250); 

        } catch (e) {
            clearTimeout(timer);
            return [];
        }
    });

    const results = await Promise.allSettled(fetchPromises);
    results.forEach(r => { if (r.status === "fulfilled") allProxies.push(...r.value); });

    // حذف کانفیگ‌های تکراری در بین تمام سورس‌ها
    const unique = dedupe(allProxies);
    console.log(`Total unique proxies collected after per-source limits: ${unique.length}`);
    
    // تست پینگ برای حذف مرده‌ها (با همزمانی ۸۰۰ برای سرعت بالا)
    const liveProxies = await filterLiveProxies(unique, 800);
    
    // ارسال کانفیگ‌های کاملاً زنده برای ساخت فایل نهایی
    generateFiles(liveProxies);
}

// =====================================================
// ۳. تشخیص فرمت و parse
// =====================================================
function detectAndParse(text) {
    const trimmed = text.trim();

    // JSON آرایه
    if (trimmed.startsWith('[')) {
        try {
            const arr = JSON.parse(trimmed);
            if (Array.isArray(arr)) return parseJsonProxyArray(arr);
        } catch (_) {}
    }

    // JSON object
    if (trimmed.startsWith('{') || trimmed.includes('"proxies"') || trimmed.includes('"outbounds"')) {
        let jsonData = null;
        try { jsonData = JSON.parse(trimmed); } catch (_) {}

        if (!jsonData) {
            const m = trimmed.match(/"proxies"\s*:\s*(\[[\s\S]*?\])(?:\s*[,}]|$)/);
            if (m) try { jsonData = { proxies: JSON.parse(m[1]) }; } catch (_) {}
        }

        if (jsonData) {
            if (Array.isArray(jsonData.proxies))   return parseJsonProxyArray(jsonData.proxies);
            if (Array.isArray(jsonData.outbounds)) return parseXrayOutbounds(jsonData.outbounds);
            if (jsonData.type && jsonData.server) {
                const p = parseSingboxOutbound(jsonData);
                return p ? [p] : [];
            }
        }

        const outM = trimmed.match(/"outbounds"\s*:\s*(\[[\s\S]*?\])(?:\s*[,}]|$)/);
        if (outM) {
            try {
                const outbounds = JSON.parse(outM[1]);
                if (Array.isArray(outbounds)) return parseXrayOutbounds(outbounds);
            } catch (_) {}
        }
    }

    // WireGuard standard config format
    if (/^\s*\[Interface\]/im.test(text)) {
        return parseWireguardConfig(text);
    }

    // YAML
    if (/^\s*proxies:/m.test(text) || /^\s*-\s*name:/m.test(text) || /^\s*-\s*\{/m.test(text)) {
        return extractYamlConfigs(text);
    }

    // URI lines
    const result = [];
    for (const line of text.split("\n")) {
        const p = parseProxy(line.trim());
        if (p) result.push(p);
    }
    return result;
}

// =====================================================
// ۴. JSON Proxy Array Parser
// =====================================================
function parseJsonProxyArray(arr) {
    const result = [];
    for (const item of arr) {
        if (!item || typeof item !== 'object') continue;
        if (
            item.server_port !== undefined ||
            item.private_key !== undefined ||
            item.peer_public_key !== undefined
        ) {
            const p = parseSingboxOutbound(item);
            if (p) result.push(p);
        } else if (item.type || item.protocol) {
            result.push(item);
        }
    }
    return result;
}

// =====================================================
// ۵. Singbox Outbound Parser
// =====================================================
function parseSingboxOutbound(item) {
    try {
        const type = (item.type || "").toLowerCase();
        const typeMap = {
            "wireguard":   "wireguard",
            "vless":       "vless",
            "vmess":       "vmess",
            "trojan":      "trojan",
            "shadowsocks": "ss",
            "hysteria2":   "hysteria2",
            "socks":       "socks5",
            "tuic":        "tuic",
        };
        const clashType = typeMap[type];
        if (!clashType) return null;

        if (clashType === "wireguard") {
            const proxy = {
                name:          item.tag || item.name || "",
                type:          "wireguard",
                server:        item.server || "",
                port:          parseInt(item.server_port || item.port) || 0,
                "private-key": item.private_key || item["private-key"] || "",
                "public-key":  item.peer_public_key || item["public-key"] || "",
                udp:           true,
            };
            if (item.local_address) {
                const addrs = Array.isArray(item.local_address) ? item.local_address : [item.local_address];
                for (const addr of addrs) {
                    const clean = String(addr).split("/")[0].trim();
                    if (clean.includes(":")) { if (!proxy.ipv6) proxy.ipv6 = clean; }
                    else                     { if (!proxy.ip)   proxy.ip   = clean; }
                }
            }
            if (item.ip)  proxy.ip  = String(item.ip).split("/")[0].trim();
            if (item.mtu) proxy.mtu = parseInt(item.mtu);
            if (item.reserved !== undefined) proxy.reserved = item.reserved;
            proxy["allowed-ips"] = ["0.0.0.0/0", "::/0"];
            return proxy;
        }

        if (clashType === "hysteria2") {
            const proxy = {
                name:     item.tag || item.name || "",
                type:     "hysteria2",
                server:   item.server || "",
                port:     parseInt(item.server_port || item.port) || 0,
                password: item.password || "",
                udp:      true,
            };
            if (item.tls) {
                if (item.tls.server_name) proxy.sni = item.tls.server_name;
                if (item.tls.insecure)    proxy["skip-cert-verify"] = true;
                if (item.tls.alpn)        proxy.alpn = Array.isArray(item.tls.alpn) ? item.tls.alpn : [item.tls.alpn];
                if (item.tls.certificate) proxy.ca   = item.tls.certificate;
            }
            if (item.obfs && item.obfs.type === "salamander") {
                proxy.obfs             = "salamander";
                proxy["obfs-password"] = item.obfs.password || "";
            }
            if (item.up_mbps)   proxy.up   = String(item.up_mbps);
            if (item.down_mbps) proxy.down = String(item.down_mbps);
            return proxy;
        }

        // TUIC — تفکیک V4 (token) از V5 (uuid+password)
        if (clashType === "tuic") {
            const proxy = {
                name:   item.tag || item.name || "",
                type:   "tuic",
                server: item.server || "",
                port:   parseInt(item.server_port || item.port) || 0,
                udp:    true,
            };
            const hasUuid  = item.uuid  && typeof item.uuid  === 'string' && item.uuid.trim()  !== '';
            const hasToken = item.token && typeof item.token === 'string' && item.token.trim() !== '';
            if (hasUuid) {
                proxy.uuid     = item.uuid;
                proxy.password = item.password || "";
            } else if (hasToken) {
                proxy.token = item.token;
            }
            if (item.tls) {
                if (item.tls.server_name) proxy.sni = item.tls.server_name;
                if (item.tls.insecure)    proxy["skip-cert-verify"] = true;
                if (item.tls.alpn)        proxy.alpn = Array.isArray(item.tls.alpn) ? item.tls.alpn : [item.tls.alpn];
            }
            return proxy;
        }

        const proxy = {
            name:   item.tag || item.name || "",
            type:   clashType,
            server: item.server || "",
            port:   parseInt(item.server_port || item.port) || 0,
        };
        if (item.uuid)     proxy.uuid     = item.uuid;
        if (item.password) proxy.password = item.password;
        if (item.username) proxy.username = item.username;
        return proxy;
    } catch (_) { return null; }
}

// =====================================================
// ۶. Xray Outbounds Parser
// =====================================================
function parseXrayOutbounds(outbounds) {
    const result = [];
    for (const ob of outbounds) {
        if (!ob || typeof ob !== 'object') continue;
        const protocol = (ob.protocol || "").toLowerCase();
        if (protocol !== "wireguard") continue;
        try {
            const settings = ob.settings || {};
            const peers    = Array.isArray(settings.peers) ? settings.peers : [];
            if (peers.length === 0) continue;
            const peer = peers[0];

            let server = "", port = 0;
            if (peer.endpoint) {
                const lastColon = peer.endpoint.lastIndexOf(":");
                if (lastColon > 0) {
                    server = peer.endpoint.substring(0, lastColon);
                    port   = parseInt(peer.endpoint.substring(lastColon + 1)) || 0;
                }
            }

            const proxy = {
                name:          ob.tag || "",
                type:          "wireguard",
                server,
                port,
                "private-key": settings.secretKey || settings["private-key"] || "",
                "public-key":  peer.publicKey || peer["public-key"] || "",
                udp:           true,
            };
            if (Array.isArray(settings.address)) {
                for (const addr of settings.address) {
                    const clean = String(addr).split("/")[0].trim();
                    if (clean.includes(":")) { if (!proxy.ipv6) proxy.ipv6 = clean; }
                    else                     { if (!proxy.ip)   proxy.ip   = clean; }
                }
            }
            if (Array.isArray(settings.reserved)) proxy.reserved = settings.reserved;
            if (settings.mtu) proxy.mtu = parseInt(settings.mtu);
            proxy["allowed-ips"] = ["0.0.0.0/0", "::/0"];
            result.push(proxy);
        } catch (_) {}
    }
    return result;
}

// =====================================================
// ۷. YAML Parser — با پشتیبانی از nested objects
// =====================================================
// =====================================================
// ۷. YAML Parser — با استفاده از js-yaml (ضدگلوله)
// =====================================================
function extractYamlConfigs(text) {
    const proxies = [];
    try {
        // loadAll کمک می‌کنه اگه چند تا داکیومنت با --- جدا شده باشن همه‌شون خونده بشن
        yaml.loadAll(text, function (doc) {
            if (!doc || typeof doc !== 'object') return;
            
            if (Array.isArray(doc.proxies)) {
                proxies.push(...doc.proxies);
            } else if (Array.isArray(doc)) {
                proxies.push(...doc.filter(i => i && i.type && i.server));
            } else if (doc.type && doc.server) {
                proxies.push(doc);
            } else {
                // گشتن تو کلیدهای دیگه اگه کانفیگ ساختار متفاوتی داشت
                for (const key in doc) {
                    if (Array.isArray(doc[key])) {
                        const possibleProxies = doc[key].filter(i => i && i.type && i.server);
                        proxies.push(...possibleProxies);
                    }
                }
            }
        });
    } catch (e) {
        // نادیده گرفتن خطاهای پارس در صورت نامعتبر بودن متن
    }
    return proxies;
}

// =====================================================
// ۸. URI Protocol Parsers
// =====================================================
function parseProxy(line) {
    try {
        const l = line.toLowerCase();
        if (l.startsWith("vless://"))                                return parseVless(line);
        if (l.startsWith("vmess://"))                                return parseVmess(line);
        if (l.startsWith("trojan://"))                               return parseTrojan(line);
        if (l.startsWith("anytls://"))                               return parseAnyTls(line);
        if (l.startsWith("ss://"))                                   return parseSS(line);
        if (l.startsWith("hy2://") || l.startsWith("hysteria2://"))  return parseHysteria2(line);
        if (l.startsWith("wg://") || l.startsWith("wireguard://"))   return parseWireguard(line);
        if (l.startsWith("tuic://"))                                 return parseTuic(line);
        if (l.startsWith("socks://") || l.startsWith("socks5://"))   return parseSocks(line);
        // ssh://, http://, https://, ssr:// — حذف شده
    } catch (_) {}
    return null;
}

function parseVless(link) {
    const url      = new URL(link.replace(/^vless:\/\//i, "http://"));
    const security = url.searchParams.get("security") || "";
    const network  = url.searchParams.get("type") || "tcp";

    const proxy = {
        name:    safeDecode(url.hash.substring(1) || url.hostname),
        type:    "vless",
        server:  url.hostname,
        port:    parseInt(url.port),
        uuid:    url.username || "",
        udp:     true,
        tls:     ["tls", "reality"].includes(security),
        network
    };

    const sni = url.searchParams.get("sni");
    if (sni) proxy.servername = sni;

    const fp = url.searchParams.get("fp");
    if (fp) proxy["client-fingerprint"] = fp;

    const alpn = url.searchParams.get("alpn");
    if (alpn) proxy.alpn = alpn.split(",");

    const flow = url.searchParams.get("flow");
    if (flow) proxy.flow = flow;

    const insecure = url.searchParams.get("allowInsecure") || url.searchParams.get("insecure");
    if (insecure === "1" || insecure === "true") proxy["skip-cert-verify"] = true;

    if (security === "reality") {
        proxy["reality-opts"] = { "public-key": url.searchParams.get("pbk") || "" };
        const sid = url.searchParams.get("sid");
        if (sid) proxy["reality-opts"]["short-id"] = sid;
    }

    if (network === "tcp") {
        delete proxy.network;
    } else if (network === "ws") {
        const path = url.searchParams.get("path");
        const host = url.searchParams.get("host");
        if (path || host) {
            proxy["ws-opts"] = {};
            if (path) proxy["ws-opts"].path = safeDecode(path);
            if (host) proxy["ws-opts"].headers = { Host: host };
        }
        const httpUpgrade = url.searchParams.get("v2ray-http-upgrade") || url.searchParams.get("httpupgrade");
        if (httpUpgrade === "1" || httpUpgrade === "true") {
            if (!proxy["ws-opts"]) proxy["ws-opts"] = {};
            proxy["ws-opts"]["v2ray-http-upgrade"] = true;
        }
    } else if (network === "grpc") {
        const serviceName = url.searchParams.get("serviceName");
        if (serviceName) proxy["grpc-opts"] = { "grpc-service-name": serviceName };
    } else if (network === "h2") {
        const path = url.searchParams.get("path");
        const host = url.searchParams.get("host");
        if (path || host) {
            proxy["h2-opts"] = {};
            if (path) proxy["h2-opts"].path = safeDecode(path);
            if (host) proxy["h2-opts"].host  = [host];
        }
    }

    return proxy;
}

function parseVmess(link) {
    try {
        const raw   = link.replace(/^vmess:\/\//i, "");
        const fixed = normalizeBase64(raw);
        if (!fixed) return null;
        const j = JSON.parse(fixed);
        if (!j.add || !j.port || !j.id) return null;

        const proxy = {
            name:    safeDecode(j.ps || j.add),
            type:    "vmess",
            server:  j.add,
            port:    parseInt(j.port),
            uuid:    j.id || "",
            alterId: parseInt(j.aid) || 0,
            cipher:  "auto",
            udp:     true
        };

        if (j.tls === "tls") {
            proxy.tls = true;
            if (j.sni) proxy.servername = j.sni;
            if (j.fp)  proxy["client-fingerprint"] = j.fp;
            if (j.alpn) proxy.alpn = typeof j.alpn === 'string' ? j.alpn.split(",") : j.alpn;
        }

        const net = j.net || j.type;
        if (net && net !== "tcp") {
            proxy.network = net;
            if (net === "ws") {
                proxy["ws-opts"] = {};
                if (j.path) proxy["ws-opts"].path = j.path;
                const host = j.host || j.add;
                if (host) proxy["ws-opts"].headers = { Host: host };
                if (j["v2ray-http-upgrade"]) proxy["ws-opts"]["v2ray-http-upgrade"] = true;
                if (j["v2ray-http-upgrade-fast-open"]) proxy["ws-opts"]["v2ray-http-upgrade-fast-open"] = true;
            } else if (net === "grpc") {
                proxy["grpc-opts"] = { "grpc-service-name": j.path || "" };
            } else if (net === "h2") {
                proxy["h2-opts"] = {};
                if (j.path) proxy["h2-opts"].path = j.path;
                if (j.host) proxy["h2-opts"].host  = [j.host];
            } else if (net === "http") {
                proxy["http-opts"] = {};
                if (j.path) {
                    proxy["http-opts"].path = Array.isArray(j.path) ? j.path : [j.path];
                }
                if (j.host) {
                    proxy["http-opts"].headers = { Host: Array.isArray(j.host) ? j.host : [j.host] };
                }
            }
        }

        return proxy;
    } catch (_) { return null; }
}

function parseTrojan(link) {
    const url     = new URL(link.replace(/^trojan:\/\//i, "http://"));
    const network = url.searchParams.get("type") || "tcp";

    const proxy = {
        name:     safeDecode(url.hash.substring(1) || url.hostname),
        type:     "trojan",
        server:   url.hostname,
        port:     parseInt(url.port),
        password: safeDecode(url.username) || "",
        udp:      true,
        tls:      true,
    };

    // trojan فقط ws/grpc پشتیبانی می‌کنه
    if (network === "ws" || network === "grpc") {
        proxy.network = network;
    }

    const sni = url.searchParams.get("sni") || url.searchParams.get("peer");
    if (sni) proxy.sni = sni;

    const fp = url.searchParams.get("fp");
    if (fp) proxy["client-fingerprint"] = fp;

    const alpn = url.searchParams.get("alpn");
    if (alpn) proxy.alpn = alpn.split(",");

    const insecure = url.searchParams.get("allowInsecure") || url.searchParams.get("insecure");
    if (insecure === "1" || insecure === "true") proxy["skip-cert-verify"] = true;

    const security = url.searchParams.get("security") || "";
    if (security === "reality") {
        proxy["reality-opts"] = { "public-key": url.searchParams.get("pbk") || "" };
        const sid = url.searchParams.get("sid");
        if (sid) proxy["reality-opts"]["short-id"] = sid;
    }

    if (network === "ws") {
        const path = url.searchParams.get("path");
        const host = url.searchParams.get("host");
        if (path || host) {
            proxy["ws-opts"] = {};
            if (path) proxy["ws-opts"].path = safeDecode(path);
            if (host) proxy["ws-opts"].headers = { Host: host };
        }
    } else if (network === "grpc") {
        const serviceName = url.searchParams.get("serviceName");
        if (serviceName) proxy["grpc-opts"] = { "grpc-service-name": serviceName };
    }

    return proxy;
}

function parseAnyTls(link) {
    const url = new URL(link.replace(/^anytls:\/\//i, "http://"));
    const proxy = {
        name:   safeDecode(url.hash.substring(1) || url.hostname),
        type:   "anytls",
        server: url.hostname,
        port:   parseInt(url.port),
        udp:    true,
    };

    const pass = safeDecode(url.username) || safeDecode(url.password) || "";
    if (pass) proxy.password = pass;

    const sni = url.searchParams.get("sni");
    if (sni) proxy.sni = sni;

    const alpn = url.searchParams.get("alpn");
    if (alpn) proxy.alpn = alpn.split(",");

    const fp = url.searchParams.get("fp") || url.searchParams.get("fingerprint");
    if (fp) proxy["client-fingerprint"] = fp;

    const insecure = url.searchParams.get("insecure") || url.searchParams.get("allowInsecure");
    if (insecure === "1" || insecure === "true") proxy["skip-cert-verify"] = true;

    return proxy;
}

function parseSS(link) {
    const raw     = link.replace(/^ss:\/\//i, "");
    const hashIdx = raw.indexOf('#');
    const base    = hashIdx >= 0 ? raw.substring(0, hashIdx) : raw;
    const tag     = hashIdx >= 0 ? raw.substring(hashIdx + 1) : "";

    // جدا کردن query string
const qIdx    = base.indexOf('?');
    let baseNoQ   = qIdx >= 0 ? base.substring(0, qIdx) : base;
    if (baseNoQ.endsWith('/')) baseNoQ = baseNoQ.slice(0, -1);
    const query   = qIdx >= 0 ? base.substring(qIdx + 1) : "";
    
    let method, password, server, port;

    if (baseNoQ.includes("@")) {
        const atIdx      = baseNoQ.lastIndexOf("@");
        const authPart   = baseNoQ.substring(0, atIdx);
        const serverPart = baseNoQ.substring(atIdx + 1);
        const decoded    = normalizeBase64(authPart) || authPart;
        const colonIdx   = decoded.indexOf(":");
        if (colonIdx < 0) return null;
        method   = decoded.substring(0, colonIdx);
        password = decoded.substring(colonIdx + 1);
        const lastColon = serverPart.lastIndexOf(":");
        if (lastColon < 0) return null;
        server = serverPart.substring(0, lastColon);
        port   = serverPart.substring(lastColon + 1);
    } else {
        const decoded = normalizeBase64(baseNoQ);
        if (!decoded) return null;
        const atIdx = decoded.lastIndexOf("@");
        if (atIdx < 0) return null;
        const authPart   = decoded.substring(0, atIdx);
        const serverPart = decoded.substring(atIdx + 1);
        const colonIdx   = authPart.indexOf(":");
        if (colonIdx < 0) return null;
        method   = authPart.substring(0, colonIdx);
        password = authPart.substring(colonIdx + 1);
        const lastColon = serverPart.lastIndexOf(":");
        if (lastColon < 0) return null;
        server = serverPart.substring(0, lastColon);
        port   = serverPart.substring(lastColon + 1);
    }

    server = server.replace(/^\[|\]$/g, "");
    if (!server || !port || !method || password === undefined) return null;

    const result = {
        name:     safeDecode(tag || server),
        type:     "ss",
        server,
        port:     parseInt(port),
        cipher:   method.toLowerCase(),
        password: password || "",
        udp:      true
    };

    // plugin از query params
    if (query) {
        const params = new URLSearchParams(query);
        const plugin = params.get("plugin");
        if (plugin) {
            const parts      = plugin.split(";");
            const pluginName = parts[0];
            result.plugin    = pluginName;
            const opts = {};
            for (let i = 1; i < parts.length; i++) {
                const eq = parts[i].indexOf("=");
                if (eq > 0) {
                    const k = parts[i].substring(0, eq);
                    const v = parts[i].substring(eq + 1);
                    // فیلدهایی که باید boolean باشند
                    if (k === "mux" || k === "tls" || k === "skip-cert-verify") {
                        opts[k] = v === "true" || v === "1";
                    } else {
                        opts[k] = v;
                    }
                }
            }
            if (Object.keys(opts).length > 0) result["plugin-opts"] = opts;
        }
    }

    return result;
}

function parseHysteria2(link) {
    const url = new URL(link.replace(/^(hy2|hysteria2):\/\//i, "http://"));

    const proxy = {
        name:     safeDecode(url.hash.substring(1) || url.hostname),
        type:     "hysteria2",
        server:   url.hostname,
        port:     parseInt(url.port),
        password: safeDecode(url.username) || "",
        udp:      true
    };

    const sni = url.searchParams.get("sni") || url.searchParams.get("peer");
    if (sni) proxy.sni = sni;

    const insecure = url.searchParams.get("insecure") || url.searchParams.get("allowInsecure");
    if (insecure === "1" || insecure === "true") proxy["skip-cert-verify"] = true;

    const alpn = url.searchParams.get("alpn");
    if (alpn) proxy.alpn = alpn.split(",");

    const obfs = url.searchParams.get("obfs");
    if (obfs && obfs.toLowerCase() === "salamander") {
        proxy.obfs = "salamander";
        const obfsPass = url.searchParams.get("obfs-password") || url.searchParams.get("obfsPassword");
        if (obfsPass) proxy["obfs-password"] = obfsPass;
    }

    const up   = url.searchParams.get("up");
    const down = url.searchParams.get("down");
    if (up)   proxy.up   = up;
    if (down) proxy.down = down;

    const ports = url.searchParams.get("ports") || url.searchParams.get("mport");
    if (ports) proxy.ports = ports;

    const hopInterval = url.searchParams.get("hopInterval") || url.searchParams.get("hop-interval");
    if (hopInterval) proxy["hop-interval"] = parseInt(hopInterval);

    return proxy;
}

function parseWireguard(link) {
    const url = new URL(link.replace(/^(wg|wireguard):\/\//i, "http://"));

    const privateKey = safeDecode(
        url.username ||
        url.searchParams.get("privateKey") ||
        url.searchParams.get("private-key") || ""
    );

    const publicKey = safeDecode(
        url.searchParams.get("publickey") ||
        url.searchParams.get("public-key") ||
        url.searchParams.get("peer_public_key") ||
        url.searchParams.get("publicKey") || ""
    );

    const rawAddress = url.searchParams.get("address") || url.searchParams.get("ip") || "10.0.0.1";
    const addresses  = rawAddress.split(",").map(s => s.trim().split("/")[0]);
    let ip   = "";
    let ipv6 = "";
    for (const addr of addresses) {
        if (addr.includes(":")) { if (!ipv6) ipv6 = addr; }
        else                    { if (!ip)   ip   = addr; }
    }
    if (!ip) ip = "10.0.0.1";

    const proxy = {
        name:          safeDecode(url.hash.substring(1) || url.hostname),
        type:          "wireguard",
        server:        url.hostname,
        port:          parseInt(url.port) || 51820,
        ip,
        "private-key": privateKey,
        "public-key":  publicKey,
        udp:           true,
    };
    if (ipv6) proxy.ipv6 = ipv6;

    const allowedIps = url.searchParams.get("allowedIPs") ||
                       url.searchParams.get("allowed-ips") ||
                       url.searchParams.get("allowed_ips");
    if (allowedIps)
        proxy["allowed-ips"] = allowedIps.split(",").map(s => s.trim()).filter(Boolean);

    const reserved = url.searchParams.get("reserved");
    if (reserved) {
        const parts = reserved.split(",").map(Number);
        if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255))
            proxy.reserved = parts;
    }

    const mtu = url.searchParams.get("mtu");
    if (mtu) proxy.mtu = parseInt(mtu);

    const keepalive = url.searchParams.get("keepalive") ||
                      url.searchParams.get("persistentkeepalive") ||
                      url.searchParams.get("persistent-keepalive");
    if (keepalive) proxy["persistent-keepalive"] = parseInt(keepalive);

    const dns = url.searchParams.get("dns");
    if (dns) {
        proxy["remote-dns-resolve"] = true;
        proxy.dns = dns.split(",").map(s => s.trim()).filter(Boolean);
    }

    const awgFields = ["wnoise","wnoisecount","wnoisedelay","wpayloadsize",
                       "jc","jmin","jmax","h1","h2","h3","h4","s1","s2","i1","i2","i3","i4","i5","j1","j2","j3","itime"];
    const awgOpt = {};
    for (const f of awgFields) {
        const v = url.searchParams.get(f);
        if (v !== null) {
            const num = Number(v);
            awgOpt[f] = isNaN(num) ? v : num;
        }
    }
    if (Object.keys(awgOpt).length > 0) proxy["amnezia-wg-option"] = awgOpt;

    return proxy;
}

function parseWireguardConfig(text) {
    const proxies = [];
    let sections  = { interface: null, peer: null };
    let current   = null;

    function tryBuild() {
        if (sections.interface && sections.peer) {
            const p = buildWgFromSections(sections.interface, sections.peer);
            if (p) proxies.push(p);
        }
    }

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || line.startsWith(';')) continue;

        const secMatch = line.match(/^\[(\w+)\]$/);
        if (secMatch) {
            const secName = secMatch[1].toLowerCase();
            if (secName === 'peer' && sections.peer && Object.keys(sections.peer).length > 0) {
                tryBuild();
                sections.peer = {};
            } else if (secName === 'peer') {
                sections.peer = {};
            } else if (secName === 'interface') {
                sections.interface = {};
            }
            current = secName;
            continue;
        }

        if (current && sections[current] !== null) {
            const kv = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
            if (kv) {
                sections[current][kv[1].trim()] = kv[2].trim();
            }
        }
    }

    tryBuild();
    return proxies;
}

function buildWgFromSections(iface, peer) {
    const endpoint = peer.Endpoint || peer.endpoint || "";
    let server = "", port = 0;
    if (endpoint) {
        const ipv6Match = endpoint.match(/^\[([^\]]+)\]:(\d+)$/);
        if (ipv6Match) {
            server = ipv6Match[1];
            port   = parseInt(ipv6Match[2]);
        } else {
            const lastColon = endpoint.lastIndexOf(":");
            if (lastColon > 0) {
                server = endpoint.substring(0, lastColon);
                port   = parseInt(endpoint.substring(lastColon + 1));
            }
        }
    }
    if (!server || !port) return null;

    const privKey = iface.PrivateKey || iface.privatekey || "";
    const pubKey  = peer.PublicKey   || peer.publickey   || "";
    if (!privKey || !pubKey) return null;

    const rawAddr   = iface.Address || iface.address || "";
    const addresses = rawAddr.split(",").map(s => s.trim().split("/")[0]);
    let ip   = "";
    let ipv6 = "";
    for (const addr of addresses) {
        if (addr.includes(":")) { if (!ipv6) ipv6 = addr; }
        else                    { if (!ip)   ip   = addr; }
    }
    if (!ip) ip = "10.0.0.1";

    const proxy = {
        name:          "",
        type:          "wireguard",
        server,
        port,
        ip,
        "private-key": privKey,
        "public-key":  pubKey,
        udp:           true,
    };
    if (ipv6) proxy.ipv6 = ipv6;

    const allowed = peer.AllowedIPs || peer.allowedips || "0.0.0.0/0";
    proxy["allowed-ips"] = allowed.split(",").map(s => s.trim()).filter(Boolean);

    const mtu = iface.MTU || iface.mtu;
    if (mtu) proxy.mtu = parseInt(mtu);

    const ka = peer.PersistentKeepalive || peer.persistentkeepalive;
    if (ka) proxy["persistent-keepalive"] = parseInt(ka);

    const psk = peer.PresharedKey || peer.presharedkey;
    if (psk) proxy["pre-shared-key"] = psk;

    const dns = iface.DNS || iface.dns;
    if (dns) {
        proxy["remote-dns-resolve"] = true;
        proxy.dns = dns.split(",").map(s => s.trim()).filter(Boolean);
    }

    const awgMap = {
        Jc:"jc", Jmin:"jmin", Jmax:"jmax", H1:"h1", H2:"h2", H3:"h3", H4:"h4",
        S1:"s1", S2:"s2", I1:"i1", I2:"i2", I3:"i3", I4:"i4", I5:"i5",
        J1:"j1", J2:"j2", J3:"j3", Itime:"itime"
    };
    const awgOpt = {};
    for (const [ifaceKey, outKey] of Object.entries(awgMap)) {
        const v = iface[ifaceKey];
        if (v !== undefined && v !== "") {
            const num = Number(v);
            awgOpt[outKey] = isNaN(num) ? v : num;
        }
    }
    if (Object.keys(awgOpt).length > 0) proxy["amnezia-wg-option"] = awgOpt;

    return proxy;
}

function parseTuic(link) {
    const url = new URL(link.replace(/^tuic:\/\//i, "http://"));

    const tokenParam       = url.searchParams.get("token");
    const uuidFromUsername = safeDecode(url.username) || "";
    const passwordFromUrl  = safeDecode(url.password) || "";

    const proxy = {
        name:   safeDecode(url.hash.substring(1) || url.hostname),
        type:   "tuic",
        server: url.hostname,
        port:   parseInt(url.port),
        udp:    true
    };

    if (tokenParam) {
        proxy.token = tokenParam;
    } else if (uuidFromUsername) {
        proxy.uuid     = uuidFromUsername;
        proxy.password = passwordFromUrl;
    }

    const sni = url.searchParams.get("sni");
    if (sni) proxy.sni = sni;

    const alpn = url.searchParams.get("alpn");
    if (alpn) proxy.alpn = alpn.split(",");

    const congestion = url.searchParams.get("congestion_control") || url.searchParams.get("congestion-control");
    if (congestion) proxy["congestion-controller"] = congestion;

    const udpRelay = url.searchParams.get("udp_relay_mode") || url.searchParams.get("udp-relay-mode");
    if (udpRelay) proxy["udp-relay-mode"] = udpRelay;

    const insecure = url.searchParams.get("insecure") || url.searchParams.get("allowInsecure");
    if (insecure === "1" || insecure === "true") proxy["skip-cert-verify"] = true;

    const fp = url.searchParams.get("fp");
    if (fp) proxy["client-fingerprint"] = fp;

    return proxy;
}

function parseSocks(link) {
    const url = new URL(link.replace(/^(socks|socks5):\/\//i, "http://"));
    const p = {
        name:   safeDecode(url.hash.substring(1) || url.hostname),
        type:   "socks5",
        server: url.hostname,
        port:   parseInt(url.port) || 1080,
        udp:    true,
    };
    const u = safeDecode(url.username);
    const w = safeDecode(url.password);
    if (u && w) { p.username = u; p.password = w; }
    return p;
}

// =====================================================
// ۹. Normalize & Fix
// =====================================================
function normalizeProxy(p) {
    if (p.port) p.port = parseInt(p.port);

    if (p.ip   && typeof p.ip   === 'string') p.ip   = p.ip.split("/")[0].trim();
    if (p.ipv6 && typeof p.ipv6 === 'string') p.ipv6 = p.ipv6.split("/")[0].trim();

    // amnezia-wg-option — string عددی به number
    if (p["amnezia-wg-option"] && typeof p["amnezia-wg-option"] === "object") {
        const awg = p["amnezia-wg-option"];
        for (const k in awg) {
            if (typeof awg[k] === "string" && awg[k].trim() !== "" && !isNaN(Number(awg[k]))) {
                awg[k] = Number(awg[k]);
            }
        }
    }

    // فیلدهایی که باید string باشند
    const forceStringFields = ['username', 'password', 'uuid', 'token', 'cipher',
                               'sni', 'servername', 'flow', 'obfs', 'obfs-password',
                               'private-key', 'public-key', 'pre-shared-key'];
    for (const f of forceStringFields) {
        if (p[f] !== undefined && p[f] !== null && typeof p[f] !== 'string') {
            p[f] = String(p[f]);
        }
    }

    // username که base64 encoded "user:password" است
    if (p.username && typeof p.username === 'string' && !p.password) {
        const decoded = normalizeBase64(p.username);
        if (decoded && decoded.includes(':')) {
            const colonIdx = decoded.indexOf(':');
            const u = decoded.substring(0, colonIdx);
            const w = decoded.substring(colonIdx + 1);
            if (u && w) {
                p.username = u;
                p.password = w;
            }
        }
    }

    // username/password خالی
    if (p.username !== undefined && (p.username === "" || p.username === null)) delete p.username;
    if (p.password !== undefined && (p.password === "" || p.password === null)) {
        if (!["trojan","hysteria2","anytls","tuic","ss","mieru","shadowquic"].includes(p.type)) {
            delete p.password;
        }
    }

    // socks5 — اگه password هست ولی username نیست (یا برعکس)
    if (p.type === "socks5") {
        const hasUser = p.username && p.username !== "";
        const hasPass = p.password && p.password !== "";
        if (hasUser && !hasPass) { delete p.username; }
        if (hasPass && !hasUser) { delete p.password; }
    }

    // نرمال‌سازی reserved
    if (p.reserved !== undefined && !Array.isArray(p.reserved)) {
        if (typeof p.reserved === 'string' && p.reserved.trim() !== '') {
            const parts = p.reserved.split(",").map(Number);
            if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
                p.reserved = parts;
            } else {
                try {
                    let b64 = p.reserved.trim().replace(/-/g, "+").replace(/_/g, "/");
                    const pad = b64.length % 4;
                    if (pad === 2) b64 += "==";
                    else if (pad === 3) b64 += "=";
                    const bytes = Buffer.from(b64, 'base64');
                    if (bytes.length === 3) p.reserved = [...bytes];
                    else delete p.reserved;
                } catch (_) { delete p.reserved; }
            }
        } else { delete p.reserved; }
    }

    if (p["dialer-proxy"] !== undefined &&
        (p["dialer-proxy"] === "" || p["dialer-proxy"] === null)) {
        delete p["dialer-proxy"];
    }

    // network validation
    if (p.network !== undefined) {
        const validNetworks = ["ws", "http", "h2", "grpc"];
        if (p.network === "tcp") {
            delete p.network;
        } else if (!validNetworks.includes(p.network)) {
            delete p.network;
            delete p["ws-opts"];
            delete p["h2-opts"];
            delete p["grpc-opts"];
            delete p["http-opts"];
        }
    }

    // client-fingerprint — lowercase normalization
    if (p["client-fingerprint"] !== undefined) {
        const fpRaw = String(p["client-fingerprint"]).trim().toLowerCase();
        const validFps = new Set(["chrome","firefox","safari","ios","android","edge","360","qq","random","none"]);
        if (validFps.has(fpRaw)) {
            p["client-fingerprint"] = fpRaw;
        } else {
            delete p["client-fingerprint"];
        }
    }

    // flow — فقط xtls-rprx-vision معتبر است
    if (p.flow !== undefined) {
        if (p.flow !== "xtls-rprx-vision") delete p.flow;
    }

    // cipher validation برای vmess
    if (p.type === "vmess" && p.cipher !== undefined) {
        const validCiphers = ["auto", "none", "zero", "aes-128-gcm", "chacha20-poly1305"];
        if (!validCiphers.includes(p.cipher)) p.cipher = "auto";
    }

    // obfs validation برای hysteria2
    if (p.type === "hysteria2" && p.obfs !== undefined) {
        if (p.obfs !== "salamander") delete p.obfs;
    }

    // TUIC — V4 و V5 هم‌زمان نباشند
    if (p.type === "tuic") {
        const hasToken    = p.token    && typeof p.token    === 'string' && p.token.trim()    !== '';
        const hasUuid     = p.uuid     && typeof p.uuid     === 'string' && p.uuid.trim()     !== '';
        const hasPassword = p.password && typeof p.password === 'string' && p.password.trim() !== '';

        if (hasUuid) {
            delete p.token;
            if (!hasPassword) p.password = "";
        } else if (hasToken) {
            delete p.uuid;
            delete p.password;
        }
    }

    // plugin-opts — فیلدهای boolean که ممکنه از YAML یا URI به string تبدیل شده باشند
    if (p["plugin-opts"] && typeof p["plugin-opts"] === 'object') {
        const po = p["plugin-opts"];
        for (const k of ["mux", "tls", "skip-cert-verify"]) {
            if (typeof po[k] === 'string') {
                po[k] = po[k] === "true" || po[k] === "1";
            }
        }
        // username/password در plugin-opts باید هر دو باشند یا هیچکدام
        const poHasUser = po.username && po.username !== "";
        const poHasPass = po.password && po.password !== "";
        if (poHasUser && !poHasPass) { delete po.username; }
        if (poHasPass && !poHasUser) { delete po.password; }
    }

    // WireGuard peers — از اولین peer بگیر اگر سطح بالا خالی بود
    if (p.type === "wireguard" && Array.isArray(p.peers) && p.peers.length > 0) {
        const firstPeer = p.peers[0];
        if ((!p.server || p.server.trim() === '') && firstPeer.server) {
            p.server = firstPeer.server;
        }
        if ((!p.port || p.port === 0) && firstPeer.port) {
            p.port = parseInt(firstPeer.port);
        }
        if ((!p["public-key"] || p["public-key"].trim() === '') && firstPeer["public-key"]) {
            p["public-key"] = firstPeer["public-key"];
        }
        if (!p["allowed-ips"] && firstPeer["allowed-ips"]) {
            p["allowed-ips"] = firstPeer["allowed-ips"];
        }
    }

    return p;
}

function fixProxyArrayFields(p) {
    // http-opts.path باید array باشد
    if (p["http-opts"] && typeof p["http-opts"] === 'object') {
        const ho = p["http-opts"];
        if (ho.path !== undefined && !Array.isArray(ho.path)) {
            ho.path = typeof ho.path === 'string' && ho.path.trim() !== ''
                ? ho.path.split(",").map(s => s.trim()).filter(Boolean)
                : [];
        }
        if (ho.headers && typeof ho.headers === 'object') {
            for (const k in ho.headers) {
                if (!Array.isArray(ho.headers[k])) {
                    ho.headers[k] = ho.headers[k] !== undefined && ho.headers[k] !== null
                        ? [String(ho.headers[k])]
                        : [];
                }
            }
        }
    }

    // h2-opts.host باید array باشد
    if (p["h2-opts"] && typeof p["h2-opts"] === 'object') {
        const h2 = p["h2-opts"];
        if (h2.host !== undefined) {
            if (!Array.isArray(h2.host)) {
                if (typeof h2.host === 'string' && h2.host.trim() !== '') {
                    h2.host = [h2.host.trim()];
                } else {
                    delete h2.host;
                }
            }
        }
    }

    if (p.type === "wireguard" || p.type === "wg") {
        if (p["allowed-ips"] !== undefined && !Array.isArray(p["allowed-ips"])) {
            if (typeof p["allowed-ips"] === 'string' && p["allowed-ips"].trim() !== '') {
                p["allowed-ips"] = p["allowed-ips"].split(",").map(s => s.trim()).filter(Boolean);
            } else { delete p["allowed-ips"]; }
        }
        if (p.dns !== undefined && !Array.isArray(p.dns)) {
            if (typeof p.dns === 'string' && p.dns.trim() !== '') {
                p.dns = p.dns.split(",").map(s => s.trim()).filter(Boolean);
            } else { delete p.dns; }
        }
        // reserved — base64 یا comma-separated به [n,n,n]
        if (p.reserved !== undefined && !Array.isArray(p.reserved)) {
            if (typeof p.reserved === 'string' && p.reserved.trim() !== '') {
                const parts = p.reserved.split(',').map(Number);
                if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
                    p.reserved = parts;
                } else {
                    try {
                        let b64 = p.reserved.trim().replace(/-/g, '+').replace(/_/g, '/');
                        const pad = b64.length % 4;
                        if (pad === 2) b64 += '==';
                        else if (pad === 3) b64 += '=';
                        const bytes = Buffer.from(b64, 'base64');
                        if (bytes.length === 3) p.reserved = [...bytes];
                        else delete p.reserved;
                    } catch (_) { delete p.reserved; }
                }
            } else { delete p.reserved; }
        }
        // peers — هر peer باید allowed-ips array داشته باشد
        if (Array.isArray(p.peers)) {
            for (const peer of p.peers) {
                if (peer["allowed-ips"] !== undefined && !Array.isArray(peer["allowed-ips"])) {
                    if (typeof peer["allowed-ips"] === 'string' && peer["allowed-ips"].trim() !== '') {
                        peer["allowed-ips"] = peer["allowed-ips"].split(",").map(s => s.trim()).filter(Boolean);
                    } else { delete peer["allowed-ips"]; }
                }
            }
        }
    }

    if (p.alpn !== undefined && !Array.isArray(p.alpn)) {
        if (typeof p.alpn === 'string' && p.alpn.trim() !== '') {
            p.alpn = p.alpn.split(",").map(s => s.trim()).filter(Boolean);
        } else { delete p.alpn; }
    }

    return p;
}

// =====================================================
// ۱۰. Validation
// =====================================================
const VALID_SS_CIPHERS = new Set([
    "aes-128-ctr", "aes-192-ctr", "aes-256-ctr",
    "aes-128-cfb", "aes-192-cfb", "aes-256-cfb",
    "aes-128-gcm", "aes-192-gcm", "aes-256-gcm",
    "aes-128-ccm", "aes-192-ccm", "aes-256-ccm",
    "aes-128-gcm-siv", "aes-256-gcm-siv",
    "chacha20-ietf", "chacha20", "xchacha20",
    "chacha20-ietf-poly1305", "xchacha20-ietf-poly1305",
    "chacha8-ietf-poly1305", "xchacha8-ietf-poly1305",
    "2022-blake3-aes-128-gcm", "2022-blake3-aes-256-gcm",
    "2022-blake3-chacha20-poly1305",
    "lea-128-gcm", "lea-192-gcm", "lea-256-gcm",
    "rabbit128-poly1305", "aegis-128l", "aegis-256",
    "aez-384", "deoxys-ii-256-128",
    "rc4-md5", "none"
]);

function valid(p) {
    if (!p.server || typeof p.server !== 'string' || p.server.trim() === '') return false;
    if (!p.port   || isNaN(p.port) || p.port < 1 || p.port > 65535)          return false;

    const blockedServers = [
        "127.0.0.1", "0.0.0.0", "localhost", "::1",
        "t.me", "github.com", "raw.githubusercontent.com", "google.com"
    ];
    if (blockedServers.some(s => p.server.toLowerCase().includes(s))) return false;

    // opts فیلدها باید object باشند
    const optsFields = ["ws-opts", "grpc-opts", "h2-opts", "reality-opts", "http-opts"];
    for (const f of optsFields) {
        if (p[f] !== undefined && (typeof p[f] !== 'object' || Array.isArray(p[f]))) return false;
    }

    // array فیلدها باید array باشند
    const arrayFields = ["allowed-ips", "dns", "alpn", "reserved"];
    for (const f of arrayFields) {
        if (p[f] !== undefined && !Array.isArray(p[f])) return false;
    }

    // اعتبارسنجی reserved
    if (p.reserved !== undefined) {
        if (!Array.isArray(p.reserved) || p.reserved.length !== 3) return false;
        if (!p.reserved.every(n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 255)) return false;
    }

    // اعتبارسنجی reality-opts
    if (p["reality-opts"]) {
        const pbk = p["reality-opts"]["public-key"];
        if (!pbk || typeof pbk !== 'string') return false;
        const cleanPbk = pbk.replace(/=/g, "").trim();
        if (cleanPbk.length !== 43 || !/^[A-Za-z0-9\-_]+$/.test(cleanPbk)) return false;
        const sid = p["reality-opts"]["short-id"];
        if (sid !== undefined && sid !== "") {
            if (typeof sid !== 'string' || !/^[0-9a-fA-F]*$/.test(sid) ||
                sid.length % 2 !== 0 || sid.length > 16) return false;
        }
    }

    switch (p.type) {
        case "vless":
            if (!p.uuid || typeof p.uuid !== 'string' || p.uuid.trim() === '') return false;
            if (!/^[0-9a-f-]{32,36}$/i.test(p.uuid.replace(/-/g, "").padEnd(32))) return false;
            break;
        case "vmess":
            if (!p.uuid || typeof p.uuid !== 'string' || p.uuid.trim() === '') return false;
            if (p.alterId === undefined || isNaN(p.alterId)) return false;
            break;
        case "trojan":
            if (!p.password || typeof p.password !== 'string' || p.password.trim() === '') return false;
            break;
        case "hysteria2":
            if (!p.password || typeof p.password !== 'string' || p.password.trim() === '') return false;
            if (p.obfs && p.obfs !== "salamander") return false;
            break;
        case "tuic": {
            const hasToken = p.token    && typeof p.token    === 'string' && p.token.trim()    !== '';
            const hasUuid  = p.uuid     && typeof p.uuid     === 'string' && p.uuid.trim()     !== '';
            const hasPass  = p.password !== undefined && typeof p.password === 'string';
            if (hasToken && !hasUuid) break;
            if (hasUuid && hasPass) break;
            return false;
        }
        case "wireguard":
            if (!p["private-key"] || p["private-key"].trim() === '') return false;
            if (!Array.isArray(p.peers) || p.peers.length === 0) {
                if (!p["public-key"] || p["public-key"].trim() === '') return false;
            }
            break;
        case "ss": {
            if (!p.cipher || !p.password) return false;
            const cipher = p.cipher.toLowerCase();
            if (!VALID_SS_CIPHERS.has(cipher)) return false;
            if (cipher === "none" && !p.plugin) return false;
            if (cipher.startsWith("2022-")) {
                try {
                    const keys      = p.password.split(":");
                    const fixedKeys = [];
                    for (const k of keys) {
                        let cleanK = k.trim().replace(/-/g, "+").replace(/_/g, "/");
                        const pad  = cleanK.length % 4;
                        if (pad === 1) return false;
                        if (pad === 2) cleanK += "==";
                        if (pad === 3) cleanK += "=";
                        if (!/^[A-Za-z0-9+/]+=*$/.test(cleanK)) return false;
                        Buffer.from(cleanK, 'base64');
                        fixedKeys.push(cleanK);
                    }
                    p.password = fixedKeys.join(":");
                } catch (_) { return false; }
            }
            break;
        }
        case "anytls":
            if (!p.password || p.password.trim() === '') return false;
            break;
        case "socks5":
            break;
        // ssh, ssr, http — کاملاً حذف شده
        case "mieru":
            if (!p.username || !p.password) return false;
            break;
        case "sudoku":
            if (!p.key) return false;
            break;
        case "shadowquic":
            if (!p.password) return false;
            break;
            
        default:
            return false;
    }

    return true;
}

// =====================================================
// ۱۱. Dedupe
// =====================================================
function dedupe(list) {
    const m = new Map();
    for (const p of list) {
        const key = p.token || p.uuid || p.password || p["auth-str"] || p["private-key"] || p.psk || p.username || "";
        const fp  = `${p.type}|${p.server}|${p.port}|${key}`;
        if (!m.has(fp)) m.set(fp, p);
    }
    return [...m.values()];
}
// =====================================================
// سیستم تست پینگ (TCP Check)
// =====================================================
function checkTcp(host, port, timeout = 3500) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let isAlive = false;

        socket.setTimeout(timeout);

        socket.on('connect', () => {
            isAlive = true;
            socket.destroy();
        });

        socket.on('timeout', () => socket.destroy());
        socket.on('error', () => socket.destroy());
        socket.on('close', () => resolve(isAlive));

        const cleanHost = host.replace(/^\[|\]$/g, '');
        socket.connect(port, cleanHost);
    });
}

async function filterLiveProxies(proxies, concurrency = 800) {
    console.log(`\n🔍 Starting TCP Ping Check for ${proxies.length} proxies...`);
    const liveProxies = [];
    let checked = 0;

    for (let i = 0; i < proxies.length; i += concurrency) {
        const chunk = proxies.slice(i, i + concurrency);
        const promises = chunk.map(async (p) => {
            if (p.server && p.port) {
                const alive = await checkTcp(p.server, p.port, 1500);
                if (alive) liveProxies.push(p);
            }
        });
        
        await Promise.all(promises);
        checked += chunk.length;
        process.stdout.write(`\r⏳ Checked: ${checked}/${proxies.length} | Live: ${liveProxies.length}`);
    }
    
    console.log(`\n✅ Ping check done! Live proxies: ${liveProxies.length}\n`);
    return liveProxies;
}
// =====================================================
// ۱۲. تولید فایل‌های خروجی
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

    // Fisher-Yates shuffle + برش به MAX_PER_PROTOCOL
    const randomized = [];
    for (const type in grouped) {
        const group = grouped[type];
        for (let i = group.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [group[i], group[j]] = [group[j], group[i]];
        }
        randomized.push(...group.slice(0, MAX_PER_PROTOCOL));
    }

    randomized.sort((a, b) =>
        (protocolOrder[normalizeTypeName(a.type)] || 99) -
        (protocolOrder[normalizeTypeName(b.type)] || 99)
    );

    // نام‌گذاری ترتیبی
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
// =====================================================
// ۱۳. YAML Builder
// =====================================================

const PROTO_FIELDS = {
    _common:    ["udp", "ip-version", "tfo", "mptcp", "interface-name", "routing-mark", "dialer-proxy"],
    _tls:       ["tls", "sni", "servername", "fingerprint", "alpn", "skip-cert-verify",
                 "client-fingerprint", "reality-opts", "ech-opts"],
    _transport: ["network", "ws-opts", "h2-opts", "grpc-opts", "http-opts"],

    vless:     ["uuid", "flow", "packet-encoding", "encryption", "smux"],
    vmess:     ["uuid", "alterId", "cipher", "packet-encoding", "global-padding", "authenticated-length", "smux"],
    trojan:    ["password", "ss-opts", "network", "ws-opts", "grpc-opts", "smux"],
    anytls:    ["password", "idle-session-check-interval", "idle-session-timeout", "min-idle-session",
                "sni", "alpn", "skip-cert-verify", "client-fingerprint", "fingerprint"],
    ss:        ["cipher", "password", "udp-over-tcp", "udp-over-tcp-version",
                "plugin", "plugin-opts", "client-fingerprint", "smux"],
    wireguard: ["ip", "ipv6", "private-key", "public-key", "allowed-ips",
                "pre-shared-key", "reserved", "persistent-keepalive", "mtu",
                "remote-dns-resolve", "dns", "peers", "amnezia-wg-option"],
    hysteria2: ["password", "obfs", "obfs-password", "up", "down",
                "ports", "hop-interval", "fast-open",
                "sni", "skip-cert-verify", "fingerprint", "alpn", "ca", "ca-str"],
    tuic:      ["token", "uuid", "password", "ip", "heartbeat-interval",
                "disable-sni", "reduce-rtt", "request-timeout",
                "udp-relay-mode", "congestion-controller",
                "max-udp-relay-packet-size", "fast-open", "max-open-streams",
                "sni", "alpn", "skip-cert-verify", "fingerprint"],
    socks5:    ["username", "password", "tls", "skip-cert-verify", "fingerprint"],
    
    // --- پروتکل‌های اضافه‌شده ---
    mieru:     ["username", "password", "port-range", "transport", "multiplexing", "handshake-mode", "traffic-pattern", "user-hint-is-mandatory"],
    sudoku:    ["key", "aead-method", "padding-min", "padding-max", "table-type", "custom-table", "custom-tables", "multiplex", "httpmask", "enable-pure-downlink", "handshake-timeout", "fallback"],
    shadowquic: ["username", "password", "sni", "alpn", "quic-versions", "udp-over-stream", "zero-rtt", "keep-alive-interval", "congestion-controller", "up", "down", "cwnd", "bbr-profile", "max-datagram-frame-size", "max-open-streams", "recv-window-conn", "recv-window", "disable-mtu-discovery", "jls-upstream"],
};

const NESTED_OBJ_FIELDS = new Set([
    "ws-opts", "h2-opts", "grpc-opts", "http-opts",
    "reality-opts", "ech-opts", "ss-opts", "plugin-opts",
    "amnezia-wg-option", "smux", "httpmask", "jls-upstream"
]);

const ARRAY_OF_OBJ_FIELDS = new Set(["peers"]);

function yamlStr(val) {
    return '"' + String(val)
        .replace(/\\/g,  "\\\\")
        .replace(/"/g,   '\\"')
        .replace(/\n/g,  "\\n")
        .replace(/\r/g,  "\\r")
        .replace(/\t/g,  "\\t")
        .replace(/\x00/g,"") + '"';
}

function yamlValue(val) {
    if (val === null || val === undefined) return null;
    if (typeof val === 'boolean') return String(val);
    if (typeof val === 'number')  return String(val);
    if (typeof val === 'string')  return yamlStr(val);
    return null;
}

function writeNestedObj(obj, indent) {
    let out = "";
    const pad = " ".repeat(indent);
    for (const k in obj) {
        const v = obj[k];
        if (v === null || v === undefined) continue;
        if (Array.isArray(v)) {
            if (v.length === 0) continue;
            if (typeof v[0] === 'object' && v[0] !== null) {
                out += `${pad}${k}:\n`;
                for (const item of v) {
                    const keys = Object.keys(item);
                    if (keys.length === 0) continue;
                    const firstKey = keys[0];
                    const firstVal = yamlValue(item[firstKey]);
                    if (firstVal !== null) {
                        out += `${pad}  - ${firstKey}: ${firstVal}\n`;
                    } else {
                        out += `${pad}  -\n`;
                    }
                    for (let i = 1; i < keys.length; i++) {
                        const kk = keys[i];
                        const vv = item[kk];
                        if (vv === null || vv === undefined) continue;
                        if (Array.isArray(vv)) {
                            out += `${pad}    ${kk}:\n`;
                            for (const ai of vv) {
                                const sv = yamlValue(ai);
                                if (sv !== null) out += `${pad}      - ${sv}\n`;
                            }
                        } else {
                            const sv = yamlValue(vv);
                            if (sv !== null) out += `${pad}    ${kk}: ${sv}\n`;
                        }
                    }
                }
            } else {
                out += `${pad}${k}:\n`;
                for (const item of v) {
                    const sv = yamlValue(item);
                    if (sv !== null) out += `${pad}  - ${sv}\n`;
                }
            }
        } else if (typeof v === 'object') {
            out += `${pad}${k}:\n`;
            out += writeNestedObj(v, indent + 2);
        } else {
            const sv = yamlValue(v);
            if (sv !== null) out += `${pad}${k}: ${sv}\n`;
        }
    }
    return out;
}

function buildProvider(proxies) {
    let yaml = "proxies:\n";

    for (const p of proxies) {
        const protoKey      = p.type;
        const protoSpecific = PROTO_FIELDS[protoKey] || [];

        const hasTls       = !["wireguard", "hysteria2", "tuic", "ssr"].includes(p.type);
        const hasTransport = ["vless", "vmess"].includes(p.type);

        const allowedSet = new Set([
            ...PROTO_FIELDS._common,
            ...(hasTls       ? PROTO_FIELDS._tls       : []),
            ...(hasTransport ? PROTO_FIELDS._transport  : []),
            ...protoSpecific,
        ]);

        yaml += `  - name: ${yamlStr(p.name)}\n`;
        yaml += `    type: ${p.type}\n`;
        yaml += `    server: ${yamlStr(p.server)}\n`;
        yaml += `    port: ${p.port}\n`;

        for (const key of allowedSet) {
            if (["name", "type", "server", "port"].includes(key)) continue;
            const val = p[key];
            if (val === null || val === undefined || val === "") continue;

            // TUIC V4/V5 انحصاری
            if (p.type === "tuic") {
                const isTuicV4 = p.token && typeof p.token === 'string' && p.token.trim() !== '';
                if (isTuicV4 && (key === "uuid" || key === "password")) continue;
                if (!isTuicV4 && key === "token") continue;
            }

            // boolean false معنی‌دار
            if (val === false) {
                const writeFalse = ["tls", "udp", "skip-cert-verify", "tfo", "mptcp",
                                    "global-padding", "authenticated-length", "disable-sni",
                                    "reduce-rtt", "fast-open", "remote-dns-resolve",
                                    "udp-over-tcp"];
                if (writeFalse.includes(key)) {
                    yaml += `    ${key}: false\n`;
                }
                continue;
            }

            // array
            if (Array.isArray(val)) {
                if (val.length === 0) continue;
                if (ARRAY_OF_OBJ_FIELDS.has(key) && typeof val[0] === 'object') {
                    yaml += `    ${key}:\n`;
                    for (const item of val) {
                        const keys = Object.keys(item);
                        if (keys.length === 0) continue;
                        let first = true;
                        for (const k of keys) {
                            const v = item[k];
                            if (v === null || v === undefined) continue;
                            if (Array.isArray(v)) {
                                if (first) { yaml += `      -\n`; first = false; }
                                yaml += `        ${k}:\n`;
                                for (const ai of v) {
                                    const sv = yamlValue(ai);
                                    if (sv !== null) yaml += `          - ${sv}\n`;
                                }
                            } else {
                                const sv = yamlValue(v);
                                if (sv !== null) {
                                    if (first) { yaml += `      - ${k}: ${sv}\n`; first = false; }
                                    else        { yaml += `        ${k}: ${sv}\n`; }
                                }
                            }
                        }
                    }
                    continue;
                }
                yaml += `    ${key}:\n`;
                for (const item of val) {
                    const sv = yamlValue(item);
                    if (sv !== null) yaml += `      - ${sv}\n`;
                }
                continue;
            }

            // nested object
            if (typeof val === 'object' && NESTED_OBJ_FIELDS.has(key)) {
                const nestedYaml = writeNestedObj(val, 6);
                if (nestedYaml.trim() !== '') {
                    yaml += `    ${key}:\n`;
                    yaml += nestedYaml;
                }
                continue;
            }

            // simple value
            const sv = yamlValue(val);
            if (sv !== null) yaml += `    ${key}: ${sv}\n`;
        }
    }

    return yaml;
}

// =====================================================
// ۱۴. Helper Functions
// =====================================================
function normalizeBase64(v) {
    if (!v) return null;
    v = v.trim().replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
    const pad = v.length % 4;
    if (pad === 1) return null;
    if (pad === 2) v += "==";
    if (pad === 3) v += "=";
    try { return Buffer.from(v, 'base64').toString('utf-8'); }
    catch (_) { return null; }
}

function decodeSub(text) {
    return text.includes("://") ? text : (normalizeBase64(text.trim()) || text);
}

function safeDecode(str) {
    if (!str) return "";
    try { return decodeURIComponent(str); } catch (_) { return str; }
}

function sanitizeObj(obj) {
    if (typeof obj === 'string')
        return obj.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF\uFFFD]/g, "").trim();
    if (Array.isArray(obj)) return obj.map(sanitizeObj);
    if (obj !== null && typeof obj === 'object') {
        const res = {};
        for (const key in obj) res[key] = sanitizeObj(obj[key]);
        return res;
    }
    return obj;
}

// =====================================================
// Start
// =====================================================
main();
