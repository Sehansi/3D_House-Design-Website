const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { authorizeRole } = require('../../middleware/roleAuth');
const ArchitectTask = require('../../models/ArchitectTask');
const User = require('../../models/User');
const Review = require('../../models/Review');
const MeetingRequest = require('../../models/MeetingRequest');

/**
 * @route   GET /api/architect/tasks
 * @desc    Get all tasks assigned to the architect
 * @access  Architect
 */
router.get('/tasks', auth, authorizeRole('Architect'), async (req, res) => {
  try {
    const tasks = await ArchitectTask.find({ architectId: req.user.id })
      .populate('customerId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/architect/open-tickets
 * @desc    Get all unassigned customer requirements
 * @access  Architect
 */
router.get('/open-tickets', auth, authorizeRole('Architect'), async (req, res) => {
  try {
    const tasks = await ArchitectTask.find({ status: 'Requested' })
      .populate('customerId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/architect/accept/:taskId
 * @desc    Architect accepts a customer request
 * @access  Architect
 */
router.post('/accept/:taskId', auth, authorizeRole('Architect'), async (req, res) => {
  try {
    const task = await ArchitectTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.architectId = req.user.id;
    task.status = 'Assigned';
    await task.save();
    
    res.json({ message: 'Task assigned successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/architect/upload/:taskId
 * @desc    Upload finalized blueprint and complete task
 * @access  Architect
 */
router.post('/upload/:taskId', auth, authorizeRole('Architect'), async (req, res) => {
  const { blueprintUrl, blueprintFormat } = req.body;
  try {
    const task = await ArchitectTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Check ownership
    if (task.architectId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'You are not assigned to this task' });
    }

    // Generate a unique BlueprintID
    const blueprintId = `BP-${Date.now()}-${req.user.id.slice(-4)}`;
    
    task.blueprintUrl = blueprintUrl;
    task.blueprintFormat = blueprintFormat;
    task.blueprintId = blueprintId;
    task.status = 'Completed';
    task.completedAt = Date.now();
    
    await task.save();
    res.json({ message: 'Professional blueprint uploaded successfully', blueprintId, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/architect/list
 * @desc    Get all architects
 * @access  Public/Auth
 */
router.get('/public/list', auth, async (req, res) => {
  try {
    const architects = await User.find({ role: 'Architect' }).select('-password');
    res.json({ architects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/architect/profile/:id
 * @desc    Get architect profile details with reviews
 * @access  Public/Auth
 */
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const architect = await User.findById(req.params.id).select('-password');
    if (!architect || architect.role !== 'Architect') {
      return res.status(404).json({ error: 'Architect not found' });
    }
    
    const reviews = await Review.find({ architectId: req.params.id }).populate('customerId', 'fullName');
    
    res.json({ architect, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/architect/review/:id
 * @desc    Post a review for an architect
 * @access  Customer
 */
router.post('/review/:id', auth, authorizeRole('Customer'), async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const review = new Review({
      customerId: req.user.id,
      architectId: req.params.id,
      rating,
      comment
    });
    await review.save();
    res.json({ message: 'Review submitted', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/architect/meeting-request/:id
 * @desc    Request a meeting with an architect
 * @access  Customer
 */
router.post('/meeting-request/:id', auth, authorizeRole('Customer'), async (req, res) => {
  const { date, time, purpose, notes } = req.body;
  try {
    const meeting = new MeetingRequest({
      customerId: req.user.id,
      architectId: req.params.id,
      date,
      time,
      purpose,
      notes
    });
    await meeting.save();
    res.json({ message: 'Meeting request sent', meeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/architect/my-meetings
 * @desc    Get meetings for the current user (Architect or Customer)
 * @access  Auth
 */
router.get('/my-meetings', auth, async (req, res) => {
  try {
    const query = req.user.role === 'Architect' ? { architectId: req.user.id } : { customerId: req.user.id };
    const meetings = await MeetingRequest.find(query)
      .populate('customerId', 'fullName email')
      .populate('architectId', 'fullName email')
      .sort({ date: 1, time: 1 });
    res.json({ meetings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/architect/my-profile
 * @desc    Get current architect profile
 * @access  Architect
 */
router.get('/my-profile', auth, authorizeRole('Architect'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('fullName architectProfile');
    res.json({ fullName: user.fullName, profile: user.architectProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/architect/update-profile
 * @desc    Update current architect profile
 * @access  Architect
 */
router.post('/update-profile', auth, authorizeRole('Architect'), async (req, res) => {
  const { fullName, specialization, experience, description, hourlyRate, availability } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (fullName) user.fullName = fullName;

    user.architectProfile = {
      ...user.architectProfile,
      specialization: specialization || user.architectProfile.specialization,
      experience: experience || user.architectProfile.experience,
      description: description || user.architectProfile.description,
      hourlyRate: hourlyRate || user.architectProfile.hourlyRate,
      availability: availability !== undefined ? availability : user.architectProfile.availability
    };

    await user.save();
    res.json({ message: 'Profile updated successfully', profile: user.architectProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
