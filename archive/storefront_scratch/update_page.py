import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make Home async
text = text.replace('export default function Home() {', 'import { supabase } from \'@/lib/supabase\';\n\nexport default async function Home() {\n  const { data: products } = await supabase.from(\'products\').select(\'*\').order(\'created_at\');\n')

new_products = '''<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {products && products.map((p, i) => {
                const gradients = [
                  'linear-gradient(135deg, #FFF0D4, #FFC300)',
                  'linear-gradient(135deg, #FFE4DF, #FF5A36)',
                  'linear-gradient(135deg, #E0F2F1, #00A896)'
                ];
                const tagBgs = [
                  'var(--color-brand-secondary)',
                  'var(--color-brand-primary)',
                  'var(--color-brand-text)'
                ];
                return (
                  <ScrollReveal key={p.id} delay={(i + 1) * 100}>
                    <ProductCard
                      id={p.id}
                      emoji={p.emoji || '✨'}
                      tag={p.tag}
                      tagColor="#FFFFFF"
                      tagBg={tagBgs[i % tagBgs.length]}
                      title={p.title}
                      desc={p.description || ''}
                      price={`$${Number(p.price).toFixed(2)}`}
                      oldPrice={p.old_price ? `$${Number(p.old_price).toFixed(2)}` : undefined}
                      gradient={gradients[i % gradients.length]}
                    />
                  </ScrollReveal>
                );
              })}
            </div>'''

text = re.sub(
    r'<div style=\{\{ display: \'grid\', gridTemplateColumns: \'repeat\(auto-fit, minmax\(300px, 1fr\)\)\', gap: \'2rem\' \}\}>.*?</ScrollReveal>\s*</div>',
    new_products,
    text,
    flags=re.DOTALL
)

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated page.tsx with Supabase data mapping")
