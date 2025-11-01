import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    CircularProgress,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Fade,
    Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { keyframes } from '@mui/system';
import bgGlobe from '../../img/ChatGPT Image Nov 1, 2025, 04_53_24 PM.png';

dayjs.extend(relativeTime);

// Animations
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

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const statusChipProps = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'resolved':
            return { color: 'success', label: 'Resolved' };
        case 'in progress':
            return { color: 'warning', label: 'In Progress' };
        case 'rejected':
            return { color: 'default', label: 'Rejected' };
        default:
            return { color: 'error', label: status || 'Open' };
    }
};

const Consumer = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const username = useMemo(() => (auth?.user || '').toLowerCase(), [auth?.user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!username) {
                setError('Missing user information. Please log in again.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.get(`/consumer/products/${username}`);
                setProducts(response.data || []);
            } catch (err) {
                console.error('Failed to load consumer dashboard', err);
                if (err?.response?.status === 404) {
                    setProducts([]);
                    setError(null);
                } else if (err?.code === 'ERR_NETWORK') {
                    setError('Cannot reach the server. Please ensure the backend is running on port 5000.');
                } else {
                    setError('Failed to load your dashboard. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    const handleViewProduct = (serialNumber) => {
        if (!serialNumber) return;
        navigate(`/consumer/products/${serialNumber}`, { state: { cameFromDashboard: true } });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at bottom right, #1a2a3a, #0b1a2e)',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Poppins', 'Inter', sans-serif",
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 157, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 157, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    opacity: 0.5,
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '20%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    backgroundImage: `url(${bgGlobe})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    animation: `${float} 8s ease-in-out infinite`,
                    pointerEvents: 'none',
                },
                py: { xs: 4, md: 6 },
                px: { xs: 2, md: 6 }
            }}
        >
            {/* Logout Button */}
            <Tooltip title="Logout" arrow>
                <IconButton
                    onClick={() => navigate('/login')}
                    sx={{
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        zIndex: 1000,
                        '&:hover': {
                            background: 'rgba(234, 84, 85, 0.2)',
                            borderColor: 'rgba(234, 84, 85, 0.5)',
                            transform: 'rotate(90deg)',
                            transition: 'all 0.3s ease'
                        }
                    }}
                >
                    <LogoutIcon />
                </IconButton>
            </Tooltip>

            <Fade in timeout={800}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Header Section */}
                    <Paper
                        sx={{
                            mb: 4,
                            p: 4,
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                            animation: `${fadeIn} 1s ease-out`
                        }}
                    >
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            background: 'linear-gradient(135deg, #00FF9D, #00D68F)',
                                            boxShadow: '0 4px 20px rgba(0, 255, 157, 0.4)'
                                        }}
                                    >
                                        <InventoryIcon sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: { xs: '1.75rem', md: '2.5rem' },
                                                background: 'linear-gradient(to right, #00FF9D, #00D68F)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                letterSpacing: '-0.5px'
                                            }}
                                        >
                                            Welcome back{subtitleSuffix(username)}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                            Track your products and stay up to date on complaint resolutions
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<QrCodeScannerIcon />}
                                onClick={() => navigate('/scanner')}
                                sx={{
                                    background: 'linear-gradient(90deg, #00FF9D, #00D68F)',
                                    color: '#000',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 1.5,
                                    px: 4,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 255, 157, 0.4)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(0, 255, 157, 0.6)',
                                        transform: 'translateY(-2px)',
                                        background: 'linear-gradient(90deg, #14FFB1, #14E49F)',
                                    }
                                }}
                            >
                                Scan Product
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Content */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#00FF9D' }} />
                        </Box>
                    ) : error ? (
                        <Paper
                            sx={{
                                p: 4,
                                maxWidth: 480,
                                mx: 'auto',
                                textAlign: 'center',
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 99, 71, 0.3)',
                                borderRadius: '20px'
                            }}
                        >
                            <Typography color="#FF6347" sx={{ mb: 2, fontWeight: 600 }}>{error}</Typography>
                            <Button
                                variant="contained"
                                onClick={() => window.location.reload()}
                                sx={{
                                    background: 'linear-gradient(90deg, #FF6B6B, #EE5A6F)',
                                    fontWeight: 600,
                                    textTransform: 'none'
                                }}
                            >
                                Try Again
                            </Button>
                        </Paper>
                    ) : products.length === 0 ? (
                        <Paper
                            sx={{
                                p: 4,
                                maxWidth: 480,
                                mx: 'auto',
                                textAlign: 'center',
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px'
                            }}
                        >
                            <InventoryIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1, color: '#fff', fontWeight: 600 }}>
                                No products added yet
                            </Typography>
                            <Typography sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.6)' }}>
                                Scan a product's QR code, then choose "Save to My Products" to see it here
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<QrCodeScannerIcon />}
                                onClick={() => navigate('/scanner')}
                                sx={{
                                    background: 'linear-gradient(90deg, #00FF9D, #00D68F)',
                                    color: '#000',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 255, 157, 0.4)',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(0, 255, 157, 0.6)',
                                    }
                                }}
                            >
                                Scan a Product
                            </Button>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {products.map((product, index) => {
                                const chip = statusChipProps(product.latest_status);
                                const expiryStatus = getExpiryStatus(product.expiry_date);
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={`${product.serial_number}-${product.added_at}`}>
                                        <Fade in timeout={800 + index * 100}>
                                            <Card
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '16px',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: '0 12px 40px rgba(0, 255, 157, 0.2)',
                                                        border: '1px solid rgba(0, 255, 157, 0.3)'
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
                                                        Serial #{product.serial_number || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                                                        {product.name || 'Product'}
                                                    </Typography>
                                                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                                                        {product.brand || '—'}
                                                    </Typography>
                                                    {product.manufacturer && (
                                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                                                            Manufacturer: {product.manufacturer}
                                                        </Typography>
                                                    )}
                                                    {product.expiry_date && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                                            {expiryStatus && (
                                                                <WarningAmberIcon sx={{ fontSize: 16, color: expiryStatus.color }} />
                                                            )}
                                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                                Expires: {dayjs(product.expiry_date).format('MMM D, YYYY')}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {product.latest_status && (
                                                        <Box sx={{ mt: 2 }}>
                                                            <Chip
                                                                size="small"
                                                                color={chip.color}
                                                                label={chip.label}
                                                                icon={chip.color === 'success' ? <CheckCircleIcon /> : undefined}
                                                            />
                                                        </Box>
                                                    )}

                                                    {product.latest_complaint && (
                                                        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                                                            Note: {product.latest_complaint}
                                                        </Typography>
                                                    )}
                                                </CardContent>
                                                <CardActions sx={{ px: 3, pb: 3 }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        fullWidth
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleViewProduct(product.serial_number)}
                                                        sx={{
                                                            borderColor: 'rgba(0, 255, 157, 0.3)',
                                                            color: '#00FF9D',
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            '&:hover': {
                                                                borderColor: '#00FF9D',
                                                                background: 'rgba(0, 255, 157, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Fade>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Box>
            </Fade>
        </Box>
    );
};

const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = dayjs(expiryDate);
    if (!expiry.isValid()) return null;

    const today = dayjs();
    const diff = expiry.startOf('day').diff(today.startOf('day'), 'day');

    if (diff < 0) {
        return { color: 'error.main', message: `Expired ${expiry.fromNow()}` };
    }
    if (diff === 0) {
        return { color: 'warning.main', message: 'Expires today' };
    }
    if (diff <= 2) {
        return { color: 'warning.main', message: `Expires in ${diff} day${diff === 1 ? '' : 's'}` };
    }
    return { color: 'text.secondary', message: `Expires on ${expiry.format('MMM D, YYYY')}` };
};

const subtitleSuffix = (username) => {
    if (!username) return '!';
    return `, ${username}!`;
};

export default Consumer;
