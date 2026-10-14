import json
import re

for sid, bname in [('8ead37fe-8276-4b3e-8391-46f377e32145', 'Batch 2'), ('258a4425-f633-4ea3-9a45-1386d920c2f4', 'Batch 3')]:
    path = rf"C:\Users\ajay kumar\.gemini\antigravity\brain\{sid}\.system_generated\logs\transcript.jsonl"
    lines = open(path, encoding='utf-8').readlines()
    print(f"\n=================== {bname} ({len(lines)} steps) ===================")
    
    products_found = {}
    
    for l in lines:
        try:
            d = json.loads(l)
        except:
            continue
        
        # Check tool calls
        tc = d.get('tool_calls', [])
        for c in tc:
            q = c.get('args', {}).get('query', '')
            sumry = c.get('args', {}).get('toolSummary', '')
            # If search query has product name
            # print(f"Search: {sumry} -> {q}")
        
        content = d.get('content', '')
        # Check location redirects
        if 'Location: https://www.meesho.com' in content:
            for cl in content.splitlines():
                if cl.startswith('Location: https://www.meesho.com') and '/p/' in cl:
                    url = cl.replace('Location: ', '').strip()
                    m = re.search(r'/p/([a-z0-9]+)', url)
                    if m:
                        code = m.group(1)
                        products_found[code] = url
        
        # Check for image urls
        imgs = re.findall(r'https://images\.meesho\.com/images/products/\d+/[a-z0-9_]+', content)
        if imgs:
            # print images found
            pass

    print(f"Products with pages in {bname}: {len(products_found)}")
    for c, u in products_found.items():
        print(f"  {c} -> {u[:90]}...")
