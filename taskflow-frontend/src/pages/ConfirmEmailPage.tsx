import React, { useEffect, useState } from 'react';
import CountryFlag from 'react-country-flag';
import { authService } from '../services/authService';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/api';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    IconButton,
    Button,
    ThemeProvider,
    CssBaseline
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ChecklistIcon from '@mui/icons-material/Checklist';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAppTheme } from '../components/app/hooks/useAppTheme';
import { useAppLanguage } from '../components/app/hooks/useAppLanguage';

const ConfirmEmailPage: React.FC = () => {
    console.log('[CONFIRM] Component mounted');
    const { t } = useTranslation();
    const { mode, theme, toggleTheme } = useAppTheme();
    const { currentLanguage, handleLanguageChange } = useAppLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const token = searchParams.get('token');
        console.log('[CONFIRM] Token from URL:', token);
        if (!token) {
            console.log('[CONFIRM] No token found');
            setStatus('error');
            return;
        }
        const url = `${API_ENDPOINTS.auth.confirmEmail}?token=${token}`;
        console.log('[CONFIRM] Fetching:', url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        fetch(url, { signal: controller.signal })
            .then(async res => {
                clearTimeout(timeoutId);
                console.log('[CONFIRM] Response status:', res.status);
                const data = await res.json();
                console.log('[CONFIRM] Response data:', data);
                if (res.ok && data.token) {
                    authService.setToken(data.token);
                    setStatus('success');
                } else if (data?.token) {
                    authService.setToken(data.token);
                    setStatus('success');
                } else if (data?.message === 'auth.confirm.already_confirmed') {
                    setStatus('success');
                } else {
                    console.log('[CONFIRM] Setting status to error - no valid response');
                    setStatus('error');
                }
            })
            .catch(err => {
                clearTimeout(timeoutId);
                console.log('[CONFIRM] Fetch error:', err);
                if (err.name === 'AbortError') {
                    console.log('[CONFIRM] Request timed out');
                }
                setStatus('error');
            });
    }, [searchParams]);

    useEffect(() => {
        if (status === 'success') {
            const timeout = setTimeout(() => navigate('/', { replace: true }), 4000);
            return () => clearTimeout(timeout);
        }
    }, [status, navigate]);

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

                    {status === 'loading' && (
                        <>
                            <CircularProgress color="primary" sx={{ mb: 3 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                {t('confirmingEmail')}
                            </Typography>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircleIcon sx={{ fontSize: 60, mb: 2, color: 'success.main' }} />
                            <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                                {t('emailConfirmedSuccess')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {t('emailConfirmedRedirecting')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('emailConfirmationRedirectMessage')}
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
                    )}

                    {status === 'error' && (
                        <>
                            <ErrorIcon sx={{ fontSize: 60, mb: 2, color: 'error.main' }} />
                            <Typography variant="h6" color="error.main" sx={{ mb: 3 }}>
                                {t('invalidConfirmationLink')}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/', { replace: true })}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 600
                                }}
                            >
                                {t('goToHome')}
                            </Button>
                        </>
                    )}
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default ConfirmEmailPage;
