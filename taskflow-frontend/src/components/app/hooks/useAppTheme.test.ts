import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppTheme } from './useAppTheme';

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
});

describe('useAppTheme Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with light mode by default', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const { result } = renderHook(() => useAppTheme());

            expect(result.current.mode).toBe('light');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('themeMode');
        });

        it('should initialize with saved mode from localStorage', () => {
            mockLocalStorage.getItem.mockReturnValue('dark');

            const { result } = renderHook(() => useAppTheme());

            expect(result.current.mode).toBe('dark');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('themeMode');
        });

        it('should fallback to light mode for invalid localStorage value', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid-mode');

            const { result } = renderHook(() => useAppTheme());

            expect(result.current.mode).toBe('light');
        });
    });

    describe('theme object', () => {
        it('should provide a Material-UI theme object', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const { result } = renderHook(() => useAppTheme());

            expect(result.current.theme).toBeDefined();
            expect(result.current.theme.palette).toBeDefined();
            expect(result.current.theme.palette.mode).toBe('light');
        });

        it('should have correct primary colors for light mode', () => {
            mockLocalStorage.getItem.mockReturnValue('light');

            const { result } = renderHook(() => useAppTheme());

            expect(result.current.theme.palette.primary.main).toBe('#7C3AED');
            expect(result.current.theme.palette.mode).toBe('light');
        });

        it('should have correct primary colors for dark mode', () => {
            mockLocalStorage.getItem.mockReturnValue('dark');

            const { result } = renderHook(() => useAppTheme());

            expect(result.current.theme.palette.primary.main).toBe('#886be1ff');
            expect(result.current.theme.palette.mode).toBe('dark');
        });
    });

    describe('toggleTheme', () => {
        it('should toggle from light to dark mode', () => {
            mockLocalStorage.getItem.mockReturnValue('light');

            const { result } = renderHook(() => useAppTheme());

            expect(result.current.mode).toBe('light');

            act(() => {
                result.current.toggleTheme();
            });

            expect(result.current.mode).toBe('dark');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
        });

        it('should toggle from dark to light mode', () => {
            mockLocalStorage.getItem.mockReturnValue('dark');

            const { result } = renderHook(() => useAppTheme());

            expect(result.current.mode).toBe('dark');

            act(() => {
                result.current.toggleTheme();
            });

            expect(result.current.mode).toBe('light');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
        });
    });

    describe('theme persistence', () => {
        it('should save theme mode to localStorage when toggling', () => {
            mockLocalStorage.getItem.mockReturnValue('light');

            const { result } = renderHook(() => useAppTheme());

            act(() => {
                result.current.toggleTheme();
            });

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
        });

        it('should update theme object when mode changes', () => {
            mockLocalStorage.getItem.mockReturnValue('light');

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
            mockLocalStorage.getItem.mockReturnValue('light');

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
