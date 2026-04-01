const express = require('express');
const router = express.Router();
const { getStudentDirectory } = require('../controllers/adminController');

// In a real application, you would protect this route
// const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/students
// @desc    Get all students with their monthly attendance and billing
// @access  Private/Admin
router.get('/students', getStudentDirectory);

module.exports = router;