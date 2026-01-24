import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

console.log('🔍 Probando conexión a Supabase...');
console.log('=====================================');

// Mostrar configuración (sin mostrar password)
console.log('📊 Configuración:');
console.log('Host:', process.env.DB_HOST || '[NO CONFIGURADO]');
console.log('Port:', process.env.DB_PORT || '[NO CONFIGURADO]');
console.log('Database:', process.env.DB_NAME || '[NO CONFIGURADO]');
console.log('User:', process.env.DB_USER || '[NO CONFIGURADO]');
console.log('Password:', process.env.DB_PASSWORD ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
console.log('');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'postgres',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

async function testConnection() {
  try {
    console.log('🔗 Conectando a Supabase...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa!');
    
    // Probar una consulta simple
    console.log('🔍 Probando consulta...');
    const result = await sequelize.query('SELECT version()');
    console.log('📊 Versión de PostgreSQL:', result[0][0].version);
    
    // Probar si las tablas existen
    console.log('🔍 Verificando tablas...');
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    if (tables[0].length === 0) {
      console.log('   ⚠️  No se encontraron tablas');
      console.log('   💡 Ejecuta: npm run db:sync');
    } else {
      tables[0].forEach(table => {
        console.log(`   ✅ ${table.table_name}`);
      });
    }
    
    console.log('');
    console.log('🎉 ¡Conexión a Supabase configurada correctamente!');
    
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('');
    console.error('🔧 Diagnóstico:');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('- El servidor rechaza la conexión');
      console.error('- Posible: Host incorrecto o proyecto inactivo');
    } else if (error.message.includes('authentication')) {
      console.error('- Error de autenticación');
      console.error('- Posible: Usuario o contraseña incorrectos');
    } else if (error.message.includes('SSL')) {
      console.error('- Error de SSL');
      console.error('- Posible: Configuración SSL incorrecta');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('- No se puede resolver el host');
      console.error('- Posible: URL de Supabase incorrecta');
    } else {
      console.error('- Error desconocido');
      console.error('- Revisa la configuración de Supabase');
    }
    
    console.error('');
    console.error('📋 Pasos para verificar:');
    console.error('1. Ve a https://supabase.com/dashboard');
    console.error('2. Selecciona tu proyecto');
    console.error('3. Ve a Settings → Database');
    console.error('4. Verifica que el proyecto esté activo');
    console.error('5. Copia el connection string exacto');
    console.error('6. Verifica las variables de entorno en .env');
    
  } finally {
    await sequelize.close();
    console.log('');
    console.log('🔗 Conexión cerrada');
  }
}

testConnection();
