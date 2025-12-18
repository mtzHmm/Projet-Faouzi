const express = require('express');
const router = express.Router();
const database = require('../config/database');

// GET /api/clients - Get all clients
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Loading clients from client table...');
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    const clientQuery = 'SELECT id_client as id, nom, email, prenom, tel, role, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM client';
    const clientResult = await pool.query(clientQuery);
    
    const clients = clientResult.rows.map(client => ({
      ...client,
      id_client: client.id, // Preserve table-specific ID
      name: client.nom + ' ' + (client.prenom || ''),
      role: client.role === 'ADMIN' || (client.email && client.email.includes('admin')) ? 'admin' : 'client'
    }));
    
    console.log(`✅ Found ${clients.length} clients`);
    
    res.json({
      users: clients,
      total: clients.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// PUT /api/clients/:id - Update a client
router.put('/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const updates = req.body;
    
    console.log(`🔄 Updating client ${clientId} with:`, updates);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Build update query for client table
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

    if (updates.role) {
      updateFields.push(`role = $${++paramCount}`);
      updateValues.push(updates.role.toUpperCase());
      console.log(`📝 Updating role to: ${updates.role.toUpperCase()}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add the client ID as the last parameter
    updateValues.push(clientId);
    
    const updateQuery = `
      UPDATE client
      SET ${updateFields.join(', ')}
      WHERE id_client = $${updateValues.length}
      RETURNING *
    `;

    console.log('📝 Update query:\n', updateQuery);
    console.log('📝 Update values:', updateValues);

    const result = await pool.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updatedClient = result.rows[0];
    console.log('✅ Client updated successfully:', updatedClient);
    
    res.json(updatedClient);
  } catch (error) {
    console.error('❌ Error updating client:', error);
    res.status(500).json({
      error: 'Failed to update client',
      message: error.message
    });
  }
});

module.exports = router;