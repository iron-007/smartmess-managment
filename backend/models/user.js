const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'admin'], 
    default: 'student' 
  },
  year: { type: String },
  hostel: { type: String },
  messAccount: { type: String, unique: true, sparse: true },
  // --- New Fields for Directory & Modal ---
  urn: { type: String },
  crn: { type: String },
  department: { type: String },
  phone: { type: String },
  previousDues: { type: Number, default: 0 } // Financial tracker
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);