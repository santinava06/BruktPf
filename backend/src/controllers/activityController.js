import ActivityLog from '../models/activityLog.js';
import User from '../models/user.js';

export const getGroupActivity = async (req, res) => {
    try {
        const { groupId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const activity = await ActivityLog.findAndCountAll({
            where: { group_id: groupId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'nombre', 'email']
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            data: activity.rows,
            meta: {
                total: activity.count,
                page,
                limit,
                totalPages: Math.ceil(activity.count / limit)
            }
        });
    } catch (error) {
        console.error('Error getting group activity:', error);
        res.status(500).json({ error: 'Error al obtener historial de actividad' });
    }
};
