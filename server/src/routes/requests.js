import express from 'express';
import { repository } from '../db/repository.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// List public blood requests (for donors & public to see urgent needs)
router.get('/', (req, res) => {
  try {
    const { bloodGroup, city, status } = req.query;
    const query = {};
    if (bloodGroup && bloodGroup !== 'all') query.bloodGroup = bloodGroup.toUpperCase();
    if (city && city !== 'all') query.city = city;
    if (status) query.status = status;

    const requests = repository.findBloodRequests(query);
    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Recipient: Create blood request
router.post('/', authenticate, (req, res) => {
  try {
    const { bloodGroup, unitsNeeded = 1, patientName, hospitalName, city, urgency = 'urgent', description } = req.body;

    if (!bloodGroup || !patientName || !hospitalName) {
      return res.status(400).json({ success: false, message: 'Please provide Blood Group, Patient Name, and Hospital Name.' });
    }

    const newReq = repository.createBloodRequest({
      recipientId: req.user._id,
      recipientName: req.user.name,
      recipientPhone: req.user.phone || '',
      bloodGroup: bloodGroup.toUpperCase(),
      unitsNeeded: Number(unitsNeeded) || 1,
      patientName,
      hospitalName,
      city: city || 'Ghotki',
      urgency,
      description: description || 'Emergency blood required. Please contact attendants.',
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: 'Emergency blood request published to community!',
      bloodRequest: newReq
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update blood request (e.g. fulfill/cancel)
router.put('/:id', authenticate, (req, res) => {
  try {
    const { status } = req.body;
    const updated = repository.updateBloodRequest(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, message: `Request updated to ${status}`, bloodRequest: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
