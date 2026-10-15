"""
Radha RareEmber Operational CLI Tool
Enables Radha CEO Agent to monitor, fulfill, and report on RareEmber from terminal or automated jobs.
"""

import sys
import os
import json
import urllib.request
import urllib.parse
from datetime import datetime

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
ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "").strip()
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_ALLOWED_USERS", "5238068527").split(",")[0].strip()
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "").strip()

def send_telegram(text: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "Markdown"}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"Telegram alert error: {e}")
        return None

def fetch_orders(limit=20, status=None):
    url = f"{SITE_URL}/api/admin/orders?limit={limit}"
    if status:
        url += f"&status={status}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {ADMIN_SECRET}"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode()).get("orders", [])
    except Exception as e:
        print(f"Fetch orders error: {e}")
        return []

def fulfill_order(order_id: str):
    url = f"{SITE_URL}/api/admin/orders"
    payload = json.dumps({"order_id": order_id, "status": "shipped"}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {ADMIN_SECRET}",
        "Content-Type": "application/json"
    }, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"Fulfill error: {e}")
        return {"error": str(e)}

def audit_catalog():
    url = f"{SUPABASE_URL}/rest/v1/products?select=id,title,price_inr,stock,active&order=created_at.desc&limit=150"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return {
                "total_products": len(data),
                "active": sum(1 for p in data if p.get("active")),
                "low_stock": [p["title"] for p in data if (p.get("stock") or 0) < 5]
            }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "status"
    if action == "orders":
        print(json.dumps(fetch_orders(), indent=2))
    elif action == "audit":
        print(json.dumps(audit_catalog(), indent=2))
    elif action == "fulfill" and len(sys.argv) > 2:
        print(json.dumps(fulfill_order(sys.argv[2]), indent=2))
    else:
        print(f"👑 Radha RareEmber Controller Online | Storefront: {SITE_URL}")
        audit = audit_catalog()
        print(f"Catalog Status: {audit.get('total_products', 0)} total, {audit.get('active', 0)} active.")
