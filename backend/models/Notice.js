const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  priority: { type: String, enum: ['Normal', 'High'], default: 'Normal' },
  date: { type: String, required: true },
  attachmentUrl: { type: String, default: null }, // Stores the file path or Cloudinary URL
  attachmentPublicId: { type: String, default: null }, // Stores the Cloudinary public_id

  validUntil: { type: Date, default: null }, // Notice expiration date
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);