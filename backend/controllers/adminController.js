const Menu = require("../models/menu");
const Pricing = require("../models/Pricing");
const User = require("../models/user");
const Leave = require("../models/leave");
const MessRequest = require("../models/messRequest");
const Transaction = require("../models/transaction");
const Attendance = require("../models/attendance");
const moment = require("moment-timezone");

// --- Midnight Ledger (Daily Automation) ---
exports.processDailyBilling = async (req, res) => {
  try {
    // Get exactly 12:00 AM today, Indian Standard Time
    const today = moment.tz("Asia/Kolkata").startOf("day").toDate();
    const activePricing = await Pricing.findOne();
    if (!activePricing || !activePricing.student) {
      if (res)
        return res
          .status(404)
          .json({ message: "No active pricing plan found." });
      return;
    }

    const dailyMealCost =
      activePricing.student.breakfast +
      activePricing.student.lunch +
      activePricing.student.dinner;

    const students = await User.find({ role: "student" });
    const ledgerEntries = [];

    for (const student of students) {
      // INSTANT EFFECT: Respect pending requests immediately for billing
      const effectiveStatus = student.messStatusRequest === 'Request_Open' ? 'Open' :
        (student.messStatusRequest === 'Request_Close' ? 'Closed' : student.messStatus);

      if (effectiveStatus === 'Closed') {
        continue;
      }

      // 🛡️ THE NEW SAFETY LOCK: Did we already bill them today?
      const alreadyBilled = await Transaction.findOne({
        student: student._id,
        date: today,
        type: "DailyMeals",
      });

      if (alreadyBilled) {
        continue; // Skip this student, they already paid today!
      }

      // Check if student is on approved leave today
      // Use endOf('day') and startOf('day') to handle potential UTC/IST offset mismatches
      const onLeave = await Leave.findOne({
        student: student._id,
        status: "Approved",
        startDate: { $lte: moment(today).endOf('day').toDate() },
        endDate: { $gte: moment(today).startOf('day').toDate() },
      });

      // If NOT on leave and NOT already billed, prepare the Transaction entry
      if (!onLeave) {
        ledgerEntries.push({
          student: student._id,
          date: today,
          type: "DailyMeals",
          description: `Daily Mess Charge (B+L+D): ${today.toDateString()}`,
          amount: dailyMealCost,
          mealType: "N/A",
        });
      }
    }

    if (ledgerEntries.length > 0) {
      await Transaction.insertMany(ledgerEntries);
    }

    const successMsg = `Midnight Ledger: Processed ${ledgerEntries.length} student charges at ₹${dailyMealCost} each.`;
    console.log(successMsg);

    if (res) {
      return res.status(200).json({
        success: true,
        message: successMsg,
        rateApplied: dailyMealCost,
      });
    }
  } catch (error) {
    console.error("Ledger Error:", error);
    if (res)
      return res.status(500).json({ error: "Failed to process ledger." });
  }
};

// --- Month-End Settlement (Last day at 11:30 PM) ---
exports.processMonthEndSettlement = async () => {
  try {
    console.log('--- [SYSTEM] Triggering Automated Month-End Settlement (IST) ---');
    const now = moment().tz("Asia/Kolkata");
    const students = await User.find({ role: 'student' });
    
    let totalSettled = 0;

    for (const student of students) {
      const lastSettlement = student.lastSettlementDate || moment().tz("Asia/Kolkata").startOf('month').toDate();
      
      // Fetch all charges since last settlement
      const transactions = await Transaction.find({
        student: student._id,
        date: { $gt: lastSettlement },
        type: { $in: ['DailyMeals', 'Extra', 'Guest'] }
      });

      // Fetch all payments/rebates since last settlement
      const credits = await Transaction.find({
        student: student._id,
        date: { $gt: lastSettlement },
        type: { $in: ['Payment', 'Rebate'] }
      });

      const chargesTotal = transactions.reduce((acc, t) => acc + t.amount, 0);
      const creditsTotal = credits.reduce((acc, t) => acc + t.amount, 0);
      const netMonthlyBill = chargesTotal - creditsTotal;

      if (netMonthlyBill !== 0) {
        student.previousDues = (student.previousDues || 0) + netMonthlyBill;
        student.lastSettlementDate = now.toDate();
        await student.save();
        totalSettled++;
      } else {
        // Even if bill is 0, update settlement date to "reset" the month
        student.lastSettlementDate = now.toDate();
        await student.save();
      }
    }
    console.log(`--- [SYSTEM] Settlement Complete: Updated ${totalSettled} students ---`);
  } catch (err) {
    console.error('--- [SYSTEM] Month-End Settlement Failed:', err);
  }
};

// --- Monthly Late Fine (5% if > 2500, Runs on 1st at 12:00 AM) ---
exports.processMonthlyFine = async () => {
  try {
    const now = moment().tz("Asia/Kolkata");
    const students = await User.find({ role: 'student' });
    const fineEntries = [];

    for (const student of students) {
      // Net payable is now essentially student.previousDues (since we just settled)
      // plus any transactions that happened in the last 30 mins (unlikely but possible)
      const totalPayable = (student.previousDues || 0);

      if (totalPayable > 2500) {
        const fineAmount = Math.round(totalPayable * 0.05);
        fineEntries.push({
          student: student._id,
          date: now.toDate(),
          type: 'Fine',
          description: `5% Late Fine for outstanding balance > ₹2500`,
          amount: fineAmount,
          mealType: 'N/A'
        });
      }
    }

    if (fineEntries.length > 0) {
      await Transaction.insertMany(fineEntries);
      console.log(`[SYSTEM] Applied 5% fine to ${fineEntries.length} students.`);
    }
  } catch (err) {
    console.error('[SYSTEM] Monthly Fine Process Failed:', err);
  }
};


// --- Admin Helper: Process Batch Ledger for missing days ---
exports.backfillMissingDays = async (req, res) => {
  try {
    const { startDate, endDate } = req.body; // Expected ISO strings
    if (!startDate || !endDate) return res.status(400).json({ message: "Dates required" });

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).startOf('day');

    const activePricing = await Pricing.findOne();
    const dailyMealCost = activePricing.student.breakfast + activePricing.student.lunch + activePricing.student.dinner;
    const students = await User.find({ role: "student" });

    let totalCreated = 0;

    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
      const targetDate = m.toDate();
      const ledgerEntries = [];

      for (const student of students) {
        // Status check
        const effectiveStatus = student.messStatus;
        if (effectiveStatus === 'Closed') continue;

        // Billed check
        const alreadyBilled = await Transaction.findOne({
          student: student._id,
          date: targetDate,
          type: "DailyMeals"
        });
        if (alreadyBilled) continue;

        // Leave check
        const onLeave = await Leave.findOne({
          student: student._id,
          status: "Approved",
          startDate: { $lte: moment(targetDate).endOf('day').toDate() },
          endDate: { $gte: moment(targetDate).startOf('day').toDate() }
        });

        if (!onLeave) {
          ledgerEntries.push({
            student: student._id,
            date: targetDate,
            type: "DailyMeals",
            description: `Backfilled Mess Charge: ${targetDate.toDateString()}`,
            amount: dailyMealCost,
            mealType: "N/A"
          });
        }
      }

      if (ledgerEntries.length > 0) {
        await Transaction.insertMany(ledgerEntries);
        totalCreated += ledgerEntries.length;
      }
    }

    res.status(200).json({ success: true, message: `Backfilled ${totalCreated} records.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- CRUD Endpoints ---

exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.findOne();
    res.json(menu || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { status, timings, menu } = req.body;
    // We maintain a single menu document for the entire week
    const updatedMenu = await Menu.findOneAndUpdate(
      {},
      { status, timings, menu },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    res.json(updatedMenu);
  } catch (err) {
    console.error("Update Menu Error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.findOne();
    res.json(pricing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findOneAndUpdate({}, req.body, {
      returnDocument: 'after',
      upsert: true,
    });
    res.json(pricing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    // Lock month boundaries to IST
    const nowIST = moment.tz("Asia/Kolkata");
    const daysInMonth = nowIST.daysInMonth();
    const currentYear = nowIST.year();
    const currentMonth = nowIST.month(); // Note: moment months are 0-indexed just like JS Dates

    const startOfMonth = nowIST.clone().startOf("month").toDate();
    const endOfMonth = nowIST.clone().endOf("month").toDate();

    // QUERY 1: Fetch all students
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ name: 1 });
    const studentIds = students.map((s) => s._id);

    // QUERY 2: Fetch ALL approved leaves for these students in ONE go using $in
    const allLeaves = await Leave.find({
      student: { $in: studentIds },
      status: "Approved",
      $or: [
        { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { startDate: { $lt: startOfMonth }, endDate: { $gt: endOfMonth } },
      ],
    });

    // QUERY 3: Fetch ALL transactions for these students (from start of month or last settlement)
    const allTransactions = await Transaction.find({
      student: { $in: studentIds },
      date: { $gte: moment(startOfMonth).subtract(1, 'month').toDate() }, // Look back a bit to be safe
    });


    // --- Organize data in server memory (Extremely Fast) ---
    const leavesByStudent = {};
    allLeaves.forEach((leave) => {
      const id = leave.student.toString();
      if (!leavesByStudent[id]) leavesByStudent[id] = [];
      leavesByStudent[id].push(leave);
    });

    const txByStudent = {};
    allTransactions.forEach((tx) => {
      const id = tx.student.toString();
      if (!txByStudent[id]) txByStudent[id] = [];
      txByStudent[id].push(tx);
    });

    // --- Map over students without touching the database again ---
    const processedStudents = students.map((student) => {
      const studentIdStr = student._id.toString();
      let monthlyStatus = Array(daysInMonth).fill(true);

      // 1. Process Leaves from memory
      const studentLeaves = leavesByStudent[studentIdStr] || [];
      studentLeaves.forEach((leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);

        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(currentYear, currentMonth, day).setHours(0, 0, 0, 0);
          const leaveStart = new Date(start).setHours(0, 0, 0, 0);
          const leaveEnd = new Date(end).setHours(0, 0, 0, 0);

          if (currentDate >= leaveStart && currentDate <= leaveEnd) {
            monthlyStatus[day - 1] = false;
          }
        }
      });

      // 2. Process Transactions from memory
      const monthlyTransactions = txByStudent[studentIdStr] || [];
      let dailyMealsTotal = 0;
      let totalExtras = 0;
      let totalGuestAmount = 0;
      let fineAmount = 0;
      let paymentsAndRebates = 0;

      monthlyTransactions.forEach((trans) => {
        // ONLY count transactions that happened AFTER the last settlement
        if (student.lastSettlementDate && trans.date <= student.lastSettlementDate) return;
        // If no settlement date yet, fall back to start of month
        if (!student.lastSettlementDate && trans.date < startOfMonth) return;

        const amount = trans.amount || 0;
        if (trans.type === 'DailyMeals') dailyMealsTotal += amount;
        if (trans.type === 'Extra') totalExtras += amount;
        if (trans.type === 'Guest') totalGuestAmount += amount;
        if (trans.type === 'Fine') fineAmount += amount;

        if (["Rebate", "Payment"].includes(trans.type)) {
          paymentsAndRebates += amount;
        }
      });


      // currentMonthBill is the total of all charges minus payments/rebates for this month
      const currentMonthBill = (dailyMealsTotal + totalExtras + totalGuestAmount + fineAmount) - paymentsAndRebates;

      return {
        _id: student._id,
        name: student.name,
        messAccount: student.messAccount || "N/A",
        year: student.year || "N/A",
        urn: student.urn || "N/A",
        crn: student.crn || "N/A",
        department: student.department || "N/A",
        phone: student.phone || "N/A",
        monthlyStatus: monthlyStatus,
        dailyMealsTotal: dailyMealsTotal,
        totalExtras: totalExtras,
        totalGuestAmount: totalGuestAmount,
        fineAmount: fineAmount,
        currentMonthBill: currentMonthBill,
        previousDues: student.previousDues || 0
      };
    });

    res.json({
      success: true,
      students: processedStudents,
    });
  } catch (err) {
    console.error("Fetch Students Error:", err);
    res.status(500).json({ message: "Server error fetching student data" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ success: true, student });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// --- Attendance & Consumption History ---

exports.getStudentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.params.id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentConsumption = async (req, res) => {
  try {
    const studentId = req.params.id;
    const now = moment.tz("Asia/Kolkata");
    const year = now.year();
    const month = now.month(); // 0-indexed
    const daysInMonth = now.daysInMonth();

    const startOfMonth = now.clone().startOf("month").toDate();
    const endOfMonth = now.clone().endOf("month").toDate();

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
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const consumptionData = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const currentMoment = moment.tz(`${year}-${month + 1}-${d}`, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day');

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

      // Hide future status
      const today = moment.tz('Asia/Kolkata').startOf('day');
      if (currentMoment.isAfter(today)) {
        status = 'ND';
      }

      // Check Leaves
      const onLeave = leaves.some(l => {
        const start = moment.tz(l.startDate, 'Asia/Kolkata').startOf('day');
        const end = moment.tz(l.endDate, 'Asia/Kolkata').startOf('day');
        return currentMoment.isSameOrAfter(start) && currentMoment.isSameOrBefore(end);
      });

      if (onLeave) status = 'Closed';

      // Check Mess Requests (Overrides)
      const request = messRequests.find(r => {
        return moment.tz(r.date, 'Asia/Kolkata').startOf('day').isSame(currentMoment, 'day');
      });

      if (request) {
        status = request.action === 'OPEN' ? 'Open' : 'Closed';
      }

      // Collect Extras and Guest Meals
      const dailyTx = transactions.filter(t => {
        return moment(t.date).tz('Asia/Kolkata').isSame(currentMoment, 'day');
      });

      const extras = dailyTx
        .filter(t => t.type === 'Extra')
        .map(t => ({
          item: t.description.replace('Extra: ', ''),
          amount: t.amount,
          meal: t.mealType
        }));

      const guestDetails = dailyTx
        .filter(t => t.type === 'Guest')
        .map(t => ({
          meal: t.mealType,
          amount: t.amount
        }));

      // Daily total including meals
      let dailyBill = 0;
      dailyTx.forEach(t => {
        if (['DailyMeals', 'Extra', 'Guest', 'Fine'].includes(t.type)) {
          dailyBill += t.amount;
        }
      });

      consumptionData.push({
        date: currentMoment.format('YYYY-MM-DD'),
        day: d,
        messStatus: status.toUpperCase(),
        extras,
        guestMeals: guestDetails.length,
        guestDetails,
        dailyBill
      });
    }

    res.status(200).json({ success: true, consumption: consumptionData });
  } catch (error) {
    console.error("Error fetching student consumption:", error);
    res.status(500).json({ success: false, message: "Server error fetching consumption" });
  }
};
