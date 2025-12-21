# 📋 Database Schema Changelog

## Version 2.0 - December 21, 2025

### 🎯 Major Changes

Complete database restructure to match the new standardized schema.

### ✨ New Features

1. **Custom ENUM Type**
   - Added `categorie_type` ENUM for category types
   - Values: 'courses', 'restaurant', 'pharmacie', 'boutique'

2. **Enhanced Tables**
   - All tables now have proper constraints and indexes
   - Foreign keys with appropriate CASCADE/RESTRICT/SET NULL behavior
   - CHECK constraints for data validation

3. **New Database Views**
   - `v_commande_details` - Orders with customer details
   - `v_produit_complet` - Products with store and category info
   - `v_livraison_complete` - Full delivery tracking details

### 🔄 Table Changes

#### categorie (New Structure)
- `id` SERIAL PRIMARY KEY
- `nom` VARCHAR(100) UNIQUE NOT NULL
- `type` categorie_type NOT NULL
- Added CHECK constraint for type validation
- Added UNIQUE index on nom

#### client (Renamed from 'users')
- Renamed `id` → `id_client`
- Added `gouv_client` VARCHAR(100) for governorate
- Added `ville_client` VARCHAR(100) for city
- Added CHECK constraint for role validation
- Email field now VARCHAR(100) with UNIQUE constraint
- Phone field changed to INTEGER type

#### livreur (New Table - Delivery Drivers)
- `id_liv` SERIAL PRIMARY KEY
- `nom`, `prenom` VARCHAR(50) NOT NULL
- `email` VARCHAR(100) UNIQUE NOT NULL
- `mot_de_passe` VARCHAR(255) NOT NULL
- `tel` INTEGER
- `vehicule` VARCHAR(20) with CHECK constraint
- `ville_livraison`, `gouv_livreur` VARCHAR(100)
- `disponibilite` TIME

#### magasin (New Table - Stores)
- `id_magazin` SERIAL PRIMARY KEY
- `nom` VARCHAR(100) NOT NULL
- `email` VARCHAR(100) UNIQUE NOT NULL
- `mot_de_passe` VARCHAR(255) NOT NULL
- `tel` INTEGER
- `type` VARCHAR(50)
- `gouv_magasin`, `ville_magasin` VARCHAR(100)

#### produit (Renamed from 'produits')
- Renamed `id` → `id_produit`
- Added `id_magazin` INTEGER NOT NULL (FK to magasin)
- Added `categorie_id` INTEGER (FK to categorie)
- Added `prescription_required` BOOLEAN DEFAULT false
- `prix` changed to BIGINT (stores cents)
- `image_url` now VARCHAR(255)
- Added foreign key constraints with CASCADE
- Added indexes on foreign keys

#### commande (Renamed from 'commandes')
- Renamed `id` → `id_cmd`
- Changed `user_id` → `id_client`
- Added extensive delivery information fields:
  - `user_name`, `user_email`, `user_phone`
  - `delivery_address` TEXT
  - `city`, `governorate`, `postal_code`
  - `additional_notes` TEXT
- Added price breakdown fields:
  - `subtotal` DOUBLE PRECISION
  - `tax` DOUBLE PRECISION
  - `delivery_fee` DOUBLE PRECISION
- Changed `statut` → `status` VARCHAR(20)
- Added CHECK constraint for status values
- `date_commande` now defaults to CURRENT_DATE
- Added indexes on id_client, status, and date_commande

#### ligne_commande (Renamed from 'commande_items')
- Renamed `id` → `id_ligne`
- Renamed `commande_id` → `id_cmd`
- Renamed `produit_id` → `id_produit`
- Renamed `quantite` preserved
- Removed `prix_unitaire` (calculated from produit.prix)
- Added CHECK constraint (quantite > 0)
- Added indexes on foreign keys

#### livraison (Completely Restructured)
- `id_livraison` SERIAL PRIMARY KEY
- `id_cmd` INTEGER UNIQUE NOT NULL (one delivery per order)
- `id_liv` INTEGER (FK to livreur, optional)
- `status` VARCHAR(30) NOT NULL
- Removed `date_liv`, `heure_estimee`, `ville`, `gouvernorat`
- Added UNIQUE constraint on id_cmd
- Added CHECK constraint for status
- Foreign key with CASCADE on commande
- Foreign key with SET NULL on livreur

### ⚠️ Breaking Changes

1. **Table Names Changed:**
   - `users` → `client`
   - `produits` → `produit`
   - `commandes` → `commande`
   - `commande_items` → `ligne_commande`

2. **Column Names Changed:**
   - Most `id` columns now have descriptive names (id_client, id_cmd, etc.)
   - `statut` → `status` in commande table
   - `user_id` → `id_client` in commande table

3. **Data Type Changes:**
   - Phone numbers: VARCHAR → INTEGER
   - Prices: DECIMAL(10,2) → BIGINT (now stores cents)
   - Email fields: VARCHAR(255) → VARCHAR(100)

4. **Removed Tables:**
   - `adresse` (address info now in respective tables)
   - `avis` (reviews - to be reimplemented later)

5. **New Required Fields:**
   - `produit.id_magazin` (products must belong to a store)
   - `commande.date_commande` (now has default)
   - Various address fields in commande

### 🔧 Migration Path

For existing databases:

1. **Backup your data:**
   ```sql
   CREATE TABLE backup_users AS SELECT * FROM users;
   CREATE TABLE backup_produits AS SELECT * FROM produits;
   CREATE TABLE backup_commandes AS SELECT * FROM commandes;
   ```

2. **Run migration script:**
   ```bash
   node backend/migrate-database.js
   ```

3. **Or use clean setup:**
   ```bash
   psql -U username -d dbname -f backend/database-schema.sql
   ```

### 📚 New Documentation Files

- `backend/database-schema.sql` - Complete SQL schema
- `backend/database-structure.md` - Detailed structure documentation
- `backend/migrate-database.js` - Migration script
- `DATABASE_REFERENCE.md` - Quick reference guide
- `DATABASE_CHANGELOG.md` - This file

### 🎓 Default Data

**Pre-populated Categories:**
- Restaurant: Pizza, Burger, Pasta, Dessert, Boisson
- Pharmacie: Médicaments, Vitamines, Cosmétiques, Hygiène
- Boutique: Vêtements, Électronique, Alimentation
- Courses: Livres, Fournitures

### 🔐 Security Improvements

- All email fields have UNIQUE constraints
- Role-based CHECK constraints
- Foreign key constraints prevent orphaned records
- Password fields sized for bcrypt hashes (255 chars)

### 📈 Performance Improvements

- Indexes on all foreign keys
- Indexes on frequently queried fields (email, status, dates)
- BTREE indexes for efficient lookups
- Optimized joins through proper foreign key structure

### 🚀 Next Steps

For developers working with the new schema:

1. Update API endpoints to use new table/column names
2. Update frontend models to match new structure
3. Adjust queries to use new foreign key relationships
4. Update authentication to handle separate user tables
5. Test all CRUD operations with new constraints

---

## Version 1.0 - Initial Release

### Original Tables
- users
- produits
- commandes
- commande_items
- adresse
- avis

Basic structure without proper constraints and foreign keys.

---

**Schema Version:** 2.0  
**Last Updated:** December 21, 2025  
**Next Review:** As needed for new features
