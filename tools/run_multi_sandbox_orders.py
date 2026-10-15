import requests
import json
import random
import time

client_id = "964148691892386"
client_secret = "fe0d6ac80daf56ce8e0f5e969dc4c55d2fb6fd80ac20a4228419fe1e7612e2a8"
base_url = "https://sandbox.qikink.com"

# 1. Get Token
res = requests.post(
    f"{base_url}/api/token",
    data={"ClientId": client_id, "client_secret": client_secret},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    timeout=10
)
token_data = res.json()
access_token = token_data.get("Accesstoken")

headers = {
    "ClientId": str(client_id),
    "Accesstoken": access_token,
    "Content-Type": "application/json"
}

# Create Order 2 (Prepaid) and Order 3 (COD)
tests = [
    {"gateway": "Prepaid", "val": "1199", "sku": "USs-Wh-L", "prefix": "RAREPRE", "dsg": "RareDsg02"},
    {"gateway": "COD", "val": "899", "sku": "USs-Wh-XL", "prefix": "RARECOD", "dsg": "RareDsg03"}
]

for t in tests:
    rand_num = random.randint(100, 999)
    order_num = f"{t['prefix']}{int(time.time()) % 100000}{rand_num}"[:15]
    payload = {
        "order_number": order_num,
        "qikink_shipping": "1",
        "gateway": t["gateway"],
        "total_order_value": t["val"],
        "line_items": [
            {
                "search_from_my_products": 0,
                "sku": t["sku"],
                "quantity": "1",
                "price": t["val"],
                "print_type_id": 1,
                "designs": [
                    {
                        "design_code": t["dsg"],
                        "width_inches": "10",
                        "height_inches": "10",
                        "placement_sku": "fr",
                        "design_link": "https://rareember-store.vercel.app/flame-icon.png",
                        "mockup_link": "https://rareember-store.vercel.app/flame-icon.png"
                    }
                ]
            }
        ],
        "shipping_address": {
            "first_name": "Ajay",
            "last_name": "Rajbhar",
            "address1": "Plot 42 Sector 18 Huda Market",
            "address2": "",
            "phone": "9876543210",
            "email": "ajay@rareember.com",
            "city": "Gurugram",
            "zip": "122001",
            "province": "Haryana",
            "country_code": "IN"
        }
    }
    r = requests.post(f"{base_url}/api/order/create", json=payload, headers=headers, timeout=15)
    print(f"[{t['gateway']}] Order {order_num} -> Status: {r.status_code}")
    print("Response:", r.text)
    time.sleep(1)

print("\n--- ALL SANDBOX TEST ORDERS COMPLETED! ---")
