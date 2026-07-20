const fs = require('fs');
const { execSync, spawn } = require('child_process');

const TIMEOUT_SECONDS = 2; // حداکثر زمان مجاز برای دانلود
const TEST_URL = "https://speed.cloudflare.com/__down?bytes=1000000"; // دانلود ۱ مگابایت از کلودفلر

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSingleProxy(proxyOutbound) {
    // ساخت یک کانفیگ موقت سینگ‌باکس فقط برای تست یک سرور
    const tempConfig = {
        log: { level: "fatal" },
        inbounds: [{ type: "mixed", tag: "test-in", listen: "127.0.0.1", listen_port: 10800 }],
        outbounds: [proxyOutbound]
    };
    
    fs.writeFileSync('temp.json', JSON.stringify(tempConfig));

    // اجرای سینگ‌باکس در بک‌گراند
    const sbProcess = spawn('./sing-box', ['run', '-c', 'temp.json']);
    await sleep(1000); // یک ثانیه صبر برای استارت شدن پورت

    let isAlive = false;
    try {
        // تست دانلود ۱ مگابایت از طریق پورت ساکس ۵ کانفیگ موقت با تایم‌اوت ۲ ثانیه
        console.log(`⏳ Testing: ${proxyOutbound.tag}...`);
        execSync(`curl -x socks5h://127.0.0.1:10800 -m ${TIMEOUT_SECONDS} -o /dev/null -s -w "%{http_code}" ${TEST_URL}`, { stdio: 'ignore' });
        isAlive = true;
        console.log(`✅ Passed: ${proxyOutbound.tag}`);
    } catch (e) {
        console.log(`❌ Failed or Too Slow: ${proxyOutbound.tag}`);
    }

    // بستن سینگ‌باکس موقت
    sbProcess.kill('SIGINT');
    await sleep(500);
    
    return isAlive;
}

async function main() {
    console.log("🛠️ Starting Aggressive 1MB Speed Test...");
    if (!fs.existsSync('singbox.json')) {
        console.error("singbox.json not found!");
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync('singbox.json', 'utf8'));
    const allOutbounds = config.outbounds;
    
    // جدا کردن پروکسی‌های اصلی از دایرکت و سلکتور
    const standardTags = ["Mr_Fix", "Mr_Fix-2", "direct"];
    const proxiesToTest = allOutbounds.filter(o => !standardTags.includes(o.tag));
    const goodProxies = [];

    // تست تک‌تک پروکسی‌ها
    for (const p of proxiesToTest) {
        const passed = await testSingleProxy(p);
        if (passed) goodProxies.push(p);
    }

    console.log(`\n🎯 Survival Rate: ${goodProxies.length} out of ${proxiesToTest.length}`);

    // بازسازی کانفیگ فقط با سرورهای زنده و سریع
    const goodTags = goodProxies.map(o => o.tag);
    config.outbounds = [
        { type: "selector", tag: "Mr_Fix", outbounds: ["Mr_Fix-2", ...goodTags] },
        { type: "urltest", tag: "Mr_Fix-2", outbounds: goodTags, url: "https://www.gstatic.com/generate_204", interval: "6m0s" },
        { type: "direct", tag: "direct" },
        ...goodProxies
    ];

    fs.writeFileSync('singbox.json', JSON.stringify(config, null, 2));
    console.log("🚀 Final optimized config saved!");
}

main();
