const database = require('./config/database');

async function checkSouraProduct() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    // Check specifically for the "soura" product
    const result = await db.query(`
      SELECT id_produit, nom, image_url, description, prix
      FROM produit 
      WHERE LOWER(nom) LIKE '%soura%'
    `);
    
    console.log('Soura product details:');
    console.log('====================');
    
    if (result.rows.length === 0) {
      console.log('No product named "soura" found');
    } else {
      result.rows.forEach(row => {
        console.log(`ID: ${row.id_produit}`);
        console.log(`Name: ${row.nom}`);
        console.log(`Description: ${row.description}`);
        console.log(`Price: ${row.prix}`);
        console.log(`Image URL: ${row.image_url}`);
        console.log(`Image URL type: ${typeof row.image_url}`);
        console.log(`Image URL length: ${row.image_url ? row.image_url.length : 'null'}`);
        if (row.image_url) {
          console.log(`Starts with https: ${row.image_url.startsWith('https')}`);
          console.log(`Contains cloudinary: ${row.image_url.includes('cloudinary')}`);
        }
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSouraProduct();