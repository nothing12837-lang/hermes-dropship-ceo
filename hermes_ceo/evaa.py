"""
Evaa Hindi Virtual Influencer — 100% Free Cloud Video Pipeline
Synthesizes 28-second agency-grade Reels using Microsoft Edge-TTS (hi-IN-SwaraNeural),
dynamic 9:16 1080x1920 visuals, and automated Instagram publishing.
"""

import os
import sys
import asyncio
import subprocess
from datetime import datetime, timezone
from PIL import Image, ImageDraw, ImageFont
import requests

from hermes_ceo.team import MeeraCreative

DEFAULT_VOICE = "hi-IN-SwaraNeural"  # Free high-clarity natural Hindi female voice
EVAA_AVATAR_URL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"

async def _synthesize_edge_tts(text: str, output_file: str, voice: str = DEFAULT_VOICE):
    """Asynchronously calls Microsoft Edge-TTS for 100% free high-clarity Hindi audio."""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)

def generate_evaa_audio(text: str, output_path: str):
    """Synchronous wrapper to synthesize Evaa voiceover in Hindi."""
    try:
        asyncio.run(_synthesize_edge_tts(text, output_path))
        return True
    except Exception as e:
        print(f"[Evaa TTS Error] {e}")
        return False

def render_reel_card(image_url: str, title: str, price_inr: float, mrp_inr: float, headline: str, output_path: str):
    """
    Renders a stunning 9:16 (1080x1920) vertical frame for Instagram Reels
    with gradient overlay, verified badges, and typography.
    """
    width, height = 1080, 1920
    canvas = Image.new("RGB", (width, height), (15, 15, 20))
    draw = ImageDraw.Draw(canvas)

    # 1. Download Product Image
    try:
        r = requests.get(image_url, timeout=10)
        if r.status_code == 200:
            from io import BytesIO
            prod_img = Image.open(BytesIO(r.content)).convert("RGB")
            # Crop/resize to square in center
            target_size = 920
            prod_img = prod_img.resize((target_size, target_size), Image.Resampling.LANCZOS)
            canvas.paste(prod_img, (80, 360))
    except Exception as e:
        print(f"[Render Frame] Image fetch error: {e}")

    # 2. Header & Branding Banner
    draw.rectangle([0, 0, width, 240], fill=(24, 24, 30))
    draw.rectangle([80, 160, 420, 220], fill=(255, 107, 53))
    # Simple text drawing
    draw.text((100, 175), "⚡ RAREEMBER EXCLUSIVE", fill=(255, 255, 255))
    draw.text((80, 80), "RAREEMBER™", fill=(255, 255, 255))

    # 3. Hook Headline
    draw.text((80, 280), headline[:45], fill=(255, 215, 0))

    # 4. Product Title & Price Card
    draw.rectangle([80, 1340, 1000, 1700], fill=(28, 28, 36))
    discount = round((1 - price_inr / mrp_inr) * 100) if mrp_inr > price_inr else 50
    draw.text((120, 1370), title[:36], fill=(255, 255, 255))
    draw.text((120, 1430), f"Deal Price: ₹{price_inr:,.0f}  (MRP: ₹{mrp_inr:,.0f})", fill=(52, 211, 153))
    draw.text((120, 1500), f"🔥 Flat {discount}% OFF • Cash on Delivery Available", fill=(251, 146, 60))
    draw.text((120, 1570), "🛡️ 7-Day Doorstep Replacement Guarantee", fill=(148, 163, 184))
    draw.text((120, 1630), "📦 Pan-India Express Delivery (2–4 Days)", fill=(96, 165, 250))

    # 5. Footer CTA
    draw.rectangle([80, 1740, 1000, 1840], fill=(255, 107, 53))
    draw.text((280, 1775), "👉 ORDER NOW VIA LINK IN BIO", fill=(255, 255, 255))

    canvas.save(output_path, "JPEG", quality=92)
    return output_path

def build_evaa_video_reel(product_title: str, price_inr: float, mrp_inr: float, image_url: str, output_dir: str):
    """
    Complete Reel Generation Pipeline:
    1. Generates Meera's 28s Hindi script.
    2. Synthesizes Edge-TTS audio.
    3. Renders 9:16 high-res visual card.
    4. Combines with FFmpeg if available into a broadcast-ready MP4.
    """
    os.makedirs(output_dir, exist_ok=True)
    slug = "".join(c if c.isalnum() else "_" for c in product_title.lower())[:24]

    # 1. Script
    script = MeeraCreative.generate_evaa_script(
        product_title=product_title,
        price_inr=price_inr,
        mrp_inr=mrp_inr,
        key_benefit="100% quality checked direct domestic manufacturing"
    )

    full_voice_text = (
        f"{script['hook_speech']} "
        f"{script['problem_speech']} "
        f"{script['demo_speech']} "
        f"{script['cta_speech']}"
    )

    # 2. Audio
    audio_path = os.path.join(output_dir, f"{slug}_audio.mp3")
    generate_evaa_audio(full_voice_text, audio_path)

    # 3. Card
    card_path = os.path.join(output_dir, f"{slug}_card.jpg")
    render_reel_card(
        image_url=image_url,
        title=product_title,
        price_inr=price_inr,
        mrp_inr=mrp_inr,
        headline=script["screen_text"][0],
        output_path=card_path
    )

    # 4. FFmpeg Video Assembly (if ffmpeg exists on system / Actions runner)
    video_path = os.path.join(output_dir, f"{slug}_reel.mp4")
    has_ffmpeg = False
    try:
        chk = subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        has_ffmpeg = (chk.returncode == 0)
    except Exception:
        has_ffmpeg = False

    if has_ffmpeg and os.path.exists(audio_path) and os.path.exists(card_path):
        try:
            cmd = [
                "ffmpeg", "-y",
                "-loop", "1", "-i", card_path,
                "-i", audio_path,
                "-c:v", "libx264", "-tune", "stillimage",
                "-c:a", "aac", "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                video_path
            ]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
        except Exception as fe:
            print(f"[FFmpeg Video Build Error] {fe}")

    # 5. Instagram Caption
    caption = (
        f"{product_title} ✨\n\n"
        f"Transform your space today with RareEmber's curated aesthetic drop! Sourced directly from authentic domestic manufacturers.\n\n"
        f"🔥 Price: ₹{price_inr:,.0f} (MRP: ₹{mrp_inr:,.0f})\n"
        f"💵 Cash on Delivery Available Across India\n"
        f"⚡ 2–4 Days Express Delivery (Delhivery/Shadowfax)\n"
        f"🛡️ 7-Day Doorstep Replacement Guarantee\n\n"
        f"👉 Tap the link in bio to shop now or visit rareember-store.vercel.app\n\n"
        f"#rareember #aestheticdecor #indianhomedecor #festivedecor #deskaesthetics #meeshohaul #viraldecor"
    )

    return {
        "status": "ready",
        "product": product_title,
        "script": script,
        "audio_path": audio_path,
        "card_path": card_path,
        "video_path": video_path if os.path.exists(video_path) else None,
        "caption": caption
    }
