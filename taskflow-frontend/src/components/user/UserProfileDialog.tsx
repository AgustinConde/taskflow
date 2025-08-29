import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Avatar,
    Box
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import type { User, UserProfileFormData } from '../../types/Auth';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types/Auth';

interface UserProfileDialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (data: UserProfileFormData) => void;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ open, user, onClose, onSave }) => {
    const { t } = useTranslation();
    const { setUser } = useAuth() as { setUser: React.Dispatch<React.SetStateAction<User | null>> };
    const [localUsername, setLocalUsername] = React.useState(user?.username || '');
    const [localEmail, setLocalEmail] = React.useState(user?.email || '');
    const [localPassword, setLocalPassword] = React.useState('');
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = React.useState<string | undefined>(user?.avatarUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        setLocalUsername(user?.username || '');
        setLocalEmail(user?.email || '');
        setAvatarPreview(user?.avatarUrl);
    }, [user]);

    const validateImage = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (!allowedTypes.includes(file.type)) {
            setError(t('invalidImageType'));
            return false;
        }
        if (file.size > maxSize) {
            setError(t('imageTooLarge'));
            return false;
        }
        return true;
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0];
        if (file && validateImage(file)) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarFile(null);
            setAvatarPreview(user?.avatarUrl);
        }
    };

    const handleSave = async () => {
        setError(null);
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', localUsername);
            formData.append('email', localEmail);
            if (localPassword) formData.append('password', localPassword);
            if (avatarFile) formData.append('avatar', avatarFile);

            const response = await fetch('/api/users/photo', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();
            if (!response.ok) {
                setError(result.message || t('saveError'));
                setLoading(false);
                return;
            }
            if (result.url) {
                setAvatarPreview(result.url);
                setUser((prev: User | null) => prev ? { ...prev, avatarUrl: result.url } : prev);
            }
            onSave({
                username: localUsername,
                email: localEmail,
                password: localPassword,
                avatarFile
            });
        } catch (err) {
            setError(t('saveError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        background: theme => `linear-gradient(145deg, ${theme.palette.background.paper})`,
                        boxShadow: 12,
                        minHeight: 400,
                        overflow: 'visible',
                        position: 'relative',
                        ...(theme => theme.palette.mode === 'dark' ? {
                            '--Paper-overlay': 'none !important',
                        } : {})
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    textAlign: 'center',
                    background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    py: 2.5,
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    borderRadius: '12px 12px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                        pointerEvents: 'none'
                    }
                }}
            >
                <EditOutlinedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('editProfile')}
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 3 }}>
                {error && (
                    <Box sx={{ color: 'error.main', mb: 2, textAlign: 'center', fontWeight: 500 }}>{error}</Box>
                )}
                <Stack spacing={3} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Avatar src={avatarPreview} sx={{ width: 72, height: 72, mb: 1 }} />
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ borderRadius: 2, fontWeight: 500 }}
                            disabled={loading}
                        >
                            {t('uploadPhoto')}
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleAvatarChange}
                            />
                        </Button>
                        {loading && (
                            <Box sx={{ mt: 1, color: 'primary.main', fontWeight: 500 }}>{t('uploading')}...</Box>
                        )}
                    </Box>
                    <TextField
                        label={t('username')}
                        value={localUsername}
                        onChange={e => setLocalUsername(e.target.value)}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: theme => alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                                },
                                '&.Mui-focused': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }
                        }}
                    />
                    <TextField
                        label={t('email')}
                        value={localEmail}
                        onChange={e => setLocalEmail(e.target.value)}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: theme => alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                                },
                                '&.Mui-focused': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }
                        }}
                    />
                    <TextField
                        label={t('password')}
                        type="password"
                        value={localPassword}
                        onChange={e => setLocalPassword(e.target.value)}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: theme => alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                                },
                                '&.Mui-focused': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }
                        }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2.5, gap: 1, justifyContent: 'center' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: theme => theme.palette.grey[400],
                        color: theme => theme.palette.text.secondary,
                        fontWeight: 600,
                        minWidth: 100,
                        '&:hover': {
                            borderColor: theme => theme.palette.grey[600],
                            background: theme => alpha(theme.palette.grey[500], 0.1)
                        }
                    }}
                >
                    {t('cancel')}
                </Button>

                <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        fontWeight: 600,
                        minWidth: 100,
                        boxShadow: 3,
                        '&:hover': {
                            background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                            boxShadow: 6,
                            transform: 'translateY(-1px)'
                        }
                    }}
                    disabled={loading}
                >
                    {loading ? t('saving') : t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserProfileDialog;
