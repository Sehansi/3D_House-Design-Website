const mongoose = require('mongoose');

const constructorRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  constructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  // 2D Plan (image/pdf)
  plan2DPath: { type: String, default: '' },
  plan2DName: { type: String, default: '' },
  plan2DType: { type: String, enum: ['image', 'pdf', ''], default: '' },
  // 3D Plan (image/pdf/obj)
  plan3DPath: { type: String, default: '' },
  plan3DName: { type: String, default: '' },
  plan3DType: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Viewed', 'Quoted', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  // Quotation from Constructor
  quotation: {
    amount: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    timeline: { type: String, default: '' },
    notes: { type: String, default: '' },
    submittedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('ConstructorRequest', constructorRequestSchema);
