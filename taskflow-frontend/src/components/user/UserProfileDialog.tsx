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
import type { Theme } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import type { User, UserProfileFormData } from '../../types/Auth';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface UserProfileDialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (data: UserProfileFormData) => void;
}

const ROOT_URL = import.meta.env.VITE_ROOT_URL;

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ open, user, onClose }) => {
    const { t } = useTranslation();
    const { setUser } = useAuth() as { setUser: React.Dispatch<React.SetStateAction<User | null>> };
    const { showSuccess } = useNotifications();
    const [localUsername, setLocalUsername] = React.useState(user?.username || '');
    const [localEmail, setLocalEmail] = React.useState(user?.email || '');
    const [localPassword, setLocalPassword] = React.useState('');
    const [localNewPassword, setLocalNewPassword] = React.useState('');
    const [localConfirmNewPassword, setLocalConfirmNewPassword] = React.useState('');
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = React.useState<string | undefined>(user?.avatarUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

    React.useEffect(() => {
        setLocalUsername(user?.username || '');
        setLocalEmail(user?.email || '');
        setAvatarPreview(user?.avatarUrl);
    }, [user]);

    const clearFieldErrors = () => setErrors({});

    const validateFields = () => {
        const newErrors: { [key: string]: string | null } = {};
        if (localNewPassword || localConfirmNewPassword || localPassword) {
            if (!localPassword) {
                newErrors.currentPassword = t('currentPasswordRequired', 'Current password is required to change the password.');
            }
            if (!localNewPassword) {
                newErrors.newPassword = t('newPasswordRequired', 'New password is required.');
            } else if (localNewPassword.length < 6 || !/[a-zA-Z]/.test(localNewPassword) || !/\d/.test(localNewPassword)) {
                newErrors.newPassword = t('passwordRequirements', 'Password must be at least 6 characters long and include letters and numbers.');
            }
            if (!localConfirmNewPassword) {
                newErrors.confirmNewPassword = t('confirmPasswordRequired', 'Confirm new password is required.');
            } else if (localNewPassword !== localConfirmNewPassword) {
                newErrors.confirmNewPassword = t('passwordsDoNotMatch', 'Passwords do not match.');
            }
        }
        if (localUsername.trim().length < 3) {
            newErrors.username = t('usernameMinLength', 'Username must be at least 3 characters.');
        }
        if (localEmail && !/^\S+@\S+\.\S+$/.test(localEmail)) {
            newErrors.email = t('invalidEmail', 'Invalid email address.');
        }
        return newErrors;
    };

    const validateImage = (file: File): string | null => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (!allowedTypes.includes(file.type)) return t('invalidImageType');
        if (file.size > maxSize) return t('imageTooLarge');
        return null;
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0];
        if (file) {
            const imageError = validateImage(file);
            if (imageError) {
                setError(imageError);
                return;
            }
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
        setSuccess(null);
        clearFieldErrors();
        setLoading(true);
        try {
            let avatarUrl = avatarPreview;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                const token = localStorage.getItem('taskflow_token');
                const response = await fetch(`${ROOT_URL}/api/users/photo`, {
                    method: 'POST',
                    body: formData,
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                const result = await response.json();
                if (!response.ok) {
                    setError(result.message || t('saveError'));
                    setLoading(false);
                    return;
                }
                if (result.url) {
                    avatarUrl = result.url.startsWith('/uploads/')
                        ? `${ROOT_URL}${result.url}`
                        : result.url;
                    setAvatarPreview(avatarUrl);
                    setUser((prev: User | null) => prev ? { ...prev, avatarUrl } : prev);
                }
            }

            const validationErrors = validateFields();
            const allPasswordFieldsFilled = localPassword && localNewPassword && localConfirmNewPassword;
            const wantsPasswordChange = localPassword || localNewPassword || localConfirmNewPassword;
            const payload: any = {
                ...(localUsername !== user?.username && { username: localUsername }),
                ...(localEmail !== user?.email && { email: localEmail })
            };

            if (wantsPasswordChange) {
                if (!allPasswordFieldsFilled) {
                    setErrors(validationErrors);
                    setLoading(false);
                    return;
                }
                payload.currentPassword = localPassword;
                payload.newPassword = localNewPassword;
            }

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                setLoading(false);
                return;
            }

            if (Object.keys(payload).length > 0) {
                const token = localStorage.getItem('taskflow_token');
                const response = await fetch(`${ROOT_URL}/api/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (!response.ok) {
                    if (result.message) {
                        const msg = result.message.toLowerCase();
                        const backendErrorMap: { [key: string]: string } = {
                            'current password': 'currentPassword',
                            'contraseña actual': 'currentPassword',
                            'old password': 'currentPassword',
                            'contraseña vieja': 'currentPassword',
                            'username': 'username',
                            'usuario': 'username',
                            'email': 'email',
                            'correo': 'email',
                            'new password': 'newPassword',
                            'contraseña nueva': 'newPassword',
                            'confirm': 'confirmNewPassword'
                        };
                        let found = false;
                        let newErrors = { ...validationErrors };
                        for (const key in backendErrorMap) {
                            if (msg.includes(key)) {
                                const field = backendErrorMap[key];
                                if (field === 'currentPassword' && (msg.includes('incorrect') || msg.includes('incorrecta'))) {
                                    newErrors[field] = String(t('currentPasswordIncorrect'));
                                } else {
                                    newErrors[field] = result.message;
                                }
                                found = true;
                                break;
                            }
                        }
                        setErrors(newErrors);
                        if (!found) setError(result.message || t('saveError'));
                    } else {
                        setError(t('saveError'));
                    }
                    setLoading(false);
                    return;
                }
                setUser((prev: User | null) => prev ? { ...prev, username: localUsername, email: localEmail, avatarUrl } : prev);
            }
            setErrors({});
            showSuccess(t('profileUpdated'));
        } catch (err) {
            setError(t('saveError'));
        } finally {
            setLoading(false);
        }
    };

    const renderField = (props: {
        label: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        errorKey: string;
        type?: string;
        slotProps?: any;
        sx?: any;
    }) => {
        return (
            <Box sx={{ mb: 2 }}>
                <TextField
                    label={props.label}
                    value={props.value}
                    onChange={props.onChange}
                    fullWidth
                    variant="outlined"
                    error={!!errors[props.errorKey]}
                    type={props.type}
                    slotProps={props.slotProps}
                    sx={props.sx}
                />
                {errors[props.errorKey] && (
                    <Box sx={{ color: 'error.main', fontSize: '0.80rem', mt: '-8px', mb: 0, ml: 0 }}>{errors[props.errorKey]}</Box>
                )}
            </Box>
        );
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
                        background: (theme: Theme) => `linear-gradient(145deg, ${theme.palette.background.paper})`,
                        boxShadow: 12,
                        minHeight: 400,
                        overflow: 'visible',
                        position: 'relative',
                        ...((theme: Theme) => theme.palette.mode === 'dark' ? {
                            '--Paper-overlay': 'none !important',
                        } : {})
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    textAlign: 'center',
                    background: (theme: Theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
                {success && (
                    <Box sx={{ color: 'success.main', mb: 2, textAlign: 'center', fontWeight: 500 }}>{success}</Box>
                )}
                <Stack spacing={3.5} sx={{ mt: 2 }}>
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
                    {renderField({
                        label: t('username'),
                        value: localUsername,
                        onChange: e => setLocalUsername(e.target.value),
                        errorKey: 'username',
                        sx: {
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: (theme: Theme) => alpha(theme.palette.background.paper, 0.8),
                                ...(errors.username ? { border: '1.5px solid #EF4444' } : {}),
                            }
                        }
                    })}
                    {renderField({
                        label: t('email'),
                        value: localEmail,
                        onChange: e => setLocalEmail(e.target.value),
                        errorKey: 'email',
                        sx: {
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: (theme: Theme) => alpha(theme.palette.background.paper, 0.8),
                                ...(errors.email ? { border: '1.5px solid #EF4444' } : {}),
                            }
                        }
                    })}
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ fontWeight: 600, mb: 2, fontSize: '1.05rem' }}>{t('changePassword', 'Change Password')}</Box>
                        {renderField({
                            label: t('currentPassword', 'Current Password'),
                            value: localPassword,
                            onChange: e => setLocalPassword(e.target.value),
                            errorKey: 'currentPassword',
                            type: 'password',
                            slotProps: { inputLabel: { shrink: true } },
                            sx: {
                                mb: 1.5,
                                mt: 0.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    background: (theme: Theme) => alpha(theme.palette.background.paper, 0.8),
                                }
                            }
                        })}
                        {renderField({
                            label: t('newPassword', 'New Password'),
                            value: localNewPassword,
                            onChange: e => setLocalNewPassword(e.target.value),
                            errorKey: 'newPassword',
                            type: 'password',
                            slotProps: { inputLabel: { shrink: true } },
                            sx: {
                                mb: 1.5,
                                mt: 0.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    background: (theme: Theme) => alpha(theme.palette.background.paper, 0.8),
                                }
                            }
                        })}
                        {renderField({
                            label: t('confirmNewPassword', 'Confirm New Password'),
                            value: localConfirmNewPassword,
                            onChange: e => setLocalConfirmNewPassword(e.target.value),
                            errorKey: 'confirmNewPassword',
                            type: 'password',
                            slotProps: { inputLabel: { shrink: true } },
                            sx: {
                                mb: 1.5,
                                mt: 0.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    background: (theme: Theme) => alpha(theme.palette.background.paper, 0.8),
                                }
                            }
                        })}
                        <Box sx={{ color: 'text.secondary', fontSize: '0.80rem', mt: 0.5 }}>
                            {t('passwordRequirements', 'Password must be at least 6 characters and include letters and numbers.')}
                        </Box>
                    </Box>
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
                        borderColor: (theme: Theme) => theme.palette.grey[400],
                        color: (theme: Theme) => theme.palette.text.secondary,
                        fontWeight: 600,
                        minWidth: 100,
                        '&:hover': {
                            borderColor: (theme: Theme) => theme.palette.grey[600],
                            background: (theme: Theme) => alpha(theme.palette.grey[500], 0.1)
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
                        background: (theme: Theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        fontWeight: 600,
                        minWidth: 100,
                        boxShadow: 3,
                        '&:hover': {
                            background: (theme: Theme) => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
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
}
export default UserProfileDialog;
