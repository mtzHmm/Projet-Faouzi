const cloudinary = require('cloudinary').v2;
const appProperties = require('./app.properties');

/**
 * Cloudinary Configuration
 * Configures Cloudinary for image and media management
 */
class CloudinaryConfig {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize Cloudinary
  initialize() {
    try {
      const config = appProperties.cloudinary;
      
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
        secure: true
      });

      this.isInitialized = true;
      console.log('✅ Cloudinary configured successfully');
      
      return cloudinary;
    } catch (error) {
      console.error('❌ Cloudinary configuration failed:', error.message);
      throw new Error(`Cloudinary configuration failed: ${error.message}`);
    }
  }

  // Upload image with automatic optimization
  async uploadImage(imagePath, options = {}) {
    try {
      if (!this.isInitialized) {
        this.initialize();
      }

      const defaultOptions = {
        folder: appProperties.cloudinary.folders.products,
        resource_type: 'image',
        format: 'webp',
        quality: 'auto:good',
        fetch_format: 'auto'
      };

      const uploadOptions = { ...defaultOptions, ...options };
      
      const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
      
      console.log('Image uploaded successfully:', result.public_id);
      return {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Delete image
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Image deleted:', publicId);
      return result;
    } catch (error) {
      console.error('Image deletion failed:', error);
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  // Generate optimized URL
  generateUrl(publicId, transformation = 'medium') {
    try {
      const transformationString = appProperties.cloudinary.transformations[transformation] || transformation;
      
      return cloudinary.url(publicId, {
        transformation: transformationString,
        secure: true
      });
    } catch (error) {
      console.error('URL generation failed:', error);
      return null;
    }
  }

  // Upload multiple images
  async uploadMultipleImages(imagePaths, folder = 'products') {
    try {
      const uploadPromises = imagePaths.map(imagePath => 
        this.uploadImage(imagePath, { folder: appProperties.cloudinary.folders[folder] })
      );
      
      const results = await Promise.all(uploadPromises);
      console.log(`${results.length} images uploaded successfully`);
      return results;
    } catch (error) {
      console.error('Multiple image upload failed:', error);
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await cloudinary.api.ping();
      return { status: 'healthy', cloudinary: result, timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

// Create singleton instance
const cloudinaryConfig = new CloudinaryConfig();

module.exports = cloudinaryConfig;