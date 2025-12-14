const database = require('./config/database');

async function checkUser(email) {
  try {
    await database.initialize();
    const db = database.getPool();
    
    console.log('🔍 Checking for user:', email);
    
    // Check client table
    const clientResult = await db.query(
      'SELECT id_client, email, prenom, nom FROM client WHERE email = $1',
      [email]
    );
    
    if (clientResult.rows.length > 0) {
      console.log('✅ Found in CLIENT table:', clientResult.rows[0]);
    } else {
      console.log('❌ Not found in client table');
    }
    
    // Check magasin table
    const magasinResult = await db.query(
      'SELECT id_magazin, email, nom FROM magasin WHERE email = $1',
      [email]
    );
    
    if (magasinResult.rows.length > 0) {
      console.log('✅ Found in MAGASIN table:', magasinResult.rows[0]);
    } else {
      console.log('❌ Not found in magasin table');
    }
    
    // Check livreur table
    const livreurResult = await db.query(
      'SELECT id_liv, email, nom FROM livreur WHERE email = $1',
      [email]
    );
    
    if (livreurResult.rows.length > 0) {
      console.log('✅ Found in LIVREUR table:', livreurResult.rows[0]);
    } else {
      console.log('❌ Not found in livreur table');
    }
    
    await database.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

const email = process.argv[2] || 'yacoubhend97@gmail.com';
checkUser(email);
