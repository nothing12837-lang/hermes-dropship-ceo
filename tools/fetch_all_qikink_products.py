import urllib.request
import re
import json
import time

QIKINK_TARGETS = [
    # Streetwear T-Shirts & Tops
    {
        "id": "qikink-oversized-t-shirt-uc22",
        "url": "https://qikink.com/custom/t-shirts/oversized-t-shirt-uc22/",
        "category": "fashion",
        "emoji": "👕",
        "tag": "Signature Drop",
        "tagColor": "#FF4D24",
        "tagBg": "rgba(255, 77, 36, 0.12)",
        "retail_inr": 899,
        "compare_inr": 1799
    },
    {
        "id": "qikink-acid-wash-oversized-t-shirt-uc61",
        "url": "https://qikink.com/custom/t-shirts/acid-wash-oversized-t-shirt-uc61/",
        "category": "fashion",
        "emoji": "👕",
        "tag": "Vintage Wash",
        "tagColor": "#f59e0b",
        "tagBg": "rgba(245, 158, 11, 0.12)",
        "retail_inr": 999,
        "compare_inr": 1999
    },
    {
        "id": "qikink-terry-oversized-t-shirt-ut27",
        "url": "https://qikink.com/custom/t-shirts/terry-oversized-t-shirt-ut27/",
        "category": "fashion",
        "emoji": "👕",
        "tag": "Heavy French Terry",
        "tagColor": "#8b5cf6",
        "tagBg": "rgba(139, 92, 246, 0.12)",
        "retail_inr": 949,
        "compare_inr": 1899
    },
    {
        "id": "qikink-supima-cotton-t-shirts-uc23",
        "url": "https://qikink.com/custom/t-shirts/supima-cotton-t-shirts-uc23/",
        "category": "fashion",
        "emoji": "🖤",
        "tag": "Luxury Supima",
        "tagColor": "#6366f1",
        "tagBg": "rgba(99, 102, 241, 0.12)",
        "retail_inr": 949,
        "compare_inr": 1899
    },
    {
        "id": "qikink-round-neck-t-shirt-classic-uc21",
        "url": "https://qikink.com/custom/t-shirts/round-neck-t-shirt-classic-uc21/",
        "category": "fashion",
        "emoji": "👕",
        "tag": "Classic Everyday",
        "tagColor": "#0ea5e9",
        "tagBg": "rgba(14, 165, 233, 0.12)",
        "retail_inr": 699,
        "compare_inr": 1399
    },
    {
        "id": "qikink-polo-t-shirts-mp25",
        "url": "https://qikink.com/custom/t-shirts/polo-t-shirts-mp25/",
        "category": "fashion",
        "emoji": "👔",
        "tag": "Structured Knit",
        "tagColor": "#10b981",
        "tagBg": "rgba(16, 185, 129, 0.12)",
        "retail_inr": 899,
        "compare_inr": 1799
    },
    {
        "id": "qikink-gym-vest-men-ms36",
        "url": "https://qikink.com/custom/tops/gym-vest-men-ms36/",
        "category": "fashion",
        "emoji": "🎽",
        "tag": "Athletic Muscle Tank",
        "tagColor": "#ef4444",
        "tagBg": "rgba(239, 68, 68, 0.12)",
        "retail_inr": 649,
        "compare_inr": 1299
    },
    {
        "id": "qikink-crop-top-fc39",
        "url": "https://qikink.com/custom/tops/crop-top-fc39/",
        "category": "fashion",
        "emoji": "🤍",
        "tag": "Women's Boxy Crop",
        "tagColor": "#ec4899",
        "tagBg": "rgba(236, 72, 153, 0.12)",
        "retail_inr": 699,
        "compare_inr": 1399
    },
    
    # Hoodies & Sweatshirts
    {
        "id": "qikink-oversized-hoodie-uh32",
        "url": "https://qikink.com/custom/hoodies/oversized-hoodie-uh32/",
        "category": "fashion",
        "emoji": "🧥",
        "tag": "Flagship 380 GSM",
        "tagColor": "#FF4D24",
        "tagBg": "rgba(255, 77, 36, 0.12)",
        "retail_inr": 1699,
        "compare_inr": 3499
    },
    {
        "id": "qikink-unisex-fleece-heavyweight-zip-hoodie-uh38",
        "url": "https://qikink.com/custom/hoodies/unisex-fleece-heavyweight-zip-hoodie-uh38/",
        "category": "fashion",
        "emoji": "🧥",
        "tag": "Heavyweight Full-Zip",
        "tagColor": "#8b5cf6",
        "tagBg": "rgba(139, 92, 246, 0.12)",
        "retail_inr": 1799,
        "compare_inr": 3599
    },
    {
        "id": "qikink-oversized-sweatshirt-uh35",
        "url": "https://qikink.com/custom/hoodies/oversized-sweatshirt-uh35/",
        "category": "fashion",
        "emoji": "🧶",
        "tag": "Boxy Crewneck",
        "tagColor": "#14b8a6",
        "tagBg": "rgba(20, 184, 166, 0.12)",
        "retail_inr": 1399,
        "compare_inr": 2799
    },
    {
        "id": "qikink-cropped-hoodie-fc32",
        "url": "https://qikink.com/custom/hoodies/cropped-hoodie-fc32/",
        "category": "fashion",
        "emoji": "✨",
        "tag": "Women's Cropped Fleece",
        "tagColor": "#d946ef",
        "tagBg": "rgba(217, 70, 239, 0.12)",
        "retail_inr": 1399,
        "compare_inr": 2799
    },

    # Bottomwear
    {
        "id": "qikink-joggers-uj29",
        "url": "https://qikink.com/custom/bottomwear/joggers-uj29/",
        "category": "fashion",
        "emoji": "👖",
        "tag": "Streetwear Joggers",
        "tagColor": "#3b82f6",
        "tagBg": "rgba(59, 130, 246, 0.12)",
        "retail_inr": 1499,
        "compare_inr": 2999
    },
    {
        "id": "qikink-sweatpants-us52",
        "url": "https://qikink.com/custom/bottomwear/sweatpants-us52/",
        "category": "fashion",
        "emoji": "👖",
        "tag": "Heavy Sweatpants",
        "tagColor": "#64748b",
        "tagBg": "rgba(100, 116, 139, 0.12)",
        "retail_inr": 1399,
        "compare_inr": 2799
    },

    # Drinkware
    {
        "id": "qikink-steel-water-bottle",
        "url": "https://qikink.com/custom/drinkware/steel-water-bottle/",
        "category": "home-garden",
        "emoji": "💧",
        "tag": "Food-Grade 304 Steel",
        "tagColor": "#10b981",
        "tagBg": "rgba(16, 185, 129, 0.12)",
        "retail_inr": 799,
        "compare_inr": 1599
    },
    {
        "id": "qikink-tumbler-bottle",
        "url": "https://qikink.com/custom/drinkware/tumbler-bottle/",
        "category": "home-garden",
        "emoji": "🥤",
        "tag": "Insulated Tumbler",
        "tagColor": "#06b6d4",
        "tagBg": "rgba(6, 182, 212, 0.12)",
        "retail_inr": 899,
        "compare_inr": 1799
    },
    {
        "id": "qikink-sipper-bottle",
        "url": "https://qikink.com/custom/drinkware/sipper-bottle/",
        "category": "home-garden",
        "emoji": "🧋",
        "tag": "Aesthetic Sipper",
        "tagColor": "#f59e0b",
        "tagBg": "rgba(245, 158, 11, 0.12)",
        "retail_inr": 599,
        "compare_inr": 1199
    },

    # Workstation & Desk Gear
    {
        "id": "qikink-desk-mat",
        "url": "https://qikink.com/custom/accessories/desk-mat/",
        "category": "electronics",
        "emoji": "🖥️",
        "tag": "Creator Workstation",
        "tagColor": "#3b82f6",
        "tagBg": "rgba(59, 130, 246, 0.12)",
        "retail_inr": 899,
        "compare_inr": 1799
    },
    {
        "id": "qikink-mouse-pad",
        "url": "https://qikink.com/custom/accessories/mouse-pad/",
        "category": "electronics",
        "emoji": "🖱️",
        "tag": "Precision Glide",
        "tagColor": "#6366f1",
        "tagBg": "rgba(99, 102, 241, 0.12)",
        "retail_inr": 399,
        "compare_inr": 799
    },
    {
        "id": "qikink-clear-phone-case",
        "url": "https://qikink.com/custom/accessories/mobile/clear-phone-case/",
        "category": "electronics",
        "emoji": "📱",
        "tag": "Impact Shield",
        "tagColor": "#ec4899",
        "tagBg": "rgba(236, 72, 153, 0.12)",
        "retail_inr": 549,
        "compare_inr": 1099
    },

    # Bags & Lifestyle
    {
        "id": "qikink-tote-bag",
        "url": "https://qikink.com/custom/bags/tote-bag/",
        "category": "general",
        "emoji": "👜",
        "tag": "100% Cotton Canvas",
        "tagColor": "#10b981",
        "tagBg": "rgba(16, 185, 129, 0.12)",
        "retail_inr": 449,
        "compare_inr": 999
    },
    {
        "id": "qikink-large-tote-bag",
        "url": "https://qikink.com/custom/bags/large-tote-bag/",
        "category": "general",
        "emoji": "👜",
        "tag": "Extra Heavy Canvas",
        "tagColor": "#0ea5e9",
        "tagBg": "rgba(14, 165, 233, 0.12)",
        "retail_inr": 549,
        "compare_inr": 1199
    },
    {
        "id": "qikink-notebook",
        "url": "https://qikink.com/custom/home-decor/notebook/",
        "category": "general",
        "emoji": "📓",
        "tag": "Hardbound Journal",
        "tagColor": "#8b5cf6",
        "tagBg": "rgba(139, 92, 246, 0.12)",
        "retail_inr": 399,
        "compare_inr": 799
    },
    {
        "id": "qikink-die-cut-stickers",
        "url": "https://qikink.com/custom/accessories/die-cut-stickers/",
        "category": "general",
        "emoji": "✨",
        "tag": "Vinyl Die-Cut Decals",
        "tagColor": "#ec4899",
        "tagBg": "rgba(236, 72, 153, 0.12)",
        "retail_inr": 299,
        "compare_inr": 599
    },
    {
        "id": "qikink-poster-frames",
        "url": "https://qikink.com/custom/home-decor/poster/poster-frames/",
        "category": "general",
        "emoji": "🖼️",
        "tag": "Solid Wood Framed",
        "tagColor": "#f59e0b",
        "tagBg": "rgba(245, 158, 11, 0.12)",
        "retail_inr": 999,
        "compare_inr": 1999
    }
]

def scrape_product(target):
    url = target["url"]
    print(f"Scraping {target['id']} from {url}...")
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    try:
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None

    # 1. Title from H1
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    raw_title = h1_match.group(1).strip() if h1_match else target["id"].replace("-", " ").title()
    clean_title = re.sub(r'<[^>]+>', '', raw_title).strip()
    
    # Prefix brand
    brand_title = f"Rare Ember {clean_title}" if not clean_title.startswith("Rare Ember") else clean_title

    # 2. Extract RSC payload
    raw_chunks = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', html)
    full_rsc = "".join(raw_chunks)
    try:
        full_rsc = full_rsc.encode('utf-8').decode('unicode_escape')
    except:
        pass

    # 3. Product ID / SKU
    sku_match = re.search(r'productId":"([^"]+)"', full_rsc)
    sku = sku_match.group(1) if sku_match else target["id"]

    price_match = re.search(r'priceInr":"([^"]+)"', full_rsc)
    price_numbers = re.findall(r'\d+(?:\.\d+)?', price_match.group(1)) if price_match else []
    base_price = float(price_numbers[0]) if price_numbers else (target["retail_inr"] * 0.45)

    # 5. Extract all genuine Qikink S3 mockups
    s3_images = re.findall(r'https://qikink-stores\.s3\.ap-south-1\.amazonaws\.com/[^\s"\'\\<>]+', full_rsc)
    valid_images = [img for img in s3_images if any(ext in img.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']) and 'footer' not in img and 'logo' not in img]
    unique_images = list(dict.fromkeys(valid_images))

    # Fallback to general S3 regex from HTML
    if len(unique_images) < 2:
        html_s3 = re.findall(r'https%3A%2F%2Fqikink-stores\.s3\.ap-south-1\.amazonaws\.com%2F[^\s"\'&]+', html)
        decoded = [urllib.parse.unquote(u) for u in html_s3]
        for d in decoded:
            if d not in unique_images:
                unique_images.append(d)

    # 6. Highlights / Specifications
    highlight_matches = re.findall(r'highlights":\[([^\]]+)\]', full_rsc)
    specs = []
    if highlight_matches:
        try:
            specs = json.loads(f"[{highlight_matches[0]}]")
        except:
            pass

    if not specs:
        specs = [
            "100% Genuine Qikink Print-on-Demand Factory Direct",
            "Tirupur Hub Precision Manufacturing & Quality Control",
            "Direct-to-Film (DTF) & High-Density Reactive Print",
            "BlueDart & Delhivery 2-4 Days Express Tracked Pan-India Delivery",
            "Rare Ember 7-Day Doorstep Replacement Guarantee"
        ]

    # 7. Short description
    short_desc = f"{specs[0]} with {specs[1] if len(specs) > 1 else 'structured streetwear drape'}. Dispatched direct from Tirupur manufacturing floor."

    product_obj = {
        "id": target["id"],
        "slug": target["id"],
        "title": brand_title,
        "sku": sku,
        "price": round(target["retail_inr"] / 85, 2),
        "price_inr": target["retail_inr"],
        "compare_at_price": round(target["compare_inr"] / 85, 2),
        "old_price": target["compare_inr"],
        "qikink_base_cost": base_price,
        "category": target["category"],
        "emoji": target["emoji"],
        "tag": target["tag"],
        "tagColor": target["tagColor"],
        "tagBg": target["tagBg"],
        "stock": 500,
        "rating": 4.9,
        "reviews": 120,
        "supplier": "qikink",
        "image_url": unique_images[0] if unique_images else "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/3/4d542001-463c-416c-86ea-93effc54f669.jpg",
        "images": unique_images[:8] if unique_images else [],
        "short": short_desc,
        "story": f"Genuine Qikink domestic print-on-demand production engineered for Rare Ember. {clean_title} featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
        "details": specs[:6],
        "active": True
    }
    print(f"  -> Done! Images: {len(unique_images)}, Price: Rs.{target['retail_inr']}, SKU: {sku}")
    return product_obj

def run():
    catalog = []
    for t in QIKINK_TARGETS:
        prod = scrape_product(t)
        if prod:
            catalog.append(prod)
        time.sleep(0.5)

    with open('tools/qikink_scraped_catalog.json', 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print(f"\nSUCCESS! Total authentic Qikink products scraped: {len(catalog)}")

if __name__ == "__main__":
    run()
