const https = require('https');
const http = require('http');

const postData = JSON.stringify({
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User', 
  email: 'test@example.com',
  password: 'password123',
  role: 'client',
  phone: '1234567890',
  address: '123 Test Street'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing user registration...');
console.log('📤 Sending data:', JSON.parse(postData));

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Response status:', res.statusCode);
    console.log('📥 Response data:', data);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed!');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();