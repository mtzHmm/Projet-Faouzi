const database = require('./config/database');

async function checkConstraint() {
  try {
    const db = database.getPool();
    
    // Check current constraints
    const constraintResult = await db.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conrelid = 'commande'::regclass 
      AND contype = 'c'
    `);
    
    console.log('Current check constraints on commande table:');
    constraintResult.rows.forEach(row => {
      console.log(`${row.conname}: ${row.definition}`);
    });
    
    // Also check the column definition
    const columnResult = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'commande' 
      AND column_name = 'status'
    `);
    
    console.log('\nStatus column definition:');
    console.log(columnResult.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkConstraint();