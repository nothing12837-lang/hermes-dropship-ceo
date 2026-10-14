import re

with open('src/app/shop/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

new_mapping = '''<ProductCard
                  id={p.id}
                  emoji={p.emoji || '✨'}
                  tag={p.tag || 'New'}
                  tagColor="#FFFFFF"
                  tagBg="var(--color-brand-primary)"
                  title={p.title}
                  desc={p.description || ''}
                  price={`$${Number(p.price).toFixed(2)}`}
                  oldPrice={p.old_price ? `$${Number(p.old_price).toFixed(2)}` : undefined}
                  gradient="linear-gradient(135deg, #FFF0D4, #FFC300)"
                  imageUrl={p.image_url}
                  pet={p.category === 'cats' ? 'cat' : 'dog'}
                />'''

text = re.sub(
    r'<ProductCard\s+id=\{p\.id\}.*?/>',
    new_mapping,
    text,
    flags=re.DOTALL
)

with open('src/app/shop/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
