import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import User from './models/user.js';
import router from './routes/index.js';
import { syncDatabase } from './config/initDatabase.js';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

// Configuración de variables de entorno
dotenv.config();

// Fallback para variables de Google OAuth si dotenv no funciona
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

if (GOOGLE_CLIENT_ID) {
  console.log('GOOGLE_CLIENT_ID length:', GOOGLE_CLIENT_ID.length);
  console.log('GOOGLE_CLIENT_ID type:', typeof GOOGLE_CLIENT_ID);
} else {
  console.warn('⚠️ Advertencia: GOOGLE_CLIENT_ID no configurado');
}

// Configuración de Passport con credenciales de Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario existente por google_id
        let user = await User.findOne({ where: { google_id: profile.id } });

        if (user) {
          // Usuario ya existe, actualizar información si es necesario
          return done(null, user);
        }

        // Buscar usuario por email
        const existingUser = await User.findOne({ where: { email: profile.emails[0].value } });

        if (existingUser) {
          // Usuario existe con este email, vincular cuenta de Google
          existingUser.google_id = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }

        // Crear nuevo usuario
        const names = profile.displayName.split(' ');
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';

        user = await User.create({
          nombre: firstName,
          apellido: lastName,
          email: profile.emails[0].value,
          google_id: profile.id,
          password: Math.random().toString(36), // Password dummy, no se usará
          username: null // Se puede generar después si es necesario
        });

        return done(null, user);
      } catch (error) {
        console.error('Error en estrategia Google OAuth:', error);
        return done(error, null);
      }
    }
  )
);

// Serialización para sesiones
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const app = express();

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:5432'];

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

// Configuración de sesiones para Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'supersecretkey123456789',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // En desarrollo, false; en producción, true con HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

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

const PORT = process.env.PORT || 3000;
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