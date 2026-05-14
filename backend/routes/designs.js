const express = require('express');
const router = express.Router();
const Design = require('../models/Design');
const { auth } = require('../middleware/auth');

// Generate 3D model data from parameters
function generateModelData(parameters, finishes) {
  const { bedrooms, bathrooms, kitchen, livingRoom, totalArea, floors, style } = parameters;
  
  // Calculate room dimensions based on total area
  const areaPerFloor = totalArea / floors;
  const roomCount = bedrooms + bathrooms + (kitchen ? 1 : 0) + (livingRoom ? 1 : 0);
  const avgRoomArea = areaPerFloor / roomCount;
  
  // Generate rooms layout
  const rooms = [];
  let currentX = 0;
  let currentZ = 0;
  const roomWidth = Math.sqrt(avgRoomArea);
  const roomDepth = Math.sqrt(avgRoomArea);
  
  // Add living room
  if (livingRoom) {
    rooms.push({
      type: 'living',
      position: { x: currentX, y: 0, z: currentZ },
      dimensions: { width: roomWidth * 1.5, height: 3, depth: roomDepth * 1.5 }
    });
    currentX += roomWidth * 1.5 + 0.3;
  }
  
  // Add kitchen
  if (kitchen) {
    rooms.push({
      type: 'kitchen',
      position: { x: currentX, y: 0, z: currentZ },
      dimensions: { width: roomWidth, height: 3, depth: roomDepth }
    });
    currentX += roomWidth + 0.3;
  }
  
  // Add bedrooms
  for (let i = 0; i < bedrooms; i++) {
    if (i % 2 === 0 && i > 0) {
      currentX = 0;
      currentZ += roomDepth + 0.3;
    }
    rooms.push({
      type: 'bedroom',
      position: { x: currentX, y: 0, z: currentZ },
      dimensions: { width: roomWidth, height: 3, depth: roomDepth }
    });
    currentX += roomWidth + 0.3;
  }
  
  // Add bathrooms
  for (let i = 0; i < bathrooms; i++) {
    if (i % 2 === 0 && (bedrooms + i) % 2 === 0) {
      currentX = 0;
      currentZ += roomDepth + 0.3;
    }
    rooms.push({
      type: 'bathroom',
      position: { x: currentX, y: 0, z: currentZ },
      dimensions: { width: roomWidth * 0.7, height: 3, depth: roomDepth * 0.7 }
    });
    currentX += roomWidth * 0.7 + 0.3;
  }
  
  return {
    rooms,
    style,
    finishes,
    metadata: {
      totalRooms: rooms.length,
      totalArea,
      floors,
      generatedAt: new Date().toISOString()
    }
  };
}

// Create new design
router.post('/create', auth, async (req, res) => {
  try {
    const { name, parameters, finishes } = req.body;
    
    // Validate parameters
    if (!parameters.bedrooms || !parameters.bathrooms || !parameters.totalArea || !parameters.floors) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Generate 3D model data
    const modelData = generateModelData(parameters, finishes);
    
    // Create design with authenticated user
    const design = new Design({
      user: req.userId,
      name,
      parameters,
      finishes,
      modelData
    });
    
    await design.save();
    
    res.status(201).json({
      message: 'Design created successfully',
      design: {
        id: design._id,
        name: design.name,
        modelData: design.modelData,
        createdAt: design.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating design:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all designs for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Ensure user can only access their own designs
    if (req.params.userId !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const designs = await Design.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .select('-modelData');
    
    res.json({ designs });
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's designs
router.get('/my-designs', auth, async (req, res) => {
  try {
    const designs = await Design.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .select('-modelData');
    
    res.json({ designs });
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single design
router.get('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns this design
    if (design.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ design });
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update design
router.put('/:id', auth, async (req, res) => {
  try {
    const { parameters, finishes } = req.body;
    
    // Check if design exists and user owns it
    const existingDesign = await Design.findById(req.params.id);
    if (!existingDesign) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    if (existingDesign.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Regenerate model data
    const modelData = generateModelData(parameters, finishes);
    
    const design = await Design.findByIdAndUpdate(
      req.params.id,
      {
        parameters,
        finishes,
        modelData,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json({
      message: 'Design updated successfully',
      design
    });
  } catch (error) {
    console.error('Error updating design:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete design
router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns this design
    if (design.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Design.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate model preview (without saving)
router.post('/preview', async (req, res) => {
  try {
    const { parameters, finishes } = req.body;
    
    // Validate parameters
    if (!parameters.bedrooms || !parameters.bathrooms || !parameters.totalArea || !parameters.floors) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Generate 3D model data
    const modelData = generateModelData(parameters, finishes);
    
    res.json({
      message: 'Model generated successfully',
      modelData
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
