import { useMemo, useState } from "react";
import CountryFlag from "react-country-flag";
import TaskList from "./components/TaskList";
import AuthDialog from "./components/AuthDialog";
import { ThemeProvider, createTheme, CssBaseline, IconButton, Box, Button, Typography, Paper, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./i18n";

const AppContent = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as 'light' | 'dark') || 'light';
  });
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { i18n } = useTranslation();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { t } = useTranslation();

  const currentTheme = useTheme();
  const isSmallScreen = useMediaQuery(currentTheme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(currentTheme.breakpoints.down('md'));

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#7C3AED' : '#A78BFA',
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
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
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
          <Box sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            gap: 1,
            zIndex: 1000,
            maxWidth: { xs: 'calc(100vw - 160px)', sm: 'calc(100vw - 140px)', md: 'calc(100vw - 120px)' }
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mr: 2,
              minWidth: 0,
              overflow: 'hidden',
              maxWidth: { xs: 140, sm: 180, md: 220, lg: 260 }
            }}>
              {!isSmallScreen && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: { xs: 60, sm: 80, md: 120, lg: 140 }
                  }}
                >
                  {isMediumScreen ? user?.username : `${t('welcome')}, ${user?.username}`}
                </Typography>
              )}
              <Button
                onClick={logout}
                variant="outlined"
                size="small"
                startIcon={!isSmallScreen ? <LogoutIcon /> : undefined}
                sx={{
                  minHeight: 36,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: isSmallScreen ? 36 : 'auto',
                  px: isSmallScreen ? 0 : undefined
                }}
              >
                {isSmallScreen ? <LogoutIcon /> : t('logout')}
              </Button>
            </Box>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button onClick={handleLangChange} variant="outlined" color="inherit" size="small" sx={{ fontSize: 22, px: 1.5, minWidth: 44, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i18n.language === 'en' ? (
                <CountryFlag countryCode="US" svg style={{ width: 28, height: 22 }} title="English" />
              ) : (
                <CountryFlag countryCode="AR" svg style={{ width: 28, height: 22 }} title="Español" />
              )}
            </Button>
          </Box>
          <Box sx={{ minHeight: '100vh', width: '100vw', display: 'block' }}>
            <TaskList />
          </Box>
        </>
      )}
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
