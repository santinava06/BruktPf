import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Category' // Icono por defecto de MUI
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#757575' // Gris por defecto
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Null para categorías globales
        references: {
            model: 'users',
            key: 'id'
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'categories',
    timestamps: true,
    underscored: true // Usa snake_case para columnas automáticas (created_at)
});

export default Category;
