import urllib.request
import re
import json

url = 'https://qikink.com/custom/t-shirts/oversized-t-shirt-uc22/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')

h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
print('H1:', h1_match.group(1).strip() if h1_match else 'None')

# Find all img src attributes
img_srcs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE)
print(f'Total img tags found: {len(img_srcs)}')
for s in list(dict.fromkeys(img_srcs))[:20]:
    print('  SRC:', s)

# Also check for data-src, srcset, or background-image
data_srcs = re.findall(r'data-src=["\']([^"\']+)["\']', html, re.IGNORECASE)
print(f'Total data-src found: {len(data_srcs)}')
for s in list(dict.fromkeys(data_srcs))[:10]:
    print('  DATA-SRC:', s)

# Look for next-image, CDN, or Cloudinary / AWS S3
all_urls = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp|svg)', html, re.IGNORECASE)
print(f'Total image URLs in page: {len(all_urls)}')
for u in list(dict.fromkeys(all_urls))[:20]:
    print('  URL:', u)
