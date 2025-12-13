require('dotenv').config();
const database = require('./config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection and table structure...');
    
    await database.initialize();
    const db = database.getPool();
    
    // Check if client table exists and its structure
    console.log('\n📋 Checking client table structure:');
    const tableInfo = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'client' 
      ORDER BY ordinal_position
    `);
    
    console.log('Client table columns:');
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // Try a simple insert with minimal data
    console.log('\n🧪 Testing simple insert...');
    const testResult = await db.query(`
      INSERT INTO client (nom, prenom, email, mot_de_passe, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, ['TestNom', 'TestPrenom', 'debug@test.com', 'hashedpass', 'CLIENT']);
    
    console.log('✅ Insert successful:', testResult.rows[0]);
    
    // Check if the record was actually saved
    console.log('\n🔍 Checking if record exists...');
    const checkResult = await db.query('SELECT * FROM client WHERE email = $1', ['debug@test.com']);
    console.log('Found records:', checkResult.rows);
    
    await database.close();
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      hint: error.hint
    });
  }
}

testDatabaseConnection();