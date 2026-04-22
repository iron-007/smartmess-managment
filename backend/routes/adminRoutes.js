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

// Student Management Endpoints
router.get('/students', protect, isAdmin, adminController.getAllStudents);
router.put('/students/:id', protect, isAdmin, adminController.updateStudent);
router.get('/students/:id/attendance', protect, isAdmin, adminController.getStudentAttendance);

// --- Billing & Ledger Endpoints ---
// Secret Manual Trigger for the Midnight Ledger (Admin Only)
router.post('/trigger-billing', protect, isAdmin, adminController.processDailyBilling);

// TEMPORARY: One-time execution to fix missing past records
// router.post('/backfill-ledger', protect, isAdmin, adminController.backfillMissingDays);

module.exports = router;