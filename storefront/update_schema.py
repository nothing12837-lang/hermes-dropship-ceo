import re
path = 'supabase/schema.sql'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('category text not null default \'beds\',', 'category text not null default \'general\',\n    is_trending boolean not null default false,\n    is_new boolean not null default false,')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated schema!')
