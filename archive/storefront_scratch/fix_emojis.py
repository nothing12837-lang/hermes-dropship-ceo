import re
path = 'src/app/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"emoji: 'dY.*?O'", "emoji: '💻'", content)
content = re.sub(r"emoji: 'dY.*?\-'", "emoji: '👕'", content)
content = re.sub(r"emoji: 'dY\?'", "emoji: '🪴'", content)
content = re.sub(r"emoji: 'dY\?_'", "emoji: '🐕'", content)
content = re.sub(r"emoji: 'dY\?,\?'", "emoji: '✨'", content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
