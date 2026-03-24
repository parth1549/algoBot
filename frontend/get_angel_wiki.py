import urllib.request
import os

url = 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Angel_One_Logo.svg'
filename = 'angelone.svg'

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        with open(f'public/brokers/{filename}', 'wb') as f:
            f.write(response.read())
    print(f"Successfully downloaded {filename}")
except Exception as e:
    print(f"Failed {filename}: {e}")
