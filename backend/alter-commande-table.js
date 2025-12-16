const database = require('./config/database');

async function alterCommandeTable() {
  try {
    await database.initialize();
    const db = database.getPool();

    console.log('🔄 Starting database table alteration...');

    // Check current table structure
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'commande'
    `;
    
    const currentColumns = await db.query(checkColumnsQuery);
    const existingColumns = currentColumns.rows.map(row => row.column_name);
    
    console.log('📋 Current columns in commande table:', existingColumns);

    // Define new columns to add
    const newColumns = [
      'user_name VARCHAR',
      'user_email VARCHAR',
      'user_phone VARCHAR',
      'delivery_address TEXT',
      'city VARCHAR',
      'governorate VARCHAR',
      'postal_code VARCHAR',
      'additional_notes TEXT',
      'subtotal DOUBLE PRECISION DEFAULT 0',
      'tax DOUBLE PRECISION DEFAULT 0',
      'delivery_fee DOUBLE PRECISION DEFAULT 0'
    ];

    const columnsToAdd = [
      'user_name', 'user_email', 'user_phone', 'delivery_address', 
      'city', 'governorate', 'postal_code', 'additional_notes', 
      'subtotal', 'tax', 'delivery_fee'
    ];

    // Add missing columns
    for (let i = 0; i < columnsToAdd.length; i++) {
      const columnName = columnsToAdd[i];
      const columnDefinition = newColumns[i];

      if (!existingColumns.includes(columnName)) {
        try {
          await db.query(`ALTER TABLE commande ADD COLUMN ${columnDefinition}`);
          console.log(`✅ Added column: ${columnName}`);
        } catch (error) {
          console.error(`❌ Failed to add column ${columnName}:`, error.message);
        }
      } else {
        console.log(`⚠️ Column ${columnName} already exists, skipping...`);
      }
    }

    // Verify the updated table structure
    const updatedColumns = await db.query(checkColumnsQuery);
    console.log('📋 Updated columns in commande table:', updatedColumns.rows.map(row => row.column_name));

    console.log('✅ Database table alteration completed!');
    
  } catch (error) {
    console.error('❌ Error altering database table:', error);
  } finally {
    await database.close();
  }
}

alterCommandeTable();