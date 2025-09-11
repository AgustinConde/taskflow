import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const ConfirmEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            return;
        }
        fetch(`${import.meta.env.VITE_ROOT_URL}/api/auth/confirm?token=${token}`)
            .then(res => res.ok ? setStatus('success') : setStatus('error'))
            .catch(() => setStatus('error'));
    }, [searchParams]);

    useEffect(() => {
        if (status === 'success') {
            const timeout = setTimeout(() => navigate('/', { replace: true }), 4000);
            return () => clearTimeout(timeout);
        }
    }, [status, navigate]);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
            <Paper elevation={6} sx={{ p: 5, borderRadius: 4, textAlign: 'center', maxWidth: 400 }}>
                {status === 'loading' && <CircularProgress color="primary" sx={{ mb: 2 }} />}
                {status === 'success' && <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />}
                {status === 'error' && <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />}
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    {status === 'loading' && 'Confirming your email...'}
                    {status === 'success' && 'Registration confirmed! Redirecting...'}
                    {status === 'error' && 'Invalid or expired confirmation link.'}
                </Typography>
                {status === 'success' && (
                    <Typography variant="body2" color="text.secondary">
                        You will be redirected to the login page in a few seconds.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default ConfirmEmailPage;
