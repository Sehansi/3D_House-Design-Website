const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['Customer', 'Constructor', 'Architect', 'Admin'],
    default: 'Customer'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  // Specific fields for Architects
  architectProfile: {
    specialization: { type: String },
    experience: { type: Number },
    description: { type: String },
    profileImage: { type: String },
    projects: [{
      title: String,
      imageUrl: String,
      description: String
    }],
    hourlyRate: { type: Number },
    availability: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
