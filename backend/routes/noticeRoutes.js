const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const noticeController = require('../controllers/noticeController');
const { protect, isAdmin } = require('./authMiddleware');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/notices');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', protect, (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return noticeController.getNotices(req, res, next);
  } else {
    return noticeController.getActiveNotices(req, res, next);
  }
});
router.post('/', protect, isAdmin, upload.single('attachment'), noticeController.createNotice);
router.put('/:id', protect, isAdmin, upload.single('attachment'), noticeController.updateNotice);
router.delete('/:id', protect, isAdmin, noticeController.deleteNotice);

module.exports = router;