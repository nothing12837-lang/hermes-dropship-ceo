import re

with open('src/app/shop/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('import { formatPrice, products } from \'@/lib/data/products\';', 'import { formatPrice } from \'@/lib/data/products\';\nimport { supabase } from \'@/lib/supabase\';\nimport { useEffect } from \'react\';')

text = re.sub(
    r'function matches\(cat: string, p: \(typeof products\)\[number\]\) \{.*?\n\}',
    'function matches(cat: string, p: any) {\n  if (cat === \'all\') return true;\n  if (cat === \'cozy-tech\') return p.category === \'tech\';\n  if (cat === \'dog\') return p.category === \'dogs\' || p.category === \'both\';\n  if (cat === \'cat\') return p.category === \'cats\' || p.category === \'both\';\n  return false;\n}',
    text,
    flags=re.DOTALL
)

old_shop = '''function ShopContent() {
  const searchParams = useSearchParams();
  const initCat = (searchParams.get('cat') || 'all') as CatId;
  const [active, setActive] = useState<CatId>(initCat);

  const filtered = useMemo(() => {
    return products.filter((p) => matches(active, p));
  }, [active]);'''

new_shop = '''function ShopContent() {
  const searchParams = useSearchParams();
  const initCat = (searchParams.get('cat') || 'all') as CatId;
  const [active, setActive] = useState<CatId>(initCat);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('created_at');
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => matches(active, p));
  }, [active, products]);'''

text = text.replace(old_shop, new_shop)

old_mapping = '''<ProductCard
                      id={p.id}
                      emoji={p.emoji}
                      tag={p.tag}
                      tagColor={p.tagColor}
                      tagBg={p.tagBg}
                      title={p.title}
                      desc={p.desc}
                      price={formatPrice(p.price)}
                      oldPrice={p.oldPrice ? formatPrice(p.oldPrice) : undefined}
                      gradient={p.gradient}
                      pet={p.pet}
                    />'''

new_mapping = '''<ProductCard
                      id={p.id}
                      emoji={p.emoji || '✨'}
                      tag={p.tag}
                      tagColor="#FFFFFF"
                      tagBg="var(--color-brand-primary)"
                      title={p.title}
                      desc={p.description || ''}
                      price={`$${Number(p.price).toFixed(2)}`}
                      oldPrice={p.old_price ? `$${Number(p.old_price).toFixed(2)}` : undefined}
                      gradient="linear-gradient(135deg, #FFF0D4, #FFC300)"
                      imageUrl={p.image_url}
                    />'''

text = text.replace(old_mapping, new_mapping)

with open('src/app/shop/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
