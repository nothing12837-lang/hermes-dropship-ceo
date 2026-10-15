/**
 * Curated image fallbacks for catalog items when image_url is missing.
 * 100% Rare Ember Qikink Print-on-Demand Collection.
 */

export const FALLBACK_IMAGES: Record<string, string> = {
  "rareember-oversized-streetwear-tee-obsidian": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
  "rareember-oversized-streetwear-tee-offwhite": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
  "rareember-heavyweight-fleece-hoodie-onyx": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
  "rareember-essential-crewneck-sweatshirt-heather": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
  "rareember-acid-wash-vintage-oversized-tee": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
  "rareember-supima-luxury-minimalist-tee": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
  "rareember-heavyweight-zip-up-hoodie-bone": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
  "rareember-streetwear-heavyweight-cargo-joggers": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80",
  "rareember-premium-matty-polo-tshirt": "https://images.unsplash.com/photo-1625910513413-7a918a38b603?auto=format&fit=crop&w=1000&q=80",
  "rareember-sleeveless-athletic-tank-top": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
  "rareember-womens-cropped-fleece-hoodie": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
  "rareember-womens-boxy-heavyweight-crop-tee": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
  "rareember-matte-black-ceramic-coffee-mug": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
  "rareember-thermal-insulated-travel-tumbler-straw": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80",
  "rareember-frosted-glass-sipper-bamboo-lid": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80",
  "rareember-magic-thermochromic-ceramic-mug": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
  "rareember-stainless-sports-insulated-flask": "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80",
  "rareember-extended-desk-mat-gaming-mousepad": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=1000&q=80",
  "rareember-compact-microfiber-desk-mousepad": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80",
  "rareember-shockproof-matte-iphone-case": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1000&q=80",
  "rareember-padded-creator-laptop-sleeve": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
  "rareember-heavyweight-canvas-tote-bag": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
  "rareember-hardbound-minimalist-dot-journal": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
  "rareember-wooden-framed-streetwear-art-poster": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
  "rareember-waterproof-vinyl-sticker-pack": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1000&q=80"
};

/** DB image first, curated fallback second, undefined last. */
export function resolveProductImage(id: string, imageUrl?: string | null): string | undefined {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return FALLBACK_IMAGES[id];
}
