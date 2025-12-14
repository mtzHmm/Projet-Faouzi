const database = require('./config/database');

async function fixImageUrls() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    // Find products with relative image paths (not Cloudinary URLs)
    const badImages = await db.query(`
      SELECT id_produit, nom, image_url 
      FROM produit 
      WHERE image_url IS NOT NULL 
      AND image_url NOT LIKE 'https://res.cloudinary.com%'
      AND image_url != ''
    `);
    
    console.log('Products with non-Cloudinary image URLs:');
    console.log('=====================================');
    
    if (badImages.rows.length === 0) {
      console.log('All products have proper Cloudinary URLs or no images');
    } else {
      console.log(`Found ${badImages.rows.length} products with bad image URLs:`);
      
      for (const product of badImages.rows) {
        console.log(`ID: ${product.id_produit}, Name: ${product.nom}, Bad URL: ${product.image_url}`);
        
        // Set the image_url to NULL for these products
        await db.query(
          'UPDATE produit SET image_url = NULL WHERE id_produit = $1',
          [product.id_produit]
        );
        console.log(`  ✅ Cleared image URL for product ${product.nom}`);
      }
      
      console.log(`\n✅ Updated ${badImages.rows.length} products to have NULL image URLs`);
      console.log('These products will now show the "No Image" placeholder');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixImageUrls();