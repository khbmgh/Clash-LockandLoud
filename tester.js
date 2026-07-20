const fs = require('fs');
const { execSync, spawn } = require('child_process');
const yaml = require('js-yaml');

const TIMEOUT_SECONDS = 3; // مهربان‌تر کردن تست: ۵ ثانیه فرصت[cite: 5]
const TEST_URL = "https://speed.cloudflare.com/__down?bytes=100000"; // حجم تست کم شد (۵۰۰ کیلوبایت)[cite: 5]

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSingleClashProxy(proxyObj) {
    const tempConfig = {
        port: 7890,
        "socks-port": 7891,
        "allow-lan": false,
        mode: "global",
        "log-level": "silent",
        proxies: [proxyObj],
        "proxy-groups": [
            {
                name: "GLOBAL",
                type: "select",
                proxies: [proxyObj.name]
            }
        ]
    };

    fs.writeFileSync('temp.yaml', yaml.dump(tempConfig));

    // اجرای هسته کلش (Mihomo/Meta) در بک‌گراند
    const clashProcess = spawn('./mihomo', ['-f', 'temp.yaml']);
    await sleep(1500); // زمان برای استارت شدن

    let isAlive = false;
    try {
        console.log(`⏳ Testing Clash Node: ${proxyObj.name}...`);
        execSync(`curl -x socks5h://127.0.0.1:7891 -m ${TIMEOUT_SECONDS} -o /dev/null -s -w "%{http_code}" ${TEST_URL}`, { stdio: 'ignore' });
        isAlive = true;
        console.log(`✅ Passed: ${proxyObj.name}`);
    } catch (e) {
        console.log(`❌ Failed or Too Slow: ${proxyObj.name}`);
    }

    clashProcess.kill('SIGINT');
    await sleep(800); // تاخیر عمدی برای جلوگیری از بلاک شدن توسط سیستم امنیتی گیت‌هاب
    
    return isAlive;
}

async function main() {
    console.log("🛠️ Starting Clash Node Speed Tester...");
    if (!fs.existsSync('all.yaml')) {
        console.error("all.yaml not found!");
        process.exit(1);
    }

    const doc = yaml.load(fs.readFileSync('all.yaml', 'utf8'));
    const proxiesToTest = doc.proxies || [];
    const goodProxies = [];

    console.log(`Total Proxies to check: ${proxiesToTest.length}`);

    // تست تک‌تک پروکسی‌های کلش (به صورت سریالی برای دور زدن محدودیت اکشنز گیت‌هاب)
    for (const p of proxiesToTest) {
        const passed = await testSingleClashProxy(p);
        if (passed) goodProxies.push(p);
    }

    console.log(`\n🎯 Survival Rate: ${goodProxies.length} out of ${proxiesToTest.length}`);

    // بازنویسی فایل all.yaml با سرورهای قدرتمند
    const finalYaml = yaml.dump({ proxies: goodProxies });
    fs.writeFileSync('all.yaml', finalYaml);
    console.log("🚀 Final optimized Clash config saved!");
}

main();
