const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, urn, crn, degree, department, batch, year, hostel, messAccount, password, role, position } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role,
      urn,
      crn,
      degree,
      department,
      batch,
      year,
      hostel,
      messAccount,
      position
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check role
    if (user.role !== role) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Generate Tokens
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    // Generate Refresh Token
    const refreshTokenValue = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = new RefreshToken({
      token: refreshTokenValue,
      user: user._id,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await refreshToken.save();

    res.json({ 
      token, 
      refreshToken: refreshTokenValue,
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh Token route
router.post('/refresh-token', async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (!requestToken) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    const refreshToken = await RefreshToken.findOne({ token: requestToken }).populate('user');

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token is not in database!" });
    }

    if (refreshToken.expiryDate.getTime() < new Date().getTime()) {
      await RefreshToken.findByIdAndDelete(refreshToken._id);
      return res.status(403).json({ message: "Refresh token was expired. Please make a new signin request" });
    }

    const newAccessToken = jwt.sign({ id: refreshToken.user._id, role: refreshToken.user.role }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    return res.status(200).json({
      token: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

// Logout route (to clear refresh token)
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.findOneAndDelete({ token: refreshToken });
  }
  res.status(204).json({ message: "Logged out successfully" });
});

// Get current user profile
const { protect } = require('./authMiddleware');
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;