// Simple test to check if frontend can reach backend
// Run this in browser console to test API connectivity

async function testBackendConnection() {
  console.log('🧪 Testing frontend -> backend connection...');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Registration endpoint
    console.log('2️⃣ Testing registration endpoint...');
    const registrationData = {
      name: 'Frontend Test',
      firstName: 'Frontend',
      lastName: 'Test',
      email: 'frontend.test@example.com',
      password: 'testpass123',
      role: 'client',
      phone: '1111111111',
      address: 'Frontend Test Address'
    };
    
    const regResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });
    
    const regData = await regResponse.json();
    console.log('✅ Registration test:', regData);
    
    if (regResponse.ok) {
      console.log('🎉 Frontend can successfully connect to backend!');
    } else {
      console.log('❌ Registration failed:', regData);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('💡 Make sure backend server is running on http://localhost:5000');
  }
}

// Call the test function
testBackendConnection();