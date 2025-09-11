import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { AuthDialog } from '../auth-dialog';
import { useAppTheme, useAppNavigation, useAppData, useAppLanguage } from './hooks';
import LoadingScreen from './LoadingScreen';
import UnauthenticatedApp from './UnauthenticatedApp';
import AuthenticatedApp from './AuthenticatedApp';

const AppContent: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();
    const { mode, theme, toggleTheme } = useAppTheme();
    const {
        currentTab,
        handleTabChange,
        authDialogOpen,
        openAuthDialog,
        closeAuthDialog
    } = useAppNavigation();
    const [authDialogTab, setAuthDialogTab] = React.useState(0);
    const { tasks, categories, dataLoading } = useAppData();
    const { currentLanguage, handleLanguageChange } = useAppLanguage();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {loading ? (
                <LoadingScreen />
            ) : !isAuthenticated ? (
                <>
                    <UnauthenticatedApp
                        mode={mode}
                        currentLanguage={currentLanguage}
                        onToggleTheme={toggleTheme}
                        onLanguageChange={handleLanguageChange}
                        onOpenAuthDialog={() => { setAuthDialogTab(0); openAuthDialog(); }}
                        onOpenRegisterDialog={() => { setAuthDialogTab(1); openAuthDialog(); }}
                    />
                    <AuthDialog
                        open={authDialogOpen}
                        onClose={closeAuthDialog}
                        initialTab={authDialogTab}
                    />
                </>
            ) : (
                <AuthenticatedApp
                    currentTab={currentTab}
                    mode={mode}
                    currentLanguage={currentLanguage}
                    tasks={tasks}
                    categories={categories}
                    dataLoading={dataLoading}
                    onTabChange={handleTabChange}
                    onToggleTheme={toggleTheme}
                    onLanguageChange={handleLanguageChange}
                />
            )}
        </ThemeProvider>
    );
};

export default AppContent;
