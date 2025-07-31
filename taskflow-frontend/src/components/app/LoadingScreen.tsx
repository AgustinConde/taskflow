import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingScreen: React.FC = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress size={60} />
        </Box>
    );
};

export default LoadingScreen;
