import re

with open('src/app/product/[id]/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Erase old synchronous product logic
text = re.sub(r'const product = getProduct\(decodeURIComponent\(id\)\);\n', '', text)

# Inject hooks
hooks = '''  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', decodeURIComponent(id)).single().then(({data, error}) => {
      if (error) console.error(error);
      setProduct(data);
      setLoading(false);
    });
  }, [id]);'''

text = re.sub(r'const \{ id \} = use\(params\);\n', f'const {{ id }} = use(params);\n{hooks}\n', text)

# Update loading logic
text = re.sub(r'if \(!product\) return notFound\(\);', 'if (loading) return <div style={{paddingTop: "10rem", textAlign: "center"}}>Loading...</div>;\n  if (!product) return notFound();', text)

# Update meta
text = re.sub(r'const meta = PET_META\[product\.pet\];', 'const meta = PET_META[product?.category === "cats" ? "cat" : "dog"] || PET_META["both"];', text)

with open('src/app/product/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
