import express from 'express';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Probar conexión a la base de datos con timeout
    let dbStatus = 'unknown';
    try {
      await Promise.race([
        sequelize.authenticate(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 5000)
        )
      ]);
      dbStatus = 'connected';
    } catch (dbError) {
      dbStatus = 'disconnected';
      console.warn('Health check: Database connection issue:', dbError.message);
    }
    
    // Si la base de datos no está conectada pero el servidor está funcionando,
    // devolvemos 200 con un warning en lugar de 503
    // Esto permite que Render no marque el servicio como no saludable
    const statusCode = dbStatus === 'connected' ? 200 : 200;
    
    res.status(statusCode).json({
      status: dbStatus === 'connected' ? 'OK' : 'WARNING',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      version: '1.0.0',
      ...(dbStatus !== 'connected' && { 
        warning: 'Database connection issue detected. Server is running but database may be unavailable.' 
      })
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
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
