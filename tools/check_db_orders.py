import os
import pg8000.native

DB_HOST = os.environ.get('SUPABASE_DB_HOST', 'db.dhmfefvjeyvmtovtuehh.supabase.co')
DB_USER = os.environ.get('SUPABASE_DB_USER', 'postgres')
DB_PASS = os.environ.get('SUPABASE_DB_PASSWORD', 'CEO_Harmeen_2026_Secure!')
DB_NAME = os.environ.get('SUPABASE_DB_NAME', 'postgres')

conn = pg8000.native.Connection(
    user=DB_USER,
    password=DB_PASS,
    host=DB_HOST,
    port=5432,
    database=DB_NAME,
    ssl_context=True,
    timeout=10
)

funcs = conn.run("SELECT proname FROM pg_proc WHERE proname IN ('track_order', 'admin_lookup_orders');")
print('Existing functions:', funcs)

cols = conn.run("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';")
print('Orders table columns:', [c[0] for c in cols])

orders = conn.run("SELECT count(*) FROM orders;")
print('Total orders count:', orders)
conn.close()
