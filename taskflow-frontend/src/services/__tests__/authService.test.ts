import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../authService';
import { server } from '../../__tests__/mocks/server';

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

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        server.resetHandlers();
    });

    describe('token management', () => {
        it('should store token in localStorage', () => {
            const token = 'test-token';

            authService.setToken(token);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('taskflow_token', token);
        });

        it('should retrieve token from localStorage', () => {
            const token = 'test-token';
            mockLocalStorage.getItem.mockReturnValue(token);

            const result = authService.getToken();

            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('taskflow_token');
            expect(result).toBe(token);
        });

        it('should return null when no token exists', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const result = authService.getToken();

            expect(result).toBeNull();
        });

        it('should remove token from localStorage', () => {
            authService.removeToken();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('taskflow_token');
        });
    });

    describe('token validation', () => {
        it('should return true for valid token', () => {
            const validToken = createMockJWT({ exp: Math.floor(Date.now() / 1000) + 3600 }); // 1 hour from now
            mockLocalStorage.getItem.mockReturnValue(validToken);

            const result = authService.isTokenExpired();

            expect(result).toBe(false);
        });

        it('should return true for expired token', () => {
            const expiredToken = createMockJWT({ exp: Math.floor(Date.now() / 1000) - 3600 }); // 1 hour ago
            mockLocalStorage.getItem.mockReturnValue(expiredToken);

            const result = authService.isTokenExpired();

            expect(result).toBe(true);
        });

        it('should return true for invalid token format', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid-token');

            const result = authService.isTokenExpired();

            expect(result).toBe(true);
        });

        it('should return true when no token exists', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

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

            expect(response).toHaveProperty('token');
            expect(response).toHaveProperty('username', userData.username);
            expect(response).toHaveProperty('email', userData.email);
        });

        it('should validate token with server', async () => {
            const validToken = 'valid-token';
            mockLocalStorage.getItem.mockReturnValue(validToken);

            const result = await authService.validateToken();

            expect(result).toBe(true);
        });

        it('should get current user data', async () => {
            const userData = await authService.getCurrentUser();

            expect(userData).toHaveProperty('id');
            expect(userData).toHaveProperty('username');
            expect(userData).toHaveProperty('email');
        });
    });

    describe('error handling', () => {
        const originalFetch = global.fetch;
        afterEach(() => {
            global.fetch = originalFetch;
        });

        it('should throw error on login failure', async () => {
            const errorResponse = { message: 'Invalid credentials' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue(errorResponse)
            });
            await expect(authService.login({ username: 'fail', password: 'fail' })).rejects.toThrow('Invalid credentials');
        });

        it('should throw error on register failure and log error', async () => {
            const errorResponse = { message: 'Registration failed' };
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue(errorResponse),
                status: 400
            });
            await expect(authService.register({ username: 'fail', email: 'fail@test.com', password: 'fail' })).rejects.toThrow('Registration failed');
            expect(consoleSpy).toHaveBeenCalledWith('AuthService: Registration failed with error:', errorResponse);
            consoleSpy.mockRestore();
        });

        it('should throw error on getCurrentUser failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn()
            });
            await expect(authService.getCurrentUser()).rejects.toThrow('Failed to get user data');
        });

        it('should return false on validateToken fetch error', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
            const result = await authService.validateToken();
            expect(result).toBe(false);
        });
    });

    describe('logout', () => {
        it('should clear token and call removeToken', () => {
            authService.logout();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('taskflow_token');
        });
    });

    describe('getAuthHeaders', () => {
        it('should include Authorization header if token exists', () => {
            mockLocalStorage.getItem.mockReturnValue('abc123');
            const headers = (authService as any).getAuthHeaders();
            expect(headers).toHaveProperty('Authorization', 'Bearer abc123');
        });
        it('should not include Authorization header if no token', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
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
});

function createMockJWT(payload: any): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';

    return `${header}.${encodedPayload}.${signature}`;
}
