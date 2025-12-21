# 🪟 Windows Setup Guide - Delivery Express

Complete step-by-step guide for setting up Delivery Express on Windows PC.

## 📋 Checklist

Before starting, ensure you have:
- [ ] Windows 10 or Windows 11
- [ ] Administrator access on your PC
- [ ] Stable internet connection
- [ ] At least 2GB free disk space

---

## Step 1: Install Node.js

1. **Download Node.js:**
   - Go to https://nodejs.org/
   - Download the **LTS** version (v18 or higher)
   - Choose "Windows Installer (.msi)" for your system (64-bit recommended)

2. **Install Node.js:**
   - Run the downloaded installer
   - Click "Next" through the installation wizard
   - ✅ Check "Automatically install the necessary tools"
   - Click "Install"
   - Wait for installation to complete

3. **Verify Installation:**
   - Open **Command Prompt** or **PowerShell**
   - Type: `node --version`
   - Should show: `v18.x.x` or higher
   - Type: `npm --version`
   - Should show: `9.x.x` or higher

---

## Step 2: Install Git

1. **Download Git:**
   - Go to https://git-scm.com/download/win
   - Download will start automatically

2. **Install Git:**
   - Run the installer
   - Use default settings (just click "Next")
   - Important: Select "Use Git from the Windows Command Prompt"

3. **Verify Installation:**
   - Open **new** Command Prompt window
   - Type: `git --version`
   - Should show: `git version 2.x.x`

---

## Step 3: Install Angular CLI

1. **Open Command Prompt or PowerShell as Administrator**
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Command Prompt (Admin)"

2. **Install Angular CLI:**
   ```powershell
   npm install -g @angular/cli@20
   ```
   - Wait for installation (2-3 minutes)

3. **Verify Installation:**
   ```powershell
   ng version
   ```
   - Should show Angular CLI version 20.x.x

---

## Step 4: Setup Database

### Option A: Use NeonDB (Cloud - Recommended for Beginners)

1. **Create Account:**
   - Go to https://neon.tech/
   - Click "Sign Up"
   - Use GitHub or Google to sign in

2. **Create Project:**
   - Click "Create a project"
   - Choose a name (e.g., "delivery-express")
   - Select region closest to you
   - Click "Create project"

3. **Get Connection String:**
   - On the project dashboard, find "Connection string"
   - Click "Copy" to copy the full connection string
   - Save it in Notepad - you'll need it later

4. **Create Database Tables:**
   - In NeonDB dashboard, click "SQL Editor"
   - Navigate to your project folder: `Projet-Faouzi\backend\`
   - Open the file `database-schema.sql` with Notepad
   - Copy ALL the content (Ctrl+A, Ctrl+C)
   - Paste into NeonDB SQL Editor
   - Click "Run" button
   - Wait for "Database schema created successfully!" message
   - This creates all 8 tables: categorie, client, livreur, magasin, produit, commande, ligne_commande, livraison

### Option B: Install PostgreSQL Locally

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download the installer (version 15 or higher)

2. **Install PostgreSQL:**
   - Run the installer
   - **Important:** Remember the password you set for postgres user!
   - Keep default port: 5432
   - Install all components

3. **Create Database:**
   - Open **pgAdmin** (installed with PostgreSQL)
   - Connect using your password
   - Right-click "Databases" → "Create" → "Database"
   - Name it: `delivery_express`
   - Click "Save"

3. **Create Tables:**
   - Right-click your new database → "Query Tool"
   - Navigate to project folder: `Projet-Faouzi\backend\`
   - Open `database-schema.sql` with Notepad
   - Copy ALL content and paste into Query Tool
   - Click Execute (▶️ button) or press F5
   - Verify tables created: You should see 8 tables in the left panel

---

## Step 5: Clone and Setup Project

1. **Choose Installation Location:**
   - Open File Explorer
   - Navigate to where you want the project (e.g., `C:\Users\YourName\Documents\`)
   - Copy the full path

2. **Open Command Prompt in that Location:**
   - In File Explorer, type `cmd` in the address bar and press Enter

3. **Clone Repository:**
   ```powershell
   git clone https://github.com/your-username/Projet-Faouzi.git
   cd Projet-Faouzi
   ```

4. **Install Backend Dependencies:**
   ```powershell
   cd backend
   npm install
   ```
   - This will take 2-5 minutes
   - Wait until you see "added XXX packages"

5. **Install Frontend Dependencies:**
   ```powershell
   cd ..\frontend
   npm install
   ```
   - This will take 3-7 minutes
   - Don't close the window while installing

---

## Step 6: Configure Environment

1. **Navigate to Backend Folder:**
   ```powershell
   cd ..\backend
   ```

2. **Create Configuration File:**
   - In File Explorer, open: `Projet-Faouzi\backend\`
   - Find `.env.example` file
   - Copy it and rename the copy to `.env`

3. **Edit .env File:**
   - Right-click `.env` → "Open with" → "Notepad"
   - Replace the placeholder values:

   **For NeonDB (Cloud):**
   ```env
   NEON_DATABASE_URL=paste-your-connection-string-here
   DB_HOST=your-host.neon.tech
   DB_NAME=neondb
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_SSL=true
   ```

   **For Local PostgreSQL:**
   ```env
   DB_HOST=localhost
   DB_NAME=delivery_express
   DB_USER=postgres
   DB_PASSWORD=your-postgres-password
   DB_SSL=false
   ```

4. **Save and Close** the `.env` file

---

## Step 7: Run the Application

### Option 1: Run Both Servers Together (Easiest)

1. **Open Command Prompt** in the `backend` folder
   ```powershell
   cd C:\Path\To\Projet-Faouzi\backend
   ```

2. **Start Both Servers:**
   ```powershell
   npm run dev:full
   ```

3. **Wait for both servers to start:**
   - You should see: "✅ Backend server running on port 5000"
   - And: "** Angular Live Development Server is listening on localhost:4200"

4. **Open Your Browser:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5000

### Option 2: Run Servers Separately

**Terminal 1 (Backend):**
```powershell
cd C:\Path\To\Projet-Faouzi\backend
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd C:\Path\To\Projet-Faouzi\frontend
npm start
```

---

## Step 8: Verify Everything Works

### Test Backend:
1. Open browser: http://localhost:5000/api/health
2. Should see:
   ```json
   {
     "status": "ok",
     "database": {
       "connected": true
     }
   }
   ```

### Test Frontend:
1. Open browser: http://localhost:4200
2. Should see the Delivery Express homepage
3. Try navigating to different pages

---

## 🚨 Common Windows Issues

### Issue: "Command not found" or "Not recognized"

**Solution:**
- Close and reopen Command Prompt after installing Node.js or Angular CLI
- Run Command Prompt as Administrator
- Restart your PC

### Issue: "Permission denied" or "EACCES"

**Solution:**
```powershell
# Run as Administrator
npm cache clean --force
npm install -g @angular/cli@20 --force
```

### Issue: Port already in use

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number from above)
taskkill /PID 12345 /F
```

### Issue: PowerShell script execution error

**Solution:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: npm install fails with "gyp ERR!"

**Solution:**
```powershell
# Install Windows Build Tools
npm install -g windows-build-tools
```

---

## 📝 Quick Reference Commands

### Starting the Project:
```powershell
cd C:\Path\To\Projet-Faouzi\backend
npm run dev:full
```

### Stopping the Servers:
- Press `Ctrl + C` in the terminal
- Type `Y` when asked to terminate

### Restarting After Changes:
- Backend: Automatically restarts (nodemon)
- Frontend: Automatically reloads in browser
- If issues: Stop and restart with `npm run dev:full`

### Checking if Services are Running:
```powershell
# Check if Node.js is running
tasklist | findstr "node"

# Check ports in use
netstat -ano | findstr "4200 5000"
```

---

## 🎓 Next Steps

Once everything is running:

1. **Create an admin account** at http://localhost:4200/signup
2. **Add some test products** through the admin panel
3. **Test the ordering process** as a customer
4. **Explore the code** in Visual Studio Code

---

## 🆘 Need Help?

If you're stuck:
1. Check the main `README.md` Troubleshooting section
2. Make sure all prerequisites are installed correctly
3. Verify `.env` file has correct database credentials
4. Check terminal for error messages
5. Try restarting your computer

**Still having issues?**
- Open an issue on GitHub
- Include error messages and screenshots
- Mention your Windows version and Node.js version

---

## ✅ Success Checklist

- [ ] Node.js installed (v18+)
- [ ] Git installed
- [ ] Angular CLI installed (v20)
- [ ] Database created and configured
- [ ] Project cloned from GitHub
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created and configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 4200
- [ ] Can access http://localhost:4200 in browser
- [ ] API health check returns success

**Congratulations! 🎉** You're ready to start developing!

---

*Made with 💙 for Windows developers*
