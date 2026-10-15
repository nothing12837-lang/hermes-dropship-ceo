import requests
import json
import os
import sys

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

from tools.qikink_client import QikinkClient

client = QikinkClient()
token = client.get_token()
print("Live Token acquired successfully!")

base_url = "https://api.qikink.com"
headers = {
    "ClientId": str(client.client_id),
    "Accesstoken": token,
    "Content-Type": "application/json"
}

candidate_endpoints = [
    "/api/products",
    "/api/products/list",
    "/api/myproducts",
    "/api/catalog",
    "/api/catalog/products",
    "/api/categories",
    "/api/order/list",
    "/api/wallet",
    "/api/user/profile",
    "/api/pincode/check?pincode=560001",
    "/api/skus"
]

print("--- Probing Qikink Live Endpoints ---")
for ep in candidate_endpoints:
    try:
        url = f"{base_url}{ep}"
        r = requests.get(url, headers=headers, timeout=8)
        print(f"GET {ep} -> Status: {r.status_code}")
        if r.status_code != 404:
            print("Response:", r.text[:300])
    except Exception as e:
        print(f"Error {ep}: {e}")
