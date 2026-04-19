const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { auth } = require('../../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user — Admin role is blocked from self-registration
    const userRole = req.body.role || 'Customer';
    if (userRole === 'Admin') {
      return res.status(403).json({ error: 'Administrator accounts cannot be created via registration.' });
    }
    const user = new User({ fullName, email, password, role: userRole });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bio: user.bio || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'Suspended') {
      console.log('Suspended user login attempt:', email);
      return res.status(403).json({ error: 'Your account has been suspended by the administrator.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Login successful for user:', email);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bio: user.bio || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate via Google OAuth
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { email, name, picture, sub, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email from Google OAuth' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exist
      const userRole = role || 'Customer';
      if (userRole === 'Admin') {
        return res.status(403).json({ error: 'Administrator accounts cannot be created via auth.' });
      }
      
      // Use sub (Google unique ID) as a secure base password (plus hash later via hook)
      const securePassword = `GoogleAuth#${sub}#Secret!`; 
      user = new User({ 
        fullName: name, 
        email, 
        password: securePassword, 
        role: userRole,
        // we can store picture if User model had it
      });
      await user.save();
      console.log('Created new user via Google:', email);
    } else {
      if (user.status === 'Suspended') {
        return res.status(403).json({ error: 'Your account has been suspended.' });
      }
      console.log('Logged in existing user via Google:', email);
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bio: user.bio || ''
      }
    });

  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        phoneNumber: req.user.phoneNumber || '',
        address: req.user.address || '',
        bio: req.user.bio || '',
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/verify
// @desc    Verify token
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bio: user.bio || ''
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update generic user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, phoneNumber, address, bio } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bio: user.bio || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Send email with reset link
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a JWT system, logout is handled client-side by removing the token
    // But we can log it or do additional cleanup here
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
