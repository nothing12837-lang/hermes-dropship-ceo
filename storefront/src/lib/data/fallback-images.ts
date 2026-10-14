/**
 * Curated image fallbacks for catalog items when image_url is missing.
 * Direct authentic images from Meesho CDN.
 */

export const FALLBACK_IMAGES: Record<string, string> = {
  'meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base':
    'https://images.meesho.com/images/products/1038078401/hha6k_512.jpg',
  'meesho-water-sensor-led-diyas-pack-of-12':
    'https://images.meesho.com/images/products/431985757/t7ur4_512.jpg',
  'meesho-heavy-duty-welcome-textured-mesh-door-mat':
    'https://images.meesho.com/images/products/1047084829/kradx_512.jpg',
  'meesho-galaxy-star-astronaut-projector-night-lamp':
    'https://images.meesho.com/images/products/759223858/29bl5_512.jpg',
  'meesho-acrylic-led-glow-message-note-board':
    'https://images.meesho.com/images/products/596541532/x9tqj_512.jpg',
  'meesho-crystal-diamond-touch-led-table-lamp':
    'https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg',
  'meesho-ultrasonic-flame-mist-aroma-diffuser':
    'https://images.meesho.com/images/products/984668048/khohq_512.jpg',
  'meesho-3in1-foldable-magnetic-wireless-charging-pad':
    'https://images.meesho.com/images/products/614873040/qmb1a_512.jpg',
  'meesho-luxury-travel-jewelry-organizer-box':
    'https://images.meesho.com/images/products/896906604/tw2yq_512.jpg',
  'meesho-electric-mini-wireless-garlic-chopper':
    'https://images.meesho.com/images/products/1001131290/b8mad_512.jpg',
};

/** DB image first, curated fallback second, undefined last. */
export function resolveProductImage(id: string, imageUrl?: string | null): string | undefined {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return FALLBACK_IMAGES[id];
}
