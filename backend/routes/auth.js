const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../config/database');
const router = express.Router();

// Get database connection
function getDB() {
  return database.getPool();
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔑 Login attempt:', { email });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }
    
    const db = getDB();
    let user = null;
    let userType = null;
    
    // Check in client table
    try {
      const clientResult = await db.query(
        'SELECT id_client as id, nom, prenom, email, mot_de_passe, role, tel FROM client WHERE email = $1',
        [email]
      );
      
      if (clientResult.rows.length > 0) {
        user = clientResult.rows[0];
        userType = 'client';
        user.name = `${user.prenom} ${user.nom}`;
      }
    } catch (err) {
      console.log('Client table check failed:', err.message);
    }
    
    // Check in magasin table if not found in client
    if (!user) {
      try {
        const magasinResult = await db.query(
          'SELECT id_magazin as id, nom as name, email, mot_de_passe, tel, type FROM magasin WHERE email = $1',
          [email]
        );
        
        if (magasinResult.rows.length > 0) {
          user = magasinResult.rows[0];
          userType = 'provider';
          user.role = 'provider';
        }
      } catch (err) {
        console.log('Magasin table check failed:', err.message);
      }
    }
    
    // Check in livreur table if not found
    if (!user) {
      try {
        const livreurResult = await db.query(
          'SELECT id_liv as id, nom as name, email, mot_de_passe, tel, ville_livraison as ville, gouv_livreur FROM livreur WHERE email = $1',
          [email]
        );
        
        if (livreurResult.rows.length > 0) {
          user = livreurResult.rows[0];
          userType = 'livreur';
          user.role = 'livreur';
        }
      } catch (err) {
        console.log('Livreur table check failed:', err.message);
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.mot_de_passe);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role?.toLowerCase() || userType,
        userType 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    delete user.mot_de_passe;
    
    console.log('✅ Login successful:', { id: user.id, email: user.email, role: user.role });
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.toLowerCase() || userType,
        phone: user.tel,
        ...(userType === 'provider' && { storeType: user.type }),
        ...(userType === 'livreur' && { city: user.ville })
      },
      token
    });
    
  } catch (error) {
    console.error('❌ Login failed:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'client',
      phone,
      address,
      firstName,
      lastName,
      storeName,
      storeCategory,
      city,
      availabilityTime 
    } = req.body;
    
    console.log('📝 Registration request:', { name, email, role, phone, address });
    
    // Validation
    if (!name && (!firstName || !lastName) && !storeName) {
      return res.status(400).json({
        success: false,
        error: 'Name information is required'
      });
    }
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const db = getDB();
    console.log('🔌 Database connection acquired');
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    let userId;
    let userRecord;
    
    // Insert based on role
    if (role === 'livreur') {
      // Insert into livreur table
      const deliveryName = name || `${firstName} ${lastName}`;
      const [prenom, ...nomParts] = deliveryName.split(' ');
      const nom = nomParts.join(' ') || deliveryName;
      
      const result = await db.query(
        'INSERT INTO livreur (nom, prenom, email, mot_de_passe, tel, ville_livraison) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [nom, firstName || prenom, email, hashedPassword, phone || null, city || null]
      );
      userId = result.rows[0].id_liv;
      userRecord = {
        id: userId,
        name: `${result.rows[0].prenom} ${result.rows[0].nom}`,
        email,
        role: 'livreur',
        phone: result.rows[0].tel,
        city: result.rows[0].ville_livraison
      };
    } else if (role === 'provider') {
      // Insert into magasin table
      const { rue, ville, code_postal, complement } = req.body;
      
      const result = await db.query(
        'INSERT INTO magasin (nom, email, mot_de_passe, tel, type, ville_magasin, gouv_magasin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [storeName || name, email, hashedPassword, phone || null, storeCategory || 'restaurant', ville || null, complement || null]
      );
      userId = result.rows[0].id_magazin;
      userRecord = {
        id: userId,
        name: storeName || name,
        email,
        role: 'provider',
        phone: result.rows[0].tel,
        storeType: result.rows[0].type
      };
    } else {
      // Insert into client table (default)
      const clientName = name || `${firstName} ${lastName}`;
      const [prenom, ...nomParts] = clientName.split(' ');
      const nom = nomParts.join(' ') || prenom;
      
      // Extract address components
      const { rue, ville, code_postal, complement } = req.body;
      
      console.log('💾 Inserting client with data:', { nom, prenom: firstName || prenom, email, phone, ville, rue });
      
      const result = await db.query(
        'INSERT INTO client (nom, prenom, email, mot_de_passe, tel, role, ville_client, gouv_client) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [nom, firstName || prenom, email, hashedPassword, phone || null, 'CLIENT', ville || null, complement || null]
      );
      
      console.log('✅ Client insert successful:', result.rows[0]);
      
      userId = result.rows[0].id_client;
      userRecord = {
        id: userId,
        name: `${result.rows[0].prenom} ${result.rows[0].nom}`,
        email,
        role: 'client',
        phone: result.rows[0].tel
      };
    }
    
    console.log('✅ User registered successfully:', userRecord);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userRecord
    });
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    // Check for unique constraint violations
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;