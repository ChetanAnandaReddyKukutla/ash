import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Grid, Tabs, Tab, IconButton, Fade, Alert, InputAdornment } from "@mui/material";
import { ArrowBack, ShoppingCart, Lock, Person, Business, Language, LocationOn, Description } from "@mui/icons-material";
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
const REGISTER_URL = '/addaccount';
const PROFILE_URL = '/addprofile';

export default function ConsumerLogin() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const errRef = useRef();
    const [tabValue, setTabValue] = useState(0);

    // Login state
    const [loginUser, setLoginUser] = useState('');
    const [loginPwd, setLoginPwd] = useState('');
    const [loginErrMsg, setLoginErrMsg] = useState('');

    // Register state
    const [regUser, setRegUser] = useState('');
    const [regPwd, setRegPwd] = useState('');
    const [regName, setRegName] = useState('');
    const [regDescription, setRegDescription] = useState('');
    const [regWebsite, setRegWebsite] = useState('');
    const [regLocation, setRegLocation] = useState('');
    const [regErrMsg, setRegErrMsg] = useState('');

    const handleBack = () => {
        navigate('/login');
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setLoginErrMsg('');
        setRegErrMsg('');
    };

    useEffect(() => {
        setLoginErrMsg('');
    }, [loginUser, loginPwd]);

    useEffect(() => {
        setRegErrMsg('');
    }, [regUser, regPwd, regName]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${LOGIN_URL}/${loginUser}/${loginPwd}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                });

            if (res?.data.length === 0) {
                setLoginErrMsg('Login Failed. Please try again later.');
            } else {
                const role = res?.data[0].role;
                if (role !== 'consumer') {
                    setLoginErrMsg('Access denied. Consumer credentials required.');
                    return;
                }
                setAuth({ user: loginUser, pwd: loginPwd, role });
                setLoginUser('');
                setLoginPwd('');
                navigate('/consumer', { replace: true });
            }
        } catch (err) {
            if (!err?.response) {
                setLoginErrMsg('Server is down. Please try again later.');
            } else if (err.response?.status === 400) {
                setLoginErrMsg('Invalid username or password.');
            } else if (err.response?.status === 401) {
                setLoginErrMsg('Unauthorized access.');
            } else {
                setLoginErrMsg('Login Failed. Please try again later.');
            }
            errRef.current.focus();
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        try {
            // Register account
            await axios.post(REGISTER_URL, {
                username: regUser,
                password: regPwd,
                role: 'consumer'
            });

            // Create profile
            await axios.post(PROFILE_URL, {
                username: regUser,
                name: regName,
                description: regDescription,
                website: regWebsite,
                location: regLocation,
                image: '',
                role: 'consumer'
            });

            setRegErrMsg('');
            alert('Account created successfully! Please login.');
            setTabValue(0);
            setRegUser('');
            setRegPwd('');
            setRegName('');
            setRegDescription('');
            setRegWebsite('');
            setRegLocation('');

        } catch (err) {
            if (!err?.response) {
                setRegErrMsg('Server is down. Please try again later.');
            } else {
                setRegErrMsg('Registration Failed. Please try again later.');
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
                background: 'radial-gradient(circle at center, #0d2d1f, #0b1a2e)',
                fontFamily: "'Poppins', 'Inter', sans-serif",
                py: { xs: 2, sm: 4 },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 157, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 157, 0.03) 1px, transparent 1px)
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
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
                <Fade in timeout={800}>
                    <Box
                        sx={{
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: { xs: '16px', sm: '20px' },
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 255, 157, 0.2)',
                            p: { xs: 3, sm: 5 },
                            animation: `${fadeIn} 1s ease-out`,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                background: 'linear-gradient(45deg, #00FF9D, #00D68F, #00FF9D)',
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
                                    background: 'rgba(0, 255, 157, 0.3)',
                                    borderColor: 'rgba(0, 255, 157, 0.5)',
                                    transform: 'translateX(-3px)',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>

                        <Box sx={{ textAlign: 'center', mb: 3, mt: { xs: 2, sm: 0 } }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: { xs: 60, sm: 80 },
                                    height: { xs: 60, sm: 80 },
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #00FF9D, #00D68F)',
                                    mb: 2,
                                    boxShadow: '0 4px 20px rgba(0, 255, 157, 0.4)',
                                }}
                            >
                                <ShoppingCart sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: '#fff' }} />
                            </Box>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '1.75rem', sm: '2.5rem' },
                                    background: 'linear-gradient(to right, #00FF9D, #00D68F)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-1px',
                                    mb: 1
                                }}
                            >
                                Consumer Portal
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}
                            >
                                Track & Verify Products
                            </Typography>
                        </Box>

                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange} 
                            centered
                            sx={{ 
                                mb: 3,
                                '& .MuiTab-root': {
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    textTransform: 'none',
                                    minHeight: { xs: 40, sm: 48 },
                                    '&.Mui-selected': {
                                        color: '#00FF9D',
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#00FF9D',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                }
                            }}
                        >
                            <Tab label="Login" />
                            <Tab label="Register" />
                        </Tabs>

                        {tabValue === 0 && (
                            <Box component="form" onSubmit={handleLoginSubmit} noValidate sx={{ width: '100%' }}>
                                {loginErrMsg && (
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
                                        {loginErrMsg}
                                    </Alert>
                                )}
                                
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="loginUsername"
                                    label="Username"
                                    name="loginUsername"
                                    autoFocus
                                    value={loginUser}
                                    onChange={(e) => setLoginUser(e.target.value)}
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
                                                borderColor: 'rgba(0, 255, 157, 0.5)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#00FF9D',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            '&.Mui-focused': {
                                                color: '#00FF9D',
                                            },
                                        },
                                    }}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="loginPassword"
                                    label="Password"
                                    type="password"
                                    id="loginPassword"
                                    value={loginPwd}
                                    onChange={(e) => setLoginPwd(e.target.value)}
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
                                                borderColor: 'rgba(0, 255, 157, 0.5)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#00FF9D',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            '&.Mui-focused': {
                                                color: '#00FF9D',
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
                                        background: 'linear-gradient(90deg, #00FF9D, #00D68F)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: { xs: '0.95rem', sm: '1rem' },
                                        py: { xs: 1.2, sm: 1.5 },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(0, 255, 157, 0.4)',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        '&:hover': {
                                            boxShadow: '0 6px 18px rgba(0, 255, 157, 0.6)',
                                            transform: 'translateY(-2px)',
                                            background: 'linear-gradient(90deg, #00D68F, #00FF9D)',
                                        }
                                    }}
                                >
                                    Login
                                </Button>
                            </Box>
                        )}

                        {tabValue === 1 && (
                            <Box component="form" onSubmit={handleRegisterSubmit} noValidate sx={{ width: '100%' }}>
                                {regErrMsg && (
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
                                        {regErrMsg}
                                    </Alert>
                                )}
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="regUsername"
                                            label="Username"
                                            name="regUsername"
                                            value={regUser}
                                            onChange={(e) => setRegUser(e.target.value)}
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
                                                        borderColor: 'rgba(0, 255, 157, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00FF9D',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&.Mui-focused': {
                                                        color: '#00FF9D',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="regPassword"
                                            label="Password"
                                            type="password"
                                            id="regPassword"
                                            value={regPwd}
                                            onChange={(e) => setRegPwd(e.target.value)}
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
                                                        borderColor: 'rgba(0, 255, 157, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00FF9D',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&.Mui-focused': {
                                                        color: '#00FF9D',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="regName"
                                            label="Full Name"
                                            name="regName"
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Business sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
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
                                                        borderColor: 'rgba(0, 255, 157, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00FF9D',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&.Mui-focused': {
                                                        color: '#00FF9D',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="regDescription"
                                            label="Description"
                                            name="regDescription"
                                            multiline
                                            rows={3}
                                            value={regDescription}
                                            onChange={(e) => setRegDescription(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Description sx={{ color: 'rgba(255, 255, 255, 0.5)', alignSelf: 'flex-start', mt: 1 }} />
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
                                                        borderColor: 'rgba(0, 255, 157, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00FF9D',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&.Mui-focused': {
                                                        color: '#00FF9D',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="regWebsite"
                                            label="Website"
                                            name="regWebsite"
                                            value={regWebsite}
                                            onChange={(e) => setRegWebsite(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Language sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
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
                                                        borderColor: 'rgba(0, 255, 157, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00FF9D',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&.Mui-focused': {
                                                        color: '#00FF9D',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="regLocation"
                                            label="Location"
                                            name="regLocation"
                                            value={regLocation}
                                            onChange={(e) => setRegLocation(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationOn sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
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
                                                        borderColor: 'rgba(0, 255, 157, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00FF9D',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&.Mui-focused': {
                                                        color: '#00FF9D',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        mb: 2,
                                        background: 'linear-gradient(90deg, #00FF9D, #00D68F)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: { xs: '0.95rem', sm: '1rem' },
                                        py: { xs: 1.2, sm: 1.5 },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(0, 255, 157, 0.4)',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        '&:hover': {
                                            boxShadow: '0 6px 18px rgba(0, 255, 157, 0.6)',
                                            transform: 'translateY(-2px)',
                                            background: 'linear-gradient(90deg, #00D68F, #00FF9D)',
                                        }
                                    }}
                                >
                                    Create Account
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
