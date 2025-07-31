import { useMemo, useState, useEffect } from "react";
import CountryFlag from "react-country-flag";
import TaskList from "./components/task-list/TaskList";
import Dashboard from "./components/Dashboard";
import { AuthDialog } from "./components/auth-dialog";
import { ThemeProvider, createTheme, CssBaseline, IconButton, Box, Button, Typography, Paper, CircularProgress, useMediaQuery, useTheme, AppBar, Toolbar, Tab, Tabs } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TaskIcon from '@mui/icons-material/Task';
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider, useNotifications } from "./contexts/NotificationContext";
import type { Task } from "./types/Task";
import type { Category } from "./types/Category";
import { taskService } from "./services/taskService";
import { categoryService } from "./services/categoryService";
import "./i18n";

const AppContent = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as 'light' | 'dark') || 'light';
  });
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'tasks' | 'dashboard'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { i18n } = useTranslation();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { showInfo } = useNotifications();
  const { t } = useTranslation();

  const currentTheme = useTheme();
  const isSmallScreen = useMediaQuery(currentTheme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(currentTheme.breakpoints.down('md'));

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getTasks(),
        categoryService.getCategories()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#7C3AED' : '#886be1ff',
        light: mode === 'light' ? '#A78BFA' : '#C4B5FD',
        dark: mode === 'light' ? '#4C1D95' : '#6D28D9',
        contrastText: '#fff',
      },
      secondary: {
        main: mode === 'light' ? '#6366F1' : '#818CF8',
        light: mode === 'light' ? '#C7D2FE' : '#E0E7FF',
        dark: mode === 'light' ? '#312E81' : '#4338CA',
        contrastText: '#fff',
      },
      background: {
        default: mode === 'dark' ? '#18181B' : '#F3F4F6',
        paper: mode === 'dark' ? '#27272A' : '#fff',
      },
      text: {
        primary: mode === 'light' ? '#111827' : '#F9FAFB',
        secondary: mode === 'light' ? '#6B7280' : '#D1D5DB',
      },
      error: {
        main: '#EF4444',
      },
      warning: {
        main: mode === 'dark' ? '#FFE066' : '#F59E42',
        light: mode === 'dark' ? '#FFF9C4' : '#FFE29A',
      },
      info: {
        main: '#38BDF8',
      },
      success: {
        main: '#22C55E',
        light: '#BBF7D0',
      },
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
    },
  }), [mode]);

  const handleLangChange = () => {
    const newLanguage = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('selectedLanguage', newLanguage);
  };

  const handleLogout = () => {
    logout();
    showInfo(t('logoutSuccessful'));
  };

  const toggleTheme = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {loading ? (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : !isAuthenticated ? (
        <>
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button onClick={handleLangChange} variant="outlined" color="inherit" size="small" sx={{ fontSize: 22, px: 1.5, minWidth: 44, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i18n.language === 'en' ? (
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
                onClick={() => setAuthDialogOpen(true)}
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
            </Paper>
          </Box>

          <AuthDialog
            open={authDialogOpen}
            onClose={() => setAuthDialogOpen(false)}
          />
        </>
      ) : (
        <>
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
                  onChange={(_, newValue) => setCurrentTab(newValue)}
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
                  onClick={handleLogout}
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
                  onClick={toggleTheme}
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
                  onClick={handleLangChange}
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
                  {i18n.language === 'en' ? (
                    <CountryFlag countryCode="US" svg style={{ width: 20, height: 15 }} title="English" />
                  ) : (
                    <CountryFlag countryCode="AR" svg style={{ width: 20, height: 15 }} title="Español" />
                  )}
                </Button>
              </Box>
            </Toolbar>
          </AppBar>

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
              <Dashboard tasks={tasks} categories={categories} />
            ) : (
              <Box sx={{ px: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
                <TaskList />
              </Box>
            )}
          </Box>
        </>
      )}
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
