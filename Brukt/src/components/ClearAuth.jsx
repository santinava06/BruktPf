import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Paper } from '@mui/material';

function ClearAuth() {
  const navigate = useNavigate();

  const clearAuth = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Force redirect to login
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: '#133A1A' }}>
          🔧 Fix Authentication Issue
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Your current authentication token is invalid. Click the button below to clear it and log in again.
        </Typography>
        <Button
          variant="contained"
          onClick={clearAuth}
          sx={{
            bgcolor: '#133A1A',
            '&:hover': {
              bgcolor: '#1a4d2a'
            }
          }}
        >
          Clear Auth & Go to Login
        </Button>
      </Paper>
    </Box>
  );
}

export default ClearAuth; 