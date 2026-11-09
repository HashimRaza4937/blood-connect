import express from 'express';
import { repository } from '../db/repository.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Master Admin: Comprehensive Platform Statistics & Demand Analytics
router.get('/stats', authenticate, requireRole('admin'), (req, res) => {
  try {
    const stats = repository.getPlatformStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Master Admin: Manage Blood Banks (list all including pending verification)
router.get('/bloodbanks', authenticate, requireRole('admin'), (req, res) => {
  try {
    const { status } = req.query;
    const banks = repository.findBloodBanks(status ? { status } : {});
    res.json({ success: true, count: banks.length, bloodBanks: banks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Master Admin: Verify or Suspend Blood Bank (Workflow A step 4 & 5)
router.put('/bloodbanks/:id/verify', authenticate, requireRole('admin'), (req, res) => {
  try {
    const { status } = req.body; // 'verified', 'rejected', 'suspended'
    const bank = repository.findBloodBankById(req.params.id);

    if (!bank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }

    const updatedBank = repository.updateBloodBank(bank._id, {
      status,
      verifiedAt: status === 'verified' ? new Date().toISOString() : null,
      verifiedBy: req.user.name
    });

    res.json({
      success: true,
      message: `Blood bank status changed to '${status}'`,
      bloodBank: updatedBank
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Master Admin: View all platform users
router.get('/users', authenticate, requireRole('admin'), (req, res) => {
  try {
    const { role } = req.query;
    const users = repository.findUsers(role ? { role } : {}).map(u => {
      const { password: _, ...clean } = u;
      return clean;
    });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Master Admin: View all platform claims across all 3 channels
router.get('/claims', authenticate, requireRole('admin'), (req, res) => {
  try {
    const claims = repository.findClaims({});
    res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// One-click Reset / Re-seed Demo Data for Contest Presentation
router.post('/reset-demo', authenticate, requireRole('admin'), (req, res) => {
  try {
    const freshData = repository.resetToSeed();
    res.json({
      success: true,
      message: 'Platform demo data successfully restored to Ghotki contest baseline!',
      stats: repository.getPlatformStats()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public Demo Reset (for non-authenticated judges / presentation convenience)
router.post('/quick-reset', (req, res) => {
  try {
    repository.resetToSeed();
    res.json({
      success: true,
      message: 'Demo state reset successfully. All demo accounts, banks, and initial stock restored!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
