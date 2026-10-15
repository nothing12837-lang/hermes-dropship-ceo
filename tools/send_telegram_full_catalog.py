import os
import sys
import time
import requests
import re
import html
import urllib.parse
from dotenv import load_dotenv

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

load_dotenv()
token = os.environ.get("TELEGRAM_BOT_TOKEN")
chat_id = "5238068527"

from radha_ceo.team import _get_con
from dropship_gateway import MEESHO_DIRECT_URLS

def base36_encode(number):
    alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    base36 = ''
    while number:
        number, i = divmod(number, 36)
        base36 = alphabet[i] + base36
    return base36 or '0'

def send_msg(text):
    res = requests.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        },
        timeout=15
    )
    data = res.json()
    ok = data.get("ok", False)
    if not ok:
        print(f"FAILED chunk (status {res.status_code}): {data.get('description')}")
    else:
        print(f"SUCCESS chunk (msg_id {data.get('result', {}).get('message_id')})")
    time.sleep(1.2)
    return ok

def main():
    con = _get_con()
    rows = con.run('SELECT id, slug, title, price_inr, compare_at_price, category, image_url FROM products WHERE active = true ORDER BY category, price_inr ASC')
    con.close()

    total = len(rows)
    print(f"Total active products to dispatch: {total}")

    # Intro message
    send_msg(
        f"📋 <b>RareEmber & Meesho 100% Complete Product Directory ({total} Items)</b>\n\n"
        f"Boss Ajay, aapke kehne par written format me sabhi <b>{total} live products</b> ke Storefront PDP link aur Meesho Reseller link niche batch-wise deliver kiye ja rahe hain:\n\n"
        f"• <b>Total Catalog:</b> {total} In-Stock Products\n"
        f"• <b>Storefront:</b> rareember-store.vercel.app\n"
        f"• <b>Delivery:</b> 2–4 Days Express via Delhivery/BlueDart with COD\n"
        f"<i>Dispatching 10 batches below...</i> 👇"
    )

    batch_size = 15
    for start_idx in range(0, total, batch_size):
        end_idx = min(start_idx + batch_size, total)
        batch = rows[start_idx:end_idx]

        lines = [
            f"📦 <b>[PRODUCTS {start_idx + 1} to {end_idx} OF {total}]</b>\n"
        ]

        for idx_in_batch, r in enumerate(batch, start=start_idx + 1):
            pid, slug, title, price, mrp, cat, img = r
            clean_slug = (slug or pid).replace('meesho-', '')
            our_url = f"https://rareember-store.vercel.app/product/{clean_slug}"

            if pid in MEESHO_DIRECT_URLS:
                meesho_url = MEESHO_DIRECT_URLS[pid]
            else:
                m = re.search(r'/products/(\d+)/', img or '')
                if m:
                    num = int(m.group(1))
                    meesho_url = f"https://www.meesho.com/s/p/{base36_encode(num)}"
                else:
                    meesho_url = f"https://www.meesho.com/search?q={urllib.parse.quote_plus(title[:30])}"

            escaped_title = html.escape(title.strip())
            pr = f"₹{float(price or 0):,.0f}"

            lines.append(
                f"<b>{idx_in_batch}. {escaped_title}</b> ({pr})\n"
                f"  🛍️ <a href=\"{our_url}\">Storefront PDP</a> | 🏭 <a href=\"{meesho_url}\">Meesho Link</a>"
            )

        chunk_text = "\n\n".join(lines)
        send_msg(chunk_text)

    # Closing message
    send_msg(
        f"✅ <b>All {total} Products Delivered Successfully!</b>\n\n"
        f"Har product ke sath uski direct Storefront link aur Meesho sourcing link attach hai. Koi bhi customer order aaye toh direct Meesho link tap karke 30 seconds me COD book kar sakte hain."
    )
    print("Catalog text dispatch complete.")

if __name__ == '__main__':
    main()
