const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  item: { type: String, default: '' },
  extra: { type: String, default: '' }
}, { _id: false });

const daySchema = new mongoose.Schema({
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema
}, { _id: false });

const timingSchema = new mongoose.Schema({
  start: { type: String, default: '' },
  end: { type: String, default: '' }
}, { _id: false });

const menuSchema = new mongoose.Schema({
  menu: {
    Monday: daySchema,
    Tuesday: daySchema,
    Wednesday: daySchema,
    Thursday: daySchema,
    Friday: daySchema,
    Saturday: daySchema,
    Sunday: daySchema
  },
  timings: {
    breakfast: timingSchema,
    lunch: timingSchema,
    dinner: timingSchema
  },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);