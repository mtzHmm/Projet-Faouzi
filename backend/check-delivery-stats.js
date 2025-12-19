const pool = require('./config/database').getPool();

async function checkDeliveryStats() {
    console.log('\n=== Checking Delivery Stats ===\n');
    
    try {
        // Get all livreurs
        console.log('1. All delivery persons:');
        const livreurs = await pool.query('SELECT id_liv, nom, prenom FROM livreur');
        console.table(livreurs.rows);
        
        // Get all livraisons
        console.log('\n2. All livraisons:');
        const livraisons = await pool.query(`
            SELECT 
                l.id_livraison,
                l.id_livreur,
                l.id_commande,
                l.status,
                c.total as order_total,
                c.total * 0.10 as delivery_commission
            FROM livraison l
            LEFT JOIN commande c ON l.id_commande = c.id_cmd
            ORDER BY l.id_livraison
        `);
        console.table(livraisons.rows);
        
        // Check stats for each livreur
        console.log('\n3. Stats per livreur:');
        for (const livreur of livreurs.rows) {
            const stats = await pool.query(`
                SELECT 
                    COUNT(*) as total_deliveries,
                    COALESCE(SUM(c.total * 0.10), 0) as total_earnings
                FROM livraison l
                INNER JOIN commande c ON l.id_commande = c.id_cmd
                WHERE l.id_livreur = $1 AND l.status = 'livrée'
            `, [livreur.id_liv]);
            
            console.log(`\n${livreur.nom} ${livreur.prenom} (ID: ${livreur.id_liv}):`);
            console.log(`  Total completed deliveries: ${stats.rows[0].total_deliveries}`);
            console.log(`  Total earnings (10%): ${stats.rows[0].total_earnings} DT`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkDeliveryStats();
