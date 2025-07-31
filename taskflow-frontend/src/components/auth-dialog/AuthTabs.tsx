import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tab, Tabs } from '@mui/material';
import { PersonAdd, Login } from '@mui/icons-material';

interface AuthTabsProps {
    activeTab: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={onTabChange} centered>
                <Tab
                    icon={<Login />}
                    label={t('login')}
                    iconPosition="start"
                    sx={{ minHeight: 48, fontWeight: 600 }}
                />
                <Tab
                    icon={<PersonAdd />}
                    label={t('register')}
                    iconPosition="start"
                    sx={{ minHeight: 48, fontWeight: 600 }}
                />
            </Tabs>
        </Box>
    );
};

export default AuthTabs;
