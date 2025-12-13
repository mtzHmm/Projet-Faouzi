const express = require('express');
const router = express.Router();

// Mock orders data
let orders = [
  {
    id: 1001,
    userId: 1,
    userName: 'Sophie Martin',
    total: 45.80,
    status: 'en_livraison',
    items: [
      { id: 1, name: 'Pizza Margherita', quantity: 2, price: 15.90 },
      { id: 2, name: 'Coca Cola', quantity: 2, price: 7.00 }
    ],
    createdAt: new Date('2025-11-28T14:30:00')
  },
  {
    id: 1002,
    userId: 2,
    userName: 'Marc Dubois',
    total: 28.90,
    status: 'prepare',
    items: [
      { id: 3, name: 'Burger Classic', quantity: 1, price: 12.90 },
      { id: 4, name: 'Frites', quantity: 1, price: 4.00 }
    ],
    createdAt: new Date('2025-11-28T14:25:00')
  }
];

// GET /api/orders - Get all orders
router.get('/', (req, res) => {
  const { status, userId, page = 1, limit = 10 } = req.query;
  
  let filteredOrders = orders;
  
  // Filter by status
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  
  // Filter by user
  if (userId) {
    filteredOrders = filteredOrders.filter(order => order.userId === parseInt(userId));
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  res.json({
    orders: paginatedOrders,
    total: filteredOrders.length,
    page: parseInt(page),
    totalPages: Math.ceil(filteredOrders.length / limit)
  });
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  res.json(order);
});

// POST /api/orders - Create new order
router.post('/', (req, res) => {
  const { userId, userName, items, total } = req.body;
  
  if (!userId || !items || !total) {
    return res.status(400).json({ error: 'UserId, items, and total are required' });
  }
  
  const newOrder = {
    id: Date.now(),
    userId,
    userName,
    items,
    total,
    status: 'en_attente',
    createdAt: new Date()
  };
  
  orders.push(newOrder);
  
  res.status(201).json(newOrder);
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const validStatuses = ['en_attente', 'prepare', 'en_livraison', 'livre', 'annule'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  orders[orderIndex].status = status;
  
  res.json(orders[orderIndex]);
});

// GET /api/orders/stats - Get order statistics
router.get('/stats/summary', (req, res) => {
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'en_attente').length,
    preparing: orders.filter(o => o.status === 'prepare').length,
    delivering: orders.filter(o => o.status === 'en_livraison').length,
    delivered: orders.filter(o => o.status === 'livre').length,
    cancelled: orders.filter(o => o.status === 'annule').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  };
  
  res.json(stats);
});

module.exports = router;