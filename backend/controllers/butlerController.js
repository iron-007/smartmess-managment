const User = require("../models/user");
const MessRequest = require("../models/messRequest");
const Attendance = require("../models/attendance");
const Transaction = require("../models/transaction");
const Pricing = require("../models/Pricing");
const moment = require("moment-timezone");

// @desc    Get all pending permanent account requests
// @route   GET /api/butler/approvals
// @access  Butler/Admin
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({ messStatusRequest: { $ne: 'None' } })
      .select('name email role messStatus messStatusRequest messStatusLog messAccount');
    
    res.status(200).json({ success: true, users: pendingUsers });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ success: false, message: "Server error fetching pending approvals" });
  }
};

// @desc    Get all students with their current bill totals
// @route   GET /api/butler/student-bills
// @access  Butler/Admin
exports.getStudentBills = async (req, res) => {
  try {
    const pricing = await Pricing.findOne();
    const baseFee = pricing?.baseFee || 1200;
    const rebateRate = 27;
    const dailyRate = (pricing?.student?.breakfast || 0) + (pricing?.student?.lunch || 0) + (pricing?.student?.dinner || 0);

    const now = moment().tz('Asia/Kolkata');
    const startOfMonth = now.clone().startOf('month').toDate();
    const endOfMonth = now.clone().endOf('month').toDate();
    const daysSoFar = now.date();

    const students = await User.find({ role: 'student' }).select('name messAccount previousDues lastRequestDate messStatus');
    
    // Fetch all transactions for the month at once for efficiency
    const allTransactions = await Transaction.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const studentBills = students.map(student => {
      const studentTx = allTransactions.filter(t => t.student.toString() === student._id.toString());
      
      const extraTotal = studentTx.filter(t => t.type === 'Extra').reduce((acc, t) => acc + t.amount, 0);
      const guestTotal = studentTx.filter(t => t.type === 'Guest').reduce((acc, t) => acc + t.amount, 0);
      const fineTotal = studentTx.filter(t => t.type === 'Fine').reduce((acc, t) => acc + t.amount, 0);

      // Calculate Rebate
      let closedDays = 0;
      const lastChange = student.lastRequestDate ? moment.tz(student.lastRequestDate, 'Asia/Kolkata').startOf('day') : null;
      const currentStatus = student.messStatus;

      for (let d = 1; d <= daysSoFar; d++) {
        const dMoment = now.clone().date(d).startOf('day');
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
      const currentMonthTotal = baseFee + extraTotal + guestTotal + fineTotal - rebateTotal;
      const totalPayable = currentMonthTotal + (student.previousDues || 0);

      return {
        _id: student._id,
        name: student.name,
        messAccount: student.messAccount,
        totalPayable,
        currentMonthTotal,
        previousDues: student.previousDues || 0,
        extraTotal,
        guestTotal,
        rebateTotal
      };
    });

    res.status(200).json({ success: true, bills: studentBills });
  } catch (error) {
    console.error("Error fetching student bills:", error);
    res.status(500).json({ success: false, message: "Server error fetching bills" });
  }
};

// @desc    Get daily active/inactive student counts for the current month (Graph Data)
// @route   GET /api/butler/status-stats
// @access  Butler/Admin
exports.getMonthlyStatusStats = async (req, res) => {
  try {
    const { year, month } = req.query; // Month is 1-12
    const now = moment().tz('Asia/Kolkata');
    const targetYear = year ? parseInt(year) : now.year();
    const targetMonth = month ? parseInt(month) - 1 : now.month();
    
    const startDate = moment.tz([targetYear, targetMonth, 1], 'Asia/Kolkata').startOf('day');
    const daysInMonth = startDate.daysInMonth();

    const students = await User.find({ role: 'student' }).select('lastRequestDate messStatus');
    
    const dailyStats = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dMoment = startDate.clone().date(d);
      
      let activeCount = 0;
      let inactiveCount = 0;

      // Only calculate up to today for actual data, or show trends? 
      // User asked for "perday of 30 day of month", so we'll calculate all days.
      // Future days will be based on current status unless we want to mark them differently.

      students.forEach(student => {
        const lastChange = student.lastRequestDate ? moment.tz(student.lastRequestDate, 'Asia/Kolkata').startOf('day') : null;
        const currentStatus = student.messStatus;

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

        if (dayStatus === 'Open') activeCount++;
        else inactiveCount++;
      });

      dailyStats.push({
        day: d,
        date: dMoment.format('MMM DD'),
        active: activeCount,
        inactive: inactiveCount
      });
    }

    res.status(200).json({ success: true, stats: dailyStats });
  } catch (error) {
    console.error("Error fetching status stats:", error);
    res.status(500).json({ success: false, message: "Server error fetching stats" });
  }
};

// @desc    Approve permanent account change
// @route   PUT /api/butler/approvals/:id/approve
// @access  Butler/Admin
exports.approveAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let actionLog = '';
    if (user.messStatusRequest === 'Request_Open') {
      user.messStatus = 'Open';
      actionLog = 'Butler Approved: Account Opened';
    } else if (user.messStatusRequest === 'Request_Close') {
      user.messStatus = 'Closed';
      actionLog = 'Butler Approved: Account Closed';
    }
    
    user.messStatusLog.push({
      action: actionLog,
      remark: `Official status: ${user.messStatus}`
    });

    user.messStatusRequest = 'None';
    user.messRequestDate = null;
    await user.save();

    res.status(200).json({ success: true, message: "Account approved successfully", user });
  } catch (error) {
    console.error("Error approving account:", error);
    res.status(500).json({ success: false, message: "Server error approving account" });
  }
};

// @desc    Reject permanent account change
// @route   DELETE /api/butler/approvals/:id/reject
// @access  Butler/Admin
exports.rejectAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.messStatusLog.push({
      action: `Butler Rejected: ${user.messStatusRequest === 'Request_Open' ? 'Open Request' : 'Close Request'}`,
      remark: `Account remains ${user.messStatus}`
    });

    user.messStatusRequest = 'None';
    user.messRequestDate = null;
    await user.save();

    res.status(200).json({ success: true, message: "Account request rejected" });
  } catch (error) {
    console.error("Error rejecting account:", error);
    res.status(500).json({ success: false, message: "Server error rejecting account" });
  }
};

// --- Butler Dashboard Features ---

// 1. LIVE MEAL ATTENDANCE TRACKER
// @desc    Get real-time attendance stats for today
// @route   GET /api/butler/live-attendance
exports.getLiveAttendance = async (req, res) => {
  try {
    const today = moment.tz("Asia/Kolkata").startOf('day').toDate();
    const tomorrow = moment.tz("Asia/Kolkata").add(1, 'days').startOf('day').toDate();

    const stats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: "$mealType",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      breakfastCount: 0,
      lunchCount: 0,
      dinnerCount: 0,
      totalServed: 0
    };

    stats.forEach(item => {
      if (item._id === 'Breakfast') result.breakfastCount = item.count;
      if (item._id === 'Lunch') result.lunchCount = item.count;
      if (item._id === 'Dinner') result.dinnerCount = item.count;
      result.totalServed += item.count;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching live attendance", error: error.message });
  }
};

// @desc    Get monthly attendance breakdown
// @route   GET /api/butler/attendance?month=MM&year=YYYY
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: "Month and Year required" });

    const startOfMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD").startOf('month').toDate();
    const endOfMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD").endOf('month').toDate();

    const stats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            mealType: "$mealType"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          meals: {
            $push: {
              mealType: "$_id.mealType",
              count: "$count"
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedResults = stats.map(day => {
      const dayObj = {
        date: day._id,
        breakfastCount: 0,
        lunchCount: 0,
        dinnerCount: 0
      };
      day.meals.forEach(m => {
        if (m.mealType === 'Breakfast') dayObj.breakfastCount = m.count;
        if (m.mealType === 'Lunch') dayObj.lunchCount = m.count;
        if (m.mealType === 'Dinner') dayObj.dinnerCount = m.count;
      });
      return dayObj;
    });

    res.status(200).json(formattedResults);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly attendance", error: error.message });
  }
};

// @desc    Mark attendance for a student
// @route   POST /api/butler/mark-attendance
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, mealType, date } = req.body;
    const targetDate = date ? moment.tz(date, "Asia/Kolkata").startOf('day').toDate() : moment.tz("Asia/Kolkata").startOf('day').toDate();

    const newAttendance = new Attendance({
      student: studentId,
      date: targetDate,
      mealType
    });

    await newAttendance.save();
    res.status(201).json({ success: true, message: "Attendance marked" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Attendance already marked for this meal" });
    }
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
};

// 2. EXTRAS & GUEST MEAL ENTRY
// @desc    Add extras or guest meals for a student
// @route   POST /api/butler/add-consumption
exports.addConsumption = async (req, res) => {
  try {
    const { studentId, date, extras, guestMeals } = req.body;
    
    // Check if student's mess account is active/open
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    
    if (student.messStatus !== 'Open') {
      return res.status(400).json({ 
        message: `Cannot log extras. ${student.name}'s mess account is currently CLOSED/INACTIVE.` 
      });
    }

    // Ensure we use the date as start of day in IST
    const targetDate = moment.tz(date, 'Asia/Kolkata').startOf('day').toDate();
    const transactions = [];

    // Add Extras
    if (extras && Array.isArray(extras)) {
      const pricing = await Pricing.findOne();
      const extraPriceMap = pricing?.extraPrices || new Map();
      
      for (const extra of extras) {
         // Lookup price or default to 0
         const itemPrice = extraPriceMap.get(extra.item) || 0;
         
         transactions.push({
           student: studentId,
           date: targetDate,
           type: 'Extra',
           description: `Extra: ${extra.item} (Qty: ${extra.quantity})`,
           amount: itemPrice * (parseInt(extra.quantity) || 1), 
           mealType: 'N/A'
         });
      }
    }

    // Add Guest Meals
    if (guestMeals > 0) {
      const pricing = await Pricing.findOne();
      const guestPrice = pricing ? pricing.guest.lunch : 50; // Fallback
      
      for (let i = 0; i < guestMeals; i++) {
        transactions.push({
          student: studentId,
          date: targetDate,
          type: 'Guest',
          description: `Guest Meal`,
          amount: guestPrice,
          mealType: 'N/A'
        });
      }
    }

    if (transactions.length > 0) {
      await Transaction.insertMany(transactions);
    }

    res.status(200).json({ success: true, message: "Consumption added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding consumption", error: error.message });
  }
};


// @desc    Get all students for selection dropdowns
// @route   GET /api/butler/students
exports.getButlerStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name messAccount').sort({ name: 1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

