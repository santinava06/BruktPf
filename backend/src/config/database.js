import { Sequelize } from 'sequelize';

// Soporte para DATABASE_URL (Render, Supabase, etc.)
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
  native: false,
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
};

let sequelize;

if (connectionString) {
  // === PRODUCCIÓN (Render + Supabase usando DATABASE_URL) ===
  sequelize = new Sequelize(connectionString, {
    ...commonOptions,
    family: 4, // 👈 Fuerza IPv4 (soluciona ENETUNREACH en Render)
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      keepalives: 1,
      keepalivesIdle: 30000,
      statement_timeout: 30000,
      supportBigNumbers: true,
      bigNumberStrings: true
    }
  });
} else {
  // === DESARROLLO LOCAL ===
  sequelize = new Sequelize(
    process.env.DB_NAME || 'finanzas_familiares',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      ...commonOptions,
      family: 4 // 👈 Fuerza IPv4 también en local
    }
  );
}

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');

    if (connectionString) {
      console.log('📊 Base de datos: Supabase (via DATABASE_URL)');
    } else {
      console.log('📊 Base de datos: Desarrollo local');
      console.log('🔗 Host:', process.env.DB_HOST);
      console.log('📋 Database:', process.env.DB_NAME);
    }
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('1. Verificar que Supabase esté activo');
    console.log('2. Verificar DATABASE_URL en Render');
    console.log('3. Revisar SSL habilitado');
    console.log('4. Confirmar que Render no use IPv6');
    throw error;
  }
};

export { sequelize, testConnection };
