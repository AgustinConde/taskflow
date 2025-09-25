import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Box, CircularProgress } from '@mui/material';
import TaskList from '../task-list/TaskList';
import { LazyDashboard } from '../dashboard';
import CalendarPage from '../../pages/CalendarPage';
import AchievementsPage from '../../pages/AchievementsPage';
import AppNavBar from './AppNavBar';
import UserProfileDialog from '../user/UserProfileDialog';
import type { Task } from '../../types/Task';
import type { Category } from '../../types/Category';

interface AuthenticatedAppProps {
    currentTab: 'tasks' | 'dashboard' | 'calendar' | 'achievements';
    mode: 'light' | 'dark';
    currentLanguage: string;
    tasks: Task[];
    categories: Category[];
    dataLoading: boolean;
    onTabChange: (event: React.SyntheticEvent, newValue: 'tasks' | 'dashboard' | 'calendar' | 'achievements') => void;
    onToggleTheme: () => void;
    onLanguageChange: () => void;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({
    currentTab,
    mode,
    currentLanguage,
    tasks,
    categories,
    dataLoading,
    onTabChange,
    onToggleTheme,
    onLanguageChange
}) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { showInfo } = useNotifications();

    const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);

    const handleOpenProfileDialog = () => setProfileDialogOpen(true);
    const handleCloseProfileDialog = () => setProfileDialogOpen(false);
    const handleSaveProfile = () => {
        setProfileDialogOpen(false);
        showInfo(t('profileUpdated'));
    };

    const handleLogout = () => {
        logout();
        showInfo(t('logoutSuccessful'));
    };

    return (
        <>
            <AppNavBar
                user={user}
                currentTab={currentTab}
                mode={mode}
                currentLanguage={currentLanguage}
                onTabChange={onTabChange}
                onToggleTheme={onToggleTheme}
                onLanguageChange={onLanguageChange}
                onLogout={handleLogout}
                onEditProfile={handleOpenProfileDialog}
            />

            <UserProfileDialog
                open={profileDialogOpen}
                user={user}
                onClose={handleCloseProfileDialog}
                onSave={handleSaveProfile}
            />

            <Box sx={{
                minHeight: '100vh',
                pt: { xs: 8, sm: 9 },
                backgroundColor: 'background.default'
            }}>
                {dataLoading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '50vh'
                        }}
                    >
                        <CircularProgress size={60} />
                    </Box>
                ) : currentTab === 'dashboard' ? (
                    <LazyDashboard tasks={tasks} categories={categories} />
                ) : currentTab === 'calendar' ? (
                    <CalendarPage />
                ) : currentTab === 'achievements' ? (
                    <AchievementsPage />
                ) : (
                    <Box sx={{ px: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
                        <TaskList />
                    </Box>
                )}
            </Box>
        </>
    );
};

export default AuthenticatedApp;
