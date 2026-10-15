"""
50 Viral Trending Streetwear & Creator Drops Seeder for RareEmber
Inserts 50 curated high-converting products across:
- Anime & Neo-Tokyo Cyberpunk
- Modern Indic & Cyber-Spiritual
- Gym, Pump Covers & Iron Motivation
- Dark Academia & Stoic Philosophy
- Retro Vintage, Lo-Fi & Synthwave
- Minimalist Creator, Coding & Workspace Culture

Upserts directly into Supabase 'products' table and outputs JSON.
"""

import json
import ssl
import sys
import os
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try: sys.stdout.reconfigure(encoding="utf-8")
    except Exception: pass

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pg8000.native
from datetime import datetime, timezone

from rareember_crew.config import (
    SUPABASE_DB_HOST,
    SUPABASE_DB_PORT,
    SUPABASE_DB_USER,
    SUPABASE_DB_PASS,
    SUPABASE_DB_NAME,
)

PRODUCTS_50 = [
    # =========================================================================
    # 1. ANIME & NEO-TOKYO STREETWEAR (10 Drops)
    # =========================================================================
    {
        "id": "drop-gojo-unlimited-void-oversized-tee",
        "slug": "gojo-unlimited-void-oversized-tee",
        "title": "Gojo Satoru 'Unlimited Void' 240 GSM Heavyweight Oversized Tee",
        "category": "fashion",
        "emoji": "👁️",
        "tag": "Viral Hit",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 3420,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
        "short": "Minimalist Domain Expansion eye embroidery graphic. 240 GSM French combed cotton with drop-shoulder streetwear silhouette.",
        "story": "Step into the infinite. The Gojo 'Unlimited Void' tee captures the raw aesthetic of Tokyo streetwear with high-density puff print detailing. Engineered from 240 GSM pure combed cotton for the ultimate drape, zero shrink, and effortless heavyweight streetwear feel.",
        "details": ["240 GSM 100% Combed Cotton", "Heavy Drop-Shoulder Streetwear Fit", "High-Density Fade-Resistant Screen Print", "Bio-Washed & Preshrunk Fabric", "Dispatched from Tirupur Hub with 1-Click COD"]
    },
    {
        "id": "drop-sukuna-malevolent-shrine-hoodie",
        "slug": "sukuna-malevolent-shrine-hoodie",
        "title": "Sukuna 'Malevolent Shrine' 380 GSM Heavyweight Streetwear Hoodie",
        "category": "fashion",
        "emoji": "🔥",
        "tag": "Bestseller",
        "price_inr": 1299,
        "compare_at_price": 2799,
        "rating": 4.9,
        "reviews": 2890,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
        "short": "Dark cursive Japanese kanji backprint with double-layered thermal hood. 380 GSM heavy brushed fleece.",
        "story": "Reign supreme. The Sukuna Malevolent Shrine hoodie is crafted from premium 380 GSM brushed fleece with ribbed cuffs, heavy metal eyelets, and an intricate back graphic inspired by cursed energy geometry.",
        "details": ["380 GSM Ultra-Heavy Brushed Fleece", "Double-Layered Structured Hood", "Precision Screen & Foil Hybrid Print", "Kangaroo Pocket with Reinforced Stitching", "Pan-India Air Dispatch (2-4 Days)"]
    },
    {
        "id": "drop-shadow-monarch-arise-oversized-tee",
        "slug": "shadow-monarch-arise-oversized-tee",
        "title": "Shadow Monarch 'Arise' Acid Wash 240 GSM Oversized Tee",
        "category": "fashion",
        "emoji": "⚔️",
        "tag": "Trending #1",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 2150,
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
        "short": "Dark phantom purple neon back graphic on mineral acid wash cotton. High-density drop-shoulder cut.",
        "story": "Summon the shadows. Inspired by the Solo Leveling dark fantasy aesthetic, this tee features an iconic glowing blue eye and dagger silhouette on custom charcoal acid wash cotton.",
        "details": ["240 GSM Mineral Acid Wash Cotton", "Relaxed Boxy Streetwear Cut", "Crack-Resistant Plastisol Print", "Pre-Shrunk & Color-Locked", "100% Domestic Tirupur Manufacturing"]
    },
    {
        "id": "drop-tokyo-drift-cyber-skyline-tee",
        "slug": "tokyo-drift-cyber-skyline-tee",
        "title": "Tokyo Midnight Drift Cyber Skyline 180 GSM Classic Streetwear Tee",
        "category": "fashion",
        "emoji": "🏎️",
        "tag": "Street Favorite",
        "price_inr": 499,
        "compare_at_price": 999,
        "rating": 4.8,
        "reviews": 1640,
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
        "short": "Retro JDM midnight skyline graphic with Japanese katakana typography. 180 GSM bio-washed cotton.",
        "story": "Late night expressway aesthetics. Capturing the golden age of 90s Tokyo drift culture with vibrant neon purple and cyan hues on crisp pitch black cotton.",
        "details": ["180 GSM Super-Combed Bio-Washed Cotton", "Regular Streetwear Fit", "Ultra-Soft Breathable Weave", "Neck Ribbing with Lycra Elasticity", "Cash on Delivery Available Across India"]
    },
    {
        "id": "drop-cyberpunk-neo-samurai-hoodie",
        "slug": "cyberpunk-neo-samurai-hoodie",
        "title": "Cyberpunk Neo-Samurai Katana 380 GSM Heavyweight Streetwear Hoodie",
        "category": "fashion",
        "emoji": "🗡️",
        "tag": "Limited Drop",
        "price_inr": 1299,
        "compare_at_price": 2799,
        "rating": 4.9,
        "reviews": 1980,
        "image_url": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800",
        "short": "Futuristic cyber warrior with holographic katana aesthetic. Heavyweight fleece for winter streets.",
        "story": "Where ancient Bushido code meets 2077 cyberspace. A massive back mural of a cybernetic ronin flanked by holographic Kanji symbols.",
        "details": ["380 GSM Combed Fleece", "Double Stitch Construction", "Lint-Free Heavy Finish", "Hidden Interior Phone Pocket", "7-Day Free Doorstep Replacement"]
    },
    {
        "id": "drop-itachi-red-moon-crow-oversized-tee",
        "slug": "itachi-red-moon-crow-oversized-tee",
        "title": "Itachi 'Red Moon & Crows' 240 GSM Heavyweight Oversized Tee",
        "category": "fashion",
        "emoji": "🌙",
        "tag": "Cult Classic",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 3890,
        "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
        "short": "Crimson blood moon silhouette with swirling crows. 240 GSM drop shoulder combed cotton.",
        "story": "Sacrifice in silence. The definitive homage to anime's greatest anti-hero, rendered in minimalist crimson red and deep charcoal blacks with iconic Mangekyo detailing.",
        "details": ["240 GSM Heavyweight Combed Cotton", "Boxy Drop-Shoulder Silhouette", "Precision High-Density Screen Print", "Soft Fabric Hand Feel", "Domestic Express Courier Dispatch"]
    },
    {
        "id": "drop-akatsuki-cloud-ceramic-mug",
        "slug": "akatsuki-cloud-ceramic-mug",
        "title": "Akatsuki Minimalist Cloud 350ml Matte Black Ceramic Artisan Mug",
        "category": "home-garden",
        "emoji": "☕",
        "tag": "Desk Essential",
        "price_inr": 349,
        "compare_at_price": 799,
        "rating": 4.8,
        "reviews": 1430,
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
        "short": "Matte black glaze with vibrant crimson cloud motif. Premium high-fired ceramic, microwave & dishwasher safe.",
        "story": "Upgrade your coffee ritual. Features a subtle textured matte black exterior with the iconic crimson cloud etched on both sides for right- and left-handed coffee lovers.",
        "details": ["350ml Generous Capacity", "High-Fired Premium Ceramic", "Ergonomic Comfort Grip Handle", "Microwave & Dishwasher Safe", "Safe Drop-Tested Packaging Guarantee"]
    },
    {
        "id": "drop-neon-eva-awakening-desk-mat",
        "slug": "neon-eva-awakening-desk-mat",
        "title": "Neon Eva Unit-01 Awakening 900x400mm Extended Speed Desk Mat",
        "category": "electronics",
        "emoji": "🖥️",
        "tag": "Setup Upgrade",
        "price_inr": 599,
        "compare_at_price": 1299,
        "rating": 4.9,
        "reviews": 1820,
        "image_url": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800",
        "short": "Purple and acid green synthwave mecha cockpit art. Ultra-smooth micro-weave surface with anti-fray stitched edges.",
        "story": "Transform your workstation into an anime command center. 4mm thick natural non-slip rubber base with a spill-resistant speed fabric surface engineered for flawless mouse tracking.",
        "details": ["900 x 400 x 4mm Extended Size", "Precision Micro-Weave Speed Surface", "360° Anti-Fray Stitched Edges", "Non-Slip Textured Rubber Base", "Waterproof & Easy to Clean"]
    },
    {
        "id": "drop-luffy-gear-5-sun-god-tee",
        "slug": "luffy-gear-5-sun-god-tee",
        "title": "Luffy 'Gear 5 Sun God' 240 GSM Heavyweight Oversized Tee",
        "category": "fashion",
        "emoji": "☀️",
        "tag": "Viral Drop",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 2940,
        "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
        "short": "Drums of Liberation clouds and joyful silhouette in monochrome ink. 240 GSM heavy cotton.",
        "story": "The Drums of Liberation sound across the Grand Line. Joy Boy returns in an ultra-clean monochrome manga art style that looks effortlessly cool on any streetwear fit.",
        "details": ["240 GSM Combed Cotton", "Relaxed Streetwear Silhouette", "High-Resolution Discharge Print", "Breathable Zero-Chafe Seams", "Verified Qikink Factory Print Quality"]
    },
    {
        "id": "drop-demon-slayer-tanjiro-dragon-sweatshirt",
        "slug": "demon-slayer-tanjiro-dragon-sweatshirt",
        "title": "Sun Breathing Dragon 320 GSM French Terry Streetwear Sweatshirt",
        "category": "fashion",
        "emoji": "🐉",
        "tag": "Winter Drop",
        "price_inr": 999,
        "compare_at_price": 2199,
        "rating": 4.8,
        "reviews": 1580,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
        "short": "Intricate Hinokami Kagura solar dragon art along right sleeve and back. 320 GSM French Terry.",
        "story": "Master the flame. A gorgeous dual-placement print featuring blazing sun breathing rings across the spine and a dynamic sleeve run on premium French Terry cotton.",
        "details": ["320 GSM Heavy French Terry", "Raglan Comfort Shoulder Cut", "Ribbed Neck & Hem with Spandex", "Fade-Proof Pigment Ink", "1-Click COD Available Across India"]
    },

    # =========================================================================
    # 2. MODERN INDIC & CYBER-SPIRITUAL STREETWEAR (10 Drops)
    # =========================================================================
    {
        "id": "drop-mahakal-cosmic-rudra-oversized-tee",
        "slug": "mahakal-cosmic-rudra-oversized-tee",
        "title": "Mahakal 'Cosmic Rudra' Sacred Geometry 240 GSM Oversized Tee",
        "category": "fashion",
        "emoji": "🔱",
        "tag": "Spiritual Street",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 4120,
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
        "short": "Intricate golden ratio trident & third eye mandala. 240 GSM pure combed cotton in jet black.",
        "story": "The destroyer of illusions. Blending ancient Sanskrit sacred geometry with high-fashion streetwear aesthetics, printed in muted metallic gold and ash gray on heavyweight cotton.",
        "details": ["240 GSM 100% Combed Cotton", "Drop Shoulder Oversized Fit", "Metallic Shimmer Screen Print", "Preshrunk & Anti-Pilling Weave", "1-Click COD Ready Across 19,000+ PINs"]
    },
    {
        "id": "drop-adiyogi-minimalist-line-art-tee",
        "slug": "adiyogi-minimalist-line-art-tee",
        "title": "Adiyogi 'The First Yogi' Minimalist Line Art 180 GSM Classic Tee",
        "category": "fashion",
        "emoji": "🧘",
        "tag": "Timeless",
        "price_inr": 499,
        "compare_at_price": 999,
        "rating": 4.8,
        "reviews": 2750,
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
        "short": "Single-stroke continuous line portrait of Shiva in meditation. 180 GSM bio-washed white tee.",
        "story": "Stillness in motion. A continuous single-line minimalist illustration that radiates elegance, mindfulness, and inner peace on ultra-clean off-white organic cotton.",
        "details": ["180 GSM Bio-Washed Cotton", "Clean Tailored Regular Fit", "Soft-Feel Water-Based Print", "Non-Chafing Tagless Label", "Fast Express Domestic Air Dispatch"]
    },
    {
        "id": "drop-karmanye-vadhikaraste-shloka-tee",
        "slug": "karmanye-vadhikaraste-shloka-tee",
        "title": "'Karmanye Vadhikaraste' Bhagavad Gita Typo 240 GSM Oversized Tee",
        "category": "fashion",
        "emoji": "📜",
        "tag": "Mindset",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 3280,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
        "short": "Modern Devanagari calligraphy of Chapter 2, Verse 47. Heavy drop-shoulder streetwear tee.",
        "story": "Focus on the action, detach from the outcome. Modern Indic typography celebrates the timeless wisdom of the Gita for young creators, founders, and relentless doers.",
        "details": ["240 GSM Pure Combed Cotton", "Boxy Drop-Shoulder Streetwear Cut", "High-Resolution Typographic Print", "Color-Locked Wash Guarantee", "Free Replacement for Any Defects"]
    },
    {
        "id": "drop-cosmic-nataraja-streetwear-hoodie",
        "slug": "cosmic-nataraja-streetwear-hoodie",
        "title": "Cosmic Nataraja 'Dance of Creation' 380 GSM Streetwear Hoodie",
        "category": "fashion",
        "emoji": "✨",
        "tag": "Artisan Drop",
        "price_inr": 1299,
        "compare_at_price": 2799,
        "rating": 4.9,
        "reviews": 1890,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
        "short": "Celestial ring of cosmic fire backprint with Sanskrit coordinates. 380 GSM heavy brushed fleece.",
        "story": "The eternal cycle of cosmos and rhythm. Back mural showcases Lord Shiva as Nataraja surrounded by nebulas, sacred flames, and modern geometric grid markers.",
        "details": ["380 GSM Heavyweight Brushed Fleece", "Structured Double Hood with Thick Drawstrings", "Metallic Foil & Plastisol Hybrid Print", "Warm Kangaroo Pocket", "7-Day Easy Doorstep Return"]
    },
    {
        "id": "drop-trishul-damru-ceramic-mug",
        "slug": "trishul-damru-ceramic-mug",
        "title": "Trishul & Damru Sacred Third Eye 350ml Matte Black Ceramic Mug",
        "category": "home-garden",
        "emoji": "☕",
        "tag": "Spiritual Desk",
        "price_inr": 349,
        "compare_at_price": 799,
        "rating": 4.8,
        "reviews": 1670,
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
        "short": "Subtle golden trishul and damru motif on deep matte black ceramic. Microwave & dishwasher safe.",
        "story": "Start every morning with grounded focus. Minimalist golden iconography honors cosmic balance while elevating your tea or filter coffee ritual.",
        "details": ["350ml Coffee & Chai Capacity", "Matte Ceramic Finish with Gloss Accents", "Heat-Retentive Thick Walls", "Dishwasher & Microwave Safe", "Express Domestic Dispatch"]
    },
    {
        "id": "drop-varanasi-ghats-twilight-desk-mat",
        "slug": "varanasi-ghats-twilight-desk-mat",
        "title": "Varanasi Ghats Ganga Aarti Twilight 900x400mm Extended Desk Mat",
        "category": "electronics",
        "emoji": "🪔",
        "tag": "Aesthetic Setup",
        "price_inr": 599,
        "compare_at_price": 1299,
        "rating": 4.9,
        "reviews": 2040,
        "image_url": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800",
        "short": "Ethereal twilight panorama of ancient river ghats with glowing floating diyas. Speed cloth surface.",
        "story": "Sacred heritage on your modern workspace. High-resolution art depicts the spiritual banks of Kashi during evening aarti, bringing tranquil golden reflections to your desk.",
        "details": ["900 x 400 x 4mm Extra Large Mat", "Water-Resistant Smooth Micro-Weave", "Heavy-Duty Anti-Fray Stitched Border", "Anti-Skid Natural Rubber Base", "Tirupur Made with 1-Click COD"]
    },
    {
        "id": "drop-hanuman-sankat-mochan-hoodie",
        "slug": "hanuman-sankat-mochan-hoodie",
        "title": "Hanuman 'Sankat Mochan' Bold Street Art 380 GSM Streetwear Hoodie",
        "category": "fashion",
        "emoji": "🚩",
        "tag": "Power Drop",
        "price_inr": 1299,
        "compare_at_price": 2799,
        "rating": 4.9,
        "reviews": 2980,
        "image_url": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800",
        "short": "Fierce modern line art of Bajrangbali with mace and mountain. 380 GSM heavyweight fleece.",
        "story": "Unshakable strength and infinite devotion. A bold modern portrait of Lord Hanuman rendered in contemporary stencil street art with Sanskrit shloka detailing.",
        "details": ["380 GSM Premium Brushed Fleece", "Heavy Double-Layered Thermal Hood", "High-Def Crack-Proof Screen Print", "Durable Heavyweight Ribbed Cuffs", "Pan-India Free Express Air Delivery"]
    },
    {
        "id": "drop-om-namah-shivaya-tote-bag",
        "slug": "om-namah-shivaya-tote-bag",
        "title": "Om Namah Shivaya Sanskrit Calligraphy 400 GSM Heavy Canvas Tote",
        "category": "general",
        "emoji": "👜",
        "tag": "Eco Lifestyle",
        "price_inr": 399,
        "compare_at_price": 899,
        "rating": 4.8,
        "reviews": 1120,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
        "short": "Heavy organic canvas tote with minimalist Devanagari script. Reinforced boxed corners & heavy handles.",
        "story": "Carry positive vibrations everywhere. Crafted from 100% natural unbleached cotton canvas with reinforced cross-stitching that effortlessly carries laptops, books, or groceries.",
        "details": ["400 GSM Heavy Unbleached Cotton Canvas", "Generous 15 x 16 Inch Everyday Size", "Reinforced Cross-Stitched Handles", "Eco-Friendly Water-Based Inks", "Cash on Delivery Available"]
    },
    {
        "id": "drop-moksha-nirvana-mandala-tee",
        "slug": "moksha-nirvana-mandala-tee",
        "title": "Moksha & Nirvana Sacred Mandala 240 GSM Oversized Acid Wash Tee",
        "category": "fashion",
        "emoji": "🕉️",
        "tag": "Sacred Flow",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 1780,
        "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
        "short": "Multi-layered cosmic mandala with distressed vintage wash. 240 GSM heavy combed cotton.",
        "story": "Transcend the ordinary. Intricate fractal sacred geometry represents liberation and universal awareness on a soft charcoal vintage wash silhouette.",
        "details": ["240 GSM Vintage Washed Cotton", "Loose Streetwear Drop Shoulder", "High-Definition Discharge Screen Print", "Zero Shrinkage Guarantee", "Verified Domestic Quality"]
    },
    {
        "id": "drop-krishna-flute-peacock-mug",
        "slug": "krishna-flute-peacock-mug",
        "title": "Krishna Flute & Peacock Feather Minimalist 350ml Ceramic Mug",
        "category": "home-garden",
        "emoji": "🦚",
        "tag": "Divine Grace",
        "price_inr": 349,
        "compare_at_price": 799,
        "rating": 4.9,
        "reviews": 1890,
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
        "short": "Golden flute and emerald peacock feather line sketch on glossy ivory ceramic.",
        "story": "Elegance, divine music, and joy. Minimalist modern line art celebrating the spirit of Vrindavan on a premium glossy ceramic mug perfect for your desk or home temple altar.",
        "details": ["350ml Generous Volume", "Glossy Fine Porcelain Ceramic", "Comfortable Ergonomic Handle", "Microwave & Dishwasher Safe", "Safe Transit Foam Box Packaging"]
    },

    # =========================================================================
    # 3. GYM, PUMP COVERS & IRON MOTIVATION (8 Drops)
    # =========================================================================
    {
        "id": "drop-iron-discipline-pump-cover-tee",
        "slug": "iron-discipline-pump-cover-tee",
        "title": "Iron Discipline Weightlifting Club 240 GSM Heavyweight Pump Cover",
        "category": "fashion",
        "emoji": "🏋️",
        "tag": "Gym Bestseller",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 3120,
        "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
        "short": "Heavy distressed barbell club backprint. 240 GSM oversized boxy fit for warmups & heavy sets.",
        "story": "Discipline over motivation. Engineered with broad shoulders and extra length for the ultimate gym pump cover that looks just as hard on the street.",
        "details": ["240 GSM Pure Combed Cotton", "Extra Roomy Drop-Shoulder Fit", "Sweat-Resistant Breathable Weave", "High-Density Screen Print", "1-Click COD Ready Across India"]
    },
    {
        "id": "drop-relentless-beast-mode-tee",
        "slug": "relentless-beast-mode-tee",
        "title": "Relentless 'No Excuses' Heavyweight Combed Cotton 240 GSM Tee",
        "category": "fashion",
        "emoji": "🦁",
        "tag": "Iron Mindset",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 1940,
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
        "short": "Savage geometric roaring lion with bold distressed typography. Heavyweight combed cotton.",
        "story": "Silence the doubt. When the weights get heavy, this shirt reminds you of what you're built of. High-density screen print designed to survive countless heavy wash cycles.",
        "details": ["240 GSM 100% Cotton", "Reinforced Neckline with Spandex", "Double Stitched Hem & Cuffs", "Zero Shrinkage", "Pan-India Air Courier Dispatch"]
    },
    {
        "id": "drop-pain-is-fuel-heavyweight-hoodie",
        "slug": "pain-is-fuel-heavyweight-hoodie",
        "title": "Pain Is Fuel Heavy Duty 380 GSM Streetwear & Warmup Hoodie",
        "category": "fashion",
        "emoji": "⚡",
        "tag": "Athlete Pick",
        "price_inr": 1299,
        "compare_at_price": 2799,
        "rating": 4.9,
        "reviews": 2180,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
        "short": "Industrial athletic typography with barbed wire spine graphic. 380 GSM thick brushed fleece.",
        "story": "Turn every setback into horsepower. Built for freezing 5 AM gym sessions and cold winter runs with ultra-dense 380 GSM fleece that traps warmth and maintains structure.",
        "details": ["380 GSM Ultra-Heavy Fleece", "Double Lined Warm Hood", "Heavy Gauge Drawcords", "Reinforced Kangaroo Pocket", "7-Day Easy Return Guarantee"]
    },
    {
        "id": "drop-one-more-rep-stainless-tumbler",
        "slug": "one-more-rep-stainless-tumbler",
        "title": "'One More Rep' 500ml Dual-Wall Vacuum Insulated Gym Tumbler",
        "category": "home-garden",
        "emoji": "🥤",
        "tag": "Hydration Pro",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 1650,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
        "short": "Keeps water ice cold for 24 hours. Food-grade 304 stainless steel with leakproof spout lid.",
        "story": "Hydrate like an athlete. Double-wall vacuum insulation ensures your BCAA or cold water stays frosty even in the hottest workout conditions with zero sweat on the outside.",
        "details": ["500ml Ergonomic Gym Size", "Food-Grade 304 Stainless Steel", "24h Cold / 12h Hot Insulation", "BPA-Free Spill-Proof Sports Cap", "Durable Matte Powder Coat"]
    },
    {
        "id": "drop-conquer-from-within-tee",
        "slug": "conquer-from-within-tee",
        "title": "Conquer From Within Aesthetic Typo 240 GSM Drop Shoulder Tee",
        "category": "fashion",
        "emoji": "🎯",
        "tag": "Focus",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 1420,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
        "short": "Minimalist chest embroidery look with bold back manifesto. 240 GSM heavy cotton.",
        "story": "The greatest victory is conquering yourself. Clean, understated streetwear design that transitions seamlessly from the squat rack to the cafe.",
        "details": ["240 GSM Pure Combed Cotton", "Relaxed Boxy Fit", "Fade-Proof Soft Screen Print", "Pre-Shrunk Fabric", "Domestic Express Delivery"]
    },
    {
        "id": "drop-discomfort-is-growth-sweatshirt",
        "slug": "discomfort-is-growth-sweatshirt",
        "title": "Discomfort is Growth 320 GSM French Terry Athletic Sweatshirt",
        "category": "fashion",
        "emoji": "💪",
        "tag": "Daily Grind",
        "price_inr": 999,
        "compare_at_price": 2199,
        "rating": 4.8,
        "reviews": 1280,
        "image_url": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800",
        "short": "Bold athletic serif lettering with ribbed collar and cuffs. 320 GSM French Terry.",
        "story": "Embrace the struggle. When the workout gets grueling, remember that resistance creates strength. Premium heavy knit designed for peak durability.",
        "details": ["320 GSM French Terry Cotton", "Athletic Crewneck Silhouette", "Reinforced Ribbed Collar & Hem", "Zero Synthetic Polyester Feel", "Cash on Delivery Available"]
    },
    {
        "id": "drop-berserk-guts-gym-pump-cover-tee",
        "slug": "berserk-guts-gym-pump-cover-tee",
        "title": "Guts 'Keep Struggling' Berserk 240 GSM Heavyweight Pump Cover",
        "category": "fashion",
        "emoji": "🗡️",
        "tag": "Hardcore Gym",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 3670,
        "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
        "short": "Dragon Slayer sword in stone with iconic struggle quote. 240 GSM pitch black cotton.",
        "story": "Even if the odds are zero, keep swinging. The ultimate gym motivation shirt celebrating Guts' indomitable willpower with intense crosshatched manga artwork.",
        "details": ["240 GSM Heavy Combed Cotton", "Oversized Drop-Shoulder Cut", "Crack-Proof High Density Ink", "Double Needle Stitching", "1-Click COD Pan-India"]
    },
    {
        "id": "drop-heavyweight-lifting-club-tote",
        "slug": "heavyweight-lifting-club-tote",
        "title": "Heavyweight Lifting Club Tirupur Edition 400 GSM Canvas Tote Bag",
        "category": "general",
        "emoji": "👜",
        "tag": "Gym Utility",
        "price_inr": 399,
        "compare_at_price": 899,
        "rating": 4.8,
        "reviews": 980,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
        "short": "Holds weight belt, lifting shoes, shaker, and chalk without breaking. 400 GSM heavy canvas.",
        "story": "Ditch flimsy gym bags. Heavyweight unbleached canvas construction reinforced at all stress points to carry 15+ kg of gym gear with zero tear risk.",
        "details": ["400 GSM Organic Heavy Canvas", "Reinforced Box Handles", "Inner Key & Phone Pocket", "Eco-Friendly Screen Print", "Domestic Free Shipping"]
    },

    # =========================================================================
    # 4. DARK ACADEMIA & STOIC PHILOSOPHY (8 Drops)
    # =========================================================================
    {
        "id": "drop-memento-mori-skull-rose-tee",
        "slug": "memento-mori-skull-rose-tee",
        "title": "Memento Mori Botanical Skull & Rose 240 GSM Heavyweight Tee",
        "category": "fashion",
        "emoji": "💀",
        "tag": "Stoic Classic",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 3120,
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
        "short": "Remember you must die. Botanical skull wrapped in blooming roses. 240 GSM heavy cotton.",
        "story": "Live deliberately. A striking balance between mortality and vibrant beauty, featuring an anatomically precise skull intertwined with blooming wild roses and Latin script.",
        "details": ["240 GSM Heavyweight Combed Cotton", "Boxy Drop-Shoulder Street Cut", "Fine Line Botanical Screen Print", "Bio-Washed Anti-Pilling Weave", "Cash on Delivery Available"]
    },
    {
        "id": "drop-amor-fati-cosmic-compass-hoodie",
        "slug": "amor-fati-cosmic-compass-hoodie",
        "title": "Amor Fati 'Love Your Fate' 380 GSM Heavyweight Streetwear Hoodie",
        "category": "fashion",
        "emoji": "🧭",
        "tag": "Stoic Mindset",
        "price_inr": 1299,
        "compare_at_price": 2799,
        "rating": 4.9,
        "reviews": 2340,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
        "short": "Nietzschean celestial navigation compass on spine. 380 GSM thick brushed fleece.",
        "story": "Do not merely bear what is necessary, love it. A majestic back mural featuring an astronomical compass surrounded by constellations and Latin philosophy typography.",
        "details": ["380 GSM Heavy Combed Fleece", "Double-Layered Structured Hood", "Metallic Silver & Cream Pigment Inks", "Spacious Kangaroo Pocket", "7-Day Easy Return Guarantee"]
    },
    {
        "id": "drop-marcus-aurelius-meditations-tee",
        "slug": "marcus-aurelius-meditations-tee",
        "title": "Marcus Aurelius Meditations Classical Marble Bust 240 GSM Tee",
        "category": "fashion",
        "emoji": "🏛️",
        "tag": "Philosopher",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 2180,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
        "short": "Chiseled Roman Emperor bust in monochrome lithograph print. 240 GSM heavy cotton.",
        "story": "You have power over your mind, not outside events. The philosophical Emperor of Rome rendered in stunning high-contrast stone texture on heavyweight streetwear cotton.",
        "details": ["240 GSM 100% Combed Cotton", "Heavy Drop-Shoulder Drape", "High-Resolution Halftone Print", "Durable Double-Stitched Collar", "Pan-India Air Courier Dispatch"]
    },
    {
        "id": "drop-the-thinker-ceramic-mug",
        "slug": "the-thinker-ceramic-mug",
        "title": "The Thinker Classical Contemplation 350ml Matte Ceramic Mug",
        "category": "home-garden",
        "emoji": "☕",
        "tag": "Deep Work",
        "price_inr": 349,
        "compare_at_price": 799,
        "rating": 4.8,
        "reviews": 1240,
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
        "short": "Rodin's masterpiece sketch on deep matte black ceramic. Microwave & dishwasher safe.",
        "story": "Fuel deep intellectual work and late-night reading. Fine line sketches of the iconic thinker statue against a velvety matte black finish.",
        "details": ["350ml Optimal Capacity", "Comfort Ergonomic Handle", "Fine-Pore Ceramic Glaze", "Dishwasher Safe", "Drop-Tested Packaging"]
    },
    {
        "id": "drop-ad-astra-through-hardship-desk-mat",
        "slug": "ad-astra-through-hardship-desk-mat",
        "title": "'Per Aspera Ad Astra' Celestial 900x400mm Extended Desk Mat",
        "category": "electronics",
        "emoji": "🌌",
        "tag": "Dark Academia",
        "price_inr": 599,
        "compare_at_price": 1299,
        "rating": 4.9,
        "reviews": 1780,
        "image_url": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800",
        "short": "Through hardships to the stars. Ancient star charts & celestial sphere illustration on speed cloth.",
        "story": "Turn your desk into a 19th-century royal observatory. Features intricate astronomical diagrams, golden constellations, and Latin motto across a 900x400mm surface.",
        "details": ["900 x 400 x 4mm Extra Large Size", "Waterproof Smooth Speed Cloth", "Anti-Fray Precision Stitched Edges", "Non-Skid Heavy Natural Rubber", "1-Click COD Ready"]
    },
    {
        "id": "drop-seneca-letters-stoic-tee",
        "slug": "seneca-letters-stoic-tee",
        "title": "Seneca 'Shortness of Life' Typographic 180 GSM Bio-Washed Tee",
        "category": "fashion",
        "emoji": "⏳",
        "tag": "Minimalist",
        "price_inr": 499,
        "compare_at_price": 999,
        "rating": 4.8,
        "reviews": 1490,
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
        "short": "It is not that we have a short time to live, but that we waste a lot of it. Clean serif typo.",
        "story": "A timeless daily reminder to value your hours. Understated minimalist typography printed with soft-feel water-based inks on breathable combed cotton.",
        "details": ["180 GSM Bio-Washed Cotton", "Classic Tailored Fit", "Ultra-Breathable Soft Weave", "Zero Chafing Tagless Design", "Fast Domestic Express Dispatch"]
    },
    {
        "id": "drop-atlas-bearer-of-heavens-tee",
        "slug": "atlas-bearer-of-heavens-tee",
        "title": "Atlas 'Bearer of the Heavens' 240 GSM Heavyweight Streetwear Tee",
        "category": "fashion",
        "emoji": "🌍",
        "tag": "Mythology",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 2450,
        "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
        "short": "Titan Atlas holding the celestial globe. Intricate classical engraving style on 240 GSM cotton.",
        "story": "Bear the weight of your ambitions. A detailed classical engraving of Atlas holding the cosmos aloft, printed in high-density ink across the spine.",
        "details": ["240 GSM Pure Combed Cotton", "Boxy Drop-Shoulder Streetwear Cut", "Plastisol & Puff Inks", "Preshrunk Color-Locked Fabric", "Doorstep COD Available"]
    },
    {
        "id": "drop-tempus-fugit-vintage-tote-bag",
        "slug": "tempus-fugit-vintage-tote-bag",
        "title": "Tempus Fugit 'Time Flies' Vintage Clockwork 400 GSM Canvas Tote",
        "category": "general",
        "emoji": "👜",
        "tag": "Daily Carry",
        "price_inr": 399,
        "compare_at_price": 899,
        "rating": 4.8,
        "reviews": 1050,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
        "short": "Intricate pocket watch gears with winged hourglass emblem. 400 GSM heavy unbleached canvas.",
        "story": "Time flies, make every second count. A sturdy everyday companion for your laptop, notebook, and books with heavy-duty box stitching that holds up to heavy loads.",
        "details": ["400 GSM Organic Heavy Canvas", "Generous 15 x 16 Inch Size", "Reinforced Cross-Stitched Handles", "Eco-Friendly Inks", "Express Pan-India Delivery"]
    },

    # =========================================================================
    # 5. RETRO VINTAGE, LO-FI & SYNTHWAVE (7 Drops)
    # =========================================================================
    {
        "id": "drop-90s-vintage-cassette-sunset-tee",
        "slug": "90s-vintage-cassette-sunset-tee",
        "title": "90s Vintage Cassette & Tokyo Sunset 240 GSM Vintage Wash Tee",
        "category": "fashion",
        "emoji": "📼",
        "tag": "Retro Nostalgia",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 2340,
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
        "short": "Warm analog tape reels blending into a neon gradient sunset. 240 GSM washed vintage cotton.",
        "story": "Rewind to the analog era. Warm sun-soaked gradient colors evoke the magic of cassette mixtapes and city pop melodies on ultra-soft vintage washed cotton.",
        "details": ["240 GSM Vintage Acid Washed Cotton", "Relaxed Streetwear Silhouette", "High-Resolution Gradient Screen Print", "Soft Hand Feel", "1-Click COD Available"]
    },
    {
        "id": "drop-lofi-beats-midnight-diner-mug",
        "slug": "lofi-beats-midnight-diner-mug",
        "title": "Lo-Fi Chill Beats Midnight Diner 350ml Matte Black Ceramic Mug",
        "category": "home-garden",
        "emoji": "🍜",
        "tag": "Cozy Vibe",
        "price_inr": 349,
        "compare_at_price": 799,
        "rating": 4.9,
        "reviews": 1680,
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
        "short": "Rainy neon ramen bar illustration. High-fired matte ceramic with glossy interior.",
        "story": "Pour a warm brew and put on your favorite lo-fi playlist. Cozy midnight diner illustration brings peaceful study beats aesthetic right to your desk.",
        "details": ["350ml Generous Capacity", "Matte Exterior with Gloss Interior", "Heat-Retentive Thick Ceramic", "Dishwasher Safe", "Safe Drop Box Transit"]
    },
    {
        "id": "drop-vaporwave-statue-1984-desk-mat",
        "slug": "vaporwave-statue-1984-desk-mat",
        "title": "Vaporwave Classical Statue 1984 Glitch 900x400mm Extended Mat",
        "category": "electronics",
        "emoji": "💾",
        "tag": "Synthwave Desk",
        "price_inr": 599,
        "compare_at_price": 1299,
        "rating": 4.9,
        "reviews": 1890,
        "image_url": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800",
        "short": "Pastel pink and cyan digital glitch aesthetic with Greek marble sculpture on speed cloth.",
        "story": "A E S T H E T I C S. Digital glitch artifacts, palm trees, and classical sculptures evoke 80s nostalgia across an expansive 900x400mm desktop workspace.",
        "details": ["900 x 400 x 4mm Extra Large Surface", "Precision Speed Cloth Finish", "360° Anti-Fray Stitched Border", "Anti-Slip Natural Rubber Base", "Tirupur Factory Direct"]
    },
    {
        "id": "drop-synthwave-neon-grid-tee",
        "slug": "synthwave-neon-grid-tee",
        "title": "Synthwave Neon Grid Outrun Horizon 240 GSM Streetwear Tee",
        "category": "fashion",
        "emoji": "🌆",
        "tag": "Cyber Vibe",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 1580,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
        "short": "Hot magenta wireframe landscape with digital wireframe sun. 240 GSM heavy cotton.",
        "story": "Drive into the digital sunset. Inspired by Outrun synth music and retro arcade aesthetics, printed in electric magenta and neon cyan on pitch black combed cotton.",
        "details": ["240 GSM Heavyweight Cotton", "Drop-Shoulder Cut", "Crack-Resistant Plastisol Ink", "Bio-Washed Anti-Fuzz Finish", "Cash on Delivery Available"]
    },
    {
        "id": "drop-retro-pixel-heart-arcade-tee",
        "slug": "retro-pixel-heart-arcade-tee",
        "title": "8-Bit Retro Pixel Heart 'Level Up' 180 GSM Classic Tee",
        "category": "fashion",
        "emoji": "👾",
        "tag": "Gamer Classic",
        "price_inr": 499,
        "compare_at_price": 999,
        "rating": 4.8,
        "reviews": 1390,
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
        "short": "Minimalist red 8-bit heart emblem on chest. 180 GSM bio-washed combed cotton.",
        "story": "For those who grew up blowing into game cartridges. Understated retro gaming nostalgia that looks stylish and clean with any streetwear outfit.",
        "details": ["180 GSM Bio-Washed Combed Cotton", "Classic Tailored Fit", "High-Precision Pixel Screen Print", "Soft Fabric Hand Feel", "Domestic Express Delivery"]
    },
    {
        "id": "drop-midnight-lofi-rain-hoodie",
        "slug": "midnight-lofi-rain-hoodie",
        "title": "Midnight Lo-Fi Rainy City 380 GSM Heavyweight Streetwear Hoodie",
        "category": "fashion",
        "emoji": "🌧️",
        "tag": "Cozy Street",
        "price_inr": 1299,
        "compare_at_price": 2799,
        "rating": 4.9,
        "reviews": 2150,
        "image_url": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800",
        "short": "Rain streaks reflecting neon city lights with Japanese script. 380 GSM thick brushed fleece.",
        "story": "Ultimate cozy warmth for rainy nights and late study sessions. The thick 380 GSM fleece envelops you in complete comfort with an eye-catching atmospheric back mural.",
        "details": ["380 GSM Heavy Combed Fleece", "Double-Layered Thermal Hood", "Soft High-Resolution Pigment Print", "Heavy Kangaroo Pouch", "Free Replacement for Defects"]
    },
    {
        "id": "drop-cyber-outrun-stainless-tumbler",
        "slug": "cyber-outrun-stainless-tumbler",
        "title": "Cyber Outrun Night Rider 500ml Dual-Wall Stainless Steel Tumbler",
        "category": "home-garden",
        "emoji": "🥤",
        "tag": "Insulated Gear",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 1420,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
        "short": "Neon purple sports car grid artwork. Keeps drinks hot for 12h or cold for 24h.",
        "story": "Hydration with an 80s synthwave pulse. Durable powder-coated stainless steel with vacuum insulation that never leaves condensation rings on your wooden desk.",
        "details": ["500ml Optimal Desk Capacity", "Food-Grade 304 Stainless Steel", "Vacuum Temperature Seal", "Leak-Proof Flip Lid", "Doorstep COD Ready"]
    },

    # =========================================================================
    # 6. MINIMALIST CREATOR, CODING & WORKSPACE CULTURE (7 Drops)
    # =========================================================================
    {
        "id": "drop-fueled-by-caffeine-ceramic-mug",
        "slug": "fueled-by-caffeine-ceramic-mug",
        "title": "'Fueled by Caffeine & Ambition' 350ml Matte Black Ceramic Mug",
        "category": "home-garden",
        "emoji": "☕",
        "tag": "Founder Essential",
        "price_inr": 349,
        "compare_at_price": 799,
        "rating": 4.9,
        "reviews": 2890,
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
        "short": "Crisp white minimalist typography on matte black ceramic. 350ml capacity for coffee & chai.",
        "story": "The unofficial uniform of developers, founders, and creators. High-density fired ceramic that keeps your brew hot while looking sharp on any desk setup.",
        "details": ["350ml Coffee & Chai Capacity", "Matte Black Glaze Finish", "Comfortable Ergonomic Handle", "Microwave & Dishwasher Safe", "Drop-Safe Foam Packaging"]
    },
    {
        "id": "drop-out-of-office-offline-tee",
        "slug": "out-of-office-offline-tee",
        "title": "'Out of Office / Offline Mode' 240 GSM Oversized Drop Shoulder Tee",
        "category": "fashion",
        "emoji": "🔕",
        "tag": "Creator Mode",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.8,
        "reviews": 2180,
        "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
        "short": "Minimalist system notification modal: 'Do Not Disturb'. 240 GSM heavy combed cotton.",
        "story": "Protect your peace. Clean minimalist UI window graphic on the back with small chest badge that lets the world know you're in deep creation mode.",
        "details": ["240 GSM Heavyweight Combed Cotton", "Drop-Shoulder Boxy Streetwear Cut", "Precision Screen Print", "Preshrunk Anti-Pilling Finish", "1-Click COD Pan-India"]
    },
    {
        "id": "drop-midnight-coding-club-desk-mat",
        "slug": "midnight-coding-club-desk-mat",
        "title": "Midnight Coding Club 'Commit & Push' 900x400mm Extended Desk Mat",
        "category": "electronics",
        "emoji": "💻",
        "tag": "Dev Setup",
        "price_inr": 599,
        "compare_at_price": 1299,
        "rating": 4.9,
        "reviews": 2450,
        "image_url": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800",
        "short": "Clean dark terminal theme with syntax highlighting accents. Speed micro-weave cloth surface.",
        "story": "The centerpiece for late night commits. Designed specifically for developers and mechanical keyboard enthusiasts who demand ultra-precise mouse tracking and cushioned wrist support.",
        "details": ["900 x 400 x 4mm Extra Large Mat", "Waterproof Smooth Micro-Weave", "Reinforced Anti-Fray Stitched Edges", "Non-Slip Heavy Rubber Base", "Tirupur Factory Direct"]
    },
    {
        "id": "drop-overthinking-in-4k-tee",
        "slug": "overthinking-in-4k-tee",
        "title": "'Overthinking in 4K High Definition' 240 GSM Heavyweight Tee",
        "category": "fashion",
        "emoji": "🧠",
        "tag": "Relatable Street",
        "price_inr": 699,
        "compare_at_price": 1499,
        "rating": 4.9,
        "reviews": 3210,
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
        "short": "Glitch wireframe brain with retro cyber scanlines. 240 GSM pure combed cotton.",
        "story": "Why overthink in standard definition when you can do it in 4K? A witty, hyper-relatable graphic rendered in sleek cybernetic wireframe style on heavyweight black cotton.",
        "details": ["240 GSM 100% Combed Cotton", "Boxy Drop Shoulder Fit", "High-Density Screen Print", "Bio-Washed Anti-Shrink", "Fast Express Delivery Across India"]
    },
    {
        "id": "drop-work-in-silence-hoodie",
        "slug": "work-in-silence-hoodie",
        "title": "'Work in Silence' Heavy Duty 380 GSM Streetwear Hoodie",
        "category": "fashion",
        "emoji": "🤫",
        "tag": "Hustle Drop",
        "price_inr": 1299,
        "compare_at_price": 2799,
        "rating": 4.9,
        "reviews": 2680,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
        "short": "Let success make the noise. Architectural typography on 380 GSM thick brushed fleece.",
        "story": "Keep your head down, build your empire, and let the results speak. Premium heavyweight streetwear hoodie engineered to keep you warm and focused.",
        "details": ["380 GSM Ultra-Heavy Brushed Fleece", "Structured Double Hood with Thick Cords", "Reinforced Seams & Kangaroo Pocket", "Color-Fast Pigment Inks", "7-Day Free Replacement"]
    },
    {
        "id": "drop-eat-sleep-code-repeat-tee",
        "slug": "eat-sleep-code-repeat-tee",
        "title": "Eat Sleep Code Repeat Minimalist Monospace 180 GSM Classic Tee",
        "category": "fashion",
        "emoji": "⌨️",
        "tag": "Coder Essential",
        "price_inr": 499,
        "compare_at_price": 999,
        "rating": 4.8,
        "reviews": 1820,
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
        "short": "Clean syntax terminal monospace typography. 180 GSM breathable combed cotton.",
        "story": "The eternal developer loop. Simple, understated, and comfortable enough to wear during 14-hour marathon coding sprints or casual coffee runs.",
        "details": ["180 GSM Bio-Washed Combed Cotton", "Classic Tailored Fit", "Soft Breathable Weave", "Tagless Zero-Chafing Collar", "Cash on Delivery Available"]
    },
    {
        "id": "drop-rare-human-limited-edition-tote",
        "slug": "rare-human-limited-edition-tote",
        "title": "Rare Human / Limited Edition Batch #001 400 GSM Heavy Canvas Tote",
        "category": "general",
        "emoji": "👜",
        "tag": "Signature",
        "price_inr": 399,
        "compare_at_price": 899,
        "rating": 4.9,
        "reviews": 1640,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
        "short": "Signature RareEmber manifest badge on 400 GSM unbleached heavy canvas. Heavy duty handles.",
        "story": "You are one of one. Crafted from heavy unbleached organic cotton with a minimalist typographic badge celebrating authenticity, rare finds, and independent creator spirit.",
        "details": ["400 GSM Ultra-Heavy Cotton Canvas", "Spacious 15 x 16 Inch Dimensions", "Reinforced Box-Stitch Handles", "Eco-Friendly Inks", "Pan-India 2-4 Day Air Express"]
    }
]

def seed_database():
    print(f"🚀 [SEEDER] Preparing to upsert {len(PRODUCTS_50)} viral trending drops into Supabase...")
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    con = pg8000.native.Connection(
        host=SUPABASE_DB_HOST,
        port=SUPABASE_DB_PORT,
        user=SUPABASE_DB_USER,
        password=SUPABASE_DB_PASS,
        database=SUPABASE_DB_NAME,
        ssl_context=ctx,
        timeout=25,
    )

    upserted_count = 0
    for p in PRODUCTS_50:
        details_json = json.dumps(p["details"])
        price_inr = float(p["price_inr"])
        price_usd = round(price_inr / 85.0, 2)
        compare_at = float(p["compare_at_price"])
        
        con.run("""
            INSERT INTO products (
                id, slug, title, short, story, description,
                price, price_inr, compare_at_price, category,
                emoji, tag, tag_color, tag_bg,
                image_url, stock, active, is_trending, is_new,
                market, supplier, gradient, chapter,
                rating, reviews, details,
                benefits, safety, vet_note, badges, subscribe_eligible,
                created_at, updated_at
            ) VALUES (
                :id, :slug, :title, :short, :story, :story,
                :price_usd, :price_inr, :compare_at, :category,
                :emoji, :tag, '#FF4D24', 'rgba(255,77,36,0.12)',
                :image_url, 150, true, true, true,
                'IN', 'Tirupur Hub / Qikink Domestic Direct', 'linear-gradient(135deg, #18181b, #09090b)', '01',
                :rating, :reviews, :details::jsonb,
                '{"100% Domestic Manufacturing","Express Pan-India Air Dispatch","Doorstep Cash on Delivery"}',
                'Pre-shrunk, bio-washed, certified non-toxic organic pigment inks.',
                'Dispatched direct from Tirupur factory with 7-Day Free Doorstep Replacement.',
                '{"Verified Bestseller","Tirupur Quality","Zero Loss Protected"}',
                false,
                NOW(), NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                short = EXCLUDED.short,
                story = EXCLUDED.story,
                description = EXCLUDED.description,
                price = EXCLUDED.price,
                price_inr = EXCLUDED.price_inr,
                compare_at_price = EXCLUDED.compare_at_price,
                category = EXCLUDED.category,
                emoji = EXCLUDED.emoji,
                tag = EXCLUDED.tag,
                image_url = EXCLUDED.image_url,
                stock = EXCLUDED.stock,
                active = true,
                is_trending = true,
                is_new = true,
                rating = EXCLUDED.rating,
                reviews = EXCLUDED.reviews,
                details = EXCLUDED.details,
                updated_at = NOW()
        """,
            id=p["id"],
            slug=p["slug"],
            title=p["title"],
            short=p["short"],
            story=p["story"],
            price_usd=price_usd,
            price_inr=price_inr,
            compare_at=compare_at,
            category=p["category"],
            emoji=p["emoji"],
            tag=p["tag"],
            image_url=p["image_url"],
            rating=float(p["rating"]),
            reviews=int(p["reviews"]),
            details=details_json
        )
        upserted_count += 1
        print(f"  [{upserted_count}/50] Upserted: {p['title'][:45]} (₹{p['price_inr']})")

    con.close()
    print(f"\n✅ [SEEDER COMPLETE] Successfully upserted all {upserted_count} viral trending products to Supabase!")

if __name__ == "__main__":
    seed_database()
