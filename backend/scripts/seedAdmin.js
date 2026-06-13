/**
 * scripts/seedAdmin.js
 * Run once: node scripts/seedAdmin.js
 * Creates the default admin account used by the app.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_DB);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@foodflow.com' });
    if (existing) {
      console.log('Admin user already exists – nothing to do.');
      process.exit(0);
    }

    await User.create({
      name: 'System Administrator',
      email: 'admin@foodflow.com',
      password: 'Admin@1234',  // change after first login
      role: 'admin',
      phone: '',
      address: '',
      isActive: true,
    });

    console.log('✅  Default admin created:');
    console.log('    Email   : admin@foodflow.com');
    console.log('    Password: Admin@1234');
    console.log('    ⚠️  Change the password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
})();
