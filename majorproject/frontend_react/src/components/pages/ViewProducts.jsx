import { 
    Box, Paper, Typography, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Card, CardContent,
    Alert, CircularProgress, Grid, Avatar
} from '@mui/material';
import bgImg from '../../img/bg.png';
import axios from '../../api/axios';
import { buildApiUrl } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { QRCodeCanvas } from 'qrcode.react';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const ViewProducts = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openQR, setOpenQR] = useState(false);
    const [qrSerial, setQrSerial] = useState("");
    const [openImg, setOpenImg] = useState(false);
    const [imgUrl, setImgUrl] = useState("");

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/company-products/${auth.user}`);
            setProducts(response.data);
            console.log(`Found ${response.data.length} products for ${auth.user}`);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Error loading products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        navigate('/add-product');
    };

    const handleBack = () => {
        navigate('/manufacturer');
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
                    <Typography variant="h6">Loading products...</Typography>
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
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 60, height: 60 }}>
                            <InventoryIcon sx={{ fontSize: 30 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                My Products
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Manage and view all your registered products
                            </Typography>
                        </Box>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary.main">
                                        {products.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Products
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Products Table */}
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <InventoryIcon />
                                    Products ({products.length})
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddProduct}
                                    sx={{ minWidth: 140 }}
                                >
                                    Add Product
                                </Button>
                            </Box>

                            {products.length === 0 ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    No products registered yet. Click "Add Product" to get started!
                                </Alert>
                            ) : (
                                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Serial Number</TableCell>
                                                <TableCell>Product Name</TableCell>
                                                <TableCell>Brand</TableCell>
                                                <TableCell>Manufacturer</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.serialnumber} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                            {product.serialnumber}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {product.name || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={product.brand || 'N/A'} 
                                                            color="primary"
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {product.manufacturer || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            startIcon={<QrCodeIcon />}
                                                            variant="outlined"
                                                            onClick={()=>{
                                                                setQrSerial(product.serialnumber);
                                                                setOpenQR(true);
                                                            }}
                                                        >
                                                            View QR
                                                        </Button>
                                                        <IconButton color="primary" sx={{ml:1}} onClick={() => {
                                                            setImgUrl(product.image ? buildApiUrl(`/uploads/product/${product.image}`) : "");
                                                            setOpenImg(true);
                                                        }}>
                                                            <PhotoCameraIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            sx={{ minWidth: 120 }}
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddProduct}
                            sx={{ minWidth: 140 }}
                        >
                            Add New Product
                        </Button>
                    </Box>
                </CardContent>
            </Card>
            <Dialog open={openQR} onClose={()=>setOpenQR(false)} maxWidth="xs" fullWidth>
                <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', p: 4, position:'relative'}}>
                    <IconButton onClick={()=>setOpenQR(false)} sx={{position:'absolute', top:8, right:8}}>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{mb:2}}>Product QR Code</Typography>
                    {qrSerial && <QRCodeCanvas value={qrSerial} size={220} />}
                    <Box sx={{mt:2}}>
                        <Typography variant="body1" align="center">{qrSerial}</Typography>
                    </Box>
                </Box>
            </Dialog>
            <Dialog open={openImg} onClose={()=>setOpenImg(false)} maxWidth="xs" fullWidth>
                <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', p: 4, position:'relative', minHeight:320}}>
                    <IconButton onClick={()=>setOpenImg(false)} sx={{position:'absolute', top:8, right:8}}>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{mb:2}}>Product Image</Typography>
                    {imgUrl ? (
                        <Box component="img" src={imgUrl} alt="Product" sx={{maxWidth:250, maxHeight:250, borderRadius:2, boxShadow:2}} />
                    ) : (
                        <Typography color="text.secondary">No Image Available</Typography>
                    )}
                </Box>
            </Dialog>
        </Box>
    );
}

export default ViewProducts;
