for path in ['.env', 'storefront/.env.local']:
    print(f"=== {path} ===")
    for line in open(path, encoding='utf-8'):
        if 'QIKINK' in line and '=' in line:
            k, v = line.strip().split('=', 1)
            val = v.strip().strip('"').strip("'")
            print(f"  {k} = len {len(val)} (starts with '{val[:6]}')")
