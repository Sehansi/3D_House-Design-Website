const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const FurnitureDesign = require('../../models/FurnitureDesign');

// Furniture catalog (Static for now)
const furnitureCatalog = [
  { id: '1', name: 'Premium Sofa', category: 'seating', basePrice: 1200, colors: ['gray', 'beige', 'navy', 'charcoal'], materials: ['fabric', 'leather'], sizes: ['2.2m'], icon: '🛋️' },
  { id: '2', name: 'Oak Table', category: 'tables', basePrice: 800, colors: ['oak', 'walnut'], materials: ['wood'], sizes: ['1.8m'], icon: '🍽️' },
  { id: '3', name: 'King Bed', category: 'beds', basePrice: 1500, colors: ['white', 'gray'], materials: ['wood'], sizes: ['2.0m'], icon: '🛏️' }
];

// @route   GET /api/furniture/catalog
router.get('/catalog', (req, res) => {
  res.json({ success: true, data: furnitureCatalog });
});

// @route   GET /api/furniture/public/recent
// @desc    Retrieve recent public furniture designs
// @access  Public
router.get('/public/recent', async (req, res) => {
  try {
    const designs = await FurnitureDesign.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name');
    
    res.json({
      success: true,
      data: designs,
      total: designs.length
    });
  } catch (error) {
    console.error('Failed to fetch public furniture designs:', error);
    res.status(500).json({ error: 'Failed to fetch recent designs' });
  }
});

// @route   POST /api/furniture/save
// @desc    Save a persistent furniture design to MongoDB
// @access  Private
router.post('/save', auth, async (req, res) => {
  try {
    const { name, room, items } = req.body;
    
    if (!name || !room || !items) {
      return res.status(400).json({ error: 'Missing required design data' });
    }
    
    const newDesign = new FurnitureDesign({
      user: req.userId,
      name,
      room,
      items
    });
    
    await newDesign.save();
    
    res.status(201).json({
      success: true,
      message: 'Design successfully committed to vault',
      data: newDesign
    });
  } catch (error) {
    console.error('Furniture save error:', error);
    res.status(500).json({ error: 'Database synchronization failed' });
  }
});

// @route   GET /api/furniture/my-designs
// @desc    Retrieve all designs for the authenticated user
// @access  Private
router.get('/my-designs', auth, async (req, res) => {
  try {
    const designs = await FurnitureDesign.find({ user: req.userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: designs,
      total: designs.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch designs from vault' });
  }
});

// @route   PUT /api/furniture/update/:id
// @desc    Update an existing design in the database
// @access  Private
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { name, room, items } = req.body;
    
    const design = await FurnitureDesign.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, room, items },
      { new: true }
    );
    
    if (!design) {
      return res.status(404).json({ error: 'Design node not found' });
    }
    
    res.json({
      success: true,
      message: 'Design successfully updated in secure vault',
      data: design
    });
  } catch (error) {
    console.error('Furniture update error:', error);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// @route   DELETE /api/furniture/designs/:id
// @desc    Remove a specific design from the database
// @access  Private
router.delete('/designs/:id', auth, async (req, res) => {
  try {
    const design = await FurnitureDesign.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!design) {
      return res.status(404).json({ error: 'Design node not found' });
    }
    
    res.json({
      success: true,
      message: 'Design deleted from secure vault'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server deletion error' });
  }
});

module.exports = router;
