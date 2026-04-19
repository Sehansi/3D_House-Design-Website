const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { authorizeRole } = require('../../middleware/roleAuth');
const User = require('../../models/User');
const Design = require('../../models/Design');
const AIDesign = require('../../models/AIDesign');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 */
router.get('/users', auth, authorizeRole('Admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/admin/user/:id
 * @desc    Delete a user (Admin only)
 */
router.delete('/user/:id', auth, authorizeRole('Admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/admin/user/:id/role
 * @desc    Update user role (Admin only)
 */
router.put('/user/:id/role', auth, authorizeRole('Admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Customer', 'Constructor', 'Architect', 'Admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/admin/user/:id/status
 * @desc    Update user active/suspended status (Admin only)
 */
router.put('/user/:id/status', auth, authorizeRole('Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Status updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/admin/user/:id/approve
 * @desc    Toggle architect/constructor approval (Admin only)
 */
router.put('/user/:id/approve', auth, authorizeRole('Admin'), async (req, res) => {
  try {
    const { isApproved } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Approval status updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * @route   GET /api/admin/projects
 * @desc    Get all projects (Admin only)
 */
router.get('/projects', auth, authorizeRole('Admin'), async (req, res) => {
  try {
    const designs = await Design.find().populate('userId', 'fullName email');
    const aiDesigns = await AIDesign.find().populate('user', 'fullName email');
    res.json({ designs, aiDesigns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/admin/ai-logs
 * @desc    Monitor AI Processing results (Admin only)
 */
router.get('/ai-logs', auth, authorizeRole('Admin'), async (req, res) => {
  try {
    // Fetch latest AIDesigns and specifically look at wall extraction results
    const logs = await AIDesign.find()
      .select('name createdAt floorPlanData parameters.walls')
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Transform into a 'log' format
    const processedLogs = logs.map(log => ({
      projectName: log.name,
      timestamp: log.createdAt,
      status: log.parameters?.walls?.length > 0 ? 'Success' : 'Warning: No walls extracted',
      wallsDetected: log.parameters?.walls?.length || 0,
      details: log.floorPlanData || {}
    }));

    res.json({ logs: processedLogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
