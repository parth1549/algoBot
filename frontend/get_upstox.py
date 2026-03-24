import urllib.request
import os

url = 'https://assets.upstox.com/website/images/upstox-new-logo.svg'
filename = 'upstox.svg'

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        with open(f'public/brokers/{filename}', 'wb') as f:
            f.write(response.read())
    print(f"Successfully downloaded {filename}")
except Exception as e:
    print(f"Failed {filename}: {e}")
