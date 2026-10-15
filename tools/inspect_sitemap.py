import urllib.request
import re
import xml.etree.ElementTree as ET

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# 1. Inspect sitemap-0.xml
try:
    req = urllib.request.Request('https://qikink.com/sitemap-0.xml', headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        xml_data = resp.read()
        root = ET.fromstring(xml_data)
        # Find all <loc>
        locs = [elem.text for elem in root.iter() if elem.tag.endswith('loc')]
        print(f"Total URLs in sitemap-0.xml: {len(locs)}")
        product_urls = [u for u in locs if '/product/' in u or '/products/' in u or '/custom/' in u]
        print(f"Product/Custom URLs in sitemap-0.xml: {len(product_urls)}")
        print("Sample URLs:")
        for u in locs[:25]:
            print("  ", u)
except Exception as e:
    print("Error reading sitemap-0.xml:", e)

# 2. Inspect https://qikink.com/products
try:
    req = urllib.request.Request('https://qikink.com/products', headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"\nHTML length of /products: {len(html)}")
        links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
        product_links = set([l for l in links if '/product' in l or '/custom' in l])
        print(f"Product links in /products: {len(product_links)}")
        for l in sorted(list(product_links))[:30]:
            print("  ", l)
except Exception as e:
    print("Error reading /products:", e)
