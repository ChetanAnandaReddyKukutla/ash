/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import '../../css/Role.css'
import { LinkButton } from '../LinkButton';
import { 
    Box, Button as Btn, Card, CardContent, Typography, Grid, Chip, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Avatar, IconButton, Tooltip, 
    Badge, LinearProgress, Alert, Snackbar, Fade, Zoom, useTheme, alpha, Paper,
    Skeleton, Container
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReportIcon from '@mui/icons-material/Report';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FactoryIcon from '@mui/icons-material/Factory';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BugReportIcon from '@mui/icons-material/BugReport';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { keyframes } from '@mui/system';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const Admin = () => {
    const theme = useTheme();
    const { clearAuth } = useAuth();
    const [pendingAccounts, setPendingAccounts] = useState([]);
    const [allManufacturers, setAllManufacturers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [stats, setStats] = useState({
        totalManufacturers: 0,
        pendingApprovals: 0,
        totalComplaints: 0,
        openComplaints: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Update stats whenever data changes
    useEffect(() => {
        updateStats();
    }, [pendingAccounts, allManufacturers, complaints]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchPendingAccounts(),
                fetchAllManufacturers(),
                fetchComplaints()
            ]);
        } catch (error) {
            showSnackbar('Error loading dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingAccounts = async () => {
        try {
            const response = await axios.get('/profileAll');
            const accounts = response.data.filter(profile => 
                (profile.role === 'manufacturer' || profile.role === 'retailer') && !profile.approved
            );
            setPendingAccounts(accounts);
        } catch (error) {
            console.error('Error fetching pending accounts:', error);
        }
    };

    const fetchAllManufacturers = async () => {
        try {
            const response = await axios.get('/profileAll');
            const manufacturers = response.data.filter(profile => 
                profile.role === 'manufacturer'
            );
            setAllManufacturers(manufacturers);
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
        }
    };

    const fetchComplaints = async () => {
        try {
            const response = await axios.get('/complaints');
            setComplaints(response.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            // Fallback to mock data if endpoint doesn't exist yet
            const mockComplaints = [
                {
                    id: 1,
                    product_id: 'PROD001',
                    complainant: 'retailer_user1',
                    complaint_type: 'Product Quality',
                    description: 'Product received in damaged condition',
                    status: 'Open',
                    created_at: '2024-01-15'
                },
                {
                    id: 2,
                    product_id: 'PROD002',
                    complainant: 'consumer_user2',
                    complaint_type: 'Counterfeit',
                    description: 'Suspected fake product',
                    status: 'Under Review',
                    created_at: '2024-01-14'
                }
            ];
            setComplaints(mockComplaints);
        }
    };

    const updateStats = () => {
        setStats({
            totalManufacturers: allManufacturers.length,
            pendingApprovals: pendingAccounts.length,
            totalComplaints: complaints.length,
            openComplaints: complaints.filter(c => c.status === 'Open').length
        });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleApproveManufacturer = async (manufacturerId) => {
        try {
            await axios.put(`/approve-manufacturer/${manufacturerId}`, { approved: true });
            await loadDashboardData();
            showSnackbar('Manufacturer approved successfully!', 'success');
        } catch (error) {
            console.error('Error approving manufacturer:', error);
            showSnackbar('Error approving manufacturer', 'error');
        }
    };

    const handleRejectManufacturer = async (manufacturerId) => {
        try {
            await axios.delete(`/reject-manufacturer/${manufacturerId}`);
            await loadDashboardData();
            showSnackbar('Manufacturer rejected and removed!', 'success');
        } catch (error) {
            console.error('Error rejecting manufacturer:', error);
            showSnackbar('Error rejecting manufacturer', 'error');
        }
    };

    const handleRefresh = () => {
        loadDashboardData();
    };

    const handleLogout = () => {
        clearAuth();
        window.location.href = '/login';
    };

    const handleViewManufacturer = (manufacturer) => {
        setSelectedManufacturer(manufacturer);
        setViewDialogOpen(true);
    };

    const handleViewComplaint = (complaint) => {
        setSelectedComplaint(complaint);
        setComplaintDialogOpen(true);
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', 'Poppins', sans-serif",
            // Blockchain background pattern
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                    linear-gradient(rgba(79, 209, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(79, 209, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                opacity: 0.5,
                zIndex: 0,
            }
        }}>
            <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
                {/* Modern Header */}
                <Fade in timeout={600}>
                    <Paper sx={{ 
                        mb: 4,
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ 
                                        width: 56, 
                                        height: 56,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
                                    }}>
                                        <DashboardIcon sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography 
                                            variant="h3" 
                                            sx={{ 
                                                fontWeight: 800,
                                                fontSize: { xs: '1.75rem', md: '2.5rem' },
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                letterSpacing: '-0.5px',
                                                mb: 0.5
                                            }}
                                        >
                                            Admin Dashboard
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                            📊 Manage manufacturers, complaints, and system operations
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Tooltip title="Refresh Dashboard">
                                        <IconButton 
                                            onClick={handleRefresh} 
                                            disabled={loading}
                                            sx={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                '&:hover': {
                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                    transform: 'rotate(180deg)',
                                                    transition: 'all 0.6s ease'
                                                }
                                            }}
                                        >
                                            <RefreshIcon sx={{ color: '#fff' }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Btn 
                                        onClick={handleLogout}
                                        variant="outlined" 
                                        startIcon={<LogoutIcon />}
                                        sx={{ 
                                            borderRadius: '12px',
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                            color: '#fff',
                                            px: 3,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                borderColor: '#EA5455',
                                                background: 'rgba(234, 84, 85, 0.1)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(234, 84, 85, 0.3)'
                                            }
                                        }}
                                    >
                                        Logout
                                    </Btn>
                                </Box>
                            </Box>
                            {loading && (
                                <LinearProgress 
                                    sx={{ 
                                        mt: 2, 
                                        borderRadius: 2,
                                        height: 4,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                        }
                                    }} 
                                />
                            )}
                        </CardContent>
                    </Paper>
                </Fade>

                {/* Modern Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[
                        {
                            title: 'Total Manufacturers',
                            value: stats.totalManufacturers,
                            icon: <FactoryIcon sx={{ fontSize: 48 }} />,
                            gradient: 'linear-gradient(135deg, #28C76F 0%, #1e9b5c 100%)',
                            color: '#28C76F',
                            delay: 700,
                            link: '/admin/manufacturers'
                        },
                        {
                            title: 'Pending Approvals',
                            value: stats.pendingApprovals,
                            icon: <AssignmentTurnedInIcon sx={{ fontSize: 48 }} />,
                            gradient: 'linear-gradient(135deg, #FF9F43 0%, #e68a2e 100%)',
                            color: '#FF9F43',
                            delay: 850,
                            badge: stats.pendingApprovals > 0
                        },
                        {
                            title: 'Total Complaints',
                            value: stats.totalComplaints,
                            icon: <BugReportIcon sx={{ fontSize: 48 }} />,
                            gradient: 'linear-gradient(135deg, #00CFE8 0%, #00a8bd 100%)',
                            color: '#00CFE8',
                            delay: 1000
                        },
                        {
                            title: 'Open Complaints',
                            value: stats.openComplaints,
                            icon: <ReportProblemIcon sx={{ fontSize: 48 }} />,
                            gradient: 'linear-gradient(135deg, #EA5455 0%, #d13f40 100%)',
                            color: '#EA5455',
                            delay: 1150,
                            badge: stats.openComplaints > 0
                        },
                    ].map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Fade in timeout={stat.delay}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '20px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 12px 40px ${alpha(stat.color, 0.3)}`,
                                            border: `1px solid ${alpha(stat.color, 0.3)}`,
                                            background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, rgba(255, 255, 255, 0.05) 100%)`,
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: stat.gradient,
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography 
                                                variant="h2" 
                                                sx={{ 
                                                    fontWeight: 800,
                                                    fontSize: '2.5rem',
                                                    color: '#fff',
                                                    lineHeight: 1,
                                                    mb: 1
                                                }}
                                            >
                                                {loading ? (
                                                    <Skeleton variant="text" width={60} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                                                ) : (
                                                    stat.value
                                                )}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {stat.title}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ 
                                            color: stat.color,
                                            opacity: 0.3,
                                            position: 'relative'
                                        }}>
                                            {stat.badge && stat.value > 0 && (
                                                <Badge 
                                                    badgeContent={stat.value} 
                                                    color="error"
                                                    sx={{
                                                        '& .MuiBadge-badge': {
                                                            animation: `${pulse} 2s ease-in-out infinite`
                                                        }
                                                    }}
                                                >
                                                    {stat.icon}
                                                </Badge>
                                            )}
                                            {(!stat.badge || stat.value === 0) && stat.icon}
                                        </Box>
                                    </Box>
                                    {stat.value > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                                            <TrendingUpIcon sx={{ fontSize: 16, color: stat.color }} />
                                            <Typography variant="caption" sx={{ color: stat.color, fontWeight: 600 }}>
                                                Active
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Fade>
                        </Grid>
                    ))}
                </Grid>

                {/* Main Content */}
                <Grid container spacing={3}>
                    {/* Pending Approvals */}
                <Grid item xs={12} lg={6}>
                    <Fade in timeout={1300}>
                        <Paper sx={{ 
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ 
                                            background: 'linear-gradient(135deg, #FF9F43 0%, #e68a2e 100%)',
                                            width: 40,
                                            height: 40
                                        }}>
                                            <AssignmentTurnedInIcon />
                                        </Avatar>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                                            Pending Approvals
                                            {pendingAccounts.length > 0 && (
                                                <Chip 
                                                    label={pendingAccounts.length} 
                                                    size="small" 
                                                    sx={{ 
                                                        ml: 1.5,
                                                        background: '#FF9F43',
                                                        color: '#fff',
                                                        fontWeight: 600
                                                    }} 
                                                />
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                                {pendingAccounts.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <CheckCircleIcon sx={{ fontSize: 80, color: '#28C76F', mb: 2, opacity: 0.8 }} />
                                        <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                                            All Clear! ✨
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            No pending approvals at the moment
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ maxHeight: 400 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, border: 'none' }}>
                                                        Company
                                                    </TableCell>
                                                    <TableCell sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, border: 'none' }}>
                                                        Username
                                                    </TableCell>
                                                    <TableCell sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, border: 'none' }}>
                                                        Role
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, border: 'none' }}>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pendingAccounts.map((account) => (
                                                    <TableRow 
                                                        key={account.id} 
                                                        hover
                                                        sx={{
                                                            '&:hover': {
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                            }
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: '#fff', border: 'none', fontWeight: 600 }}>
                                                            {account.name}
                                                        </TableCell>
                                                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none' }}>
                                                            {account.username}
                                                        </TableCell>
                                                        <TableCell sx={{ border: 'none' }}>
                                                            <Chip 
                                                                label={account.role.charAt(0).toUpperCase() + account.role.slice(1)} 
                                                                size="small"
                                                                sx={{
                                                                    background: account.role === 'retailer' 
                                                                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                                                        : 'linear-gradient(135deg, #00CFE8, #00a8bd)',
                                                                    color: '#fff',
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ border: 'none' }}>
                                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                                <Tooltip title="View Details">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleViewManufacturer(account)}
                                                                        sx={{
                                                                            background: 'rgba(0, 207, 232, 0.1)',
                                                                            border: '1px solid rgba(0, 207, 232, 0.3)',
                                                                            color: '#00CFE8',
                                                                            '&:hover': {
                                                                                background: 'rgba(0, 207, 232, 0.2)',
                                                                                transform: 'scale(1.1)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <VisibilityIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Approve">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleApproveManufacturer(account.id)}
                                                                        sx={{
                                                                            background: 'rgba(40, 199, 111, 0.1)',
                                                                            border: '1px solid rgba(40, 199, 111, 0.3)',
                                                                            color: '#28C76F',
                                                                            '&:hover': {
                                                                                background: 'rgba(40, 199, 111, 0.2)',
                                                                                transform: 'scale(1.1)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CheckCircleIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Reject">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleRejectManufacturer(account.id)}
                                                                        sx={{
                                                                            background: 'rgba(234, 84, 85, 0.1)',
                                                                            border: '1px solid rgba(234, 84, 85, 0.3)',
                                                                            color: '#EA5455',
                                                                            '&:hover': {
                                                                                background: 'rgba(234, 84, 85, 0.2)',
                                                                                transform: 'scale(1.1)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CancelIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Paper>
                    </Fade>
                </Grid>

                {/* All Manufacturers */}
                <Grid item xs={12} lg={6}>
                    <Fade in timeout={1450}>
                        <Paper sx={{ 
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Avatar sx={{ 
                                        background: 'linear-gradient(135deg, #28C76F 0%, #1e9b5c 100%)',
                                        width: 40,
                                        height: 40
                                    }}>
                                        <FactoryIcon />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                                        All Manufacturers
                                        <Chip 
                                            label={allManufacturers.length} 
                                            size="small" 
                                            sx={{ 
                                                ml: 1.5,
                                                background: '#28C76F',
                                                color: '#fff',
                                                fontWeight: 600
                                            }} 
                                        />
                                    </Typography>
                                </Box>
                                
                                {allManufacturers.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <FactoryIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                                        <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                                            No Manufacturers Yet
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            Waiting for manufacturer registrations
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ maxHeight: 400 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, border: 'none' }}>
                                                        Company
                                                    </TableCell>
                                                    <TableCell sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, border: 'none' }}>
                                                        Status
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, border: 'none' }}>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {allManufacturers.map((manufacturer) => (
                                                    <TableRow 
                                                        key={manufacturer.id} 
                                                        hover
                                                        sx={{
                                                            '&:hover': {
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                            }
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: '#fff', border: 'none', fontWeight: 600 }}>
                                                            {manufacturer.name}
                                                        </TableCell>
                                                        <TableCell sx={{ border: 'none' }}>
                                                            <Chip 
                                                                label={manufacturer.approved ? "✓ Approved" : "⏳ Pending"} 
                                                                size="small"
                                                                sx={{
                                                                    background: manufacturer.approved 
                                                                        ? 'rgba(40, 199, 111, 0.2)'
                                                                        : 'rgba(255, 159, 67, 0.2)',
                                                                    border: manufacturer.approved
                                                                        ? '1px solid rgba(40, 199, 111, 0.5)'
                                                                        : '1px solid rgba(255, 159, 67, 0.5)',
                                                                    color: manufacturer.approved ? '#28C76F' : '#FF9F43',
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ border: 'none' }}>
                                                            <Tooltip title="View Details">
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleViewManufacturer(manufacturer)}
                                                                    sx={{
                                                                        background: 'rgba(0, 207, 232, 0.1)',
                                                                        border: '1px solid rgba(0, 207, 232, 0.3)',
                                                                        color: '#00CFE8',
                                                                        '&:hover': {
                                                                            background: 'rgba(0, 207, 232, 0.2)',
                                                                            transform: 'scale(1.1)'
                                                                        }
                                                                    }}
                                                                >
                                                                    <VisibilityIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Paper>
                    </Fade>
                </Grid>
            </Grid>

            {/* Status Badge */}
            <Fade in timeout={1600}>
                <Box sx={{ 
                    mt: 4,
                    p: 2,
                    borderRadius: '16px',
                    background: stats.pendingApprovals === 0 && stats.openComplaints === 0 
                        ? 'rgba(40, 199, 111, 0.1)'
                        : 'rgba(255, 159, 67, 0.1)',
                    border: stats.pendingApprovals === 0 && stats.openComplaints === 0
                        ? '1px solid rgba(40, 199, 111, 0.3)'
                        : '1px solid rgba(255, 159, 67, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    {stats.pendingApprovals === 0 && stats.openComplaints === 0 ? (
                        <>
                            <CheckCircleIcon sx={{ color: '#28C76F', fontSize: 32 }} />
                            <Typography sx={{ color: '#28C76F', fontWeight: 600, fontSize: '1.1rem' }}>
                                ✨ All Clear! System is running smoothly
                            </Typography>
                        </>
                    ) : (
                        <>
                            <WarningIcon sx={{ color: '#FF9F43', fontSize: 32 }} />
                            <Typography sx={{ color: '#FF9F43', fontWeight: 600, fontSize: '1.1rem' }}>
                                ⚠️ {stats.pendingApprovals} pending approval(s) • {stats.openComplaints} open complaint(s)
                            </Typography>
                        </>
                    )}
                </Box>
            </Fade>
            </Container>

            {/* View Manufacturer Dialog */}
            <Dialog 
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        background: 'rgba(15, 32, 39, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {complaint.complainant}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {complaint.complaint_type}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={complaint.status} 
                                                                color={complaint.status === 'Open' ? 'error' : 'warning'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {complaint.created_at}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="View Details">
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleViewComplaint(complaint)}
                                                                    color="primary"
                                                                >
                                                                    <VisibilityIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            </Grid>

            {/* Legacy Admin Functions */}
            <Fade in timeout={2400}>
                <Card sx={{ 
                    mt: 3,
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <DashboardIcon />
                            System Management
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <LinkButton 
                                to="/add-account" 
                                className="btns" 
                                buttonStyle='btn--long' 
                                buttonSize='btn--large'
                                sx={{ borderRadius: 2 }}
                            >
                                Add Account
                            </LinkButton>
                            <LinkButton 
                                to="/manage-account" 
                                className="btns" 
                                buttonStyle='btn--long' 
                                buttonSize='btn--large'
                                sx={{ borderRadius: 2 }}
                            >
                                Manage Accounts
                            </LinkButton>
                        </Box>
                    </CardContent>
                </Card>
            </Fade>

            {/* Manufacturer Details Dialog */}
            <Dialog 
                open={viewDialogOpen} 
                onClose={() => setViewDialogOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(10px)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                    color: 'white'
                }}>
                    <BusinessIcon />
                    Manufacturer Details
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedManufacturer && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    value={selectedManufacturer.name || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={selectedManufacturer.username || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={selectedManufacturer.description || ''}
                                    multiline
                                    rows={3}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Website"
                                    value={selectedManufacturer.website || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    value={selectedManufacturer.location || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Btn 
                        onClick={() => setViewDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Close
                    </Btn>
                </DialogActions>
            </Dialog>

            {/* Complaint Details Dialog */}
            <Dialog 
                open={complaintDialogOpen} 
                onClose={() => setComplaintDialogOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(10px)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    background: 'linear-gradient(45deg, #F44336, #D32F2F)',
                    color: 'white'
                }}>
                    <ReportIcon />
                    Complaint Details
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedComplaint && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Product ID"
                                    value={selectedComplaint.product_id || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Complainant"
                                    value={selectedComplaint.complainant || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Complaint Type"
                                    value={selectedComplaint.complaint_type || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Status"
                                    value={selectedComplaint.status || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={selectedComplaint.description || ''}
                                    multiline
                                    rows={4}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Btn 
                        onClick={() => setComplaintDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Close
                    </Btn>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Admin;