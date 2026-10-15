"""
Database Tool for RareEmber CrewAI Agents
Direct PostgreSQL connection to Supabase with SSL-bypass for connection pooler.
"""

import ssl
import json
from typing import Any, Dict, List, Optional
import pg8000.native

from rareember_crew.config import (
    SUPABASE_DB_HOST,
    SUPABASE_DB_PORT,
    SUPABASE_DB_USER,
    SUPABASE_DB_PASS,
    SUPABASE_DB_NAME,
)

def get_db_connection():
    """Returns a native pg8000 connection to Supabase PostgreSQL."""
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return pg8000.native.Connection(
            host=SUPABASE_DB_HOST,
            port=SUPABASE_DB_PORT,
            user=SUPABASE_DB_USER,
            password=SUPABASE_DB_PASS,
            database=SUPABASE_DB_NAME,
            ssl_context=ctx,
            timeout=15,
        )
    except Exception as e:
        print(f"⚠️ [DB CONNECTION ERROR]: {e}")
        return None

class SupabaseDatabaseTool:
    """Helper wrapper for CrewAI agents to read and modify business state in Supabase."""

    @staticmethod
    def run_query(sql: str, params: Optional[Dict[str, Any]] = None) -> List[Any]:
        con = get_db_connection()
        if not con:
            return []
        try:
            res = con.run(sql, **(params or {}))
            con.close()
            return res or []
        except Exception as e:
            print(f"⚠️ [SQL EXEC ERROR]: {e}")
            if con:
                try: con.close()
                except Exception: pass
            return []

    @staticmethod
    def get_catalog_stats() -> Dict[str, Any]:
        """Returns catalog count, active items, and price range."""
        con = get_db_connection()
        if not con:
            return {"total": 0, "active": 0}
        try:
            row = con.run("""
                SELECT 
                    count(*),
                    count(*) FILTER (WHERE active = true),
                    coalesce(avg(price_inr), 0),
                    coalesce(min(price_inr), 0),
                    coalesce(max(price_inr), 0)
                FROM products
            """)[0]
            con.close()
            return {
                "total_products": int(row[0]),
                "active_products": int(row[1]),
                "average_price_inr": round(float(row[2]), 2),
                "min_price_inr": round(float(row[3]), 2),
                "max_price_inr": round(float(row[4]), 2),
            }
        except Exception as e:
            if con: con.close()
            return {"error": str(e)}

    @staticmethod
    def get_recent_orders_stats() -> Dict[str, Any]:
        """Returns orders summary from Supabase."""
        con = get_db_connection()
        if not con:
            return {"orders_24h": 0, "revenue_inr": 0.0}
        try:
            row = con.run("""
                SELECT 
                    count(*),
                    coalesce(sum(total_amount), 0)
                FROM orders
                WHERE created_at >= NOW() - INTERVAL '24 hours'
            """)[0]
            con.close()
            return {
                "orders_24h": int(row[0]),
                "revenue_inr": float(row[1]),
            }
        except Exception as e:
            if con: con.close()
            return {"orders_24h": 0, "revenue_inr": 0.0, "note": str(e)}

    @staticmethod
    def publish_blog_post(slug: str, title: str, excerpt: str, content: str, category: str = "lifestyle") -> bool:
        """Publishes or updates an SEO blog post directly in Supabase."""
        con = get_db_connection()
        if not con:
            return False
        try:
            con.run("""
                INSERT INTO blog_posts (slug, title, excerpt, content, category, author, published, created_at, updated_at)
                VALUES (:slug, :title, :excerpt, :content, :cat, 'RareEmber CrewAI Editorial', true, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET
                    title = EXCLUDED.title,
                    content = EXCLUDED.content,
                    excerpt = EXCLUDED.excerpt,
                    updated_at = NOW()
            """, slug=slug, title=title, excerpt=excerpt, content=content, cat=category)
            con.close()
            return True
        except Exception as e:
            print(f"⚠️ [BLOG PUBLISH ERROR]: {e}")
            if con: con.close()
            return False

    @staticmethod
    def queue_scouted_product(product_data: Dict[str, Any]) -> bool:
        """Queues a newly discovered high-margin product in scouted_products."""
        con = get_db_connection()
        if not con:
            return False
        try:
            pid = product_data.get("id") or f"crew-scout-{product_data.get('slug', 'item')}"
            con.run("""
                INSERT INTO scouted_products (
                    id, title, category, meesho_url, meesho_cost_inr,
                    target_price_inr, mrp_inr, projected_profit_inr, margin_pct,
                    rating, reviews_count, image_url, status, created_at, updated_at
                ) VALUES (
                    :id, :title, :cat, :url, :cost,
                    :tprice, :mrp, :prof, :marg,
                    :rating, :revs, :img, 'approved_for_catalog', NOW(), NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                    meesho_cost_inr = EXCLUDED.meesho_cost_inr,
                    target_price_inr = EXCLUDED.target_price_inr,
                    updated_at = NOW()
            """,
                id=pid,
                title=product_data.get("title", ""),
                cat=product_data.get("category", "home-living"),
                url=product_data.get("url", ""),
                cost=float(product_data.get("wholesale_cost", 199.0)),
                tprice=float(product_data.get("selling_price", 499.0)),
                mrp=float(product_data.get("mrp", 999.0)),
                prof=float(product_data.get("net_profit", 150.0)),
                marg=float(product_data.get("margin_pct", 45.0)),
                rating=float(product_data.get("rating", 4.8)),
                revs=int(product_data.get("reviews", 1200)),
                img=product_data.get("image_url", "")
            )
            con.close()
            return True
        except Exception as e:
            print(f"⚠️ [SCOUT QUEUE ERROR]: {e}")
            if con: con.close()
            return False
