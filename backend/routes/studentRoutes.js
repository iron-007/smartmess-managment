const express = require('express');
const router = express.Router();
const { 
  getStudentMonthlyActivity, 
  getStudentMessBill, 
  requestMessStatusChange,
  getStudentDues,
  getStudentConsumptionMonthly,
  submitMessRequest,
  getStudentMessRequests,
  getNextAvailableMeal
} = require('../controllers/studentController');
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

// --- New Student Dashboard Routes ---

// @route   GET /api/students/me/dues
// @desc    Get current month dues and previous dues
// @access  Protected (Student)
router.get('/me/dues', protect, getStudentDues);

// @route   GET /api/students/me/consumption/monthly
// @desc    Get monthly consumption grid data
// @access  Protected (Student)
router.get('/me/consumption/monthly', protect, getStudentConsumptionMonthly);

module.exports = router;