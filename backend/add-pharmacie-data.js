const database = require('./config/database');

async function addSamplePharmacieData() {
  await database.initialize();
  const db = database.getPool();
  
  try {
    await db.query('BEGIN');
    
    console.log('🏗️ Adding sample pharmacie data...');
    
    // Add pharmacie categories
    const categoriesData = [
      { name: 'Médicaments', type: 'pharmacie' },
      { name: 'Vitamines', type: 'pharmacie' },
      { name: 'Matériel Médical', type: 'pharmacie' },
      { name: 'Protection', type: 'pharmacie' },
      { name: 'Hygiène', type: 'pharmacie' },
      { name: 'Cosmétiques', type: 'pharmacie' }
    ];
    
    console.log('📋 Adding pharmacie categories...');
    const categoryIds = [];
    
    for (const category of categoriesData) {
      const result = await db.query(`
        INSERT INTO categorie (nom, type) 
        VALUES ($1, $2) 
        ON CONFLICT (nom, type) DO UPDATE SET nom = EXCLUDED.nom
        RETURNING id
      `, [category.name, category.type]);
      
      categoryIds.push({ name: category.name, id: result.rows[0].id });
      console.log(`✅ Category added: ${category.name} (ID: ${result.rows[0].id})`);
    }
    
    // Add pharmacie products
    const productsData = [
      {
        name: 'Paracétamol 1g',
        description: 'Médicament contre la douleur et la fièvre',
        price: 3.50,
        restaurant: 'Pharmacie Centrale',
        type: 'pharmacie',
        category: 'Médicaments',
        available: true,
        image: '/images/paracetamol.jpg'
      },
      {
        name: 'Vitamine C 500mg',
        description: 'Complément alimentaire vitamine C',
        price: 8.99,
        restaurant: 'Pharmacie Centrale',
        type: 'pharmacie',
        category: 'Vitamines',
        available: true,
        image: '/images/vitamin-c.jpg'
      },
      {
        name: 'Thermomètre Digital',
        description: 'Thermomètre médical précis',
        price: 12.99,
        restaurant: 'Pharmacie du Centre',
        type: 'pharmacie',
        category: 'Matériel Médical',
        available: true,
        image: '/images/thermometer.jpg'
      },
      {
        name: 'Masques Chirurgicaux',
        description: 'Boîte de 50 masques chirurgicaux',
        price: 15.99,
        restaurant: 'Pharmacie du Centre',
        type: 'pharmacie',
        category: 'Protection',
        available: true,
        image: '/images/masks.jpg'
      },
      {
        name: 'Gel Hydroalcoolique',
        description: 'Gel désinfectant pour les mains 250ml',
        price: 4.50,
        restaurant: 'Pharmacie Moderne',
        type: 'pharmacie',
        category: 'Hygiène',
        available: true,
        image: '/images/hand-gel.jpg'
      },
      {
        name: 'Crème Hydratante',
        description: 'Crème hydratante pour peaux sensibles',
        price: 12.50,
        restaurant: 'Pharmacie Beauté',
        type: 'pharmacie',
        category: 'Cosmétiques',
        available: true,
        image: '/images/moisturizer.jpg'
      }
    ];
    
    console.log('💊 Adding pharmacie products...');
    
    for (const product of productsData) {
      // Find category ID
      const categoryResult = await db.query(
        'SELECT id FROM categories WHERE name = $1 AND type = $2',
        [product.category, 'pharmacie']
      );
      
      if (categoryResult.rows.length > 0) {
        const categoryId = categoryResult.rows[0].id;
        
        // Insert product
        await db.query(`
          INSERT INTO products (
            name, description, price, restaurant, type, category_id, available, image
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `, [
          product.name,
          product.description,
          product.price,
          product.restaurant,
          product.type,
          categoryId,
          product.available,
          product.image
        ]);
        
        console.log(`✅ Product added: ${product.name}`);
      }
    }
    
    await db.query('COMMIT');
    console.log('🎉 Sample pharmacie data added successfully!');
    
    // Verify the data
    const categoryCount = await db.query(
      'SELECT COUNT(*) FROM categories WHERE type = $1',
      ['pharmacie']
    );
    
    const productCount = await db.query(
      'SELECT COUNT(*) FROM products WHERE type = $1',
      ['pharmacie']
    );
    
    console.log(`📊 Total pharmacie categories: ${categoryCount.rows[0].count}`);
    console.log(`📊 Total pharmacie products: ${productCount.rows[0].count}`);
    
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('❌ Error adding sample data:', error);
    throw error;
  } finally {
    await database.close();
  }
}

// Run the function
addSamplePharmacieData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });