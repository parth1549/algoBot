import urllib.request

url = 'https://companieslogo.com/img/orig/ANGELONE.NS-e51b17b6.png'
filename = 'angelone.png'

try:
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://companieslogo.com/'
    })
    with urllib.request.urlopen(req) as response:
        with open(f'public/brokers/{filename}', 'wb') as f:
            f.write(response.read())
    print(f"Successfully downloaded {filename}")
except Exception as e:
    print(f"Failed {filename}: {e}")
