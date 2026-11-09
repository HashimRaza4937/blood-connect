import express from 'express';
import bcrypt from 'bcryptjs';
import { repository } from '../db/repository.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role, phone, city, bloodGroup, age, weight } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role.' });
    }

    const existing = repository.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = repository.createUser({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role, // 'recipient', 'donor', 'bloodbank', 'admin'
      phone: phone || '',
      city: city || 'Ghotki',
      bloodGroup: bloodGroup || '',
      age: age ? Number(age) : null,
      weight: weight ? Number(weight) : null,
      totalDonations: 0
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = repository.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Current User Profile
router.get('/me', authenticate, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({
    success: true,
    user: userWithoutPassword
  });
});

// Demo Users List for Quick Role Switcher
router.get('/demo-users', (req, res) => {
  const allUsers = repository.findUsers();
  const demoList = [
    { role: 'admin', label: 'Master Admin', email: 'admin@bloodconnect.pk', name: 'Prof. Tariq Mahar (Admin)' },
    { role: 'bloodbank', label: 'Blood Bank Manager', email: 'ghotki.central@bloodconnect.pk', name: 'Dr. Asif Ali (Ghotki Central Bank)' },
    { role: 'donor', label: 'Voluntary Donor (O+)', email: 'donor.o@bloodconnect.pk', name: 'Muhammad Bilal Kalhoro (O+)' },
    { role: 'recipient', label: 'Blood Recipient', email: 'recipient1@bloodconnect.pk', name: 'Abdul Wahid Jamali (Civil Hospital)' }
  ];

  res.json({
    success: true,
    demoUsers: demoList
  });
});

// Demo Instant Switch / Login
router.post('/demo-login', (req, res) => {
  try {
    const { role, email } = req.body;
    let targetUser = null;

    if (email) {
      targetUser = repository.findUserByEmail(email);
    } else if (role) {
      const candidates = repository.findUsers({ role });
      targetUser = candidates[0];
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Demo user not found.' });
    }

    const token = generateToken(targetUser);
    const { password: _, ...userWithoutPassword } = targetUser;

    res.json({
      success: true,
      message: `Switched into ${targetUser.name} (${targetUser.role})`,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
