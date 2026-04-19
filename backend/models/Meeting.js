const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  architect: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  date: {
    type: String, // Storing as 'YYYY-MM-DD' for simplicity
    required: true
  },
  time: {
    type: String, // Storing as 'HH:MM AM/PM'
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  architectNote: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
