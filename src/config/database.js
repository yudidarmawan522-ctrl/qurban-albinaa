const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionConfig = process.env.MYSQL_URL || process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'qurban_db',
    port: process.env.DB_PORT || 3306
};

const pool = mysql.createPool(typeof connectionConfig === 'string' ? {
    uri: connectionConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
} : {
    ...connectionConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to MySQL Database');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error connecting to MySQL Database:', err);
    });

module.exports = pool;
