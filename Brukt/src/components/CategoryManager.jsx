import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    Tab,
    Tabs,
    Paper,
    Divider,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Restaurant,
    DirectionsCar,
    Home,
    FlashOn,
    SportsEsports,
    LocalHospital,
    Checkroom,
    School,
    CardGiftcard,
    Category,
    Pets,
    Flight,
    ShoppingBag,
    Work,
    FitnessCenter,
    LocalBar,
    LocalCafe,
    Build,
    Commute,
    AccountBalance
} from '@mui/icons-material';
import { useCategories } from '../context/CategoryContext';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

// Mapa de iconos disponibles
const ICON_MAP = {
    Restaurant,
    DirectionsCar,
    Home,
    FlashOn,
    SportsEsports,
    LocalHospital,
    Checkroom,
    School,
    CardGiftcard,
    Category,
    Pets,
    Flight,
    ShoppingBag,
    Work,
    FitnessCenter,
    LocalBar,
    LocalCafe,
    Build,
    Commute,
    AccountBalance
};

const COLORS = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#9e9e9e', '#607d8b'
];

function CategoryManager({ open, onClose }) {
    const { categories, addCategory, editCategory, removeCategory } = useCategories();
    const [tab, setTab] = useState(0);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', icon: 'Category', color: '#607d8b' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, categoryId: null });
    const [error, setError] = useState('');

    const handleOpenForm = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, icon: category.icon, color: category.color });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', icon: 'Category', color: '#607d8b' });
        }
        setIsFormOpen(true);
        setError('');
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingCategory(null);
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('El nombre es requerido');
            return;
        }

        try {
            if (editingCategory) {
                await editCategory(editingCategory.id, formData);
            } else {
                await addCategory(formData);
            }
            handleCloseForm();
        } catch (err) {
            setError('Error al guardar la categoría');
        }
    };

    const handleDelete = async () => {
        try {
            await removeCategory(deleteDialog.categoryId);
            setDeleteDialog({ open: false, categoryId: null });
        } catch (err) {
            // Manejar error (probablemente categoría en uso)
            console.error(err);
        }
    };

    // Filtrar categorías (Globales vs Personales)
    // Asumimos que si user_id es null es global, si tiene ID es personal
    // El backend devuelve user_id o null.
    const personalCategories = categories.filter(c => c.user_id !== null);
    const globalCategories = categories.filter(c => c.user_id === null);

    const getIconComponent = (iconName) => {
        const Icon = ICON_MAP[iconName] || Category;
        return <Icon />;
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Gestión de Categorías</DialogTitle>
                <DialogContent>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
                        <Tab label="Mis Categorías" />
                        <Tab label="Predeterminadas" />
                    </Tabs>

                    {tab === 0 && (
                        <Box>
                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                onClick={() => handleOpenForm()}
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                Nueva Categoría
                            </Button>

                            <List>
                                {personalCategories.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                                        No tienes categorías personalizadas
                                    </Typography>
                                ) : (
                                    personalCategories.map(category => (
                                        <ListItem key={category.id}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: category.color }}>
                                                    {getIconComponent(category.icon)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={category.name} />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" onClick={() => handleOpenForm(category)} sx={{ mr: 1 }}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton edge="end" color="error" onClick={() => setDeleteDialog({ open: true, categoryId: category.id })}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </Box>
                    )}

                    {tab === 1 && (
                        <List>
                            {globalCategories.map(category => (
                                <ListItem key={category.id}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: category.color }}>
                                            {getIconComponent(category.icon)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={category.name} secondary="Predeterminada" />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="xs" fullWidth>
                <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mb: 3 }}
                    />

                    <Typography variant="subtitle2" gutterBottom>Color</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {COLORS.map(color => (
                            <Box
                                key={color}
                                onClick={() => setFormData({ ...formData, color })}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: color,
                                    cursor: 'pointer',
                                    border: formData.color === color ? '3px solid #000' : '1px solid transparent',
                                    opacity: formData.color === color ? 1 : 0.7
                                }}
                            />
                        ))}
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>Icono</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
                        {Object.keys(ICON_MAP).map(iconName => {
                            const Icon = ICON_MAP[iconName];
                            return (
                                <IconButton
                                    key={iconName}
                                    onClick={() => setFormData({ ...formData, icon: iconName })}
                                    sx={{
                                        bgcolor: formData.icon === iconName ? 'action.selected' : 'transparent',
                                        border: formData.icon === iconName ? `2px solid ${formData.color}` : 'none'
                                    }}
                                >
                                    <Icon />
                                </IconButton>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, categoryId: null })}
                onConfirm={handleDelete}
                title="Eliminar categoría"
                content="¿Estás seguro de que quieres eliminar esta categoría? Los gastos asociados podrían quedar sin categoría."
            />
        </>
    );
}

export default CategoryManager;
