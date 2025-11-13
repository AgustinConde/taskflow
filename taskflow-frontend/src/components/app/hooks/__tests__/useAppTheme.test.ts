import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppTheme } from '../useAppTheme';

describe('useAppTheme', () => {
    beforeEach(() => localStorage.clear());

    it('initializes with saved mode', () => {
        localStorage.setItem('themeMode', 'dark');
        const { result } = renderHook(() => useAppTheme());
        expect(result.current.mode).toBe('dark');
        expect(result.current.theme.palette.mode).toBe('dark');
    });

    it('toggles theme', () => {
        const { result } = renderHook(() => useAppTheme());
        act(() => result.current.toggleTheme());
        expect(result.current.mode).toBe('dark');
        expect(localStorage.getItem('themeMode')).toBe('dark');
    });

    it('skips change when same mode', () => {
        const { result } = renderHook(() => useAppTheme());
        const initialTheme = result.current.theme;
        act(() => result.current.setThemeMode('light'));
        expect(result.current.theme).toBe(initialTheme);
    });
});
