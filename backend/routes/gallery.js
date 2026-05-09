const express = require('express');
const router = express.Router();

// Gallery data with high-quality design images
const galleryData = [
  { 
    id: 1, 
    title: 'Modern Kitchen Design', 
    category: 'Interior', 
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Contemporary kitchen with dark cabinets and marble island',
    tags: ['modern', 'kitchen', 'marble', 'contemporary']
  },
  { 
    id: 2, 
    title: 'Tropical Garden Villa', 
    category: 'Landscape', 
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
    description: 'Luxurious tropical villa with lush landscaping',
    tags: ['tropical', 'garden', 'villa', 'landscape']
  },
  { 
    id: 3, 
    title: 'Contemporary Villa', 
    category: 'Exterior', 
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80',
    description: 'Modern two-story villa with pool and palm trees',
    tags: ['contemporary', 'villa', 'pool', 'modern']
  },
  { 
    id: 4, 
    title: 'Sustainable Modern Home', 
    category: 'Exterior', 
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Eco-friendly home with solar panels and infinity pool',
    tags: ['sustainable', 'modern', 'solar', 'eco-friendly']
  },
  { 
    id: 5, 
    title: 'Luxury Living Space', 
    category: 'Interior', 
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
    description: 'Open-plan living with copper pendant lights and modern finishes',
    tags: ['luxury', 'living', 'open-plan', 'modern']
  },
  { 
    id: 6, 
    title: 'Minimalist Bedroom', 
    category: 'Interior', 
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
    description: 'Clean, minimalist bedroom with natural lighting',
    tags: ['minimalist', 'bedroom', 'natural', 'clean']
  },
  { 
    id: 7, 
    title: 'Modern Bathroom', 
    category: 'Interior', 
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    description: 'Spa-like bathroom with marble finishes',
    tags: ['modern', 'bathroom', 'spa', 'marble']
  },
  { 
    id: 8, 
    title: 'Glass House Design', 
    category: 'Exterior', 
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Ultra-modern glass house with seamless indoor-outdoor living',
    tags: ['glass', 'modern', 'indoor-outdoor', 'contemporary']
  }
];

// Get all gallery items
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    
    let filteredGallery = galleryData;
    
    if (category && category !== 'All') {
      filteredGallery = galleryData.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    res.json({
      success: true,
      data: filteredGallery,
      total: filteredGallery.length
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single gallery item
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const item = galleryData.find(item => item.id === parseInt(id));
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = [...new Set(galleryData.map(item => item.category))];
    
    res.json({
      success: true,
      data: ['All', ...categories]
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;