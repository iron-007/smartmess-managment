const dotenv = require('dotenv');
// Load env variables before requiring other local files
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', adminRoutes);

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('SmartMess API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});