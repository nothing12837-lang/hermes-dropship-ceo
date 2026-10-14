with open('src/components/ui/CartDrawer.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
match = re.search(r'<Link href="/checkout".*?</Link>', text, re.DOTALL)
if match:
    old_text = match.group(0)

    new_btn = '''<motion.button
                onClick={handleCheckout}
                disabled={loadingCheckout}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
                  color: 'white',
                  padding: '1.15rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: loadingCheckout ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(255,107,53,0.3)',
                  opacity: loadingCheckout ? 0.7 : 1,
                }}
              >
                {loadingCheckout ? 'Loading...' : `Checkout — $${totalPrice.toFixed(2)}`}
              </motion.button>'''

    text = text.replace(old_text, new_btn)

    with open('src/components/ui/CartDrawer.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced checkout button")
else:
    print("Could not find checkout button")
