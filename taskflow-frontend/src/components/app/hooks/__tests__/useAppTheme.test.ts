import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppTheme } from '../useAppTheme';


// No usar spies para simular valores, solo para verificar llamadas si es necesario

describe('useAppTheme Hook', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    describe('initialization', () => {
        it('should initialize with light mode by default', () => {
            window.localStorage.removeItem('themeMode');
            const { result } = renderHook(() => useAppTheme());
            expect(result.current.mode).toBe('light');
        });

        it('should initialize with saved mode from localStorage', () => {
            window.localStorage.setItem('themeMode', 'dark');
            const { result } = renderHook(() => useAppTheme());
            expect(result.current.mode).toBe('dark');
        });

        it('should fallback to light mode for invalid localStorage value', () => {
            window.localStorage.setItem('themeMode', 'invalid-mode');
            const { result } = renderHook(() => useAppTheme());
            expect(result.current.mode).toBe('light');
        });
    });

    describe('theme object', () => {
        it('should provide a Material-UI theme object', () => {
            window.localStorage.removeItem('themeMode');
            const { result } = renderHook(() => useAppTheme());
            expect(result.current.theme).toBeDefined();
            expect(result.current.theme.palette).toBeDefined();
            expect(result.current.theme.palette.mode).toBe('light');
        });

        it('should have correct primary colors for light mode', () => {
            window.localStorage.setItem('themeMode', 'light');
            const { result } = renderHook(() => useAppTheme());
            expect(result.current.theme.palette.primary.main).toBe('#7C3AED');
            expect(result.current.theme.palette.mode).toBe('light');
        });

        it('should have correct primary colors for dark mode', () => {
            window.localStorage.setItem('themeMode', 'dark');
            const { result } = renderHook(() => useAppTheme());
            expect(result.current.theme.palette.primary.main).toBe('#886be1ff');
            expect(result.current.theme.palette.mode).toBe('dark');
        });
    });

    describe('toggleTheme', () => {
        it('should toggle from light to dark mode', () => {
            window.localStorage.setItem('themeMode', 'light');
            const { result } = renderHook(() => useAppTheme());
            expect(result.current.mode).toBe('light');
            act(() => {
                result.current.toggleTheme();
            });
            expect(result.current.mode).toBe('dark');
            expect(window.localStorage.getItem('themeMode')).toBe('dark');
        });

        it('should toggle from dark to light mode', () => {
            window.localStorage.setItem('themeMode', 'dark');
            const { result } = renderHook(() => useAppTheme());
            expect(result.current.mode).toBe('dark');
            act(() => {
                result.current.toggleTheme();
            });
            expect(result.current.mode).toBe('light');
            expect(window.localStorage.getItem('themeMode')).toBe('light');
        });
    });

    describe('theme persistence', () => {
        it('should save theme mode to localStorage when toggling', () => {
            window.localStorage.setItem('themeMode', 'light');
            const { result } = renderHook(() => useAppTheme());
            act(() => {
                result.current.toggleTheme();
            });
            expect(window.localStorage.getItem('themeMode')).toBe('dark');
        });

        it('should update theme object when mode changes', () => {
            window.localStorage.setItem('themeMode', 'light');
            const { result } = renderHook(() => useAppTheme());
            const lightTheme = result.current.theme;
            expect(lightTheme.palette.mode).toBe('light');
            act(() => {
                result.current.toggleTheme();
            });
            const darkTheme = result.current.theme;
            expect(darkTheme.palette.mode).toBe('dark');
            expect(darkTheme).not.toBe(lightTheme);
        });
    });

    describe('theme structure', () => {
        it('should provide all required theme properties', () => {
            const { result } = renderHook(() => useAppTheme());

            expect(result.current).toHaveProperty('mode');
            expect(result.current).toHaveProperty('theme');
            expect(result.current).toHaveProperty('toggleTheme');
            expect(typeof result.current.toggleTheme).toBe('function');
        });

        it('should have consistent theme structure across mode changes', () => {
            window.localStorage.setItem('themeMode', 'light');
            const { result } = renderHook(() => useAppTheme());
            const lightProperties = Object.keys(result.current.theme);
            act(() => {
                result.current.toggleTheme();
            });
            const darkProperties = Object.keys(result.current.theme);
            expect(lightProperties).toEqual(darkProperties);
        });
    });
});
