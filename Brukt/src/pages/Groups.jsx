import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse
} from '@mui/material';
import {
  Group as GroupIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Create as CreateIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { createGroup, getUserGroups, inviteToGroup, acceptInvitation, rejectInvitation, getPendingInvitations, deleteGroup } from '../services/groups';
import { GroupsListSkeleton } from '../components/SkeletonLoader';

function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState({ open: false, groupId: null });
  const [groupDetails, setGroupDetails] = useState(null);
  const [newGroup, setNewGroup] = useState({ nombre: '', descripcion: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [groupErrors, setGroupErrors] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, group: null });
  
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, alphabetical, members
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsData, invitationsData] = await Promise.all([
        getUserGroups(),
        getPendingInvitations()
      ]);
      
      // Verificar la estructura de los datos
      const groups = groupsData.groups || groupsData || [];
      const invitations = invitationsData.invitations || invitationsData || [];
      
      setGroups(groups);
      setInvitations(invitations);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar datos');
      // Establecer arrays vacíos en caso de error
      setGroups([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de manejo del formulario
  const validateGroupField = useCallback((field, value) => {
    let error = '';
    
    switch (field) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre del grupo es requerido';
        } else if (value.trim().length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        } else if (value.trim().length > 50) {
          error = 'El nombre no puede exceder 50 caracteres';
        }
        break;
      case 'descripcion':
        if (value && value.trim().length > 200) {
          error = 'La descripción no puede exceder 200 caracteres';
        }
        break;
      default:
        break;
    }
    
    setGroupErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, []);

  const handleGroupChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewGroup(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (groupErrors[name]) {
      setGroupErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [groupErrors]);

  const handleGroupBlur = useCallback((field) => {
    validateGroupField(field, newGroup[field]);
  }, [newGroup, validateGroupField]);

  const validateFieldOnly = useCallback((field, value) => {
    switch (field) {
      case 'nombre':
        if (!value.trim()) {
          return false;
        } else if (value.trim().length < 3) {
          return false;
        } else if (value.trim().length > 50) {
          return false;
        }
        return true;
      case 'descripcion':
        if (value && value.trim().length > 200) {
          return false;
        }
        return true;
      default:
        return true;
    }
  }, []);

  const validateGroupForm = useCallback(() => {
    const isNameValid = validateFieldOnly('nombre', newGroup.nombre);
    const isDescriptionValid = validateFieldOnly('descripcion', newGroup.descripcion);
    
    return isNameValid && isDescriptionValid;
  }, [newGroup.nombre, newGroup.descripcion, validateFieldOnly]);

  const handleCreateGroup = async () => {
    try {
      // Validar formulario antes de enviar
      if (!validateGroupForm()) {
        return;
      }

      const group = await createGroup(newGroup);
      // Verificar la estructura de la respuesta
      const newGroupData = group.group || group;
      setGroups([newGroupData, ...groups]);
      setCreateDialog(false);
      setNewGroup({ nombre: '', descripcion: '' });
      setGroupErrors({}); // Limpiar errores
      setSuccess('Grupo creado exitosamente');
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Error al crear grupo');
    }
  };

  const handleInviteToGroup = async () => {
    try {
      await inviteToGroup(inviteDialog.groupId, inviteEmail);
      setInviteDialog({ open: false, groupId: null });
      setInviteEmail('');
      setSuccess('Invitación enviada exitosamente');
    } catch (err) {
      console.error('Error inviting to group:', err);
      setError('Error al enviar invitación');
    }
  };

  const handleAcceptInvitation = async (groupId) => {
    try {
      await acceptInvitation(groupId);
      setSuccess('Invitación aceptada exitosamente');
      loadData(); // Recargar datos
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Error al aceptar invitación');
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await rejectInvitation(invitationId);
      setSuccess('Invitación rechazada exitosamente');
      loadData(); // Recargar datos
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      setError('Error al rechazar invitación');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      setSuccess('Grupo eliminado exitosamente');
      loadData(); // Recargar datos
      setDeleteDialog({ open: false, group: null });
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Error al eliminar grupo');
    }
  };

  const handleOpenDeleteDialog = (group) => {
    setDeleteDialog({ open: true, group });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, group: null });
  };

  // Funciones de búsqueda y filtrado
  const filteredAndSortedGroups = React.useMemo(() => {
    let filtered = groups;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(group => 
        (group.nombre || group.name || '').toLowerCase().includes(searchLower) ||
        (group.descripcion || group.description || '').toLowerCase().includes(searchLower)
      );
    }

    // Ordenar
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return (a.nombre || a.name || '').localeCompare(b.nombre || b.name || '');
        case 'members':
          return (b.members?.length || 0) - (a.members?.length || 0);
        case 'recent':
        default:
          // Ordenar por fecha de creación (más reciente primero)
          const dateA = new Date(a.created_at || a.createdAt || 0);
          const dateB = new Date(b.created_at || b.createdAt || 0);
          return dateB - dateA;
      }
    });

    return sorted;
  }, [groups, searchTerm, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('recent');
  };

  const GroupCard = ({ group }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(19, 58, 26, 0.15)',
          borderColor: '#133A1A',
        }
      }}
      onClick={() => navigate(`/groups/${group.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/groups/${group.id}`);
        }
      }}
      aria-label={`Ver detalles del grupo ${group.nombre || group.name}`}
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative', p: { xs: 2, sm: 3 } }}>
        {/* Botón de eliminar */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            zIndex: 1,
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            '.MuiCard-root:hover &': {
              opacity: 1
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDeleteDialog(group);
          }}
        >
          <IconButton 
            size="small" 
            color="error"
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: '#d32f2f',
                color: 'white'
              }
            }}
            aria-label={`Eliminar grupo ${group.nombre || group.name}`}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Header del grupo */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 2,
              bgcolor: '#133A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <GroupIcon />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {group.nombre || group.name}
            </Typography>
            {group.creator_id === user?.id && (
              <Chip 
                label="Creador" 
                sx={{ 
                  fontSize: '0.75rem',
                  height: 20,
                  bgcolor: '#133A1A',
                  color: 'white',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            )}
          </Box>
        </Box>
        
        {/* Descripción */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3,
            lineHeight: 1.5,
            minHeight: '2.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {group.descripcion || group.description || 'Sin descripción'}
        </Typography>
        
        {/* Footer */}
        <Box 
          sx={{ 
            mt: 'auto',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                {group.members?.length || 0} miembros
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#133A1A'
              }}
            >
              Ver detalles →
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const InvitationCard = ({ invitation }) => (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: '#133A1A',
        bgcolor: 'rgba(19, 58, 26, 0.05)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(19, 58, 26, 0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 1.5,
                  bgcolor: '#133A1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <GroupIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {invitation.group?.nombre || invitation.group?.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Invitado por: {invitation.invited_by?.email || invitation.invited_by?.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(invitation.fecha_invitacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleAcceptInvitation(invitation.id)}
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
              Aceptar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleRejectInvitation(invitation.id)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,  
                color: 'white !important',
              }}
            >
              Rechazar
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              color: 'primary.main',
              mb: 1
            }}
          >
            Dashboard - Mis Grupos
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Cargando tus grupos...
          </Typography>
        </Box>
        <GroupsListSkeleton count={6} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            color: 'primary.main',
            mb: 1
          }}
        >
          Dashboard - Mis Grupos
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Organiza y gestiona tus gastos compartidos con familiares, amigos o compañeros
        </Typography>
      </Box>

      {/* Invitaciones pendientes */}
      {invitations.length > 0 && (
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#133A1A',
            bgcolor: 'rgba(19, 58, 26, 0.05)'
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
              <EmailIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Invitaciones Pendientes ({invitations.length})
            </Typography>
          </Box>
          {invitations.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} />
          ))}
        </Paper>
      )}

      {/* Sección de grupos */}
      <Box sx={{ mb: 4 }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Mis Grupos ({filteredAndSortedGroups.length}{searchTerm || sortBy !== 'recent' ? ` de ${groups.length}` : ''})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {groups.length === 0 ? 'No tienes grupos aún' : 'Gestiona tus grupos de gastos'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: 1,
              bgcolor: 'primary.main',
              color: 'white !important',
              '&:hover': {
                bgcolor: 'primary.dark',
                color: 'white !important'
              }
            }}
            aria-label="Crear nuevo grupo"
          >
            Crear Grupo
          </Button>
        </Box>

        {/* Búsqueda y Filtros */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} alignItems="center">
            <Grid item xs={12} sm={12} md={5}>
              <TextField
                fullWidth
                placeholder="Buscar grupos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        aria-label="Limpiar búsqueda"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'background.paper' }}
                aria-label="Campo de búsqueda de grupos"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={sortBy}
                  label="Ordenar por"
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Ordenar grupos por"
                >
                  <MenuItem value="recent">Más recientes</MenuItem>
                  <MenuItem value="alphabetical">Alfabético (A-Z)</MenuItem>
                  <MenuItem value="members">Más miembros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" gap={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end', md: 'flex-end' }} flexWrap="wrap">
                {(searchTerm || sortBy !== 'recent') && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    sx={{ textTransform: 'none' }}
                    aria-label="Limpiar todos los filtros"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Lista de grupos */}
        {filteredAndSortedGroups.length > 0 ? (
          <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
            {filteredAndSortedGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={group.id}>
                <GroupCard group={group} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'action.hover', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <SearchIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              {searchTerm ? 'No se encontraron grupos' : 'No tienes grupos aún'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Crea un grupo para comenzar a compartir gastos con otros'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialog(true)}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Crear tu primer grupo
              </Button>
            )}
          </Paper>
        )}

        {/* Estado vacío */}
        {groups.length === 0 && !loading && (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: '#133A1A',
              bgcolor: 'background.paper'
            }}
          >
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'rgba(19, 58, 26, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <GroupIcon sx={{ fontSize: 40, color: '#133A1A' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              No tienes grupos aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea un grupo para comenzar a compartir gastos con otros
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
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
              Crear tu primer grupo
            </Button>
          </Paper>
        )}
      </Box>

      {/* Dialog crear grupo mejorado */}
      <Dialog 
        open={createDialog} 
        onClose={() => setCreateDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
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
              <CreateIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Crear Nuevo Grupo
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea un grupo para compartir gastos con familiares, amigos o compañeros.
          </Typography>
          
          <TextField
            label="Nombre del grupo"
            name="nombre"
            fullWidth
            value={newGroup.nombre}
            onChange={handleGroupChange}
            onBlur={() => handleGroupBlur('nombre')}
            error={!!groupErrors.nombre}
            helperText={groupErrors.nombre}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GroupIcon color="action" />
                </InputAdornment>
              ),
              placeholder: 'Ej: Vacaciones 2024'
            }}
            sx={{ mb: 3 }}
          />
          
          <TextField
            label="Descripción (opcional)"
            name="descripcion"
            fullWidth
            multiline
            rows={3}
            value={newGroup.descripcion}
            onChange={handleGroupChange}
            onBlur={() => handleGroupBlur('descripcion')}
            error={!!groupErrors.descripcion}
            helperText={groupErrors.descripcion || 'Describe el propósito del grupo'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon color="action" />
                </InputAdornment>
              ),
              placeholder: 'Ej: Gastos compartidos para las vacaciones familiares'
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setCreateDialog(false);
              setNewGroup({ nombre: '', descripcion: '' });
              setGroupErrors({});
            }}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: 'white !important',
              '&:hover': {
                color: 'white !important'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateGroup} 
            variant="contained"
            disabled={!validateGroupForm()}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
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
            Crear Grupo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog invitar a grupo */}
      <Dialog open={inviteDialog.open} onClose={() => setInviteDialog({ open: false, groupId: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Invitar a Grupo</DialogTitle>
        <DialogContent>
          <TextField
            label="Email del invitado"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog({ open: false, groupId: null })} sx={{color: 'white !important'}}>Cancelar</Button>
          <Button 
            onClick={handleInviteToGroup} 
            variant="contained"
            disabled={!inviteEmail.trim()}
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
            Invitar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog detalles del grupo */}
      <Dialog 
        open={!!groupDetails} 
        onClose={() => setGroupDetails(null)} 
        maxWidth="md" 
        fullWidth
      >
        {groupDetails && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <GroupIcon />
                {groupDetails.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {groupDetails.description || 'Sin descripción'}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Miembros ({groupDetails.members?.length || 0})
              </Typography>
              
              <List>
                {groupDetails.members?.map((member) => (
                  <ListItem key={member.id}>
                    <ListItemText
                      primary={member.email}
                      secondary={`${member.role} - Unido: ${new Date(member.joined_at).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={member.role} 
                        color={member.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {groupDetails.user_role === 'admin' && (
                <Box mt={3}>
                  <Button
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    onClick={() => {
                      setInviteDialog({ open: true, groupId: groupDetails.id });
                      setGroupDetails(null);
                    }}
                  >
                    Invitar Miembro
                  </Button>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setGroupDetails(null)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={handleCloseDeleteDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2,
                bgcolor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <DeleteIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Eliminar Grupo
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            ¿Estás seguro de que quieres eliminar el grupo "{deleteDialog.group?.nombre || deleteDialog.group?.name}"?
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
            ⚠️ Esta acción no se puede deshacer. Se eliminarán todos los gastos y miembros del grupo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: 'white !important',
              '&:hover': {
                color: 'white !important'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => handleDeleteGroup(deleteDialog.group?.id)} 
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Eliminar Grupo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars mejorados */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess('')}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
        >
          {success}
        </Alert>
      </Snackbar>
      <Snackbar 
        open={!!error} 
        autoHideDuration={5000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Groups; 