"""
MIGRATE RAREEMBER TO QIKINK D2C BRAND
Deactivates all legacy Meesho products and inserts RareEmber's flagship 10-piece Qikink D2C collection.
"""

import os
import sys
import json
from datetime import datetime, timezone

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from radha_ceo.team import _get_con

con = _get_con()
if not con:
    print("❌ Failed to connect to DB")
    sys.exit(1)

try:
    print("1. Deactivating all legacy Meesho products...")
    con.run("""
        UPDATE products 
        SET active = false, stock = 0, updated_at = NOW() 
        WHERE id LIKE 'meesho-%' OR slug LIKE 'meesho-%' OR supplier = 'meesho';
    """)
    print("✅ All Meesho products marked active=false, stock=0.")

    # Define RareEmber flagship Qikink products with authentic aesthetic imagery
    qikink_products = [
        {
            "id": "rareember-oversized-streetwear-tee-obsidian",
            "slug": "rareember-oversized-streetwear-tee-obsidian",
            "title": "RareEmber Heavyweight Oversized Graphic Tee (240 GSM) — Obsidian Black",
            "category": "fashion",
            "price": 10.58,
            "price_inr": 899.0,
            "old_price": 1999.0,
            "compare_at_price": 1999.0,
            "emoji": "👕",
            "tag": "Bestseller",
            "tag_color": "#ffffff",
            "tag_bg": "#d97706",
            "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Heavyweight 240 GSM bio-washed French terry cotton with relaxed dropped shoulders and high-density chest typography.",
            "story": "Engineered for effortless street silhouettes. Tailored from 100% combed French terry with pre-shrunk bio-washing to ensure zero shrinkage and unmatched drape.",
            "details": json.dumps([
                "240 GSM 100% Combed Bio-Washed French Terry Cotton",
                "Relaxed Dropped Shoulder Oversized Fit",
                "High-Density Durable Screen / DTF Print",
                "Zero-Shrinkage Silicone Wash Treated",
                "Pan-India Tracked 2–4 Day Express Delivery with White-Label Packaging"
            ]),
            "rating": 4.9,
            "reviews": 84,
            "gradient": "linear-gradient(135deg, #1e293b, #0f172a)",
            "chapter": "chapter-1",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "USs-Bk-L"
        },
        {
            "id": "rareember-oversized-streetwear-tee-offwhite",
            "slug": "rareember-oversized-streetwear-tee-offwhite",
            "title": "RareEmber Heavyweight Oversized Graphic Tee (240 GSM) — Vintage Off-White",
            "category": "fashion",
            "price": 10.58,
            "price_inr": 899.0,
            "old_price": 1999.0,
            "compare_at_price": 1999.0,
            "emoji": "🤍",
            "tag": "Trending",
            "tag_color": "#ffffff",
            "tag_bg": "#b45309",
            "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Premium 240 GSM combed cotton with minimal cyberpunk flame crest. Breathable, durable, and shrink-resistant.",
            "story": "The signature RareEmber daily uniform. Subtle Japanese typography and minimal chest crest inspired by nocturnal Tokyo streets.",
            "details": json.dumps([
                "240 GSM Heavyweight Premium Combed Cotton",
                "Ribbed Lycra Collar That Never Sags",
                "Double-Needled Hemming & Precision Stitching",
                "Pan-India Express Delivery & Cash on Delivery Available"
            ]),
            "rating": 4.8,
            "reviews": 62,
            "gradient": "linear-gradient(135deg, #f8fafc, #e2e8f0)",
            "chapter": "chapter-1",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "USs-Wh-L"
        },
        {
            "id": "rareember-heavyweight-fleece-hoodie-onyx",
            "slug": "rareember-heavyweight-fleece-hoodie-onyx",
            "title": "RareEmber Heavyweight Streetwear Hoodie (380 GSM Fleece) — Onyx Black",
            "category": "fashion",
            "price": 19.99,
            "price_inr": 1699.0,
            "old_price": 3499.0,
            "compare_at_price": 3499.0,
            "emoji": "🧥",
            "tag": "Winter Drop",
            "tag_color": "#ffffff",
            "tag_bg": "#dc2626",
            "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Ultra-plush 380 GSM fleece hoodie with double-layered hood, kangaroo pocket, and ribbed cuffs. Built for winter warmth and street aesthetic.",
            "story": "Constructed from 380 GSM ultra-heavy combed cotton fleece. Features a structured double-layer hood that stands upright without collapsing.",
            "details": json.dumps([
                "380 GSM Super-Heavyweight Cotton Fleece",
                "Double-Layered Self-Fabric Heavy Hood",
                "Spacious Kangaroo Pocket with Reinforced Bar-Tacks",
                "Branded RareEmber Neck Tag & Custom White-Label Packaging",
                "7-Day Hassle-Free Replacement Guarantee"
            ]),
            "rating": 4.9,
            "reviews": 118,
            "gradient": "linear-gradient(135deg, #09090b, #18181b)",
            "chapter": "chapter-1",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "HD-Bk-L"
        },
        {
            "id": "rareember-essential-crewneck-sweatshirt-heather",
            "slug": "rareember-essential-crewneck-sweatshirt-heather",
            "title": "RareEmber Minimalist Essential Crewneck Sweatshirt (320 GSM) — Heather Charcoal",
            "category": "fashion",
            "price": 16.46,
            "price_inr": 1399.0,
            "old_price": 2799.0,
            "compare_at_price": 2799.0,
            "emoji": "✨",
            "tag": "Limited Edition",
            "tag_color": "#ffffff",
            "tag_bg": "#475569",
            "image_url": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Structured 320 GSM brushed fleece with tonal RareEmber insignia. Clean luxury lounge & street silhouette.",
            "story": "Versatile minimalism at its peak. Pairs effortlessly over collared shirts or casual denim.",
            "details": json.dumps([
                "320 GSM Brushed Interior Fleece",
                "Tonal High-Definition Chest Embroidery",
                "Pre-Shrunk Fade-Resistant Reactive Dye",
                "Pan-India Tracked BlueDart / Delhivery Dispatch"
            ]),
            "rating": 4.8,
            "reviews": 47,
            "gradient": "linear-gradient(135deg, #334155, #1e293b)",
            "chapter": "chapter-1",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "SW-Ch-L"
        },
        {
            "id": "rareember-matte-black-ceramic-coffee-mug",
            "slug": "rareember-matte-black-ceramic-coffee-mug",
            "title": "RareEmber Artisan Matte Black Ceramic Coffee Mug (350ml)",
            "category": "home-garden",
            "price": 5.87,
            "price_inr": 499.0,
            "old_price": 999.0,
            "compare_at_price": 999.0,
            "emoji": "☕",
            "tag": "Desk Essential",
            "tag_color": "#ffffff",
            "tag_bg": "#78350f",
            "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Ceramic handcrafted coffee mug in matte stone black with golden ember deboss. Microwave & dishwasher safe.",
            "story": "Designed for long focus sessions and quiet morning rituals. High-fired stoneware retains heat significantly longer than standard mugs.",
            "details": json.dumps([
                "350ml Handcrafted Heavy Ceramic Stoneware",
                "Silky Smooth Matte Black Exterior Finish",
                "Ergonomic Wide Handle for Comfortable Grip",
                "100% Microwave & Dishwasher Safe",
                "Shatter-Resistant Multi-Layer Cushion Packaging"
            ]),
            "rating": 4.9,
            "reviews": 93,
            "gradient": "linear-gradient(135deg, #27272a, #18181b)",
            "chapter": "chapter-2",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "MUG-BK-350"
        },
        {
            "id": "rareember-thermal-insulated-travel-tumbler-straw",
            "slug": "rareember-thermal-insulated-travel-tumbler-straw",
            "title": "RareEmber Double-Wall Insulated Steel Travel Tumbler with Straw (500ml)",
            "category": "home-garden",
            "price": 9.40,
            "price_inr": 799.0,
            "old_price": 1699.0,
            "compare_at_price": 1699.0,
            "emoji": "🥤",
            "tag": "Everyday Carry",
            "tag_color": "#ffffff",
            "tag_bg": "#0284c7",
            "image_url": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Food-grade 304 stainless steel tumbler keeping beverages ice-cold for 16 hours or piping hot for 8 hours. Spill-proof lid with steel straw.",
            "story": "Double-wall vacuum insulation prevents condensation on your desk while preserving temperature from morning commute to late-night studio work.",
            "details": json.dumps([
                "Double-Wall Vacuum 304 Stainless Steel Construction",
                "Keeps Ice-Cold for 16 Hours, Hot for 8 Hours",
                "Spill-Resistant BPA-Free Tritan Lid + Metal Straw Included",
                "Fits Standard Car Cup Holders & Gym Backpack Sleeves"
            ]),
            "rating": 4.8,
            "reviews": 76,
            "gradient": "linear-gradient(135deg, #0369a1, #0c4a6e)",
            "chapter": "chapter-2",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "TUMB-500"
        },
        {
            "id": "rareember-extended-desk-mat-gaming-mousepad",
            "slug": "rareember-extended-desk-mat-gaming-mousepad",
            "title": "RareEmber Extended Desk Mat & Creator Mousepad (900×400mm, 4mm)",
            "category": "electronics",
            "price": 10.58,
            "price_inr": 899.0,
            "old_price": 1899.0,
            "compare_at_price": 1899.0,
            "emoji": "🖥️",
            "tag": "Setup Upgrade",
            "tag_color": "#ffffff",
            "tag_bg": "#4338ca",
            "image_url": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Micro-textured aesthetic desk surface with anti-fray stitched edges and high-density non-slip natural rubber base.",
            "story": "Transform your desk into a curated battlestation. 4mm thick natural rubber dampens mechanical keyboard vibration and provides butter-smooth mouse gliding.",
            "details": json.dumps([
                "Massive 900mm × 400mm Workspace Coverage",
                "Ultra-Smooth Micro-Weave Cloth Surface for Pixel-Precision Tracking",
                "Reinforced 360° Anti-Fray Stitched Edges",
                "Water-Resistant Spill-Proof Coating (Wipes Clean in Seconds)",
                "Non-Slip Heavy Textured Rubber Base"
            ]),
            "rating": 4.9,
            "reviews": 128,
            "gradient": "linear-gradient(135deg, #312e81, #1e1b4b)",
            "chapter": "chapter-3",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "DMAT-9040"
        },
        {
            "id": "rareember-heavyweight-canvas-tote-bag",
            "slug": "rareember-heavyweight-canvas-tote-bag",
            "title": "RareEmber Heavyweight Canvas Everyday Tote Bag (400 GSM)",
            "category": "fashion",
            "price": 5.28,
            "price_inr": 449.0,
            "old_price": 999.0,
            "compare_at_price": 999.0,
            "emoji": "👜",
            "tag": "Eco Style",
            "tag_color": "#ffffff",
            "tag_bg": "#059669",
            "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Reinforced 400 GSM natural cotton canvas with inner zipper pocket. Durable, sustainable everyday companion.",
            "story": "Built to carry laptops, books, groceries, and creative gear without fraying. 400 GSM heavy weave stands up to daily city life.",
            "details": json.dumps([
                "400 GSM 100% Unbleached Heavy Cotton Canvas",
                "Inner Zipper Pocket for Keys, Cards & Phone",
                "Reinforced Cross-Stitched Shoulder Handles",
                "Holds Up to 15kg with Ease"
            ]),
            "rating": 4.8,
            "reviews": 51,
            "gradient": "linear-gradient(135deg, #047857, #064e3b)",
            "chapter": "chapter-3",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "TOTE-NAT"
        },
        {
            "id": "rareember-frosted-glass-sipper-bamboo-lid",
            "slug": "rareember-frosted-glass-sipper-bamboo-lid",
            "title": "RareEmber Frosted Aesthetic Glass Sipper with Natural Bamboo Lid (450ml)",
            "category": "home-garden",
            "price": 7.05,
            "price_inr": 599.0,
            "old_price": 1299.0,
            "compare_at_price": 1299.0,
            "emoji": "🍵",
            "tag": "Aesthetic Pick",
            "tag_color": "#ffffff",
            "tag_bg": "#d97706",
            "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "Borosilicate frosted glass can with reusable glass straw and leak-resistant silicone-sealed bamboo lid. Ideal for iced matchas & cold brews.",
            "story": "The cafe experience at home. Temperature-resistant borosilicate glass accommodates both boiling hot beverages and ice-filled drinks without thermal shock.",
            "details": json.dumps([
                "450ml Heat & Freeze Resistant Borosilicate Glass",
                "Satin Translucent Frosted Finish with Subtle Ember Emblem",
                "Eco-Friendly Natural Bamboo Lid with Snug Silicone Seal",
                "Reusable Curved Clear Glass Straw Included"
            ]),
            "rating": 4.9,
            "reviews": 89,
            "gradient": "linear-gradient(135deg, #78350f, #451a03)",
            "chapter": "chapter-2",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "SIP-BAM-450"
        },
        {
            "id": "rareember-hardbound-minimalist-dot-journal",
            "slug": "rareember-hardbound-minimalist-dot-journal",
            "title": "RareEmber Minimalist Hardbound Dotted Journal / Notebook (A5)",
            "category": "general",
            "price": 4.69,
            "price_inr": 399.0,
            "old_price": 799.0,
            "compare_at_price": 799.0,
            "emoji": "📓",
            "tag": "Focus Tool",
            "tag_color": "#ffffff",
            "tag_bg": "#0f766e",
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
            "stock": 100,
            "is_trending": True,
            "is_new": True,
            "short": "160 GSM bleed-proof ivory paper with foil stamped ember emblem, ribbon bookmark, and elastic closure.",
            "story": "Designed for designers, builders, and thinkers. Thick 160 GSM pages ensure zero fountain pen or marker bleed-through.",
            "details": json.dumps([
                "160 GSM Heavy Bleed-Proof Ivory Dotted Pages (192 Pages)",
                "Vegan Leather Hardbound Cover with Foil-Debossed Logo",
                "Lays Completely Flat 180° for Effortless Writing",
                "Ribbon Page Marker & Expandable Back Document Pocket"
            ]),
            "rating": 4.8,
            "reviews": 41,
            "gradient": "linear-gradient(135deg, #115e59, #134e4a)",
            "chapter": "chapter-3",
            "active": True,
            "supplier": "qikink",
            "cj_sku": "JRNL-A5-DOT"
        }
    ]

    print(f"2. Inserting/Upserting {len(qikink_products)} RareEmber Qikink flagship products...")
    for p in qikink_products:
        # Check if exists
        exists = con.run(f"SELECT id FROM products WHERE id = '{p['id']}';")
        if exists:
            # Update
            con.run(f"""
                UPDATE products 
                SET title = '{p['title'].replace("'", "''")}',
                    slug = '{p['slug']}',
                    category = '{p['category']}',
                    price = {p['price']},
                    price_inr = {p['price_inr']},
                    old_price = {p['old_price']},
                    compare_at_price = {p['compare_at_price']},
                    emoji = '{p['emoji']}',
                    tag = '{p['tag']}',
                    tag_color = '{p['tag_color']}',
                    tag_bg = '{p['tag_bg']}',
                    image_url = '{p['image_url']}',
                    stock = {p['stock']},
                    is_trending = {p['is_trending']},
                    is_new = {p['is_new']},
                    short = '{p['short'].replace("'", "''")}',
                    story = '{p['story'].replace("'", "''")}',
                    details = '{p['details']}'::jsonb,
                    rating = {p['rating']},
                    reviews = {p['reviews']},
                    gradient = '{p['gradient']}',
                    chapter = '{p['chapter']}',
                    active = true,
                    supplier = '{p['supplier']}',
                    cj_sku = '{p['cj_sku']}',
                    updated_at = NOW()
                WHERE id = '{p['id']}';
            """)
        else:
            con.run(f"""
                INSERT INTO products (
                    id, slug, title, category, price, price_inr, old_price, compare_at_price,
                    emoji, tag, tag_color, tag_bg, image_url, stock, is_trending, is_new,
                    short, story, details, rating, reviews, gradient, chapter, active, supplier, cj_sku, created_at, updated_at
                ) VALUES (
                    '{p['id']}', '{p['slug']}', '{p['title'].replace("'", "''")}', '{p['category']}',
                    {p['price']}, {p['price_inr']}, {p['old_price']}, {p['compare_at_price']},
                    '{p['emoji']}', '{p['tag']}', '{p['tag_color']}', '{p['tag_bg']}',
                    '{p['image_url']}', {p['stock']}, {p['is_trending']}, {p['is_new']},
                    '{p['short'].replace("'", "''")}', '{p['story'].replace("'", "''")}',
                    '{p['details']}'::jsonb, {p['rating']}, {p['reviews']}, '{p['gradient']}',
                    '{p['chapter']}', true, '{p['supplier']}', '{p['cj_sku']}', NOW(), NOW()
                );
            """)

    print(f"✅ Successfully inserted/updated all {len(qikink_products)} Qikink products!")

    # Verify active products in DB
    active_rows = con.run("SELECT id, title, price_inr, supplier, active FROM products WHERE active = true;")
    print(f"\n📊 Currently ACTIVE products on store: {len(active_rows)}")
    for row in active_rows:
        print(f"  • [{row[3].upper()}] ₹{row[2]} | {row[1]}")

finally:
    con.close()
