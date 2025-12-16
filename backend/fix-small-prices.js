require('dotenv').config();
const database = require('./config/database');

async function fixSmallPrices() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    // Products that need price fixes (these should be actual DT prices, not millimes)
    const fixesNeeded = [
      { id: 30, name: 'soura', correctPrice: 10 },           // 10 DT
      { id: 31, name: 'pizza neptune', correctPrice: 4 },    // 4 DT  
      { id: 32, name: 'pizza pepperoni', correctPrice: 10 }, // 10 DT
      { id: 33, name: 'doliprane', correctPrice: 20 },       // 20 DT
      { id: 34, name: 'Panadole', correctPrice: 30 },        // 30 DT
      { id: 35, name: 'pizza', correctPrice: 35 }            // Assuming pizza should be around 35 DT
    ];
    
    console.log('🔧 Fixing product prices...\n');
    
    for (const fix of fixesNeeded) {
      const millimesPrice = fix.correctPrice * 1000; // Convert DT to millimes
      
      const result = await db.query(
        'UPDATE produit SET prix = $1 WHERE id_produit = $2 RETURNING id_produit, nom, prix',
        [millimesPrice, fix.id]
      );
      
      if (result.rows.length > 0) {
        const updated = result.rows[0];
        console.log(`✅ Updated ${updated.nom}: ${updated.prix} millimes (${fix.correctPrice} DT)`);
      } else {
        console.log(`❌ Failed to update product ID ${fix.id}`);
      }
    }
    
    console.log('\n📊 Updated product prices:');
    const checkResult = await db.query(`
      SELECT id_produit, nom, prix, (prix / 1000.0) as price_dt 
      FROM produit 
      WHERE id_produit BETWEEN 30 AND 35
      ORDER BY id_produit
    `);
    
    checkResult.rows.forEach((product) => {
      console.log(`${product.id_produit}. ${product.nom} - ${product.prix} millimes (${product.price_dt} DT)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSmallPrices();