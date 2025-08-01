import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Tab,
    Tabs,
    Alert,
    Typography,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, Login } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import type { LoginRequest, RegisterRequest } from '../types/Auth';

interface AuthDialogProps {
    open: boolean;
    onClose: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { login, register } = useAuth();
    const { showSuccess, showError } = useNotifications();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    const [loginData, setLoginData] = useState<LoginRequest>({
        username: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState<RegisterRequest>({
        username: '',
        email: '',
        password: ''
    });

    const resetForms = () => {
        setLoginData({ username: '', password: '' });
        setRegisterData({ username: '', email: '', password: '' });
        setError(null);
        setLoading(false);
        setShowLoginPassword(false);
        setShowRegisterPassword(false);
    };

    const handleClose = () => {
        resetForms();
        onClose();
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const success = await login(loginData);
        if (success) {
            showSuccess(t('loginSuccessful'));
            handleClose();
        } else {
            showError(t('loginError'));
        }
        setLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (registerData.password.length < 6) {
            showError(t('passwordTooShort'));
            setLoading(false);
            return;
        }

        const success = await register(registerData);
        if (success) {
            showSuccess(t('registerSuccessful'));
            handleClose();
        } else {
            showError(t('registerError'));
        }
        setLoading(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        minHeight: 500
                    }
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                <Typography variant="h4" fontWeight={700} color="primary" component="div">
                    TaskFlow
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} centered>
                        <Tab
                            icon={<Login />}
                            label={t('login')}
                            iconPosition="start"
                            sx={{ minHeight: 48, fontWeight: 600 }}
                        />
                        <Tab
                            icon={<PersonAdd />}
                            label={t('register')}
                            iconPosition="start"
                            sx={{ minHeight: 48, fontWeight: 600 }}
                        />
                    </Tabs>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {activeTab === 0 ? (
                    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('username')}
                            value={loginData.username}
                            onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                            required
                            fullWidth
                            autoComplete="username"
                        />
                        <TextField
                            label={t('password')}
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            fullWidth
                            autoComplete="current-password"
                            sx={{
                                '& input[type="password"]::-ms-reveal': {
                                    display: 'none'
                                },
                                '& input[type="password"]::-webkit-credentials-auto-fill-button': {
                                    display: 'none !important'
                                },
                                '& input[type="password"]::-webkit-password-toggle-button': {
                                    display: 'none'
                                }
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                edge="end"
                                            >
                                                {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <button type="submit" style={{ display: 'none' }} />
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('username')}
                            value={registerData.username}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                            required
                            fullWidth
                            slotProps={{ htmlInput: { minLength: 3, maxLength: 50 } }}
                            autoComplete="username"
                        />
                        <TextField
                            label={t('email')}
                            type="email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            fullWidth
                            autoComplete="email"
                        />
                        <TextField
                            label={t('password')}
                            type={showRegisterPassword ? 'text' : 'password'}
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            fullWidth
                            autoComplete="new-password"
                            helperText={t('passwordMinLength')}
                            sx={{
                                '& input[type="password"]::-ms-reveal': {
                                    display: 'none'
                                },
                                '& input[type="password"]::-webkit-credentials-auto-fill-button': {
                                    display: 'none !important'
                                },
                                '& input[type="password"]::-webkit-password-toggle-button': {
                                    display: 'none'
                                }
                            }}
                            slotProps={{
                                htmlInput: { minLength: 6, maxLength: 100 },
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                edge="end"
                                            >
                                                {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <button type="submit" style={{ display: 'none' }} />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} disabled={loading}>
                    {t('cancel')}
                </Button>
                <Button
                    variant="contained"
                    disabled={loading}
                    onClick={activeTab === 0 ? handleLogin : handleRegister}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? t('loading') : (activeTab === 0 ? t('login') : t('register'))}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AuthDialog;
