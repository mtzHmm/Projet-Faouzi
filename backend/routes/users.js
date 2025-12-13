const express = require('express');
const router = express.Router();

// Mock users data
let users = [
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
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
  const { role, status, page = 1, limit = 10 } = req.query;
  
  let filteredUsers = users;
  
  // Filter by role
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  
  // Filter by status
  if (status) {
    filteredUsers = filteredUsers.filter(user => user.status === status);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  res.json({
    users: paginatedUsers,
    total: filteredUsers.length,
    page: parseInt(page),
    totalPages: Math.ceil(filteredUsers.length / limit)
  });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  const { name, email, role = 'client', status = 'active' } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    role,
    status,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  res.status(201).json(newUser);
});

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[userIndex] = { ...users[userIndex], ...req.body };
  
  res.json(users[userIndex]);
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  
  res.json({ message: 'User deleted successfully' });
});

module.exports = router;