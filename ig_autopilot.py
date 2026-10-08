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
        "id": "ember-glow-collar",
        "title": "Ember Glow LED Safety Collar",
        "category": "Pet Care Essentials",
        "price_inr": 2549,
        "compare_at": 4249,
        "rating": 4.7,
        "reviews": 3200,
        "image_url": "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=1080",
        "hook": "Never lose sight of your fur baby during late-night walks 🐕🌙",
        "features": [
            "360° Ultra-bright rechargeable LED",
            "IPX7 100% Waterproof construction",
            "Soft breathable padded comfort lining"
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
    'calmcloud-ortho-bed': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800',
    'cozy-nest-carrier': 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800',
    'warm-paw-heater-pad': 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800',
    'smart-fetch-pod': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
    'pawtrack-smart-feeder': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    'aesthetic-scratch-post': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    'lickmat-calm-set': 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=800',
    'ember-glow-collar': 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=800',
}

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://qdkkxpfhwrwyoardlceo.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka2t4cGZod3J3eW9hcmRsY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Njc2OTcsImV4cCI6MjEwNjQ0MzY5N30.qFvuYQ1G9NvYGYXWVtR6b9dPScOuUIfeVQ8yX3y1DJo")

def fetch_live_catalog():
    """Dynamically fetches all active products from Supabase store database."""
    try:
        url = f"{SUPABASE_URL}/rest/v1/products?select=id,title,price,compare_at_price,rating,reviews,category,image_url,short,story&order=created_at.desc&limit=100"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
        }
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            db_products = res.json()
            valid = []
            for p in db_products:
                title = (p.get("title") or "").strip()
                img = (p.get("image_url") or "").strip() or FALLBACK_IMAGES.get(p.get("id"))
                if title and img:
                    price_usd = float(p.get("price") or 29.99)
                    price_inr = int(round(price_usd * 85))
                    compare_usd = float(p.get("compare_at_price") or (price_usd * 1.5))
                    compare_inr = int(round(compare_usd * 85))
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

def render_post_image(product):
    """
    Renders a stunning 1080x1350 (4:5) Instagram post creative.
    """
    width = 1080
    height = 1350
    
    # 1. Background (Warm luxury canvas #FFFBF5)
    base = Image.new("RGB", (width, height), color=(255, 251, 245))
    draw = ImageDraw.Draw(base)
    
    # Header Bar: RareEmber Branding Badge
    draw.rectangle([0, 0, width, 140], fill=(255, 255, 255))
    draw.line([(0, 140), (width, 140)], fill=(240, 235, 225), width=2)
    
    font_brand = get_font(42, bold=True)
    font_sub = get_font(22, bold=False)
    draw.text((60, 40), "rareember.", fill=(26, 20, 18), font=font_brand)
    draw.ellipse([285, 60, 301, 76], fill=(255, 77, 36))
    draw.text((60, 92), "CURATED CATALOG • OFFICIAL DROP", fill=(140, 130, 120), font=font_sub)
    
    # Category Pill Tag (Top Right)
    cat_text = product.get("category", "Trending").upper()
    font_tag = get_font(20, bold=True)
    draw.rounded_rectangle([width - 320, 48, width - 60, 96], radius=24, fill=(255, 240, 232))
    draw.text((width - 300, 60), f"DROP • {cat_text}", fill=(255, 77, 36), font=font_tag)
    
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
    draw.rounded_rectangle([card_x, card_y, card_x + 880, card_y + 880], radius=32, fill=(255, 255, 255), outline=(235, 228, 218), width=3)
    base.paste(prod_img, (card_x + 10, card_y + 10))
    
    # Discount Badge on Product Image (Top Left)
    discount_pct = int(round((1 - (product["price_inr"] / product["compare_at"])) * 100))
    draw.rounded_rectangle([card_x + 24, card_y + 24, card_x + 190, card_y + 80], radius=28, fill=(29, 29, 31))
    font_disc = get_font(26, bold=True)
    draw.text((card_x + 44, card_y + 36), f"-{discount_pct}% OFF", fill=(255, 184, 0), font=font_disc)
    
    # 3. Product Info Section
    info_y = 1080
    font_title = get_font(42, bold=True)
    draw.text((60, info_y), product["title"], fill=(22, 19, 17), font=font_title)
    
    # Ratings & Social Proof
    font_rating = get_font(24, bold=True)
    draw.text((60, info_y + 55), f"RATING {product['rating']} / 5.0  *  ({product['reviews']} Verified Reviews)", fill=(217, 119, 6), font=font_rating)
    
    # Pricing
    font_price = get_font(52, bold=True)
    font_comp = get_font(32, bold=False)
    price_str = f"Rs. {product['price_inr']:,}"
    comp_str = f"Rs. {product['compare_at']:,}"
    
    draw.text((width - 360, info_y), price_str, fill=(255, 77, 36), font=font_price)
    draw.text((width - 360, info_y + 60), comp_str, fill=(160, 150, 140), font=font_comp)
    # Strike through compare price
    draw.line([(width - 365, info_y + 78), (width - 240, info_y + 78)], fill=(160, 150, 140), width=3)
    
    # 4. Trust Guarantee Strip
    draw.line([(60, info_y + 120), (width - 60, info_y + 120)], fill=(235, 228, 218), width=2)
    font_trust = get_font(22, bold=True)
    trust_text = "PAN-INDIA EXPRESS COURIER   *   CASH ON DELIVERY   *   30-DAY ZERO-RISK RETURNS"
    draw.text((70, info_y + 138), trust_text, fill=(70, 60, 50), font=font_trust)
    
    # 5. Bottom Call-To-Action Banner
    draw.rectangle([0, height - 75, width, height], fill=(29, 29, 31))
    font_cta = get_font(24, bold=True)
    cta_text = "Tap Link in Bio to Order  |  rareember-store.vercel.app"
    draw.text((width // 2 - 270, height - 52), cta_text, fill=(255, 255, 255), font=font_cta)
    
    # Save Image
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_filename = f"post_{product['id']}_{timestamp}.jpg"
    out_path = os.path.join(OUTPUT_DIR, out_filename)
    base.save(out_path, quality=95)
    print(f"✅ Rendered post image: {out_path}")
    return out_path

def generate_caption(product):
    discount_pct = int(round((1 - (product["price_inr"] / product["compare_at"])) * 100))
    bullets = "\n".join([f"✨ {feat}" for feat in product["features"]])
    
    caption = f"""{product['hook']}

Meet the {product['title']} — now in stock at RareEmber.

{bullets}

🔥 Special Launch Price: ₹{product['price_inr']:,} (Save {discount_pct}% OFF)
★ {product['rating']}/5.0 based on {product['reviews']}+ customer reviews.

🚚 Pan-India Express Delivery (2–3 Days)
💵 Cash on Delivery (COD) Available
🛡️ 30-Day Zero-Questions Return & Refund Guarantee

🛒 HOW TO ORDER:
Tap the link in our bio (@rareember) or visit rareember-store.vercel.app directly to order yours before this drop sells out!

#rareember #trendingproducts #coolgadgets #amazonfindsindia #viralfinds #curatedstyle #onlineclothingstore #indianstartups #cashondelivery #dropshippingindia #homeaesthetic #desksetup #expressdelivery #musthaves"""
    return caption

def send_telegram_alert(photo_path, caption_summary):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
    try:
        with open(photo_path, "rb") as f:
            data = {
                "chat_id": TELEGRAM_CHAT_ID,
                "caption": f"🚀 *RareEmber Instagram Autopilot*\n\n{caption_summary}",
                "parse_mode": "Markdown"
            }
            resp = requests.post(url, data=data, files={"photo": f}, timeout=15)
            if resp.status_code == 200:
                print("📲 Telegram alert delivered to Ajay successfully.")
    except Exception as e:
        print(f"Telegram alert error: {e}")

def post_to_instagram(photo_path, caption):
    """Logs into Instagram using instagrapi and publishes the photo."""
    if not IG_USERNAME or not IG_PASSWORD:
        print("\n⚠️  IG_USERNAME or IG_PASSWORD not set in .env!")
        print("    Run in --dry-run mode or update .env with your credentials.")
        return False
        
    try:
        from instagrapi import Client
        cl = Client()
        cl.delay_range = [2, 5]
        # Bypass deprecated Meta internal experiments endpoint that returns 404
        cl.expose = lambda *args, **kwargs: True
        
        # Reuse existing session if available
        if os.path.exists(SESSION_FILE):
            print("🔑 Loading saved Instagram session...")
            try:
                cl.load_settings(SESSION_FILE)
            except Exception:
                pass
                
        if IG_SESSIONID:
            print("🔑 Authenticating via Instagram sessionid cookie...")
            cl.login_by_sessionid(IG_SESSIONID)
        else:
            print(f"🔐 Logging in as @{IG_USERNAME}...")
            cl.login(IG_USERNAME, IG_PASSWORD)
        cl.dump_settings(SESSION_FILE)
        print("✅ Login authenticated successfully!")
        
        print("📤 Uploading photo to Instagram feed...")
        media = cl.photo_upload(photo_path, caption=caption)
        print(f"🎉 SUCCESS! Published to Instagram. Media ID: {media.pk}")
        return True
    except Exception as e:
        print(f"❌ Instagram upload error: {e}")
        return False

def run_autopilot_cycle(dry_run=False):
    print("=" * 60)
    print(f"🚀 RAREEMBER INSTAGRAM AUTOPILOT CYCLE | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    product = pick_next_product()
    print(f"📦 Selected Product: {product['title']} (ID: {product['id']})")
    
    # 1. Render Post Image
    image_path = render_post_image(product)
    
    # 2. Generate Caption
    caption = generate_caption(product)
    
    # 3. Post or Dry Run
    if dry_run:
        print("\n[DRY RUN MODE ACTIVE]")
        print("📝 Generated Caption:\n" + "-" * 40)
        print(caption)
        print("-" * 40)
        print(f"🖼️ Creative Image Saved at: {image_path}")
        send_telegram_alert(image_path, f"📸 *Dry-Run Preview Ready for Approval!*\n\n*Product:* {product['title']}\n*Price:* ₹{product['price_inr']:,}\n*Status:* Post creative rendered and ready.")
        return True
    else:
        success = post_to_instagram(image_path, caption)
        if success:
            history = load_history()
            history.append({
                "id": product["id"],
                "title": product["title"],
                "posted_at": datetime.now(timezone.utc).isoformat(),
                "image_path": image_path
            })
            save_history(history)
            send_telegram_alert(image_path, f"✅ *Successfully Auto-Posted to Instagram!*\n\n*Product:* {product['title']}\n*Price:* ₹{product['price_inr']:,}\n*Status:* Live on feed with hashtags and bio link.")
            return True
        return False

def main():
    parser = argparse.ArgumentParser(description="RareEmber Instagram Autopilot")
    parser.add_argument("--dry-run", action="store_true", help="Generate post and send preview to Telegram without uploading to IG")
    parser.add_argument("--daemon", action="store_true", help="Run continuously in background, auto-posting at set intervals")
    parser.add_argument("--interval-hours", type=float, default=12.0, help="Posting interval in hours for daemon mode (default: 12)")
    args = parser.parse_args()
    
    if args.daemon:
        print(f"🔄 Daemon Mode Started: Posting every {args.interval_hours} hours...")
        while True:
            try:
                run_autopilot_cycle(dry_run=args.dry_run)
            except Exception as e:
                print(f"Cycle execution error: {e}")
            sleep_secs = int(args.interval_hours * 3600)
            print(f"⏳ Sleeping for {args.interval_hours} hours until next post...")
            time.sleep(sleep_secs)
    else:
        run_autopilot_cycle(dry_run=args.dry_run)

if __name__ == "__main__":
    main()
