import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const GroupInvitation = sequelize.define('GroupInvitation', {
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
  invited_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  invited_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  fecha_invitacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_respuesta: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'group_invitations',
  timestamps: true,
  createdAt: 'fecha_invitacion',
  updatedAt: 'updated_at'
});

export default GroupInvitation; 