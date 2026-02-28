const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('favorites');
    res.json({
      success: true,
      favorites: user.favorites || []
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add to favorites
router.post('/:designId', auth, async (req, res) => {
  try {
    const { designId } = req.params;
    const user = await User.findById(req.user.userId);
    
    if (!user.favorites) {
      user.favorites = [];
    }
    
    if (user.favorites.includes(parseInt(designId))) {
      return res.status(400).json({
        success: false,
        message: 'Design already in favorites'
      });
    }
    
    user.favorites.push(parseInt(designId));
    await user.save();
    
    res.json({
      success: true,
      message: 'Added to favorites',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Remove from favorites
router.delete('/:designId', auth, async (req, res) => {
  try {
    const { designId } = req.params;
    const user = await User.findById(req.user.userId);
    
    if (!user.favorites) {
      user.favorites = [];
    }
    
    user.favorites = user.favorites.filter(id => id !== parseInt(designId));
    await user.save();
    
    res.json({
      success: true,
      message: 'Removed from favorites',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Toggle favorite
router.post('/toggle/:designId', auth, async (req, res) => {
  try {
    const { designId } = req.params;
    const user = await User.findById(req.user.userId);
    
    if (!user.favorites) {
      user.favorites = [];
    }
    
    const isFavorite = user.favorites.includes(parseInt(designId));
    
    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id !== parseInt(designId));
    } else {
      user.favorites.push(parseInt(designId));
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: !isFavorite,
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
