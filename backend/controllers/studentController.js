const User = require('../models/user');
const Leave = require('../models/leave');
const Transaction = require('../models/transaction');
const MessRequest = require('../models/messRequest');
const Menu = require('../models/menu');
const moment = require('moment-timezone');
const Pricing = require('../models/Pricing');

// Helper function to get days in a month
const getDaysInMonth = (year, month) => {
  // month is 1-indexed for Date constructor, but 0-indexed for getMonth()
  // Passing 0 as the day gets the last day of the previous month
  return new Date(year, month, 0).getDate();
};

// @desc    Get monthly activity for a student (open/closed days, extra items)
// @route   GET /api/students/:studentId/activity/:year/:month
// @access  Admin (requires authentication and authorization middleware)
exports.getStudentMonthlyActivity = async (req, res) => {
  try {
    const { studentId, year, month } = req.params; // month is 1-indexed from frontend
    const student = await User.findById(studentId);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found or is not a student.' });
    }

    const targetYear = parseInt(year);
    const targetMonth = parseInt(month); // 1-indexed month

    if (isNaN(targetYear) || isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({ message: 'Invalid year or month provided.' });
    }

    const daysInMonth = getDaysInMonth(targetYear, targetMonth);
    const monthlyActivity = [];

    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0); // Last day of the target month

    // Get all approved leaves for the student that overlap with the target month
    const leaves = await Leave.find({
      student: studentId,
      status: 'Approved',
      startDate: { $lte: monthEnd }, // Leave starts before or on the last day of the month
      endDate: { $gte: monthStart }  // Leave ends after or on the first day of the month
    });

    // Get all extra transactions for the student within the target month
    const extraTransactions = await Transaction.find({
      student: studentId,
      type: 'Extra',
      date: {
        $gte: monthStart,
        $lt: new Date(targetYear, targetMonth, 1) // Up to the first day of the next month
      }
    }).sort('date');

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(targetYear, targetMonth - 1, day);
      currentDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

      let status = 'Open';
      let extraItems = { Breakfast: [], Lunch: [], Dinner: [] };

      // Check for leave status for the current day
      for (const leave of leaves) {
        const leaveStartDate = new Date(leave.startDate);
        leaveStartDate.setHours(0, 0, 0, 0);
        const leaveEndDate = new Date(leave.endDate);
        leaveEndDate.setHours(0, 0, 0, 0);

        if (currentDate >= leaveStartDate && currentDate <= leaveEndDate) {
          status = 'Closed (On Leave)';
          break;
        }
      }

      // Collect extra items for the day
      const dailyExtras = extraTransactions.filter(
        (t) => t.date.toDateString() === currentDate.toDateString()
      );

      dailyExtras.forEach(extra => {
        if (extra.mealType && extraItems[extra.mealType]) {
          extraItems[extra.mealType].push({
            description: extra.description,
            amount: extra.amount
          });
        }
      });

      monthlyActivity.push({
        date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
        day: day,
        status: status,
        extras: extraItems
      });
    }

    res.status(200).json({ studentName: student.name, monthlyActivity });

  } catch (error) {
    console.error('Error fetching student monthly activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mess bill for a student
// @route   GET /api/students/:studentId/bill?year=:year&month=:month (optional year/month for historical)
// @access  Admin (requires authentication and authorization middleware)
exports.getStudentMessBill = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year, month } = req.query; // Use query for optional year/month

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found or is not a student.' });
    }

    let startDate, endDate;
    if (year && month) {
      const targetYear = parseInt(year);
      const targetMonth = parseInt(month); // 1-indexed month

      if (isNaN(targetYear) || isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({ message: 'Invalid year or month provided.' });
      }
      startDate = new Date(targetYear, targetMonth - 1, 1);
      endDate = new Date(targetYear, targetMonth, 1); // First day of next month
    } else {
      // Default to current month if no year/month provided
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const transactions = await Transaction.find({
      student: studentId,
      date: { $gte: startDate, $lt: endDate }
    }).sort('date');

    let totalBill = 0;
    transactions.forEach(t => {
      totalBill += t.amount;
    });

    res.status(200).json({
      studentName: student.name,
      messAccount: student.messAccount,
      billingPeriod: `${startDate.toLocaleDateString()} - ${new Date(endDate.getTime() - 1).toLocaleDateString()}`, // Adjust endDate for display to show last day of month
      totalBill: totalBill,
      transactions: transactions.map(t => ({
        id: t._id, // Include transaction ID for potential future use
        date: t.date.toISOString().split('T')[0],
        type: t.type,
        description: t.description,
        amount: t.amount,
        mealType: t.mealType
      }))
    });

  } catch (error) {
    console.error('Error fetching student mess bill:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Request to open or close mess account
// @route   POST /api/students/:studentId/request-account-change
// @access  Student (requires authentication)
exports.requestMessStatusChange = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { requestType, effectiveDate } = req.body; // Expects 'Request_Open' or 'Request_Close'

    if (!['Request_Open', 'Request_Close'].includes(requestType)) {
      return res.status(400).json({ message: 'Invalid request type.' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    // --- 24-Hour Cooldown Check ---
    if (student.lastRequestDate) {
      const lastRequest = moment(student.lastRequestDate);
      const now = moment();
      const hoursSinceLast = now.diff(lastRequest, 'hours');
      
      if (hoursSinceLast < 24) {
        const hoursRemaining = 24 - hoursSinceLast;
        return res.status(400).json({ 
          message: `Cooldown Active: Please wait ${hoursRemaining} more hours before making another change.` 
        });
      }
    }

    // --- Instant Status Flip ---
    const newStatus = (requestType === 'Request_Open') ? 'Open' : 'Closed';
    student.messStatus = newStatus;
    student.lastRequestDate = new Date(); // Reset 24h cooldown timer
    
    student.messStatusLog.push({
      action: `Status Changed: ${newStatus}`,
      remark: `Changed by student via instant toggle. Effective Date: ${effectiveDate || 'Immediately'}`
    });

    await student.save();

    res.status(200).json({ 
      success: true,
      message: `Your mess account is now ${newStatus.toUpperCase()}!`, 
      user: student 
    });
  } catch (error) {
    console.error('Error submitting account request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current month dues and previous dues
// @route   GET /api/student/dues
// @access  Protected (Student)
exports.getStudentDues = async (req, res) => {
  try {
    const studentId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch Pricing for Base Fee
    const pricing = await Pricing.findOne();
    const baseFee = pricing?.baseFee || 0;
    const rebateRate = 27; // Fixed rebate as requested

    // Fetch transactions for current month
    const transactions = await Transaction.find({
      student: studentId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const extraTotal = transactions.filter(t => t.type === 'Extra').reduce((acc, t) => acc + t.amount, 0);
    const guestTotal = transactions.filter(t => t.type === 'Guest').reduce((acc, t) => acc + t.amount, 0);
    const fineTotal = transactions.filter(t => t.type === 'Fine').reduce((acc, t) => acc + t.amount, 0);
    
    // Calculate Rebate (Days Closed * Daily Rate)
    // We need to check history for the current month up to today
    const daysInMonthSoFar = now.getDate();
    let closedDays = 0;
    
    const student = await User.findById(studentId);
    const lastChange = student.lastRequestDate ? moment.tz(student.lastRequestDate, 'Asia/Kolkata').startOf('day') : null;
    const currentStatus = student.messStatus;

    for (let d = 1; d <= daysInMonthSoFar; d++) {
      const dMoment = moment.tz(`${now.getFullYear()}-${now.getMonth() + 1}-${d}`, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day');
      
      let dayStatus = 'Open';
      if (lastChange) {
        if (currentStatus === 'Closed') {
          dayStatus = dMoment.isSameOrAfter(lastChange) ? 'Closed' : 'Open';
        } else {
          dayStatus = dMoment.isSameOrAfter(lastChange) ? 'Open' : 'Closed';
        }
      } else {
        dayStatus = currentStatus;
      }
      
      if (dayStatus === 'Closed') closedDays++;
    }

    const rebateTotal = closedDays * rebateRate;
    const previousDues = student.previousDues || 0;
    
    // Final Calculation
    // We'll assume the student pays: Base Fee + Extras + Guests + Fines - Rebates
    const currentMonthTotal = baseFee + extraTotal + guestTotal + fineTotal - rebateTotal;
    const totalPayable = currentMonthTotal + previousDues;

    res.status(200).json({
      baseFee,
      extraTotal,
      guestTotal,
      fineTotal,
      rebateTotal,
      currentMonthTotal,
      previousDues,
      totalPayable
    });
  } catch (error) {
    console.error('Error fetching dues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get monthly consumption grid data
// @route   GET /api/student/consumption/monthly
// @access  Protected (Student)
exports.getStudentConsumptionMonthly = async (req, res) => {
  try {
    const studentId = req.user._id;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // Fetch Transactions
    const transactions = await Transaction.find({
      student: studentId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Fetch Approved Leaves
    const leaves = await Leave.find({
      student: studentId,
      status: 'Approved',
      $or: [
        { startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } }
      ]
    });

    // Fetch Approved Mess Requests
    const messRequests = await MessRequest.find({
      student: studentId,
      status: 'APPROVED',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const student = await User.findById(studentId);

    const consumptionData = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const currentMoment = moment.tz(`${year}-${month + 1}-${d}`, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day');
      const currentDate = currentMoment.toDate();

      // Determine Mess Status
      let status = 'Open';
      const lastChange = student.lastRequestDate ? moment.tz(student.lastRequestDate, 'Asia/Kolkata').startOf('day') : null;
      const currentStatus = student.messStatus;

      if (lastChange) {
        if (currentStatus === 'Closed') {
          status = currentMoment.isSameOrAfter(lastChange) ? 'Closed' : 'Open';
        } else {
          status = currentMoment.isSameOrAfter(lastChange) ? 'Open' : 'Closed';
        }
      } else {
        status = currentStatus;
      }

      // --- FUTURE DAYS: Hide Status ---
      const today = moment.tz('Asia/Kolkata').startOf('day');
      if (currentMoment.isAfter(today)) {
        status = 'ND'; 
      }

      // Check Leaves (Highest priority for Closed)
      const onLeave = leaves.some(l => {
        const start = moment.tz(l.startDate, 'Asia/Kolkata').startOf('day');
        const end = moment.tz(l.endDate, 'Asia/Kolkata').startOf('day');
        return currentMoment.isSameOrAfter(start) && currentMoment.isSameOrBefore(end);
      });

      if (onLeave) status = 'Closed';

      // Check Mess Requests (Legacy/Override)
      const request = messRequests.find(r => {
        return moment.tz(r.date, 'Asia/Kolkata').startOf('day').isSame(currentMoment, 'day');
      });

      if (request) {
        status = request.action === 'OPEN' ? 'Open' : 'Closed';
      }

      // Collect Extras and Guest Meals
      const dailyTx = transactions.filter(t => {
        return moment.tz(t.date, 'Asia/Kolkata').startOf('day').isSame(currentMoment, 'day');
      });

      const extras = dailyTx
        .filter(t => t.type === 'Extra')
        .map(t => ({ 
          item: t.description, 
          amount: t.amount,
          meal: t.mealType 
        }));
      
      const guestDetails = dailyTx
        .filter(t => t.type === 'Guest')
        .map(t => ({
          meal: t.mealType,
          amount: t.amount
        }));

      consumptionData.push({
        date: currentMoment.format('YYYY-MM-DD'),
        messStatus: status.toUpperCase(),
        extras,
        guestMeals: guestDetails.length,
        guestDetails
      });
    }

    res.status(200).json(consumptionData);
  } catch (error) {
    console.error('Error fetching consumption data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
