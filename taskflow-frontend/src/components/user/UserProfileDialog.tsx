import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Avatar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { User } from '../../types/Auth';

interface UserProfileDialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (data: Partial<User>) => void;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ open, user, onClose, onSave }) => {
    const { t } = useTranslation();
    const [localUsername, setLocalUsername] = React.useState(user?.username || '');
    const [localEmail, setLocalEmail] = React.useState(user?.email || '');

    React.useEffect(() => {
        setLocalUsername(user?.username || '');
        setLocalEmail(user?.email || '');
    }, [user]);

    const handleSave = () => {
        onSave({ username: localUsername, email: localEmail });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t('editProfile')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Avatar sx={{ width: 56, height: 56, alignSelf: 'center', mb: 2 }} />
                    <TextField
                        label={t('username')}
                        value={localUsername}
                        onChange={e => setLocalUsername(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label={t('email')}
                        value={localEmail}
                        onChange={e => setLocalEmail(e.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleSave} variant="contained">{t('save')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserProfileDialog;
