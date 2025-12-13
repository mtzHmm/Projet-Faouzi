const express = require('express');
const router = express.Router();

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', (req, res) => {
  // Mock dashboard data
  const dashboardStats = {
    totalUsers: 25100,
    totalOrders: 43500,
    totalRevenue: 3500000,
    activeDeliveries: 23,
    pendingOrders: 12,
    recentOrders: [
      {
        id: 1001,
        userName: 'Sophie Martin',
        total: 45.80,
        status: 'en_livraison',
        createdAt: new Date('2025-11-28T14:30:00'),
        items: 3
      },
      {
        id: 1002,
        userName: 'Marc Dubois',
        total: 28.90,
        status: 'prepare',
        createdAt: new Date('2025-11-28T14:25:00'),
        items: 2
      }
    ],
    recentUsers: [
      {
        id: 1,
        name: 'Sophie Martin',
        email: 'sophie.martin@email.com',
        role: 'client',
        status: 'active',
        createdAt: new Date('2025-11-27T10:15:00')
      },
      {
        id: 2,
        name: 'Marc Dubois',
        email: 'marc.dubois@email.com',
        role: 'livreur',
        status: 'active',
        createdAt: new Date('2025-11-26T16:20:00')
      }
    ],
    salesByCategory: {
      restaurant: 1500000,
      boutique: 1200000,
      pharmacie: 800000
    },
    monthlyRevenue: [
      { month: 'Jan', revenue: 280000 },
      { month: 'Feb', revenue: 320000 },
      { month: 'Mar', revenue: 290000 },
      { month: 'Apr', revenue: 350000 },
      { month: 'May', revenue: 400000 },
      { month: 'Jun', revenue: 380000 }
    ]
  };
  
  res.json(dashboardStats);
});

// GET /api/admin/reports - Get various reports
router.get('/reports', (req, res) => {
  const { type, startDate, endDate } = req.query;
  
  // Mock reports data based on type
  let reportData = {};
  
  switch(type) {
    case 'sales':
      reportData = {
        type: 'sales',
        period: `${startDate} to ${endDate}`,
        totalSales: 150000,
        orderCount: 850,
        averageOrderValue: 176.47,
        topProducts: [
          { name: 'Pizza Margherita', sales: 25000, orders: 180 },
          { name: 'T-Shirt Blanc', sales: 18000, orders: 120 }
        ]
      };
      break;
    case 'users':
      reportData = {
        type: 'users',
        period: `${startDate} to ${endDate}`,
        newUsers: 125,
        activeUsers: 850,
        usersByRole: {
          client: 750,
          livreur: 85,
          admin: 15
        }
      };
      break;
    case 'deliveries':
      reportData = {
        type: 'deliveries',
        period: `${startDate} to ${endDate}`,
        totalDeliveries: 420,
        averageDeliveryTime: 25.5,
        deliverySuccess: 98.2,
        delivererPerformance: [
          { name: 'Marc Dubois', deliveries: 85, rating: 4.8 },
          { name: 'Alice Martin', deliveries: 78, rating: 4.9 }
        ]
      };
      break;
    default:
      reportData = {
        error: 'Invalid report type',
        availableTypes: ['sales', 'users', 'deliveries']
      };
  }
  
  res.json(reportData);
});

// POST /api/admin/settings - Update system settings
router.post('/settings', (req, res) => {
  const settings = req.body;
  
  // Mock settings update
  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: settings
  });
});

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', (req, res) => {
  const analyticsData = {
    overview: {
      totalRevenue: 3500000,
      growth: 15.2,
      orderGrowth: 22.5,
      userGrowth: 18.3
    },
    chartData: {
      daily: [
        { date: '2025-12-07', orders: 45, revenue: 1250 },
        { date: '2025-12-08', orders: 52, revenue: 1450 },
        { date: '2025-12-09', orders: 38, revenue: 1100 },
        { date: '2025-12-10', orders: 61, revenue: 1680 },
        { date: '2025-12-11', orders: 47, revenue: 1320 },
        { date: '2025-12-12', orders: 55, revenue: 1520 },
        { date: '2025-12-13', orders: 43, revenue: 1200 }
      ],
      categories: {
        restaurant: 45,
        boutique: 30,
        pharmacie: 25
      },
      hourlyActivity: [
        { hour: 8, orders: 5 },
        { hour: 9, orders: 12 },
        { hour: 10, orders: 18 },
        { hour: 11, orders: 25 },
        { hour: 12, orders: 42 },
        { hour: 13, orders: 38 },
        { hour: 14, orders: 35 },
        { hour: 15, orders: 28 },
        { hour: 16, orders: 22 },
        { hour: 17, orders: 30 },
        { hour: 18, orders: 45 },
        { hour: 19, orders: 52 },
        { hour: 20, orders: 48 },
        { hour: 21, orders: 35 },
        { hour: 22, orders: 20 },
        { hour: 23, orders: 8 }
      ]
    }
  };
  
  res.json(analyticsData);
});

module.exports = router;