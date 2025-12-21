const express = require('express');
const router = express.Router();
const database = require('../config/database');

// GET /api/providers - Get all providers (magasin table)
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Loading providers from magasin table...');
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    const magasinQuery = 'SELECT id_magazin as id, nom, email, tel, type, gouv_magasin, ville_magasin, \'provider\' as role, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM magasin';
    const magasinResult = await pool.query(magasinQuery);
    
    const providers = magasinResult.rows.map(provider => ({
      ...provider,
      id_magazin: provider.id, // Preserve table-specific ID  
      name: provider.nom,
      role: 'provider'
    }));
    
    console.log(`✅ Found ${providers.length} providers`);
    
    res.json({
      users: providers,
      total: providers.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('❌ Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// PUT /api/providers/:id - Update a provider (magasin table)
router.put('/:id', async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const updates = req.body;
    
    console.log(`🔄 Updating provider ${providerId} in MAGASIN table with:`, updates);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Build update query for magasin table ONLY
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;
    
    if (updates.nom) {
      updateFields.push(`nom = $${++paramCount}`);
      updateValues.push(updates.nom);
      console.log(`📝 Updating nom to: ${updates.nom}`);
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

    if (updates.type) {
      updateFields.push(`type = $${++paramCount}`);
      updateValues.push(updates.type);
      console.log(`📝 Updating type to: ${updates.type}`);
    }

    if (updates.gouv_magasin) {
      updateFields.push(`gouv_magasin = $${++paramCount}`);
      updateValues.push(updates.gouv_magasin);
      console.log(`📝 Updating gouv_magasin to: ${updates.gouv_magasin}`);
    }

    if (updates.ville_magasin) {
      updateFields.push(`ville_magasin = $${++paramCount}`);
      updateValues.push(updates.ville_magasin);
      console.log(`📝 Updating ville_magasin to: ${updates.ville_magasin}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add the provider ID as the last parameter
    updateValues.push(providerId);
    
    const updateQuery = `
      UPDATE magasin
      SET ${updateFields.join(', ')}
      WHERE id_magazin = $${updateValues.length}
      RETURNING *
    `;

    console.log('📝 MAGASIN Update query:\n', updateQuery);
    console.log('📝 Update values:', updateValues);

    const result = await pool.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found in magasin table' });
    }

    const updatedProvider = result.rows[0];
    console.log('✅ Provider updated successfully in MAGASIN table:', updatedProvider);
    
    res.json(updatedProvider);
  } catch (error) {
    console.error('❌ Error updating provider in magasin table:', error);
    res.status(500).json({
      error: 'Failed to update provider',
      message: error.message
    });
  }
});

// DELETE /api/providers/:id - Delete a provider
router.delete('/:id', async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    console.log(`🗑️ Deleting provider ${providerId}`);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Check if provider exists
    const checkQuery = 'SELECT id_magazin FROM magasin WHERE id_magazin = $1';
    const checkResult = await pool.query(checkQuery, [providerId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Delete the provider
    const deleteQuery = 'DELETE FROM magasin WHERE id_magazin = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [providerId]);
    
    console.log('✅ Provider deleted successfully:', result.rows[0]);
    res.json({ 
      message: 'Provider deleted successfully',
      deletedProvider: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error deleting provider:', error);
    res.status(500).json({
      error: 'Failed to delete provider',
      message: error.message
    });
  }
});

module.exports = router;