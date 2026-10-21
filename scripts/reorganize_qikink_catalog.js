const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync('C:/Users/ajay kumar/Downloads/qikink_products_full.json', 'utf8'));

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const printNames = {
  'tech_red_machine_cutout': 'Red Mecha Graphic',
  'premium_chrome_bengaluru': 'Chrome Bengaluru Cyber Drop',
  'not_today_cutout': 'Not Today 260 GSM Terry',
  'Designer(8)': 'Tokyo Street Graphic',
  'Designer': 'Cyber Sublimation Jersey',
  'print_dilse_delhi_cutout': 'Dil Se Delhi Luxury Supima',
  'namaste_hustle_cutout': 'Namaste Hustle Graphic',
  'Designer(6)': 'Heavyweight Studio Graphic',
  'Designer(5)': 'Urban Retro Graphic',
  'Designer(3)_1': 'Neon Dimension Graphic',
  'Designer(2)': 'Apex Athletic Sublimation',
  'Designer(1)': 'Matrix Sublimation Mesh',
  'Designer(7)': 'Acid Street Graphic',
  'eng_homebody_cutout': 'Homebody Club Minimalist',
  'bright_color_happy_cutout': 'Prism Color Stretch Graphic',
  'flameicon_1': 'Flame Embroidered Icon',
  'motiv_normal_soft_strong_cutout': 'Soft & Strong Typography',
  'bright_days_cutout': 'Bright Days Y2K Graphic',
  'bright_good_vibes_cutout': 'Good Vibes Athletic Graphic',
  'bright_vertical_hello_sunshine_cutout': 'Hello Sunshine Graphic',
  'bright_vertical_9_16_cutout': 'Aura Sunburst Graphic',
  'bright_happy_place_cutout': 'Good Energy Graphic',
  'bright_smile_more_cutout': 'Smile More Graphic',
};

function getBadgeAndTag(title, blankSku, isPrinted, printType, gender) {
  const t = title.toLowerCase();
  const b = (blankSku || '').toLowerCase();

  let badge = '100% BIO-WASHED';
  let tag = 'FLAGSHIP DROP';
  let tagBg = 'bg-orange-500/10 text-orange-600';
  let tagColor = '#FF4D24';

  if (isPrinted) {
    if (printType === 'Sublimation' || b === 'uj35' || b === 'us02' || b === 'ud15') {
      badge = 'SUBLIMATION ATHLETIC';
      tag = 'ATHLETIC JERSEY';
      tagBg = 'bg-emerald-500/10 text-emerald-600';
      tagColor = '#059669';
    } else if (printType === 'Embroidery' || b === 'uc28') {
      badge = 'EMBROIDERED ICON';
      tag = 'PREMIUM SHIRT';
      tagBg = 'bg-indigo-500/10 text-indigo-600';
      tagColor = '#4F46E5';
    } else if (gender === 'kids') {
      badge = '180 GSM COMBED';
      tag = 'KIDS GRAPHIC';
      tagBg = 'bg-cyan-500/10 text-cyan-600';
      tagColor = '#0891B2';
    } else if (gender === 'women') {
      badge = 'DTF GRAPHIC';
      tag = 'WOMEN STREETWEAR';
      tagBg = 'bg-pink-500/10 text-pink-600';
      tagColor = '#DB2777';
    } else if (t.includes('terry') || b === 'ut27') {
      badge = '260 GSM TERRY';
      tag = 'TERRY OVERSIZED';
      tagBg = 'bg-amber-500/10 text-amber-600';
      tagColor = '#D97706';
    } else if (t.includes('supima') || b === 'uc23') {
      badge = '100% SUPIMA';
      tag = 'LUXURY SUPIMA';
      tagBg = 'bg-blue-500/10 text-blue-600';
      tagColor = '#2563EB';
    } else if (t.includes('oversized') || b === 'us22' || b === 'uc22' || b === 'ur50') {
      badge = '240 GSM HEAVYWEIGHT';
      tag = 'OVERSIZED GRAPHIC';
      tagBg = 'bg-orange-500/10 text-orange-600';
      tagColor = '#FF4D24';
    } else {
      badge = 'DTF GRAPHIC';
      tag = 'MEN STREETWEAR';
      tagBg = 'bg-orange-500/10 text-orange-600';
      tagColor = '#FF4D24';
    }
  } else {
    // Blank items
    if (t.includes('acid wash') || b === 'uc61') {
      badge = 'VINTAGE HEAVYWEIGHT';
      tag = 'ACID WASH BLANK';
      tagBg = 'bg-purple-500/10 text-purple-600';
      tagColor = '#9333EA';
    } else if (t.includes('tie dye') || b === 'ut58') {
      badge = 'HAND DYED';
      tag = 'TIE DYE BLANK';
      tagBg = 'bg-amber-500/10 text-amber-600';
      tagColor = '#D97706';
    } else if (t.includes('polo') || b === 'mp25') {
      badge = '240 GSM PIQUE';
      tag = 'EXECUTIVE POLO';
      tagBg = 'bg-slate-500/10 text-slate-700';
      tagColor = '#475569';
    } else if (gender === 'women') {
      badge = 'PREMIUM BLANK';
      tag = 'WOMEN ESSENTIAL';
      tagBg = 'bg-rose-500/10 text-rose-600';
      tagColor = '#E11D48';
    } else {
      badge = 'PREMIUM BLANK';
      tag = 'ESSENTIAL BLANK';
      tagBg = 'bg-neutral-500/10 text-neutral-600';
      tagColor = '#525252';
    }
  }

  return { badge, tag, tagBg, tagColor };
}

function getDetails(title, blankSku, isPrinted) {
  const t = title.toLowerCase();
  const b = (blankSku || '').toLowerCase();
  if (t.includes('jersey') || b === 'uj35' || b === 'us02' || b === 'ud15') {
    return [
      '220 GSM Polyester Aeroknit Breathable Fabric',
      'Fade-Proof All-Over Sublimation Print Detailing',
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
    isPrinted ? 'High-Definition Fade-Proof OEKO-TEX® Certified DTF Print' : 'Pure Minimalist Garment Blank (Zero Graphics)',
    'Dispatched direct from Tirupur manufacturing hub',
    '100% Doorstep 7-Day Free Replacement Guarantee',
    'Cash on Delivery & 1-Click Instant UPI Pan-India'
  ];
}

const variantsMap = {};

const processedProducts = raw.map((p, idx) => {
  const baseTitle = p.title.replace(/\|\s*[A-Z0-9-]{2,10}/gi, '').trim();
  const d = p.designs && p.designs[0];
  const isPrinted = Boolean(d && d.design_code);
  const designCode = d ? d.design_code : null;
  const printName = designCode ? (printNames[designCode] || 'Streetwear Graphic') : null;

  const g = (p.gender_name || '').toLowerCase();
  const t = baseTitle.toLowerCase();
  const isKid = g === 'boy' || g === 'girl' || t.includes('boy') || t.includes('girl');
  const isWoman = !isKid && (g === 'female' || t.includes('women') || t.includes('crop') || t.includes('baby tee') || t.includes('dress') || t.includes('maternity'));
  const isMan = !isKid && !isWoman;

  const gender = isKid ? 'kids' : isWoman ? 'women' : 'men';
  const category = isKid ? 'kids' : isWoman ? 'womens' : 'mens';

  let displayTitle = baseTitle;
  if (isPrinted && printName) {
    displayTitle = `${baseTitle} — ${printName}`;
  } else if (!isPrinted) {
    if (t.includes('acid wash')) displayTitle = `${baseTitle} — Vintage Heavyweight Blank`;
    else if (t.includes('tie dye')) displayTitle = `${baseTitle} — Hand-Dyed Artisan Blank`;
    else if (t.includes('polo')) displayTitle = `${baseTitle} — 240 GSM Pique Blank`;
    else displayTitle = `${baseTitle} — Essential Blank`;
  }

  const slug = `${slugify(baseTitle)}-${p.client_product_id}`;
  const id = `qikink-${p.client_product_id}-${slugify(baseTitle)}`;

  const priceMatch = (p.selling_price || '').match(/\d+(\.\d+)?/);
  const price = priceMatch ? Math.round(parseFloat(priceMatch[0])) : 499;
  const compareAtPrice = Math.round(price * 1.55);

  const { badge, tag, tagBg, tagColor } = getBadgeAndTag(baseTitle, p.blank_sku, isPrinted, p.print_type_name, gender);
  const details = getDetails(baseTitle, p.blank_sku, isPrinted);

  // Map each color to its corresponding variant mockup image
  const colorImageMap = {};
  p.variants.forEach(v => {
    if (v.color && v.variant_image && !colorImageMap[v.color]) {
      colorImageMap[v.color] = v.variant_image;
    }
    // Store in backend variants map
    const key = `${p.client_product_id}_${(v.color || '').toLowerCase()}_${(v.size || '').toLowerCase()}`;
    variantsMap[key] = {
      product_id: p.client_product_id,
      variant_sku: v.variant_sku,
      product_sku: v.product_sku,
      cost_price: v.cost_price,
      selling_price: v.selling_price || price,
      color: v.color,
      size: v.size,
      variant_image: v.variant_image
    };
  });

  // Unique gallery images (ordered by colors first, up to 6 unique images)
  const images = [];
  p.colors.forEach(c => {
    if (colorImageMap[c] && !images.includes(colorImageMap[c]) && images.length < 6) {
      images.push(colorImageMap[c]);
    }
  });
  // Add back images if available
  p.variants.forEach(v => {
    if (v.variant_images) {
      Object.values(v.variant_images).forEach(img => {
        if (img && !images.includes(img) && images.length < 6) {
          images.push(img);
        }
      });
    }
  });
  if (images.length === 0 && p.default_mockup_image) {
    images.push(p.default_mockup_image);
  }

  const primaryImage = images[0] || p.default_mockup_image;

  const b = (p.blank_sku || '').toLowerCase();
  // Sorting rank: Men's Printed (1), Women's Printed (2), Kids' Printed (3), Men's Blanks (4), Women's Blanks (5)
  let sortGroup = 4;
  let subOrder = 10;
  if (isMan && isPrinted) {
    sortGroup = 1;
    // Boost flagship oversized pieces and mecha graphic
    if (t.includes('oversized standard') || designCode === 'premium_chrome_bengaluru') subOrder = 1;
    else if (t.includes('full sleeve') || designCode === 'tech_red_machine_cutout') subOrder = 2;
    else if (t.includes('terry') || designCode === 'not_today_cutout') subOrder = 3;
    else if (t.includes('oversized jersey') || b === 'uj35') subOrder = 4;
    else if (t.includes('oversized classic') || designCode === 'Designer(8)') subOrder = 5;
    else if (t.includes('supima') || designCode === 'print_dilse_delhi_cutout') subOrder = 6;
    else if (t.includes('raglan') || designCode === 'namaste_hustle_cutout') subOrder = 7;
    else if (t.includes('classic crew') && designCode === 'Designer(6)') subOrder = 8;
    else if (t.includes('ringer') || designCode === 'Designer(5)') subOrder = 9;
  } else if (isWoman && isPrinted) {
    sortGroup = 2;
  } else if (isKid && isPrinted) {
    sortGroup = 3;
  } else if (isMan && !isPrinted) {
    sortGroup = 4;
  } else if (isWoman && !isPrinted) {
    sortGroup = 5;
  }

  const short = isPrinted
    ? `Premium ${baseTitle} featuring our ${printName} fade-proof artwork. Crafted in Tirupur from 100% bio-washed combed yarns with Pan-India express delivery.`
    : `Pure essential ${baseTitle} crafted in Tirupur from 100% bio-washed combed cotton. Minimalist silhouette with clean reinforced stitching.`;

  const story = isPrinted
    ? `Designed for everyday streetwear rotation, the ${displayTitle} blends Tirupur domestic textile excellence with vibrant, fade-proof graphic detailing. Engineered for breathability, softness, and durability wash after wash.`
    : `A staple essential for versatile layering, the ${displayTitle} features pre-shrunk combed yarns, reinforced collar ribbing, and relaxed comfort.`;

  return {
    sortGroup,
    subOrder,
    id,
    slug,
    title: displayTitle,
    baseTitle,
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
    category,
    gender,
    is_printed: isPrinted,
    design_code: designCode,
    print_design_name: printName,
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
    is_trending: isPrinted && isMan,
    gradient: 'linear-gradient(135deg, rgba(255,77,36,0.12), rgba(232,36,75,0.08))'
  };
});

// Sort with Men's Printed first, followed by Women's Printed, Kids' Printed, then Blanks
processedProducts.sort((a, b) => {
  if (a.sortGroup !== b.sortGroup) return a.sortGroup - b.sortGroup;
  return a.subOrder - b.subOrder;
});

// Strip internal sort fields
const finalProducts = processedProducts.map(({ sortGroup, subOrder, ...p }) => p);

console.log('Final products count:', finalProducts.length);
console.log('Group counts:');
console.log('  1. Men Printed:', finalProducts.filter(p => p.gender === 'men' && p.is_printed).length);
console.log('  2. Women Printed:', finalProducts.filter(p => p.gender === 'women' && p.is_printed).length);
console.log('  3. Kids Printed:', finalProducts.filter(p => p.gender === 'kids' && p.is_printed).length);
console.log('  4. Men Blanks:', finalProducts.filter(p => p.gender === 'men' && !p.is_printed).length);
console.log('  5. Women Blanks:', finalProducts.filter(p => p.gender === 'women' && !p.is_printed).length);

const outCatalogPath = path.resolve(__dirname, '../storefront/src/lib/data/qikink-products.json');
fs.writeFileSync(outCatalogPath, JSON.stringify(finalProducts, null, 2), 'utf8');
console.log('Saved optimized products JSON to:', outCatalogPath);
const stats = fs.statSync(outCatalogPath);
console.log('File size:', (stats.size / 1024).toFixed(1), 'KB (was 654 KB!)');

const outVariantsMapPath = path.resolve(__dirname, '../storefront/src/lib/data/qikink-variants-map.json');
fs.writeFileSync(outVariantsMapPath, JSON.stringify(variantsMap, null, 2), 'utf8');
console.log('Saved backend variants map to:', outVariantsMapPath);
console.log('Total variants mapped:', Object.keys(variantsMap).length);
