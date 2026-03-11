import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
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
  Drawer,
  Divider,
  ListItemButton,
  ListItemIcon,
  alpha,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Autocomplete,
  CircularProgress
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
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  EmojiPeople as FriendsIcon
} from '@mui/icons-material';
import { createGroup, getUserGroups, inviteToGroup, acceptInvitation, rejectInvitation, getPendingInvitations, deleteGroup, getGroupDetails, getGroupExpenses } from '../services/groups.js';
import { getGroupDebtPayments } from '../services/debtPayments.js';
import { getFriends, getPendingRequests, sendFriendRequest, acceptFriendRequest, deleteFriendship } from '../services/friends.js';


function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [_invitations, _setInvitations] = useState([]);
  const [_loading, _setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState({ open: false, groupId: null });
  const [groupDetails, setGroupDetails] = useState(null);
  const [newGroup, setNewGroup] = useState({ nombre: '', descripcion: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [groupErrors, setGroupErrors] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, group: null });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [_selectedGroupDetails, _setSelectedGroupDetails] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupSummary, setGroupSummary] = useState({ totalExpense: 0, youOwe: 0, youreOwed: 0 });
  const [debtDetails, setDebtDetails] = useState({ whoOwesMe: [], whoIOweTo: [] });
  const [totalDebtDetails, setTotalDebtDetails] = useState({ whoOwesMe: [], whoIOweTo: [] });
  const [globalActivities, setGlobalActivities] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'activity', 'invitations', 'friends'
  const [friends, setFriends] = useState([]);
  const [pendingFriends, setPendingFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);

  // Calcular deudas totales de todos los grupos
  const calculateTotalDebts = useCallback(async (groupsList) => {
    try {
      const allDebtsAcrossGroups = [];
      const userEmail = user?.email;

      // Cargar todos los datos necesarios
      const groupDetailsPromises = groupsList.map(group => getGroupDetails(group.id));
      const expensesPromises = groupsList.map(group => getGroupExpenses(group.id));
      const paymentsPromises = groupsList.map(group => getGroupDebtPayments(group.id).catch(() => []));

      const [allGroupDetails, allExpenses, allPayments] = await Promise.all([
        Promise.all(groupDetailsPromises),
        Promise.all(expensesPromises),
        Promise.all(paymentsPromises)
      ]);

      // 2. Para cada grupo, calcular deudas internas
      groupsList.forEach((group, index) => {
        const expenses = allExpenses[index] || [];
        const payments = allPayments[index] || [];
        const groupDetails = allGroupDetails[index];
        const members = groupDetails?.group?.members || groupDetails?.members || [];

        if (members.length === 0 || expenses.length === 0) return;

        // a. Calcular total gastado y promedio
        const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.monto || exp.amount || 0), 0);
        const averagePerPerson = totalSpent / members.length;

        // b. Inicializar balances (Gasto - Promedio)
        const memberBalances = {};
        members.forEach(m => {
          const email = m.user?.email || m.email;
          if (email) {
            memberBalances[email] = {
              email,
              name: m.user?.nombre || m.nombre || email.split('@')[0],
              balance: -averagePerPerson
            };
          }
        });

        // c. Sumar lo gastado
        expenses.forEach(exp => {
          const payerEmail = exp.paid_by_email;
          if (memberBalances[payerEmail]) {
            memberBalances[payerEmail].balance += Number(exp.monto || exp.amount || 0);
          }
        });

        // d. Aplicar pagos
        payments.forEach(pay => {
          const payerEmail = pay.payer?.email || pay.payer_email;
          const receiverEmail = pay.receiver?.email || pay.receiver_email;
          const amount = Number(pay.amount || 0);
          if (memberBalances[payerEmail]) memberBalances[payerEmail].balance += amount;
          if (memberBalances[receiverEmail]) memberBalances[receiverEmail].balance -= amount;
        });

        // e. Pairing (Emparejamiento) dentro del grupo
        const positives = Object.values(memberBalances).filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
        const negatives = Object.values(memberBalances).filter(b => b.balance < -0.01).sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

        let pIdx = 0, nIdx = 0;
        while (pIdx < positives.length && nIdx < negatives.length) {
          const creditor = positives[pIdx];
          const debtor = negatives[nIdx];
          const transfer = Math.min(creditor.balance, Math.abs(debtor.balance));
          allDebtsAcrossGroups.push({ from: debtor.email, fromName: debtor.name, to: creditor.email, toName: creditor.name, amount: transfer });
          creditor.balance -= transfer;
          debtor.balance += transfer;
          if (creditor.balance < 0.01) pIdx++;
          if (Math.abs(debtor.balance) < 0.01) nIdx++;
        }
      });

      // 3. Consolidar relaciones (Netting Global por persona)
      const consolidatedWhoOwesMe = {};
      const consolidatedWhoIOweTo = {};

      allDebtsAcrossGroups.forEach(debt => {
        if (debt.from === userEmail) {
          if (consolidatedWhoOwesMe[debt.to]) {
            const diff = consolidatedWhoOwesMe[debt.to].amount - debt.amount;
            if (diff >= 0) consolidatedWhoOwesMe[debt.to].amount = diff;
            else { delete consolidatedWhoOwesMe[debt.to]; consolidatedWhoIOweTo[debt.to] = { name: debt.toName, amount: Math.abs(diff) }; }
          } else {
            if (!consolidatedWhoIOweTo[debt.to]) consolidatedWhoIOweTo[debt.to] = { name: debt.toName, amount: 0 };
            consolidatedWhoIOweTo[debt.to].amount += debt.amount;
          }
        } else if (debt.to === userEmail) {
          if (consolidatedWhoIOweTo[debt.from]) {
            const diff = consolidatedWhoIOweTo[debt.from].amount - debt.amount;
            if (diff >= 0) consolidatedWhoIOweTo[debt.from].amount = diff;
            else { delete consolidatedWhoIOweTo[debt.from]; consolidatedWhoOwesMe[debt.from] = { name: debt.fromName, amount: Math.abs(diff) }; }
          } else {
            if (!consolidatedWhoOwesMe[debt.from]) consolidatedWhoOwesMe[debt.from] = { name: debt.fromName, amount: 0 };
            consolidatedWhoOwesMe[debt.from].amount += debt.amount;
          }
        }
      });

      const finalWhoOwesMe = Object.entries(consolidatedWhoOwesMe).filter(([_, d]) => d.amount > 0.01).map(([email, d]) => ({ personId: email, name: d.name, email, amount: Math.round(d.amount * 100) / 100 }));
      const finalWhoIOweTo = Object.entries(consolidatedWhoIOweTo).filter(([_, d]) => d.amount > 0.01).map(([email, d]) => ({ personId: email, name: d.name, email, amount: Math.round(d.amount * 100) / 100 }));
      setTotalDebtDetails({ whoOwesMe: finalWhoOwesMe, whoIOweTo: finalWhoIOweTo });

      // 4. Actividades Recientes
      const allActivities = [];
      groupsList.forEach((group, index) => {
        const expenses = allExpenses[index] || [];
        const payments = allPayments[index] || [];
        const members = allGroupDetails[index]?.group?.members || allGroupDetails[index]?.members || [];

        expenses.forEach(e => allActivities.push({ ...e, type: 'expense', groupName: group.nombre || group.name, groupId: group.id }));

        payments.forEach(p => {
          const payer = members.find(m => (m.user?.email || m.email) === (p.payer?.email || p.payer_email));
          const receiver = members.find(m => (m.user?.email || m.email) === (p.receiver?.email || p.receiver_email));

          allActivities.push({
            ...p,
            type: 'payment',
            groupName: group.nombre || group.name,
            groupId: group.id,
            payer_name: payer?.user?.nombre || payer?.nombre || (p.payer?.email || p.payer_email)?.split('@')[0],
            receiver_name: receiver?.user?.nombre || receiver?.nombre || (p.receiver?.email || p.receiver_email)?.split('@')[0]
          });
        });
      });
      allActivities.sort((a, b) => new Date(b.created_at || b.fecha || b.payment_date) - new Date(a.created_at || a.fecha || a.payment_date));
      setGlobalActivities(allActivities.slice(0, 30));
    } catch (err) {
      console.error('Error calculating total debts:', err);
    }
  }, [user?.id, user?.email]);


  const loadData = useCallback(async () => {
    try {
      const [groupsData, invitationsData, friendsData, friendRequestsData] = await Promise.all([
        getUserGroups(),
        getPendingInvitations(),
        getFriends(),
        getPendingRequests()
      ]);

      // Verificar la estructura de los datos
      const groups = groupsData.groups || groupsData || [];
      const invitations = invitationsData.invitations || invitationsData || [];
      const friendsList = friendsData.friends || friendsData || [];
      const requestsList = friendRequestsData.requests || friendRequestsData || [];

      setGroups(groups);
      _setInvitations(invitations);
      setFriends(friendsList);
      setPendingFriends(requestsList);

      // Calcular deudas totales de todos los grupos
      await calculateTotalDebts(groups);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar datos');
      // Establecer arrays vacíos en caso de error
      setGroups([]);
      _setInvitations([]);
    } finally {
      _setLoading(false);
    }
  }, [calculateTotalDebts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cargar detalles y gastos del grupo seleccionado
  const loadGroupDetails = async (group) => {
    try {
      const [details, expenses, payments] = await Promise.all([
        getGroupDetails(group.id),
        getGroupExpenses(group.id),
        getGroupDebtPayments(group.id).catch(() => [])
      ]);

      _setSelectedGroupDetails(details);
      setGroupExpenses(expenses || []);

      console.log('🔍 DEBUG Gastos recibidos:', expenses);

      const members = details?.group?.members || details?.members || [];
      if (members.length > 0) {
        setGroupMembers(members);
      }

      console.log('🔍 DEBUG loadGroupDetails:', {
        groupId: group.id,
        membersCount: members.length,
        members: members.map(m => ({ id: m.user?.id || m.id, name: m.user?.nombre || m.nombre, email: m.user?.email || m.email })),
        currentUserId: user?.id,
        expensesCount: expenses?.length || 0
      });

      // Calcular resumen de deudas
      if ((expenses && expenses.length > 0) || (payments && payments.length > 0)) {
        const totalExpense = expenses ? expenses.reduce((sum, exp) => sum + (parseFloat(exp.monto || exp.amount) || 0), 0) : 0;

        // Mapa para deudas relativas en este grupo
        const netDebts = {}; // { userId: { amount, name } }

        const memberCount = members.length;

        if (memberCount > 0) {
          const amIMember = members.some(m => (m.user?.id || m.id) == user?.id);

          if (amIMember) {
            // 1. Procesar Gastos
            if (expenses) {
              expenses.forEach((expense) => {
                const amount = parseFloat(expense.monto || expense.amount || 0);
                if (amount <= 0) return;

                const share = amount / memberCount;
                const payerId = expense.paid_by;

                console.log('🔍 DEBUG Procesando gasto:', {
                  description: expense.descripcion,
                  amount,
                  memberCount,
                  share,
                  payerId,
                  currentUserId: user?.id,
                  isPaidByMe: payerId == user?.id
                });

                if (payerId == user?.id) {
                  // Yo pagué: otros me deben
                  members.forEach((member) => {
                    const memberUserId = member.user?.id || member.id;
                    if (memberUserId && memberUserId != user?.id) {
                      if (!netDebts[memberUserId]) {
                        const userName = member.user?.nombre || member.nombre || 'Usuario';
                        netDebts[memberUserId] = { amount: 0, name: userName };
                      }
                      netDebts[memberUserId].amount -= share;
                    }
                  });
                } else if (payerId) {
                  // Otro pagó: yo debo a esa persona
                  if (!netDebts[payerId]) {
                    const payerMember = members.find(m => (m.user?.id || m.id) == payerId);
                    const payerName = payerMember?.user?.nombre || payerMember?.nombre || expense.paid_by_name || 'Usuario';
                    netDebts[payerId] = { amount: 0, name: payerName };
                  }
                  netDebts[payerId].amount += share;
                }
              });
            }

            // 2. Procesar Pagos
            if (payments && Array.isArray(payments)) {
              payments.forEach((payment) => {
                const amount = parseFloat(payment.amount || 0);
                if (amount <= 0) return;

                const payerId = payment.payer?.id || payment.payer_id;
                const receiverId = payment.receiver?.id || payment.receiver_id;

                if (payerId == user?.id) {
                  // Yo pagué a alguien -> disminuye lo que le debo a esa persona
                  if (!netDebts[receiverId]) {
                    const receiverMember = members.find(m => (m.user?.id || m.id) == receiverId);
                    const receiverName = receiverMember?.user?.nombre || receiverMember?.nombre || 'Usuario';
                    netDebts[receiverId] = { amount: 0, name: receiverName };
                  }
                  // Si antes tenía un netDebts[receiverId] positivo (yo le debía),
                  // restar el pago lo acerca a 0 (reduce la deuda).
                  netDebts[receiverId].amount -= amount;
                } else if (receiverId == user?.id) {
                  // Alguien me pagó -> disminuye lo que esa persona me debe
                  if (!netDebts[payerId]) {
                    const payerMember = members.find(m => (m.user?.id || m.id) == payerId);
                    const payerName = payerMember?.user?.nombre || payerMember?.nombre || 'Usuario';
                    netDebts[payerId] = { amount: 0, name: payerName };
                  }
                  // Si antes netDebts[payerId] era negativo (esa persona me debía),
                  // sumar el pago lo acerca a 0 (reduce lo que me debe).
                  netDebts[payerId].amount += amount;
                }
              });
            }
          }
        }

        const whoOwesMe = [];
        const whoIOweTo = [];
        let youOweTotal = 0;
        let youreOwedTotal = 0;

        Object.entries(netDebts).forEach(([userId, data]) => {
          const netAmount = Math.round(data.amount * 100) / 100;

          if (netAmount > 0.01) {
            // Positivo = yo les debo
            whoIOweTo.push({
              personId: userId,
              name: data.name,
              amount: netAmount
            });
            youOweTotal += netAmount;
          } else if (netAmount < -0.01) {
            // Negativo = me deben
            const absAmount = Math.abs(netAmount);
            whoOwesMe.push({
              personId: userId,
              name: data.name,
              amount: absAmount
            });
            youreOwedTotal += absAmount;
          }
        });

        console.log('🔍 DEBUG Final debts:', { netDebts, whoOwesMe, whoIOweTo });

        setGroupSummary({
          totalExpense,
          youOwe: Math.round(youOweTotal * 100) / 100,
          youreOwed: Math.round(youreOwedTotal * 100) / 100
        });

        setDebtDetails({
          whoOwesMe,
          whoIOweTo
        });
      } else {
        setGroupSummary({ totalExpense: 0, youOwe: 0, youreOwed: 0 });
        setDebtDetails({ whoOwesMe: [], whoIOweTo: [] });
      }
    } catch (err) {
      console.error('Error loading group details:', err);
      setError('Error al cargar detalles del grupo');
    }
  };

  // Obtener nombre de un miembro por su ID
  const getMemberName = (memberId) => {
    const member = groupMembers.find(m => (m.user?.id || m.id) === memberId);
    return member ? (member.user?.nombre || member.nombre || member.user?.email || member.email || 'Usuario Desconocido') : 'Usuario Desconocido';
  };
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

  // Handlers para Amigos
  const handleSendFriendRequest = async () => {
    if (!friendEmail.trim()) return;
    try {
      await sendFriendRequest(friendEmail);
      setSuccess('Solicitud de amistad enviada');
      setFriendEmail('');
      loadData();
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError(err.response?.data?.error || 'Error al enviar solicitud');
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      setSuccess('Solicitud aceptada');
      loadData();
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Error al aceptar solicitud');
    }
  };

  const handleDeleteFriendship = async (friendshipId) => {
    try {
      await deleteFriendship(friendshipId);
      setSuccess('Amigo eliminado o solicitud declinada');
      loadData();
    } catch (err) {
      console.error('Error deleting friendship:', err);
      setError('Error al eliminar amigo');
    }
  };


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
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative', p: 3 }}>
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

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 70px)', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 300,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
          bgcolor: 'white',
          position: 'sticky',
          top: 70,
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
          zIndex: 10
        }}
      >
        {/* Navigation Menu */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            startIcon={<DashboardIcon />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'white !important',
              mb: 1,
              bgcolor: currentView === 'dashboard' && !selectedGroup ? alpha('#4caf50', 0.1) : 'transparent',
              '&:hover': {
                bgcolor: alpha('#4caf50', 0.1)
              }
            }}
            onClick={() => {
              setSelectedGroup(null);
              setCurrentView('dashboard');
            }}
          >
            Panel de control
          </Button>
          <Button
            fullWidth
            startIcon={<ReceiptIcon />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'white !important',
              mb: 1,
              bgcolor: currentView === 'activity' && !selectedGroup ? alpha('#4caf50', 0.1) : 'transparent',
              '&:hover': {
                bgcolor: alpha('#4caf50', 0.1)
              }
            }}
            onClick={() => {
              setSelectedGroup(null);
              setCurrentView('activity');
            }}
          >
            Actividad
          </Button>
          <Button
            fullWidth
            startIcon={<EmailIcon />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'white !important',
              mb: 1,
              bgcolor: currentView === 'invitations' && !selectedGroup ? alpha('#4caf50', 0.1) : 'transparent',
              '&:hover': {
                bgcolor: alpha('#4caf50', 0.1)
              }
            }}
            onClick={() => {
              setSelectedGroup(null);
              setCurrentView('invitations');
            }}
          >
            Invitaciones
          </Button>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Grupos Section */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Grupos
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCreateDialog(true)}
              sx={{
                width: 28,
                height: 28,
                bgcolor: alpha('#4caf50', 0.1),
                '&:hover': {
                  bgcolor: alpha('#4caf50', 0.2)
                }
              }}
            >
              <AddIcon sx={{ fontSize: '1.1rem', color: '#4caf50' }} />
            </IconButton>
          </Box>

          <List sx={{ p: 0 }}>
            {groups.map((group) => (
              <ListItemButton
                key={group.id}
                selected={selectedGroup?.id === group.id}
                onClick={() => {
                  setSelectedGroup(group);
                  loadGroupDetails(group);
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha('#4caf50', 0.08)
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha('#4caf50', 0.15),
                    color: '#4caf50',
                    '&:hover': {
                      bgcolor: alpha('#4caf50', 0.2)
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: alpha('#4caf50', 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4caf50'
                    }}
                  >
                    <GroupIcon sx={{ fontSize: '1rem' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={group.nombre || group.name}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Amigos Section */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Amigos
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                if (selectedGroup) {
                  setInviteDialog({ open: true, groupId: selectedGroup.id });
                  setInviteEmail('');
                } else {
                  setAddFriendDialogOpen(true);
                  setFriendEmail('');
                }
              }}
              sx={{
                width: 28,
                height: 28,
                bgcolor: alpha('#4caf50', 0.1),
                '&:hover': {
                  bgcolor: alpha('#4caf50', 0.2)
                }
              }}
            >
              <PersonAddIcon sx={{ fontSize: '1.1rem', color: '#4caf50' }} />
            </IconButton>
          </Box>

          {/* Solicitudes Pendientes */}
          {pendingFriends.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: alpha('#4caf50', 0.8), display: 'block', mb: 1 }}>
                Solicitudes Pendientes
              </Typography>
              <List sx={{ p: 0 }}>
                {pendingFriends.map((request) => (
                  <ListItem
                    key={request.id}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha('#4caf50', 0.05),
                      mb: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: '1rem', color: '#133A1A' }} />
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500, flex: 1, fontSize: '0.8rem' }}>
                        {request.from?.nombre || request.from?.email?.split('@')[0]}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        onClick={() => handleAcceptFriendRequest(request.id)}
                        sx={{
                          py: 0.2,
                          fontSize: '0.7rem',
                          textTransform: 'none',
                          bgcolor: '#133A1A',
                          color: 'white !important',
                          borderRadius: 1
                        }}
                      >
                        Aceptar
                      </Button>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteFriendship(request.id)}
                        sx={{
                          py: 0.2,
                          fontSize: '0.7rem',
                          textTransform: 'none',
                          borderRadius: 1,
                          color: 'white !important'
                        }}
                      >
                        Rechazar
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Lista de Amigos */}
          <List sx={{ p: 0 }}>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <ListItem
                  key={friend.id}
                  sx={{
                    p: 0,
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover .delete-friend': { opacity: 1 }
                  }}
                  secondaryAction={
                    <IconButton
                      size="small"
                      color="error"
                      className="delete-friend"
                      onClick={() => handleDeleteFriendship(friend.friendshipId)}
                      sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                    >
                      <DeleteIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, flex: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: alpha('#133A1A', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#133A1A'
                      }}
                    >
                      <PersonIcon sx={{ fontSize: '0.9rem' }} />
                    </Box>
                    <ListItemText
                      primary={friend.nombre || friend.email?.split('@')[0]}
                      sx={{
                        m: 0,
                        '& .MuiListItemText-primary': {
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', display: 'block', textAlign: 'center', py: 1 }}>
                Sin amigos agregados
              </Typography>
            )}
          </List>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
          {!selectedGroup && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#133A1A', mb: 4 }}>
                Panel de Control
              </Typography>

              {/* Resumen Global de Deudas */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f7f0 100%)',
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Te Deben en Total
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#4caf50' }}>
                        ${totalDebtDetails.whoOwesMe.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        de {totalDebtDetails.whoOwesMe.length} personas
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fdf0f0 100%)',
                    border: '1px solid rgba(211, 47, 47, 0.2)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Debes en Total
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#d32f2f' }}>
                        ${totalDebtDetails.whoIOweTo.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        a {totalDebtDetails.whoIOweTo.length} personas
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Panel de Deudas Detallado */}
              {currentView === 'dashboard' && (totalDebtDetails.whoOwesMe.length > 0 || totalDebtDetails.whoIOweTo.length > 0) && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#133A1A' }}>
                    Resumen de Deudas
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Quién te debe */}
                    {totalDebtDetails.whoOwesMe.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Card sx={{
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          borderLeft: '4px solid #4caf50'
                        }}>
                          <CardHeader
                            title="Te Deben"
                            titleTypographyProps={{ sx: { fontWeight: 700, color: '#4caf50' } }}
                            sx={{ pb: 1 }}
                          />
                          <CardContent sx={{ pt: 0 }}>
                            <List sx={{ p: 0 }}>
                              {totalDebtDetails.whoOwesMe.map((debt, idx) => (
                                <Box key={idx}>
                                  {idx > 0 && <Divider sx={{ my: 1 }} />}
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {debt.name || getMemberName(debt.personId)}
                                    </Typography>
                                    <Chip
                                      label={`$${debt.amount.toFixed(2)}`}
                                      sx={{
                                        bgcolor: alpha('#4caf50', 0.2),
                                        color: '#4caf50',
                                        fontWeight: 700
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* A quién le debes */}
                    {totalDebtDetails.whoIOweTo.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Card sx={{
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          borderLeft: '4px solid #d32f2f'
                        }}>
                          <CardHeader
                            title="Debes"
                            titleTypographyProps={{ sx: { fontWeight: 700, color: '#d32f2f' } }}
                            sx={{ pb: 1 }}
                          />
                          <CardContent sx={{ pt: 0 }}>
                            <List sx={{ p: 0 }}>
                              {totalDebtDetails.whoIOweTo.map((debt, idx) => (
                                <Box key={idx}>
                                  {idx > 0 && <Divider sx={{ my: 1 }} />}
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {debt.name || getMemberName(debt.personId)}
                                    </Typography>
                                    <Chip
                                      label={`$${debt.amount.toFixed(2)}`}
                                      sx={{
                                        bgcolor: alpha('#d32f2f', 0.2),
                                        color: '#d32f2f',
                                        fontWeight: 700
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Actividad Reciente Global */}
              {currentView === 'activity' && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#133A1A' }}>
                    Actividad Reciente
                  </Typography>
                  {globalActivities.length > 0 ? (
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <List sx={{ p: 0 }}>
                        {globalActivities.map((activity, idx) => (
                          <Box key={activity.id || idx}>
                            {idx > 0 && <Divider />}
                            <ListItem sx={{ py: 2 }}>
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: activity.type === 'expense' ? alpha('#133A1A', 0.1) : alpha('#4caf50', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: activity.type === 'expense' ? '#133A1A' : '#4caf50'
                                  }}
                                >
                                  {activity.type === 'expense' ? <ReceiptIcon fontSize="small" /> : <TrendingIcon fontSize="small" />}
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {activity.type === 'expense' ? (activity.description || activity.descripcion) : 'Pago Registrado'}
                                  </Typography>
                                }
                                secondary={
                                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {activity.type === 'expense' ? (
                                        <>Pagado por <strong>{activity.paid_by_email === user?.email ? 'Ti' : (activity.paid_by_name || 'Alguien')}</strong> en <strong>{activity.groupName}</strong></>
                                      ) : (
                                        <>De <strong>{activity.payer_email === user?.email ? 'Ti' : (activity.payer_name || 'Alguien')}</strong> a <strong>{activity.receiver_email === user?.email ? 'Ti' : (activity.receiver_name || 'Alguien')}</strong> en <strong>{activity.groupName}</strong></>
                                      )}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(activity.created_at || activity.fecha || activity.payment_date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: activity.type === 'expense' ? '#133A1A' : '#4caf50' }}>
                                ${parseFloat(activity.monto || activity.amount).toFixed(2)}
                              </Typography>
                            </ListItem>
                          </Box>
                        ))}
                      </List>
                    </Card>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography>No hay actividad reciente</Typography>
                    </Box>
                  )}
                </Box>
              )}


              {/* Invitaciones Pendientes */}
              {currentView === 'invitations' && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#133A1A' }}>
                    Invitaciones de Grupos
                  </Typography>
                  {_invitations.length > 0 ? (
                    _invitations.map((invitation) => (
                      <Card
                        key={invitation.id}
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
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary', bgcolor: 'white', borderRadius: 2 }}>
                      <Typography>No tienes invitaciones pendientes</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
          {selectedGroup && (
            <Box>
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#133A1A', mb: 1 }}>
                  {selectedGroup.nombre || selectedGroup.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedGroup.description || selectedGroup.descripcion || 'Sin descripción'}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#4caf50',
                    color: 'white !important',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: alpha('#4caf50', 0.1),
                      borderColor: '#4caf50'
                    }
                  }}
                  onClick={() => navigate(`/groups/${selectedGroup.id}`)}
                >
                  Ver Detalles
                </Button>
                {selectedGroup.creator_id === user?.id && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenDeleteDialog(selectedGroup)}
                    sx={{
                      borderColor: '#d32f2f',
                      color: 'white !important',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: alpha('#d32f2f', 0.1),
                        borderColor: '#d32f2f'
                      }
                    }}
                  >
                    Eliminar Grupo
                  </Button>
                )}
              </Box>

              {/* Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                      <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Gastado
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#133A1A', mt: 1 }}>
                        ${groupSummary?.totalExpense?.toFixed(2) || '0.00'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                      <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        Debes
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f', mt: 1 }}>
                        ${groupSummary?.youOwe?.toFixed(2) || '0.00'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                      <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        Te Deben
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50', mt: 1 }}>
                        ${groupSummary?.youreOwed?.toFixed(2) || '0.00'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>



              {/* Expenses Section */}
              {groupExpenses && groupExpenses.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#133A1A' }}>
                    Gastos del Grupo
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Cantidad</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Pagado por</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Fecha</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupExpenses.map((expense) => (
                          <TableRow key={expense.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                            <TableCell>{expense.descripcion || expense.description}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              ${parseFloat(expense?.monto || expense?.amount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>{expense.paid_by_email || expense.paid_by_name || expense.paidBy}</TableCell>
                            <TableCell align="right">
                              {new Date(expense.fecha || expense.created_at || expense.createdAt).toLocaleDateString('es-ES')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              )}

            </Box>
          )}
        </Box>
      </Box >

      {/* Dialogs and other components */}

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
              color: 'white !important',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,

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

      {/* Dialog añadir amigo */}
      <Dialog open={addFriendDialogOpen} onClose={() => setAddFriendDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Añadir Amigo</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ingresa el email de la persona que quieres añadir como amigo.
            </Typography>
            <TextField
              fullWidth
              autoFocus
              label="Email del amigo"
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFriendDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, color: 'white !important' }}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleSendFriendRequest();
              setAddFriendDialogOpen(false);
            }}
            variant="contained"
            disabled={!friendEmail.trim()}
            sx={{
              bgcolor: '#133A1A',
              color: 'white !important',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Enviar Solicitud
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog invitar a grupo */}
      <Dialog open={inviteDialog.open} onClose={() => { setInviteDialog({ open: false, groupId: null }); setInviteEmail(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>Invitar a Grupo</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Selecciona un amigo de tu lista o escribe su email directamente:
            </Typography>

            <Autocomplete
              freeSolo
              options={friends}
              getOptionLabel={(option) => typeof option === 'string' ? option : `${option.nombre} (${option.email})`}
              onInputChange={(event, newValue) => {
                setInviteEmail(newValue);
              }}
              onChange={(event, newValue) => {
                if (newValue) {
                  setInviteEmail(typeof newValue === 'string' ? newValue : newValue.email);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Email del invitado"
                  type="email"
                  fullWidth
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setInviteDialog({ open: false, groupId: null }); setInviteEmail(''); }} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'white !important' }}>Cancelar</Button>
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
    </Box >
  );
}

export default Groups; 