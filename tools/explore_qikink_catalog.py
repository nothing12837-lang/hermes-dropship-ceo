import urllib.request
import re

urls = [
    'https://qikink.com/robots.txt',
    'https://qikink.com/sitemap.xml',
    'https://qikink.com/sitemap_index.xml',
    'https://qikink.com/products-sitemap.xml',
    'https://qikink.com/product-sitemap.xml',
    'https://qikink.com/all-products',
    'https://qikink.com/products',
    'https://qikink.com/pricing'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            content = resp.read()
            print(f"{u} --> Status: {resp.status}, Content-Type: {resp.headers.get('content-type')}, Length: {len(content)}")
            if 'sitemap' in u or 'robots' in u:
                print("Snippet:\n", content[:500].decode('utf-8', errors='ignore'))
    except Exception as e:
        print(f"{u} --> Error: {e}")
