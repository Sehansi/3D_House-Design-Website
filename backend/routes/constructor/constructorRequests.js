const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const ConstructorRequest = require('../../models/ConstructorRequest');
const User = require('../../models/User');

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

// Multer setup for plan files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/constructor-plans');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `cplan_${Date.now()}_${Math.round(Math.random() * 1e5)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.obj', '.glb', '.gltf'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

const planFields = upload.fields([
  { name: 'plan2D', maxCount: 1 },
  { name: 'plan3D', maxCount: 1 }
]);

// GET /api/constructor-requests/constructors — list all constructors
router.get('/constructors', authenticate, async (req, res) => {
  try {
    const constructors = await User.find({ role: 'Constructor' }).select('-password');
    res.json({ constructors });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/constructor-requests/submit — customer submits plans
router.post('/submit', authenticate, planFields, async (req, res) => {
  try {
    if (req.user.role !== 'Customer') {
      return res.status(403).json({ error: 'Only customers can submit requests' });
    }

    const { constructorId, projectTitle, description } = req.body;
    if (!constructorId || !projectTitle) {
      return res.status(400).json({ error: 'Constructor and project title are required' });
    }

    const plan2D = req.files?.plan2D?.[0];
    const plan3D = req.files?.plan3D?.[0];

    if (!plan2D) {
      return res.status(400).json({ error: 'At least a 2D plan is required' });
    }

    const ext2D = path.extname(plan2D.originalname).toLowerCase();
    const ext3D = plan3D ? path.extname(plan3D.originalname).toLowerCase() : null;

    const request = new ConstructorRequest({
      customer: req.user.userId,
      constructor: constructorId,
      projectTitle,
      description,
      plan2DPath: `/uploads/constructor-plans/${plan2D.filename}`,
      plan2DName: plan2D.originalname,
      plan2DType: ext2D === '.pdf' ? 'pdf' : 'image',
      plan3DPath: plan3D ? `/uploads/constructor-plans/${plan3D.filename}` : '',
      plan3DName: plan3D ? plan3D.originalname : '',
      plan3DType: ext3D || ''
    });

    await request.save();
    res.status(201).json({ message: 'Request submitted to constructor!', request });
  } catch (err) {
    console.error('Constructor request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/constructor-requests/my-requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'Customer') {
      requests = await ConstructorRequest.find({ customer: req.user.userId })
        .populate('constructor', 'fullName email phoneNumber')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'Constructor') {
      requests = await ConstructorRequest.find({ constructor: req.user.userId })
        .populate('customer', 'fullName email phoneNumber')
        .sort({ createdAt: -1 });
    } else {
      requests = [];
    }
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/constructor-requests/:id/quote — constructor submits quotation
router.put('/:id/quote', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Constructor') {
      return res.status(403).json({ error: 'Only constructors can submit quotes' });
    }

    const { amount, currency, timeline, notes } = req.body;
    const request = await ConstructorRequest.findOne({ _id: req.params.id, constructor: req.user.userId });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'Quoted';
    request.quotation = { amount, currency: currency || 'USD', timeline, notes, submittedAt: new Date() };

    await request.save();
    res.json({ message: 'Quotation submitted', request });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/constructor-requests/:id/status — customer accepts/rejects
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Customer') {
      return res.status(403).json({ error: 'Only customers can update status' });
    }

    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await ConstructorRequest.findOne({ _id: req.params.id, customer: req.user.userId });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = status;
    await request.save();
    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
