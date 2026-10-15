import os
import sys

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from radha_ceo.team import _get_con

con = _get_con()
if not con:
    print("❌ Failed to connect to DB")
    sys.exit(1)

try:
    print("1. Counting legacy rows to purge...")
    legacy_counts = con.run("""
        SELECT count(*) FROM products 
        WHERE id LIKE 'meesho-%' 
           OR slug LIKE 'meesho-%' 
           OR id LIKE 'deodap-%' 
           OR slug LIKE 'deodap-%' 
           OR supplier IN ('meesho', 'deodap');
    """)
    print(f"Legacy items found: {legacy_counts[0][0]}")

    print("2. Deleting all legacy Meesho and DeoDap products...")
    con.run("""
        DELETE FROM products 
        WHERE id LIKE 'meesho-%' 
           OR slug LIKE 'meesho-%' 
           OR id LIKE 'deodap-%' 
           OR slug LIKE 'deodap-%' 
           OR supplier IN ('meesho', 'deodap');
    """)
    print("✅ Successfully purged all Meesho and DeoDap products from database!")

    # Verify remaining products
    remaining = con.run("SELECT id, title, price_inr, supplier, active FROM products ORDER BY id ASC;")
    print(f"\n📊 Remaining Products in Database: {len(remaining)}")
    for r in remaining:
        print(f"  • [{r[3].upper()}] ₹{r[2]} | {r[1]} (active: {r[4]})")

finally:
    con.close()
