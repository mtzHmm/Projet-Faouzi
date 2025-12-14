const express = require('express');
const router = express.Router();
const multer = require('multer');
const database = require('../config/database');
const cloudinaryConfig = require('../config/cloudinary');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get database connection
function getDB() {
  return database.getPool();
}

// GET /api/products - Get all products from database
router.get('/', async (req, res) => {
  try {
    const { type, available, search, page = 1, limit = 20, store_id, restaurant } = req.query;
    
    console.log(`🔍 Products API called with params:`, { type, available, search, page, limit, store_id, restaurant });
    console.log(`🎯 Type filter received: "${type}" (typeof: ${typeof type})`);
    console.log(`🏪 Store ID filter received: "${store_id}" (typeof: ${typeof store_id})`);
    console.log(`🍽️ Restaurant filter received: "${restaurant}"`);
    
    // Build dynamic SQL query
    let query = `
      SELECT 
        p.id_produit as id,
        p.nom as name,
        p.description,
        p.prix as price,
        p.image_url as image,
        p.prescription_required as prescription,
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
    
    // Add store_id filter
    if (store_id) {
      query += ` AND m.id_magazin = $${paramIndex}`;
      queryParams.push(parseInt(store_id));
      paramIndex++;
      console.log(`🏪 Adding store_id filter: ${store_id} as parameter $${paramIndex-1}`);
    }
    
    // Add restaurant name filter
    if (restaurant) {
      query += ` AND LOWER(m.nom) = LOWER($${paramIndex})`;
      queryParams.push(restaurant.trim());
      paramIndex++;
      console.log(`🍽️ Adding restaurant filter: "${restaurant}" as parameter $${paramIndex-1}`);
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
    
    if (store_id) {
      countQuery += ` AND m.id_magazin = $${countParamIndex}`;
      countParams.push(parseInt(store_id));
      countParamIndex++;
    }
    
    if (restaurant) {
      countQuery += ` AND LOWER(m.nom) = LOWER($${countParamIndex})`;
      countParams.push(restaurant.trim());
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
      price: parseFloat(product.price), // Keep price as stored (no conversion needed)
      available: true
      // Note: image field comes from database as 'image' (mapped from image_url)
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
        p.image_url as image,
        p.prescription_required as prescription,
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
      price: parseFloat(result.rows[0].price)
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

// POST /api/products - Create new product with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('🔥 POST /api/products request received');
    console.log('📝 Request body:', req.body);
    console.log('📎 Request file:', req.file ? 'File uploaded' : 'No file');
    
    const { name, description, price, category_id, store_id, prescription = false } = req.body;
    
    console.log('📦 Extracted data:', { name, description, price, category_id, store_id, prescription });
    console.log('📦 Data types:', { 
      name: typeof name, 
      description: typeof description, 
      price: typeof price, 
      category_id: typeof category_id, 
      store_id: typeof store_id, 
      prescription: typeof prescription 
    });
    
    // Validate required fields
    if (!name || !description || !price || !category_id || !store_id) {
      return res.status(400).json({ 
        error: 'Name, description, price, category_id, and store_id are required' 
      });
    }

    let imageUrl = null;
    
    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('📸 Uploading image to Cloudinary...');
        
        // Ensure Cloudinary is initialized
        if (!cloudinaryConfig.isInitialized) {
          cloudinaryConfig.initialize();
        }
        
        const uploadResult = await cloudinaryConfig.uploadImageBuffer(req.file.buffer, {
          folder: 'products',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto:good' }
          ]
        });
        imageUrl = uploadResult.secure_url;
        console.log('✅ Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return res.status(500).json({ 
          error: 'Image upload failed', 
          details: uploadError.message 
        });
      }
    }

    // Insert product into database
    const db = getDB();
    const insertQuery = `
      INSERT INTO produit (nom, description, prix, id_magazin, categorie_id, image_url, prescription_required)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_produit, nom, description, prix, id_magazin, categorie_id, image_url, prescription_required
    `;
    
    const result = await db.query(insertQuery, [
      name,
      description,
      parseFloat(price), // Store as actual price value
      parseInt(store_id),
      parseInt(category_id),
      imageUrl,
      Boolean(prescription)
    ]);

    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to create product' });
    }

    const newProduct = result.rows[0];
    
    // Get additional product details with joins
    const detailQuery = `
      SELECT 
        p.id_produit as id,
        p.nom as name,
        p.description,
        p.prix as price,
        p.image_url as image,
        p.prescription_required as prescription,
        m.nom as restaurant,
        m.type as type,
        m.id_magazin as store_id,
        c.id as category_id,
        c.nom as category_name
      FROM produit p
      JOIN magasin m ON p.id_magazin = m.id_magazin
      LEFT JOIN categorie c ON p.categorie_id = c.id
      WHERE p.id_produit = $1
    `;
    
    const detailResult = await db.query(detailQuery, [newProduct.id_produit]);
    
    // Keep price as stored (no conversion needed)
    const productWithPrice = {
      ...detailResult.rows[0],
      price: parseFloat(detailResult.rows[0].price)
    };
    
    console.log('✅ Product created successfully:', productWithPrice);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: productWithPrice
    });
    
  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message,
      errorType: error.name 
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('📝 Updating product with ID:', req.params.id);
    console.log('📝 Request body:', req.body);
    console.log('📎 Request file:', req.file ? 'File uploaded' : 'No file');
    
    const productId = parseInt(req.params.id);
    const { name, description, price, category_id, store_id, prescription = false, keepCurrentImage } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category_id || !store_id) {
      return res.status(400).json({ 
        error: 'Name, description, price, category_id, and store_id are required' 
      });
    }

    const db = getDB();
    
    // Check if product exists and belongs to the store
    const checkResult = await db.query(
      'SELECT id_produit, image_url FROM produit WHERE id_produit = $1 AND id_magazin = $2',
      [productId, parseInt(store_id)]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    const currentProduct = checkResult.rows[0];
    let imageUrl = currentProduct.image_url; // Keep current image by default
    
    // Handle image upload if provided
    if (req.file) {
      try {
        console.log('📸 Uploading new image to Cloudinary...');
        
        // Ensure Cloudinary is initialized
        if (!cloudinaryConfig.isInitialized) {
          cloudinaryConfig.initialize();
        }
        
        const uploadResult = await cloudinaryConfig.uploadImageBuffer(req.file.buffer, {
          folder: 'products',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto:good' }
          ]
        });
        imageUrl = uploadResult.secure_url;
        console.log('✅ New image uploaded successfully:', imageUrl);
        
        // Delete old image if it exists and is different
        if (currentProduct.image_url && currentProduct.image_url !== imageUrl) {
          try {
            // Extract public ID from Cloudinary URL to delete old image
            const publicIdMatch = currentProduct.image_url.match(/\/products\/([^/]+)\./);
            if (publicIdMatch) {
              await cloudinaryConfig.deleteImage(`products/${publicIdMatch[1]}`);
              console.log('🗑️ Old image deleted from Cloudinary');
            }
          } catch (deleteError) {
            console.warn('⚠️ Could not delete old image:', deleteError.message);
          }
        }
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return res.status(500).json({ 
          error: 'Image upload failed', 
          details: uploadError.message 
        });
      }
    } else if (keepCurrentImage !== 'true') {
      // If no new image and not keeping current, set to null
      imageUrl = null;
    }

    // Update product in database
    const updateQuery = `
      UPDATE produit 
      SET nom = $1, description = $2, prix = $3, categorie_id = $4, image_url = $5, prescription_required = $6
      WHERE id_produit = $7 AND id_magazin = $8
      RETURNING id_produit, nom, description, prix, id_magazin, categorie_id, image_url, prescription_required
    `;
    
    // Store price as entered (not multiplied by 100) since the frontend handles the display format
    const updateResult = await db.query(updateQuery, [
      name,
      description,
      parseFloat(price), // Store as the actual price value
      parseInt(category_id),
      imageUrl,
      Boolean(prescription),
      productId,
      parseInt(store_id)
    ]);

    if (updateResult.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to update product' });
    }

    const updatedProduct = updateResult.rows[0];
    
    // Get additional product details with joins
    const detailQuery = `
      SELECT 
        p.id_produit as id,
        p.nom as name,
        p.description,
        p.prix as price,
        p.image_url as image,
        p.prescription_required as prescription,
        m.nom as restaurant,
        m.type as type,
        m.id_magazin as store_id,
        c.id as category_id,
        c.nom as category_name
      FROM produit p
      JOIN magasin m ON p.id_magazin = m.id_magazin
      LEFT JOIN categorie c ON p.categorie_id = c.id
      WHERE p.id_produit = $1
    `;
    
    const detailResult = await db.query(detailQuery, [productId]);
    const productDetails = detailResult.rows[0];
    
    // Keep price as is (already in correct format)
    productDetails.price = parseFloat(productDetails.price);

    console.log('✅ Product updated successfully:', productDetails);
    
    res.json({
      message: 'Product updated successfully',
      product: productDetails
    });
    
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
      price: parseFloat(product.price) // Keep price as stored
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