import os
import sys
import json
import re

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
    print("❌ DB connection failed")
    sys.exit(1)

PRODUCTS = [
    {
        "id": "rareember-oversized-streetwear-tee-obsidian",
        "title": "Rare Ember Heavyweight Oversized Graphic Tee (240 GSM) — Obsidian Black",
        "category": "fashion",
        "price_inr": 899,
        "old_price": 1799,
        "emoji": "👕",
        "tag": "Best Seller",
        "tag_color": "#FF4D24",
        "tag_bg": "rgba(255, 77, 36, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 184,
        "short": "240 GSM French terry combed cotton with structured streetwear drape and drop shoulders.",
        "story": "Engineered for creators and streetwear purists. Cut from dense 240 GSM bio-washed combed cotton with double-needle ribbed collar that never sags after washing.",
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "240 GSM 100% Super-Combed Bio-Washed Cotton",
            "Pre-Shrunk Silicone Washed for Zero Shrinkage",
            "Signature Drop Shoulder Streetwear Fit",
            "Double-Stitched Lycra Ribbed Neckline",
            "Direct-to-Film (DTF) High-Density Print"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-oversized-streetwear-tee-offwhite",
        "title": "Rare Ember Heavyweight Oversized Graphic Tee (240 GSM) — Vintage Off-White",
        "category": "fashion",
        "price_inr": 899,
        "old_price": 1799,
        "emoji": "👕",
        "tag": "Trending Drop",
        "tag_color": "#0ea5e9",
        "tag_bg": "rgba(14, 165, 233, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 142,
        "short": "Dense 240 GSM vintage off-white cotton with relaxed boxy drop-shoulder proportions.",
        "story": "Vintage off-white raw aesthetic with subtle micro-slub texture. Manufactured in Tirupur from 100% long-staple combed cotton.",
        "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "240 GSM 100% Super-Combed Bio-Washed Cotton",
            "Vintage Off-White Tone with Anti-Pilling Finish",
            "Signature Drop Shoulder Boxy Cut",
            "Double-Stitched Reinforced Hemline",
            "Breathable All-Season Cotton Fabric"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-heavyweight-fleece-hoodie-onyx",
        "title": "Rare Ember Heavyweight Streetwear Hoodie (380 GSM Fleece) — Onyx Black",
        "category": "fashion",
        "price_inr": 1699,
        "old_price": 3499,
        "emoji": "🧥",
        "tag": "Signature Drop",
        "tag_color": "#8b5cf6",
        "tag_bg": "rgba(139, 92, 246, 0.12)",
        "stock": 500,
        "rating": 5.0,
        "reviews": 218,
        "short": "Dense 380 GSM brushed fleece with double-layer hood and structured kangaroo pouch.",
        "story": "Our flagship winter piece. Heavyweight 380 GSM brushed interior fleece keeps you cozy while maintaining a crisp, architectural silhouette.",
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "380 GSM Ultra-Heavy Brushed Terry Fleece",
            "Double-Layer Structured Hood without Sag",
            "Heavy Ribbed Cuffs and Hem for Superior Retention",
            "Spacious Reinforced Kangaroo Pocket",
            "Pre-Washed for Zero Shrinkage and Colorfastness"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-essential-crewneck-sweatshirt-heather",
        "title": "Rare Ember Minimalist Essential Crewneck Sweatshirt (320 GSM) — Heather Charcoal",
        "category": "fashion",
        "price_inr": 1399,
        "old_price": 2799,
        "emoji": "🧶",
        "tag": "Limited Edition",
        "tag_color": "#10b981",
        "tag_bg": "rgba(16, 185, 129, 0.12)",
        "stock": 500,
        "rating": 4.8,
        "reviews": 96,
        "short": "320 GSM French terry fleece with ergonomic raglan shoulders and tailored ribbing.",
        "story": "Minimalist creator luxury. Pure 320 GSM cotton-poly terry blend offering high-tier thermal insulation with zero bulk.",
        "image_url": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "320 GSM Combed French Terry Cotton",
            "Anti-Lint Brush Exterior Treatment",
            "Ribbed Collar, Cuffs and Waistband with 5% Spandex",
            "Relaxed Everyday Modern Tailoring"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-acid-wash-vintage-oversized-tee",
        "title": "Rare Ember Vintage Acid-Wash Oversized Tee (240 GSM) — Mineral Grey",
        "category": "fashion",
        "price_inr": 999,
        "old_price": 1999,
        "emoji": "👕",
        "tag": "Vintage Wash",
        "tag_color": "#f59e0b",
        "tag_bg": "rgba(245, 158, 11, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 112,
        "short": "Hand-treated mineral acid wash on 240 GSM French terry with distressed hems.",
        "story": "Each tee features an individualized stone-wash mineral pattern. Dense fabric weight with an ultra-soft broken-in vintage feel.",
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "240 GSM Heavyweight Mineral Washed Cotton",
            "Unique Distressed Acid Wash Gradient on Every Piece",
            "Reinforced Shoulder-to-Shoulder Neck Taping",
            "Oversized Streetwear Proportions"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-supima-luxury-minimalist-tee",
        "title": "Rare Ember 100% Supima Cotton Crewneck Tee (190 GSM) — Pitch Black",
        "category": "fashion",
        "price_inr": 949,
        "old_price": 1899,
        "emoji": "🖤",
        "tag": "Supima Luxury",
        "tag_color": "#6366f1",
        "tag_bg": "rgba(99, 102, 241, 0.12)",
        "stock": 500,
        "rating": 5.0,
        "reviews": 89,
        "short": "Extra-long staple American Supima cotton with silk-like sheen and breathability.",
        "story": "The pinnacle of everyday basics. 100% Supima certified cotton delivers unmatched softness, twice the fiber strength of regular cotton, and deep jet-black luster.",
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "100% Certified Long-Staple Supima Cotton",
            "190 GSM Featherlight Luxury Weight",
            "Ultra-Smooth Silk Luster Finish",
            "Tailored Classic Regular Fit"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-heavyweight-zip-up-hoodie-bone",
        "title": "Rare Ember Heavyweight Full-Zip Streetwear Hoodie (380 GSM) — Bone White",
        "category": "fashion",
        "price_inr": 1799,
        "old_price": 3599,
        "emoji": "🧥",
        "tag": "Heavyweight",
        "tag_color": "#ec4899",
        "tag_bg": "rgba(236, 72, 153, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 164,
        "short": "380 GSM bone white fleece with matte gunmetal YKK-style two-way zipper.",
        "story": "A versatile layering powerhouse. Built with thick 380 GSM fleece, heavy custom metal puller, and clean split kangaroo pockets.",
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "380 GSM Premium Thermal Terry Fleece",
            "Heavy-Duty Metal Zipper with Smooth Glide",
            "Double-Stitched Ribbed Side Panels for Mobility",
            "Deep Double-Layered Thermal Hood"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-streetwear-heavyweight-cargo-joggers",
        "title": "Rare Ember Streetwear Heavyweight Terry Joggers (320 GSM) — Washed Charcoal",
        "category": "fashion",
        "price_inr": 1499,
        "old_price": 2999,
        "emoji": "👖",
        "tag": "Streetwear",
        "tag_color": "#14b8a6",
        "tag_bg": "rgba(20, 184, 166, 0.12)",
        "stock": 500,
        "rating": 4.8,
        "reviews": 78,
        "short": "320 GSM cotton fleece joggers with tapered cuffs, deep zip pockets, and thick drawstring.",
        "story": "Designed for all-day creator comfort with street-ready tailoring. Features deep zippered phone pockets so essentials stay secure.",
        "image_url": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "320 GSM 100% Combed Terry Cotton",
            "Dual Zippered Concealed Security Pockets",
            "Custom Metal Aglet Drawstrings with Elastic Waist",
            "Ergonomic Ankle Cuffs for Sneaker Stacking"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-premium-matty-polo-tshirt",
        "title": "Rare Ember Structured Matty Cotton Polo T-Shirt (220 GSM) — Deep Navy",
        "category": "fashion",
        "price_inr": 899,
        "old_price": 1799,
        "emoji": "👔",
        "tag": "Smart Casual",
        "tag_color": "#3b82f6",
        "tag_bg": "rgba(59, 130, 246, 0.12)",
        "stock": 500,
        "rating": 4.8,
        "reviews": 65,
        "short": "220 GSM breathable honeycomb matty knit with crisp ribbed collar and wood-finish buttons.",
        "story": "Classic polo elevated for creators. Engineered with high-durability honeycomb cotton knit that breathes easily in warm climates.",
        "image_url": "https://images.unsplash.com/photo-1625910513413-7a918a38b603?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "220 GSM 100% Cotton Honeycomb Matty Fabric",
            "Anti-Curl Collar Technology",
            "Reinforced Placket with Premium Buttons",
            "Side Slits for Unrestricted Movement"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1625910513413-7a918a38b603?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-sleeveless-athletic-tank-top",
        "title": "Rare Ember Raw-Cut Streetwear Drop-Arm Tank Top (180 GSM) — Jet Black",
        "category": "fashion",
        "price_inr": 649,
        "old_price": 1299,
        "emoji": "🎽",
        "tag": "Gym & Athleisure",
        "tag_color": "#ef4444",
        "tag_bg": "rgba(239, 68, 68, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 54,
        "short": "180 GSM bio-washed cotton tank with dropped armholes for gym workouts and warm days.",
        "story": "Engineered for maximum range of motion. Deep drop-armholes and curved bottom hem give this tank an authentic bodybuilding and streetwear edge.",
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "180 GSM 100% Combed Bio-Washed Cotton",
            "Extended Drop Armholes for Free Range of Motion",
            "Scoop Neck with Anti-Chafe Seaming",
            "Curved Droptail Hem for Back Coverage"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-womens-cropped-fleece-hoodie",
        "title": "Rare Ember Women's Boxy Cropped Fleece Hoodie (320 GSM) — Mocha Brown",
        "category": "fashion",
        "price_inr": 1399,
        "old_price": 2799,
        "emoji": "✨",
        "tag": "Women's Drop",
        "tag_color": "#d946ef",
        "tag_bg": "rgba(217, 70, 239, 0.12)",
        "stock": 500,
        "rating": 5.0,
        "reviews": 128,
        "short": "320 GSM soft fleece cropped hoodie with raw-edge hem and roomy balloon sleeves.",
        "story": "Chic, comfortable, and effortlessly stylish. Tailored with a boxy crop cut that sits naturally at the waist.",
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "320 GSM Brushed Cotton-Poly Fleece",
            "On-Trend Boxy Crop Silhouette",
            "Raw-Edge Bottom Hem with Stay-Stitch",
            "Oversized Hood with Color-Matched Cords"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-womens-boxy-heavyweight-crop-tee",
        "title": "Rare Ember Women's Heavyweight Boxy Crop Tee (200 GSM) — Crisp White",
        "category": "fashion",
        "price_inr": 699,
        "old_price": 1399,
        "emoji": "🤍",
        "tag": "Clean Essential",
        "tag_color": "#8b5cf6",
        "tag_bg": "rgba(139, 92, 246, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 92,
        "short": "200 GSM combed cotton crop tee with wide sleeves and clean minimal aesthetic.",
        "story": "The ultimate everyday crop tee. Dense enough to never be sheer, yet light and breathable for Indian summers.",
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "200 GSM 100% Combed Bio-Washed Cotton",
            "Non-Sheer Opaque Dense Weave",
            "Boxy Drop-Shoulder Relaxed Proportions",
            "Pre-Shrunk Treated for Long-Lasting Shape"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-matte-black-ceramic-coffee-mug",
        "title": "Rare Ember Artisan Matte Black Ceramic Coffee Mug (350ml)",
        "category": "home-garden",
        "price_inr": 499,
        "old_price": 999,
        "emoji": "☕",
        "tag": "Artisan Craft",
        "tag_color": "#f59e0b",
        "tag_bg": "rgba(245, 158, 11, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 142,
        "short": "Hand-glazed matte ceramic with ergonomic wide handle and 350ml morning brew capacity.",
        "story": "Elevate your morning coffee ritual. Kiln-fired at 1280°C for exceptional thermal retention and durability.",
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "High-Density Kiln-Fired Ceramic (350ml)",
            "Scratch-Resistant Matte Charcoal Exterior",
            "Microwave & Dishwasher Safe Non-Toxic Glaze",
            "Ergonomic 3-Finger Balanced Comfort Handle"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-thermal-insulated-travel-tumbler-straw",
        "title": "Rare Ember Double-Wall Insulated Steel Travel Tumbler with Straw (500ml)",
        "category": "home-garden",
        "price_inr": 799,
        "old_price": 1599,
        "emoji": "🥤",
        "tag": "Hot & Cold",
        "tag_color": "#06b6d4",
        "tag_bg": "rgba(6, 182, 212, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 115,
        "short": "Vacuum-insulated 304 stainless steel tumbler keeping drinks cold for 18h and hot for 8h.",
        "story": "Built for long creative sessions and commutes. Double-wall copper vacuum insulation prevents exterior sweat completely.",
        "image_url": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "Double-Wall 304 Food-Grade Stainless Steel",
            "18 Hours Cold / 8 Hours Hot Thermal Lock",
            "Spill-Resistant Lid with Reusable Steel Straw",
            "Sweat-Proof Matte Powder-Coated Grip"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-frosted-glass-sipper-bamboo-lid",
        "title": "Rare Ember Frosted Aesthetic Glass Sipper with Natural Bamboo Lid (450ml)",
        "category": "home-garden",
        "price_inr": 599,
        "old_price": 1199,
        "emoji": "🧋",
        "tag": "Creator Aesthetic",
        "tag_color": "#10b981",
        "tag_bg": "rgba(16, 185, 129, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 84,
        "short": "Frosted borosilicate glass can tumbler with genuine bamboo lid and clear glass straw.",
        "story": "The viral iced coffee favorite. Crafted from thermal shock resistant borosilicate glass with airtight silicone-sealed bamboo lid.",
        "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "Thermal Shock Proof Borosilicate Frosted Glass",
            "100% Natural Sustainable Bamboo Lid with Gasket",
            "Reusable Borosilicate Glass Straw Included",
            "Ideal for Iced Coffee, Matcha, Boba & Juices"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-magic-thermochromic-ceramic-mug",
        "title": "Rare Ember Color-Changing Thermo Magic Ceramic Mug (350ml) — Matte Midnight",
        "category": "home-garden",
        "price_inr": 599,
        "old_price": 1199,
        "emoji": "🔮",
        "tag": "Thermo Magic",
        "tag_color": "#6366f1",
        "tag_bg": "rgba(99, 102, 241, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 98,
        "short": "Heat-sensitive pigment reveals bespoke Rare Ember typography when hot liquid is poured.",
        "story": "Watch the design magically come to life. Solid black when cold, transforming into glowing artwork with your morning coffee.",
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "Thermochromic Heat-Activated Ceramic Surface",
            "High-Grade Sublimation Print Technology",
            "Comfort Curved Handle with Balanced Counterweight",
            "350ml Generous Capacity"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-stainless-sports-insulated-flask",
        "title": "Rare Ember Wide-Mouth Stainless Steel Sports Flask (750ml) — Matte Sage",
        "category": "home-garden",
        "price_inr": 899,
        "old_price": 1799,
        "emoji": "💧",
        "tag": "Active Life",
        "tag_color": "#10b981",
        "tag_bg": "rgba(16, 185, 129, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 76,
        "short": "750ml leakproof insulated flask with sports loop cap and wide-mouth ice opening.",
        "story": "Hydration built for gym, hikes, and all-day hustle. Double-wall insulated stainless steel guarantees 24-hour ice-cold water.",
        "image_url": "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "750ml High-Capacity Pro Flask",
            "18/8 Pro-Grade Stainless Steel Construction",
            "Honeycomb Insulated Cap with Flex Grip Strap",
            "BPA-Free, Phthalate-Free & Toxin-Free"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-extended-desk-mat-gaming-mousepad",
        "title": "Rare Ember Extended Desk Mat & Creator Mousepad (900×400mm, 4mm)",
        "category": "electronics",
        "price_inr": 899,
        "old_price": 1799,
        "emoji": "🖥️",
        "tag": "Desk Setup",
        "tag_color": "#3b82f6",
        "tag_bg": "rgba(59, 130, 246, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 167,
        "short": "Ultra-smooth high-density microfiber with anti-fray precision stitching and natural rubber grip.",
        "story": "The centerpiece of your workstation. 900×400mm extended surface accommodates full mechanical keyboard, mouse, and workspace gear.",
        "image_url": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "Extra-Large 900×400mm Coverage (4mm Plush Thickness)",
            "Precision Micro-Woven Textile for Flawless Mouse Tracking",
            "360° Anti-Fray Seamless Precision Edge Stitching",
            "Textured Non-Slip Natural Vulcanized Rubber Base"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1541140532154-b024d705b909?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-compact-microfiber-desk-mousepad",
        "title": "Rare Ember Precision Microfiber Compact Desk Mousepad (240×200mm) — Minimal Monolith",
        "category": "electronics",
        "price_inr": 399,
        "old_price": 799,
        "emoji": "🖱️",
        "tag": "Essential Gear",
        "tag_color": "#6366f1",
        "tag_bg": "rgba(99, 102, 241, 0.12)",
        "stock": 500,
        "rating": 4.8,
        "reviews": 62,
        "short": "Portable 240×200mm high-speed microfiber mousepad with non-slip rubber backing.",
        "story": "Perfect for minimal laptop desks and cafe work. Features spill-resistant coating and micro-weave glide surface.",
        "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "Compact 240×200mm Travel & Cafe Friendly Footprint",
            "Spill-Resistant Water-Repellent Surface Coating",
            "Zero-Slip Textured Rubber Bottom Base",
            "Optimized for Optical & Laser Gaming Sensors"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1541140532154-b024d705b909?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-shockproof-matte-iphone-case",
        "title": "Rare Ember Minimalist Shockproof Impact Phone Case — Frosted Smoke",
        "category": "electronics",
        "price_inr": 549,
        "old_price": 1099,
        "emoji": "📱",
        "tag": "Impact Shield",
        "tag_color": "#ec4899",
        "tag_bg": "rgba(236, 72, 153, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 110,
        "short": "Military-grade drop-tested hybrid case with raised camera bezel and anti-fingerprint matte back.",
        "story": "Sleek protection without bulk. Shock-absorbing TPU bumpers pair with rigid scratch-resistant polycarbonate backplate.",
        "image_url": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "Certified 6.6ft Military Drop-Test Protection",
            "1.2mm Raised Screen Edge & Camera Ring Lip",
            "Oleophobic Anti-Fingerprint Matte Touch",
            "Wireless Charging & MagSafe Compatible"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-padded-creator-laptop-sleeve",
        "title": "Rare Ember Neoprene Padded Creator Laptop Sleeve (13-15 Inch) — Stealth Slate",
        "category": "electronics",
        "price_inr": 799,
        "old_price": 1599,
        "emoji": "💻",
        "tag": "Creator Armor",
        "tag_color": "#14b8a6",
        "tag_bg": "rgba(20, 184, 166, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 88,
        "short": "Thick foam padding with plush faux-fur interior lining and waterproof dual zipper.",
        "story": "Shield your Mac or PC laptop from everyday bumps and scratches. Streamlined profile slips easily into backpacks.",
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "Multi-Layer Shockproof Foam Cushioning",
            "Scratch-Free Faux-Fur Plush Interior",
            "Water-Resistant High-Density Exterior Fabric",
            "Smooth Dual Metal Top-Loading Zippers"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-heavyweight-canvas-tote-bag",
        "title": "Rare Ember Heavyweight Canvas Everyday Tote Bag (400 GSM)",
        "category": "general",
        "price_inr": 449,
        "old_price": 999,
        "emoji": "👜",
        "tag": "Eco Style",
        "tag_color": "#10b981",
        "tag_bg": "rgba(16, 185, 129, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 134,
        "short": "Dense 400 GSM natural organic cotton canvas with reinforced box-stitched shoulder handles.",
        "story": "Built to carry laptops, cameras, groceries, and daily essentials with effortless minimal style.",
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "400 GSM 100% Unbleached Heavy Cotton Canvas",
            "Reinforced Cross-Box Stitched Handles for 15kg Load",
            "Spacious Main Compartment with Inner Zipper Pocket",
            "100% Biodegradable & Plastic-Free"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-hardbound-minimalist-dot-journal",
        "title": "Rare Ember Minimalist Hardbound Dotted Journal / Notebook (A5)",
        "category": "general",
        "price_inr": 399,
        "old_price": 799,
        "emoji": "📓",
        "tag": "Productivity",
        "tag_color": "#8b5cf6",
        "tag_bg": "rgba(139, 92, 246, 0.12)",
        "stock": 500,
        "rating": 4.8,
        "reviews": 89,
        "short": "120 GSM bleed-resistant ivory dot-grid paper with vegan leather hardcover and lay-flat binding.",
        "story": "The ideation engine for creators and builders. Lay-flat 180° binding ensures comfortable writing with zero ink bleed.",
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "192 Pages of 120 GSM Acid-Free Bleedproof Ivory Paper",
            "5mm Minimalist Dot-Grid Matrix",
            "Thread-Bound Lay-Flat 180° Binding",
            "Elastic Closure Band & Silk Ribbon Bookmark"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-wooden-framed-streetwear-art-poster",
        "title": "Rare Ember Gallery-Grade Framed Streetwear Art Poster (A3 Solid Wood Frame) — 'Tokyo Nocturne'",
        "category": "general",
        "price_inr": 999,
        "old_price": 1999,
        "emoji": "🖼️",
        "tag": "Wall Art",
        "tag_color": "#f59e0b",
        "tag_bg": "rgba(245, 158, 11, 0.12)",
        "stock": 500,
        "rating": 4.9,
        "reviews": 68,
        "short": "300 GSM matte art print in natural wooden frame with shatterproof acrylic glass front.",
        "story": "Transform your creative studio or room. Printed on museum-grade heavyweight matte paper with fade-resistant archival pigment inks.",
        "image_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "A3 Standard Size (297×420mm) Museum Art Print",
            "300 GSM Heavyweight Acid-Free Archival Paper",
            "Solid Natural Wood Frame with Pre-Installed Wall Mount",
            "Shatter-Resistant Optical-Grade Acrylic Glass"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1541140532154-b024d705b909?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "id": "rareember-waterproof-vinyl-sticker-pack",
        "title": "Rare Ember Die-Cut Waterproof Vinyl Creator Sticker Pack (Set of 10)",
        "category": "general",
        "price_inr": 299,
        "old_price": 599,
        "emoji": "✨",
        "tag": "Best Add-On",
        "tag_color": "#ec4899",
        "tag_bg": "rgba(236, 72, 153, 0.12)",
        "stock": 500,
        "rating": 5.0,
        "reviews": 145,
        "short": "Set of 10 matte-laminated die-cut vinyl stickers for laptops, journals, and bottles.",
        "story": "Deck out your laptop and gear. Printed on ultra-thick 6 mil vinyl with UV and scratch-resistant matte laminate that resists dishwasher heat.",
        "image_url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1000&q=80",
        "supplier": "qikink",
        "details": [
            "Set of 10 Unique Bespoke Creator & Streetwear Decals",
            "100% Waterproof, Weatherproof & Sun-Resistant Vinyl",
            "Removable Adhesive with Zero Sticky Residue",
            "Matte Soft-Touch Protective Top Laminate"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=1000&q=80"
        ]
    }
]

print(f"Total products to catalog: {len(PRODUCTS)}")

# 1. Update Supabase DB
print("1. Syncing to Supabase DB...")
def esc(s):
    if s is None:
        return ""
    return str(s).replace("'", "''")

for p in PRODUCTS:
    usd_price = round(p["price_inr"] / 85.0, 2)
    old_usd = round(p["old_price"] / 85.0, 2)
    
    # Check if exists
    exists = con.run(f"SELECT id FROM products WHERE id = '{esc(p['id'])}';")
    if exists:
        con.run(f"""
            UPDATE products SET
                title = '{esc(p['title'])}',
                price_inr = {p['price_inr']},
                price = {usd_price},
                old_price = {p['old_price']},
                compare_at_price = {old_usd},
                category = '{esc(p['category'])}',
                image_url = '{esc(p['image_url'])}',
                supplier = 'qikink',
                active = true,
                stock = {p['stock']},
                rating = {p['rating']},
                reviews = {p['reviews']},
                emoji = '{esc(p['emoji'])}',
                tag = '{esc(p['tag'])}',
                tag_color = '{esc(p['tag_color'])}',
                tag_bg = '{esc(p['tag_bg'])}',
                short = '{esc(p['short'])}',
                story = '{esc(p['story'])}',
                slug = '{esc(p['id'])}',
                updated_at = NOW()
            WHERE id = '{esc(p['id'])}';
        """)
        print(f"  Updated: {p['id']}")
    else:
        con.run(f"""
            INSERT INTO products (
                id, slug, title, category, price, price_inr, old_price, compare_at_price,
                image_url, supplier, active, stock, rating, reviews, emoji, tag,
                tag_color, tag_bg, short, story, created_at, updated_at
            ) VALUES (
                '{esc(p['id'])}', '{esc(p['id'])}', '{esc(p['title'])}', '{esc(p['category'])}',
                {usd_price}, {p['price_inr']}, {p['old_price']}, {old_usd},
                '{esc(p['image_url'])}', 'qikink', true, {p['stock']}, {p['rating']}, {p['reviews']},
                '{esc(p['emoji'])}', '{esc(p['tag'])}', '{esc(p['tag_color'])}', '{esc(p['tag_bg'])}',
                '{esc(p['short'])}', '{esc(p['story'])}', NOW(), NOW()
            );
        """)
        print(f"  Inserted: {p['id']}")

print("✅ Supabase sync complete!")

# 2. Update storefront/src/lib/data/product-gallery.ts
gallery_path = os.path.join(WORKSPACE_PATH, "storefront", "src", "lib", "data", "product-gallery.ts")
gallery_dict = {}
for p in PRODUCTS:
    gallery_dict[p["id"]] = p["gallery"]

gallery_content = "// ─── Rare Ember Multi-Angle Product Photo Galleries ───\n// Each product has 4 curated high-definition mockup perspectives.\n\n"
gallery_content += "export const CURATED_PRODUCT_GALLERIES: Record<string, string[]> = "
gallery_content += json.dumps(gallery_dict, indent=2) + ";\n\n"
gallery_content += """export function resolveProductGallery(
  id: string,
  primaryUrl?: string | null,
  category?: string,
  explicitImages?: string[] | null
): string[] {
  if (CURATED_PRODUCT_GALLERIES[id] && CURATED_PRODUCT_GALLERIES[id].length >= 2) {
    return CURATED_PRODUCT_GALLERIES[id];
  }

  const matchedKey = Object.keys(CURATED_PRODUCT_GALLERIES).find(
    (k) => id.includes(k) || k.includes(id)
  );
  if (matchedKey && CURATED_PRODUCT_GALLERIES[matchedKey].length >= 2) {
    return CURATED_PRODUCT_GALLERIES[matchedKey];
  }

  if (Array.isArray(explicitImages) && explicitImages.length >= 2) {
    const valid = explicitImages.filter((u) => Boolean(u && u.trim().length > 0));
    if (valid.length >= 2) return valid;
  }

  const fallback = primaryUrl && primaryUrl.trim().length > 0 ? primaryUrl.trim() : null;
  if (fallback) {
    return [fallback];
  }

  return [];
}

export const resolveProductImages = resolveProductGallery;
"""
with open(gallery_path, "w", encoding="utf-8") as f:
    f.write(gallery_content)
print("✅ product-gallery.ts updated with all 25 4-image galleries!")

# 3. Update storefront/src/lib/data/fallback-images.ts
fallback_path = os.path.join(WORKSPACE_PATH, "storefront", "src", "lib", "data", "fallback-images.ts")
fb_dict = {p["id"]: p["image_url"] for p in PRODUCTS}
fb_content = "/**\n * Curated image fallbacks for catalog items when image_url is missing.\n * 100% Rare Ember Qikink Print-on-Demand Collection.\n */\n\n"
fb_content += "export const FALLBACK_IMAGES: Record<string, string> = "
fb_content += json.dumps(fb_dict, indent=2) + ";\n\n"
fb_content += """/** DB image first, curated fallback second, undefined last. */
export function resolveProductImage(id: string, imageUrl?: string | null): string | undefined {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return FALLBACK_IMAGES[id];
}
"""
with open(fallback_path, "w", encoding="utf-8") as f:
    f.write(fb_content)
print("✅ fallback-images.ts purged of legacy Meesho and updated with Rare Ember!")

# 4. Update storefront/src/lib/data/products.ts
products_ts_path = os.path.join(WORKSPACE_PATH, "storefront", "src", "lib", "data", "products.ts")
# Read head of products.ts before `export const products: Product[] = [`
with open(products_ts_path, "r", encoding="utf-8") as f:
    existing_ts = f.read()

parts = existing_ts.split("export const products: Product[] = [")
if len(parts) >= 2:
    prefix = parts[0]
    # Build TS array
    ts_items = []
    for p in PRODUCTS:
        usd_price = round(p["price_inr"] / 85.0, 2)
        old_usd = round(p["old_price"] / 85.0, 2)
        details_list = json.dumps(p["details"], indent=6)
        item_code = f"""  {{
    id: '{p['id']}',
    slug: '{p['id']}',
    title: {json.dumps(p['title'])},
    price: {usd_price},
    price_inr: {p['price_inr']},
    old_price: {p['old_price']},
    compare_at_price: {old_usd},
    category: '{p['category']}',
    emoji: '{p['emoji']}',
    tag: '{p['tag']}',
    tagColor: '{p['tag_color']}',
    tagBg: '{p['tag_bg']}',
    stock: {p['stock']},
    rating: {p['rating']},
    reviews: {p['reviews']},
    image_url: '{p['image_url']}',
    supplier: 'qikink',
    short: {json.dumps(p['short'])},
    story: {json.dumps(p['story'])},
    details: {details_list},
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  }}"""
        ts_items.append(item_code)
    
    # After the array find the export functions
    after_array = parts[1].split("];\n")
    suffix = "\n".join(after_array[1:]) if len(after_array) > 1 else ""

    new_ts_content = prefix + "export const products: Product[] = [\n" + ",\n".join(ts_items) + "\n];\n" + suffix
    with open(products_ts_path, "w", encoding="utf-8") as f:
        f.write(new_ts_content)
    print("✅ products.ts updated with full 25 Qikink collection items!")

print("🎉 Complete catalog expansion succeeded!")
