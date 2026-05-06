const pool = require('../config/database');

const getQurbanTypes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM animal_types');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching types:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

const getSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings LIMIT 1');
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json({});
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

const createOrUpdateType = async (req, res) => {
    try {
        const { category, type, weight, price, price_per_share, stock } = req.body;
        let id = req.body.id;
        
        if (!id) {
            id = (category[0] + '-' + type).toUpperCase().replace(/\s+/g, '-');
        }

        const query = `
            INSERT INTO animal_types (id, category, type, weight, price, price_per_share, stock) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            category = VALUES(category), type = VALUES(type), weight = VALUES(weight), 
            price = VALUES(price), price_per_share = VALUES(price_per_share), stock = VALUES(stock)
        `;
        
        await pool.query(query, [id, category, type, weight, price, price_per_share, stock]);
        
        res.json({ message: 'Success', type: req.body });
    } catch (error) {
        console.error('Error updating type:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

const updateSettings = async (req, res) => {
    try {
        const { target_sapi, target_domba, program_name, deadline } = req.body;
        
        const query = `
            UPDATE settings SET 
            target_sapi = ?, target_domba = ?, program_name = ?, deadline = ? 
            WHERE id = 1
        `;
        
        await pool.query(query, [target_sapi, target_domba, program_name, deadline]);
        res.json({ success: true, settings: req.body });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { getQurbanTypes, getSettings, createOrUpdateType, updateSettings };
