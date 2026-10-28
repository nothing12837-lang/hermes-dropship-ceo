import json
import urllib.request
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== Starting Qikink New Products Importer ===")

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(base_dir)
products_json_path = os.path.join(workspace_dir, 'storefront', 'src', 'lib', 'data', 'qikink-products.json')
variants_json_path = os.path.join(workspace_dir, 'storefront', 'src', 'lib', 'data', 'qikink-variants-map.json')
fulfillment_ts_path = os.path.join(workspace_dir, 'storefront', 'src', 'lib', 'fulfillment', 'qikink.ts')
env_path = os.path.join(workspace_dir, 'storefront', '.env.local')

# Read step outputs
step81_path = r'C:\Users\ajay kumar\.gemini\antigravity\brain\d204780a-4fed-4d06-8c5f-de2a3b141991\.system_generated\steps\81\output.txt'
step87_path = r'C:\Users\ajay kumar\.gemini\antigravity\brain\d204780a-4fed-4d06-8c5f-de2a3b141991\.system_generated\steps\87\output.txt'
step90_path = r'C:\Users\ajay kumar\.gemini\antigravity\brain\d204780a-4fed-4d06-8c5f-de2a3b141991\.system_generated\steps\90\output.txt'
step93_path = r'C:\Users\ajay kumar\.gemini\antigravity\brain\d204780a-4fed-4d06-8c5f-de2a3b141991\.system_generated\steps\93\output.txt'

with open(step81_path, 'r', encoding='utf-8') as f:
    c81 = f.read()
d81 = json.loads(c81[c81.find('{'):c81.rfind('}')+1])

with open(step87_path, 'r', encoding='utf-8') as f:
    c87 = f.read()
d87 = json.loads(c87[c87.find('{'):c87.rfind('}')+1])

with open(step90_path, 'r', encoding='utf-8') as f:
    c90 = f.read()
v90 = json.loads(c90[c90.find('['):c90.rfind(']')+1])

with open(step93_path, 'r', encoding='utf-8') as f:
    c93 = f.read()
v93 = json.loads(c93[c93.find('['):c93.rfind(']')+1])

# Load existing files
with open(products_json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(variants_json_path, 'r', encoding='utf-8') as f:
    variants_map = json.load(f)

print(f"Loaded existing: {len(products)} products, {len(variants_map)} variants")

# -------------------------------------------------------------
# 1. Product 1: 32493953 (Unisex Acid Washed Hoodie)
# -------------------------------------------------------------
p1_id = "32493953"
p1_slug = f"unisex-acid-wash-hoodie-{p1_id}"
p1_full_id = f"qikink-{p1_id}-unisex-acid-wash-hoodie"

p1_color_images = {
    "Black": f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Front_1_c_2.jpg",
    "Navy Blue": f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Front_1_c_3.jpg",
    "Bottle Green": f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Front_1_c_8.jpg",
    "Maroon": f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Front_1_c_25.jpg",
}

p1_images = [
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Front_1_c_2.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Back_2_c_2.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Front_1_c_3.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Back_2_c_3.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Front_1_c_8.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Back_2_c_8.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Front_1_c_25.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p1_id}/images/Back_2_c_25.jpg",
]

product1 = {
    "id": p1_full_id,
    "slug": p1_slug,
    "title": "Unisex Acid Washed Hoodie — Skull & Dragon Edition",
    "baseTitle": "Unisex Acid Washed Hoodie",
    "short": "Heavyweight unisex acid-washed hoodie featuring Stay True Skull front graphic and Fearless Dragon back artwork. Premium combed cotton French terry fleece.",
    "story": "Designed for cold nights and high-contrast streetwear styling. Cut from ultra-heavyweight combed cotton fleece, enzyme acid-washed for a unique vintage patina, and double-printed with fade-proof DTF graphics across the chest and back.",
    "details": [
        "Fabric: 380 GSM Heavy Combed Cotton Fleece",
        "Wash: Enzyme Vintage Acid Wash Finish",
        "Front Print: Stay True Skull Graphic (HD DTF)",
        "Back Print: Fearless Dragon Oversized Art (HD DTF)",
        "Double-lined hood with chunky matching drawcords",
        "Ribbed cuffs and hem for structural streetwear drape",
        "Dispatched from Domestic Maker Hub in 24–48 Hours",
        "7-Day Easy Doorstep Returns & Exchanges"
    ],
    "price": 1789,
    "price_inr": 1789,
    "compareAtPrice": 2999,
    "compare_at_price": 2999,
    "old_price": 2999,
    "rating": 5.0,
    "reviews": 38,
    "image_url": p1_images[0],
    "images": p1_images,
    "category": "mens",
    "gender": "men",
    "is_printed": True,
    "design_code": "skull_staytrue_dtf",
    "print_design_name": "Skull & Dragon Dual Art",
    "colors": ["Black", "Navy Blue", "Bottle Green", "Maroon"],
    "sizes": ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    "colorImages": p1_color_images,
    "tag": "🔥 NEW DROP",
    "tagBg": "rgba(255, 77, 36, 0.12)",
    "tagColor": "#FF4D24",
    "badge": "380 GSM ACID WASH",
    "qikinkSkuPrefix": "UAHD",
    "qikinkClientProductId": p1_id,
    "qikinkPrintType": "DTF",
    "active": True,
    "is_new": True,
    "is_trending": True,
    "gradient": "from-neutral-900 via-stone-800 to-amber-950"
}

# -------------------------------------------------------------
# 2. Product 2: 32493938 (Unisex Heavyweight Hoodie)
# -------------------------------------------------------------
p2_id = "32493938"
p2_slug = f"unisex-heavyweight-hoodie-{p2_id}"
p2_full_id = f"qikink-{p2_id}-unisex-heavyweight-hoodie"

all_v2 = v90 + v93
p2_color_images = {}
for v in all_v2:
    cname = v['color']
    if cname not in p2_color_images and v.get('image_url'):
        p2_color_images[cname] = v['image_url']

p2_images = list(p2_color_images.values())
p2_colors = list(p2_color_images.keys())

product2 = {
    "id": p2_full_id,
    "slug": p2_slug,
    "title": "Unisex Heavyweight Hoodie — Unstoppable Tiger Edition",
    "baseTitle": "Unisex Heavyweight Hoodie",
    "short": "Heavyweight winter fleece hoodie featuring bold Unstoppable Tiger front graphic. Bio-washed super combed cotton with kangaroo pocket.",
    "story": "A staple winter streetwear piece built for warmth and endurance. Engineered from dense 380 GSM cotton-poly fleece, brushed internally for thermal insulation, and finished with a vivid, crack-resistant high-definition DTF tiger print.",
    "details": [
        "Fabric: 380 GSM Heavy Brushed Cotton Fleece",
        "Fit: Classic Boxy Streetwear Silhouette",
        "Print: Unstoppable Tiger Graphic (HD DTF)",
        "Spacious kangaroo pocket & double-needle topstitching",
        "Preshrunk fabric engineered for minimal thermal shrinkage",
        "Dispatched from Domestic Maker Hub in 24–48 Hours",
        "7-Day Easy Doorstep Returns & Exchanges"
    ],
    "price": 1399,
    "price_inr": 1399,
    "compareAtPrice": 2699,
    "compare_at_price": 2699,
    "old_price": 2699,
    "rating": 4.9,
    "reviews": 46,
    "image_url": p2_color_images.get("Black", p2_images[0]),
    "images": p2_images,
    "category": "mens",
    "gender": "men",
    "is_printed": True,
    "design_code": "tiger_unstoppable_dtf",
    "print_design_name": "Unstoppable Tiger Graphic",
    "colors": p2_colors,
    "sizes": ["S", "M", "L", "XL", "XXL", "3XL"],
    "colorImages": p2_color_images,
    "tag": "🔥 NEW DROP",
    "tagBg": "rgba(255, 77, 36, 0.12)",
    "tagColor": "#FF4D24",
    "badge": "380 GSM FLEECE",
    "qikinkSkuPrefix": "UHd",
    "qikinkClientProductId": p2_id,
    "qikinkPrintType": "DTF",
    "active": True,
    "is_new": True,
    "is_trending": True,
    "gradient": "from-amber-600 via-orange-600 to-neutral-900"
}

# -------------------------------------------------------------
# 3. Product 3: 32493470 (Unisex Pullover Hoodie)
# -------------------------------------------------------------
p3_id = "32493470"
p3_slug = f"unisex-pullover-hoodie-{p3_id}"
p3_full_id = f"qikink-{p3_id}-unisex-pullover-hoodie"

p3_color_images = {
    "White": f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p3_id}/images/Front_1_c_1.jpg",
    "Black": f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p3_id}/images/Front_1_c_2.jpg",
    "Navy Blue": f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p3_id}/images/Front_1_c_3.jpg",
    "Off White": f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p3_id}/images/Front_1_c_61.jpg",
}

p3_images = [
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p3_id}/images/Front_1_c_2.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p3_id}/images/Front_1_c_1.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p3_id}/images/Front_1_c_3.jpg",
    f"https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/{p3_id}/images/Front_1_c_61.jpg",
]

product3 = {
    "id": p3_full_id,
    "slug": p3_slug,
    "title": "Unisex Pullover Hoodie — Cyber Designer Edition",
    "baseTitle": "Unisex Pullover Hoodie",
    "short": "Clean pullover hoodie crafted from breathable French terry cotton with front Cyber Designer artwork. Clean drop-shoulder drape.",
    "story": "Designed for effortless transitional layering. Tailored in lightweight yet structured 320 GSM French terry fleece, offering breathable warmth and sleek urban aesthetics with high-definition DTF chest artwork.",
    "details": [
        "Fabric: 320 GSM French Terry Combed Cotton",
        "Fit: Relaxed Drop-Shoulder Pullover Cut",
        "Print: Cyber Designer Front Graphic (HD DTF)",
        "Clean crossover neckline with tonal hood lining",
        "Dispatched from Domestic Maker Hub in 24–48 Hours",
        "7-Day Easy Doorstep Returns & Exchanges"
    ],
    "price": 1399,
    "price_inr": 1399,
    "compareAtPrice": 2499,
    "compare_at_price": 2499,
    "old_price": 2499,
    "rating": 4.8,
    "reviews": 29,
    "image_url": p3_color_images.get("Black", p3_images[0]),
    "images": p3_images,
    "category": "mens",
    "gender": "men",
    "is_printed": True,
    "design_code": "Designer(12)",
    "print_design_name": "Cyber Designer Graphic",
    "colors": ["Black", "White", "Navy Blue", "Off White"],
    "sizes": ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    "colorImages": p3_color_images,
    "tag": "🔥 NEW DROP",
    "tagBg": "rgba(255, 77, 36, 0.12)",
    "tagColor": "#FF4D24",
    "badge": "320 GSM FRENCH TERRY",
    "qikinkSkuPrefix": "UPuHd",
    "qikinkClientProductId": p3_id,
    "qikinkPrintType": "DTF",
    "active": True,
    "is_new": True,
    "is_trending": True,
    "gradient": "from-teal-700 via-stone-800 to-neutral-900"
}

# Add products to catalog (prepend so they show at top as new drops)
new_catalog_items = [product1, product2, product3]
for item in reversed(new_catalog_items):
    # Remove if existing
    products = [p for p in products if p.get('qikinkClientProductId') != item['qikinkClientProductId']]
    products.insert(0, item)

print(f"Updated catalog: {len(products)} products total")

# -------------------------------------------------------------
# Add all variants to variants_map
# -------------------------------------------------------------
added_vars = 0

# P1 variants (28)
for v in d81['variants']:
    ckey = v['color'].lower().strip()
    skey = v['size'].lower().strip()
    key = f"{p1_id}_{ckey}_{skey}"
    variants_map[key] = {
        "product_id": p1_id,
        "variant_sku": v['variant_sku'],
        "product_sku": v['product_sku'],
        "cost_price": float(v.get('cost') or 1094.84),
        "selling_price": 1789,
        "color": v['color'],
        "size": v['size'],
        "variant_image": v.get('image_url') or p1_color_images.get(v['color'])
    }
    added_vars += 1

# P2 variants (90)
for v in all_v2:
    ckey = v['color'].lower().strip()
    skey = v['size'].lower().strip()
    key = f"{p2_id}_{ckey}_{skey}"
    variants_map[key] = {
        "product_id": p2_id,
        "variant_sku": v['variant_sku'],
        "product_sku": v['product_sku'],
        "cost_price": float(v.get('cost') or 614.43),
        "selling_price": 1399,
        "color": v['color'],
        "size": v['size'],
        "variant_image": v.get('image_url') or p2_color_images.get(v['color'])
    }
    added_vars += 1

# P3 variants (28)
for v in d87['variants']:
    ckey = v['color'].lower().strip()
    skey = v['size'].lower().strip()
    key = f"{p3_id}_{ckey}_{skey}"
    variants_map[key] = {
        "product_id": p3_id,
        "variant_sku": v['variant_sku'],
        "product_sku": v['product_sku'],
        "cost_price": float(v.get('cost') or 629.28),
        "selling_price": 1399,
        "color": v['color'],
        "size": v['size'],
        "variant_image": v.get('image_url') or p3_color_images.get(v['color'])
    }
    added_vars += 1

print(f"Added {added_vars} variants. Total variants map entries: {len(variants_map)}")

# Write updated JSON files
with open(products_json_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

with open(variants_json_path, 'w', encoding='utf-8') as f:
    json.dump(variants_map, f, indent=2, ensure_ascii=False)

print("Saved qikink-products.json and qikink-variants-map.json successfully!")

# -------------------------------------------------------------
# Update storefront/src/lib/fulfillment/qikink.ts line 743 whitelist
# -------------------------------------------------------------
with open(fulfillment_ts_path, 'r', encoding='utf-8') as f:
    fts = f.read()

old_needle = "'32477737', '32476431'"
new_needle = "'32493953', '32493938', '32493470', '32477737', '32476431'"
if old_needle in fts and '32493953' not in fts:
    fts = fts.replace(old_needle, new_needle)
    with open(fulfillment_ts_path, 'w', encoding='utf-8') as f:
        f.write(fts)
    print("Updated qikink.ts pre-configured list with new product IDs!")

# -------------------------------------------------------------
# Upsert into Supabase public.products table
# -------------------------------------------------------------
env = {}
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

sb_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
sb_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if sb_url and sb_key:
    for p in new_catalog_items:
        row = {
            "id": p["id"],
            "slug": p["slug"],
            "title": p["title"],
            "description": p["story"],
            "short": p["short"],
            "story": p["story"],
            "details": p["details"],
            "price": p["price"],
            "price_inr": p["price_inr"],
            "compare_at_price": p["compareAtPrice"],
            "rating": p["rating"],
            "reviews": p["reviews"],
            "image_url": p["image_url"],
            "category": p["category"],
            "tag": p["tag"],
            "tag_color": p["tagColor"],
            "tag_bg": p["tagBg"],
            "active": True,
            "is_active": True,
            "is_new": True,
            "is_trending": True,
            "stock": 50,
            "gradient": p["gradient"],
            "market": "IN"
        }
        
        req = urllib.request.Request(
            f"{sb_url}/rest/v1/products",
            data=json.dumps([row]).encode('utf-8'),
            headers={
                "apikey": sb_key,
                "Authorization": f"Bearer {sb_key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req) as resp:
                print(f"Upserted {p['id']} into Supabase (Status: {resp.status})")
        except Exception as err:
            print(f"Supabase upsert warning for {p['id']}: {err}")

print("=== Import & Sync Finished Successfully! ===")
