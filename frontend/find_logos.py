import urllib.request
import re

urls = ['https://upstox.com/', 'https://www.angelone.in/']

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            # Extract basic logo urls
            matches = re.findall(r'https?://[^\s"\'<>]*logo[^\s"\'<>]*\.(?:svg|png)', html, re.IGNORECASE)
            print(f"--- LOGOS ON {url} ---")
            for m in set(matches):
                print(m)
    except Exception as e:
        print(url, "Error:", e)
