import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserSettings = sequelize.define('UserSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Notificaciones
    notifications_email: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notifications_new_expense: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notifications_payment_received: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notifications_debt_reminder: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    notifications_weekly_summary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Formato y visualización
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'USD',
        validate: {
            isIn: [['USD', 'EUR', 'ARS', 'MXN', 'CLP', 'COP', 'BRL', 'GBP']]
        }
    },
    date_format: {
        type: DataTypes.STRING(20),
        defaultValue: 'DD/MM/YYYY',
        validate: {
            isIn: [['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']]
        }
    },
    language: {
        type: DataTypes.STRING(5),
        defaultValue: 'es',
        validate: {
            isIn: [['es', 'en']]
        }
    },
    theme: {
        type: DataTypes.STRING(10),
        defaultValue: 'auto',
        validate: {
            isIn: [['light', 'dark', 'auto']]
        }
    }
}, {
    tableName: 'user_settings',
    timestamps: true,
    underscored: true
});

export default UserSettings;
