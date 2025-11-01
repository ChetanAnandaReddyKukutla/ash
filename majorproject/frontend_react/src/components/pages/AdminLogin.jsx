import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { IconButton, Fade, Alert, InputAdornment } from "@mui/material";
import { ArrowBack, AdminPanelSettings, Lock, Person } from "@mui/icons-material";
import { keyframes } from "@mui/system";
import bgGlobe from "../../img/ChatGPT Image Nov 1, 2025, 04_53_24 PM.png";
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(2deg);
  }
`;

const LOGIN_URL = '/auth';

export default function AdminLogin() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    const handleBack = () => {
        navigate('/login');
    }

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${LOGIN_URL}/${user}/${pwd}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                });

            if (res?.data.length === 0) {
                setErrMsg('Login Failed. Please try again later.');
            } else {
                const role = res?.data[0].role;
                if (role !== 'admin') {
                    setErrMsg('Access denied. Admin credentials required.');
                    return;
                }
                setAuth({ user, pwd, role });
                setUser('');
                setPwd('');
                navigate('/admin', { replace: true });
            }
        } catch (err) {
            if (!err?.response) {
                setErrMsg('Server is down. Please try again later.');
            } else if (err.response?.status === 400) {
                setErrMsg('Invalid username or password.');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized access.');
            } else {
                setErrMsg('Login Failed. Please try again later.');
            }
            errRef.current.focus();
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
                background: 'radial-gradient(circle at center, #1a0b2e, #0b1a2e)',
                fontFamily: "'Poppins', 'Inter', sans-serif",
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px)
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
                    width: '900px',
                    height: '900px',
                    backgroundImage: `url(${bgGlobe})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    animation: `${float} 8s ease-in-out infinite`,
                    pointerEvents: 'none',
                    zIndex: 0,
                }
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
                <Fade in timeout={800}>
                    <Box
                        sx={{
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: { xs: '16px', sm: '20px' },
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(102, 126, 234, 0.2)',
                            p: { xs: 3, sm: 5 },
                            animation: `${fadeIn} 1s ease-out`,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                background: 'linear-gradient(45deg, #667eea, #764ba2, #667eea)',
                                borderRadius: { xs: '17px', sm: '21px' },
                                opacity: 0.3,
                                zIndex: -1,
                                filter: 'blur(10px)',
                            }
                        }}
                    >
                        <IconButton
                            onClick={handleBack}
                            sx={{
                                position: 'absolute',
                                top: { xs: 12, sm: 20 },
                                left: { xs: 12, sm: 20 },
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                '&:hover': {
                                    background: 'rgba(102, 126, 234, 0.3)',
                                    borderColor: 'rgba(102, 126, 234, 0.5)',
                                    transform: 'translateX(-3px)',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>

                        <Box sx={{ textAlign: 'center', mb: 4, mt: { xs: 2, sm: 0 } }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: { xs: 60, sm: 80 },
                                    height: { xs: 60, sm: 80 },
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    mb: 2,
                                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                                }}
                            >
                                <AdminPanelSettings sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: '#fff' }} />
                            </Box>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '2rem', sm: '3rem' },
                                    background: 'linear-gradient(to right, #667eea, #764ba2)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-1px',
                                    mb: 1
                                }}
                            >
                                Admin Login
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}
                            >
                                System Administration Portal
                            </Typography>
                        </Box>

                        {errMsg && (
                            <Alert 
                                severity="error" 
                                ref={errRef}
                                sx={{ 
                                    mb: 3,
                                    background: 'rgba(244, 67, 54, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(244, 67, 54, 0.3)',
                                    color: '#ff6b6b',
                                    '& .MuiAlert-icon': {
                                        color: '#ff6b6b'
                                    }
                                }}
                            >
                                {errMsg}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoFocus
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(102, 126, 234, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        '&.Mui-focused': {
                                            color: '#667eea',
                                        },
                                    },
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={pwd}
                                onChange={(e) => setPwd(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(102, 126, 234, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        '&.Mui-focused': {
                                            color: '#667eea',
                                        },
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: { xs: '0.95rem', sm: '1rem' },
                                    py: { xs: 1.2, sm: 1.5 },
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 18px rgba(102, 126, 234, 0.6)',
                                        transform: 'translateY(-2px)',
                                        background: 'linear-gradient(90deg, #764ba2, #667eea)',
                                    }
                                }}
                            >
                                Login
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
