import os
import requests

env = {}
for path in [".env", "storefront/.env.local"]:
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")

token = env.get("TELEGRAM_BOT_TOKEN", "")
print("Token prefix:", token[:12] if token else "None")

if token:
    try:
        r = requests.get(f"https://api.telegram.org/bot{token}/getMe", timeout=10)
        print("getMe response:", r.json())
        w = requests.get(f"https://api.telegram.org/bot{token}/getWebhookInfo", timeout=10)
        print("getWebhookInfo response:", w.json())
    except Exception as e:
        print("Error checking bot:", e)
else:
    print("TELEGRAM_BOT_TOKEN not found in .env or storefront/.env.local")
