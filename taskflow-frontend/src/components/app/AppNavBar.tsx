import React from 'react';
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
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import PWAStatusIndicator from '../common/PWAStatusIndicator';
import type { User } from '../../types/Auth';

interface AppNavBarProps {
    user: User | null;
    currentTab: 'tasks' | 'dashboard' | 'calendar' | 'achievements';
    onTabChange: (event: React.SyntheticEvent, newValue: 'tasks' | 'dashboard' | 'calendar' | 'achievements') => void;
    onOpenSettings: () => void;
    onLogout: () => void;
    onEditProfile: () => void;
}

const AppNavBar: React.FC<AppNavBarProps> = ({
    user,
    currentTab,
    onTabChange,
    onOpenSettings,
    onLogout,
    onEditProfile
}) => {
    const { t } = useTranslation();
    const currentTheme = useTheme();
    const isSmallScreen = useMediaQuery(currentTheme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(currentTheme.breakpoints.down('md'));
    const compactTabs = useMediaQuery(currentTheme.breakpoints.down('lg'));
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSettings = () => {
        handleMenuClose();
        onOpenSettings();
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
            <Toolbar sx={{
                justifyContent: 'space-between',
                px: { xs: 1, sm: 2, md: 3 },
                minHeight: { xs: 56, sm: 64 },
                gap: { xs: 0.5, sm: 1, md: 2 },
                flexWrap: 'nowrap',
                overflowX: compactTabs ? 'auto' : 'visible',
                overflowY: 'visible'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2, md: 3 },
                    flex: '1 1 auto',
                    minWidth: 0,
                    overflowX: compactTabs ? 'auto' : 'visible',
                    overflowY: 'visible'
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
                        variant={compactTabs ? 'scrollable' : 'standard'}
                        scrollButtons={compactTabs ? 'auto' : false}
                        allowScrollButtonsMobile
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
                            minWidth: 0,
                            flexShrink: 1,
                            overflow: 'visible',
                            '& .MuiTabs-flexContainer': {
                                flexWrap: compactTabs ? 'nowrap' : 'wrap'
                            },
                            '& .MuiTab-root': {
                                color: 'rgba(255,255,255,0.7)',
                                minHeight: 48,
                                minWidth: compactTabs ? 'auto' : { xs: 80, sm: 90 },
                                px: { xs: compactTabs ? 1 : 1.2, sm: 2 },
                                flex: compactTabs ? '0 0 auto' : undefined,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: compactTabs ? { xs: '0.7rem', sm: '0.8rem' } : { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' },
                                whiteSpace: 'nowrap',
                                '&.Mui-selected': {
                                    color: 'white',
                                },
                                '&:hover': {
                                    color: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                },
                                '& .MuiSvgIcon-root': {
                                    fontSize: compactTabs ? { xs: '1rem', sm: '1.15rem' } : { xs: '1.1rem', sm: '1.3rem' }
                                }
                            }
                        }}
                    >
                        <Tab
                            value="tasks"
                            label={t('tasks')}
                            icon={<TaskIcon />}
                            iconPosition={compactTabs ? 'top' : 'start'}
                        />
                        <Tab
                            value="dashboard"
                            label={t('dashboard')}
                            icon={<DashboardIcon />}
                            iconPosition={compactTabs ? 'top' : 'start'}
                        />
                        <Tab
                            value="calendar"
                            label={t('calendar')}
                            icon={<CalendarMonthIcon />}
                            iconPosition={compactTabs ? 'top' : 'start'}
                        />
                        <Tab
                            value="achievements"
                            label={t('achievements')}
                            icon={<EmojiEvents />}
                            iconPosition={compactTabs ? 'top' : 'start'}
                        />
                    </Tabs>
                </Box>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 },
                    flex: '0 0 auto',
                    minWidth: 0
                }}>
                    <PWAStatusIndicator />
                    {!isSmallScreen && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.85)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: { xs: 80, sm: 100, md: 140, lg: 180 },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
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
                        <MenuItem
                            onClick={handleSettings}
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
                            <SettingsIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                            {t('settings.title')}
                        </MenuItem>
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
