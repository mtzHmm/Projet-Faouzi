const http = require('http');

function testProductsApi() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products?store_id=2',  // Assuming store_id 2 has the soura product
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('API Response Status:', res.statusCode);
        console.log('Number of products:', response.products?.length || 0);
        
        if (response.products) {
          response.products.forEach(product => {
            console.log(`Product: ${product.name}`);
            console.log(`  Image: ${product.image || 'No image'}`);
            console.log('---');
          });
        }
      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request failed:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  });

  req.end();
}

console.log('Testing Products API...');
testProductsApi();