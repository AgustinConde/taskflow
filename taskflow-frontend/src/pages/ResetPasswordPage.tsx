import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!token) {
            setError('Invalid or expired reset link.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_ROOT_URL}/api/auth/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Failed to reset password.');
            } else {
                setSuccess(true);
                setTimeout(() => navigate('/', { replace: true }), 4000);
            }
        } catch {
            setError('Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
            <Paper elevation={6} sx={{ p: 5, borderRadius: 4, textAlign: 'center', maxWidth: 400 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    Reset your password
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success ? (
                    <Alert severity="success">Password reset successfully! Redirecting...</Alert>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="New password"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            fullWidth
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Confirm new password"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            fullWidth
                            required
                            sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                        </Button>
                    </form>
                )}
            </Paper>
        </Box>
    );
};

export default ResetPasswordPage;
