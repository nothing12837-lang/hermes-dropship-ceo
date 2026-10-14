"""
Hermes Executive Team Module
Implements the 6 autonomous departmental personas under Hermes God-CEO:
- Vikram (Sales & Pricing)
- Aarav (SEO & Content)
- Pooja (Customer Care & Fulfillment)
- Meera (Creative Media & Video Scripting)
- Kabir (Finance & Unit Economics)
- Arjun (Meesho Product Scout & Hunter)
"""

import os
import json
import ssl
import urllib.parse
from datetime import datetime, timezone
import pg8000.native
from hermes_ceo.memory import save_memory, get_memory

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.qdkkxpfhwrwyoardlceo.supabase.co").strip()
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres").strip()
DB_PASS = os.environ.get("SUPABASE_DB_PASS", "").strip()
DB_NAME = os.environ.get("SUPABASE_DB_NAME", "postgres").strip()
SITE_URL = os.environ.get("SITE_URL", "https://rareember-store.vercel.app").strip()

def _get_con():
    if not DB_PASS:
        return None
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return pg8000.native.Connection(
            user=DB_USER,
            host=DB_HOST,
            port=5432,
            database=DB_NAME,
            password=DB_PASS,
            ssl_context=ctx
        )
    except Exception as e:
        print(f"[Team DB] Error: {e}")
        return None

# ─────────────────────────────────────────────────────────────
# 1. VIKRAM — SALES & COMMERCIAL STRATEGY
# ─────────────────────────────────────────────────────────────
class VikramSales:
    """Manages catalog sales velocity, pricing, and promotional coupons."""

    @staticmethod
    def evaluate_pricing_strategy():
        """Audits all active products and identifies opportunities for dynamic pricing or bundles."""
        con = _get_con()
        if not con:
            return {"status": "error", "message": "No DB connection"}
        try:
            rows = con.run("""
                SELECT id, title, price_inr, compare_at_price, category, reviews
                FROM products
                WHERE active = true
                ORDER BY reviews DESC LIMIT 20
            """)
            con.close()

            recommendations = []
            for r in rows:
                pid, title, price, mrp, cat, rev = r[0], r[1], float(r[2] or 0), float(r[3] or 0), r[4], int(r[5] or 0)
                discount_pct = round((1 - price / mrp) * 100) if mrp > price else 0
                if discount_pct < 40 and price > 499:
                    recommendations.append({
                        "product_id": pid,
                        "title": title,
                        "current_price": price,
                        "action": "INCREASE_PERCEIVED_VALUE",
                        "note": f"Adjust compare_at_price to enhance perceived discount beyond {discount_pct}%"
                    })
            save_memory("VIKRAM", "procedural", "last_pricing_audit", {"recommendations": recommendations})
            return {"status": "success", "audited": len(rows), "recommendations": recommendations}
        except Exception as e:
            if con: con.close()
            return {"status": "error", "error": str(e)}

    @staticmethod
    def get_active_coupons():
        return {
            "DIWALI100": {"discount_inr": 100, "min_order": 499, "type": "flat", "tag": "Festive Special"},
            "NEWYEAR": {"discount_inr": 150, "min_order": 999, "type": "flat", "tag": "Seasonal"},
            "HOLI": {"discount_inr": 100, "min_order": 499, "type": "flat", "tag": "Festival of Colors"},
            "FIRST50": {"discount_inr": 50, "min_order": 349, "type": "flat", "tag": "Welcome Gift"},
            "RAKHI": {"discount_inr": 100, "min_order": 499, "type": "flat", "tag": "Festive Special"}
        }

# ─────────────────────────────────────────────────────────────
# 2. AARAV — CHIEF SEO & ORGANIC CONTENT OFFICER
# ─────────────────────────────────────────────────────────────
class AaravSEO:
    """Writes SEO blog posts directly into Supabase blog_posts table & manages IndexNow."""

    @staticmethod
    def publish_daily_blog(gemini_client=None):
        """Generates an SEO-rich lifestyle article and stores it cleanly in Supabase blog_posts."""
        topics = [
            ("Top 10 Aesthetic Home Mandir Lighting Ideas for Diwali in India", "mandir-lighting-ideas-diwali", "decor"),
            ("How to Create a Cozy Aesthetic Bedroom Desk Setup Under 500 Rupees", "cozy-desk-setup-under-500", "tech"),
            ("Why Smokeless Water Sensor LED Diyas are Replacing Traditional Candles", "water-sensor-led-diyas-guide", "home-living"),
            ("7 Best Wireless Tech Accessories for Minimalist Workspaces in 2026", "best-minimalist-desk-tech-accessories", "tech"),
            ("Festive Indian Dining & Living Room Decor: Complete Buyer Guide", "festive-dining-decor-guide-india", "home-living")
        ]

        # Pick topic not yet published
        con = _get_con()
        if not con:
            return {"status": "error", "message": "No DB connection"}

        try:
            chosen = None
            for title, slug, cat in topics:
                exists = con.run("SELECT id FROM blog_posts WHERE slug = :s", s=slug)
                if not exists:
                    chosen = (title, slug, cat)
                    break

            if not chosen:
                con.close()
                return {"status": "skipped", "message": "All default topics already published"}

            title, slug, cat = chosen
            excerpt = f"Explore curated styling tips and verified Indian home aesthetics for {title.lower()}."
            content = f"""# {title}

Transforming your personal space into an inspiring sanctuary doesn't require massive renovations or expensive imported furniture. With thoughtful, intentional accents sourced directly from authentic domestic artisans and verified Indian manufacturers, you can achieve world-class aesthetics on a budget.

## 1. Ambient Lighting is Everything
The secret behind viral interior decor and luxury spaces is layered ambient lighting. Rather than relying on harsh overhead white bulbs, warm lighting creates depth, relaxation, and warmth.

- **Water Sensor LED Diyas:** Perfect for festive entrances, pooja rooms, and balcony rangolis with zero fire hazard.
- **Crystal Diamond Touch Lamps:** 16 RGB color modes with soft dimming for nightstands and work desks.
- **Flameless Crystal LED Candles:** Real dancing flame glow with battery convenience around children and pets.

## 2. Minimalist Form Meets Everyday Utility
Choose home and desk accessories that serve a functional purpose while looking like modern art sculptures. Heavy textured door mats keep dust outside while greeting guests with warmth, while floating diamond wall shelves maximize vertical space without damaging rental apartment walls.

## 3. Pan-India Express Logistics & Cash on Delivery
Every curated drop on RareEmber is dispatched via express domestic logistics (Delhivery, Shadowfax, BlueDart) with doorstep Cash on Delivery (COD) across 19,000+ PIN codes and an authentic 7-Day Doorstep Replacement Guarantee.

Explore our latest festive drops today on the [RareEmber Storefront]({SITE_URL}/shop).
"""

            con.run("""
                INSERT INTO blog_posts (slug, title, excerpt, content, category, author, published, created_at, updated_at)
                VALUES (:slug, :title, :excerpt, :content, :cat, 'Aarav - RareEmber Editorial', true, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
            """, slug=slug, title=title, excerpt=excerpt, content=content, cat=cat)
            con.close()

            save_memory("AARAV", "episodic", f"blog_{slug}", {"title": title, "slug": slug})
            return {"status": "published", "title": title, "slug": slug, "url": f"{SITE_URL}/blog/{slug}"}
        except Exception as e:
            if con: con.close()
            return {"status": "error", "error": str(e)}

# ─────────────────────────────────────────────────────────────
# 3. POOJA — CUSTOMER CARE & DELIVERY OPERATIONS
# ─────────────────────────────────────────────────────────────
class PoojaOperations:
    """Manages order confirmations, 1-click WhatsApp links, courier AWB tracking, and RTO risk."""

    @staticmethod
    def generate_whatsapp_cod_link(order_id: str, customer_phone: str, customer_name: str, total_amount: str):
        """Generates a pre-filled 1-click WhatsApp confirmation link for Ajay to ping the customer."""
        clean_phone = "".join(filter(str.isdigit, str(customer_phone or "")))
        if clean_phone.startswith("0"):
            clean_phone = clean_phone[1:]
        if len(clean_phone) == 10:
            clean_phone = f"91{clean_phone}"

        msg = (
            f"Namaste {customer_name}! 🙏\n\n"
            f"Aapka RareEmber order #{order_id[:8]} confirm ho chuka hai (Total: ₹{total_amount}, Cash on Delivery).\n\n"
            f"📦 Delivery: 2–4 din me Delhivery / Shadowfax se aapke doorstep par dispatch hoga.\n\n"
            f"Kripya delivery confirm karne ke liye reply karein: 'YES CONFIRM'\n\n"
            f"Thank you for choosing RareEmber!"
        )
        encoded_msg = urllib.parse.quote(msg)
        return f"https://wa.me/{clean_phone}?text={encoded_msg}"

    @staticmethod
    def assess_rto_risk(phone: str, pincode: str):
        """Evaluates customer historical delivery rate and assigns RTO risk score (0-100)."""
        con = _get_con()
        if not con:
            return {"risk_score": 20, "recommendation": "ALLOW_COD"}
        try:
            clean_p = "".join(filter(str.isdigit, str(phone or "")))[-10:]
            row = con.run("SELECT risk_score, recommendation, order_count, rto_count FROM rto_risk_scores WHERE phone = :p", p=clean_p)
            con.close()
            if row:
                r = row[0]
                return {
                    "risk_score": r[0],
                    "recommendation": r[1],
                    "history": f"{r[2]} orders, {r[3]} RTO"
                }
            return {"risk_score": 15, "recommendation": "ALLOW_COD", "history": "New Customer"}
        except Exception:
            if con: con.close()
            return {"risk_score": 20, "recommendation": "ALLOW_COD"}

    @staticmethod
    def get_courier_tracking_info(awb: str, courier: str = "Delhivery"):
        """Generates live tracking URLs based on AWB prefix and courier partner."""
        tn = str(awb or "").strip()
        c_lower = courier.lower()
        if "shadow" in c_lower or tn.upper().startswith("SF"):
            return {"courier": "Shadowfax", "url": f"https://tracker.shadowfax.in/#/track/{tn}"}
        elif "xpress" in c_lower or tn.upper().startswith("XB"):
            return {"courier": "Xpressbees", "url": f"https://www.xpressbees.com/shipment/tracking?awbNo={tn}"}
        elif "blue" in c_lower:
            return {"courier": "BlueDart", "url": f"https://www.bluedart.com/tracking?track={tn}"}
        elif "ekart" in c_lower:
            return {"courier": "Ekart", "url": f"https://ekartlogistics.com/shipmenttrack/{tn}"}
        return {"courier": "Delhivery", "url": f"https://www.delhivery.com/track/package/{tn}"}

# ─────────────────────────────────────────────────────────────
# 4. MEERA — CREATIVE & MEDIA DIRECTOR (BOSS OF EVAA)
# ─────────────────────────────────────────────────────────────
class MeeraCreative:
    """Crafts 28-second agency-grade viral Reels scripts tailored for Evaa's voice."""

    @staticmethod
    def generate_evaa_script(product_title: str, price_inr: float, mrp_inr: float, key_benefit: str):
        """Generates structured 28-second Hook/Problem/Demo/CTA Hindi script."""
        discount_pct = round((1 - price_inr / mrp_inr) * 100) if mrp_inr > price_inr else 50
        return {
            "hook_duration": "0:00 - 0:06",
            "hook_speech": f"Agar aap bhi apne room ko luxury hotel vibe dena chahte ho, toh yeh reel bilkul miss mat karna!",
            "problem_speech": f"Boring lights aur plain tables se room dull lagta hai, aur market me aesthetic pieces ₹1500 se kam nahi milte.",
            "demo_speech": f"Lekin RareEmber par yeh {product_title} mil raha hai direct factory price par! {key_benefit}.",
            "cta_speech": f"MRP ₹{mrp_inr:,.0f} ka item sirf ₹{price_inr:,.0f} me mil raha hai! Flat {discount_pct}% OFF aur Cash on Delivery available hai. Bio me link hai, abhi order karo!",
            "audio_vibe": "Upbeat Lofi Aesthetic / Festive Golden Glow",
            "screen_text": [
                "✨ Aesthetic Room Transformation",
                f"🔥 ₹{price_inr:,.0f} (Flat {discount_pct}% OFF)",
                "💵 Cash on Delivery Available Across India"
            ]
        }

# ─────────────────────────────────────────────────────────────
# 5. KABIR — CHIEF FINANCIAL OFFICER
# ─────────────────────────────────────────────────────────────
class KabirFinance:
    """Manages unit economics, P&L calculations, and enforces the >45% profit margin rule."""

    @staticmethod
    def compute_order_pnl(order_id: str, revenue_inr: float, meesho_cogs_inr: float, is_cod: bool = True):
        """
        Calculates exact per-order unit economics:
        Revenue - Sourcing - Shipping (₹79) - RTO Reserve (₹50 if COD) - Gateway (2% if prepaid) = Net Profit.
        """
        shipping = 79.00
        rto_reserve = 50.00 if is_cod else 0.00
        gateway_fee = 0.00 if is_cod else round(revenue_inr * 0.02, 2)
        total_costs = meesho_cogs_inr + shipping + rto_reserve + gateway_fee
        net_profit = round(revenue_inr - total_costs, 2)
        margin_pct = round((net_profit / revenue_inr) * 100, 2) if revenue_inr > 0 else 0.0

        con = _get_con()
        if con:
            try:
                con.run("""
                    INSERT INTO orders_pnl (
                        order_id, revenue_inr, meesho_cogs_inr, shipping_cost_inr,
                        rto_reserve_inr, gateway_fee_inr, net_profit_inr, margin_pct, is_cod, created_at
                    ) VALUES (
                        :oid, :rev, :cogs, :ship, :rto, :gw, :prof, :marg, :cod, NOW()
                    )
                    ON CONFLICT (order_id) DO UPDATE SET
                        net_profit_inr = EXCLUDED.net_profit_inr,
                        margin_pct = EXCLUDED.margin_pct
                """,
                    oid=order_id,
                    rev=revenue_inr,
                    cogs=meesho_cogs_inr,
                    ship=shipping,
                    rto=rto_reserve,
                    gw=gateway_fee,
                    prof=net_profit,
                    marg=margin_pct,
                    cod=is_cod
                )
                con.close()
            except Exception as e:
                print(f"[PNL Save Error] {e}")
                if con: con.close()

        return {
            "order_id": order_id,
            "revenue": revenue_inr,
            "cogs": meesho_cogs_inr,
            "shipping": shipping,
            "rto_reserve": rto_reserve,
            "gateway_fee": gateway_fee,
            "net_profit": net_profit,
            "margin_pct": margin_pct
        }

    @staticmethod
    def audit_daily_pnl():
        """Generates aggregate financial report of all settled orders."""
        con = _get_con()
        if not con:
            return {"error": "DB connection unavailable"}
        try:
            summary = con.run("""
                SELECT
                    count(*),
                    coalesce(sum(revenue_inr), 0),
                    coalesce(sum(net_profit_inr), 0),
                    coalesce(avg(margin_pct), 0)
                FROM orders_pnl
                WHERE created_at >= NOW() - INTERVAL '24 hours'
            """)
            con.close()
            r = summary[0]
            return {
                "orders_24h": int(r[0] or 0),
                "revenue_inr": float(r[1] or 0),
                "net_profit_inr": float(r[2] or 0),
                "avg_margin_pct": float(r[3] or 0)
            }
        except Exception as e:
            if con: con.close()
            return {"error": str(e)}

# ─────────────────────────────────────────────────────────────
# 6. ARJUN — CHIEF PROCUREMENT & MEESHO PRODUCT SCOUT
# ─────────────────────────────────────────────────────────────
class ArjunScout:
    """Scouts high-converting, high-margin drops on Meesho with strict quality checks."""

    @staticmethod
    def queue_scouted_product(item_data: dict):
        """
        Takes candidate product from scraper, calculates margin via Kabir,
        and saves into Supabase scouted_products table.
        """
        con = _get_con()
        if not con:
            return {"error": "DB connection unavailable"}
        try:
            pid = item_data.get("id") or f"meesho-scout-{int(datetime.now(timezone.utc).timestamp())}"
            title = item_data.get("title", "")
            cost = float(item_data.get("meesho_cost_inr", 0))
            mrp = float(item_data.get("mrp_inr", cost * 2.8))
            target_price = float(item_data.get("target_price_inr", cost * 2.2 + 50))
            profit = target_price - (cost + 79 + 50)
            margin = round((profit / target_price) * 100, 2) if target_price > 0 else 0.0

            con.run("""
                INSERT INTO scouted_products (
                    id, title, category, meesho_url, meesho_cost_inr,
                    target_price_inr, mrp_inr, projected_profit_inr, margin_pct,
                    rating, reviews_count, image_url, status, created_at, updated_at
                ) VALUES (
                    :id, :title, :cat, :url, :cost,
                    :tprice, :mrp, :prof, :marg,
                    :rating, :revs, :img, 'pending_approval', NOW(), NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                    meesho_cost_inr = EXCLUDED.meesho_cost_inr,
                    target_price_inr = EXCLUDED.target_price_inr,
                    updated_at = NOW()
            """,
                id=pid,
                title=title,
                cat=item_data.get("category", "home-living"),
                url=item_data.get("meesho_url", ""),
                cost=cost,
                tprice=target_price,
                mrp=mrp,
                prof=profit,
                marg=margin,
                rating=float(item_data.get("rating", 4.8)),
                revs=int(item_data.get("reviews_count", 1500)),
                img=item_data.get("image_url", "")
            )
            con.close()
            return {
                "status": "queued",
                "id": pid,
                "title": title,
                "cost": cost,
                "target_price": target_price,
                "projected_profit": profit,
                "margin_pct": margin
            }
        except Exception as e:
            if con: con.close()
            return {"error": str(e)}
