const express = require('express');
const router = express.Router();
const database = require('../config/database');

// GET /api/delivery - Get all delivery users (livreur table)
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Loading delivery users from livreur table...');
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    const livreurQuery = 'SELECT id_liv as id, nom, prenom, email, tel, vehicule, ville_livraison, gouv_livreur, \'delivery\' as role, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM livreur';
    const livreurResult = await pool.query(livreurQuery);
    
    const deliveryUsers = livreurResult.rows.map(livreur => ({
      ...livreur,
      id_liv: livreur.id, // Preserve table-specific ID
      name: livreur.nom + ' ' + (livreur.prenom || ''),
      role: 'delivery'
    }));
    
    console.log(`✅ Found ${deliveryUsers.length} delivery users`);
    
    res.json({
      users: deliveryUsers,
      total: deliveryUsers.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('❌ Error fetching delivery users:', error);
    res.status(500).json({ error: 'Failed to fetch delivery users' });
  }
});

// PUT /api/delivery/:id - Update a delivery user (livreur table)
router.put('/:id', async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.id);
    const updates = req.body;
    
    console.log(`🔄 Updating delivery user ${deliveryId} in LIVREUR table with:`, updates);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Build update query for livreur table ONLY
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;
    
    if (updates.nom) {
      updateFields.push(`nom = $${++paramCount}`);
      updateValues.push(updates.nom);
      console.log(`📝 Updating nom to: ${updates.nom}`);
    }

    if (updates.prenom) {
      updateFields.push(`prenom = $${++paramCount}`);
      updateValues.push(updates.prenom);
      console.log(`📝 Updating prenom to: ${updates.prenom}`);
    }

    if (updates.email) {
      updateFields.push(`email = $${++paramCount}`);
      updateValues.push(updates.email);
      console.log(`📝 Updating email to: ${updates.email}`);
    }

    if (updates.tel) {
      updateFields.push(`tel = $${++paramCount}`);
      updateValues.push(updates.tel);
      console.log(`📝 Updating tel to: ${updates.tel}`);
    }

    if (updates.vehicule) {
      updateFields.push(`vehicule = $${++paramCount}`);
      updateValues.push(updates.vehicule);
      console.log(`📝 Updating vehicule to: ${updates.vehicule}`);
    }

    if (updates.ville_livraison) {
      updateFields.push(`ville_livraison = $${++paramCount}`);
      updateValues.push(updates.ville_livraison);
      console.log(`📝 Updating ville_livraison to: ${updates.ville_livraison}`);
    }

    if (updates.gouv_livreur) {
      updateFields.push(`gouv_livreur = $${++paramCount}`);
      updateValues.push(updates.gouv_livreur);
      console.log(`📝 Updating gouv_livreur to: ${updates.gouv_livreur}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add the delivery user ID as the last parameter
    updateValues.push(deliveryId);
    
    const updateQuery = `
      UPDATE livreur
      SET ${updateFields.join(', ')}
      WHERE id_liv = $${updateValues.length}
      RETURNING *
    `;

    console.log('📝 LIVREUR Update query:\n', updateQuery);
    console.log('📝 Update values:', updateValues);

    const result = await pool.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery user not found in livreur table' });
    }

    const updatedDelivery = result.rows[0];
    console.log('✅ Delivery user updated successfully in LIVREUR table:', updatedDelivery);
    
    res.json(updatedDelivery);
  } catch (error) {
    console.error('❌ Error updating delivery user in livreur table:', error);
    res.status(500).json({
      error: 'Failed to update delivery user',
      message: error.message
    });
  }
});

// GET /api/delivery/my-deliveries/:deliveryId - Get all livraisons for a delivery person
router.get('/my-deliveries/:deliveryId', async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.deliveryId);
    const db = database.getPool();
    
    console.log(`📦 Fetching livraisons for delivery person ${deliveryId}`);
    
    // Fetch livraisons with order details
    const query = `
      SELECT 
        l.id_livraison,
        l.id_cmd,
        l.id_liv,
        l.status as livraison_status,
        c.id_cmd,
        c.date_commande,
        c.status as order_status,
        c.total,
        c.user_name,
        c.user_email,
        c.user_phone,
        c.delivery_address,
        c.city,
        c.governorate
      FROM livraison l
      JOIN commande c ON l.id_cmd = c.id_cmd
      WHERE l.id_liv = $1
      ORDER BY l.id_livraison DESC
    `;
    
    const result = await db.query(query, [deliveryId]);
    
    // Fetch items for each order
    const deliveriesWithItems = await Promise.all(
      result.rows.map(async (delivery) => {
        const itemsQuery = `
          SELECT lc.quantite, p.id_produit as id, p.nom as name, p.prix as price
          FROM ligne_commande lc
          JOIN produit p ON lc.id_produit = p.id_produit
          WHERE lc.id_cmd = $1
        `;
        
        const itemsResult = await db.query(itemsQuery, [delivery.id_cmd]);
        
        return {
          ...delivery,
          items: itemsResult.rows.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantite,
            price: parseFloat(item.price)
          }))
        };
      })
    );
    
    console.log(`✅ Found ${deliveriesWithItems.length} livraisons for delivery person ${deliveryId}`);
    
    res.json({
      deliveries: deliveriesWithItems,
      total: deliveriesWithItems.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching deliveries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch deliveries',
      message: error.message
    });
  }
});

// PUT /api/delivery/complete-delivery/:orderId - Mark delivery as completed
router.put('/complete-delivery/:orderId', async (req, res) => {
  const db = database.getPool();
  const client = await db.connect();
  
  try {
    const orderId = parseInt(req.params.orderId);
    
    console.log(`✅ Marking delivery as completed for order ${orderId}`);
    
    // Start transaction
    await client.query('BEGIN');
    
    // Update livraison status to 'livrée'
    const updateLivraisonQuery = `
      UPDATE livraison
      SET status = $1
      WHERE id_cmd = $2
      RETURNING *
    `;
    
    const livraisonResult = await client.query(updateLivraisonQuery, ['livrée', orderId]);
    
    if (livraisonResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Livraison not found for this order' });
    }
    
    // Update order status to 'livrée'
    const updateOrderQuery = `
      UPDATE commande
      SET status = $1
      WHERE id_cmd = $2
      RETURNING *
    `;
    
    await client.query(updateOrderQuery, ['livrée', orderId]);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`✅ Delivery completed successfully for order ${orderId}`);
    
    res.json({
      livraison: livraisonResult.rows[0],
      message: 'Delivery completed successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error completing delivery:', error);
    res.status(500).json({ 
      error: 'Failed to complete delivery',
      message: error.message
    });
  } finally {
    client.release();
  }
});

// POST /api/delivery/accept-order - Accept an order and create livraison
router.post('/accept-order', async (req, res) => {
  const db = database.getPool();
  const client = await db.connect();
  
  try {
    const { orderId, deliveryId } = req.body;
    
    console.log(`📦 Delivery person ${deliveryId} accepting order ${orderId}`);
    
    if (!orderId || !deliveryId) {
      return res.status(400).json({ error: 'orderId and deliveryId are required' });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check if livraison already exists for this order
    const checkQuery = 'SELECT id_livraison FROM livraison WHERE id_cmd = $1';
    const checkResult = await client.query(checkQuery, [orderId]);
    
    if (checkResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Livraison already exists for this order' });
    }
    
    // Create livraison record
    const insertQuery = `
      INSERT INTO livraison (id_cmd, id_liv, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const livraisonResult = await client.query(insertQuery, [
      orderId,
      deliveryId,
      'en cours de livraison'
    ]);
    
    // Update order status to 'livraison'
    const updateOrderQuery = `
      UPDATE commande
      SET status = $1
      WHERE id_cmd = $2
      RETURNING *
    `;
    
    await client.query(updateOrderQuery, ['livraison', orderId]);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`✅ Livraison created successfully:`, livraisonResult.rows[0]);
    
    res.status(201).json({
      livraison: livraisonResult.rows[0],
      message: 'Order accepted and livraison created'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error accepting order:', error);
    res.status(500).json({ 
      error: 'Failed to accept order',
      message: error.message
    });
  } finally {
    client.release();
  }
});

// GET /api/delivery/stats/:deliveryId - Get delivery person statistics
router.get('/stats/:deliveryId', async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.deliveryId);
    console.log(`📊 Loading stats for delivery person ${deliveryId}...`);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Get total deliveries and earnings (10% of order totals)
    const statsQuery = `
      SELECT 
        COUNT(*) as total_deliveries,
        COALESCE(SUM(c.total * 0.10), 0) as total_earnings
      FROM livraison l
      INNER JOIN commande c ON l.id_cmd = c.id_cmd
      WHERE l.id_liv = $1 AND l.status = 'livrée'
    `;
    
    const statsResult = await pool.query(statsQuery, [deliveryId]);
    const stats = statsResult.rows[0];

    // Get average rating (if you have a rating system, otherwise return 4.8 as default)
    const rating = 4.8; // Placeholder until rating system is implemented

    console.log(`✅ Stats loaded:`, {
      deliveries: stats.total_deliveries,
      earnings: parseFloat(stats.total_earnings).toFixed(2),
      rating
    });

    res.json({
      totalDeliveries: parseInt(stats.total_deliveries),
      totalEarnings: parseFloat(stats.total_earnings),
      rating: rating
    });

  } catch (error) {
    console.error('❌ Error loading delivery stats:', error);
    res.status(500).json({ 
      error: 'Failed to load delivery stats',
      message: error.message
    });
  }
});

// DELETE /api/delivery/:id - Delete a delivery user
router.delete('/:id', async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.id);
    console.log(`🗑️ Deleting delivery user ${deliveryId}`);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Check if delivery user exists
    const checkQuery = 'SELECT id_liv FROM livreur WHERE id_liv = $1';
    const checkResult = await pool.query(checkQuery, [deliveryId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery user not found' });
    }

    // Delete the delivery user
    const deleteQuery = 'DELETE FROM livreur WHERE id_liv = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [deliveryId]);
    
    console.log('✅ Delivery user deleted successfully:', result.rows[0]);
    res.json({ 
      message: 'Delivery user deleted successfully',
      deletedDelivery: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error deleting delivery user:', error);
    res.status(500).json({
      error: 'Failed to delete delivery user',
      message: error.message
    });
  }
});

module.exports = router;