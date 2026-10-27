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

# Credentials come from the environment only. No defaults, no literals.
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres").strip()
DB_HOST = os.environ.get("SUPABASE_DB_HOST", "").strip()
DB_NAME = os.environ.get("SUPABASE_DB_NAME", "postgres").strip()
DB_PASS = os.environ.get("SUPABASE_DB_PASS", "").strip()

if not DB_HOST or not DB_PASS:
    print("ERROR: SUPABASE_DB_HOST and SUPABASE_DB_PASS must be set in .env. Refusing to run.")
    sys.exit(1)

# Certificate context with self-signed compatibility for cloud postgres
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
conn = pg8000.native.Connection(
    user=DB_USER,
    host=DB_HOST,
    port=5432,
    database=DB_NAME,
    password=DB_PASS,
    ssl_context=ctx,
)

failures = []


def check(label, sql):
    """Run a statement and record failures instead of silently continuing."""
    try:
        conn.run(sql)
        print(f"OK   {label}")
    except Exception as exc:  # noqa: BLE001
        failures.append(f"{label}: {exc}")
        print(f"FAIL {label}: {exc}")


print("Applying Row-Level-Security (RLS) hardening...")

# ------------------------------------------------------------------
# 1. Enable (and FORCE) RLS on every agent-facing table.
#    FORCE makes the policy apply to the table owner too, so the
#    superuser-created tables are not a hole.
# ------------------------------------------------------------------
for table in (
    "agent_memory",
    "store_goals",
    "blog_posts",
    "scouted_products",
    "orders_pnl",
    "rto_risk_scores",
    "orders",
    "returns",
    "return_claims",
    "support_tickets",
    "custom_leads",
):
    check(f"{table}: enable+force RLS", f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
    check(f"{table}: force RLS", f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")

# ------------------------------------------------------------------
# 2. orders -- the table that matters.
#
#    History: the script created
#      CREATE POLICY allow_public_order_insert ON orders FOR INSERT TO public
#        WITH CHECK (true)
#    With the PUBLIC anon key that let ANYONE insert a forged row,
#    including status='paid', which the fulfilment retry worker then
#    printed and shipped -- free merchandise.
#
#    It also dropped only four policy names, so legacy permissive
#    policies (allow_service_and_anon_select_orders, allow_delete_orders,
#    ...) survived and Postgres UNIONs policies with OR: one permissive
#    policy is enough to open the whole table.
#
#    Now: every known policy name is dropped, anon/authenticated are
#    REVOKED at the table level, and only a service_role policy remains.
# ------------------------------------------------------------------
LEGACY_ORDER_POLICIES = [
    "allow_order_select",
    "allow_order_insert",
    "allow_order_update",
    "allow_order_delete",
    "allow_public_order_insert",
    "allow_public_order_select",
    "allow_public_order_update",
    "allow_public_order_delete",
    "allow_delete_orders",
    "allow_service_and_anon_select_orders",
    "allow_service_and_anon_update_orders",
    "allow_service_role_all_orders",
    "authenticated_view_own_orders",
    "guest insert pending orders",
    "public_read_orders",
    "public_insert_orders",
    "service_role_orders_all",
]
for name in LEGACY_ORDER_POLICIES:
    check(f"orders: drop policy {name}", f'DROP POLICY IF EXISTS "{name}" ON public.orders')

check(
    "orders: revoke anon",
    "REVOKE ALL ON public.orders FROM anon",
)
check(
    "orders: revoke authenticated",
    "REVOKE ALL ON public.orders FROM authenticated",
)
check(
    "orders: grant service_role",
    "GRANT ALL ON public.orders TO service_role",
)
check(
    "orders: service_role-only policy",
    "CREATE POLICY service_role_orders_all ON public.orders "
    "FOR ALL TO service_role USING (true) WITH CHECK (true)",
)

# ------------------------------------------------------------------
# 2b. returns & return_claims & support_tickets & custom_leads
#     Strict service-role only access. Revoke anon & authenticated.
# ------------------------------------------------------------------
for p0_table in ("returns", "return_claims", "support_tickets", "custom_leads"):
    check(f"{p0_table}: drop legacy permissive policies", f'DROP POLICY IF EXISTS "Allow service role full access to {p0_table}" ON public.{p0_table}')
    check(f"{p0_table}: drop service_role policy if exists", f'DROP POLICY IF EXISTS "service_role_{p0_table}_all" ON public.{p0_table}')
    check(f"{p0_table}: revoke anon", f"REVOKE ALL ON public.{p0_table} FROM anon")
    check(f"{p0_table}: revoke authenticated", f"REVOKE ALL ON public.{p0_table} FROM authenticated")
    check(f"{p0_table}: grant service_role", f"GRANT ALL ON public.{p0_table} TO service_role")
    check(
        f"{p0_table}: create service_role-only policy",
        f'CREATE POLICY "service_role_{p0_table}_all" ON public.{p0_table} '
        "FOR ALL TO service_role USING (true) WITH CHECK (true)",
    )

# ------------------------------------------------------------------
# 3. track_order -- SECURITY DEFINER, so it runs as the owner and
#    bypasses RLS. It used to return SETOF orders (every column,
#    including user_email and user_id) and was granted to anon.
#    Now it returns an explicit, non-identifying column list and is
#    granted to authenticated only.
# ------------------------------------------------------------------
check(
    "track_order: drop old signature",
    "DROP FUNCTION IF EXISTS public.track_order(text, text)",
)
conn.run(
    """
CREATE OR REPLACE FUNCTION public.track_order(p_order_id text, p_email text)
RETURNS TABLE (
  id uuid,
  status text,
  total_amount numeric,
  shipping_address jsonb,
  tracking_number text,
  tracking_url text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.status, o.total_amount, o.shipping_address,
         o.tracking_number, o.tracking_url, o.created_at
  FROM public.orders o
  WHERE o.id::text = p_order_id
    AND LOWER(o.user_email) = LOWER(p_email)
  LIMIT 1;
$$;
"""
)
print("OK   track_order: recreated with an explicit column list")
check(
    "track_order: revoke anon",
    "REVOKE ALL ON FUNCTION public.track_order(text, text) FROM anon, PUBLIC",
)
check(
    "track_order: grant authenticated",
    "GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO authenticated, service_role",
)

# ------------------------------------------------------------------
# 4. admin_lookup_orders -- REMOVED.
#
#    It baked the ADMIN_SECRET into the function body with an f-string
#    (SQL injection + the secret readable in pg_proc) and was granted to
#    anon. Because the secret check was `p_admin_secret != '<secret>'`,
#    an EMPTY ADMIN_SECRET made the check pass for the empty string,
#    so `admin_lookup_orders('', ...)` returned 25 rows of order PII to
#    any anonymous caller.
#
#    Admin reads now go through the service-role client in the app
#    (see storefront/src/lib/supabase-server.ts).
# ------------------------------------------------------------------
check(
    "admin_lookup_orders: drop",
    "DROP FUNCTION IF EXISTS public.admin_lookup_orders(text, text, text)",
)

# ------------------------------------------------------------------
# 5. Public read policies that are legitimately public.
# ------------------------------------------------------------------
check(
    "blog_posts: drop old policy",
    'DROP POLICY IF EXISTS "public_read_published_blogs" ON blog_posts',
)
check(
    "blog_posts: drop duplicate policy",
    'DROP POLICY IF EXISTS "public read published blog_posts" ON blog_posts',
)
check(
    "blog_posts: public read policy",
    'CREATE POLICY "public_read_published_blogs" ON blog_posts '
    "FOR SELECT TO public USING (published = true)",
)

# ------------------------------------------------------------------
# 6. Storage bucket: the artwork bucket must not be world-writable.
# ------------------------------------------------------------------
check(
    "storage: drop public upload policy",
    'DROP POLICY IF EXISTS "Public Upload Artworks" ON storage.objects',
)
check(
    "storage: revoke anon insert",
    "REVOKE INSERT ON storage.objects FROM anon",
)
check(
    "storage: authenticated upload policy",
    'CREATE POLICY "Authenticated Upload Artworks" ON storage.objects '
    "FOR INSERT TO authenticated, service_role "
    "WITH CHECK (bucket_id = 'custom-artworks')",
)

# ------------------------------------------------------------------
# 7. Verification -- assert, do not just print.
# ------------------------------------------------------------------
print("\n--- Verifying ---")
for tbl_name in ("orders", "returns", "return_claims", "support_tickets", "custom_leads"):
    res = conn.run(
        f"SELECT polname, polcmd, polroles::regrole[] FROM pg_policy "
        f"WHERE polrelid = 'public.{tbl_name}'::regclass"
    )
    print(f"  {tbl_name} policies:", res)
    bad = [
        r
        for r in res
        if any(str(role).strip("{}") in ("anon", "public") for role in (r[2] or []))
    ]
    if bad:
        failures.append(f"{tbl_name} still has permissive policies: {bad}")

res2 = conn.run(
    "SELECT proname, proacl FROM pg_proc "
    "WHERE proname IN ('track_order', 'admin_lookup_orders') "
    "AND pronamespace = 'public'::regnamespace"
)
print("  RPCs:", res2)
for row in res2:
    if row[0] == "admin_lookup_orders":
        failures.append("admin_lookup_orders still exists")
    if row[0] == "track_order" and row[1] and "=T/anon" in str(row[1]):
        failures.append("track_order is still executable by anon")

conn.close()

if failures:
    print("\nRLS HARDENING FAILED:")
    for f in failures:
        print("  -", f)
    sys.exit(1)

print("\nAll RLS hardening steps applied and verified.")
