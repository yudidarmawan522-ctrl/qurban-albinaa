const mysql = require('mysql2/promise');
require('dotenv').config();

const correctTypes = [
    { id: 'S-TIPE-A', category: 'SAPI', type: 'Tipe A', weight: '390-400 Kg', price: 35000000, price_per_share: 5000000, stock: 5 },
    { id: 'S-TIPE-B', category: 'SAPI', type: 'Tipe B', weight: '340-350 Kg', price: 28000000, price_per_share: 4000000, stock: 8 },
    { id: 'S-TIPE-C', category: 'SAPI', type: 'Tipe C', weight: '320-330 Kg', price: 21000000, price_per_share: 3000000, stock: 10 },
    { id: 'S-TIPE-D', category: 'SAPI', type: 'Tipe D', weight: '230-240 Kg', price: 17500000, price_per_share: 2500000, stock: 12 },
    
    { id: 'D-SUPER', category: 'DOMBA', type: 'SUPER', weight: '45-60 Kg', price: 4500000, price_per_share: null, stock: 20 },
    { id: 'D-TIPE-A', category: 'DOMBA', type: 'A', weight: '31-35 Kg', price: 3500000, price_per_share: null, stock: 25 },
    { id: 'D-TIPE-B', category: 'DOMBA', type: 'B', weight: '26-30 Kg', price: 3000000, price_per_share: null, stock: 30 },
    { id: 'D-TIPE-C', category: 'DOMBA', type: 'C', weight: '20-25 Kg', price: 2500000, price_per_share: null, stock: 40 },
    { id: 'D-TIPE-D', category: 'DOMBA', type: 'D', weight: '15-19 Kg', price: 2000000, price_per_share: null, stock: 50 }
];

async function resetPrices() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'qurban_db'
    });

    try {
        console.log('Resetting animal types to correct prices...');
        for (const t of correctTypes) {
            const query = `
                INSERT INTO animal_types (id, category, type, weight, price, price_per_share, stock) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                category = VALUES(category), type = VALUES(type), weight = VALUES(weight), 
                price = VALUES(price), price_per_share = VALUES(price_per_share), stock = VALUES(stock)
            `;
            await connection.query(query, [t.id, t.category, t.type, t.weight, t.price, t.price_per_share, t.stock]);
        }
        console.log('Success resetting prices!');
    } catch (err) {
        console.error('Failed to reset prices:', err);
    } finally {
        await connection.end();
    }
}

resetPrices();
