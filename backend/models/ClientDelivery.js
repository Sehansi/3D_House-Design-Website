const mongoose = require('mongoose');

const clientDeliverySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  architect: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,       // server disk path e.g. /uploads/plans/filename.jpg
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Approved', 'Revision Requested'],
    default: 'Pending Review'
  }
}, { timestamps: true });

module.exports = mongoose.model('ClientDelivery', clientDeliverySchema);
