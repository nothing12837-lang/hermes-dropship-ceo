with open('src/app/product/[id]/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix unitPrice
text = text.replace('subscribe ? product.price * 0.85 : product.price', 'subscribe ? Number(product.price) * 0.85 : Number(product.price)')
text = text.replace('product.price + bundleItems', 'Number(product.price) + bundleItems')
text = text.replace('formatPrice(product.price * 0.85)', '`$${(Number(product.price) * 0.85).toFixed(2)}`')

# Fix compareAt -> old_price
text = text.replace('product.compareAt', 'product.old_price')

with open('src/app/product/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
