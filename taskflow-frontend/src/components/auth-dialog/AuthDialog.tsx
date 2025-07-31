import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Alert,
    Typography
} from '@mui/material';
import { useAuthState, useAuthOperations } from './hooks';
import AuthTabs from './AuthTabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AuthDialogActions from './AuthDialogActions';

interface AuthDialogProps {
    open: boolean;
    onClose: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose }) => {
    const {
        activeTab,
        loading,
        setLoading,
        error,
        setError,
        showLoginPassword,
        setShowLoginPassword,
        showRegisterPassword,
        setShowRegisterPassword,
        loginData,
        setLoginData,
        registerData,
        setRegisterData,
        resetForms,
        handleTabChange
    } = useAuthState();

    const handleClose = () => {
        resetForms();
        onClose();
    };

    const { handleLogin, handleRegister } = useAuthOperations({
        setLoading,
        setError,
        onSuccess: handleClose
    });

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin(loginData);
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleRegister(registerData);
    };

    const handleActionClick = async () => {
        if (activeTab === 0) {
            await handleLogin(loginData);
        } else {
            await handleRegister(registerData);
        }
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
                <AuthTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {activeTab === 0 ? (
                    <LoginForm
                        loginData={loginData}
                        onLoginDataChange={setLoginData}
                        showPassword={showLoginPassword}
                        onTogglePassword={() => setShowLoginPassword(!showLoginPassword)}
                        onSubmit={handleLoginSubmit}
                    />
                ) : (
                    <RegisterForm
                        registerData={registerData}
                        onRegisterDataChange={setRegisterData}
                        showPassword={showRegisterPassword}
                        onTogglePassword={() => setShowRegisterPassword(!showRegisterPassword)}
                        onSubmit={handleRegisterSubmit}
                    />
                )}
            </DialogContent>

            <AuthDialogActions
                loading={loading}
                activeTab={activeTab}
                onCancel={handleClose}
                onAction={handleActionClick}
            />
        </Dialog>
    );
};

export default AuthDialog;
