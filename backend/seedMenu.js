const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const Menu = require('./models/menu');

const sampleMenu = {
  Monday: {
    breakfast: { item: "Aloo Paratha, Curd, Pickle, Tea", extra: "Omelette" },
    lunch: { item: "Rajma Masala, Steamed Rice, Boondi Raita, Salad", extra: "Ice Cream" },
    dinner: { item: "Mix Vegetable Curry, Dal Tadka, Tawa Roti, Rice", extra: "Kheer" }
  },
  Tuesday: {
    breakfast: { item: "Poha, Sev, Jalebi, Tea", extra: "Boiled Eggs" },
    lunch: { item: "Kadhi Pakora, Jeera Rice, Aloo Jeera, Papad", extra: "Sweet Lassi" },
    dinner: { item: "Matar Paneer, Garlic Naan, Veg Pulao", extra: "Gulab Jamun" }
  },
  Wednesday: {
    breakfast: { item: "Idli, Sambar, Coconut Chutney, Tea", extra: "Vada" },
    lunch: { item: "Chole Bhature, Onion Salad, Lassi", extra: "Extra Bhatura" },
    dinner: { item: "Egg Curry / Malai Kofta, Roti, Rice, Dal Fry", extra: "Custard" }
  },
  Thursday: {
    breakfast: { item: "Bread Butter Jam, Omelette / Sprouts, Tea", extra: "Juice" },
    lunch: { item: "Veg Biryani, Salan, Mix Veg Raita, Salad", extra: "Cold Drink" },
    dinner: { item: "Aloo Gobhi Matar, Dal Makhani, Roti, Rice", extra: "Fruit Cream" }
  },
  Friday: {
    breakfast: { item: "Puri Sabzi, Halwa, Tea", extra: "Milk" },
    lunch: { item: "Black Chana Masala, Roti, Rice, Curd, Salad", extra: "Fruit" },
    dinner: { item: "Shahi Paneer, Missi Roti, Jeera Rice", extra: "Moong Dal Halwa" }
  },
  Saturday: {
    breakfast: { item: "Uttapam, Sambar, Tomato Chutney, Tea", extra: "Upma" },
    lunch: { item: "Dal Bati Churma / Veg Thali, Buttermilk", extra: "Papad" },
    dinner: { item: "Kadai Veg, Dal Palak, Roti, Rice", extra: "Ice Cream" }
  },
  Sunday: {
    breakfast: { item: "Special Masala Dosa, Filter Coffee", extra: "Sambhar Vada" },
    lunch: { item: "Special Paneer / Chicken Curry, Pulao, Roti, Salad, Raita", extra: "Cold Coffee" },
    dinner: { item: "Veg Manchurian, Fried Rice, Hakka Noodles, Hot & Sour Soup", extra: "Pastry" }
  }
};

const sampleTimings = {
  breakfast: { start: "07:30", end: "09:30" },
  lunch: { start: "12:30", end: "14:30" },
  dinner: { start: "19:30", end: "21:30" }
};

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing menu
    await Menu.deleteMany({});
    console.log("Cleared existing menu data.");

    // Create new menu
    const menu = new Menu({
      menu: sampleMenu,
      timings: sampleTimings,
      status: 'Published'
    });

    await menu.save();
    console.log("Sample 7-day menu seeded successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
