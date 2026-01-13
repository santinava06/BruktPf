import { Sequelize } from 'sequelize';

// Soporte para DATABASE_URL (Render, Heroku, etc.) y opciones comunes
// Render proporciona INTERNAL_DATABASE_URL para conexiones dentro de la misma región (más confiable)
const connectionString = process.env.INTERNAL_DATABASE_URL || process.env.DATABASE_URL;

const commonOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  // Opciones adicionales para mejor compatibilidad
  native: false,
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
};

let sequelize;
if (connectionString) {
  // Para Render y otros servicios en la nube
  // Detectar si es una conexión de Render
  const isRender = connectionString.includes('render.com') || 
                   connectionString.includes('onrender.com') ||
                   process.env.RENDER === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Solución al error SASL con Node.js 22: parsear URL y construir conexión explícitamente
  // El problema es que Sequelize/pg tiene problemas con SSL cuando se pasa la URL completa
  try {
    const url = new URL(connectionString);
    const dbName = url.pathname.slice(1); // Remover el '/' inicial
    const dbUser = url.username;
    const dbPassword = url.password;
    const dbHost = url.hostname;
    const dbPort = url.port || '5432';
    
    // Construir configuración explícita
    const config = {
      ...commonOptions,
      host: dbHost,
      port: parseInt(dbPort),
      database: dbName,
      username: dbUser,
      password: dbPassword,
      dialectOptions: {
        ssl: (isProduction || isRender) ? {
          require: true,
          rejectUnauthorized: false
        } : process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        } : undefined
      }
    };
    
    // Si no hay SSL, eliminar dialectOptions
    if (!config.dialectOptions.ssl) {
      delete config.dialectOptions;
    }
    
    sequelize = new Sequelize(dbName, dbUser, dbPassword, config);
  } catch (parseError) {
    // Si falla el parseo, usar el método original pero con configuración mejorada
    console.log('⚠️ No se pudo parsear la URL, usando método alternativo');
    const config = {
      ...commonOptions,
      dialectOptions: {
        ssl: (isProduction || isRender) ? {
          require: true,
          rejectUnauthorized: false
        } : process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        } : undefined
      }
    };
    
    if (!config.dialectOptions.ssl) {
      delete config.dialectOptions;
    }
    
    sequelize = new Sequelize(connectionString, config);
  }
} else {
  // Para conexiones locales o con variables individuales
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    ...commonOptions
  };
  
  // Agregar SSL solo si se especifica explícitamente
  if (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') {
    config.dialectOptions = {
      ssl: {
        require: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production',
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      }
    };
  }
  
  sequelize = new Sequelize(
    process.env.DB_NAME || 'finanzas_familiares',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    config
  );
}

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    if (connectionString) {
      console.log('📊 Base de datos: Conexión via DATABASE_URL');
    } else {
      console.log('📊 Base de datos: Local Development');
      console.log('🔗 Host:', process.env.DB_HOST);
      console.log('📋 Database:', process.env.DB_NAME);
    }
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    if (process.env.NODE_ENV === 'production') {
      console.log('1. Verifica que DATABASE_URL o INTERNAL_DATABASE_URL esté configurada');
      console.log('2. Si estás en Render, verifica que la base de datos esté activa');
      console.log('3. Verifica que las credenciales sean correctas');
      console.log('4. Intenta usar INTERNAL_DATABASE_URL en lugar de DATABASE_URL');
    } else {
      console.log('1. Verifica que Docker esté ejecutándose (si usas Docker)');
      console.log('2. Ejecuta: npm run db:start');
      console.log('3. Verifica que el contenedor o la instancia externa esté activa');
    }
    throw error;
  }
};

export { sequelize, testConnection };