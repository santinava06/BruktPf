import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Alarm as AlarmIcon,
  PrivacyTip as PrivacyIcon,
  BrightnessAuto as AutoIcon
} from '@mui/icons-material';
import { getUserSettings, updateUserSettings } from '../services/userSettings.js';

function Settings() {
  const [settings, setSettings] = useState({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar configuración al montar
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const response = await getUserSettings();
      setSettings(response.settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar configuración',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = async (newSettings) => {
    setSaving(true);
    try {
      const response = await updateUserSettings(newSettings);
      setSettings(response.settings);
      setSnackbar({
        open: true,
        message: 'Configuración actualizada correctamente',
        severity: 'success'
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Error al actualizar configuración',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configuración
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personaliza tu experiencia
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Tema */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Tema</Typography>
              </Box>
              <FormControl fullWidth disabled={saving}>
                <InputLabel>Tema de la aplicación</InputLabel>
                <Select
                  value={settings.theme}
                  label="Tema de la aplicación"
                  onChange={(e) => handleSettingsChange({ ...settings, theme: e.target.value })}
                >
                  <MenuItem value="light">Claro</MenuItem>
                  <MenuItem value="dark">Oscuro</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cambia entre tema claro y oscuro
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notificaciones */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Notificaciones</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications_enabled}
                    onChange={(e) => handleSettingsChange({ ...settings, notifications_enabled: e.target.checked })}
                    disabled={saving}
                  />
                }
                label="Habilitar notificaciones"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Recibe notificaciones sobre actividades en tus grupos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Idioma */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LanguageIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Idioma</Typography>
              </Box>
              <FormControl fullWidth disabled={saving}>
                <InputLabel>Idioma de la aplicación</InputLabel>
                <Select
                  value={settings.language}
                  label="Idioma de la aplicación"
                  onChange={(e) => handleSettingsChange({ ...settings, language: e.target.value })}
                >
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selecciona el idioma de la interfaz
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Moneda */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EuroIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Moneda</Typography>
              </Box>
              <FormControl fullWidth disabled={saving}>
                <InputLabel>Moneda por defecto</InputLabel>
                <Select
                  value={settings.currency}
                  label="Moneda por defecto"
                  onChange={(e) => handleSettingsChange({ ...settings, currency: e.target.value })}
                >
                  <MenuItem value="EUR">Euro (€)</MenuItem>
                  <MenuItem value="USD">Dólar estadounidense ($)</MenuItem>
                  <MenuItem value="GBP">Libra esterlina (£)</MenuItem>
                  <MenuItem value="MXN">Peso mexicano ($)</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Moneda para mostrar montos en la aplicación
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Formato de fecha */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CalendarIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Formato de Fecha</Typography>
              </Box>
              <FormControl fullWidth disabled={saving}>
                <InputLabel>Formato de fecha</InputLabel>
                <Select
                  value={settings.date_format}
                  label="Formato de fecha"
                  onChange={(e) => handleSettingsChange({ ...settings, date_format: e.target.value })}
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cómo se muestran las fechas en la aplicación
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tema automático */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AutoIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Tema Automático</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.auto_theme}
                    onChange={(e) => handleSettingsChange({ ...settings, auto_theme: e.target.checked })}
                    disabled={saving}
                  />
                }
                label="Seguir configuración del sistema"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cambiar automáticamente entre claro y oscuro según tu sistema
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notificaciones por email */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmailIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Notificaciones por Email</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.email_notifications}
                    onChange={(e) => handleSettingsChange({ ...settings, email_notifications: e.target.checked })}
                    disabled={saving}
                  />
                }
                label="Recibir emails de notificación"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Recibir notificaciones importantes por email
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recordatorios automáticos */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AlarmIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Recordatorios Automáticos</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.auto_reminders}
                    onChange={(e) => handleSettingsChange({ ...settings, auto_reminders: e.target.checked })}
                    disabled={saving}
                  />
                }
                label="Recordatorios de pagos pendientes"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Recibir recordatorios automáticos para pagos pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacidad */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PrivacyIcon sx={{ mr: 2, color: '#133A1A', fontSize: 28 }} />
                <Typography variant="h6">Privacidad</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy_show_email}
                    onChange={(e) => handleSettingsChange({ ...settings, privacy_show_email: e.target.checked })}
                    disabled={saving}
                  />
                }
                label="Mostrar email en grupos"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Permitir que otros miembros vean tu email en los grupos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Settings;