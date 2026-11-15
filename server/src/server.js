import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';
import AppMetadata from './models/AppMetadata.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Static client build serving for production/unified deployment
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Fallback API root route
  app.get('/', (req, res) => {
    res.json({
      message: 'Instant Percentage Calculator API is operational.',
      endpoints: {
        health: '/api/health',
        info: '/api/info',
      },
    });
  });
}

// Initialize server
const startServer = async () => {
  // Connect to MongoDB
  const conn = await connectDB();
  if (conn) {
    try {
      await AppMetadata.findOneAndUpdate(
        { appName: 'Instant Percentage Calculator' },
        { lastStarted: new Date(), version: '1.0.0' },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('Could not update AppMetadata:', e.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`[Express] Backend server running on http://localhost:${PORT}`);
    console.log(`[Express] Health check available at http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nGracefully shutting down...');
    server.close(async () => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
