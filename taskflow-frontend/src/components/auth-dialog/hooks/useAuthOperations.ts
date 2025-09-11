import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { LoginRequest, RegisterRequest } from '../../../types/Auth';

interface UseAuthOperationsProps {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    onSuccess: () => void;
}

export const useAuthOperations = ({ setLoading, setError, onSuccess }: UseAuthOperationsProps) => {
    const { t } = useTranslation();
    const { login, register } = useAuth();
    const { showSuccess, showError } = useNotifications();

    const handleLogin = async (loginData: LoginRequest) => {
        setLoading(true);
        setError(null);

        const result = await login(loginData);
        if (result === true) {
            showSuccess(t('loginSuccessful'));
            onSuccess();
        } else if (result && typeof result === 'object' && 'emailNotConfirmed' in result) {
            setError(t('emailNotConfirmed', 'You must confirm your email before logging in.'));
        } else {
            showError(t('loginError'));
        }
        setLoading(false);
    };

    const handleRegister = async (registerData: RegisterRequest) => {
        setLoading(true);
        setError(null);

        if (registerData.password.length < 6) {
            setError(t('passwordTooShort', 'Password must be at least 6 characters long'));
            setLoading(false);
            return;
        }

        const success = await register(registerData);
        if (success) {
            showSuccess(t('registerSuccessful'));
            onSuccess();
        } else {
            showError(t('registerError'));
        }
        setLoading(false);
    };

    return {
        handleLogin,
        handleRegister
    };
};
