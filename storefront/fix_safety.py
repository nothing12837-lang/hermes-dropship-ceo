with open('src/app/product/[id]/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('product.ages.join(', '(product.ages || ["All ages"]).join(')
text = text.replace('{product.safety}', '{product.safety || "Safe for daily use by your pets."}')

with open('src/app/product/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
