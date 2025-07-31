import { useState } from 'react';
import type { LoginRequest, RegisterRequest } from '../../../types/Auth';

export const useAuthState = () => {
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

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setError(null);
    };

    return {
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
    };
};
