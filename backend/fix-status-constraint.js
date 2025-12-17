const database = require('./config/database');

async function updateConstraint() {
  try {
    const db = database.getPool();
    
    console.log('🔄 Updating status constraint...');
    
    // First, drop the existing constraint
    await db.query(`ALTER TABLE commande DROP CONSTRAINT IF EXISTS statut_commande_checkk`);
    console.log('✅ Dropped old constraint');
    
    // Add the new constraint with correct status values
    await db.query(`
      ALTER TABLE commande 
      ADD CONSTRAINT statut_commande_checkk 
      CHECK (status IN (
        'en cours',
        'en attente', 
        'préparée',
        'en livraison',
        'livrée',
        'annulée'
      ))
    `);
    console.log('✅ Added new constraint with correct status values');
    
    // Verify the constraint
    const result = await db.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conrelid = 'commande'::regclass 
      AND contype = 'c'
      AND conname = 'statut_commande_checkk'
    `);
    
    console.log('✅ Constraint updated successfully:');
    console.log(result.rows[0].definition);
    
  } catch (error) {
    console.error('❌ Error updating constraint:', error);
  }
  process.exit(0);
}

updateConstraint();