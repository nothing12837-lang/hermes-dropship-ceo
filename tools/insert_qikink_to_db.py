import os
import json
import pg8000.native

env = {}
for line in open('.env', encoding='utf-8'):
    if '=' in line and not line.strip().startswith('#'):
        k, v = line.strip().split('=', 1)
        env[k.strip()] = v.strip().strip('"').strip("'")

host = env.get('SUPABASE_DB_HOST', '')
user = env.get('SUPABASE_DB_USER', 'postgres')
password = env.get('SUPABASE_DB_PASS', '')
database = env.get('SUPABASE_DB_NAME', 'postgres')

with open('tools/qikink_scraped_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Loaded {len(catalog)} products from scraped catalog.")

conn = pg8000.native.Connection(user=user, host=host, port=5432, database=database, password=password, timeout=10)
print("Connected to Supabase PostgreSQL successfully!")

# Delete old products
conn.run("DELETE FROM products;")
print("Cleared all legacy products from Supabase.")

# Insert new authentic Qikink products
insert_sql = """
INSERT INTO products (
    id, slug, title, description, short, story, price, price_inr, compare_at_price,
    category, emoji, tag, tag_color, tag_bg, rating, reviews, image_url, details,
    supplier, is_trending, is_new, active, chapter, gradient
) VALUES (
    :id, :slug, :title, :description, :short, :story, :price, :price_inr, :compare_at_price,
    :category, :emoji, :tag, :tag_color, :tag_bg, :rating, :reviews, :image_url, :details,
    :supplier, :is_trending, :is_new, :active, :chapter, :gradient
)
"""

for idx, p in enumerate(catalog):
    params = {
        "id": p["id"],
        "slug": p["slug"],
        "title": p["title"],
        "description": p["story"],
        "short": p["short"],
        "story": p["story"],
        "price": p["price"],
        "price_inr": p["price_inr"],
        "compare_at_price": p["compare_at_price"],
        "category": p["category"],
        "emoji": p["emoji"],
        "tag": p["tag"],
        "tag_color": p["tagColor"],
        "tag_bg": p["tagBg"],
        "rating": p["rating"],
        "reviews": p["reviews"],
        "image_url": p["image_url"],
        "details": json.dumps(p["details"]),
        "supplier": "qikink",
        "is_trending": idx < 8,
        "is_new": idx % 2 == 0,
        "active": True,
        "chapter": f"Drop {str(idx+1).zfill(2)}",
        "gradient": "linear-gradient(135deg, #18181b, #09090b)"
    }
    conn.run(insert_sql, **params)
    print(f"[{idx+1}/{len(catalog)}] Inserted: {p['title']}")

count = conn.run("SELECT count(*) FROM products;")
print(f"\nSUCCESS! Total products in Supabase: {count[0][0]}")
conn.close()
