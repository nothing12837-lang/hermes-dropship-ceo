import json

lines = open(r"C:\Users\ajay kumar\.gemini\antigravity\brain\8ead37fe-8276-4b3e-8391-46f377e32145\.system_generated\logs\transcript.jsonl", encoding="utf-8").readlines()
print(f"Total lines in subagent 2: {len(lines)}")
for i, l in enumerate(lines[-20:], start=len(lines)-20):
    d = json.loads(l)
    tc = d.get('tool_calls')
    if tc:
        name = tc[0].get('name')
        summary = tc[0].get('args', {}).get('toolSummary')
        print(f"Step {i}: {name} -> {summary}")
