const Notice = require('../models/Notice');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');


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
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'smartmess/notices',
        resource_type: 'auto'
      });
      attachmentUrl = result.secure_url;
      const attachmentPublicId = result.public_id;

      // Clean up local file
      fs.unlinkSync(req.file.path);

      const newNotice = new Notice({ 
        title, 
        content, 
        priority, 
        date, 
        attachmentUrl, 
        attachmentPublicId,
        validUntil: validUntil || null 
      });
      await newNotice.save();
      res.status(201).json({ notice: newNotice });
    } else {
      const newNotice = new Notice({ title, content, priority, date, validUntil: validUntil || null });
      await newNotice.save();
      res.status(201).json({ notice: newNotice });
    }
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

    // Clean up the attached file
    if (notice.attachmentPublicId) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(notice.attachmentPublicId);
    } else if (notice.attachmentUrl) {
      // Legacy local file cleanup
      const filePath = path.join(__dirname, '..', notice.attachmentUrl); 
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (fileError) {
        console.warn(`Failed to delete local attachment file: ${filePath}`, fileError);
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
    const createdAt = new Date(notice.createdAt || notice.date);
    if ((now - createdAt) > EDIT_WINDOW_MS) {
      return res.status(403).json({ message: "Edit window (5 minutes) has expired." });
    }

    notice.title = title;
    notice.content = content;
    notice.priority = priority;
    if (validUntil !== undefined) {
      notice.validUntil = (validUntil === "" || validUntil === "null") ? null : validUntil;
    }

    if (req.file) {
      // Delete old attachment if exists
      if (notice.attachmentPublicId) {
        await cloudinary.uploader.destroy(notice.attachmentPublicId);
      } else if (notice.attachmentUrl) {
        // Old local file cleanup
        const oldFilePath = path.join(__dirname, '..', notice.attachmentUrl); 
        if (fs.existsSync(oldFilePath)) {
          try {
            await fs.promises.unlink(oldFilePath);
          } catch (e) {
            console.warn("Failed to delete old local file", e);
          }
        }
      }

      // Upload new one to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'smartmess/notices',
        resource_type: 'auto'
      });
      notice.attachmentUrl = result.secure_url;
      notice.attachmentPublicId = result.public_id;

      // Clean up local file
      fs.unlinkSync(req.file.path);
    }


    await notice.save();
    res.status(200).json({ notice });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ message: "Server error while updating notice." });
  }
};

// GET /api/notices (Student view)
exports.getActiveNotices = async (req, res) => {
  try {
    const now = new Date();
    // Fetch notices that are either not expired or have no expiration date
    const notices = await Notice.find({
      $or: [
        { validUntil: { $gt: now } },
        { validUntil: null }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ notices });
  } catch (error) {
    console.error("Error fetching active notices:", error);
    res.status(500).json({ message: "Server error while fetching notices." });
  }
};