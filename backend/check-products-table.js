const database = require('./config/database');

async function checkProductsTable() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    console.log('🔍 Checking produit table structure...');
    
    // Get table columns
    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'produit' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columns in produit table:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n🧪 Testing basic product query...');
    
    // Test the exact query from the API
    const testQuery = `
      SELECT 
        p.id_produit as id,
        p.nom as name,
        p.description,
        p.prix as price,
        m.nom as restaurant,
        m.type as type,
        m.id_magazin as store_id,
        c.id as category_id,
        c.nom as category_name
      FROM produit p
      JOIN magasin m ON p.id_magazin = m.id_magazin
      LEFT JOIN categorie c ON p.categorie_id = c.id
      WHERE LOWER(m.type) = LOWER($1)
      LIMIT 5
    `;
    
    const result = await db.query(testQuery, ['restaurant']);
    console.log(`✅ Query successful! Found ${result.rows.length} restaurant products`);
    
    if (result.rows.length > 0) {
      console.log('📦 Sample product:', result.rows[0]);
    }
    
    await database.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📊 Full error:', error);
    process.exit(1);
  }
}

checkProductsTable();