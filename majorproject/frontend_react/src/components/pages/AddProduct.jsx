import { Box, Paper, Typography } from '@mui/material';
import bgImg from '../../img/bg.png';
import { TextField, Button } from '@mui/material';
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import apiClient from '../../api/axios';
import { CONTRACT_ADDRESS as ENV_CONTRACT_ADDRESS } from '../../config';
import abi from '../../utils/Identeefi.json';
import QRCode from 'qrcode.react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { reverseGeocode } from '../../utils/geocoding';

const CONTRACT_ADDRESS = ENV_CONTRACT_ADDRESS;

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
            // alert("Make sure you have Metamask!");
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


const AddProduct = () => {    

    const [serialNumber, setSerialNumber] = useState("");
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [image, setImage] = useState({
        file: [],
        filepreview: null
    });
    const [qrData, setQrData] = useState('');
    const [manuDate, setManuDate] = useState('');
    const [manuLatitude, setManuLatitude] = useState("");
    const [manuLongtitude, setManuLongtitude] = useState("");
    const [manuName, setManuName] = useState("");
    const [loading, setLoading] = useState("");
    const [manuLocation, setManuLocation] = useState("");
    const [isUnique, setIsUnique] = useState(true);

    const contractABI = abi.abi;

    const { auth } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        findMetaMaskAccount().then((account) => {
            if (account !== null) {
                console.log("Found account:", account);
            }
        });
        getUsername();
        getCurrentTimeLocation();
    }, []);

    useEffect(() => {
        const updateLocation = async () => {
            if (!manuLatitude || !manuLongtitude) {
                return;
            }

            const result = await reverseGeocode(manuLatitude, manuLongtitude);
            if (!result) {
                return;
            }

            const { fullAddress, address } = result;
            setManuLocation(fullAddress ? fullAddress.replace(/,/g, ';') : '');
            console.log('Reverse geocoded location:', fullAddress, address);
        };

        updateLocation();
    }, [manuLatitude, manuLongtitude]);

    const generateQRCode = async (serialNumber) => {
        if (!serialNumber) {
            setQrData('');
            return;
        }

        const prefix = CONTRACT_ADDRESS ? `${CONTRACT_ADDRESS},` : '';
        const data = `${prefix}${serialNumber}`;
        setQrData(data);
        console.log("QR Code: ", data);

    }

    const downloadQR = () => {
        const canvas = document.getElementById("QRCode");
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${serialNumber}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

    
    const handleBack = () => {
        navigate(-1)
    }

    const handleImage = async (e) => {
        setImage({
            ...image,
            file: e.target.files[0],
            filepreview: URL.createObjectURL(e.target.files[0])
        })
    }

    const getUsername = async (e) => {
        await apiClient.get(`/profile/${auth.user}`)
            .then(response => {
                console.log(JSON.stringify(response?.data[0]));
                setManuName(response?.data[0].name);

            })
    }


    // to upload image
    const uploadImage = async (image) => {
        const data = new FormData();
        data.append("image", image.file);

        apiClient.post('/upload/product', data, {
            headers: { "Content-Type": "multipart/form-data" }
        }).then(response => {
            console.log(response);

            if (response.data.success === 1) {
                console.log("image uploaded");
            }
        })
    }

    const registerProduct = async (e) => {
        e.preventDefault();

        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const productContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

                console.log("here")

                const createdAt = manuDate || new Date().toISOString();
                const safeDescription = (description || '').replace(/,/g, ';');
                const imageName = image.file && image.file.name ? image.file.name : '';
                const manufacturerName = manuName || '';
                const locationValue = manuLocation || '';
                const expiryValue = expiryDate || '';

                const registerTxn = await productContract.registerProduct(
                    name,
                    brand,
                    serialNumber,
                    safeDescription,
                    imageName,
                    manufacturerName,
                    locationValue,
                    createdAt,
                    expiryValue
                );
                console.log("Mining (Registering Product) ...", registerTxn.hash);
                setLoading("Mining (Register Product) ...", registerTxn.hash);

                await registerTxn.wait();
                console.log("Mined (Register Product) --", registerTxn.hash);
                setLoading("Mined (Register Product) --", registerTxn.hash);

                generateQRCode(serialNumber);

                const product = await productContract.getProduct(serialNumber);

                console.log("Retrieved product...", product);
                setLoading("");

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getCurrentTimeLocation = () => {
        setManuDate(new Date().toISOString());
        navigator.geolocation.getCurrentPosition(function(position) {
            setManuLatitude(position.coords.latitude);
            setManuLongtitude(position.coords.longitude);
          });
    }   

    const addProductDB = async (e) => {
        try {
            const profileData = JSON.stringify({
                "serialNumber": serialNumber,
                "name": name,
                "brand": brand,
                "manufacturer": auth.user,
                "description": description || "",
                "image": image.file && image.file.name ? image.file.name : "",
                "location": manuLocation || "",
                "timestamp": new Date().toISOString(),
                "expiry_date": expiryDate || null
            });

            const res = await apiClient.post('/addproduct', profileData,
                {
                    headers: {'Content-Type': 'application/json'},
                });
            console.log(JSON.stringify(res.data));
        } catch (err) {
            console.log(err);
        }
    }

    const checkUnique = async () => {
        const res = await apiClient.get('/product/serialNumber');
        console.log("API /product/serialNumber result:", res.data); // <--- debug log
        const existingSerialNumbers = res.data.map((product) => product.serialnumber);
        // Only check if it exists, don't push
        const isDuplicate = existingSerialNumbers.includes(serialNumber);
        setIsUnique(!isDuplicate);
        console.log("isUnique: ", !isDuplicate);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
          
        console.log("..............................");
        console.log("name: ", name);
        console.log("brand: ", brand);
        console.log("description: ", description);
        console.log("image: ", image.file.name);
        console.log("serialNumber: ", serialNumber);
        console.log("manufacture date: ", manuDate);
        console.log("manufactured at: ", manuLocation);
        console.log("manufactured by: ", manuName);

        checkUnique();

        if(isUnique){
            uploadImage(image);
            addProductDB(e); // add product to database
            setLoading("Please pay the transaction fee to update the product details...")
            await registerProduct(e);
        }

        setIsUnique(true);
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
                    Add Product</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        error={!isUnique}
                        helperText={!isUnique ? "Serial Number already exists" : ""}
                        id="outlined-basic"
                        margin="normal"
                        label="Serial Number"
                        variant="outlined"
                        inherit="False"
                        onChange={(e) => setSerialNumber(e.target.value)}
                        value={serialNumber}
                    />
                    
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        margin="normal"
                        label="Name"
                        variant="outlined"
                        inherit="False"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />

                    <TextField
                        fullWidth
                        id="outlined-basic"
                        margin="normal"
                        label="Brand"
                        variant="outlined"
                        inherit="False"
                        onChange={(e) => setBrand(e.target.value)}
                        value={brand}
                    />

                    <TextField
                        fullWidth
                        id="outlined-basic"
                        margin="normal"
                        label="Description"
                        variant="outlined"
                        inherit="False"
                        multiline
                        minRows={2}
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    />                        

                    <TextField
                        fullWidth
                        id="expiry-date"
                        margin="normal"
                        label="Expiry Date (optional)"
                        type="date"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        value={expiryDate}
                    />

                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ marginTop: "3%", marginBottom: "3%" }}
                    >
                        Upload Image
                        <input
                            type="file"
                            hidden
                            onChange={handleImage}
                        />
                    </Button>

                    {image.filepreview !== null ?
                        <img src={image.filepreview} alt="preview" style={{ width: "100%", height: "100%" }} />
                        : null}

                    {qrData !== "" ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3%' }}>
                        <QRCode 
                            value={qrData}
                            id="QRCode" />
                
                    </div> : null}

                    {qrData !== "" ? <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '3%' }}>
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{ marginTop: "3%", marginBottom: "3%" }}                            
                            onClick={downloadQR}
                        >
                            Download
                        </Button>
      
                    </div> : null}

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
                        sx={{ width: "100%", marginTop: "3%", backgroundColor: '#98b5d5', '&:hover': { backgroundColor: '#618dbd' } }}
                        onClick={getCurrentTimeLocation}
                    >
                        Add Product
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

                </form>

            </Paper>

        </Box>
    );
}

export default AddProduct;