import { 
    Box, Typography, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Card, CardContent, 
    Grid, Avatar, Divider, Alert, CircularProgress
} from '@mui/material';
import bgImg from '../../img/bg.png';
import axios from '../../api/axios';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReportIcon from '@mui/icons-material/Report';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';

const CompanyDetails = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [products, setProducts] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompanyDetails();
    }, [username]);

    const fetchCompanyDetails = async () => {
        setLoading(true);
        try {
            // Fetch company profile
            const profileResponse = await axios.get(`/profile/${username}`);
            if (profileResponse.data.length > 0) {
                setCompany(profileResponse.data[0]);
            } else {
                setError('Company not found');
            }

            // Fetch company products from database
            try {
                const productsResponse = await axios.get(`/company-products/${username}`);
                setProducts(productsResponse.data);
                console.log(`Found ${productsResponse.data.length} products for ${username}`);
            } catch (productsError) {
                console.error('Error fetching company products:', productsError);
                setProducts([]); // Set empty array if error
            }

            // Fetch complaints related to this company
            const complaintsResponse = await axios.get('/complaints');
            const companyComplaints = complaintsResponse.data.filter(complaint => 
                complaint.complainant === username || complaint.product_id.includes(username)
            );
            setComplaints(companyComplaints);

        } catch (error) {
            console.error('Error fetching company details:', error);
            setError('Error loading company details');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6">Loading company details...</Typography>
                </Card>
            </Box>
        );
    }

    if (error || !company) {
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
            }}>
                <Card sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error || 'Company not found'}
                    </Alert>
                    <Button variant="outlined" onClick={handleBack}>
                        Go Back
                    </Button>
                </Card>
            </Box>
        );
    }

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
                    {/* Company Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 60, height: 60 }}>
                            <BusinessIcon sx={{ fontSize: 30 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {company.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {company.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Chip 
                                    label={company.role} 
                                    color="primary" 
                                    size="small"
                                />
                                <Chip 
                                    label={company.approved ? "Approved" : "Pending"} 
                                    color={company.approved ? "success" : "warning"}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Company Information */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon />
                                        Company Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography><strong>Username:</strong> {company.username}</Typography>
                                        <Typography><strong>Website:</strong> {company.website || 'N/A'}</Typography>
                                        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon fontSize="small" />
                                            <strong>Location:</strong> {company.location || 'N/A'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <HistoryIcon />
                                        Account Statistics
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography><strong>Products Registered:</strong> {products.length}</Typography>
                                        <Typography><strong>Complaints Received:</strong> {complaints.length}</Typography>
                                        <Typography><strong>Account Status:</strong> {company.approved ? 'Active' : 'Pending Approval'}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Products Section */}
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <InventoryIcon />
                                Products ({products.length})
                            </Typography>
                            {products.length === 0 ? (
                                <Alert severity="info">No products registered yet.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product Name</TableCell>
                                                <TableCell>Brand</TableCell>
                                                <TableCell>Serial Number</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.serialnumber}>
                                                    <TableCell>{product.name || 'N/A'}</TableCell>
                                                    <TableCell>{product.brand || 'N/A'}</TableCell>
                                                    <TableCell>{product.serialnumber}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Complaints Section */}
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ReportIcon />
                                Complaints ({complaints.length})
                            </Typography>
                            {complaints.length === 0 ? (
                                <Alert severity="success">No complaints received.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product ID</TableCell>
                                                <TableCell>Complaint Type</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {complaints.map((complaint) => (
                                                <TableRow key={complaint.id}>
                                                    <TableCell>{complaint.product_id}</TableCell>
                                                    <TableCell>{complaint.complaint_type}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={complaint.status} 
                                                            color={complaint.status === 'Open' ? 'error' : 'warning'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{complaint.created_at}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>

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
        </Box>
    );
}

export default CompanyDetails;
