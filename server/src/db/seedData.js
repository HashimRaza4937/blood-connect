import bcrypt from 'bcryptjs';

export const getInitialData = () => {
  const hashedPasswordAdmin = bcrypt.hashSync('admin123', 8);
  const hashedPasswordBank = bcrypt.hashSync('bank123', 8);
  const hashedPasswordDonor = bcrypt.hashSync('donor123', 8);
  const hashedPasswordRecipient = bcrypt.hashSync('recipient123', 8);

  const users = [
    {
      _id: 'usr_admin_01',
      name: 'Prof. Tariq Mahar (Admin)',
      email: 'admin@bloodconnect.pk',
      password: hashedPasswordAdmin,
      role: 'admin',
      phone: '+92 300 0000001',
      city: 'Ghotki',
      createdAt: new Date('2026-01-01T08:00:00Z').toISOString()
    },
    {
      _id: 'usr_bank_01',
      name: 'Dr. Asif Ali Channa (Lab Director)',
      email: 'ghotki.central@bloodconnect.pk',
      password: hashedPasswordBank,
      role: 'bloodbank',
      phone: '+92 300 1234567',
      city: 'Ghotki',
      bloodBankId: 'bb_ghotki_central',
      createdAt: new Date('2026-01-02T09:00:00Z').toISOString()
    },
    {
      _id: 'usr_bank_02',
      name: 'Dr. Noman Shaikh',
      email: 'citycare@bloodconnect.pk',
      password: hashedPasswordBank,
      role: 'bloodbank',
      phone: '+92 301 2345678',
      city: 'Mirpur Mathelo',
      bloodBankId: 'bb_city_care',
      createdAt: new Date('2026-01-03T10:00:00Z').toISOString()
    },
    {
      _id: 'usr_donor_01',
      name: 'Muhammad Bilal Kalhoro',
      email: 'donor.o@bloodconnect.pk',
      password: hashedPasswordDonor,
      role: 'donor',
      phone: '+92 300 7654321',
      city: 'Ghotki',
      bloodGroup: 'O+',
      age: 26,
      weight: 68,
      lastDonationDate: '2026-08-15',
      totalDonations: 4,
      createdAt: new Date('2026-01-10T11:00:00Z').toISOString()
    },
    {
      _id: 'usr_donor_02',
      name: 'Kashif Ahmed Lund',
      email: 'donor.b@bloodconnect.pk',
      password: hashedPasswordDonor,
      role: 'donor',
      phone: '+92 301 8765432',
      city: 'Ghotki',
      bloodGroup: 'B+',
      age: 29,
      weight: 72,
      lastDonationDate: '2026-07-20',
      totalDonations: 3,
      createdAt: new Date('2026-01-12T12:00:00Z').toISOString()
    },
    {
      _id: 'usr_donor_03',
      name: 'Farhan Qureshi',
      email: 'donor.a@bloodconnect.pk',
      password: hashedPasswordDonor,
      role: 'donor',
      phone: '+92 302 9876543',
      city: 'Mirpur Mathelo',
      bloodGroup: 'A+',
      age: 24,
      weight: 65,
      lastDonationDate: '2026-06-10',
      totalDonations: 2,
      createdAt: new Date('2026-01-14T14:00:00Z').toISOString()
    },
    {
      _id: 'usr_donor_04',
      name: 'Zeeshan Shah',
      email: 'donor.ab@bloodconnect.pk',
      password: hashedPasswordDonor,
      role: 'donor',
      phone: '+92 303 1239876',
      city: 'Daharki',
      bloodGroup: 'AB+',
      age: 31,
      weight: 75,
      lastDonationDate: '2026-05-18',
      totalDonations: 1,
      createdAt: new Date('2026-01-16T15:00:00Z').toISOString()
    },
    {
      _id: 'usr_recipient_01',
      name: 'Abdul Wahid Jamali',
      email: 'recipient1@bloodconnect.pk',
      password: hashedPasswordRecipient,
      role: 'recipient',
      phone: '+92 304 5551212',
      city: 'Ghotki',
      bloodGroup: 'O+',
      createdAt: new Date('2026-01-20T16:00:00Z').toISOString()
    },
    {
      _id: 'usr_recipient_02',
      name: 'Saima Parveen',
      email: 'recipient2@bloodconnect.pk',
      password: hashedPasswordRecipient,
      role: 'recipient',
      phone: '+92 305 6662323',
      city: 'Mirpur Mathelo',
      bloodGroup: 'B+',
      createdAt: new Date('2026-01-22T17:00:00Z').toISOString()
    }
  ];

  const bloodBanks = [
    {
      _id: 'bb_ghotki_central',
      name: 'Ghotki Central Blood Bank',
      licenseNumber: 'SBTP-SINDH-2024-GHK01',
      managerUserId: 'usr_bank_01',
      city: 'Ghotki',
      district: 'Ghotki',
      address: 'Opposite Civil Hospital, Station Road, Ghotki, Sindh',
      landmark: 'Opposite Civil Hospital Main Emergency Gate',
      phone: '+92 723 681234',
      emergencyPhone: '+92 300 1234567',
      whatsapp: '+923001234567',
      email: 'ghotki.central@bloodconnect.pk',
      status: 'verified',
      latitude: 28.0065,
      longitude: 69.3168,
      googleMapsUrl: 'https://maps.google.com/?q=28.0065,69.3168',
      operatingHours: '24/7 Emergency Blood Bank Services',
      facilities: [
        'Free Voluntary Blood Donation Desk',
        'Platelets & Component Separation',
        'Emergency Blood Transfusion Unit',
        'Free Screening (HIV, Hepatitis B/C, Syphilis, Malaria)',
        'Cold Chain Storage Backup'
      ],
      inventory: [
        { bloodGroup: 'O+', regularUnits: 12, freeUnits: 3 },
        { bloodGroup: 'B+', regularUnits: 10, freeUnits: 2 },
        { bloodGroup: 'A+', regularUnits: 8, freeUnits: 2 },
        { bloodGroup: 'AB+', regularUnits: 4, freeUnits: 1 },
        { bloodGroup: 'O-', regularUnits: 3, freeUnits: 1 },
        { bloodGroup: 'A-', regularUnits: 2, freeUnits: 0 },
        { bloodGroup: 'B-', regularUnits: 2, freeUnits: 0 },
        { bloodGroup: 'AB-', regularUnits: 1, freeUnits: 0 }
      ],
      createdAt: new Date('2026-01-02T09:00:00Z').toISOString()
    },
    {
      _id: 'bb_city_care',
      name: 'City Care Blood Center',
      licenseNumber: 'SBTP-SINDH-2024-GHK02',
      managerUserId: 'usr_bank_02',
      city: 'Mirpur Mathelo',
      district: 'Ghotki',
      address: 'THQ Hospital Road, Mirpur Mathelo Bypass, Ghotki District, Sindh',
      landmark: 'Near Mirpur Mathelo Bypass Chowk & THQ Hospital',
      phone: '+92 723 692345',
      emergencyPhone: '+92 301 2345678',
      whatsapp: '+923012345678',
      email: 'citycare@bloodconnect.pk',
      status: 'verified',
      latitude: 28.0228,
      longitude: 69.5489,
      googleMapsUrl: 'https://maps.google.com/?q=28.0228,69.5489',
      operatingHours: '8:00 AM - 10:00 PM (Emergency on Call)',
      facilities: [
        'Free Blood Allocation Wing',
        'Voluntary Donor Care Clinic',
        'Screening Laboratory',
        'Refrigerated Blood Vans'
      ],
      inventory: [
        { bloodGroup: 'O+', regularUnits: 8, freeUnits: 2 },
        { bloodGroup: 'B+', regularUnits: 6, freeUnits: 1 },
        { bloodGroup: 'A+', regularUnits: 5, freeUnits: 1 },
        { bloodGroup: 'AB+', regularUnits: 3, freeUnits: 0 },
        { bloodGroup: 'O-', regularUnits: 2, freeUnits: 0 },
        { bloodGroup: 'A-', regularUnits: 1, freeUnits: 0 },
        { bloodGroup: 'B-', regularUnits: 1, freeUnits: 0 },
        { bloodGroup: 'AB-', regularUnits: 1, freeUnits: 0 }
      ],
      createdAt: new Date('2026-01-03T10:00:00Z').toISOString()
    },
    {
      _id: 'bb_al_rehman',
      name: 'Al-Rehman Blood Bank',
      licenseNumber: 'SBTP-SINDH-2025-GHK03',
      managerUserId: 'usr_bank_03',
      city: 'Daharki',
      district: 'Ghotki',
      address: 'Main National Highway N-5, Daharki, Ghotki District, Sindh',
      landmark: 'Opposite Daharki Bus Terminal, National Highway N-5',
      phone: '+92 723 673456',
      emergencyPhone: '+92 302 3456789',
      whatsapp: '+923023456789',
      email: 'alrehman@bloodconnect.pk',
      status: 'verified',
      latitude: 28.0435,
      longitude: 69.7289,
      googleMapsUrl: 'https://maps.google.com/?q=28.0435,69.7289',
      operatingHours: '24 Hours Emergency Service',
      facilities: [
        'Free Thalassemia Patient Blood Support',
        'Whole Blood & Red Cells',
        'Verified Free Donation Register'
      ],
      inventory: [
        { bloodGroup: 'O+', regularUnits: 10, freeUnits: 1 },
        { bloodGroup: 'B+', regularUnits: 7, freeUnits: 2 },
        { bloodGroup: 'A+', regularUnits: 6, freeUnits: 1 },
        { bloodGroup: 'AB+', regularUnits: 2, freeUnits: 1 },
        { bloodGroup: 'O-', regularUnits: 1, freeUnits: 0 },
        { bloodGroup: 'A-', regularUnits: 2, freeUnits: 0 },
        { bloodGroup: 'B-', regularUnits: 1, freeUnits: 0 },
        { bloodGroup: 'AB-', regularUnits: 1, freeUnits: 0 }
      ],
      createdAt: new Date('2026-01-04T11:00:00Z').toISOString()
    },
    {
      _id: 'bb_sindh_welfare',
      name: 'Sindh Welfare Blood Foundation',
      licenseNumber: 'SBTP-APP-2026-9912',
      managerUserId: 'usr_bank_04',
      city: 'Khanpur Mahar',
      district: 'Ghotki',
      address: 'Shah Latif Chowk, Khanpur Mahar, Ghotki District, Sindh',
      landmark: 'Near Shah Latif Chowk & Rural Health Center',
      phone: '+92 723 655443',
      emergencyPhone: '+92 303 9998877',
      whatsapp: '+923039998877',
      email: 'welfare@sindhblood.pk',
      status: 'pending',
      latitude: 27.8420,
      longitude: 69.4120,
      googleMapsUrl: 'https://maps.google.com/?q=27.8420,69.4120',
      operatingHours: '9:00 AM - 6:00 PM',
      facilities: ['Community Blood Collection Center'],
      inventory: [
        { bloodGroup: 'O+', regularUnits: 4, freeUnits: 0 },
        { bloodGroup: 'B+', regularUnits: 3, freeUnits: 0 },
        { bloodGroup: 'A+', regularUnits: 2, freeUnits: 0 },
        { bloodGroup: 'AB+', regularUnits: 1, freeUnits: 0 },
        { bloodGroup: 'O-', regularUnits: 0, freeUnits: 0 },
        { bloodGroup: 'A-', regularUnits: 0, freeUnits: 0 },
        { bloodGroup: 'B-', regularUnits: 0, freeUnits: 0 },
        { bloodGroup: 'AB-', regularUnits: 0, freeUnits: 0 }
      ],
      createdAt: new Date('2026-02-01T12:00:00Z').toISOString()
    }
  ];

  const donations = [
    {
      _id: 'don_demo_01',
      donorId: 'usr_donor_01',
      donorName: 'Muhammad Bilal Kalhoro',
      donorPhone: '+92 300 7654321',
      bloodBankId: 'bb_ghotki_central',
      bloodBankName: 'Ghotki Central Blood Bank',
      bloodGroup: 'O+',
      units: 1,
      donationDate: '2026-11-04',
      slipNumber: 'GCBB-2026-904',
      status: 'pending',
      notes: 'Voluntary free donation. Verified medical screening at counter.',
      createdAt: new Date('2026-11-04T10:15:00Z').toISOString()
    },
    {
      _id: 'don_demo_02',
      donorId: 'usr_donor_02',
      donorName: 'Kashif Ahmed Lund',
      donorPhone: '+92 301 8765432',
      bloodBankId: 'bb_ghotki_central',
      bloodBankName: 'Ghotki Central Blood Bank',
      bloodGroup: 'B+',
      units: 1,
      donationDate: '2026-11-02',
      slipNumber: 'GCBB-2026-881',
      status: 'verified',
      verifiedBy: 'Dr. Asif Ali Channa',
      verificationDate: '2026-11-02T12:30:00Z',
      notes: 'Blood screened negative for all infectious markers. Added to free pool.',
      createdAt: new Date('2026-11-02T09:40:00Z').toISOString()
    },
    {
      _id: 'don_demo_03',
      donorId: 'usr_donor_03',
      donorName: 'Farhan Qureshi',
      donorPhone: '+92 302 9876543',
      bloodBankId: 'bb_city_care',
      bloodBankName: 'City Care Blood Center',
      bloodGroup: 'A+',
      units: 1,
      donationDate: '2026-11-01',
      slipNumber: 'CCBC-2026-442',
      status: 'verified',
      verifiedBy: 'Dr. Noman Shaikh',
      verificationDate: '2026-11-01T14:10:00Z',
      notes: 'Healthy voluntary donor. Ready in free emergency stock.',
      createdAt: new Date('2026-11-01T11:00:00Z').toISOString()
    },
    {
      _id: 'don_demo_04',
      donorId: 'usr_donor_04',
      donorName: 'Zeeshan Shah',
      donorPhone: '+92 303 1239876',
      bloodBankId: 'bb_al_rehman',
      bloodBankName: 'Al-Rehman Blood Bank',
      bloodGroup: 'AB+',
      units: 1,
      donationDate: '2026-10-28',
      slipNumber: 'ARBB-2026-309',
      status: 'verified',
      verifiedBy: 'Blood Bank Officer',
      verificationDate: '2026-10-28T16:00:00Z',
      notes: 'Verified and safe for patient transfer.',
      createdAt: new Date('2026-10-28T15:00:00Z').toISOString()
    }
  ];

  const freeClaims = [
    {
      _id: 'claim_demo_01',
      recipientId: 'usr_recipient_01',
      recipientName: 'Abdul Wahid Jamali',
      recipientPhone: '+92 304 5551212',
      bloodBankId: 'bb_ghotki_central',
      bloodBankName: 'Ghotki Central Blood Bank',
      bloodGroup: 'O+',
      unitsNeeded: 1,
      patientName: 'Imran Jamali',
      patientAge: 14,
      hospitalName: 'Civil Hospital Ghotki (Emergency Thalassemia Ward)',
      doctorName: 'Dr. Ghulam Rasool Mahar',
      doctorPrescription: 'Prescription Ref #CHG-THAL-7819 for routine transfusion',
      urgency: 'urgent',
      status: 'pending',
      allocationToken: 'BC-FREE-GHK-8801',
      bloodBankRemarks: '',
      createdAt: new Date('2026-11-05T08:30:00Z').toISOString()
    },
    {
      _id: 'claim_demo_02',
      recipientId: 'usr_recipient_02',
      recipientName: 'Saima Parveen',
      recipientPhone: '+92 305 6662323',
      bloodBankId: 'bb_city_care',
      bloodBankName: 'City Care Blood Center',
      bloodGroup: 'B+',
      unitsNeeded: 1,
      patientName: 'Khadija Bibi',
      patientAge: 42,
      hospitalName: 'THQ Hospital Mirpur Mathelo (Surgery OT)',
      doctorName: 'Dr. Naseer Ahmed',
      doctorPrescription: 'Emergency Laparotomy Cross-match required',
      urgency: 'critical',
      status: 'approved',
      allocationToken: 'BC-FREE-GHK-7729',
      bloodBankRemarks: 'Approved for free collection. Ready at counter with Bag #B-9921.',
      createdAt: new Date('2026-11-04T14:20:00Z').toISOString(),
      updatedAt: new Date('2026-11-04T15:10:00Z').toISOString()
    }
  ];

  const bloodRequests = [
    {
      _id: 'req_demo_01',
      recipientId: 'usr_recipient_01',
      recipientName: 'Abdul Wahid Jamali',
      recipientPhone: '+92 304 5551212',
      bloodGroup: 'O+',
      unitsNeeded: 2,
      patientName: 'Imran Jamali',
      hospitalName: 'Civil Hospital Ghotki',
      city: 'Ghotki',
      urgency: 'critical',
      status: 'open',
      description: 'Urgent requirement for Thalassemia minor patient at Civil Hospital Ghotki.',
      createdAt: new Date('2026-11-03T10:00:00Z').toISOString()
    },
    {
      _id: 'req_demo_02',
      recipientId: 'usr_recipient_02',
      recipientName: 'Saima Parveen',
      recipientPhone: '+92 305 6662323',
      bloodGroup: 'B+',
      unitsNeeded: 1,
      patientName: 'Khadija Bibi',
      hospitalName: 'THQ Hospital Mirpur Mathelo',
      city: 'Mirpur Mathelo',
      urgency: 'critical',
      status: 'open',
      description: 'Emergency cesarean section case. Attendants waiting outside OT.',
      createdAt: new Date('2026-11-04T12:00:00Z').toISOString()
    },
    {
      _id: 'req_demo_03',
      recipientId: 'usr_donor_03',
      recipientName: 'Farhan Qureshi',
      recipientPhone: '+92 302 9876543',
      bloodGroup: 'A+',
      unitsNeeded: 1,
      patientName: 'Rashid Ali',
      hospitalName: 'Al-Khidmat Hospital Daharki',
      city: 'Daharki',
      urgency: 'urgent',
      status: 'open',
      description: 'Road accident trauma patient needs A+ blood immediately.',
      createdAt: new Date('2026-11-04T16:00:00Z').toISOString()
    }
  ];

  // Aggregated historical demand numbers to match the prompt's table:
  // O+: 25 requests, 12 units available
  // B+: 18 requests, 10 units available
  // A+: 15 requests, 8 units available
  // AB+: 5 requests, 4 units available
  // O-: 8 requests, 3 units available
  // A-: 4 requests, 2 units available
  // B-: 5 requests, 2 units available
  // AB-: 3 requests, 1 unit available
  const demandStats = [
    { bloodGroup: 'O+', requests: 25, availableUnits: 12, freeUnits: 3 },
    { bloodGroup: 'B+', requests: 18, availableUnits: 10, freeUnits: 2 },
    { bloodGroup: 'A+', requests: 15, availableUnits: 8, freeUnits: 2 },
    { bloodGroup: 'AB+', requests: 5, availableUnits: 4, freeUnits: 1 },
    { bloodGroup: 'O-', requests: 8, availableUnits: 3, freeUnits: 1 },
    { bloodGroup: 'A-', requests: 4, availableUnits: 2, freeUnits: 0 },
    { bloodGroup: 'B-', requests: 5, availableUnits: 2, freeUnits: 0 },
    { bloodGroup: 'AB-', requests: 3, availableUnits: 1, freeUnits: 0 }
  ];

  return { users, bloodBanks, donations, freeClaims, bloodRequests, demandStats };
};
