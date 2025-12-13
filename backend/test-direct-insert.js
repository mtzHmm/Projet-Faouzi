require('dotenv').config();
const bcrypt = require('bcryptjs');
const database = require('./config/database');

async function testDirectInsert() {
  try {
    console.log('🧪 Testing direct database insert...');
    
    await database.initialize();
    const db = database.getPool();
    
    // Hash password like in the API
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    console.log('💾 Attempting direct insert...');
    const result = await db.query(
      'INSERT INTO client (nom, prenom, email, mot_de_passe, tel, role, adresse_client) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      ['DirectTest', 'User', 'direct.test@example.com', hashedPassword, 1234567890, 'CLIENT', 'Direct Test Address']
    );
    
    console.log('✅ Direct insert successful:', result.rows[0]);
    
    // Verify it's actually in the database
    console.log('🔍 Verifying insert...');
    const checkResult = await db.query('SELECT * FROM client WHERE email = $1', ['direct.test@example.com']);
    console.log('Found records:', checkResult.rows.length);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Record successfully saved:', checkResult.rows[0]);
    } else {
      console.log('❌ Record not found in database!');
    }
    
    await database.close();
    
  } catch (error) {
    console.error('❌ Direct insert failed:', error);
  }
}

testDirectInsert();