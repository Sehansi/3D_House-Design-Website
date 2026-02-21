const express = require('express');
const router = express.Router();
const Design = require('../models/Design');

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
router.post('/create', async (req, res) => {
  try {
    const { name, parameters, finishes, userId } = req.body;
    
    // Validate parameters
    if (!parameters.bedrooms || !parameters.bathrooms || !parameters.totalArea || !parameters.floors) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Generate 3D model data
    const modelData = generateModelData(parameters, finishes);
    
    // Create design
    const design = new Design({
      user: userId,
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
router.get('/user/:userId', async (req, res) => {
  try {
    const designs = await Design.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .select('-modelData');
    
    res.json({ designs });
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single design
router.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    res.json({ design });
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update design
router.put('/:id', async (req, res) => {
  try {
    const { parameters, finishes } = req.body;
    
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
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
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
router.delete('/:id', async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
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
