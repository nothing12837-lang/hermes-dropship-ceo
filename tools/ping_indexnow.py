import requests
import json
import os
import sys

BASE_URL = "https://www.rareember.shop"
KEY = "rareember2026indexnowkey"
KEY_LOCATION = f"{BASE_URL}/rareember2026indexnowkey.txt"

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

from tools.populate_qikink_catalog import PRODUCTS

# Build all live URLs
urls = [
    f"{BASE_URL}/",
    f"{BASE_URL}/shop",
    f"{BASE_URL}/about",
    f"{BASE_URL}/team",
    f"{BASE_URL}/returns",
    f"{BASE_URL}/terms",
    f"{BASE_URL}/privacy",
    f"{BASE_URL}/contact",
    f"{BASE_URL}/track",
    f"{BASE_URL}/blog",
    f"{BASE_URL}/shop?cat=fashion",
    f"{BASE_URL}/shop?cat=home-garden",
    f"{BASE_URL}/shop?cat=electronics",
    f"{BASE_URL}/shop?cat=general"
]

for p in PRODUCTS:
    urls.append(f"{BASE_URL}/product/{p['id']}")

payload = {
    "host": "www.rareember.shop",
    "key": KEY,
    "keyLocation": KEY_LOCATION,
    "urlList": urls
}

print(f"Submitting {len(urls)} URLs to IndexNow...")

endpoints = [
    "https://api.indexnow.org/IndexNow",
    "https://www.bing.com/indexnow"
]

for ep in endpoints:
    try:
        r = requests.post(ep, json=payload, headers={"Content-Type": "application/json; charset=utf-8"}, timeout=10)
        print(f"POST {ep} -> Status: {r.status_code}")
        if r.status_code in (200, 202):
            print(f"  ✅ Successfully submitted {len(urls)} URLs to {ep}!")
        else:
            print(f"  Response: {r.text}")
    except Exception as e:
        print(f"  Error submitting to {ep}: {e}")
