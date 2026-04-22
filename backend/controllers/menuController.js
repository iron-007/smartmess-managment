const Menu = require('../models/menu');

// @desc    Get menu for the current day
// @route   GET /api/menu/today
// @access  Protected
exports.getTodayMenu = async (req, res) => {
  try {
    const menuData = await Menu.findOne({ status: 'Published' });
    if (!menuData) {
      return res.status(404).json({ message: 'No published menu found.' });
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const todayMenu = menuData.menu[today];

    res.status(200).json(todayMenu);
  } catch (error) {
    console.error('Error fetching today\'s menu:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get full weekly menu
// @route   GET /api/menu
// @access  Protected
exports.getWeeklyMenu = async (req, res) => {
  try {
    const menuData = await Menu.findOne({ status: 'Published' });
    if (!menuData) {
      return res.status(404).json({ message: 'No published menu found.' });
    }
    res.status(200).json(menuData);
  } catch (error) {
    console.error('Error fetching weekly menu:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
