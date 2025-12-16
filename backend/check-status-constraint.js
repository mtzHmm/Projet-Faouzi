const database = require('./config/database');

async function checkStatusConstraint() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    // Check the constraint on the commande table
    const constraintQuery = `
      SELECT conname, contype, pg_get_constraintdef(oid) as constraint_def
      FROM pg_constraint 
      WHERE conrelid = 'commande'::regclass 
      AND (conname LIKE '%status%' OR conname LIKE '%statut%');
    `;
    
    const result = await db.query(constraintQuery);
    
    console.log('📋 Status constraints on commande table:');
    if (result.rows.length > 0) {
      result.rows.forEach(constraint => {
        console.log(`- ${constraint.conname}: ${constraint.constraint_def}`);
      });
    } else {
      console.log('No status constraints found');
    }
    
    // Also check what status values currently exist
    const statusQuery = 'SELECT DISTINCT status FROM commande WHERE status IS NOT NULL';
    const statusResult = await db.query(statusQuery);
    
    console.log('\n📊 Existing status values in database:');
    if (statusResult.rows.length > 0) {
      statusResult.rows.forEach(row => {
        console.log(`- "${row.status}"`);
      });
    } else {
      console.log('No status values found in existing records');
    }
    
    await database.close();
  } catch (error) {
    console.error('❌ Error checking constraints:', error);
  }
}

checkStatusConstraint();