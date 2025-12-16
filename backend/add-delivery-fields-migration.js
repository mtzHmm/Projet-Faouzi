const database = require('./config/database');

async function addDeliveryFields() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    console.log('🔄 Adding delivery fields to commande table...');
    
    // Add columns for basic delivery information in commande table
    // Detailed delivery tracking will be in livraison table when driver accepts
    const alterTableQuery = `
      ALTER TABLE commande 
      ADD COLUMN IF NOT EXISTS user_name VARCHAR,
      ADD COLUMN IF NOT EXISTS user_email VARCHAR,
      ADD COLUMN IF NOT EXISTS user_phone VARCHAR,
      ADD COLUMN IF NOT EXISTS delivery_address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR,
      ADD COLUMN IF NOT EXISTS governorate VARCHAR,
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR,
      ADD COLUMN IF NOT EXISTS additional_notes TEXT,
      ADD COLUMN IF NOT EXISTS subtotal DOUBLE PRECISION DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tax DOUBLE PRECISION DEFAULT 0,
      ADD COLUMN IF NOT EXISTS delivery_fee DOUBLE PRECISION DEFAULT 0;
    `;
    
    await db.query(alterTableQuery);
    
    console.log('✅ Successfully added delivery fields to commande table');
    console.log('📋 Note: Detailed delivery tracking will use the existing livraison table');
    
    // Show updated table structure
    const describeQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'commande'
      ORDER BY ordinal_position;
    `;
    
    const result = await db.query(describeQuery);
    console.log('\n📊 Updated commande table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    await database.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addDeliveryFields();