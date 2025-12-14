// Simple test to check if pharmacie APIs are working
console.log('🧪 Testing Pharmacie APIs...');

// Test products API
fetch('http://localhost:5000/api/products?type=pharmacie')
  .then(response => response.json())
  .then(data => {
    console.log('📦 Products API Response:');
    console.log('  Status:', response.status);
    console.log('  Data:', data);
    console.log('  Products count:', data?.products?.length || 0);
  })
  .catch(error => {
    console.error('❌ Products API Error:', error);
  });

// Test categories API
fetch('http://localhost:5000/api/products/categories?type=pharmacie')
  .then(response => response.json())
  .then(data => {
    console.log('📋 Categories API Response:');
    console.log('  Status:', response.status);
    console.log('  Data:', data);
    console.log('  Categories count:', data?.categories?.length || 0);
  })
  .catch(error => {
    console.error('❌ Categories API Error:', error);
  });