import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthState } from '../useAuthState';

describe('useAuthState', () => {

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useAuthState());
        expect(result.current.activeTab).toBe(0);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.showLoginPassword).toBe(false);
        expect(result.current.showRegisterPassword).toBe(false);
        expect(result.current.loginData).toEqual({ username: '', password: '' });
        expect(result.current.registerData).toEqual({ username: '', email: '', password: '' });
    });

    it('should set activeTab and clear error on tab change', () => {
        const { result } = renderHook(() => useAuthState());
        act(() => {
            result.current.setError('Some error');
            result.current.handleTabChange({} as any, 1);
        });
        expect(result.current.activeTab).toBe(1);
        expect(result.current.error).toBeNull();
    });

    it('should update loading and error states', () => {
        const { result } = renderHook(() => useAuthState());
        act(() => {
            result.current.setLoading(true);
            result.current.setError('Error!');
        });
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe('Error!');
    });

    it('should toggle password visibility', () => {
        const { result } = renderHook(() => useAuthState());
        act(() => {
            result.current.setShowLoginPassword(true);
            result.current.setShowRegisterPassword(true);
        });
        expect(result.current.showLoginPassword).toBe(true);
        expect(result.current.showRegisterPassword).toBe(true);
    });

    it('should update login and register data', () => {
        const { result } = renderHook(() => useAuthState());
        act(() => {
            result.current.setLoginData({ username: 'user', password: 'pass' });
            result.current.setRegisterData({ username: 'user', email: 'mail@test.com', password: 'pass' });
        });
        expect(result.current.loginData).toEqual({ username: 'user', password: 'pass' });
        expect(result.current.registerData).toEqual({ username: 'user', email: 'mail@test.com', password: 'pass' });
    });

    it('should reset all forms and states', () => {
        const { result } = renderHook(() => useAuthState());
        act(() => {
            result.current.setLoginData({ username: 'user', password: 'pass' });
            result.current.setRegisterData({ username: 'user', email: 'mail@test.com', password: 'pass' });
            result.current.setError('Error!');
            result.current.setLoading(true);
            result.current.setShowLoginPassword(true);
            result.current.setShowRegisterPassword(true);
            result.current.resetForms();
        });
        expect(result.current.loginData).toEqual({ username: '', password: '' });
        expect(result.current.registerData).toEqual({ username: '', email: '', password: '' });
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.showLoginPassword).toBe(false);
        expect(result.current.showRegisterPassword).toBe(false);
    });
});
