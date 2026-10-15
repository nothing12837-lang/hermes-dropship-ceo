import urllib.request
import re
import json

url = 'https://qikink.com/custom/t-shirts/tie-and-dye-oversized-t-shirt-ut58/'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=10) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

# Look for Next.js data or JSON containing colors or variations
chunks = re.findall(r'(\{[^{}]*"color"[^{}]*\})', html)
print(f"Color chunks found: {len(chunks)}")
for c in chunks[:5]:
    print(" ", c)

# Look for variation names
var_matches = re.findall(r'"name":"([^"]+)"', html)
print(f"Name matches in JSON: {len(var_matches)}")
print("Sample names:", var_matches[:15])

# Find all occurrences of words near 'variation'
print("\nVariations snippet:")
for m in re.finditer(r'variation', html, re.IGNORECASE):
    idx = m.start()
    print("...", html[max(0, idx-50):min(len(html), idx+100)].replace('\n', ' '), "...")
