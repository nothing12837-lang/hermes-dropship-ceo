path = 'src/components/ui/Navbar.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

if 'import { supabase }' not in text:
    # Add imports
    text = text.replace("import { useWishlist } from '@/lib/store/wishlist';", "import { useWishlist } from '@/lib/store/wishlist';\nimport { supabase } from '@/lib/supabase-client';")

    # Add state
    text = text.replace("const [mobileMenu, setMobileMenu] = useState(false);", "const [mobileMenu, setMobileMenu] = useState(false);\n  const [user, setUser] = useState<any>(null);\n  useEffect(() => {\n    supabase.auth.getSession().then(({ data: { session } }) => {\n      setUser(session?.user ?? null);\n    });\n    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {\n      setUser(session?.user ?? null);\n    });\n    return () => subscription.unsubscribe();\n  }, []);")

    # Add Profile/Login Link
    search = '''<Link
            href="/wishlist"'''
    replace = '''{user ? (
            <Link href="/profile" aria-label="Profile" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 107, 53, 0.05)', color: '#ff6b35', borderRadius: '50%', textDecoration: 'none', fontSize: '1.2rem' }}>
               👤
            </Link>
          ) : (
            <Link href="/login" aria-label="Login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ff6b35', color: '#fff', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 800, textDecoration: 'none', letterSpacing: '-0.02em' }}>
              Log in
            </Link>
          )}
          <Link
            href="/wishlist"'''
    text = text.replace(search, replace)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
