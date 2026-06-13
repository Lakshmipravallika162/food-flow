const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, restrictTo } = require('../middleware/auth');

// ─── GET /api/notifications/user/:userId ──────────────────────────────────────
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ success: true, data: notifications });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/notifications/user/:userId/unread-count ─────────────────────────
router.get('/user/:userId/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
    return res.json({ success: true, data: { count } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/notifications ──────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { userId, type, title, message, postId } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, error: 'userId, title and message are required' });
    }

    const notification = await Notification.create({ userId, type, title, message, postId });
    return res.status(201).json({ success: true, data: notification });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, error: 'Notification not found' });
    return res.json({ success: true, data: notification });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, error: 'Notification not found' });
    return res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
