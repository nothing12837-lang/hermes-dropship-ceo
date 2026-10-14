import sys
import json
import re

if len(sys.argv) < 2:
    print("Usage: python tools/extract_page_images.py <path_to_markdown>")
    sys.exit(1)

path = sys.argv[1]
text = open(path, encoding='utf-8').read()

# Look for JSON-LD Product image array
match = re.search(r'\{"@context":"http://schema\.org","@type":"Product"[^}]*"image":(\[[^\]]+\])', text)
if match:
    images = json.loads(match.group(1))
    print(f"Found {len(images)} images in Product JSON-LD:")
    for img in images:
        cleaned = re.sub(r'\.avif\?width=\d+', '.jpg', img)
        cleaned = re.sub(r'\?.*$', '', cleaned)
        print(" ", cleaned)
else:
    # Fallback to regex findall
    imgs = list(dict.fromkeys(re.findall(r'https://images\.meesho\.com/images/products/[0-9]+/[a-z0-9_]+', text)))
    print(f"Fallback found {len(imgs)} images:")
    for img in imgs:
        print(f"  {img}_512.jpg")
