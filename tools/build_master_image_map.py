import json
import re

# 1. Read dropship_gateway.py
gateway_text = open('dropship_gateway.py', encoding='utf-8').read()
direct_urls = {}
m = re.search(r'MEESHO_DIRECT_URLS = \{([\s\S]*?)\}', gateway_text)
if m:
    for line in m.group(1).splitlines():
        pm = re.search(r"['\"](meesho-[^'\"]+)['\"]\s*:\s*['\"]([^'\"]+)['\"]", line)
        if pm:
            direct_urls[pm.group(1)] = pm.group(2)

print(f"Direct URLs in dropship_gateway: {len(direct_urls)}")
for k, v in list(direct_urls.items())[:5]:
    print(f"  {k}: {v}")
