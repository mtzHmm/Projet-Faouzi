const axios = require('axios');

async function testRegistration() {
  try {
    const userData = {
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User', 
      email: 'test@example.com',
      password: 'password123',
      role: 'client',
      phone: '1234567890',
      address: '123 Test Street'
    };

    console.log('🧪 Testing user registration...');
    console.log('📤 Sending data:', userData);

    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registration successful!');
    console.log('📥 Response:', response.data);

  } catch (error) {
    console.error('❌ Registration failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();