const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const Notice = require('./models/Notice');

const sampleNotices = [
  {
    title: "Monthly Mess Fee Reminder",
    content: "All students are requested to clear their mess dues for the current month by the 5th. Please note that a 5% fine will be automatically applied to bills exceeding ₹2500 at the end of the month.",
    priority: "High",
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
  },
  {
    title: "Revised Mess Timings",
    content: "Effective from next Monday, breakfast timings will be shifted 30 minutes earlier. New timing: 07:00 AM - 09:00 AM. Lunch and Dinner timings remains unchanged.",
    priority: "Normal",
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Special Sunday Feast",
    content: "We are excited to announce a special Traditional Veg Thali for this Sunday's lunch! Extra items like Paneer Tikka and Rasmalai will be available on request.",
    priority: "Normal",
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Maintenance Notice: Water Supply",
    content: "Due to overhead tank cleaning, there will be no water supply in the hand-wash area tomorrow between 10:00 AM and 12:00 PM. We regret the inconvenience.",
    priority: "High",
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Cleanliness Policy",
    content: "Students are reminded to return their used plates to the designated washing counter. Maintaining hygiene in the dining area is our collective responsibility.",
    priority: "Normal",
    date: new Date().toISOString().split('T')[0],
    validUntil: null // No expiration
  }
];

const seedNotices = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing notices
    await Notice.deleteMany({});
    console.log("Cleared existing notices.");

    // Insert sample notices
    await Notice.insertMany(sampleNotices);
    console.log(`Successfully seeded ${sampleNotices.length} professional mess notices!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding notices:", error);
    process.exit(1);
  }
};

seedNotices();
