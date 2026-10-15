import re
import json

with open('tools/qikink_rsc.txt', 'r', encoding='utf-8') as f:
    text = f.read()

print("Text sample around 'price':")
for m in re.finditer(r'price', text, re.IGNORECASE):
    start = max(0, m.start() - 60)
    end = min(len(text), m.end() + 100)
    print("--- SNIPPET ---")
    print(text[start:end])

print("\nText sample around 'description' or 'specifications':")
for m in re.finditer(r'GSM|240|combed', text, re.IGNORECASE):
    start = max(0, m.start() - 60)
    end = min(len(text), m.end() + 100)
    print("--- SPEC SNIPPET ---")
    print(text[start:end])
    break
