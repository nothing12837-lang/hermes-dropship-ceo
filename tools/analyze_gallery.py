import re
import json

text = open('storefront/src/lib/data/product-gallery.ts', encoding='utf-8').read()

pattern = r"['\"](meesho-[a-z0-9\-]+)['\"]:\s*\[\s*([\s\S]*?)\s*\]"
matches = re.findall(pattern, text)
print(f"Total matches in CURATED_PRODUCT_GALLERIES: {len(matches)}")
meesho_only = []
mixed = []
unsplash_only = []

for pid, block in matches:
    has_m = "images.meesho.com" in block
    has_u = "unsplash" in block
    if has_m and not has_u:
        meesho_only.append(pid)
    elif has_m and has_u:
        mixed.append(pid)
    else:
        unsplash_only.append(pid)

print(f"Meesho only: {len(meesho_only)}")
print(f"Mixed: {len(mixed)}")
print(f"Unsplash only: {len(unsplash_only)}")

print("\nPure Meesho products:")
for p in meesho_only:
    print(f" - {p}")

print("\nMixed products (need complete meesho replacement):")
for p in mixed:
    print(f" - {p}")
