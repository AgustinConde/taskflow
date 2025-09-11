import React, { useState } from 'react';
import ResendConfirmationButton from './ResendConfirmationButton';
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
import ForgotPasswordDialog from './ForgotPasswordDialog';
import { authService } from '../../services/authService';

interface AuthDialogProps {
    open: boolean;
    onClose: () => void;
    initialTab?: number;
}


const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, initialTab = 0 }) => {
    const {
        activeTab,
        setActiveTab,
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

    React.useEffect(() => {
        if (open) setActiveTab(initialTab);
        // eslint-disable-next-line
    }, [open, initialTab]);

    const handleClose = () => {
        resetForms();
        onClose();
    };

    const [pendingEmail, setPendingEmail] = useState<string | null>(null);
    const { handleLogin, handleRegister } = useAuthOperations({
        setLoading,
        setError: (err) => {
            setError(err);
            if (err && err.toLowerCase().includes('confirm your email')) {
                setPendingEmail(loginData.username);
            } else {
                setPendingEmail(null);
            }
        },
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

    const [forgotOpen, setForgotOpen] = useState(false);

    const handleForgotSubmit = async (email: string) => {
        try {
            await authService.forgotPassword(email);
            return null;
        } catch (err: any) {
            return err.message || 'Error';
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
                        {pendingEmail && (
                            <>
                                <br />
                                <ResendConfirmationButton email={pendingEmail} setError={setError} />
                            </>
                        )}
                    </Alert>
                )}

                {activeTab === 0 ? (
                    <LoginForm
                        loginData={loginData}
                        onLoginDataChange={setLoginData}
                        showPassword={showLoginPassword}
                        onTogglePassword={() => setShowLoginPassword(!showLoginPassword)}
                        onSubmit={handleLoginSubmit}
                        onForgotPassword={() => setForgotOpen(true)}
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

            <ForgotPasswordDialog
                open={forgotOpen}
                onClose={() => setForgotOpen(false)}
                onSubmit={handleForgotSubmit}
            />

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
