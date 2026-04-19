const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../../middleware/auth');
const AIDesign = require('../../models/AIDesign');
const { generate3DLayout, generate3DLayoutWithFallback, extractFloorPlanFromImage } = require('../../utils/geminiService');

// Configure multer for PDF and Image uploads
const storage = multer.memoryStorage();
const ALLOWED_MIMETYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or Image files (PNG, JPG, WEBP) are allowed'));
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
      console.log('Invalid prompt received:', prompt ? `${prompt.length} chars` : 'empty');
      return res.status(400).json({ error: 'Please provide a detailed design prompt (at least 10 characters)' });
    }

    console.log('🎨 Generating AI design with params:', { prompt, style, roomType, budget });

    // Validate style, roomType, and budget
    if (!colorPalettes[style]) {
      console.warn('Unknown style:', style);
      style = 'modern';
    }
    if (!styleMaterials[style]) {
      console.warn('Unknown style for materials:', style);
    }
    if (!roomFurniture[roomType]) {
      console.warn('Unknown room type:', roomType);
      roomType = 'living room';
    }

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
        lighting: budget === 'high' ? 'Smart LED + Natural' : budget === 'medium' ? 'LED + Natural' : 'Natural + Basic',
        doors: [],
        windows: []
      },
      suggestions,
      createdAt: new Date()
    };

    console.log('✅ Design generated successfully:', generatedDesign.id);

    res.json({
      success: true,
      message: 'Design generated successfully',
      data: generatedDesign
    });
  } catch (error) {
    console.error('❌ AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate design: ' + error.message });
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

    console.log('💾 Saving AI design for user:', req.userId, 'Name:', name);

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
    console.log('✅ Design saved successfully:', aiDesign._id);

    res.status(201).json({
      success: true,
      message: 'Design saved successfully',
      data: aiDesign
    });
  } catch (error) {
    console.error('❌ Save design error:', error);
    res.status(500).json({ error: 'Failed to save design: ' + error.message });
  }
});

// @route   POST /api/ai-designer/text-to-3d
// @desc    Generate a 3D layout from text prompt using Gemini
// @access  Public
router.post('/text-to-3d', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a valid prompt.' });
  }

  // Fallback Template Design
  const fallbackTemplate = {
    style: 'modern',
    rooms: [
      { type: 'living room', size: [6, 3, 5], position: [0, 1.5, 0] },
      { type: 'bedroom', size: [4, 3, 4], position: [5, 1.5, 0] },
      { type: 'kitchen', size: [4, 3, 3], position: [0, 1.5, 4] },
      { type: 'bathroom', size: [2, 3, 2], position: [3, 1.5, 3] }
    ],
    isFallback: true
  };

  try {
    console.log('🤖 AI Generating 3D Layout for:', prompt);
    const layout = await generate3DLayoutWithFallback(prompt);
    
    // Basic validation of the returned layout
    if (!layout.rooms || !Array.isArray(layout.rooms) || layout.rooms.length === 0) {
      throw new Error('AI returned empty or invalid room list');
    }

    res.json({
      success: true,
      message: '3D layout generated successfully',
      data: layout
    });
  } catch (error) {
    console.error('❌ Gemini Text-to-3D Error:', error.message);
    
    // Provide fallback logic
    res.json({
      success: true,
      message: 'AI generation failed, returning fallback template.',
      data: fallbackTemplate,
      error: error.message
    });
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

    console.log('🔧 Refining design:', designId, 'with prompt:', refinementPrompt);

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
        lighting: originalDesign?.parameters?.lighting || 'LED + Natural',
        doors: originalDesign?.parameters?.doors || [],
        windows: originalDesign?.parameters?.windows || []
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

    console.log('✅ Design refined successfully:', refinedDesign.id);

    res.json({
      success: true,
      message: 'Design refined successfully',
      data: refinedDesign
    });
  } catch (error) {
    console.error('❌ Refine error:', error);
    res.status(500).json({ error: 'Failed to refine design: ' + error.message });
  }
});

// @route   POST /api/ai-designer/upload-plan
// @desc    Upload floor plan PDF/Image → Gemini Vision reads it → returns full
//          furnished 3D layout (same rooms[] format as text-to-3D).
// @access  Public
router.post('/upload-plan', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a floor plan (PDF or Image)' });
    }

    const { style = 'modern' } = req.body;
    const base64Image = req.file.buffer.toString('base64');

    console.log('📄 Processing floor plan with 👁️ Gemini Vision:', req.file.originalname);

    // Call Gemini Vision — now returns { style, rooms[] } layout
    const aiResult = await extractFloorPlanFromImage(base64Image);

    console.log('👁️ Vision result keys:', Object.keys(aiResult));

    // Validate — Gemini must return rooms array
    let rooms = aiResult.rooms || [];

    // If vision returned old-style walls instead of rooms, convert to rooms
    if (rooms.length === 0 && (aiResult.walls || []).length > 0) {
      console.warn('⚠️ Vision returned walls format — converting to rooms layout');
      rooms = convertWallsToRooms(aiResult.walls || [], aiResult.rooms || []);
    }

    // Final fallback — generate generic rooms if still empty
    if (rooms.length === 0) {
      console.warn('⚠️ Vision returned no rooms — using fallback layout');
      rooms = [
        { type: 'living room', size: [5, 3, 5], position: [0, 0, 0] },
        { type: 'kitchen',     size: [4, 3, 4], position: [5, 0, 0] },
        { type: 'bedroom',     size: [4, 3, 4], position: [0, 0, -5] },
        { type: 'bathroom',    size: [2.5, 3, 3], position: [4, 0, -5] },
      ];
    }

    const finalStyle = aiResult.style || style || 'modern';

    // Build a layout exactly matching text-to-3D format
    const layout = {
      style: finalStyle,
      rooms,
      source: 'gemini-vision-image',
    };

    console.log(`✅ Vision layout ready: ${rooms.length} rooms, style=${finalStyle}`);
    res.json({
      success: true,
      message: '3D layout extracted from floor plan image',
      data: layout,       // <── matches text-to-3D format exactly
    });

  } catch (error) {
    console.error('❌ Vision Upload error:', error);
    res.status(500).json({ error: 'Failed to process floor plan: ' + error.message });
  }
});

// Helper — convert old-style walls+rooms (named centers) into a rooms[] layout
function convertWallsToRooms(walls, roomLabels) {
  // Build bounding box from all walls to estimate house size
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  walls.forEach(w => {
    const x1 = (w.start?.x || 0) * 50 - 25;
    const z1 = (w.start?.y || 0) * 50 - 25;
    const x2 = (w.end?.x   || 0) * 50 - 25;
    const z2 = (w.end?.y   || 0) * 50 - 25;
    minX = Math.min(minX, x1, x2); maxX = Math.max(maxX, x1, x2);
    minZ = Math.min(minZ, z1, z2); maxZ = Math.max(maxZ, z1, z2);
  });
  const totalW = maxX - minX || 10;
  const totalD = maxZ - minZ || 10;

  // Use room labels from old format if present
  if (roomLabels.length > 0) {
    const perRoom = { w: totalW / roomLabels.length, d: totalD };
    return roomLabels.map((r, i) => ({
      type: (r.name || r.type || 'room').toLowerCase(),
      size: [Math.round(perRoom.w), 3, Math.round(perRoom.d)],
      position: [minX + perRoom.w * i + perRoom.w / 2, 0, (minZ + maxZ) / 2],
    }));
  }

  // No room labels — make a reasonable generic layout
  return [
    { type: 'living room', size: [Math.round(totalW * 0.45), 3, Math.round(totalD * 0.5)], position: [0, 0, 0] },
    { type: 'kitchen',     size: [Math.round(totalW * 0.35), 3, Math.round(totalD * 0.4)], position: [Math.round(totalW * 0.45), 0, 0] },
    { type: 'bedroom',     size: [Math.round(totalW * 0.4),  3, Math.round(totalD * 0.45)], position: [0, 0, -Math.round(totalD * 0.5)] },
    { type: 'bathroom',    size: [2.5, 3, 3], position: [Math.round(totalW * 0.4), 0, -Math.round(totalD * 0.5)] },
  ];
}


// ─────────────────────────────────────────────────────────────────────────────
// HELPER — compute correction analysis between original AI walls and user walls
// ─────────────────────────────────────────────────────────────────────────────
function computeCorrectionAnalysis(originalWalls = [], correctedWalls = []) {
  const origLen = originalWalls.length;
  const corrLen = correctedWalls.length;
  const pairCount = Math.min(origLen, corrLen);

  const deltas = [];
  let totalDist = 0, maxDist = 0, totalRot = 0, totalLen = 0;
  let wallsMoved = 0;

  for (let i = 0; i < pairCount; i++) {
    const o = originalWalls[i];
    const c = correctedWalls[i];
    const dx    = c.centerX  - o.centerX;
    const dz    = c.centerZ  - o.centerZ;
    const dist  = Math.sqrt(dx * dx + dz * dz);
    const dRot  = c.rotation  - o.rotation;
    const dLen  = c.length    - o.length;
    const dThick= c.thickness - o.thickness;
    const dH    = c.height    - o.height;

    totalDist += dist;
    totalRot  += Math.abs(dRot);
    totalLen  += Math.abs(dLen);
    if (dist > maxDist) maxDist = dist;
    if (dist > 0.5 || Math.abs(dRot) > 0.1) wallsMoved++;

    deltas.push({
      wallIndex: i, deltaX: +dx.toFixed(3), deltaZ: +dz.toFixed(3),
      deltaLength: +dLen.toFixed(3), deltaRotation: +dRot.toFixed(4),
      deltaThickness: +dThick.toFixed(3), deltaHeight: +dH.toFixed(3),
      distanceMoved: +dist.toFixed(3),
    });
  }

  return {
    originalWallCount:  origLen,
    correctedWallCount: corrLen,
    wallsAdded:         Math.max(0, corrLen - origLen),
    wallsRemoved:       Math.max(0, origLen - corrLen),
    wallsMoved,
    avgDistanceMoved:   pairCount > 0 ? +(totalDist / pairCount).toFixed(3) : 0,
    maxDistanceMoved:   +maxDist.toFixed(3),
    avgRotationDelta:   pairCount > 0 ? +(totalRot / pairCount).toFixed(4) : 0,
    avgLengthDelta:     pairCount > 0 ? +(totalLen / pairCount).toFixed(3) : 0,
    deltas,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/ai-designer/save-layout
// @desc    Save corrected walls, compute correction analysis, update learned offsets
// @body    { designId?, name, walls, originalWalls?, polygons, style, budget }
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.post('/save-layout', auth, async (req, res) => {
  try {
    const { designId, name, walls, originalWalls, polygons,
            doors, windows, door_polygons, window_polygons,
            style, budget, floorPlanData } = req.body;

    if (!walls || !Array.isArray(walls)) {
      return res.status(400).json({ error: 'walls array is required' });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Design name is required' });
    }

    const validWall = w => (
      typeof w.centerX === 'number' && typeof w.centerZ === 'number' &&
      typeof w.length  === 'number' && typeof w.rotation === 'number'
    );
    if (!walls.every(validWall)) {
      return res.status(400).json({ error: 'Invalid wall data.' });
    }

    // ── Compute correction analysis ───────────────────────────────────────
    const analysis = computeCorrectionAnalysis(originalWalls || [], walls);
    const correctionEntry = { ...analysis, timestamp: new Date() };

    // ── Build updated parameters ──────────────────────────────────────────
    const updatedParams = {
      walls,
      originalWalls:   originalWalls || [],
      polygons:        polygons        || [],
      doors:           doors           || [],
      windows:         windows         || [],
      door_polygons:   door_polygons   || [],
      window_polygons: window_polygons || [],
      rooms:           floorPlanData?.rooms || [],
      source:          'roboflow-corrected',
    };

    let savedDesign;

    const mongoose = require('mongoose');

    if (designId && mongoose.Types.ObjectId.isValid(designId)) {
      // ── Update existing design ──────────────────────────────────────────
      const existing = await AIDesign.findOne({ _id: designId, user: req.userId });
      if (!existing) return res.status(404).json({ error: 'Design not found.' });

      existing.name       = name.trim();
      existing.parameters = { ...(existing.parameters && typeof existing.parameters.toObject === 'function' ? existing.parameters.toObject() : existing.parameters || {}), ...updatedParams };
      existing.style      = style  || existing.style;
      existing.budget     = budget || existing.budget;
      existing.isCorrected = true;
      existing.correctionHistory.push(correctionEntry);

      // ── Compute aggregated learned offsets across all corrections ────────
      const allDeltas = existing.correctionHistory.flatMap(h => h.deltas || []);
      if (allDeltas.length > 0) {
        const sum = allDeltas.reduce((acc, d) => ({
          x: acc.x + d.deltaX, z: acc.z + d.deltaZ,
          len: acc.len + d.deltaLength, rot: acc.rot + d.deltaRotation,
        }), { x: 0, z: 0, len: 0, rot: 0 });
        existing.learnedOffsets = {
          avgDeltaX:        +(sum.x   / allDeltas.length).toFixed(3),
          avgDeltaZ:        +(sum.z   / allDeltas.length).toFixed(3),
          avgDeltaLength:   +(sum.len / allDeltas.length).toFixed(3),
          avgDeltaRotation: +(sum.rot / allDeltas.length).toFixed(4),
          sampleCount:      allDeltas.length,
          lastUpdated:      new Date(),
        };
      }

      await existing.save();
      savedDesign = existing;
      console.log(`✅ Layout updated [${designId}] — ${walls.length} walls, ${analysis.wallsMoved} corrected`);

    } else {
      // ── Create new design ─────────────────────────────────────────────────
      savedDesign = await AIDesign.create({
        user:              req.userId,
        name:              name.trim(),
        prompt:            `AI-extracted + corrected — ${walls.length} walls`,
        style:             style  || 'modern',
        roomType:          'full house',
        budget:            budget || 'medium',
        parameters:        updatedParams,
        suggestions:       [`✅ ${walls.length} walls saved`, `📐 ${analysis.wallsMoved} walls corrected from AI`],
        correctionHistory: [correctionEntry],
        isCorrected:       (originalWalls?.length || 0) > 0,
        learnedOffsets: {
          avgDeltaX:        analysis.avgDistanceMoved > 0 ? +(analysis.deltas.reduce((s,d)=>s+d.deltaX,0)/(analysis.deltas.length||1)).toFixed(3) : 0,
          avgDeltaZ:        analysis.avgDistanceMoved > 0 ? +(analysis.deltas.reduce((s,d)=>s+d.deltaZ,0)/(analysis.deltas.length||1)).toFixed(3) : 0,
          avgDeltaLength:   +(analysis.avgLengthDelta),
          avgDeltaRotation: +(analysis.avgRotationDelta),
          sampleCount:      analysis.deltas.length,
          lastUpdated:      new Date(),
        },
      });
      console.log(`✅ New corrected layout [${savedDesign._id}] — ${walls.length} walls`);
    }

    res.status(201).json({
      success:          true,
      message:          `Layout saved — ${walls.length} walls.`,
      designId:         savedDesign._id,
      data:             savedDesign,
      correctionAnalysis: correctionEntry,  // send analysis back to frontend
    });

  } catch (error) {
    console.error('❌ save-layout error:', error);
    res.status(500).json({ error: 'Failed to save layout: ' + error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/ai-designer/my-designs
// @desc    List all saved AI designs for the logged-in user
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-designs', auth, async (req, res) => {
  try {
    const designs = await AIDesign.find({ user: req.userId })
      .sort({ updatedAt: -1 })
      .select('name style budget isCorrected parameters.walls parameters.source learnedOffsets correctionHistory createdAt updatedAt')
      .lean();

    res.json({
      success: true,
      count:   designs.length,
      designs: designs.map(d => ({
        _id:           d._id,
        name:          d.name,
        style:         d.style,
        budget:        d.budget,
        isCorrected:   d.isCorrected || false,
        wallCount:     d.parameters?.walls?.length || 0,
        source:        d.parameters?.source || 'custom',
        corrections:   d.correctionHistory?.length || 0,
        learnedOffsets: d.learnedOffsets,
        createdAt:     d.createdAt,
        updatedAt:     d.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch designs: ' + err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/ai-designer/design/:id
// @desc    Get full design data for 3D viewing (used when loading saved layout)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/design/:id', auth, async (req, res) => {
  try {
    const design = await AIDesign.findOne({ _id: req.params.id, user: req.userId }).lean();
    if (!design) return res.status(404).json({ error: 'Design not found.' });
    res.json({ success: true, data: design });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/ai-designer/global-offsets
// @desc    Returns aggregated learned offsets across ALL user's corrected designs.
//          The Python extractor calls this (via env) to apply a learned nudge
//          to raw AI predictions before sending to the frontend.
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/global-offsets', auth, async (req, res) => {
  try {
    const designs = await AIDesign.find({
      user:        req.userId,
      isCorrected: true,
      'learnedOffsets.sampleCount': { $gt: 0 },
    }).select('learnedOffsets').lean();

    if (designs.length === 0) {
      return res.json({ success: true, hasData: false, offsets: null });
    }

    const total = designs.reduce((acc, d) => {
      const o = d.learnedOffsets || {};
      const n = o.sampleCount || 1;
      return {
        x:   acc.x   + (o.avgDeltaX        || 0) * n,
        z:   acc.z   + (o.avgDeltaZ        || 0) * n,
        len: acc.len + (o.avgDeltaLength   || 0) * n,
        rot: acc.rot + (o.avgDeltaRotation || 0) * n,
        n:   acc.n   + n,
      };
    }, { x: 0, z: 0, len: 0, rot: 0, n: 0 });

    res.json({
      success: true,
      hasData: true,
      designCount: designs.length,
      offsets: {
        avgDeltaX:        +(total.x   / total.n).toFixed(3),
        avgDeltaZ:        +(total.z   / total.n).toFixed(3),
        avgDeltaLength:   +(total.len / total.n).toFixed(3),
        avgDeltaRotation: +(total.rot / total.n).toFixed(4),
        sampleCount:      total.n,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/ai-designer/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await AIDesign.findById(req.params.id);
    if (!design) return res.status(404).json({ error: 'Design not found' });
    if (design.user.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    await design.deleteOne();
    res.json({ success: true, message: 'Design deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
