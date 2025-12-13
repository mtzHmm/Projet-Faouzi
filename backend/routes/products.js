const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Get database connection
function getDB() {
  return database.getPool();
}

// GET /api/products - Get all products from database
router.get('/', async (req, res) => {
  try {
    const { type, available, search, page = 1, limit = 20 } = req.query;
    
    console.log(`🔍 Products API called with params:`, { type, available, search, page, limit });
    console.log(`🎯 Type filter received: "${type}" (typeof: ${typeof type})`);
    
    // Build dynamic SQL query
    let query = `
      SELECT 
        p.id_produit as id,
        p.nom as name,
        p.description,
        p.prix as price,
        m.nom as restaurant,
        m.type as type,
        m.id_magazin as store_id,
        c.id as category_id,
        c.nom as category_name
      FROM produit p
      JOIN magasin m ON p.id_magazin = m.id_magazin
      LEFT JOIN categorie c ON p.categorie_id = c.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add filters with explicit type checking
    if (type && type.trim() !== '') {
      const typeFilter = type.trim().toLowerCase();
      query += ` AND LOWER(m.type) = $${paramIndex}`;
      queryParams.push(typeFilter);
      paramIndex++;
      console.log(`📝 Adding type filter: "${typeFilter}" as parameter $${paramIndex-1}`);
    } else {
      console.log(`⚠️ No type filter applied - type is: "${type}"`);
    }
    
    if (search) {
      query += ` AND (LOWER(p.nom) LIKE LOWER($${paramIndex}) OR LOWER(p.description) LIKE LOWER($${paramIndex + 1}))`;
      queryParams.push(`%${search}%`);
      queryParams.push(`%${search}%`);
      paramIndex += 2;
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY p.nom LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit));
    queryParams.push(offset);
    
    // Execute query
    const db = getDB();
    const result = await db.query(query, queryParams);
    console.log(`✅ Found ${result.rows.length} products`);
    
    // Debug: show first few products and their types
    if (result.rows.length > 0) {
      console.log('🔍 Sample products returned:');
      result.rows.slice(0, 5).forEach(product => {
        console.log(`  - ${product.name} (${product.restaurant}) - Type: ${product.type}`);
      });
    }
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM produit p
      JOIN magasin m ON p.id_magazin = m.id_magazin
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamIndex = 1;
    
    if (type) {
      countQuery += ` AND LOWER(m.type) = LOWER($${countParamIndex})`;
      countParams.push(type);
      countParamIndex++;
    }
    
    if (search) {
      countQuery += ` AND (LOWER(p.nom) LIKE LOWER($${countParamIndex}) OR LOWER(p.description) LIKE LOWER($${countParamIndex + 1}))`;
      countParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }
    
    console.log(`🗃️ Executing query:`, query);
    console.log(`📊 Query params:`, queryParams);
    console.log(`🔍 Full query with params:`, query.replace(/\$(\d+)/g, (match, num) => `'${queryParams[num-1]}'`));
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Format products with proper price conversion
    const products = result.rows.map(product => ({
      ...product,
      price: parseFloat(product.price) / 100, // Convert from cents to currency
      image: `/images/products/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      available: true
    }));
    
    console.log(`📦 Returning ${products.length} products out of ${total} total`);
    
    res.json({
      products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      hasMore: (page * limit) < total
    });
    
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/products/categories - Get all categories for a specific type
router.get('/categories', async (req, res) => {
  try {
    const { type = 'restaurant' } = req.query;
    
    const db = getDB();
    const result = await db.query(
      `SELECT id, nom as name, type 
       FROM categorie 
       WHERE type = $1 
       ORDER BY nom`,
      [type]
    );
    
    console.log(`📋 Categories for type "${type}":`, result.rows);
    
    res.json({
      success: true,
      categories: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query(
      `SELECT 
        p.id_produit as id,
        p.nom as name,
        p.description,
        p.prix as price,
        m.nom as restaurant,
        m.type as type,
        m.id_magazin as store_id,
        c.id as category_id,
        c.nom as category_name
      FROM produit p
      JOIN magasin m ON p.id_magazin = m.id_magazin
      LEFT JOIN categorie c ON p.categorie_id = c.id
      WHERE p.id_produit = $1`,
      [parseInt(req.params.id)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = {
      ...result.rows[0],
      price: result.rows[0].price / 100
    };
    
    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product by ID:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error.message 
    });
  }
});

// POST /api/products - Create new product
router.post('/', (req, res) => {
  const { name, description, price, category, image, stock = 0 } = req.body;
  
  if (!name || !description || !price || !category) {
    return res.status(400).json({ error: 'Name, description, price, and category are required' });
  }
  
  // This is a simplified implementation - full database integration would be more complex
  const newProduct = {
    id: Math.floor(Math.random() * 10000), // Temporary ID generation
    name,
    description,
    price: parseFloat(price),
    category,
    image: image || '/images/default-product.jpg',
    available: true,
    stock: parseInt(stock)
  };
  
  // TODO: Implement proper database insertion here
  
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const checkResult = await db.query(
      'SELECT id_produit FROM produit WHERE id_produit = $1',
      [parseInt(req.params.id)]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update logic would go here - simplified for now
    res.json({ message: 'Product update not implemented yet' });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query(
      'DELETE FROM produit WHERE id_produit = $1 RETURNING id_produit',
      [parseInt(req.params.id)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message 
    });
  }
});

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const db = getDB();
    const result = await db.query(
      `SELECT 
        p.id_produit as id,
        p.nom as name,
        p.description,
        p.prix as price,
        m.nom as restaurant,
        m.type as type,
        m.id_magazin as store_id,
        c.id as category_id,
        c.nom as category_name
      FROM produit p
      JOIN magasin m ON p.id_magazin = m.id_magazin
      LEFT JOIN categorie c ON p.categorie_id = c.id
      WHERE c.nom = $1`,
      [category]
    );
    
    const categoryProducts = result.rows.map(product => ({
      ...product,
      price: product.price / 100 // Convert from cents to DT
    }));
    
    res.json({
      category,
      products: categoryProducts,
      total: categoryProducts.length
    });
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products by category',
      details: error.message 
    });
  }
});

module.exports = router;