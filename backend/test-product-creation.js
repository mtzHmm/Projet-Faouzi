const database = require('./config/database');

async function testProductCreation() {
  try {
    console.log('Testing product creation...');
    
    // Test without image first
    const testData = {
      name: 'Test Product',
      description: 'Test Description',
      price: '5.99',
      category_id: '2', // Desserts category
      store_id: '10',
      prescription: 'false'
    };
    
    console.log('Test data:', testData);
    
    // Simulate the database insertion
    await database.initialize();
    const db = database.getPool();
    
    const insertQuery = `
      INSERT INTO produit (nom, description, prix, id_magazin, categorie_id, image_url, prescription_required)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_produit, nom, description, prix, id_magazin, categorie_id, image_url, prescription_required
    `;
    
    const result = await db.query(insertQuery, [
      testData.name,
      testData.description,
      parseFloat(testData.price),
      parseInt(testData.store_id),
      parseInt(testData.category_id),
      null, // No image
      Boolean(testData.prescription === 'true')
    ]);
    
    console.log('✅ Test product created:', result.rows[0]);
    
    // Clean up - delete the test product
    await db.query('DELETE FROM produit WHERE id_produit = $1', [result.rows[0].id_produit]);
    console.log('✅ Test product deleted');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testProductCreation();