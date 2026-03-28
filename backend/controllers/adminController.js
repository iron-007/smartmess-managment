const Menu = require('../models/Menu');
const Pricing = require('../models/Pricing');

// --- Menu Controllers ---
exports.getMenu = async (req, res) => {
  try {
    // Assuming a single configuration document for the weekly menu
    let menuData = await Menu.findOne();
    if (!menuData) {
      return res.status(200).json({}); // Frontend will use initial defaults
    }
    res.status(200).json(menuData);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Server error fetching menu' });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { menu, timings, status } = req.body;
    let menuData = await Menu.findOne();
    
    if (menuData) {
      menuData.menu = menu;
      menuData.timings = timings;
      menuData.status = status;
      await menuData.save();
    } else {
      menuData = new Menu({ menu, timings, status });
      await menuData.save();
    }
    
    res.status(200).json({ message: 'Menu updated successfully', menuData });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ message: 'Server error updating menu' });
  }
};

// --- Pricing Controllers ---
exports.getPricing = async (req, res) => {
  try {
    let pricingData = await Pricing.findOne();
    if (!pricingData) {
      return res.status(200).json({}); // Frontend will use initial defaults
    }
    res.status(200).json({
      pricing: {
        baseFee: pricingData.baseFee,
        student: pricingData.student,
        guest: pricingData.guest,
        rules: pricingData.rules
      },
      auditLog: pricingData.auditLog
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ message: 'Server error fetching pricing' });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const pricingPayload = req.body;
    let pricingData = await Pricing.findOne();
    
    const newLogEntry = {
      date: new Date().toISOString().split('T')[0],
      action: 'Updated pricing and rules',
      admin: req.user ? req.user.name : 'System Admin' // Fallback if req.user is undefined
    };

    if (pricingData) {
      pricingData.baseFee = pricingPayload.baseFee;
      pricingData.student = pricingPayload.student;
      pricingData.guest = pricingPayload.guest;
      pricingData.rules = pricingPayload.rules;
      // Push new log to top and keep only the latest 20 logs
      pricingData.auditLog.unshift(newLogEntry);
      if (pricingData.auditLog.length > 20) pricingData.auditLog.pop();
      
      await pricingData.save();
    } else {
      pricingData = new Pricing({
        ...pricingPayload,
        auditLog: [newLogEntry]
      });
      await pricingData.save();
    }
    
    res.status(200).json({ message: 'Pricing updated successfully', auditLog: pricingData.auditLog });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({ message: 'Server error updating pricing' });
  }
};