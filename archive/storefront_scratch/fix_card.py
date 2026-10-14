import re

with open('src/components/ui/ProductCard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_emoji = """          <motion.span
            animate={isHovered ? { rotate: -15, scale: 1.3, y: -8 } : { rotate: 0, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            style={{ fontSize: '4.5rem', display: 'inline-block', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))' }}
          >
            {emoji}
          </motion.span>"""

new_img = """          {imageUrl ? (
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: isHovered ? 'brightness(1.05)' : 'brightness(1)',
                transition: 'filter 0.3s'
              }}
            />
          ) : (
            <motion.span
              animate={isHovered ? { rotate: -15, scale: 1.3, y: -8 } : { rotate: 0, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              style={{ fontSize: '4.5rem', display: 'inline-block', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))' }}
            >
              {emoji}
            </motion.span>
          )}"""

text = text.replace(old_emoji, new_img)

with open('src/components/ui/ProductCard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
