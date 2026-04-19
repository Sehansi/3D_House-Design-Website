const mongoose = require('mongoose');

const architectTaskSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  architectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  specifications: {
    rooms: Number,
    stories: Number,
    totalArea: String,
    style: String
  },
  status: {
    type: String,
    enum: ['Requested', 'Assigned', 'Designing', 'Completed', 'Approved'],
    default: 'Requested'
  },
  blueprintUrl: {
    type: String
  },
  blueprintFormat: {
    type: String,
    enum: ['PDF', 'DWG', 'JPG']
  },
  blueprintId: {
    type: String,
    unique: true,
    sparse: true
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ArchitectTask', architectTaskSchema);
