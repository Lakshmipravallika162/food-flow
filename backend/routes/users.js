const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, restrictTo, generateToken } = require('../middleware/auth');

// ─── POST /api/users/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, organizationName, address, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and role are required' });
    }

    const validRoles = ['admin', 'restaurant', 'ngo'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: `Role must be one of: ${validRoles.join(', ')}` });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'A user with this email already exists' });
    }

    const user = await User.create({ name, email, phone, organizationName, address, password, role });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      data: user.toPublicJSON(),
      token,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// ─── POST /api/users/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Fetch user with password field (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Account is deactivated' });
    }

    // Optional: validate role matches
    if (role && user.role !== role) {
      return res.status(401).json({ success: false, error: 'Invalid credentials for this role' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      data: user.toPublicJSON(),
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// ─── GET /api/users/email/:email ──────────────────────────────────────────────
router.get('/email/:email', protect, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/users ────────────────────────────────────────────────── admin ──
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find({});
    return res.json({ success: true, data: users.map((u) => u.toPublicJSON()) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/users/:id ───────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    // Only admin or the user themselves can update
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this user' });
    }

    // Don't allow role changes via this endpoint (admin-only operation)
    const { password, role, ...safeFields } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...safeFields, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/users/:id ─────────────────────────────────────────── admin ──
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
