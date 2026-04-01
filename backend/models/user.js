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
  messAccount: { type: String, unique: true, sparse: true } // Unique for students, but not required for admins
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);