import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { LoginRequest } from '../../types/Auth';

interface LoginFormProps {
    loginData: LoginRequest;
    onLoginDataChange: (data: LoginRequest) => void;
    showPassword: boolean;
    onTogglePassword: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
    loginData,
    onLoginDataChange,
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
                value={loginData.username}
                onChange={(e) => onLoginDataChange({ ...loginData, username: e.target.value })}
                required
                fullWidth
                autoComplete="username"
            />
            <TextField
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => onLoginDataChange({ ...loginData, password: e.target.value })}
                required
                fullWidth
                autoComplete="current-password"
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

export default LoginForm;
