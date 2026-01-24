import { sequelize, testConnection } from './database.js';
import { setupAssociations } from './associations.js';

// Función para sincronizar todos los modelos
const syncDatabase = async () => {
  try {
    // Probar conexión
    await testConnection();

    // Configurar asociaciones
    setupAssociations();

    // Sincronizar todos los modelos (sin forzar recreación)
    await sequelize.sync({ force: false, alter: true });

    console.log('✅ Base de datos sincronizada correctamente');
    console.log('📊 Tablas creadas:');
    console.log('   - users');
    console.log('   - user_settings');
    console.log('   - expense_groups');
    console.log('   - group_expenses');
    console.log('   - debt_payments');
    console.log('   - friendships');

  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

// Función para cerrar la conexión
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
  }
};

export { syncDatabase, closeConnection }; 