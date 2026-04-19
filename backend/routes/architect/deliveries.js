const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ClientDelivery = require('../../models/ClientDelivery');
const Project = require('../../models/Project');
const jwt = require('jsonwebtoken');

// Middleware
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

// Multer config — save to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/plans');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `plan_${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only JPG, PNG or PDF files are allowed'));
    }
    cb(null, true);
  }
});

// 1. Architect uploads a 2D plan linked to a project
router.post('/upload', authenticate, upload.single('planFile'), async (req, res) => {
  try {
    if (req.user.role !== 'Architect') {
      return res.status(403).json({ error: 'Only architects can upload deliveries' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectId, title, description } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project and title are required' });
    }

    // Verify architect owns this project
    const project = await Project.findOne({ _id: projectId, architect: req.user.userId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found or you are not the assigned architect' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = ext === '.pdf' ? 'pdf' : 'image';
    const filePath = `/uploads/plans/${req.file.filename}`;

    const delivery = new ClientDelivery({
      project: projectId,
      architect: req.user.userId,
      customer: project.customer,
      title,
      description: description || '',
      filePath,
      fileName: req.file.originalname,
      fileType
    });

    await delivery.save();
    res.status(201).json({ message: '2D Plan delivered to client successfully', delivery });
  } catch (error) {
    console.error('Error uploading delivery:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Get deliveries for the logged-in user
router.get('/my-deliveries', authenticate, async (req, res) => {
  try {
    let deliveries;
    if (req.user.role === 'Architect') {
      deliveries = await ClientDelivery.find({ architect: req.user.userId })
        .populate('customer', 'fullName email')
        .populate('project', 'title status')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'Customer') {
      deliveries = await ClientDelivery.find({ customer: req.user.userId })
        .populate('architect', 'fullName email')
        .populate('project', 'title status')
        .sort({ createdAt: -1 });
    } else {
      deliveries = [];
    }
    res.json({ deliveries });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
