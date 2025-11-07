import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Paper,
    Stack,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import LightModeTwoToneIcon from '@mui/icons-material/LightModeTwoTone';
import DarkModeTwoToneIcon from '@mui/icons-material/DarkModeTwoTone';
import SettingsIcon from '@mui/icons-material/Settings';
import TranslateIcon from '@mui/icons-material/Translate';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import CountryFlagIcon from '../common/CountryFlagIcon';

interface SettingsDialogProps {
    open: boolean;
    onClose: () => void;
    mode: 'light' | 'dark';
    onThemeModeChange: (mode: 'light' | 'dark') => void;
    currentLanguage: string;
    onLanguageChange: (language: 'en' | 'es') => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
    open,
    onClose,
    mode,
    onThemeModeChange,
    currentLanguage,
    onLanguageChange
}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [autoDeleteCompletedTasks, setAutoDeleteCompletedTasks] = useState(true);
    const normalizedLanguage = currentLanguage.startsWith('es') ? 'es' : 'en';

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            setErrorKey(null);
            const settings = await authService.getUserSettings();
            setAutoDeleteCompletedTasks(settings.autoDeleteCompletedTasks);
        } catch (err) {
            console.error('Error loading settings:', err);
            setErrorKey('load_error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            loadSettings();
            setSuccess(false);
        }
    }, [open, loadSettings]);

    const handleAutoDeleteChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;

        try {
            setSaving(true);
            setErrorKey(null);
            setSuccess(false);

            await authService.updateUserSettings({ autoDeleteCompletedTasks: newValue });
            setAutoDeleteCompletedTasks(newValue);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setErrorKey('save_error');
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = (_event: React.MouseEvent<HTMLElement>, value: 'light' | 'dark' | null) => {
        if (!value) {
            return;
        }
        onThemeModeChange(value);
    };

    const handleLanguageChange = (_event: React.MouseEvent<HTMLElement>, value: 'en' | 'es' | null) => {
        if (!value || value === normalizedLanguage) {
            return;
        }
        onLanguageChange(value);
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
                        borderRadius: 4,
                        overflow: 'hidden',
                        backgroundImage: theme => theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(17,24,39,0.92), rgba(76,29,149,0.85))'
                            : 'linear-gradient(135deg, rgba(250,245,255,0.98), rgba(224,231,255,0.95))',
                        border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.18)}`
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 3,
                    py: 2.5,
                    position: 'relative',
                    background: theme => {
                        const start = theme.palette.mode === 'dark'
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main;
                        const end = theme.palette.mode === 'dark'
                            ? (theme.palette.secondary.dark || theme.palette.secondary.main)
                            : theme.palette.secondary.main;
                        return `linear-gradient(135deg, ${start}, ${end})`;
                    },
                    color: theme => theme.palette.getContrastText(
                        theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main
                    ),
                    textShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    boxShadow: theme => `0 10px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                    borderBottom: theme => `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
                    zIndex: 0,
                    '& > *': {
                        position: 'relative',
                        zIndex: 1
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.18) 0%, transparent 65%)',
                        pointerEvents: 'none'
                    }
                }}
            >
                <SettingsIcon sx={{ fontSize: 28, color: 'inherit' }} />
                {t('settings.title')}
            </DialogTitle>
            <DialogContent
                dividers
                sx={{
                    py: 3,
                    px: 3,
                    bgcolor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(24,24,27,0.9)'
                        : 'rgba(249,250,251,0.95)'
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={3}>
                        {errorKey && (
                            <Alert severity="error" onClose={() => setErrorKey(null)}>
                                {t(`settings.${errorKey}`)}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" onClose={() => setSuccess(false)}>
                                {t('settings.saved')}
                            </Alert>
                        )}

                        <Paper
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                p: 3,
                                backgroundColor: theme => theme.palette.mode === 'dark'
                                    ? 'rgba(39,39,42,0.6)'
                                    : 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(6px)',
                                borderColor: theme => theme.palette.divider,
                                transition: 'box-shadow 0.2s ease',
                                '&:hover': {
                                    boxShadow: theme => theme.shadows[4]
                                }
                            }}
                        >
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('settings.data_management')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {t('settings.auto_delete_description')}
                            </Typography>
                            <FormControl component={Box}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoDeleteCompletedTasks}
                                            onChange={handleAutoDeleteChange}
                                            disabled={saving}
                                            color="primary"
                                        />
                                    }
                                    label={t('settings.auto_delete_completed_tasks')}
                                />
                            </FormControl>
                        </Paper>

                        <Paper
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                p: 3,
                                backgroundColor: theme => theme.palette.mode === 'dark'
                                    ? 'rgba(39,39,42,0.6)'
                                    : 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(6px)',
                                borderColor: theme => theme.palette.divider,
                                transition: 'box-shadow 0.2s ease',
                                '&:hover': {
                                    boxShadow: theme => theme.shadows[4]
                                }
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                <LightModeTwoToneIcon color={mode === 'light' ? 'primary' : 'action'} />
                                <Typography variant="h6" fontWeight={600}>
                                    {t('settings.appearance')}
                                </Typography>
                            </Box>
                            <FormControl component={Box}>
                                <FormLabel sx={{ color: 'text.secondary' }}>{t('settings.theme')}</FormLabel>
                                <ToggleButtonGroup
                                    exclusive
                                    value={mode}
                                    onChange={handleThemeChange}
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                        width: '100%',
                                        '& .MuiToggleButton-root': {
                                            flex: '1 1 calc(50% - 8px)',
                                            minWidth: 120,
                                            justifyContent: 'center',
                                            gap: 1,
                                            borderRadius: 2,
                                            padding: '8px 14px'
                                        },
                                        '& .MuiToggleButtonGroup-grouped': {
                                            border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.22)}`
                                        },
                                        '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
                                            borderLeft: theme => `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                                            marginLeft: 0
                                        },
                                        '& .MuiToggleButton-root:hover': {
                                            backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.08)
                                        },
                                        '& .MuiToggleButtonGroup-grouped.Mui-selected': {
                                            backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.14),
                                            color: theme => theme.palette.primary.contrastText,
                                            borderColor: theme => alpha(theme.palette.primary.main, 0.5),
                                            '&:hover': {
                                                backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.2)
                                            }
                                        },
                                        '@media (max-width: 420px)': {
                                            '& .MuiToggleButton-root': {
                                                flex: '1 1 100%'
                                            }
                                        }
                                    }}
                                >
                                    <ToggleButton value="light">
                                        <LightModeTwoToneIcon fontSize="small" />
                                        <Typography variant="body2" fontWeight={600}>
                                            {t('settings.light')}
                                        </Typography>
                                    </ToggleButton>
                                    <ToggleButton value="dark">
                                        <DarkModeTwoToneIcon fontSize="small" color={mode === 'dark' ? 'primary' : 'action'} />
                                        <Typography variant="body2" fontWeight={600}>
                                            {t('settings.dark')}
                                        </Typography>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </FormControl>
                        </Paper>

                        <Paper
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                p: 3,
                                backgroundColor: theme => theme.palette.mode === 'dark'
                                    ? 'rgba(39,39,42,0.6)'
                                    : 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(6px)',
                                borderColor: theme => theme.palette.divider,
                                transition: 'box-shadow 0.2s ease',
                                '&:hover': {
                                    boxShadow: theme => theme.shadows[4]
                                }
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                <TranslateIcon color="action" />
                                <Typography variant="h6" fontWeight={600}>
                                    {t('settings.language')}
                                </Typography>
                            </Box>
                            <FormControl component={Box}>
                                <FormLabel sx={{ color: 'text.secondary' }}>{t('settings.language_description')}</FormLabel>
                                <ToggleButtonGroup
                                    exclusive
                                    value={normalizedLanguage}
                                    onChange={handleLanguageChange}
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                        width: '100%',
                                        '& .MuiToggleButton-root': {
                                            flex: '1 1 calc(50% - 8px)',
                                            minWidth: 120,
                                            justifyContent: 'center',
                                            gap: 1,
                                            borderRadius: 2,
                                            padding: '8px 14px'
                                        },
                                        '& .MuiToggleButtonGroup-grouped': {
                                            border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.22)}`
                                        },
                                        '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
                                            borderLeft: theme => `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                                            marginLeft: 0
                                        },
                                        '& .MuiToggleButton-root:hover': {
                                            backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.08)
                                        },
                                        '& .MuiToggleButtonGroup-grouped.Mui-selected': {
                                            backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.14),
                                            color: theme => theme.palette.primary.contrastText,
                                            borderColor: theme => alpha(theme.palette.primary.main, 0.5),
                                            '&:hover': {
                                                backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.2)
                                            }
                                        },
                                        '@media (max-width: 420px)': {
                                            '& .MuiToggleButton-root': {
                                                flex: '1 1 100%'
                                            }
                                        }
                                    }}
                                >
                                    <ToggleButton value="en">
                                        <CountryFlagIcon countryCode="US" width={22} height={16} title="English" />
                                        <Typography variant="body2" fontWeight={600}>
                                            {t('settings.english')}
                                        </Typography>
                                    </ToggleButton>
                                    <ToggleButton value="es">
                                        <CountryFlagIcon countryCode="AR" width={22} height={16} title="Español" />
                                        <Typography variant="body2" fontWeight={600}>
                                            {t('settings.spanish')}
                                        </Typography>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </FormControl>
                        </Paper>

                        <Typography variant="caption" color="text.secondary" textAlign="center">
                            {t('settings.info')}
                        </Typography>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5 }}>
                <Button onClick={onClose} variant="contained" color="primary">
                    {t('settings.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingsDialog;
