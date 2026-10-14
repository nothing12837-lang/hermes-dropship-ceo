import json
import re

subagents = [
    ('9a41891c-cb09-4cdd-88de-a6a96444a098', 'Batch 1'),
    ('8ead37fe-8276-4b3e-8391-46f377e32145', 'Batch 2'),
    ('258a4425-f633-4ea3-9a45-1386d920c2f4', 'Batch 3'),
]

# Load unsplash products
unsplash_prods = json.load(open('unsplash_products_list.json', encoding='utf-8'))
slug_map = {p['id']: [] for p in unsplash_prods}

for sid, bname in subagents:
    path = rf"C:\Users\ajay kumar\.gemini\antigravity\brain\{sid}\.system_generated\logs\transcript.jsonl"
    try:
        lines = open(path, encoding='utf-8').readlines()
    except Exception as e:
        continue

    for l in lines:
        try:
            d = json.loads(l)
        except:
            continue
        
        # Check thinking or content or tool calls for associations
        content = d.get('content', '')
        thinking = d.get('thinking', '')
        
        # Look for json blocks with meesho-slug: [...]
        for text in [content, thinking]:
            if not text:
                continue
            # Look for "meesho-...": ["..."]
            matches = re.findall(r'["\'](meesho-[a-z0-9\-]+)["\']\s*:\s*\[([\s\S]*?)\]', text)
            for slug, img_block in matches:
                imgs = re.findall(r'https://images\.meesho\.com/images/products/[^"\'\s<>&]+', img_block)
                if imgs:
                    cleaned_imgs = [re.sub(r'\.avif.*$', '.jpg', re.sub(r'\?.*$', '', img)) for img in imgs]
                    # ensure _512.jpg
                    cleaned_imgs = [img if '_512' in img or '_1024' in img else img + '_512.jpg' for img in cleaned_imgs]
                    slug_map[slug] = list(dict.fromkeys(slug_map.get(slug, []) + cleaned_imgs))

# Check how many slugs have images
mapped = {k: v for k, v in slug_map.items() if len(v) > 0}
print(f"Mapped {len(mapped)} / {len(unsplash_prods)} products from explicit subagent blocks")
for k, v in list(mapped.items())[:10]:
    print(f"  {k}: {len(v)} images -> {v[0]}")
