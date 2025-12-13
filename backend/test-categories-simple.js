const { Pool } = require('pg');
require('dotenv').config();

async function testCategories() {
  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    // Test the categories API query
    console.log('Testing categories query...');
    const categoriesResult = await client.query(
      `SELECT id, nom as name, type 
       FROM categorie 
       WHERE type = $1 
       ORDER BY nom`,
      ['restaurant']
    );
    
    console.log('Categories API response:');
    console.log(JSON.stringify({
      success: true,
      categories: categoriesResult.rows,
      total: categoriesResult.rows.length
    }, null, 2));
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCategories();