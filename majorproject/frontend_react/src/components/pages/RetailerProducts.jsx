import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    AlertTitle,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS as ENV_CONTRACT_ADDRESS, buildApiUrl } from '../../config';
import abi from '../../utils/Identeefi.json';

const RetailerProducts = () => {
    const CONTRACT_ADDRESS = ENV_CONTRACT_ADDRESS;
    const CONTRACT_ABI = abi.abi;
    
    const { auth } = useAuth();
    const [products, setProducts] = useState([]);
    const [alertProducts, setAlertProducts] = useState({ total: 0, today: 0 });
    const [retailerName, setRetailerName] = useState('');
    const [complaintDialog, setComplaintDialog] = useState({ open: false, product: null });
    const [complaintType, setComplaintType] = useState('');
    const [complaintDescription, setComplaintDescription] = useState('');
    const [complaintLocation, setComplaintLocation] = useState('');
    const [complaintProof, setComplaintProof] = useState(null);

    const [complaintSubmitting, setComplaintSubmitting] = useState(false);
    const [complaintFeedback, setComplaintFeedback] = useState(null);
    const [myComplaints, setMyComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(false);
    const productsRef = useRef([]);

    const fetchRetailerProfile = useCallback(async () => {
        if (!auth?.user) {
            setRetailerName('');
            return '';
        }

        try {
            const response = await apiClient.get(`/profile/${auth.user}`);
            const profile = Array.isArray(response.data) ? response.data[0] : response.data;
            setRetailerName(profile?.name || '');
            return profile?.name || '';
        } catch (err) {
            console.warn('Failed to load retailer profile', err);
            setRetailerName('');
            return '';
        }
    }, [auth?.user]);

    const checkExpiryAlerts = useCallback((productsList) => {
        const today = new Date();
        const twoDaysLater = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
        const alerts = (productsList || []).filter(product => {
            if (!product.expiryDate) return false;
            const expiryDate = new Date(product.expiryDate);
            return expiryDate <= twoDaysLater && expiryDate >= today;
        });

        const expiringToday = alerts.filter(product => {
            const expiryDate = new Date(product.expiryDate);
            const expiryDateStr = expiryDate.toDateString();
            const todayStr = today.toDateString();
            return expiryDateStr === todayStr;
        });

        setAlertProducts({
            total: alerts.length,
            today: expiringToday.length,
            products: alerts.map((product) => ({
                serialNumber: product.serialNumber,
                productId: product.productId,
                name: product.name
            })),
        });
    }, []);

    const fetchProducts = useCallback(async (profileNameOverride = '') => {
        try {
            // Fetch all products from database
            const response = await apiClient.get('/product/all');
            const allProducts = response.data;

            if (!CONTRACT_ADDRESS) {
                console.warn('Contract address is not configured; skipping blockchain filtering.');
                setProducts(allProducts);
                productsRef.current = allProducts;
                checkExpiryAlerts(allProducts);
                return;
            }

            // Filter products that have been scanned by this retailer
            // Check blockchain to see if retailer has touched this product
            const retailerProducts = [];
            const effectiveName = profileNameOverride || retailerName;
            const normalizedRetailerName = (effectiveName || '').trim().toLowerCase();
            const normalizedAuthUser = (auth?.user || '').trim().toLowerCase();

            for (const product of allProducts) {
                try {
                    // Fetch product details from blockchain
                    const { ethereum } = window;
                    if (ethereum) {
                        const provider = new ethers.providers.Web3Provider(ethereum);
                        const signer = provider.getSigner();
                        const productContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                        
                        const productData = await productContract.getProduct(product.serialnumber);
                        
                        // Check if this product has been touched by the current retailer
                        // by checking if retailer's name is in the history
                        if (productData && productData.length > 0) {
                            const history = productData[8] || [];
                            const expiryFromChain = productData[7] || '';
                            const retailerInHistory = history.some(item => {
                                const actorValue = item?.actor || item?.[1] || '';
                                const normalizedActor = actorValue.trim().toLowerCase();
                                if (!normalizedActor) {
                                    return false;
                                }
                                return (
                                    (normalizedRetailerName && normalizedActor === normalizedRetailerName) ||
                                    (normalizedAuthUser && normalizedActor === normalizedAuthUser)
                                );
                            });
                            
                            if (retailerInHistory) {
                                retailerProducts.push({
                                    serialNumber: product.serialnumber,
                                    name: product.name,
                                    brand: product.brand,
                                    manufacturer: product.manufacturer,
                                    image: product.image,
                                    expiryDate: expiryFromChain || product.expiry_date,
                                    productId: product.id || product.product_id || product.serialnumber
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.log('Error fetching product details:', err);
                }
            }
            
            setProducts(retailerProducts);
            productsRef.current = retailerProducts;
            checkExpiryAlerts(retailerProducts);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    }, [CONTRACT_ADDRESS, CONTRACT_ABI, auth?.user, checkExpiryAlerts, retailerName]);

    const fetchRetailerComplaints = useCallback(async (usernameOverride, displayNameOverride) => {
        const username = (usernameOverride ?? auth?.user ?? '').toLowerCase();
        const displayName = (displayNameOverride ?? retailerName ?? '').toLowerCase();

        setComplaintsLoading(true);
        try {
            const response = await apiClient.get('/complaints');
            const filtered = (response.data || []).filter((complaint) => {
                const complainant = (complaint.complainant || '').toLowerCase();
                return (username && complainant === username) || (displayName && complainant === displayName);
            });
            setMyComplaints(filtered);
        } catch (err) {
            console.warn('Failed to fetch retailer complaints', err);
            setMyComplaints([]);
        } finally {
            setComplaintsLoading(false);
        }
    }, [auth?.user, retailerName]);

    useEffect(() => {
        let interval;

        const init = async () => {
            const profileName = await fetchRetailerProfile();
            await fetchProducts(profileName);
            await fetchRetailerComplaints(auth?.user, profileName);

            interval = setInterval(() => {
                checkExpiryAlerts(productsRef.current);
            }, 60000);
        };

        init();

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [auth.user, fetchRetailerProfile, fetchProducts, checkExpiryAlerts, fetchRetailerComplaints]);

    const getDaysUntilExpiry = (expiryDate) => {
        if (!expiryDate) return 'Not set';
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Expires today';
        return `${diffDays} days`;
    };

    const getExpiryColor = (expiryDate) => {
        if (!expiryDate) return 'default';
        const diffTime = new Date(expiryDate) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'error';
        if (diffDays === 0) return 'error';
        if (diffDays <= 2) return 'warning';
        return 'success';
    };

    const openComplaintDialog = (product) => {
        setComplaintDialog({ open: true, product });
        setComplaintType('');
        setComplaintDescription('');
        setComplaintLocation('');
        setComplaintProof(null);
        setComplaintFeedback(null);
    };

    const closeComplaintDialog = () => {
        if (complaintSubmitting) return;
        setComplaintDialog({ open: false, product: null });
        setComplaintLocation('');
        setComplaintProof(null);
        setComplaintFeedback(null);
    };

    const submitComplaint = async (event) => {
        event.preventDefault();
        if (!complaintDialog.product) {
            return;
        }

        setComplaintSubmitting(true);
        setComplaintFeedback(null);

        try {
            let evidenceFileName = null;

            if (complaintProof) {
                const formData = new FormData();
                formData.append('proof', complaintProof);

                const uploadResponse = await apiClient.post('/upload/complaint', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                evidenceFileName = uploadResponse?.data?.fileName || null;
            }

            await apiClient.post('/add-complaint', {
                productId: complaintDialog.product.serialNumber,
                complainant: auth?.user || '',
                complaintType: complaintType || 'General',
                description: complaintDescription,
                status: 'Open',
                location: complaintLocation,
                evidence: evidenceFileName
            });

            await fetchProducts();
            await fetchRetailerComplaints();

            setComplaintFeedback({ type: 'success', message: 'Complaint submitted successfully.' });
            setComplaintSubmitting(false);
            setTimeout(() => {
                closeComplaintDialog();
            }, 1200);
        } catch (err) {
            console.error('Failed to submit complaint', err);
            setComplaintFeedback({ type: 'error', message: 'Failed to submit complaint. Please try again.' });
            setComplaintSubmitting(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
            <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px', backgroundColor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Retailer Products Dashboard</Typography>
                    <IconButton component={Link} to="/login" color="primary">
                        <LogoutIcon />
                    </IconButton>
                </Box>
            </Paper>

            {alertProducts.total > 0 && (
                <Alert severity="error" sx={{ marginBottom: '20px' }}>
                    <AlertTitle>Warning</AlertTitle>
                    {alertProducts.total} product(s) expiring within 2 days.
                    {alertProducts.products && alertProducts.products.length > 0 && (
                        <Box component="ul" sx={{ mt: 1, pl: 3, mb: 0 }}>
                            {alertProducts.products.map((product) => (
                                <Box component="li" key={product.serialNumber || product.productId}>
                                    #{product.productId || product.serialNumber} — {product.name || product.serialNumber}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Alert>
            )}

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ backgroundColor: '#4caf50' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: 'white' }}>Total Products</Typography>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {products.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ backgroundColor: alertProducts.total > 0 ? '#ff9800' : '#4caf50' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: 'white' }}>Expiring Soon</Typography>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {alertProducts.total}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Image</strong></TableCell>
                            <TableCell><strong>Product Name</strong></TableCell>
                            <TableCell><strong>Brand</strong></TableCell>
                            <TableCell><strong>Manufacturer</strong></TableCell>
                            <TableCell><strong>Product ID</strong></TableCell>
                            <TableCell><strong>Serial Number</strong></TableCell>
                            <TableCell><strong>Expiry Date</strong></TableCell>
                            <TableCell><strong>Days Remaining</strong></TableCell>
                            <TableCell><strong>Complaint</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.serialNumber}>
                                <TableCell>
                                    <Avatar 
                                        src={product.image ? buildApiUrl(`/uploads/product/${product.image}`) : undefined}
                                        alt={product.name}
                                        sx={{ width: 50, height: 50 }}
                                    />
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.brand}</TableCell>
                                <TableCell>{product.manufacturer}</TableCell>
                                <TableCell>{product.productId || '—'}</TableCell>
                                <TableCell>{product.serialNumber}</TableCell>
                                <TableCell>{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'Not set'}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={getDaysUntilExpiry(product.expiryDate)} 
                                        color={getExpiryColor(product.expiryDate)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button variant="outlined" size="small" onClick={() => openComplaintDialog(product)}>
                                        Report Issue
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Card sx={{ marginTop: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        My Complaint History
                    </Typography>
                    {complaintsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : myComplaints.length === 0 ? (
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            You haven't submitted any complaints yet.
                        </Typography>
                    ) : (
                        <Table size="small" sx={{ mt: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product ID</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {myComplaints.map((complaint) => (
                                    <TableRow key={complaint.id}>
                                        <TableCell>{complaint.product_id}</TableCell>
                                        <TableCell>{complaint.complaint_type || '—'}</TableCell>
                                        <TableCell>{complaint.description}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={complaint.status || 'Open'}
                                                color={complaint.status === 'Resolved' ? 'success' : complaint.status === 'Rejected' ? 'default' : complaint.status === 'In Progress' ? 'warning' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{complaint.created_at ? complaint.created_at.slice(0, 10) : '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={complaintDialog.open} onClose={closeComplaintDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Report an Issue</DialogTitle>
                <DialogContent>
                    {complaintDialog.product && (
                        <Box component="form" onSubmit={submitComplaint} sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Product: {complaintDialog.product.name} (#{complaintDialog.product.serialNumber})
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                margin="normal"
                                label="Complaint Type"
                                value={complaintType}
                                onChange={(e) => setComplaintType(e.target.value)}
                                required
                            >
                                <MenuItem value="Quality">Quality Issue</MenuItem>
                                <MenuItem value="Damage">Damaged Product</MenuItem>
                                <MenuItem value="Delay">Delivery Delay</MenuItem>
                                <MenuItem value="General">General Issue</MenuItem>
                            </TextField>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                margin="normal"
                                label="Description"
                                value={complaintDescription}
                                onChange={(e) => setComplaintDescription(e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                value={complaintLocation}
                                onChange={(e) => setComplaintLocation(e.target.value)}
                                placeholder="Store address, city, etc."
                            />
                            <Button
                                component="label"
                                variant="outlined"
                                size="small"
                                sx={{ mt: 2 }}
                            >
                                {complaintProof ? 'Change Proof Image' : 'Attach Proof Image'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setComplaintProof(file || null);
                                    }}
                                />
                            </Button>
                            {complaintProof && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    Selected: {complaintProof.name}
                                </Typography>
                            )}
                            {complaintFeedback && (
                                <Alert severity={complaintFeedback.type} sx={{ mt: 2 }}>
                                    {complaintFeedback.message}
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeComplaintDialog} disabled={complaintSubmitting}>Cancel</Button>
                    <Button onClick={submitComplaint} variant="contained" disabled={complaintSubmitting}>
                        {complaintSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RetailerProducts;
