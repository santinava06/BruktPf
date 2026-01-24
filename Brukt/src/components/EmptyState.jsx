import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import {
  Inbox as InboxIcon,
  Receipt as ReceiptIcon,
  Group as GroupIcon,
  SearchOff as SearchOffIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

/**
 * Componente para estados vacíos mejorados
 */
function EmptyState({ 
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  variant = 'default'
}) {
  const iconColors = {
    default: 'primary.main',
    search: 'text.secondary',
    expense: 'warning.main',
    group: 'info.main',
    analysis: 'success.main'
  };

  const iconColor = iconColors[variant] || iconColors.default;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: 3,
        border: '2px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: iconColor,
          bgcolor: 'action.hover'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: `${iconColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(1.05)',
                opacity: 0.8
              }
            }
          }}
        >
          <Icon 
            sx={{ 
              fontSize: 40, 
              color: iconColor,
              animation: 'fadeIn 0.5s ease-in'
            }} 
          />
        </Box>
        
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              color: 'text.primary'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: 400, mx: 'auto' }}
          >
            {description}
          </Typography>
        </Box>

        {action && onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              animation: 'fadeInUp 0.5s ease-out 0.2s both',
              '@keyframes fadeInUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)'
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            {actionLabel || action}
          </Button>
        )}
      </Box>
    </Paper>
  );
}

/**
 * Estados vacíos predefinidos
 */
export function EmptyExpenses({ onAddExpense }) {
  return (
    <EmptyState
      icon={ReceiptIcon}
      title="No hay gastos aún"
      description="Comienza agregando el primer gasto compartido al grupo. Todos los miembros podrán verlo y se calculará automáticamente la distribución equitativa."
      action="Agregar Gasto"
      onAction={onAddExpense}
      variant="expense"
    />
  );
}

export function EmptyGroups({ onCreateGroup }) {
  return (
    <EmptyState
      icon={GroupIcon}
      title="No tienes grupos aún"
      description="Crea tu primer grupo para comenzar a compartir gastos con familiares, amigos o compañeros. Es fácil y rápido."
      action="Crear Grupo"
      onAction={onCreateGroup}
      variant="group"
    />
  );
}

export function EmptySearch({ searchTerm, onClear }) {
  return (
    <EmptyState
      icon={SearchOffIcon}
      title={`No se encontraron resultados para "${searchTerm}"`}
      description="Intenta con otros términos de búsqueda o ajusta los filtros para encontrar lo que buscas."
      action="Limpiar Búsqueda"
      onAction={onClear}
      variant="search"
    />
  );
}

export function EmptyAnalysis() {
  return (
    <EmptyState
      icon={AssessmentIcon}
      title="No hay datos para analizar"
      description="Agrega gastos al grupo para ver visualizaciones y análisis detallados de los gastos compartidos."
      variant="analysis"
    />
  );
}

export default EmptyState;

