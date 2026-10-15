import os
import sys

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

from radha_ceo.team import _get_con

con = _get_con()
if not con:
    print("Failed to connect")
    sys.exit(1)

try:
    cols = con.run("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products'
        ORDER BY ordinal_position;
    """)
    print("Columns in products table:")
    for c in cols:
        print(f" - {c[0]} ({c[1]})")
finally:
    con.close()
