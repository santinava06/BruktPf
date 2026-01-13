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
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

// Patrones de dominios permitidos (para Vercel, Netlify, etc.)
const allowedPatterns = [
  /^https:\/\/.*\.vercel\.app$/,  // Todos los dominios de Vercel
  /^https:\/\/.*\.netlify\.app$/,  // Todos los dominios de Netlify
  /^https:\/\/.*\.onrender\.com$/, // Todos los dominios de Render
];

const corsOptions = {
  origin: function (origin, callback) {
    // Logs en desarrollo y producción (para debug de CORS)
    console.log('🔍 CORS Debug:');
    console.log('Origin recibido:', origin);
    console.log('Origins permitidos:', allowedOrigins);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Permitir requests sin origin (como mobile apps, Postman, o health checks de Render)
    if (!origin) {
      console.log('✅ Request sin origin permitido (health check, mobile app, etc.)');
      return callback(null, true);
    }

    // Verificar si el origin está en la lista explícita
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ Origin permitido (lista explícita):', origin);
      callback(null, true);
      return;
    }

    // Verificar si el origin coincide con algún patrón permitido
    const matchesPattern = allowedPatterns.some(pattern => pattern.test(origin));
    if (matchesPattern) {
      console.log('✅ Origin permitido (patrón):', origin);
      callback(null, true);
      return;
    }

    // Origin no permitido
    console.log('❌ Origin NO permitido:', origin);
    console.log('💡 Agrega este origen a ALLOWED_ORIGINS o verifica los patrones permitidos');
    callback(new Error(`CORS: Origin '${origin}' no permitido`));
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
const HOST = process.env.HOST || '0.0.0.0';

// Inicializar la aplicación
const startServer = async () => {
  try {
    // Sincronizar la base de datos (con manejo de errores mejorado)
    try {
      await syncDatabase();
    } catch (dbError) {
      console.error('⚠️ Advertencia: Error al sincronizar la base de datos:', dbError.message);
      console.log('🔄 El servidor continuará iniciándose. Verifica la conexión a la base de datos.');
      // En producción, no detenemos el servidor si hay un error de DB
      // para permitir que Render pueda hacer health checks
      if (process.env.NODE_ENV === 'production') {
        console.log('📝 Nota: En producción, asegúrate de que la base de datos esté configurada correctamente.');
      }
    }

    // Iniciar el servidor en todas las interfaces de red (necesario para Render)
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
      console.log(`🌐 Escuchando en: ${HOST}:${PORT}`);
      console.log(`📊 Base de datos: PostgreSQL`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`🔗 URL de producción activa`);
      } else {
        console.log(`🔗 URL: http://localhost:${PORT}`);
      }
      console.log(`📋 APIs disponibles en: /api`);
    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 