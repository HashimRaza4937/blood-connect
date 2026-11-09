import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { repository } from '../db/repository.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      bloodBankId: user.bloodBankId || null
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = repository.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token: User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token', error: error.message });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have access. Allowed: ${roles.join(', ')}`
      });
    }
    next();
  };
};
