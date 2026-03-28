const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('./authMiddleware');

// Menu API Endpoints
router.get('/menu', protect, isAdmin, adminController.getMenu);
router.put('/menu', protect, isAdmin, adminController.updateMenu);

// Pricing API Endpoints
router.get('/pricing', protect, isAdmin, adminController.getPricing);
router.put('/pricing', protect, isAdmin, adminController.updatePricing);

module.exports = router;