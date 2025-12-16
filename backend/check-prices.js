require('dotenv').config();
const database = require('./config/database');

async function checkPrices() {
  try {
    // Initialize database
    await database.initialize();
    const db = database.getPool();
    
    // Check price column schema
    const schemaResult = await db.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale 
      FROM information_schema.columns 
      WHERE table_name = 'produit' AND column_name = 'prix'
    `);
    
    console.log('💾 Price column schema:', schemaResult.rows[0]);
    
    // Get sample products with prices
    const productsResult = await db.query(`
      SELECT id_produit, nom, prix, description 
      FROM produit 
      ORDER BY id_produit 
      LIMIT 10
    `);
    
    console.log('\n📦 Sample products in database:');
    productsResult.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nom} - Prix: ${product.prix} (Type: ${typeof product.prix})`);
    });
    
    // Check total count
    const countResult = await db.query('SELECT COUNT(*) FROM produit');
    console.log(`\n📊 Total products in database: ${countResult.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPrices();