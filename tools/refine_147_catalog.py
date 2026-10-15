import json
import re

with open('tools/qikink_full_147_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Loaded {len(catalog)} products.")

def clean_description(text: str, title: str) -> str:
    # Remove robotic supplier / POD boilerplate
    t = text
    t = re.sub(r'with custom printing on (?:Rare Ember Studio|Qikink)[^.]*\.', '', t, flags=re.IGNORECASE)
    t = re.sub(r'order as a (?:Rare Ember premium private drop|print-on-demand seller)[^.]*\.', '', t, flags=re.IGNORECASE)
    t = re.sub(r'Compatible with (?:DTG|DTF|embroidery|screen printing)[^.]*\.', '', t, flags=re.IGNORECASE)
    t = re.sub(r'No minimum order quantity\.?', '', t, flags=re.IGNORECASE)
    t = re.sub(r'Available in multiple colou?rs\.?', '', t, flags=re.IGNORECASE)
    t = re.sub(r'Qikink', 'Rare Ember', t, flags=re.IGNORECASE)
    t = re.sub(r'\s+', ' ', t).strip()
    
    if len(t) < 20:
        t = f"Engineered by Rare Ember with heavyweight Tirupur domestic craftsmanship. Features premium bio-washed construction, durable stitching, and a tailored contemporary streetwear drape."
    return t

cleaned_count = 0
total_images_before = 0
total_images_after = 0

for p in catalog:
    primary = p.get('image_url', '')
    m = re.search(r'/assets/mockups/([0-9]+)/', primary)
    orig_imgs = p.get('images', [])
    total_images_before += len(orig_imgs)

    if m:
        folder_id = m.group(1)
        # Keep ONLY images from this product's exact folder
        matching = [img for img in orig_imgs if f'/assets/mockups/{folder_id}/' in img]
        # Ensure primary is first
        if primary in matching:
            matching.remove(primary)
        valid_imgs = [primary] + matching
        # Cap at 7 images max (5 to 7 images per product)
        p['images'] = valid_imgs[:7]
    else:
        p['images'] = orig_imgs[:7]

    total_images_after += len(p['images'])

    # Clean story and short
    p['story'] = clean_description(p['story'], p['title'])
    p['short'] = p['story'][:140]

print(f"Total mockups across catalog: {total_images_before} -> {total_images_after} (avg {total_images_after/len(catalog):.1f} per product)")

# Save refined catalog
with open('tools/qikink_full_147_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print("Saved refined catalog to tools/qikink_full_147_catalog.json!")
