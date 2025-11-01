import { 
    Box, Paper, Typography, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert,
    Snackbar, Avatar, Card, CardContent
} from '@mui/material';
import bgImg from '../../img/bg.png';
import axios from '../../api/axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StoreIcon from '@mui/icons-material/Store';

const ManageAccount = () => {
    const [accounts, setAccounts] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get('/profileAll');
            // Filter out admin accounts - only show manufacturers, retailers, and consumers
            const filteredAccounts = response.data.filter(account => account.role !== 'admin');
            setAccounts(filteredAccounts);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            showSnackbar('Error loading accounts', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleDeleteClick = (account) => {
        setSelectedAccount(account);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            console.log('Deleting account:', selectedAccount.username);
            const response = await axios.delete(`/delete-account/${selectedAccount.username}`);
            console.log('Delete response:', response.data);
            await fetchAccounts();
            showSnackbar('Account deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting account:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Error deleting account';
            showSnackbar(errorMessage, 'error');
        } finally {
            setDeleteDialogOpen(false);
            setSelectedAccount(null);
        }
    };

    const handleViewDetails = (account) => {
        navigate(`/company-details/${account.username}`);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <AdminPanelSettingsIcon />;
            case 'manufacturer':
                return <BusinessIcon />;
            case 'retailer':
                return <StoreIcon />;
            case 'consumer':
                return <PersonIcon />;
            default:
                return <PersonIcon />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'manufacturer':
                return 'primary';
            case 'retailer':
                return 'secondary';
            case 'consumer':
                return 'success';
            default:
                return 'default';
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Box sx={{
            backgroundImage: `url(${bgImg})`,
            minHeight: "100vh",
            backgroundRepeat: "no-repeat",
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundSize: 'cover',
            zIndex: -2,
            overflowY: "scroll",
            p: 3
        }}>
            <Card sx={{ 
                maxWidth: "95%", 
                margin: "auto", 
                mt: 2, 
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)"
            }}>
                <CardContent>
                <Typography
                        variant="h4"
                        sx={{
                            textAlign: "center", 
                            mb: 3,
                            fontFamily: 'Gambetta', 
                            fontWeight: "bold",
                            color: 'primary.main'
                        }}
                    >
                        Account Management
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                        View and manage business accounts (manufacturers, retailers, consumers). Click on company names to view detailed information.
                    </Typography>

                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Company/Name</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow key={account.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {getRoleIcon(account.role)}
                                                </Avatar>
                                                <Box>
                                                    <Typography 
                                                        variant="subtitle1" 
                                                        sx={{ 
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            '&:hover': { color: 'primary.main' }
                                                        }}
                                                        onClick={() => handleViewDetails(account)}
                                                    >
                                                        {account.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {account.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {account.username}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={account.role} 
                                                color={getRoleColor(account.role)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {account.location || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={account.approved ? "Approved" : "Pending"} 
                                                color={account.approved ? "success" : "warning"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="View Details">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleViewDetails(account)}
                                                        color="primary"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {account.role !== 'admin' && (
                                                    <Tooltip title="Delete Account">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleDeleteClick(account)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            sx={{ minWidth: 120 }}
                        >
                            Back
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Account Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the account for <strong>{selectedAccount?.name}</strong> ({selectedAccount?.username})?
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        This action cannot be undone. All data associated with this account will be permanently deleted.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
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
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ManageAccount;