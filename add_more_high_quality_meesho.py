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

def main():
    if not DB_PASS:
        print("Error: SUPABASE_DB_PASS not set in environment.")
        return
    print("🚀 Connecting to Supabase PostgreSQL database to expand Meesho catalog...")
    ctx = ssl.create_default_context()
    con = pg8000.native.Connection(
        user=DB_USER,
        host=DB_HOST,
        port=5432,
        database=DB_NAME,
        password=DB_PASS,
        ssl_context=ctx
    )

    standard_details = json.dumps([
        "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
        "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
        "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
        "✅ 100% Quality Checked & Sealed",
        "📦 Express Dispatched from Domestic Logistics Hub"
    ])
    standard_story = "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery."

    new_meesho_products = [
        # === FESTIVE & LUXURY LIGHTING ===
        {
            "id": "meesho-acrylic-led-glow-message-note-board",
            "title": "Acrylic LED Glow Message Note Board with Erasable Pen (Warm Night Lamp)",
            "description": "Write daily to-do lists, sweet romantic notes, reminders, or festive greetings that glow in warm ambient LED light! Clear acrylic dry-erase plate with wooden illuminated base. Comes with 7 erasable pens and cleaning cloth.",
            "short": "Glowing warm LED acrylic message board for to-do notes, quotes, and ambient bedside lighting.",
            "price_inr": 499.00,
            "compare_at_price": 1199.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 2100,
            "emoji": "📝",
            "tag": "Trending",
            "tag_color": "#f59e0b",
            "tag_bg": "rgba(245,158,11,0.12)",
            "cj_sku": "meesho_acrylic_led_note_board",
            "is_trending": True,
            "is_new": True,
            "stock": 100
        },
        {
            "id": "meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base",
            "title": "3D Crystal Ball Galaxy Night Lamp with Natural Beech Wood Base",
            "description": "High-clarity optical K9 crystal sphere featuring precision 3D internal laser engraving of the Solar System and Milky Way galaxy. Emits a soft, calming celestial glow on walls and ceiling. USB powered.",
            "short": "3D laser-engraved galaxy crystal ball night light on natural solid wood illuminated base.",
            "price_inr": 399.00,
            "compare_at_price": 899.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
            "rating": 4.9,
            "reviews": 3400,
            "emoji": "🔮",
            "tag": "Bestseller",
            "tag_color": "#8b5cf6",
            "tag_bg": "rgba(139,92,246,0.12)",
            "cj_sku": "meesho_crystal_ball_galaxy_lamp",
            "is_trending": True,
            "is_new": True,
            "stock": 150
        },
        {
            "id": "meesho-moroccan-golden-metal-fairy-lantern-string",
            "title": "Moroccan Golden Metal Lantern Fairy String Lights (16 LEDs)",
            "description": "Intricate hollow-carved golden metal spheres cast mesmerizing geometric shadow patterns across walls. Warm white LEDs create an opulent royal festive ambiance for Diwali, living rooms, and mandir decor.",
            "short": "16 handcrafted Moroccan golden lantern fairy string lights with intricate shadow cutouts.",
            "price_inr": 449.00,
            "compare_at_price": 999.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 1480,
            "emoji": "🏮",
            "tag": "Festive Special",
            "tag_color": "#d97706",
            "tag_bg": "rgba(217,119,6,0.12)",
            "cj_sku": "meesho_moroccan_golden_lanterns_16led",
            "is_trending": True,
            "is_new": True,
            "stock": 90
        },
        {
            "id": "meesho-ceramic-aroma-diffuser-electric-touch-lamp",
            "title": "Electric Ceramic Aroma Oil Burner & Dimmable Night Lamp",
            "description": "2-in-1 aroma diffuser and bedside ambient lamp. Fill top dish with essential oils or camphor for instant natural room fragrance. Touch sensor dimmer controls 3 brightness levels. Safe ceramic construction.",
            "short": "Touch-dimmable ceramic aroma lamp that gently diffuses fragrant essential oils and camphor.",
            "price_inr": 599.00,
            "compare_at_price": 1299.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 1890,
            "emoji": "🪔",
            "tag": "Pooja & Decor",
            "tag_color": "#f97316",
            "tag_bg": "rgba(249,115,22,0.12)",
            "cj_sku": "meesho_ceramic_aroma_touch_lamp",
            "is_trending": False,
            "is_new": True,
            "stock": 85
        },
        {
            "id": "meesho-floating-water-lotus-led-candles-6pk",
            "title": "Waterproof Floating Lotus LED Candles for Urli & Pools (Pack of 6)",
            "description": "Authentic floating lotus flowers illuminate automatically when placed in water bowls, traditional urli decor, or swimming pools. Smokeless, battery operated, and completely reusable for festive decor.",
            "short": "Pack of 6 waterproof floating lotus LED lights that glow automatically in water urlis.",
            "price_inr": 349.00,
            "compare_at_price": 799.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 1250,
            "emoji": "🌸",
            "tag": "Urli Decor",
            "tag_color": "#ec4899",
            "tag_bg": "rgba(236,72,153,0.12)",
            "cj_sku": "meesho_floating_lotus_led_6pk",
            "is_trending": False,
            "is_new": True,
            "stock": 110
        },

        # === SMART KITCHEN & HOME UTILITY ===
        {
            "id": "meesho-4in1-handheld-electric-vegetable-cutter-set",
            "title": "4-in-1 Handheld Electric Vegetable Cutter & Meat Grinder Set",
            "description": "Chop garlic, slice cucumbers, grind mince, and clean dishes all with one cordless handheld device! Open feeding port lets you push whole carrots and peppers without pre-chopping. USB rechargeable waterproof body.",
            "short": "Multi-function 4-in-1 handheld electric cutter with direct slicer port and cleaning brush.",
            "price_inr": 599.00,
            "compare_at_price": 1399.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
            "rating": 4.6,
            "reviews": 2240,
            "emoji": "🥒",
            "tag": "Viral Gadget",
            "tag_color": "#10b981",
            "tag_bg": "rgba(16,185,129,0.12)",
            "cj_sku": "meesho_4in1_handheld_cutter_set",
            "is_trending": True,
            "is_new": True,
            "stock": 90
        },
        {
            "id": "meesho-automatic-magnetic-self-stirring-mug",
            "title": "Automatic Magnetic Self-Stirring Coffee & Chai Mug (380ml USB)",
            "description": "No spoon needed! Press one button and high-speed magnetic rotor mixes coffee, protein shakes, hot chocolate, or turmeric milk instantly. Double-wall 304 food-grade stainless steel keeps beverages hot for hours.",
            "short": "One-touch magnetic self-stirring stainless steel thermal mug for coffee, chai & shakes.",
            "price_inr": 499.00,
            "compare_at_price": 1199.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 1930,
            "emoji": "☕",
            "tag": "Office Favorite",
            "tag_color": "#78350f",
            "tag_bg": "rgba(120,53,15,0.12)",
            "cj_sku": "meesho_magnetic_self_stirring_mug",
            "is_trending": True,
            "is_new": True,
            "stock": 105
        },
        {
            "id": "meesho-digital-kitchen-food-scale-10kg-lcd",
            "title": "Precision Digital Kitchen Food Weighing Scale (1g to 10kg LCD)",
            "description": "Accurate portion measurement for diet tracking, baking, and cooking. Tare function subtracts bowl weight instantly. High-precision strain gauge sensors display grams and ounces clearly on backlit LCD.",
            "short": "High-precision 10kg digital kitchen scale with Tare function for accurate diet & cooking measurement.",
            "price_inr": 399.00,
            "compare_at_price": 899.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 3820,
            "emoji": "⚖️",
            "tag": "Fitness Pick",
            "tag_color": "#0284c7",
            "tag_bg": "rgba(2,132,199,0.12)",
            "cj_sku": "meesho_digital_kitchen_scale_10kg",
            "is_trending": False,
            "is_new": True,
            "stock": 130
        },
        {
            "id": "meesho-360-rotating-spice-rack-turntable-lazy-susan",
            "title": "360° Rotating Turntable Spice Rack Organizer for Kitchen & Fridge",
            "description": "Never struggle to reach back spices or sauce bottles again. Smooth ball-bearing rotation gives effortless 360-degree access. Raised rim prevents jars from falling. Non-skid liner cleans easily with a damp cloth.",
            "short": "Smooth 360° rotating turntable organizer tray for kitchen cabinets, pantry, and fridge.",
            "price_inr": 499.00,
            "compare_at_price": 1099.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 1670,
            "emoji": "🔄",
            "tag": "Space Saver",
            "tag_color": "#14b8a6",
            "tag_bg": "rgba(20,184,166,0.12)",
            "cj_sku": "meesho_rotating_turntable_spice_rack",
            "is_trending": False,
            "is_new": True,
            "stock": 80
        },
        {
            "id": "meesho-silicone-heat-resistant-pinch-mitts-pair",
            "title": "Silicone Heat-Resistant Oven Cooking Pinch Mitts (Pair)",
            "description": "Protect fingers from scalding pots, hot microwave bowls, and oven pans. Food-grade flexible silicone with anti-slip textured grip. Easy to slip on and rinses spotless under water tap.",
            "short": "Pair of heat-resistant silicone oven pinch gloves for safe pot and microwave handling.",
            "price_inr": 249.00,
            "compare_at_price": 599.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 1450,
            "emoji": "🧤",
            "tag": "Daily Must-Have",
            "tag_color": "#e11d48",
            "tag_bg": "rgba(225,29,72,0.12)",
            "cj_sku": "meesho_silicone_pinch_mitts_pair",
            "is_trending": False,
            "is_new": True,
            "stock": 160
        },

        # === VIRAL LIFESTYLE, HOME & BEAUTY ORGANIZERS ===
        {
            "id": "meesho-360-rotating-makeup-cosmetic-organizer-acrylic",
            "title": "360° Rotating Acrylic Cosmetic & Makeup Carousel Organizer",
            "description": "Holds up to 30 makeup brushes, 20 skincare bottles, lipsticks, and perfumes on vanity tables. 360-degree silent spinning base with 4 adjustable tray heights. Crystal diamond aesthetic clear finish.",
            "short": "Large capacity 360° rotating diamond-cut acrylic vanity cosmetic and skincare organizer.",
            "price_inr": 599.00,
            "compare_at_price": 1399.00,
            "category": "fashion",
            "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 2890,
            "emoji": "💄",
            "tag": "Vanity Essential",
            "tag_color": "#ec4899",
            "tag_bg": "rgba(236,72,153,0.12)",
            "cj_sku": "meesho_360_makeup_organizer_acrylic",
            "is_trending": True,
            "is_new": True,
            "stock": 95
        },
        {
            "id": "meesho-automatic-wall-toothpaste-dispenser-cup-holder",
            "title": "Wall-Mounted Automatic Toothpaste Dispenser with Magnetic Cups",
            "description": "Keep bathroom counters clutter-free! Vacuum pump dispenses the perfect amount of toothpaste with zero waste. Upside-down magnetic cups drain fast and stay hygienic and dustproof. Drill-free adhesive wall mount.",
            "short": "Hygienic automatic toothpaste squeezer with magnetic draining cups and toothbrush slots.",
            "price_inr": 449.00,
            "compare_at_price": 999.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 2150,
            "emoji": "🪥",
            "tag": "Bathroom Smart",
            "tag_color": "#06b6d4",
            "tag_bg": "rgba(6,182,212,0.12)",
            "cj_sku": "meesho_toothpaste_dispenser_magnetic_cups",
            "is_trending": False,
            "is_new": True,
            "stock": 110
        },
        {
            "id": "meesho-super-absorbent-quick-dry-hair-towel-wrap-2pk",
            "title": "Super Absorbent Microfiber Quick-Dry Hair Towel Wrap (Pack of 2)",
            "description": "Dries wet hair 2x faster without heat damage or frizz. Plush coral fleece microfiber absorbs excess moisture quickly. Secure button and loop closure keeps turban locked on your head while getting ready.",
            "short": "Pack of 2 plush quick-dry microfiber hair turbans with secure button lock for frizz-free drying.",
            "price_inr": 299.00,
            "compare_at_price": 699.00,
            "category": "fashion",
            "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 2680,
            "emoji": "🧖‍♀️",
            "tag": "Self Care",
            "tag_color": "#a855f7",
            "tag_bg": "rgba(168,85,247,0.12)",
            "cj_sku": "meesho_hair_towel_wrap_2pk",
            "is_trending": False,
            "is_new": True,
            "stock": 140
        },
        {
            "id": "meesho-nordic-insulated-coffee-tumbler-straw-500ml",
            "title": "Nordic Insulated Stainless Steel Coffee Tumbler with Straw (500ml)",
            "description": "Double-wall vacuum insulation keeps iced coffee cold for 12 hours and hot chai steaming for 6 hours! Sweat-proof powder-coated exterior with leak-resistant splash lid and reusable silicone straw.",
            "short": "500ml double-wall thermal stainless travel tumbler with straw for iced coffee & hot tea.",
            "price_inr": 499.00,
            "compare_at_price": 1199.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 3100,
            "emoji": "🥤",
            "tag": "Daily Aesthetic",
            "tag_color": "#10b981",
            "tag_bg": "rgba(16,185,129,0.12)",
            "cj_sku": "meesho_nordic_coffee_tumbler_500ml",
            "is_trending": True,
            "is_new": True,
            "stock": 125
        },
        {
            "id": "meesho-retractable-foldable-balcony-clothes-drying-rack",
            "title": "Retractable Foldable Balcony & Window Clothes Drying Rack",
            "description": "Space-saving heavy duty stainless steel drying hanger clips onto balcony railings, window sills, and radiators. Holds up to 15kg of laundry with rustproof adjustable arms. Folds flat when not in use.",
            "short": "Foldable window & balcony clothes drying rack with heavy duty rustproof stainless rods.",
            "price_inr": 499.00,
            "compare_at_price": 1199.00,
            "category": "home-living",
            "image_url": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 1520,
            "emoji": "👕",
            "tag": "Balcony Smart",
            "tag_color": "#3b82f6",
            "tag_bg": "rgba(59,130,246,0.12)",
            "cj_sku": "meesho_balcony_clothes_drying_rack",
            "is_trending": False,
            "is_new": True,
            "stock": 70
        },

        # === TRENDING TECH & AUTOMOTIVE GADGETS ===
        {
            "id": "meesho-universal-360-magnetic-car-phone-mount",
            "title": "Universal 360° Magnetic Car Phone Mount Dashboard Holder",
            "description": "Powerful 6x N52 neodymium magnets lock phones firmly even on bumpy Indian roads. 360-degree swivel ball head allows one-handed landscape GPS navigation. Strong 3M adhesive base sticks to any dashboard.",
            "short": "Heavy duty 360° rotating magnetic car dashboard phone mount with ultra-strong N52 grip.",
            "price_inr": 299.00,
            "compare_at_price": 699.00,
            "category": "electronics",
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 2980,
            "emoji": "🚗",
            "tag": "Car Gear",
            "tag_color": "#64748b",
            "tag_bg": "rgba(100,116,139,0.12)",
            "cj_sku": "meesho_magnetic_car_phone_mount",
            "is_trending": True,
            "is_new": True,
            "stock": 170
        },
        {
            "id": "meesho-cordless-mini-portable-vacuum-cleaner-usb",
            "title": "Cordless Mini Handheld Vacuum Cleaner for Car & Desk (USB)",
            "description": "Powerful 6000Pa cyclone suction sucks up dust, biscuit crumbs, and pet hair from car seats, sofas, and keyboard gaps. Washable HEPA filter with crevice nozzle and brush attachments. USB rechargeable.",
            "short": "Portable high-power cordless handheld vacuum cleaner with washable HEPA filter for car & desk.",
            "price_inr": 599.00,
            "compare_at_price": 1399.00,
            "category": "electronics",
            "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800",
            "rating": 4.6,
            "reviews": 1780,
            "emoji": "🧹",
            "tag": "Car & Desk",
            "tag_color": "#475569",
            "tag_bg": "rgba(71,85,105,0.12)",
            "cj_sku": "meesho_mini_handheld_vacuum_usb",
            "is_trending": False,
            "is_new": True,
            "stock": 65
        },
        {
            "id": "meesho-10in1-electronic-cleaner-kit-keyboard-earbuds",
            "title": "10-in-1 Multi-Tool Electronic Cleaning Kit for Earbuds, Phone & Keyboard",
            "description": "Keep high-end electronics dust-free! Includes high-density keyboard brush, memory sponge stick, metal pen tip for earbud grilles, keycap puller, screen spray bottle, and microfiber polish cloth in a sleek portable case.",
            "short": "All-in-one 10-piece electronics cleaner kit with spray, keyboard brush and earbud cleaning pen.",
            "price_inr": 349.00,
            "compare_at_price": 799.00,
            "category": "electronics",
            "image_url": "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
            "rating": 4.8,
            "reviews": 3450,
            "emoji": "🎧",
            "tag": "Viral Utility",
            "tag_color": "#3b82f6",
            "tag_bg": "rgba(59,130,246,0.12)",
            "cj_sku": "meesho_10in1_electronics_cleaning_kit",
            "is_trending": True,
            "is_new": True,
            "stock": 140
        },
        {
            "id": "meesho-wireless-bluetooth-smart-gps-tag-tracker",
            "title": "Wireless Bluetooth Smart Anti-Lost Tracker Tag for Keys & Wallet",
            "description": "Never misplace house keys or wallets again. Connects with iOS and Android phone app. Tap 'Find' on phone to make the tag beep loud, or double press tag button to ring your misplaced phone even on silent mode.",
            "short": "Smart Bluetooth anti-loss item finder tag for keys, luggage, wallets, and pet collars.",
            "price_inr": 299.00,
            "compare_at_price": 699.00,
            "category": "electronics",
            "image_url": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=800",
            "rating": 4.6,
            "reviews": 2340,
            "emoji": "🏷️",
            "tag": "Smart Tag",
            "tag_color": "#0ea5e9",
            "tag_bg": "rgba(14,165,233,0.12)",
            "cj_sku": "meesho_smart_bluetooth_tracker_tag",
            "is_trending": False,
            "is_new": True,
            "stock": 130
        },
        {
            "id": "meesho-usb-heated-steam-eye-mask-sleep-therapy",
            "title": "USB Heated Steam Eye Mask with Adjustable Temperature & Timer",
            "description": "Relieve eye strain from mobile and laptop screens instantly. Lavender aroma pouch combined with gentle therapeutic heat relaxes tired eye muscles, reduces dark circles, and improves sleep quality. Washable soft silk cover.",
            "short": "Thermal heated electric eye mask with 4 heat settings and timer for eye fatigue & sleep therapy.",
            "price_inr": 499.00,
            "compare_at_price": 1199.00,
            "category": "fashion",
            "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
            "rating": 4.7,
            "reviews": 1420,
            "emoji": "😴",
            "tag": "Sleep Therapy",
            "tag_color": "#6366f1",
            "tag_bg": "rgba(99,102,241,0.12)",
            "cj_sku": "meesho_usb_heated_eye_mask",
            "is_trending": False,
            "is_new": True,
            "stock": 80
        }
    ]

    print(f"\n📦 Adding {len(new_meesho_products)} new premium Meesho winning products...")
    for p in new_meesho_products:
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
                :cj_sku, :is_trending, :is_new, true, 'Meesho', 'INDIA', :stock, :chapter
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                short = EXCLUDED.short,
                price_inr = EXCLUDED.price_inr,
                price = EXCLUDED.price,
                compare_at_price = EXCLUDED.compare_at_price,
                old_price = EXCLUDED.old_price,
                category = EXCLUDED.category,
                image_url = EXCLUDED.image_url,
                rating = EXCLUDED.rating,
                reviews = EXCLUDED.reviews,
                emoji = EXCLUDED.emoji,
                tag = EXCLUDED.tag,
                tag_color = EXCLUDED.tag_color,
                tag_bg = EXCLUDED.tag_bg,
                cj_sku = EXCLUDED.cj_sku,
                is_trending = EXCLUDED.is_trending,
                is_new = EXCLUDED.is_new,
                active = true,
                supplier = 'Meesho',
                market = 'INDIA',
                stock = EXCLUDED.stock
        """,
            id=p['id'],
            slug=p['id'],
            title=p['title'],
            description=p['description'],
            short=p['short'],
            story=standard_story,
            details=standard_details,
            price_inr=p['price_inr'],
            price=p['price_inr'],
            compare_at_price=p['compare_at_price'],
            old_price=p['compare_at_price'],
            category=p['category'],
            image_url=p['image_url'],
            rating=p['rating'],
            reviews=p['reviews'],
            emoji=p['emoji'],
            tag=p['tag'],
            tag_color=p['tag_color'],
            tag_bg=p['tag_bg'],
            cj_sku=p['cj_sku'],
            is_trending=bool(p.get('is_trending', False)),
            is_new=bool(p.get('is_new', False)),
            stock=p['stock'],
            chapter=p['category'].upper()
        )
        print(f"  ✓ Added: {p['title']} (₹{p['price_inr']}, MRP ₹{p['compare_at_price']})")

    # Audit total
    total = con.run("SELECT count(*) FROM products WHERE active = true")[0][0]
    trending = con.run("SELECT count(*) FROM products WHERE active = true AND is_trending = true")[0][0]
    by_cat = con.run("SELECT category, count(*) FROM products WHERE active = true GROUP BY category")

    print("\n==============================================")
    print(f"🎉 CATALOG EXPANSION COMPLETE: {total} TOTAL ACTIVE PRODUCTS")
    print(f"🔥 Trending Items: {trending}")
    print(f"Categories Breakdown: {by_cat}")
    print("==============================================")

    con.close()

if __name__ == "__main__":
    main()
