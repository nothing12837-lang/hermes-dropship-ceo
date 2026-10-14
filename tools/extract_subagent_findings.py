import json
import re

subagents = [
    ('9a41891c-cb09-4cdd-88de-a6a96444a098', 'Batch 1'),
    ('8ead37fe-8276-4b3e-8391-46f377e32145', 'Batch 2'),
    ('258a4425-f633-4ea3-9a45-1386d920c2f4', 'Batch 3'),
]

all_meesho_urls = set()
all_product_pages = set()

for sid, bname in subagents:
    path = rf"C:\Users\ajay kumar\.gemini\antigravity\brain\{sid}\.system_generated\logs\transcript.jsonl"
    try:
        lines = open(path, encoding='utf-8').readlines()
    except Exception as e:
        print(f"Error reading {bname}: {e}")
        continue
    
    print(f"\n=== {bname} ({len(lines)} lines) ===")
    b_images = set()
    b_pages = set()
    for l in lines:
        # Search for meesho image urls
        imgs = re.findall(r'https://images\.meesho\.com/images/products/[^"\s\'<>&]+', l)
        for img in imgs:
            b_images.add(img)
            all_meesho_urls.add(img)
        
        # Search for meesho product pages
        pages = re.findall(r'https://www\.meesho\.com/[^"\s\'<>]+/p/([a-z0-9]+)', l)
        for p in pages:
            b_pages.add(p)
            all_product_pages.add(p)
        
        # Also direct p/<id>
        pages2 = re.findall(r'https://www\.meesho\.com(?::443)?/p/([a-z0-9]+)', l)
        for p in pages2:
            b_pages.add(p)
            all_product_pages.add(p)

    print(f"  Found {len(b_images)} meesho images")
    print(f"  Found {len(b_pages)} meesho product codes: {list(b_pages)[:8]}")

print(f"\nTOTAL Unique Meesho Images across subagents: {len(all_meesho_urls)}")
print(f"TOTAL Unique Meesho Product Codes: {len(all_product_pages)}")
