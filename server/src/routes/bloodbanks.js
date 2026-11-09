import express from 'express';
import { repository } from '../db/repository.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List blood banks with search & filter
router.get('/', (req, res) => {
  try {
    const { bloodGroup, city, freeOnly, search, status } = req.query;
    let banks = repository.findBloodBanks({ status: status || 'verified' });

    // City filter
    if (city && city.toLowerCase() !== 'all') {
      banks = banks.filter(b => 
        (b.city && b.city.toLowerCase() === city.toLowerCase()) ||
        (b.district && b.district.toLowerCase() === city.toLowerCase())
      );
    }

    // Search query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      banks = banks.filter(b => 
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    }

    // Blood group and free availability filter
    if (bloodGroup && bloodGroup.toLowerCase() !== 'all') {
      const targetGroup = bloodGroup.toUpperCase();
      banks = banks.filter(b => {
        const item = b.inventory?.find(i => i.bloodGroup === targetGroup);
        if (!item) return false;
        if (freeOnly === 'true' || freeOnly === true) {
          return (item.freeUnits || 0) > 0;
        }
        return (item.regularUnits || 0) + (item.freeUnits || 0) > 0;
      });
    } else if (freeOnly === 'true' || freeOnly === true) {
      // Must have at least 1 free unit in any blood group
      banks = banks.filter(b => {
        return b.inventory?.some(i => (i.freeUnits || 0) > 0);
      });
    }

    res.json({
      success: true,
      count: banks.length,
      bloodBanks: banks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get blood bank by ID
router.get('/:id', (req, res) => {
  try {
    const bank = repository.findBloodBankById(req.params.id);
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }
    res.json({ success: true, bloodBank: bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register new Blood Bank (Workflow A)
router.post('/register', authenticate, (req, res) => {
  try {
    const { name, licenseNumber, city, district, address, phone, emergencyPhone, operatingHours, facilities } = req.body;

    if (!name || !licenseNumber || !address || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required blood bank details.' });
    }

    const newBank = repository.createBloodBank({
      name,
      licenseNumber,
      managerUserId: req.user._id,
      city: city || 'Ghotki',
      district: district || 'Ghotki',
      address,
      phone,
      emergencyPhone: emergencyPhone || phone,
      operatingHours: operatingHours || '24/7 Emergency Service',
      facilities: facilities || ['Free Voluntary Donation Desk', 'Component Storage'],
      latitude: 28.0065,
      longitude: 69.3168,
      status: 'pending' // Admin must verify (Workflow A)
    });

    // Update user record with bloodBankId
    repository.updateUser(req.user._id, { bloodBankId: newBank._id, role: 'bloodbank' });

    res.status(201).json({
      success: true,
      message: 'Blood Bank registration submitted successfully! Awaiting Master Admin verification.',
      bloodBank: newBank
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Blood Bank Inventory (blood bank manager or admin)
router.put('/:id/inventory', authenticate, requireRole('bloodbank', 'admin'), (req, res) => {
  try {
    const { inventory } = req.body;
    const bank = repository.findBloodBankById(req.params.id);

    if (!bank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }

    if (req.user.role === 'bloodbank' && req.user.bloodBankId !== bank._id && bank.managerUserId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to manage this blood bank inventory' });
    }

    if (!Array.isArray(inventory)) {
      return res.status(400).json({ success: false, message: 'Inventory must be an array' });
    }

    const updatedBank = repository.setBloodBankInventory(bank._id, inventory);

    res.json({
      success: true,
      message: 'Blood bank inventory updated successfully',
      bloodBank: updatedBank
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Quick increment/decrement specific blood group units
router.post('/:id/inventory/adjust', authenticate, requireRole('bloodbank', 'admin'), (req, res) => {
  try {
    const { bloodGroup, regularChange = 0, freeChange = 0 } = req.body;
    const bank = repository.findBloodBankById(req.params.id);

    if (!bank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }

    if (!bloodGroup) {
      return res.status(400).json({ success: false, message: 'bloodGroup is required' });
    }

    const updatedBank = repository.updateBloodBankInventory(bank._id, bloodGroup, regularChange, freeChange);

    res.json({
      success: true,
      message: `Adjusted inventory for ${bloodGroup}`,
      bloodBank: updatedBank
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
