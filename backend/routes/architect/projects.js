const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// 1. Architect creates a new project for a client
router.post('/create', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Architect') {
      return res.status(403).json({ error: 'Only architects can create projects' });
    }

    const { customerId, meetingId, title, description, projectType, estimatedTimeline, estimatedBudget, milestones, notes } = req.body;

    if (!customerId || !title) {
      return res.status(400).json({ error: 'Customer and project title are required' });
    }

    const project = new Project({
      title,
      description,
      projectType: projectType || 'Residential',
      architect: req.user.userId,
      customer: customerId,
      meeting: meetingId || null,
      estimatedTimeline,
      estimatedBudget,
      milestones: (milestones || []).map(m => ({ title: m, completed: false })),
      notes
    });

    await project.save();
    res.status(201).json({ message: 'Project started successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get projects for the logged-in user
router.get('/my-projects', authenticate, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Architect') {
      projects = await Project.find({ architect: req.user.userId })
        .populate('customer', 'fullName email')
        .populate('meeting', 'topic date')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ customer: req.user.userId })
        .populate('architect', 'fullName email')
        .populate('meeting', 'topic date')
        .sort({ createdAt: -1 });
    }
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Architect updates project status and milestones
router.put('/:id/update', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Architect') {
      return res.status(403).json({ error: 'Only architects can update projects' });
    }

    const { status, notes, milestones } = req.body;
    const project = await Project.findOne({ _id: req.params.id, architect: req.user.userId });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (status) project.status = status;
    if (notes !== undefined) project.notes = notes;
    if (milestones) project.milestones = milestones;

    await project.save();
    res.json({ message: 'Project updated', project });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
