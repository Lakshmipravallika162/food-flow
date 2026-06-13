const express = require('express');
const router = express.Router();
const FoodPost = require('../models/FoodPost');
const Claim = require('../models/Claim');
const { protect, restrictTo } = require('../middleware/auth');

// ─── GET /api/foodposts ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.foodType) filter.foodType = req.query.foodType;
    if (req.query.donorId)  filter.donorId  = req.query.donorId;

    const posts = await FoodPost.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: posts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/foodposts/available ────────────────────────────────────────────
router.get('/available', async (req, res) => {
  try {
    const posts = await FoodPost.find({
      status: 'available',
      expiryTime: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    return res.json({ success: true, data: posts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/foodposts/donor/:donorId ───────────────────────────────────────
router.get('/donor/:donorId', protect, async (req, res) => {
  try {
    const posts = await FoodPost.find({ donorId: req.params.donorId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: posts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/foodposts/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Food post not found' });
    return res.json({ success: true, data: post });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/foodposts ──────────────────────────────────────────────────────
router.post('/', protect, restrictTo('restaurant', 'admin'), async (req, res) => {
  try {
    const {
      title, description, foodType, quantity, expiryTime,
      address, latitude, longitude, image,
    } = req.body;

    if (!title || !description || !quantity || !expiryTime || !address) {
      return res.status(400).json({ success: false, error: 'title, description, quantity, expiryTime and address are required' });
    }

    const post = await FoodPost.create({
      title,
      description,
      foodType,
      quantity,
      expiryTime,
      address,
      latitude,
      longitude,
      image,
      donorId: req.user._id,
      donorName: req.user.name,
      donorEmail: req.user.email,
    });

    return res.status(201).json({ success: true, data: post });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/foodposts/:id ───────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Food post not found' });

    // Only the donor or admin can edit
    if (post.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this post' });
    }

    const updated = await FoodPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PATCH /api/foodposts/:id/status ─────────────────────────────────────────
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'claimed', 'completed', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const post = await FoodPost.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, error: 'Food post not found' });
    return res.json({ success: true, data: post });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/foodposts/:postId/claim ───────────────────────────────────────
router.post('/:postId/claim', protect, restrictTo('ngo'), async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, error: 'Food post not found' });
    if (post.status !== 'available') {
      return res.status(400).json({ success: false, error: 'This food post is no longer available' });
    }

    // Check if this user already claimed this post
    const existingClaim = await Claim.findOne({ postId: post._id, userId: req.user._id });
    if (existingClaim) {
      return res.status(409).json({ success: false, error: 'You have already claimed this post' });
    }

    const claim = await Claim.create({
      postId: post._id,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      organizationName: req.user.organizationName || '',
      status: 'pending',
    });

    // Mark post as claimed
    post.status = 'claimed';
    await post.save();

    return res.status(201).json({ success: true, data: claim });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/foodposts/:id ────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Food post not found' });

    if (post.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    return res.json({ success: true, message: 'Food post deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
