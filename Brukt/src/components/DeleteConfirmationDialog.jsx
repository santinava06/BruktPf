import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  IconButton
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';

function DeleteConfirmationDialog({ 
  open, 
  onClose, 
  onConfirm, 
  item, 
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que quieres eliminar este elemento?",
  confirmText = "Eliminar",
  cancelText = "Cancelar"
}) {
  const handleConfirm = () => {
    onConfirm(item);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          icon={<DeleteIcon />}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>
        </Alert>
        
        {item && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 1,
            border: '1px solid #e9ecef'
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Detalles del gasto:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {item.descripcion || 'Sin descripción'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Categoría: {item.categoria}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monto: ${item.monto}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fecha: {new Date(item.fecha).toLocaleDateString('es-ES')}
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            color: 'white !important'
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            bgcolor: '#d32f2f',
            color: 'white !important',
            '&:hover': {
              bgcolor: '#c62828',
              color: 'white !important'
            },
            '& .MuiButton-label': {
              color: 'white !important'
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmationDialog; 