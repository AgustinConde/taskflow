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

        const success = await login(loginData);
        if (success) {
            showSuccess(t('loginSuccessful'));
            onSuccess();
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
