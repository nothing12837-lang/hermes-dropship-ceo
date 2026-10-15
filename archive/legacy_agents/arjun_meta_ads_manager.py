"""
ARJUN — VP OF META ADS & PAID ACQUISITION (AUTONOMOUS GROWTH ENGINE)
Reports directly to Boss Ajay & Radha CEO.

Mandate:
1. Maximize ROAS (Target: 3.5x - 5.0x) while keeping CAC under ₹180 per order.
2. Generate high-converting Ad Angles, First-3-Seconds Video Hooks, UGC Scripts, and Carousel Copy.
3. Architect the 3-Tier Meta Funnel:
   - TOF (Cold Traffic): High-energy visual hooks for 240 GSM Heavyweight Tees & Custom Studio.
   - MOF (Warm Engagement): Social proof, unboxing, 7-Day Doorstep Replacement Guarantee.
   - BOF (Retargeting): Abandoned checkout recovery with code RARE100 (₹100 OFF).
4. Send automated executive ad briefs to Boss Ajay via Telegram (@rereemberbot).
"""

import os
import sys
import json
import time
import requests
from datetime import datetime, timezone
from typing import Dict, Any, List

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_PATH = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(WORKSPACE_PATH, "RADHA_MEMORY")
os.makedirs(OUTPUT_DIR, exist_ok=True)
ADS_LOG_FILE = os.path.join(OUTPUT_DIR, "ARJUN_META_ADS_BRIEF.json")

# Load environment
env_path = os.path.join(WORKSPACE_PATH, ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                if k.strip() not in os.environ:
                    os.environ[k.strip()] = v.strip()

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "5238068527")

# High-Converting Ad Creative Templates for Rare Ember
AD_CREATIVE_MATRIX = [
    {
        "id": "AD-01-FABRIC-REVEAL",
        "funnel_stage": "TOF (Top of Funnel - Cold Traffic)",
        "campaign_name": "RE_TOF_AESTHETIC_STREETWEAR_240GSM",
        "target_audience": {
            "age": "18 - 28",
            "gender": "All (Unisex)",
            "locations": "Tier 1 & 2 Metro Cities (Mumbai, Delhi NCR, Bangalore, Pune, Hyderabad, Kolkata)",
            "interests": [
                "Streetwear",
                "Oversized clothing",
                "Hypebeast fashion",
                "Sneaker collecting",
                "Anime culture"
            ]
        },
        "hook_first_3s": "Stop buying flimsy 140 GSM t-shirts that shrink after two washes.",
        "visual_concept": "Split screen comparison: Thin mall t-shirt curling at collar vs Rare Ember 240 GSM heavyweight combed cotton falling with structured boxy drop-shoulders.",
        "primary_text": (
            "Most fast-fashion brands charge ₹1,499 for cheap polyester blends. "
            "Rare Ember is engineered with 240 GSM bio-washed French terry & combed cotton.\n\n"
            "🔥 Heavyweight structured drape\n"
            "🔥 Zero color fade (DTF high-density prints)\n"
            "🔥 Pre-shrunk & breathable for Indian summers\n"
            "🛡️ Protected by 7-Day Free Doorstep Replacement\n\n"
            "Order today for 1-Click Cash on Delivery."
        ),
        "headline": "240 GSM Heavyweight Streetwear • Starting ₹799",
        "cta": "Shop Now",
        "destination_url": "https://rareember.shop/shop?cat=fashion",
        "budget_recommended_daily_inr": 500,
        "target_cpc_inr": 4.50,
        "target_roas": "4.2x"
    },
    {
        "id": "AD-02-CUSTOM-STUDIO",
        "funnel_stage": "TOF / MOF (Customization Hook)",
        "campaign_name": "RE_CUSTOM_STREETWEAR_INITIALS_DROP",
        "target_audience": {
            "age": "18 - 26",
            "gender": "All",
            "locations": "Pan-India",
            "interests": ["Personalized gifts", "Custom sneakers", "Graphic design", "Minimalist aesthetics"]
        },
        "hook_first_3s": "You can now customize your own heavyweight streetwear drop in 30 seconds.",
        "visual_concept": "Screen recording of typing name/initials on Rare Ember Customization Studio, live mockup preview updating in real-time, followed by unboxing parcel.",
        "primary_text": (
            "Wear something that actually belongs to you.\n\n"
            "With Rare Ember's Custom Studio, personalize heavy drop-shoulder tees with your name, initials, or signature tagline.\n\n"
            "✨ Bio-washed 240 GSM pure combed cotton\n"
            "✨ Crisp archival DTF printing (lasts 50+ washes)\n"
            "✨ Custom branded neck tag & collector packaging\n"
            "✨ Fast 3-day doorstep dispatch via BlueDart\n\n"
            "Create your custom one-of-one piece now."
        ),
        "headline": "Personalize Your Streetwear • Custom Name Drop",
        "cta": "Customize Now",
        "destination_url": "https://rareember.shop/product/rareember-custom-heavyweight-oversized-tee",
        "budget_recommended_daily_inr": 700,
        "target_cpc_inr": 6.00,
        "target_roas": "3.8x"
    },
    {
        "id": "AD-03-RETARGETING-ABANDONED-CART",
        "funnel_stage": "BOF (Bottom of Funnel - Abandoned Cart)",
        "campaign_name": "RE_BOF_RETARGETING_CART_RECOVERY",
        "target_audience": {
            "custom_audiences": ["Website Visitors Last 14 Days", "Add To Cart Not Purchased (14 Days)"],
            "exclusions": ["Purchasers Last 30 Days"]
        },
        "hook_first_3s": "Did you forget something in your Rare Ember cart?",
        "visual_concept": "Close-up fabric texture macro shot + 5-star customer review overlay + ₹100 discount coupon code pulse animation.",
        "primary_text": (
            "We saved your streetwear pieces, but stock is limited in each batch.\n\n"
            "Use code: RARE100 at checkout for an instant flat ₹100 OFF your order.\n\n"
            "✅ 100% Free 7-Day Doorstep Replacement\n"
            "✅ Cash on Delivery (COD) Available\n"
            "✅ Express Delivery via BlueDart Air\n\n"
            "Claim your drop before it sells out."
        ),
        "headline": "Use Code: RARE100 for Extra ₹100 OFF ⚡",
        "cta": "Complete Order",
        "destination_url": "https://rareember.shop/cart",
        "budget_recommended_daily_inr": 300,
        "target_cpc_inr": 3.00,
        "target_roas": "6.5x"
    }
]

def generate_daily_ad_brief():
    """Generates structured Meta Ads execution brief."""
    timestamp = datetime.now(timezone.utc).isoformat()
    brief = {
        "generated_at": timestamp,
        "vp_agent": "Arjun — VP of Meta Ads & Paid Acquisition",
        "brand": "Rare Ember",
        "official_domain": "https://rareember.shop",
        "growth_target": "Scaling to ₹1 Crore in 12 Months",
        "daily_test_budget_inr": 1500,
        "campaigns": AD_CREATIVE_MATRIX,
        "actionable_rules": [
            "Rule 1: Kill any ad creative if Cost Per Link Click (CPC) > ₹12 after 500 impressions.",
            "Rule 2: Scale daily budget by 20% every 48 hours for ad sets maintaining ROAS > 3.5x.",
            "Rule 3: Rotate video hooks every 7 days to prevent creative ad fatigue.",
            "Rule 4: Always keep COD verification active to maintain delivery rate > 88%."
        ]
    }
    
    with open(ADS_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(brief, f, indent=2)
        
    return brief

def notify_telegram(brief: Dict[str, Any]):
    """Sends executive briefing to Boss Ajay on Telegram."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
        
    msg = (
        "📈 *ARJUN VP OF META ADS — DAILY STRATEGY BRIEFING*\n\n"
        "🎯 *Objective:* High-ROAS (3.5x - 5.0x) Meta Acquisition Engine\n"
        "⚡ *Daily Pilot Budget:* ₹1,500/day across 3 targeted funnels\n\n"
        "🔥 *Active Ad Sets Prepared:*\n"
        "1. *TOF (Cold):* 240 GSM Heavyweight Tee vs Thin Fast-Fashion (Target CPC: < ₹5)\n"
        "2. *Custom Studio:* Personalized Initials Streetwear Drop (High AOV)\n"
        "3. *BOF (Retargeting):* Abandoned Cart Recovery (Coupon `RARE100` • Target ROAS: > 6.0x)\n\n"
        "🛡️ *Trust Weapon:* Highlighted 7-Day Free Doorstep Replacement & COD\n"
        "📁 *Brief File:* `RADHA_MEMORY/ARJUN_META_ADS_BRIEF.json`\n\n"
        "Ready to launch on Meta Ads Manager whenever Boss Ajay approves budget!"
    )
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": msg,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True
    }
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        print(f"Telegram notification error: {e}")

if __name__ == "__main__":
    print(">>> [ARJUN] Compiling Meta Ads Strategy & Creative Matrix...")
    brief = generate_daily_ad_brief()
    notify_telegram(brief)
    print(">>> [ARJUN] Meta Ads Brief saved and Telegram briefing dispatched.")
