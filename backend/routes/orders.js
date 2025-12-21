const express = require('express');
const router = express.Router();
const database = require('../config/database');

console.log('🔗 Orders route loaded and initialized');

// Add request logging middleware for debugging
router.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  if (req.method === 'POST') {
    console.log('📨 POST Request body preview:', Object.keys(req.body || {}));
  }
  next();
});

// Helper function to format order with items
async function formatOrderWithItems(order) {
  const db = database.getPool();
  
  // Get order items from ligne_commande and produit tables
  const itemsQuery = `
    SELECT lc.quantite, p.id_produit as id, p.nom as name, p.prix as price
    FROM ligne_commande lc
    JOIN produit p ON lc.id_produit = p.id_produit
    WHERE lc.id_cmd = $1
  `;
  
  const itemsResult = await db.query(itemsQuery, [order.id_cmd]);
  
  // Calculate totals from items if not available
  const items = itemsResult.rows.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantite,
    price: parseFloat(item.price)
  }));
  
  const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    id: order.id_cmd,
    userId: order.id_client,
    userName: order.user_name || '',
    userEmail: order.user_email || '',
    userPhone: order.user_phone || '',
    deliveryAddress: order.delivery_address || '',
    city: order.city || '',
    governorate: order.governorate || '',  
    postalCode: order.postal_code || '',
    additionalNotes: order.additional_notes || '',
    subtotal: parseFloat(order.subtotal) || calculatedSubtotal,
    tax: parseFloat(order.tax) || 0,
    deliveryFee: parseFloat(order.delivery_fee) || 0,
    total: parseFloat(order.total),
    status: order.status,
    dateCommande: order.date_commande,
    createdAt: order.date_commande,
    items: items
  };
}

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, userId, providerId, page = 1, limit = 10 } = req.query;
    const db = database.getPool();
    
    console.log('📊 Orders query params:', { status, userId, providerId, page, limit });
    
    let query = `
      SELECT DISTINCT c.*, 
             cl.nom || ' ' || cl.prenom as user_name,
             cl.email as user_email,
             cl.tel as user_phone
      FROM commande c
      LEFT JOIN client cl ON c.id_client = cl.id_client
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Filter by provider (join with products to find orders containing products from specific provider)
    if (providerId) {
      console.log('🏪 Filtering orders for provider ID:', providerId);
      query += ` AND EXISTS (
        SELECT 1 FROM ligne_commande lc 
        JOIN produit p ON lc.id_produit = p.id_produit 
        WHERE lc.id_cmd = c.id_cmd AND p.id_magazin = $${paramIndex}
      )`;
      params.push(parseInt(providerId));
      paramIndex++;
    }
    
    // Filter by status
    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Filter by user
    if (userId) {
      query += ` AND c.id_client = $${paramIndex}`;
      params.push(parseInt(userId));
      paramIndex++;
    }
    
    // Order by date desc
    query += ' ORDER BY c.date_commande DESC';
    
    // Execute query to get total count
    const countQuery = query.replace(
      'SELECT DISTINCT c.*, cl.nom || \' \' || cl.prenom as user_name, cl.email as user_email, cl.tel as user_phone',
      'SELECT COUNT(DISTINCT c.id_cmd) as count'
    );
    const countResult = await db.query(countQuery, params);
    const totalOrders = parseInt(countResult.rows[0]?.count || 0);
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);
    
    console.log('🔍 Executing query:', query);
    console.log('📋 With params:', params);
    
    const result = await db.query(query, params);
    
    console.log(`📊 Found ${result.rows.length} orders${providerId ? ` for provider ${providerId}` : ''}`);
    
    // Format each order with its items
    const formattedOrders = await Promise.all(
      result.rows.map(order => formatOrderWithItems(order))
    );
    
    console.log('📋 Returning formatted orders:', formattedOrders.length);
    
    res.json({
      orders: formattedOrders,
      total: totalOrders,
      page: parseInt(page),
      totalPages: Math.ceil(totalOrders / limit)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const db = database.getPool();
    const orderId = parseInt(req.params.id);
    
    const query = `
      SELECT c.*, 
             cl.nom || ' ' || cl.prenom as user_name,
             cl.email as user_email
      FROM commande c
      LEFT JOIN client cl ON c.id_client = cl.id_client
      WHERE c.id_cmd = $1
    `;
    
    const result = await db.query(query, [orderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const formattedOrder = await formatOrderWithItems(result.rows[0]);
    res.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  console.log('🚨🚨🚨 POST /orders route HIT - Database version! 🚨🚨🚨');
  const db = database.getPool();
  const client = await db.connect();
  
  try {
    // Debug: Log incoming request data
    console.log('📝 Incoming order request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      userId, 
      userName, 
      userEmail, 
      userPhone, 
      deliveryAddress, 
      city, 
      governorate, 
      postalCode, 
      additionalNotes, 
      items, 
      subtotal, 
      tax, 
      deliveryFee, 
      total, 
      dateCommande, 
      status = 'en attente'  // Nouvelles commandes commencent en attente 
    } = req.body;
    
    // Debug: Log extracted values
    console.log('🔍 Extracted values:', {
      userId, userName, userEmail, userPhone, 
      deliveryAddress, city, governorate, 
      items: items?.length, total, status
    });
    
    // Validation
    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !total) {
      console.log('❌ Validation failed:', { userId, itemsLength: items?.length, total });
      return res.status(400).json({ error: 'UserId, items (non-empty array), and total are required' });
    }
    
    console.log('✅ Validation passed, starting transaction...');
    
    console.log('✅ Validation passed, starting transaction...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Insert into commande table
    const insertOrderQuery = `
      INSERT INTO commande (
        date_commande, 
        status, 
        total, 
        id_client,
        user_name,
        user_email,
        user_phone,
        delivery_address,
        city,
        governorate,
        postal_code,
        additional_notes,
        subtotal,
        tax,
        delivery_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id_cmd
    `;
    
    const orderValues = [
      dateCommande || new Date().toISOString().split('T')[0],
      status,
      total,
      userId,
      userName,
      userEmail,
      userPhone,
      deliveryAddress,
      city,
      governorate,
      postalCode,
      additionalNotes,
      subtotal || 0,
      tax || 0,
      deliveryFee || 0
    ];
    
    console.log('🗃️ Executing order insert with values:', orderValues);
    
    const orderResult = await client.query(insertOrderQuery, orderValues);
    const orderId = orderResult.rows[0].id_cmd;
    
    console.log('🎯 Order inserted with ID:', orderId);
    
    // Insert items into ligne_commande table
    console.log('📦 Inserting', items.length, 'items...');
    for (const item of items) {
      console.log('🔹 Inserting item:', { quantity: item.quantity, orderId, productId: item.id });
      
      const insertItemQuery = `
        INSERT INTO ligne_commande (quantite, id_cmd, id_produit)
        VALUES ($1, $2, $3)
      `;
      
      await client.query(insertItemQuery, [item.quantity, orderId, item.id]);
    }
    
    console.log('✅ All items inserted successfully');
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('💾 Transaction committed');
    
    // Fetch the created order with all details
    const fetchOrderQuery = `
      SELECT c.*, 
             cl.nom || ' ' || cl.prenom as user_name,
             cl.email as user_email
      FROM commande c
      LEFT JOIN client cl ON c.id_client = cl.id_client
      WHERE c.id_cmd = $1
    `;
    
    const createdOrderResult = await client.query(fetchOrderQuery, [orderId]);
    const formattedOrder = await formatOrderWithItems(createdOrderResult.rows[0]);
    
    console.log(`✅ Order created successfully: #${orderId}`);
    res.status(201).json(formattedOrder);
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order: ' + error.message });
  } finally {
    // Release the client back to the pool
    client.release();
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = parseInt(req.params.id);
    const db = database.getPool();
    
    const validStatuses = ['en attente', 'en cours', 'préparée', 'livraison', 'livrée', 'annulée'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') });
    }
    
    const updateQuery = `
      UPDATE commande 
      SET status = $1 
      WHERE id_cmd = $2
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [status, orderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const formattedOrder = await formatOrderWithItems(result.rows[0]);
    res.json(formattedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/stats/summary - Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const db = database.getPool();
    const { providerId } = req.query;
    
    let statsQuery = `
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN status = 'en attente' THEN 1 END) as waitingOrders,
        COUNT(CASE WHEN status = 'préparée' THEN 1 END) as preparedOrders,
        COUNT(CASE WHEN status = 'en livraison' THEN 1 END) as inDeliveryOrders,
        COUNT(CASE WHEN status = 'livrée' THEN 1 END) as completedOrders,
        COUNT(CASE WHEN status = 'annulée' THEN 1 END) as cancelledOrders,
        COALESCE(SUM(total), 0) as totalRevenue,
        COALESCE(AVG(total), 0) as averageOrderValue
      FROM commande
    `;
    
    const params = [];
    
    // Filter by provider if providerId is specified
    if (providerId) {
      console.log('🏪 Fetching stats for provider ID:', providerId);
      statsQuery += ` WHERE EXISTS (
        SELECT 1 FROM ligne_commande lc 
        JOIN produit p ON lc.id_produit = p.id_produit 
        WHERE lc.id_cmd = commande.id_cmd AND p.id_magazin = $1
      )`;
      params.push(parseInt(providerId));
    }
    
    const result = await db.query(statsQuery, params);
    const stats = result.rows[0];
    
    res.json({
      totalOrders: parseInt(stats.totalorders),
      waitingOrders: parseInt(stats.waitingorders),
      preparedOrders: parseInt(stats.preparedorders), 
      inDeliveryOrders: parseInt(stats.indeliveryorders),
      completedOrders: parseInt(stats.completedorders),
      cancelledOrders: parseInt(stats.cancelledorders),
      totalRevenue: parseFloat(stats.totalrevenue),
      averageOrderValue: parseFloat(stats.averageordervalue)
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;