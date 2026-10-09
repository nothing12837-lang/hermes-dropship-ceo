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
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8898923626:AAEZTnurYzL70qpg42BgKKmLUBpW4g422aY").strip()
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "5238068527").strip()
STORE_URL = "https://rareember-store.vercel.app"

# Curated High-Converting Catalog for RareEmber
PRODUCTS_CATALOG = [
    {
        "id": "hc-modern-brass-desk-lamp-15",
        "title": "Modern Brass Touch Desk Lamp",
        "category": "Home & Aesthetics",
        "price_inr": 3570,
        "compare_at": 5525,
        "rating": 4.8,
        "reviews": 795,
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1080",
        "hook": "Turn your desk from boring to luxury hotel vibes in one touch ✨",
        "features": [
            "Smooth touch-dimming sensor",
            "Weighted solid brass aesthetic base",
            "Zero flicker warm eye-comfort light"
        ]
    },
    {
        "id": "hc-logitech-mx-master-3s-wireless-mouse-3",
        "title": "Logitech MX Master 3S Wireless",
        "category": "Tech & Productivity",
        "price_inr": 8499,
        "compare_at": 10199,
        "rating": 4.9,
        "reviews": 1250,
        "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=1080",
        "hook": "Scroll 1,000 spreadsheet lines in 1 second. Complete silence.",
        "features": [
            "MagSpeed electromagnetic scroll wheel",
            "Whisper-quiet tactile switches",
            "8,000 DPI track-anywhere optical sensor"
        ]
    },
    {
        "id": "hc-ambient-rgb-monitor-light-bar-9",
        "title": "ScreenBar RGB Smart Monitor Light",
        "category": "Tech & Productivity",
        "price_inr": 3299,
        "compare_at": 5499,
        "rating": 4.9,
        "reviews": 1420,
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=1080",
        "hook": "Zero screen glare, zero eye strain, 100% aesthetic workspace glow ✨",
        "features": [
            "Asymmetric optical design prevents screen reflection",
            "Wireless desktop controller with dual-axis touch",
            "Customizable ambient back-glow RGB mood lighting"
        ]
    },
    {
        "id": "elec-3",
        "title": "4K Ultra HD Pocket Action Camera",
        "category": "Gadgets & Travel",
        "price_inr": 4890,
        "compare_at": 7990,
        "rating": 4.8,
        "reviews": 840,
        "image_url": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=1080",
        "hook": "Cinematic 4K travel & motovlog recordings without GoPro prices ⚡",
        "features": [
            "Crystal clear 4K 60FPS video recording",
            "Electronic Image Stabilization (EIS)",
            "Waterproof case included up to 30m"
        ]
    },
    {
        "id": "hc-ceramic-minimalist-planter-set-12",
        "title": "Minimalist Ceramic Planter Set",
        "category": "Home & Living",
        "price_inr": 2890,
        "compare_at": 4675,
        "rating": 4.8,
        "reviews": 660,
        "image_url": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1080",
        "hook": "The easiest way to make your living room look fresh and peaceful 🪴",
        "features": [
            "Handcrafted matte textured ceramic",
            "Drainage hole with matching saucer tray",
            "Perfect for succulents, monsteras & herbs"
        ]
    },
    {
        "id": "hc-classic-aviator-sunglasses-6",
        "title": "Polarized Classic Aviator Sunglasses",
        "category": "Curated Fashion",
        "price_inr": 3825,
        "compare_at": 7225,
        "rating": 4.8,
        "reviews": 390,
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1080",
        "hook": "Timeless military styling with 100% UV400 polarized clarity 🕶️",
        "features": [
            "Premium lightweight alloy frame",
            "Anti-glare high definition polarized lenses",
            "Includes luxury leather protective case"
        ]
    }
]

FALLBACK_IMAGES = {
    'hc-modern-brass-desk-lamp-15': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1080',
    'hc-logitech-mx-master-3s-wireless-mouse-3': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=1080',
    'hc-ambient-rgb-monitor-light-bar-9': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=1080',
    'elec-3': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=1080',
    'hc-ceramic-minimalist-planter-set-12': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1080',
    'hc-classic-aviator-sunglasses-6': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1080',
}

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://qdkkxpfhwrwyoardlceo.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka2t4cGZod3J3eW9hcmRsY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Njc2OTcsImV4cCI6MjEwNjQ0MzY5N30.qFvuYQ1G9NvYGYXWVtR6b9dPScOuUIfeVQ8yX3y1DJo")

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
    posted_ids = [item.get("id") for item in history]
    unposted = [p for p in catalog if p["id"] not in posted_ids]
    if not unposted:
        print("🔄 All catalog products posted once! Looping back to begin next cycle.")
        unposted = catalog
    return unposted[0]

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
    img_url = product["image_url"]
    try:
        resp = requests.get(img_url, timeout=10)
        prod_img = Image.open(BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        print(f"Image fetch error: {e}, using color placeholder")
        prod_img = Image.new("RGB", (800, 800), color=(245, 240, 230))
        
    # Crop to square 860x860
    prod_img = prod_img.resize((860, 860), Image.Resampling.LANCZOS)
    
    # Card Background with Border
    card_x = (width - 880) // 2
    card_y = 170
    draw.rounded_rectangle([card_x, card_y, card_x + 880, card_y + 880], radius=32, fill=theme["card_bg"], outline=theme["card_outline"], width=3)
    base.paste(prod_img, (card_x + 10, card_y + 10))
    
    # Subtle Verified Tag on Product Image (Top Left)
    discount_pct = int(round((1 - (product["price_inr"] / product["compare_at"])) * 100))
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
    
    price_str = f"Rs. {product['price_inr']:,}"
    draw.text((60, price_y), price_str, fill=theme["accent"], font=font_price)
    
    price_bbox = draw.textbbox((60, price_y), price_str, font=font_price)
    mrp_x = price_bbox[2] + 20
    mrp_str = f"M.R.P. Rs. {product['compare_at']:,}"
    draw.text((mrp_x, price_y + 16), mrp_str, fill=theme["text_sub"], font=font_mrp)
    
    # Dynamic strikethrough line exactly across M.R.P. text
    mrp_bbox = draw.textbbox((mrp_x, price_y + 16), mrp_str, font=font_mrp)
    mrp_mid_y = (mrp_bbox[1] + mrp_bbox[3]) // 2
    draw.line([(mrp_bbox[0], mrp_mid_y), (mrp_bbox[2], mrp_mid_y)], fill=theme["text_sub"], width=2)
    
    # Save % badge pill right beside MRP
    save_x = mrp_bbox[2] + 18
    save_text = f"SAVE {discount_pct}%"
    save_bbox = draw.textbbox((save_x + 12, price_y + 14), save_text, font=font_save)
    draw.rounded_rectangle([save_x, price_y + 12, save_bbox[2] + 12, price_y + 46], radius=16, fill=theme["badge_bg"])
    draw.text((save_x + 12, price_y + 15), save_text, fill=theme["badge_text"], font=font_save)
    
    # 5. Rating & Social Proof (Below Price Row)
    rating_y = price_y + 68
    font_rating = get_font(22, bold=True)
    draw.text((60, rating_y), f"Rating: {product['rating']} / 5.0  ({product['reviews']} Verified Reviews)  •  Gujarat Fulfillment Hub", fill=(217, 119, 6), font=font_rating)
    
    # 6. Trust Guarantee Strip
    draw.line([(60, rating_y + 36), (width - 60, rating_y + 36)], fill=theme["card_outline"], width=1)
    font_trust = get_font(20, bold=True)
    trust_text = "PAN-INDIA EXPRESS COURIER   •   CASH ON DELIVERY   •   30-DAY ZERO-RISK RETURNS"
    draw.text((60, rating_y + 48), trust_text, fill=theme["text_sub"], font=font_trust)
    
    # 5. Bottom Call-To-Action Banner
    draw.rectangle([0, height - 75, width, height], fill=theme["footer_bg"])
    font_cta = get_font(24, bold=True)
    cta_text = "Tap Link in Bio to Order  |  rareember-store.vercel.app"
    draw.text((width // 2 - 270, height - 52), cta_text, fill=theme["footer_text"], font=font_cta)
    
    # Save Image
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_filename = f"post_{product['id']}_{timestamp}.jpg"
    out_path = os.path.join(OUTPUT_DIR, out_filename)
    base.save(out_path, quality=95)
    print(f"✅ Rendered creative ({theme['id']}) post image: {out_path}")
    return out_path

DIALOGUE_BANTER_SCRIPTS = [
    {
        "id": "mall_vs_factory",
        "theme": "🍋 Gappu vs Pappu • Mall Price Debate",
        "lines": [
            {
                "speaker": "Gappu",
                "avatar": "shocked",
                "hindi": "अरे भाई! मैंने मॉल से ₹{compare_at} में ये लिया, मस्त है ना?",
                "sub": "Bro! I bought this from mall showroom for Rs. {compare_at}!",
                "scene": "character_gappu"
            },
            {
                "speaker": "Pappu",
                "avatar": "smirk",
                "hindi": "अरे भाई तू तो लुट गया! RareEmber पे यही डायरेक्ट फैक्ट्री से सिर्फ ₹{price_inr} में मिल रहा है!",
                "sub": "Bro you got robbed! Same item on RareEmber is only Rs. {price_inr}!",
                "scene": "character_pappu"
            },
            {
                "speaker": "Gappu",
                "avatar": "confused",
                "hindi": "क्या बात कर रहा है?! सच में? पर क्वालिटी कैसी है भाई?",
                "sub": "Really?! But how is the build quality?",
                "scene": "character_gappu"
            },
            {
                "speaker": "Pappu",
                "avatar": "verified",
                "hindi": "अरे 4.9 स्टार रेटिंग है, 30 दिन की रिप्लेसमेंट गारंटी और कैश ऑन डिलीवरी भी!",
                "sub": "4.9 star rating, 30-day guarantee and Cash on Delivery too!",
                "scene": "product_showcase"
            },
            {
                "speaker": "Both",
                "avatar": "celebrate",
                "hindi": "तो देर मत करो, अभी कमेंट करो BUY या बायो में लिंक पे क्लिक करो!",
                "sub": "Comment 'BUY' right now or tap the link in bio!",
                "scene": "viral_cta"
            }
        ]
    },
    {
        "id": "clutter_headache",
        "theme": "⚡ Chintu vs Mintu • Setup Life Hack",
        "lines": [
            {
                "speaker": "Chintu",
                "avatar": "shocked",
                "hindi": "यार दिनभर काम करके सिरदर्द और मेज पर सारा कचरा फैल गया है!",
                "sub": "Bro, desk clutter and eye strain is driving me crazy!",
                "scene": "character_gappu"
            },
            {
                "speaker": "Mintu",
                "avatar": "smirk",
                "hindi": "अरे तो RareEmber से ये स्मार्ट अपग्रेड क्यों नहीं मंगाया? एक झटके में पूरा सेटअप बदल देगा!",
                "sub": "Why didn't you get this RareEmber smart drop? Instant life upgrade!",
                "scene": "character_pappu"
            },
            {
                "speaker": "Chintu",
                "avatar": "confused",
                "hindi": "अरे बहुत महंगा होगा भाई, मेरा तो टाइट बजट है!",
                "sub": "Must be super expensive bro, I am on a budget!",
                "scene": "character_gappu"
            },
            {
                "speaker": "Mintu",
                "avatar": "verified",
                "hindi": "अरे सिर्फ ₹{price_inr} का है! M.R.P. ₹{compare_at} था, सीधा ₹{saving_inr} की बचत!",
                "sub": "Only Rs. {price_inr}! You save Rs. {saving_inr} today!",
                "scene": "product_showcase"
            },
            {
                "speaker": "Both",
                "avatar": "celebrate",
                "hindi": "कमेंट करो LINK तुरंत डिस्काउंट कूपन के साथ 1-क्लिक COD पर!",
                "sub": "Comment 'LINK' for instant 1-Click Cash on Delivery link!",
                "scene": "viral_cta"
            }
        ]
    }
]

def generate_aesthetic_lofi_audio(out_wav_path, duration_sec=14.0):
    """Generates an upbeat lo-fi chillhop background track in pure Python."""
    import wave, math, struct
    sample_rate = 44100
    n_samples = int(sample_rate * duration_sec)
    progression = [
        [261.63, 329.63, 392.00, 493.88],  # Cmaj7
        [220.00, 261.63, 329.63, 392.00],  # Am7
        [174.61, 220.00, 261.63, 329.63],  # Fmaj7
        [196.00, 246.94, 293.66, 349.23],  # G7
    ]
    chord_len = duration_sec / len(progression)
    with wave.open(out_wav_path, "w") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        frames = bytearray()
        for i in range(n_samples):
            t = i / sample_rate
            chord_idx = min(int(t / chord_len), len(progression) - 1)
            notes = progression[chord_idx]
            t_chord = t - (chord_idx * chord_len)
            env = min(1.0, t_chord * 4.0) * math.exp(-t_chord * 0.6)
            sample_val = 0.0
            for freq in notes:
                sample_val += 0.20 * math.sin(2.0 * math.pi * freq * t)
            sample_val += 0.25 * math.sin(2.0 * math.pi * (notes[0] / 2.0) * t) * env
            beat_phase = (t % 0.5)
            if beat_phase < 0.03:
                noise = ((math.sin(t * 12345.67) + 1.0) / 2.0 - 0.5) * 0.08 * math.exp(-beat_phase * 150)
                sample_val += noise
            sample_val = max(-1.0, min(1.0, sample_val * env * 0.70))
            int_val = int(sample_val * 32767.0)
            frames.extend(struct.pack("<hh", int_val, int_val))
        wav_file.writeframes(frames)
    return out_wav_path

def get_audio_duration(file_path):
    """Returns audio file duration in seconds via ffprobe."""
    import subprocess
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return float(res.stdout.strip())
    except Exception:
        return 3.5

def draw_3d_cartoon_avatar(draw, center_x, center_y, radius, mood="shocked", name="Gappu"):
    """Draws an expressive 3D style cartoon character avatar."""
    cx, cy, r = center_x, center_y, radius
    # Glowing outer border
    border_color = (239, 68, 68) if mood == "shocked" else ((52, 211, 153) if mood == "smirk" else (245, 158, 11))
    draw.ellipse([cx - r - 8, cy - r - 8, cx + r + 8, cy + r + 8], fill=border_color)
    
    # Character Face Base
    face_color = (254, 215, 170) if name in ["Gappu", "Chintu"] else (253, 186, 116)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=face_color)
    
    # Hair
    draw.chord([cx - r, cy - r - 10, cx + r, cy - r // 2], start=180, end=360, fill=(40, 25, 20))
    
    # Eyes & Expressions
    if mood == "shocked":
        # Wide popped eyes
        draw.ellipse([cx - 55, cy - 35, cx - 15, cy + 5], fill=(255, 255, 255), outline=(0, 0, 0), width=3)
        draw.ellipse([cx + 15, cy - 35, cx + 55, cy + 5], fill=(255, 255, 255), outline=(0, 0, 0), width=3)
        draw.ellipse([cx - 38, cy - 20, cx - 28, cy - 10], fill=(0, 0, 0))
        draw.ellipse([cx + 28, cy - 20, cx + 38, cy - 10], fill=(0, 0, 0))
        # Open mouth (screaming / shock)
        draw.ellipse([cx - 30, cy + 25, cx + 30, cy + 75], fill=(185, 28, 28), outline=(0, 0, 0), width=3)
    elif mood == "smirk":
        # Cool shades / sunglasses
        draw.rounded_rectangle([cx - 65, cy - 35, cx - 10, cy + 10], radius=12, fill=(15, 23, 42))
        draw.rounded_rectangle([cx + 10, cy - 35, cx + 65, cy + 10], radius=12, fill=(15, 23, 42))
        draw.line([(cx - 10, cy - 12), (cx + 10, cy - 12)], fill=(15, 23, 42), width=6)
        # Confident smirk
        draw.arc([cx - 30, cy + 25, cx + 35, cy + 65], start=0, end=180, fill=(15, 23, 42), width=5)
    else:  # celebrate / happy
        # Big smiling eyes
        draw.arc([cx - 55, cy - 35, cx - 15, cy - 5], start=180, end=360, fill=(0, 0, 0), width=5)
        draw.arc([cx + 15, cy - 35, cx + 55, cy - 5], start=180, end=360, fill=(0, 0, 0), width=5)
        # Big open smile
        draw.chord([cx - 35, cy + 20, cx + 35, cy + 70], start=0, end=180, fill=(225, 29, 72), outline=(0, 0, 0), width=3)

def render_reel_video(product):
    """
    Renders a viral 3D Cartoon Hindi Dialogue Instagram Reel video (.mp4)
    modeled directly after the high-engagement @amitverse_ai Hindi cartoon format.
    Features:
    - Real spoken Hindi dialogue voices (via Google TTS + pitch shifting)
    - 2 animated comedic personas (Gappu & Pappu) debating mall price vs RareEmber
    - Dynamic speech bubbles with Hindi & English subtitles
    - Studio 3D product showcase with verified 4.9 rating
    - Clear viral 1-Click COD comment call to action
    """
    import subprocess
    import tempfile
    from gtts import gTTS
    
    width = 1080
    height = 1920
    fest = get_current_festival()
    discount_pct = int(round((1 - (product["price_inr"] / product["compare_at"])) * 100))
    saving_inr = product["compare_at"] - product["price_inr"]
    
    # Pick banter script
    script_idx = abs(hash(product.get("id", "script"))) % len(DIALOGUE_BANTER_SCRIPTS)
    script = DIALOGUE_BANTER_SCRIPTS[script_idx]
    print(f"🎬 Active Reel Banter: {script['theme']}")
    
    # Fetch Product Image
    img_url = product["image_url"]
    try:
        resp = requests.get(img_url, timeout=10)
        prod_img = Image.open(BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        print(f"Notice: Product image fetch ({e}), using studio default.")
        prod_img = Image.new("RGB", (900, 900), color=(240, 240, 240))
        
    prod_square = prod_img.resize((820, 820), Image.Resampling.LANCZOS)
    
    # Fonts
    font_brand = get_font(46, bold=True)
    font_sub = get_font(26, bold=False)
    font_badge = get_font(30, bold=True)
    font_dialogue_hi = get_font(36, bold=True)
    font_dialogue_en = get_font(24, bold=False)
    font_price = get_font(60, bold=True)
    font_btn = get_font(38, bold=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        scene_video_clips = []
        dialogue_audio_clips = []
        
        # 1. GENERATE AUDIO & VISUALS FOR EACH DIALOGUE LINE
        for idx, line in enumerate(script["lines"]):
            speaker = line["speaker"]
            hi_text = line["hindi"].format(
                compare_at=f"{product['compare_at']:,}",
                price_inr=f"{product['price_inr']:,}",
                saving_inr=f"{saving_inr:,}"
            )
            en_sub = line["sub"].format(
                compare_at=f"{product['compare_at']:,}",
                price_inr=f"{product['price_inr']:,}",
                saving_inr=f"{saving_inr:,}"
            )
            
            # --- SYNTHESIZE HINDI SPEECH ---
            raw_audio = os.path.join(tmpdir, f"raw_{idx}.mp3")
            pitched_audio = os.path.join(tmpdir, f"dialogue_{idx}.mp3")
            tts = gTTS(hi_text, lang="hi")
            tts.save(raw_audio)
            
            # Distinct character pitches (Gappu higher comedic pitch, Pappu deeper confident pitch)
            if speaker in ["Gappu", "Chintu"]:
                pitch_filter = "asetrate=44100*1.14,atempo=1/1.14"
            elif speaker in ["Pappu", "Mintu"]:
                pitch_filter = "asetrate=44100*0.96,atempo=1/0.96"
            else:
                pitch_filter = "asetrate=44100*1.04,atempo=1/1.04"
                
            subprocess.run(["ffmpeg", "-y", "-i", raw_audio, "-af", pitch_filter, pitched_audio], capture_output=True)
            duration = max(3.0, get_audio_duration(pitched_audio) + 0.25)
            dialogue_audio_clips.append(pitched_audio)
            
            # --- RENDER 1080x1920 DIALOGUE FRAME ---
            frame = Image.new("RGB", (width, height), color=(15, 23, 42))
            draw = ImageDraw.Draw(frame)
            
            # Top Brand Header
            draw.rectangle([0, 0, width, 180], fill=(10, 15, 30))
            draw.text((70, 60), "rareember.", fill=(255, 255, 255), font=font_brand)
            draw.ellipse([325, 80, 345, 100], fill=(255, 107, 53))
            draw.text((70, 120), script["theme"].upper(), fill=(255, 184, 0), font=font_sub)
            draw.rounded_rectangle([width - 430, 65, width - 70, 125], radius=28, fill=(255, 107, 53))
            draw.text((width - 410, 80), fest['banner'], fill=(255, 255, 255), font=get_font(20, bold=True))
            
            # Center Visual Content
            if line["scene"] in ["character_gappu", "character_pappu"]:
                # Draw 3D Cartoon Character Avatar
                draw_3d_cartoon_avatar(draw, width // 2, 600, 190, mood=line["avatar"], name=speaker)
                
                # Speaker Badge
                spk_color = (239, 68, 68) if speaker in ["Gappu", "Chintu"] else (34, 197, 94)
                draw.rounded_rectangle([width // 2 - 180, 830, width // 2 + 180, 895], radius=28, fill=spk_color)
                draw.text((width // 2 - 130, 845), f"🗣️ {speaker.upper()} SPEAKS", fill=(255, 255, 255), font=font_badge)
                
                # Small Product Teaser
                draw.rounded_rectangle([width // 2 - 200, 930, width // 2 + 200, 1230], radius=24, fill=(24, 30, 48), outline=(51, 65, 85), width=2)
                mini_prod = prod_img.resize((260, 260), Image.Resampling.LANCZOS)
                frame.paste(mini_prod, (width // 2 - 130, 950))
                
            elif line["scene"] == "product_showcase":
                # High-Impact 3D Product Hero Stage
                draw.rounded_rectangle([90, 240, width - 90, 1150], radius=36, fill=(24, 30, 48), outline=(52, 211, 153), width=4)
                frame.paste(prod_square, (130, 280))
                
                # Floating Price & Specs Badge
                draw.rounded_rectangle([130, 1180, width - 130, 1310], radius=28, fill=(16, 185, 129))
                draw.text((170, 1210), f"⚡ Factory Direct: Rs. {product['price_inr']:,}", fill=(255, 255, 255), font=font_price)
                draw.text((170, 1280), f"M.R.P. Rs. {product['compare_at']:,} • Save Rs. {saving_inr:,} ({discount_pct}% OFF)", fill=(255, 255, 255), font=font_sub)
                
            else:  # viral_cta
                # Both Characters Celebrating + Big Action Button
                draw_3d_cartoon_avatar(draw, width // 2 - 220, 450, 140, mood="celebrate", name="Gappu")
                draw_3d_cartoon_avatar(draw, width // 2 + 220, 450, 140, mood="celebrate", name="Pappu")
                
                # Festive Coupon Box
                draw.rounded_rectangle([90, 640, width - 90, 1020], radius=32, fill=(249, 115, 22), outline=(255, 237, 213), width=4)
                draw.text((140, 680), "🪔 SPECIAL LAUNCH COUPON", fill=(255, 255, 255), font=font_badge)
                draw.text((140, 750), f"CODE: {fest['coupon']}", fill=(255, 255, 255), font=get_font(52, bold=True))
                draw.text((140, 840), f"{fest['discount_desc']} • Pan-India Free Delivery", fill=(255, 255, 255), font=font_sub)
                draw.text((140, 910), "🚚 Express 2-4 Days Dispatch (BlueDart & Delhivery)", fill=(255, 255, 255), font=font_sub)
                draw.text((140, 960), "💵 100% Cash on Delivery (COD) Available", fill=(255, 255, 255), font=font_sub)

            # --- DYNAMIC DIALOGUE SUBTITLE SPEECH BUBBLE (BOTTOM) ---
            draw.rounded_rectangle([60, 1340, width - 60, 1660], radius=32, fill=(10, 15, 30), outline=(255, 107, 53), width=3)
            # Hindi Spoken Dialogue
            draw.text((90, 1375), hi_text[:46], fill=(255, 255, 255), font=font_dialogue_hi)
            if len(hi_text) > 46:
                draw.text((90, 1435), hi_text[46:92], fill=(255, 255, 255), font=font_dialogue_hi)
            # English Subtitle
            draw.text((90, 1515), f"\"{en_sub[:54]}\"", fill=(255, 184, 0), font=font_dialogue_en)
            if len(en_sub) > 54:
                draw.text((90, 1560), f"\"{en_sub[54:108]}\"", fill=(255, 184, 0), font=font_dialogue_en)
            draw.text((90, 1615), "⚡ 100% Cash on Delivery Pan-India", fill=(52, 211, 153), font=get_font(22, bold=True))
            
            # Action CTA Button
            draw.rounded_rectangle([70, 1690, width - 70, 1810], radius=38, fill=(255, 107, 53))
            draw.text((160, 1735), "COMMENT \"BUY\" FOR 1-CLICK COD LINK ⚡", fill=(255, 255, 255), font=font_btn)
            draw.text((width // 2 - 220, 1845), "rareember-store.vercel.app  •  @rareember", fill=(148, 163, 184), font=font_sub)
            
            frame_path = os.path.join(tmpdir, f"frame_{idx}.jpg")
            frame.save(frame_path, quality=95)
            
            # Render video clip with motion push-in
            clip_path = os.path.join(tmpdir, f"clip_{idx}.mp4")
            cmd_clip = [
                "ffmpeg", "-y", "-loop", "1", "-i", frame_path,
                "-vf", f"zoompan=z='min(zoom+0.0008,1.08)':d={int(duration * 30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30",
                "-t", str(round(duration, 2)),
                "-c:v", "libx264", "-pix_fmt", "yuv420p", clip_path
            ]
            subprocess.run(cmd_clip, cwd=tmpdir, capture_output=True)
            if os.path.exists(clip_path):
                scene_video_clips.append(clip_path)

        # 2. CONCATENATE ALL VIDEO & DIALOGUE AUDIO CLIPS
        video_concat_txt = os.path.join(tmpdir, "v_concat.txt")
        with open(video_concat_txt, "w") as vf:
            for c in scene_video_clips:
                vf.write(f"file '{c}'\n")
                
        audio_concat_txt = os.path.join(tmpdir, "a_concat.txt")
        with open(audio_concat_txt, "w") as af:
            for a in dialogue_audio_clips:
                af.write(f"file '{a}'\n")
                
        merged_video = os.path.join(tmpdir, "merged_video.mp4")
        merged_audio = os.path.join(tmpdir, "merged_audio.mp3")
        
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", video_concat_txt, "-c", "copy", merged_video], capture_output=True)
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", audio_concat_txt, "-c", "copy", merged_audio], capture_output=True)
        
        total_duration = get_audio_duration(merged_audio)
        
        # 3. GENERATE BACKGROUND LO-FI AUDIO & MIX UNDERNEATH
        bg_audio_wav = os.path.join(tmpdir, "bg_lofi.wav")
        generate_aesthetic_lofi_audio(bg_audio_wav, duration_sec=total_duration + 1.0)
        
        mixed_audio = os.path.join(tmpdir, "final_mixed_audio.mp3")
        cmd_mix = [
            "ffmpeg", "-y",
            "-i", merged_audio,
            "-i", bg_audio_wav,
            "-filter_complex", "[0:a]volume=1.0[voice];[1:a]volume=0.18[bg];[voice][bg]amix=inputs=2:duration=first[out]",
            "-map", "[out]",
            mixed_audio
        ]
        subprocess.run(cmd_mix, capture_output=True)
        
        # 4. FINAL MUX WITH ANIMATED BOTTOM PROGRESS BAR
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_filename = f"reel_{product['id']}_{timestamp}.mp4"
        out_path = os.path.join(OUTPUT_DIR, out_filename)
        
        cmd_final = [
            "ffmpeg", "-y",
            "-i", merged_video,
            "-i", mixed_audio,
            "-vf", f"drawbox=x=0:y=1905:w='iw*t/{total_duration}':h=15:color=0xFF6B35@1:t=fill",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest",
            out_path
        ]
        res = subprocess.run(cmd_final, cwd=tmpdir, capture_output=True, text=True)
        if res.returncode == 0 and os.path.exists(out_path):
            file_mb = round(os.path.getsize(out_path) / (1024 * 1024), 2)
            print(f"🎬 Rendered Viral Hindi Dialogue Cartoon Reel Video: {out_path} ({file_mb} MB, {total_duration:.1f}s)")
            return out_path
        else:
            print(f"Notice: Dialogue render fallback notice ({res.stderr[:200]}), falling back to post image.")
            return render_post_image(product)

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
    
    script_idx = abs(hash(product.get("id", "script"))) % len(DIALOGUE_BANTER_SCRIPTS)
    script = DIALOGUE_BANTER_SCRIPTS[script_idx]
    story_highlight = f"""🎭 {script['theme']}
Gappu: "Bhai maine showroom se ₹{product['compare_at']:,} mein liya!"
Pappu: "Arey bhai tu loot gaya! RareEmber pe wahi direct factory se sirf ₹{product['price_inr']:,} mein mil raha hai!"
✨ Verified 4.9★ Quality • 30-Day Zero-Risk Return Guarantee"""

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

def post_to_instagram(media_path, caption, product=None):
    """Logs into Instagram using instagrapi and publishes the photo or video Reel."""
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
            return False

        try:
            cl.dump_settings(SESSION_FILE)
        except Exception:
            pass
        print("✅ Login authenticated successfully!")
        
        is_video = media_path.lower().endswith(".mp4")
        if is_video:
            print("📤 Uploading video Reel to Instagram Reels (@rareember)...")
            media = cl.clip_upload(media_path, caption=caption)
            print(f"🎉 SUCCESS! Published Reel to Instagram! Media ID: {media.pk}")
        else:
            print("📤 Uploading photo to Instagram feed (@rareember)...")
            media = cl.photo_upload(media_path, caption=caption)
            print(f"🎉 SUCCESS! Published Post to Instagram! Media ID: {media.pk}")

        # Agency Enhancement: Auto-post 1st Comment with direct link & instant discount
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

        return True
    except Exception as e:
        print(f"❌ Instagram upload error: {e}")
        return False

def run_autopilot_cycle(dry_run=False, campaign_type="auto", format_type="auto"):
    print("=" * 60)
    print(f"🚀 RAREEMBER INSTAGRAM AUTOPILOT CYCLE | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    product = pick_next_product()
    print(f"📦 Selected Product: {product['title']} (ID: {product['id']})")
    
    # 1. Resolve campaign angle
    c_type = resolve_campaign_type(campaign_type)
    print(f"🎯 Active Campaign Angle: {c_type.upper()}")

    # 2. Render Media (Reel MP4 or Feed JPG)
    should_render_reel = (format_type == "reel") or (format_type == "auto" and c_type in ["problem_solver", "festive_deal"])
    if should_render_reel:
        print("🎬 Rendering Vertical 9:16 Instagram Reel Video...")
        media_path = render_reel_video(product)
    else:
        print("🖼️ Rendering Vertical 4:5 Instagram Feed Creative...")
        media_path = render_post_image(product)
    
    # 3. Generate Caption
    caption, _ = generate_caption(product, campaign_type=c_type)
    
    # 4. Post or Dry Run
    if dry_run:
        print("\n[DRY RUN MODE ACTIVE]")
        print("📝 Generated Caption:\n" + "-" * 40)
        print(caption)
        print("-" * 40)
        print(f"🖼️ Media Asset Saved at: {media_path}")
        media_kind = "Reel Video (MP4)" if media_path.endswith(".mp4") else "Feed Image (JPG)"
        send_telegram_alert(media_path, f"📸 *Dry-Run Preview Ready ({c_type.upper()} | {media_kind})*\n\n*Product:* {product['title']}\n*Price:* ₹{product['price_inr']:,}\n*Status:* Media generated and ready for broadcast.")
        return True
    else:
        success = post_to_instagram(media_path, caption, product=product)
        if success:
            history = load_history()
            media_kind = "reel" if media_path.endswith(".mp4") else "post"
            history.append({
                "id": product["id"],
                "title": product["title"],
                "campaign_type": c_type,
                "format": media_kind,
                "posted_at": datetime.now(timezone.utc).isoformat(),
                "media_path": media_path
            })
            save_history(history)
            send_telegram_alert(media_path, f"✅ *Auto-Posted {media_kind.upper()} to Instagram ({c_type.upper()})*\n\n*Product:* {product['title']}\n*Price:* ₹{product['price_inr']:,}\n*Status:* Live on @rareember with direct product link & bio link.")
            return True
        return False

def main():
    parser = argparse.ArgumentParser(description="RareEmber Instagram Autopilot")
    parser.add_argument("--dry-run", action="store_true", help="Generate post and send preview to Telegram without uploading to IG")
    parser.add_argument("--campaign-type", choices=["auto", "catalog", "problem_solver", "festive_deal", "trust_builder"], default="auto", help="Campaign angle for post")
    parser.add_argument("--format", choices=["auto", "post", "reel"], default="auto", help="Content format (post image or video reel)")
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
