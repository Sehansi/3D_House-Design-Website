const express = require('express');
const router = express.Router();

// In-memory storage for contact messages (for development)
const contactMessages = [];

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, subject } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Please provide name, email, and message' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Create contact message
    const contactMessage = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      createdAt: new Date(),
      status: 'new'
    };

    // Store message
    contactMessages.push(contactMessage);

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contactMessage.id,
        createdAt: contactMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      error: 'Failed to submit contact form. Please try again.' 
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin only)
// @access  Private (would need admin middleware)
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: contactMessages,
      total: contactMessages.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const message = contactMessages.find(m => m.id === req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
