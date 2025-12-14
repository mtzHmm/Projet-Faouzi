// Simple test to create a product via API
const FormData = require('form-data');
const http = require('http');
const fs = require('fs');

async function testCreateProduct() {
  try {
    const form = new FormData();
    form.append('name', 'Test Product API');
    form.append('description', 'Test product created via API');
    form.append('price', '12.99');
    form.append('category_id', '2');
    form.append('store_id', '10');
    form.append('prescription', 'false');

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Headers:', res.headers);
        
        if (res.statusCode === 201) {
          const response = JSON.parse(data);
          console.log('✅ Product created successfully:', response);
        } else {
          console.log('❌ Error response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
    });

    form.pipe(req);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('Testing product creation API...');
testCreateProduct();