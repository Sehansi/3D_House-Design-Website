const mongoose = require('mongoose');

const aiDesignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  style: {
    type: String,
    enum: ['modern', 'traditional', 'minimalist', 'luxury', 'industrial', 'scandinavian', 'bohemian'],
    default: 'modern'
  },
  roomType: {
    type: String,
    enum: ['living room', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining room'],
    default: 'living room'
  },
  budget: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  imageUrl: {
    type: String
  },
  parameters: {
    colors: [String],
    materials: [String],
    furniture: [String],
    lighting: String
  },
  suggestions: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIDesign', aiDesignSchema);
