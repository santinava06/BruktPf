import UserSettings from '../models/userSettings.js';

// Obtener configuración del usuario
export const getUserSettings = async (req, res) => {
    try {
        const userId = req.user.userId;

        let settings = await UserSettings.findOne({
            where: { user_id: userId }
        });

        // Si no existe configuración, crear una con valores por defecto
        if (!settings) {
            settings = await UserSettings.create({
                user_id: userId
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Error getting user settings:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
};

// Actualizar configuración del usuario
export const updateUserSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            notifications_email,
            notifications_new_expense,
            notifications_payment_received,
            notifications_debt_reminder,
            notifications_weekly_summary,
            currency,
            date_format,
            language,
            theme
        } = req.body;

        let settings = await UserSettings.findOne({
            where: { user_id: userId }
        });

        if (!settings) {
            // Crear si no existe
            settings = await UserSettings.create({
                user_id: userId,
                notifications_email,
                notifications_new_expense,
                notifications_payment_received,
                notifications_debt_reminder,
                notifications_weekly_summary,
                currency,
                date_format,
                language,
                theme
            });
        } else {
            // Actualizar existente
            await settings.update({
                notifications_email,
                notifications_new_expense,
                notifications_payment_received,
                notifications_debt_reminder,
                notifications_weekly_summary,
                currency,
                date_format,
                language,
                theme
            });
        }

        res.json({
            message: 'Configuración actualizada exitosamente',
            settings
        });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
};
