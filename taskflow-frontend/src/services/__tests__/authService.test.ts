import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../authService';
import { server } from '../../__tests__/mocks/server';

import { ROOT_URL } from '../../config/api';

const mockFetch = (responseData: any, ok = true, status = 200) => {
    return vi.fn().mockResolvedValue({
        ok,
        status,
        json: vi.fn().mockResolvedValue(responseData)
    });
};

const mockFetchReject = (error: Error) => {
    return vi.fn().mockRejectedValue(error);
};

describe('AuthService', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        server.resetHandlers();
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
        global.fetch = originalFetch;
    });

    describe('token management', () => {
        it('should store token in localStorage', () => {
            const token = 'test-token';
            authService.setToken(token);
            expect(window.localStorage.getItem('taskflow_token')).toBe(token);
        });

        it('should retrieve token from localStorage', () => {
            const token = 'test-token';
            window.localStorage.setItem('taskflow_token', token);
            const result = authService.getToken();
            expect(result).toBe(token);
        });

        it('should return null when no token exists', () => {
            window.localStorage.removeItem('taskflow_token');
            const result = authService.getToken();
            expect(result).toBeNull();
        });

        it('should remove token from localStorage', () => {
            window.localStorage.setItem('taskflow_token', 'test-token');
            authService.removeToken();
            expect(window.localStorage.getItem('taskflow_token')).toBeNull();
        });
    });

    describe('token validation', () => {
        it('should return false for valid token', () => {
            const validToken = createMockJWT({ exp: Math.floor(Date.now() / 1000) + 3600 }); // 1 hour from now
            window.localStorage.setItem('taskflow_token', validToken);
            const result = authService.isTokenExpired();
            expect(result).toBe(false);
        });

        it('should return true for expired token', () => {
            const expiredToken = createMockJWT({ exp: Math.floor(Date.now() / 1000) - 3600 }); // 1 hour ago
            window.localStorage.setItem('taskflow_token', expiredToken);
            const result = authService.isTokenExpired();
            expect(result).toBe(true);
        });

        it('should return true for invalid token format', () => {
            window.localStorage.setItem('taskflow_token', 'invalid-token');
            const result = authService.isTokenExpired();
            expect(result).toBe(true);
        });

        it('should return true when no token exists', () => {
            window.localStorage.removeItem('taskflow_token');
            const result = authService.isTokenExpired();
            expect(result).toBe(true);
        });
    });

    describe('authentication API calls', () => {
        it('should login successfully', async () => {
            const credentials = { username: 'testuser', password: 'password123' };
            const mockResponse = {
                token: 'test-token',
                username: 'testuser',
                email: 'test@example.com',
                expiresAt: '2025-01-01T00:00:00Z'
            };
            global.fetch = mockFetch(mockResponse);

            const response = await authService.login(credentials);

            expect(response).toHaveProperty('token');
            expect(response).toHaveProperty('username');
            expect(response).toHaveProperty('email');
            expect(response).toHaveProperty('expiresAt');
        });

        it('should register successfully', async () => {
            const userData = {
                username: 'newuser',
                email: 'newuser@test.com',
                password: 'password123'
            };
            global.fetch = mockFetch({ message: 'Registration successful' });

            const response = await authService.register(userData);
            expect(response).toBe(true);
        });


        it('should validate token with server', async () => {
            const validToken = 'valid-token';
            window.localStorage.setItem('taskflow_token', validToken);
            global.fetch = mockFetch({});

            const result = await authService.validateToken();
            expect(result).toBe(true);
        });

        it('should return false if validateToken throws', async () => {
            global.fetch = mockFetchReject(new Error('Network error'));
            const result = await authService.validateToken();
            expect(result).toBe(false);
        });

        it('should get current user data', async () => {
            const mockUser = { id: 1, username: 'mockuser', email: 'mock@test.com' };
            global.fetch = mockFetch(mockUser);
            const userData = await authService.getCurrentUser();
            expect(userData).toHaveProperty('id', 1);
            expect(userData).toHaveProperty('username', 'mockuser');
            expect(userData).toHaveProperty('email', 'mock@test.com');
        });

        it('should throw error if getCurrentUser response is not ok', async () => {
            global.fetch = mockFetch({}, false);
            await expect(authService.getCurrentUser()).rejects.toThrow('Failed to get user data');
        });

        it('should format avatarUrl in getCurrentUser', async () => {
            const userResponse = { id: 1, username: 'u', email: 'e', avatarUrl: '/uploads/avatar.png' };
            global.fetch = mockFetch(userResponse);
            const result = await authService.getCurrentUser();
            expect(result.avatarUrl).toContain(`${ROOT_URL}/uploads/avatar.png?t=`);
        });
    });

    it('register returns true on success', async () => {
        global.fetch = mockFetch({ message: 'auth.register.success' });
        const result = await authService.register({ username: 'u', email: 'e', password: 'p' });
        expect(result).toBe(true);
    });

    describe('logout', () => {
        it('should clear token and call removeToken', () => {
            window.localStorage.setItem('taskflow_token', 'test-token');
            authService.logout();
            expect(window.localStorage.getItem('taskflow_token')).toBeNull();
        });
    });

    describe('getAuthHeaders', () => {
        it('should include Authorization header if token exists', () => {
            window.localStorage.setItem('taskflow_token', 'abc123');
            const headers = (authService as any).getAuthHeaders();
            expect(headers).toHaveProperty('Authorization', 'Bearer abc123');
        });
        it('should not include Authorization header if no token', () => {
            window.localStorage.removeItem('taskflow_token');
            const headers = (authService as any).getAuthHeaders();
            expect(headers).not.toHaveProperty('Authorization');
        });
    });

    describe('login error branches', () => {
        it('should throw error with custom message if error.message exists', async () => {
            global.fetch = mockFetch({ message: 'Custom error' }, false);
            await expect(authService.login({ username: 'fail', password: 'fail' })).rejects.toThrow('Custom error');
        });

        it("should throw error with default message if error.message doesn't exist", async () => {
            global.fetch = mockFetch({}, false);
            await expect(authService.login({ username: 'fail', password: 'fail' })).rejects.toThrow('Login failed');
        });

        it('should return authResponse after successful login', async () => {
            const mockResponse = {
                token: 'abc',
                username: 'user',
                email: 'user@test.com',
                expiresAt: '2025-01-01T00:00:00Z'
            };
            global.fetch = mockFetch(mockResponse);
            const result = await authService.login({ username: 'user', password: 'pass' });
            expect(result).toEqual(mockResponse);
        });

        it('should throw emailNotConfirmed error object', async () => {
            global.fetch = mockFetch({ message: 'auth.login.emailNotConfirmed' }, false);
            try {
                await authService.login({ username: 'test', password: 'test' });
            } catch (error: any) {
                expect(error.code).toBe('emailNotConfirmed');
                expect(error.email).toBe('test');
                expect(error.message).toBe('auth.login.emailNotConfirmed');
            }
        });

        it('should format avatarUrl with ROOT_URL and timestamp', async () => {
            const mockResponse = {
                token: 'token',
                username: 'user',
                email: 'user@test.com',
                avatarUrl: '/uploads/avatar.png'
            };
            global.fetch = mockFetch(mockResponse);
            const result = await authService.login({ username: 'user', password: 'pass' });
            expect(result.avatarUrl).toContain(`${ROOT_URL}/uploads/avatar.png?t=`);
            expect(authService.getToken()).toBe('token');
        });
    });

    describe('resendConfirmationEmail', () => {
        it('should call fetch with correct parameters', async () => {
            global.fetch = mockFetch({});
            await authService.resendConfirmationEmail('test@test.com');
            expect(global.fetch).toHaveBeenCalledWith(
                `${ROOT_URL}/api/auth/resend-confirmation`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'test@test.com' })
                }
            );
        });

        it('should throw error with custom message', async () => {
            global.fetch = mockFetch({ message: 'Custom email error' }, false);
            await expect(authService.resendConfirmationEmail('test@test.com')).rejects.toThrow('Custom email error');
        });

        it('should throw default error message', async () => {
            global.fetch = mockFetch({}, false);
            await expect(authService.resendConfirmationEmail('test@test.com')).rejects.toThrow('Failed to resend confirmation email');
        });
    });

    describe('forgotPassword', () => {
        it('should call fetch with correct parameters', async () => {
            global.fetch = mockFetch({});
            await authService.forgotPassword('test@test.com');
            expect(global.fetch).toHaveBeenCalledWith(
                `${ROOT_URL}/api/auth/forgot-password`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'test@test.com' })
                }
            );
        });

        it('should throw error with custom message', async () => {
            global.fetch = mockFetch({ message: 'Custom forgot error' }, false);
            await expect(authService.forgotPassword('test@test.com')).rejects.toThrow('Custom forgot error');
        });

        it('should throw default error message', async () => {
            global.fetch = mockFetch({}, false);
            await expect(authService.forgotPassword('test@test.com')).rejects.toThrow('Failed to send reset email');
        });
    });





    describe('register error branches', () => {
        it('should throw error with custom message if error.message exists', async () => {
            global.fetch = mockFetch({ message: 'Custom registration error' }, false, 400);
            await expect(authService.register({ username: 'fail', email: 'fail@test.com', password: 'fail' })).rejects.toThrow('Custom registration error');
        });

        it("should throw error with default message if error.message doesn't exist", async () => {
            global.fetch = mockFetch({}, false, 400);
            await expect(authService.register({ username: 'fail', email: 'fail@test.com', password: 'fail' })).rejects.toThrow('Registration failed');
        });
    });

    describe('user settings', () => {
        it('gets user settings successfully', async () => {
            const settings = { autoDeleteCompletedTasks: true };
            global.fetch = mockFetch(settings);
            const result = await authService.getUserSettings();
            expect(result).toEqual(settings);
        });

        it('throws error on failed get settings', async () => {
            global.fetch = mockFetch({}, false);
            await expect(authService.getUserSettings()).rejects.toThrow('Failed to get user settings');
        });

        it('updates user settings successfully', async () => {
            global.fetch = mockFetch({});
            await expect(authService.updateUserSettings({ autoDeleteCompletedTasks: false })).resolves.toBeUndefined();
        });

        it('throws error on failed update settings', async () => {
            global.fetch = mockFetch({}, false);
            await expect(authService.updateUserSettings({})).rejects.toThrow('Failed to update user settings');
        });
    });
});

function createMockJWT(payload: any): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';

    return `${header}.${encodedPayload}.${signature}`;
}
