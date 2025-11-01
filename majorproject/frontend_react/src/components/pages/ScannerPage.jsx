import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import bgImg from '../../img/bg.png';
import QrScanner from '../QrScanner';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
    // Load from .env same as AddProduct.jsx
    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
    const [qrData, setQrData] = useState('');
    const [configError, setConfigError] = useState('');

    const { auth, isLoading } = useAuth();
    const navigate = useNavigate();
    const normalizedContractAddress = (CONTRACT_ADDRESS || '').trim();

    const normalizeIncomingData = useCallback((rawInput) => {
        const trimmed = (rawInput || '').trim();

        if (!trimmed) {
            return '';
        }

        if (!trimmed.includes(',')) {
            if (!normalizedContractAddress) {
                return '';
            }
            return `${normalizedContractAddress},${trimmed}`;
        }

        return trimmed;
    }, [normalizedContractAddress]);

    const passData = useCallback((data) => {
        console.log("passData called with:", data);
        const normalized = normalizeIncomingData(data);
        if (normalized) {
            setQrData(normalized);
        }
    }, [normalizeIncomingData]);

    const navRole = useCallback(() => {
        navigate('/update-product', { state: { qrData }});
    }, [navigate, qrData]);

    const navConsumerProduct = useCallback((serialNumber) => {
        if (!serialNumber) return;
        navigate(`/consumer/products/${serialNumber}`, { state: { qrData } });
    }, [navigate, qrData]);

    const navFakeProduct = useCallback(() => {
        navigate('/fake-product');
    }, [navigate]);

    useEffect(() => {
        if (!normalizedContractAddress) {
            setConfigError('Contract address is not configured. Please set REACT_APP_CONTRACT_ADDRESS in your frontend environment.');
        } else if (configError) {
            setConfigError('');
        }
    }, [normalizedContractAddress, configError]);

    useEffect(() => {
        console.log("useEffect triggered - auth:", auth, "qrData:", qrData);
        if (configError) {
            console.warn('Scanner disabled due to config:', configError);
            return;
        }

        if (isLoading) {
            console.log('Auth still loading, waiting...');
            return;
        }

        const cleanedData = qrData.trim();

        if (!cleanedData) {
            console.log("No QR data yet, waiting...");
            return;
        }

        const arr = cleanedData.split(',');
        if (arr.length < 2) {
            console.warn('Unexpected QR data format:', cleanedData);
            return;
        }

        const contractAddress = arr[0];
        const serialNumber = arr[1];
        console.log("Split QR data - contractAddress:", contractAddress, "serialNumber:", serialNumber);

        if (!auth || !auth.role) {
            console.log('Auth role not ready yet, waiting for auth to load...');
            return;
        }

        if (contractAddress) {
            const contractAddressLower = contractAddress.trim().toLowerCase();
            const normalizedContractLower = normalizedContractAddress.toLowerCase();
            console.log("Comparing addresses:", contractAddressLower, "===", normalizedContractLower);
            // Case-insensitive comparison
            if (contractAddressLower === normalizedContractLower) {
                console.log("Valid contract address, checking role:", auth.role);
                if (auth.role === "supplier" || auth.role === "retailer") {
                    console.log("Navigating to retailer/supplier page");
                    navRole();
                } else if (auth.role === "consumer") {
                    console.log("Navigating to consumer page");
                    navConsumerProduct(serialNumber);
                } else {
                    console.log("Navigating to fake product page - role mismatch:", auth.role);
                    navFakeProduct();
                }
            } else {
                console.log("Invalid contract address, navigating to fake product");
                navFakeProduct();
            }
        }
    }, [qrData, auth, isLoading, configError, navRole, navConsumerProduct, navFakeProduct, normalizedContractAddress]);

    const handleBack = () => {
        navigate(-1)
    }

    return (

        <Box sx={{
            backgroundImage: `url(${bgImg})`,
            minHeight: "80vh",
            backgroundRepeat: "no-repeat",
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundSize: 'cover',
            zIndex: -2,
            overflowY: "scroll"
        }}>
            <Paper elevation={3} sx={{ width: "400px", margin: "auto", marginTop: "10%", marginBottom: "10%", padding: "3%", backgroundColor: "#e3eefc" }}>

                <Box
                    sx={{
                        textAlign: "center", marginBottom: "5%",
                    }}
                >

                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: "center", marginBottom: "3%",
                            fontFamily: 'Gambetta', fontWeight: "bold", fontSize: "2.5rem"
                        }}
                    >
                        Scan QR Code</Typography>
                    
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: "center", marginBottom: "5%", color: "text.secondary"
                        }}
                    >
                        Point your camera at the product QR code to scan
                    </Typography>

                    {configError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {configError}
                        </Alert>
                    )}

                    <QrScanner passData={passData}/>

                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >


                        <Button
                            onClick={handleBack}
                            sx={{
                                marginTop: "5%",
                            }}
                        >
                            Back
                        </Button>

                    </Box>    


                </Box>
            </Paper>
        </Box>
    )
}

export default ScannerPage;