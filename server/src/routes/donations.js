import express from 'express';
import { repository } from '../db/repository.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Submit a new donation record (Workflow B: Donor submits donation update)
router.post('/', authenticate, (req, res) => {
  try {
    const { bloodBankId, bloodGroup, units = 1, donationDate, slipNumber, notes } = req.body;

    if (!bloodBankId || !bloodGroup) {
      return res.status(400).json({ success: false, message: 'Blood bank and blood group are required.' });
    }

    const bloodBank = repository.findBloodBankById(bloodBankId);
    if (!bloodBank) {
      return res.status(404).json({ success: false, message: 'Selected blood bank not found.' });
    }

    const donation = repository.createDonation({
      donorId: req.user._id,
      donorName: req.user.name,
      donorPhone: req.user.phone || '',
      bloodBankId: bloodBank._id,
      bloodBankName: bloodBank.name,
      bloodGroup: bloodGroup.toUpperCase(),
      units: Number(units) || 1,
      donationDate: donationDate || new Date().toISOString().split('T')[0],
      slipNumber: slipNumber || `SLIP-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Voluntary free donation submitted via portal',
      status: 'pending'
    });

    // Update user donor statistics
    const currentDonations = (req.user.totalDonations || 0) + 1;
    repository.updateUser(req.user._id, {
      totalDonations: currentDonations,
      lastDonationDate: donation.donationDate,
      bloodGroup: bloodGroup.toUpperCase()
    });

    res.status(201).json({
      success: true,
      message: 'Donation submitted successfully! It is now pending verification by ' + bloodBank.name,
      donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current donor's donation history
router.get('/my', authenticate, (req, res) => {
  try {
    const donations = repository.findDonations({ donorId: req.user._id });
    res.json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Blood Bank: Get donations submitted at this bank
router.get('/bank/:bankId', authenticate, (req, res) => {
  try {
    const { status } = req.query;
    const query = { bloodBankId: req.params.bankId };
    if (status) query.status = status;

    const donations = repository.findDonations(query);
    res.json({ success: true, count: donations.length, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Blood Bank / Admin: Verify or reject donation (Workflow B step 8)
router.put('/:id/verify', authenticate, requireRole('bloodbank', 'admin'), (req, res) => {
  try {
    const { status = 'verified', notes = '' } = req.body;
    const donation = repository.findDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    if (donation.status === 'verified' && status === 'verified') {
      return res.status(400).json({ success: false, message: 'This donation is already verified.' });
    }

    const verifiedDonation = repository.verifyDonation(
      donation._id,
      req.user.name || 'Blood Bank Officer',
      status,
      notes
    );

    res.json({
      success: true,
      message: status === 'verified'
        ? `Donation verified! ${donation.units} free unit(s) of ${donation.bloodGroup} added to free stock.`
        : 'Donation record marked as rejected.',
      donation: verifiedDonation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public stats: recent verified donations feed
router.get('/public-feed', (req, res) => {
  try {
    const verified = repository.findDonations({ status: 'verified' }).slice(0, 10);
    res.json({ success: true, feed: verified });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
