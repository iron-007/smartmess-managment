const User = require('../models/user');
const Leave = require('../models/leave');
const Pricing = require('../models/pricing');

// @desc    Get Student Directory & Billing Grid data
// @route   GET /api/admin/students
// @access  Admin
exports.getStudentDirectory = async (req, res) => {
  try {
    // 1. Fetch Users (only students)
    const students = await User.find({ role: 'student' }).lean();

    // Setup Current Month date boundaries
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Fetch all approved leaves overlapping this month (Prevents N+1 query issue)
    const allApprovedLeaves = await Leave.find({
      status: 'Approved',
      startDate: { $lte: monthEnd },
      endDate: { $gte: monthStart }
    }).lean();

    // 3. Financial Calculation - Get daily cost
    // Calculate daily cost from Pricing model (e.g. 30 + 50 + 50 = 130)
    const pricingDoc = await Pricing.findOne().lean();
    let dailyCost = 130; // Safe fallback
    if (pricingDoc && pricingDoc.student) {
      dailyCost = 
        (pricingDoc.student.breakfast || 0) + 
        (pricingDoc.student.lunch || 0) + 
        (pricingDoc.student.dinner || 0);
    }

    // 2. Math & Attendance Engine
    const directoryData = students.map(student => {
      // Create array for days in month, defaulting to true
      const monthlyStatus = Array.from({ length: daysInMonth }, () => true);

      // Filter leaves for this specific student
      const studentLeaves = allApprovedLeaves.filter(
        leave => leave.student && leave.student.toString() === student._id.toString()
      );

      // Apply leaves to the monthlyStatus array
      studentLeaves.forEach(leave => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);

        // Clamp dates strictly to the current month's bounds
        const effectiveStart = start < monthStart ? 1 : start.getDate();
        const effectiveEnd = end > monthEnd ? daysInMonth : end.getDate();

        for (let day = effectiveStart; day <= effectiveEnd; day++) {
          monthlyStatus[day - 1] = false; // day - 1 because arrays are 0-indexed
        }
      });

      const presentDays = monthlyStatus.filter(status => status === true).length;
      const currentMonthBill = presentDays * dailyCost;

      // 4. Output Structure
      return {
        _id: student._id,
        name: student.name,
        messAccount: student.messAccount || 'N/A',
        year: student.year || 'N/A',
        urn: student.urn || 'N/A',
        crn: student.crn || 'N/A',
        department: student.department || 'N/A',
        phone: student.phone || 'N/A', // Kept phone here based on recent frontend changes!
        monthlyStatus,
        currentMonthBill,
        previousDues: student.previousDues || 0
      };
    });

    res.status(200).json({
      success: true,
      count: directoryData.length,
      students: directoryData
    });

  } catch (error) {
    console.error('Error in getStudentDirectory:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching student directory.' });
  }
};