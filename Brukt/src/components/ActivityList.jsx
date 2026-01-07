import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Paper,
    Divider,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    ReceiptLong as ExpenseIcon,
    AttachMoney as PaymentIcon,
    GroupAdd as JoinIcon,
    PersonRemove as LeaveIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AddCircle as AddIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { getGroupActivity } from '../services/activity';

// Mapa de tipos de acción a iconos y colores
const getActionConfig = (actionType) => {
    switch (actionType) {
        case 'CREATE_EXPENSE':
            return { icon: <AddIcon />, color: 'success.main', text: 'agregó un gasto' };
        case 'UPDATE_EXPENSE':
            return { icon: <EditIcon />, color: 'info.main', text: 'editó un gasto' };
        case 'DELETE_EXPENSE':
            return { icon: <DeleteIcon />, color: 'error.main', text: 'eliminó un gasto' };
        case 'CREATE_PAYMENT':
            return { icon: <PaymentIcon />, color: 'success.dark', text: 'registró un pago' };
        case 'DELETE_PAYMENT':
            return { icon: <DeleteIcon />, color: 'error.dark', text: 'eliminó un pago' };
        case 'JOIN_GROUP':
            return { icon: <JoinIcon />, color: 'primary.main', text: 'se unió al grupo' };
        case 'LEAVE_GROUP':
            return { icon: <LeaveIcon />, color: 'warning.main', text: 'dejó el grupo' };
        default:
            return { icon: <HistoryIcon />, color: 'grey.500', text: 'realizó una acción' };
    }
};

// Formatear fecha relativa (hace x tiempo)
const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'hace un momento';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `hace ${days} días`;
};

// Generar avatar con iniciales
const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const ActivityList = ({ groupId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchActivity = useCallback(async (pageNum) => {
        try {
            setLoading(true);
            const response = await getGroupActivity(groupId, pageNum);

            if (pageNum === 1) {
                setActivities(response.data);
            } else {
                setActivities(prev => [...prev, ...response.data]);
            }

            setHasMore(response.meta.page < response.meta.totalPages);
            setError(null);
        } catch (err) {
            console.error('Error fetching activity:', err);
            setError('No se pudo cargar el historial de actividad.');
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        setPage(1);
        fetchActivity(1);
    }, [fetchActivity]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchActivity(nextPage);
    };

    const formatDetails = (activity) => {
        const { action_type, details } = activity;

        if (action_type.includes('EXPENSE')) {
            return (
                <span>
                    {getActionConfig(action_type).text}
                    {details.description && <strong> "{details.description}"</strong>}
                    {details.amount && <span> por <strong>${details.amount}</strong></span>}
                </span>
            );
        }

        if (action_type.includes('PAYMENT')) {
            return (
                <span>
                    {getActionConfig(action_type).text}
                    {details.amount && <span> de <strong>${details.amount}</strong></span>}
                </span>
            );
        }

        return getActionConfig(action_type).text;
    };

    if (loading && activities.length === 0) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && activities.length === 0) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        );
    }

    if (activities.length === 0) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    No hay actividad registrada en este grupo aún.
                </Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={0} sx={{ bgcolor: 'background.default' }}>
            <List>
                {activities.map((activity, index) => {
                    const config = getActionConfig(activity.action_type);
                    const isLast = index === activities.length - 1;

                    return (
                        <React.Fragment key={activity.id}>
                            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: config.color }}>
                                        {config.icon}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" component="div">
                                            <strong>{activity.user?.nombre || 'Usuario'}</strong> {formatDetails(activity)}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            component="span"
                                            sx={{ mt: 0.5, display: 'block' }}
                                        >
                                            {getTimeAgo(activity.createdAt)}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            {!isLast && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    );
                })}
            </List>

            {hasMore && (
                <Box display="flex" justifyContent="center" p={2}>
                    <Button
                        variant="outlined"
                        onClick={handleLoadMore}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Cargar más actividad'}
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default ActivityList;
