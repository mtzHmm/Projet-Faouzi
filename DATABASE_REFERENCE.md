# 📚 Database Quick Reference Guide

Quick reference for the Delivery Express database schema.

## 🗂️ Tables Overview

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| **categorie** | Product categories | id, nom, type (ENUM) |
| **client** | Customer accounts | id_client, email, nom, prenom, role |
| **livreur** | Delivery drivers | id_liv, email, nom, prenom, vehicule |
| **magasin** | Stores/Restaurants | id_magazin, nom, email, type |
| **produit** | Products catalog | id_produit, nom, prix, image_url |
| **commande** | Orders | id_cmd, status, total, delivery_address |
| **ligne_commande** | Order items | id_ligne, quantite, id_cmd, id_produit |
| **livraison** | Delivery tracking | id_livraison, id_cmd, id_liv, status |

---

## 🔑 Primary Keys

```sql
categorie.id
client.id_client
livreur.id_liv
magasin.id_magazin
produit.id_produit
commande.id_cmd
ligne_commande.id_ligne
livraison.id_livraison
```

---

## 🔗 Foreign Keys

```sql
-- Products belong to stores and categories
produit.id_magazin      → magasin.id_magazin
produit.categorie_id    → categorie.id

-- Orders belong to clients
commande.id_client      → client.id_client

-- Order items link orders and products
ligne_commande.id_cmd      → commande.id_cmd
ligne_commande.id_produit  → produit.id_produit

-- Deliveries link orders and drivers
livraison.id_cmd  → commande.id_cmd  (UNIQUE - one delivery per order)
livraison.id_liv  → livreur.id_liv   (optional - can be NULL)
```

---

## 📊 Common Queries

### Get all products with store info
```sql
SELECT p.*, m.nom as magasin_nom, m.type as magasin_type
FROM produit p
JOIN magasin m ON p.id_magazin = m.id_magazin;
```

### Get customer orders with details
```sql
SELECT c.id_cmd, c.date_commande, c.total, c.status,
       cl.nom, cl.prenom, cl.email
FROM commande c
JOIN client cl ON c.id_client = cl.id_client
WHERE cl.id_client = ?;
```

### Get order items with product details
```sql
SELECT lc.quantite, p.nom, p.prix, p.description
FROM ligne_commande lc
JOIN produit p ON lc.id_produit = p.id_produit
WHERE lc.id_cmd = ?;
```

### Get delivery info with driver details
```sql
SELECT l.status, l.id_cmd,
       liv.nom || ' ' || liv.prenom as livreur_nom,
       liv.tel, liv.vehicule
FROM livraison l
LEFT JOIN livreur liv ON l.id_liv = liv.id_liv
WHERE l.id_cmd = ?;
```

### Get products by category and store type
```sql
SELECT p.*
FROM produit p
JOIN magasin m ON p.id_magazin = m.id_magazin
JOIN categorie c ON p.categorie_id = c.id
WHERE m.type = 'restaurant' AND c.type = 'restaurant';
```

---

## 🎯 Valid Values

### categorie.type (ENUM)
- `'courses'` - Course delivery
- `'restaurant'` - Restaurant food
- `'pharmacie'` - Pharmacy products
- `'boutique'` - Shop/boutique items

### client.role
- `'CLIENT'` - Regular customer
- `'ADMIN'` - Administrator

### livreur.vehicule
- `'voiture'` - Car
- `'moto'` - Motorcycle

### magasin.type
- `'restaurant'` - Restaurant/Food
- `'pharmacie'` - Pharmacy
- `'boutique'` - Shop/Boutique
- `'courses'` - Course delivery

### commande.status
- `'en attente'` - Pending
- `'en cours'` - In progress
- `'préparée'` - Prepared/Ready
- `'annulée'` - Cancelled
- `'livraison'` - Out for delivery
- `'livrée'` - Delivered

### livraison.status
- `'en cours de livraison'` - In delivery
- `'livrée'` - Delivered

---

## 💰 Price Format

- **Storage:** BIGINT (prices in cents)
- **Example:** 12.50 DT = `1250`
- **Display:** `prix / 100` or `prix::float / 100`

```sql
-- Insert product with price 25.99 DT
INSERT INTO produit (nom, prix, id_magazin) 
VALUES ('Pizza Margherita', 2599, 1);

-- Query with formatted price
SELECT nom, (prix::float / 100) as prix_dt FROM produit;
```

---

## 🛡️ Constraints Summary

### UNIQUE Constraints
- `client.email`
- `livreur.email`
- `magasin.email`
- `categorie.nom`
- `livraison.id_cmd` (one delivery per order)

### CHECK Constraints
- `client.role` ∈ ['CLIENT', 'ADMIN']
- `livreur.vehicule` ∈ ['voiture', 'moto']
- `commande.status` ∈ ['en attente', 'en cours', 'préparée', 'annulée', 'livraison', 'livrée']
- `livraison.status` ∈ ['en cours de livraison', 'livrée']
- `ligne_commande.quantite` > 0

### NOT NULL Fields
- All email fields
- All password fields (mot_de_passe)
- All name fields (nom, prenom)
- Product prices
- Order totals
- Order dates

---

## 🔄 Cascade Behavior

### ON DELETE CASCADE
When parent is deleted, children are automatically deleted:
- Delete `client` → deletes their `commande` → deletes `ligne_commande` and `livraison`
- Delete `magasin` → deletes their `produit` → removes from `ligne_commande`
- Delete `commande` → deletes `ligne_commande` and `livraison`
- Delete `produit` → removes from `ligne_commande`

### ON DELETE SET NULL
When parent is deleted, foreign key is set to NULL:
- Delete `livreur` → sets `livraison.id_liv` to NULL (keeps delivery record)

### ON DELETE RESTRICT
Cannot delete parent if children exist:
- Cannot delete `categorie` if products exist in that category

---

## 📝 Indexes

### Performance Indexes
```sql
-- Foreign key indexes
produit: id_magazin, categorie_id
commande: id_client, status, date_commande
ligne_commande: id_cmd, id_produit
livraison: id_liv, status

-- Unique indexes
categorie: nom
client: email
livreur: email
magasin: email
livraison: id_cmd
```

---

## 🚀 Sample Data Operations

### Create a customer
```sql
INSERT INTO client (email, nom, prenom, mot_de_passe, tel, role, gouv_client, ville_client)
VALUES ('john@example.com', 'Doe', 'John', 'hashed_password', 12345678, 'CLIENT', 'Tunis', 'Tunis');
```

### Create a store
```sql
INSERT INTO magasin (nom, email, mot_de_passe, type, tel, gouv_magasin, ville_magasin)
VALUES ('Pizza Palace', 'pizza@restaurant.com', 'hashed_password', 'restaurant', 87654321, 'Tunis', 'La Marsa');
```

### Create a product
```sql
INSERT INTO produit (nom, description, prix, id_magazin, categorie_id, image_url)
VALUES ('Pizza Margherita', 'Classic pizza with mozzarella', 1850, 1, 1, 'https://example.com/pizza.jpg');
```

### Create an order
```sql
BEGIN;

-- Insert order
INSERT INTO commande (id_client, total, status, delivery_address, city, governorate)
VALUES (1, 3700, 'en attente', '123 Main St', 'Tunis', 'Tunis')
RETURNING id_cmd;

-- Insert order items (assuming id_cmd = 1)
INSERT INTO ligne_commande (id_cmd, id_produit, quantite)
VALUES (1, 1, 2);

COMMIT;
```

### Assign delivery
```sql
INSERT INTO livraison (id_cmd, id_liv, status)
VALUES (1, 1, 'en cours de livraison');
```

---

## 🔍 Useful Admin Queries

### Count records in all tables
```sql
SELECT 'categorie' as table, COUNT(*) FROM categorie
UNION ALL
SELECT 'client', COUNT(*) FROM client
UNION ALL
SELECT 'livreur', COUNT(*) FROM livreur
UNION ALL
SELECT 'magasin', COUNT(*) FROM magasin
UNION ALL
SELECT 'produit', COUNT(*) FROM produit
UNION ALL
SELECT 'commande', COUNT(*) FROM commande
UNION ALL
SELECT 'ligne_commande', COUNT(*) FROM ligne_commande
UNION ALL
SELECT 'livraison', COUNT(*) FROM livraison;
```

### Get order statistics
```sql
SELECT 
    status,
    COUNT(*) as order_count,
    SUM(total) as total_revenue
FROM commande
GROUP BY status
ORDER BY order_count DESC;
```

### Get top-selling products
```sql
SELECT 
    p.nom,
    SUM(lc.quantite) as total_sold,
    COUNT(DISTINCT lc.id_cmd) as order_count
FROM produit p
JOIN ligne_commande lc ON p.id_produit = lc.id_produit
GROUP BY p.id_produit, p.nom
ORDER BY total_sold DESC
LIMIT 10;
```

### Get active deliveries
```sql
SELECT 
    l.id_livraison,
    c.id_cmd,
    cl.nom || ' ' || cl.prenom as client,
    liv.nom || ' ' || liv.prenom as livreur,
    c.delivery_address,
    l.status
FROM livraison l
JOIN commande c ON l.id_cmd = c.id_cmd
JOIN client cl ON c.id_client = cl.id_client
LEFT JOIN livreur liv ON l.id_liv = liv.id_liv
WHERE l.status = 'en cours de livraison';
```

---

## 📖 Documentation Files

- **Full Schema:** `backend/database-schema.sql`
- **Detailed Structure:** `backend/database-structure.md`
- **Migration Script:** `backend/migrate-database.js`
- **Setup Script:** `backend/clean-setup-db.js`

---

**Last Updated:** December 21, 2025
