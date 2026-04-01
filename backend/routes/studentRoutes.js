const express = require('express');
const router = express.Router();
const { getStudentMonthlyActivity, getStudentMessBill } = require('../controllers/studentController');
const { protect, isAdmin } = require('./authMiddleware');

// @route   GET /api/students/:studentId/activity/:year/:month
// @desc    Get monthly activity for a student (open/closed days, extra items)
// @access  Admin (requires authentication and authorization)
router.get('/:studentId/activity/:year/:month', protect, isAdmin, getStudentMonthlyActivity);

// @route   GET /api/students/:studentId/bill
// @desc    Get mess bill for a student (current or historical)
// @access  Admin (requires authentication and authorization)
router.get('/:studentId/bill', protect, isAdmin, getStudentMessBill);

module.exports = router;