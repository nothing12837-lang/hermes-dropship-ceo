import os
import sys
import ssl
import pg8000.native

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

env_path = ".env"
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
host = os.environ.get("SUPABASE_DB_HOST", "db.qdkkxpfhwrwyoardlceo.supabase.co").strip()
user = os.environ.get("SUPABASE_DB_USER", "postgres").strip()
password = os.environ.get("SUPABASE_DB_PASS", "").strip()
dbname = os.environ.get("SUPABASE_DB_NAME", "postgres").strip()

print(f"Connecting to Supabase PostgreSQL at {host}...")
conn = pg8000.native.Connection(
    user=user,
    host=host,
    port=5432,
    database=dbname,
    password=password,
    ssl_context=ctx
)
print("Connected successfully!")

# 1. Check if 'products' table exists
tables = [row[0] for row in conn.run("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")]
print(f"\nPublic tables found: {tables}")

# 2. Update slugs in products table if it exists
if "products" in tables:
    print("\n--- Updating Product Slugs ---")
    before_slugs = conn.run("SELECT count(*) FROM products WHERE slug LIKE '%qikink%'")[0][0]
    print(f"Products with 'qikink' in slug before update: {before_slugs}")
    
    conn.run("""
        UPDATE products
        SET slug = regexp_replace(
            regexp_replace(slug, '^qikink-(t-shirts-|tops-|hoodies-|accessories-)?', 'rare-ember-'),
            '-[a-z]{1,3}[0-9]{1,4}$',
            ''
        )
        WHERE slug LIKE '%qikink%';
    """)
    after_slugs = conn.run("SELECT count(*) FROM products WHERE slug LIKE '%qikink%'")[0][0]
    print(f"Products with 'qikink' in slug after update: {after_slugs}")
    print("✓ Product slugs cleaned to rare-ember- format")

    print("\n--- Updating Product Descriptions (Wholesale Copy Removal) ---")
    before_desc = conn.run("SELECT count(*) FROM products WHERE description ILIKE '%print-on-demand model%' OR description ILIKE 'Sell %'")[0][0]
    print(f"Products with wholesale pitch in description before update: {before_desc}")
    
    conn.run("""
        UPDATE products
        SET description = regexp_replace(
            description,
            '^Sell .* with (Qikink|Rare Ember Studio)''s print-on-demand model\\.',
            'Crafted in small batches at our Tirupur studio for everyday comfort and durability.',
            'i'
        )
        WHERE description ILIKE '%print-on-demand model%' OR description ILIKE 'Sell %';
    """)
    after_desc = conn.run("SELECT count(*) FROM products WHERE description ILIKE '%print-on-demand model%' OR description ILIKE 'Sell %'")[0][0]
    print(f"Products with wholesale pitch in description after update: {after_desc}")
    if after_desc > 0:
        rem = conn.run("SELECT id, slug, description FROM products WHERE description ILIKE '%print-on-demand model%' OR description ILIKE 'Sell %'")
        for r in rem:
            print(f"  Remaining: [{r[0]}] {r[1]} -> {r[2][:120]}...")
            # Direct replace on any remaining
            conn.run("UPDATE products SET description = 'Crafted in small batches at our Tirupur studio for everyday comfort and durability.' WHERE id = :p_id", p_id=r[0])
            print("  Fixed remaining description!")
    print("✓ Product descriptions rewritten to customer-facing retail copy")
else:
    print("\nNote: 'products' table not stored in database (storefront catalog is statically optimized in code).")

# 3. Blog posts filtering
if "blog_posts" in tables:
    print("\n--- Cleaning Blog Posts ---")
    res = conn.run("""
        UPDATE blog_posts
        SET published = false
        WHERE title ILIKE '%mandir%'
           OR title ILIKE '%diya%'
           OR title ILIKE '%lighting ideas%'
           OR title ILIKE '%home decor%'
           OR slug ILIKE '%mandir%'
           OR slug ILIKE '%diya%';
    """)
    print("✓ Unwanted mandir/diya/lighting blog posts unpublished")
    
    # Check published blogs
    published_blogs = conn.run("SELECT slug, title, published FROM blog_posts WHERE published = true")
    print(f"Currently published blog posts ({len(published_blogs)}):")
    for b in published_blogs:
        print(f"  - [{b[0]}] {b[1]}")

# 4. Row-Level Security verification & enforcement
print("\n--- Enforcing RLS Policies ---")
sensitive_tables = ['orders', 'orders_pnl', 'agent_memory', 'store_goals', 'scouted_products', 'rto_risk_scores']
for t in sensitive_tables:
    if t in tables:
        conn.run(f"ALTER TABLE {t} ENABLE ROW LEVEL SECURITY;")
        print(f"✓ RLS verified on {t}")

if "products" in tables:
    conn.run("ALTER TABLE products ENABLE ROW LEVEL SECURITY;")
    conn.run("DROP POLICY IF EXISTS \"public read products\" ON products;")
    conn.run("CREATE POLICY \"public read products\" ON products FOR SELECT USING (true);")
    print("✓ products: RLS enabled with public read policy")

if "blog_posts" in tables:
    conn.run("ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;")
    conn.run("DROP POLICY IF EXISTS \"public read published blog_posts\" ON blog_posts;")
    conn.run("CREATE POLICY \"public read published blog_posts\" ON blog_posts FOR SELECT USING (published = true);")
    print("✓ blog_posts: RLS enabled with published = true read policy")

print("\n--- Final Public Tables RLS Status ---")
final_tables = conn.run("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'")
for t in final_tables:
    print(f"  {t[0]}: RLS={t[1]}")

conn.close()
print("\nMigration completed successfully!")
