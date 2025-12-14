const database = require('./config/database');

async function testImageLoading() {
  try {
    // Initialize database
    await database.initialize();
    const db = database.getPool();
    
    console.log('🔍 Testing product image loading...');
    
    // Get products with images
    const result = await db.query(`
      SELECT 
        p.id_produit as id,
        p.nom as name,
        p.description,
        p.prix as price,
        p.image_url as image,
        p.prescription_required as prescription,
        m.nom as restaurant,
        m.type as type,
        m.id_magazin as store_id,
        c.id as category_id,
        c.nom as category_name
      FROM produit p
      JOIN magasin m ON p.id_magazin = m.id_magazin
      LEFT JOIN categorie c ON p.categorie_id = c.id
      WHERE p.image_url IS NOT NULL
      LIMIT 5
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No products with images found in database');
    } else {
      console.log(`✅ Found ${result.rows.length} products with images:`);
      result.rows.forEach(product => {
        console.log(`  - ${product.name}: ${product.image}`);
      });
    }
    
    // Also check total products
    const totalResult = await db.query('SELECT COUNT(*) as total FROM produit');
    console.log(`📊 Total products in database: ${totalResult.rows[0].total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing image loading:', error.message);
    process.exit(1);
  }
}

testImageLoading();