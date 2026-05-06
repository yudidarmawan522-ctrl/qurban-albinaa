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
        // 1. Create Tables (Matching qurban_db.sql)
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS animal_types (
                id VARCHAR(50) PRIMARY KEY,
                category ENUM('SAPI', 'DOMBA') NOT NULL,
                type VARCHAR(100) NOT NULL,
                weight VARCHAR(100),
                price DECIMAL(15,2) NOT NULL,
                price_per_share DECIMAL(15,2),
                stock INT DEFAULT 0
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                santri_name VARCHAR(255),
                santri_class VARCHAR(100),
                phone VARCHAR(50) NOT NULL,
                type_id VARCHAR(50),
                animal_no VARCHAR(50),
                group_status VARCHAR(100),
                purchase_type ENUM('Utuh', 'Patungan') DEFAULT 'Utuh',
                category ENUM('SAPI', 'DOMBA') NOT NULL,
                type_label VARCHAR(100),
                price DECIMAL(15,2),
                payment_method VARCHAR(100),
                proof_image VARCHAR(255),
                notes TEXT,
                penyembelih VARCHAR(255),
                status ENUM('Pending', 'Confirmed') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (type_id) REFERENCES animal_types(id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT(1) PRIMARY KEY DEFAULT 1,
                target_sapi INT DEFAULT 30,
                target_domba INT DEFAULT 300,
                program_name VARCHAR(255) DEFAULT 'Qurban Al Binaa 1447H',
                deadline DATE DEFAULT '2026-06-15'
            )
        `);

        // 2. Initial Seeding
        const [users] = await db.query("SELECT * FROM users");
        if (users.length === 0) {
            await db.query("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')");
        }

        const [types] = await db.query("SELECT * FROM animal_types");
        if (types.length === 0) {
            const defaultTypes = [
                ['S-TIPE-A', 'SAPI', 'Tipe A', '390-400 Kg', 35000000.00, 5000000.00, 5],
                ['S-TIPE-B', 'SAPI', 'Tipe B', '340-350 Kg', 28000000.00, 4000000.00, 8],
                ['S-TIPE-C', 'SAPI', 'Tipe C', '320-330 Kg', 23100000.00, 3300000.00, 10],
                ['S-TIPE-D', 'SAPI', 'Tipe D', '230-240 Kg', 19000000.00, 0, 12],
                ['D-SUPER', 'DOMBA', 'SUPER', '45-60 Kg', 5300000.00, 0, 20],
                ['D-TIPE-A', 'DOMBA', 'A', '31-35 Kg', 3800000.00, 0, 25],
                ['D-TIPE-B', 'DOMBA', 'B', '26-30 Kg', 3300000.00, 0, 30],
                ['D-TIPE-C', 'DOMBA', 'C', '20-25 Kg', 2800000.00, 0, 40],
                ['D-TIPE-D', 'DOMBA', 'D', '15-19 Kg', 2300000.00, 0, 50]
            ];
            await db.query("INSERT INTO animal_types (id, category, type, weight, price, price_per_share, stock) VALUES ?", [defaultTypes]);
        }

        const [settings] = await db.query("SELECT * FROM settings");
        if (settings.length === 0) {
            await db.query("INSERT INTO settings (id, target_sapi, target_domba, program_name, deadline) VALUES (1, 30, 300, 'Qurban Al Binaa 1447H', '2026-06-15')");
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
    try {
        const [rows] = await db.query("SELECT * FROM animal_types");
        res.json(rows);
    } catch (err) {
        console.error("Error fetching types:", err);
        res.status(500).json({ error: true, message: err.message });
    }
});

// Get Settings
router.get('/settings', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM settings WHERE id = 1");
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
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
            SELECT r.*, r.type_label, r.category, r.price 
            FROM registrations r 
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

// Create Registration
router.post('/registrations', upload.single('proof_image'), async (req, res) => {
    const data = req.body;
    const proof_image = req.file ? `/uploads/proofs/${req.file.filename}` : null;
    
    try {
        const registrationId = `REG-${Date.now()}`;
        
        // Ambil info tipe hewan untuk mendapatkan category & label
        const [typeRows] = await db.query("SELECT * FROM animal_types WHERE id = ?", [data.type_id]);
        if (typeRows.length === 0) throw new Error("Jenis hewan tidak valid");
        const animalType = typeRows[0];

        const price = data.purchase_type === 'Patungan' ? animalType.price_per_share : animalType.price;

        const sql = `INSERT INTO registrations 
            (id, name, santri_name, santri_class, phone, type_id, animal_no, purchase_type, category, type_label, price, payment_method, proof_image, penyembelih, notes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
            registrationId, data.name, data.santri_name, data.santri_class, data.phone,
            data.type_id, data.animal_no || null, data.purchase_type,
            animalType.category, animalType.type, price,
            data.payment_method, proof_image, data.penyembelih, data.notes, data.status || 'Pending'
        ];

        await db.query(sql, values);
        
        // Return full created object
        const [rows] = await db.query("SELECT * FROM registrations WHERE id = ?", [registrationId]);
        res.json(rows[0]);
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ 
            error: true, 
            message: "Database Error: " + err.message,
            code: err.code 
        });
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
