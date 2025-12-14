# 🧪 Guide de Test - Connexion Frontend-Backend

## ✅ Services Démarrés

### Backend (Port 5000)
```
🚀 Delivery Express API v1.0.0
📍 Environment: development
🌐 Server: http://localhost:5000
💾 Database: NeonDB (PostgreSQL) ✅
☁️ Media Storage: Cloudinary ✅
```

### Frontend (Port 4201)
```
➜  Local: http://localhost:4201/
📦 Build: Success (150.56 kB)
🔥 Hot Reload: Enabled
```

## 🎯 Tests à Effectuer

### 1. Test de l'API Backend
Ouvrez PowerShell et testez les endpoints:

```powershell
# Dashboard Stats
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard" | ConvertTo-Json

# Liste des produits
Invoke-RestMethod -Uri "http://localhost:5000/api/products" | ConvertTo-Json

# Liste des commandes
Invoke-RestMethod -Uri "http://localhost:5000/api/orders" | ConvertTo-Json

# Health check
Invoke-RestMethod -Uri "http://localhost:5000/api/health" | ConvertTo-Json
```

### 2. Test du Frontend

#### A. Page d'accueil
1. Ouvrez http://localhost:4201
2. Vérifiez que la page se charge correctement
3. Naviguez vers les différentes sections (Restaurant, Boutique, Pharmacie)

#### B. Authentification
1. Allez sur http://localhost:4201/signin
2. Testez la connexion avec:
   - Email: `test@test.com`
   - Password: `password`
3. Observez la console du navigateur (F12) pour voir la requête HTTP

#### C. Inscription
1. Allez sur http://localhost:4201/signup
2. Remplissez le formulaire
3. Observez la requête API dans la console

#### D. Dashboard Admin
1. Allez sur http://localhost:4201/admin/dashboard
2. Les données doivent se charger depuis l'API
3. Vérifiez dans la console Network (F12) que les requêtes sont faites à `http://localhost:5000/api/admin/dashboard`

### 3. Vérification des Services

#### Dans Chrome DevTools (F12):

**Console Tab:**
```javascript
// Devrait afficher les requêtes et réponses
```

**Network Tab:**
- Filtrez par "XHR"
- Vous devriez voir les requêtes vers `localhost:5000/api/...`
- Status: 200 OK
- Response: JSON data

**Application Tab:**
- Local Storage → devrait contenir `auth_token` après connexion

## 🔍 Points de Vérification

### ✅ Backend
- [ ] Serveur démarre sans erreur
- [ ] Base de données connectée (NeonDB)
- [ ] CORS activé pour localhost:4201
- [ ] Endpoints répondent correctement

### ✅ Frontend
- [ ] Application compile sans erreur
- [ ] Services Angular créés
- [ ] HttpClient configuré
- [ ] Composants mis à jour pour utiliser les services

### ✅ Connexion
- [ ] Requêtes HTTP envoyées au backend
- [ ] Réponses reçues et affichées
- [ ] Pas d'erreurs CORS
- [ ] Token JWT sauvegardé après login

## 🐛 Dépannage

### Erreur CORS
Si vous voyez une erreur CORS dans la console:
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:4201' has been blocked by CORS
```
**Solution:** Le backend est déjà configuré pour accepter localhost:4201. Redémarrez le backend.

### Connexion refusée
Si vous voyez `ERR_CONNECTION_REFUSED`:
```
net::ERR_CONNECTION_REFUSED at http://localhost:5000/api/...
```
**Solution:** Vérifiez que le backend est bien démarré sur le port 5000.

### Port déjà utilisé
Si le frontend ne démarre pas:
```
Port 4201 is already in use
```
**Solution:** Utilisez un autre port avec `ng serve --port 4202`

## 📊 Endpoints Disponibles

### Auth
- POST `/api/auth/login` - Connexion
- POST `/api/auth/register` - Inscription
- POST `/api/auth/logout` - Déconnexion

### Users
- GET `/api/users` - Liste des utilisateurs
- GET `/api/users/:id` - Détails d'un utilisateur
- POST `/api/users` - Créer un utilisateur

### Products
- GET `/api/products` - Liste des produits
- GET `/api/products/:id` - Détails d'un produit
- GET `/api/products/category/:category` - Produits par catégorie

### Orders
- GET `/api/orders` - Liste des commandes
- GET `/api/orders/:id` - Détails d'une commande
- POST `/api/orders` - Créer une commande
- PUT `/api/orders/:id/status` - Mettre à jour le statut

### Admin
- GET `/api/admin/dashboard` - Statistiques dashboard
- GET `/api/admin/reports` - Rapports
- GET `/api/admin/analytics` - Analytiques

## 🚀 Commandes Rapides

### Démarrer Backend
```bash
cd backend
node server.js
```

### Démarrer Frontend
```bash
cd frontend
ng serve --port 4201
```

### Tester API
```bash
curl http://localhost:5000/api/health
```

---

**Status:** ✅ Frontend et Backend connectés et fonctionnels  
**Date:** 13 décembre 2025
