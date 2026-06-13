const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const { protect, restrictTo } = require('../middleware/auth');

// ─── GET /api/claims ────────────────────────────────── admin only ────────────
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const claims = await Claim.find({})
      .populate('postId', 'title address donorName')
      .populate('userId', 'name email organizationName')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: claims });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/claims/user/:userId ─────────────────────────────────────────────
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.params.userId })
      .populate('postId', 'title address donorName status expiryTime')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: claims });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/claims/post/:postId ─────────────────────────────────────────────
router.get('/post/:postId', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ postId: req.params.postId })
      .populate('userId', 'name email organizationName')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: claims });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/claims ─────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { postId, organizationName } = req.body;
    if (!postId) {
      return res.status(400).json({ success: false, error: 'postId is required' });
    }

    const claim = await Claim.create({
      postId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      organizationName: organizationName || req.user.organizationName || '',
    });

    return res.status(201).json({ success: true, data: claim });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/claims/:id ──────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });
    return res.json({ success: true, data: claim });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PATCH /api/claims/:id/status ─────────────────────────────────────────────
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const claim = await Claim.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });
    return res.json({ success: true, data: claim });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/claims/:id ───────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });

    if (claim.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this claim' });
    }

    await claim.deleteOne();
    return res.json({ success: true, message: 'Claim deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
