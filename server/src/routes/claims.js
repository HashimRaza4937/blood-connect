import express from 'express';
import { repository } from '../db/repository.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Recipient: Submit Blood Acquisition Claim / Requisition (Free, Exchange Donor, or Screening Fee)
router.post('/', authenticate, (req, res) => {
  try {
    const {
      bloodBankId,
      bloodGroup,
      unitsNeeded = 1,
      patientName,
      patientAge,
      hospitalName,
      doctorName,
      doctorPrescription,
      urgency = 'urgent',
      acquisitionType = 'free', // 'free' | 'replacement_donor' | 'screening_fee'
      // Replacement Donor Details (Option B)
      replacementDonorName,
      replacementDonorPhone,
      replacementDonorBloodGroup,
      replacementDonorRelation,
      // Screening Fee Details (Option C)
      feeAmount,
      paymentMethod = 'counter_cash'
    } = req.body;

    if (!bloodBankId || !bloodGroup || !patientName || !hospitalName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Blood Bank, Blood Group, Patient Name, and Hospital Name.'
      });
    }

    const bloodBank = repository.findBloodBankById(bloodBankId);
    if (!bloodBank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }

    const item = bloodBank.inventory?.find(i => i.bloodGroup === bloodGroup.toUpperCase());
    const availableFree = item ? (item.freeUnits || 0) : 0;
    const availableRegular = item ? (item.regularUnits || 0) : 0;
    const totalAvailable = availableFree + availableRegular;
    const requestedUnits = Number(unitsNeeded) || 1;

    // Pathway 1: Free Blood Claim
    if (acquisitionType === 'free') {
      if (availableFree < requestedUnits) {
        return res.status(400).json({
          success: false,
          message: `Free blood is currently not available for ${bloodGroup} at ${bloodBank.name} (0 free units). Please choose Option 2: 'Exchange / Replacement Donor' or Option 3: 'Standard Screening Fee' to receive this blood.`
        });
      }
    } 
    // Pathway 2: Exchange / Replacement Donor
    else if (acquisitionType === 'replacement_donor') {
      if (totalAvailable < requestedUnits) {
        return res.status(400).json({
          success: false,
          message: `Blood bank currently does not have ${bloodGroup} in stock to exchange. Total available: ${totalAvailable} unit(s).`
        });
      }
      if (!replacementDonorName || !replacementDonorBloodGroup) {
        return res.status(400).json({
          success: false,
          message: 'Please provide the Replacement Donor name and blood group.'
        });
      }
    } 
    // Pathway 3: Standard Lab Processing / Screening Fee
    else if (acquisitionType === 'screening_fee') {
      if (totalAvailable < requestedUnits) {
        return res.status(400).json({
          success: false,
          message: `Blood bank currently does not have ${bloodGroup} in stock. Total available: ${totalAvailable} unit(s).`
        });
      }
    }

    const calculatedFee = requestedUnits * 1800; // Subsidized PKR 1,800/unit for 5-marker NAT/ELISA safety tests

    const claim = repository.createClaim({
      recipientId: req.user._id,
      recipientName: req.user.name,
      recipientPhone: req.user.phone || '',
      bloodBankId: bloodBank._id,
      bloodBankName: bloodBank.name,
      bloodGroup: bloodGroup.toUpperCase(),
      unitsNeeded: requestedUnits,
      patientName,
      patientAge: patientAge ? Number(patientAge) : null,
      hospitalName,
      doctorName: doctorName || '',
      doctorPrescription: doctorPrescription || 'Patient requisition on file',
      urgency,
      acquisitionType,
      // Option B Details
      replacementDonorName: replacementDonorName || '',
      replacementDonorPhone: replacementDonorPhone || '',
      replacementDonorBloodGroup: replacementDonorBloodGroup || '',
      replacementDonorRelation: replacementDonorRelation || 'Relative/Friend',
      // Option C Details
      feeAmount: acquisitionType === 'screening_fee' ? calculatedFee : 0,
      paymentMethod: acquisitionType === 'screening_fee' ? paymentMethod : 'none',
      paymentStatus: acquisitionType === 'screening_fee' ? 'pay_at_counter' : 'free',
      status: 'pending'
    });

    let successMsg = '';
    if (acquisitionType === 'free') {
      successMsg = `100% Free Blood Claim submitted! Allocation Token: ${claim.allocationToken}`;
    } else if (acquisitionType === 'replacement_donor') {
      successMsg = `Replacement Donor Requisition registered! Token: ${claim.allocationToken}. Please bring donor ${replacementDonorName} (${replacementDonorBloodGroup}) to the counter.`;
    } else {
      successMsg = `Blood Requisition registered with standard lab screening fee (PKR ${calculatedFee}). Token: ${claim.allocationToken}.`;
    }

    res.status(201).json({
      success: true,
      message: successMsg,
      claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Recipient: Get my claims
router.get('/my', authenticate, (req, res) => {
  try {
    const claims = repository.findClaims({ recipientId: req.user._id });
    res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Blood Bank: Get claims submitted to this bank
router.get('/bank/:bankId', authenticate, (req, res) => {
  try {
    const { status } = req.query;
    const query = { bloodBankId: req.params.bankId };
    if (status) query.status = status;

    const claims = repository.findClaims(query);
    res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single claim by ID (e.g. for printable voucher/slip)
router.get('/:id', authenticate, (req, res) => {
  try {
    const claim = repository.findClaimById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    res.json({ success: true, claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Blood Bank / Admin: Approve or Reject free claim (Workflow C step 8 & 10)
router.put('/:id/status', authenticate, requireRole('bloodbank', 'admin'), (req, res) => {
  try {
    const { status, remarks } = req.body; // 'approved', 'rejected', 'collected'

    if (!['approved', 'rejected', 'collected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved, rejected, or collected.' });
    }

    const updatedClaim = repository.updateClaimStatus(req.params.id, status, remarks);
    if (!updatedClaim) {
      return res.status(404).json({ success: false, message: 'Claim record not found' });
    }

    res.json({
      success: true,
      message: `Claim status updated to ${status}. ${status === 'approved' ? 'Free inventory allocated and stock decremented.' : ''}`,
      claim: updatedClaim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
