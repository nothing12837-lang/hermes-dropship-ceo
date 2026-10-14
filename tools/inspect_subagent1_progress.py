import json
import re

sid = '9a41891c-cb09-4cdd-88de-a6a96444a098'
path = rf"C:\Users\ajay kumar\.gemini\antigravity\brain\{sid}\.system_generated\logs\transcript.jsonl"
lines = open(path, encoding='utf-8').readlines()

for i, l in enumerate(lines):
    d = json.loads(l)
    tc = d.get('tool_calls', [])
    for c in tc:
        name = c.get('name')
        args = c.get('args', {})
        if name == 'search_web':
            q = args.get('query', '')
            summary = args.get('toolSummary', '')
            print(f"Step {i}: search_web: {summary} -> {q}")
        elif name == 'run_command':
            cmd = args.get('CommandLine', '')
            if 'Location:' in cmd or 'redirect' in args.get('toolSummary', '').lower():
                print(f"Step {i}: run_command redirect")
    
    content = d.get('content', '')
    if 'Location: https://www.meesho.com' in content:
        for cl in content.splitlines():
            if 'Location:' in cl:
                print(f"  --> {cl}")
