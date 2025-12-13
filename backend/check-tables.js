require('dotenv').config();
const database = require('./config/database');

async function checkAllTables() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    const tables = ['client', 'magasin', 'livreur'];
    
    for (const table of tables) {
      console.log(`\n📋 ${table.toUpperCase()} table structure:`);
      const tableInfo = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [table]);
      
      tableInfo.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    await database.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllTables();