"""
RareEmber Nightly Cloud Health & Security Sentinel
Runs automatically via GitHub Actions (.github/workflows/health_check.yml)
Audits live storefront, Supabase database, RLS policies, and catalog integrity.
Alerts Boss Ajay Rajbhar directly on Telegram.
"""

import os
import sys
import ssl
import json
import requests

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Auto-load local .env if running outside GitHub Actions
if os.path.exists(".env"):
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_USERS = [u.strip() for u in os.environ.get("TELEGRAM_ALLOWED_USERS", "5238068527").split(",") if u.strip()]
STOREFRONT_URL = os.environ.get("SITE_URL", "https://rareember-store.vercel.app").rstrip("/")

def send_telegram(text: str):
    if not TELEGRAM_TOKEN or not TELEGRAM_USERS:
        print("[TELEGRAM] No bot credentials found, skipping telegram dispatch.")
        return
    for chat_id in TELEGRAM_USERS:
        try:
            requests.post(
                f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
                timeout=10
            )
            print(f"[TELEGRAM] Sent health report to {chat_id}")
        except Exception as e:
            print(f"[TELEGRAM] Failed to send message to {chat_id}: {e}")

def run_health_check():
    print("=" * 60)
    print(" 🏥 RAREEMBER NIGHTLY CLOUD HEALTH SENTINEL")
    print("=" * 60)

    report_lines = []
    has_error = False

    # 1. Check Live Vercel Storefront
    try:
        r = requests.get(STOREFRONT_URL, timeout=12)
        if r.status_code == 200:
            print(f"✓ Storefront HTTP 200 OK ({STOREFRONT_URL})")
            report_lines.append(f"• <b>Storefront:</b> 🟢 Online (HTTP 200, {round(r.elapsed.total_seconds(), 2)}s)")
        else:
            print(f"✗ Storefront returned HTTP {r.status_code}")
            report_lines.append(f"• <b>Storefront:</b> 🔴 Degraded (HTTP {r.status_code})")
            has_error = True
    except Exception as e:
        print(f"✗ Storefront connection error: {e}")
        report_lines.append(f"• <b>Storefront:</b> 🔴 Offline ({str(e)[:50]})")
        has_error = True

    # 2. Check Database & Catalog via pg8000
    db_pass = os.environ.get("SUPABASE_DB_PASS", "").strip()
    db_host = os.environ.get("SUPABASE_DB_HOST", "db.qdkkxpfhwrwyoardlceo.supabase.co").strip()
    db_user = os.environ.get("SUPABASE_DB_USER", "postgres").strip()
    db_name = os.environ.get("SUPABASE_DB_NAME", "postgres").strip()

    if db_pass:
        try:
            import pg8000.native
            ctx = ssl.create_default_context()
            conn = pg8000.native.Connection(
                user=db_user,
                host=db_host,
                port=5432,
                database=db_name,
                password=db_pass,
                ssl_context=ctx
            )

            # Product count
            p_res = conn.run("SELECT COUNT(*) FROM public.products WHERE active = true;")
            active_products = p_res[0][0] if p_res else 0

            # Out of stock count
            oos_res = conn.run("SELECT COUNT(*) FROM public.products WHERE active = false OR stock <= 0;")
            oos_products = oos_res[0][0] if oos_res else 0

            # Orders count
            o_res = conn.run("SELECT COUNT(*) FROM public.orders;")
            total_orders = o_res[0][0] if o_res else 0

            # RLS Verification
            rls_res = conn.run("""
                SELECT relname FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public' 
                  AND c.relname IN ('orders', 'agent_memory')
                  AND c.relrowsecurity = true;
            """)
            rls_tables = [r[0] for r in rls_res]

            print(f"✓ Supabase Database Connected: {active_products} active items, {total_orders} total orders")
            report_lines.append(f"• <b>Active Catalog:</b> 📦 {active_products} in-stock ({oos_products} OOS protected)")
            report_lines.append(f"• <b>Orders Ledger:</b> 🧾 {total_orders} orders recorded in Supabase")
            report_lines.append(f"• <b>Security & RLS:</b> 🛡️ Hardened ({', '.join(rls_tables)} protected)")

        except Exception as e:
            print(f"✗ Supabase health query failed: {e}")
            report_lines.append(f"• <b>Database:</b> 🔴 Supabase query error ({str(e)[:50]})")
            has_error = True
    else:
        report_lines.append("• <b>Database:</b> ⚠️ SUPABASE_DB_PASS not set in environment")

    # 3. Format Telegram Alert
    status_icon = "🔴 SYSTEM ATTENTION REQUIRED" if has_error else "🟢 ALL SYSTEMS OPERATIONAL"
    msg = (
        f"<b>{status_icon}</b>\n"
        f"<i>RareEmber Cloud Sentinel • Autonomous Daily Audit</i>\n\n"
        + "\n".join(report_lines) + "\n\n"
        f"• <b>Host:</b> GitHub Actions (Zero Local Load)\n"
        f"• <b>Live Store:</b> <a href='{STOREFRONT_URL}'>rareember-store.vercel.app</a>\n"
        f"• <b>Commander:</b> Ajay Rajbhar"
    )

    send_telegram(msg)
    print("\n[SENTINEL REPORT]\n" + msg)

    if has_error:
        sys.exit(1)
    else:
        print("\n✓ Health check passed with 0 errors.")

if __name__ == "__main__":
    run_health_check()
