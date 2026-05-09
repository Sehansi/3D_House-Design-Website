const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// In-memory user storage for development (when MongoDB is not available)
const users = new Map();

// Helper to hash password (simple for development)
const hashPassword = (password) => {
  return Buffer.from(password).toString('base64');
};

const comparePassword = (password, hash) => {
  return hashPassword(password) === hash;
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = {
      id: Date.now().toString(),
      fullName,
      email,
      password: hashPassword(password),
      createdAt: new Date()
    };

    users.set(email, user);

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
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

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    let user = null;
    for (const [email, userData] of users.entries()) {
      if (userData.id === decoded.userId) {
        user = userData;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    let user = null;
    for (const [email, userData] of users.entries()) {
      if (userData.id === decoded.userId) {
        user = userData;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logout successful' });
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  res.json({ message: 'Password reset link sent to your email' });
});

module.exports = router;
