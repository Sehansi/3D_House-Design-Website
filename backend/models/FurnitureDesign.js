const mongoose = require('mongoose');

const furnitureItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  x: { type: Number, required: true },
  z: { type: Number, required: true },
  rotation: { type: Number, default: 0 },
  color: { type: String, default: '#718096' },
  width: { type: Number, required: true },
  depth: { type: Number, required: true },
}, { _id: false });

const furnitureDesignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    width: { type: Number, required: true, default: 8 },
    length: { type: Number, required: true, default: 8 },
    wallColor: { type: String, default: '#2d2d2d' }
  },
  items: [furnitureItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

furnitureDesignSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('FurnitureDesign', furnitureDesignSchema);
