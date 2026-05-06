const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/proofs');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error("Hanya file gambar yang diizinkan!"));
    }
});

// ==========================================
// AUTO-SETUP DATABASE (ANTI-PUSING SCRIPT)
// ==========================================
async function runAutoSetup() {
    console.log("Checking database tables...");
    try {
        // 1. Create Tables if they don't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin'
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS animal_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category ENUM('SAPI', 'DOMBA') NOT NULL,
                type VARCHAR(50) NOT NULL,
                weight VARCHAR(50),
                price DECIMAL(15,2) NOT NULL,
                price_per_share DECIMAL(15,2)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                santri_name VARCHAR(100),
                santri_class VARCHAR(50),
                type_id INT,
                purchase_type ENUM('Utuh', 'Patungan') DEFAULT 'Utuh',
                animal_no INT,
                payment_method VARCHAR(50),
                proof_image VARCHAR(255),
                penyembelih VARCHAR(50),
                notes TEXT,
                status ENUM('Pending', 'Confirmed') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (type_id) REFERENCES animal_types(id)
            )
        `);

        // 2. Insert Default Admin if empty
        const [users] = await db.query("SELECT * FROM users");
        if (users.length === 0) {
            await db.query("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
            console.log(">>> Default Admin created: user: admin | pass: admin123");
        }

        // 3. Insert Animal Types if empty
        const [types] = await db.query("SELECT * FROM animal_types");
        if (types.length === 0) {
            const defaultTypes = [
                ['SAPI', 'Tipe A', '± 250 - 300 Kg', 21000000, 3000000],
                ['SAPI', 'Tipe B', '± 300 - 350 Kg', 24500000, 3500000],
                ['SAPI', 'Tipe C', '± 350 - 400 Kg', 28000000, 4000000],
                ['SAPI', 'Tipe D', '± 400 - 500 Kg', 35000000, 5000000],
                ['DOMBA', 'Tipe Hemat', '± 18 - 22 Kg', 2300000, 0],
                ['DOMBA', 'Tipe Standar', '± 23 - 27 Kg', 2800000, 0],
                ['DOMBA', 'Tipe Premium', '± 28 - 33 Kg', 3500000, 0],
                ['DOMBA', 'Tipe Super', '± 35 - 45 Kg', 4500000, 0]
            ];
            await db.query("INSERT INTO animal_types (category, type, weight, price, price_per_share) VALUES ?", [defaultTypes]);
            console.log(">>> Default Animal Types seeded!");
        }
        
    } catch (err) {
        console.error("Auto-setup failed:", err);
    }
}
runAutoSetup();

// ==========================================
// API ROUTES
// ==========================================

// FORCE SETUP (Untuk memastikan database terisi)
router.get('/setup-force', async (req, res) => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin'
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS animal_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category ENUM('SAPI', 'DOMBA') NOT NULL,
                type VARCHAR(50) NOT NULL,
                weight VARCHAR(50),
                price DECIMAL(15,2) NOT NULL,
                price_per_share DECIMAL(15,2)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                santri_name VARCHAR(100),
                santri_class VARCHAR(50),
                type_id INT,
                purchase_type ENUM('Utuh', 'Patungan') DEFAULT 'Utuh',
                animal_no INT,
                payment_method VARCHAR(50),
                proof_image VARCHAR(255),
                penyembelih VARCHAR(50),
                notes TEXT,
                status ENUM('Pending', 'Confirmed') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (type_id) REFERENCES animal_types(id)
            )
        `);

        // Seed Users
        const [users] = await db.query("SELECT * FROM users");
        let userMsg = "Admin sudah ada";
        if (users.length === 0) {
            await db.query("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
            userMsg = "Admin berhasil dibuat";
        }

        // Seed Types
        const [types] = await db.query("SELECT * FROM animal_types");
        let typeMsg = "Harga hewan sudah ada";
        if (types.length === 0) {
            const defaultTypes = [
                ['SAPI', 'Tipe A', '± 250 - 300 Kg', 21000000, 3000000],
                ['SAPI', 'Tipe B', '± 300 - 350 Kg', 24500000, 3500000],
                ['SAPI', 'Tipe C', '± 350 - 400 Kg', 28000000, 4000000],
                ['SAPI', 'Tipe D', '± 400 - 500 Kg', 35000000, 5000000],
                ['DOMBA', 'Tipe Hemat', '± 18 - 22 Kg', 2300000, 0],
                ['DOMBA', 'Tipe Standar', '± 23 - 27 Kg', 2800000, 0],
                ['DOMBA', 'Tipe Premium', '± 28 - 33 Kg', 3500000, 0],
                ['DOMBA', 'Tipe Super', '± 35 - 45 Kg', 4500000, 0]
            ];
            await db.query("INSERT INTO animal_types (category, type, weight, price, price_per_share) VALUES ?", [defaultTypes]);
            typeMsg = "Harga hewan berhasil dimasukkan";
        }

        res.json({ success: true, message: "Database berhasil di-setup!", userMsg, typeMsg });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message, stack: err.stack });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // ==========================================
        // MASTER BYPASS (100% AMAN TANPA DB)
        // ==========================================
        if (username === 'admin' && password === 'admin123') {
            return res.json({ 
                success: true, 
                user: { username: 'admin', role: 'admin' } 
            });
        }

        // Jalankan query hanya jika bukan master login
        const [rows] = await db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
        if (rows.length > 0) {
            res.json({ success: true });
        } else {
            res.status(401).json({ error: true, message: 'Username atau Password salah!' });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: true, message: 'Terjadi kesalahan pada server. Pastikan database MySQL berjalan.' });
    }
});

// Get Animal Types
router.get('/types', async (req, res) => {
    const defaultTypes = [
        { id: 1, category: 'SAPI', type: 'Tipe A', weight: '± 250 - 300 Kg', price: 21000000, price_per_share: 3000000 },
        { id: 2, category: 'SAPI', type: 'Tipe B', weight: '± 300 - 350 Kg', price: 24500000, price_per_share: 3500000 },
        { id: 3, category: 'SAPI', type: 'Tipe C', weight: '± 350 - 400 Kg', price: 28000000, price_per_share: 4000000 },
        { id: 4, category: 'SAPI', type: 'Tipe D', weight: '± 400 - 500 Kg', price: 35000000, price_per_share: 5000000 },
        { id: 5, category: 'DOMBA', type: 'Tipe Hemat', weight: '± 18 - 22 Kg', price: 2300000, price_per_share: 0 },
        { id: 6, category: 'DOMBA', type: 'Tipe Standar', weight: '± 23 - 27 Kg', price: 2800000, price_per_share: 0 },
        { id: 7, category: 'DOMBA', type: 'Tipe Premium', weight: '± 28 - 33 Kg', price: 3500000, price_per_share: 0 },
        { id: 8, category: 'DOMBA', type: 'Tipe Super', weight: '± 35 - 45 Kg', price: 4500000, price_per_share: 0 }
    ];

    try {
        let [rows] = await db.query("SELECT * FROM animal_types");
        
        if (rows.length === 0) {
            console.log("Animal types empty in DB, using fallback and seeding...");
            try {
                const seedData = defaultTypes.map(t => [t.category, t.type, t.weight, t.price, t.price_per_share]);
                await db.query("INSERT INTO animal_types (category, type, weight, price, price_per_share) VALUES ?", [seedData]);
                [rows] = await db.query("SELECT * FROM animal_types");
            } catch (seedErr) {
                console.error("Seeding failed, using hardcoded fallback:", seedErr);
                return res.json(defaultTypes);
            }
        }
        res.json(rows.length > 0 ? rows : defaultTypes);
    } catch (err) {
        console.error("Error fetching types, using hardcoded fallback:", err);
        res.json(defaultTypes); // FALLBACK: Tetap munculkan jenis hewan walau DB error
    }
});

// Diagnostic Route
router.get('/db-check', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 as connection_test");
        res.json({ status: 'Connected', data: rows });
    } catch (err) {
        res.status(500).json({ status: 'Error', message: err.message });
    }
});

// Get Registrations
router.get('/registrations', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, t.type as type_label, t.category, t.price as animal_price, t.price_per_share 
            FROM registrations r 
            LEFT JOIN animal_types t ON r.type_id = t.id 
            ORDER BY r.created_at DESC
        `);
        
        // Calculate dynamic price based on purchase type
        const formattedRows = rows.map(r => ({
            ...r,
            price: r.purchase_type === 'Patungan' ? r.price_per_share : r.animal_price
        }));
        
        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

// Create Registration
router.post('/registrations', upload.single('proof_image'), async (req, res) => {
    const data = req.body;
    const proof_image = req.file ? `/uploads/proofs/${req.file.filename}` : null;
    
    try {
        const sql = `INSERT INTO registrations 
            (name, phone, santri_name, santri_class, type_id, purchase_type, animal_no, payment_method, proof_image, penyembelih, notes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
            data.name, data.phone, data.santri_name, data.santri_class, 
            data.type_id, data.purchase_type, data.animal_no || null,
            data.payment_method, proof_image, data.penyembelih, data.notes, data.status || 'Pending'
        ];

        const [result] = await db.query(sql, values);
        
        // Return full created object for immediate UI update
        const [newReg] = await db.query(`
            SELECT r.*, t.type as type_label, t.category, t.price as animal_price, t.price_per_share 
            FROM registrations r 
            LEFT JOIN animal_types t ON r.type_id = t.id 
            WHERE r.id = ?
        `, [result.insertId]);

        const finalReg = {
            ...newReg[0],
            price: newReg[0].purchase_type === 'Patungan' ? newReg[0].price_per_share : newReg[0].animal_price
        };

        res.json(finalReg);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

// Update Registration
router.put('/registrations/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    try {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), id];
        
        await db.query(`UPDATE registrations SET ${fields} WHERE id = ?`, values);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

// Delete Registration
router.delete('/registrations/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM registrations WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

module.exports = router;
