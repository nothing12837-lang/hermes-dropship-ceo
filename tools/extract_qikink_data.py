import urllib.request
import re
import json

url = 'https://qikink.com/custom/t-shirts/oversized-t-shirt-uc22/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')

match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
if match:
    print('SUCCESS: Found __NEXT_DATA__!')
    data = json.loads(match.group(1))
    page_props = data.get('props', {}).get('pageProps', {})
    print('pageProps keys:', list(page_props.keys()))
    with open('tools/qikink_sample.json', 'w', encoding='utf-8') as f:
        json.dump(page_props, f, indent=2)
    print('Saved tools/qikink_sample.json!')
else:
    print('__NEXT_DATA__ not found directly. Searching for JSON blocks...')
    # Search for self.__next_f.push or similar
    rsc_blocks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html)
    print(f'RSC blocks found: {len(rsc_blocks)}')
    with open('tools/qikink_raw_html.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Saved raw HTML for inspection.')
