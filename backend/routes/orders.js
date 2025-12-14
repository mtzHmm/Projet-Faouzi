const express = require('express');
const router = express.Router();

// Mock orders data - Will be replaced with database queries
let orders = [
  {
    id: 1001,
    userId: 1,
    userName: 'Sophie Martin',
    userEmail: 'sophie.martin@email.com',
    total: 45.80,
    status: 'en_cours',
    deliveryAddress: '123 Rue de la Paix, 75001 Paris',
    items: [
      { id: 1, name: 'Pizza Margherita', quantity: 2, price: 15.90 },
      { id: 2, name: 'Coca Cola', quantity: 2, price: 7.00 }
    ],
    createdAt: new Date('2025-12-13T14:30:00')
  },
  {
    id: 1002,
    userId: 2,
    userName: 'Marc Dubois',
    userEmail: 'marc.dubois@email.com',
    total: 28.90,
    status: 'en_cours',
    deliveryAddress: '456 Avenue des Champs, 75008 Paris',
    items: [
      { id: 3, name: 'Burger Classic', quantity: 1, price: 12.90 },
      { id: 4, name: 'Frites', quantity: 1, price: 4.00 }
    ],
    createdAt: new Date('2025-12-13T14:25:00')
  },
  {
    id: 1003,
    userId: 3,
    userName: 'Laura Petit',
    userEmail: 'laura.petit@email.com',
    total: 67.30,
    status: 'en_cours',
    deliveryAddress: '789 Boulevard Saint-Germain, 75006 Paris',
    items: [
      { id: 5, name: 'Salade César', quantity: 1, price: 8.90 },
      { id: 6, name: 'Saumon grillé', quantity: 2, price: 18.50 },
      { id: 7, name: 'Vin blanc', quantity: 1, price: 15.40 }
    ],
    createdAt: new Date('2025-12-13T13:45:00')
  },
  {
    id: 1004,
    userId: 4,
    userName: 'Thomas Bernard',
    userEmail: 'thomas.bernard@email.com',
    total: 92.10,
    status: 'livrée',
    deliveryAddress: '321 Rue de Rivoli, 75004 Paris',
    items: [
      { id: 8, name: 'Sushi Mix', quantity: 2, price: 25.90 },
      { id: 9, name: 'Miso Soup', quantity: 2, price: 4.50 },
      { id: 10, name: 'Saké', quantity: 1, price: 12.80 }
    ],
    createdAt: new Date('2025-12-13T12:30:00')
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
    status: 'en_cours',
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
  
  const validStatuses = ['en_cours', 'livrée', 'annulée'];
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
    inProgress: orders.filter(o => o.status === 'en_cours').length,
    delivered: orders.filter(o => o.status === 'livrée').length,
    cancelled: orders.filter(o => o.status === 'annulée').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  };
  
  res.json(stats);
});

module.exports = router;