import json
import re

p = rf"C:\Users\ajay kumar\.gemini\antigravity\brain\8ead37fe-8276-4b3e-8391-46f377e32145\.system_generated\logs\transcript.jsonl"
lines = open(p, encoding='utf-8').readlines()

# Search for any dictionary or json blocks mapping meesho-slug to images
found_blocks = {}
for l in lines:
    try:
        d = json.loads(l)
    except:
        continue
    content = d.get('content', '')
    thinking = d.get('thinking', '')
    for t in [content, thinking]:
        if not t:
            continue
        matches = re.findall(r'["\'](meesho-[a-z0-9\-]+)["\']\s*:\s*\[([\s\S]*?)\]', t)
        for slug, iblock in matches:
            imgs = re.findall(r'https://images\.meesho\.com/images/products/[^"\'\s<>&]+', iblock)
            if imgs:
                cleaned = [re.sub(r'\.avif.*$', '.jpg', re.sub(r'\?.*$', '', u)) for u in imgs]
                cleaned = [u if '_512' in u or '_1024' in u else u + '_512.jpg' for u in cleaned]
                found_blocks[slug] = list(dict.fromkeys(found_blocks.get(slug, []) + cleaned))

print(f"Batch 2 partial mapping: {len(found_blocks)} products found so far:")
for k, v in found_blocks.items():
    print(f"  {k}: {len(v)} images")
