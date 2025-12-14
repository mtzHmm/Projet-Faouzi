const database = require('./config/database');

async function addPrescriptionColumn() {
  try {
    // Initialize database first
    await database.initialize();
    const db = database.getPool();
    
    // Check if prescription_required column exists
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'produit' 
      AND column_name = 'prescription_required'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ prescription_required column does not exist, adding it...');
      await db.query('ALTER TABLE produit ADD COLUMN prescription_required BOOLEAN DEFAULT FALSE;');
      console.log('✅ prescription_required column added successfully');
    } else {
      console.log('✅ prescription_required column already exists');
    }
    
    console.log('✅ Database structure is ready for product creation');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addPrescriptionColumn();