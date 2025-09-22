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
    IconButton,
    useMediaQuery,
    useTheme,
    Avatar,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TaskIcon from '@mui/icons-material/Task';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PWAStatusIndicator from '../common/PWAStatusIndicator';
import type { User } from '../../types/Auth';

interface AppNavBarProps {
    user: User | null;
    currentTab: 'tasks' | 'dashboard' | 'calendar';
    mode: 'light' | 'dark';
    currentLanguage: string;
    onTabChange: (event: React.SyntheticEvent, newValue: 'tasks' | 'dashboard' | 'calendar') => void;
    onToggleTheme: () => void;
    onLanguageChange: () => void;
    onLogout: () => void;
    onEditProfile: () => void;
}

const AppNavBar: React.FC<AppNavBarProps> = ({
    user,
    currentTab,
    mode,
    currentLanguage,
    onTabChange,
    onToggleTheme,
    onLanguageChange,
    onLogout,
    onEditProfile
}) => {
    const { t } = useTranslation();
    const currentTheme = useTheme();
    const isSmallScreen = useMediaQuery(currentTheme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(currentTheme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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
                        slotProps={{
                            indicator: {
                                style: {
                                    backgroundColor: 'white',
                                    height: 3,
                                    borderRadius: '2px 2px 0 0'
                                }
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
                        <Tab
                            value="calendar"
                            label={t('calendar')}
                            icon={<CalendarMonthIcon />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PWAStatusIndicator />
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
                            {isMediumScreen ? user?.username : `${t('welcome')}, ${user?.username}! `}
                        </Typography>
                    )}
                    <IconButton
                        onClick={handleAvatarClick}
                        sx={{ p: 0 }}
                    >
                        <Avatar
                            src={user?.avatarUrl}
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: !user?.avatarUrl
                                    ? (theme) => theme.palette.mode === 'dark'
                                        ? theme.palette.primary.dark
                                        : theme.palette.primary.light
                                    : undefined,
                                color: 'white',
                                fontSize: 18,
                                fontWeight: 400,
                                letterSpacing: 0.5
                            }}
                        >
                            {!user?.avatarUrl && user?.username
                                ? user.username.slice(0, 2).toUpperCase()
                                : null}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleMenuClose}
                        slotProps={{
                            paper: {
                                sx: {
                                    mt: 1.5,
                                    minWidth: 260,
                                    borderRadius: 3,
                                    boxShadow: 8,
                                    background: (theme) => theme.palette.mode === 'dark'
                                        ? theme.palette.background.paper
                                        : theme.palette.background.default,
                                    p: 0,
                                    overflow: 'visible',
                                }
                            },
                            list: {
                                autoFocusItem: false
                            }
                        }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            py: 2,
                            px: 2,
                            gap: 0.5,
                        }}>
                            <Avatar
                                src={user?.avatarUrl}
                                sx={{
                                    width: 56,
                                    height: 56,
                                    bgcolor: !user?.avatarUrl
                                        ? (theme) => theme.palette.primary.main
                                        : undefined,
                                    color: 'white',
                                    fontSize: 24,
                                    fontWeight: 400,
                                    letterSpacing: 0.5,
                                    mb: 1
                                }}
                            >
                                {!user?.avatarUrl && user?.username
                                    ? user.username.slice(0, 2).toUpperCase()
                                    : null}
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary', fontSize: '1.08rem', textAlign: 'center', maxWidth: 180 }}>
                                {user?.username}
                            </Typography>
                        </Box>
                        <Divider sx={{ mx: 2, my: 0.5 }} />
                        <MenuItem
                            onClick={onEditProfile}
                            sx={{
                                borderRadius: 2,
                                px: 2.5,
                                py: 1.3,
                                fontWeight: 500,
                                fontSize: '1rem',
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'background 0.2s',
                                '&:hover, &.Mui-focusVisible': {
                                    background: (theme) => theme.palette.primary.light,
                                    color: (theme) => theme.palette.primary.contrastText
                                }
                            }}
                        >
                            <EditIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                            {t('editProfile')}
                        </MenuItem>
                        <Divider sx={{ mx: 2, my: 0.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, px: 2.5, py: 1.3 }}>
                            <Box
                                component="button"
                                onClick={onLanguageChange}
                                sx={{
                                    border: 'none',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    borderRadius: 999,
                                    px: 1.2,
                                    py: 0.5,
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.07)',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'background 0.2s',
                                    borderColor: (theme) => theme.palette.primary.main,
                                    borderWidth: 1,
                                    borderStyle: 'solid',
                                    '&:hover': {
                                        bgcolor: (theme) => theme.palette.primary.light,
                                        boxShadow: '0 2px 8px rgba(124,58,237,0.10)'
                                    }
                                }}
                            >
                                {currentLanguage === 'en'
                                    ? <CountryFlag countryCode="US" svg style={{ width: 28, height: 20 }} title="English" />
                                    : <CountryFlag countryCode="AR" svg style={{ width: 28, height: 20 }} title="Español" />}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    component="button"
                                    onClick={onToggleTheme}
                                    sx={{
                                        border: 'none',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        borderRadius: 999,
                                        px: 1.2,
                                        py: 0.5,
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.07)',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'background 0.2s',
                                        borderColor: (theme) => theme.palette.primary.main,
                                        borderWidth: 1,
                                        borderStyle: 'solid',
                                        '&:hover': {
                                            bgcolor: (theme) => theme.palette.primary.light,
                                            boxShadow: '0 2px 8px rgba(124,58,237,0.10)'
                                        }
                                    }}
                                >
                                    {mode === 'dark'
                                        ? <Brightness7Icon sx={{ fontSize: 22, color: 'primary.main' }} />
                                        : <Brightness4Icon sx={{ fontSize: 22, color: 'primary.main' }} />}
                                </Box>
                            </Box>
                        </Box>
                        <Divider sx={{ mx: 2, my: 0.5 }} />
                        <MenuItem
                            onClick={onLogout}
                            sx={{
                                borderRadius: 2,
                                px: 2.5,
                                py: 1.3,
                                fontWeight: 500,
                                fontSize: '1rem',
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'background 0.2s',
                                '&:hover, &.Mui-focusVisible': {
                                    background: (theme) => theme.palette.error.light,
                                    color: (theme) => theme.palette.error.contrastText
                                }
                            }}
                        >
                            <LogoutIcon sx={{ fontSize: 22, color: 'error.main' }} />
                            {t('logout')}
                        </MenuItem>
                        <Box sx={{ height: 8 }} />
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AppNavBar;
