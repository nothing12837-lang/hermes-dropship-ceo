const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('C:\\Users\\ajay kumar\\.gemini\\antigravity\\brain\\a1c98b0a-3d69-41de-8845-a9767413b685\\.system_generated\\steps\\60\\output.txt', 'utf8');
const jsonStart = content.indexOf('{');
const jsonEnd = content.lastIndexOf('}');
const qikinkData = JSON.parse(content.slice(jsonStart, jsonEnd + 1));

const productsPath = path.join(__dirname, '..', 'storefront', 'src', 'lib', 'data', 'qikink-products.json');
const variantsPath = path.join(__dirname, '..', 'storefront', 'src', 'lib', 'data', 'qikink-variants-map.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const variantsMap = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));

const clientProductId = '32477737';
const existingIdx = products.findIndex(p => p.qikinkClientProductId === clientProductId);

const colorImages = {};
const colors = [];
qikinkData.variants.forEach(v => {
  if (!colorImages[v.color_name]) {
    colorImages[v.color_name] = `https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/${clientProductId}/images/${v.variant_image}`;
    colors.push(v.color_name);
  }
});

const sizes = Array.from(new Set(qikinkData.variants.map(v => v.size_name)));

const primaryImage = colorImages['White'] || Object.values(colorImages)[0];
const galleryImages = Object.values(colorImages);

const newProduct = {
  id: `qikink-${clientProductId}-mens-full-sleeve-t-shirt`,
  slug: `mens-full-sleeve-t-shirt-${clientProductId}`,
  title: "Men's Full Sleeve T-Shirt — Rare Ember Signature Graphic",
  baseTitle: "Men's Full Sleeve T-Shirt",
  short: "Premium Men's Full Sleeve T-Shirt featuring our Rare Ember Signature Graphic. Crafted from 100% bio-washed combed cotton yarns with Pan-India express delivery.",
  story: "Engineered for street-ready layering. Crafted with premium 100% combed cotton yarns, bio-washed for a silky hand feel, and printed using high-definition direct-to-film (DTF) inks that never fade or crack.",
  details: [
    "Fabric: 100% Super Combed Bio-Washed Cotton",
    "Fit: Modern Tailored Full Sleeve Fit",
    "Print: High-Definition DTF (Fade-Proof & Crack-Resistant)",
    "Ribbed cuffs & double-needle hem for durability",
    "Dispatch: Dispatched from Domestic Tirupur POD Hub in 24–48 Hours",
    "Easy 7-Day Doorstep Replacement Guarantee"
  ],
  price: 659,
  price_inr: 659,
  compareAtPrice: 1199,
  compare_at_price: 1199,
  old_price: 1199,
  rating: 4.9,
  reviews: 68,
  image_url: primaryImage,
  images: galleryImages,
  category: "mens",
  gender: "men",
  is_printed: true,
  design_code: qikinkData.variants[0]?.design_sku || "rareember_transparent",
  print_design_name: "Rare Ember Signature Graphic",
  colors: colors,
  sizes: sizes,
  colorImages: colorImages,
  tag: "🔥 NEW DROP",
  tagBg: "rgba(255, 77, 36, 0.12)",
  tagColor: "#FF4D24",
  badge: "SIGNATURE DROP",
  qikinkSkuPrefix: "MRnFs",
  qikinkClientProductId: clientProductId,
  qikinkPrintType: "DTF",
  sizeChartLink: qikinkData.size_chart_link || "https://products.qikink.com/assets/admin/uploads/mockup-21/1744980516sizechart.png",
  active: true,
  is_new: true,
  is_trending: true,
  gradient: "from-amber-600 via-orange-600 to-red-600"
};

if (existingIdx >= 0) {
  products[existingIdx] = newProduct;
  console.log(`Updated existing product index ${existingIdx}`);
} else {
  // Put the new drop right at the front or top of the catalog
  products.unshift(newProduct);
  console.log(`Added new product to catalog! Total products: ${products.length}`);
}

// Add all 40 variants to variantsMap
let addedVariants = 0;
qikinkData.variants.forEach(v => {
  const colorKey = v.color_name.toLowerCase().trim();
  const sizeKey = v.size_name.toLowerCase().trim();
  const key = `${clientProductId}_${colorKey}_${sizeKey}`;
  
  variantsMap[key] = {
    product_id: clientProductId,
    variant_sku: v.variant_sku,
    product_sku: v.product_sku,
    cost_price: Number(v.updated_base_price),
    selling_price: 659,
    color: v.color_name,
    size: v.size_name,
    variant_image: `https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/${clientProductId}/images/${v.variant_image}`
  };
  addedVariants++;
});

console.log(`Added ${addedVariants} variants for product ${clientProductId}. Total variants: ${Object.keys(variantsMap).length}`);

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(variantsPath, JSON.stringify(variantsMap, null, 2), 'utf8');

console.log('✅ Successfully synced product and variants to disk!');
