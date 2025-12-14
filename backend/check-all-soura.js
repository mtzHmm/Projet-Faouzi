const database = require('./config/database');

async function checkAllSouraProducts() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    // Check ALL products with soura in the name
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
      WHERE LOWER(p.nom) LIKE '%soura%'
      ORDER BY p.id_produit
    `);
    
    console.log('All "soura" products in database:');
    console.log('================================');
    
    if (result.rows.length === 0) {
      console.log('No products found with "soura" in the name');
    } else {
      console.log(`Found ${result.rows.length} products:`);
      result.rows.forEach((product, index) => {
        console.log(`\n${index + 1}. Product ID: ${product.id}`);
        console.log(`   Name: ${product.name}`);
        console.log(`   Store ID: ${product.store_id}`);
        console.log(`   Store Name: ${product.restaurant}`);
        console.log(`   Store Type: ${product.type}`);
        console.log(`   Image: ${product.image || 'NO IMAGE'}`);
        console.log(`   Price: ${product.price}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAllSouraProducts();