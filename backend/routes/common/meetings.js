const express = require('express');
const router = express.Router();
const Meeting = require('../../models/Meeting');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// 1. Customer requests a new meeting
router.post('/request', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Customer') {
      return res.status(403).json({ error: 'Only customers can request meetings' });
    }

    const { architectId, topic, date, time } = req.body;
    
    if (!architectId || !topic || !date || !time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const meeting = new Meeting({
      customer: req.user.userId,
      architect: architectId,
      topic,
      date,
      time,
      status: 'Pending'
    });

    await meeting.save();
    res.status(201).json({ message: 'Meeting requested successfully', meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get meetings for logged-in user (Customer or Architect)
router.get('/my-meetings', authenticate, async (req, res) => {
  try {
    let meetings;
    if (req.user.role === 'Architect') {
      meetings = await Meeting.find({ architect: req.user.userId })
        .populate('customer', 'fullName email phoneNumber')
        .sort({ date: 1, time: 1 });
    } else if (req.user.role === 'Customer') {
      meetings = await Meeting.find({ customer: req.user.userId })
        .populate('architect', 'fullName email phoneNumber')
        .sort({ date: 1, time: 1 });
    } else {
      meetings = [];
    }
    
    res.json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Architect updates meeting status (Accept/Reject with note)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Architect') {
      return res.status(403).json({ error: 'Only architects can update meeting status' });
    }

    const { status, architectNote } = req.body;
    
    const ObjectStatus = {
        'Accepted': 'Accepted',
        'Rejected': 'Rejected'
    };
    
    if (!ObjectStatus[status]) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const meeting = await Meeting.findOne({ _id: req.params.id, architect: req.user.userId });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    meeting.status = status;
    if (architectNote !== undefined) {
      meeting.architectNote = architectNote;
    }
    
    if (status === 'Accepted' && req.body.meetingLink) {
        meeting.meetingLink = req.body.meetingLink;
    }

    await meeting.save();
    res.json({ message: `Meeting ${status.toLowerCase()} successfully`, meeting });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
