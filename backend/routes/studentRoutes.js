const express = require('express');
const router = express.Router();
const { getStudentMonthlyActivity, getStudentMessBill, requestMessStatusChange } = require('../controllers/studentController');
const { protect, isAdmin } = require('./authMiddleware');

// @route   GET /api/students/:studentId/activity/:year/:month
// @desc    Get monthly activity for a student (open/closed days, extra items)
// @access  Admin (requires authentication and authorization)
router.get('/:studentId/activity/:year/:month', protect, isAdmin, getStudentMonthlyActivity);

// @route   GET /api/students/:studentId/bill
// @desc    Get mess bill for a student (current or historical)
// @access  Admin (requires authentication and authorization)
router.get('/:studentId/bill', protect, isAdmin, getStudentMessBill);

// @route   POST /api/students/:studentId/request-account-change
// @desc    Submit a request to open or close mess account
// @access  Protected (Student)
router.post('/:studentId/request-account-change', protect, requestMessStatusChange);

module.exports = router;