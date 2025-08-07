import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  IconButton, 
  Chip,
  Box,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  AttachMoney, 
  Category, 
  Description, 
  CalendarToday,
  Receipt
} from '@mui/icons-material';

function ExpenseTable({ gastos = [], onEdit, onDelete }) {
  const getCategoryColor = (categoria) => {
    const colors = {
      'Alimentación': '#133A1A',
      'Vivienda': '#133A1A',
      'Transporte': '#133A1A',
      'Servicios': '#133A1A',
      'Entretenimiento': '#133A1A',
      'Salud': '#133A1A',
      'Educación': '#133A1A',
      'Ropa': '#133A1A',
      'Tecnología': '#133A1A',
      'Otros': '#133A1A'
    };
    return colors[categoria] || '#133A1A';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Ensure gastos is always an array
  const expensesArray = Array.isArray(gastos) ? gastos : [];

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mt: 3,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: '#133A1A'
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: '#133A1A', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Receipt />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Lista de gastos ({expensesArray.length})
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(19, 58, 26, 0.05)' }}>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday fontSize="small" sx={{ color: '#133A1A' }} />
                  Fecha
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Category fontSize="small" sx={{ color: '#133A1A' }} />
                  Categoría
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Description fontSize="small" sx={{ color: '#133A1A' }} />
                  Descripción
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                  <AttachMoney fontSize="small" sx={{ color: '#133A1A' }} />
                  Monto
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expensesArray.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay gastos registrados.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              expensesArray.map((gasto) => (
                <TableRow 
                  key={gasto.id} 
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'rgba(19, 58, 26, 0.05)' 
                    },
                    transition: 'background-color 0.2s ease-in-out'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(gasto.fecha)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={gasto.categoria} 
                      size="small"
                      sx={{ 
                        bgcolor: getCategoryColor(gasto.categoria),
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                      {gasto.descripcion || gasto.description || 'Sin descripción'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {formatCurrency(gasto.monto)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      {onEdit && (
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            onClick={() => onEdit(gasto)}
                            sx={{ 
                              color: '#1976d2',
                              '&:hover': {
                                bgcolor: 'rgba(25, 118, 210, 0.1)'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Eliminar">
                          <IconButton 
                            size="small" 
                            onClick={() => onDelete(gasto)}
                            sx={{ 
                              color: '#d32f2f',
                              '&:hover': {
                                bgcolor: 'rgba(211, 47, 47, 0.1)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ExpenseTable; 