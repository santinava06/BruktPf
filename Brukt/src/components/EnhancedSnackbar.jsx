import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Componente mejorado de Snackbar con mejor UX
 */
function EnhancedSnackbar({ 
  open, 
  message, 
  severity = 'info', 
  onClose, 
  autoHideDuration = 4000,
  action = null,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' }
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{
        '& .MuiSnackbarContent-root': {
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ 
          width: '100%',
          borderRadius: 2,
          '& .MuiAlert-icon': {
            fontSize: 24
          },
          '& .MuiAlert-message': {
            fontSize: '0.95rem',
            fontWeight: 500
          }
        }}
        action={
          action || (
            <IconButton
              size="small"
              aria-label="Cerrar"
              color="inherit"
              onClick={onClose}
              sx={{ ml: 1 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default EnhancedSnackbar;

