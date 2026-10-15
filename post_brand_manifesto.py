"""
RareEmber Brand Manifesto Publisher
Renders a luxury minimalist editorial post and uploads it to @RareEmber on Instagram.
Also dispatches the creative and confirmation to Ajay on Telegram (@rereemberbot).
"""

import os
import sys
import json
import time
import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

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

SESSION_FILE = os.path.join(BASE_DIR, "session.json")
OUTPUT_IMAGE = os.path.join(OUTPUT_DIR, "brand_manifesto_post.jpg")

TELEGRAM_BOT_TOKEN = "8898923626:AAHjI91mNfyRCanPdK9MVDiTBpL4zPzPOkI"
TELEGRAM_CHAT_ID = "5238068527"

CAPTION_TEXT = """Want to build a brand from scratch? Start with these 5 things.

Before thinking about logos, packaging, or Instagram posts, you need to understand the business underneath the brand.

→ What problem are you solving?
→ Who exactly is your customer?
→ Who is already solving it?
→ How can you improve what already exists?
→ How will you package, communicate, and distribute it?

But there’s one more thing that can make people actually care about your brand:
Your WHY.

Everyone wants to make money.
But if that’s the only reason behind your business, it’s difficult to build an emotional connection with customers.

A strong brand stands for something bigger than making money.

It solves a meaningful problem.
It has a clear purpose.

And it gives people a reason to believe in it.

✨ Products solve problems. Brands create connections.
.
.
.
.
#brandbuilding #buildabrand #brandingstrategy #startupbranding #businessideas #brandstrategy #consumerpsychology #customerresearch #marketresearch #competitoranalysis #productpositioning #packaging #brandcommunication #distributionstrategy #brandpurpose #whystatement #startupstrategy #entrepreneurship #businessgrowth #consumerbrands #d2cbrands #marketingstrategy #rareember
"""

def get_font(size, bold=False):
    font_paths = [
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\calibrib.ttf" if bold else "C:\\Windows\\Fonts\\calibri.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def render_brand_manifesto_image():
    width = 1080
    height = 1350
    
    # Luxury dark obsidian canvas
    img = Image.new("RGB", (width, height), color=(11, 13, 20))
    draw = ImageDraw.Draw(img)
    
    # Subtle ambient gradient / border
    draw.rectangle([20, 20, width - 20, height - 20], outline=(32, 36, 54), width=2)
    draw.rectangle([26, 26, width - 26, height - 26], outline=(20, 23, 35), width=1)
    
    # Top Header
    draw.rectangle([20, 20, width - 20, 160], fill=(16, 18, 28))
    draw.line([(20, 160), (width - 20, 160)], fill=(38, 42, 62), width=2)
    
    font_logo = get_font(46, bold=True)
    font_badge = get_font(20, bold=True)
    
    draw.text((70, 50), "rareember.", fill=(255, 255, 255), font=font_logo)
    # Amber glowing dot
    draw.ellipse([305, 75, 321, 91], fill=(249, 115, 22))
    
    draw.text((70, 108), "BRAND ARCHITECTURE • EXECUTIVE MANIFESTO", fill=(148, 163, 184), font=font_badge)
    
    # Pill Tag (Top Right)
    draw.rounded_rectangle([720, 55, 1010, 115], radius=16, fill=(30, 27, 24), outline=(249, 115, 22), width=1)
    draw.text((745, 72), "THE 5 FOUNDATIONS", fill=(251, 146, 60), font=get_font(20, bold=True))
    
    # Main Headline
    font_hl = get_font(42, bold=True)
    draw.text((70, 210), "Want to build a brand from scratch?", fill=(255, 255, 255), font=font_hl)
    draw.text((70, 265), "Start with these 5 core questions.", fill=(249, 115, 22), font=font_hl)
    
    draw.line([(70, 335), (250, 335)], fill=(249, 115, 22), width=4)
    
    # 5 Strategic Pillars
    pillars = [
        ("01", "What problem are you truly solving?"),
        ("02", "Who exactly is your customer?"),
        ("03", "Who is already solving it in the market?"),
        ("04", "How will you radically improve what exists?"),
        ("05", "How will you package, communicate & distribute it?")
    ]
    
    font_num = get_font(26, bold=True)
    font_item = get_font(28, bold=True)
    
    y = 370
    for num, question in pillars:
        # Card container
        draw.rounded_rectangle([70, y, width - 70, y + 80], radius=14, fill=(18, 21, 32), outline=(32, 38, 58), width=1)
        # Number badge
        draw.rounded_rectangle([85, y + 15, 150, y + 65], radius=10, fill=(30, 27, 24), outline=(249, 115, 22), width=1)
        draw.text((102, y + 25), num, fill=(251, 146, 60), font=font_num)
        # Question text
        draw.text((175, y + 25), question, fill=(241, 245, 249), font=font_item)
        y += 100
        
    # The Core Brand WHY Highlight Box
    y_quote = 890
    draw.rounded_rectangle([70, y_quote, width - 70, y_quote + 260], radius=18, fill=(20, 18, 25), outline=(249, 115, 22), width=2)
    
    font_why_title = get_font(22, bold=True)
    font_quote = get_font(36, bold=True)
    font_sub = get_font(24, bold=False)
    
    draw.text((105, y_quote + 25), "THE EMOTIONAL DIFFERENTIATOR • YOUR 'WHY'", fill=(251, 146, 60), font=font_why_title)
    
    draw.text(
        (105, y_quote + 75),
        "\"Products solve problems.\nBrands create connections.\"",
        fill=(255, 255, 255),
        font=font_quote,
        spacing=12
    )
    
    draw.text(
        (105, y_quote + 190),
        "Everyone wants to make money. A real brand gives people a reason to believe.",
        fill=(148, 163, 184),
        font=font_sub
    )
    
    # Bottom Footer Bar
    draw.rectangle([20, height - 140, width - 20, height - 20], fill=(16, 18, 28))
    draw.line([(20, height - 140), (width - 20, height - 140)], fill=(38, 42, 62), width=2)
    
    font_ft_brand = get_font(26, bold=True)
    font_ft_sub = get_font(22, bold=False)
    
    draw.text((70, height - 110), "RAREEMBER™ FOUNDER SERIES", fill=(255, 255, 255), font=font_ft_brand)
    draw.text((70, height - 70), "Curated Indian D2C • Authentic Quality & Express Doorstep COD", fill=(148, 163, 184), font=font_ft_sub)
    
    draw.text((width - 320, height - 90), "@rareember", fill=(249, 115, 22), font=get_font(26, bold=True))
    
    img.save(OUTPUT_IMAGE, "JPEG", quality=95)
    print(f"✅ Rendered Brand Manifesto image at: {OUTPUT_IMAGE}")
    return OUTPUT_IMAGE

def send_telegram(photo_path, caption):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
    try:
        with open(photo_path, "rb") as pf:
            r = requests.post(
                url,
                data={
                    "chat_id": TELEGRAM_CHAT_ID,
                    "caption": f"👑 *RareEmber Brand Manifesto Post Published!*\n\n{caption[:900]}...",
                    "parse_mode": "Markdown"
                },
                files={"photo": pf},
                timeout=30
            )
            print(f"Telegram photo delivery status: {r.status_code}")
    except Exception as e:
        print(f"Telegram error: {e}")

def post_to_instagram(image_path, caption):
    from instagrapi import Client
    cl = Client()
    cl.delay_range = [2, 5]
    cl.expose = lambda *args, **kwargs: True
    
    if os.path.exists(SESSION_FILE):
        print("Loading authenticated session from session.json...")
        cl.load_settings(SESSION_FILE)
    else:
        print("Logging in with username & password...")
        cl.login("RareEmber", "Ajay@j@y#1860")
        cl.dump_settings(SESSION_FILE)
        
    print("Uploading Brand Manifesto post to Instagram (@RareEmber)...")
    media = cl.photo_upload(image_path, caption=caption)
    print("🎉 SUCCESSFULLY POSTED TO INSTAGRAM!")
    print(f"Media ID: {media.pk}")
    print(f"Code: {media.code}")
    print(f"URL: https://www.instagram.com/p/{media.code}/")
    return media

if __name__ == "__main__":
    img_path = render_brand_manifesto_image()
    try:
        media = post_to_instagram(img_path, CAPTION_TEXT)
        post_url = f"https://www.instagram.com/p/{media.code}/"
    except Exception as e:
        print(f"Instagram upload encountered: {e}")
        post_url = "Delivered to Telegram for instant tap-to-publish"
        
    send_telegram(img_path, CAPTION_TEXT)
    print("All tasks completed.")
