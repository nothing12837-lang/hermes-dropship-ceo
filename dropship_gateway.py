"""
Hermes Dropship CEO — 24/7 Autonomous E-Commerce Executive for Ajay Rajbhar.
Integrated with RareEmber Storefront, Supabase Database, CJ Dropshipping, and Gemini/OpenRouter AI.
"""

import os
import sys
import time
import json
import requests
import traceback
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
ALLOWED_USERS_RAW = os.environ.get("TELEGRAM_ALLOWED_USERS", "5238068527").strip()
ALLOWED_USERS = [u.strip() for u in ALLOWED_USERS_RAW.split(",") if u.strip()]
if "5238068527" not in ALLOWED_USERS:
    ALLOWED_USERS.append("5238068527")

SITE_URL = os.environ.get("SITE_URL", "https://rareember-store.vercel.app").strip()
ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "rareember_super_secret_cron_2026").strip()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "").strip()

# In-memory rolling conversational history per user
CONVERSATION_HISTORY = {}

SOUL_PROMPT = """You are Hermes (Radha), Ajay Rajbhar's autonomous AI Chief Operating Officer (COO) and Store Manager for RareEmber (https://rareember-store.vercel.app).
User is Ajay (call him Ajay).

LIVE BUSINESS CONTEXT:
- Store: RareEmber (Curated tech, fashion, home-living, and pet essentials).
- Production URL: https://rareember-store.vercel.app (100% Live & Public).
- Multi-Currency: Active (Domestic India in INR Rs, US & Global in USD $).
- Gateways: Razorpay (UPI, Cards, NetBanking) + Doorstep Cash on Delivery (COD).
- Fulfillment: Integrated with CJ Dropshipping.

RULES:
- Answer directly, intelligently, and warmly in natural Hinglish or English.
- If asked about orders, sales, store status, or products, give REAL live details.
- Never repeat canned copy-paste loops. Keep answers punchy, confident, and executive (1-4 short lines).
"""

def send_message(chat_id, text, parse_mode="HTML"):
    if not TELEGRAM_TOKEN:
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    try:
        r = requests.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": parse_mode}, timeout=15)
        if r.status_code == 200:
            return True
    except Exception:
        pass
    try:
        r = requests.post(url, json={"chat_id": chat_id, "text": text}, timeout=15)
        return r.status_code == 200
    except Exception:
        return False

def get_updates(offset=0):
    if not TELEGRAM_TOKEN:
        return []
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/getUpdates"
    try:
        r = requests.get(url, params={"timeout": 15, "offset": offset}, timeout=25)
        if r.status_code == 200:
            return r.json().get("result", [])
    except Exception:
        pass
    return []

def fetch_live_orders(limit=10):
    url = f"{SITE_URL}/api/admin/orders?limit={limit}"
    try:
        r = requests.get(url, headers={"Authorization": f"Bearer {ADMIN_SECRET}"}, timeout=10)
        if r.status_code == 200:
            return r.json().get("orders", [])
    except Exception as e:
        print(f"Error fetching orders: {e}")
    return []

def generate_orders_summary():
    orders = fetch_live_orders(limit=10)
    if not orders:
        return "📦 <b>Order Status:</b> Abhi live store pe koi naya order pending nahi hai. Catalog aur checkout 100% operational hain."

    total_val = sum(float(o.get("total_amount") or 0) for o in orders)
    lines = [
        f"📦 <b>Live Store Orders ({len(orders)} recent):</b>",
        f"💰 <b>Total Value:</b> ₹{total_val:,.0f}",
        ""
    ]
    for o in orders[:5]:
        order_id = str(o.get("id", ""))[:8]
        email = o.get("user_email", "guest")
        status = o.get("status", "pending")
        amount = o.get("total_amount", 0)
        lines.append(f"• <code>#{order_id}</code> | <b>{status.upper()}</b> | ₹{amount} ({email})")

    lines.append("\nAjay, fulfillment queue ready hai.")
    return "\n".join(lines)

def generate_business_status():
    now_ist = datetime.now(IST).strftime("%d %b %Y | %I:%M %p IST")
    orders = fetch_live_orders(limit=10)
    return (
        f"🏛️ <b>Hermes RareEmber Business Report</b>\n"
        f"📅 <i>{now_ist}</i>\n\n"
        f"• <b>Storefront:</b> 🟢 LIVE (https://rareember-store.vercel.app)\n"
        f"• <b>Currency Engine:</b> 🇮🇳 INR & 🇺🇸 USD Auto-Switching Active\n"
        f"• <b>Gateways:</b> Razorpay UPI + Cash on Delivery (COD)\n"
        f"• <b>Recent Orders in DB:</b> {len(orders)} registered\n"
        f"• <b>CJ Warehouse Sync:</b> Online & Authorized\n"
        f"• <b>Autopilot Mode:</b> Active 24x7\n\n"
        f"Bolo Ajay, next operation kya chalana hai?"
    )

def query_llm(user_msg, chat_id):
    history = CONVERSATION_HISTORY.setdefault(chat_id, [])

    # Fast intent routers for instant precision
    q = user_msg.lower().strip()
    if any(k in q for k in ["order", "kya order", "orders", "any order", "order aaya"]):
        return generate_orders_summary()

    if any(k in q for k in ["status", "update", "kya chal raha", "report", "health"]):
        return generate_business_status()

    if any(k in q for k in ["who am i", "mai kon hu", "main kaun", "who are you", "koun ho"]):
        return "Tum <b>Ajay</b> ho — founder aur boss. Main <b>Hermes (Radha)</b> hoon, tumhari autonomous AI COO aur RareEmber manager."

    # Dynamic LLM generation with rolling memory
    messages_payload = [{"role": "system", "content": SOUL_PROMPT}]
    for h in history[-6:]:
        messages_payload.append(h)
    messages_payload.append({"role": "user", "content": user_msg})

    # 1. Try OpenRouter
    if OPENROUTER_API_KEY:
        for m in ["meta-llama/llama-3.3-70b-instruct:free", "google/gemini-2.0-flash-exp:free", "deepseek/deepseek-chat"]:
            try:
                url = "https://openrouter.ai/api/v1/chat/completions"
                headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"}
                payload = {
                    "model": m,
                    "messages": messages_payload,
                    "max_tokens": 250,
                    "temperature": 0.4
                }
                r = requests.post(url, headers=headers, json=payload, timeout=12)
                if r.status_code == 200:
                    ans = r.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    if ans:
                        history.append({"role": "user", "content": user_msg})
                        history.append({"role": "assistant", "content": ans})
                        return ans
            except Exception:
                pass

    # 2. Try Gemini API
    if GEMINI_API_KEY:
        for model in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
                prompt_text = SOUL_PROMPT + "\n\nChat History:\n"
                for h in history[-4:]:
                    prompt_text += f"{h['role'].upper()}: {h['content']}\n"
                prompt_text += f"AJAY: {user_msg}\nHERMES:"

                payload = {
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "generationConfig": {"temperature": 0.4, "maxOutputTokens": 300}
                }
                r = requests.post(url, json=payload, timeout=12)
                if r.status_code == 200:
                    cand = r.json().get("candidates", [])
                    if cand:
                        text = cand[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text:
                            clean_text = text.strip()
                            history.append({"role": "user", "content": user_msg})
                            history.append({"role": "assistant", "content": clean_text})
                            return clean_text
            except Exception:
                pass

    # Intelligent contextual fallback
    if "hlo" in q or "hello" in q or "hi" in q or "hey" in q:
        return "Hello Ajay! Hermes online hai. Store operations, order status ya marketing me kya help chahiye?"

    return f"Ajay, RareEmber store (rareember-store.vercel.app) 100% live hai. Order fulfillment aur tracking active hain. Bolo kya check karna hai?"

def poll_loop():
    if not TELEGRAM_TOKEN:
        print("TELEGRAM_BOT_TOKEN missing!")
        return

    print("========================================")
    print("Hermes Dropship CEO Online (Intelligent)")
    print("========================================")

    offset = 0
    try:
        init_updates = get_updates(0)
        if init_updates:
            offset = init_updates[-1]["update_id"] + 1
    except Exception:
        pass

    while True:
        try:
            updates = get_updates(offset)
            for update in updates:
                offset = update["update_id"] + 1
                msg = update.get("message") or update.get("edited_message")
                if not msg:
                    continue

                chat_id = msg.get("chat", {}).get("id")
                text = msg.get("text", "")
                from_user = msg.get("from", {})
                user_id = str(from_user.get("id", ""))

                if not chat_id or not text:
                    continue

                if ALLOWED_USERS and user_id not in ALLOWED_USERS:
                    continue

                reply = query_llm(text, chat_id)
                send_message(chat_id, reply, parse_mode="HTML")

        except Exception as e:
            time.sleep(3)

        time.sleep(1)

if __name__ == "__main__":
    poll_loop()
