import urllib.request
import re
import xml.etree.ElementTree as ET

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

req = urllib.request.Request('https://qikink.com/sitemap-0.xml', headers=headers)
with urllib.request.urlopen(req, timeout=10) as resp:
    xml_data = resp.read()
    root = ET.fromstring(xml_data)
    locs = [elem.text for elem in root.iter() if elem.tag.endswith('loc')]
    
custom_urls = [u for u in locs if '/custom/' in u]
print(f"Total /custom/ URLs in sitemap-0.xml: {len(custom_urls)}")
for u in custom_urls:
    print(u)
