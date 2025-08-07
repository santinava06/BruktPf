import express from 'express';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Probar conexión a la base de datos
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

export default router;
