const express = require('express');
const router = express.Router();

// In-memory storage for favorites when MongoDB is not available
const userFavorites = new Map();

// Simple auth middleware for fallback
const authFallback = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  // For fallback, just use token as userId
  req.user = { userId: token };
  next();
};

// Get user's favorites
router.get('/', authFallback, (req, res) => {
  try {
    const favorites = userFavorites.get(req.user.userId) || [];
    res.json({
      success: true,
      favorites: favorites
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Toggle favorite
router.post('/toggle/:designId', authFallback, (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.userId;
    
    let favorites = userFavorites.get(userId) || [];
    const isFavorite = favorites.includes(parseInt(designId));
    
    if (isFavorite) {
      favorites = favorites.filter(id => id !== parseInt(designId));
    } else {
      favorites.push(parseInt(designId));
    }
    
    userFavorites.set(userId, favorites);
    
    res.json({
      success: true,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: !isFavorite,
      favorites: favorites
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add to favorites
router.post('/:designId', authFallback, (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.userId;
    
    let favorites = userFavorites.get(userId) || [];
    
    if (favorites.includes(parseInt(designId))) {
      return res.status(400).json({
        success: false,
        message: 'Design already in favorites'
      });
    }
    
    favorites.push(parseInt(designId));
    userFavorites.set(userId, favorites);
    
    res.json({
      success: true,
      message: 'Added to favorites',
      favorites: favorites
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
router.delete('/:designId', authFallback, (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.userId;
    
    let favorites = userFavorites.get(userId) || [];
    favorites = favorites.filter(id => id !== parseInt(designId));
    userFavorites.set(userId, favorites);
    
    res.json({
      success: true,
      message: 'Removed from favorites',
      favorites: favorites
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
