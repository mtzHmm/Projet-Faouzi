const database = require('./config/database');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    await database.initialize();
    
    console.log('🔍 Testing login credentials...');
    
    // Test client credentials
    const clientResult = await database.query(
      'SELECT id_client as id, nom as name, email, mot_de_passe FROM client WHERE email = $1',
      ['client@test.com']
    );
    
    if (clientResult.rows.length > 0) {
      const client = clientResult.rows[0];
      console.log('👤 Client found:', { id: client.id, name: client.name, email: client.email });
      
      const isValidPassword = await bcrypt.compare('client123', client.mot_de_passe);
      console.log('🔒 Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Password hash mismatch. Let me check the hash...');
        console.log('Stored hash:', client.mot_de_passe);
        
        // Create a new hash to verify bcrypt is working
        const testHash = await bcrypt.hash('client123', 10);
        const testVerify = await bcrypt.compare('client123', testHash);
        console.log('🧪 Test hash verification:', testVerify);
      }
    } else {
      console.log('❌ Client not found in database');
    }
    
    // Test provider credentials
    const providerResult = await database.query(
      'SELECT id_magazin as id, nom as name, email, mot_de_passe FROM magasin WHERE email = $1',
      ['provider@test.com']
    );
    
    if (providerResult.rows.length > 0) {
      const provider = providerResult.rows[0];
      console.log('🏪 Provider found:', { id: provider.id, name: provider.name, email: provider.email });
      
      const isValidPassword = await bcrypt.compare('provider123', provider.mot_de_passe);
      console.log('🔒 Password valid:', isValidPassword);
    } else {
      console.log('❌ Provider not found in database');
    }
    
    // Test delivery credentials
    const deliveryResult = await database.query(
      'SELECT id_liv as id, nom as name, email, mot_de_passe FROM livreur WHERE email = $1',
      ['delivery@test.com']
    );
    
    if (deliveryResult.rows.length > 0) {
      const delivery = deliveryResult.rows[0];
      console.log('🚚 Delivery found:', { id: delivery.id, name: delivery.name, email: delivery.email });
      
      const isValidPassword = await bcrypt.compare('delivery123', delivery.mot_de_passe);
      console.log('🔒 Password valid:', isValidPassword);
    } else {
      console.log('❌ Delivery not found in database');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await database.close();
  }
}

testLogin()
  .then(() => {
    console.log('✅ Login test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });