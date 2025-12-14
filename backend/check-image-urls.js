const database = require('./config/database');

async function checkImageUrls() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    const result = await db.query(`
      SELECT id_produit, nom, image_url 
      FROM produit 
      WHERE image_url IS NOT NULL 
      LIMIT 5
    `);
    
    console.log('Products with image URLs:');
    console.log('========================');
    
    if (result.rows.length === 0) {
      console.log('No products with images found');
    } else {
      result.rows.forEach(row => {
        console.log(`ID: ${row.id_produit}`);
        console.log(`Name: ${row.nom}`);
        console.log(`Image URL: ${row.image_url}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkImageUrls();