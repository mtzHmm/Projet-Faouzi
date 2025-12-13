const { Pool } = require('pg');
const appProperties = require('./app.properties');

/**
 * NeonDB Database Configuration
 * Configures PostgreSQL connection for NeonDB
 */
class DatabaseConfig {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  // Initialize database connection pool
  async initialize() {
    try {
      const config = appProperties.database;
      
      // Create connection pool
      this.pool = new Pool({
        connectionString: config.url,
        host: config.host,
        port: config.port,
        database: config.name,
        user: config.user,
        password: config.password,
        ssl: config.ssl ? { rejectUnauthorized: false } : false,
        ...config.pool
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      console.log('✅ Database connected successfully to NeonDB');
      
      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  // Get database connection
  getPool() {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  // Execute query with error handling
  async query(text, params = []) {
    try {
      const start = Date.now();
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      console.log(`Query executed in ${duration}ms:`, text.substring(0, 50));
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Close database connection
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('Database connection closed');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as health');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

// Create singleton instance
const database = new DatabaseConfig();

module.exports = database;