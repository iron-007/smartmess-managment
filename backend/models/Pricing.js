const mongoose = require('mongoose');

const priceCategorySchema = new mongoose.Schema({
  breakfast: { type: Number, default: 0 },
  lunch: { type: Number, default: 0 },
  dinner: { type: Number, default: 0 },
  special: { type: Number, default: 0 }
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  baseFee: { type: Number, default: 1200 },
  student: priceCategorySchema,
  guest: priceCategorySchema,
  rules: {
    noticeHours: { type: Number, default: 24 },
    maxLeaveDays: { type: Number, default: 10 }
  },
  auditLog: [{
    date: { type: String },
    action: { type: String },
    admin: { type: String }
  }],
  extraPrices: {
    type: Map,
    of: Number,
    default: {
      'Milk': 15,
      'Egg': 10,
      'Chicken': 120,
      'Paneer': 100,
      'Special Rice': 60
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Pricing', pricingSchema);