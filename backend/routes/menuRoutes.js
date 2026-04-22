const express = require('express');
const router = express.Router();
const { getTodayMenu, getWeeklyMenu } = require('../controllers/menuController');
const { protect } = require('./authMiddleware');

// @route   GET /api/menu/today
// @desc    Get menu for the current day
// @access  Protected
router.get('/today', protect, getTodayMenu);

// @route   GET /api/menu
// @desc    Get full weekly menu
// @access  Protected
router.get('/', protect, getWeeklyMenu);

module.exports = router;
