import '../../css/Role.css'
import { Button } from '../Button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Button as Btn, IconButton, Tooltip, Fade, Typography, Container } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { keyframes } from '@mui/system';
import bgGlobe from '../../img/ChatGPT Image Nov 1, 2025, 04_53_24 PM.png';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 4px 12px rgba(0, 114, 255, 0.4);
  }
  50% {
    box-shadow: 0 6px 18px rgba(0, 114, 255, 0.6);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
    try {
        const ethereum = getEthereumObject();

        /*
         * First make sure we have access to the Ethereum object.
         */
        if (!ethereum) {
            console.error("Make sure you have Metamask!");
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

const Manufacturer = () => {

    const [currentAccount, setCurrentAccount] = useState("");

    useEffect(() => {
        findMetaMaskAccount().then((account) => {
            if (account !== null) {
                setCurrentAccount(account);
            }
        });
    }, []);

    const connectWallet = async () => {
        try {
            const ethereum = getEthereumObject();
            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.error(error);
        }
    };

    

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(circle at top right, #102a43, #0b1a2e)',
                fontFamily: "'Poppins', 'Inter', sans-serif",
                // Blockchain grid pattern
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        linear-gradient(rgba(0, 198, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 198, 255, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    opacity: 0.5,
                },
                // Blockchain globe background
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '800px',
                    height: '800px',
                    backgroundImage: `url(${bgGlobe})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 0.3,
                    animation: `${float} 6s ease-in-out infinite`,
                    pointerEvents: 'none',
                    zIndex: 0,
                }
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Fade in timeout={800}>
                    <Box
                        sx={{
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 198, 255, 0.2)',
                            p: { xs: 3, sm: 5 },
                            animation: `${fadeIn} 1s ease-out`,
                            // Glow effect
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                background: 'linear-gradient(45deg, #00C6FF, #0072FF, #00C6FF)',
                                borderRadius: '21px',
                                opacity: 0.3,
                                zIndex: -1,
                                filter: 'blur(10px)',
                            }
                        }}
                    >
                        {/* Logout Button - Top Right */}
                        <Tooltip title="Logout" arrow>
                            <IconButton
                                component={Link}
                                to="/login"
                                sx={{
                                    position: 'absolute',
                                    top: 20,
                                    right: 20,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff',
                                    '&:hover': {
                                        background: 'rgba(234, 84, 85, 0.2)',
                                        borderColor: 'rgba(234, 84, 85, 0.5)',
                                        transform: 'rotate(90deg)',
                                        transition: 'all 0.3s ease'
                                    }
                                }}
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>

                        {/* Welcome Header */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontWeight: 300,
                                    mb: 1,
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Welcome
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '2.5rem', sm: '3.5rem' },
                                    background: 'linear-gradient(to right, #00C6FF, #0072FF)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-1px',
                                    mb: 1
                                }}
                            >
                                Manufacturer
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Blockchain-Powered Supply Chain Management
                            </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Check Profile */}
                            <Btn
                                component={Link}
                                to="/profile"
                                startIcon={<AccountCircleIcon />}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(90deg, #00C6FF, #0072FF)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 114, 255, 0.4)',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(0, 114, 255, 0.6)',
                                        transform: 'translateY(-2px)',
                                        background: 'linear-gradient(90deg, #00D4FF, #0080FF)',
                                    }
                                }}
                            >
                                Check Profile
                            </Btn>

                            {/* Add Product */}
                            <Btn
                                component={Link}
                                to="/add-product"
                                startIcon={<AddBoxIcon />}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(90deg, #00C6FF, #0072FF)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 114, 255, 0.4)',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(0, 114, 255, 0.6)',
                                        transform: 'translateY(-2px)',
                                        background: 'linear-gradient(90deg, #00D4FF, #0080FF)',
                                    }
                                }}
                            >
                                Add Product
                            </Btn>

                            {/* View Products */}
                            <Btn
                                component={Link}
                                to="/view-products"
                                startIcon={<InventoryIcon />}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(90deg, #00C6FF, #0072FF)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 114, 255, 0.4)',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(0, 114, 255, 0.6)',
                                        transform: 'translateY(-2px)',
                                        background: 'linear-gradient(90deg, #00D4FF, #0080FF)',
                                    }
                                }}
                            >
                                View Products
                            </Btn>

                            {/* View Complaints */}
                            <Btn
                                component={Link}
                                to="/manufacturer-complaints"
                                startIcon={<ReportProblemIcon />}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(90deg, #FF6B6B, #EE5A6F)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(238, 90, 111, 0.4)',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(238, 90, 111, 0.6)',
                                        transform: 'translateY(-2px)',
                                        background: 'linear-gradient(90deg, #FF7B7B, #FF6A7F)',
                                    }
                                }}
                            >
                                View Complaints
                            </Btn>

                            {/* Connect Wallet */}
                            {!currentAccount ? (
                                <Btn
                                    onClick={connectWallet}
                                    startIcon={<AccountBalanceWalletIcon />}
                                    fullWidth
                                    sx={{
                                        background: 'linear-gradient(90deg, #10B981, #059669)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        py: 1.5,
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        animation: `${glow} 2s ease-in-out infinite`,
                                        '&:hover': {
                                            boxShadow: '0 6px 18px rgba(16, 185, 129, 0.6)',
                                            transform: 'translateY(-2px)',
                                            background: 'linear-gradient(90deg, #14C48F, #06976B)',
                                        }
                                    }}
                                >
                                    Connect Wallet
                                </Btn>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        py: 1.5,
                                        px: 3,
                                        borderRadius: '10px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                    }}
                                >
                                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.5rem' }} />
                                    <Typography
                                        sx={{
                                            color: '#10B981',
                                            fontWeight: 600,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Wallet Connected ✅
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Wallet Address Display (if connected) */}
                        {currentAccount && (
                            <Fade in timeout={600}>
                                <Box
                                    sx={{
                                        mt: 3,
                                        p: 2,
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            display: 'block',
                                            mb: 0.5,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Connected Address
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#00C6FF',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            wordBreak: 'break-all'
                                        }}
                                    >
                                        {currentAccount}
                                    </Typography>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}

export default Manufacturer;