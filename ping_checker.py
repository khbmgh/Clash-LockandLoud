import socket
import sys
from ruamel.yaml import YAML

# لیست فایل‌هایی که باید پردازش شوند
FILES = ['all.yaml', 'hysteria2.yaml']

def check_tcp_port(host, port, timeout=2):
    """
    بررسی باز بودن پورت سرور از طریق TCP.
    این روش در گیت‌هاب اکشن بدون مشکل کار می‌کند.
    """
    try:
        # ساخت یک سوکت TCP و تلاش برای اتصال در محدوده تایم‌اوت
        with socket.create_connection((host, int(port)), timeout=timeout):
            return True
    except Exception:
        return False

def main():
    yaml = YAML()
    yaml.preserve_quotes = True # حفظ کوتیشن‌های فایل اصلی
    yaml.indent(mapping=2, sequence=4, offset=2)

    for filename in FILES:
        print(f"\n=========================================")
        print(f"Processing file: {filename}")
        print(f"=========================================")
        
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = yaml.load(f)
        except FileNotFoundError:
            print(f"Error: {filename} not found! Skipping...")
            continue

        if not data or 'proxies' not in data:
            print(f"Invalid YAML structure or 'proxies' key not found in {filename}. Skipping...")
            continue

        original_count = len(data['proxies'])
        alive_proxies = []

        print(f"Starting connection check for {original_count} servers in {filename}...")

        for proxy in data['proxies']:
            server = proxy.get('server')
            port = proxy.get('port', 443) # اگر پورت نبود، پیش‌فرض ۴۴۳ در نظر گرفته می‌شود
            
            if not server:
                continue
                
            print(f"Checking {server}:{port}...", end=" ")
            
            # استفاده از تست سوکت به جای پینگ سیستم‌عامل
            if check_tcp_port(server, port):
                print("✅ UP")
                alive_proxies.append(proxy)
            else:
                print("❌ DOWN (Removed)")

        # آپدیت کردن لیست با سرورهای زنده
        data['proxies'] = alive_proxies
        new_count = len(alive_proxies)

        with open(filename, 'w', encoding='utf-8') as f:
            yaml.dump(data, f)

        print(f"\nFinished {filename}! Kept {new_count} out of {original_count} proxies.")

if __name__ == "__main__":
    main()
