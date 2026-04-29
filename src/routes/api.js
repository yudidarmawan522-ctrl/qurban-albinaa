const express = require('express');
const router = express.Router();
const qurbanController = require('../controllers/qurbanController');
const pekurbanController = require('../controllers/pekurbanController');

// Settings & Info
router.get('/settings', qurbanController.getSettings);
router.post('/settings', qurbanController.updateSettings);
router.get('/types', qurbanController.getQurbanTypes);
router.post('/types', qurbanController.createOrUpdateType);

// Registrations
router.get('/registrations', pekurbanController.getRegistrations);
router.post('/registrations', pekurbanController.createRegistration);

module.exports = router;
