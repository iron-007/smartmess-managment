const Menu = require("../models/Menu");
const Pricing = require("../models/Pricing");
const User = require("../models/user");
const Leave = require("../models/leave");
const Transaction = require("../models/transaction");
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
      const onLeave = await Leave.findOne({
        student: student._id,
        status: "Approved",
        startDate: { $lte: today },
        endDate: { $gte: today },
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

// --- Menu Controllers ---
exports.getMenu = async (req, res) => {
  try {
    let menuData = await Menu.findOne();
    if (!menuData) {
      return res.status(200).json({});
    }
    res.status(200).json(menuData);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Server error fetching menu" });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { menu, timings, status } = req.body;
    let menuData = await Menu.findOne();

    if (menuData) {
      menuData.menu = menu;
      menuData.timings = timings;
      menuData.status = status;
      await menuData.save();
    } else {
      menuData = new Menu({ menu, timings, status });
      await menuData.save();
    }

    res.status(200).json({ message: "Menu updated successfully", menuData });
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).json({ message: "Server error updating menu" });
  }
};

// --- Pricing Controllers ---
exports.getPricing = async (req, res) => {
  try {
    let pricingData = await Pricing.findOne();
    if (!pricingData) {
      return res.status(200).json({});
    }
    res.status(200).json({
      pricing: {
        baseFee: pricingData.baseFee,
        student: pricingData.student,
        guest: pricingData.guest,
        rules: pricingData.rules,
      },
      auditLog: pricingData.auditLog,
    });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    res.status(500).json({ message: "Server error fetching pricing" });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const pricingPayload = req.body;
    let pricingData = await Pricing.findOne();

    const newLogEntry = {
      date: new Date().toISOString().split("T")[0],
      action: "Updated pricing and rules",
      admin: req.user ? req.user.name : "System Admin",
    };

    if (pricingData) {
      pricingData.baseFee = pricingPayload.baseFee;
      pricingData.student = pricingPayload.student;
      pricingData.guest = pricingPayload.guest;
      pricingData.rules = pricingPayload.rules;

      pricingData.auditLog.unshift(newLogEntry);
      if (pricingData.auditLog.length > 20) pricingData.auditLog.pop();

      await pricingData.save();
    } else {
      pricingData = new Pricing({
        ...pricingPayload,
        auditLog: [newLogEntry],
      });
      await pricingData.save();
    }

    res
      .status(200)
      .json({
        message: "Pricing updated successfully",
        auditLog: pricingData.auditLog,
      });
  } catch (error) {
    console.error("Error updating pricing:", error);
    res.status(500).json({ message: "Server error updating pricing" });
  }
};

// --- Student Management ---
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

    // QUERY 3: Fetch ALL transactions for these students in ONE go using $in
    const allTransactions = await Transaction.find({
      student: { $in: studentIds },
      date: { $gte: startOfMonth, $lte: endOfMonth },
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
          const currentDate = new Date(currentYear, currentMonth, day).setHours(
            0,
            0,
            0,
            0,
          );
          const leaveStart = new Date(start).setHours(0, 0, 0, 0);
          const leaveEnd = new Date(end).setHours(0, 0, 0, 0);

          if (currentDate >= leaveStart && currentDate <= leaveEnd) {
            monthlyStatus[day - 1] = false;
          }
        }
      });

      // 2. Process Transactions from memory
      const monthlyTransactions = txByStudent[studentIdStr] || [];
      let currentMonthBill = 0;
      monthlyTransactions.forEach((trans) => {
        if (["DailyMeals", "Extra", "Guest"].includes(trans.type)) {
          currentMonthBill += trans.amount;
        } else if (["Rebate", "Payment"].includes(trans.type)) {
          currentMonthBill -= trans.amount;
        }
      });

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
        currentMonthBill: currentMonthBill,
        previousDues: student.previousDues || 0,
      };
    });

    res
      .status(200)
      .json({
        success: true,
        daysInMonth: daysInMonth,
        students: processedStudents,
      });
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching students" });
  }
};
// // --- TEMPORARY BACKFILL SCRIPT ---
// // Run this ONCE to fill in missing ledger data for the current month
// exports.backfillMissingDays = async (req, res) => {
//     try {
//         const today = new Date();
//         const currentYear = today.getFullYear();
//         const currentMonth = today.getMonth();
//         const yesterday = today.getDate() - 1; // Stops at yesterday so it doesn't double-charge today

//         // 1. Get pricing
//         const activePricing = await Pricing.findOne();
//         const dailyMealCost = activePricing.student.breakfast + activePricing.student.lunch + activePricing.student.dinner;

//         const students = await User.find({ role: 'student' });
//         let entriesAdded = 0;

//         // 2. Loop through every day of the month from Day 1 up to Yesterday
//         for (let day = 1; day <= yesterday; day++) {
//             const targetDate = new Date(currentYear, currentMonth, day);
//             targetDate.setHours(0,0,0,0); // Normalize to midnight

//             // 3. Loop through every student for that day
//             for (const student of students) {

//                 // SAFETY CHECK: Did we already bill them for this exact day?
//                 const existingTx = await Transaction.findOne({
//                     student: student._id,
//                     date: targetDate,
//                     type: 'DailyMeals'
//                 });

//                 if (existingTx) continue; // If yes, skip them. No double charging!

//                 // Check if they were on leave on this specific past day
//                 const onLeave = await Leave.findOne({
//                     student: student._id,
//                     status: 'Approved',
//                     startDate: { $lte: targetDate },
//                     endDate: { $gte: targetDate }
//                 });

//                 // If not on leave, generate the missing receipt!
//                 if (!onLeave) {
//                     await Transaction.create({
//                         student: student._id,
//                         date: targetDate,
//                         type: 'DailyMeals',
//                         description: `Historical Backfill (B+L+D): ${targetDate.toDateString()}`,
//                         amount: dailyMealCost,
//                         mealType: 'N/A'
//                     });
//                     entriesAdded++;
//                 }
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: `Historical Backfill complete! Added ${entriesAdded} missing transactions from Day 1 to Day ${yesterday}.`
//         });

//     } catch (error) {
//         console.error("Backfill Error:", error);
//         res.status(500).json({ success: false, message: "Server error during backfill." });
//     }
// };

// --- Account Approvals ---
exports.getPendingApprovals = async (req, res) => {
  try {
    // Fetch students who have requested to open or close their mess account
    const pendingUsers = await User.find({ messStatusRequest: { $ne: 'None' } }).select('-password').sort({ _id: -1 });
    res.status(200).json({ success: true, users: pendingUsers });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ success: false, message: "Server error fetching pending approvals" });
  }
};

exports.approveAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Apply the requested status
    let actionLog = '';
    if (user.messStatusRequest === 'Request_Open') {
      user.messStatus = 'Open';
      actionLog = 'Admin Approved: Account Opened';
    } else if (user.messStatusRequest === 'Request_Close') {
      user.messStatus = 'Closed';
      actionLog = 'Admin Approved: Account Closed';
    }
    
    user.messStatusLog.push({
      action: actionLog,
      remark: `Status officially changed to ${user.messStatus}`
    });

    user.messStatusRequest = 'None'; // Clear the request
    await user.save();

    res.status(200).json({ success: true, message: "Account approved successfully", user });
  } catch (error) {
    console.error("Error approving account:", error);
    res.status(500).json({ success: false, message: "Server error approving account" });
  }
};

exports.rejectAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Rejecting means we just clear the request without changing the actual status
    user.messStatusLog.push({
      action: `Admin Rejected: ${user.messStatusRequest === 'Request_Open' ? 'Open Request' : 'Close Request'}`,
      remark: `Account remains ${user.messStatus}`
    });

    user.messStatusRequest = 'None';
    await user.save();

    res.status(200).json({ success: true, message: "Account request rejected" });
  } catch (error) {
    console.error("Error rejecting account:", error);
    res.status(500).json({ success: false, message: "Server error rejecting account" });
  }
};
