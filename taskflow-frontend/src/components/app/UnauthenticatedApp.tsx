import React from 'react';
import CountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    useTheme
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LoginIcon from '@mui/icons-material/Login';

interface UnauthenticatedAppProps {
    mode: 'light' | 'dark';
    currentLanguage: string;
    onToggleTheme: () => void;
    onLanguageChange: () => void;
    onOpenAuthDialog: () => void;
}

const UnauthenticatedApp: React.FC<UnauthenticatedAppProps> = ({
    mode,
    currentLanguage,
    onToggleTheme,
    onLanguageChange,
    onOpenAuthDialog
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <>
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <IconButton onClick={onToggleTheme} color="inherit">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Button
                    onClick={onLanguageChange}
                    variant="outlined"
                    color="inherit"
                    size="small"
                    sx={{
                        fontSize: 22,
                        px: 1.5,
                        minWidth: 44,
                        minHeight: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {currentLanguage === 'en' ? (
                        <CountryFlag countryCode="US" svg style={{ width: 28, height: 22 }} title="English" />
                    ) : (
                        <CountryFlag countryCode="AR" svg style={{ width: 28, height: 22 }} title="Español" />
                    )}
                </Button>
            </Box>

            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2
                }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        maxWidth: 400,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}22 0%, ${theme.palette.secondary.main}22 100%)`
                    }}
                >
                    <Typography variant="h2" fontWeight={800} color="primary" sx={{ mb: 2 }}>
                        TaskFlow
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                        {t('authenticationRequired')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        {t('pleaseLoginToContinue')}
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        onClick={onOpenAuthDialog}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 600,
                            boxShadow: 4
                        }}
                    >
                        {t('login')}
                    </Button>
                    <Typography variant="body2" sx={{ mt: 3 }}>
                        {t('noAccount')}{' '}
                        <span
                            style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
                            onClick={() => {
                                onOpenAuthDialog();
                                setTimeout(() => {
                                    const tab = document.querySelector('[role="tab"][aria-label="register"]') as HTMLElement;
                                    if (tab) tab.click();
                                }, 100);
                            }}
                        >
                            {t('register')}
                        </span>
                    </Typography>
                </Paper>
            </Box>
        </>
    );
};

export default UnauthenticatedApp;
