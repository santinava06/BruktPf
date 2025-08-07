import { Sequelize } from 'sequelize';

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'finanzas_familiares',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
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
    // SSL solo para producción (Supabase)
    ...(process.env.NODE_ENV === 'production' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    console.log('📊 Base de datos: Local Development');
    console.log('🔗 Host:', process.env.DB_HOST);
    console.log('📋 Database:', process.env.DB_NAME);
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('1. Verifica que Docker esté ejecutándose');
    console.log('2. Ejecuta: npm run db:start');
    console.log('3. Verifica que el contenedor esté activo');
    throw error;
  }
};

export { sequelize, testConnection }; 