const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { authorizeRole } = require('../../middleware/roleAuth');
const Design = require('../../models/Design');
const AIDesign = require('../../models/AIDesign');
const Quotation = require('../../models/Quotation');
const path = require('path');
const fs = require('fs');

/**
 * @route   GET /api/constructor/designs
 * @desc    View all public customer designs
 * @access  Private (Constructor only)
 */
router.get('/designs', auth, authorizeRole('Constructor'), async (req, res) => {
  try {
    // Only designs that the customer might want a quote for
    // Assuming we have a 'public' flag or similar, otherwise just fetch all designs
    const designs = await Design.find().populate('userId', 'fullName email');
    res.json({ designs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/constructor/design/:id/ai-data
 * @desc    Download AI-extracted JSON for a design
 * @access  Private (Constructor only)
 */
router.get('/design/:id/ai-data', auth, authorizeRole('Constructor'), async (req, res) => {
  try {
    const aiDesign = await AIDesign.findOne({ designId: req.params.id });
    if (!aiDesign) {
      return res.status(404).json({ error: 'AI data not found for this design' });
    }
    
    // Send as JSON file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=design_${req.params.id}_ai_data.json`);
    res.send(JSON.stringify(aiDesign.processingResults, null, 2));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/constructor/quotation
 * @desc    Submit a cost estimate for a design
 * @access  Private (Constructor only)
 */
router.post('/quotation', auth, authorizeRole('Constructor'), async (req, res) => {
  try {
    const { designId, customerId, amount, description, estimatedDays } = req.body;
    
    const quotation = new Quotation({
      designId,
      customerId,
      constructorId: req.user._id,
      amount,
      description,
      estimatedDays
    });

    await quotation.save();
    res.status(201).json({ message: 'Quotation submitted successfully', quotation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
