import { Box, Paper, Typography, Autocomplete, Avatar, Alert } from '@mui/material';
import bgImg from '../../img/bg.png';
import { TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { ethers } from "ethers";
import apiClient from '../../api/axios';
import { CONTRACT_ADDRESS as ENV_CONTRACT_ADDRESS } from '../../config';
import { reverseGeocode } from '../../utils/geocoding';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import abi from '../../utils/Identeefi.json';

const options = ["true", "false"]

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
    try {
        const ethereum = getEthereumObject();

        /*
        * First make sure we have access to the Ethereum object.
        */
        if (!ethereum) {
            // TEMPORARY: Metamask check disabled for frontend development
            // console.error("Make sure you have Metamask!");
            return null;
        }

        console.log("We have the Ethereum object", ethereum);
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            return account;
        } else {
            console.error("No authorized account found");
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

const UpdateProductDetails = () => {

    const [currDate, setCurrDate] = useState('');
    const [currLatitude, setCurrLatitude] = useState("");
    const [currLongtitude, setCurrLongtitude] = useState("");
    const [currName, setCurrName] = useState("");
    const [currLocation, setCurrLocation] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [isSold, setIsSold] = useState(false);
    const [loading, setLoading] = useState("");
    const [productInfo, setProductInfo] = useState({
        name: '',
        brand: '',
        description: '',
        manufacturer: '',
        createdAt: '',
        expiryDate: '',
        imageName: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [expiryStatus, setExpiryStatus] = useState(null);


    const CONTRACT_ADDRESS = ENV_CONTRACT_ADDRESS;
    const CONTRACT_ABI = abi.abi;
    const buildBackendUrl = (pathname) => {
        const base = apiClient.defaults.baseURL || '';
        if (!pathname) return '';
        if (!base) {
            return pathname;
        }
        const normalizedBase = base.replace(/\/$/, '');
        const normalizedPath = pathname.replace(/^\//, '');
        return `${normalizedBase}/${normalizedPath}`;
    };

    const { auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const qrData = location.state?.qrData;


    useEffect(() => {
        if (!qrData) {
            return;
        }

        console.log("qrdata", qrData)
        const data = qrData.split(",");
        const serial = data[1];
        setSerialNumber(serial);
        console.log("serialNumber", serial)

        findMetaMaskAccount().then((account) => {
            if (account !== null) {
                console.log("Found account:", account);
            }
        });
    }, [qrData]);

    useEffect(() => {
        console.log("useEffect 3")

        getUsername();
        getCurrentTimeLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (serialNumber) {
            loadProductFromBlockchain(serialNumber);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serialNumber]);


    useEffect(() => {
        const updateLocation = async () => {
            if (!currLatitude || !currLongtitude) {
                return;
            }

            const result = await reverseGeocode(currLatitude, currLongtitude);
            if (!result) {
                return;
            }

            const { fullAddress, address } = result;
            setCurrLocation(fullAddress ? fullAddress.replace(/,/g, ';') : '');
            console.log('Reverse geocoded location:', fullAddress, address);
        };

        updateLocation();
    }, [currLatitude, currLongtitude]);

    const getCurrentTimeLocation = () => {
        setCurrDate(dayjs().toISOString())
        navigator.geolocation.getCurrentPosition(function (position) {
            setCurrLatitude(position.coords.latitude);
            setCurrLongtitude(position.coords.longitude);
        });
    }

       

    const getUsername = async () => {
        await apiClient.get(`/profile/${auth.user}`)
            .then(response => {
                console.log(JSON.stringify(response?.data[0]));
                setCurrName(response?.data[0].name);

            })
    }

    const fetchOffchainProduct = async (serial, existing) => {
        try {
            const res = await apiClient.get(`/product/details/${serial}`);
            const record = res.data && res.data.length ? res.data[0] : null;
            if (!record) {
                return existing;
            }

            const merged = {
                ...existing,
                name: existing.name || record.name || '',
                brand: existing.brand || record.brand || '',
                description: existing.description || record.description || '',
                manufacturer: existing.manufacturer || record.manufacturer || '',
                createdAt: existing.createdAt || record.created_at || '',
                expiryDate: existing.expiryDate || record.expiry_date || '',
                imageName: existing.imageName || record.image || ''
            };

            if (merged.imageName) {
                setImagePreview(buildBackendUrl(`/file/product/${merged.imageName}`));
            }

            applyExpiryStatus(merged.expiryDate);
            setProductInfo(merged);
            return merged;
        } catch (err) {
            console.warn('Failed to fetch product from backend', err);
            return existing;
        }
    };

    const loadProductFromBlockchain = async (serial) => {
        try {
            const { ethereum } = window;

            if (!ethereum || !CONTRACT_ADDRESS) {
                await fetchOffchainProduct(serial, productInfo);
                return;
            }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const productContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const product = await productContract.getProduct(serial);
            const chainData = {
                name: product[1] || product.name || '',
                brand: product[2] || product.brand || '',
                description: (product[3] || product.description || '').replace(/;/g, ','),
                imageName: product[4] || product.image || '',
                manufacturer: product[5] || product.manufacturer || '',
                createdAt: product[6] || product.createdAt || '',
                expiryDate: product[7] || product.expiryDate || ''
            };

            if (chainData.imageName) {
                setImagePreview(buildBackendUrl(`/file/product/${chainData.imageName}`));
            }

            applyExpiryStatus(chainData.expiryDate);
            setProductInfo(chainData);

            await fetchOffchainProduct(serial, chainData);
        } catch (error) {
            console.warn('Failed to fetch product from blockchain', error);
            await fetchOffchainProduct(serial, productInfo);
        }
    };

    const applyExpiryStatus = (expiry) => {
        if (!expiry) {
            setExpiryStatus(null);
            return;
        }

        const expiryMoment = dayjs(expiry);
        if (!expiryMoment.isValid()) {
            setExpiryStatus(null);
            return;
        }

        const diffDays = expiryMoment.startOf('day').diff(dayjs().startOf('day'), 'day');

        if (diffDays < 0) {
            setExpiryStatus({ type: 'error', message: `Expired on ${expiryMoment.format('MMM D, YYYY')}` });
        } else if (diffDays === 0) {
            setExpiryStatus({ type: 'warning', message: 'Expires today' });
        } else if (diffDays <= 2) {
            setExpiryStatus({ type: 'warning', message: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}` });
        } else {
            setExpiryStatus({ type: 'info', message: `Expires on ${expiryMoment.format('MMM D, YYYY')}` });
        }
    };

    const updateProduct = async (e) => {
        e.preventDefault();

        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const productContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

                console.log("here")

                const timestampValue = currDate ? dayjs(currDate).toISOString() : new Date().toISOString();
                const note = 'Updated by retailer';
                const expiryValue = '';

                const registerTxn = await productContract.addProductHistory(
                    serialNumber,
                    currName,
                    currLocation,
                    timestampValue,
                    Boolean(isSold),
                    note,
                    expiryValue
                );
                console.log("Mining (Adding Product History) ...", registerTxn.hash);
                setLoading("Mining (Add Product History) ...", registerTxn.hash);

                await registerTxn.wait();
                console.log("Mined (Add Product History) --", registerTxn.hash);
                setLoading("Mined (Add Product History) --", registerTxn.hash);

                const product = await productContract.getProduct(serialNumber);

                console.log("Retrieved product...", product);
                setLoading("Done! Product details updated successfully!");
                await loadProductFromBlockchain(serialNumber);

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("here")
        setLoading("Please pay the transaction fee to update the product details...")
        await updateProduct(e);


    }

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

                <Typography
                    variant="h2"
                    sx={{
                        textAlign: "center", marginBottom: "3%",
                        fontFamily: 'Gambetta', fontWeight: "bold", fontSize: "2.5rem"
                    }}
                >
                    Update Product Details</Typography>

                    <TextField
                        fullWidth
                        id="outlined-disabled"
                        margin="normal"
                        label="Serial Number"
                        disabled

                        value={serialNumber}
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, mt: 2 }}>
                        <Avatar
                            alt={productInfo.name || 'Product'}
                            src={imagePreview || undefined}
                            sx={{ width: 80, height: 80, bgcolor: '#3f51b5' }}
                        >
                            {(productInfo.name || 'P').charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{productInfo.name || '—'}</Typography>
                            <Typography variant="body2">Manufacturer: {productInfo.manufacturer || '—'}</Typography>
                            <Typography variant="body2">Brand: {productInfo.brand || '—'}</Typography>
                            <Typography variant="body2">Added On: {productInfo.createdAt ? dayjs(productInfo.createdAt).format('MMM D, YYYY h:mm A') : '—'}</Typography>
                            <Typography variant="body2">Expiry: {productInfo.expiryDate ? dayjs(productInfo.expiryDate).format('MMM D, YYYY') : '—'}</Typography>
                        </Box>
                    </Box>

                    {expiryStatus && (
                        <Alert severity={expiryStatus.type} sx={{ mt: 2 }}>
                            {expiryStatus.message}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        id="outlined-disabled"
                        margin="normal"
                        label="Description"
                        disabled
                        multiline
                        minRows={2}
                        value={productInfo.description || '—'}
                    />
                    <TextField
                        fullWidth
                        id="outlined-disabled"
                        margin="normal"
                        label="Location"
                        disabled
                        multiline
                        minRows={2}
                        value={currLocation.replace(/;/g, ",")}
                    />
                    <TextField
                        fullWidth
                        id="outlined-disabled"
                        margin="normal"
                        label="Date"
                        disabled

                        value={currDate ? dayjs(currDate).format("MMMM D, YYYY h:mm A") : ''}
                    />

                    {auth.role === "supplier" ? null
                        : <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={options}
                            fullWidth
                            value={isSold}
                            onChange={(event, newVal) => {
                                setIsSold(newVal);
                            }}
                            renderInput={(params) =>
                                <TextField {...params}
                                    fullWidth
                                    id="outlined-basic"
                                    margin="normal"
                                    label="Is Sold?"
                                    variant="outlined"
                                    inherit="False"

                                />}
                        />
                    }
                {loading === "" ? null
                        : <Typography
                            variant="body2"
                            sx={{
                                textAlign: "center", marginTop: "3%"
                            }}
                        >
                            {loading}
                        </Typography>
                    }
                    
                
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >

                        <Button
                            variant="contained"
                            type="submit"
                            onClick={handleSubmit}
                            sx={{ textAlign: "center", width: "50%", marginTop: "3%", backgroundColor: '#98b5d5', '&:hover': { backgroundColor: '#618dbd' } }}
                            >
                            Update Product
                        </Button>
                    </Box>



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
            </Paper>
        </Box>
    )
}

export default UpdateProductDetails;