const database = require('./config/database');

async function checkOrders() {
  try {
    await database.initialize();
    const db = database.getPool();
    
    // Check if the commande table has any records
    const orderQuery = 'SELECT * FROM commande ORDER BY id_cmd DESC LIMIT 5';
    const orderResult = await db.query(orderQuery);
    
    console.log('📋 Recent orders in commande table:');
    if (orderResult.rows.length === 0) {
      console.log('❌ No orders found in database');
    } else {
      orderResult.rows.forEach((order, index) => {
        console.log(`${index + 1}. Order ID: ${order.id_cmd}, Client: ${order.id_client}, Total: ${order.total}, Status: ${order.status}`);
      });
    }
    
    // Check ligne_commande table
    const lineItemQuery = 'SELECT * FROM ligne_commande ORDER BY id_ligne DESC LIMIT 5';
    const lineResult = await db.query(lineItemQuery);
    
    console.log('\n📦 Recent line items in ligne_commande table:');
    if (lineResult.rows.length === 0) {
      console.log('❌ No line items found in database');
    } else {
      lineResult.rows.forEach((item, index) => {
        console.log(`${index + 1}. Line ID: ${item.id_ligne}, Order: ${item.id_cmd}, Product: ${item.id_produit}, Qty: ${item.quantite}`);
      });
    }
    
    await database.close();
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkOrders();