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
    // Solución al error SASL: usar configuración SSL más simple o deshabilitarla si es necesario
    const config = {
      ...commonOptions,
      host: dbHost,
      port: parseInt(dbPort),
      database: dbName,
      username: dbUser,
      password: dbPassword
    };
    
    // Configurar SSL solo si no está explícitamente deshabilitado
    // El error SASL puede resolverse deshabilitando SSL o usando una configuración más simple
    if (process.env.DB_SSL !== 'false' && (isProduction || isRender)) {
      // Intentar con SSL primero, pero con configuración mínima
      config.dialectOptions = {
        ssl: process.env.DB_SSL_MODE === 'disable' ? false : {
          require: true,
          rejectUnauthorized: false
        }
      };
      
      // Si DB_SSL_MODE está en 'disable', no agregar dialectOptions
      if (process.env.DB_SSL_MODE === 'disable') {
        delete config.dialectOptions;
      }
    } else if (process.env.DB_SSL === 'true') {
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        }
      };
    }
    
    console.log(`🔧 Configurando conexión a: ${dbHost}:${dbPort}/${dbName}`);
    console.log(`🔒 SSL: ${config.dialectOptions?.ssl ? (config.dialectOptions.ssl === false ? 'disabled' : 'enabled') : 'not configured'}`);
    
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
    console.log('🔍 Intentando conectar a PostgreSQL...');
    if (connectionString) {
      const url = new URL(connectionString);
      console.log(`📊 Host: ${url.hostname}:${url.port || '5432'}`);
      console.log(`📋 Database: ${url.pathname.slice(1)}`);
      console.log(`👤 User: ${url.username}`);
    }
    
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    if (connectionString) {
      const source = process.env.INTERNAL_DATABASE_URL ? 'INTERNAL_DATABASE_URL' : 'DATABASE_URL';
      console.log(`📊 Base de datos: Conexión via ${source}`);
    } else {
      console.log('📊 Base de datos: Local Development');
      console.log('🔗 Host:', process.env.DB_HOST);
      console.log('📋 Database:', process.env.DB_NAME);
    }
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    console.error('❌ Error completo:', error.name);
    if (error.parent) {
      console.error('❌ Error padre:', error.parent.message);
    }
    console.log('');
    console.log('🔧 Posibles soluciones:');
    if (process.env.NODE_ENV === 'production') {
      console.log('1. Verifica que DATABASE_URL o INTERNAL_DATABASE_URL esté configurada');
      console.log('2. Si estás en Render, verifica que la base de datos esté activa');
      console.log('3. Verifica que las credenciales sean correctas');
      console.log('4. Intenta usar INTERNAL_DATABASE_URL en lugar de DATABASE_URL');
      console.log('5. Si el error es SASL, intenta agregar: DB_SSL_MODE=disable (temporalmente)');
      console.log('6. Verifica que NODE_VERSION=20.18.0 esté configurado');
    } else {
      console.log('1. Verifica que Docker esté ejecutándose (si usas Docker)');
      console.log('2. Ejecuta: npm run db:start');
      console.log('3. Verifica que el contenedor o la instancia externa esté activa');
    }
    throw error;
  }
};

export { sequelize, testConnection };