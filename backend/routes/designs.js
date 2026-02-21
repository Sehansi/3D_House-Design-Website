const express = require('express');
const router = express.Router();

// @route   GET /api/designs
router.get('/', async (req, res) => {
  try {
    // TODO: Fetch all designs
    res.json({ message: 'Get all designs' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/designs
router.post('/', async (req, res) => {
  try {
    // TODO: Create new design
    res.json({ message: 'Create design' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
