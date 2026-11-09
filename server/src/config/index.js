import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodconnect',
  jwtSecret: process.env.JWT_SECRET || 'bloodconnect_contest_demo_secret_2026_supersecure',
  nodeEnv: process.env.NODE_ENV || 'development'
};
