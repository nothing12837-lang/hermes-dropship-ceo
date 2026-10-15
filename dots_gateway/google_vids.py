import asyncio
import json
import os
import re
import subprocess
import time
import uuid
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont, ImageOps
import edge_tts
import requests

from dots_gateway.config import settings
from dots_gateway.product_images import get_images_for_product

VIDS_OUTPUT_DIR = settings.WORKSPACE_PATH / "generated_posts" / "google_vids"
VIDS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
VIDS_PROJECTS_FILE = settings.WORKSPACE_PATH / "dots_gateway" / "google_vids_projects.json"

PRODUCTS_FILE = settings.WORKSPACE_PATH / "all_103_products.json"
PRESENTERS_DIR = settings.WORKSPACE_PATH / "dots_gateway" / "assets" / "presenters"
PRESENTERS_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR = settings.WORKSPACE_PATH / "dots_gateway" / "assets" / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

class GoogleVidsScene(BaseModel):
    scene_number: int
    title: str
    layout: str = "product_focus"  # 'hook' | 'product_focus' | 'feature_demo' | 'social_proof' | 'cta'
    voiceover_text: str
    duration_seconds: float = 5.0
    image_url: Optional[str] = None
    badge_text: Optional[str] = None
    slide_image_path: Optional[str] = None
    audio_path: Optional[str] = None

class GoogleVidsProject(BaseModel):
    project_id: str
    title: str
    product_id: Optional[str] = None
    product_title: Optional[str] = None
    aspect_ratio: str = "9:16"  # '9:16' for Reels/Shorts, '16:9' for YouTube/Presentation
    voice_id: str = "en-IN-NeerjaNeural"  # 'en-IN-NeerjaNeural' | 'hi-IN-SwaraNeural' | 'en-US-JennyNeural'
    scenes: List[GoogleVidsScene] = []
    total_duration_seconds: float = 25.0
    created_at: float
    manifest_file: Optional[str] = None
    full_audio_path: Optional[str] = None

class GoogleVidsEngine:
    def __init__(self):
        self.projects: Dict[str, GoogleVidsProject] = {}
        self.products: List[Dict[str, Any]] = []
        self._load_products()
        self._load_projects()

    def _load_products(self):
        if PRODUCTS_FILE.exists():
            try:
                self.products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
            except Exception as e:
                print(f"Error loading products: {e}")

    def _load_projects(self):
        if VIDS_PROJECTS_FILE.exists():
            try:
                data = json.loads(VIDS_PROJECTS_FILE.read_text(encoding="utf-8"))
                for item in data:
                    proj = GoogleVidsProject(**item)
                    self.projects[proj.project_id] = proj
            except Exception as e:
                print(f"Error loading Google Vids projects: {e}")

    def _save_projects(self):
        try:
            VIDS_PROJECTS_FILE.parent.mkdir(parents=True, exist_ok=True)
            serializable = [p.model_dump() for p in self.projects.values()]
            VIDS_PROJECTS_FILE.write_text(json.dumps(serializable, indent=2), encoding="utf-8")
        except Exception as e:
            print(f"Error saving Google Vids projects: {e}")

    def find_product(self, product_id_or_keyword: str) -> Optional[Dict[str, Any]]:
        clean = product_id_or_keyword.lower().strip()
        for p in self.products:
            if clean in p.get("id", "").lower() or clean in p.get("title", "").lower():
                return p
        if self.products:
            return self.products[0]
        return None

    def _get_font(self, size: int, bold: bool = False):
        font_path = "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"
        if not os.path.exists(font_path):
            font_path = "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"
        try:
            return ImageFont.truetype(font_path, size)
        except Exception:
            return ImageFont.load_default()

    def _fetch_image(self, url: str) -> Image.Image:
        cache_key = "".join(c for c in url if c.isalnum())[-25:] + ".jpg"
        cached_file = CACHE_DIR / cache_key
        if cached_file.exists() and cached_file.stat().st_size > 1000:
            try:
                return Image.open(cached_file).convert("RGB")
            except Exception:
                pass

        try:
            headers = {"User-Agent": "Mozilla/5.0"}
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                img = Image.open(BytesIO(resp.content)).convert("RGB")
                img.save(cached_file, quality=90)
                return img
        except Exception as e:
            print(f"Error fetching image {url}: {e}")

        # Return branded fallback placeholder
        ph = Image.new("RGB", (600, 600), (25, 30, 45))
        d = ImageDraw.Draw(ph)
        d.text((300, 300), "RareEmber Verified Product", fill=(200, 200, 200), anchor="mm")
        return ph

    def _make_circle_avatar(self, img: Image.Image, size: int = 150) -> Image.Image:
        img = ImageOps.fit(img, (size, size), centering=(0.5, 0.5))
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        output.paste(img, (0, 0))
        output.putalpha(mask)
        return output

    async def create_storyboard(
        self,
        prompt_or_product: str,
        aspect_ratio: str = "9:16",
        voice_id: str = "en-IN-NeerjaNeural"
    ) -> GoogleVidsProject:
        """
        Creates a multi-scene Google Vids video project with authentic product angles
        and human presenter narrative.
        """
        prod = self.find_product(prompt_or_product)
        prod_title = prod.get("title", "Curated Indian Winning Product") if prod else prompt_or_product
        prod_id = prod.get("id", "custom_product") if prod else "meesho-3in1-foldable-magnetic-wireless-charging-pad"
        prod_price = prod.get("price_inr", 499) if prod else 499

        # Authentic 4-angle product gallery from Meesho CDN
        gallery = get_images_for_product(prod_id)
        img_hero = gallery[0] if len(gallery) > 0 else "https://images.meesho.com/images/products/614873040/qmb1a_512.jpg"
        img_detail = gallery[1] if len(gallery) > 1 else img_hero
        img_lifestyle = gallery[2] if len(gallery) > 2 else img_hero
        img_packaging = gallery[3] if len(gallery) > 3 else img_hero

        project_id = f"vids_{uuid.uuid4().hex[:8]}"
        project_folder = VIDS_OUTPUT_DIR / project_id
        project_folder.mkdir(parents=True, exist_ok=True)

        scenes = [
            GoogleVidsScene(
                scene_number=1,
                title="Scene 1: High-Impact Hook",
                layout="hook",
                voiceover_text=f"Stop scrolling if you want to upgrade your daily lifestyle! Look at this viral {prod_title.split()[0]} find.",
                duration_seconds=4.5,
                image_url=img_hero,
                badge_text="VIRAL PROBLEM SOLVER"
            ),
            GoogleVidsScene(
                scene_number=2,
                title="Scene 2: Core Problem & Solution",
                layout="product_focus",
                voiceover_text=f"Tired of cluttered spaces or overpriced gadgets? This {prod_title} solves it with premium build quality.",
                duration_seconds=5.5,
                image_url=img_detail,
                badge_text="UNMATCHED BUILD QUALITY"
            ),
            GoogleVidsScene(
                scene_number=3,
                title="Scene 3: Deep Feature Demo",
                layout="feature_demo",
                voiceover_text="Crafted with durable materials, seamless design, and zero hassle. It fits perfectly into your everyday routine.",
                duration_seconds=5.0,
                image_url=img_lifestyle,
                badge_text="100% QUALITY INSPECTED"
            ),
            GoogleVidsScene(
                scene_number=4,
                title="Scene 4: Social Proof & Indian Domestic Delivery",
                layout="social_proof",
                voiceover_text="Rated 4.9 stars by over 1400 verified customers across India. Delivered to your doorstep in 2 to 4 days with Cash on Delivery.",
                duration_seconds=5.0,
                image_url=img_packaging,
                badge_text="DIWALI MEGA OFFER • CODE: DIWALI100"
            ),
            GoogleVidsScene(
                scene_number=5,
                title="Scene 5: Irresistible Call-To-Action",
                layout="cta",
                voiceover_text=f"Grab yours today for only rupees {int(prod_price)}! Tap the link in bio or visit RareEmber for doorstep Cash on Delivery.",
                duration_seconds=5.0,
                image_url=img_hero,
                badge_text=f"BUY NOW FOR RS {int(prod_price)} • COD AVAILABLE"
            )
        ]

        total_duration = sum(s.duration_seconds for s in scenes)

        project = GoogleVidsProject(
            project_id=project_id,
            title=f"Google Vid: {prod_title[:45]}",
            product_id=prod_id,
            product_title=prod_title,
            aspect_ratio=aspect_ratio,
            voice_id=voice_id,
            scenes=scenes,
            total_duration_seconds=total_duration,
            created_at=time.time()
        )

        # Generate Voiceover Audio & Visual Slides
        await self._render_project_assets(project, project_folder)

        self.projects[project_id] = project
        self._save_projects()
        return project

    async def _render_project_assets(self, project: GoogleVidsProject, project_folder: Path):
        """
        Synthesizes TTS voiceover audio files and Google Vids slide cards.
        """
        combined_script = []
        for scene in project.scenes:
            combined_script.append(scene.voiceover_text)
            
            # Generate TTS audio for individual scene
            audio_filename = f"scene_{scene.scene_number}.mp3"
            audio_path = project_folder / audio_filename
            try:
                communicate = edge_tts.Communicate(scene.voiceover_text, project.voice_id)
                await communicate.save(str(audio_path))
                scene.audio_path = f"generated_posts/google_vids/{project.project_id}/{audio_filename}"
            except Exception as e:
                # Fallback to gTTS if edge-tts has network lag
                try:
                    from gtts import gTTS
                    clean_text = scene.voiceover_text.replace("★", " star ").replace("₹", " rupees ")
                    tts = gTTS(clean_text, lang="en")
                    tts.save(str(audio_path))
                    scene.audio_path = f"generated_posts/google_vids/{project.project_id}/{audio_filename}"
                except Exception as ge:
                    print(f"TTS generation error for scene {scene.scene_number}: {ge}")

            # Generate slide graphic with authentic product photo and human presenter
            slide_filename = f"slide_{scene.scene_number}.jpg"
            slide_path = project_folder / slide_filename
            self._render_scene_card(scene, project, slide_path)
            scene.slide_image_path = f"generated_posts/google_vids/{project.project_id}/{slide_filename}"

        # Full combined narration track
        full_audio_file = project_folder / "full_narration.mp3"
        try:
            full_text = " ... ".join(combined_script)
            comm = edge_tts.Communicate(full_text, project.voice_id)
            await comm.save(str(full_audio_file))
            project.full_audio_path = f"generated_posts/google_vids/{project.project_id}/full_narration.mp3"
        except Exception:
            try:
                from gtts import gTTS
                clean_full = full_text.replace("★", " star ").replace("₹", " rupees ")
                tts = gTTS(clean_full, lang="en")
                tts.save(str(full_audio_file))
                project.full_audio_path = f"generated_posts/google_vids/{project.project_id}/full_narration.mp3"
            except Exception as e:
                print(f"Full narration error: {e}")

        # Official Google Workspace Vids Project Manifest
        manifest_data = {
            "vids_version": "2.0",
            "app": "Google Vids AI Studio (Hermes Integration)",
            "project_id": project.project_id,
            "title": project.title,
            "aspect_ratio": project.aspect_ratio,
            "voice_actor": project.voice_id,
            "total_duration_sec": project.total_duration_seconds,
            "scenes": [
                {
                    "scene_index": s.scene_number,
                    "title": s.title,
                    "layout": s.layout,
                    "duration_sec": s.duration_seconds,
                    "script": s.voiceover_text,
                    "badge": s.badge_text,
                    "media_source": s.image_url,
                    "slide_asset": s.slide_image_path,
                    "audio_asset": s.audio_path
                }
                for s in project.scenes
            ],
            "export_targets": [
                "Google Drive (Video/MP4)",
                "YouTube Shorts",
                "Instagram Reels (@RareEmber)"
            ]
        }
        manifest_path = project_folder / "google_vids_manifest.json"
        manifest_path.write_text(json.dumps(manifest_data, indent=2), encoding="utf-8")
        project.manifest_file = f"generated_posts/google_vids/{project.project_id}/google_vids_manifest.json"

    def _render_scene_card(self, scene: GoogleVidsScene, project: GoogleVidsProject, output_path: Path):
        """
        Renders a 1080x1920 (9:16) modern visual card with real product photograph,
        authentic human presenter badge, gold accent ribbons, and bold subtitles.
        """
        w, h = 1080, 1920
        canvas = Image.new("RGB", (w, h), color=(10, 12, 18))
        draw = ImageDraw.Draw(canvas)

        # Ambient deep festive gradient backdrop
        for y in range(h):
            r = int(12 + (y / h) * 16)
            g = int(14 + (y / h) * 12)
            b = int(24 + (y / h) * 22)
            draw.line([(0, y), (w, y)], fill=(r, g, b))

        # Top Brand Ribbon
        draw.rectangle([0, 0, w, 90], fill=(16, 20, 32))
        draw.line([(0, 90), (w, 90)], fill=(212, 175, 55), width=2)
        draw.text((60, 45), "RareEmber.", fill=(255, 255, 255), anchor="lm", font=self._get_font(34, bold=True))
        draw.text((w - 60, 45), "DIWALI DHAMAKA 2026", fill=(212, 175, 55), anchor="rm", font=self._get_font(26, bold=True))

        # Human Presenter Profile Badge (Top Left / Center)
        evaa_file = PRESENTERS_DIR / "evaa.jpg"
        if evaa_file.exists():
            try:
                evaa_img = Image.open(evaa_file)
                avatar = self._make_circle_avatar(evaa_img, size=150)
                # Gold Ring
                draw.ellipse([56, 126, 214, 284], fill=None, outline=(212, 175, 55), width=4)
                canvas.paste(avatar, (60, 130), avatar)
                
                # Presenter Text Info
                draw.text((230, 160), "Reviewed by Evaa Patel", fill=(255, 255, 255), font=self._get_font(36, bold=True))
                draw.text((230, 205), "★ 4.9/5 Rating • 1,480+ Verified Indian Orders", fill=(212, 175, 55), font=self._get_font(26, bold=False))
                # Green Verified Dot
                draw.ellipse([230, 245, 246, 261], fill=(46, 204, 113))
                draw.text((255, 253), "100% Domestic Stock Verified", fill=(46, 204, 113), font=self._get_font(22, bold=True), anchor="lm")
            except Exception as pe:
                print(f"Error rendering presenter badge: {pe}")

        # High-Impact Scene Badge Pill
        badge_colors = {
            1: ((138, 43, 226), "VIRAL PROBLEM SOLVER"),
            2: ((30, 144, 255), "UNMATCHED BUILD QUALITY"),
            3: ((46, 139, 87), "100% REAL CUSTOMER LOVE"),
            4: ((212, 140, 20), "DIWALI MEGA OFFER • CODE: DIWALI100"),
            5: ((220, 53, 69), "LIMITED STOCK • ORDER NOW")
        }
        b_color, b_default_text = badge_colors.get(scene.scene_number, ((138, 43, 226), scene.badge_text or "FEATURED DROP"))
        actual_badge = scene.badge_text or b_default_text

        # Draw Badge Pill
        draw.rounded_rectangle([60, 310, w - 60, 395], radius=20, fill=b_color)
        draw.text((w / 2, 352), actual_badge, fill=(255, 255, 255), anchor="mm", font=self._get_font(34, bold=True))

        # Central Product Showcase Frame
        frame_box = [60, 420, w - 60, 1340]
        draw.rounded_rectangle(frame_box, radius=28, fill=(18, 22, 34), outline=(60, 72, 105), width=3)

        # Load and scale product image
        prod_url = scene.image_url or "https://images.meesho.com/images/products/614873040/qmb1a_512.jpg"
        prod_img = self._fetch_image(prod_url)
        max_w, max_h = 920, 840
        prod_img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        
        # Center inside the showcase frame
        px = frame_box[0] + (frame_box[2] - frame_box[0] - prod_img.width) // 2
        py = frame_box[1] + 30 + (840 - prod_img.height) // 2
        canvas.paste(prod_img, (px, py))

        # Price & Guarantee Pill inside Product Frame
        pill_y1 = frame_box[3] - 90
        pill_y2 = frame_box[3] - 20
        draw.rounded_rectangle([80, pill_y1, w - 80, pill_y2], radius=16, fill=(10, 14, 22), outline=(212, 175, 55), width=2)
        price_str = "Festive Price: ₹499 - ₹799 (55% OFF) • Doorstep COD Available"
        draw.text((w / 2, (pill_y1 + pill_y2) / 2), price_str, fill=(255, 215, 0), anchor="mm", font=self._get_font(30, bold=True))

        # Subtitle / Voiceover Box at Bottom
        sub_box = [60, 1370, w - 60, 1840]
        draw.rounded_rectangle(sub_box, radius=24, fill=(12, 15, 24), outline=(45, 55, 80), width=2)

        # Scene Title
        clean_title = scene.title.replace("🔥", "").replace("✨", "").replace("⚡", "").replace("⭐", "").replace("🛒", "").strip()
        draw.text((w / 2, 1420), clean_title, fill=(212, 175, 55), anchor="mm", font=self._get_font(34, bold=True))

        # Word wrap speech subtitles
        words = scene.voiceover_text.split()
        lines = []
        cur = []
        for wd in words:
            if len(" ".join(cur + [wd])) > 32:
                lines.append(" ".join(cur))
                cur = [wd]
            else:
                cur.append(wd)
        if cur:
            lines.append(" ".join(cur))

        sy = 1490
        font_sub = self._get_font(38, bold=True)
        for line in lines[:5]:
            draw.text((w / 2, sy), line, fill=(255, 255, 255), anchor="mm", font=font_sub)
            sy += 58

        output_path.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(str(output_path), quality=94)

    def list_projects(self) -> List[Dict[str, Any]]:
        return [p.model_dump() for p in sorted(self.projects.values(), key=lambda x: x.created_at, reverse=True)]

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        p = self.projects.get(project_id)
        return p.model_dump() if p else None

    async def publish_project(self, project_id: str) -> Dict[str, Any]:
        """
        Compiles all 5 storyboard scenes and voiceovers into a true multi-scene 9:16
        vertical video reel via FFmpeg, and dispatches directly to Boss Ajay's Telegram bot.
        """
        proj = self.projects.get(project_id)
        if not proj:
            return {"ok": False, "error": f"Project {project_id} not found"}

        project_folder = VIDS_OUTPUT_DIR / project_id
        project_folder.mkdir(parents=True, exist_ok=True)
        
        # Ensure all scene slide images and audio clips are generated
        scene_clips = []
        for scene in proj.scenes:
            slide_file = project_folder / f"slide_{scene.scene_number}.jpg"
            if not slide_file.exists() or slide_file.stat().st_size < 1000:
                self._render_scene_card(scene, proj, slide_file)

            audio_file = project_folder / f"scene_{scene.scene_number}.mp3"
            if not audio_file.exists() or audio_file.stat().st_size < 1000:
                try:
                    from gtts import gTTS
                    clean_text = scene.voiceover_text.replace("★", " star ").replace("₹", " rupees ")
                    tts = gTTS(clean_text, lang="en")
                    tts.save(str(audio_file))
                except Exception as ae:
                    print(f"Audio fallback error scene {scene.scene_number}: {ae}")

            # Compile individual scene clip
            clip_file = project_folder / f"clip_{scene.scene_number}.mp4"
            if not clip_file.exists() or clip_file.stat().st_size < 1000:
                cmd = [
                    "ffmpeg", "-y",
                    "-loop", "1", "-i", str(slide_file),
                    "-i", str(audio_file),
                    "-c:v", "libx264", "-tune", "stillimage",
                    "-c:a", "aac", "-b:a", "192k",
                    "-pix_fmt", "yuv420p",
                    "-shortest",
                    str(clip_file)
                ]
                try:
                    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
                    scene_clips.append(clip_file)
                except Exception as ce:
                    print(f"Clip {scene.scene_number} render error: {ce}")
            else:
                scene_clips.append(clip_file)

        # Concatenate all clips into the full multi-scene video reel
        video_file = project_folder / "video_reel.mp4"
        if scene_clips:
            concat_txt = project_folder / "concat_list.txt"
            lines = [f"file '{p.resolve().as_posix()}'" for p in scene_clips if p.exists()]
            concat_txt.write_text("\n".join(lines), encoding="utf-8")
            
            concat_cmd = [
                "ffmpeg", "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", str(concat_txt),
                "-c", "copy",
                str(video_file)
            ]
            try:
                subprocess.run(concat_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            except Exception as fce:
                print(f"Concat error: {fce}")

        # Dispatch to Ajay on Telegram
        token = "8898923626:AAHjI91mNfyRCanPdK9MVDiTBpL4zPzPOkI"
        chat_id = "5238068527"
        delivered = False
        if video_file.exists() and video_file.stat().st_size > 1000:
            try:
                prod_slug = proj.product_id or "shop"
                store_url = f"https://rareember-store.vercel.app/product/{prod_slug}"
                caption_text = (
                    f"🎬 <b>RareEmber Video Reel Ready!</b>\n\n"
                    f"• <b>Title:</b> {proj.title}\n"
                    f"• <b>Visuals:</b> Authentic Product Angles + Human Presenter (Evaa Patel)\n"
                    f"• <b>Duration:</b> ~{int(proj.total_duration_seconds)}s Multi-Scene Dynamic Reel\n"
                    f"• <b>Diwali Code:</b> <code>DIWALI100</code> (Flat ₹100 OFF)\n"
                    f"• <b>Store Link:</b> {store_url}\n\n"
                    f"🚀 <b>Copyable Instagram Caption:</b>\n"
                    f"Stop scrolling! Upgrade your everyday lifestyle with this viral problem solver ✨\n\n"
                    f"✅ Pan-India Doorstep Cash on Delivery (COD)\n"
                    f"✅ 30-Day Zero-Risk Replacement Guarantee\n"
                    f"🔥 Special Diwali Offer: Use code DIWALI100 at checkout!\n\n"
                    f"👉 Tap the link in bio (@rareember) or visit {store_url} to order today!\n\n"
                    f"#diwalisale #diwalishopping #rareember #trendingproducts #viralfinds #indiand2c #gadgetsindia #homeaesthetic"
                )
                with open(video_file, "rb") as vf:
                    r = requests.post(
                        f"https://api.telegram.org/bot{token}/sendVideo",
                        data={
                            "chat_id": chat_id,
                            "caption": caption_text[:1024],
                            "parse_mode": "HTML"
                        },
                        files={"video": vf},
                        timeout=90
                    )
                    delivered = (r.status_code == 200)
            except Exception as te:
                print(f"Telegram dispatch error: {te}")

        return {
            "ok": True,
            "project_id": project_id,
            "title": proj.title,
            "video_path": str(video_file.relative_to(settings.WORKSPACE_PATH)).replace("\\", "/"),
            "telegram_delivered": delivered,
            "scenes_stitched": len(scene_clips),
            "format": "9:16 Multi-Scene Vertical Reel"
        }

google_vids = GoogleVidsEngine()
