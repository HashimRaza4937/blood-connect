import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import authRoutes from './routes/auth.js';
import bloodBankRoutes from './routes/bloodbanks.js';
import donationRoutes from './routes/donations.js';
import claimRoutes from './routes/claims.js';
import requestRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';
import { repository } from './db/repository.js';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Blood Connect API',
    location: 'Ghotki, Sindh, Pakistan',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bloodbanks', bloodBankRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

// Seed / Initial status endpoint
app.get('/api/seed-status', (req, res) => {
  res.json({
    success: true,
    message: 'Blood Connect repository initialized with Ghotki contest demo dataset',
    banksCount: repository.findBloodBanks().length,
    usersCount: repository.findUsers().length
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🩸 BLOOD CONNECT BACKEND API RUNNING ON PORT ${PORT}`);
  console.log(`📍 Initial Target Location: Ghotki, Sindh, Pakistan`);
  console.log(`🚀 Prototype Ready with Demo Role Switcher & Seed Data`);
  console.log(`=======================================================`);
});

export default app;
