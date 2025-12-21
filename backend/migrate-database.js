/**
 * Database Migration Script
 * Migrates old database structure to new schema
 * 
 * CAUTION: This will modify your database structure!
 * Backup your data before running this script.
 */

const { Pool } = require('pg');
require('dotenv').config();

async function migrateDatabase() {
  console.log('🔄 Starting database migration to new schema...\n');

  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL || process.env.DB_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  let client;

  try {
    client = await pool.connect();
    
    console.log('✅ Connected to database\n');

    // Check if old tables exist
    const checkOldTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'produits', 'commandes')
    `);

    if (checkOldTables.rows.length > 0) {
      console.log('⚠️  WARNING: Old table structure detected!');
      console.log('This script will help migrate your data.\n');
      
      // Backup old data
      console.log('📦 Backing up existing data...');
      
      // Create backup tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS backup_users AS SELECT * FROM users;
        CREATE TABLE IF NOT EXISTS backup_produits AS SELECT * FROM produits;
        CREATE TABLE IF NOT EXISTS backup_commandes AS SELECT * FROM commandes;
      `);
      
      console.log('✅ Data backed up to backup_* tables\n');
    }

    // Create custom type
    console.log('🎨 Creating custom types...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE categorie_type AS ENUM ('courses', 'restaurant', 'pharmacie', 'boutique');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Custom types created\n');

    // Create or update tables
    console.log('📊 Creating/updating table structure...\n');

    // 1. Create categorie table
    console.log('Creating categorie table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categorie (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) UNIQUE NOT NULL,
        type categorie_type NOT NULL,
        CONSTRAINT check_categorie_type CHECK (
          type = ANY (ARRAY['courses'::categorie_type, 'restaurant'::categorie_type, 
                            'pharmacie'::categorie_type, 'boutique'::categorie_type])
        )
      );
      CREATE UNIQUE INDEX IF NOT EXISTS categorie_nom_key ON categorie USING BTREE (nom);
    `);

    // 2. Create client table
    console.log('Creating client table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS client (
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
          role::text = ANY (ARRAY['CLIENT'::character varying, 'ADMIN'::character varying]::text[])
        )
      );
      CREATE UNIQUE INDEX IF NOT EXISTS client_email_key ON client USING BTREE (email);
    `);

    // 3. Create livreur table
    console.log('Creating livreur table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS livreur (
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
          vehicule::text = ANY (ARRAY['voiture'::character varying, 'moto'::character varying]::text[])
        )
      );
      CREATE UNIQUE INDEX IF NOT EXISTS livreur_email_key ON livreur USING BTREE (email);
    `);

    // 4. Create magasin table
    console.log('Creating magasin table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS magasin (
        id_magazin SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        tel INTEGER,
        type VARCHAR(50),
        gouv_magasin VARCHAR(100),
        ville_magasin VARCHAR(100)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS magasin_email_key ON magasin USING BTREE (email);
    `);

    // 5. Create produit table
    console.log('Creating produit table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS produit (
        id_produit SERIAL PRIMARY KEY,
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
      CREATE INDEX IF NOT EXISTS produit_magazin_idx ON produit USING BTREE (id_magazin);
      CREATE INDEX IF NOT EXISTS produit_categorie_idx ON produit USING BTREE (categorie_id);
    `);

    // 6. Create commande table
    console.log('Creating commande table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS commande (
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
        CONSTRAINT fk_commande_client 
          FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE CASCADE,
        CONSTRAINT commande_status_check CHECK (
          status::text = ANY (ARRAY['en attente'::text, 'en cours'::text, 'préparée'::text, 
                                    'annulée'::text, 'livraison'::text, 'livrée'::text])
        )
      );
      CREATE INDEX IF NOT EXISTS commande_client_idx ON commande USING BTREE (id_client);
      CREATE INDEX IF NOT EXISTS commande_status_idx ON commande USING BTREE (status);
    `);

    // 7. Create ligne_commande table
    console.log('Creating ligne_commande table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ligne_commande (
        id_ligne SERIAL PRIMARY KEY,
        quantite INTEGER NOT NULL,
        id_cmd INTEGER NOT NULL,
        id_produit INTEGER NOT NULL,
        CONSTRAINT fk_ligne_cmd 
          FOREIGN KEY (id_cmd) REFERENCES commande(id_cmd) ON DELETE CASCADE,
        CONSTRAINT fk_ligne_produit 
          FOREIGN KEY (id_produit) REFERENCES produit(id_produit) ON DELETE CASCADE,
        CONSTRAINT ligne_commande_quantite_check CHECK (quantite > 0)
      );
      CREATE INDEX IF NOT EXISTS ligne_commande_cmd_idx ON ligne_commande USING BTREE (id_cmd);
      CREATE INDEX IF NOT EXISTS ligne_commande_produit_idx ON ligne_commande USING BTREE (id_produit);
    `);

    // 8. Create livraison table
    console.log('Creating livraison table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS livraison (
        id_livraison SERIAL PRIMARY KEY,
        id_cmd INTEGER UNIQUE NOT NULL,
        id_liv INTEGER,
        status VARCHAR(30) NOT NULL DEFAULT 'en cours de livraison',
        CONSTRAINT fk_livraison_commande 
          FOREIGN KEY (id_cmd) REFERENCES commande(id_cmd) ON DELETE CASCADE,
        CONSTRAINT fk_livraison_livreur 
          FOREIGN KEY (id_liv) REFERENCES livreur(id_liv) ON DELETE SET NULL,
        CONSTRAINT livraison_status_check CHECK (
          status::text = ANY (ARRAY['en cours de livraison'::character varying, 'livrée'::character varying]::text[])
        )
      );
      CREATE UNIQUE INDEX IF NOT EXISTS livraison_id_cmd_key ON livraison USING BTREE (id_cmd);
      CREATE INDEX IF NOT EXISTS livraison_livreur_idx ON livraison USING BTREE (id_liv);
    `);

    console.log('✅ All tables created/updated\n');

    // Insert default categories
    console.log('📝 Inserting default categories...');
    await client.query(`
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
    `);
    console.log('✅ Default categories inserted\n');

    // Show summary
    console.log('📊 Database Summary:');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables in database:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    const catCount = await client.query('SELECT COUNT(*) as count FROM categorie');
    console.log(`\n🏷️  Total Categories: ${catCount.rows[0].count}`);

    console.log('\n✅ Migration completed successfully!\n');
    console.log('⚠️  Note: If you had old tables (users, produits, commandes),');
    console.log('   they have been backed up to backup_* tables.');
    console.log('   Review your data and migrate it manually if needed.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

// Run migration
if (require.main === module) {
  migrateDatabase();
}

module.exports = migrateDatabase;
