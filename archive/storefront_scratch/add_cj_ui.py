import re

with open('src/app/product/[id]/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add cjData state
hooks_old = '''  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', decodeURIComponent(id)).single().then(({data, error}) => {
      if (error) console.error(error);
      setProduct(data);
      setLoading(false);
    });
  }, [id]);'''

hooks_new = '''  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cjData, setCjData] = useState<{images: string[], htmlDescription: string, video: string | null} | null>(null);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', decodeURIComponent(id)).single().then(async ({data, error}) => {
      if (error) console.error(error);
      setProduct(data);
      setLoading(false);
      
      // Fetch rich supplier data in background
      if (data && data.id) {
         try {
           const res = await fetch(`/api/cj/product?sku=${data.id}`);
           const cj = await res.json();
           if (!cj.error) setCjData(cj);
         } catch (e) {}
      }
    });
  }, [id]);'''

text = text.replace(hooks_old, hooks_new)

# 2. Inject Image Gallery below the description
desc_old = '''<p style={{ color: '#52453e', fontSize: '1.08rem', marginTop: '1rem', lineHeight: 1.6 }}>{product.short || product.description}</p>'''

desc_new = '''<p style={{ color: '#52453e', fontSize: '1.08rem', marginTop: '1rem', lineHeight: 1.6 }}>{product.short || product.description}</p>
            
            {cjData && cjData.images && cjData.images.length > 1 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Supplier Gallery</h3>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  {cjData.images.map((img, i) => (
                    <img key={i} src={img} alt="Product detail" style={{ height: '120px', width: '120px', objectFit: 'cover', borderRadius: '1rem', border: '1px solid #ebebeb' }} />
                  ))}
                </div>
              </div>
            )}
            
            {cjData && cjData.htmlDescription && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid #ebebeb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Supplier Details</h3>
                <div className="supplier-desc" dangerouslySetInnerHTML={{ __html: cjData.htmlDescription }} style={{ fontSize: '0.9rem', color: '#52453e', lineHeight: 1.6, overflow: 'hidden' }} />
              </div>
            )}'''

text = text.replace(desc_old, desc_new)

with open('src/app/product/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
