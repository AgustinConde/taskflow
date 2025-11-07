import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { authService } from '../services/authService';

const Settings: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [autoDeleteCompletedTasks, setAutoDeleteCompletedTasks] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const settings = await authService.getUserSettings();
            setAutoDeleteCompletedTasks(settings.autoDeleteCompletedTasks);
        } catch (err) {
            setError(t('settings.load_error'));
            console.error('Error loading settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoDeleteChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            await authService.updateUserSettings({ autoDeleteCompletedTasks: newValue });
            setAutoDeleteCompletedTasks(newValue);
            setSuccess(true);

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(t('settings.save_error'));
            console.error('Error saving settings:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                    {t('settings.title')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
                        {t('settings.saved')}
                    </Alert>
                )}

                <Box>
                    <Typography variant="h6" gutterBottom fontWeight={500} sx={{ mb: 2 }}>
                        {t('settings.data_management')}
                    </Typography>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 1
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        <Box display="flex" alignItems="flex-start" gap={2}>
                            <DeleteForeverIcon
                                sx={{
                                    fontSize: 32,
                                    color: 'text.secondary',
                                    mt: 0.5
                                }}
                            />
                            <Box flex={1}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoDeleteCompletedTasks}
                                            onChange={handleAutoDeleteChange}
                                            disabled={saving}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1" fontWeight={500}>
                                                {t('settings.auto_delete_completed_tasks')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {t('settings.auto_delete_description')}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ m: 0, alignItems: 'flex-start' }}
                                />
                            </Box>
                        </Box>
                    </Paper>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="caption" color="text.secondary">
                        {t('settings.info')}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Settings;
