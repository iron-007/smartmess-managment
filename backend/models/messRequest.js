const mongoose = require('mongoose');

const messRequestSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  date: { 
    type: Date, 
    required: true 
  },
  action: { 
    type: String, 
    enum: ['OPEN', 'CLOSE'], 
    required: true 
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'All'],
    default: 'All'
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  remark: { 
    type: String 
  }
}, { timestamps: true });

// Ensure a student can't have duplicate pending requests for the same date
messRequestSchema.index({ student: 1, date: 1, status: 1 });

module.exports = mongoose.models.MessRequest || mongoose.model('MessRequest', messRequestSchema);
