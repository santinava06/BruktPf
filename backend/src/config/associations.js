import User from '../models/user.js';
import ExpenseGroup from '../models/ExpenseGroup.js';
import GroupMember from '../models/GroupMember.js';
import GroupExpense from '../models/GroupExpense.js';
import GroupInvitation from '../models/GroupInvitation.js';
import DebtPayment from '../models/DebtPayment.js';
import UserSettings from '../models/UserSettings.js';
import Friendship from '../models/Friendship.js';

export const setupAssociations = () => {
  // Usuario puede tener una configuración
  User.hasOne(UserSettings, {
    foreignKey: 'user_id',
    as: 'settings'
  });
  UserSettings.belongsTo(User, {
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

  // Amistades (Friendships)
  User.hasMany(Friendship, {
    foreignKey: 'user_id',
    as: 'sentRequests'
  });
  Friendship.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'requester'
  });

  User.hasMany(Friendship, {
    foreignKey: 'friend_id',
    as: 'receivedRequests'
  });
  Friendship.belongsTo(User, {
    foreignKey: 'friend_id',
    as: 'receiver'
  });

  // Asociación de muchos a muchos para amigos aceptados
  User.belongsToMany(User, {
    through: Friendship,
    as: 'friends',
    foreignKey: 'user_id',
    otherKey: 'friend_id',
    where: { status: 'accepted' }
  });

  console.log('✅ Asociaciones configuradas correctamente');
}; 