import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { fetchExpenses } from '../services/expenses';
import logo from '../assets/logoSinFondo.png';

function Reportes() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await fetchExpenses();
      const expensesArray = Array.isArray(data) ? data : (data.expenses || []);
      setExpenses(expensesArray);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Error al cargar gastos');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredExpenses = () => {
    if (!expenses.length) return [];

    const now = new Date();
    let startDate, endDate;

    switch (filterType) {
      case 'week':
        const weekStart = new Date(now.getFullYear(), 0, 1 + (selectedWeek - 1) * 7);
        startDate = new Date(weekStart);
        endDate = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0);
        break;
      case 'year':
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31);
        break;
      default:
        return expenses;
    }

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.fecha + 'T00:00:00');
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  // Calcular estadísticas
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.monto || 0), 0);
  const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;
  const expenseCount = filteredExpenses.length;

  // Categoría más gastada
  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    acc[exp.categoria] = (acc[exp.categoria] || 0) + (exp.monto || 0);
    return acc;
  }, {});
  const topCategory = Object.keys(categoryTotals).length > 0 
    ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b)
    : 'N/A';

  const getFilterLabel = () => {
    switch (filterType) {
      case 'week':
        return `Semana ${selectedWeek} del ${selectedYear}`;
      case 'month':
        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${monthNames[selectedMonth]} ${selectedYear}`;
      case 'year':
        return `Año ${selectedYear}`;
      default:
        return 'Todos los gastos';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            color: '#133A1A',
            mb: 1
          }}
        >
          Reportes
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Analiza y controla tus gastos
        </Typography>
      </Box>

      {/* Filtros */}
      <Card 
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#133A1A',
          bgcolor: 'background.paper'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
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
            <AssessmentIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros de Reporte
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo de filtro</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Tipo de filtro"
              >
                <MenuItem value="week">Semanal</MenuItem>
                <MenuItem value="month">Mensual</MenuItem>
                <MenuItem value="year">Anual</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Año"
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              inputProps={{ min: 2020, max: new Date().getFullYear() }}
            />
          </Grid>

          {filterType === 'month' && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Mes</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Mes"
                >
                  <MenuItem value={0}>Enero</MenuItem>
                  <MenuItem value={1}>Febrero</MenuItem>
                  <MenuItem value={2}>Marzo</MenuItem>
                  <MenuItem value={3}>Abril</MenuItem>
                  <MenuItem value={4}>Mayo</MenuItem>
                  <MenuItem value={5}>Junio</MenuItem>
                  <MenuItem value={6}>Julio</MenuItem>
                  <MenuItem value={7}>Agosto</MenuItem>
                  <MenuItem value={8}>Septiembre</MenuItem>
                  <MenuItem value={9}>Octubre</MenuItem>
                  <MenuItem value={10}>Noviembre</MenuItem>
                  <MenuItem value={11}>Diciembre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {filterType === 'week' && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Semana"
                type="number"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                inputProps={{ min: 1, max: 52 }}
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Chip 
            label={getFilterLabel()} 
            sx={{ 
              bgcolor: '#133A1A',
              color: 'white',
              fontWeight: 600
            }}
          />
        </Box>
      </Card>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: '#133A1A',
              bgcolor: 'background.paper',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(19, 58, 26, 0.15)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  bgcolor: '#133A1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <AccountBalanceIcon sx={{ color: 'white', fontSize: 30 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#133A1A', mb: 1 }}>
                ${totalAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total gastado
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: '#133A1A',
              bgcolor: 'background.paper',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(19, 58, 26, 0.15)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  bgcolor: '#133A1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <TrendingUpIcon sx={{ color: 'white', fontSize: 30 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#133A1A', mb: 1 }}>
                ${averageAmount.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Promedio por gasto
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: '#133A1A',
              bgcolor: 'background.paper',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(19, 58, 26, 0.15)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  bgcolor: '#133A1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <CategoryIcon sx={{ color: 'white', fontSize: 30 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#133A1A', mb: 1 }}>
                {expenseCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total gastos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: '#133A1A',
              bgcolor: 'background.paper',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(19, 58, 26, 0.15)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  bgcolor: '#133A1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <CalendarIcon sx={{ color: 'white', fontSize: 30 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#133A1A', mb: 1 }}>
                {topCategory}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categoría más gastada
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Estado vacío */}
      {filteredExpenses.length === 0 && !loading && (
        <Card 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 3,
            border: '2px dashed',
            borderColor: '#133A1A',
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
            No hay gastos en el período seleccionado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta cambiar los filtros o agregar gastos
          </Typography>
        </Card>
      )}

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Reportes; 