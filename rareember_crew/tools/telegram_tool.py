"""
Telegram Broadcaster Tool for RareEmber CrewAI
Sends executive digests, order updates, and daily targets directly to Boss Ajay (@rereemberbot).
"""

import requests
from typing import Optional
from rareember_crew.config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

def send_telegram_message(text: str, parse_mode: str = "HTML") -> bool:
    """Dispatches a message to Boss Ajay on Telegram."""
    if not TELEGRAM_BOT_TOKEN:
        print("[TELEGRAM SKIPPED] No bot token configured.")
        return False
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        r = requests.post(
            url,
            json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": text,
                "parse_mode": parse_mode,
                "disable_web_page_preview": True,
            },
            timeout=10,
        )
        return r.status_code == 200
    except Exception as e:
        print(f"⚠️ [TELEGRAM DISPATCH ERROR]: {e}")
        return False

class TelegramBroadcasterTool:
    """CrewAI tool representation for notifying the founder."""

    @staticmethod
    def send_cycle_briefing(cycle_number: int, team_summary: str, metrics: dict) -> bool:
        message = (
            f"👑 <b>[RAREMBER CREWAI BOARD] Cycle #{cycle_number} Complete</b>\n\n"
            f"Boss Ajay, your autonomous CrewAI executive board has executed a full business cycle:\n\n"
            f"{team_summary}\n\n"
            f"📊 <b>Live Metrics:</b>\n"
            f"• Catalog Health: <b>{metrics.get('catalog_health', '100% Active')}</b>\n"
            f"• Net Margin Floor: <b>{metrics.get('margin_floor', '≥35%')}</b>\n"
            f"• 24h Orders: <b>{metrics.get('orders_24h', 0)}</b>\n"
            f"• SEO Live Index: <b>{metrics.get('blog_count', 'Active')} articles</b>\n\n"
            f"⚡ <i>Operating 100% autonomously. Store: rareember.shop</i>"
        )
        return send_telegram_message(message)
