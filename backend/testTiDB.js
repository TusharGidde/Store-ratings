const mysql = require('mysql2/promise');
require('dotenv').config();

const testTiDBConnection = async () => {
  try {
    console.log('Testing TiDB connection...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false // TiDB Cloud requires SSL
      }
    });

    console.log('Connected to TiDB successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('TiDB Version:', rows[0].version);
    
    // Test if tables exist
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);
    
    console.log('Existing tables:', tables.map(t => t.TABLE_NAME));
    
    await connection.end();
    console.log('TiDB connection test completed successfully!');
    
  } catch (error) {
    console.error('TiDB connection failed:', error.message);
    console.error('Error details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
  }
};

testTiDBConnection();