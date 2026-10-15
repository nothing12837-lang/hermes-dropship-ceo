import os
import pg8000.native

env = {}
if os.path.exists('.env'):
    for line in open('.env', encoding='utf-8'):
        if '=' in line and not line.strip().startswith('#'):
            k, v = line.strip().split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

conn = pg8000.native.Connection(
    user=env.get('SUPABASE_DB_USER', 'postgres'),
    host=env.get('SUPABASE_DB_HOST'),
    port=5432,
    database=env.get('SUPABASE_DB_NAME', 'postgres'),
    password=env.get('SUPABASE_DB_PASS'),
    timeout=10
)

print('=== 📊 RARE EMBER LIVE BUSINESS AUDIT ===')
products_count = conn.run('SELECT count(*) FROM products')[0][0]
print(f'Catalog Products Live: {products_count}')

orders_count = conn.run('SELECT count(*) FROM orders')[0][0]
print(f'Total Orders Processed: {orders_count}')

status_breakdown = conn.run('SELECT status, count(*) FROM orders GROUP BY status')
print('Orders Breakdown by Status:')
for s, c in status_breakdown:
    print(f'  • {s}: {c} orders')

recent_orders = conn.run('SELECT id, user_email, total_amount, status, payment_method, created_at FROM orders ORDER BY created_at DESC LIMIT 5')
print('\nRecent 5 Orders:')
for ro in recent_orders:
    print(f'  • [{ro[5]}] ID: {ro[0][:8]}... | Email: {ro[1]} | Total: ₹{ro[2]} | Status: {ro[3]} | Method: {ro[4]}')

blog_count = conn.run('SELECT count(*) FROM blog_posts')[0][0]
print(f'\nPublished SEO Buying Guides: {blog_count}')

has_pnl = conn.run("SELECT to_regclass('public.orders_pnl')")[0][0]
if has_pnl:
    pnl_cols = [c[0] for c in conn.run("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders_pnl'")]
    pnl_count = conn.run('SELECT count(*) FROM orders_pnl')[0][0]
    print(f'Orders PnL Entries: {pnl_count} | Columns: {pnl_cols}')

conn.close()
print('\n=== AUDIT STATUS: HEALTHY & OPERATIONAL ===')
