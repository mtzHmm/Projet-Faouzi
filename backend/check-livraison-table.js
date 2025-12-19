const database = require('./config/database');

async function checkLivraisonTable() {
    console.log('\n=== Checking Livraison Table Structure ===\n');
    
    try {
        await database.initialize();
        const pool = database.getPool();
        
        // Get table structure
        console.log('1. Table structure:');
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'livraison'
            ORDER BY ordinal_position
        `);
        console.table(structure.rows);
        
        // Get all records
        console.log('\n2. All records in livraison table:');
        const records = await pool.query('SELECT * FROM livraison LIMIT 10');
        console.table(records.rows);
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkLivraisonTable();
