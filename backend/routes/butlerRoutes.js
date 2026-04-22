const express = require('express');
const router = express.Router();
const butlerController = require('../controllers/butlerController');
const { protect, isButler } = require('./authMiddleware');

// All butler routes require being a butler or admin
router.use(protect, isButler);

// Account Approval Endpoints
router.get('/approvals', butlerController.getPendingApprovals);
router.put('/approvals/:id/approve', butlerController.approveAccount);
router.delete('/approvals/:id/reject', butlerController.rejectAccount);

// Live Attendance
router.get('/live-attendance', butlerController.getLiveAttendance);
router.get('/attendance', butlerController.getMonthlyAttendance);
router.post('/mark-attendance', butlerController.markAttendance);

// Extras & Guest Consumption
router.get('/students', butlerController.getButlerStudents);
router.post('/add-consumption', butlerController.addConsumption);

// Bill Overview & Defaulters
router.get('/student-bills', butlerController.getStudentBills);
router.get('/status-stats', butlerController.getMonthlyStatusStats);

module.exports = router;
