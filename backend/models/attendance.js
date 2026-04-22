const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  date: { 
    type: Date, 
    required: true, 
    index: true 
  },
  mealType: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Dinner'], 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Ensure a student can only have one attendance record per meal per day
attendanceSchema.index({ student: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
