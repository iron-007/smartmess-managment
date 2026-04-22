const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['DailyMeals', 'Extra', 'Guest', 'Rebate', 'Payment', 'Fine'],
    required: true 
  },
  description: { type: String, required: true }, // e.g., "Monthly Mess Fee", "Extra: Omelette", "Rebate for Leave"
  amount: { type: Number, required: true }, // Positive for charges (debits), negative for credits/payments
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'N/A'], default: 'N/A' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);