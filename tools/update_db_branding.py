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
    print("Failed to connect")
    sys.exit(1)

try:
    con.run("""
        UPDATE products 
        SET title = REPLACE(title, 'RareEmber', 'Rare Ember'),
            short = REPLACE(short, 'RareEmber', 'Rare Ember'),
            story = REPLACE(story, 'RareEmber', 'Rare Ember');
    """)
    rows = con.run("SELECT id, title FROM products ORDER BY id ASC;")
    print("✅ Successfully updated product titles to 'Rare Ember':")
    for r in rows:
        print(f"  • {r[1]}")
finally:
    con.close()
