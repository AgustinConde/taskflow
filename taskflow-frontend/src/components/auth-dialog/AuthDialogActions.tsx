import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    DialogActions,
    Button,
    CircularProgress
} from '@mui/material';

interface AuthDialogActionsProps {
    loading: boolean;
    activeTab: number;
    onCancel: () => void;
    onAction: () => void;
}

const AuthDialogActions: React.FC<AuthDialogActionsProps> = ({
    loading,
    activeTab,
    onCancel,
    onAction
}) => {
    const { t } = useTranslation();

    return (
        <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onCancel} disabled={loading}>
                {t('cancel')}
            </Button>
            <Button
                variant="contained"
                disabled={loading}
                onClick={onAction}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ minWidth: 120 }}
            >
                {loading ? t('loading') : (activeTab === 0 ? t('login') : t('register'))}
            </Button>
        </DialogActions>
    );
};

export default AuthDialogActions;
