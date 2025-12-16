const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'your-actual-cloud-name',    // Replace with your cloud name from dashboard
  api_key: 'your-actual-api-key',          // Replace with your API key
  api_secret: 'your-actual-api-secret'     // Replace with your API secret
});

/**
 * Upload images to Cloudinary
 * 
 * Instructions:
 * 1. Save the three attached images as:
 *    - easy-to-order.png (first image with woman and phone)
 *    - fastest-delivery.png (second image with delivery scooter)
 *    - best-quality.png (third image with restaurant staff)
 * 
 * 2. Update the cloudinary.config above with your actual credentials
 * 
 * 3. Run: node upload-images.js
 */

async function uploadImage(imagePath, publicId) {
  try {
    console.log(`Uploading ${imagePath}...`);
    
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: 'home-features',
      resource_type: 'image',
      format: 'webp',
      quality: 'auto:good',
      transformation: [
        { width: 400, height: 300, crop: 'fit', quality: 'auto:good' }
      ]
    });

    console.log(`✅ Successfully uploaded: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Error uploading ${imagePath}:`, error.message);
    return null;
  }
}

async function uploadAllImages() {
  const images = [
    {
      path: './assets/easy-to-order.png',
      publicId: 'easy-to-order'
    },
    {
      path: './assets/fastest-delivery.png', 
      publicId: 'fastest-delivery'
    },
    {
      path: './assets/best-quality.png',
      publicId: 'best-quality'
    }
  ];

  console.log('🚀 Starting image upload to Cloudinary...\n');

  const results = [];
  for (const image of images) {
    if (fs.existsSync(image.path)) {
      const result = await uploadImage(image.path, image.publicId);
      if (result) {
        results.push({
          name: image.publicId,
          url: result.secure_url
        });
      }
    } else {
      console.log(`⚠️  Image not found: ${image.path}`);
      console.log('   Please save the attached images to the assets folder first.');
    }
  }

  console.log('\n📋 Upload Results:');
  console.log('==================');
  results.forEach(result => {
    console.log(`${result.name}: ${result.url}`);
  });

  console.log('\n🔧 Next Steps:');
  console.log('1. Copy the URLs above');
  console.log('2. Update the image src URLs in home.component.html');
  console.log('3. Replace "your-cloud-name" with your actual cloud name in the URLs');
}

// Create assets folder if it doesn't exist
if (!fs.existsSync('./assets')) {
  fs.mkdirSync('./assets');
  console.log('📁 Created assets folder');
}

// Run the upload
uploadAllImages().catch(console.error);