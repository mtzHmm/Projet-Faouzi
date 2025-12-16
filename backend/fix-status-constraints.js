const database = require('./config/database');

async function fixStatusConstraints() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    console.log('🔧 Removing conflicting status constraints...');
    
    // Drop the conflicting constraints (keep only the first one)
    const constraints = [
      'statut_commande_check',
      'statut_commande_checkk', 
      'statut_commande_checkkk'
    ];
    
    for (const constraintName of constraints) {
      try {
        await db.query(`ALTER TABLE commande DROP CONSTRAINT ${constraintName}`);
        console.log(`✅ Dropped constraint: ${constraintName}`);
      } catch (error) {
        console.log(`⚠️ Could not drop ${constraintName}: ${error.message}`);
      }
    }
    
    // Verify remaining constraints
    const remainingQuery = `
      SELECT conname, pg_get_constraintdef(oid) as constraint_def
      FROM pg_constraint 
      WHERE conrelid = 'commande'::regclass 
      AND (conname LIKE '%status%' OR conname LIKE '%statut%');
    `;
    
    const result = await db.query(remainingQuery);
    console.log('\n📋 Remaining status constraints:');
    result.rows.forEach(constraint => {
      console.log(`- ${constraint.conname}: ${constraint.constraint_def}`);
    });
    
    await database.close();
  } catch (error) {
    console.error('❌ Error fixing constraints:', error);
  }
}

fixStatusConstraints();