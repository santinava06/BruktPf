import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'expense_groups',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity_type: { // 'EXPENSE', 'PAYMENT', 'GROUP', 'MEMBER'
        type: DataTypes.STRING,
        allowNull: true
    },
    entity_id: { // ID del gasto, pago, etc.
        type: DataTypes.INTEGER,
        allowNull: true
    },
    details: {
        type: DataTypes.JSONB, // Usamos JSONB para Postgres
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'activity_audit_logs',
    timestamps: true,
    updatedAt: false, // Solo necesitamos saber cuándo se creó
    underscored: true
});

export default ActivityLog;
