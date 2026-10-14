import asyncio
import json
import os
import re
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont
import edge_tts
import requests

from dots_gateway.config import settings

VIDS_OUTPUT_DIR = settings.WORKSPACE_PATH / "generated_posts" / "google_vids"
VIDS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
VIDS_PROJECTS_FILE = settings.WORKSPACE_PATH / "dots_gateway" / "google_vids_projects.json"

PRODUCTS_FILE = settings.WORKSPACE_PATH / "all_103_products.json"

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

    async def create_storyboard(
        self,
        prompt_or_product: str,
        aspect_ratio: str = "9:16",
        voice_id: str = "en-IN-NeerjaNeural"
    ) -> GoogleVidsProject:
        """
        Creates a multi-scene Google Vids video project from product or prompt.
        """
        prod = self.find_product(prompt_or_product)
        prod_title = prod.get("title", "Curated Indian Winning Product") if prod else prompt_or_product
        prod_id = prod.get("id", "custom_product") if prod else None
        prod_img = prod.get("current_hero") if prod else "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
        prod_price = prod.get("price_inr", 499) if prod else 499

        project_id = f"vids_{uuid.uuid4().hex[:8]}"
        project_folder = VIDS_OUTPUT_DIR / project_id
        project_folder.mkdir(parents=True, exist_ok=True)

        # Standard 5-scene high-converting Google Vids structure
        scenes = [
            GoogleVidsScene(
                scene_number=1,
                title="Scene 1: High-Impact Hook",
                layout="hook",
                voiceover_text=f"Stop scrolling if you want to upgrade your daily setup! Look at this incredible {prod_title.split()[0]} find.",
                duration_seconds=4.5,
                image_url=prod_img,
                badge_text="🔥 VIRAL FIND"
            ),
            GoogleVidsScene(
                scene_number=2,
                title="Scene 2: Core Problem & Solution",
                layout="product_focus",
                voiceover_text=f"Tired of cluttered spaces or overpriced gadgets? This {prod_title} solves it with premium build quality.",
                duration_seconds=5.5,
                image_url=prod_img,
                badge_text="✨ 100% QUALITY TESTED"
            ),
            GoogleVidsScene(
                scene_number=3,
                title="Scene 3: Deep Feature Demo",
                layout="feature_demo",
                voiceover_text=f"Crafted with durable materials, seamless design, and zero hassle. It fits perfectly into your everyday routine.",
                duration_seconds=5.0,
                image_url=prod_img,
                badge_text="⚡ EXPRESS DISPATCH"
            ),
            GoogleVidsScene(
                scene_number=4,
                title="Scene 4: Social Proof & Indian Domestic Delivery",
                layout="social_proof",
                voiceover_text=f"Rated 4.9 stars by over 500 customers across India. Delivered right to your doorstep in 2 to 4 days with Cash on Delivery.",
                duration_seconds=5.0,
                image_url=prod_img,
                badge_text="⭐ 4.9/5 RATED • COD AVAILABLE"
            ),
            GoogleVidsScene(
                scene_number=5,
                title="Scene 5: Irresistible Call-To-Action",
                layout="cta",
                voiceover_text=f"Only ₹{int(prod_price)} for a limited time! Tap the link in bio or visit RareEmber to claim free shipping today.",
                duration_seconds=5.0,
                image_url=prod_img,
                badge_text=f"🛒 GRAB FOR ONLY ₹{int(prod_price)}"
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
                print(f"TTS generation error for scene {scene.scene_number}: {e}")

            # Generate slide graphic
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
        except Exception as e:
            print(f"Full TTS generation error: {e}")

        # Official Google Workspace Vids Project Manifest (JSON schema)
        manifest_data = {
            "vids_version": "1.0",
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
                "Instagram Reels (RareEmber)"
            ]
        }
        manifest_path = project_folder / "google_vids_manifest.json"
        manifest_path.write_text(json.dumps(manifest_data, indent=2), encoding="utf-8")
        project.manifest_file = f"generated_posts/google_vids/{project.project_id}/google_vids_manifest.json"

    def _render_scene_card(self, scene: GoogleVidsScene, project: GoogleVidsProject, output_path: Path):
        """
        Renders a 1080x1920 (9:16) modern visual card with gradient backdrop,
        product image container, badge, and subtitles.
        """
        w, h = (1080, 1920) if project.aspect_ratio == "9:16" else (1920, 1080)
        img = Image.new("RGB", (w, h), color=(11, 13, 20))
        draw = ImageDraw.Draw(img)

        # Draw ambient gradients
        for i in range(h):
            r = int(14 + (i / h) * 15)
            g = int(17 + (i / h) * 10)
            b = int(28 + (i / h) * 20)
            draw.line([(0, i), (w, i)], fill=(r, g, b))

        # Badge banner
        if scene.badge_text:
            draw.rounded_rectangle([60, 120, w - 60, 210], radius=18, fill=(138, 43, 226))
            draw.text((w / 2, 165), scene.badge_text, fill=(255, 255, 255), anchor="mm")

        # Title
        draw.text((w / 2, 280), scene.title, fill=(200, 210, 240), anchor="mm")

        # Central media box
        draw.rounded_rectangle([80, 360, w - 80, 1400], radius=24, fill=(20, 24, 38), outline=(60, 70, 100), width=2)
        
        # Subtitle caption box
        draw.rounded_rectangle([60, 1480, w - 60, 1820], radius=24, fill=(8, 10, 16), outline=(40, 48, 70), width=1)
        
        # Word wrap voiceover text
        words = scene.voiceover_text.split()
        lines = []
        cur_line = []
        for word in words:
            if len(" ".join(cur_line + [word])) > 38:
                lines.append(" ".join(cur_line))
                cur_line = [word]
            else:
                cur_line.append(word)
        if cur_line:
            lines.append(" ".join(cur_line))

        y_offset = 1530
        for line in lines[:5]:
            draw.text((w / 2, y_offset), line, fill=(240, 245, 255), anchor="mm")
            y_offset += 55

        img.save(str(output_path), quality=92)

    def list_projects(self) -> List[Dict[str, Any]]:
        return [p.model_dump() for p in sorted(self.projects.values(), key=lambda x: x.created_at, reverse=True)]

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        p = self.projects.get(project_id)
        return p.model_dump() if p else None

google_vids = GoogleVidsEngine()
