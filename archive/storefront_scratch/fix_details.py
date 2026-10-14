with open('src/app/product/[id]/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('product.details.map(', '(product.details || ["High-quality material", "Durable build"]).map(')

with open('src/app/product/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
