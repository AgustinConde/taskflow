import { useMemo, useState } from "react";
import CountryFlag from "react-country-flag";
import TaskList from "./components/TaskList";
import { ThemeProvider, createTheme, CssBaseline, IconButton, Box, Button } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTranslation } from "react-i18next";
import "./i18n";

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const { i18n } = useTranslation();
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
      <Box sx={{ minHeight: '100vh', width: '100vw', display: 'block', backgroundColor: theme.palette.background.default }}>
        <TaskList />
      </Box>
    </ThemeProvider>
  );
}

export default App;