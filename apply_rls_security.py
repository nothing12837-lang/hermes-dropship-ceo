import os
import sys
import ssl
import json
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
conn = pg8000.native.Connection(
    user=os.environ.get("SUPABASE_DB_USER", "postgres").strip(),
    host=os.environ.get("SUPABASE_DB_HOST", "db.qdkkxpfhwrwyoardlceo.supabase.co").strip(),
    port=5432,
    database=os.environ.get("SUPABASE_DB_NAME", "postgres").strip(),
    password=os.environ.get("SUPABASE_DB_PASS", "").strip(),
    ssl_context=ctx
)

print("Applying Row-Level-Security (RLS) hardening...")

# 1. Enable RLS on agent_memory
conn.run("ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY")
print("✓ agent_memory: RLS enabled")

# 2. Enable RLS on store_goals
conn.run("ALTER TABLE store_goals ENABLE ROW LEVEL SECURITY")
print("✓ store_goals: RLS enabled")

# 3. Enable RLS on blog_posts & add read policy
conn.run("ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY")
conn.run("DROP POLICY IF EXISTS \"public_read_published_blogs\" ON blog_posts")
conn.run("CREATE POLICY \"public_read_published_blogs\" ON blog_posts FOR SELECT TO public USING (published = true)")
print("✓ blog_posts: RLS enabled + public_read_published_blogs policy")

# 4. Enable RLS on scouted_products
conn.run("ALTER TABLE scouted_products ENABLE ROW LEVEL SECURITY")
print("✓ scouted_products: RLS enabled")

# 5. Enable RLS on orders_pnl
conn.run("ALTER TABLE orders_pnl ENABLE ROW LEVEL SECURITY")
print("✓ orders_pnl: RLS enabled")

# 6. Enable RLS on rto_risk_scores
conn.run("ALTER TABLE rto_risk_scores ENABLE ROW LEVEL SECURITY")
print("✓ rto_risk_scores: RLS enabled")

# 7. Harden orders table
conn.run("ALTER TABLE orders ENABLE ROW LEVEL SECURITY")
conn.run("DROP POLICY IF EXISTS \"allow_order_select\" ON orders")
conn.run("DROP POLICY IF EXISTS \"allow_order_insert\" ON orders")
conn.run("DROP POLICY IF EXISTS \"authenticated_view_own_orders\" ON orders")
conn.run("DROP POLICY IF EXISTS \"allow_public_order_insert\" ON orders")

conn.run("CREATE POLICY \"allow_public_order_insert\" ON orders FOR INSERT TO public WITH CHECK (true)")
conn.run("CREATE POLICY \"authenticated_view_own_orders\" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id)")
print("✓ orders: Hardened RLS policies (allow_order_select removed, authenticated own orders + public insert)")

# 8. Create secure track_order RPC function
conn.run("""
CREATE OR REPLACE FUNCTION track_order(p_order_id text, p_email text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM orders
  WHERE id::text = p_order_id
    AND LOWER(user_email) = LOWER(p_email)
  LIMIT 1;
$$;
""")
conn.run("GRANT EXECUTE ON FUNCTION track_order(text, text) TO anon, authenticated")
print("✓ track_order: RPC function created & granted to anon/authenticated")

admin_sec = os.environ.get("ADMIN_SECRET", "RareEmberAdmin2026").strip()
conn.run(f"""
CREATE OR REPLACE FUNCTION admin_lookup_orders(p_admin_secret text, p_order_id text DEFAULT NULL, p_email text DEFAULT NULL)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_admin_secret IS NULL OR p_admin_secret != '{admin_sec}' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY
  SELECT * FROM orders
  WHERE (p_order_id IS NULL OR id::text ILIKE p_order_id || '%')
    AND (p_email IS NULL OR LOWER(user_email) = LOWER(p_email))
  ORDER BY created_at DESC
  LIMIT 25;
END;
$$;
""")
conn.run("GRANT EXECUTE ON FUNCTION admin_lookup_orders(text, text, text) TO anon, authenticated")
print("✓ admin_lookup_orders: Secure admin RPC function created")

print("\n--- Verifying All Public Tables RLS Status ---")
tables = conn.run("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'")
for t in tables:
    print(f"  {t[0]}: RLS={t[1]}")

conn.close()
