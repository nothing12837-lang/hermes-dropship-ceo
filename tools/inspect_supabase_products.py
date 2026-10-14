import os
import ssl
import pg8000.native

env_path = '.env'
if os.path.exists(env_path):
    for l in open(env_path, encoding='utf-8'):
        if '=' in l and not l.startswith('#'):
            k, v = l.strip().split('=', 1)
            os.environ[k] = v

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

con = pg8000.native.Connection(
    user='postgres',
    host=os.environ.get('SUPABASE_DB_HOST', 'db.qdkkxpfhwrwyoardlceo.supabase.co'),
    port=5432,
    database='postgres',
    password=os.environ.get('SUPABASE_DB_PASS'),
    ssl_context=ctx
)

cols = con.run("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'")
print("Products columns:")
for col, dt in cols:
    print(f"  {col} ({dt})")

# Count rows
rows = con.run("SELECT count(*) FROM products")
print(f"Total rows in products table: {rows[0][0]}")

# Sample row
sample = con.run("SELECT id, title, image_url FROM products LIMIT 3")
for r in sample:
    print(f"  {r[0]}: {r[1][:30]} -> {r[2]}")

con.close()
