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
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  const { name, email, role = 'client', status = 'active' } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    role,
    status,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  res.status(201).json(newUser);
});

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[userIndex] = { ...users[userIndex], ...req.body };
  
  res.json(users[userIndex]);
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  
  res.json({ message: 'User deleted successfully' });
});

module.exports = router;