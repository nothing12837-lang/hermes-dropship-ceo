import os
import requests
import sys

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
chat_id = os.environ.get("TELEGRAM_ALLOWED_USERS", "5238068527").split(",")[0].strip()
if not token:
    raise ValueError("TELEGRAM_BOT_TOKEN must be configured in environment.")

text = (
    "👑 <b>Radha CEO & Autonomous Executive Board Active</b>\n\n"
    "Boss Ajay! Humne aapka <b>Brand Manifesto</b> adopt kar liya hai:\n\n"
    "<i>\"Products solve problems. Brands create connections.\"</i>\n\n"
    "🏢 <b>Executive Board Real-Work Directives:</b>\n"
    "• 💼 <b>Vikram (CCO):</b> 55-65% gross margins on curated problem-solving catalog.\n"
    "• 🔍 <b>Aarav (SEO):</b> High-converting search intent indexing on Google.\n"
    "• 🎬 <b>Meera (Creative):</b> High-aesthetic brand storytelling & Instagram reels.\n"
    "• 📦 <b>Arjun (Procurement):</b> Domestic 2-4 day express Surat/Meesho sourcing.\n"
    "• 🚚 <b>Pooja (Logistics):</b> Doorstep COD across India.\n"
    "• 💰 <b>Kabir (CFO):</b> Margin protection & Razorpay settlement.\n\n"
    "📸 <b>Instagram (@RareEmber):</b> Authenticated! Brand manifesto creative delivered.\n\n"
    "⚡ <b>24/7 Cloud Engine:</b> Cloud runners active with 1Gbps internet. Aapka laptop 100% OFF hone par bhi hum Telegram par 24/7 kaam karte rahenge!"
)

r = requests.post(
    f"https://api.telegram.org/bot{token}/sendMessage",
    json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
    timeout=15
)
print("Telegram briefing dispatch status:", r.status_code)
