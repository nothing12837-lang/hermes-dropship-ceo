import os
import sys
import requests

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

from tools.qikink_client import QikinkClient

client = QikinkClient()
token = client.get_token()
base_url = "https://api.qikink.com"
headers = {
    "ClientId": str(client.client_id),
    "Accesstoken": token,
    "Content-Type": "application/json"
}

endpoints = [
    "/api/product/list",
    "/api/product",
    "/api/my-products",
    "/api/my_products",
    "/api/order/track",
    "/api/order/status",
    "/api/inventory",
    "/api/catalog/list",
    "/api/order/details",
    "/api/webhook",
    "/api/serviceability",
]

for ep in endpoints:
    try:
        r = requests.get(f"{base_url}{ep}", headers=headers, timeout=5)
        print(f"GET {ep} -> {r.status_code}")
        if r.status_code != 404:
            print("  Response:", r.text[:200])
    except Exception as e:
        print(f"Error {ep}: {e}")
