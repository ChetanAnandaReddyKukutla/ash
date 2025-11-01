import {
    Box,
    Paper,
    Avatar,
    Typography,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    CircularProgress
} from '@mui/material';
import bgImg from '../../img/bg.png';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
    timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import dayjs from 'dayjs';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import abi from '../../utils/Identeefi.json';
import { useEffect, useState, useCallback } from 'react';
import { ethers } from "ethers";
import apiClient from '../../api/axios';
import { CONTRACT_ADDRESS as ENV_CONTRACT_ADDRESS } from '../../config';
import useAuth from '../../hooks/useAuth';


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



const Product = () => {
    const [serialNumber, setSerialNumber] = useState("");
    const [name, setName] = useState("P");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [expiryStatus, setExpiryStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [isSold, setIsSold] = useState(false);
    const [image, setImage] = useState({
        file: [],
        filepreview: null
    });
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportType, setReportType] = useState('General');
    const [reportDescription, setReportDescription] = useState('');
    const [reportLocation, setReportLocation] = useState('');
    const [reportProof, setReportProof] = useState(null);
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportFeedback, setReportFeedback] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(false);


    const CONTRACT_ADDRESS = ENV_CONTRACT_ADDRESS;
    const CONTRACT_ABI = abi.abi;

    const navigate = useNavigate();
    const location = useLocation();
    const { serialNumber: serialParam } = useParams();
    const qrData = location.state?.qrData;
    const cameFromDashboard = Boolean(location.state?.cameFromDashboard);
    const { auth } = useAuth();
    const [savingProduct, setSavingProduct] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const isConsumer = auth?.role === 'consumer';
    const userIdentifier = (auth?.user || '').trim();

    useEffect(() => {
        findMetaMaskAccount().then((account) => {
            if (account !== null) {
                console.log("Found account:", account);
            }
        });
    }, []);


    const getImage = async (imageName) => {
        setImage(prevState => ({
            ...prevState,
            filepreview: imageName ? `${apiClient.defaults.baseURL}/file/product/${imageName}` : null,
            })
        )
    }

    const applyOffchainFallback = useCallback(async (serial) => {
        if (!serial) return;

        try {
            const res = await apiClient.get(`/product/details/${serial}`);
            const record = res.data && res.data.length ? res.data[0] : null;
            if (!record) return;

            if (record.name) {
                setName(record.name);
            }
            if (record.manufacturer) {
                setManufacturer(record.manufacturer);
            }
            if (record.brand) {
                setBrand(record.brand);
            }
            if (record.description) {
                setDescription(record.description);
            }
            if (record.image) {
                getImage(record.image);
            }
            if (record.created_at) {
                setCreatedAt(record.created_at);
            }
            if (record.expiry_date) {
                setExpiryDate(record.expiry_date);
                updateExpiryStatus(record.expiry_date);
            }
        } catch (err) {
            console.warn('Failed to fetch off-chain product details', err);
        }
    }, []);

    const setProductData = useCallback((productStruct) => {
        if (!productStruct) {
            return;
        }

        if (typeof productStruct === 'string') {
            legacyParseProductString(productStruct);
            return;
        }

        if (Array.isArray(productStruct) && typeof productStruct[0] === 'string' && productStruct.length < 9 && typeof productStruct[productStruct.length - 1] === 'string') {
            legacyParseProductString(productStruct.join(','));
            return;
        }

        const serial = productStruct[0] || productStruct.serialNumber || '';
        const productName = productStruct[1] || productStruct.name || '';
        const productBrand = productStruct[2] || productStruct.brand || '';
        const rawDescription = productStruct[3] || productStruct.description || '';
        const imageName = productStruct[4] || productStruct.image || '';
        const productManufacturer = productStruct[5] || productStruct.manufacturer || '';
        const createdAtValue = productStruct[6] || productStruct.createdAt || '';
        const expiryValue = productStruct[7] || productStruct.expiryDate || '';
        const historyArray = productStruct[8] || [];

        setSerialNumber(serial);
        setName(productName || 'P');
        setBrand(productBrand || '');
        setDescription((rawDescription || '').replace(/;/g, ','));
        if (imageName) {
            getImage(imageName);
        }
        setManufacturer(productManufacturer || '');
        setCreatedAt(createdAtValue || '');
        setExpiryDate(expiryValue || '');

        const parsedHistory = (historyArray || []).map((entry) => {
            const timestampRaw = entry.timestamp || '';
            const numericTs = Number(timestampRaw);
            const ts = Number.isFinite(numericTs) && numericTs > 1e9 ? dayjs(numericTs * 1000) : dayjs(timestampRaw);
            return {
                id: entry.id ? Number(entry.id) : undefined,
                actor: entry.actor || '',
                location: (entry.location || '').replace(/;/g, ','),
                timestampRaw,
                moment: ts,
                isSold: Boolean(entry.isSold),
                note: entry.note || ''
            };
        });

        setHistory(parsedHistory);
        if (parsedHistory.length > 0) {
            setIsSold(Boolean(parsedHistory[parsedHistory.length - 1].isSold));
        } else {
            setIsSold(false);
        }

        updateExpiryStatus(expiryValue);
        applyOffchainFallback(serial);
    }, [applyOffchainFallback]);

    const handleScan = useCallback(async (qrData) => {
        const data = qrData.split(",");
        const contractAddress = data[0]?.trim();
        const serial = data[1]?.trim();
        setSerialNumber(serial || "");

        console.log("contract address", contractAddress)
        console.log("serial number", serial)

        if (!contractAddress || !serial) {
            console.warn('QR code missing contract address or serial');
            applyOffchainFallback(serial || '');
            return;
        }

        const normalizedQrAddress = contractAddress.toLowerCase();
        const normalizedEnvAddress = CONTRACT_ADDRESS ? CONTRACT_ADDRESS.trim().toLowerCase() : null;

        if (normalizedEnvAddress && normalizedEnvAddress !== normalizedQrAddress) {
            console.warn('QR contract does not match configured address', { normalizedQrAddress, normalizedEnvAddress });
            applyOffchainFallback(serial);
            return;
        }

        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const resolvedAddress = normalizedEnvAddress ? CONTRACT_ADDRESS : contractAddress;
                const productContract = new ethers.Contract(resolvedAddress, CONTRACT_ABI, signer);

                console.log("Fetching product from", resolvedAddress)

                const product = await productContract.getProduct(serial.toString());

                console.log("Retrieved product...", product);
                setProductData(product);

            } else {
                console.log("Ethereum object doesn't exist!");
                await applyOffchainFallback(serial);
            }
        } catch (error) {
            console.log(error);
            await applyOffchainFallback(serial);
        }
    }, [CONTRACT_ADDRESS, CONTRACT_ABI, applyOffchainFallback, setProductData]);

    const loadProductBySerial = useCallback(async (serial) => {
        if (!serial) {
            return;
        }

        setSerialNumber(serial);

        try {
            const { ethereum } = window;

            if (ethereum && CONTRACT_ADDRESS) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const productContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

                const product = await productContract.getProduct(serial.toString());
                setProductData(product);
            } else {
                await applyOffchainFallback(serial);
            }
        } catch (error) {
            console.warn('Failed to load product by serial', error);
            await applyOffchainFallback(serial);
        }
    }, [CONTRACT_ADDRESS, CONTRACT_ABI, applyOffchainFallback, setProductData]);

    useEffect(() => {
        if (qrData) {
            handleScan(qrData);
            return;
        }

        if (serialParam) {
            loadProductBySerial(serialParam);
        }
    }, [qrData, serialParam, handleScan, loadProductBySerial]);


    const checkSavedStatus = useCallback(async (serial) => {
        if (!isConsumer || !serial || !userIdentifier) {
            setIsSaved(false);
            return;
        }

        try {
            const response = await apiClient.get(`/consumer/products/${userIdentifier}`);
            const list = Array.isArray(response.data) ? response.data : [];
            const normalizedSerial = serial.toString().toLowerCase();
            const match = list.some((item) => String(item.serial_number || '').toLowerCase() === normalizedSerial);
            setIsSaved(match);
        } catch (err) {
            console.warn('Failed to check saved status', err);
        }
    }, [isConsumer, userIdentifier]);

    useEffect(() => {
        if (serialNumber) {
            checkSavedStatus(serialNumber);
        }
    }, [serialNumber, checkSavedStatus]);

    useEffect(() => {
        setSaveFeedback(null);
        setSavingProduct(false);
    }, [serialNumber]);

    const saveProductForConsumer = useCallback(async () => {
        if (!isConsumer || !serialNumber || !userIdentifier) {
            return;
        }

        setSavingProduct(true);
        setSaveFeedback(null);

        try {
            await apiClient.post('/consumer/products', {
                username: userIdentifier,
                serialNumber
            });
            setIsSaved(true);
            setSaveFeedback({ type: 'success', message: 'Product added to your list.' });
        } catch (err) {
            console.error('Failed to save consumer product', err);
            setSaveFeedback({ type: 'error', message: 'Could not add product. Please try again.' });
        } finally {
            setSavingProduct(false);
        }
    }, [isConsumer, serialNumber, userIdentifier]);

    const legacyParseProductString = (d) => {
        if (!d) return;
        console.warn('Parsing legacy product format');
        const arr = d.split(',');

        setName(arr[1] || 'P');
        setBrand(arr[2] || '');
        setDescription((arr[3] || '').replace(/;/g, ','));
        if (arr[4]) {
            getImage(arr[4]);
        }

        const parsedHistory = [];
        let cursor = 5;
        while (cursor + 4 < arr.length) {
            const actor = arr[cursor + 1] || '';
            const location = (arr[cursor + 2] || '').replace(/;/g, ',');
            const timestampRaw = arr[cursor + 3] || '';
            const numericTs = Number(timestampRaw);
            const ts = Number.isFinite(numericTs) && numericTs > 1e9 ? dayjs(numericTs * 1000) : dayjs(timestampRaw);
            const soldFlag = arr[cursor + 4] === 'true';

            parsedHistory.push({
                actor,
                location,
                timestampRaw,
                moment: ts,
                isSold: soldFlag,
                note: ''
            });

            cursor += 5;
        }

        setHistory(parsedHistory);
        setIsSold(parsedHistory.length ? Boolean(parsedHistory[parsedHistory.length - 1].isSold) : false);
        setManufacturer('');
        setCreatedAt('');
        setExpiryDate('');
        setExpiryStatus(null);
        applyOffchainFallback(serialNumber || '');
    };

    const updateExpiryStatus = (expiryValue) => {
        if (!expiryValue) {
            setExpiryStatus(null);
            return;
        }

        const expiryMoment = dayjs(expiryValue);
        if (!expiryMoment.isValid()) {
            setExpiryStatus(null);
            return;
        }

        const today = dayjs();
        const diffDays = expiryMoment.startOf('day').diff(today.startOf('day'), 'day');

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

    const handleBack = () => {
        if (cameFromDashboard) {
            navigate('/consumer');
            return;
        }

        if (location.key === 'default') {
            navigate('/consumer');
        } else {
            navigate(-1);
        }
    }

    const openReportDialog = () => {
        setReportDialogOpen(true);
        setReportType('General');
        setReportDescription('');
        setReportLocation('');
        setReportProof(null);
        setReportFeedback(null);
    };

    const closeReportDialog = () => {
        if (reportSubmitting) return;
        setReportDialogOpen(false);
        setReportFeedback(null);
    };

    const submitReport = async (event) => {
        event.preventDefault();
        if (!serialNumber) {
            setReportFeedback({ type: 'error', message: 'Product details not loaded yet. Please try again.' });
            return;
        }

        setReportSubmitting(true);
        setReportFeedback(null);

        try {
            let evidenceFileName = null;

            if (reportProof) {
                const formData = new FormData();
                formData.append('proof', reportProof);

                const uploadResponse = await apiClient.post('/upload/complaint', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                evidenceFileName = uploadResponse?.data?.fileName || null;
            }

            await apiClient.post('/add-complaint', {
                productId: serialNumber,
                complainant: auth?.user || 'consumer',
                complaintType: reportType,
                description: reportDescription,
                status: 'Open',
                location: reportLocation,
                evidence: evidenceFileName
            });

            setReportFeedback({ type: 'success', message: 'Complaint submitted successfully.' });
            setReportSubmitting(false);
            await fetchComplaints(serialNumber);
            setTimeout(() => {
                closeReportDialog();
            }, 1200);
        } catch (err) {
            console.error('Failed to submit complaint', err);
            setReportFeedback({ type: 'error', message: 'Failed to submit complaint. Please try again.' });
            setReportSubmitting(false);
        }
    };


    const getHistory = () => {
        return history.map((item, index) => {
            const timestampMoment = item.moment && item.moment.isValid() ? item.moment : null;
            const date = timestampMoment ? timestampMoment.format('MM/DD/YYYY') : item.timestampRaw;
            const time = timestampMoment ? timestampMoment.format('HH:mm a') : '';

            return (
                <TimelineItem key={index}>
                    <TimelineOppositeContent color="textSecondary">
                        {time} {date}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot color={item.isSold ? 'success' : 'primary'} />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography>Location: {item.location}</Typography>
                        <Typography>Actor: {item.actor}</Typography>
                        {item.note && (
                            <Typography variant="body2" color="text.secondary">
                                Note: {item.note}
                            </Typography>
                        )}
                    </TimelineContent>
                </TimelineItem>
            );
        });
    }

    const fetchComplaints = useCallback(async (serial) => {
        if (!serial) {
            setComplaints([]);
            return;
        }

        setComplaintsLoading(true);
        try {
            const response = await apiClient.get('/complaints');
            const consumer = (auth?.user || '').toLowerCase();
            const filtered = (response.data || []).filter((complaint) => {
                const matchesProduct = String(complaint.product_id || complaint.productId || '').toLowerCase() === String(serial).toLowerCase();
                if (!matchesProduct) return false;
                if (!consumer) return true;
                return (complaint.complainant || '').toLowerCase() === consumer;
            });
            setComplaints(filtered);
        } catch (err) {
            console.warn('Failed to fetch consumer complaints', err);
            setComplaints([]);
        } finally {
            setComplaintsLoading(false);
        }
    }, [auth?.user]);

    useEffect(() => {
        if (serialNumber) {
            fetchComplaints(serialNumber);
        }
    }, [serialNumber, fetchComplaints]);


    return (
        <Box
            sx={{
                backgroundImage: `url(${bgImg})`,
                minHeight: '80vh',
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                zIndex: -2,
                overflowY: 'scroll'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: '400px',
                    margin: 'auto',
                    marginTop: '10%',
                    marginBottom: '10%',
                    padding: '3%',
                    backgroundColor: '#e3eefc'
                }}
            >
                <Typography variant="body2" sx={{ textAlign: 'center', marginTop: '3%' }}>
                    Your Product is Authentic!
                </Typography>
                <Box sx={{ textAlign: 'center', marginBottom: '5%' }}>
                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: 'center',
                            marginBottom: '3%',
                            fontFamily: 'Gambetta',
                            fontWeight: 'bold',
                            fontSize: '2.5rem'
                        }}
                    >
                        Product Details
                    </Typography>
                    <Box
                        sx={{
                            marginRight: '1.5%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            flex: '0 0 35%',
                            width: '35%'
                        }}
                    >
                        <Avatar
                            alt={name}
                            src={image.filepreview}
                            sx={{
                                width: 100,
                                height: 100,
                                margin: 'auto',
                                marginBottom: '3%',
                                backgroundColor: '#3f51b5'
                            }}
                        >
                            {name}
                        </Avatar>
                    </Box>
                    <Box
                        sx={{
                            marginLeft: '1.5%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            flex: '0 0 65%',
                            width: '65%'
                        }}
                    >
                        <Typography variant="body1" sx={{ textAlign: 'left', marginBottom: '5%' }}>
                            {name}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'left', marginBottom: '3%' }}>
                            Serial Number: {serialNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'left', marginBottom: '3%' }}>
                            Manufacturer: {manufacturer || '—'}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'left', marginBottom: '3%' }}>
                            Description: {description || '—'}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'left', marginBottom: '3%' }}>
                            Brand: {brand || '—'}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'left', marginBottom: '3%' }}>
                            Added On: {createdAt ? dayjs(createdAt).format('MMM D, YYYY h:mm A') : '—'}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'left', marginBottom: '3%' }}>
                            Expiry Date: {expiryDate ? dayjs(expiryDate).format('MMM D, YYYY') : '—'}
                        </Typography>
                    </Box>
                </Box>

                {expiryStatus && (
                    <Alert severity={expiryStatus.type} sx={{ mb: 2 }}>
                        {expiryStatus.message}
                    </Alert>
                )}

                <Timeline
                    sx={{
                        [`& .${timelineOppositeContentClasses.root}`]: {
                            flex: 0.2,
                        },
                    }}
                >
                    {getHistory()}
                    <TimelineItem>
                        <TimelineOppositeContent color="textSecondary">
                            {dayjs().format('HH:mm a')} {dayjs().format('MM/DD/YYYY')}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot />
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                            <Typography>IsSold: {isSold.toString()}</Typography>
                        </TimelineContent>
                    </TimelineItem>
                </Timeline>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 2,
                        mt: '5%'
                    }}
                >
                    <Button onClick={handleBack}>Back</Button>
                    {isConsumer && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={saveProductForConsumer}
                            disabled={savingProduct || !serialNumber || isSaved}
                        >
                            {isSaved ? 'In My Products' : savingProduct ? 'Saving...' : 'Save to My Products'}
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        onClick={openReportDialog}
                        disabled={!serialNumber}
                    >
                        Report Issue
                    </Button>
                </Box>

                {saveFeedback && (
                    <Alert severity={saveFeedback.type} sx={{ mt: 2 }}>
                        {saveFeedback.message}
                    </Alert>
                )}
            </Paper>

            <Dialog open={reportDialogOpen} onClose={closeReportDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Report an Issue</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={submitReport} sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Product: {name} (#{serialNumber || 'N/A'})
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            margin="normal"
                            label="Complaint Type"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <MenuItem value="Quality">Quality Issue</MenuItem>
                            <MenuItem value="Damage">Damaged Product</MenuItem>
                            <MenuItem value="Delay">Delivery Delay</MenuItem>
                            <MenuItem value="General">General Issue</MenuItem>
                            <MenuItem value="Counterfeit">Counterfeit</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            margin="normal"
                            label="Description"
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Location"
                            value={reportLocation}
                            onChange={(e) => setReportLocation(e.target.value)}
                            placeholder="Share where the product was found (store, city, etc.)"
                        />
                        <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2 }}
                        >
                            {reportProof ? 'Change Proof Image' : 'Attach Proof Image'}
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setReportProof(file || null);
                                }}
                            />
                        </Button>
                        {reportProof && (
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Selected: {reportProof.name}
                            </Typography>
                        )}
                        {reportFeedback && (
                            <Alert severity={reportFeedback.type} sx={{ mt: 2 }}>
                                {reportFeedback.message}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeReportDialog} disabled={reportSubmitting}>Cancel</Button>
                    <Button onClick={submitReport} variant="contained" disabled={reportSubmitting || !serialNumber}>
                        {reportSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Paper sx={{ mt: 3, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    My Complaint Updates
                </Typography>
                {complaintsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : complaints.length === 0 ? (
                    <Typography color="text.secondary">No complaints logged for this product yet.</Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {complaints.map((complaint) => (
                                <TableRow key={complaint.id}>
                                    <TableCell>
                                        <Chip
                                            label={complaint.status || 'Open'}
                                            color={complaint.status === 'Resolved' ? 'success' : complaint.status === 'Rejected' ? 'default' : complaint.status === 'In Progress' ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{complaint.description}</TableCell>
                                    <TableCell>{complaint.created_at ? dayjs(complaint.created_at).format('MMM D, YYYY') : '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </Box>
    );
}

export default Product;