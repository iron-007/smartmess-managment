const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/user');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const createButler = async () => {
  try {
    // Check if MONGO_URI is present
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartmess';

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    const butlerData = {
      name: 'Mess Butler',
      email: 'butler@smartmess.com',
      password: 'butlerpassword123', // Change this in production
      role: 'butler'
    };

    // Check if butler already exists
    const existingButler = await User.findOne({ email: butlerData.email });
    if (existingButler) {
      console.log('Butler account already exists.');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(butlerData.password, salt);

    // Create butler
    const butler = new User({
      ...butlerData,
      password: hashedPassword
    });

    await butler.save();
    console.log('Butler account created successfully!');
    console.log('Email:', butlerData.email);
    console.log('Password:', butlerData.password);

    process.exit(0);
  } catch (error) {
    console.error('Error creating butler:', error);
    process.exit(1);
  }
};

createButler();
