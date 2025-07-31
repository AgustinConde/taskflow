import React from 'react';
import CountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Tab,
    Tabs,
    Button,
    IconButton,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TaskIcon from '@mui/icons-material/Task';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import type { User } from '../../types/Auth';

interface AppNavBarProps {
    user: User | null;
    currentTab: 'tasks' | 'dashboard';
    mode: 'light' | 'dark';
    currentLanguage: string;
    onTabChange: (event: React.SyntheticEvent, newValue: 'tasks' | 'dashboard') => void;
    onToggleTheme: () => void;
    onLanguageChange: () => void;
    onLogout: () => void;
}

const AppNavBar: React.FC<AppNavBarProps> = ({
    user,
    currentTab,
    mode,
    currentLanguage,
    onTabChange,
    onToggleTheme,
    onLanguageChange,
    onLogout
}) => {
    const { t } = useTranslation();
    const currentTheme = useTheme();
    const isSmallScreen = useMediaQuery(currentTheme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(currentTheme.breakpoints.down('md'));

    return (
        <AppBar
            position="fixed"
            elevation={3}
            sx={{
                background: theme => `linear-gradient(90deg, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: '0 2px 12px rgba(124, 58, 237, 0.25)',
                backdropFilter: 'blur(8px)'
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: { xs: 56, sm: 64 } }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 2, sm: 3 }
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 1.5 }
                    }}>
                        <ChecklistIcon sx={{
                            fontSize: { xs: 28, sm: 32 },
                            color: 'white',
                            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))'
                        }} />
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            letterSpacing={1}
                            sx={{
                                color: 'white',
                                textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                fontFamily: 'Inter, Roboto, Arial',
                                fontSize: { xs: '1.3rem', sm: '1.5rem' },
                                whiteSpace: 'nowrap'
                            }}
                        >
                            TaskFlow
                        </Typography>
                    </Box>

                    <Tabs
                        value={currentTab}
                        onChange={onTabChange}
                        textColor="inherit"
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: 'white',
                                height: 3,
                                borderRadius: '2px 2px 0 0'
                            }
                        }}
                        sx={{
                            '& .MuiTab-root': {
                                color: 'rgba(255,255,255,0.7)',
                                minHeight: 48,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                '&.Mui-selected': {
                                    color: 'white',
                                },
                                '&:hover': {
                                    color: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }
                        }}
                    >
                        <Tab
                            value="tasks"
                            label={t('tasks')}
                            icon={<TaskIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            value="dashboard"
                            label={t('dashboard')}
                            icon={<DashboardIcon />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 }
                }}>
                    {!isSmallScreen && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.85)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: { sm: 100, md: 140, lg: 180 },
                                mr: 1.5,
                                fontSize: '0.875rem'
                            }}
                        >
                            {isMediumScreen ? user?.username : `${t('welcome')}, ${user?.username}`}
                        </Typography>
                    )}

                    <Button
                        onClick={onLogout}
                        variant="text"
                        size="small"
                        startIcon={!isSmallScreen ? <LogoutIcon sx={{ fontSize: 18 }} /> : undefined}
                        sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.4)'
                            },
                            minHeight: 36,
                            px: isSmallScreen ? 1 : 2,
                            minWidth: isSmallScreen ? 36 : 'auto',
                            fontSize: '0.875rem'
                        }}
                    >
                        {isSmallScreen ? <LogoutIcon sx={{ fontSize: 18 }} /> : t('logout')}
                    </Button>

                    <IconButton
                        onClick={onToggleTheme}
                        size="small"
                        sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.4)'
                            },
                            width: 36,
                            height: 36
                        }}
                    >
                        {mode === 'dark' ? <Brightness7Icon sx={{ fontSize: 18 }} /> : <Brightness4Icon sx={{ fontSize: 18 }} />}
                    </IconButton>

                    <Button
                        onClick={onLanguageChange}
                        variant="text"
                        size="small"
                        sx={{
                            minWidth: 36,
                            minHeight: 36,
                            px: 1,
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.4)'
                            }
                        }}
                    >
                        {currentLanguage === 'en' ? (
                            <CountryFlag countryCode="US" svg style={{ width: 20, height: 15 }} title="English" />
                        ) : (
                            <CountryFlag countryCode="AR" svg style={{ width: 20, height: 15 }} title="Español" />
                        )}
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AppNavBar;
