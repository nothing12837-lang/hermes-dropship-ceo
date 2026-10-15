"""
RareEmber CrewAI Configuration & Environment Loader
Securely consolidates all credentials from root .env and storefront/.env.local.
"""

import os
from pathlib import Path
from typing import Dict, Any

WORKSPACE_PATH = Path(__file__).resolve().parent.parent

def load_environment() -> Dict[str, str]:
    env = {}
    paths = [
        WORKSPACE_PATH / "storefront" / ".env.local",
        WORKSPACE_PATH / ".env",
        WORKSPACE_PATH / ".env.production",
    ]
    for p in paths:
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        if line.startswith("export "):
                            line = line[len("export "):].lstrip()
                        k, v = line.split("=", 1)
                        clean_k = k.strip()
                        clean_v = v.strip().strip('"').strip("'")
                        if clean_k not in env:
                            env[clean_k] = clean_v
                            if clean_k not in os.environ:
                                os.environ[clean_k] = clean_v
    return env

ENV = load_environment()

# Storefront URLs
SITE_URL = os.environ.get("SITE_URL") or ENV.get("SITE_URL") or "https://rareember.shop"
DOTS_GATEWAY_URL = os.environ.get("DOTS_GATEWAY_URL") or "http://127.0.0.1:8000"

# Telegram Bot
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or ENV.get("TELEGRAM_BOT_TOKEN", "8898923626:AAHjI91mNfyRCanPdK9MVDiTBpL4zPzPOkI")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID") or ENV.get("TELEGRAM_ALLOWED_USERS", "5238068527")

# LLM Providers (OpenRouter / Gemini / OpenAI)
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY") or ENV.get("OPENROUTER_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or ENV.get("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY") or ENV.get("OPENAI_API_KEY", "")

# Default CrewAI LLM Model Name
# Using openrouter/google/gemini-2.5-flash or openrouter/meta-llama/llama-3.3-70b-instruct
if OPENROUTER_API_KEY:
    os.environ["OPENROUTER_API_KEY"] = OPENROUTER_API_KEY
    CREW_LLM_MODEL = os.environ.get("CREW_LLM_MODEL", "openrouter/google/gemini-2.5-flash")
elif GEMINI_API_KEY:
    os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
    CREW_LLM_MODEL = "gemini/gemini-1.5-flash"
else:
    CREW_LLM_MODEL = "openai/gpt-4o-mini"

# Supabase Credentials
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or ENV.get("NEXT_PUBLIC_SUPABASE_URL", "https://qdkkxpfhwrwyoardlceo.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or ENV.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
SUPABASE_DB_HOST = os.environ.get("SUPABASE_DB_HOST") or ENV.get("SUPABASE_DB_HOST", "db.qdkkxpfhwrwyoardlceo.supabase.co")
SUPABASE_DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", 5432))
SUPABASE_DB_USER = os.environ.get("SUPABASE_DB_USER") or ENV.get("SUPABASE_DB_USER", "postgres")
SUPABASE_DB_PASS = os.environ.get("SUPABASE_DB_PASS") or ENV.get("SUPABASE_DB_PASS", "RareEmber2026SecureDb123!")
SUPABASE_DB_NAME = os.environ.get("SUPABASE_DB_NAME") or ENV.get("SUPABASE_DB_NAME", "postgres")

# Logistics & Sourcing Constants
EXPRESS_SHIPPING_INR = 75.0
WHATSAPP_COD_BUFFER_INR = 15.0
TOTAL_LOGISTICS_OVERHEAD_INR = 90.0
MIN_ACCEPTABLE_MARGIN_PCT = 35.0
TARGET_GROSS_MARGIN_PCT = 55.0
