import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';

interface ForgotPasswordDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (email: string) => Promise<string | null>;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({ open, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        const result = await onSubmit(email);
        setLoading(false);
        if (result) {
            setError(result);
        } else {
            setSuccess(t('auth.forgot.sent'));
        }
    };

    const handleClose = () => {
        setEmail('');
        setError(null);
        setSuccess(null);
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t('forgotPasswordTitle')}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label={t('email')}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        fullWidth
                        autoFocus
                        sx={{ mb: 2 }}
                    />
                    <DialogActions>
                        <Button onClick={handleClose} disabled={loading}>{t('cancel')}</Button>
                        <Button type="submit" variant="contained" disabled={loading || !!success} sx={{ bgcolor: theme => theme.palette.primary.main }}>{t('send')}</Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPasswordDialog;
