const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'qurban_db'
    });

    try {
        console.log('Adding proof_image column to registrations...');
        await connection.query('ALTER TABLE registrations ADD COLUMN proof_image TEXT AFTER status');
        console.log('Success!');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column proof_image already exists.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        await connection.end();
    }
}

migrate();
