import urllib.request
import re
import json

url = 'https://qikink.com/custom/hoodies/acid-wash-hoodie-uh62/'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=10) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

# 1. Title
title_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
print('H1 Title:', title_match.group(1).strip() if title_match else 'None')

# 2. Meta description
desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', html)
print('Meta description:', desc_match.group(1).strip() if desc_match else 'None')

# 3. Look for JSON-LD schema
json_ld_matches = re.findall(r'<script\s+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL)
print(f'JSON-LD count: {len(json_ld_matches)}')
for j in json_ld_matches:
    try:
        parsed = json.loads(j)
        print('JSON-LD @type:', parsed.get('@type'))
        if parsed.get('@type') == 'Product':
            print('Product schema:', json.dumps(parsed, indent=2)[:500])
    except Exception as e:
        pass

# 4. Look for all S3 mockups
# Matches like https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/...
s3_mockups = list(set(re.findall(r'https://qikink-stores\.s3\.ap-south-1\.amazonaws\.com/assets/mockups/[^\s"\'\\<>\)]+', html)))
print(f'S3 mockups found: {len(s3_mockups)}')
for m in s3_mockups[:5]:
    print('  Mockup:', m)

# 5. Look for features / specs
# Often in <ul><li> or specific divs
li_items = re.findall(r'<li[^>]*>([^<]+)</li>', html)
print('Sample li items:', li_items[:8])

# 6. Look for prices
# Like Starting at ₹... or Base price ₹...
price_matches = re.findall(r'(?:Starting\s*(?:at|from)|Price|Base\s*Price)?\s*₹\s*([0-9,]+)', html, re.IGNORECASE)
print('Price matches:', price_matches[:8])
