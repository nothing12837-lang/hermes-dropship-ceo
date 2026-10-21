const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('C:/Users/ajay kumar/Downloads/qikink_products_full.json', 'utf8'));

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getTagAndBadge(title, blankSku) {
  const t = title.toLowerCase();
  const b = (blankSku || '').toLowerCase();
  if (t.includes('jersey') || b === 'uj35' || b === 'us02') {
    return { tag: 'CREATOR JERSEY', tagBg: 'bg-emerald-500/10 text-emerald-600', tagColor: '#059669', badge: 'AEROKNIT MESH' };
  }
  if (t.includes('acid wash') || b === 'uc61') {
    return { tag: 'ACID WASH VINTAGE', tagBg: 'bg-purple-500/10 text-purple-600', tagColor: '#9333EA', badge: 'HEAVY VINTAGE' };
  }
  if (t.includes('tie dye') || b === 'ut58') {
    return { tag: 'TIE & DYE ARTISAN', tagBg: 'bg-amber-500/10 text-amber-600', tagColor: '#D97706', badge: 'HAND DYED' };
  }
  if (t.includes('terry') || b === 'ut27') {
    return { tag: 'FRENCH TERRY BOX', tagBg: 'bg-orange-500/10 text-orange-600', tagColor: '#EA580C', badge: '260 GSM TERRY' };
  }
  if (t.includes('oversized') || b === 'uc22' || b === 'us22' || b === 'ur50' || b === 'uc28') {
    return { tag: 'DROP-SHOULDER OVERSIZED', tagBg: 'bg-orange-500/10 text-orange-600', tagColor: '#FF4D24', badge: '240 GSM HEAVYWEIGHT' };
  }
  if (t.includes('supima') || b === 'uc23') {
    return { tag: 'LUXURY SUPIMA', tagBg: 'bg-blue-500/10 text-blue-600', tagColor: '#2563EB', badge: '100% SUPIMA' };
  }
  if (t.includes('crop') || t.includes('baby tee') || b.includes('fc') || b.includes('ft')) {
    return { tag: 'WOMEN STREETWEAR', tagBg: 'bg-pink-500/10 text-pink-600', tagColor: '#DB2777', badge: 'COMPRESSION STRETCH' };
  }
  if (t.includes('dress') || b === 'fc43' || b === 'fm44') {
    return { tag: 'CASUAL DRESS', tagBg: 'bg-rose-500/10 text-rose-600', tagColor: '#E11D48', badge: 'COMFORT FIT' };
  }
  if (t.includes('girl') || t.includes('boy')) {
    return { tag: 'KIDS STREETWEAR', tagBg: 'bg-cyan-500/10 text-cyan-600', tagColor: '#0891B2', badge: '180 GSM COMBED' };
  }
  if (t.includes('polo') || b === 'mp25') {
    return { tag: 'EXECUTIVE POLO', tagBg: 'bg-indigo-500/10 text-indigo-600', tagColor: '#4F46E5', badge: '240 GSM PIQUE' };
  }
  if (t.includes('full sleeve') || b === 'mrnfs') {
    return { tag: 'FULL SLEEVE STREET', tagBg: 'bg-teal-500/10 text-teal-600', tagColor: '#0D9488', badge: '240 GSM COMBED' };
  }
  return { tag: 'FLAGSHIP DROP', tagBg: 'bg-orange-500/10 text-orange-600', tagColor: '#FF4D24', badge: '100% BIO-WASHED' };
}

function getDetails(title, blankSku, colors) {
  const t = title.toLowerCase();
  const b = (blankSku || '').toLowerCase();
  if (t.includes('jersey') || b === 'uj35' || b === 'us02') {
    return [
      '220 GSM Polyester Aeroknit Breathable Fabric',
      'Fade-Proof All-Over Sublimation / DTF Print',
      'Athletic 90s Boxy Drape with Ergonomic Stitching',
      'Dispatched direct from Tirupur manufacturing hub',
      '100% Doorstep 7-Day Free Replacement Guarantee',
      'Cash on Delivery & 1-Click Instant UPI Pan-India'
    ];
  }
  if (t.includes('crop') || t.includes('baby tee')) {
    return [
      '220 GSM 4-Way Stretch Poly-Spandex & Cotton Blend',
      'Anti-Chafe Comfort Seams for All-Day Wear',
      'High-Definition OEKO-TEX® Certified Artwork',
      'Dispatched direct from Tirupur manufacturing hub',
      '100% Doorstep 7-Day Free Replacement Guarantee',
      'Cash on Delivery & 1-Click Instant UPI Pan-India'
    ];
  }
  if (t.includes('girl') || t.includes('boy')) {
    return [
      '180 GSM 100% Super Combed Bio-Washed Cotton',
      'Gentle on sensitive skin with anti-chafe stitching',
      'High-Definition Fade-Proof DTF Graphics',
      'Dispatched direct from Tirupur manufacturing hub',
      '100% Doorstep 7-Day Free Replacement Guarantee',
      'Cash on Delivery & 1-Click Instant UPI Pan-India'
    ];
  }
  return [
    '240 GSM 100% Combed Bio-Washed Cotton Heavyweight Drape',
    'Pre-shrunk fabric with reinforced double-needle ribbed collar',
    'High-Definition Fade-Proof OEKO-TEX® Certified Print',
    'Dispatched direct from Tirupur manufacturing hub',
    '100% Doorstep 7-Day Free Replacement Guarantee',
    'Cash on Delivery & 1-Click Instant UPI Pan-India'
  ];
}

const transformedProducts = rawData.map((p, idx) => {
  const cleanTitle = p.title.replace(/\|\s*[A-Z0-9-]{2,10}/gi, '').trim();
  const slug = `${slugify(cleanTitle)}-${p.client_product_id}`;
  const id = `qikink-${p.client_product_id}-${slugify(cleanTitle)}`;

  // Extract selling price number
  const priceMatch = (p.selling_price || '').match(/\d+(\.\d+)?/);
  const price = priceMatch ? Math.round(parseFloat(priceMatch[0])) : 499;
  const compareAtPrice = Math.round(price * 1.55);

  const { tag, tagBg, tagColor, badge } = getTagAndBadge(cleanTitle, p.blank_sku);
  const details = getDetails(cleanTitle, p.blank_sku, p.colors);

  // Map each color to its corresponding variant mockup image
  const colorImageMap = {};
  p.variants.forEach(v => {
    if (v.color && v.variant_image && !colorImageMap[v.color]) {
      colorImageMap[v.color] = v.variant_image;
    }
  });

  // Unique gallery images (ordered by colors first, then back images)
  const images = [];
  p.colors.forEach(c => {
    if (colorImageMap[c]) images.push(colorImageMap[c]);
  });
  // Add back images if available
  p.variants.forEach(v => {
    if (v.variant_images) {
      Object.values(v.variant_images).forEach(img => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
  });
  if (images.length === 0 && p.default_mockup_image) {
    images.push(p.default_mockup_image);
  }

  const primaryImage = images[0] || p.default_mockup_image || '/products/user-oversized-jersey-64950694.jpg';

  const short = `Premium ${cleanTitle} crafted in Tirupur from high-grade bio-washed fabric. Features precision fade-proof graphics, tailored modern streetwear fit, and Pan-India express delivery.`;
  const story = `Designed for everyday comfort and durability, the ${cleanTitle} brings authentic domestic textile craftsmanship from our Tirupur workshop directly to your wardrobe. Built with pre-shrunk combed yarns and high-definition print detailing.`;

  return {
    id,
    slug,
    title: cleanTitle,
    short,
    story,
    details,
    price,
    price_inr: price,
    compareAtPrice,
    compare_at_price: compareAtPrice,
    rating: 4.8,
    reviews: 95 + (idx * 5),
    image_url: primaryImage,
    images,
    category: 'fashion',
    colors: p.colors && p.colors.length > 0 ? p.colors : ['White'],
    sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
    colorImages: colorImageMap,
    tag,
    tagBg,
    tagColor,
    badge,
    qikinkSkuPrefix: p.blank_sku,
    qikinkClientProductId: p.client_product_id,
    qikinkPrintType: p.print_type_name,
    sizeChartLink: p.size_chart_link,
    active: true,
    is_new: true,
    is_trending: idx < 10,
    gradient: 'linear-gradient(135deg, rgba(255,77,36,0.12), rgba(232,36,75,0.08))',
    variants: p.variants.map(v => ({
      product_sku: v.product_sku,
      variant_sku: v.variant_sku,
      color: v.color,
      size: v.size,
      cost_price: v.cost_price,
      selling_price: v.selling_price ? Math.round(parseFloat(v.selling_price)) : price,
      variant_image: v.variant_image
    }))
  };
});

console.log('Transformed products count:', transformedProducts.length);
const totalVariants = transformedProducts.reduce((acc, p) => acc + (p.variants ? p.variants.length : 0), 0);
console.log('Total variants count:', totalVariants);

fs.writeFileSync('C:/Users/ajay kumar/Downloads/rareember_qikink_catalog.json', JSON.stringify(transformedProducts, null, 2), 'utf8');
console.log('Saved C:/Users/ajay kumar/Downloads/rareember_qikink_catalog.json');

const targetPath = path.resolve(__dirname, '../storefront/src/lib/data/qikink-products.json');
fs.writeFileSync(targetPath, JSON.stringify(transformedProducts, null, 2), 'utf8');
console.log('Saved to', targetPath);
