const Notice = require('../models/Notice');
const fs = require('fs');
const path = require('path');

// GET /api/admin/notices
exports.getNotices = async (req, res) => {
  try {
    // Fetch all notices for the admin dashboard (frontend will split active/history)
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json({ notices });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Server error while fetching notices." });
  }
};

// POST /api/admin/notices
exports.createNotice = async (req, res) => {
  try {
    const { title, content, priority, date, validUntil } = req.body;
    let attachmentUrl = null;

    if (req.file) {
      // Save the relative URL so the frontend can access it
      attachmentUrl = `/uploads/notices/${req.file.filename}`;
    }

    const newNotice = new Notice({ title, content, priority, date, attachmentUrl, validUntil: validUntil || null });
    await newNotice.save();
    
    res.status(201).json({ notice: newNotice });
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ message: "Server error while creating notice." });
  }
};

// DELETE /api/admin/notices/:id
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found." });

    // Clean up the attached file from the server
    if (notice.attachmentUrl) {
      const filePath = path.join(__dirname, '..', notice.attachmentUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: "Notice deleted successfully." });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Server error while deleting notice." });
  }
};