const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(process.env.DATABASE_PATH || './data/database.json');

const readDB = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return { settings: {}, qurban_types: [], registrations: [] };
    }
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
};

module.exports = { readDB, writeDB };
