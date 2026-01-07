import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

/**
 * Skeleton loader para grupos
 */
export function GroupCardSkeleton() {
  return (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} />
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Skeleton variant="text" width="50%" height={16} />
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader para lista de grupos
 */
export function GroupsListSkeleton({ count = 6 }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <GroupCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Skeleton loader para tabla de gastos
 */
export function ExpenseTableSkeleton({ rows = 5 }) {
  return (
    <Box>
      <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 1, borderRadius: 1 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Skeleton variant="rectangular" width="100%" height={52} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * Skeleton loader para tarjetas de estadísticas
 */
export function StatsCardSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Skeleton variant="circular" width={70} height={70} sx={{ mx: 'auto', mb: 3 }} />
        <Skeleton variant="text" width="60%" height={48} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mx: 'auto' }} />
      </CardContent>
    </Card>
  );
}

