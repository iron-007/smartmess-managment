const Notice = require('../models/Notice');
const fs = require('fs');
const path = require('path');

// Define constants for magic numbers
const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

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
      // Store path relative to the project structure, without a leading slash
      attachmentUrl = `uploads/notices/${req.file.filename}`;
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
      // Assuming 'uploads' directory is a sibling of 'controllers'
      const filePath = path.join(__dirname, '..', notice.attachmentUrl); 
      try {
        // Use async unlink and check for existence beforehand to avoid errors
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (fileError) {
        // If the DB entry is deleted but the file isn't, we should log it
        // but not fail the whole operation, as the primary resource is gone.
        console.warn(`Failed to delete attachment file: ${filePath}`, fileError);
      }
    }

    res.status(200).json({ message: "Notice deleted successfully." });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Server error while deleting notice." });
  }
};

// PUT /api/admin/notices/:id
exports.updateNotice = async (req, res) => {
  try {
    const { title, content, priority, validUntil } = req.body;
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found." });

    // Enforce backend 5 minute edit window validation 
    const now = new Date();
    const createdAt = new Date(notice.createdAt);
    if ((now - createdAt) > EDIT_WINDOW_MS) {
      return res.status(403).json({ message: "Edit window (5 minutes) has expired." });
    }

    notice.title = title;
    notice.content = content;
    notice.priority = priority;
    if (validUntil !== undefined) notice.validUntil = validUntil || null;

    if (req.file) {
      if (notice.attachmentUrl) {
        const oldFilePath = path.join(__dirname, '..', notice.attachmentUrl); 
        try {
          if (fs.existsSync(oldFilePath)) {
            await fs.promises.unlink(oldFilePath);
          }
        } catch (fileError) {
          console.warn(`Failed to delete old attachment file: ${oldFilePath}`, fileError);
        }
      }
      // Store path relative to the project structure, without a leading slash
      notice.attachmentUrl = `uploads/notices/${req.file.filename}`;
    }

    await notice.save();
    res.status(200).json({ notice });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ message: "Server error while updating notice." });
  }
};