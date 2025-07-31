import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { RegisterRequest } from '../../types/Auth';

interface RegisterFormProps {
    registerData: RegisterRequest;
    onRegisterDataChange: (data: RegisterRequest) => void;
    showPassword: boolean;
    onTogglePassword: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
    registerData,
    onRegisterDataChange,
    showPassword,
    onTogglePassword,
    onSubmit
}) => {
    const { t } = useTranslation();

    return (
        <Box
            component="form"
            onSubmit={onSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
            <TextField
                label={t('username')}
                value={registerData.username}
                onChange={(e) => onRegisterDataChange({ ...registerData, username: e.target.value })}
                required
                fullWidth
                slotProps={{ htmlInput: { minLength: 3, maxLength: 50 } }}
                autoComplete="username"
            />
            <TextField
                label={t('email')}
                type="email"
                value={registerData.email}
                onChange={(e) => onRegisterDataChange({ ...registerData, email: e.target.value })}
                required
                fullWidth
                autoComplete="email"
            />
            <TextField
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={(e) => onRegisterDataChange({ ...registerData, password: e.target.value })}
                required
                fullWidth
                autoComplete="new-password"
                helperText={t('passwordMinLength')}
                sx={{
                    '& input[type="password"]::-ms-reveal': {
                        display: 'none'
                    },
                    '& input[type="password"]::-webkit-credentials-auto-fill-button': {
                        display: 'none !important'
                    },
                    '& input[type="password"]::-webkit-password-toggle-button': {
                        display: 'none'
                    }
                }}
                slotProps={{
                    htmlInput: { minLength: 6, maxLength: 100 },
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={onTogglePassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }
                }}
            />
            <button type="submit" style={{ display: 'none' }} />
        </Box>
    );
};

export default RegisterForm;
