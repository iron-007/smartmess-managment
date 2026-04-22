const User = require('../models/user');
const Leave = require('../models/leave');
const Transaction = require('../models/transaction');
// const Pricing = require('../models/Pricing'); // Pricing model might be needed for base fee/rebate calculations, but for now, we sum existing transactions.

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
    const { requestType } = req.body; // Expects 'Request_Open' or 'Request_Close'

    if (!['Request_Open', 'Request_Close'].includes(requestType)) {
      return res.status(400).json({ message: 'Invalid request type. Must be Request_Open or Request_Close.' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if ((requestType === 'Request_Open' && student.messStatus === 'Open') ||
        (requestType === 'Request_Close' && student.messStatus === 'Closed')) {
      return res.status(400).json({ message: `Your mess account is already ${student.messStatus}.` });
    }

    student.messStatusRequest = requestType;
    student.messStatusLog.push({
      action: `Student Requested: ${requestType === 'Request_Open' ? 'Open Account' : 'Close Account'}`,
      remark: 'Pending Admin Approval'
    });
    await student.save();

    res.status(200).json({ message: `Request to ${requestType === 'Request_Open' ? 'open' : 'close'} mess account submitted successfully.` });
  } catch (error) {
    console.error('Error submitting account request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};