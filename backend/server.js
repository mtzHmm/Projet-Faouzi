const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Import configurations
const appProperties = require('./config/app.properties');
const database = require('./config/database');
const cloudinaryConfig = require('./config/cloudinary');

const app = express();
const PORT = appProperties.app.port;

// Initialize services
async function initializeServices() {
  try {
    // Initialize database
    await database.initialize();
    
    // Initialize Cloudinary
    cloudinaryConfig.initialize();
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
    process.exit(1);
  }
}

// Middleware
app.use(helmet()); // Security middleware
app.use(cors(appProperties.cors));
app.use(morgan('combined')); // Logging
app.use(compression()); // Gzip compression
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    const cloudinaryHealth = await cloudinaryConfig.healthCheck();
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        cloudinary: cloudinaryHealth,
        api: { status: 'healthy' }
      },
      environment: appProperties.app.env,
      version: appProperties.app.version
    };
    
    const allHealthy = dbHealth.status === 'healthy' && cloudinaryHealth.status === 'healthy';
    res.status(allHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Delivery Express API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      orders: '/api/orders',
      products: '/api/products',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    status: status,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with service initialization
async function startServer() {
  try {
    // Initialize services first
    await initializeServices();
    
    // Start the server
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 ${appProperties.app.name} v${appProperties.app.version}`);
      console.log(`📍 Environment: ${appProperties.app.env}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`🔗 Frontend: ${appProperties.app.frontendUrl}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`💾 Database: NeonDB (PostgreSQL)`);
      console.log(`☁️ Media Storage: Cloudinary`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await database.close();
  process.exit(0);
});

// Start the application
startServer();

module.exports = app;