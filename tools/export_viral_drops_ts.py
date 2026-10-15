import json
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.seed_50_trending_drops import PRODUCTS_50

ts_lines = [
    'import type { Product } from "./products";\n\n',
    'export const VIRAL_DROPS_50: Product[] = [\n'
]

for p in PRODUCTS_50:
    price_inr = p['price_inr']
    price_usd = round(price_inr / 85.0, 2)
    compare_at = p['compare_at_price']
    item = {
        'id': p['id'],
        'slug': p['slug'],
        'title': p['title'],
        'short': p['short'],
        'story': p['story'],
        'details': p['details'],
        'price': price_usd,
        'price_inr': price_inr,
        'compareAtPrice': compare_at,
        'compare_at_price': compare_at,
        'category': p['category'],
        'emoji': p['emoji'],
        'tag': p['tag'],
        'tagColor': '#FF4D24',
        'tagBg': 'rgba(255, 77, 36, 0.12)',
        'rating': p['rating'],
        'reviews': p['reviews'],
        'image_url': p['image_url'],
        'gradient': 'linear-gradient(135deg, #18181b, #09090b)',
        'market': 'IN',
        'supplier': 'Tirupur Hub / Qikink Domestic Direct',
        'is_trending': True,
        'is_new': True,
        'active': True,
        'stock': 150,
        'benefits': ['100% Domestic Manufacturing', 'Express Pan-India Air Dispatch', 'Doorstep Cash on Delivery'],
        'safety': 'Pre-shrunk, bio-washed, certified non-toxic organic pigment inks.',
        'vetNote': 'Dispatched direct from Tirupur factory with 7-Day Free Doorstep Replacement.',
        'badges': ['Verified Bestseller', 'Tirupur Quality', 'Zero Loss Protected']
    }
    ts_lines.append('  ' + json.dumps(item, ensure_ascii=False) + ',\n')

ts_lines.append('];\n')

target_file = Path('storefront/src/lib/data/viral-drops.ts')
target_file.write_text(''.join(ts_lines), encoding='utf-8')
print(f"Generated {target_file} with {len(PRODUCTS_50)} products!")
