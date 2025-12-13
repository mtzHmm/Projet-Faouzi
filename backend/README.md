# Delivery Express Backend API

A Node.js/Express.js backend API for the Delivery Express platform supporting restaurant, boutique, and pharmacy deliveries.

## 🚀 Features

- **RESTful API** with Express.js
- **Authentication** endpoints (login, register, logout)
- **User Management** (clients, delivery persons, admins)
- **Order Management** with status tracking
- **Product Catalog** with categories
- **Admin Dashboard** with statistics
- **CORS** enabled for frontend integration
- **Security** with Helmet.js
- **Request Logging** with Morgan
- **Environment Configuration** with dotenv

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── routes/                # API route handlers
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management
│   ├── orders.js         # Order management
│   ├── products.js       # Product catalog
│   └── admin.js          # Admin operations
├── controllers/          # Business logic (future use)
├── models/               # Data models (future use)
├── middleware/           # Custom middleware (future use)
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🛠️ Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env` file and configure variables
   - Set `FRONTEND_URL` to your Angular app URL
   - Set `PORT` for the backend server

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Both Frontend & Backend**
   ```bash
   npm run dev:full
   ```

## 📡 API Endpoints

### Health Check
- `GET /` - API welcome message
- `GET /api/health` - Health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Orders
- `GET /api/orders` - Get all orders (with filters)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/summary` - Order statistics

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/reports` - Various reports
- `GET /api/admin/analytics` - Analytics data
- `POST /api/admin/settings` - Update settings

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run dev:full` - Start both backend and frontend
- `npm test` - Run tests (not implemented yet)

## 🌐 Integration with Frontend

The backend is configured to work with the Angular frontend:

- **CORS enabled** for `http://localhost:4200`
- **JSON parsing** with 10MB limit
- **URL-encoded parsing** enabled
- **Security headers** with Helmet.js

## 📊 Example API Calls

### Get All Orders
```bash
curl http://localhost:5000/api/orders
```

### Create New User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","role":"client"}'
```

### Get Dashboard Stats
```bash
curl http://localhost:5000/api/admin/dashboard
```

## 🔮 Future Enhancements

- **Database Integration** (MongoDB/PostgreSQL)
- **JWT Authentication** middleware
- **File Upload** handling
- **Real-time updates** with Socket.io
- **Payment Integration** (Stripe)
- **Email Notifications**
- **API Rate Limiting**
- **Unit & Integration Tests**
- **API Documentation** with Swagger

## 🚦 Development Status

✅ **Completed:**
- Basic Express.js setup
- Route structure
- Mock data endpoints
- CORS configuration
- Error handling
- Environment configuration

🔄 **In Progress:**
- Database integration
- Authentication middleware
- File uploads

📋 **Planned:**
- Real-time features
- Payment processing
- Email notifications
- Comprehensive testing

---

**Server URL:** http://localhost:5000
**Health Check:** http://localhost:5000/api/health
**API Documentation:** Coming soon!