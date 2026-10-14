import json

for sid, name in [
    ('9a41891c-cb09-4cdd-88de-a6a96444a098', 'Batch 1'),
    ('8ead37fe-8276-4b3e-8391-46f377e32145', 'Batch 2'),
    ('258a4425-f633-4ea3-9a45-1386d920c2f4', 'Batch 3'),
]:
    p = rf"C:\Users\ajay kumar\.gemini\antigravity\brain\{sid}\.system_generated\logs\transcript.jsonl"
    lines = open(p, encoding='utf-8').readlines()
    last = json.loads(lines[-1])
    print(f"=== {name} (total {len(lines)} steps) ===")
    print("  Last step type:", last.get("type"))
    print("  Last step source:", last.get("source"))
    if 'content' in last and last['content']:
        print("  Content preview:", last['content'][:200].replace('\n', ' '))
    if 'tool_calls' in last and last['tool_calls']:
        tc = last['tool_calls'][0]
        print("  Tool call:", tc.get("name"), tc.get("args", {}).get("toolSummary"))
