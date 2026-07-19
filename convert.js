const fs = require('fs');

// =====================================================
// convert.js — تبدیل all.yaml به فرمت‌های V2Ray و Sing-Box
// ورودی: all.yaml (خروجی aggregator)
// خروجی:
//   v2ray_links.txt     — لینک‌های URI (vless:// vmess:// ...)
//   v2ray_base64.txt    — همان لینک‌ها به صورت base64
//   singbox.json        — فایل کامل sing-box
// =====================================================

// ── ۱. خواندن و parse ساده YAML proxies ──────────────────
function parseProxiesYaml(text) {
    const proxies = [];
    let current = null;
    let currentNestedKey = null;
    let currentNestedIndent = 0;
    const knownListKeys = new Set(["allowed-ips", "dns", "alpn", "peers", "reserved", "host"]);

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine;
        if (line.trim().startsWith('#')) continue;

        // شروع آیتم جدید با "  - name:"
        const listMatch = line.match(/^(\s*)-\s+name:\s*(.*)$/);
        if (listMatch) {
            if (current) proxies.push(current);
            current = { name: stripQuotes(listMatch[2].trim()) };
            currentNestedKey = null;
            currentNestedIndent = 0;
            continue;
        }

        if (!current) continue;

        // آیتم آرایه
        const arrItem = line.match(/^(\s+)-\s+(.*)$/);
        if (arrItem && currentNestedKey) {
            const indent = arrItem[1].length;
            if (indent > currentNestedIndent) {
                if (!Array.isArray(current[currentNestedKey])) current[currentNestedKey] = [];
                current[currentNestedKey].push(parseYamlScalar(arrItem[2].trim()));
                continue;
            }
        }

        // key: value
        const kv = line.match(/^(\s+)([a-zA-Z0-9_\-]+):\s*(.*)$/);
        if (!kv) continue;
        const indent = kv[1].length;
        const key = kv[2];
        const valStr = kv[3].trim();

        if (valStr === '') {
            currentNestedKey = key;
            currentNestedIndent = indent;
            if (knownListKeys.has(key)) current[key] = [];
            else current[key] = {};
        } else if (currentNestedKey && indent > currentNestedIndent && typeof current[currentNestedKey] === 'object' && !Array.isArray(current[currentNestedKey])) {
            current[currentNestedKey][key] = parseYamlScalar(valStr);
        } else {
            currentNestedKey = null;
            current[key] = parseYamlScalar(valStr);
        }
    }
    if (current) proxies.push(current);
    return proxies;
}

function parseYamlScalar(v) {
    if (!v || v === '') return v;
    v = stripQuotes(v);
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (/^-?\d+$/.test(v)) return Number(v);
    return v;
}

function stripQuotes(s) {
    if (!s) return s;
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
        return s.slice(1, -1);
    return s;
}

// ── ۲. تبدیل به URI لینک ─────────────────────────────────
function proxyToUri(p) {
    try {
        switch (p.type) {
            case 'vless':     return vlessToUri(p);
            case 'vmess':     return vmessToUri(p);
            case 'trojan':    return trojanToUri(p);
            case 'ss':        return ssToUri(p);
            case 'hysteria2': return hy2ToUri(p);
            case 'tuic':      return tuicToUri(p);
            case 'wireguard': return wgToUri(p);
            case 'socks5':    return socksToUri(p);
            case 'http':      return httpToUri(p);
            case 'ssh':       return sshToUri(p);
            default: return null;
        }
    } catch (_) { return null; }
}

function enc(s) { return encodeURIComponent(s || ''); }

function vlessToUri(p) {
    const params = new URLSearchParams();
    params.set('type', p.network || 'tcp');
    if (p.tls) params.set('security', p['reality-opts'] ? 'reality' : 'tls');
    if (p.servername || p.sni) params.set('sni', p.servername || p.sni);
    if (p['client-fingerprint']) params.set('fp', p['client-fingerprint']);
    if (p.alpn) params.set('alpn', [].concat(p.alpn).join(','));
    if (p.flow) params.set('flow', p.flow);
    if (p['skip-cert-verify']) params.set('allowInsecure', '1');
    if (p['reality-opts']) {
        params.set('pbk', p['reality-opts']['public-key'] || '');
        if (p['reality-opts']['short-id']) params.set('sid', p['reality-opts']['short-id']);
    }
    if (p['ws-opts']) {
        if (p['ws-opts'].path) params.set('path', p['ws-opts'].path);
        if (p['ws-opts'].headers?.Host) params.set('host', p['ws-opts'].headers.Host);
    }
    if (p['grpc-opts']?.['grpc-service-name']) params.set('serviceName', p['grpc-opts']['grpc-service-name']);
    if (p['h2-opts']) {
        if (p['h2-opts'].path) params.set('path', p['h2-opts'].path);
        if (p['h2-opts'].host) params.set('host', [].concat(p['h2-opts'].host)[0]);
    }
    return `vless://${enc(p.uuid)}@${p.server}:${p.port}?${params.toString()}#${enc(p.name)}`;
}

function vmessToUri(p) {
    const obj = {
        v: "2", ps: p.name, add: p.server, port: String(p.port),
        id: p.uuid, aid: String(p.alterId || 0),
        net: p.network || 'tcp', type: 'none',
        tls: p.tls ? 'tls' : '',
    };
    if (p.servername || p.sni) obj.sni = p.servername || p.sni;
    if (p['client-fingerprint']) obj.fp = p['client-fingerprint'];
    if (p.alpn) obj.alpn = [].concat(p.alpn).join(',');
    if (p['ws-opts']) {
        obj.path = p['ws-opts'].path || '';
        obj.host = p['ws-opts'].headers?.Host || '';
    }
    if (p['grpc-opts']) obj.path = p['grpc-opts']['grpc-service-name'] || '';
    if (p['h2-opts']) {
        obj.path = p['h2-opts'].path || '';
        obj.host = [].concat(p['h2-opts'].host || [])[0] || '';
    }
    return 'vmess://' + Buffer.from(JSON.stringify(obj)).toString('base64');
}

function trojanToUri(p) {
    const params = new URLSearchParams();
    if (p.network && p.network !== 'tcp') params.set('type', p.network);
    if (p.sni) params.set('sni', p.sni);
    if (p['client-fingerprint']) params.set('fp', p['client-fingerprint']);
    if (p.alpn) params.set('alpn', [].concat(p.alpn).join(','));
    if (p['skip-cert-verify']) params.set('allowInsecure', '1');
    if (p['ws-opts']) {
        if (p['ws-opts'].path) params.set('path', p['ws-opts'].path);
        if (p['ws-opts'].headers?.Host) params.set('host', p['ws-opts'].headers.Host);
    }
    if (p['grpc-opts']?.['grpc-service-name']) params.set('serviceName', p['grpc-opts']['grpc-service-name']);
    return `trojan://${enc(p.password)}@${p.server}:${p.port}?${params.toString()}#${enc(p.name)}`;
}

function ssToUri(p) {
    const auth = Buffer.from(`${p.cipher}:${p.password}`).toString('base64');
    let uri = `ss://${auth}@${p.server}:${p.port}`;
    
    if (p.plugin) {
        const opts = [];
        opts.push(p.plugin);
        if (p['plugin-opts']) {
            for (const [k, v] of Object.entries(p['plugin-opts'])) {
                opts.push(`${k}=${v}`);
            }
        }
        uri += `?plugin=${encodeURIComponent(opts.join(';'))}`;
    }
    
    uri += `#${enc(p.name)}`;
    return uri;
}

function hy2ToUri(p) {
    const params = new URLSearchParams();
    if (p.sni) params.set('sni', p.sni);
    if (p['skip-cert-verify']) params.set('insecure', '1');
    if (p.alpn) params.set('alpn', [].concat(p.alpn).join(','));
    if (p.obfs) {
        params.set('obfs', p.obfs);
        if (p['obfs-password']) params.set('obfs-password', p['obfs-password']);
    }
    if (p.up) params.set('up', p.up);
    if (p.down) params.set('down', p.down);
    return `hy2://${enc(p.password)}@${p.server}:${p.port}?${params.toString()}#${enc(p.name)}`;
}

function tuicToUri(p) {
    const params = new URLSearchParams();
    if (p.sni) params.set('sni', p.sni);
    if (p.alpn) params.set('alpn', [].concat(p.alpn).join(','));
    if (p['congestion-controller']) params.set('congestion_control', p['congestion-controller']);
    if (p['udp-relay-mode']) params.set('udp_relay_mode', p['udp-relay-mode']);
    if (p['skip-cert-verify']) params.set('insecure', '1');
    return `tuic://${enc(p.uuid)}:${enc(p.password)}@${p.server}:${p.port}?${params.toString()}#${enc(p.name)}`;
}

function wgToUri(p) {
    const params = new URLSearchParams();
    params.set('publickey', p['public-key'] || '');
    if (p.ip) params.set('address', p.ip + (p.ipv6 ? `,${p.ipv6}` : ''));
    if (p['allowed-ips']) params.set('allowedIPs', [].concat(p['allowed-ips']).join(','));
    if (p.reserved) params.set('reserved', [].concat(p.reserved).join(','));
    if (p.mtu) params.set('mtu', p.mtu);
    return `wireguard://${enc(p['private-key'])}@${p.server}:${p.port}?${params.toString()}#${enc(p.name)}`;
}

function socksToUri(p) {
    const auth = (p.username || p.password) ? `${enc(p.username)}:${enc(p.password)}@` : '';
    return `socks5://${auth}${p.server}:${p.port}#${enc(p.name)}`;
}

function httpToUri(p) {
    const scheme = p.tls ? 'https' : 'http';
    const auth = (p.username || p.password) ? `${enc(p.username)}:${enc(p.password)}@` : '';
    return `${scheme}://${auth}${p.server}:${p.port}#${enc(p.name)}`;
}

function sshToUri(p) {
    const auth = p.username ? `${enc(p.username)}${p.password ? ':' + enc(p.password) : ''}@` : '';
    return `ssh://${auth}${p.server}:${p.port}#${enc(p.name)}`;
}

// ── ۳. تبدیل به Sing-Box outbound ────────────────────────
function proxyToSingbox(p) {
    try {
        switch (p.type) {
            case 'vless':     return vlessToSingbox(p);
            case 'vmess':     return vmessToSingbox(p);
            case 'trojan':    return trojanToSingbox(p);
            case 'ss':        return ssToSingbox(p);
            case 'hysteria2': return hy2ToSingbox(p);
            case 'tuic':      return tuicToSingbox(p);
            case 'wireguard': return wgToSingbox(p);
            case 'socks5':    return socksToSingbox(p);
            case 'http':      return httpToSingbox(p);
            case 'ssh':       return sshToSingbox(p);
            default: return null;
        }
    } catch (_) { return null; }
}

function buildTlsObj(p) {
    const tls = { enabled: true };
    
    if (p.servername || p.sni) tls.server_name = String(p.servername || p.sni);
    if (p['skip-cert-verify']) tls.insecure = true;
    if (p.alpn) tls.alpn = [].concat(p.alpn).map(String);
    
    if (p['client-fingerprint']) {
        tls.utls = { enabled: true, fingerprint: String(p['client-fingerprint']) };
    } else if (p['reality-opts']) {
        tls.utls = { enabled: true, fingerprint: "chrome" };
    }

    if (p['reality-opts']) {
        const shortId = p['reality-opts']['short-id'] ? String(p['reality-opts']['short-id']) : '';
        
        tls.reality = {
            enabled: true,
            public_key: String(p['reality-opts']['public-key'] || '')
        };

        // شرط جدید: فقط اگه short_id معتبر و زوج بود اضافه بشه
        if (shortId.length > 0 && shortId.length % 2 === 0) {
            tls.reality.short_id = shortId;
        }
    }
    
    return tls;
}
function buildTransport(p) {
    if (!p.network || p.network === 'tcp') return null;
    if (p.network === 'ws') {
        const t = { type: 'ws' };
        if (p['ws-opts']?.path) t.path = String(p['ws-opts'].path);
        if (p['ws-opts']?.headers) {
            t.headers = {};
            for (const [k, v] of Object.entries(p['ws-opts'].headers)) {
                t.headers[k] = String(v);
            }
        }
        return t;
    }
    if (p.network === 'grpc') {
        return { type: 'grpc', service_name: p['grpc-opts']?.['grpc-service-name'] ? String(p['grpc-opts']['grpc-service-name']) : '' };
    }
    if (p.network === 'h2') {
        const t = { type: 'http' };
        if (p['h2-opts']?.path) t.path = String(p['h2-opts'].path);
        if (p['h2-opts']?.host) t.host = [].concat(p['h2-opts'].host).map(String);
        return t;
    }
    return null;
}

function vlessToSingbox(p) {
    const out = {
        tag: String(p.name), type: 'vless',
        server: String(p.server), server_port: parseInt(p.port, 10),
        uuid: String(p.uuid),
    };
    if (p.flow) out.flow = String(p.flow);
    if (p.tls) out.tls = buildTlsObj(p);
    const transport = buildTransport(p);
    if (transport) out.transport = transport;
    return out;
}

function vmessToSingbox(p) {
    const out = {
        tag: String(p.name), type: 'vmess',
        server: String(p.server), server_port: parseInt(p.port, 10),
        uuid: String(p.uuid), alter_id: parseInt(p.alterId || 0, 10),
        security: p.cipher ? String(p.cipher) : 'auto',
    };
    if (p.tls) out.tls = buildTlsObj(p);
    const transport = buildTransport(p);
    if (transport) out.transport = transport;
    return out;
}

function trojanToSingbox(p) {
    const out = {
        tag: String(p.name), type: 'trojan',
        server: String(p.server), server_port: parseInt(p.port, 10),
        password: String(p.password),
    };
    out.tls = buildTlsObj(p);
    const transport = buildTransport(p);
    if (transport) out.transport = transport;
    return out;
}
function ssToSingbox(p) {
    // اگر پلاگین چیزی غیر از v2ray-plugin باشه (مثل simple-obfs)، 
    // چون سینگ‌باکس بدون فایل جانبی کرش می‌کنه، این کانفیگ رو برای سینگ‌باکس حذف می‌کنیم (null برمی‌گردونیم)
    if (p.plugin && p.plugin !== 'v2ray-plugin') {
        return null; 
    }

    const out = {
        tag: String(p.name), type: 'shadowsocks',
        server: String(p.server), server_port: parseInt(p.port, 10),
        method: String(p.cipher), password: String(p.password),
    };

    // فقط v2ray-plugin رو به استانداردِ سینگ‌باکس (WS/TLS) ترجمه می‌کنیم
    if (p.plugin === 'v2ray-plugin') {
        const opts = p['plugin-opts'] || {};
        if (opts.tls) {
            out.tls = { enabled: true };
            if (opts.host) out.tls.server_name = String(opts.host);
            if (opts['skip-cert-verify']) out.tls.insecure = true;
        }
        if (opts.mode === 'websocket') {
            out.transport = { type: 'ws' };
            if (opts.path) out.transport.path = String(opts.path);
            if (opts.host) out.transport.headers = { Host: String(opts.host) };
        }
    }
    
    return out;
}
function hy2ToSingbox(p) {
    const out = {
        tag: String(p.name), type: 'hysteria2',
        server: String(p.server), server_port: parseInt(p.port, 10),
        password: String(p.password),
    };
    const tls = { enabled: true };
    if (p.sni) tls.server_name = String(p.sni);
    if (p['skip-cert-verify']) tls.insecure = true;
    if (p.alpn) tls.alpn = [].concat(p.alpn).map(String);
    out.tls = tls;
    if (p.obfs === 'salamander') out.obfs = { type: 'salamander', password: p['obfs-password'] ? String(p['obfs-password']) : '' };
    if (p.up) out.up_mbps = parseInt(p.up, 10) || undefined;
    if (p.down) out.down_mbps = parseInt(p.down, 10) || undefined;
    return out;
}

function tuicToSingbox(p) {
    const out = {
        tag: String(p.name), type: 'tuic',
        server: String(p.server), server_port: parseInt(p.port, 10),
        uuid: String(p.uuid), password: String(p.password),
    };
    if (p['congestion-controller']) out.congestion_control = String(p['congestion-controller']);
    if (p['udp-relay-mode']) out.udp_relay_mode = String(p['udp-relay-mode']);
    const tls = { enabled: true };
    if (p.sni) tls.server_name = String(p.sni);
    if (p['skip-cert-verify']) tls.insecure = true;
    if (p.alpn) tls.alpn = [].concat(p.alpn).map(String);
    out.tls = tls;
    return out;
}

function wgToSingbox(p) {
    const address = [];
    if (p.ip) address.push(`${p.ip}/32`);
    if (p.ipv6) address.push(`${p.ipv6}/128`);
    
    const out = {
        tag: String(p.name), 
        type: 'wireguard',
        system: false,
        address,
        private_key: String(p['private-key']),
        peers: [
            {
                server: String(p.server),
                server_port: parseInt(p.port, 10),
                public_key: String(p['public-key']),
            }
        ]
    };
    
    if (p['allowed-ips']) out.peers[0].allowed_ips = [].concat(p['allowed-ips']);
    if (p.reserved) out.peers[0].reserved = [].concat(p.reserved).map(Number);
    if (p.mtu) out.mtu = parseInt(p.mtu, 10);
    return out;
}

function socksToSingbox(p) {
    const out = {
        tag: String(p.name), type: 'socks',
        server: String(p.server), server_port: parseInt(p.port, 10), version: '5',
    };
    if (p.username) out.username = String(p.username);
    if (p.password) out.password = String(p.password);
    return out;
}

function httpToSingbox(p) {
    const out = {
        tag: String(p.name), type: 'http',
        server: String(p.server), server_port: parseInt(p.port, 10),
    };
    if (p.username) out.username = String(p.username);
    if (p.password) out.password = String(p.password);
    if (p.tls) out.tls = { enabled: true };
    return out;
}

function sshToSingbox(p) {
    const out = {
        tag: String(p.name), type: 'ssh',
        server: String(p.server), server_port: parseInt(p.port, 10),
    };
    if (p.username) out.user = String(p.username);
    if (p.password) out.password = String(p.password);
    return out;
}
// ── ۴. ساخت فایل کامل Sing-Box ───────────────────────────
function buildSingboxConfig(outboundsRaw) {
    const endpoints = [];
    const outbounds = [];

    for (const p of outboundsRaw) {
        if (p.type === 'wireguard') endpoints.push(p);
        else outbounds.push(p);
    }

    const allTags = outboundsRaw.map(o => o.tag);

    return {
        log: { level: "warn" },
        dns: {
            servers: [
                { type: "https", tag: "resolver_dns", server: "8.8.8.8" },
                { type: "local", tag: "local_dns" },
                { type: "https", tag: "remote_dns", detour: "Mr_Fix", server: "8.8.4.4" },
                {
                    type: "hosts",
                    tag: "hosts_dns",
                    predefined: {
                        "localhost": ["127.0.0.1", "::1"],
                        "security.cloudflare-dns.com": ["1.0.0.2", "1.1.1.2", "2606:4700:4700::1002", "2606:4700:4700::1112"],
                        "cloudflare-dns.com": ["104.16.248.249", "104.16.249.249", "2606:4700::6810:f8f9", "2606:4700::6810:f9f9"],
                        "dns.google": ["8.8.4.4", "8.8.8.8", "2001:4860:4860::8844", "2001:4860:4860::8888"]
                    }
                }
            ],
            rules: [
                { domain: ["security.cloudflare-dns.com"], server: "hosts_dns" }
            ],
            final: "remote_dns",
            strategy: "prefer_ipv4"
        },
        endpoints: endpoints.length > 0 ? endpoints : undefined,
        inbounds: [
            {
                type: "tun", tag: "tun-in", interface_name: "tun0",
                mtu: 9000, address: "172.19.0.1/30", auto_route: true,
                strict_route: true, stack: "system",
                platform: { http_proxy: { enabled: true, server: "127.0.0.1", server_port: 7990 } }
            },
            { type: "mixed", tag: "mixed-in", listen: "127.0.0.1", listen_port: 7991 }
        ],
        outbounds: [
            { type: "selector", tag: "Mr_Fix", outbounds: ["Mr_Fix-2", ...allTags] },
            { type: "urltest", tag: "Mr_Fix-2", outbounds: allTags, url: "https://www.gstatic.com/generate_204", interval: "6m0s" },
            { type: "direct", tag: "direct" },
            ...outbounds
        ],
        route: {
            rule_set: [
                {
                    type: "remote", tag: "karing_geosite_ir", format: "binary",
                    url: "https://raw.githubusercontent.com/KaringX/Iran-sing-box-rules/rule-set/geosite-ir.srs",
                    download_detour: "direct"
                },
                {
                    type: "remote", tag: "karing_geoip_ir", format: "binary",
                    url: "https://raw.githubusercontent.com/KaringX/Iran-sing-box-rules/rule-set/geoip-ir.srs",
                    download_detour: "direct"
                },
                {
                    type: "remote", tag: "karing_ads_ir", format: "binary",
                    url: "https://raw.githubusercontent.com/KaringX/Iran-sing-box-rules/rule-set/geosite-category-ads-ir.srs",
                    download_detour: "direct"
                }
            ],
            rules: [
                { domain: ["security.cloudflare-dns.com"], action: "resolve" },
                { inbound: "tun-in", action: "sniff" },
                { inbound: "mixed-in", action: "sniff" },
                { inbound: "tun-in", action: "resolve" },
                { inbound: "mixed-in", action: "resolve" },
                { protocol: "dns", action: "hijack-dns" },
                { port: 53, action: "hijack-dns" },
                { ip_cidr: ["10.10.34.0/24"], action: "reject" },
                
                // بلاک کردن تبلیغات ایرانی
                { rule_set: "karing_ads_ir", action: "reject" },
                
                // مسیردهی مستقیم دامنه‌های ایرانی (سایت‌های داخلی)
                { domain_suffix: [".ir"], outbound: "direct" },
                { rule_set: "karing_geosite_ir", outbound: "direct" },
                
                // مسیردهی مستقیم آی‌پی‌های ایرانی
                { rule_set: "karing_geoip_ir", outbound: "direct" },
                { ip_is_private: true, outbound: "direct" }
            ],
            final: "Mr_Fix", auto_detect_interface: true
        },
        experimental: { cache_file: { enabled: true } }
    };
}
// ── ۵. main ───────────────────────────────────────────────
function main() {
    const inputFile = 'all.yaml';

    if (!fs.existsSync(inputFile)) {
        console.error(`❌ فایل ${inputFile} یافت نشد. ابتدا aggregator باید اجرا شود.`);
        process.exit(1);
    }

    console.log(`📖 Reading ${inputFile}...`);
    const raw = fs.readFileSync(inputFile, 'utf-8');
    const proxies = parseProxiesYaml(raw);
    console.log(`✅ Parsed ${proxies.length} proxies`);

    // ── ۱. خروجی کامل V2Ray (فقط Base64)
    const uris = proxies.map(p => proxyToUri(p)).filter(Boolean);
    const base64 = Buffer.from(uris.join('\n')).toString('base64');
    fs.writeFileSync('v2ray_sub.txt', base64, 'utf-8');
    console.log(`📂 Created: v2ray_sub.txt — ${uris.length} URI links (Base64 Encoded)`);

    // ── ۲. خروجی کامل Sing-Box (JSON ساختاریافته)
    const outbounds = proxies.map(p => proxyToSingbox(p)).filter(Boolean);
    const singboxConfig = buildSingboxConfig(outbounds);
    fs.writeFileSync('singbox.json', JSON.stringify(singboxConfig, null, 2), 'utf-8');
    console.log(`📂 Created: singbox.json — Full config with ${outbounds.length} outbounds`);

    console.log('\n🎉 Done! Cleaned outputs generated.');
}

main();
