import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useAuth from '../hooks/useAuth';

const RequireAuth = ( { allowedRoles }) => {
    const { auth, isLoading } = useAuth();
    const location = useLocation();

    console.log('RequireAuth - isLoading:', isLoading, 'auth:', auth, 'allowedRoles:', allowedRoles);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white' }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    return (
        allowedRoles.includes(auth?.role)
            ? <Outlet />
            : <Navigate to="/login" state={{from : location}} replace />
    );
}

export default RequireAuth;