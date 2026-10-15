import os
import sys
import json

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

target_file = r"c:\Users\ajay kumar\Downloads\harmess agemnt\storefront\src\lib\data\products.ts"

from tools.migrate_to_qikink import qikink_products

# Convert to TS format
ts_products = []
for p in qikink_products:
    item = {
        "id": p["id"],
        "slug": p["slug"],
        "emoji": p["emoji"],
        "tag": p["tag"],
        "tagColor": p["tag_color"],
        "tagBg": p["tag_bg"],
        "title": p["title"],
        "short": p["short"],
        "story": p["story"],
        "details": json.loads(p["details"]),
        "price": p["price"],
        "price_inr": p["price_inr"],
        "compareAtPrice": p["compare_at_price"],
        "rating": p["rating"],
        "reviews": p["reviews"],
        "category": p["category"],
        "is_trending": p["is_trending"],
        "is_new": p["is_new"],
        "image_url": p["image_url"],
        "images": [p["image_url"]],
        "gradient": p["gradient"],
        "chapter": p["chapter"].upper(),
        "pet": "both",
        "ages": ["all"],
        "benefits": [],
        "safety": "100% Certified Premium Quality",
        "vetNote": "",
        "subscribeEligible": False,
        "wash": "#fff3e0",
        "badges": ["Pan-India Express", "Cash on Delivery", "7-Day Replacement"],
        "active": True
    }
    ts_products.append(item)

header = """export type ProductCategory = 'general' | 'electronics' | 'fashion' | 'home-garden' | 'home-living' | 'pets' | 'beds' | 'toys' | 'tech' | 'decor' | 'lifestyle';
export type PetType = 'dog' | 'cat' | 'both';
export type AgeGroup = 'puppy' | 'adult' | 'senior' | 'all';

export interface Product {
  id: string;
  slug: string;
  emoji: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  short: string;
  story: string;
  details: string[];
  price: number;
  price_inr?: number;
  compareAtPrice?: number;
  rating: number;
  reviews: number;
  image_url?: string;
  images?: string[];
  category?: ProductCategory;
  market?: 'IN' | 'GLOBAL';
  supplier?: string;
  is_trending?: boolean;
  is_new?: boolean;
  gradient: string;
  chapter: string;
  pet: PetType;
  ages: AgeGroup[];
  benefits: string[];
  safety: string;
  vetNote: string;
  subscribeEligible: boolean;
  wash: string;
  badges: string[];
  stock?: number;
  active?: boolean;
}

export const USD_TO_INR_RATE = 85;

export function getClientMarket(): 'IN' | 'GLOBAL' {
  if (typeof window === 'undefined') return 'IN';
  try {
    const saved = localStorage.getItem('rareember_market');
    if (saved === 'IN' || saved === 'GLOBAL') return saved;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const isIndia =
      tz.includes('Calcutta') ||
      tz.includes('Kolkata') ||
      tz.includes('Asia/Kolkata') ||
      navigator.language.includes('en-IN') ||
      (Boolean(navigator.languages) && navigator.languages.some((l) => l.includes('en-IN')));
    return isIndia ? 'IN' : 'GLOBAL';
  } catch {
    return 'IN';
  }
}

export function formatPrice(num: number, marketOverride?: 'IN' | 'GLOBAL'): string {
  const m = marketOverride ?? getClientMarket();
  if (m === 'IN') {
    const val = num >= 80 ? Math.round(num) : Math.round(num * USD_TO_INR_RATE);
    return `₹${val.toLocaleString('en-IN')}`;
  }
  const val = num >= 80 ? num / USD_TO_INR_RATE : num;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export function computeDiscount(rawPrice: number, rawCompare?: number, priceInr?: number): number | undefined {
  if (!rawCompare || rawCompare <= 0) return undefined;
  
  const actualPriceInr = priceInr && priceInr > 0 
    ? priceInr 
    : (rawPrice >= 80 ? rawPrice : Math.round(rawPrice * USD_TO_INR_RATE));
    
  const actualCompareInr = rawCompare >= 80 
    ? rawCompare 
    : Math.round(rawCompare * USD_TO_INR_RATE);

  if (actualCompareInr <= actualPriceInr) return undefined;
  
  const pct = Math.round((1 - actualPriceInr / actualCompareInr) * 100);
  if (pct < 5 || pct > 80) return undefined;
  return pct;
}

export const SHOP_CATEGORIES = [
  { id: 'fashion', label: 'Curated Streetwear', count: 4, hint: 'Style', emoji: '👕' },
  { id: 'home-garden', label: 'Drinkware & Living', count: 3, hint: 'Home', emoji: '☕' },
  { id: 'electronics', label: 'Desk & Creator Gear', count: 1, hint: 'Setup', emoji: '⚡' },
  { id: 'general', label: 'Lifestyle Drops', count: 2, hint: 'Essentials', emoji: '🔥' },
];
"""

footer = """
export const PET_META: Record<string, any> = {
  dog: { emoji: '🐕', label: 'For Dogs', color: '#9a3412', bg: '#fff7ed' },
  cat: { emoji: '🐈', label: 'For Cats', color: '#831843', bg: '#fdf2f8' },
  both: { emoji: '🐾', label: 'For Pets', color: '#0f172a', bg: '#f1f5f9' }
};

export const bundles: Record<string, string[]> = {
  "rareember-oversized-streetwear-tee-obsidian": ["rareember-heavyweight-fleece-hoodie-onyx", "rareember-matte-black-ceramic-coffee-mug"],
  "rareember-heavyweight-fleece-hoodie-onyx": ["rareember-oversized-streetwear-tee-offwhite", "rareember-thermal-insulated-travel-tumbler-straw"],
  "rareember-matte-black-ceramic-coffee-mug": ["rareember-extended-desk-mat-gaming-mousepad", "rareember-hardbound-minimalist-dot-journal"],
  "rareember-thermal-insulated-travel-tumbler-straw": ["rareember-heavyweight-canvas-tote-bag", "rareember-oversized-streetwear-tee-obsidian"],
};

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id || p.slug === id);
}
"""

content = header + "\nexport const products: Product[] = " + json.dumps(ts_products, indent=2) + ";\n" + footer

with open(target_file, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Successfully updated storefront/src/lib/data/products.ts with RareEmber Qikink collection!")
