# 🗄️ NeonDB Database Structure - Delivery Express

## 📊 Database Overview
- **Database Name:** neondb
- **Database Type:** PostgreSQL 15+
- **Owner:** neondb_owner
- **Total Tables:** 8
- **Custom Types:** categorie_type (ENUM)

---

## 🎨 Custom Types

### categorie_type (ENUM)
```sql
CREATE TYPE categorie_type AS ENUM ('courses', 'restaurant', 'pharmacie', 'boutique');
```
**Purpose:** Define valid category types for products and stores

---

## 📋 Table Structures

### 🏷️ CATEGORIE (Product Categories)
```sql
CREATE TABLE categorie (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL,
    type categorie_type NOT NULL,
    
    CONSTRAINT check_categorie_type CHECK (
        type = ANY (ARRAY['courses'::categorie_type, 'restaurant'::categorie_type, 
                          'pharmacie'::categorie_type, 'boutique'::categorie_type])
    )
);
```
**Purpose:** Organize products into categories by type  
**Key Fields:** nom (unique category name), type (category type ENUM)  
**Indexes:** 
- `categorie_nom_key` (UNIQUE BTREE on nom)
- `categorie_pkey` (UNIQUE BTREE on id)

---

### 👤 CLIENT (Customer Management)
```sql
CREATE TABLE client (
    id_client SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    tel INTEGER,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    gouv_client VARCHAR(100),
    ville_client VARCHAR(100),
    
    CONSTRAINT client_role_check CHECK (
        role::text = ANY (ARRAY['CLIENT', 'ADMIN']::text[])
    )
);
```
**Purpose:** Store customer information and authentication  
**Key Fields:** email (unique), role (CLIENT/ADMIN), gouv_client (governorate), ville_client (city)  
**Indexes:**
- `client_email_key` (UNIQUE BTREE on email)
- `client_pkey` (UNIQUE BTREE on id_client)  
**Constraints:** role must be 'CLIENT' or 'ADMIN'

---

### 🏪 MAGASIN (Store/Restaurant Management)
```sql
CREATE TABLE magasin (
    id_magazin SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    tel INTEGER,
    type VARCHAR(50),
    gouv_magasin VARCHAR(100),
    ville_magasin VARCHAR(100)
);
```
**Purpose:** Store information for restaurants, pharmacies, shops  
**Key Fields:** type (restaurant/pharmacy/boutique/courses), gouv_magasin (governorate), ville_magasin (city)  
**Indexes:**
- `magasin_email_key` (UNIQUE BTREE on email)
- `magasin_pkey` (UNIQUE BTREE on id_magazin)

---

### 🚚 LIVREUR (Delivery Driver Management)
```sql
CREATE TABLE livreur (
    id_liv SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    tel INTEGER,
    vehicule VARCHAR(20),
    ville_livraison VARCHAR(100),
    disponibilite TIME,
    gouv_livreur VARCHAR(100),
    
    CONSTRAINT livreur_vehicule_check CHECK (
        vehicule::text = ANY (ARRAY['voiture', 'moto']::text[])
    )
);
```
**Purpose:** Manage delivery drivers and their availability  
**Key Fields:** vehicule (voiture/moto), disponibilite (working hours), gouv_livreur (governorate)  
**Indexes:**
- `livreur_email_key` (UNIQUE BTREE on email)
- `livreur_pkeySERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix BIGINT NOT NULL,
    id_magazin INTEGER NOT NULL,
    image_url VARCHAR(255),
    categorie_id INTEGER,
    prescription_required BOOLEAN DEFAULT false,
    
    CONSTRAINT fk_produit_magasin 
        FOREIGN KEY (id_magazin) REFERENCES magasin(id_magazin) ON DELETE CASCADE,
    CONSTRAINT fk_produit_categorie 
        FOREIGN KEY (categorie_id) REFERENCES categorie(id) ON DELETE RESTRICT
);
```
**Purpose:** Product listings for all stores  
**Foreign Keys:** 
- id_magazin → magasin.id_magazin (CASCADE)
- categorieSERIAL PRIMARY KEY,
    date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'en attente',
    total DOUBLE PRECISION NOT NULL,
    id_client INTEGER NOT NULL,
    user_name VARCHAR,
    user_email VARCHAR,
    user_phone VARCHAR,
    delivery_address TEXT,
    city VARCHAR,
    governorate VARCHAR,
    postal_code VARCHAR,
    additional_notes TEXT,
    subtotal DOUBLE PRECISION DEFAULT 0,
    tax DOUBLE PRECISION DEFAULT 0,
    delivery_fee DOUBLE PRECISION DEFAULT 0,
    
    CONSTRAINT fk_commande_client 
        FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE CASCADE,
    CONSTRAINT commande_status_check CHECK (
        status::text = ANY (ARRAY['en attente', 'en cours', 'préparée', 'annulée', 'livraison', 'livrée']::text[])
    )
);
```
**Purpose:** SERIAL PRIMARY KEY,
    quantite INTEGER NOT NULL,
    id_cmd INTEGER NOT NULL,
    id_produit INTEGER NOT NULL,
    
    CONSTRAINT fk_ligne_cmd 
        FOREIGN KEY (id_cmd) REFERENCES commande(id_cmd) ON DELETE CASCADE,
    CONSTRAINT fk_ligne_produit 
        FOREIGN KEY (id_produit) REFERENCES produit(id_produit) ON DELETE CASCADE,
    CONSTRAINT ligne_commande_quantite_check CHECK (quantite > 0)
);
```
**Purpose:** Individual items within each order  
**Foreign Keys:**
- id_cmd → commande.id_cmd (CASCADE)
- id_produit → produit.id_produit (CASCADE)  
**Indexes:**SERIAL PRIMARY KEY,
    id_cmd INTEGER UNIQUE NOT NULL,
    id_liv INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'en cours de livraison',
    
    CONSTRAINT fk_livraison_commande 
        FOREIGN KEY (id_cmd) REFERENCES commande(id_cmd) ON DELETE CASCADE,
    CONSTRAINT fk_livraison_livreur 
        FOREIGN KEY (id_liv) REFERENCES livreur(id_liv) ON DELETE SET NULL,
    CONSTRAINT livraison_status_check CHECK (
        status::text = ANY (ARRAY['en cours de livraison', 'livrée']::text[])
    )
);
```
**Purpose:** Track delivery progress and driver assignment  
**Foreign Keys:**
- id_cmd → commande.id_cmd (CASCADE, UNIQUE)
- id_liv → livreur.id_liv (SET NULL - optional)  
**Status Values:** 'en cours de livraison', 'livrée'  
**Indexes:**
- `livraison_id_cmd_key` (UNIQUE BTREE on id_cmd)
- `livraison_livreur_idx` (BTREE on id_liv)
- `livraison_status_idx` (BTREE on status)
- `livraison_pkey` (UNIQUE BTREE on id_livraison)  
**Note:** Each order (id_cmd) can only have ONE delivery recordcmd_seq'),
    date_commande DATE NOT NULL,
    status VARCHAR,
    total DOUBLE PRECISION NOT NULL,
    id_client INTEGER NOT NULL
);
```
**Purpose:** Main order records  
**Foreign Key:** id_client → client.id_client  
**Status Values:** PENDING, CONFIRMED, PREPARING, READY, DELIVERED

---

### 📝 LIGNE_COMMANDE (Order Line Items)
```sql
CREATE TABLE ligne_commande (
    id_ligne INTEGER PRIMARY KEY DEFAULT nextval('ligne_commande_id_ligne_seq'),
    quantite INTEGER NOT NULL,
    id_cmd INTEGER NOT NULL,
    id_produit INTEGER NOT NULL
);
```
**Purpose:** Individual items within each order  
**Foreign Keys:**
- id_cmd → commande.id_cmd
- id_produit → produit.id_produit

---

### 🚛 LIVRAISON (Delivery Tracking)
```sql
CREATE TABLE livraison (
    id_livraison INTEGER PRIMARY KEY DEFAULT nextval('livraison_id_livraison_seq'),
    date_liv DATE NOT NULL,
    heure_estimee TIME,
    status VARCHAR,
    id_cmd INTEGER NOT NULL,
    id_liv INTEGER NOT NULL,

### Order Lifecycle:
1. **MAGASIN** creates **PRODUIT** in specific **CATEGORIE**
2. **CLIENT** browses products and adds to cart
3. **CLIENT** places **COMMANDE** with multiple **LIGNE_COMMANDE** items
4. Order status: 'en attente' → 'en cours' → 'préparée'
5. **LIVRAISON** record created and assigned to **LIVREUR**
6. Delivery status: 'en cours de livraison' → 'livrée'
7. Order status updated to 'livrée'

### Status Progression:
```
COMMANDE Status:
en attente → en cours → préparée → livraison → livrée
            ↓
         annulée (any time before 'livrée')

LIVRAISON Status:
en cours de livraison → livrée
```

## 🔐 Authentication & User Management

### User Types & Tables:
- **CLIENT**: Customer accounts in `client` table
  - Role: 'CLIENT' or 'ADMIN'
  - Includes delivery address fields (gouv_client, ville_client)
  
- **MAGASIN**: Store/Restaurant accounts in `magasin` table
  - Type: restaurant, pharmacie, boutique, courses
  - Includes location fields (gouv_magasin, ville_magasin)
  
- **LIVREUR**: Delivery driver accounts in `livreur` table
  - Vehicle type: 'voiture' or 'moto'
  - Includes availability and location fields

### Password Security
- All passwords hashed using **bcryptjs** (salt rounds: 10)
- JWT tokens for session management
- Email field is UNIQUE across all user tables

## 📊 Database Views

### v_commande_details
Complete order information with customer details:
```sql
SELECT id_cmd, date_commande, status, total, delivery_address,
       client_name, client_email, client_tel
FROM v_commande_details;
```

### v_produit_complet
Products with store and category information:
```sql
SELECT produit_nom, prix, magasin_nom, magasin_type, 
       categorie_nom, categorie_type
FROM v_produit_complet;
```

### v_livraison_complete
Full delivery tracking with all related information:
```sql
SELECT id_livraison, livraison_status, delivery_address,
       livreur_name, vehicule, client_name
FROM v_livraison_complete;
```

## 🎯 Important Constraints

### Data Integrity:
- **UNIQUE Constraints**: email (client, magasin, livreur), nom (categorie), id_cmd (livraison)
- **CHECK Constraints**: 
  - client.role ∈ ['CLIENT', 'ADMIN']
  - livreur.vehicule ∈ ['voiture', 'moto']
  - commande.status ∈ ['en attente', 'en cours', 'préparée', 'annulée', 'livraison', 'livrée']
  - livraison.status ∈ ['en cours de livraison', 'livrée']
  - ligne_commande.quantite > 0

### Cascade Behavior:
- **CASCADE Deletes**: Delete client → deletes all their orders → deletes order items
- **CASCADE Deletes**: Delete magasin → deletes all products → removes from order items
- **SET NULL**: Delete livreur → sets livraison.id_liv to NULL (keeps delivery record)
- **RESTRICT**: Cannot delete categorie if products exist in that category

## 🗂️ Default Categories

Pre-populated categories include:
- **Restaurant**: Pizza, Burger, Pasta, Dessert, Boisson
- **Pharmacie**: Médicaments, Vitamines, Cosmétiques, Hygiène
- **Boutique**: Vêtements, Électronique, Alimentation
- **Courses**: Livres, Fournitures
    id INTEGER PRIMARY KEY DEFAULT nextval('categorie_id_seq'),
    nom VARCHAR NOT NULL,
    type USER-DEFINED NOT NULL
);
```
**Purpose:** Define product categories for classification  
**Key Fields:** nom (category name), type (category type)

---

### ⭐ AVIS (Reviews & Ratings)
```sql
CREATE TABLE avis (
    id_av INTEGER PRIMARY KEY DEFAULT nextval('avis_id_av_seq'),
    note_liv INTEGER,
    note_mag INTEGER,
    id_cmd INTEGER
);
```
**Purpose:** Customer feedback on deliveries and stores  
**Foreign Key:** id_cmd → commande.id_cmd  
**Rating Scale:** 1-5 stars

---

## 🔗 Database Relationships

```
CLIENT (1) ──── (N) COMMANDE
                  │
                  ├─── (1) ──── (N) LIGNE_COMMANDE ──── (N) ──── (1) PRODUIT
                  │                                                   │
                  ├─── (1) ──── (1) LIVRAISON ──── (N) ──── (1) LIVREUR
                  │
                  └─── (1) ──── (1) AVIS

MAGASIN (1) ──── (N) PRODUIT
CATEGORIE (1) ──── (N) PRODUIT
```

## 📱 Application Flow
1. **MAGASIN** creates **PRODUIT**
2. **CLIENT** places **COMMANDE** with multiple **LIGNE_COMMANDE**
3. **LIVRAISON** assigned to **LIVREUR**
4. Delivery completed, **AVIS** created for feedback

## 🔐 Authentication & User Management

### User Registration Process
- **CLIENT**: Stored in `client` table + address in `adresse` table
- **MAGASIN**: Stored in `magasin` table with store address in `adresse` field
- **LIVREUR**: Stored in `livreur` table with city information

### Password Security
- All passwords hashed using **bcryptjs** (salt rounds: 10)
- JWT tokens for session management
- Role-based access control

### Address Structure
```sql
-- For clients: separate adresse table with structured fields
INSERT INTO adresse (rue, ville, code_postal, complement, id_client)
VALUES ('123 Main St', 'Paris', '75001', 'Apt 4B', 1);

-- For stores: formatted address string in magasin table
UPDATE magasin SET adresse = '456 Business Ave, Lyon 69001' WHERE id_magazin = 1;
```

## 🎯 Current Status
- ✅ All 8 tables created with proper constraints
- ✅ Custom ENUM type (categorie_type) defined
- ✅ Primary keys and sequences configured
- ✅ Foreign keys with appropriate CASCADE/RESTRICT/SET NULL behavior
- ✅ CHECK constraints for data validation
- ✅ UNIQUE constraints on email fields and category names
- ✅ Indexes created for performance optimization
- ✅ Default categories pre-populated
- ✅ Database views for common queries

## 🚀 Setup Instructions

### Method 1: Using SQL File (Recommended)
```bash
# Run the complete schema file
psql -U your_username -d your_database -f backend/database-schema.sql
```

### Method 2: Using NeonDB Web Console
1. Log into your NeonDB dashboard
2. Open SQL Editor
3. Copy contents from `backend/database-schema.sql`
4. Execute the script

### Method 3: Using Node.js Script
```bash
cd backend
node clean-setup-db.js
```

## 📝 Notes

### Price Storage
- All prices stored as **BIGINT** (in cents)
- Example: 12.50 DT stored as 1250
- Convert on display: `prix / 100`

### Date/Time Fields
- `date_commande`: Automatically set to current date
- `disponibilite`: Store delivery driver working hours

### Required vs Optional Fields
**Required (NOT NULL):**
- All name fields (nom, prenom)
- Email addresses
- Passwords (hashed)
- Order amounts and dates

**Optional (can be NULL):**
- Phone numbers (tel)
- Image URLs
- Category references
- Delivery driver assignment (id_liv in livraison)
- Address details
- Additional notes

## 🔧 Maintenance

### View All Tables:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

### Check Table Sizes:
```sql
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Reset Database (CAUTION):
```sql
TRUNCATE TABLE ligne_commande, livraison, commande, produit, categorie, magasin, livreur, client RESTART IDENTITY CASCADE;
```

---

**Last Updated:** December 21, 2025  
**Database Version:** PostgreSQL 15+  
**Schema Version:** 2.0