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

module.exports = router;