import requests
import json
import time

env = {}
with open('.env', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

client_id = env['QIKINK_CLIENT_ID']
client_secret = env['QIKINK_CLIENT_SECRET']
base_url = "https://api.qikink.com"

res = requests.post(
    f"{base_url}/api/token",
    data={"ClientId": client_id, "client_secret": client_secret},
    headers={"Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0"},
    timeout=10
)
token = res.json().get("Accesstoken")
headers = {
    "ClientId": str(client_id),
    "Accesstoken": token,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
}

prefixes = [
    'MRnHs', 'FRnHs', 'URnHs',
    'MVnHs', 'FVnHs',
    'MRnFs', 'FRnFs',
    'UHd', 'USs',
    'MClHs', 'MPHs',
    'MSl', 'FSl',
    'UJg', 'MJg',
    'FCt', 'FCtop'
]

discovered = []

for p in prefixes:
    for c in ['Bk', 'Wh', 'Clr']:
        sku = f"{p}-{c}-L"
        payload = {
            'order_number': 'D' + str(int(time.time()*1000))[-10:],
            'qikink_shipping': '1',
            'gateway': 'Prepaid',
            'total_order_value': '799',
            'line_items': [{
                'search_from_my_products': 0,
                'sku': sku,
                'quantity': '1',
                'price': '799',
                'print_type_id': 1,
                'designs': [{
                    'design_code': 'RE01',
                    'width_inches': '10',
                    'height_inches': '10',
                    'placement_sku': 'fr',
                    'design_link': 'https://rareember.shop/flame-icon.png',
                    'mockup_link': 'https://rareember.shop/flame-icon.png'
                }]
            }],
            'shipping_address': {
                'first_name': 'Test',
                'last_name': 'Discovery',
                'address1': '123 Test St',
                'phone': '9876543210',
                'email': 'rareemberagency@gmail.com',
                'city': 'Bengaluru',
                'zip': '560001',
                'province': 'Karnataka',
                'country_code': 'IN'
            }
        }
        r = requests.post(f"{base_url}/api/order/create", json=payload, headers=headers)
        if r.status_code == 200:
            print(f"MATCH: {sku}", flush=True)
            discovered.append(p)
            break
        time.sleep(0.1)

print("DISCOVERED VALID PREFIXES:", discovered, flush=True)
