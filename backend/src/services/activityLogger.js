import ActivityLog from '../models/activityLog.js';

/**
 * Registra una actividad en el historial
 * @param {Object} params - Parámetros del log
 * @param {number} params.userId - ID del usuario que realiza la acción
 * @param {number} params.groupId - ID del grupo donde ocurre la acción
 * @param {string} params.actionType - Tipo de acción (CREATE_EXPENSE, CTEATE_PAYMENT, etc.)
 * @param {string} [params.entityType] - Tipo de entidad afectada (EXPENSE, PAYMENT, GROUP)
 * @param {number} [params.entityId] - ID de la entidad afectada
 * @param {Object} [params.details] - Detalles adicionales en JSON
 */
export const logActivity = async ({
    userId,
    groupId,
    actionType,
    entityType = null,
    entityId = null,
    details = {}
}) => {
    try {
        await ActivityLog.create({
            user_id: userId,
            group_id: groupId,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            details
        });
        console.log(`📝 Actividad registrada: ${actionType} por usuario ${userId} en grupo ${groupId}`);
    } catch (error) {
        // No queremos que un error de log bloquee la operación principal, solo lo reportamos
        console.error('❌ Error al registrar actividad:', error);
    }
};
