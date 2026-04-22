const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const Inventory = require('./models/inventory');

const sampleInventory = [
  { itemName: "Rice", quantity: 500, unit: "kg", threshold: 100 },
  { itemName: "Wheat Flour", quantity: 400, unit: "kg", threshold: 80 },
  { itemName: "Lentils (Dal)", quantity: 150, unit: "kg", threshold: 50 },
  { itemName: "Cooking Oil", quantity: 200, unit: "Liter", threshold: 40 },
  { itemName: "Milk", quantity: 20, unit: "Liter", threshold: 50 }, // Low
  { itemName: "Eggs", quantity: 12, unit: "Pieces", threshold: 100 }, // Critical
  { itemName: "Potatoes", quantity: 300, unit: "kg", threshold: 50 },
  { itemName: "Onions", quantity: 250, unit: "kg", threshold: 50 },
  { itemName: "Sugar", quantity: 50, unit: "kg", threshold: 20 },
  { itemName: "Salt", quantity: 10, unit: "kg", threshold: 5 }
];

const seedInventory = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log("Cleared existing inventory.");

    // Insert sample items
    await Inventory.insertMany(sampleInventory);
    console.log(`Successfully seeded ${sampleInventory.length} inventory items!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding inventory:", error);
    process.exit(1);
  }
};

seedInventory();
