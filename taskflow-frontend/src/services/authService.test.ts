import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from './authService';
import { server } from '../__tests__/mocks/server';

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

    describe('logout', () => {
        it('should clear token and call removeToken', () => {
            authService.logout();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('taskflow_token');
        });
    });
});

function createMockJWT(payload: any): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';

    return `${header}.${encodedPayload}.${signature}`;
}
