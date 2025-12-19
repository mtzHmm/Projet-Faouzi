const express = require('express');
const router = express.Router();
const database = require('../config/database');

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const db = database.getPool();
    
    // Get total users count from all tables
    const clientsCount = await db.query('SELECT COUNT(*) as count FROM client');
    const livreursCount = await db.query('SELECT COUNT(*) as count FROM livreur');
    const providersCount = await db.query('SELECT COUNT(*) as count FROM magasin');
    
    const totalUsers = 
      parseInt(clientsCount.rows[0]?.count || 0) + 
      parseInt(livreursCount.rows[0]?.count || 0) + 
      parseInt(providersCount.rows[0]?.count || 0);
    
    // Get orders statistics
    const ordersStats = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status IN ('en attente', 'en cours') THEN 1 END) as pending_orders,
        COALESCE(SUM(total), 0) as total_revenue
      FROM commande
    `);
    
    const stats = ordersStats.rows[0];
    
    // Get recent orders
    const recentOrdersResult = await db.query(`
      SELECT 
        c.id_cmd as id,
        c.total,
        c.status,
        c.date_commande as created_at,
        COALESCE(cl.nom || ' ' || cl.prenom, c.user_name, 'Unknown') as user_name,
        (SELECT COUNT(*) FROM ligne_commande WHERE id_cmd = c.id_cmd) as items
      FROM commande c
      LEFT JOIN client cl ON c.id_client = cl.id_client
      ORDER BY c.date_commande DESC
      LIMIT 5
    `);
    
    const recentOrders = recentOrdersResult.rows.map(order => ({
      id: order.id,
      userName: order.user_name,
      total: parseFloat(order.total),
      status: order.status,
      createdAt: order.created_at,
      items: parseInt(order.items)
    }));
    
    // Get recent users
    const recentUsersResult = await db.query(`
      (SELECT 
        id_client as id,
        nom || ' ' || prenom as name,
        email,
        'client' as role,
        'actif' as status,
        CURRENT_TIMESTAMP as created_at
      FROM client
      ORDER BY id_client DESC
      LIMIT 3)
      UNION ALL
      (SELECT 
        id_liv as id,
        nom || ' ' || prenom as name,
        email,
        'livreur' as role,
        'actif' as status,
        CURRENT_TIMESTAMP as created_at
      FROM livreur
      ORDER BY id_liv DESC
      LIMIT 2)
    `);
    
    // Get monthly statistics - only for months that have actual orders
    const monthlyStats = await db.query(`
      SELECT 
        TO_CHAR(date_commande, 'Month') as month,
        EXTRACT(MONTH FROM date_commande) as month_num,
        EXTRACT(YEAR FROM date_commande) as year,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM commande
      GROUP BY TO_CHAR(date_commande, 'Month'), EXTRACT(MONTH FROM date_commande), EXTRACT(YEAR FROM date_commande)
      ORDER BY year DESC, month_num DESC
      LIMIT 12
    `);
    
    const monthlyData = monthlyStats.rows.map(row => ({
      month: row.month.trim(),
      orders: parseInt(row.orders),
      revenue: parseFloat(row.revenue)
    }));

    const dashboardStats = {
      totalUsers: totalUsers,
      totalOrders: parseInt(stats.total_orders),
      totalRevenue: parseFloat(stats.total_revenue),
      activeDeliveries: 0,
      pendingOrders: parseInt(stats.pending_orders),
      recentOrders: recentOrders,
      recentUsers: recentUsersResult.rows,
      monthlyData: monthlyData,
      salesByCategory: {
        restaurant: 0,
        boutique: 0,
        pharmacie: 0
      },
      monthlyRevenue: []
    };
    
    res.json(dashboardStats);
  } catch (error) {
    console.error('❌ Error loading admin dashboard:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
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