import { useMemo, useState } from "react";
import TaskList from "./components/TaskList";
import { ThemeProvider, createTheme, CssBaseline, IconButton, Box } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#7C3AED', // Main Violet (Purple 600)
        light: '#A78BFA', // Purple 300
        dark: '#4C1D95', // Purple 900
        contrastText: '#fff',
      },
      secondary: {
        main: '#6366F1', // Indigo 500
        light: '#C7D2FE', // Indigo 200
        dark: '#312E81', // Indigo 900
        contrastText: '#fff',
      },
      background: {
        default: mode === 'dark' ? '#18181B' : '#F3F4F6', // Gray 900 / Gray 100
        paper: mode === 'dark' ? '#27272A' : '#fff', // Gray 800 / White
      },
      error: {
        main: '#EF4444', // Red 500
      },
      warning: {
        main: mode === 'dark' ? '#FFE066' : '#F59E42', // Lighter orange
        light: mode === 'dark' ? '#FFF9C4' : '#FFE29A', // Lighter pastel yellow
      },
      info: {
        main: '#38BDF8', // Sky 400
      },
      success: {
        main: '#22C55E', // Green 500
        light: '#BBF7D0', // Green 200 pastel
      },
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
    },
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton onClick={() => setMode(m => m === 'light' ? 'dark' : 'light')} color="inherit">
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw" }}>
        <TaskList />
      </Box>
    </ThemeProvider>
  );
}

export default App;