const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'admin', 'butler'],
    default: 'student'
  },
  messStatus: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open' // Mess account is open by default
  },
  messStatusLog: [{
    action: { type: String }, // e.g., "Student Requested: Close Account", "Admin Approved"
    date: { type: Date, default: Date.now },
    remark: { type: String }
  }],
  year: { type: String },
  hostel: { type: String },
  messAccount: { type: String, unique: true, sparse: true },
  // --- New Fields for Directory & Modal ---
  urn: { type: String },
  crn: { type: String },
  department: { type: String },
  phone: { type: String },
  previousDues: { type: Number, default: 0 }, // Financial tracker
  lastRequestDate: { type: Date, default: null }, // Cooldown tracker
  messStatusRequest: {
    type: String,
    enum: ['None', 'Request_Open', 'Request_Close'],
    default: 'None'
  },
  messRequestDate: { type: Date, default: null },
  lastSettlementDate: { type: Date, default: null }
}, { timestamps: true });


module.exports = mongoose.models.User || mongoose.model('User', userSchema);
