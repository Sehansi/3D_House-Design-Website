const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');

// Furniture catalog
const furnitureCatalog = [
  {
    id: '1',
    name: 'Modern Sofa',
    category: 'seating',
    basePrice: 1200,
    colors: ['gray', 'beige', 'navy', 'charcoal'],
    materials: ['fabric', 'leather', 'velvet'],
    sizes: ['2-seater', '3-seater', 'L-shape'],
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: '2',
    name: 'Dining Table',
    category: 'tables',
    basePrice: 800,
    colors: ['oak', 'walnut', 'white', 'black'],
    materials: ['wood', 'glass', 'marble'],
    sizes: ['4-seater', '6-seater', '8-seater'],
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: '3',
    name: 'King Bed',
    category: 'beds',
    basePrice: 1500,
    colors: ['white', 'gray', 'brown', 'black'],
    materials: ['wood', 'upholstered', 'metal'],
    sizes: ['queen', 'king', 'california king'],
    image: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: '4',
    name: 'Wardrobe',
    category: 'storage',
    basePrice: 1000,
    colors: ['white', 'oak', 'walnut', 'gray'],
    materials: ['wood', 'laminate', 'glass'],
    sizes: ['2-door', '3-door', '4-door'],
    image: 'https://picsum.photos/400/300?random=4'
  },
  {
    id: '5',
    name: 'Coffee Table',
    category: 'tables',
    basePrice: 400,
    colors: ['oak', 'walnut', 'white', 'black'],
    materials: ['wood', 'glass', 'metal'],
    sizes: ['small', 'medium', 'large'],
    image: 'https://picsum.photos/400/300?random=5'
  }
];

// User customizations storage
const customizations = [];

// @route   GET /api/furniture/catalog
// @desc    Get furniture catalog
// @access  Public
router.get('/catalog', (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    
    let filtered = [...furnitureCatalog];
    
    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }
    
    if (minPrice) {
      filtered = filtered.filter(item => item.basePrice >= parseInt(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(item => item.basePrice <= parseInt(maxPrice));
    }
    
    res.json({
      success: true,
      data: filtered,
      total: filtered.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/furniture/:id
// @desc    Get single furniture item
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const item = furnitureCatalog.find(f => f.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Furniture item not found' });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/furniture/customize
// @desc    Create furniture customization
// @access  Private
router.post('/customize', auth, async (req, res) => {
  try {
    const { furnitureId, name, color, material, size, quantity } = req.body;
    
    if (!furnitureId || !color || !material || !size) {
      return res.status(400).json({ 
        error: 'Please provide all customization options' 
      });
    }
    
    const furniture = furnitureCatalog.find(f => f.id === furnitureId);
    if (!furniture) {
      return res.status(404).json({ error: 'Furniture not found' });
    }
    
    // Calculate price based on customizations
    let totalPrice = furniture.basePrice;
    if (material === 'leather' || material === 'marble') totalPrice *= 1.3;
    if (size === 'large' || size === 'king') totalPrice *= 1.2;
    totalPrice *= (quantity || 1);
    
    const customization = {
      id: Date.now().toString(),
      userId: req.userId,
      furnitureId,
      name: name || furniture.name,
      furniture: furniture.name,
      color,
      material,
      size,
      quantity: quantity || 1,
      totalPrice: Math.round(totalPrice),
      createdAt: new Date()
    };
    
    customizations.push(customization);
    
    res.status(201).json({
      success: true,
      message: 'Customization saved successfully',
      data: customization
    });
  } catch (error) {
    console.error('Customization error:', error);
    res.status(500).json({ error: 'Failed to save customization' });
  }
});

// @route   GET /api/furniture/my-customizations
// @desc    Get user's customizations
// @access  Private
router.get('/my-customizations', auth, async (req, res) => {
  try {
    const userCustomizations = customizations.filter(c => c.userId === req.userId);
    
    res.json({
      success: true,
      data: userCustomizations,
      total: userCustomizations.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/furniture/customizations/:id
// @desc    Delete customization
// @access  Private
router.delete('/customizations/:id', auth, async (req, res) => {
  try {
    const index = customizations.findIndex(
      c => c.id === req.params.id && c.userId === req.userId
    );
    
    if (index === -1) {
      return res.status(404).json({ error: 'Customization not found' });
    }
    
    customizations.splice(index, 1);
    
    res.json({
      success: true,
      message: 'Customization deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/furniture/categories
// @desc    Get furniture categories
// @access  Public
router.get('/categories/list', (req, res) => {
  try {
    const categories = [...new Set(furnitureCatalog.map(f => f.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
