import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/index.js';
import { syncDatabase } from './config/initDatabase.js';

// Configuración de variables de entorno
dotenv.config();

const app = express();

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 CORS Debug:');
    console.log('Origin recibido:', origin);
    console.log('Origins permitidos:', allowedOrigins);
    
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ Origin permitido');
      callback(null, true);
    } else {
      console.log('❌ Origin NO permitido');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};
app.use(cors(corsOptions));

app.use(express.json());

// Registrar rutas con prefijo /api
app.use('/api', router);

// Rutas base de ejemplo
app.get('/', (req, res) => {
  res.send('API Finanzas Familiares - PostgreSQL');
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;

// Inicializar la aplicación
const startServer = async () => {
  try {
    // Sincronizar la base de datos
    await syncDatabase();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
      console.log(`📊 Base de datos: PostgreSQL`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📋 APIs disponibles en: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 