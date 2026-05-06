const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const qurbanController = require('../controllers/qurbanController');
const pekurbanController = require('../controllers/pekurbanController');
const authController = require('../controllers/authController');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/proofs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images (JPG, PNG, WEBP) are allowed!'));
    }
});

// Authentication
router.post('/login', authController.login);

// Settings & Info
router.get('/settings', qurbanController.getSettings);
router.post('/settings', qurbanController.updateSettings);
router.get('/types', qurbanController.getQurbanTypes);
router.post('/types', qurbanController.createOrUpdateType);

// Registrations
router.get('/registrations', pekurbanController.getRegistrations);
router.post('/registrations', upload.single('proof_image'), pekurbanController.createRegistration);
router.put('/registrations/:id', upload.single('proof_image'), pekurbanController.updateRegistration);
router.delete('/registrations/:id', pekurbanController.deleteRegistration);

module.exports = router;
