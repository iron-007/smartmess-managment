const dotenv = require('dotenv');
// Load env variables before requiring other local files
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const studentRoutes = require('./routes/studentRoutes');
const menuRoutes = require('./routes/menuRoutes');

// NEW: Import cron and your admin controller for the automation
const cron = require('node-cron');
const adminController = require('./controllers/adminController');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', adminRoutes);
app.use('/api/admin/notices', noticeRoutes);
app.use('/api/notices', noticeRoutes); // Reusing noticeRoutes for student access
app.use('/api/students', studentRoutes);
app.use('/api/butler', require('./routes/butlerRoutes'));
app.use('/api/menu', menuRoutes);
app.use('/api/menu', menuRoutes);

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('SmartMess API is running...');
});

// --- AUTOMATION: The Midnight Ledger ---
cron.schedule('59 23 * * *', async () => {
  console.log('--- [SYSTEM] Triggering Automated Midnight Ledger (IST) ---');
  try {
    await adminController.processDailyBilling(); 
  } catch (err) {
    console.error('--- [SYSTEM] Midnight Ledger Automation Failed:', err);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // 🔒 Locks the trigger exactly to Indian Standard Time
});

// --- AUTOMATION: Monthly Late Fine (5% on 30th/31st if Dues > 2500) ---
// Runs at 11:50 PM on the 30th and 31st of every month
cron.schedule('50 23 30,31 * *', async () => {
  console.log('--- [SYSTEM] Triggering Automated Monthly Late Fine Check (IST) ---');
  try {
    await adminController.processMonthlyFine(); 
  } catch (err) {
    console.error('--- [SYSTEM] Monthly Fine Automation Failed:', err);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});