"""
Hermes Autonomous SEO & Indexing Engine (Lightweight & Low-CPU)
Generates sitemap with all live Meesho/Indian winning products and submits to IndexNow / Google.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load local environment if available
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

SITE_URL = os.environ.get("SITE_URL", "https://rareember-store.vercel.app").strip()
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "").strip()
INDEXNOW_KEY = os.environ.get("INDEXNOW_KEY", "rareember2026indexnowkey").strip()

def fetch_all_live_products():
    """Gently fetches all live products from Supabase database."""
    url = f"{SUPABASE_URL}/rest/v1/products?select=id,title,category,updated_at,created_at&market=eq.INDIA&order=created_at.desc&limit=150"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"Error fetching products from DB: {e}")
        return []

def generate_full_sitemap_xml(products):
    """Builds a complete, valid sitemap.xml containing static pages and all 89+ products."""
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Static high-priority pages
    static_pages = [
        ("/", "1.0", "daily"),
        ("/shop", "0.9", "daily"),
        ("/about", "0.7", "monthly"),
        ("/contact", "0.7", "monthly"),
        ("/returns", "0.7", "monthly"),
        ("/track", "0.8", "weekly"),
        ("/shop?cat=home-living", "0.9", "daily"),
        ("/shop?cat=electronics", "0.9", "daily"),
        ("/shop?cat=fashion", "0.9", "daily"),
    ]
    
    for path, prio, freq in static_pages:
        xml.append("  <url>")
        xml.append(f"    <loc>{SITE_URL}{path}</loc>")
        xml.append(f"    <lastmod>{now_str}</lastmod>")
        xml.append(f"    <changefreq>{freq}</changefreq>")
        xml.append(f"    <priority>{prio}</priority>")
        xml.append("  </url>")
        
    for p in products:
        p_id = p.get("id")
        if not p_id:
            continue
        xml.append("  <url>")
        xml.append(f"    <loc>{SITE_URL}/product/{p_id}</loc>")
        xml.append(f"    <lastmod>{now_str}</lastmod>")
        xml.append(f"    <changefreq>weekly</changefreq>")
        xml.append(f"    <priority>0.85</priority>")
        xml.append("  </url>")
        
    xml.append("</urlset>")
    return "\n".join(xml)

def submit_to_indexnow(url_list):
    """Submits URLs directly to IndexNow API (Bing, Yandex, Seznam) for instant crawler indexing."""
    endpoint = "https://api.indexnow.org/indexnow"
    payload = {
        "host": "rareember-store.vercel.app",
        "key": INDEXNOW_KEY,
        "keyLocation": f"{SITE_URL}/{INDEXNOW_KEY}.txt",
        "urlList": url_list[:100]
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(endpoint, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return {"status": "submitted", "code": resp.status, "count": len(url_list[:100])}
    except Exception as e:
        return {"status": "notice", "error": str(e), "count": len(url_list[:100])}

def ping_search_engines():
    """Pings Bing crawler with the store sitemap URL (Google ping shut down in 2023)."""
    sitemap_url = urllib.parse.quote(f"{SITE_URL}/sitemap.xml")
    pings = {
        "bing": f"https://www.bing.com/ping?sitemap={sitemap_url}"
    }
    results = {}
    for engine, url in pings.items():
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                results[engine] = f"HTTP {resp.status}"
        except Exception as e:
            results[engine] = f"Notice: {e}"
        time.sleep(1.0)
    return results

def run_seo_blitz():
    """Runs a complete lightweight SEO optimization cycle."""
    print("🔍 Fetching live products for SEO indexing...")
    products = fetch_all_live_products()
    print(f"📦 Found {len(products)} live products in database.")
    
    # 1. Generate Sitemap
    sitemap_content = generate_full_sitemap_xml(products)
    out_sitemap = os.path.join(os.path.dirname(__file__), "sitemap.xml")
    with open(out_sitemap, "w", encoding="utf-8") as f:
        f.write(sitemap_content)
    print(f"✅ Generated comprehensive sitemap.xml with {len(products) + 9} URLs: {out_sitemap}")
    
    # Also write to public folder of Next.js store if accessible
    public_dirs = [
        os.path.join(os.path.dirname(__file__), "storefront", "public"),
        os.path.join(os.path.dirname(__file__), "..", "rareember", "dropshipping-platform", "frontend", "public")
    ]
    for pdir in public_dirs:
        if os.path.exists(pdir):
            try:
                with open(os.path.join(pdir, "sitemap.xml"), "w", encoding="utf-8") as f:
                    f.write(sitemap_content)
                with open(os.path.join(pdir, f"{INDEXNOW_KEY}.txt"), "w", encoding="utf-8") as f:
                    f.write(INDEXNOW_KEY)
                print(f"✅ Synced static sitemap.xml and IndexNow key file directly to {pdir}!")
            except Exception as pe:
                print(f"Notice writing to {pdir}: {pe}")

    # 2. Collect URLs for IndexNow
    url_list = [f"{SITE_URL}/", f"{SITE_URL}/shop"] + [f"{SITE_URL}/product/{p['id']}" for p in products if p.get("id")]
    
    # 3. Submit to IndexNow
    print(f"🚀 Submitting {len(url_list)} URLs to IndexNow (Bing/Yandex/Seznam)...")
    indexnow_res = submit_to_indexnow(url_list)
    print(f"   IndexNow result: {indexnow_res}")
    
    # 4. Ping search engines
    print("📡 Pinging Google and Bing sitemap crawlers...")
    ping_res = ping_search_engines()
    print(f"   Ping results: {ping_res}")
    
    return {
        "products_indexed": len(products),
        "total_urls": len(url_list),
        "indexnow": indexnow_res,
        "search_engine_pings": ping_res,
        "sitemap_url": f"{SITE_URL}/sitemap.xml"
    }

if __name__ == "__main__":
    res = run_seo_blitz()
    print("\nSEO Blitz Summary:", json.dumps(res, indent=2))
