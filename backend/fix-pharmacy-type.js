const { Pool } = require('pg');
const appProperties = require('./config/app.properties');

// Use the same database config as the server
const config = appProperties.database;
const pool = new Pool({
  connectionString: config.url,
  host: config.host,
  port: config.port,
  database: config.name,
  user: config.user,
  password: config.password,
  ssl: config.ssl ? { rejectUnauthorized: false } : false,
  ...config.pool
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

async function fixPharmacyType() {
  try {
    console.log('🏥 Fixing pharmacy type inconsistency...');
    
    // First, check current pharmacy stores
    const checkQuery = 'SELECT id_magazin, nom, type FROM magasin WHERE LOWER(type) = $1';
    const currentStores = await pool.query(checkQuery, ['pharmacy']);
    
    console.log('🔍 Current stores with type "pharmacy":', currentStores.rows);
    
    if (currentStores.rows.length === 0) {
      console.log('✅ No stores with type "pharmacy" found - already fixed!');
      return;
    }
    
    // Update pharmacy stores to use 'pharmacie'
    const updateQuery = `
      UPDATE magasin 
      SET type = 'pharmacie' 
      WHERE LOWER(type) = 'pharmacy'
      RETURNING id_magazin, nom, type;
    `;
    
    const result = await pool.query(updateQuery);
    
    console.log('✅ Updated stores:', result.rows);
    console.log(`🎯 Successfully updated ${result.rowCount} stores from "pharmacy" to "pharmacie"`);
    
    // Verify the fix
    const verifyQuery = 'SELECT id_magazin, nom, type FROM magasin WHERE type = $1';
    const verifyResult = await pool.query(verifyQuery, ['pharmacie']);
    
    console.log('🔍 Verification - stores with type "pharmacie":', verifyResult.rows);
    
  } catch (error) {
    console.error('❌ Error fixing pharmacy type:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    console.log('🔚 Database connection closed');
  }
}

fixPharmacyType();