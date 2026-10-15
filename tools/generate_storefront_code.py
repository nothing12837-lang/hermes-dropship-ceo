import json

with open('tools/qikink_full_147_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Loaded {len(catalog)} products from full 147 catalog.")

# 1. Generate fallback-images.ts
fallback_lines = [
    "/**",
    " * Curated image fallbacks for catalog items when image_url is missing.",
    " * 100% Genuine Qikink Print-on-Demand Collection (147 Products).",
    " */",
    "",
    "export const FALLBACK_IMAGES: Record<string, string> = {"
]
for p in catalog:
    fallback_lines.append(f'  "{p["id"]}": "{p["image_url"]}",')
fallback_lines.append("};")
fallback_lines.append("")
fallback_lines.append("/** DB image first, curated fallback second, undefined last. */")
fallback_lines.append("export function resolveProductImage(id: string, imageUrl?: string | null): string | undefined {")
fallback_lines.append("  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;")
fallback_lines.append("  return FALLBACK_IMAGES[id];")
fallback_lines.append("}")
fallback_lines.append("")

with open('storefront/src/lib/data/fallback-images.ts', 'w', encoding='utf-8') as f:
    f.write("\n".join(fallback_lines))
print("Updated storefront/src/lib/data/fallback-images.ts!")

# 2. Generate product-gallery.ts
gallery_lines = [
    "// ─── Rare Ember Multi-Angle Product Photo Galleries ───",
    "// Authentic Qikink S3 mockups and variations for all 147 products.",
    "",
    "export const CURATED_PRODUCT_GALLERIES: Record<string, string[]> = {"
]
for p in catalog:
    imgs = p["images"] if p.get("images") and len(p["images"]) > 0 else [p["image_url"]]
    imgs_json = json.dumps(imgs, indent=4)
    indented = "\n".join("  " + line for line in imgs_json.split("\n"))
    gallery_lines.append(f'  "{p["id"]}": {indented.strip()},')
gallery_lines.append("};")
gallery_lines.append("")
gallery_lines.append("export function resolveProductGallery(")
gallery_lines.append("  id: string,")
gallery_lines.append("  primaryUrl?: string | null,")
gallery_lines.append("  category?: string,")
gallery_lines.append("  explicitImages?: string[] | null")
gallery_lines.append("): string[] {")
gallery_lines.append("  if (CURATED_PRODUCT_GALLERIES[id] && CURATED_PRODUCT_GALLERIES[id].length >= 2) {")
gallery_lines.append("    return CURATED_PRODUCT_GALLERIES[id];")
gallery_lines.append("  }")
gallery_lines.append("")
gallery_lines.append("  const matchedKey = Object.keys(CURATED_PRODUCT_GALLERIES).find(")
gallery_lines.append("    (k) => id.includes(k) || k.includes(id)")
gallery_lines.append("  );")
gallery_lines.append("  if (matchedKey && CURATED_PRODUCT_GALLERIES[matchedKey].length >= 2) {")
gallery_lines.append("    return CURATED_PRODUCT_GALLERIES[matchedKey];")
gallery_lines.append("  }")
gallery_lines.append("")
gallery_lines.append("  if (Array.isArray(explicitImages) && explicitImages.length >= 2) {")
gallery_lines.append("    const valid = explicitImages.filter((u) => Boolean(u && u.trim().length > 0));")
gallery_lines.append("    if (valid.length >= 2) return valid;")
gallery_lines.append("  }")
gallery_lines.append("")
gallery_lines.append("  const fallback = primaryUrl && primaryUrl.trim().length > 0 ? primaryUrl.trim() : null;")
gallery_lines.append("  if (fallback) {")
gallery_lines.append("    return [fallback];")
gallery_lines.append("  }")
gallery_lines.append("")
gallery_lines.append("  return [];")
gallery_lines.append("}")
gallery_lines.append("")
gallery_lines.append("export const resolveProductImages = resolveProductGallery;")
gallery_lines.append("")

with open('storefront/src/lib/data/product-gallery.ts', 'w', encoding='utf-8') as f:
    f.write("\n".join(gallery_lines))
print("Updated storefront/src/lib/data/product-gallery.ts!")

# 3. Generate products.ts
cat_counts = {}
for p in catalog:
    cat_counts[p['category']] = cat_counts.get(p['category'], 0) + 1

products_ts_lines = [
    "export type ProductCategory = 'general' | 'electronics' | 'fashion' | 'home-garden' | 'home-living' | 'pets' | 'beds' | 'toys' | 'tech' | 'decor' | 'lifestyle';",
    "export type PetType = 'dog' | 'cat' | 'both';",
    "export type AgeGroup = 'puppy' | 'adult' | 'senior' | 'all';",
    "",
    "export interface Product {",
    "  id: string;",
    "  slug: string;",
    "  emoji: string;",
    "  tag: string;",
    "  tagColor: string;",
    "  tagBg: string;",
    "  title: string;",
    "  short: string;",
    "  story: string;",
    "  details: string[];",
    "  price: number;",
    "  price_inr?: number;",
    "  compareAtPrice?: number;",
    "  compare_at_price?: number;",
    "  old_price?: number;",
    "  rating: number;",
    "  reviews: number;",
    "  image_url?: string;",
    "  images?: string[];",
    "  category?: ProductCategory;",
    "  market?: 'IN' | 'GLOBAL';",
    "  supplier?: string;",
    "  is_trending?: boolean;",
    "  is_new?: boolean;",
    "  gradient: string;",
    "  chapter?: string;",
    "  pet?: PetType;",
    "  ages?: AgeGroup[];",
    "  benefits?: string[];",
    "  safety?: string;",
    "  vetNote?: string;",
    "  subscribeEligible?: boolean;",
    "  wash?: string;",
    "  badges?: string[];",
    "  stock?: number;",
    "  active?: boolean;",
    "}",
    "",
    "export const USD_TO_INR_RATE = 85;",
    "",
    "export function getClientMarket(): 'IN' | 'GLOBAL' {",
    "  if (typeof window === 'undefined') return 'IN';",
    "  try {",
    "    const saved = localStorage.getItem('rareember_market');",
    "    if (saved === 'IN' || saved === 'GLOBAL') return saved;",
    "    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';",
    "    const isIndia =",
    "      tz.includes('Calcutta') ||",
    "      tz.includes('Kolkata') ||",
    "      tz.includes('Asia/Kolkata') ||",
    "      navigator.language.includes('en-IN') ||",
    "      (Boolean(navigator.languages) && navigator.languages.some((l) => l.includes('en-IN')));",
    "    return isIndia ? 'IN' : 'GLOBAL';",
    "  } catch {",
    "    return 'IN';",
    "  }",
    "}",
    "",
    "export function formatPrice(num: number, marketOverride?: 'IN' | 'GLOBAL'): string {",
    "  const m = marketOverride ?? getClientMarket();",
    "  if (m === 'IN') {",
    "    const val = num >= 80 ? Math.round(num) : Math.round(num * USD_TO_INR_RATE);",
    "    return `₹${val.toLocaleString('en-IN')}`;",
    "  }",
    "  const val = num >= 80 ? num / USD_TO_INR_RATE : num;",
    "  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);",
    "}",
    "",
    "export function computeDiscount(rawPrice: number, rawCompare?: number, priceInr?: number): number | undefined {",
    "  if (!rawCompare || rawCompare <= 0) return undefined;",
    "  const actualPriceInr = priceInr && priceInr > 0 ",
    "    ? priceInr ",
    "    : (rawPrice >= 80 ? rawPrice : Math.round(rawPrice * USD_TO_INR_RATE));",
    "  const actualCompareInr = rawCompare >= 80 ",
    "    ? rawCompare ",
    "    : Math.round(rawCompare * USD_TO_INR_RATE);",
    "  if (actualCompareInr <= actualPriceInr) return undefined;",
    "  const pct = Math.round((1 - actualPriceInr / actualCompareInr) * 100);",
    "  if (pct < 5 || pct > 80) return undefined;",
    "  return pct;",
    "}",
    "",
    "export const SHOP_CATEGORIES = [",
    f"  {{ id: 'fashion', label: 'Curated Streetwear', count: {cat_counts.get('fashion', 86)}, hint: 'Style', emoji: '👕' }},",
    f"  {{ id: 'home-garden', label: 'Drinkware & Living', count: {cat_counts.get('home-garden', 30)}, hint: 'Drinkware', emoji: '☕' }},",
    f"  {{ id: 'electronics', label: 'Desk & Creator Gear', count: {cat_counts.get('electronics', 5)}, hint: 'Workstation', emoji: '⚡' }},",
    f"  {{ id: 'general', label: 'Lifestyle Drops', count: {cat_counts.get('general', 26)}, hint: 'Accessories', emoji: '🔥' }},",
    "];",
    "",
    "export const products: Product[] = ["
]

for idx, p in enumerate(catalog):
    prod_dict = {
        "id": p["id"],
        "slug": p["slug"],
        "title": p["title"],
        "price": p["price"],
        "price_inr": p["price_inr"],
        "old_price": p["old_price"],
        "compare_at_price": p["compare_at_price"],
        "category": p["category"],
        "emoji": p["emoji"],
        "tag": p["tag"],
        "tagColor": p["tagColor"],
        "tagBg": p["tagBg"],
        "stock": 500,
        "rating": p["rating"],
        "reviews": p["reviews"],
        "image_url": p["image_url"],
        "supplier": "qikink",
        "short": p["short"],
        "story": p["story"],
        "details": p["details"],
        "gradient": "linear-gradient(135deg, #18181b, #09090b)",
        "active": True
    }
    dumped = json.dumps(prod_dict, indent=2, ensure_ascii=False)
    products_ts_lines.append("  " + dumped + ",")

products_ts_lines.append("];")
products_ts_lines.append("")

bundles_dict = {}
for i, p in enumerate(catalog):
    next1 = catalog[(i + 1) % len(catalog)]["id"]
    next2 = catalog[(i + 2) % len(catalog)]["id"]
    bundles_dict[p["id"]] = [next1, next2]

products_ts_lines.append("export const PET_META: Record<string, any> = {")
products_ts_lines.append("  dog: { emoji: '🐕', label: 'For Dogs', color: '#9a3412', bg: '#fff7ed' },")
products_ts_lines.append("  cat: { emoji: '🐈', label: 'For Cats', color: '#831843', bg: '#fdf2f8' },")
products_ts_lines.append("  both: { emoji: '🐾', label: 'For Pets', color: '#0f172a', bg: '#f1f5f9' },")
products_ts_lines.append("};")
products_ts_lines.append("")
products_ts_lines.append(f"export const bundles: Record<string, string[]> = {json.dumps(bundles_dict, indent=2)};")
products_ts_lines.append("")
products_ts_lines.append("export function getProduct(id: string): Product | undefined {")
products_ts_lines.append("  return products.find((p) => p.id === id || p.slug === id);")
products_ts_lines.append("}")
products_ts_lines.append("")

with open('storefront/src/lib/data/products.ts', 'w', encoding='utf-8') as f:
    f.write("\n".join(products_ts_lines))
print(f"Updated storefront/src/lib/data/products.ts with all {len(catalog)} authentic Qikink products!")
