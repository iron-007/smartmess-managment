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
  urn: { type: String },
  crn: { type: String },
  degree: { type: String },
  department: { type: String },
  batch: { type: String },
  year: { type: String },
  hostel: { type: String },
  messAccount: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);