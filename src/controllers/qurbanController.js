const { readDB, writeDB } = require('../config/database');

// Qurban Controller
const getQurbanTypes = (req, res) => {
    const db = readDB();
    res.json(db.types);
};

const getSettings = (req, res) => {
    const db = readDB();
    res.json(db.settings);
};

const createOrUpdateType = (req, res) => {
    const db = readDB();
    const newType = req.body;
    
    if (!newType.id) {
        newType.id = (newType.category[0] + '-' + newType.type).toUpperCase().replace(/\s+/g, '-');
    }

    const index = db.types.findIndex(t => t.id === newType.id);
    if (index !== -1) {
        db.types[index] = { ...db.types[index], ...newType };
    } else {
        db.types.push(newType);
    }

    writeDB(db);
    res.json({ message: 'Success', type: newType });
};

const updateSettings = (req, res) => {
    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    writeDB(db);
    res.json({ success: true, settings: db.settings });
};

module.exports = { getQurbanTypes, getSettings, createOrUpdateType, updateSettings };
