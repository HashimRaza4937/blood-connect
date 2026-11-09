import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getInitialData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Repository {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.resetToSeed();
      }
    } catch (e) {
      console.warn('Could not read existing store.json, resetting to seed data:', e.message);
      this.resetToSeed();
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting store.json:', err.message);
    }
  }

  resetToSeed() {
    this.data = getInitialData();
    this.save();
    return this.data;
  }

  // --- Users ---
  findUsers(query = {}) {
    return this.data.users.filter(u => {
      for (const key of Object.keys(query)) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    });
  }

  findUserById(id) {
    return this.data.users.find(u => u._id === id);
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.users[idx];
  }

  // --- Blood Banks ---
  findBloodBanks(query = {}) {
    return this.data.bloodBanks.filter(b => {
      if (query.status && b.status !== query.status) return false;
      if (query.city && b.city.toLowerCase() !== query.city.toLowerCase()) return false;
      if (query.district && b.district.toLowerCase() !== query.district.toLowerCase()) return false;
      return true;
    });
  }

  findBloodBankById(id) {
    return this.data.bloodBanks.find(b => b._id === id);
  }

  findBloodBankByUserId(userId) {
    return this.data.bloodBanks.find(b => b.managerUserId === userId);
  }

  createBloodBank(bankData) {
    const defaultInventory = [
      { bloodGroup: 'O+', regularUnits: 0, freeUnits: 0 },
      { bloodGroup: 'B+', regularUnits: 0, freeUnits: 0 },
      { bloodGroup: 'A+', regularUnits: 0, freeUnits: 0 },
      { bloodGroup: 'AB+', regularUnits: 0, freeUnits: 0 },
      { bloodGroup: 'O-', regularUnits: 0, freeUnits: 0 },
      { bloodGroup: 'A-', regularUnits: 0, freeUnits: 0 },
      { bloodGroup: 'B-', regularUnits: 0, freeUnits: 0 },
      { bloodGroup: 'AB-', regularUnits: 0, freeUnits: 0 }
    ];

    const newBank = {
      _id: `bb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      status: 'pending',
      inventory: bankData.inventory || defaultInventory,
      createdAt: new Date().toISOString(),
      ...bankData
    };
    this.data.bloodBanks.push(newBank);
    this.save();
    return newBank;
  }

  updateBloodBank(id, updates) {
    const idx = this.data.bloodBanks.findIndex(b => b._id === id);
    if (idx === -1) return null;
    this.data.bloodBanks[idx] = { ...this.data.bloodBanks[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.bloodBanks[idx];
  }

  updateBloodBankInventory(bankId, bloodGroup, regularChange = 0, freeChange = 0) {
    const bank = this.findBloodBankById(bankId);
    if (!bank) return null;

    let item = bank.inventory.find(i => i.bloodGroup.toUpperCase() === bloodGroup.toUpperCase());
    if (!item) {
      item = { bloodGroup: bloodGroup.toUpperCase(), regularUnits: 0, freeUnits: 0 };
      bank.inventory.push(item);
    }

    item.regularUnits = Math.max(0, (item.regularUnits || 0) + regularChange);
    item.freeUnits = Math.max(0, (item.freeUnits || 0) + freeChange);
    bank.lastInventoryUpdate = new Date().toISOString();

    this.save();
    return bank;
  }

  setBloodBankInventory(bankId, inventoryArray) {
    const bank = this.findBloodBankById(bankId);
    if (!bank) return null;
    bank.inventory = inventoryArray;
    bank.lastInventoryUpdate = new Date().toISOString();
    this.save();
    return bank;
  }

  // --- Donations ---
  findDonations(query = {}) {
    return this.data.donations.filter(d => {
      if (query.donorId && d.donorId !== query.donorId) return false;
      if (query.bloodBankId && d.bloodBankId !== query.bloodBankId) return false;
      if (query.status && d.status !== query.status) return false;
      if (query.bloodGroup && d.bloodGroup !== query.bloodGroup) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findDonationById(id) {
    return this.data.donations.find(d => d._id === id);
  }

  createDonation(donationData) {
    const newDonation = {
      _id: `don_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      status: 'pending',
      units: 1,
      createdAt: new Date().toISOString(),
      ...donationData
    };
    this.data.donations.push(newDonation);
    this.save();
    return newDonation;
  }

  verifyDonation(donationId, verifiedBy, status = 'verified', notes = '') {
    const donation = this.findDonationById(donationId);
    if (!donation) return null;

    donation.status = status;
    donation.verifiedBy = verifiedBy;
    donation.verificationDate = new Date().toISOString();
    if (notes) donation.notes = notes;

    // If verified, add to freeUnits in bloodBank inventory!
    if (status === 'verified') {
      this.updateBloodBankInventory(donation.bloodBankId, donation.bloodGroup, 0, donation.units || 1);
    }

    this.save();
    return donation;
  }

  // --- Free Blood Claims ---
  findClaims(query = {}) {
    return this.data.freeClaims.filter(c => {
      if (query.recipientId && c.recipientId !== query.recipientId) return false;
      if (query.bloodBankId && c.bloodBankId !== query.bloodBankId) return false;
      if (query.status && c.status !== query.status) return false;
      if (query.bloodGroup && c.bloodGroup !== query.bloodGroup) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findClaimById(id) {
    return this.data.freeClaims.find(c => c._id === id);
  }

  createClaim(claimData) {
    const acqType = claimData.acquisitionType || 'free';
    const prefix = acqType === 'free' ? 'BC-FREE-GHK' : acqType === 'replacement_donor' ? 'BC-EXCH-GHK' : 'BC-PAID-GHK';
    const allocationToken = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim = {
      _id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      status: 'pending',
      acquisitionType: acqType,
      unitsNeeded: 1,
      allocationToken,
      createdAt: new Date().toISOString(),
      ...claimData
    };
    this.data.freeClaims.push(newClaim);
    this.save();
    return newClaim;
  }

  updateClaimStatus(claimId, status, remarks = '') {
    const claim = this.findClaimById(claimId);
    if (!claim) return null;

    const previousStatus = claim.status;
    claim.status = status;
    if (remarks) claim.bloodBankRemarks = remarks;
    claim.updatedAt = new Date().toISOString();

    // If approving for the first time, deduct inventory appropriately!
    if (status === 'approved' && previousStatus === 'pending') {
      const units = Number(claim.unitsNeeded) || 1;
      if (claim.acquisitionType === 'free') {
        this.updateBloodBankInventory(claim.bloodBankId, claim.bloodGroup, 0, -units);
      } else if (claim.acquisitionType === 'replacement_donor') {
        // Deduct regular stock for requested blood group
        this.updateBloodBankInventory(claim.bloodBankId, claim.bloodGroup, -units, 0);
        // Credit the exchange donor's blood into regular stock
        if (claim.replacementDonorBloodGroup) {
          this.updateBloodBankInventory(claim.bloodBankId, claim.replacementDonorBloodGroup, units, 0);
        }
      } else if (claim.acquisitionType === 'screening_fee') {
        // Deduct regular stock for requested blood group
        this.updateBloodBankInventory(claim.bloodBankId, claim.bloodGroup, -units, 0);
      } else {
        // Fallback default
        this.updateBloodBankInventory(claim.bloodBankId, claim.bloodGroup, 0, -units);
      }
    }

    this.save();
    return claim;
  }

  // --- Blood Requests ---
  findBloodRequests(query = {}) {
    return this.data.bloodRequests.filter(r => {
      if (query.recipientId && r.recipientId !== query.recipientId) return false;
      if (query.bloodGroup && r.bloodGroup !== query.bloodGroup) return false;
      if (query.city && r.city.toLowerCase() !== query.city.toLowerCase()) return false;
      if (query.status && r.status !== query.status) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createBloodRequest(reqData) {
    const newReq = {
      _id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      ...reqData
    };
    this.data.bloodRequests.push(newReq);
    this.save();
    return newReq;
  }

  updateBloodRequest(id, updates) {
    const idx = this.data.bloodRequests.findIndex(r => r._id === id);
    if (idx === -1) return null;
    this.data.bloodRequests[idx] = { ...this.data.bloodRequests[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.bloodRequests[idx];
  }

  // --- Statistics & Admin Analytics ---
  getPlatformStats() {
    const totalBloodBanks = this.data.bloodBanks.length;
    const verifiedBloodBanks = this.data.bloodBanks.filter(b => b.status === 'verified').length;
    const pendingBloodBanks = this.data.bloodBanks.filter(b => b.status === 'pending').length;

    const totalDonors = this.data.users.filter(u => u.role === 'donor').length;
    const totalRecipients = this.data.users.filter(u => u.role === 'recipient').length;

    const totalDonations = this.data.donations.length;
    const verifiedDonations = this.data.donations.filter(d => d.status === 'verified').length;
    const pendingDonations = this.data.donations.filter(d => d.status === 'pending').length;

    const totalClaims = this.data.freeClaims.length;
    const pendingClaims = this.data.freeClaims.filter(c => c.status === 'pending').length;
    const approvedClaims = this.data.freeClaims.filter(c => c.status === 'approved').length;

    const totalRequests = this.data.bloodRequests.length;

    // Calculate total available regular and free blood units across verified banks
    let totalRegularUnits = 0;
    let totalFreeUnits = 0;

    const bloodGroupSummary = {
      'O+': { regular: 0, free: 0, requests: 0 },
      'B+': { regular: 0, free: 0, requests: 0 },
      'A+': { regular: 0, free: 0, requests: 0 },
      'AB+': { regular: 0, free: 0, requests: 0 },
      'O-': { regular: 0, free: 0, requests: 0 },
      'A-': { regular: 0, free: 0, requests: 0 },
      'B-': { regular: 0, free: 0, requests: 0 },
      'AB-': { regular: 0, free: 0, requests: 0 }
    };

    for (const bank of this.data.bloodBanks) {
      if (bank.status === 'verified' && Array.isArray(bank.inventory)) {
        for (const item of bank.inventory) {
          const bg = item.bloodGroup.toUpperCase();
          if (bloodGroupSummary[bg]) {
            bloodGroupSummary[bg].regular += (item.regularUnits || 0);
            bloodGroupSummary[bg].free += (item.freeUnits || 0);
            totalRegularUnits += (item.regularUnits || 0);
            totalFreeUnits += (item.freeUnits || 0);
          }
        }
      }
    }

    // Merge demand statistics from seedData or actual bloodRequests + claims
    for (const item of (this.data.demandStats || [])) {
      if (bloodGroupSummary[item.bloodGroup]) {
        bloodGroupSummary[item.bloodGroup].requests = item.requests;
      }
    }

    // Also count live requests
    for (const req of this.data.bloodRequests) {
      if (bloodGroupSummary[req.bloodGroup]) {
        bloodGroupSummary[req.bloodGroup].requests += (req.unitsNeeded || 1);
      }
    }

    const demandVsSupply = Object.keys(bloodGroupSummary).map(bg => ({
      bloodGroup: bg,
      requests: bloodGroupSummary[bg].requests,
      regularUnits: bloodGroupSummary[bg].regular,
      freeUnits: bloodGroupSummary[bg].free,
      totalAvailable: bloodGroupSummary[bg].regular + bloodGroupSummary[bg].free,
      gap: Math.max(0, bloodGroupSummary[bg].requests - (bloodGroupSummary[bg].regular + bloodGroupSummary[bg].free))
    }));

    const claimsByType = {
      free: this.data.freeClaims.filter(c => !c.acquisitionType || c.acquisitionType === 'free').length,
      replacement_donor: this.data.freeClaims.filter(c => c.acquisitionType === 'replacement_donor').length,
      screening_fee: this.data.freeClaims.filter(c => c.acquisitionType === 'screening_fee').length,
    };

    return {
      totalBloodBanks,
      verifiedBloodBanks,
      pendingBloodBanks,
      totalDonors,
      totalRecipients,
      totalDonations,
      verifiedDonations,
      pendingDonations,
      totalClaims,
      pendingClaims,
      approvedClaims,
      claimsByType,
      totalRequests,
      totalRegularUnits,
      totalFreeUnits,
      totalStockUnits: totalRegularUnits + totalFreeUnits,
      demandVsSupply
    };
  }
}

export const repository = new Repository();
