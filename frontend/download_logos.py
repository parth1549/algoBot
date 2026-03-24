import urllib.request
import os

os.makedirs('public/brokers', exist_ok=True)

logos = {
    'upstox.svg': 'https://upstox.com/app/themes/upstox/assets/images/upstox-logo.svg',
    'angelone.svg': 'https://www.angelone.in/assets/images/logo.svg'
}

for filename, url in logos.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        with urllib.request.urlopen(req) as response:
            with open(f'public/brokers/{filename}', 'wb') as f:
                f.write(response.read())
        print(f"Downloaded {filename}")
    except Exception as e:
        print(f"Failed {filename}: {e}")
