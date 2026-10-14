import re

with open('src/app/product/[id]/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make it async and import supabase
text = text.replace('import { use, useMemo, useState } from \'react\';', 'import { use, useMemo, useState, useEffect } from \'react\';\nimport { supabase } from \'@/lib/supabase\';')

# Update fetching logic
old_fetch = '''  const { id } = use(params);
  const product = getProduct(decodeURIComponent(id));

  const { add, openCart } = useCart();
  const { has, toggle } = useWishlist();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'story' | 'details' | 'safety' | 'shipping'>('story');
  const [subscribe, setSubscribe] = useState(false);

  if (!product) return notFound();

  const meta = PET_META[product.pet];
  const unitPrice = subscribe ? product.price * 0.85 : product.price;
  const bundleIds = bundles[product.id] || [];'''

new_fetch = '''  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', decodeURIComponent(id)).single().then(({data}) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  const { add, openCart } = useCart();
  const { has, toggle } = useWishlist();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'story' | 'details' | 'safety' | 'shipping'>('story');
  const [subscribe, setSubscribe] = useState(false);

  if (loading) return <div style={{paddingTop: '10rem', textAlign: 'center'}}>Loading...</div>;
  if (!product) return notFound();

  const meta = PET_META[product.category === 'cats' ? 'cat' : 'dog'] || PET_META['both'];
  const unitPrice = subscribe ? Number(product.price) * 0.85 : Number(product.price);
  const bundleIds = bundles[product.id] || [];'''

text = text.replace(old_fetch, new_fetch)

# Update emoji to image in product page
old_hero = '''<motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              position: 'relative',
              aspectRatio: '1',
              background: product.gradient,
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            }}
          >
            <motion.span
              animate={{ rotate: [-5, 5, -5], y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              style={{ fontSize: '10rem', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}
            >
              {product.emoji}
            </motion.span>
          </motion.div>'''

new_hero = '''<motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              position: 'relative',
              aspectRatio: '1',
              background: "linear-gradient(135deg, #FFF0D4, #FFC300)",
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
              backgroundImage: product.image_url ? `url(${product.image_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!product.image_url && (
              <motion.span
                animate={{ rotate: [-5, 5, -5], y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                style={{ fontSize: '10rem', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}
              >
                {product.emoji || '✨'}
              </motion.span>
            )}
          </motion.div>'''

text = text.replace(old_hero, new_hero)

# Fix product fields mapping
text = text.replace('{product.chapter}', '{product.tag}')
text = text.replace('{product.title}', '{product.title}')
text = text.replace('{product.desc}', '{product.description}')
text = text.replace('formatPrice(product.price)', '`$${Number(product.price).toFixed(2)}`')
text = text.replace('formatPrice(unitPrice)', '`$${Number(unitPrice).toFixed(2)}`')

with open('src/app/product/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
