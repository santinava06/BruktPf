import React from 'react';
import {
    Box, Button, Container, Grid, Typography, Paper, Stack,
    alpha, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardContent, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    ReceiptLong as ReceiptIcon,
    Group as GroupIcon,
    Timeline as TimelineIcon,
    AttachMoney as MoneyIcon,
    CheckCircle as CheckIcon,
    TrendingUp as TrendingIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    EmojiEvents as AwardIcon,
    ArrowForward as ArrowIcon,
    Download as DownloadIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const slideInRight = keyframes`
    from {
        opacity: 0;
        transform: translateX(-40px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const pulse = keyframes`
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
`;

const LandingPage = () => {
    const navigate = useNavigate();

    const testimonials = [
        {
            name: 'María G.',
            app: 'iOS',
            text: '¡Increíble! Finalmente sin discusiones por dinero en viajes. Brukt lo hace todo tan fácil.',
            rating: 5
        },
        {
            name: 'Carlos R.',
            app: 'Android',
            text: 'La mejor app para compañeros de piso. Todos sabemos exactamente quién debe a quién.',
            rating: 5
        },
        {
            name: 'Ana L.',
            app: 'Web',
            text: 'Simple, intuitiva y muy útil. La recomiendo a todos mis amigos.',
            rating: 5
        }
    ];

    const planFeatures = [
        { feature: 'Crear grupos ilimitados', free: true, pro: true },
        { feature: 'Agregar gastos ilimitados', free: true, pro: true },
        { feature: 'Dividir gastos', free: true, pro: true },
        { feature: 'Seguimiento de saldos', free: true, pro: true },
        { feature: 'Registrar pagos', free: true, pro: true },
        { feature: 'Reportes básicos', free: true, pro: true },
        { feature: 'Escanear recibos', free: false, pro: true },
        { feature: 'Gráficos avanzados', free: false, pro: true },
        { feature: 'Conversión de divisas', free: false, pro: true },
        { feature: 'Sin anuncios', free: false, pro: true }
    ];

    const benefits = [
        {
            icon: <SpeedIcon sx={{ fontSize: 30, color: '#4caf50' }} />,
            title: 'Rápido y fácil',
            description: 'Interfaz intuitiva que cualquiera puede usar sin complicaciones.'
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 30, color: '#4caf50' }} />,
            title: 'Seguro y privado',
            description: 'Tus datos están protegidos con encriptación de nivel empresarial.'
        },
        {
            icon: <TrendingIcon sx={{ fontSize: 30, color: '#4caf50' }} />,
            title: 'Análisis en tiempo real',
            description: 'Visualiza tus gastos con gráficos y reportes detallados.'
        }
    ];

    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            {/* Hero Section - Cleaner like Splitwise */}
            <Box
                sx={{
                    bgcolor: '#ffffff',
                    color: '#133A1A',
                    pt: { xs: 6, md: 12 },
                    pb: { xs: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Circles with Animation */}
                <Box sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    bgcolor: 'rgba(76,175,80,0.05)',
                    animation: `${pulse} 4s ease-in-out infinite`
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: -50,
                    left: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    bgcolor: 'rgba(76,175,80,0.08)',
                    animation: `${pulse} 6s ease-in-out infinite 1s`
                }} />

                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid
                            item
                            xs={12}
                            md={6}
                            sx={{
                                animation: `${slideInRight} 0.8s ease-out`
                            }}
                        >
                            <Typography
                                variant="h2"
                                component="h1"
                                className="premium-gradient-text"
                                sx={{
                                    mb: 2,
                                    fontSize: { xs: '2.5rem', md: '4rem' },
                                    lineHeight: 1.1,
                                    letterSpacing: '-1px'
                                }}
                            >
                                Menos estrés al compartir gastos.
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 4,
                                    color: '#666',
                                    fontWeight: 400,
                                    fontSize: { xs: '1rem', md: '1.1rem' },
                                    lineHeight: 1.7
                                }}
                            >
                                Lleva un registro de los gastos y saldos compartidos con compañeros de piso, de viaje, grupos, amigos y familia.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/register')}
                                    sx={{
                                        color: '#ffffff !important',
                                        bgcolor: '#4caf50',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        borderRadius: 1,
                                        boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: '#43a047',
                                            boxShadow: '0 8px 20px rgba(76,175,80,0.4)'
                                        }
                                    }}
                                >
                                    Registrarse gratis
                                </Button>
                                <Button
                                    variant="text"
                                    size="large"
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        color: 'white !important',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        '&:hover': {
                                            bgcolor: 'rgba(76,175,80,0.1)'
                                        }
                                    }}
                                >
                                    Iniciar Sesión
                                </Button>
                            </Stack>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 3,
                                    color: '#999',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Gratis para iOS, Android y web
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={6}
                            sx={{
                                animation: `${fadeIn} 1s ease-out 0.2s both`
                            }}
                        >
                            {/* Enhanced Mockup visual */}
                            <Paper
                                elevation={15}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                                }}
                            >
                                <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 2, minHeight: 300, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}>
                                    <Stack spacing={2}>
                                        {/* Header Mockup */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', pb: 2 }}>
                                            <Box sx={{ width: 100, height: 20, bgcolor: '#4caf50', borderRadius: 1, opacity: 0.8 }} />
                                            <Box sx={{ width: 30, height: 30, bgcolor: '#4caf50', borderRadius: '50%', opacity: 0.7 }} />
                                        </Box>
                                        {/* List Items Mockup */}
                                        {[1, 2, 3].map((i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    display: 'flex',
                                                    gap: 2,
                                                    alignItems: 'center',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'transparent',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Box sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', borderRadius: '50%', flexShrink: 0 }} />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Box sx={{ width: '60%', height: 16, bgcolor: '#e0e0e0', borderRadius: 1, mb: 1 }} />
                                                    <Box sx={{ width: '40%', height: 12, bgcolor: '#f5f5f5', borderRadius: 1 }} />
                                                </Box>
                                                <Box sx={{ width: 60, height: 20, bgcolor: i % 2 === 0 ? '#ffcdd2' : '#c8e6c9', borderRadius: 1 }} />
                                            </Box>
                                        ))}
                                        {/* Chart Mockup */}
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee', display: 'flex', gap: 2, justifyContent: 'center' }}>
                                            <Box sx={{ width: 60, height: 60, borderRadius: '50%', border: '8px solid #4caf50', borderRightColor: '#eee', borderTopColor: '#e0e0e0', borderBottomColor: '#e0e0e0' }} />
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Box sx={{ width: 80, height: 16, bgcolor: '#4caf50', borderRadius: 1, mb: 1, opacity: 0.7 }} />
                                                <Box sx={{ width: 50, height: 16, bgcolor: '#4caf50', borderRadius: 1, opacity: 0.5 }} />
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Feature Sections - Alternated like Splitwise */}
            <Box sx={{ py: 12, bgcolor: '#ffffff' }}>
                <Container maxWidth="lg">
                    {/* Feature 1: Haz un seguimiento */}
                    <Grid container spacing={6} alignItems="center" sx={{ mb: 12 }}>
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    color: '#133A1A',
                                    fontSize: { xs: '1.8rem', md: '2.3rem' }
                                }}
                            >
                                Haz un seguimiento de tus gastos
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: '1.1rem',
                                    color: '#666',
                                    lineHeight: 1.7
                                }}
                            >
                                Controla los gastos y saldos compartidos y quién debe a quién. Toda la información en un solo lugar.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    height: 300,
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ReceiptIcon sx={{ fontSize: 120, color: '#4caf50', opacity: 0.3 }} />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Feature 2: Organiza gastos */}
                    <Grid container spacing={6} alignItems="center" sx={{ mb: 12 }}>
                        <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
                            <Box
                                sx={{
                                    height: 300,
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <GroupIcon sx={{ fontSize: 120, color: '#4caf50', opacity: 0.3 }} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    color: '#133A1A',
                                    fontSize: { xs: '1.8rem', md: '2.3rem' }
                                }}
                            >
                                Organiza gastos
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: '1.1rem',
                                    color: '#666',
                                    lineHeight: 1.7
                                }}
                            >
                                Divide gastos con cualquier grupo: viajes, compañeros de piso, amigos y familia. Cada grupo tiene su propio seguimiento.
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Feature 3: Añade gastos con facilidad */}
                    <Grid container spacing={6} alignItems="center" sx={{ mb: 12 }}>
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    color: '#133A1A',
                                    fontSize: { xs: '1.8rem', md: '2.3rem' }
                                }}
                            >
                                Añade gastos con facilidad
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: '1.1rem',
                                    color: '#666',
                                    lineHeight: 1.7
                                }}
                            >
                                Añade gastos rápidamente sobre la marcha antes de olvidar quién ha pagado. Interfaz simple y rápida.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    height: 300,
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <MoneyIcon sx={{ fontSize: 120, color: '#4caf50', opacity: 0.3 }} />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Feature 4: Salda deudas */}
                    <Grid container spacing={6} alignItems="center" sx={{ mb: 12 }}>
                        <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
                            <Box
                                sx={{
                                    height: 300,
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <CheckIcon sx={{ fontSize: 120, color: '#4caf50', opacity: 0.3 }} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    color: '#133A1A',
                                    fontSize: { xs: '1.8rem', md: '2.3rem' }
                                }}
                            >
                                Salda deudas con tus amigos
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: '1.1rem',
                                    color: '#666',
                                    lineHeight: 1.7
                                }}
                            >
                                Salda deudas con amigos y registra cualquier pago. Simplifica todas las deudas automáticamente.
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Testimonials Section */}
            <Box sx={{ py: 12, bgcolor: '#f5f5f5' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{
                            fontWeight: 800,
                            mb: 8,
                            color: '#133A1A',
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        Lo que dicen nuestros usuarios
                    </Typography>
                    <Grid container spacing={4}>
                        {testimonials.map((testimonial, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        p: 3,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                                            transform: 'translateY(-4px)'
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', mb: 2 }}>
                                        {Array(testimonial.rating).fill(0).map((_, i) => (
                                            <StarIcon key={i} sx={{ color: '#ffc107', fontSize: 20 }} />
                                        ))}
                                    </Box>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            mb: 3,
                                            fontStyle: 'italic',
                                            color: '#333',
                                            lineHeight: 1.7
                                        }}
                                    >
                                        "{testimonial.text}"
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#133A1A'
                                        }}
                                    >
                                        {testimonial.name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#999'
                                        }}
                                    >
                                        {testimonial.app}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Pricing / Features Comparison */}
            <Box sx={{ py: 12, bgcolor: '#ffffff' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            color: '#133A1A',
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        Todas nuestras funciones
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        sx={{
                            color: '#666',
                            mb: 6,
                            maxWidth: 600,
                            mx: 'auto'
                        }}
                    >
                        Comienza gratis y obtén más funciones avanzadas cuando las necesites
                    </Typography>

                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 700, color: '#133A1A', width: '40%' }}>Funciones</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#133A1A' }}>Plan Gratis</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#133A1A' }}>Plan PRO</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {planFeatures.map((item, index) => (
                                    <TableRow key={index} sx={{ '&:hover': { bgcolor: 'rgba(76,175,80,0.05)' } }}>
                                        <TableCell sx={{ color: '#333' }}>{item.feature}</TableCell>
                                        <TableCell align="center">
                                            {item.free ? (
                                                <CheckIcon sx={{ color: '#4caf50' }} />
                                            ) : (
                                                <Box sx={{ color: '#ccc' }}>–</Box>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.pro ? (
                                                <CheckIcon sx={{ color: '#4caf50' }} />
                                            ) : (
                                                <Box sx={{ color: '#ccc' }}>–</Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </Box>

            {/* Benefits Section */}
            <Box sx={{ py: 12, bgcolor: '#f9f9f9' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6}>
                        {benefits.map((benefit, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        p: 3,
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: alpha('#4caf50', 0.05),
                                            transform: 'translateY(-4px)'
                                        }
                                    }}
                                >
                                    <Box sx={{ mb: 2 }}>
                                        {benefit.icon}
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 1,
                                            color: '#133A1A'
                                        }}
                                    >
                                        {benefit.title}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ lineHeight: 1.6 }}
                                    >
                                        {benefit.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    py: 12,
                    bgcolor: '#133A1A',
                    color: 'white',
                    textAlign: 'center'
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        ¿Listo para organizar tus gastos?
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            mb: 4,
                            opacity: 0.9,
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            lineHeight: 1.6
                        }}
                    >
                        Comienza gratis hoy mismo. Sin tarjeta de crédito requerida.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                fontWeight: 700,
                                px: 5,
                                py: 1.5,
                                fontSize: '1rem',
                                borderRadius: 1,
                                boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: '#43a047',
                                    boxShadow: '0 8px 20px rgba(76,175,80,0.4)'
                                }
                            }}
                        >
                            Registrarse
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                borderColor: '#4caf50',
                                color: 'white !important',
                                fontWeight: 700,
                                px: 5,
                                py: 1.5,
                                fontSize: '1rem',
                                borderRadius: 1,
                                border: '2px solid',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(76,175,80,0.1)',
                                    borderColor: '#4caf50',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Iniciar sesión
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#0d2612', color: 'rgba(255,255,255,0.7)', py: 8 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" color="white" sx={{ fontWeight: 800, mb: 1 }}>
                                🌱 Brukt
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Simplificamos la forma en que compartes gastos
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <Typography variant="subtitle2" color="white" sx={{ fontWeight: 700, mb: 2 }}>
                                Producto
                            </Typography>
                            <Stack spacing={1}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'color 0.2s',
                                        '&:hover': { color: '#4caf50' }
                                    }}
                                    onClick={() => navigate('')}
                                >
                                    Acerca de Brukt
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'color 0.2s',
                                        '&:hover': { color: '#4caf50' }
                                    }}
                                >
                                    Características
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <Typography variant="subtitle2" color="white" sx={{ fontWeight: 700, mb: 2 }}>
                                Cuenta
                            </Typography>
                            <Stack spacing={1}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'color 0.2s',
                                        '&:hover': { color: '#4caf50' }
                                    }}
                                    onClick={() => navigate('/login')}
                                >
                                    Iniciar Sesión
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'color 0.2s',
                                        '&:hover': { color: '#4caf50' }
                                    }}
                                    onClick={() => navigate('/register')}
                                >
                                    Registrarse
                                </Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 3 }}>
                        <Typography variant="body2" align="center">
                            © 2026 Brukt. Todos los derechos reservados.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
