const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

/**
 * Application Properties Configuration
 * Centralized configuration for NeonDB, Cloudinary, and other services
 */
const appProperties = {
  // Application Settings
  app: {
    name: 'Delivery Express API',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200'
  },

  // Database Configuration (NeonDB)
  database: {
    url: process.env.NEON_DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    }
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    folders: {
      products: 'delivery-express/products',
      users: 'delivery-express/users',
      restaurants: 'delivery-express/restaurants',
      pharmacies: 'delivery-express/pharmacies'
    },
    transformations: {
      thumbnail: 'c_thumb,w_200,h_200',
      medium: 'c_scale,w_500',
      large: 'c_scale,w_1000'
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },

  // CORS Settings
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:4200',
      'http://localhost:3000',
      'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // File Upload Settings
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },

  // Email Configuration (for future use)
  email: {
    from: 'noreply@deliveryexpress.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY
  },

  // Payment Configuration (for future use)
  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePubKey: process.env.STRIPE_PUBLISHABLE_KEY
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    dateFormat: 'YYYY-MM-DD HH:mm:ss'
  }
};

module.exports = appProperties;