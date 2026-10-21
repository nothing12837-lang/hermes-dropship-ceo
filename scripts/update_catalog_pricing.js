const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'storefront', 'src', 'lib', 'data', 'qikink-products.json');
const variantsPath = path.join(__dirname, '..', 'storefront', 'src', 'lib', 'data', 'qikink-variants-map.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const variantsMap = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));

// Target pricing rules based on 40%+ margin unit economics
const PRICING_RULES = [
  // 1. Unisex Oversized Jersey (UJ35)
  { match: (p) => p.id.includes('oversized-jersey') || p.title.toLowerCase().includes('oversized jersey'), price: 679, mrp: 1299 },
  { match: (p) => p.id.includes('jersey-t-shirt'), price: 649, mrp: 1199 },

  // 2. Heavyweight & Terry Oversized
  { match: (p) => p.id.includes('terry-oversized-tee'), price: 699, mrp: 1299 },
  { match: (p) => p.id.includes('oversized-shirt'), price: 699, mrp: 1299 },
  { match: (p) => p.id.includes('tie-dye-oversized'), price: 699, mrp: 1299 },
  { match: (p) => p.id.includes('acid-washed-oversized'), price: 679, mrp: 1299 },
  { match: (p) => p.id.includes('oversized-standard'), price: 679, mrp: 1299 },
  { match: (p) => p.id.includes('oversized-classic'), price: 649, mrp: 1199 },
  { match: (p) => p.id.includes('oversized-raglan'), price: 649, mrp: 1199 },

  // 3. Full Sleeve & Supima
  { match: (p) => p.id.includes('full-sleeve'), price: 649, mrp: 1199 },
  { match: (p) => p.id.includes('supima'), price: 649, mrp: 1199 },
  { match: (p) => p.id.includes('polo'), price: 649, mrp: 1099 },

  // 4. Graphic Tees & Standard Crew
  { match: (p) => p.id.includes('standard-crew') || (p.id.includes('classic-crew') && p.is_printed), price: 599, mrp: 999 },
  { match: (p) => p.id.includes('ringer-t-shirt'), price: 599, mrp: 999 },
  { match: (p) => p.id.includes('v-neck-t-shirt'), price: 599, mrp: 999 },
  { match: (p) => p.id.includes('stretch-t-shirt'), price: 599, mrp: 999 },
  { match: (p) => p.id.includes('raglan-t-shirt') && p.is_printed, price: 599, mrp: 999 },
  { match: (p) => p.id.includes('sleeveless'), price: 599, mrp: 999 },

  // 5. Women's Graphic & Fashion
  { match: (p) => p.id.includes('baby-tee'), price: 599, mrp: 999 },
  { match: (p) => p.id.includes('womens-tank-top'), price: 599, mrp: 999 },
  { match: (p) => p.id.includes('t-shirt-dress') || p.id.includes('maternity-dress'), price: 649, mrp: 1099 },
  { match: (p) => p.id.includes('crop-tank'), price: 549, mrp: 899 },
  { match: (p) => p.id.includes('crop-top'), price: 499, mrp: 899 },
  { match: (p) => p.id.includes('womens-classic-t-shirt'), price: 499, mrp: 899 },

  // 6. Accessories & Gear (if created/added)
  { match: (p) => p.id.includes('desk-mat') || p.id.includes('gaming-pad'), price: 679, mrp: 1299 },
  { match: (p) => p.id.includes('cap') || p.id.includes('ottoman'), price: 599, mrp: 999 },
  { match: (p) => p.id.includes('stole') || p.id.includes('aop-stole'), price: 649, mrp: 1099 },

  // 6. Blanks (Classic Crew Blank)
  { match: (p) => p.id.includes('classic-crew') && !p.is_printed, price: 549, mrp: 899 },

  // 7. Kids & Basic Tees (Eliminating loss, ensuring 40%+ margin)
  { match: (p) => p.id.includes('basic-t-shirt'), price: 499, mrp: 899 },
  { match: (p) => p.id.includes('boys-crew') || p.id.includes('girls-crew'), price: 499, mrp: 899 },
  { match: (p) => p.id.includes('dryfit'), price: 499, mrp: 899 },
];

console.log('=== Updating Catalog Pricing to 40%+ Profit Margins ===\n');

products.forEach((p) => {
  const rule = PRICING_RULES.find((r) => r.match(p));
  if (rule) {
    p.price = rule.price;
    p.price_inr = rule.price;
    p.compareAtPrice = rule.mrp;
    p.compare_at_price = rule.mrp;
    p.old_price = rule.mrp;
  }
});

// Update variants map to reflect new selling prices
let variantCount = 0;
for (const [key, v] of Object.entries(variantsMap)) {
  const prod = products.find((p) => p.qikinkClientProductId === v.product_id || p.id.includes(v.product_id));
  if (prod) {
    v.selling_price = prod.price;
    variantCount++;
  }
}

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(variantsPath, JSON.stringify(variantsMap, null, 2), 'utf8');

console.log(`Successfully updated ${products.length} products and ${variantCount} variants!`);
