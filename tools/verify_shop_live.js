const https = require('https');

function check(url) {
  https.get(url, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log(`\n=== Checking: ${url} ===`);
      console.log('Status:', res.statusCode);
      const hasCurator = data.includes("Curator's Note") || data.includes("Curator&apos;s Note");
      console.log('Curator Note present:', hasCurator);
      const hasDTF = data.includes("Compatible with DTF");
      console.log('Supplier text ("Compatible with DTF") present:', hasDTF);
      const hasMOQ = data.includes("No minimum order quantity");
      console.log('Supplier text ("No minimum order quantity") present:', hasMOQ);
      const s3Matches = data.match(/qikink-stores\.s3\.ap-south-1\.amazonaws\.com/gi) || [];
      console.log('Total S3 mockup references on page:', s3Matches.length);
    });
  }).on('error', console.error);
}

check('https://www.rareember.shop/product/qikink-t-shirts-tie-and-dye-oversized-t-shirt-ut58');
check('https://www.rareember.shop/product/qikink-bottomwear-joggers-uj29');
check('https://www.rareember.shop/product/qikink-accessories-desk-mat');
