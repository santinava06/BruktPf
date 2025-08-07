import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { getGroupDetails, getGroupExpenses, addGroupExpense } from '../services/groups';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

function GroupExpenses() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, expense: null });
  const [newExpense, setNewExpense] = useState({
    monto: '',
    categoria: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const categorias = [
    'Alimentación',
    'Vivienda',
    'Transporte',
    'Servicios',
    'Entretenimiento',
    'Salud',
    'Otros',
  ];

  const loadGroupData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [groupData, expensesData] = await Promise.all([
        getGroupDetails(groupId),
        getGroupExpenses(groupId)
      ]);
      
      setGroup(groupData);
      // Asegurar que expensesData sea siempre un array
      const expensesArray = Array.isArray(expensesData) ? expensesData : [];
      console.log('📊 Expenses cargados:', expensesArray);
      setExpenses(expensesArray);
    } catch (err) {
      console.error('Error loading group data:', err);
      setError('Error al cargar datos del grupo');
      setExpenses([]); // Asegurar que expenses sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  const handleAddExpense = async () => {
    try {
      const expense = await addGroupExpense(groupId, newExpense);
      setExpenses([expense, ...expenses]);
      setAddDialog(false);
      setNewExpense({
        monto: '',
        categoria: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      setSuccess('Gasto agregado exitosamente');
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Error al agregar gasto');
    }
  };

  const handleDeleteExpense = async (expense) => {
    try {
      // Aquí iría la llamada a la API para eliminar el gasto
      // await deleteGroupExpense(groupId, expense.id);
      setExpenses(expenses.filter(exp => exp.id !== expense.id));
      setSuccess('Gasto eliminado correctamente');
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Error al eliminar gasto');
    }
  };

  const handleDeleteClick = (expense) => {
    setDeleteDialog({ open: true, expense });
  };

  const handleDeleteConfirm = (expense) => {
    handleDeleteExpense(expense);
    setDeleteDialog({ open: false, expense: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, expense: null });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">Grupo no encontrado</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/groups')}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" gutterBottom>
            {group.nombre}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {group.descripcion || 'Sin descripción'}
          </Typography>
        </Box>
      </Box>

      {/* Botón agregar gasto */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ color: '#133A1A', fontWeight: 600 }}>
          Gastos del Grupo ({expenses.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialog(true)}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
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
          Agregar Gasto
        </Button>
      </Box>

      {/* Tabla de gastos */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#133A1A'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(19, 58, 26, 0.05)' }}>
                          <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Fecha</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Categoría</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Descripción</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Pagado por</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Monto</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!Array.isArray(expenses) || expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {!Array.isArray(expenses) ? 'Error: datos no válidos' : 'No hay gastos registrados en este grupo'}
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow 
                  key={expense.id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'rgba(19, 58, 26, 0.05)' 
                    },
                    transition: 'background-color 0.2s ease-in-out'
                  }}
                >
                  <TableCell>{expense.fecha}</TableCell>
                  <TableCell>
                    <Chip 
                      label={expense.categoria} 
                      size="small"
                      sx={{ 
                        bgcolor: '#133A1A',
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </TableCell>
                  <TableCell>{expense.descripcion}</TableCell>
                  <TableCell>{expense.paid_by_email || 'Usuario desconocido'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    ${expense.monto}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(expense)}
                      sx={{ 
                        color: '#d32f2f',
                        '&:hover': {
                          bgcolor: 'rgba(211, 47, 47, 0.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog agregar gasto */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Gasto al Grupo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Monto"
                type="number"
                fullWidth
                value={newExpense.monto}
                onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Categoría"
                fullWidth
                value={newExpense.categoria}
                onChange={(e) => setNewExpense({ ...newExpense, categoria: e.target.value })}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                value={newExpense.descripcion}
                onChange={(e) => setNewExpense({ ...newExpense, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Fecha"
                type="date"
                fullWidth
                value={newExpense.fecha}
                onChange={(e) => setNewExpense({ ...newExpense, fecha: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddDialog(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddExpense}
            variant="contained"
            disabled={!newExpense.monto || !newExpense.categoria || !newExpense.fecha}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
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
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Dialog de confirmación para eliminar */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        item={deleteDialog.expense}
        title="Eliminar gasto del grupo"
        message="¿Estás seguro de que quieres eliminar este gasto del grupo?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </Container>
  );
}

export default GroupExpenses; 