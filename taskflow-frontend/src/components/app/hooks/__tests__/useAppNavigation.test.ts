import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppNavigation } from '../useAppNavigation';

describe('useAppNavigation', () => {

    it('should initialize with tasks tab and dialog closed', () => {
        const { result } = renderHook(() => useAppNavigation());
        expect(result.current.currentTab).toBe('tasks');
        expect(result.current.authDialogOpen).toBe(false);
    });

    it('should change tab using setCurrentTab', () => {
        const { result } = renderHook(() => useAppNavigation());
        act(() => {
            result.current.setCurrentTab('dashboard');
        });
        expect(result.current.currentTab).toBe('dashboard');
    });

    it('should change tab using handleTabChange', () => {
        const { result } = renderHook(() => useAppNavigation());
        act(() => {
            result.current.handleTabChange({} as any, 'dashboard');
        });
        expect(result.current.currentTab).toBe('dashboard');
    });

    it('should open auth dialog', () => {
        const { result } = renderHook(() => useAppNavigation());
        act(() => {
            result.current.openAuthDialog();
        });
        expect(result.current.authDialogOpen).toBe(true);
    });

    it('should close auth dialog', () => {
        const { result } = renderHook(() => useAppNavigation());
        act(() => {
            result.current.openAuthDialog();
            result.current.closeAuthDialog();
        });
        expect(result.current.authDialogOpen).toBe(false);
    });
});
