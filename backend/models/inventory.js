const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  unit: { 
    type: String, 
    required: true 
  }, // e.g., kg, Liter, Pieces
  threshold: { 
    type: Number, 
    required: true, 
    default: 10 
  }
}, { timestamps: true });

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
