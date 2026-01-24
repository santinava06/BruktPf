import UserSettings from '../models/UserSettings.js';

// Obtener configuración del usuario
export const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    let settings = await UserSettings.findOne({
      where: { user_id: userId }
    });

    // Si no existe, crear con valores por defecto
    if (!settings) {
      settings = await UserSettings.create({
        user_id: userId,
        theme: 'light',
        notifications_enabled: true,
        language: 'es',
        currency: 'EUR',
        date_format: 'DD/MM/YYYY',
        email_notifications: false,
        auto_reminders: true,
        privacy_show_email: false,
        auto_theme: false
      });
    }

    res.json({
      settings: {
        theme: settings.theme,
        notifications_enabled: settings.notifications_enabled,
        language: settings.language,
        currency: settings.currency,
        date_format: settings.date_format,
        email_notifications: settings.email_notifications,
        auto_reminders: settings.auto_reminders,
        privacy_show_email: settings.privacy_show_email,
        auto_theme: settings.auto_theme
      }
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar configuración del usuario
export const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      theme,
      notifications_enabled,
      language,
      currency,
      date_format,
      email_notifications,
      auto_reminders,
      privacy_show_email,
      auto_theme
    } = req.body;

    // Validar valores
    const validThemes = ['light', 'dark'];
    const validLanguages = ['es', 'en'];
    const validCurrencies = ['EUR', 'USD', 'GBP', 'MXN'];
    const validDateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({ error: 'Tema inválido' });
    }

    if (language && !validLanguages.includes(language)) {
      return res.status(400).json({ error: 'Idioma inválido' });
    }

    if (currency && !validCurrencies.includes(currency)) {
      return res.status(400).json({ error: 'Moneda inválida' });
    }

    if (date_format && !validDateFormats.includes(date_format)) {
      return res.status(400).json({ error: 'Formato de fecha inválido' });
    }

    let settings = await UserSettings.findOne({
      where: { user_id: userId }
    });

    if (!settings) {
      settings = await UserSettings.create({
        user_id: userId,
        theme: theme || 'light',
        notifications_enabled: notifications_enabled !== undefined ? notifications_enabled : true,
        language: language || 'es',
        currency: currency || 'EUR',
        date_format: date_format || 'DD/MM/YYYY',
        email_notifications: email_notifications !== undefined ? email_notifications : false,
        auto_reminders: auto_reminders !== undefined ? auto_reminders : true,
        privacy_show_email: privacy_show_email !== undefined ? privacy_show_email : false,
        auto_theme: auto_theme !== undefined ? auto_theme : false
      });
    } else {
      await settings.update({
        theme: theme !== undefined ? theme : settings.theme,
        notifications_enabled: notifications_enabled !== undefined ? notifications_enabled : settings.notifications_enabled,
        language: language !== undefined ? language : settings.language,
        currency: currency !== undefined ? currency : settings.currency,
        date_format: date_format !== undefined ? date_format : settings.date_format,
        email_notifications: email_notifications !== undefined ? email_notifications : settings.email_notifications,
        auto_reminders: auto_reminders !== undefined ? auto_reminders : settings.auto_reminders,
        privacy_show_email: privacy_show_email !== undefined ? privacy_show_email : settings.privacy_show_email,
        auto_theme: auto_theme !== undefined ? auto_theme : settings.auto_theme
      });
    }

    res.json({
      message: 'Configuración actualizada correctamente',
      settings: {
        theme: settings.theme,
        notifications_enabled: settings.notifications_enabled,
        language: settings.language,
        currency: settings.currency,
        date_format: settings.date_format,
        email_notifications: settings.email_notifications,
        auto_reminders: settings.auto_reminders,
        privacy_show_email: settings.privacy_show_email,
        auto_theme: settings.auto_theme
      }
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};