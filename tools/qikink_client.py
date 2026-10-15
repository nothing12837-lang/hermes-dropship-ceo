"""
QIKINK PRINT-ON-DEMAND & DROPSHIPPNG OFFICIAL CLIENT
Handles automated authentication, token caching, order creation (Prepaid/COD),
and delivery tracking for RareEmber.
"""

import os
import sys
import time
import json
import requests
from typing import Dict, Any, Optional

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

def load_env() -> Dict[str, str]:
    env = {}
    for p in [os.path.join(WORKSPACE_PATH, ".env"), os.path.join(WORKSPACE_PATH, "storefront", ".env.local")]:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() not in env:
                            env[k.strip()] = v.strip().strip('"').strip("'")
    return env

ENV = load_env()

class QikinkClient:
    def __init__(self, client_id: Optional[str] = None, client_secret: Optional[str] = None, sandbox: Optional[bool] = None):
        self.client_id = client_id or ENV.get("QIKINK_CLIENT_ID", "964148691892386")
        self.client_secret = client_secret or ENV.get("QIKINK_CLIENT_SECRET", "fe0d6ac80daf56ce8e0f5e969dc4c55d2fb6fd80ac20a4228419fe1e7612e2a8")
        is_sandbox_str = ENV.get("QIKINK_SANDBOX", "true").lower()
        self.sandbox = sandbox if sandbox is not None else (is_sandbox_str in ["true", "1", "yes"])
        self.base_url = "https://sandbox.qikink.com" if self.sandbox else "https://api.qikink.com"
        self._token: Optional[str] = None
        self._token_expires_at: float = 0.0

    def get_token(self) -> str:
        now = time.time()
        if self._token and now < (self._token_expires_at - 120):
            return self._token

        url = f"{self.base_url}/api/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {"ClientId": self.client_id, "client_secret": self.client_secret}
        
        res = requests.post(url, data=payload, headers=headers, timeout=12)
        if res.status_code != 200:
            raise Exception(f"Failed to authenticate with Qikink ({res.status_code}): {res.text}")

        data = res.json()
        self._token = data.get("Accesstoken")
        expires_in = int(data.get("expires_in", 3600))
        self._token_expires_at = now + expires_in
        return self._token

    def _headers(self) -> Dict[str, str]:
        token = self.get_token()
        return {
            "ClientId": str(self.client_id),
            "Accesstoken": token,
            "Content-Type": "application/json"
        }

    def create_order(
        self,
        order_number: str,
        gateway: str, # "Prepaid" or "COD"
        total_order_value: float,
        line_items: list,
        shipping_address: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Creates a new dropshipping order on Qikink.
        """
        clean_order_num = "".join(c for c in order_number if c.isalnum())[:15]
        
        # Format line items according to environment
        clean_items = []
        for it in line_items:
            clean_item = {
                "search_from_my_products": 0 if self.sandbox else 1,
                "sku": it.get("sku"),
                "quantity": str(it.get("quantity", 1)),
                "price": str(round(float(it.get("price", total_order_value))))
            }
            if self.sandbox or not clean_item["search_from_my_products"]:
                clean_item["print_type_id"] = it.get("print_type_id", 1)
                clean_item["designs"] = it.get("designs", [
                    {
                        "design_code": (it.get("sku", "DSG")[:15]).replace("-", ""),
                        "width_inches": "10",
                        "height_inches": "10",
                        "placement_sku": "fr",
                        "design_link": it.get("design_link", "https://rareember-store.vercel.app/flame-icon.png"),
                        "mockup_link": it.get("mockup_link", "https://rareember-store.vercel.app/flame-icon.png")
                    }
                ])
            clean_items.append(clean_item)

        payload = {
            "order_number": clean_order_num,
            "qikink_shipping": "1",
            "gateway": "COD" if gateway.upper() == "COD" else "Prepaid",
            "total_order_value": str(round(float(total_order_value))),
            "line_items": clean_items,
            "shipping_address": {
                "first_name": shipping_address.get("first_name", "Customer"),
                "last_name": shipping_address.get("last_name", ""),
                "address1": shipping_address.get("address1", ""),
                "address2": shipping_address.get("address2", ""),
                "phone": shipping_address.get("phone", ""),
                "email": shipping_address.get("email", ""),
                "city": shipping_address.get("city", ""),
                "zip": str(shipping_address.get("zip", shipping_address.get("pincode", ""))),
                "province": shipping_address.get("province", shipping_address.get("state", "")),
                "country_code": shipping_address.get("country_code", "IN")
            }
        }

        url = f"{self.base_url}/api/order/create"
        res = requests.post(url, json=payload, headers=self._headers(), timeout=15)
        return res.json()

if __name__ == "__main__":
    client = QikinkClient()
    token = client.get_token()
    print("QikinkClient Token Test Passed! Token snippet:", token[:30] + "...")
