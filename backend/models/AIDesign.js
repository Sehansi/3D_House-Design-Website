const mongoose = require('mongoose');

// ── Wall segment sub-schema ──────────────────────────────────────────────────
const wallSegmentSchema = new mongoose.Schema({
  centerX:   { type: Number, required: true },
  centerZ:   { type: Number, required: true },
  length:    { type: Number, required: true },
  rotation:  { type: Number, required: true },
  thickness: { type: Number, default: 1.5 },
  height:    { type: Number, default: 5.0 },
}, { _id: false });

// ── Polygon sub-schemas ──────────────────────────────────────────────────────
const pointSchema   = new mongoose.Schema({ x: Number, z: Number }, { _id: false });
const polygonSchema = new mongoose.Schema({
  points:     [pointSchema],
  type:       { type: String, default: 'wall' },
  class_id:   { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
}, { _id: false });

// ── Correction delta sub-schema (per-wall AI vs user diff) ──────────────────
const correctionDeltaSchema = new mongoose.Schema({
  wallIndex:       Number,   // index in original AI walls array
  deltaX:          Number,   // centerX correction (user - AI)
  deltaZ:          Number,   // centerZ correction
  deltaLength:     Number,   // length correction
  deltaRotation:   Number,   // rotation correction (radians)
  deltaThickness:  Number,
  deltaHeight:     Number,
  distanceMoved:   Number,   // Euclidean distance of position change
}, { _id: false });

// ── Correction analysis sub-schema ──────────────────────────────────────────
const correctionAnalysisSchema = new mongoose.Schema({
  timestamp:          { type: Date, default: Date.now },
  originalWallCount:  Number,
  correctedWallCount: Number,
  wallsAdded:         Number,   // user added new walls
  wallsRemoved:       Number,   // user removed walls
  wallsMoved:         Number,   // walls with significant position change
  avgDistanceMoved:   Number,   // average displacement across all walls
  maxDistanceMoved:   Number,   // largest single correction
  avgRotationDelta:   Number,   // average rotation correction (radians)
  avgLengthDelta:     Number,   // average length correction
  deltas:             [correctionDeltaSchema],  // per-wall breakdown
}, { _id: false });

// ── Learned offset sub-schema (aggregated from all corrections) ──────────────
// Used as a post-processing step to auto-correct future AI predictions
const learnedOffsetSchema = new mongoose.Schema({
  avgDeltaX:        { type: Number, default: 0 },
  avgDeltaZ:        { type: Number, default: 0 },
  avgDeltaLength:   { type: Number, default: 0 },
  avgDeltaRotation: { type: Number, default: 0 },
  sampleCount:      { type: Number, default: 0 },
  lastUpdated:      { type: Date, default: Date.now },
}, { _id: false });

// ── Main AIDesign schema ─────────────────────────────────────────────────────
const aiDesignSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  name:   { type: String, required: true },
  prompt: { type: String, required: true },

  style: {
    type:    String,
    enum:    ['modern', 'traditional', 'minimalist', 'luxury', 'industrial', 'scandinavian', 'bohemian'],
    default: 'modern',
  },
  roomType: {
    type:    String,
    enum:    ['living room', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining room', 'full house'],
    default: 'living room',
  },
  budget: {
    type:    String,
    enum:    ['low', 'medium', 'high'],
    default: 'medium',
  },

  imageUrl: { type: String },

  // ── AI extraction results (editable by the user) ─────────────────────────
  parameters: {
    colors:    [String],
    materials: [String],
    furniture: [String],
    lighting:  String,
    rooms:     [String],
    totalArea: String,
    source:    { type: String, default: 'custom' },  // 'custom' | 'roboflow'

    walls:           { type: [wallSegmentSchema], default: [] },
    polygons:        { type: [polygonSchema],     default: [] },
    doors:           { type: [wallSegmentSchema], default: [] },
    windows:         { type: [wallSegmentSchema], default: [] },
    door_polygons:   { type: [polygonSchema],     default: [] },
    window_polygons: { type: [polygonSchema],     default: [] },

    // Original AI-predicted walls (snapshot before user corrections)
    originalWalls: { type: [wallSegmentSchema], default: [] },
  },

  suggestions: [String],

  // ── Correction tracking ───────────────────────────────────────────────────
  correctionHistory: [correctionAnalysisSchema],

  // ── Aggregated learned offsets (updated on each save) ────────────────────
  learnedOffsets: { type: learnedOffsetSchema, default: () => ({}) },

  isCorrected: { type: Boolean, default: false },  // true once user has saved corrections

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on every save
aiDesignSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('AIDesign', aiDesignSchema);
