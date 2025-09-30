import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import { NotificationProvider } from '../../contexts/NotificationContext';

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowWarning = vi.fn();
const mockShowInfo = vi.fn();

vi.mock('../../contexts/NotificationContext', () => ({
    useNotifications: () => ({
        showSuccess: mockShowSuccess,
        showError: mockShowError,
        showWarning: mockShowWarning,
        showInfo: mockShowInfo
    }),
    NotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>
            {children}
        </NotificationProvider>
    );
};

describe('useNotifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should expose all base notification methods', () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        expect(typeof result.current.showSuccess).toBe('function');
        expect(typeof result.current.showError).toBe('function');
        expect(typeof result.current.showWarning).toBe('function');
        expect(typeof result.current.showInfo).toBe('function');
    });

    it('should call showError', () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        result.current.showError('Test error message');

        expect(mockShowError).toHaveBeenCalledWith('Test error message');
    });

    it('should call showWarning', () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        result.current.showWarning('Test warning message');

        expect(mockShowWarning).toHaveBeenCalledWith('Test warning message');
    });

    it('should debounce duplicate error notifications', async () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        result.current.showError('Duplicate error');
        expect(mockShowError).toHaveBeenCalledTimes(1);

        result.current.showError('Duplicate error');
        expect(mockShowError).toHaveBeenCalledTimes(1);

        await new Promise(resolve => setTimeout(resolve, 1100));

        result.current.showError('Duplicate error');
        expect(mockShowError).toHaveBeenCalledTimes(2);
    });

    it('should debounce duplicate warning notifications', async () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        result.current.showWarning('Duplicate warning');
        expect(mockShowWarning).toHaveBeenCalledTimes(1);

        result.current.showWarning('Duplicate warning');
        expect(mockShowWarning).toHaveBeenCalledTimes(1);
        await new Promise(resolve => setTimeout(resolve, 1100));

        result.current.showWarning('Duplicate warning');
        expect(mockShowWarning).toHaveBeenCalledTimes(2);
    });

    it('should use custom identifier for error notifications', () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        result.current.showError('Custom error', 'error-id-1');
        expect(mockShowError).toHaveBeenCalledWith('Custom error');

        result.current.showError('Custom error', 'error-id-2');
        expect(mockShowError).toHaveBeenCalledTimes(2);

        result.current.showError('Different message', 'error-id-1');
        expect(mockShowError).toHaveBeenCalledTimes(2);
    });

    it('should use custom identifier for warning notifications', () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        result.current.showWarning('Custom warning', 'warning-id-1');
        expect(mockShowWarning).toHaveBeenCalledWith('Custom warning');

        result.current.showWarning('Custom warning', 'warning-id-2');
        expect(mockShowWarning).toHaveBeenCalledTimes(2);

        result.current.showWarning('Different message', 'warning-id-1');
        expect(mockShowWarning).toHaveBeenCalledTimes(2);
    });

    it('should clean up notification cache after debounce time', async () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        result.current.showSuccess('Test success');
        expect(mockShowSuccess).toHaveBeenCalledTimes(1);

        await new Promise(resolve => setTimeout(resolve, 1100));

        result.current.showSuccess('Test success');
        expect(mockShowSuccess).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple different notifications without interference', () => {
        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper()
        });

        result.current.showSuccess('Success 1');
        result.current.showError('Error 1');
        result.current.showWarning('Warning 1');
        result.current.showInfo('Info 1');

        expect(mockShowSuccess).toHaveBeenCalledWith('Success 1');
        expect(mockShowError).toHaveBeenCalledWith('Error 1');
        expect(mockShowWarning).toHaveBeenCalledWith('Warning 1');
        expect(mockShowInfo).toHaveBeenCalledWith('Info 1');

        expect(mockShowSuccess).toHaveBeenCalledTimes(1);
        expect(mockShowError).toHaveBeenCalledTimes(1);
        expect(mockShowWarning).toHaveBeenCalledTimes(1);
        expect(mockShowInfo).toHaveBeenCalledTimes(1);
    });
});
