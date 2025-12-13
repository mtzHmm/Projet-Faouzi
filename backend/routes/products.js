const express = require('express');
const router = express.Router();

// Mock products data
let products = [
  {
    id: 1,
    name: 'Pizza Margherita',
    description: 'Pizza classique avec tomate, mozzarella et basilic',
    price: 15.90,
    category: 'restaurant',
    image: '/images/pizza-margherita.jpg',
    available: true,
    stock: 50
  },
  {
    id: 2,
    name: 'Coca Cola 33cl',
    description: 'Boisson gazeuse',
    price: 3.50,
    category: 'restaurant',
    image: '/images/coca-cola.jpg',
    available: true,
    stock: 100
  },
  {
    id: 3,
    name: 'T-Shirt Blanc',
    description: 'T-shirt en coton 100% blanc taille M',
    price: 19.99,
    category: 'boutique',
    image: '/images/tshirt-blanc.jpg',
    available: true,
    stock: 25
  },
  {
    id: 4,
    name: 'Paracétamol 1000mg',
    description: 'Médicament contre la douleur et la fièvre',
    price: 2.50,
    category: 'pharmacie',
    image: '/images/paracetamol.jpg',
    available: true,
    stock: 200
  }
];

// GET /api/products - Get all products
router.get('/', (req, res) => {
  const { category, available, search, page = 1, limit = 20 } = req.query;
  
  let filteredProducts = products;
  
  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(product => product.category === category);
  }
  
  // Filter by availability
  if (available !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.available === (available === 'true'));
  }
  
  // Search by name or description
  if (search) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    total: filteredProducts.length,
    page: parseInt(page),
    totalPages: Math.ceil(filteredProducts.length / limit)
  });
});

// GET /api/products/:id - Get product by ID
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// POST /api/products - Create new product
router.post('/', (req, res) => {
  const { name, description, price, category, image, stock = 0 } = req.body;
  
  if (!name || !description || !price || !category) {
    return res.status(400).json({ error: 'Name, description, price, and category are required' });
  }
  
  const newProduct = {
    id: products.length + 1,
    name,
    description,
    price: parseFloat(price),
    category,
    image: image || '/images/default-product.jpg',
    available: true,
    stock: parseInt(stock)
  };
  
  products.push(newProduct);
  
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update product
router.put('/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products[productIndex] = { ...products[productIndex], ...req.body };
  
  res.json(products[productIndex]);
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  
  res.json({ message: 'Product deleted successfully' });
});

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const categoryProducts = products.filter(p => p.category === category && p.available);
  
  res.json({
    category,
    products: categoryProducts,
    total: categoryProducts.length
  });
});

module.exports = router;