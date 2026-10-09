"""
3D Pixar Animated Dialogue Reel Pipeline Engine
100% Free Autonomous Multi-Character Reel Creation (Edge-TTS + FFmpeg + n8n Compatible)

Architecture:
1. Structured Script Generation (Gemini / Groq / Curated JSON)
2. Neural Spoken Voiceover (Edge-TTS 100% Free: Madhur & Swara / Guy & Jenny)
3. Consistent 3D Pixar Avatars (Pre-rendered 9:16 vertical character portraits)
4. Dynamic Scene & Angle Switching (Alternate camera angles every 2-4 seconds)
5. Bold Kinetic Subtitles & Lo-Fi Audio Mix (FFmpeg assembly)
"""

import os
import sys
import json
import time
import math
import struct
import wave
import tempfile
import argparse
import subprocess
import requests
from io import BytesIO
from datetime import datetime, timezone
from PIL import Image, ImageDraw, ImageFont

# Set UTF-8 encoding
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AVATARS_DIR = os.path.join(BASE_DIR, "assets", "avatars")
OUTPUT_DIR = os.path.join(BASE_DIR, "generated_posts")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(AVATARS_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────
# 1. STRUCTURED DIALOGUE SCRIPT GENERATION
# ─────────────────────────────────────────────────────────────

FALLBACK_SCRIPTS = [
    {
        "id": "mall_price_debate",
        "theme": "🍋 Gappu vs Pappu • Mall Showroom Price Exposed",
        "scenes": [
            {
                "character": "A",
                "speaker": "Gappu (Mentor)",
                "voice": "hi-IN-MadhurNeural",
                "avatar_key": "char_a",
                "scene_type": "character_a",
                "hindi": "अरे भाई! मैंने मॉल से ₹{compare_at} में ये लिया, मस्त है ना?",
                "sub": "Bro! I bought this from mall showroom for Rs. {compare_at}!",
                "keywords": ["मॉल", "₹{compare_at}", "mall", "Rs. {compare_at}"]
            },
            {
                "character": "B",
                "speaker": "Pappu (Friend)",
                "voice": "hi-IN-SwaraNeural",
                "avatar_key": "char_b",
                "scene_type": "character_b",
                "hindi": "अरे भाई तू तो लुट गया! RareEmber पे यही डायरेक्ट फैक्ट्री से सिर्फ ₹{price_inr} में मिल रहा है!",
                "sub": "Bro you got robbed! Same item on RareEmber is only Rs. {price_inr}!",
                "keywords": ["RareEmber", "₹{price_inr}", "Rs. {price_inr}", "फैक्ट्री"]
            },
            {
                "character": "A",
                "speaker": "Gappu (Mentor)",
                "voice": "hi-IN-MadhurNeural",
                "avatar_key": "char_a",
                "scene_type": "character_a",
                "hindi": "क्या बात कर रहा है?! सच में? पर क्वालिटी कैसी है भाई?",
                "sub": "Really?! But how is the build quality?",
                "keywords": ["क्वालिटी", "quality", "सच में"]
            },
            {
                "character": "B",
                "speaker": "Pappu (Friend)",
                "voice": "hi-IN-SwaraNeural",
                "avatar_key": "char_b",
                "scene_type": "product_showcase",
                "hindi": "अरे 4.9 स्टार रेटिंग है, 30 दिन की रिप्लेसमेंट गारंटी और कैश ऑन डिलीवरी भी!",
                "sub": "4.9 star rating, 30-day guarantee and Cash on Delivery too!",
                "keywords": ["4.9 स्टार", "कैश ऑन डिलीवरी", "Cash on Delivery", "COD"]
            },
            {
                "character": "Both",
                "speaker": "Both Friends",
                "voice": "hi-IN-MadhurNeural",
                "avatar_key": "char_celebrate",
                "scene_type": "viral_cta",
                "hindi": "तो देर मत करो, अभी कमेंट करो BUY या बायो में लिंक पे क्लिक करो!",
                "sub": "Comment 'BUY' right now or tap the link in bio!",
                "keywords": ["BUY", "कमेंट", "Comment", "बायो में लिंक"]
            }
        ]
    },
    {
        "id": "clutter_life_hack",
        "theme": "⚡ Chintu vs Mintu • Setup Life Hack",
        "scenes": [
            {
                "character": "A",
                "speaker": "Chintu",
                "voice": "hi-IN-MadhurNeural",
                "avatar_key": "char_a",
                "scene_type": "character_a",
                "hindi": "यार दिनभर काम करके सिरदर्द और कमरे में सारा बिखराव फैल गया है!",
                "sub": "Bro, desk clutter and mess is driving me crazy!",
                "keywords": ["सिरदर्द", "बिखराव", "clutter", "mess"]
            },
            {
                "character": "B",
                "speaker": "Mintu",
                "voice": "hi-IN-SwaraNeural",
                "avatar_key": "char_b",
                "scene_type": "character_b",
                "hindi": "अरे तो RareEmber से ये स्मार्ट अपग्रेड क्यों नहीं मंगाया? एक झटके में पूरा सेटअप बदल देगा!",
                "sub": "Why didn't you get this RareEmber smart drop? Instant life upgrade!",
                "keywords": ["RareEmber", "स्मार्ट अपग्रेड", "smart drop", "upgrade"]
            },
            {
                "character": "A",
                "speaker": "Chintu",
                "voice": "hi-IN-MadhurNeural",
                "avatar_key": "char_a",
                "scene_type": "character_a",
                "hindi": "अरे बहुत महंगा होगा भाई, मेरा तो टाइट बजट है!",
                "sub": "Must be super expensive bro, I am on a budget!",
                "keywords": ["महंगा", "बजट", "expensive", "budget"]
            },
            {
                "character": "B",
                "speaker": "Mintu",
                "voice": "hi-IN-SwaraNeural",
                "avatar_key": "char_b",
                "scene_type": "product_showcase",
                "hindi": "अरे सिर्फ ₹{price_inr} का है! M.R.P. ₹{compare_at} था, सीधा ₹{saving_inr} की बचत!",
                "sub": "Only Rs. {price_inr}! You save Rs. {saving_inr} today!",
                "keywords": ["₹{price_inr}", "₹{saving_inr}", "बचत", "Rs. {price_inr}"]
            },
            {
                "character": "Both",
                "speaker": "Both Friends",
                "voice": "hi-IN-MadhurNeural",
                "avatar_key": "char_celebrate",
                "scene_type": "viral_cta",
                "hindi": "कमेंट करो LINK तुरंत डिस्काउंट कूपन के साथ 1-क्लिक COD पर!",
                "sub": "Comment 'LINK' for instant 1-Click Cash on Delivery link!",
                "keywords": ["LINK", "कूपन", "COD", "Cash on Delivery"]
            }
        ]
    }
]

def generate_dialogue_script(product, custom_prompt=None):
    """
    Returns structured dialogue scenes for the product.
    Can be called with an external LLM JSON output or falls back to curated viral templates.
    """
    saving_inr = product.get("compare_at", 1499) - product.get("price_inr", 799)
    chosen = FALLBACK_SCRIPTS[abs(hash(product.get("id", "reel"))) % len(FALLBACK_SCRIPTS)]
    
    formatted_scenes = []
    for s in chosen["scenes"]:
        item = dict(s)
        item["hindi"] = item["hindi"].format(
            compare_at=f"{product.get('compare_at', 1499):,}",
            price_inr=f"{product.get('price_inr', 799):,}",
            saving_inr=f"{saving_inr:,}"
        )
        item["sub"] = item["sub"].format(
            compare_at=f"{product.get('compare_at', 1499):,}",
            price_inr=f"{product.get('price_inr', 799):,}",
            saving_inr=f"{saving_inr:,}"
        )
        formatted_scenes.append(item)
        
    return {
        "theme": chosen["theme"],
        "scenes": formatted_scenes
    }

# ─────────────────────────────────────────────────────────────
# 2. NEURAL SPEECH SYNTHESIS (EDGE-TTS 100% FREE)
# ─────────────────────────────────────────────────────────────

def synthesize_voice(text, voice_name, output_path):
    """
    Synthesizes natural, emotive spoken speech using Edge-TTS.
    ThreadedResolver bypasses DNS socket limitations on Windows/containers.
    """
    try:
        import asyncio
        import aiohttp.connector
        import aiohttp.resolver
        import edge_tts
        aiohttp.connector.DefaultResolver = aiohttp.resolver.ThreadedResolver
        asyncio.run(edge_tts.Communicate(text, voice_name).save(output_path))
        if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
            return True
    except Exception as e:
        print(f"Notice: Edge-TTS synthesis ({voice_name}) fallback notice: {e}")

    # Fallback to gTTS if offline
    try:
        from gtts import gTTS
        tts = gTTS(text, lang="hi")
        tts.save(output_path)
        return True
    except Exception as ge:
        print(f"TTS fallback error: {ge}")
        return False

def get_audio_duration(file_path):
    """Returns audio file duration in seconds via ffprobe."""
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return float(res.stdout.strip())
    except Exception:
        return 3.5

# ─────────────────────────────────────────────────────────────
# 3. BACKGROUND MUSIC BED & FONTS
# ─────────────────────────────────────────────────────────────

def generate_lofi_music(out_wav_path, duration_sec=16.0):
    """Generates an upbeat lo-fi chillhop background track in pure Python."""
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

def get_font(size, bold=False):
    candidate_fonts = [
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
    ]
    for p in candidate_fonts:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

# ─────────────────────────────────────────────────────────────
# 4. FULL REEL COMPOSITION & RENDERING (FFMPEG)
# ─────────────────────────────────────────────────────────────

def render_pipeline_reel(product, script_override=None, output_path=None):
    """
    Renders the complete 1080x1920 3D Pixar animated dialogue reel video.
    """
    width = 1080
    height = 1920
    discount_pct = int(round((1 - (product.get("price_inr", 799) / product.get("compare_at", 1499))) * 100))
    saving_inr = product.get("compare_at", 1499) - product.get("price_inr", 799)
    
    script_data = script_override or generate_dialogue_script(product)
    theme = script_data.get("theme", "RareEmber Trending Drop")
    scenes = script_data.get("scenes", [])
    
    # Load 3D Character Avatars
    avatars = {}
    for key, fname in [("char_a", "char_a.jpg"), ("char_b", "char_b.jpg"), ("char_celebrate", "char_celebrate.jpg")]:
        pth = os.path.join(AVATARS_DIR, fname)
        if os.path.exists(pth):
            try:
                avatars[key] = Image.open(pth).convert("RGB")
            except Exception:
                pass
                
    # Fetch Product Image
    img_url = product.get("image_url", "")
    try:
        resp = requests.get(img_url, timeout=10)
        prod_img = Image.open(BytesIO(resp.content)).convert("RGB")
    except Exception:
        prod_img = Image.new("RGB", (900, 900), color=(240, 240, 240))
        
    prod_square = prod_img.resize((820, 820), Image.Resampling.LANCZOS)
    
    # Fonts
    font_brand = get_font(44, bold=True)
    font_sub = get_font(26, bold=False)
    font_badge = get_font(30, bold=True)
    font_dialogue_hi = get_font(38, bold=True)
    font_dialogue_en = get_font(24, bold=False)
    font_price = get_font(58, bold=True)
    font_btn = get_font(36, bold=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        scene_video_clips = []
        dialogue_audio_clips = []
        
        # 1. RENDER EACH SCENE
        for idx, scene in enumerate(scenes):
            speaker = scene.get("speaker", "Speaker")
            voice_name = scene.get("voice", "hi-IN-MadhurNeural")
            hi_text = scene.get("hindi", "")
            en_sub = scene.get("sub", "")
            scene_type = scene.get("scene_type", "character_a")
            
            # Synthesize Audio
            dialogue_audio = os.path.join(tmpdir, f"dialogue_{idx}.mp3")
            synthesize_voice(hi_text, voice_name, dialogue_audio)
            duration = max(3.0, get_audio_duration(dialogue_audio) + 0.35)
            dialogue_audio_clips.append(dialogue_audio)
            
            # Compose 1080x1920 Frame
            frame = Image.new("RGB", (width, height), color=(15, 23, 42))
            draw = ImageDraw.Draw(frame)
            
            # Top Brand Header
            draw.rectangle([0, 0, width, 160], fill=(10, 15, 30))
            draw.text((70, 50), "rareember.", fill=(255, 255, 255), font=font_brand)
            draw.ellipse([325, 70, 345, 90], fill=(255, 107, 53))
            draw.text((70, 105), theme.upper(), fill=(255, 184, 0), font=font_sub)
            draw.rounded_rectangle([width - 440, 50, width - 60, 115], radius=26, fill=(255, 107, 53))
            draw.text((width - 410, 68), "DIWALI SALE ⚡", fill=(255, 255, 255), font=get_font(20, bold=True))
            
            # Center Visual Content
            if scene_type == "character_a" and "char_a" in avatars:
                av = avatars["char_a"]
                av_w, av_h = av.size
                scale = width / av_w
                av_scaled = av.resize((width, int(av_h * scale)), Image.Resampling.LANCZOS)
                frame.paste(av_scaled, (0, 160))
                draw.rounded_rectangle([60, 190, 420, 255], radius=24, fill=(30, 58, 138), outline=(96, 165, 250), width=2)
                draw.text((85, 205), f"🗣️ {speaker.upper()} SPEAKS", fill=(255, 255, 255), font=font_badge)
                
            elif scene_type == "character_b" and "char_b" in avatars:
                av = avatars["char_b"]
                av_w, av_h = av.size
                scale = width / av_w
                av_scaled = av.resize((width, int(av_h * scale)), Image.Resampling.LANCZOS)
                frame.paste(av_scaled, (0, 160))
                draw.rounded_rectangle([60, 190, 420, 255], radius=24, fill=(5, 150, 105), outline=(110, 231, 183), width=2)
                draw.text((85, 205), f"🗣️ {speaker.upper()} SPEAKS", fill=(255, 255, 255), font=font_badge)
                
            elif scene_type == "product_showcase":
                draw.rounded_rectangle([80, 220, width - 80, 1180], radius=36, fill=(24, 30, 48), outline=(52, 211, 153), width=4)
                frame.paste(prod_square, (130, 260))
                draw.rounded_rectangle([120, 240, 520, 295], radius=20, fill=(15, 23, 42), outline=(255, 184, 0), width=2)
                draw.text((140, 252), "⭐ 4.9 RATED • PAN-INDIA BESTSELLER", fill=(255, 184, 0), font=get_font(20, bold=True))
                draw.rounded_rectangle([110, 1110, width - 110, 1240], radius=26, fill=(16, 185, 129))
                draw.text((150, 1130), f"⚡ Factory Direct: Rs. {product.get('price_inr', 799):,}", fill=(255, 255, 255), font=font_price)
                draw.text((150, 1200), f"M.R.P. Rs. {product.get('compare_at', 1499):,} • Save Rs. {saving_inr:,} ({discount_pct}% OFF)", fill=(255, 255, 255), font=font_sub)
                
            elif scene_type == "viral_cta" and "char_celebrate" in avatars:
                av = avatars["char_celebrate"]
                av_w, av_h = av.size
                scale = width / av_w
                av_scaled = av.resize((width, int(av_h * scale)), Image.Resampling.LANCZOS)
                frame.paste(av_scaled, (0, 160))
                draw.rounded_rectangle([80, 800, width - 80, 1200], radius=32, fill=(249, 115, 22), outline=(255, 237, 213), width=4)
                draw.text((130, 830), "🪔 SPECIAL LAUNCH COUPON", fill=(255, 255, 255), font=font_badge)
                draw.text((130, 890), "CODE: DIWALI100", fill=(255, 255, 255), font=get_font(52, bold=True))
                draw.text((130, 970), "Instant Extra Discount • Pan-India Free Delivery", fill=(255, 255, 255), font=font_sub)
                draw.text((130, 1030), "🚚 Express 2-4 Days Dispatch (BlueDart & Delhivery)", fill=(255, 255, 255), font=font_sub)
                draw.text((130, 1080), "💵 100% Cash on Delivery (COD) Available", fill=(255, 255, 255), font=font_sub)
            else:
                frame.paste(prod_square, (130, 280))

            # Subtitle Bubble
            draw.rounded_rectangle([50, 1330, width - 50, 1660], radius=32, fill=(10, 15, 30), outline=(255, 107, 53), width=3)
            draw.text((80, 1365), hi_text[:46], fill=(255, 255, 255), font=font_dialogue_hi)
            if len(hi_text) > 46:
                draw.text((80, 1425), hi_text[46:92], fill=(255, 255, 255), font=font_dialogue_hi)
            draw.text((80, 1505), f"\"{en_sub[:54]}\"", fill=(255, 215, 0), font=font_dialogue_en)
            if len(en_sub) > 54:
                draw.text((80, 1550), f"\"{en_sub[54:108]}\"", fill=(255, 215, 0), font=font_dialogue_en)
            draw.text((80, 1610), "⚡ Free Pan-India Delivery • 100% Cash on Delivery", fill=(52, 211, 153), font=get_font(22, bold=True))
            
            # Action CTA Button
            draw.rounded_rectangle([60, 1690, width - 60, 1810], radius=38, fill=(255, 107, 53))
            draw.text((150, 1735), "COMMENT \"BUY\" FOR 1-CLICK COD LINK ⚡", fill=(255, 255, 255), font=font_btn)
            draw.text((width // 2 - 220, 1845), "rareember-store.vercel.app  •  @rareember", fill=(148, 163, 184), font=font_sub)
            
            frame_path = os.path.join(tmpdir, f"frame_{idx}.jpg")
            frame.save(frame_path, quality=95)
            
            # FFmpeg Clip Motion
            clip_path = os.path.join(tmpdir, f"clip_{idx}.mp4")
            if scene_type == "character_a":
                zoom_filter = "zoompan=z='min(zoom+0.0010,1.06)':d=30:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30"
            elif scene_type == "character_b":
                zoom_filter = "zoompan=z='min(zoom+0.0012,1.07)':d=30:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30"
            elif scene_type == "product_showcase":
                zoom_filter = "zoompan=z='min(zoom+0.0008,1.05)':d=30:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30"
            else:
                zoom_filter = "zoompan=z='min(zoom+0.0009,1.05)':d=30:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30"
                
            cmd_clip = [
                "ffmpeg", "-y", "-loop", "1", "-i", frame_path,
                "-vf", zoom_filter,
                "-t", str(round(duration, 2)),
                "-c:v", "libx264", "-pix_fmt", "yuv420p", clip_path
            ]
            subprocess.run(cmd_clip, cwd=tmpdir, capture_output=True)
            if os.path.exists(clip_path):
                scene_video_clips.append(clip_path)

        # 2. CONCATENATE CLIPS
        v_concat = os.path.join(tmpdir, "v_concat.txt")
        with open(v_concat, "w") as vf:
            for c in scene_video_clips:
                vf.write(f"file '{c}'\n")
                
        a_concat = os.path.join(tmpdir, "a_concat.txt")
        with open(a_concat, "w") as af:
            for a in dialogue_audio_clips:
                af.write(f"file '{a}'\n")
                
        merged_v = os.path.join(tmpdir, "merged_v.mp4")
        merged_a = os.path.join(tmpdir, "merged_a.mp3")
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", v_concat, "-c", "copy", merged_v], capture_output=True)
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", a_concat, "-c", "copy", merged_a], capture_output=True)
        
        total_duration = get_audio_duration(merged_a)
        
        # 3. BACKGROUND MUSIC BED (-18dB)
        bg_wav = os.path.join(tmpdir, "bg_lofi.wav")
        generate_lofi_music(bg_wav, duration_sec=total_duration + 1.0)
        
        mixed_a = os.path.join(tmpdir, "final_a.mp3")
        subprocess.run([
            "ffmpeg", "-y", "-i", merged_a, "-i", bg_wav,
            "-filter_complex", "[0:a]volume=1.0[voice];[1:a]volume=0.18[bg];[voice][bg]amix=inputs=2:duration=first[out]",
            "-map", "[out]", mixed_a
        ], capture_output=True)
        
        # 4. FINAL PROGRESS BAR MUX
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        target_path = output_path or os.path.join(OUTPUT_DIR, f"reel_{product.get('id', 'prod')}_{timestamp}.mp4")
        
        cmd_final = [
            "ffmpeg", "-y", "-i", merged_v, "-i", mixed_a,
            "-vf", f"drawbox=x=0:y=1905:w='iw*t/{total_duration}':h=15:color=0xFF6B35@1:t=fill",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest", target_path
        ]
        res = subprocess.run(cmd_final, cwd=tmpdir, capture_output=True)
        if res.returncode == 0 and os.path.exists(target_path):
            return target_path
        return None

# ─────────────────────────────────────────────────────────────
# 5. CLI INTERFACE
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="3D Pixar Dialogue Reel Engine")
    parser.add_argument("--product-json", type=str, help="Product data JSON file or string")
    parser.add_argument("--script-json", type=str, help="Custom LLM generated dialogue script JSON file")
    parser.add_argument("--output", type=str, help="Output MP4 file path")
    args = parser.parse_args()

    prod_data = {
        "id": "demo-smart-product",
        "title": "Smart Ambient Ultrasonic Flame Diffuser",
        "price_inr": 899,
        "compare_at": 1999,
        "image_url": "https://rareember-store.vercel.app/images/flame-diffuser.jpg"
    }

    if args.product_json:
        if os.path.exists(args.product_json):
            with open(args.product_json, "r", encoding="utf-8") as f:
                prod_data = json.load(f)
        else:
            try:
                prod_data = json.loads(args.product_json)
            except Exception:
                pass

    script_override = None
    if args.script_json and os.path.exists(args.script_json):
        with open(args.script_json, "r", encoding="utf-8") as f:
            script_override = json.load(f)

    print(f"🎬 Starting 3D Pixar Reel Generation for: {prod_data.get('title')}")
    out = render_pipeline_reel(prod_data, script_override=script_override, output_path=args.output)
    if out:
        size_mb = round(os.path.getsize(out) / (1024 * 1024), 2)
        print(f"✅ Generated 3D Pixar Dialogue Reel: {out} ({size_mb} MB)")
    else:
        print("❌ Error generating reel video.")
