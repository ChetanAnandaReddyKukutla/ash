// RETAILER LOGIN RETURN STATEMENT - Purple Theme
// Replace the entire return statement in RetailerLogin.jsx starting from line 180

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
                py: { xs: 2, sm: 4 },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        linear-gradient(rgba(138, 43, 226, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(138, 43, 226, 0.03) 1px, transparent 1px)
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
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(138, 43, 226, 0.2)',
                            p: { xs: 3, sm: 5 },
                            animation: `${fadeIn} 1s ease-out`,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                background: 'linear-gradient(45deg, #8A2BE2, #9370DB, #8A2BE2)',
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
                                    background: 'rgba(138, 43, 226, 0.3)',
                                    borderColor: 'rgba(138, 43, 226, 0.5)',
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
                                    background: 'linear-gradient(135deg, #8A2BE2, #9370DB)',
                                    mb: 2,
                                    boxShadow: '0 4px 20px rgba(138, 43, 226, 0.4)',
                                }}
                            >
                                <Store sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: '#fff' }} />
                            </Box>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '1.75rem', sm: '2.5rem' },
                                    background: 'linear-gradient(to right, #8A2BE2, #9370DB)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-1px',
                                    mb: 1
                                }}
                            >
                                Retailer Portal
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}
                            >
                                Manage Your Retail Operations
                            </Typography>
                        </Box>

                        {/* Rest similar to Manufacturer with purple gradient (#8A2BE2, #9370DB) */}
                        {/* Continue with Tabs, Forms, etc. - same structure as Manufacturer */}
                    </Box>
                </Fade>
            </Container>
        </Box>
    );


// =======================================================================
// CONSUMER LOGIN RETURN STATEMENT - Green Theme  
// Replace the entire return statement in ConsumerLogin.jsx starting from line 180

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

                        {/* Rest similar to Manufacturer with green gradient (#00FF9D, #00D68F) */}
                        {/* Continue with Tabs, Forms, etc. - same structure as Manufacturer */}
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
