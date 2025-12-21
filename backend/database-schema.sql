-- ========================================
-- Delivery Express Database Schema
-- PostgreSQL 15+
-- ========================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS ligne_commande CASCADE;
DROP TABLE IF EXISTS livraison CASCADE;
DROP TABLE IF EXISTS commande CASCADE;
DROP TABLE IF EXISTS produit CASCADE;
DROP TABLE IF EXISTS categorie CASCADE;
DROP TABLE IF EXISTS magasin CASCADE;
DROP TABLE IF EXISTS livreur CASCADE;
DROP TABLE IF EXISTS client CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS categorie_type CASCADE;

-- ========================================
-- Create Custom Types
-- ========================================

CREATE TYPE categorie_type AS ENUM ('courses', 'restaurant', 'pharmacie', 'boutique');

-- ========================================
-- Table: categorie (Product Categories)
-- ========================================

CREATE TABLE categorie (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL,
    type categorie_type NOT NULL,
    
    -- Constraints
    CONSTRAINT check_categorie_type CHECK (
        type = ANY (ARRAY['courses'::categorie_type, 'restaurant'::categorie_type, 'pharmacie'::categorie_type, 'boutique'::categorie_type])
    )
);

-- Create indexes for categorie
CREATE UNIQUE INDEX categorie_nom_key ON categorie USING BTREE (nom);
CREATE UNIQUE INDEX categorie_pkey_idx ON categorie USING BTREE (id);

-- ========================================
-- Table: client (Customer Management)
-- ========================================

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
    
    -- Constraints
    CONSTRAINT client_role_check CHECK (
        role::text = ANY (ARRAY['CLIENT'::character varying, 'ADMIN'::character varying]::text[])
    )
);

-- Create indexes for client
CREATE UNIQUE INDEX client_email_key ON client USING BTREE (email);
CREATE UNIQUE INDEX client_pkey_idx ON client USING BTREE (id_client);

-- ========================================
-- Table: livreur (Delivery Driver Management)
-- ========================================

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
    
    -- Constraints
    CONSTRAINT livreur_vehicule_check CHECK (
        vehicule::text = ANY (ARRAY['voiture'::character varying, 'moto'::character varying]::text[])
    )
);

-- Create indexes for livreur
CREATE UNIQUE INDEX livreur_email_key ON livreur USING BTREE (email);
CREATE UNIQUE INDEX livreur_pkey_idx ON livreur USING BTREE (id_liv);

-- ========================================
-- Table: magasin (Store/Restaurant Management)
-- ========================================

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

-- Create indexes for magasin
CREATE UNIQUE INDEX magasin_email_key ON magasin USING BTREE (email);
CREATE UNIQUE INDEX magasin_pkey_idx ON magasin USING BTREE (id_magazin);

-- ========================================
-- Table: produit (Product Catalog)
-- ========================================

CREATE TABLE produit (
    id_produit SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix BIGINT NOT NULL,
    id_magazin INTEGER NOT NULL,
    image_url VARCHAR(255),
    categorie_id INTEGER,
    prescription_required BOOLEAN DEFAULT false,
    
    -- Foreign Keys
    CONSTRAINT fk_produit_magasin 
        FOREIGN KEY (id_magazin) 
        REFERENCES magasin(id_magazin) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_produit_categorie 
        FOREIGN KEY (categorie_id) 
        REFERENCES categorie(id) 
        ON DELETE RESTRICT
);

-- Create indexes for produit
CREATE INDEX produit_magazin_idx ON produit USING BTREE (id_magazin);
CREATE INDEX produit_categorie_idx ON produit USING BTREE (categorie_id);
CREATE UNIQUE INDEX produit_pkey_idx ON produit USING BTREE (id_produit);

-- ========================================
-- Table: commande (Order Management)
-- ========================================

CREATE TABLE commande (
    id_cmd SERIAL PRIMARY KEY,
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
    
    -- Foreign Keys
    CONSTRAINT fk_commande_client 
        FOREIGN KEY (id_client) 
        REFERENCES client(id_client) 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT commande_status_check CHECK (
        status::text = ANY (ARRAY['en attente'::text, 'en cours'::text, 'préparée'::text, 'annulée'::text, 'livraison'::text, 'livrée'::text])
    )
);

-- Create indexes for commande
CREATE INDEX commande_client_idx ON commande USING BTREE (id_client);
CREATE INDEX commande_status_idx ON commande USING BTREE (status);
CREATE INDEX commande_date_idx ON commande USING BTREE (date_commande);
CREATE UNIQUE INDEX commande_pkey_idx ON commande USING BTREE (id_cmd);

-- ========================================
-- Table: ligne_commande (Order Line Items)
-- ========================================

CREATE TABLE ligne_commande (
    id_ligne SERIAL PRIMARY KEY,
    quantite INTEGER NOT NULL,
    id_cmd INTEGER NOT NULL,
    id_produit INTEGER NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_ligne_cmd 
        FOREIGN KEY (id_cmd) 
        REFERENCES commande(id_cmd) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_ligne_produit 
        FOREIGN KEY (id_produit) 
        REFERENCES produit(id_produit) 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT ligne_commande_quantite_check CHECK (quantite > 0)
);

-- Create indexes for ligne_commande
CREATE INDEX ligne_commande_cmd_idx ON ligne_commande USING BTREE (id_cmd);
CREATE INDEX ligne_commande_produit_idx ON ligne_commande USING BTREE (id_produit);
CREATE UNIQUE INDEX ligne_commande_pkey_idx ON ligne_commande USING BTREE (id_ligne);

-- ========================================
-- Table: livraison (Delivery Tracking)
-- ========================================

CREATE TABLE livraison (
    id_livraison SERIAL PRIMARY KEY,
    id_cmd INTEGER UNIQUE NOT NULL,
    id_liv INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'en cours de livraison',
    
    -- Foreign Keys
    CONSTRAINT fk_livraison_commande 
        FOREIGN KEY (id_cmd) 
        REFERENCES commande(id_cmd) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_livraison_livreur 
        FOREIGN KEY (id_liv) 
        REFERENCES livreur(id_liv) 
        ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT livraison_status_check CHECK (
        status::text = ANY (ARRAY['en cours de livraison'::character varying, 'livrée'::character varying]::text[])
    )
);

-- Create indexes for livraison
CREATE UNIQUE INDEX livraison_id_cmd_key ON livraison USING BTREE (id_cmd);
CREATE INDEX livraison_livreur_idx ON livraison USING BTREE (id_liv);
CREATE INDEX livraison_status_idx ON livraison USING BTREE (status);
CREATE UNIQUE INDEX livraison_pkey_idx ON livraison USING BTREE (id_livraison);

-- ========================================
-- Insert Default Categories
-- ========================================

INSERT INTO categorie (nom, type) VALUES
    ('Pizza', 'restaurant'),
    ('Burger', 'restaurant'),
    ('Pasta', 'restaurant'),
    ('Dessert', 'restaurant'),
    ('Boisson', 'restaurant'),
    ('Médicaments', 'pharmacie'),
    ('Vitamines', 'pharmacie'),
    ('Cosmétiques', 'pharmacie'),
    ('Hygiène', 'pharmacie'),
    ('Vêtements', 'boutique'),
    ('Électronique', 'boutique'),
    ('Alimentation', 'boutique'),
    ('Livres', 'courses'),
    ('Fournitures', 'courses')
ON CONFLICT (nom) DO NOTHING;

-- ========================================
-- Create Views for Common Queries
-- ========================================

-- View: Orders with customer details
CREATE OR REPLACE VIEW v_commande_details AS
SELECT 
    c.id_cmd,
    c.date_commande,
    c.status,
    c.total,
    c.delivery_address,
    c.city,
    c.governorate,
    cl.nom || ' ' || cl.prenom AS client_name,
    cl.email AS client_email,
    cl.tel AS client_tel
FROM commande c
JOIN client cl ON c.id_client = cl.id_client;

-- View: Products with store and category info
CREATE OR REPLACE VIEW v_produit_complet AS
SELECT 
    p.id_produit,
    p.nom AS produit_nom,
    p.description,
    p.prix,
    p.image_url,
    p.prescription_required,
    m.nom AS magasin_nom,
    m.type AS magasin_type,
    cat.nom AS categorie_nom,
    cat.type AS categorie_type
FROM produit p
JOIN magasin m ON p.id_magazin = m.id_magazin
LEFT JOIN categorie cat ON p.categorie_id = cat.id;

-- View: Delivery tracking with full details
CREATE OR REPLACE VIEW v_livraison_complete AS
SELECT 
    l.id_livraison,
    l.status AS livraison_status,
    c.id_cmd,
    c.date_commande,
    c.delivery_address,
    c.city,
    c.governorate,
    c.total,
    liv.nom || ' ' || liv.prenom AS livreur_name,
    liv.tel AS livreur_tel,
    liv.vehicule,
    cl.nom || ' ' || cl.prenom AS client_name,
    cl.tel AS client_tel
FROM livraison l
JOIN commande c ON l.id_cmd = c.id_cmd
JOIN client cl ON c.id_client = cl.id_client
LEFT JOIN livreur liv ON l.id_liv = liv.id_liv;

-- ========================================
-- Grant Permissions (Optional)
-- ========================================

-- Grant all privileges on all tables to the database owner
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner;

-- ========================================
-- Database Setup Complete
-- ========================================

-- Display summary
SELECT 'Database schema created successfully!' AS message;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT COUNT(*) AS total_categories FROM categorie;
