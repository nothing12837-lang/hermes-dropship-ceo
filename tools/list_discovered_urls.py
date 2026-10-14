import json
import re

subagents = [
    ('9a41891c-cb09-4cdd-88de-a6a96444a098', 'Batch 1'),
    ('8ead37fe-8276-4b3e-8391-46f377e32145', 'Batch 2'),
    ('258a4425-f633-4ea3-9a45-1386d920c2f4', 'Batch 3'),
]

discovered_urls = []

for sid, bname in subagents:
    path = rf"C:\Users\ajay kumar\.gemini\antigravity\brain\{sid}\.system_generated\logs\transcript.jsonl"
    try:
        lines = open(path, encoding='utf-8').readlines()
    except Exception as e:
        continue

    for l in lines:
        try:
            d = json.loads(l)
        except:
            continue
        content = d.get('content', '')
        if 'Location: https://www.meesho.com' in content:
            for cl in content.splitlines():
                if cl.startswith('Location: https://www.meesho.com') and '/p/' in cl:
                    url = cl.replace('Location: ', '').strip()
                    if url not in discovered_urls:
                        discovered_urls.append(url)

print(f"Total Unique Product URLs discovered across subagents: {len(discovered_urls)}")
for u in discovered_urls:
    print(" -", u)
