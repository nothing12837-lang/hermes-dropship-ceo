import json
import sys
import os
import ssl
import pg8000.native

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(env_path):
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k.strip() not in os.environ:
                        os.environ[k.strip()] = v.strip()
    except Exception:
        pass

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.qdkkxpfhwrwyoardlceo.supabase.co").strip()
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres").strip()
DB_PASS = os.environ.get("SUPABASE_DB_PASS", "").strip()
DB_NAME = os.environ.get("SUPABASE_DB_NAME", "postgres").strip()

def run_upgrade():
    if not DB_PASS:
        print("Error: SUPABASE_DB_PASS not set in environment.")
        return
    print("🚀 Connecting to Supabase PostgreSQL database...")
    ctx = ssl.create_default_context()
    con = pg8000.native.Connection(
        user=DB_USER,
        host=DB_HOST,
        port=5432,
        database=DB_NAME,
        password=DB_PASS,
        ssl_context=ctx
    )

    # 1. Purge / Deactivate unwanted junk products (office stationery, markers, cleaners, slime, etc.)
    junk_keywords = [
        "marker", "pen stand", "pencil sharpener", "slime", "circle template", 
        "geometry", "mathematical drawing", "document tray", "floor cleaner", 
        "dishwashing", "soap", "socks", "ear muffs", "lunch box", "water bottle",
        "incense", "agarbatti"
    ]
    for kw in junk_keywords:
        con.run("UPDATE products SET active = false, is_trending = false, is_new = false WHERE title ILIKE :kw", kw=f"%{kw}%")
    print("✅ Deactivated junk office stationery, markers, and cleaners from store.")

    # 2. Reset trending flag on all products first
    con.run("UPDATE products SET is_trending = false, is_new = false")

    # 3. Update all active products to supplier = 'Meesho', market = 'INDIA'
    standard_details = json.dumps([
        "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
        "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
        "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
        "✅ 100% Quality Checked & Sealed",
        "📦 Express Dispatched from Domestic Logistics Hub"
    ])
    standard_story = "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery."

    con.run("""
        UPDATE products 
        SET supplier = 'Meesho', 
            market = 'INDIA',
            details = :details,
            story = :story
        WHERE active = true
    """, details=standard_details, story=standard_story)
    print("✅ Updated active products to supplier = 'Meesho' with express Indian logistics details.")

    # 4. Insert / Upsert Flagship High-Margin Meesho Drops
    flagship_products = [
        {
            "id": "in-water-sensor-led-diyas-pack-of-12-smokeless",
            "title": "Water Sensor LED Diyas (Pack of 12 Smokeless & Reusable)",
            "description": "Transform your festive home decor with these revolutionary water-sensor LED diyas. Pour water into the diya, and they light up with a warm, golden flame instantly! 100% safe, shockproof, reusable, and zero fire hazard. Perfect for Diwali, Navratri, Ganesh Chaturthi, and everyday home mandir decoration.",
            "short": "Magical water sensor diyas that light up instantly when you pour water. Smokeless, reusable & 100% fire-safe (Pack of 12).",
            "price_inr": 399.00,
            "compare_at_price": 899.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 1840,
            "emoji": "🪔",
            "tag": "Hot Drop",
            "tag_color": "#ff6b35",
            "tag_bg": "rgba(255,107,53,0.12)",
            "cj_sku": "meesho_water_sensor_diyas_12pk",
            "is_trending": True,
            "is_new": True,
            "stock": 100
        },
        {
            "id": "in-crystal-diamond-touch-led-table-lamp-16-colors-rgb",
            "title": "Crystal Diamond Touch LED Table Lamp (16 Colors RGB with Remote)",
            "description": "Experience breathtaking luxury with this precision-crafted 3D crystal diamond touch lamp. Features 16 vibrant RGB colors, smooth touch sensor control, remote operation, and USB rechargeable battery lasting up to 12 hours. Creates an enchanting rose shadow effect on tables and walls.",
            "short": "Luxury touch-sensitive crystal lamp with 16 RGB colors, rose shadow effect, and wireless remote control.",
            "price_inr": 499.00,
            "compare_at_price": 1199.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 2450,
            "emoji": "💎",
            "tag": "Bestseller",
            "tag_color": "#8b5cf6",
            "tag_bg": "rgba(139,92,246,0.12)",
            "cj_sku": "meesho_crystal_touch_lamp_rgb",
            "is_trending": True,
            "is_new": True,
            "stock": 75
        },
        {
            "id": "in-electric-mini-wireless-food-garlic-chopper-250ml",
            "title": "Electric Mini Wireless Food & Garlic Chopper (250ml USB Rechargeable)",
            "description": "Chop garlic, ginger, onions, chilies, herbs, and nuts in just 5 seconds! Portable wireless mini chopper with 3 stainless steel reinforced blades, one-touch push button, and waterproof design for effortless water rinsing. USB rechargeable 1200mAh battery chops up to 35 times on a single charge.",
            "short": "One-touch wireless electric food chopper with 3 food-grade stainless blades. Chops ingredients in 5 seconds.",
            "price_inr": 499.00,
            "compare_at_price": 1199.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
            "rating": 4.6,
            "reviews": 1420,
            "emoji": "⚡",
            "tag": "Trending",
            "tag_color": "#10b981",
            "tag_bg": "rgba(16,185,129,0.12)",
            "cj_sku": "meesho_mini_wireless_chopper_250ml",
            "is_trending": True,
            "is_new": True,
            "stock": 80
        },
        {
            "id": "in-ultrasonic-flame-mist-aroma-air-diffuser-humidifier",
            "title": "Ultrasonic Flame Mist Aroma Air Diffuser & Humidifier (200ml)",
            "description": "Bring soothing ambiance and luxury relaxation to your bedroom or living room. Realistic LED flame effect paired with ultrasonic cool mist technology humidifies dry air and disperses natural fragrance. Auto shut-off sensor prevents dry burning.",
            "short": "Realistic glowing LED flame mist aroma diffuser & air humidifier with silent ultrasonic operation.",
            "price_inr": 699.00,
            "compare_at_price": 1499.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 980,
            "emoji": "🔥",
            "tag": "Hot Drop",
            "tag_color": "#f59e0b",
            "tag_bg": "rgba(245,158,11,0.12)",
            "cj_sku": "meesho_ultrasonic_flame_diffuser_200ml",
            "is_trending": True,
            "is_new": True,
            "stock": 60
        },
        {
            "id": "in-glowcharge-540-magnetic-fast-charging-cable-led",
            "title": "GlowCharge 540° Magnetic Fast Charging Cable (3-in-1 LED)",
            "description": "The ultimate universal magnetic fast cable. Features 540-degree full rotation (360° spin + 180° elbow bend) with 3 interchangeable magnetic tips: Type-C, Lightning (iOS), and Micro-USB. Glowing LED indicator for easy nighttime plugging with heavy-duty braided nylon cord.",
            "short": "540-degree rotating universal magnetic cable with Type-C, Lightning & Micro tips and soft ambient LED glow.",
            "price_inr": 399.00,
            "compare_at_price": 899.00,
            "category": "electronics",
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 1650,
            "emoji": "🔌",
            "tag": "Bestseller",
            "tag_color": "#3b82f6",
            "tag_bg": "rgba(59,130,246,0.12)",
            "cj_sku": "meesho_glowcharge_540_cable",
            "is_trending": True,
            "is_new": True,
            "stock": 120
        }
    ]

    for p in flagship_products:
        exists = con.run("SELECT id FROM products WHERE id = :id", id=p['id'])
        if exists:
            con.run("""
                UPDATE products SET
                    title = :title,
                    description = :description,
                    short = :short,
                    price_inr = :price_inr,
                    compare_at_price = :compare_at_price,
                    category = :category,
                    image_url = :image_url,
                    rating = :rating,
                    reviews = :reviews,
                    emoji = :emoji,
                    tag = :tag,
                    tag_color = :tag_color,
                    tag_bg = :tag_bg,
                    cj_sku = :cj_sku,
                    is_trending = true,
                    is_new = true,
                    active = true,
                    supplier = 'Meesho',
                    market = 'INDIA',
                    stock = :stock
                WHERE id = :id
            """,
                title=p['title'],
                description=p['description'],
                short=p['short'],
                price_inr=p['price_inr'],
                compare_at_price=p['compare_at_price'],
                category=p['category'],
                image_url=p['image_url'],
                rating=p['rating'],
                reviews=p['reviews'],
                emoji=p['emoji'],
                tag=p['tag'],
                tag_color=p['tag_color'],
                tag_bg=p['tag_bg'],
                cj_sku=p['cj_sku'],
                stock=p['stock'],
                id=p['id']
            )
            print(f"  Updated flagship product: {p['title']}")
        else:
            con.run("""
                INSERT INTO products (
                    id, slug, title, description, short, story, details,
                    price_inr, price, compare_at_price, old_price, category,
                    image_url, rating, reviews, emoji, tag, tag_color, tag_bg,
                    cj_sku, is_trending, is_new, active, supplier, market, stock, chapter
                ) VALUES (
                    :id, :slug, :title, :description, :short, :story, :details,
                    :price_inr, :price, :compare_at_price, :old_price, :category,
                    :image_url, :rating, :reviews, :emoji, :tag, :tag_color, :tag_bg,
                    :cj_sku, true, true, true, 'Meesho', 'INDIA', :stock, :chapter
                )
            """,
                id=p['id'],
                slug=p['id'],
                title=p['title'],
                description=p['description'],
                short=p['short'],
                story=standard_story,
                details=standard_details,
                price_inr=p['price_inr'],
                price=round(p['price_inr'] / 85, 2),
                compare_at_price=p['compare_at_price'],
                old_price=round(p['compare_at_price'] / 85, 2),
                category=p['category'],
                image_url=p['image_url'],
                rating=p['rating'],
                reviews=p['reviews'],
                emoji=p['emoji'],
                tag=p['tag'],
                tag_color=p['tag_color'],
                tag_bg=p['tag_bg'],
                cj_sku=p['cj_sku'],
                stock=p['stock'],
                chapter=p['category'].upper()
            )
            print(f"  Inserted new flagship product: {p['title']}")

    # 5. Set trending = true on top existing winning products (Door mat, Lamps, Candles)
    top_existing_ids = [
        ("in-welcome-door-mat-for-home-entrance-with-textured-m-9446", 449, 999, "Welcome Textured Mesh Door Mat (Heavy Duty 57x37.5cm)", 4.8, 3150),
        ("in-cute-bunny-usb-rechargeable-led-desk-night-lamp-wi-7302", 499, 1199, "Cute Bunny USB Rechargeable LED Desk & Night Lamp", 4.7, 1350),
        ("in-pack-of-3-golden-crystal-look-flameless-led-candle-6854", 349, 799, "Pack of 3 Golden Crystal Look Flameless LED Candles", 4.7, 1890),
        ("in-green-rechargeable-crescent-moon-night-lamp-with-c-5606", 599, 1299, "Green Rechargeable Crescent Moon Night Lamp", 4.7, 1120),
        ("in-rechargeable-egg-character-cloud-desk-lamp-with-3--0694", 499, 1199, "Rechargeable Egg Character Cloud Desk Lamp", 4.7, 920),
        ("in-pack-of-3-flameless-led-candles-with-warm-glow-for-1318", 349, 799, "Pack of 3 Flameless LED Candles with Warm Glow", 4.8, 2100),
        ("in-pink-rechargeable-led-desk-lamp-with-display-adjus-8998", 599, 1299, "Pink Rechargeable LED Desk Lamp with Display", 4.7, 890),
        ("in-radha-krishna-swing-crystal-globe-led-lamp-with-wo-2838", 349, 799, "Radha Krishna Swing Crystal Globe LED Lamp", 4.8, 1400),
        ("in-3-piece-flameless-led-crystal-candle-light-set-for-4534", 349, 799, "3 Piece Flameless LED Crystal Candle Light Set", 4.7, 1250),
        ("in-hexagon-wall-decor-frame-with-modern-printed-desig-2390", 699, 1599, "Hexagon Wall Decor Frame with Modern Printed Design", 4.7, 1430),
        ("in-rechargeable-unicorn-crescent-moon-night-lamp-with-8550", 599, 1299, "Rechargeable Unicorn Crescent Moon Night Lamp", 4.7, 850)
    ]

    for item_id, price, mrp, title, rating, reviews in top_existing_ids:
        con.run("""
            UPDATE products SET
                price_inr = :price_inr,
                price = :price,
                compare_at_price = :compare_at_price,
                old_price = :old_price,
                rating = :rating,
                reviews = :reviews,
                is_trending = true,
                is_new = true,
                active = true,
                supplier = 'Meesho',
                market = 'INDIA'
            WHERE id = :id
        """,
            price_inr=price,
            price=round(price / 85, 2),
            compare_at_price=mrp,
            old_price=round(mrp / 85, 2),
            rating=rating,
            reviews=reviews,
            id=item_id
        )
        print(f"  Activated trending item: {title} (₹{price})")

    # 6. Verify Final State
    active_res = con.run("SELECT count(*), supplier FROM products WHERE active = true GROUP BY supplier")
    trending_res = con.run("SELECT count(*) FROM products WHERE active = true AND is_trending = true")
    sample_trending = con.run("SELECT title, price_inr, compare_at_price, rating, reviews FROM products WHERE active = true AND is_trending = true ORDER BY reviews DESC LIMIT 10")

    print("\n📊 --- FINAL SUPABASE STATE ---")
    print("Active by Supplier:", active_res)
    print("Total Trending on Frontpage:", trending_res[0][0])
    print("\nTop Trending Items on Website:")
    for r in sample_trending:
        margin = round((1 - float(r[1]) / float(r[2])) * 100)
        print(f"• {r[0]} | ₹{r[1]} (MRP: ₹{r[2]}, {margin}% OFF) | {r[3]}⭐ ({r[4]} reviews)")

    con.close()
    print("\n✨ Migration executed successfully!")

if __name__ == "__main__":
    run_upgrade()
