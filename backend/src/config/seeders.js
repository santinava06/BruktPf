import Category from '../models/category.js';

const DEFAULT_CATEGORIES = [
    { name: 'Comida', icon: 'Restaurant', color: '#ff9800' },
    { name: 'Transporte', icon: 'DirectionsCar', color: '#2196f3' },
    { name: 'Casa', icon: 'Home', color: '#4caf50' },
    { name: 'Servicios', icon: 'FlashOn', color: '#ffeb3b' },
    { name: 'Ocio', icon: 'SportsEsports', color: '#9c27b0' },
    { name: 'Salud', icon: 'LocalHospital', color: '#f44336' },
    { name: 'Ropa', icon: 'Checkroom', color: '#e91e63' },
    { name: 'Educación', icon: 'School', color: '#3f51b5' },
    { name: 'Regalos', icon: 'CardGiftcard', color: '#795548' },
    { name: 'Otros', icon: 'Category', color: '#607d8b' }
];

export const seedCategories = async () => {
    try {
        const count = await Category.count({ where: { user_id: null, is_active: true } });

        if (count === 0) {
            console.log('🌱 Sembrando categorías por defecto...');
            await Category.bulkCreate(DEFAULT_CATEGORIES);
            console.log('✅ Categorías por defecto creadas');
        } else {
            console.log('ℹ️ Las categorías por defecto ya existen');
        }
    } catch (error) {
        console.error('❌ Error al sembrar categorías:', error);
    }
};
