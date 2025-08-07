import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  InputAdornment,
  MenuItem,
  Typography
} from '@mui/material';
import {
  AttachMoney,
  Description,
  Category,
  CalendarToday,
  Close
} from '@mui/icons-material';
import logo from '../assets/logoSinFondo.png';

const categories = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Vivienda',
  'Servicios',
  'Ropa',
  'Tecnología',
  'Otros'
];

function ExpenseForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    monto: initialData?.monto || '',
    descripcion: initialData?.descripcion || '',
    categoria: initialData?.categoria || '',
    fecha: initialData?.fecha ? new Date(initialData.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.monto || !formData.descripcion || !formData.categoria) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog 
      open={true} 
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 2,
              bgcolor: '#133A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                height: '24px',
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {initialData ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Monto"
            name="monto"
            type="number"
            value={formData.monto}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney sx={{ color: '#133A1A' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description sx={{ color: '#133A1A' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Categoría"
            name="categoria"
            select
            value={formData.categoria}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Category sx={{ color: '#133A1A' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday sx={{ color: '#133A1A' }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onCancel}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            color: 'white !important',

          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.monto || !formData.descripcion || !formData.categoria}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            bgcolor: '#133A1A',
            color: 'white !important',
            '&:hover': {
              bgcolor: '#1a4d2a',
              color: 'white !important'
            },
            '& .MuiButton-label': {
              color: 'white !important'
            }
          }}
        >
          {initialData ? 'Actualizar' : 'Agregar Gasto'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExpenseForm; 