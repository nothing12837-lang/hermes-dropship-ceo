"""
RareEmber Instagram Autopilot Engine
Fully automated organic e-commerce marketing:
1. Selects trending catalog products from RareEmber
2. Renders high-converting 1080x1350 vertical e-commerce post creatives
3. Generates sales-optimized captions & targeted hashtags
4. Posts directly to Instagram via instagrapi
5. Sends proof & confirmation to Ajay on Telegram
"""

import os
import sys
import time
import json
import random
import requests
import argparse
from io import BytesIO
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont

# Ensure UTF-8 output on Windows consoles
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "generated_posts")
os.makedirs(OUTPUT_DIR, exist_ok=True)

ENV_FILE = os.path.join(BASE_DIR, ".env")
SESSION_FILE = os.path.join(BASE_DIR, "session.json")
HISTORY_FILE = os.path.join(BASE_DIR, "posted_history.json")

# Load .env if present
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

IG_USERNAME = os.environ.get("IG_USERNAME", "").strip()
IG_PASSWORD = os.environ.get("IG_PASSWORD", "").strip()
IG_SESSIONID = os.environ.get("IG_SESSIONID", "").strip()
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "5238068527").strip()
STORE_URL = "https://rareember-store.vercel.app"

# Curated High-Converting Catalog for RareEmber (100% Domestic Meesho Sourcing)
PRODUCTS_CATALOG = [
    {
        "id": "meesho-water-sensor-led-diyas-pack-of-12",
        "title": "Water Sensor LED Diyas (Pack of 12)",
        "category": "Festive Lighting",
        "price_inr": 299,
        "compare_at": 699,
        "rating": 4.8,
        "reviews": 1840,
        "image_url": "https://images.meesho.com/images/products/431985757/t7ur4_512.jpg",
        "hook": "Pour a drop of water and they illuminate instantly! 🪔✨ No fire risk, 100% reusable.",
        "features": [
            "Water-activated automatic LED sensor",
            "100% flameless, smokeless & shockproof",
            "Long-lasting replaceable coin cells included"
        ]
    },
    {
        "id": "meesho-crystal-diamond-touch-led-table-lamp",
        "title": "Crystal Diamond Touch LED Table Lamp",
        "category": "Ambient Lighting",
        "price_inr": 349,
        "compare_at": 899,
        "rating": 4.7,
        "reviews": 2410,
        "image_url": "https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg",
        "hook": "Tap the top and watch your room transform into a luxury hotel lounge 💎✨",
        "features": [
            "16 RGB color modes with remote controller",
            "Rechargeable USB-C with 12hr battery life",
            "Precision faceted acrylic 3D rose shadow effect"
        ]
    },
    {
        "id": "meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base",
        "title": "3D Crystal Ball Galaxy Night Lamp",
        "category": "Aesthetic Living",
        "price_inr": 299,
        "compare_at": 699,
        "rating": 4.8,
        "reviews": 1250,
        "image_url": "https://images.meesho.com/images/products/1038078401/hha6k_512.jpg",
        "hook": "Bring the entire Milky Way galaxy onto your bedroom desk 🌌✨",
        "features": [
            "K9 optical glass crystal ball with laser engraving",
            "Natural solid beech wood base with warm LED",
            "Plug & play USB power for bedroom or study"
        ]
    },
    {
        "id": "meesho-ultrasonic-flame-mist-aroma-diffuser",
        "title": "Ultrasonic Flame Mist Aroma Diffuser",
        "category": "Wellness & Decor",
        "price_inr": 479,
        "compare_at": 1199,
        "rating": 4.8,
        "reviews": 920,
        "image_url": "https://images.meesho.com/images/products/984668048/khohq_512.jpg",
        "hook": "Realistic fireplace flame effect with relaxing essential oil aroma 🔥✨",
        "features": [
            "Ultrasonic cool mist with realistic LED flame simulation",
            "Auto shut-off sensor when water runs dry",
            "Whisper-quiet operation (<25dB) for sound sleep"
        ]
    },
    {
        "id": "meesho-electric-mini-wireless-garlic-chopper",
        "title": "Electric Mini Wireless Food & Garlic Chopper",
        "category": "Smart Kitchen",
        "price_inr": 349,
        "compare_at": 799,
        "rating": 4.6,
        "reviews": 980,
        "image_url": "https://images.meesho.com/images/products/1001131290/b8mad_512.jpg",
        "hook": "Chop garlic, ginger, and chilies in literally 5 seconds without tears 🧅⚡",
        "features": [
            "304 stainless steel food-grade reinforced blades",
            "One-touch push-button operation",
            "Rechargeable USB battery with waterproof design"
        ]
    },
    {
        "id": "meesho-galaxy-star-astronaut-projector-night-lamp",
        "title": "Astronaut Galaxy Star Projector LED Lamp",
        "category": "Space Decor",
        "price_inr": 599,
        "compare_at": 1499,
        "rating": 4.9,
        "reviews": 1540,
        "image_url": "https://images.meesho.com/images/products/759223858/29bl5_512.jpg",
        "hook": "Transform your ceiling into a stunning starry nebula space adventure 👨‍🚀🚀",
        "features": [
            "360° rotating magnetic astronaut head",
            "8 dynamic nebula modes + green starry projection",
            "Wireless remote control with smart timer auto-off"
        ]
    }
]

FALLBACK_IMAGES = {
    'meesho-water-sensor-led-diyas-pack-of-12': 'https://images.meesho.com/images/products/431985757/t7ur4_512.jpg',
    'meesho-crystal-diamond-touch-led-table-lamp': 'https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg',
    'meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base': 'https://images.meesho.com/images/products/1038078401/hha6k_512.jpg',
    'meesho-ultrasonic-flame-mist-aroma-diffuser': 'https://images.meesho.com/images/products/984668048/khohq_512.jpg',
    'meesho-electric-mini-wireless-garlic-chopper': 'https://images.meesho.com/images/products/1001131290/b8mad_512.jpg',
    'meesho-galaxy-star-astronaut-projector-night-lamp': 'https://images.meesho.com/images/products/759223858/29bl5_512.jpg',
}

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "").strip()

def fetch_live_catalog():
    """Dynamically fetches all active products from Supabase store database."""
    try:
        url = f"{SUPABASE_URL}/rest/v1/products?select=id,title,price,price_inr,compare_at_price,rating,reviews,category,image_url,short,story&order=created_at.desc&limit=100"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
        }
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            db_products = res.json()
            valid = []
            for p in db_products:
                p_id = (p.get("id") or "").lower()
                title = (p.get("title") or "").strip()
                cat = (p.get("category") or "").lower()
                disallowed_blacklist = ["calmcloud", "ember-glow", "warm-paw", "lickmat", "pawtrack", "collar", "pet", "dog", "cat", "scratch", "disinfectant", "medicine", "pharma", "ortho", "anxiety"]
                if any(bk in p_id or bk in title.lower() or bk in cat for bk in disallowed_blacklist):
                    continue
                img = (p.get("image_url") or "").strip() or FALLBACK_IMAGES.get(p.get("id"))
                if title and img:
                    if p.get("price_inr"):
                        price_inr = int(round(float(p["price_inr"])))
                    else:
                        price_inr = int(round(float(p.get("price") or 29.99) * 85))
                    
                    if p.get("compare_at_price"):
                        compare_inr = int(round(float(p["compare_at_price"])))
                    else:
                        compare_inr = int(round(price_inr * 1.6))
                    valid.append({
                        "id": p["id"],
                        "title": title[:50],
                        "category": (p.get("category") or "General").title(),
                        "price_inr": price_inr,
                        "compare_at": compare_inr,
                        "rating": float(p.get("rating") or 4.8),
                        "reviews": int(p.get("reviews") or 520),
                        "image_url": img,
                        "hook": f"Discover the {title[:35]} — Trending now at RareEmber ✨",
                        "features": [
                            "Handpicked verified build quality",
                            "Express dispatch from regional fulfillment hub",
                            "30-day zero-risk return guarantee"
                        ]
                    })
            if valid:
                print(f"📦 Successfully fetched {len(valid)} live products from store database!")
                return valid
    except Exception as e:
        print(f"Notice: Supabase fetch ({e}), falling back to curated catalog.")
    return PRODUCTS_CATALOG

def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_history(history):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

def pick_next_product():
    catalog = fetch_live_catalog()
    history = load_history()
    posted_ids = set(item.get("id") for item in history if item.get("id"))
    recent_posted_categories = [item.get("category", "").lower() for item in history[-5:] if item.get("category")]
    
    unposted = [p for p in catalog if p["id"] not in posted_ids]
    if not unposted:
        print("🔄 All catalog products posted once! Looping back to begin next cycle with fresh shuffle.")
        unposted = list(catalog)
        posted_ids.clear()
        save_history([])
    
    # Prioritize products from a different category than recent posts to ensure variety
    fresh_category_candidates = [p for p in unposted if p.get("category", "").lower() not in recent_posted_categories]
    candidates = fresh_category_candidates if fresh_category_candidates else unposted
    
    # Shuffle with seed based on date to ensure stable rotation without repeating same item
    random.shuffle(candidates)
    return candidates[0]

def get_font(size, bold=False):
    local_font = os.path.join(BASE_DIR, "assets", "fonts", "arialbd.ttf" if bold else "arial.ttf")
    if os.path.exists(local_font):
        try:
            return ImageFont.truetype(local_font, size)
        except Exception:
            pass
    candidate_fonts = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/tahomabd.ttf" if bold else "C:/Windows/Fonts/tahoma.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidate_fonts:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

def get_current_festival():
    now = datetime.now()
    m = now.month
    d = now.day
    # Oct / Nov: Diwali & Navratri season in India
    if m in (10, 11):
        return {
            "name": "Diwali",
            "emoji": "🪔",
            "greeting": "🪔 Shubh Deepawali Grand Festive Sale!",
            "coupon": "DIWALI100",
            "discount_desc": "Flat ₹100 OFF on orders above ₹499",
            "banner": "DIWALI DROP • CODE: DIWALI100",
            "hashtags": "#diwalisale #diwalishopping #diwalideals #festiveindia #shubhdeepawali #rareember"
        }
    if m == 3:
        return {
            "name": "Holi",
            "emoji": "🎨",
            "greeting": "🎨 Happy Holi Festive Color Splash Sale!",
            "coupon": "HOLI100",
            "discount_desc": "Flat ₹100 OFF on orders above ₹499",
            "banner": "HOLI DROP • CODE: HOLI100",
            "hashtags": "#holisale #holishopping #festivalofcolors #holioffers #rareember"
        }
    if (m == 12 and d >= 20) or (m == 1 and d <= 15):
        return {
            "name": "New Year 2026",
            "emoji": "🎉",
            "greeting": "🎉 Happy New Year 2026 Celebration Drop!",
            "coupon": "NEWYEAR2026",
            "discount_desc": "Flat ₹100 OFF on orders above ₹499",
            "banner": "NEW YEAR DROP • CODE: NEWYEAR2026",
            "hashtags": "#newyearsale #newyear2026 #freshdrops #lifestyleindia #rareember"
        }
    return {
        "name": "Welcome Drop",
        "emoji": "⚡",
        "greeting": "⚡ RareEmber Exclusive Factory Direct Drop!",
        "coupon": "FIRST50",
        "discount_desc": "Flat ₹50 OFF on your first order",
        "banner": "OFFICIAL DROP • CODE: FIRST50",
        "hashtags": "#rareember #curatedstyle #trendingproducts #viralfinds #indiand2c #gadgetsindia"
    }

CREATIVE_THEMES = [
    {
        "id": "warm_gold",
        "bg_color": (255, 251, 245),
        "header_bg": (255, 255, 255),
        "card_bg": (255, 255, 255),
        "card_outline": (235, 228, 218),
        "text_main": (26, 20, 18),
        "text_sub": (140, 130, 120),
        "accent": (255, 77, 36),
        "badge_bg": (255, 240, 232),
        "badge_text": (255, 77, 36),
        "footer_bg": (29, 29, 31),
        "footer_text": (255, 255, 255)
    },
    {
        "id": "midnight_luxury",
        "bg_color": (18, 18, 22),
        "header_bg": (26, 26, 32),
        "card_bg": (30, 30, 36),
        "card_outline": (60, 58, 68),
        "text_main": (255, 255, 255),
        "text_sub": (170, 170, 185),
        "accent": (255, 125, 45),
        "badge_bg": (55, 30, 15),
        "badge_text": (255, 155, 75),
        "footer_bg": (255, 77, 36),
        "footer_text": (255, 255, 255)
    },
    {
        "id": "festive_crimson",
        "bg_color": (255, 248, 242),
        "header_bg": (255, 255, 255),
        "card_bg": (255, 255, 255),
        "card_outline": (245, 215, 195),
        "text_main": (35, 15, 10),
        "text_sub": (150, 100, 80),
        "accent": (217, 40, 40),
        "badge_bg": (255, 230, 220),
        "badge_text": (200, 30, 30),
        "footer_bg": (140, 25, 25),
        "footer_text": (255, 240, 220)
    }
]

HOOK_TEMPLATES = [
    "POV: You just discovered this aesthetic drop for your room ✨",
    "The festive gift everyone will ask you about this season 🪔",
    "Why pay retail markups when you can get direct warehouse quality? ⚡",
    "This small lifestyle upgrade is going viral across India right now 🔥"
]

def render_post_image(product):
    """
    Renders a stunning 1080x1350 (4:5) Instagram post creative with dynamic visual themes.
    """
    width = 1080
    height = 1350
    
    # Select creative theme dynamically per product
    theme = random.choice(CREATIVE_THEMES)
    fest = get_current_festival()
    
    # 1. Background Canvas
    base = Image.new("RGB", (width, height), color=theme["bg_color"])
    draw = ImageDraw.Draw(base)
    
    # Header Bar: RareEmber Branding Badge
    draw.rectangle([0, 0, width, 140], fill=theme["header_bg"])
    draw.line([(0, 140), (width, 140)], fill=theme["card_outline"], width=2)
    
    font_brand = get_font(42, bold=True)
    font_sub = get_font(22, bold=False)
    draw.text((60, 40), "rareember.", fill=theme["text_main"], font=font_brand)
    draw.ellipse([285, 60, 301, 76], fill=theme["accent"])
    draw.text((60, 92), f"{fest['name'].upper()} SPECIAL • OFFICIAL DROP", fill=theme["text_sub"], font=font_sub)
    
    # Festive Coupon Pill Tag (Top Right)
    font_tag = get_font(18, bold=True)
    draw.rounded_rectangle([width - 380, 48, width - 60, 96], radius=24, fill=theme["badge_bg"])
    draw.text((width - 365, 62), fest['banner'], fill=theme["badge_text"], font=font_tag)
    
    # 2. Main Product Image (Centered Card)
    img_url = product.get("image_url") or FALLBACK_IMAGES.get(product.get("id"), "")
    img_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }
    prod_img = None
    for candidate_url in [img_url, FALLBACK_IMAGES.get(product.get("id"))]:
        if not candidate_url:
            continue
        try:
            resp = requests.get(candidate_url, headers=img_headers, timeout=12)
            if resp.status_code == 200 and len(resp.content) > 1000:
                prod_img = Image.open(BytesIO(resp.content)).convert("RGB")
                break
        except Exception:
            continue
            
    if prod_img is None:
        print(f"Image fetch error for {img_url}, using styled placeholder")
        prod_img = Image.new("RGB", (800, 800), color=theme["card_bg"])
        
    # Crop to square 860x860 without squashing aspect ratio
    from PIL import ImageOps
    prod_img = ImageOps.fit(prod_img, (860, 860), method=Image.Resampling.LANCZOS)
    
    # Card Background with Border
    card_x = (width - 880) // 2
    card_y = 170
    draw.rounded_rectangle([card_x, card_y, card_x + 880, card_y + 880], radius=32, fill=theme["card_bg"], outline=theme["card_outline"], width=3)
    base.paste(prod_img, (card_x + 10, card_y + 10))
    
    # Subtle Verified Tag on Product Image (Top Left)
    compare_at = float(product.get("compare_at") or 0)
    price_inr = float(product.get("price_inr") or 0)
    discount_pct = int(round((1 - (price_inr / compare_at)) * 100)) if compare_at > price_inr else 0
    draw.rounded_rectangle([card_x + 24, card_y + 24, card_x + 210, card_y + 76], radius=24, fill=theme["header_bg"], outline=theme["card_outline"], width=2)
    font_disc = get_font(22, bold=True)
    draw.text((card_x + 40, card_y + 36), "VERIFIED DROP", fill=theme["text_main"], font=font_disc)
    
    # 3. Product Title Section (Full width, no right-side overlap)
    info_y = 1065
    font_title = get_font(38, bold=True)
    draw.text((60, info_y), product["title"][:46], fill=theme["text_main"], font=font_title)
    
    # 4. Dedicated Pricing Row (Clean, spacious, placed directly below title)
    price_y = info_y + 54
    font_price = get_font(52, bold=True)
    font_mrp = get_font(26, bold=False)
    font_save = get_font(22, bold=True)
    
    price_str = f"Rs. {int(price_inr):,}"
    draw.text((60, price_y), price_str, fill=theme["accent"], font=font_price)
    
    price_bbox = draw.textbbox((60, price_y), price_str, font=font_price)
    mrp_x = price_bbox[2] + 20
    mrp_str = f"M.R.P. Rs. {int(compare_at):,}" if compare_at > 0 else ""
    if mrp_str:
        draw.text((mrp_x, price_y + 16), mrp_str, fill=theme["text_sub"], font=font_mrp)
        
        # Dynamic strikethrough line exactly across M.R.P. text
        mrp_bbox = draw.textbbox((mrp_x, price_y + 16), mrp_str, font=font_mrp)
        mrp_mid_y = (mrp_bbox[1] + mrp_bbox[3]) // 2
        draw.line([(mrp_bbox[0], mrp_mid_y), (mrp_bbox[2], mrp_mid_y)], fill=theme["text_sub"], width=2)
        
        # Save % badge pill right beside MRP
        if discount_pct > 0:
            save_x = mrp_bbox[2] + 18
            save_text = f"SAVE {discount_pct}%"
            save_bbox = draw.textbbox((save_x + 12, price_y + 14), save_text, font=font_save)
            draw.rounded_rectangle([save_x, price_y + 12, save_bbox[2] + 12, price_y + 46], radius=16, fill=theme["badge_bg"])
            draw.text((save_x + 12, price_y + 15), save_text, fill=theme["badge_text"], font=font_save)
    
    # 5. Rating & Social Proof (Below Price Row)
    rating_y = price_y + 68
    font_rating = get_font(22, bold=True)
    draw.text((60, rating_y), f"Rating: {product.get('rating', '4.8')} / 5.0  ({product.get('reviews', '500+')} Verified Reviews)  •  Indian Fulfillment Hub", fill=(217, 119, 6), font=font_rating)
    
    # 6. Trust Guarantee Strip
    draw.line([(60, rating_y + 36), (width - 60, rating_y + 36)], fill=theme["card_outline"], width=1)
    font_trust = get_font(20, bold=True)
    trust_text = "PAN-INDIA EXPRESS COURIER   •   CASH ON DELIVERY   •   7-DAY EASY REPLACEMENT"
    draw.text((60, rating_y + 48), trust_text, fill=theme["text_sub"], font=font_trust)
    
    # 5. Bottom Call-To-Action Banner
    draw.rectangle([0, height - 75, width, height], fill=theme["footer_bg"])
    font_cta = get_font(24, bold=True)
    cta_text = "Tap Link in Bio to Order  |  rareember-store.vercel.app"
    cta_bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
    cta_w = cta_bbox[2] - cta_bbox[0]
    draw.text(((width - cta_w) // 2, height - 52), cta_text, fill=theme["footer_text"], font=font_cta)
    
    # Save Image
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_filename = f"post_{product['id']}_{timestamp}.jpg"
    out_path = os.path.join(OUTPUT_DIR, out_filename)
    base.save(out_path, quality=95)
    print(f"✅ Rendered creative ({theme['id']}) post image: {out_path}")
    return out_path

def resolve_campaign_type(requested_type="auto"):
    if requested_type and requested_type != "auto":
        return requested_type
    ist_hour = (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).hour
    if 9 <= ist_hour < 12:
        return "catalog"          # 10:00 AM IST (Auto Post 1)
    elif 12 <= ist_hour < 16:
        return "problem_solver"   # 1:30 PM IST (Hermes Campaign 1)
    elif 16 <= ist_hour < 19:
        return "festive_deal"     # 5:30 PM IST (Hermes Campaign 2)
    elif 19 <= ist_hour < 21:
        return "catalog"          # 8:00 PM IST (Auto Post 2)
    else:
        return "trust_builder"    # 10:00 PM IST (Hermes Campaign 3)

def generate_caption(product, campaign_type="auto"):
    c_type = resolve_campaign_type(campaign_type)
    fest = get_current_festival()
    discount_pct = int(round((1 - (product["price_inr"] / product["compare_at"])) * 100))
    saving_inr = product["compare_at"] - product["price_inr"]
    bullets = "\n".join([f"✨ {feat}" for feat in product["features"]])
    
    if c_type == "problem_solver":
        headline = "⚡ PROBLEM SOLVER DROP • Built for Modern Living"
        hook = f"Tired of low quality and overpriced markups? Meet the {product['title']} — curated to upgrade your everyday routine without breaking the bank."
        badge = "🔥 Trending Life Upgrade • Verified Functional Winner"
    elif c_type == "festive_deal":
        headline = fest['greeting']
        hook = f"Auspicious festive deals for your home and family! Upgrade your living space or gift someone special with the {product['title']}."
        badge = f"🎉 FESTIVE SALE • Use code {fest['coupon']} for {fest['discount_desc']}"
    elif c_type == "trust_builder":
        headline = "⭐ 4.9★ Customer Favorite • Verified Authentic Drop"
        hook = f"See why hundreds of Indian shoppers rate this 5 stars. The {product['title']} combines premium build with unbeatable factory-direct value."
        badge = "🛡️ 100% Doorstep Reassurance • Cash on Delivery (COD) Pan-India"
    else:  # catalog
        headline = fest['greeting']
        hook = random.choice(HOOK_TEMPLATES)
        badge = f"✨ Factory Direct Drop • Only ₹{product['price_inr']:,} ({discount_pct}% OFF)"
    
    story_highlight = f"""⭐ Why shoppers across India love RareEmber:
"Ordered with Cash on Delivery and delivered in 3 days! Exceptional build quality and fraction of mall showroom pricing."
✨ Verified 4.9★ Quality • 30-Day Zero-Risk Return & Replacement Guarantee"""

    caption = f"""{headline}

{hook}

{story_highlight}

Meet the {product['title']} — in stock now at RareEmber.

{badge}

{bullets}

🏷️ M.R.P.: ₹{product['compare_at']:,}
⚡ Factory Direct Price: ₹{product['price_inr']:,} ONLY ({discount_pct}% OFF)
🎉 FESTIVE COUPON: Use code {fest['coupon']} for {fest['discount_desc']}!
💰 You Save: ₹{saving_inr:,} + Extra Coupon Savings & Free Shipping across India!
★ {product['rating']}/5.0 verified authentic quality.

🚚 Pan-India Express Delivery (2–4 Days via BlueDart & Delhivery)
💵 Cash on Delivery (COD) Available
🛡️ 30-Day Zero-Risk Return & Replacement Guarantee

🛒 DIRECT PRODUCT LINK (Tap or Copy):
👉 https://rareember-store.vercel.app/product/{product['id']}

📱 INSTANT CHECKOUT: Tap the link in our bio (@rareember) for 1-Click COD!
💬 INSTANT DM: Comment "LINK" or "BUY" below and we'll immediately DM you the direct checkout link + VIP discount!

{fest['hashtags']} #curatedstyle #trendingproducts #viralfinds #indiand2c #gadgetsindia #homeaesthetic #desksetup #expressdelivery #cashondelivery #shopindia"""
    return caption, c_type

def send_telegram_alert(media_path, caption_summary):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    is_video = media_path.lower().endswith(".mp4")
    endpoint = "sendVideo" if is_video else "sendPhoto"
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/{endpoint}"
    file_key = "video" if is_video else "photo"
    try:
        with open(media_path, "rb") as f:
            data = {
                "chat_id": TELEGRAM_CHAT_ID,
                "caption": f"🚀 *RareEmber Instagram Autopilot*\n\n{caption_summary}",
                "parse_mode": "Markdown"
            }
            resp = requests.post(url, data=data, files={file_key: f}, timeout=30)
            if resp.status_code == 200:
                print("📲 Telegram alert delivered to Ajay successfully.")
    except Exception as e:
        print(f"Telegram alert error: {e}")

def send_telegram_caption_box(caption):
    """Sends full Instagram caption in 1-tap copyable HTML <code> format to Telegram."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    import html
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        data = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": (
                "📋 <b>INSTAGRAM CAPTION (Tap below to copy instantly):</b>\n\n"
                f"<code>{html.escape(caption)}</code>\n\n"
                "💡 <i>Tip: Upar diye gaye text par 1-tap karke copy karein aur Instagram app me direct paste karein.</i>"
            ),
            "parse_mode": "HTML"
        }
        resp = requests.post(url, data=data, timeout=20)
        if resp.status_code == 200:
            print("📋 Copyable caption box delivered to Telegram chat.")
    except Exception as e:
        print(f"Telegram caption box delivery error: {e}")

def diagnose_instagram():
    """Cloud-safe preflight: reports WHY a post would fail (no secrets printed)."""
    issues = []
    try:
        import instagrapi  # noqa: F401
    except Exception as e:
        issues.append(f"instagrapi package missing ({e})")
    if not (IG_SESSIONID or (os.path.exists(SESSION_FILE)) or (IG_USERNAME and IG_PASSWORD)):
        issues.append("no auth: set IG_SESSIONID secret (preferred) or IG_USERNAME+IG_PASSWORD")
    elif not IG_SESSIONID and not os.path.exists(SESSION_FILE) and (IG_USERNAME and IG_PASSWORD):
        issues.append("password login only: Meta often blocks with challenge/2FA, prefer IG_SESSIONID")
    if os.path.exists(SESSION_FILE):
        try:
            age_h = (time.time() - os.path.getmtime(SESSION_FILE)) / 3600
            if age_h > 24 * 14:
                issues.append(f"session.json stale ({age_h/24:.0f} days old), refresh IG_SESSIONID")
        except Exception:
            pass
    return issues

def post_to_instagram(media_path, caption, product=None):
    """Logs into Instagram and publishes the feed photo.
    Primary: Playwright browser persistent session (dots_gateway/browser_data).
    Secondary fallback: instagrapi client if session/credentials exist."""
    # 1. Primary: Playwright authenticated browser session
    try:
        from browser_photo_post import post_feed_photo
        print("🌐 Dispatching feed photo via Playwright persistent browser session...")
        b_res = post_feed_photo(media_path, caption)
        if b_res.get("ok"):
            print("🎉 SUCCESS! Published feed post to @RareEmber on Instagram via Playwright session!")
            return {"ok": True, "stage": "done", "reason": ""}
        else:
            print(f"⚠️ Playwright posting note: {b_res.get('reason')}. Trying instagrapi fallback...")
    except Exception as be:
        print(f"⚠️ Playwright session notice: {be}. Trying instagrapi fallback...")

    # 2. Secondary Fallback: instagrapi
    try:
        from instagrapi import Client
        cl = Client()
        cl.delay_range = [2, 5]
        # Bypass deprecated Meta internal experiments endpoint that returns 404
        cl.expose = lambda *args, **kwargs: True
        
        session_loaded = False
        
        # 1. Prefer explicit fresh sessionid
        if IG_SESSIONID:
            print("🔑 Authenticating via Instagram sessionid cookie...")
            try:
                cl.login_by_sessionid(IG_SESSIONID)
                session_loaded = True
            except Exception as se:
                print(f"⚠️ login_by_sessionid error: {se}")
                
        # 2. Fall back to saved session.json settings
        if not session_loaded and os.path.exists(SESSION_FILE):
            print("🔑 Loading saved Instagram session from session.json...")
            try:
                cl.load_settings(SESSION_FILE)
                session_loaded = True
            except Exception as se:
                print(f"⚠️ session.json load error: {se}")
                
        # 3. Last fallback: credentials login
        if not session_loaded and IG_USERNAME and IG_PASSWORD:
            print(f"🔐 Logging in as @{IG_USERNAME}...")
            cl.login(IG_USERNAME, IG_PASSWORD)
            session_loaded = True
            
        if not session_loaded:
            print("\n⚠️ No valid Instagram credentials or session available!")
            return {"ok": False, "stage": "auth",
                    "reason": "no valid session (IG_SESSIONID/session.json/password all failed or missing). " +
                              " | ".join(diagnose_instagram())}

        try:
            cl.dump_settings(SESSION_FILE)
        except Exception:
            pass
        print("✅ Login authenticated successfully!")
        
        print("📤 Uploading photo to Instagram feed (@rareember)...")
        media = cl.photo_upload(media_path, caption=caption)
        print(f"🎉 SUCCESS! Published Post to Instagram! Media ID: {media.pk}")

        # Auto-post 1st Comment with direct link & instant discount
        if product:
            try:
                time.sleep(2)
                fest = get_current_festival()
                comment_text = (
                    f"⚡ DIRECT ORDER LINK (Cash on Delivery available):\n"
                    f"🔗 https://rareember-store.vercel.app/product/{product.get('id', '')}\n\n"
                    f"🎉 Use coupon code {fest['coupon']} for {fest['discount_desc']}!\n"
                    f"📦 Express 2-4 day delivery across 19,000+ PIN codes in India."
                )
                cl.media_comment(media.id, comment_text)
                print("💬 Published first comment with direct product link and coupon!")
            except Exception as ce:
                print(f"⚠️ First comment notice: {ce}")

        return {"ok": True, "stage": "done", "reason": ""}
    except Exception as e:
        print(f"❌ Instagram upload error: {e}")
        stage = "upload"
        msg = str(e)
        if "login" in msg.lower() or "challenge" in msg.lower() or "checkpoint" in msg.lower():
            stage = "auth"
        return {"ok": False, "stage": stage, "reason": msg[:300]}

def run_autopilot_cycle(dry_run=False, campaign_type="auto", format_type="post"):
    print("=" * 60)
    print(f"🚀 RAREEMBER INSTAGRAM AUTOPILOT CYCLE | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    product = pick_next_product()
    print(f"📦 Selected Product: {product['title']} (ID: {product['id']})")
    
    # 1. Resolve campaign angle
    c_type = resolve_campaign_type(campaign_type)
    print(f"🎯 Active Campaign Angle: {c_type.upper()}")

    # 2. Render Media (100% High-Converting Feed Image Creatives - No Reels)
    print("🖼️ Rendering Vertical 4:5 Instagram Feed Image Creative...")
    media_path = render_post_image(product)
    
    # 3. Generate Caption
    caption, _ = generate_caption(product, campaign_type=c_type)
    
    # 4. Post or Dry Run - returns dict {ok, reason, media_path, product...}
    base_result = {"media_path": media_path, "campaign_type": c_type,
                   "product": {"id": product["id"], "title": product["title"]}}
    if dry_run:
        print("\n[DRY RUN MODE ACTIVE]")
        print("📝 Generated Caption:\n" + "-" * 40)
        print(caption)
        print("-" * 40)
        print(f"🖼️ Media Asset Saved at: {media_path}")
        send_telegram_alert(media_path, f"📸 *Dry-Run Feed Image Ready ({c_type.upper()})*\n\n*Product:* {product['title']}\n*Price:* ₹{product['price_inr']:,}\n*Status:* Media generated and ready for broadcast.")
        send_telegram_caption_box(caption)
        return {**base_result, "ok": True, "reason": ""}
    else:
        res = post_to_instagram(media_path, caption, product=product)
        ok = bool(res.get("ok")) if isinstance(res, dict) else bool(res)
        reason = (res.get("reason", "") if isinstance(res, dict) else "")
        if ok:
            history = load_history()
            history.append({
                "id": product["id"],
                "title": product["title"],
                "campaign_type": c_type,
                "format": "post",
                "posted_at": datetime.now(timezone.utc).isoformat(),
                "media_path": media_path
            })
            save_history(history)
            send_telegram_alert(media_path, f"✅ *Auto-Posted Feed Image to Instagram ({c_type.upper()})*\n\n*Product:* {product['title']}\n*Price:* ₹{product['price_inr']:,}\n*Status:* Live on @rareember with direct product link & bio link.")
            send_telegram_caption_box(caption)
            return {**base_result, "ok": True, "reason": ""}
        if not reason:
            reason = "upload failed. " + " | ".join(diagnose_instagram())
        
        send_telegram_alert(
            media_path,
            f"⚠️ *Instagram Direct Upload Blocked by Meta*\n\n"
            f"*Product:* {product['title']}\n"
            f"*Price:* ₹{product['price_inr']:,}\n"
            f"*Status:* HD Post delivered to your chat above 👆\n"
            f"*Reason:* `{reason[:120]}`\n\n"
            f"📱 *Action:* Meta cloud IP rate-limit block lagata hai. Aap is delivered media ko phone me save karke 1 tap me @RareEmber feed par post kar sakte hain!"
        )
        send_telegram_caption_box(caption)
        return {**base_result, "ok": False,
                "stage": (res.get("stage", "upload") if isinstance(res, dict) else "upload"),
                "reason": reason}

def main():
    parser = argparse.ArgumentParser(description="RareEmber Instagram Autopilot")
    parser.add_argument("--dry-run", action="store_true", help="Generate post and send preview to Telegram without uploading to IG")
    parser.add_argument("--campaign-type", choices=["auto", "catalog", "problem_solver", "festive_deal", "trust_builder"], default="auto", help="Campaign angle for post")
    parser.add_argument("--format", choices=["auto", "post"], default="post", help="Content format (100% feed image post)")
    parser.add_argument("--daemon", action="store_true", help="Run continuously in background, auto-posting at set intervals")
    parser.add_argument("--interval-hours", type=float, default=12.0, help="Posting interval in hours for daemon mode (default: 12)")
    args = parser.parse_args()
    
    if args.daemon:
        print(f"🔄 Daemon Mode Started: Posting every {args.interval_hours} hours...")
        while True:
            try:
                run_autopilot_cycle(dry_run=args.dry_run, campaign_type=args.campaign_type, format_type=args.format)
            except Exception as e:
                print(f"Cycle execution error: {e}")
            sleep_secs = int(args.interval_hours * 3600)
            print(f"⏳ Sleeping for {args.interval_hours} hours until next post...")
            time.sleep(sleep_secs)
    else:
        run_autopilot_cycle(dry_run=args.dry_run, campaign_type=args.campaign_type, format_type=args.format)

if __name__ == "__main__":
    main()
