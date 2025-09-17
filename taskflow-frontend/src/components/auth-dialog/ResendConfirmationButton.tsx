import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';

interface Props {
    email: string;
    setError: (err: string | null) => void;
}

const ResendConfirmationButton: React.FC<Props> = ({ email, setError }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResend = async () => {
        setLoading(true);
        setError(null);
        try {
            await authService.resendConfirmationEmail(email);
            setSent(true);
        } catch (err: any) {
            setError(err.message || t('resendFailed', 'Failed to resend confirmation email.'));
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return <span style={{ color: 'green' }}>{t('confirmationSent', 'Confirmation email sent!')}</span>;
    }

    return (
        <Button onClick={handleResend} disabled={loading} size="small" sx={{ mt: 1 }}>
            {loading ? <CircularProgress size={16} /> : t('resendConfirmation', 'Resend confirmation email')}
        </Button>
    );
};

export default ResendConfirmationButton;