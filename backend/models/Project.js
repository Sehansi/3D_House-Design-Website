const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  projectType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Interior', 'Renovation', 'Landscaping', 'Other'],
    default: 'Residential'
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
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    default: null
  },
  status: {
    type: String,
    enum: ['Planning', 'Design Phase', 'In Progress', 'Review', 'Completed', 'On Hold'],
    default: 'Planning'
  },
  estimatedTimeline: {
    type: String,
    default: ''
  },
  estimatedBudget: {
    type: String,
    default: ''
  },
  milestones: [
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ],
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
