"""
DISPATCH RAREEMBER OFFICIAL QIKINK FLAGSHIP CATALOG TO TELEGRAM
Delivers clean, verified PDP links on https://www.rareember.shop to Boss Ajay.
"""

import os
import sys
import html
import requests

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from radha_ceo.team import _get_con

ENV = {}
for p in [os.path.join(WORKSPACE_PATH, ".env"), os.path.join(WORKSPACE_PATH, "storefront", ".env.local")]:
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k.strip() not in ENV:
                        ENV[k.strip()] = v.strip().strip('"').strip("'")

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or ENV.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID") or ENV.get("TELEGRAM_CHAT_ID", "5238068527")
SITE_URL = "https://www.rareember.shop"

def send_msg(text: str):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    r = requests.post(url, json=payload, timeout=12)
    return r.json()

def dispatch_catalog():
    con = _get_con()
    rows = con.run('SELECT id, slug, title, price_inr, compare_at_price, category, cj_sku FROM products WHERE active = true ORDER BY category, price_inr ASC')
    con.close()

    total = len(rows)
    print(f"Total active products: {total}")

    # Header
    msg = (
        f"👑 <b>RareEmber Official Qikink D2C Collection ({total} Items)</b>\n\n"
        f"Boss Ajay, aapka custom domain <b>rareember.shop</b> LIVE ho chuka hai! 🚀\n"
        f"Meesho ka catalog terminate kar diya gaya hai, aur official Qikink D2C catalog verified PDP links ke saath ready hai:\n\n"
        f"• <b>Live Store:</b> <a href=\"{SITE_URL}\">www.rareember.shop</a>\n"
        f"• <b>Fulfillment:</b> 100% Qikink White-Label (Coimbatore Hub)\n"
        f"• <b>Delivery:</b> 2–4 Days Express via BlueDart / Delhivery (COD Active)\n\n"
        f"📦 <b>OFFICIAL PRODUCT DIRECTORY:</b>\n"
    )

    lines = []
    for idx, r in enumerate(rows, start=1):
        pid, slug, title, price, mrp, cat, sku = r
        clean_slug = slug or pid
        pdp_url = f"{SITE_URL}/product/{clean_slug}"
        pr = f"₹{float(price or 0):,.0f}"
        mrp_str = f"₹{float(mrp or 0):,.0f}" if mrp else ""
        escaped_title = html.escape(title.strip())
        
        lines.append(
            f"<b>{idx}. {escaped_title}</b>\n"
            f"   💰 <b>Price:</b> {pr} (M.R.P. <s>{mrp_str}</s>)\n"
            f"   🏷️ <b>SKU:</b> <code>{sku or pid}</code> | <b>Category:</b> {cat.title()}\n"
            f"   🛍️ <b>Direct Link:</b> <a href=\"{pdp_url}\">{pdp_url}</a>\n"
        )

    full_text = msg + "\n" + "\n".join(lines)
    send_msg(full_text)
    print("✅ Catalog successfully dispatched to Boss Ajay on Telegram!")

if __name__ == "__main__":
    dispatch_catalog()
