const database = require('./config/database');

async function checkDefaultValue() {
  try {
    const db = database.getPool();
    
    // Check column definition for default value
    const result = await db.query(`
      SELECT column_name, column_default, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'commande' 
      AND column_name = 'status'
    `);
    
    console.log('Status column info:');
    console.log(result.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkDefaultValue();