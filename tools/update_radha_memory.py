import json

path = r"c:\Users\ajay kumar\Downloads\harmess agemnt\RADHA_MEMORY\radha_ceo_memory.json"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

data["procedural"]["current_guidance"]["content"]["directive"] = (
    "Scale RareEmber as an authentic high-margin D2C Streetwear & Creator Lifestyle Brand powered 100% by Qikink Print-on-Demand & Dropshipping"
)
data["procedural"]["current_guidance"]["content"]["issued_at"] = "2026-10-15T07:55:00+00:00"
data["procedural"]["current_guidance"]["content"]["departmental_goals"] = {
    "Vikram": "Curate and optimize RareEmber's flagship 10-piece Qikink collection (Heavyweight Oversized Tees @ ₹899, 380 GSM Hoodies @ ₹1,699, Ceramic Mugs @ ₹499) with 60%-70% gross margins.",
    "Aarav": "Publish high-converting Indian streetwear style guides and desk setup inspiration to Supabase blog_posts targeting high-intent long-tail keywords.",
    "Pooja": "Maintain <10% COD RTO rate via pre-dispatch 1-click WhatsApp verification, and manage Qikink's 100-day RTO warehouse cushion for zero inventory loss.",
    "Meera": "Create high-converting 1080x1350 4:5 aesthetic streetwear feed drops featuring Eva modeling the drops with authentic lifestyle cues.",
    "Kabir": "Enforce strict 55% net profit margin floor, ensuring average net profit of ₹500-₹1,000 per order with guaranteed positive unit economics.",
    "Arjun": "24/7 Qikink API Dispatch Sentinel: manage automated order creation (Prepaid/COD) via Qikink Open API, monitor dispatch within 48-72h, and push real-time BlueDart/Delhivery tracking to customers."
}
data["procedural"]["current_guidance"]["updated_at"] = "2026-10-15T07:55:00+00:00"

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated radha_ceo_memory.json successfully!")
