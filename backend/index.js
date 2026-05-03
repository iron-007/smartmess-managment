const dotenv = require('dotenv');
// Load env variables before requiring other local files
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
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

// Ping route for self-pinging
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'Server is awake' });
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

// --- AUTOMATION: Monthly Settlement (Last day at 11:30 PM IST) ---
cron.schedule('30 23 * * *', async () => {
  const now = moment().tz("Asia/Kolkata");
  const isLastDay = now.date() === now.daysInMonth();
  
  if (isLastDay) {
    await adminController.processMonthEndSettlement();
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// --- AUTOMATION: Monthly Fine (1st day at 12:00 AM IST) ---
cron.schedule('0 0 1 * *', async () => {
  console.log('--- [SYSTEM] Triggering Automated Monthly Late Fine Check (IST) ---');
  await adminController.processMonthlyFine(); 
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});


// --- AUTOMATION: Self-Ping (Every 14 mins to keep server awake) ---
cron.schedule('*/14 * * * *', () => {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl || backendUrl.includes('your-app-name')) {
    console.log('--- [SYSTEM] Self-ping skipped: BACKEND_URL not configured properly in .env ---');
    return;
  }

  console.log(`--- [SYSTEM] Performing Self-Ping to ${backendUrl}/api/ping ---`);
  https.get(`${backendUrl}/api/ping`, (res) => {
    console.log(`--- [SYSTEM] Self-ping response: ${res.statusCode} ---`);
  }).on('error', (err) => {
    console.error('--- [SYSTEM] Self-ping failed:', err.message);
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});