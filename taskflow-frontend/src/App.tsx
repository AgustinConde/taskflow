import { useMemo, useState } from "react";
import CountryFlag from "react-country-flag";
import TaskList from "./components/TaskList";
import AuthDialog from "./components/AuthDialog";
import { ThemeProvider, createTheme, CssBaseline, IconButton, Box, Button, Typography, Paper, CircularProgress } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./i18n";

const AppContent = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { i18n } = useTranslation();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { t } = useTranslation();

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#7C3AED',
        light: '#A78BFA',
        dark: '#4C1D95',
        contrastText: '#fff',
      },
      secondary: {
        main: '#6366F1',
        light: '#C7D2FE',
        dark: '#312E81',
        contrastText: '#fff',
      },
      background: {
        default: mode === 'dark' ? '#18181B' : '#F3F4F6',
        paper: mode === 'dark' ? '#27272A' : '#fff',
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background.default
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
          <IconButton onClick={() => setMode(m => m === 'light' ? 'dark' : 'light')} color="inherit">
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
            backgroundColor: theme.palette.background.default,
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
    );
  }

  return (
    <>
      <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 1000 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('welcome')}, {user?.username}
          </Typography>
          <Button
            onClick={logout}
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            sx={{ minHeight: 36 }}
          >
            {t('logout')}
          </Button>
        </Box>
        <IconButton onClick={() => setMode(m => m === 'light' ? 'dark' : 'light')} color="inherit">
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
      <Box sx={{ minHeight: '100vh', width: '100vw', display: 'block', backgroundColor: theme.palette.background.default }}>
        <TaskList />
      </Box>
    </>
  );
};

function App() {
  const [mode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#7C3AED',
        light: '#A78BFA',
        dark: '#4C1D95',
        contrastText: '#fff',
      },
      secondary: {
        main: '#6366F1',
        light: '#C7D2FE',
        dark: '#312E81',
        contrastText: '#fff',
      },
      background: {
        default: mode === 'dark' ? '#18181B' : '#F3F4F6',
        paper: mode === 'dark' ? '#27272A' : '#fff',
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;