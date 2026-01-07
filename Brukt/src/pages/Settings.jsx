import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Language as LanguageIcon,
    Security as SecurityIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getUserSettings, updateUserSettings } from '../services/settings';

function Settings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [settings, setSettings] = useState({
        notifications_email: true,
        notifications_new_expense: true,
        notifications_payment_received: true,
        notifications_debt_reminder: false,
        notifications_weekly_summary: false,
        currency: 'USD',
        date_format: 'DD/MM/YYYY',
        language: 'es',
        theme: 'auto'
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getUserSettings();
            setSettings(data);
        } catch (err) {
            console.error('Error loading settings:', err);
            setError('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings({
            ...settings,
            [field]: value
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            await updateUserSettings(settings);
            setSuccess('Configuración guardada exitosamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ color: 'white !important' }}
                >
                    Volver
                </Button>
            </Box>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                Configuración
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Personaliza tu experiencia en la aplicación
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Paper elevation={3} sx={{ borderRadius: 3 }}>
                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: 2
                    }}
                >
                    <Tab
                        icon={<NotificationsIcon />}
                        label="Notificaciones"
                        iconPosition="start"
                        sx={{ color: 'white !important' }}
                    />
                    <Tab
                        icon={<LanguageIcon />}
                        label="Moneda y Formato"
                        iconPosition="start"
                        sx={{ color: 'white !important' }}
                    />
                    <Tab
                        icon={<SecurityIcon />}
                        label="Privacidad"
                        iconPosition="start"
                        sx={{ color: 'white !important' }}
                    />
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ p: 4 }}>
                    {/* Notificaciones Tab */}
                    {activeTab === 0 && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                Preferencias de Notificaciones
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.notifications_email}
                                        onChange={(e) => handleChange('notifications_email', e.target.checked)}
                                        color="success"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Notificaciones por Email
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Recibir notificaciones en tu correo electrónico
                                        </Typography>
                                    </Box>
                                }
                                sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
                            />

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                Tipos de notificaciones:
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.notifications_new_expense}
                                        onChange={(e) => handleChange('notifications_new_expense', e.target.checked)}
                                        disabled={!settings.notifications_email}
                                        color="success"
                                    />
                                }
                                label="Nuevos gastos en mis grupos"
                                sx={{ mb: 1.5, display: 'block' }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.notifications_payment_received}
                                        onChange={(e) => handleChange('notifications_payment_received', e.target.checked)}
                                        disabled={!settings.notifications_email}
                                        color="success"
                                    />
                                }
                                label="Pagos recibidos"
                                sx={{ mb: 1.5, display: 'block' }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.notifications_debt_reminder}
                                        onChange={(e) => handleChange('notifications_debt_reminder', e.target.checked)}
                                        disabled={!settings.notifications_email}
                                        color="success"
                                    />
                                }
                                label="Recordatorios de deudas pendientes"
                                sx={{ mb: 1.5, display: 'block' }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.notifications_weekly_summary}
                                        onChange={(e) => handleChange('notifications_weekly_summary', e.target.checked)}
                                        disabled={!settings.notifications_email}
                                        color="success"
                                    />
                                }
                                label="Resumen semanal de actividad"
                                sx={{ mb: 1.5, display: 'block' }}
                            />
                        </Box>
                    )}

                    {/* Moneda y Formato Tab */}
                    {activeTab === 1 && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                Moneda y Formato
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Moneda Predeterminada</InputLabel>
                                        <Select
                                            value={settings.currency}
                                            label="Moneda Predeterminada"
                                            onChange={(e) => handleChange('currency', e.target.value)}
                                        >
                                            <MenuItem value="USD">🇺🇸 Dólar (USD)</MenuItem>
                                            <MenuItem value="EUR">🇪🇺 Euro (EUR)</MenuItem>
                                            <MenuItem value="ARS">🇦🇷 Peso Argentino (ARS)</MenuItem>
                                            <MenuItem value="MXN">🇲🇽 Peso Mexicano (MXN)</MenuItem>
                                            <MenuItem value="CLP">🇨🇱 Peso Chileno (CLP)</MenuItem>
                                            <MenuItem value="COP">🇨🇴 Peso Colombiano (COP)</MenuItem>
                                            <MenuItem value="BRL">🇧🇷 Real Brasileño (BRL)</MenuItem>
                                            <MenuItem value="GBP">🇬🇧 Libra Esterlina (GBP)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Formato de Fecha</InputLabel>
                                        <Select
                                            value={settings.date_format}
                                            label="Formato de Fecha"
                                            onChange={(e) => handleChange('date_format', e.target.value)}
                                        >
                                            <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</MenuItem>
                                            <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</MenuItem>
                                            <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Idioma</InputLabel>
                                        <Select
                                            value={settings.language}
                                            label="Idioma"
                                            onChange={(e) => handleChange('language', e.target.value)}
                                        >
                                            <MenuItem value="es">🇪🇸 Español</MenuItem>
                                            <MenuItem value="en">🇺🇸 English</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tema</InputLabel>
                                        <Select
                                            value={settings.theme}
                                            label="Tema"
                                            onChange={(e) => handleChange('theme', e.target.value)}
                                        >
                                            <MenuItem value="light">☀️ Claro</MenuItem>
                                            <MenuItem value="dark">🌙 Oscuro</MenuItem>
                                            <MenuItem value="auto">🔄 Automático</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Privacidad Tab */}
                    {activeTab === 2 && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                Privacidad y Seguridad
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                    Contraseña
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Mantén tu cuenta segura actualizando tu contraseña regularmente
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/change-password')}
                                    sx={{ color: 'white !important' }}
                                >
                                    Cambiar Contraseña
                                </Button>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1, color: 'error.main' }}>
                                    Zona de Peligro
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Eliminar tu cuenta es permanente y no se puede deshacer
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => {
                                        if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                                            alert('Funcionalidad de eliminación de cuenta pendiente de implementación');
                                        }
                                    }}
                                    sx={{ color: 'white !important' }}
                                >
                                    Eliminar Cuenta
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* Save Button */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                bgcolor: '#133A1A',
                                '&:hover': { bgcolor: '#1a4d2a' },
                                px: 4
                            }}
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Settings;
