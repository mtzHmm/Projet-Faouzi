const express = require('express');
const router = express.Router();
const database = require('../config/database');

// GET /api/users - Get all users from multiple tables
router.get('/', async (req, res) => {
  try {
    const { role, status, page = 1, limit = 50 } = req.query;
    
    console.log('🔍 Loading users from multiple tables...');
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    let allUsers = [];

    // Récupérer les clients (clients + admin)
    if (!role || role === 'all' || role === 'client' || role === 'admin') {
      try {
        const clientQuery = 'SELECT id_client as id, nom, email, prenom, tel, role, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM client';
        console.log('📊 Fetching clients...');
        const clientResult = await pool.query(clientQuery);
        
        const clients = clientResult.rows.map(client => ({
          ...client,
          name: client.nom + ' ' + (client.prenom || ''),
          role: client.role === 'ADMIN' || (client.email && client.email.includes('admin')) ? 'admin' : 'client'
        }));
        
        allUsers.push(...clients);
        console.log(`✅ Found ${clients.length} clients`);
      } catch (error) {
        console.error('❌ Error fetching clients:', error.message);
      }
    }

    // Récupérer les livreurs
    if (!role || role === 'all' || role === 'delivery') {
      try {
        const livreurQuery = 'SELECT id_liv as id, nom, prenom, email, tel, vehicule, ville_livraison, \'delivery\' as role, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM livreur';
        console.log('📊 Fetching delivery users...');
        const livreurResult = await pool.query(livreurQuery);
        
        const livreurs = livreurResult.rows.map(livreur => ({
          ...livreur,
          name: livreur.nom + ' ' + (livreur.prenom || '')
        }));
        
        allUsers.push(...livreurs);
        console.log(`✅ Found ${livreurs.length} delivery users`);
      } catch (error) {
        console.error('❌ Error fetching delivery users:', error.message);
      }
    }

    // Récupérer les fournisseurs (magasins)
    if (!role || role === 'all' || role === 'provider') {
      try {
        const magasinQuery = 'SELECT id_magazin as id, nom as name, email, tel, type, gouv_magasin, ville_magasin, \'provider\' as role, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM magasin';
        console.log('📊 Fetching providers...');
        const magasinResult = await pool.query(magasinQuery);
        
        allUsers.push(...magasinResult.rows);
        console.log(`✅ Found ${magasinResult.rows.length} providers`);
      } catch (error) {
        console.error('❌ Error fetching providers:', error.message);
      }
    }

    // Filtrer par statut si spécifié
    if (status && status !== 'all') {
      allUsers = allUsers.filter(user => user.status === status);
    }

    // Filtrer par rôle si spécifié (après la récupération pour la logique admin)
    if (role && role !== 'all') {
      allUsers = allUsers.filter(user => user.role === role);
    }

    // Tri par date de création (plus récent en premier)
    allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = allUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    console.log(`✅ Total users found: ${total}, returning ${paginatedUsers.length} for page ${page}`);

    res.json({
      users: paginatedUsers,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error('❌ Error loading users:', error);
    res.status(500).json({
      error: 'Failed to load users',
      message: error.message,
      users: [],
      total: 0,
      page: 1,
      totalPages: 0
    });
  }
});

// GET /api/users/clients - Get only clients
router.get('/clients', async (req, res) => {
  try {
    const pool = database.getPool();
    const result = await pool.query('SELECT id_client as id, nom, prenom, email, tel, role, gouv_client, ville_client, \'client\' as user_type, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM client ORDER BY nom DESC');
    
    console.log(`📋 Found ${result.rows.length} clients`);
    res.json({ users: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('❌ Error loading clients:', error);
    res.status(500).json({ error: 'Failed to load clients', message: error.message });
  }
});

// GET /api/users/delivery - Get only delivery users
router.get('/delivery', async (req, res) => {
  try {
    const pool = database.getPool();
    const result = await pool.query('SELECT id_liv as id, nom, prenom, email, tel, vehicule, ville_livraison, disponibilite, gouv_livreur, \'delivery\' as role, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM livreur ORDER BY nom DESC');
    
    console.log(`🚚 Found ${result.rows.length} delivery users`);
    res.json({ users: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('❌ Error loading delivery users:', error);
    res.status(500).json({ error: 'Failed to load delivery users', message: error.message });
  }
});

// GET /api/users/providers - Get only providers (magasins)
router.get('/providers', async (req, res) => {
  try {
    const pool = database.getPool();
    const result = await pool.query('SELECT id_magazin as id, nom as name, email, tel, type, gouv_magasin, ville_magasin, \'provider\' as role, \'active\' as status, CURRENT_TIMESTAMP as createdAt FROM magasin ORDER BY nom DESC');
    
    console.log(`🏪 Found ${result.rows.length} providers`);
    res.json({ users: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('❌ Error loading providers:', error);
    res.status(500).json({ error: 'Failed to load providers', message: error.message });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`🔍 Getting user ${userId}`);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Search in all tables for the user
    let user = null;
    
    // Try client table
    try {
      const result = await pool.query('SELECT id_client as id, nom as name, email, role, \'active\' as status FROM client WHERE id_client = $1', [userId]);
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } catch (err) {}
    
    // Try livreur table if not found
    if (!user) {
      try {
        const result = await pool.query('SELECT id_liv as id, nom as name, email, \'delivery\' as role, \'active\' as status FROM livreur WHERE id_liv = $1', [userId]);
        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      } catch (err) {}
    }
    
    // Try magasin table if not found
    if (!user) {
      try {
        const result = await pool.query('SELECT id_magazin as id, nom as name, email, \'provider\' as role, \'active\' as status FROM magasin WHERE id_magazin = $1', [userId]);
        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      } catch (err) {}
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User found:', user);
    res.json(user);
    
  } catch (error) {
    console.error('❌ Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, role = 'client', status = 'active' } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    console.log(`🔄 Creating new user: ${name} (${email}) with role ${role}`);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }
    
    // Insert into client table (for now, only support creating clients)
    const insertQuery = 'INSERT INTO client (nom, email, role, mot_de_passe) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await pool.query(insertQuery, [name, email, role.toUpperCase(), 'defaultpass123']);
    
    const newUser = {
      id: result.rows[0].id_client,
      name: result.rows[0].nom,
      email: result.rows[0].email,
      role: result.rows[0].role.toLowerCase(),
      status: 'active',
      createdAt: new Date()
    };
    
    console.log('✅ User created successfully:', newUser);
    res.status(201).json(newUser);
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;
    
    console.log(`🔄 Updating user ${userId} with:`, updates);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Chercher dans quelle table se trouve l'utilisateur
    let userFound = null;
    let tableInfo = null;
    
    // Table client (avec support du role)
    try {
      const clientResult = await pool.query('SELECT *, \'client\' as table_type FROM client WHERE id_client = $1', [userId]);
      if (clientResult.rows.length > 0) {
        userFound = clientResult.rows[0];
        tableInfo = { 
          name: 'client', 
          idCol: 'id_client', 
          hasRoleCol: true,
          roleCol: 'role'
        };
      }
    } catch (err) {
      console.log('Not found in client table');
    }
    
    // Table livreur (si pas trouvé dans client)
    if (!userFound) {
      try {
        const livreurResult = await pool.query('SELECT *, \'livreur\' as table_type FROM livreur WHERE id_liv = $1', [userId]);
        if (livreurResult.rows.length > 0) {
          userFound = livreurResult.rows[0];
          tableInfo = { 
            name: 'livreur', 
            idCol: 'id_liv', 
            hasRoleCol: false 
          };
        }
      } catch (err) {
        console.log('Not found in livreur table');
      }
    }
    
    // Table magasin (si pas trouvé ailleurs)
    if (!userFound) {
      try {
        const magasinResult = await pool.query('SELECT *, \'magasin\' as table_type FROM magasin WHERE id_magazin = $1', [userId]);
        if (magasinResult.rows.length > 0) {
          userFound = magasinResult.rows[0];
          tableInfo = { 
            name: 'magasin', 
            idCol: 'id_magazin', 
            hasRoleCol: false 
          };
        }
      } catch (err) {
        console.log('Not found in magasin table');
      }
    }
    
    if (!userFound || !tableInfo) {
      console.log(`❌ User ${userId} not found in any table`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`📍 Found user in table: ${tableInfo.name}`);
    
    // Construire la requête de mise à jour
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;
    
    // Mise à jour du rôle seulement pour les clients
    if (updates.role && tableInfo.hasRoleCol) {
      updateFields.push(`${tableInfo.roleCol} = $${++paramCount}`);
      updateValues.push(updates.role.toUpperCase());
      console.log(`📝 Updating role to: ${updates.role.toUpperCase()}`);
    } else if (updates.role && !tableInfo.hasRoleCol) {
      return res.status(400).json({ 
        error: 'Cannot change role for this user type',
        message: `Users in ${tableInfo.name} table cannot have their role changed`
      });
    }
    
    // Autres champs optionnels
    if (updates.nom) {
      updateFields.push(`nom = $${++paramCount}`);
      updateValues.push(updates.nom);
    }
    
    if (updates.email) {
      updateFields.push(`email = $${++paramCount}`);
      updateValues.push(updates.email);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Ajouter l'ID pour la clause WHERE
    updateValues.push(userId);
    const updateQuery = `
      UPDATE ${tableInfo.name} 
      SET ${updateFields.join(', ')} 
      WHERE ${tableInfo.idCol} = $${++paramCount}
      RETURNING *
    `;
    
    console.log('📝 Update query:', updateQuery);
    console.log('📝 Update values:', updateValues);
    
    const result = await pool.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Update failed' });
    }
    
    const updatedUser = result.rows[0];
    console.log('✅ User updated successfully');
    
    // Retourner la réponse avec la structure attendue
    res.json({
      id: userId,
      name: updatedUser.nom,
      email: updatedUser.email,
      role: updatedUser.role || (tableInfo.name === 'livreur' ? 'delivery' : 'provider'),
      status: 'active',
      message: 'User updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`🗑️ Deleting user ${userId}`);
    
    const pool = database.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }

    // Find which table the user is in and delete from that table
    let deleted = false;
    
    // Try deleting from client table
    try {
      const result = await pool.query('DELETE FROM client WHERE id_client = $1 RETURNING *', [userId]);
      if (result.rows.length > 0) {
        deleted = true;
        console.log('✅ User deleted from client table');
      }
    } catch (err) {
      console.log('Not found in client table');
    }
    
    // Try deleting from livreur table if not deleted yet
    if (!deleted) {
      try {
        const result = await pool.query('DELETE FROM livreur WHERE id_liv = $1 RETURNING *', [userId]);
        if (result.rows.length > 0) {
          deleted = true;
          console.log('✅ User deleted from livreur table');
        }
      } catch (err) {
        console.log('Not found in livreur table');
      }
    }
    
    // Try deleting from magasin table if not deleted yet
    if (!deleted) {
      try {
        const result = await pool.query('DELETE FROM magasin WHERE id_magazin = $1 RETURNING *', [userId]);
        if (result.rows.length > 0) {
          deleted = true;
          console.log('✅ User deleted from magasin table');
        }
      } catch (err) {
        console.log('Not found in magasin table');
      }
    }
    
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

module.exports = router;