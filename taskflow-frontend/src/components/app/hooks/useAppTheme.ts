import { useState, useMemo } from 'react';
import { createTheme } from '@mui/material';

export const useAppTheme = () => {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const savedMode = localStorage.getItem('themeMode');
        return (savedMode as 'light' | 'dark') || 'light';
    });

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

    const toggleTheme = () => {
        setMode(prevMode => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    return {
        mode,
        theme,
        toggleTheme
    };
};
