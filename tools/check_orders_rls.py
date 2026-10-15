import psycopg2
from tools.qikink_client import load_env

env = load_env()
conn = psycopg2.connect(
    host=env['SUPABASE_DB_HOST'],
    user=env['SUPABASE_DB_USER'],
    password=env['SUPABASE_DB_PASS'],
    database=env['SUPABASE_DB_NAME'],
    port=5432
)
cur = conn.cursor()

# 1. Check policies
print("--- POLICIES ON ORDERS TABLE ---")
cur.execute("SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'orders';")
for row in cur.fetchall():
    print(row)

# 2. Check if jwt secret or service key is in vault or settings
cur.execute("SELECT name, setting FROM pg_settings WHERE name ILIKE '%jwt%' OR name ILIKE '%supabase%';")
for row in cur.fetchall():
    print(row)

cur.close()
conn.close()
