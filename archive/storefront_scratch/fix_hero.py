import re

with open('src/app/product/[id]/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_emoji_hero = """          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', fontSize: 'clamp(7rem,16vw,11rem)', position: 'relative' }}>
            <motion.span animate={{ y: [0, -14, 0], rotate: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
              {product.emoji}
            </motion.span>"""

new_image_hero = """          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', fontSize: 'clamp(7rem,16vw,11rem)', position: 'relative' }}>
            {product.image_url ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  backgroundImage: `url(${product.image_url})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                }}
              />
            ) : (
              <motion.span animate={{ y: [0, -14, 0], rotate: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                {product.emoji}
              </motion.span>
            )}"""

text = text.replace(old_emoji_hero, new_image_hero)
text = text.replace('background: product.gradient', 'background: product.gradient || "linear-gradient(135deg, #FFF0D4, #FFC300)"')

with open('src/app/product/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
