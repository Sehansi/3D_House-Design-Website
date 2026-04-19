const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  parameters: {
    bedrooms: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    kitchen: {
      type: Boolean,
      default: true
    },
    livingRoom: {
      type: Boolean,
      default: true
    },
    totalArea: {
      type: Number,
      required: true,
      min: 500,
      max: 10000
    },
    floors: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    style: {
      type: String,
      enum: ['modern', 'traditional', 'minimalist', 'luxury'],
      default: 'modern'
    }
  },
  finishes: {
    wallColor: {
      type: String,
      default: '#ffffff'
    },
    floorType: {
      type: String,
      enum: ['tile', 'wood', 'marble', 'carpet'],
      default: 'tile'
    },
    roofType: {
      type: String,
      enum: ['flat', 'sloped', 'gable'],
      default: 'sloped'
    }
  },
  modelData: {
    type: Object,
    default: {}
  },
  thumbnail: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Design', designSchema);
