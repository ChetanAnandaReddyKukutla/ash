import { Box, Paper, Typography, Button, Avatar } from '@mui/material';
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
import { useLocation, useNavigate } from 'react-router-dom';
import abi from '../../utils/Identeefi.json';
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import apiClient from '../../api/axios';
import { CONTRACT_ADDRESS as ENV_CONTRACT_ADDRESS } from '../../config';

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



const UpdateProduct = () => {
    const [serialNumber, setSerialNumber] = useState("");
    const [name, setName] = useState("P");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [history, setHistory] = useState([]);
    const [isSold, setIsSold] = useState(false);
    const [loading, setLoading] = useState("");

    const [image, setImage] = useState({
        file: [],
        filepreview: null
    });


    const CONTRACT_ADDRESS = ENV_CONTRACT_ADDRESS;
    const CONTRACT_ABI = abi.abi;

    const navigate = useNavigate();
    const location = useLocation();
    const qrData = location.state?.qrData;

    console.log("qrData", qrData);

    useEffect(() => {
        console.log("useEffect 1")

        findMetaMaskAccount().then((account) => {
            if (account !== null) {
                console.log("Found account:", account);
            }
        });

        if (qrData) {
            handleScan(qrData)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrData]);

    const getImage = async (imageName) => {
        setImage(prevState => ({
            ...prevState,
            filepreview: imageName ? `${apiClient.defaults.baseURL}/file/product/${imageName}` : null,
            })
        )
    }

    const handleScan = async (qrData) => {
        const data = qrData.split(",");
        const contractAddress = data[0];
        setSerialNumber(data[1]);

        console.log("contract address", contractAddress)
        console.log("serial number", data[1])

        if (!contractAddress || (CONTRACT_ADDRESS && contractAddress !== CONTRACT_ADDRESS)) {
            // No contract address match; bail out early
            console.warn('Contract address mismatch or missing, skipping blockchain fetch');
            return;
        }

        if (CONTRACT_ADDRESS) {

            try {
                const { ethereum } = window;

                if (ethereum) {
                    const provider = new ethers.providers.Web3Provider(ethereum);
                    const signer = provider.getSigner();
                    const productContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);



                    const product = await productContract.getProduct(data[1].toString());

                    console.log("Retrieved product...", product);
                    setData(product);


                } else {
                    console.log("Ethereum object doesn't exist!");
                    alert("Ethereum object doesn't exist! Please connect your wallet first!")
                }
            } catch (error) {
                console.log(error);
            }
        }

    };

    const setData = (product) => {
        if (!product) {
            return;
        }

        const [
            serial,
            productName,
            productBrand,
            productDescription,
            imageName,
            manufacturerName,
            createdAtValue,
            expiryValue,
            historyArray,
        ] = product;

        console.log("product data:", {
            serial,
            productName,
            productBrand,
            imageName,
            manufacturerName,
            createdAtValue,
            expiryValue,
        });

        setName(productName || "");
        setBrand(productBrand || "");
        setDescription((productDescription || "").replace(/;/g, ","));
        getImage(imageName || "");
        setManufacturer(manufacturerName || "");
        setCreatedAt(createdAtValue || "");
        setExpiryDate(expiryValue || "");

        setSerialNumber(serial || "");

        const parsedHistory = Array.isArray(historyArray)
            ? historyArray.map((entry, index) => {
                  const actor = entry?.actor || entry?.[1] || "";
                  const rawLocation = entry?.location || entry?.[2] || "";
                  const timestamp = entry?.timestamp || entry?.[3] || "";
                  const isSoldValue = Boolean(entry?.isSold ?? entry?.[4]);
                  const note = entry?.note || entry?.[5] || "";
                  const idValue = entry?.id || entry?.[0] || index;

                  return {
                      id: typeof idValue === 'object' && idValue !== null && 'toNumber' in idValue
                          ? idValue.toNumber()
                          : Number(idValue) || index,
                      actor,
                      location: (rawLocation || '').replace(/;/g, ','),
                      timestamp,
                      isSold: isSoldValue,
                      note,
                  };
              })
            : [];

        const soldInHistory = parsedHistory.some((entry) => entry.isSold);
        setIsSold(soldInHistory);
        setHistory(parsedHistory);
    };

    

    const handleBack = () => {
        navigate(-1)
    }


    const getHistory = () => {
        return history.map((item, index) => {
            const rawTimestamp = item.timestamp;
            let parsed = null;

            if (rawTimestamp) {
                if (/^\d+$/.test(rawTimestamp)) {
                    // treat numeric values as seconds since epoch
                    parsed = dayjs(Number(rawTimestamp) * 1000);
                } else {
                    parsed = dayjs(rawTimestamp);
                }
            }

            const date = parsed && parsed.isValid() ? parsed.format('MM/DD/YYYY') : 'Invalid Date';
            const time = parsed && parsed.isValid() ? parsed.format('hh:mm a') : '';

            // if (item.isSold) {
            //     setIsSold(true);
            // }

            return (
                <TimelineItem key={index}>
                    <TimelineOppositeContent color="textSecondary">
                        {time && `${time} `}{date}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography>Location: {item.location || '—'}</Typography>
                        <Typography>Actor: {item.actor || '—'}</Typography>
                        {item.note ? <Typography>Note: {item.note}</Typography> : null}
                    </TimelineContent>
                </TimelineItem>
            );
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();;

        navigate('/update-product-details', { state: { qrData }});
    }
    

    return (
        <Box sx={{
            backgroundImage: `url(${bgImg})`,
            minHeight: "80vh",
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
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
                        Product Details</Typography>

                    <Box
                        sx={{
                            display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flex: 1, width: '100%',
                            marginTop: '5%', marginBottom: '5%'
                        }}
                    >
                        <Box
                            sx={{
                                marginRight: '1.5%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', flex: '0 0 35%', width: '35%'
                            }}
                        >
                            <Avatar
                                alt={name}
                                src={image.filepreview}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: "auto",
                                    marginBottom: "3%",
                                    backgroundColor: "#3f51b5"
                                }}
                            >
                                {name}


                            </Avatar>

                        </Box>
                        <Box
                            sx={{
                                marginLeft: '1.5%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'left', flex: '0 0 65%', width: '65%'
                            }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    textAlign: "left", marginBottom: "5%",
                                }}
                            >
                                {name}
                                {/* Product Name */}

                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Serial Number: {serialNumber}
                            </Typography>


                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Description: {description}
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Brand: {brand}
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Manufacturer: {manufacturer || '—'}
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Added On: {createdAt ? dayjs(createdAt).format('MMM D, YYYY h:mm A') : '—'}
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Expiry Date: {expiryDate ? dayjs(expiryDate).format('MMM D, YYYY') : '—'}
                            </Typography>

                        </Box>

                    </Box>

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

                    <Button
                        variant="contained"
                        type="submit"
                        sx={{ width: "50%", marginTop: "3%", backgroundColor: '#98b5d5', '&:hover': { backgroundColor: '#618dbd' } }}
                        onClick={handleSubmit}
                    >
                        Update Product
                    </Button>

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

export default UpdateProduct;