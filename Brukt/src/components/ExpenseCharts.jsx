import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { EmptyAnalysis } from './EmptyState';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useCategories } from '../context/CategoryContext';
import {
  TrendingUp,
  AccountBalanceWallet,
  CalendarToday,
  Category as CategoryIcon
} from '@mui/icons-material';

const DEFAULT_COLORS = ['#133A1A', '#1a4d2a', '#22c55e', '#4ade80', '#86efac', '#10b981', '#059669', '#047857'];

function ExpenseCharts({ expenses = [] }) {
  const { categories } = useCategories();
  const [timeRange, setTimeRange] = useState('ALL'); // 1M, 3M, 6M, ALL

  // Filtrar gastos por rango de tiempo
  const filteredExpenses = useMemo(() => {
    if (timeRange === 'ALL') return expenses;

    const now = new Date();
    const cutoffDate = new Date();

    if (timeRange === '1M') cutoffDate.setMonth(now.getMonth() - 1);
    if (timeRange === '3M') cutoffDate.setMonth(now.getMonth() - 3);
    if (timeRange === '6M') cutoffDate.setMonth(now.getMonth() - 6);

    return expenses.filter(e => new Date(e.fecha) >= cutoffDate);
  }, [expenses, timeRange]);

  // Obtener color de categoría
  const getCategoryColor = (categoryName, index) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + Number(e.monto || 0), 0);
    const count = filteredExpenses.length;
    const avg = count > 0 ? total / count : 0;

    // Gasto máximo
    const maxExpense = filteredExpenses.reduce((max, e) =>
      Number(e.monto) > max ? Number(e.monto) : max
      , 0);

    // Días únicos con gastos
    const uniqueDays = new Set(filteredExpenses.map(e => e.fecha?.split('T')[0])).size;
    const dailyAvg = uniqueDays > 0 ? total / uniqueDays : 0;

    return { total, count, avg, maxExpense, dailyAvg, uniqueDays };
  }, [filteredExpenses]);

  // Datos de categorías
  const categoryData = useMemo(() => {
    const totals = filteredExpenses.reduce((acc, expense) => {
      const cat = expense.categoria || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + Number(expense.monto || 0);
      return acc;
    }, {});

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredExpenses]);

  // Datos de línea de tiempo mejorados
  const timelineData = useMemo(() => {
    const grouped = filteredExpenses.reduce((acc, expense) => {
      const date = expense.fecha?.split('T')[0];
      if (!date) return acc;
      acc[date] = (acc[date] || 0) + Number(expense.monto || 0);
      return acc;
    }, {});

    // Ordenar y limitar puntos para que el gráfico sea legible
    const sortedDates = Object.keys(grouped).sort();

    return sortedDates.map(date => ({
      date,
      displayDate: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      amount: grouped[date]
    }));
  }, [filteredExpenses]);

  if (expenses.length === 0) {
    return <EmptyAnalysis />;
  }

  return (
    <Box>
      {/* Filtro de Rango de Tiempo */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, val) => val && setTimeRange(val)}
          size="small"
          aria-label="time range"
        >
          <ToggleButton sx={{ m: 0.5, color:'white !important', p: 2,  borderRadius: 5 }} value="1M">1 Mes</ToggleButton>
          <ToggleButton sx={{ m: 0.5, color:'white !important', p: 2,  borderRadius: 5 }} value="3M">3 Meses</ToggleButton>
          <ToggleButton sx={{ m: 0.5, color:'white !important', p: 2,  borderRadius: 5 }} value="6M">6 Meses</ToggleButton>
          <ToggleButton sx={{ m: 0.5, color:'white !important', p: 2,  borderRadius: 5 }} value="ALL">Todo</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AccountBalanceWallet color="primary" />
              <Typography variant="subtitle2" color="text.secondary">Total Gastado</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">${kpis.total.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TrendingUp color="primary" />
              <Typography variant="subtitle2" color="text.secondary">Promedio Diario</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">${kpis.dailyAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarToday color="primary" />
              <Typography variant="subtitle2" color="text.secondary">Días con Gastos</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">{kpis.uniqueDays}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CategoryIcon color="primary" />
              <Typography variant="subtitle2" color="text.secondary">Gasto Máximo</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">${kpis.maxExpense.toLocaleString()}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Gráfico de Tendencia (Area Chart) */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>Tendencia de Gastos</Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#133A1A" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#133A1A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Gasto']}
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#133A1A"
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Categorías (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>Por Categoría</Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Total']}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico Circular (Pie Chart) - Distribución */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>Distribución</Typography>
              <Box height={300} display="flex" justifyContent="center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ExpenseCharts;
