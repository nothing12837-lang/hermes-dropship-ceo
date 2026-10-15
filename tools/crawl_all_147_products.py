import urllib.request
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

with open('tools/qikink_all_urls.txt', 'r', encoding='utf-8') as f:
    urls = [line.strip() for line in f if line.strip()]

print(f"Total URLs to crawl: {len(urls)}")

def map_category(raw_cat: str, title: str, url: str) -> str:
    combined = f"{raw_cat} {title} {url}".lower()
    if any(k in combined for k in ['bottle', 'tumbler', 'sipper', 'mug', 'cup', 'coaster', 'pillow', 'cushion', 'tapestry', 'napkin', 'placemat', 'puzzle', 'home-decor']):
        return 'home-garden'
    if any(k in combined for k in ['desk-mat', 'mouse-pad', 'mouse pad', 'phone', 'case', 'grip']):
        return 'electronics'
    if any(k in combined for k in ['tee', 't-shirt', 'hoodie', 'sweatshirt', 'jacket', 'jogger', 'sweatpant', 'shorts', 'leggings', 'dress', 'crop', 'vest', 'cap', 'hat', 'balaclava', 'apparel', 'headwear', 'bottomwear', 'tops']):
        return 'fashion'
    return 'general'

def assign_meta(title: str, category: str):
    t = title.lower()
    if 'hoodie' in t or 'sweatshirt' in t or 'jacket' in t:
        return '🧥', 'Heavyweight Streetwear', '#f97316', 'rgba(249, 115, 22, 0.12)'
    if 'tee' in t or 't-shirt' in t or 'polo' in t:
        return '👕', '240 GSM Combed Cotton', '#ff4d24', 'rgba(255, 77, 36, 0.12)'
    if 'jogger' in t or 'sweatpant' in t or 'shorts' in t or 'leggings' in t:
        return '👖', 'Athletic Fleece', '#3b82f6', 'rgba(59, 130, 246, 0.12)'
    if 'bottle' in t or 'tumbler' in t or 'sipper' in t:
        return '☕', 'Thermal Insulated', '#06b6d4', 'rgba(6, 182, 212, 0.12)'
    if 'desk-mat' in t or 'mouse-pad' in t or 'gaming' in t:
        return '⚡', 'Precision Micro-Weave', '#6366f1', 'rgba(99, 102, 241, 0.12)'
    if 'phone' in t or 'case' in t:
        return '📱', 'Impact Resistant', '#8b5cf6', 'rgba(139, 92, 246, 0.12)'
    if 'poster' in t or 'frame' in t or 'canvas' in t:
        return '🖼️', 'Gallery Grade Art', '#f59e0b', 'rgba(245, 158, 11, 0.12)'
    if 'bag' in t or 'tote' in t:
        return '🎒', 'Heavy Canvas', '#10b981', 'rgba(16, 185, 129, 0.12)'
    if 'notebook' in t or 'planner' in t or 'journal' in t:
        return '📓', 'Acid-Free Dot Grid', '#a855f7', 'rgba(168, 85, 247, 0.12)'
    if 'sticker' in t:
        return '✨', 'Waterproof Die-Cut', '#ec4899', 'rgba(236, 72, 153, 0.12)'
    if 'cap' in t or 'hat' in t:
        return '🧢', 'Structured Fit', '#14b8a6', 'rgba(20, 184, 166, 0.12)'
    if 'pet' in t or 'dog' in t:
        return '🐾', 'Pet Studio', '#f43f5e', 'rgba(244, 63, 94, 0.12)'
    return '🔥', 'Creator Lifestyle', '#ff4d24', 'rgba(255, 77, 36, 0.12)'

def compute_prices(base_cost: float, category: str, title: str):
    # Smart retail margin logic:
    # Under ₹200: sell at ₹299 - ₹399
    # ₹200 - ₹400: sell at ₹599 - ₹799
    # ₹400 - ₹700: sell at ₹899 - ₹1,199
    # ₹700 - ₹1200: sell at ₹1,499 - ₹1,999
    # > ₹1200: sell at base * 1.5
    if base_cost <= 0:
        if 'hoodie' in title.lower() or 'jacket' in title.lower():
            selling_inr = 1499
        elif 'tee' in title.lower():
            selling_inr = 899
        else:
            selling_inr = 699
    elif base_cost < 150:
        selling_inr = 299
    elif base_cost < 250:
        selling_inr = 499
    elif base_cost < 350:
        selling_inr = 699
    elif base_cost < 550:
        selling_inr = 899
    elif base_cost < 800:
        selling_inr = 1299
    elif base_cost < 1100:
        selling_inr = 1699
    else:
        selling_inr = round((base_cost * 1.5) / 10) * 10 - 1

    compare_inr = round((selling_inr * 1.8) / 50) * 50 - 1
    price_usd = round(selling_inr / 85.0, 2)
    compare_usd = round(compare_inr / 85.0, 2)
    return selling_inr, compare_inr, price_usd, compare_usd

def crawl_product(url: str):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode('utf-8', errors='ignore')

        # 1. JSON-LD Schema
        json_ld_matches = re.findall(r'<script\s+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL)
        product_schema = None
        for j in json_ld_matches:
            try:
                data = json.loads(j)
                if data.get('@type') == 'Product':
                    product_schema = data
                    break
            except Exception:
                continue

        # 2. Title
        title = ""
        if product_schema and product_schema.get('name'):
            title = product_schema['name']
        else:
            h1 = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
            if h1:
                title = h1.group(1).strip()
            else:
                title = re.search(r'<title>([^<]+)</title>', html).group(1).split('|')[0].strip()

        # Clean title & ensure "Rare Ember" branding
        title = re.sub(r'\s*\|\s*Qikink.*$', '', title, flags=re.IGNORECASE)
        title = re.sub(r'^Custom\s+', '', title, flags=re.IGNORECASE)
        if not title.startswith('Rare Ember'):
            title = f"Rare Ember {title.strip()}"

        # 3. Slug and ID
        slug_match = re.search(r'/custom/(.+?)/?$', url)
        slug_path = slug_match.group(1).replace('/', '-').strip('-') if slug_match else 'item'
        prod_id = f"qikink-{slug_path}"
        slug = prod_id

        # 4. Description & Details
        description = ""
        if product_schema and product_schema.get('description'):
            description = product_schema['description']
        else:
            meta_desc = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', html)
            description = meta_desc.group(1).strip() if meta_desc else ""

        # Clean description of any Qikink branding
        clean_desc = re.sub(r'Qikink', 'Rare Ember Studio', description, flags=re.IGNORECASE)
        clean_desc = re.sub(r'print-on-demand seller for dropshipping in India, or directly as a customer with their own design', 'Rare Ember premium private drop with custom personalisation studio', clean_desc, flags=re.IGNORECASE)

        # Extract specifications into details bullet points
        details = []
        # Check if description has comma-separated specs
        parts = [p.strip() for p in clean_desc.split('.') if p.strip()]
        for p in parts:
            if any(k in p.lower() for k in ['gsm', 'cotton', 'fabric', 'wash', 'fit', 'print', 'ribbed', 'fleece', 'material', 'size', 'dimension', 'waterproof']):
                details.append(p[:90].strip())
        if len(details) < 3:
            details.extend([
                "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
                "100% Doorstep 7-Day Free Replacement Guarantee",
                "Cash on Delivery & 1-Click UPI Available Pan-India"
            ])
        details = details[:6]

        # 5. Price
        base_cost = 0.0
        if product_schema and product_schema.get('offers') and product_schema['offers'].get('price'):
            try:
                base_cost = float(product_schema['offers']['price'])
            except Exception:
                pass
        if base_cost <= 0:
            prices = re.findall(r'(?:₹|Rs\.?)\s*([0-9,]+)', html)
            if prices:
                valid = [float(p.replace(',', '')) for p in prices if 50 <= float(p.replace(',', '')) <= 5000]
                if valid:
                    base_cost = min(valid)

        category = map_category(product_schema.get('category', '') if product_schema else '', title, url)
        price_inr, compare_inr, price_usd, compare_usd = compute_prices(base_cost, category, title)

        # 6. Mockups
        raw_mockups = re.findall(r'https://qikink-stores\.s3\.ap-south-1\.amazonaws\.com/assets/mockups/[^\s"\'\\<>\)]+', html)
        valid_mockups = []
        for m in raw_mockups:
            # clean query or punctuation
            m_clean = m.split('?')[0].rstrip('.,;)]')
            if any(m_clean.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                if m_clean not in valid_mockups:
                    valid_mockups.append(m_clean)

        primary_image = ""
        if product_schema and product_schema.get('image'):
            img_val = product_schema['image']
            if isinstance(img_val, list) and len(img_val) > 0:
                primary_image = img_val[0]
            elif isinstance(img_val, str):
                primary_image = img_val

        if not primary_image and valid_mockups:
            primary_image = valid_mockups[0]

        if primary_image and primary_image not in valid_mockups:
            valid_mockups.insert(0, primary_image)

        emoji, tag, tagColor, tagBg = assign_meta(title, category)

        # Rating and reviews
        rating = 4.9
        reviews_count = 120
        if product_schema and product_schema.get('aggregateRating'):
            try:
                rating = float(product_schema['aggregateRating'].get('ratingValue', 4.9))
                reviews_count = int(product_schema['aggregateRating'].get('ratingCount', 120))
            except Exception:
                pass

        return {
            "id": prod_id,
            "slug": slug,
            "title": title,
            "category": category,
            "price": price_usd,
            "price_inr": price_inr,
            "old_price": compare_inr,
            "compare_at_price": compare_usd,
            "base_cost": base_cost,
            "emoji": emoji,
            "tag": tag,
            "tagColor": tagColor,
            "tagBg": tagBg,
            "image_url": primary_image,
            "images": valid_mockups,
            "short": clean_desc[:140] if clean_desc else f"Authentic {title} with Tirupur domestic craftsmanship.",
            "story": clean_desc if clean_desc else f"Engineered for Rare Ember with genuine domestic craftsmanship. Dispatched direct from Tirupur hub.",
            "details": details,
            "rating": rating,
            "reviews": max(reviews_count, 45),
            "stock": 500,
            "active": True,
            "supplier": "qikink",
            "source_url": url
        }
    except Exception as e:
        print(f"Error crawling {url}: {e}")
        return None

results = []
start_time = time.time()
with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_url = {executor.submit(crawl_product, u): u for u in urls}
    for future in as_completed(future_to_url):
        data = future.result()
        if data:
            results.append(data)
            print(f"[{len(results)}/{len(urls)}] Crawled: {data['title']} ({len(data['images'])} mockups)")

print(f"\nFinished crawling {len(results)} products in {time.time() - start_time:.1f}s!")

# Sort by category and title
results.sort(key=lambda x: (x['category'], x['title']))

with open('tools/qikink_full_147_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Saved {len(results)} products to tools/qikink_full_147_catalog.json")
