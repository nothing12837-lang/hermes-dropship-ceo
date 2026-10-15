"""
Hermes RareEmber Operational CLI Tool
Enables Hermes Agent to monitor, fulfill, and report on RareEmber from terminal or automated jobs.
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

SITE_URL = os.environ.get("SITE_URL", "https://www.rareember.shop").strip()
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
    payload = json.dumps({"orderId": order_id}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {ADMIN_SECRET}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"ok": False, "error": str(e)}

def status():
    orders = fetch_orders(limit=50)
    total_rev = sum(float(o.get("total_amount") or 0) for o in orders)
    print("=" * 50)
    print("🏛️  HERMES RAREEMBER OPERATIONS REPORT")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Recent Orders Checked: {len(orders)}")
    print(f"Total Value: {total_rev:.2f}")
    print("=" * 50)
    for o in orders[:5]:
        print(f"- Order #{o['id'][:8]}: {o.get('user_email')} | Status: {o.get('status')} | {o.get('total_amount')}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python hermes_rareember_tool.py [status|orders|fulfill <order_id>|notify <msg>]")
        return

    cmd = sys.argv[1].lower()
    if cmd == "status":
        status()
    elif cmd == "orders":
        orders = fetch_orders()
        print(json.dumps(orders, indent=2))
    elif cmd == "fulfill" and len(sys.argv) > 2:
        res = fulfill_order(sys.argv[2])
        print(json.dumps(res, indent=2))
    elif cmd == "notify" and len(sys.argv) > 2:
        msg = " ".join(sys.argv[2:])
        send_telegram(msg)
        print("Notification sent.")
    else:
        print("Unknown command.")

if __name__ == "__main__":
    main()
