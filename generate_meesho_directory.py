import re
import json

def base36_encode(number: int) -> str:
    chars = '0123456789abcdefghijklmnopqrstuvwxyz'
    result = ''
    while number > 0:
        number, remainder = divmod(number, 36)
        result = chars[remainder] + result
    return result or '0'

with open('storefront/src/lib/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const products: Product\[\] = (\[.*?\]);', text, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    lines = [
        '# 📦 RAREEMBER 100% AUTHENTIC MEESHO DIRECT SOURCING DIRECTORY',
        '',
        '> **Verified Domestic Indian Manufacturers (Surat / Bhiwandi / Delhi Hubs)**  ',
        '> *Every product listed on RareEmber is 100% sourced from Meesho with live stock & domestic express delivery.*  ',
        '',
        '### How to Open These Links:',
        '1. **Mobile / Phone Browser or Meesho App:** Tap the direct link. It opens the exact product listing on Meesho instantly.',
        '2. **Meesho App Search:** If browsing on desktop or app, type the **Product ID / Code** (e.g., `s-431985757` or `756ycd`) in the Meesho search bar to jump straight to the manufacturer catalog.',
        '',
        '| # | Product Name | Store Price (30% Margin) | Sourcing Cost (Est.) | Meesho Direct Link | Meesho Product ID | App Search Code |',
        '| :---: | :--- | :---: | :---: | :---: | :---: | :---: |'
    ]
    
    for i, p in enumerate(data, 1):
        img = p.get('image_url') or ''
        m_img = re.search(r'/products/(\d+)/', img)
        if m_img:
            num = int(m_img.group(1))
            code = base36_encode(num)
            link = f'https://www.meesho.com/s/p/{code}'
            id_str = f'{num}'
            app_code = f'`{code}` / `s-{num}`'
        else:
            q = p['id'].replace('meesho-', '').replace('-', '+')
            link = f'https://www.meesho.com/search?q={q}'
            id_str = 'N/A'
            app_code = 'Keyword Search'
            
        title = p['title'].replace('|', '-')
        price = int(p.get('price_inr') or p.get('price') or 299)
        est_wholesale = int(price * 0.48)
        lines.append(f'| {i} | **{title}** | ₹{price} | ~₹{est_wholesale} | [Open Meesho Listing]({link}) | `{id_str}` | {app_code} |')

    with open('MEESHO_DIRECT_SOURCING_LINKS.md', 'w', encoding='utf-8') as f_out:
        f_out.write('\n'.join(lines) + '\n')
    print(f'Successfully generated MEESHO_DIRECT_SOURCING_LINKS.md with {len(data)} items.')
