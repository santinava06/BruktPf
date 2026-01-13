import { Sequelize } from 'sequelize';

// Soporte para DATABASE_URL (Render, Heroku, etc.) y opciones comunes
// Render proporciona INTERNAL_DATABASE_URL para conexiones dentro de la misma región (más confiable)
// Prioridad: Variables individuales > INTERNAL_DATABASE_URL > DATABASE_URL
const hasIndividualVars = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;
const connectionString = !hasIndividualVars ? (process.env.INTERNAL_DATABASE_URL || process.env.DATABASE_URL) : null;

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

// Si tenemos variables individuales, usarlas primero (más confiable y evita problemas de parseo)
if (hasIndividualVars) {
  console.log('🔍 Usando variables individuales de base de datos');
  const config = {
    ...commonOptions,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  };
  
  // Configurar SSL para producción
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = process.env.DB_HOST?.includes('render.com') || 
                   process.env.DB_HOST?.includes('onrender.com') ||
                   process.env.RENDER === 'true';
  
  if (process.env.DB_SSL_MODE === 'disable') {
    console.log('🔒 SSL deshabilitado por DB_SSL_MODE=disable');
  } else if (process.env.DB_SSL !== 'false' && (isProduction || isRender)) {
    console.log('🔒 Configurando SSL con rejectUnauthorized: false');
    config.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
  } else if (process.env.DB_SSL === 'true') {
    config.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      }
    };
  }
  
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    config
  );
  console.log('✅ Sequelize configurado con variables individuales');
} else if (connectionString) {
  // Para Render y otros servicios en la nube
  // Detectar si es una conexión de Render
  const isRender = connectionString.includes('render.com') || 
                   connectionString.includes('onrender.com') ||
                   process.env.RENDER === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Solución al error SASL: parsear URL y construir conexión explícitamente
  // El problema es que Sequelize/pg tiene problemas con SSL cuando se pasa la URL completa
  console.log('🔍 Procesando conexión a la base de datos...');
  console.log(`📋 Usando: ${process.env.INTERNAL_DATABASE_URL ? 'INTERNAL_DATABASE_URL' : 'DATABASE_URL'}`);
  
  try {
    const url = new URL(connectionString);
    const dbName = url.pathname.slice(1); // Remover el '/' inicial
    const dbUser = decodeURIComponent(url.username);
    const dbPassword = decodeURIComponent(url.password);
    const dbHost = url.hostname;
    const dbPort = url.port || '5432';
    
    console.log(`🔧 Parseando URL de conexión:`);
    console.log(`   Host: ${dbHost}`);
    console.log(`   Port: ${dbPort}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${dbUser}`);
    
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
    
    // Configurar SSL - probar sin SSL primero si DB_SSL_MODE=disable
    if (process.env.DB_SSL_MODE === 'disable') {
      console.log('🔒 SSL deshabilitado por DB_SSL_MODE=disable');
      // No agregar dialectOptions para SSL
    } else if (process.env.DB_SSL !== 'false' && (isProduction || isRender)) {
      // Intentar con SSL pero con configuración mínima que evita el error SASL
      console.log('🔒 Configurando SSL con rejectUnauthorized: false');
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      };
    } else if (process.env.DB_SSL === 'true') {
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        }
      };
    }
    
    sequelize = new Sequelize(dbName, dbUser, dbPassword, config);
    console.log('✅ Sequelize configurado con parámetros explícitos');
  } catch (parseError) {
    // Si falla el parseo, usar el método original pero con configuración mejorada
    console.log('⚠️ No se pudo parsear la URL, usando método alternativo');
    console.log('⚠️ Error de parseo:', parseError.message);
    
    const config = {
      ...commonOptions
    };
    
    // Solo agregar SSL si no está deshabilitado
    if (process.env.DB_SSL_MODE !== 'disable' && (isProduction || isRender)) {
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      };
    } else if (process.env.DB_SSL === 'true') {
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        }
      };
    }
    
    sequelize = new Sequelize(connectionString, config);
    console.log('✅ Sequelize configurado con URL completa');
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
    if (hasIndividualVars) {
      console.log(`📊 Host: ${process.env.DB_HOST}:${process.env.DB_PORT || '5432'}`);
      console.log(`📋 Database: ${process.env.DB_NAME}`);
      console.log(`👤 User: ${process.env.DB_USER}`);
    } else if (connectionString) {
      try {
        const url = new URL(connectionString);
        console.log(`📊 Host: ${url.hostname}:${url.port || '5432'}`);
        console.log(`📋 Database: ${url.pathname.slice(1)}`);
        console.log(`👤 User: ${url.username}`);
      } catch (e) {
        console.log('📊 Usando DATABASE_URL (no parseable)');
      }
    }
    
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    if (hasIndividualVars) {
      console.log('📊 Base de datos: Conexión via variables individuales (DB_HOST, DB_USER, etc.)');
    } else if (connectionString) {
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