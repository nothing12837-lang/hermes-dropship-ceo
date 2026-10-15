const https = require('https');

function checkURL(url, name) {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`\n=== Checking ${name} (${url}) ===`);
      console.log('Status code:', res.statusCode);
      const titleMatch = data.match(/<title>([^<]+)<\/title>/);
      console.log('Title:', titleMatch ? titleMatch[1] : 'None');

      // Check S3 mockups
      const rawS3 = (data.match(/qikink-stores\.s3\.ap-south-1\.amazonaws\.com/gi) || []).length;
      console.log('Qikink S3 occurrences (raw/encoded):', rawS3);

      const ogImage = data.match(/property="og:image"[^>]+content="([^"]+)"/);
      console.log('OG Image:', ogImage ? ogImage[1] : 'None');
    });
  }).on('error', console.error);
}

checkURL('https://www.rareember.shop', 'Homepage');
checkURL('https://www.rareember.shop/product/qikink-hoodies-unisex-acid-wash-hoodie-uh62', 'PDP: Acid Wash Hoodie UH62');
checkURL('https://www.rareember.shop/product/qikink-hoodies-varsity-jacket-uj31', 'PDP: Varsity Jacket UJ31');
checkURL('https://www.rareember.shop/product/qikink-bottomwear-terry-shorts-mt45', 'PDP: Terry Shorts MT45');
checkURL('https://www.rareember.shop/product/qikink-headwear-bucket-hat-bh35', 'PDP: Bucket Hat BH35');
