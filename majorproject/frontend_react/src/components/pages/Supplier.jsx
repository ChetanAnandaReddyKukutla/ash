import '../../css/Role.css'
import { Button } from '../Button';
import { Link } from 'react-router-dom';
import { Box, Button as Btn, IconButton, Tooltip, Fade, Typography, Container } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState, useEffect } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
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
    box-shadow: 0 4px 12px rgba(255, 159, 67, 0.4);
  }
  50% {
    box-shadow: 0 6px 18px rgba(255, 159, 67, 0.6);
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

const Supplier = () => {

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
                background: 'radial-gradient(circle at center, #2a1a3a, #0b1a2e)',
                fontFamily: "'Poppins', 'Inter', sans-serif",
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        linear-gradient(rgba(255, 159, 67, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 159, 67, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    opacity: 0.5,
                },
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
                    opacity: 0.2,
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
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(255, 159, 67, 0.2)',
                            p: { xs: 3, sm: 5 },
                            animation: `${fadeIn} 1s ease-out`,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                background: 'linear-gradient(45deg, #FF9F43, #FFA726, #FF9F43)',
                                borderRadius: '21px',
                                opacity: 0.3,
                                zIndex: -1,
                                filter: 'blur(10px)',
                            }
                        }}
                    >
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
                                    background: 'linear-gradient(to right, #FF9F43, #FFA726)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-1px',
                                    mb: 1
                                }}
                            >
                                Supplier
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Update & Track Supply Chain Products
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Btn
                                component={Link}
                                to="/profile"
                                startIcon={<AccountCircleIcon />}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(90deg, #FF9F43, #FFA726)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(255, 159, 67, 0.4)',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(255, 159, 67, 0.6)',
                                        transform: 'translateY(-2px)',
                                        background: 'linear-gradient(90deg, #FFA726, #FF9F43)',
                                    }
                                }}
                            >
                                Check Profile
                            </Btn>

                            <Btn
                                component={Link}
                                to="/scanner"
                                startIcon={<QrCodeScannerIcon />}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(90deg, #FF9F43, #FFA726)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(255, 159, 67, 0.4)',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(255, 159, 67, 0.6)',
                                        transform: 'translateY(-2px)',
                                        background: 'linear-gradient(90deg, #FFA726, #FF9F43)',
                                    }
                                }}
                            >
                                Update Product
                            </Btn>

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
                                            color: '#FF9F43',
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

export default Supplier;