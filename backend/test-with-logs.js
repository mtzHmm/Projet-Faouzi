const http = require('http');

const postData = JSON.stringify({
  name: 'Alice Smith',
  firstName: 'Alice',
  lastName: 'Smith', 
  email: 'alice.smith@example.com',
  password: 'password123',
  role: 'client',
  phone: '5551234567',
  address: '789 Oak Avenue, Springfield'
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

console.log('🧪 Testing registration with detailed logging...');
console.log('📤 Sending data:', JSON.parse(postData));

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Response status:', res.statusCode);
    console.log('📥 Response headers:', res.headers);
    console.log('📥 Response data:', data);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Registration successful!');
      const responseData = JSON.parse(data);
      console.log('👤 Created user ID:', responseData.user.id);
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