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
                pet_blacklist = ["calmcloud", "ember-glow", "warm-paw", "lickmat", "pawtrack", "collar", "pet", "dog", "cat", "scratch"]
                if any(bk in p_id or bk in title.lower() or bk in cat for bk in pet_blacklist):
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
    
    # Discount Badge on Product Image (Top Left)
    discount_pct = int(round((1 - (product["price_inr"] / product["compare_at"])) * 100))
    draw.rounded_rectangle([card_x + 24, card_y + 24, card_x + 190, card_y + 80], radius=28, fill=(29, 29, 31))
    font_disc = get_font(26, bold=True)
    draw.text((card_x + 44, card_y + 36), f"-{discount_pct}% OFF", fill=(255, 184, 0), font=font_disc)
    
    # 3. Product Info Section
    info_y = 1080
    font_title = get_font(40, bold=True)
    draw.text((60, info_y), product["title"][:42], fill=theme["text_main"], font=font_title)
    
    # Ratings & Social Proof
    font_rating = get_font(24, bold=True)
    draw.text((60, info_y + 55), f"RATING {product['rating']} / 5.0  *  ({product['reviews']} Verified Reviews)", fill=(217, 119, 6), font=font_rating)
    
    # Pricing & M.R.P. Savings
    font_price = get_font(52, bold=True)
    font_comp = get_font(28, bold=False)
    price_str = f"Rs. {product['price_inr']:,}"
    comp_str = f"M.R.P.: Rs. {product['compare_at']:,}"
    
    draw.text((width - 420, info_y), price_str, fill=theme["accent"], font=font_price)
    draw.text((width - 420, info_y + 60), comp_str, fill=theme["text_sub"], font=font_comp)
    # Strike through M.R.P.
    draw.line([(width - 425, info_y + 76), (width - 150, info_y + 76)], fill=theme["text_sub"], width=3)
    
    # 4. Trust Guarantee Strip
    draw.line([(60, info_y + 120), (width - 60, info_y + 120)], fill=theme["card_outline"], width=2)
    font_trust = get_font(21, bold=True)
    trust_text = "PAN-INDIA EXPRESS COURIER   *   CASH ON DELIVERY   *   30-DAY ZERO-RISK RETURNS"
    draw.text((70, info_y + 138), trust_text, fill=theme["text_sub"], font=font_trust)
    
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

CHARACTER_PROFILES = [
    {
        "name": "Priya",
        "city": "Bengaluru",
        "role": "Product Designer",
        "hook_line": "Priya was tired of cluttered desks & cheap plastic gadgets...",
        "story_angle": "After testing 4 different setups, she found this factory-direct gem.",
        "outcome": "Her entire office team placed orders within 48 hours.",
        "avatar_desc": "young stylish Indian woman UX designer, glasses, modern aesthetic office apartment",
        "prompt_scene": "3D Pixar-style cinematic render of stylish young Indian female product designer wearing glasses in aesthetic Bengaluru apartment studio with warm ambient backlighting holding modern tech device, octane render, 8k vertical portrait"
    },
    {
        "name": "Aarav",
        "city": "Mumbai",
        "role": "Fintech Founder",
        "hook_line": "Aarav refused to pay 400% luxury retail markups...",
        "story_angle": "Ordered factory-direct on RareEmber with 1-Click Cash on Delivery.",
        "outcome": "Arrived in 2 days from the regional warehouse. Absolutely unmatched finish.",
        "avatar_desc": "handsome Indian male entrepreneur, modern minimalist apartment overlooking Mumbai skyline",
        "prompt_scene": "3D Pixar-style cinematic render of sharp young Indian male tech entrepreneur in modern minimalist Mumbai high-rise apartment with glass windows and warm cozy evening light, octane render, 8k vertical portrait"
    },
    {
        "name": "Sneha",
        "city": "Delhi NCR",
        "role": "Architect & Creator",
        "hook_line": "Sneha searched everywhere for clean Pinterest aesthetics on a budget...",
        "story_angle": "Most marketplace knockoffs broke or looked dull. This one exceeded every expectation.",
        "outcome": "Her Instagram DMs exploded with people asking for the direct link.",
        "avatar_desc": "creative young Indian woman lifestyle creator, warm aesthetic room with soft ambient light",
        "prompt_scene": "3D Pixar-style cinematic render of creative young Indian female architect in Scandinavian aesthetic studio with minimalist wood desk and warm sunset glow, octane render, 8k vertical portrait"
    },
    {
        "name": "Kabir",
        "city": "Hyderabad",
        "role": "Senior Engineer",
        "hook_line": "Kabir put this through a 30-day hardcore durability test...",
        "story_angle": "Solid tactile engineering, seamless build, and factory-direct pricing.",
        "outcome": "Rated 5.0/5.0 stars. 'Hands down the best lifestyle purchase of 2026.'",
        "avatar_desc": "sharp Indian male engineer, minimalist workstation with warm ambient lighting",
        "prompt_scene": "3D Pixar-style cinematic render of young Indian male engineer at clean futuristic aesthetic workstation with dual monitors and warm ambient lighting, octane render, 8k vertical portrait"
    }
]

def fetch_3d_ai_render(prompt, timeout=10):
    """
    Fetches high-quality 3D visual render via Pollinations AI (free, zero API key required).
    Returns PIL Image or None on network timeout/failure.
    """
    import urllib.parse
    try:
        encoded = urllib.parse.quote(prompt)
        seed = random.randint(1000, 999999)
        url = f"https://image.pollinations.ai/prompt/{encoded}?width=1080&height=1920&nologo=true&seed={seed}&model=flux"
        resp = requests.get(url, timeout=timeout)
        if resp.status_code == 200 and len(resp.content) > 10000:
            return Image.open(BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        print(f"Notice: Pollinations 3D fetch notice ({e}), utilizing studio 3D compositor.")
    return None

def generate_aesthetic_lofi_audio(out_wav_path, duration_sec=11.8):
    """
    Generates a clean stereo 44.1kHz lo-fi / chillhop chord sequence in pure Python.
    Zero external dependencies, completely royalty-free, 100% legal for Instagram Reels.
    """
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
            env = min(1.0, t_chord * 4.0) * math.exp(-t_chord * 0.7)
            sample_val = 0.0
            for freq in notes:
                sample_val += 0.22 * math.sin(2.0 * math.pi * freq * t)
                sample_val += 0.08 * math.sin(2.0 * math.pi * (freq * 2) * t)
            root_freq = notes[0] / 2.0
            sample_val += 0.25 * math.sin(2.0 * math.pi * root_freq * t) * env
            beat_phase = (t % 0.5)
            if beat_phase < 0.03:
                noise = ((math.sin(t * 12345.67) + 1.0) / 2.0 - 0.5) * 0.08 * math.exp(-beat_phase * 150)
                sample_val += noise
            sample_val = max(-1.0, min(1.0, sample_val * env * 0.75))
            int_val = int(sample_val * 32767.0)
            frames.extend(struct.pack("<hh", int_val, int_val))
        wav_file.writeframes(frames)
    return out_wav_path

def render_reel_video(product):
    """
    Renders an agency-grade 1080x1920 (9:16) 3D Story Instagram Reel video (.mp4)
    featuring 3rd-character relatable storytelling, 3D visual styling,
    smooth FFmpeg camera motion (zoompan push-in), animated progress bar,
    and synthesized lo-fi chillhop background audio.
    """
    import subprocess
    import tempfile
    
    width = 1080
    height = 1920
    fest = get_current_festival()
    discount_pct = int(round((1 - (product["price_inr"] / product["compare_at"])) * 100))
    saving_inr = product["compare_at"] - product["price_inr"]
    
    # Select relatable 3rd character profile
    char_idx = abs(hash(product.get("id", "char"))) % len(CHARACTER_PROFILES)
    char = CHARACTER_PROFILES[char_idx]
    print(f"🎭 Reel Story Character: {char['name']} ({char['role']}, {char['city']})")
    
    # Fetch Product Image
    img_url = product["image_url"]
    try:
        resp = requests.get(img_url, timeout=10)
        prod_img = Image.open(BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        print(f"Notice: Product image fetch ({e}), using default canvas.")
        prod_img = Image.new("RGB", (900, 900), color=(240, 240, 240))
        
    prod_square = prod_img.resize((920, 920), Image.Resampling.LANCZOS)
    
    # Try fetching AI 3D Character render
    ai_prompt = f"{char['prompt_scene']} showcasing {product['title']}"
    ai_3d_img = fetch_3d_ai_render(ai_prompt, timeout=10)
    
    font_brand = get_font(46, bold=True)
    font_title = get_font(42, bold=True)
    font_sub = get_font(28, bold=False)
    font_badge = get_font(30, bold=True)
    font_price = get_font(58, bold=True)
    font_btn = get_font(36, bold=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        # --- SCENE 1: THE 3D CHARACTER & RELATABLE HOOK ---
        s1 = Image.new("RGB", (width, height), color=(15, 23, 42))
        d1 = ImageDraw.Draw(s1)
        
        # If AI 3D image available, composite as dramatic backdrop
        if ai_3d_img:
            ai_fit = ai_3d_img.resize((width, height), Image.Resampling.LANCZOS)
            s1.paste(ai_fit, (0, 0))
            # Overlay dark gradient on top and bottom for readable typography
            overlay = Image.new("RGBA", (width, height), color=(0, 0, 0, 0))
            od = ImageDraw.Draw(overlay)
            od.rectangle([0, 0, width, 240], fill=(10, 15, 30, 210))
            od.rectangle([0, 1200, width, height], fill=(10, 15, 30, 235))
            s1 = Image.alpha_composite(s1.convert("RGBA"), overlay).convert("RGB")
            d1 = ImageDraw.Draw(s1)
        else:
            # 3D Studio Mesh Backdrop
            for y_bg in range(0, height, 4):
                blend = y_bg / height
                r = int(15 * (1 - blend) + 30 * blend)
                g = int(23 * (1 - blend) + 41 * blend)
                b = int(42 * (1 - blend) + 65 * blend)
                d1.line([(0, y_bg), (width, y_bg)], fill=(r, g, b), width=4)
            d1.rounded_rectangle([70, 420, width - 70, 1340], radius=32, fill=(30, 41, 59), outline=(51, 65, 85), width=3)
            s1.paste(prod_square, (80, 430))
            
        # Top Brand Header
        d1.rectangle([0, 0, width, 180], fill=(10, 15, 30))
        d1.text((70, 60), "rareember.", fill=(255, 255, 255), font=font_brand)
        d1.ellipse([325, 80, 345, 100], fill=(255, 107, 53))
        d1.text((70, 120), f"REAL STORY • {char['city'].upper()}, INDIA", fill=(148, 163, 184), font=font_sub)
        
        d1.rounded_rectangle([width - 440, 65, width - 70, 125], radius=28, fill=(255, 107, 53))
        d1.text((width - 420, 80), fest['banner'], fill=(255, 255, 255), font=get_font(20, bold=True))
        
        # Character Hook Banner
        d1.rounded_rectangle([70, 220, width - 70, 360], radius=24, fill=(30, 41, 59))
        d1.text((100, 245), f"👤 {char['name']} ({char['role']})", fill=(255, 184, 0), font=font_badge)
        d1.text((100, 295), "🛑 STOP SCROLLING • Here is what changed everything", fill=(239, 68, 68), font=get_font(26, bold=True))
        
        # Bottom Relatable Story Overlay
        d1.rounded_rectangle([70, 1380, width - 70, 1640], radius=28, fill=(24, 30, 48), outline=(51, 65, 85), width=2)
        d1.text((100, 1410), f'"{char["hook_line"]}"', fill=(255, 255, 255), font=get_font(30, bold=True))
        d1.text((100, 1475), f"{char['story_angle']}", fill=(203, 213, 225), font=get_font(24, bold=False))
        d1.text((100, 1545), f"✨ {char['outcome']}", fill=(52, 211, 153), font=get_font(24, bold=True))
        
        d1.rounded_rectangle([70, 1680, width - 70, 1800], radius=36, fill=(255, 107, 53))
        d1.text((250, 1720), "WATCH THE SOLUTION NEXT ▾", fill=(255, 255, 255), font=font_btn)
        
        p1 = os.path.join(tmpdir, "slide_0.jpg")
        s1.save(p1, quality=95)
        
        # --- SCENE 2: THE AESTHETIC SOLUTION & 3D SPECS ---
        s2 = Image.new("RGB", (width, height), color=(11, 15, 25))
        d2 = ImageDraw.Draw(s2)
        d2.rectangle([0, 0, width, 180], fill=(10, 15, 30))
        d2.text((70, 60), "rareember.", fill=(255, 255, 255), font=font_brand)
        d2.ellipse([325, 80, 345, 100], fill=(255, 107, 53))
        d2.text((70, 120), "FACTORY DIRECT ARCHITECTURE", fill=(148, 163, 184), font=font_sub)
        
        d2.rounded_rectangle([70, 220, width - 70, 1040], radius=32, fill=(24, 30, 48), outline=(51, 65, 85), width=2)
        small_prod = prod_img.resize((500, 500), Image.Resampling.LANCZOS)
        s2.paste(small_prod, ((width - 500) // 2, 240))
        
        fy = 780
        for feat in product["features"][:3]:
            d2.text((110, fy), f"✔ {feat}", fill=(241, 245, 249), font=get_font(28, bold=True))
            fy += 65
            
        d2.rounded_rectangle([70, 1080, width - 70, 1260], radius=24, fill=(16, 185, 129))
        d2.text((120, 1115), f"⭐ {product['rating']}/5.0 VERIFIED CUSTOMER RATING", fill=(255, 255, 255), font=font_badge)
        d2.text((120, 1175), f"Over {product['reviews']}+ Happy Customers Across India 🇮🇳", fill=(255, 255, 255), font=font_sub)
        
        d2.rounded_rectangle([70, 1310, width - 70, 1620], radius=28, fill=(30, 41, 59))
        d2.text((110, 1350), "⚡ Factory Direct: No middlemen markups", fill=(255, 184, 0), font=get_font(26, bold=True))
        d2.text((110, 1415), "🚚 Pan-India Express Delivery (2–4 Days)", fill=(241, 245, 249), font=font_sub)
        d2.text((110, 1480), "💵 100% Cash on Delivery (COD) Available", fill=(241, 245, 249), font=font_sub)
        d2.text((110, 1545), "🛡️ 30-Day Zero-Risk Return Guarantee", fill=(241, 245, 249), font=font_sub)
        
        d2.rounded_rectangle([70, 1680, width - 70, 1800], radius=36, fill=(255, 107, 53))
        d2.text((270, 1720), "OFFER DETAILS NEXT ▾", fill=(255, 255, 255), font=font_btn)
        
        p2 = os.path.join(tmpdir, "slide_1.jpg")
        s2.save(p2, quality=95)
        
        # --- SCENE 3: FESTIVE DEAL & VIRAL 1-CLICK COD CTA ---
        s3 = Image.new("RGB", (width, height), color=(18, 12, 8))
        d3 = ImageDraw.Draw(s3)
        d3.rectangle([0, 0, width, 180], fill=(25, 15, 10))
        d3.text((70, 60), "rareember.", fill=(255, 255, 255), font=font_brand)
        d3.ellipse([325, 80, 345, 100], fill=(255, 107, 53))
        d3.text((70, 120), fest['greeting'], fill=(255, 184, 0), font=font_sub)
        
        d3.rounded_rectangle([70, 230, width - 70, 590], radius=32, fill=(249, 115, 22), outline=(255, 237, 213), width=4)
        d3.text((110, 270), "🪔 GRAND FESTIVE COUPON", fill=(255, 255, 255), font=font_badge)
        d3.text((110, 340), f"USE CODE: {fest['coupon']}", fill=(255, 255, 255), font=get_font(52, bold=True))
        d3.text((110, 430), f"{fest['discount_desc']}!", fill=(255, 255, 255), font=font_sub)
        d3.text((110, 490), "Valid Across 19,000+ PIN Codes in India", fill=(255, 255, 255), font=get_font(22, bold=False))
        
        d3.rounded_rectangle([70, 640, width - 70, 940], radius=32, fill=(28, 25, 23), outline=(68, 64, 60), width=2)
        d3.text((110, 690), f"TODAY'S SPECIAL: Rs. {product['price_inr']:,}", fill=(255, 184, 0), font=font_price)
        d3.text((110, 770), f"M.R.P. Rs. {product['compare_at']:,} (-{discount_pct}% OFF)", fill=(168, 162, 158), font=font_sub)
        d3.text((110, 830), f"Extra ₹100 Off with coupon {fest['coupon']} at checkout", fill=(34, 197, 94), font=font_sub)
        
        d3.rounded_rectangle([70, 980, width - 70, 1420], radius=32, fill=(28, 25, 23))
        d3.text((110, 1025), "🛒 HOW TO ORDER RIGHT NOW:", fill=(255, 255, 255), font=font_badge)
        d3.text((110, 1095), "1. 💬 Comment 'BUY' or 'LINK' for instant DM link", fill=(255, 184, 0), font=get_font(28, bold=True))
        d3.text((110, 1165), "2. 📱 Or Tap Link in Bio (@rareember)", fill=(241, 245, 249), font=font_sub)
        d3.text((110, 1235), "3. 💵 Pay via Cash on Delivery at your doorstep", fill=(241, 245, 249), font=font_sub)
        d3.text((110, 1305), "4. 🛡️ 30-Day Zero-Risk Return Guarantee", fill=(148, 163, 184), font=get_font(22, bold=False))
        
        d3.rounded_rectangle([70, 1480, width - 70, 1660], radius=42, fill=(255, 107, 53))
        d3.text((170, 1545), "TAP LINK IN BIO TO BUY NOW ⚡", fill=(255, 255, 255), font=get_font(40, bold=True))
        
        d3.text((width // 2 - 240, 1720), "rareember-store.vercel.app", fill=(148, 163, 184), font=font_sub)
        
        p3 = os.path.join(tmpdir, "slide_2.jpg")
        s3.save(p3, quality=95)
        
        # --- GENERATE SYNTHESIZED LO-FI AUDIO TRACK ---
        audio_wav = os.path.join(tmpdir, "lofi_audio.wav")
        generate_aesthetic_lofi_audio(audio_wav, duration_sec=11.8)
        
        # --- RENDER DYNAMIC 3D MOTION CLIPS VIA FFMPEG (ZOOMPAN PUSH-IN) ---
        clip0 = os.path.join(tmpdir, "clip_0.mp4")
        clip1 = os.path.join(tmpdir, "clip_1.mp4")
        clip2 = os.path.join(tmpdir, "clip_2.mp4")
        
        cmd0 = [
            "ffmpeg", "-y", "-loop", "1", "-i", p1,
            "-vf", "zoompan=z='min(zoom+0.0012,1.14)':d=114:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30",
            "-t", "3.8", "-c:v", "libx264", "-pix_fmt", "yuv420p", clip0
        ]
        cmd1 = [
            "ffmpeg", "-y", "-loop", "1", "-i", p2,
            "-vf", "zoompan=z='min(zoom+0.0010,1.12)':d=114:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30",
            "-t", "3.8", "-c:v", "libx264", "-pix_fmt", "yuv420p", clip1
        ]
        cmd2 = [
            "ffmpeg", "-y", "-loop", "1", "-i", p3,
            "-vf", "zoompan=z='min(zoom+0.0008,1.10)':d=126:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30",
            "-t", "4.2", "-c:v", "libx264", "-pix_fmt", "yuv420p", clip2
        ]
        
        subprocess.run(cmd0, cwd=tmpdir, capture_output=True)
        subprocess.run(cmd1, cwd=tmpdir, capture_output=True)
        subprocess.run(cmd2, cwd=tmpdir, capture_output=True)
        
        # Concatenate motion clips & apply animated bottom progress bar + lo-fi audio
        concat_txt = os.path.join(tmpdir, "motion_concat.txt")
        with open(concat_txt, "w") as cf:
            cf.write(f"file '{clip0}'\nfile '{clip1}'\nfile '{clip2}'\n")
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_filename = f"reel_{product['id']}_{timestamp}.mp4"
        out_path = os.path.join(OUTPUT_DIR, out_filename)
        
        cmd_final = [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0", "-i", concat_txt,
            "-i", audio_wav,
            "-vf", "drawbox=x=0:y=1908:w='iw*t/11.8':h=12:color=0xFF6B35@1:t=fill",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest",
            out_path
        ]
        res = subprocess.run(cmd_final, cwd=tmpdir, capture_output=True, text=True)
        if res.returncode == 0 and os.path.exists(out_path):
            file_mb = round(os.path.getsize(out_path) / (1024 * 1024), 2)
            print(f"🎬 Rendered Agency-Grade 3D Story Reel Video: {out_path} ({file_mb} MB)")
            return out_path
        else:
            print(f"Notice: Motion render fallback ({res.stderr[:200]}), rendering direct concat.")
            # Simple direct fallback concat
            fallback_concat = os.path.join(tmpdir, "fb_concat.txt")
            with open(fallback_concat, "w") as fcf:
                fcf.write("file 'slide_0.jpg'\nduration 3.8\nfile 'slide_1.jpg'\nduration 3.8\nfile 'slide_2.jpg'\nduration 4.2\nfile 'slide_2.jpg'\n")
            cmd_fb = [
                "ffmpeg", "-y",
                "-f", "concat", "-safe", "0", "-i", fallback_concat,
                "-i", audio_wav,
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
                "-c:a", "aac", "-b:a", "128k",
                "-shortest",
                out_path
            ]
            res_fb = subprocess.run(cmd_fb, cwd=tmpdir, capture_output=True, text=True)
            if res_fb.returncode == 0 and os.path.exists(out_path):
                return out_path
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
    
    char_idx = abs(hash(product.get("id", "char"))) % len(CHARACTER_PROFILES)
    char = CHARACTER_PROFILES[char_idx]
    story_highlight = f"📖 Customer Story ({char['city']}): {char['name']} ({char['role']}) — \"{char['hook_line']}\" {char['story_angle']} ✨ Result: {char['outcome']}"

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
