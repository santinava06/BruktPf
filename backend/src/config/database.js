import { Sequelize } from 'sequelize';

// Soporte para DATABASE_URL (Render, Heroku, etc.) y opciones comunes
const connectionString = process.env.DATABASE_URL;

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
  sequelize = new Sequelize(connectionString, {
    ...commonOptions,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false,
        sslmode: 'require'
      } : false,
      // Configuración adicional para conexiones SSL
      keepalives: 1,
      keepalivesIdle: 30000,
      statement_timeout: 30000,
      // Deshabilitar SCRAM si hay problemas
      supportBigNumbers: true,
      bigNumberStrings: true
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'finanzas_familiares',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      ...commonOptions
    }
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
    console.log('1. Verifica que Docker esté ejecutándose (si usas Docker)');
    console.log('2. Ejecuta: npm run db:start');
    console.log('3. Verifica que el contenedor o la instancia externa esté activa');
    throw error;
  }
};

export { sequelize, testConnection };