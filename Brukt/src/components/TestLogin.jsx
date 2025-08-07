import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/auth';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';

function TestLogin() {
  const { login: authLogin } = useAuth();
  const [credentials, setCredentials] = useState({
    email: 'test2@test.com',
    password: 'password123'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(credentials.email, credentials.password);
      authLogin(data.token, data.user);
      setSuccess('Login exitoso!');
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Test Login
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth>
            Login
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Credenciales de prueba:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: test2@test.com
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Password: password123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default TestLogin; 