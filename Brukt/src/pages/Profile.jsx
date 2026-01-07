import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Avatar,
    Grid,
    Divider,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: ''
    });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            // TODO: Implementar actualización de perfil
            setSuccess('Perfil actualizado exitosamente');
            setEditing(false);
        } catch (err) {
            setError('Error al actualizar el perfil');
        }
    };

    const handleCancel = () => {
        setFormData({
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            email: user.email || ''
        });
        setEditing(false);
    };

    const getInitials = () => {
        if (!user) return '?';
        const nombre = user.nombre || '';
        const apellido = user.apellido || '';
        return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" gap={3} mb={4}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                            fontWeight: 600
                        }}
                    >
                        {getInitials()}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                            Mi Perfil
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gestiona tu información personal
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

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

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            disabled={!editing}
                            InputProps={{
                                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            disabled={!editing}
                            InputProps={{
                                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={true}
                            InputProps={{
                                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                            helperText="El email no puede ser modificado"
                        />
                    </Grid>
                </Grid>

                <Box display="flex" gap={2} mt={4}>
                    {!editing ? (
                        <>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => setEditing(true)}
                                sx={{
                                    bgcolor: '#133A1A',
                                    '&:hover': { bgcolor: '#1a4d2a' }
                                }}
                            >
                                Editar Perfil
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                sx={{
                                    bgcolor: '#133A1A',
                                    '&:hover': { bgcolor: '#1a4d2a' }
                                }}
                            >
                                Guardar Cambios
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                sx={{ color: 'white !important' }}
                            >
                                Cancelar
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default Profile;
