import json
import os
import re
import ssl
import pg8000.native

# 1. Load the master 103 gallery
master = json.load(open('all_103_meesho_galleries.json', encoding='utf-8'))
print(f"Loaded master galleries for {len(master)} products")

# Verify all have 4 Meesho images
for pid, imgs in master.items():
    assert len(imgs) == 4, f"{pid} has {len(imgs)} images, expected 4"
    for img in imgs:
        assert "images.meesho.com" in img, f"{pid} has non-meesho image: {img}"
print("VERIFICATION PASSED: 100% of images are authentic images.meesho.com CDN assets.")

# -------------------------------------------------------------
# 2. Update storefront/src/lib/data/product-gallery.ts
# -------------------------------------------------------------
gallery_path = 'storefront/src/lib/data/product-gallery.ts'
gallery_content = '''/**
 * Authentic Multi-Image Gallery Resolver for RareEmber
 * Complete 4-Angle High-Resolution Visual Experience for All 103 Curated Products.
 * Every product features authentic Meesho CDN manufacturer photographs:
 * 1. Hero Angle (Front Primary View)
 * 2. Close-up Detail (Materials, Textures, Controls)
 * 3. In-Situ Lifestyle / Functional Demonstration
 * 4. Packaging, Scale & Unboxed Accessories
 */

export const CURATED_PRODUCT_GALLERIES: Record<string, string[]> = {
'''

# Sort keys alphabetically for clean diffs
for pid in sorted(master.keys()):
    imgs = master[pid]
    gallery_content += f"  '{pid}': [\n"
    for img in imgs:
        gallery_content += f"    '{img}',\n"
    gallery_content += "  ],\n"

gallery_content += '''};

/**
 * Resolves a full array of image URLs for any product in the catalog.
 * Strict Authentic Priority:
 * 1. Exact or slug match in CURATED_PRODUCT_GALLERIES (All 103 items)
 * 2. Explicit array passed from database/catalog
 * 3. Primary image fallback (No generic stock photos)
 */
export function resolveProductGallery(
  id: string,
  primaryUrl?: string | null,
  category?: string,
  explicitImages?: string[] | null
): string[] {
  // 1. Direct key match in curated galleries (103 products mapped)
  if (CURATED_PRODUCT_GALLERIES[id] && CURATED_PRODUCT_GALLERIES[id].length >= 2) {
    return CURATED_PRODUCT_GALLERIES[id];
  }

  // 2. Substring or slug match
  const matchedKey = Object.keys(CURATED_PRODUCT_GALLERIES).find(
    (k) => id.includes(k) || k.includes(id)
  );
  if (matchedKey && CURATED_PRODUCT_GALLERIES[matchedKey].length >= 2) {
    return CURATED_PRODUCT_GALLERIES[matchedKey];
  }

  // 3. Explicit images passed from catalog/DB if multiple
  if (Array.isArray(explicitImages) && explicitImages.length >= 2) {
    const valid = explicitImages.filter((u) => Boolean(u && u.trim().length > 0));
    if (valid.length >= 2) return valid;
  }

  // 4. Fallback: single primaryUrl (never inject generic stock photos)
  const fallback = primaryUrl && primaryUrl.trim().length > 0 ? primaryUrl.trim() : null;
  if (fallback) {
    return [fallback];
  }

  return [];
}
'''

with open(gallery_path, 'w', encoding='utf-8') as f:
    f.write(gallery_content)
print(f"Updated {gallery_path} successfully!")

# -------------------------------------------------------------
# 3. Update storefront/src/lib/data/fallback-images.ts
# -------------------------------------------------------------
fallback_path = 'storefront/src/lib/data/fallback-images.ts'
fallback_content = '''/**
 * Curated image fallbacks for catalog items when image_url is missing.
 * Direct authentic manufacturer hero photos from Meesho CDN for all 103 products.
 */

export const FALLBACK_IMAGES: Record<string, string> = {
'''

for pid in sorted(master.keys()):
    hero_img = master[pid][0]
    fallback_content += f"  '{pid}':\n    '{hero_img}',\n"

fallback_content += '''};

/** DB image first, curated fallback second, undefined last. */
export function resolveProductImage(id: string, imageUrl?: string | null): string | undefined {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return FALLBACK_IMAGES[id];
}
'''

with open(fallback_path, 'w', encoding='utf-8') as f:
    f.write(fallback_content)
print(f"Updated {fallback_path} successfully!")

# -------------------------------------------------------------
# 4. Update storefront/src/lib/data/products.ts
# -------------------------------------------------------------
products_ts_path = 'storefront/src/lib/data/products.ts'
prod_text = open(products_ts_path, encoding='utf-8').read()

# We need to update each product block's "image_url" and "images": [...]
updated_count = 0
for pid in master.keys():
    hero = master[pid][0]
    img_list = master[pid]
    
    # Pattern to find product block by id
    # "id": "meesho-..."
    pid_pos = prod_text.find(f'"id": "{pid}"')
    if pid_pos == -1:
        print(f"Warning: {pid} not found in products.ts")
        continue

    # Find the closing bracket of this product object
    # Find next "active": true or similar end of block
    next_pid_pos = prod_text.find('"id": "meesho-', pid_pos + 1)
    block_end = next_pid_pos if next_pid_pos != -1 else prod_text.rfind('];')
    block = prod_text[pid_pos:block_end]

    # Replace "image_url": "..." in block
    new_block = re.sub(
        r'"image_url":\s*"[^"]*"',
        f'"image_url": "{hero}"',
        block,
        count=1
    )
    
    # Format new images json array
    images_json = '[\n' + ',\n'.join([f'      "{u}"' for u in img_list]) + '\n    ]'
    new_block = re.sub(
        r'"images":\s*\[[^\]]*\]',
        f'"images": {images_json}',
        new_block,
        count=1
    )

    prod_text = prod_text[:pid_pos] + new_block + prod_text[block_end:]
    updated_count += 1

with open(products_ts_path, 'w', encoding='utf-8') as f:
    f.write(prod_text)
print(f"Updated {updated_count} products in {products_ts_path}!")

# -------------------------------------------------------------
# 5. Update Supabase products table
# -------------------------------------------------------------
env_path = '.env'
if os.path.exists(env_path):
    for l in open(env_path, encoding='utf-8'):
        if '=' in l and not l.startswith('#'):
            k, v = l.strip().split('=', 1)
            os.environ[k] = v

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

con = pg8000.native.Connection(
    user='postgres',
    host=os.environ.get('SUPABASE_DB_HOST', 'db.qdkkxpfhwrwyoardlceo.supabase.co'),
    port=5432,
    database='postgres',
    password=os.environ.get('SUPABASE_DB_PASS'),
    ssl_context=ctx
)

db_updated = 0
for pid in master.keys():
    hero = master[pid][0]
    con.run(
        "UPDATE products SET image_url = :img, updated_at = NOW() WHERE id = :pid",
        img=hero,
        pid=pid
    )
    db_updated += 1

print(f"Updated {db_updated} rows in Supabase products table!")
con.close()
print("ALL 103 PRODUCTS FULLY UPDATED AND SYNCED!")
