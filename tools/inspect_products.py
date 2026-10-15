import os
import sys

WORKSPACE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_PATH not in sys.path:
    sys.path.insert(0, WORKSPACE_PATH)

from radha_ceo.team import _get_con

con = _get_con()
if not con:
    print("Failed to connect to DB")
    sys.exit(1)

try:
    counts = con.run("SELECT count(*), active FROM products GROUP BY active;")
    print("Current products summary (count, active):", counts)
    
    sample = con.run("SELECT id, title, active FROM products LIMIT 5;")
    print("Sample rows:")
    for s in sample:
        print(s)
finally:
    con.close()
