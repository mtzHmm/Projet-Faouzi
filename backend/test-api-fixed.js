const http = require('http');

function testAPI() {
  console.log('Testing API endpoint: /api/products?store_id=10');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products?store_id=10',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n✅ API Response received');
        console.log('Status Code:', res.statusCode);
        console.log('Number of products:', response.products?.length || 0);
        
        if (response.products && response.products.length > 0) {
          console.log('\n📦 Products:');
          response.products.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name}`);
            console.log(`   ID: ${product.id}`);
            console.log(`   Price: ${product.price} DT`);
            console.log(`   Image: ${product.image || 'NO IMAGE'}`);
            console.log(`   Category: ${product.category_name || 'No category'}`);
            
            if (product.image) {
              const isCloudinary = product.image.includes('cloudinary');
              const isLocal = product.image.startsWith('/images/');
              console.log(`   Image Type: ${isCloudinary ? 'Cloudinary ✅' : isLocal ? 'Local Path ❌' : 'Other'}`);
            }
          });
        } else {
          console.log('\n❌ No products returned');
        }
      } catch (error) {
        console.error('❌ Error parsing JSON response:', error.message);
        console.log('Raw response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.end();
}

// Wait a moment for server to be ready, then test
setTimeout(testAPI, 1000);