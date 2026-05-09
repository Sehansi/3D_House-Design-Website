const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');
const AIDesign = require('../models/AIDesign');

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Color palettes for different styles
const colorPalettes = {
  modern: ['#FFFFFF', '#2C3E50', '#00D9FF', '#95A5A6', '#34495E'],
  traditional: ['#8B4513', '#D2691E', '#F5DEB3', '#CD853F', '#DEB887'],
  minimalist: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E'],
  luxury: ['#FFD700', '#1A1A1A', '#8B0000', '#C0C0C0', '#2F4F4F'],
  industrial: ['#3E3E3E', '#7F7F7F', '#A9A9A9', '#D3D3D3', '#696969'],
  scandinavian: ['#FFFFFF', '#F0F0F0', '#D4A574', '#8B9DC3', '#E8E8E8'],
  bohemian: ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F', '#F4A261']
};

// Materials for different styles
const styleMaterials = {
  modern: ['Glass', 'Steel', 'Concrete', 'Polished Wood', 'Acrylic'],
  traditional: ['Solid Wood', 'Leather', 'Brass', 'Marble', 'Velvet'],
  minimalist: ['White Oak', 'Linen', 'Matte Metal', 'Stone', 'Cotton'],
  luxury: ['Marble', 'Gold Leaf', 'Silk', 'Mahogany', 'Crystal'],
  industrial: ['Raw Steel', 'Exposed Brick', 'Concrete', 'Reclaimed Wood', 'Iron'],
  scandinavian: ['Light Wood', 'Wool', 'Linen', 'Birch', 'Cotton'],
  bohemian: ['Rattan', 'Macrame', 'Colorful Textiles', 'Wicker', 'Natural Fibers']
};

// Furniture suggestions by room type
const roomFurniture = {
  'living room': ['Sofa', 'Coffee Table', 'TV Stand', 'Armchair', 'Bookshelf', 'Floor Lamp'],
  'bedroom': ['Bed', 'Nightstand', 'Wardrobe', 'Dresser', 'Reading Chair', 'Table Lamp'],
  'kitchen': ['Dining Table', 'Chairs', 'Kitchen Island', 'Bar Stools', 'Pendant Lights'],
  'bathroom': ['Vanity', 'Mirror', 'Storage Cabinet', 'Towel Rack', 'Shower Bench'],
  'office': ['Desk', 'Office Chair', 'Bookshelf', 'Filing Cabinet', 'Desk Lamp'],
  'dining room': ['Dining Table', 'Dining Chairs', 'Buffet', 'China Cabinet', 'Chandelier']
};

// AI suggestions generator
const generateSuggestions = (style, roomType, budget) => {
  const suggestions = [];
  
  // Style-based suggestions
  if (style === 'modern') {
    suggestions.push('Use clean lines and minimal ornamentation');
    suggestions.push('Incorporate smart home technology');
  } else if (style === 'traditional') {
    suggestions.push('Add classic architectural details');
    suggestions.push('Use rich, warm color tones');
  } else if (style === 'minimalist') {
    suggestions.push('Keep surfaces clutter-free');
    suggestions.push('Focus on functionality over decoration');
  }
  
  // Room-based suggestions
  if (roomType === 'living room') {
    suggestions.push('Create a focal point with artwork or fireplace');
    suggestions.push('Ensure comfortable seating arrangement');
  } else if (roomType === 'bedroom') {
    suggestions.push('Use blackout curtains for better sleep');
    suggestions.push('Add soft lighting for ambiance');
  }
  
  // Budget-based suggestions
  if (budget === 'low') {
    suggestions.push('Consider DIY projects to save costs');
    suggestions.push('Shop for second-hand quality pieces');
  } else if (budget === 'high') {
    suggestions.push('Invest in statement pieces');
    suggestions.push('Consider custom-built furniture');
  }
  
  // General suggestions
  suggestions.push('Add plants for a fresh, natural feel');
  suggestions.push('Layer lighting with ambient, task, and accent lights');
  suggestions.push('Use mirrors to make the space feel larger');
  
  return suggestions.slice(0, 5);
};

// @route   POST /api/ai-designer/generate
// @desc    Generate AI design from prompt
// @access  Public
router.post('/generate', async (req, res) => {
  try {
    const { prompt, style = 'modern', roomType = 'living room', budget = 'medium' } = req.body;

    if (!prompt || prompt.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a detailed design prompt (at least 10 characters)' });
    }

    console.log('Generating AI design:', { prompt, style, roomType, budget });

    // Generate design parameters
    const colors = colorPalettes[style] || colorPalettes.modern;
    const materials = styleMaterials[style] || styleMaterials.modern;
    const furniture = roomFurniture[roomType] || roomFurniture['living room'];
    const suggestions = generateSuggestions(style, roomType, budget);

    // Simulate AI generation
    const generatedDesign = {
      id: Date.now().toString(),
      prompt,
      style,
      roomType,
      budget,
      imageUrl: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop`,
      parameters: {
        colors: colors.slice(0, 5),
        materials: materials.slice(0, 4),
        furniture: furniture.slice(0, 5),
        lighting: budget === 'high' ? 'Smart LED + Natural' : budget === 'medium' ? 'LED + Natural' : 'Natural + Basic'
      },
      suggestions,
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: 'Design generated successfully',
      data: generatedDesign
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate design' });
  }
});

// @route   POST /api/ai-designer/save
// @desc    Save AI generated design
// @access  Private
router.post('/save', auth, async (req, res) => {
  try {
    const { name, design } = req.body;

    if (!name || !design) {
      return res.status(400).json({ error: 'Please provide design name and data' });
    }

    console.log('Saving AI design for user:', req.userId);

    const aiDesign = new AIDesign({
      user: req.userId,
      name,
      prompt: design.prompt,
      style: design.style,
      roomType: design.roomType,
      budget: design.budget,
      imageUrl: design.imageUrl,
      parameters: design.parameters,
      suggestions: design.suggestions
    });

    await aiDesign.save();

    res.status(201).json({
      success: true,
      message: 'Design saved successfully',
      data: aiDesign
    });
  } catch (error) {
    console.error('Save design error:', error);
    res.status(500).json({ error: 'Failed to save design' });
  }
});

// @route   GET /api/ai-designer/my-designs
// @desc    Get user's AI designs
// @access  Private
router.get('/my-designs', auth, async (req, res) => {
  try {
    const designs = await AIDesign.find({ user: req.userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: designs,
      total: designs.length
    });
  } catch (error) {
    console.error('Fetch designs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ai-designer/refine
// @desc    Refine existing design
// @access  Public
router.post('/refine', async (req, res) => {
  try {
    const { designId, refinementPrompt, originalDesign } = req.body;

    if (!refinementPrompt) {
      return res.status(400).json({ error: 'Please provide refinement instructions' });
    }

    console.log('Refining design:', designId, refinementPrompt);

    // Use original design data if provided
    const style = originalDesign?.style || 'modern';
    const roomType = originalDesign?.roomType || 'living room';
    const budget = originalDesign?.budget || 'medium';

    // Generate refined design with slight variations
    const colors = colorPalettes[style] || colorPalettes.modern;
    const materials = styleMaterials[style] || styleMaterials.modern;
    const furniture = roomFurniture[roomType] || roomFurniture['living room'];

    const refinedDesign = {
      id: Date.now().toString(),
      originalId: designId,
      prompt: originalDesign?.prompt + ' (Refined: ' + refinementPrompt + ')',
      style,
      roomType,
      budget,
      refinementPrompt,
      imageUrl: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop`,
      parameters: {
        colors: colors.slice(1, 6), // Slightly different colors
        materials: materials.slice(1, 5),
        furniture: furniture.slice(0, 5),
        lighting: originalDesign?.parameters?.lighting || 'LED + Natural'
      },
      suggestions: [
        `Applied refinement: ${refinementPrompt}`,
        ...generateSuggestions(style, roomType, budget).slice(0, 4)
      ],
      changes: [
        'Adjusted color palette based on feedback',
        'Modified furniture placement',
        'Enhanced lighting scheme',
        'Updated material selection'
      ],
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: 'Design refined successfully',
      data: refinedDesign
    });
  } catch (error) {
    console.error('Refine error:', error);
    res.status(500).json({ error: 'Failed to refine design' });
  }
});

// @route   POST /api/ai-designer/upload-plan
// @desc    Upload floor plan PDF and generate 3D design
// @access  Public
router.post('/upload-plan', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { style = 'modern', budget = 'medium' } = req.body;

    console.log('Processing floor plan PDF:', req.file.originalname);

    // Simulate PDF processing and room detection
    // In production, this would use PDF parsing libraries and AI/ML models
    const detectedRooms = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom'];
    const estimatedArea = Math.floor(Math.random() * 2000) + 1000; // 1000-3000 sq ft

    // Generate design based on detected floor plan
    const colors = colorPalettes[style] || colorPalettes.modern;
    const materials = styleMaterials[style] || styleMaterials.modern;

    const generatedDesign = {
      id: Date.now().toString(),
      prompt: `Floor plan with ${detectedRooms.length} rooms (${detectedRooms.join(', ')})`,
      style,
      roomType: 'full house',
      budget,
      imageUrl: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop`,
      parameters: {
        colors: colors.slice(0, 5),
        materials: materials.slice(0, 4),
        furniture: ['Complete Furniture Set', 'Custom Built-ins', 'Designer Lighting'],
        lighting: 'Smart LED System + Natural Light',
        rooms: detectedRooms,
        totalArea: `${estimatedArea} sq ft`
      },
      suggestions: [
        'Floor plan successfully analyzed',
        `Detected ${detectedRooms.length} rooms with optimal layout`,
        'Consider adding skylights for natural lighting',
        'Open floor plan concept recommended',
        'Smart home integration suggested'
      ],
      floorPlanData: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        detectedRooms: detectedRooms.length,
        estimatedArea
      },
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: '3D design generated from floor plan',
      data: generatedDesign
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ error: 'Failed to process floor plan' });
  }
});

// @route   DELETE /api/ai-designer/:id
// @desc    Delete AI design
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await AIDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    if (design.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await design.deleteOne();

    res.json({
      success: true,
      message: 'Design deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
