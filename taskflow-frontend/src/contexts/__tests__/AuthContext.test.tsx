import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../AuthContext';

vi.mock('../../services/authService', () => ({
    authService: {
        getToken: vi.fn(),
        isTokenExpired: vi.fn(),
        validateToken: vi.fn(),
        getCurrentUser: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        removeToken: vi.fn()
    }
}));

const TestComponent = () => {
    const auth = useAuth();

    return (
        <div>
            <div data-testid="auth-available">Auth available</div>
            <div data-testid="is-authenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="is-loading">{auth.loading ? 'true' : 'false'}</div>
            <div data-testid="user-data">{auth.user ? JSON.stringify(auth.user) : 'null'}</div>
            <div data-testid="has-token">{auth.token ? 'true' : 'false'}</div>
        </div>
    );
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should provide auth context value', async () => {
        const { authService } = await import('../../services/authService');
        vi.mocked(authService.getToken).mockReturnValue(null);

        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        expect(screen.getByTestId('auth-available')).toBeInTheDocument();
    });

    it('should start with unauthenticated state when no token', async () => {
        const { authService } = await import('../../services/authService');
        vi.mocked(authService.getToken).mockReturnValue(null);

        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
        });

        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('has-token')).toHaveTextContent('false');
    });

    it('should handle existing valid token', async () => {
        const { authService } = await import('../../services/authService');
        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@test.com',
            createdAt: '2025-01-01T00:00:00Z'
        };

        vi.mocked(authService.getToken).mockReturnValue('valid-token');
        vi.mocked(authService.isTokenExpired).mockReturnValue(false);
        vi.mocked(authService.validateToken).mockResolvedValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

        await waitFor(() => {
            expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
        });

        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        });

        expect(screen.getByTestId('has-token')).toHaveTextContent('true');
        expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(mockUser));
    });

    it('should handle expired token', async () => {
        const { authService } = await import('../../services/authService');

        vi.mocked(authService.getToken).mockReturnValue('expired-token');
        vi.mocked(authService.isTokenExpired).mockReturnValue(false);
        vi.mocked(authService.validateToken).mockResolvedValue(false);
        vi.mocked(authService.removeToken).mockImplementation(() => { });

        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
        });

        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(vi.mocked(authService.removeToken)).toHaveBeenCalled();
    });

    it('should throw error when used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useAuth must be used within an AuthProvider');

        consoleSpy.mockRestore();
    });

    describe('authentication methods', () => {
        it('should provide login method', async () => {
            const { authService } = await import('../../services/authService');
            vi.mocked(authService.getToken).mockReturnValue(null);

            const TestLoginComponent = () => {
                const auth = useAuth();
                return (
                    <div data-testid="has-login">{typeof auth.login === 'function' ? 'true' : 'false'}</div>
                );
            };

            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestLoginComponent />
                </Wrapper>
            );

            expect(screen.getByTestId('has-login')).toHaveTextContent('true');
        });

        it('should provide register method', async () => {
            const { authService } = await import('../../services/authService');
            vi.mocked(authService.getToken).mockReturnValue(null);

            const TestRegisterComponent = () => {
                const auth = useAuth();
                return (
                    <div data-testid="has-register">{typeof auth.register === 'function' ? 'true' : 'false'}</div>
                );
            };

            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestRegisterComponent />
                </Wrapper>
            );

            expect(screen.getByTestId('has-register')).toHaveTextContent('true');
        });

        it('should provide logout method', async () => {
            const { authService } = await import('../../services/authService');
            vi.mocked(authService.getToken).mockReturnValue(null);

            const TestLogoutComponent = () => {
                const auth = useAuth();
                return (
                    <div data-testid="has-logout">{typeof auth.logout === 'function' ? 'true' : 'false'}</div>
                );
            };

            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestLogoutComponent />
                </Wrapper>
            );

            expect(screen.getByTestId('has-logout')).toHaveTextContent('true');
        });
    });

    describe('error handling', () => {
        it('should handle auth initialization errors', async () => {
            const { authService } = await import('../../services/authService');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            vi.mocked(authService.getToken).mockReturnValue('valid-token');
            vi.mocked(authService.isTokenExpired).mockReturnValue(false);
            vi.mocked(authService.validateToken).mockRejectedValue(new Error('Network error'));
            vi.mocked(authService.removeToken).mockImplementation(() => { });

            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestComponent />
                </Wrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
            });

            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
            expect(vi.mocked(authService.removeToken)).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('Auth initialization error:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('should handle provider rendering without crashing', () => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: { retry: false },
                    mutations: { retry: false }
                }
            });

            expect(() => {
                render(
                    <QueryClientProvider client={queryClient}>
                        <AuthProvider>
                            <div>Test</div>
                        </AuthProvider>
                    </QueryClientProvider>
                );
            }).not.toThrow();
        });
    });
});
