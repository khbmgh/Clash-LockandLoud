const fs    = require('fs');
const fetch = require('node-fetch');

// =====================================================
// ۱. تنظیمات
// =====================================================
const FETCH_TIMEOUT    = 15000;
const MAX_PER_PROTOCOL = 250;

// لیست سابسکریپشن‌های شما (می‌تونی بعداً منابعت رو اینجا اضافه کنی)
const SUBS = [...new Set(`
https://raw.githubusercontent.com/10ium/base64-encoder/main/encoded/10ium_proxy_configs.txt
https://raw.githubusercontent.com/10ium/V2RayAggregator/refs/heads/master/Eternity
https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_1.txt
https://raw.githubusercontent.com/justVisiting992/xray-Config-Collector/main/mixed_iran.txt
https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/refs/heads/main/all_configs.txt
https://raw.githubusercontent.com/itsyebekhe/PSG/main/subscriptions/meta/mix
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

// =====================================================
// ۳. تشخیص فرمت و parse
// =====================================================
function detectAndParse(text) {
    const trimmed = text.trim();
    if (trimmed.startsWith('[')) {
        try { const arr = JSON.parse(trimmed); if (Array.isArray(arr)) return parseJsonProxyArray(arr); } catch (_) {}
    }
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
            if (jsonData.type && jsonData.server) { const p = parseSingboxOutbound(jsonData); return p ? [p] : []; }
        }
        const outM = trimmed.match(/"outbounds"\s*:\s*(\[[\s\S]*?\])(?:\s*[,}]|$)/);
        if (outM) {
            try { const outbounds = JSON.parse(outM[1]); if (Array.isArray(outbounds)) return parseXrayOutbounds(outbounds); } catch (_) {}
        }
    }
    if (/^\s*\[Interface\]/im.test(text)) return parseWireguardConfig(text);
    if (/^\s*proxies:/m.test(text) || /^\s*-\s*name:/m.test(text) || /^\s*-\s*\{/m.test(text)) return extractYamlConfigs(text);

    const result = [];
    for (const line of text.split("\n")) { const p = parseProxy(line.trim()); if (p) result.push(p); }
    return result;
}

function parseJsonProxyArray(arr) {
    const result = [];
    for (const item of arr) {
        if (!item || typeof item !== 'object') continue;
        if (item.server_port !== undefined || item.private_key !== undefined || item.peer_public_key !== undefined) {
            const p = parseSingboxOutbound(item); if (p) result.push(p);
        } else if (item.type || item.protocol) { result.push(item); }
    }
    return result;
}

function parseSingboxOutbound(item) {
    try {
        const type = (item.type || "").toLowerCase();
        const typeMap = { "wireguard": "wireguard", "vless": "vless", "vmess": "vmess", "trojan": "trojan", "shadowsocks": "ss", "hysteria2": "hysteria2", "socks": "socks5", "tuic": "tuic" };
        const clashType = typeMap[type];
        if (!clashType) return null;
        if (clashType === "wireguard") {
            const proxy = { name: item.tag || item.name || "", type: "wireguard", server: item.server || "", port: parseInt(item.server_port || item.port) || 0, "private-key": item.private_key || item["private-key"] || "", "public-key": item.peer_public_key || item["public-key"] || "", udp: true };
            proxy["allowed-ips"] = ["0.0.0.0/0", "::/0"];
            return proxy;
        }
        const proxy = { name: item.tag || item.name || "", type: clashType, server: item.server || "", port: parseInt(item.server_port || item.port) || 0 };
        if (item.uuid) proxy.uuid = item.uuid;
        if (item.password) proxy.password = item.password;
        return proxy;
    } catch (_) { return null; }
}

function parseXrayOutbounds(outbounds) { return []; } 
function extractYamlConfigs(text) { return []; }
function parseWireguardConfig(text) { return []; }
function parseProxy(line) {
    try {
        const l = line.toLowerCase();
        if (l.startsWith("vless://")) return parseVless(line);
        if (l.startsWith("vmess://")) return parseVmess(line);
        if (l.startsWith("trojan://")) return parseTrojan(line);
        if (l.startsWith("ss://")) return parseSS(line);
        if (l.startsWith("hy2://") || l.startsWith("hysteria2://")) return parseHysteria2(line);
    } catch (_) {}
    return null;
}

function parseVless(link) {
    const url = new URL(link.replace(/^vless:\/\//i, "http://"));
    return { name: safeDecode(url.hash.substring(1) || url.hostname), type: "vless", server: url.hostname, port: parseInt(url.port), uuid: url.username || "", udp: true };
}
function parseVmess(link) {
    try {
        const fixed = normalizeBase64(link.replace(/^vmess:\/\//i, ""));
        const j = JSON.parse(fixed);
        return { name: safeDecode(j.ps || j.add), type: "vmess", server: j.add, port: parseInt(j.port), uuid: j.id || "", alterId: parseInt(j.aid) || 0, cipher: "auto", udp: true };
    } catch (_) { return null; }
}
function parseTrojan(link) {
    const url = new URL(link.replace(/^trojan:\/\//i, "http://"));
    return { name: safeDecode(url.hash.substring(1) || url.hostname), type: "trojan", server: url.hostname, port: parseInt(url.port), password: safeDecode(url.username) || "", udp: true };
}
function parseSS(link) { return null; } 
function parseHysteria2(link) {
    const url = new URL(link.replace(/^(hy2|hysteria2):\/\//i, "http://"));
    return { name: safeDecode(url.hash.substring(1) || url.hostname), type: "hysteria2", server: url.hostname, port: parseInt(url.port), password: safeDecode(url.username) || "", udp: true };
}

// =====================================================
// نرمال‌سازی و اعتبار سنجی
// =====================================================
function normalizeProxy(p) {
    if (p.port) p.port = parseInt(p.port);
    return p;
}

function fixProxyArrayFields(p) { return p; }

function valid(p) {
    if (!p.server || typeof p.server !== 'string' || p.server.trim() === '') return false;
    if (!p.port || isNaN(p.port) || p.port < 1 || p.port > 65535) return false;
    return true;
}

// =====================================================
// توابع کلیدی و ابزارهای کمکی
// =====================================================
function dedupe(list) {
    const m = new Map();
    for (const p of list) {
        const key = p.token || p.uuid || p.password || p["private-key"] || p.username || "";
        const fp  = `${p.type}|${p.server}|${p.port}|${key}`;
        if (!m.has(fp)) m.set(fp, p);
    }
    return [...m.values()];
}

function normalizeBase64(v) {
    if (!v) return null;
    v = v.trim().replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
    const pad = v.length % 4;
    if (pad === 1) return null;
    if (pad === 2) v += "==";
    if (pad === 3) v += "=";
    try { return Buffer.from(v, 'base64').toString('utf-8'); } catch (_) { return null; }
}

function decodeSub(text) {
    return text.includes("://") ? text : (normalizeBase64(text.trim()) || text);
}

function safeDecode(str) {
    if (!str) return "";
    try { return decodeURIComponent(str); } catch (_) { return str; }
}

function sanitizeObj(obj) {
    if (typeof obj === 'string') return obj.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF\uFFFD]/g, "").trim();
    if (Array.isArray(obj)) return obj.map(sanitizeObj);
    if (obj !== null && typeof obj === 'object') {
        const res = {}; for (const key in obj) res[key] = sanitizeObj(obj[key]); return res;
    }
    return obj;
}

// =====================================================
// خروجی نهایی (all.yaml)
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
    const protocolOrder = { "hy2": 1, "vless": 2, "trojan": 3, "ss": 4, "vmess": 5, "wg": 6 };

    const grouped = {};
    for (const p of proxies) {
        if (!grouped[p.type]) grouped[p.type] = [];
        grouped[p.type].push(p);
    }

    const randomized = [];
    for (const type in grouped) {
        const group = grouped[type];
        for (let i = group.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [group[i], group[j]] = [group[j], group[i]];
        }
        randomized.push(...group.slice(0, MAX_PER_PROTOCOL));
    }

    randomized.sort((a, b) => (protocolOrder[normalizeTypeName(a.type)] || 99) - (protocolOrder[normalizeTypeName(b.type)] || 99));

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

function yamlStr(val) {
    return '"' + String(val).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
}

function buildProvider(proxies) {
    let yaml = "proxies:\n";
    for (const p of proxies) {
        yaml += `  - name: ${yamlStr(p.name)}\n    type: ${p.type}\n    server: ${yamlStr(p.server)}\n    port: ${p.port}\n`;
        for (const key in p) {
            if (["name", "type", "server", "port"].includes(key)) continue;
            const val = p[key];
            if (val === null || val === undefined || val === "") continue;
            if (typeof val === 'boolean') { yaml += `    ${key}: ${val}\n`; continue; }
            if (typeof val === 'number') { yaml += `    ${key}: ${val}\n`; continue; }
            if (typeof val === 'string') { yaml += `    ${key}: ${yamlStr(val)}\n`; }
        }
    }
    return yaml;
}

// Start
main();
