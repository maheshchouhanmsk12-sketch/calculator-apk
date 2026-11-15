import express from 'express';
import mongoose from 'mongoose';
import AppMetadata from '../models/AppMetadata.js';

const router = express.Router();

// GET /api/health - Returns API health and MongoDB connection status
router.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: states[dbState] || 'unknown',
      connected: dbState === 1,
    },
    version: '1.0.0',
  };

  res.status(200).json(status);
});

// GET /api/info - Returns system metadata and features
router.get('/info', async (req, res) => {
  try {
    let metadata = null;
    if (mongoose.connection.readyState === 1) {
      metadata = await AppMetadata.findOne().sort({ updatedAt: -1 });
    }

    res.status(200).json({
      name: 'Instant Percentage Calculator API',
      description: 'Client-side high-precision percentage calculation engine with MERN architecture',
      architecture: {
        calculationEngine: 'Client-side React with arbitrary precision (zero latency)',
        database: 'MongoDB with Mongoose',
        server: 'Express.js on Node.js',
      },
      metadata: metadata || {
        appName: 'Instant Percentage Calculator',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
