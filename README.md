# 🚚 Delivery Express

A comprehensive full-stack delivery platform built with **Angular** and **Node.js/Express.js**, supporting restaurant food delivery, boutique shopping, pharmacy orders, and course deliveries.

![Angular](https://img.shields.io/badge/Angular-20.x-red?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-5.x-blue?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [📦 Prerequisites](#-prerequisites)
- [⚙️ Installation](#️-installation)
- [🗄️ Database Setup](#️-database-setup)
- [🔧 Configuration](#-configuration)
- [▶️ Running the Application](#️-running-the-application)
- [🏗️ Project Structure](#️-project-structure)
- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🌐 API Endpoints](#-api-endpoints)
- [🚀 Deployment](#-deployment)
- [❓ Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

For experienced developers who want to get started quickly:

```bash
# Clone repository
git clone https://github.com/your-username/Projet-Faouzi.git
cd Projet-Faouzi

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment (see Configuration section)
# Edit backend/.env with your database credentials

# Run both servers
cd ../backend
npm run dev:full
```

**Frontend:** http://localhost:4200  
**Backend API:** http://localhost:5000

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your PC:

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Should output: `v18.x.x` or higher

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`
   - Should output: `9.x.x` or higher

3. **Angular CLI** (v20.x)
   - Install globally: `npm install -g @angular/cli@20`
   - Verify installation: `ng version`

4. **PostgreSQL Database**
   - **Option A:** Local PostgreSQL
     - Download from: https://www.postgresql.org/download/
     - Install PostgreSQL 15 or higher
   - **Option B:** Cloud Database (Recommended)
     - NeonDB: https://neon.tech/ (Free tier available)
     - Supabase: https://supabase.com/
     - ElephantSQL: https://www.elephantsql.com/

5. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### Optional Tools

- **VSCode** (Recommended IDE): https://code.visualstudio.com/
- **Postman** (for API testing): https://www.postman.com/
- **pgAdmin** (PostgreSQL GUI): https://www.pgadmin.org/

---

## ⚙️ Installation

Follow these steps carefully to set up the project on your PC.

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/Projet-Faouzi.git
cd Projet-Faouzi
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all required Node.js packages including:
- Express.js (web framework)
- PostgreSQL client (pg)
- bcryptjs (password hashing)
- CORS, helmet (security)
- dotenv (environment variables)
- And more...

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install Angular and all related packages.

---

## 🗄️ Database Setup

### Option 1: Using NeonDB (Cloud - Recommended)

1. **Create a NeonDB Account**
   - Go to https://neon.tech/
   - Sign up for a free account
   - Create a new project

2. **Get Connection Details**
   - Copy the connection string from your NeonDB dashboard
   - It should look like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

3. **Create Database Tables**
   - NeonDB provides a SQL editor in the dashboard
   - Run the SQL schema file from the project:
     - Navigate to `backend/database-schema.sql` in the project
     - Copy the entire SQL file content
     - Paste into NeonDB SQL Editor and click "Run"
   - This will create all 8 tables with proper structure:
     - `categorie` - Product categories with types
     - `client` - Customer accounts
     - `livreur` - Delivery drivers
     - `magasin` - Stores/restaurants/pharmacies
     - `produit` - Products catalog
     - `commande` - Orders with full details
     - `ligne_commande` - Order line items
     - `livraison` - Delivery tracking

### Option 2: Using Local PostgreSQL

1. **Install PostgreSQL**
   - Download and install from https://www.postgresql.org/download/
   - Remember the password you set for the `postgres` user during installation

2. **Create Database**
   - Open pgAdmin or use command line:
   ```bash
   psql -U postgres
   CREATE DATABASE delivery_express;
   \c delivery_express
   ```

3. **Create Tables**
   - Execute the complete schema file:
   ```bash
   psql -U postgres -d delivery_express -f path/to/backend/database-schema.sql
   ```
   - Or copy and paste the contents of `backend/database-schema.sql` into pgAdmin Query Tool

---

## 🔧 Configuration

### Backend Configuration

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create Environment File:**
   
   Create a file named `.env` in the `backend` folder with the following content:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:4200

   # Database Configuration (NeonDB Example)
   DB_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
   DB_HOST=your-host.neon.tech
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_SSL=true

   # For local PostgreSQL, use:
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_NAME=delivery_express
   # DB_USER=postgres
   # DB_PASSWORD=your-local-password
   # DB_SSL=false

   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Session Secret
   SESSION_SECRET=your-random-secret-key-here
   ```

3. **Replace Placeholder Values:**
   - Replace `DB_URL`, `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` with your actual database credentials
   - If using Cloudinary for images, add your credentials (or leave blank for basic functionality)
   - Generate a random string for `SESSION_SECRET`

### Frontend Configuration

The frontend is pre-configured to connect to `http://localhost:5000` for the backend API. If you need to change this:

1. **Navigate to:** `frontend/src/environments/`
2. **Edit `environment.ts`:**
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000'
   };
   ```

---

## ▶️ Running the Application

### Method 1: Run Both Servers Simultaneously (Recommended)

From the `backend` directory:

```bash
cd backend
npm run dev:full
```

This command will:
- Start the backend server on http://localhost:5000
- Start the Angular development server on http://localhost:4200
- Both servers will run concurrently with hot-reload enabled

### Method 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# or
ng serve
```

### Verify Everything is Running

1. **Backend API:** Open http://localhost:5000/api/health
   - Should return: `{"status":"ok","timestamp":"...","database":{"connected":true}}`

2. **Frontend:** Open http://localhost:4200
   - Should display the Delivery Express homepage

---

## 🏗️ Project Structure

## 🏗️ Project Structure

```
Projet-Faouzi/
├── frontend/                 # Angular 20.x application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Shared components (header, footer)
│   │   │   ├── pages/        # Feature modules
│   │   │   │   ├── admin/    # Admin dashboard
│   │   │   │   ├── restaurant/ # Restaurant ordering
│   │   │   │   ├── boutique/ # Shopping platform
│   │   │   │   ├── pharmacie/ # Pharmacy orders
│   │   │   │   └── courses/  # Course delivery
│   │   │   └── services/     # Angular services
│   │   └── assets/          # Static assets
│   └── package.json
├── backend/                 # Node.js/Express.js API
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── models/            # Data models
│   ├── middleware/        # Custom middleware
│   ├── .env              # Environment variables
│   └── server.js         # Main server file
├── .gitignore
├── .gitattributes
└── README.md
```

## ✨ Features

### 🏪 **Multi-Category Platform**
- **🍕 Restaurant Delivery** - Food ordering and delivery tracking
- **🛍️ Boutique Shopping** - Fashion and retail products
- **💊 Pharmacy Orders** - Medication and health products
- **📚 Course Delivery** - Educational materials and books

### 👥 **User Management**
- **Client Registration & Login**
- **Delivery Person Dashboard**
- **Admin Control Panel**
- **Role-based Access Control**

### 📊 **Admin Dashboard**
- Real-time order tracking
- User management system
- Revenue analytics
- Delivery performance metrics
- Comprehensive reporting

### 🔧 **Technical Features**
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live order status
- **RESTful API** - Clean, documented endpoints
- **Security** - CORS, Helmet.js, input validation
- **Error Handling** - Comprehensive error management

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** Angular 20.x
- **Language:** TypeScript 5.x
- **Styling:** CSS3, Angular Material
- **State Management:** Angular Services
- **Routing:** Angular Router
- **HTTP Client:** Angular HttpClient

### **Backend**
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.x
- **Language:** JavaScript (ES6+)
- **Security:** Helmet.js, CORS
- **Logging:** Morgan
- **Environment:** dotenv
- **Development:** Nodemon, Concurrently

### **Development Tools**
- **Version Control:** Git & GitHub
- **Package Manager:** npm
- **Code Editor:** VS Code
- **API Testing:** Built-in endpoints

## 📦 Installation

### **Prerequisites**
- Node.js 18+ and npm
- Git
- Modern web browser

### **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm start
```

### **Frontend Setup**
```bash
cd frontend
npm install
ng serve
```

## 🔧 Development

### **Start Development Servers**
```bash
# Backend only
cd backend
npm run dev

# Frontend only
cd frontend
ng serve

# Both servers simultaneously
cd backend
npm run dev:full
```

### **Available Scripts**

**Backend (`/backend`)**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run dev:full` - Start both backend and frontend

**Frontend (`/frontend`)**
- `ng serve` - Start development server
- `ng build` - Build for production
- `ng test` - Run unit tests
- `ng lint` - Run linting

## 🌐 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### **Users**
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### **Orders**
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/summary` - Order statistics

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### **Admin**
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/reports` - Generate reports
- `GET /api/admin/analytics` - Analytics data

**API Documentation:** http://localhost:5000 (when server is running)

## 🚀 Deployment

### **Frontend (Angular)**
```bash
cd frontend
ng build --configuration production
# Deploy 'dist/' folder to your hosting service
```

### **Backend (Node.js)**
```bash
cd backend
# Set NODE_ENV=production in your environment
npm start
```

### **Environment Variables**
```bash
# Backend .env configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
JWT_SECRET=your-secure-secret
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Development Guidelines**
- Follow Angular style guide
- Use TypeScript strict mode
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

## ❓ Troubleshooting

### Common Issues and Solutions

#### 1. **Backend Server Won't Start**

**Problem:** Error `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change the port in backend/.env
PORT=5001
```

#### 2. **Database Connection Failed**

**Problem:** `Error: connect ECONNREFUSED` or `Database health check failed`

**Solutions:**
- Verify `.env` file has correct database credentials
- Check if PostgreSQL service is running (for local setup)
- Test connection string using a database client (pgAdmin, DBeaver)
- Ensure your IP is whitelisted (for cloud databases like NeonDB)
- Check SSL settings: `DB_SSL=true` for cloud, `false` for local

**Test connection:**
```bash
cd backend
node -e "require('./config/database').initialize().then(() => console.log('Connected!')).catch(err => console.error(err))"
```

#### 3. **Frontend Can't Connect to Backend**

**Problem:** `HttpErrorResponse: 0 Unknown Error` or CORS errors

**Solutions:**
- Ensure backend server is running on port 5000
- Check `FRONTEND_URL` in backend `.env` matches frontend URL
- Verify API URL in `frontend/src/environments/environment.ts`
- Clear browser cache and restart Angular dev server

#### 4. **Angular CLI Not Found**

**Problem:** `'ng' is not recognized as an internal or external command`

**Solution:**
```bash
# Install Angular CLI globally
npm install -g @angular/cli@20

# Verify installation
ng version

# If still not working, use npx:
npx ng serve
```

#### 5. **npm install Errors**

**Problem:** Dependency installation failures

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Linux/Mac
# or
rmdir /s node_modules                   # Windows
del package-lock.json                   # Windows

# Reinstall
npm install

# If using an older Node version, update Node.js to v18+
```

#### 6. **Port Already in Use (Frontend)**

**Problem:** Port 4200 is already in use

**Solution:**
```bash
# Run on a different port
ng serve --port 4201

# Or kill the process using port 4200
# Windows:
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

#### 7. **Environment Variables Not Loading**

**Problem:** `.env` file not being read

**Solutions:**
- Ensure `.env` file is in the `backend` folder (not root)
- Check file name is exactly `.env` (not `.env.txt`)
- No spaces around `=` sign: `PORT=5000` not `PORT = 5000`
- Restart the backend server after editing `.env`

#### 8. **Images Not Uploading**

**Problem:** Product images fail to upload

**Solution:**
- Configure Cloudinary credentials in `.env`
- Or set up local file storage
- Check file size limits and supported formats

#### 9. **TypeScript Compilation Errors**

**Problem:** Frontend build fails with TypeScript errors

**Solution:**
```bash
# Update TypeScript
npm install typescript@latest

# Clear Angular cache
ng cache clean

# Rebuild
ng serve
```

#### 10. **"Module not found" Errors**

**Problem:** Import errors in Angular

**Solution:**
```bash
# Ensure all dependencies are installed
cd frontend
npm install

# Clear and rebuild
rm -rf .angular
ng serve
```

### Getting Help

If you encounter issues not covered here:

1. **Check the logs:**
   - Backend: Terminal running `npm run dev`
   - Frontend: Browser console (F12)
   - Database: Check database logs

2. **Verify versions:**
   ```bash
   node --version    # Should be v18+
   npm --version     # Should be v9+
   ng version        # Should be v20+
   ```

3. **Common commands to reset everything:**
   ```bash
   # Stop all servers (Ctrl+C)
   
   # Backend reset
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   
   # Frontend reset
   cd frontend
   rm -rf node_modules package-lock.json .angular
   npm install
   
   # Restart servers
   cd backend
   npm run dev:full
   ```

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🛟 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/your-username/Projet-Faouzi/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/Projet-Faouzi/discussions)

---

**🚚 Delivery Express** - Connecting businesses with customers through seamless delivery experiences.

*Built with ❤️ using Angular and Node.js*