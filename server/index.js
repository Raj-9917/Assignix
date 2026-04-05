import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import Problem from './models/Problem.js';
import User from './models/User.js';
import Course from './models/Course.js';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'assignix'
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://assignix.web.app',
    'https://assignix.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/search', searchRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Assignix API is running...');
});

const seedDatabase = async () => {
  try {
    // ONLY seed Admin if no users exist
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('--- INITIALIZING SYSTEM ADMIN ---');
      const systemAdmin = {
          name: 'System Admin',
          username: 'admin',
          email: 'admin@assignix.com',
          password: 'admin123', // Still keeping for fallback, but Firebase Auth will be primary
          role: 'admin'
      };
      await User.create(systemAdmin);
      console.log('Admin account created: admin@assignix.com');
    }
  } catch (err) {
    console.error('System Initialization Error:', err);
  }
};

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    try {
      console.log('Attempting persistent MongoDB connection...');
      // Set a 5-second timeout for the initial connection attempt
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`Connected to Persistent MongoDB: ${mongoUri.includes('atlas') ? 'Atlas Cluster' : 'Local Instance'}`);
    } catch (dbErr) {
      console.warn('REDUNDANT SYSTEM ALERT: Persistent connection failed. Initializing In-Memory Fallback.');
      const mongoMemory = await MongoMemoryServer.create();
      mongoUri = mongoMemory.getUri();
      await mongoose.connect(mongoUri);
      console.log('IN-MEMORY FALLBACK ACTIVE: Admin login and platform features restored.');
    }

    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('CRITICAL SERVER STARTUP ERROR:', err);
  }
};


startServer();

