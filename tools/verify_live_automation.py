import requests
import json
import time

url = "https://www.rareember.shop/api/orders"

order_payload = {
    "name": "Ajay Test Customer",
    "email": "rareemberagency@gmail.com",
    "phone": "9876543210",
    "payment_method": "cod",
    "items": [
        {
            "id": "qikink-t-shirts-tie-and-dye-oversized-t-shirt-ut58",
            "qty": 1,
            "size": "L",
            "selectedStyle": "Design #1",
            "imageUrl": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/b842ae90-50b3-4fe8-b5b1-d57cf84fcce9.jpg"
        }
    ],
    "address": {
        "line1": "Flat 402, High Street Towers",
        "city": "Bengaluru",
        "state": "Karnataka",
        "zip": "560001",
        "phone": "9876543210"
    }
}

headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

print("Submitting live test order to https://www.rareember.shop/api/orders ...")
r = requests.post(url, json=order_payload, headers=headers, timeout=20)
print(f"Status: {r.status_code}")
print(f"Response: {r.text}")
