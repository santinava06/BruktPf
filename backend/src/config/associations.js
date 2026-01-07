import User from '../models/user.js';
import Expense from '../models/expense.js';
import ExpenseGroup from '../models/ExpenseGroup.js';
import GroupMember from '../models/GroupMember.js';
import GroupExpense from '../models/GroupExpense.js';
import GroupInvitation from '../models/GroupInvitation.js';
import DebtPayment from '../models/DebtPayment.js';
import Category from '../models/category.js';
import ActivityLog from '../models/activityLog.js';
import UserSettings from '../models/userSettings.js';

export const setupAssociations = () => {
  // Usuario puede tener muchas categorías personalizadas
  User.hasMany(Category, {
    foreignKey: 'user_id',
    as: 'categories'
  });
  Category.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Usuario puede tener muchos gastos personales
  User.hasMany(Expense, {
    foreignKey: 'user_id',
    as: 'expenses'
  });
  Expense.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Usuario puede crear muchos grupos
  User.hasMany(ExpenseGroup, {
    foreignKey: 'creator_id',
    as: 'createdGroups'
  });
  ExpenseGroup.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'creator'
  });

  // Usuario puede ser miembro de muchos grupos
  User.hasMany(GroupMember, {
    foreignKey: 'user_id',
    as: 'groupMemberships'
  });
  GroupMember.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Grupo puede tener muchos miembros
  ExpenseGroup.hasMany(GroupMember, {
    foreignKey: 'group_id',
    as: 'members'
  });
  GroupMember.belongsTo(ExpenseGroup, {
    foreignKey: 'group_id',
    as: 'group'
  });

  // Usuario puede tener muchos gastos de grupo
  User.hasMany(GroupExpense, {
    foreignKey: 'payer_id',
    as: 'paidGroupExpenses'
  });
  GroupExpense.belongsTo(User, {
    foreignKey: 'payer_id',
    as: 'payer'
  });

  // Grupo puede tener muchos gastos
  ExpenseGroup.hasMany(GroupExpense, {
    foreignKey: 'group_id',
    as: 'expenses'
  });
  GroupExpense.belongsTo(ExpenseGroup, {
    foreignKey: 'group_id',
    as: 'group'
  });

  // Usuario puede recibir muchas invitaciones
  User.hasMany(GroupInvitation, {
    foreignKey: 'invited_user_id',
    as: 'receivedInvitations'
  });
  GroupInvitation.belongsTo(User, {
    foreignKey: 'invited_user_id',
    as: 'invitedUser'
  });

  // Usuario puede enviar muchas invitaciones
  User.hasMany(GroupInvitation, {
    foreignKey: 'invited_by_user_id',
    as: 'sentInvitations'
  });
  GroupInvitation.belongsTo(User, {
    foreignKey: 'invited_by_user_id',
    as: 'invitedByUser'
  });

  // Grupo puede tener muchas invitaciones
  ExpenseGroup.hasMany(GroupInvitation, {
    foreignKey: 'group_id',
    as: 'invitations'
  });
  GroupInvitation.belongsTo(ExpenseGroup, {
    foreignKey: 'group_id',
    as: 'group'
  });

  // Usuario puede hacer muchos pagos de deuda
  User.hasMany(DebtPayment, {
    foreignKey: 'payer_id',
    as: 'debtPaymentsMade'
  });
  DebtPayment.belongsTo(User, {
    foreignKey: 'payer_id',
    as: 'payer'
  });

  // Usuario puede recibir muchos pagos de deuda
  User.hasMany(DebtPayment, {
    foreignKey: 'receiver_id',
    as: 'debtPaymentsReceived'
  });
  DebtPayment.belongsTo(User, {
    foreignKey: 'receiver_id',
    as: 'receiver'
  });

  // Grupo puede tener muchos pagos de deuda
  ExpenseGroup.hasMany(DebtPayment, {
    foreignKey: 'group_id',
    as: 'debtPayments'
  });
  DebtPayment.belongsTo(ExpenseGroup, {
    foreignKey: 'group_id',
    as: 'group'
  });

  // Asociaciones para ActivityLog
  User.hasMany(ActivityLog, {
    foreignKey: 'user_id',
    as: 'activities'
  });
  ActivityLog.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  ExpenseGroup.hasMany(ActivityLog, {
    foreignKey: 'group_id',
    as: 'activityLogs'
  });
  ActivityLog.belongsTo(ExpenseGroup, {
    foreignKey: 'group_id',
    as: 'group'
  });

  // Asociación User - UserSettings (1:1)
  User.hasOne(UserSettings, {
    foreignKey: 'user_id',
    as: 'settings'
  });
  UserSettings.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  console.log('✅ Asociaciones configuradas correctamente');
}; 