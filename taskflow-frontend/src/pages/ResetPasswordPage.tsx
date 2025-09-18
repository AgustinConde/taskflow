import React, { useState } from 'react';
import CountryFlag from 'react-country-flag';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/api';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    ThemeProvider,
    CssBaseline
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAppTheme } from '../components/app/hooks/useAppTheme';
import { useAppLanguage } from '../components/app/hooks/useAppLanguage';

const ResetPasswordPage: React.FC = () => {
    const { t } = useTranslation();
    const { mode, theme, toggleTheme } = useAppTheme();
    const { currentLanguage, handleLanguageChange } = useAppLanguage();
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
            setError(t('invalidResetLink'));
            return;
        }
        if (newPassword.length < 6) {
            setError(t('passwordMinimumLength'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t('passwordsDoNotMatchError'));
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            if (!response.ok) {
                const data = await response.json();
                setError(data.message || t('failedToResetPassword'));
            } else {
                setSuccess(true);
                setTimeout(() => navigate('/', { replace: true }), 4000);
            }
        } catch {
            setError(t('failedToResetPassword'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <IconButton onClick={toggleTheme} color="inherit">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Button
                    onClick={handleLanguageChange}
                    variant="outlined"
                    color="inherit"
                    size="small"
                    sx={{
                        fontSize: 22,
                        px: 1.5,
                        minWidth: 44,
                        minHeight: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {currentLanguage === 'en' ? (
                        <CountryFlag countryCode="US" svg style={{ width: 28, height: 22 }} title="English" />
                    ) : (
                        <CountryFlag countryCode="AR" svg style={{ width: 28, height: 22 }} title="Español" />
                    )}
                </Button>
            </Box>

            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2
                }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        maxWidth: 400,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}22 0%, ${theme.palette.secondary.main}22 100%)`
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                        <ChecklistIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
                        <Typography variant="h4" fontWeight={800} color="primary">
                            TaskFlow
                        </Typography>
                    </Box>

                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                        {t('resetPasswordTitle')}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {success ? (
                        <>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {t('passwordResetSuccess')}
                            </Alert>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('passwordResetRedirecting')}
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/', { replace: true })}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    boxShadow: 4
                                }}
                            >
                                {t('goToHome')}
                            </Button>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label={t('newPasswordLabel')}
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label={t('confirmNewPasswordLabel')}
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                fullWidth
                                required
                                sx={{ mb: 4 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    boxShadow: 4
                                }}
                            >
                                {loading ? <CircularProgress size={24} /> : t('resetPasswordButton')}
                            </Button>
                        </form>
                    )}
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default ResetPasswordPage;
