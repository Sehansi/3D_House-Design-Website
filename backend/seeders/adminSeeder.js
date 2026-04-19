const User = require('../models/User');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

const seedAdminUser = async () => {
  try {
    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (!existing) {
      // Create fresh admin
      const admin = new User({
        fullName: 'System Administrator',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,  // hashed by pre-save hook
        role: 'Admin'
      });
      await admin.save();
      console.log('✅ Admin account created → admin@gmail.com / 123456');
    } else {
      // Always sync role + reset password on startup
      existing.role = 'Admin';
      existing.password = ADMIN_PASSWORD;  // will be re-hashed by pre-save hook
      await existing.save();
      console.log('✅ Admin account verified → admin@gmail.com / 123456');
    }
  } catch (err) {
    console.error('Seeder error:', err.message);
  }
};

module.exports = seedAdminUser;
