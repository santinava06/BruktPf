import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  Snackbar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { fetchExpenses, deleteExpense } from '../services/expenses';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

// Lazy load components for better performance
const ExpenseForm = lazy(() => import('../components/ExpenseForm'));
const ExpenseTable = lazy(() => import('../components/ExpenseTable'));

// Loading component for lazy loaded components
const ComponentLoader = ({ message = "Cargando..." }) => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="200px"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, expense: null });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await fetchExpenses();
      
      // Ensure we always have a valid array
      let expensesArray = [];
      if (Array.isArray(data)) {
        expensesArray = data;
      } else if (data && Array.isArray(data.expenses)) {
        expensesArray = data.expenses;
      } else if (data && typeof data === 'object') {
        expensesArray = Object.values(data).filter(item => 
          item && typeof item === 'object' && item.monto !== undefined
        );
      }
      
      console.log('Loaded expenses:', expensesArray);
      setExpenses(expensesArray);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Error al cargar gastos');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Memoized stats calculation for better performance
  const stats = React.useMemo(() => {
    // Ensure expenses is always an array
    const expensesArray = Array.isArray(expenses) ? expenses : [];
    
    return {
      totalExpenses: expensesArray.reduce((sum, exp) => sum + (exp?.monto || 0), 0),
      averageExpense: expensesArray.length > 0 ? expensesArray.reduce((sum, exp) => sum + (exp?.monto || 0), 0) / expensesArray.length : 0,
      monthlyTotal: expensesArray.filter(exp => {
        if (!exp?.fecha) return false;
        const expenseDate = new Date(exp.fecha);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      }).reduce((sum, exp) => sum + (exp?.monto || 0), 0),
      expenseCount: expensesArray.length,
      monthlyExpenseCount: expensesArray.filter(exp => {
        if (!exp?.fecha) return false;
        const expenseDate = new Date(exp.fecha);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      }).length,
      topCategories: Object.entries(
        expensesArray.reduce((acc, exp) => {
          const category = exp?.categoria || 'Sin categoría';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {})
      )
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }))
    };
  }, [expenses]);

  const handleAddExpense = React.useCallback(async (expenseData) => {
    try {
      const newExpense = {
        id: Date.now(),
        ...expenseData,
        fecha: new Date().toISOString(),
        user_id: user?.id
      };
      setExpenses(prev => [newExpense, ...prev]);
      setShowForm(false);
      setSuccess('Gasto agregado exitosamente');
    } catch {
      setError('Error al agregar gasto');
    }
  }, [user?.id]);

  const handleDeleteExpense = React.useCallback(async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      setDeleteDialog({ open: false, expense: null });
      setSuccess('Gasto eliminado exitosamente');
    } catch {
      setError('Error al eliminar gasto');
    }
  }, []);

  const handleOpenDeleteDialog = React.useCallback((expense) => {
    setDeleteDialog({ open: true, expense });
  }, []);

  const handleCloseDeleteDialog = React.useCallback(() => {
    setDeleteDialog({ open: false, expense: null });
  }, []);

  useEffect(() => {
    loadExpenses();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ComponentLoader message="Cargando dashboard..." />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido, {user?.nombre || user?.email}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Gastos
                  </Typography>
                  <Typography variant="h4" component="div">
                    ${stats.totalExpenses.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Promedio
                  </Typography>
                  <Typography variant="h4" component="div">
                    ${stats.averageExpense.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Este Mes
                  </Typography>
                  <Typography variant="h4" component="div">
                    ${stats.monthlyTotal.toLocaleString()}
                  </Typography>
                </Box>
                <CalendarIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Gastos
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.expenseCount}
                  </Typography>
                </Box>
                <CategoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Categories */}
      {stats.topCategories.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Categorías Principales
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {stats.topCategories.map(({ category, count }) => (
                <Chip
                  key={category}
                  label={`${category} (${count})`}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
        >
          Agregar Gasto
        </Button>
      </Box>

      {/* Expense Form - Lazy Loaded */}
      {showForm && (
        <Suspense fallback={<ComponentLoader message="Cargando formulario..." />}>
          <ExpenseForm
            onSubmit={handleAddExpense}
            onCancel={() => setShowForm(false)}
          />
        </Suspense>
      )}

             {/* Expense Table - Lazy Loaded */}
               <Suspense fallback={<ComponentLoader message="Cargando tabla de gastos..." />}>
          <ExpenseTable
            gastos={Array.isArray(expenses) ? expenses : []}
            onDelete={handleOpenDeleteDialog}
          />
        </Suspense>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onClose={handleCloseDeleteDialog}
          onConfirm={() => handleDeleteExpense(deleteDialog.expense.id)}
          title="Eliminar gasto"
          message={`¿Estás seguro de que quieres eliminar el gasto "${deleteDialog.expense.descripcion}"?`}
        />
      )}

      {/* Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard; 