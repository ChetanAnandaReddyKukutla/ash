import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from 'react-router-dom';
import { Grid } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import FactoryIcon from '@mui/icons-material/Factory';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { keyframes } from '@mui/system';
import supplyChainImg from "../../img/ChatGPT Image Nov 1, 2025, 04_53_24 PM.png";

// Fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Floating animation for background elements
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

// Glow pulse animation
const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
`;

export default function Login() {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/');
    }

    const handleRoleLogin = (role) => {
        navigate(`/login/${role}`);
    };

    const roles = [
        {
            name: 'Admin',
            icon: <LockIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            path: 'admin'
        },
        {
            name: 'Manufacturer',
            icon: <FactoryIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            path: 'manufacturer'
        },
        {
            name: 'Retailer',
            icon: <StorefrontIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            path: 'retailer'
        },
        {
            name: 'Consumer',
            icon: <ShoppingCartIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            path: 'consumer'
        }
    ];

    return (
        <Box sx={{
            minHeight: "100vh",
            width: "100%",
            maxWidth: "100vw",
            background: "#0A1628",
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            overflowX: 'hidden',
            fontFamily: "'Inter', 'Poppins', sans-serif",
            // Background image
            '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '900px',
                height: '900px',
                backgroundImage: `url(${supplyChainImg})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: 0.4,
                animation: `${float} 6s ease-in-out infinite`,
                zIndex: 0,
                pointerEvents: 'none',
            },
        }}>
            {/* Floating blockchain network dots */}
            <Box sx={{
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
                animation: `${float} 20s ease-in-out infinite`,
                zIndex: 0,
            }} />

            <Container component="main" maxWidth="md" sx={{ 
                position: 'relative', 
                zIndex: 1, 
                py: 4,
                width: '100%',
                maxWidth: '100%',
                px: { xs: 2, sm: 3 }
            }}>
                <Box
                    sx={{
                        animation: `${fadeIn} 0.8s ease-out`,
                        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(0, 198, 255, 0.05)',
                        borderRadius: '32px',
                        px: { xs: 3, sm: 6 },
                        py: { xs: 5, sm: 8 },
                        background: 'rgba(10, 25, 47, 0.85)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(79, 209, 255, 0.3)',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        position: 'relative',
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '100%',
                        // Top gradient glow
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, transparent, rgba(79, 209, 255, 0.8), transparent)',
                        }
                    }}
                >
                    {/* Decorative corner elements - Removed for cleaner look matching reference */}
                    
                    <Typography component="h1" variant="h3"
                        sx={{
                            textAlign: "center", 
                            marginBottom: 1,
                            fontFamily: "'Poppins', sans-serif", 
                            fontWeight: "700", 
                            fontSize: { xs: "2rem", sm: "3rem" },
                            background: 'linear-gradient(135deg, #ffffff 0%, #00C6FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-1px',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        Choose Your Role
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            textAlign: "center", 
                            color: 'rgba(255, 255, 255, 0.7)',
                            mb: 6,
                            fontSize: { xs: '0.95rem', sm: '1.1rem' },
                            fontWeight: 400,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Select your role to access the blockchain verification system
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mt: 1, width: '100%', maxWidth: '600px' }}>
                        {roles.map((role, index) => (
                            <Grid item xs={12} sm={6} key={role.path}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={role.icon}
                                    sx={{
                                        py: 3.5,
                                        px: 3,
                                        fontSize: { xs: '1rem', sm: '1.1rem' },
                                        background: 'rgba(14, 31, 56, 0.7)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(79, 209, 255, 0.25)',
                                        color: '#ffffff',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: '14px',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        animation: `${fadeIn} 0.6s ease-out ${index * 0.1}s backwards`,
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: role.gradient,
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                        },
                                        '& .MuiButton-startIcon': {
                                            position: 'relative',
                                            zIndex: 1,
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            background: 'rgba(14, 31, 56, 0.9)',
                                            boxShadow: `0 0 25px rgba(79, 209, 255, 0.5), 0 12px 35px rgba(0, 0, 0, 0.5)`,
                                            border: '1px solid rgba(79, 209, 255, 0.5)',
                                            '&::before': {
                                                opacity: 0.15,
                                            }
                                        },
                                        '&:active': {
                                            transform: 'translateY(-1px)',
                                        }
                                    }}
                                    onClick={() => handleRoleLogin(role.path)}
                                >
                                    <span style={{ position: 'relative', zIndex: 1 }}>
                                        {role.name}
                                    </span>
                                </Button>
                            </Grid>
                        ))}
                    </Grid>

                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        sx={{
                            mt: 6,
                            px: 5,
                            py: 1.8,
                            color: 'rgba(79, 209, 255, 0.9)',
                            borderColor: 'rgba(79, 209, 255, 0.35)',
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            background: 'rgba(14, 31, 56, 0.5)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(14, 31, 56, 0.8)',
                                borderColor: 'rgba(79, 209, 255, 0.6)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 0 20px rgba(79, 209, 255, 0.3)',
                            }
                        }}
                    >
                        ← Back to Home
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}