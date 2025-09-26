const mysql = require('mysql2/promise');
require('dotenv').config();

// Local MySQL connection (your current data)
const localConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root', // Your local MySQL password
  database: 'store_rating_db'
};

// TiDB Cloud connection (your new database)
const tidbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
};

const migrateTables = async () => {
  let localConn, tidbConn;
  
  try {
    console.log('Starting migration from local MySQL to TiDB...');
    
    // Connect to both databases
    localConn = await mysql.createConnection(localConfig);
    tidbConn = await mysql.createConnection(tidbConfig);
    
    console.log('Connected to both databases');
    
    // Tables to migrate (in order due to foreign keys)
    const tables = ['users', 'stores', 'ratings'];
    
    for (const table of tables) {
      console.log(`\nMigrating table: ${table}`);
      
      // Get data from local MySQL
      const [rows] = await localConn.execute(`SELECT * FROM ${table}`);
      console.log(`Found ${rows.length} records in ${table}`);
      
      if (rows.length === 0) {
        console.log(`Skipping empty table: ${table}`);
        continue;
      }
      
      // Clear existing data in TiDB (optional)
      await tidbConn.execute(`DELETE FROM ${table}`);
      console.log(`Cleared existing data in TiDB ${table}`);
      
      // Insert data into TiDB
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map(() => '?').join(', ');
        
        const insertQuery = `
          INSERT INTO ${table} (${columns.join(', ')}) 
          VALUES (${placeholders})
        `;
        
        await tidbConn.execute(insertQuery, values);
      }
      
      console.log(`Migrated ${rows.length} records to TiDB ${table}`);
    }
    
    console.log('\nMigration completed successfully!');
    
    // Verify migration
    console.log('\nVerification:');
    for (const table of tables) {
      const [localCount] = await localConn.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const [tidbCount] = await tidbConn.execute(`SELECT COUNT(*) as count FROM ${table}`);
      
      console.log(`${table}: Local=${localCount[0].count}, TiDB=${tidbCount[0].count}`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (localConn) await localConn.end();
    if (tidbConn) await tidbConn.end();
  }
};

// Run migration
migrateTables();