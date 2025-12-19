const database = require('./config/database');

async function testStatsEndpoint() {
    console.log('\n=== Testing Delivery Stats Endpoint ===\n');
    
    try {
        // Initialize database first
        await database.initialize();
        const pool = database.getPool();
        const deliveryId = 6; // jaafeer's ID from the logs
        
        console.log(`Testing stats for delivery person ID: ${deliveryId}\n`);
        
        // Same query as in the endpoint (FIXED: id_cmd not id_commande, id_liv not id_livreur)
        const statsQuery = `
            SELECT 
                COUNT(*) as total_deliveries,
                COALESCE(SUM(c.total * 0.10), 0) as total_earnings
            FROM livraison l
            INNER JOIN commande c ON l.id_cmd = c.id_cmd
            WHERE l.id_liv = $1 AND l.status = 'livrée'
        `;
        
        const result = await pool.query(statsQuery, [deliveryId]);
        const stats = result.rows[0];
        
        console.log('Query results:');
        console.log(`  Total completed deliveries: ${stats.total_deliveries}`);
        console.log(`  Total earnings (10%): ${parseFloat(stats.total_earnings).toFixed(2)} DT`);
        console.log(`  Rating: 4.8 (default)\n`);
        
        // Check what's in livraison table for this delivery person
        console.log('Checking livraison table for this delivery person:');
        const livraisons = await pool.query(`
            SELECT 
                l.id_livraison,
                l.id_commande,
                l.status as livraison_status,
                c.total as order_total,
                c.status as order_status,
                c.total * 0.10 as commission
            FROM livraison l
            LEFT JOIN commande c ON l.id_cmd = c.id_cmd
            WHERE l.id_liv = $1
            ORDER BY l.id_livraison
        `, [deliveryId]);
        
        console.table(livraisons.rows);
        
        if (livraisons.rows.length === 0) {
            console.log('\n⚠️ No deliveries found for this delivery person!');
            console.log('This is why earnings are 0.00 DT');
        } else {
            const completedCount = livraisons.rows.filter(l => l.livraison_status === 'livrée').length;
            if (completedCount === 0) {
                console.log(`\n⚠️ Found ${livraisons.rows.length} deliveries but NONE are completed (status='livrée')`);
                console.log('This is why earnings are 0.00 DT');
            } else {
                console.log(`\n✅ Found ${completedCount} completed deliveries out of ${livraisons.rows.length} total`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

testStatsEndpoint();
