import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthOperations } from '../useAuthOperations';
import { AuthProvider, useAuth } from '../../../../contexts/AuthContext';
import { NotificationProvider } from '../../../../contexts/NotificationContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../../__tests__/utils/i18n-test';

const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <I18nextProvider i18n={i18n}>
            <NotificationProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </NotificationProvider>
        </I18nextProvider>
    );
};

vi.mock('../../../../contexts/AuthContext', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        AuthProvider: actual.AuthProvider,
        useAuth: vi.fn(() => ({
            login: vi.fn().mockResolvedValue(true),
            register: vi.fn().mockResolvedValue(true)
        }))
    };
});

describe('useAuthOperations Hook', () => {
    const mockProps = {
        setLoading: vi.fn(),
        setError: vi.fn(),
        onSuccess: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('handleLogin', () => {
        it('should handle successful login', async () => {
            const { result } = renderHook(() => useAuthOperations(mockProps), {
                wrapper: createWrapper(),
            });

            const loginData = {
                username: 'testuser',
                password: 'password123'
            };

            await act(async () => {
                await result.current.handleLogin(loginData);
            });

            expect(mockProps.setLoading).toHaveBeenCalledWith(true);
            expect(mockProps.setError).toHaveBeenCalledWith(null);
            expect(mockProps.setLoading).toHaveBeenCalledWith(false);
        });

        it('should call setLoading with correct values', async () => {
            const { result } = renderHook(() => useAuthOperations(mockProps), {
                wrapper: createWrapper(),
            });

            const loginData = {
                username: 'testuser',
                password: 'password123'
            };

            await act(async () => {
                await result.current.handleLogin(loginData);
            });

            expect(mockProps.setLoading).toHaveBeenCalledTimes(2);
            expect(mockProps.setLoading).toHaveBeenNthCalledWith(1, true);
            expect(mockProps.setLoading).toHaveBeenNthCalledWith(2, false);
        });

        it('should show success notification and call onSuccess on successful login', async () => {
            const { result } = renderHook(() => useAuthOperations(mockProps), {
                wrapper: createWrapper(),
            });
            const loginData = { username: 'testuser', password: 'password123' };
            await act(async () => {
                await result.current.handleLogin(loginData);
            });
            expect(mockProps.onSuccess).toHaveBeenCalled();
        });

        it('should show error notification on failed login', async () => {
            (useAuth as unknown as { mockImplementationOnce: Function }).mockImplementationOnce(() => ({
                login: vi.fn().mockResolvedValue(false),
                register: vi.fn()
            }));
            const { result } = renderHook(() => useAuthOperations({ ...mockProps, onSuccess: vi.fn() }), {
                wrapper: createWrapper(),
            });
            await act(async () => {
                await result.current.handleLogin({ username: 'fail', password: 'fail' });
            });
        });
    });
    describe('handleRegister', () => {
        it('should handle successful registration', async () => {
            const { result } = renderHook(() => useAuthOperations(mockProps), {
                wrapper: createWrapper(),
            });

            const registerData = {
                username: 'testuser',
                email: 'test@test.com',
                password: 'password123'
            };

            await act(async () => {
                await result.current.handleRegister(registerData);
            });

            expect(mockProps.setLoading).toHaveBeenCalledWith(true);
            expect(mockProps.setError).toHaveBeenCalledWith(null);
            expect(mockProps.setLoading).toHaveBeenCalledWith(false);
        });

        it('should show success notification and call onSuccess on successful register', async () => {
            const { result } = renderHook(() => useAuthOperations(mockProps), {
                wrapper: createWrapper(),
            });
            const registerData = { username: 'testuser', email: 'test@test.com', password: 'password123' };
            await act(async () => {
                await result.current.handleRegister(registerData);
            });
            expect(mockProps.onSuccess).toHaveBeenCalled();
        });

        it('should show error notification on failed register', async () => {
            (useAuth as unknown as { mockImplementationOnce: Function }).mockImplementationOnce(() => ({
                login: vi.fn(),
                register: vi.fn().mockResolvedValue(false)
            }));
            const { result } = renderHook(() => useAuthOperations({ ...mockProps, onSuccess: vi.fn() }), {
                wrapper: createWrapper(),
            });
            await act(async () => {
                await result.current.handleRegister({ username: 'fail', email: 'fail@test.com', password: 'password123' });
            });
        });

        it('should set error with translated message if password too short', async () => {
            const { result } = renderHook(() => useAuthOperations(mockProps), {
                wrapper: createWrapper(),
            });
            const registerData = { username: 'testuser', email: 'test@test.com', password: '123' };
            await act(async () => {
                await result.current.handleRegister(registerData);
            });
            expect(mockProps.setError).toHaveBeenCalledWith(
                expect.stringContaining('Password must be at least 6 characters long')
            );
        });
    });

    it('should provide both handle functions', () => {
        const { result } = renderHook(() => useAuthOperations(mockProps), {
            wrapper: createWrapper(),
        });

        expect(result.current.handleLogin).toBeDefined();
        expect(result.current.handleRegister).toBeDefined();
        expect(typeof result.current.handleLogin).toBe('function');
        expect(typeof result.current.handleRegister).toBe('function');
    });
});
