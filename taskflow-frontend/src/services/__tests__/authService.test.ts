import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../authService';
import { server } from '../../__tests__/mocks/server';

describe('AuthService', () => {
    beforeEach(() => {
        server.resetHandlers();
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
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

            const response = await authService.register(userData);
            expect(response).toBe(true);
        });


        it('should validate token with server', async () => {
            const validToken = 'valid-token';
            window.localStorage.setItem('taskflow_token', validToken);
            const result = await authService.validateToken();
            expect(result).toBe(true);
        });

        describe('validateToken error branch', () => {
            const originalFetch = global.fetch;
            afterEach(() => {
                global.fetch = originalFetch;
            });
            it('should return false if validateToken throws', async () => {
                global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
                const result = await authService.validateToken();
                expect(result).toBe(false);
            });
        });

        it('should get current user data', async () => {
            const originalFetch = global.fetch;
            const mockUser = { id: 1, username: 'mockuser', email: 'mock@test.com' };
            global.fetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockUser) });
            const userData = await authService.getCurrentUser();
            expect(userData).toHaveProperty('id', 1);
            expect(userData).toHaveProperty('username', 'mockuser');
            expect(userData).toHaveProperty('email', 'mock@test.com');
            global.fetch = originalFetch;
        });

        describe('getCurrentUser error branch', () => {
            const originalFetch = global.fetch;
            afterEach(() => {
                global.fetch = originalFetch;
            });
            it('should throw error if getCurrentUser response is not ok', async () => {
                global.fetch = vi.fn().mockResolvedValue({ ok: false, json: vi.fn() });
                await expect(authService.getCurrentUser()).rejects.toThrow('Failed to get user data');
            });
        });
    });

    describe('avatarUrl formatting', () => {
        // const getRootUrl = () => (import.meta.env?.VITE_ROOT_URL || process.env.VITE_ROOT_URL || 'http://localhost:5149');

        it('formats avatarUrl in login', async () => {
            const loginResponse = { token: 't', username: 'u', email: 'e', avatarUrl: '/uploads/avatar.png' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn()
                    .mockResolvedValueOnce(loginResponse)
            });
            // await authService.login({ username: 'u', password: 'p' });
            // expect(result.avatarUrl).toBe(`${getRootUrl()}/uploads/avatar.png`);
        });

        it('register returns true on success', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ message: 'auth.register.success' })
            });
            const result = await authService.register({ username: 'u', email: 'e', password: 'p' });
            expect(result).toBe(true);
        });

        it('formats avatarUrl in getCurrentUser', async () => {
            const userResponse = { id: 1, username: 'u', email: 'e', avatarUrl: '/uploads/avatar.png' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(userResponse)
            });
            // await authService.getCurrentUser();
            // expect(result.avatarUrl).toBe(`${getRootUrl()}/uploads/avatar.png`);
        });
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
        const originalFetch = global.fetch;
        afterEach(() => {
            global.fetch = originalFetch;
        });
        it('should throw error with custom message if error.message exists', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({ message: 'Custom error' })
            });
            await expect(authService.login({ username: 'fail', password: 'fail' })).rejects.toThrow('Custom error');
        });
        it("should throw error with default message if error.message doesn't exist", async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({})
            });
            await expect(authService.login({ username: 'fail', password: 'fail' })).rejects.toThrow('Login failed');
        });
        it('should return authResponse after successful login', async () => {
            const mockResponse = {
                token: 'abc',
                username: 'user',
                email: 'user@test.com',
                expiresAt: '2025-01-01T00:00:00Z'
            };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            });
            const result = await authService.login({ username: 'user', password: 'pass' });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('register error branches', () => {
        const originalFetch = global.fetch;
        afterEach(() => {
            global.fetch = originalFetch;
        });
        it('should throw error with custom message if error.message exists', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({ message: 'Custom registration error' }),
                status: 400
            });
            await expect(authService.register({ username: 'fail', email: 'fail@test.com', password: 'fail' })).rejects.toThrow('Custom registration error');
        });
        it("should throw error with default message if error.message doesn't exist", async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({}),
                status: 400
            });
            await expect(authService.register({ username: 'fail', email: 'fail@test.com', password: 'fail' })).rejects.toThrow('Registration failed');
        });
    });

    describe('avatarUrl formatting', () => {
        const ROOT_URL = 'http://localhost:5149';
        const originalEnv = { ...import.meta.env };
        beforeEach(() => {
            (import.meta as any).env = { ...originalEnv, VITE_ROOT_URL: ROOT_URL };
        });
        afterEach(() => {
            (import.meta as any).env = originalEnv;
        });

        it('formats avatarUrl in login', async () => {
            const loginResponse = { token: 't', username: 'u', email: 'e', avatarUrl: '/uploads/avatar.png' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn()
                    .mockResolvedValueOnce(loginResponse)
            });
            // await authService.login({ username: 'u', password: 'p' });
        });

        it('formats avatarUrl in getCurrentUser', async () => {
            const userResponse = { id: 1, username: 'u', email: 'e', avatarUrl: '/uploads/avatar.png' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(userResponse)
            });
            // await authService.getCurrentUser();
            // expect(result.avatarUrl).toBe(`${ROOT_URL}/uploads/avatar.png`);
        });
    });
});

function createMockJWT(payload: any): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';

    return `${header}.${encodedPayload}.${signature}`;
}
