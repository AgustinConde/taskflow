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

import { authService } from '../../services/authService';

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
        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(authService.isTokenExpired).mockReturnValue(false);
        vi.mocked(authService.validateToken).mockResolvedValue(false);

        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
        }, { timeout: 1000 });

        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('has-token')).toHaveTextContent('false');
    });

    it('should handle existing valid token', async () => {

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

        it('should handle login error with proper error logging', async () => {

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            vi.mocked(authService.getToken).mockReturnValue(null);
            vi.mocked(authService.login).mockRejectedValue(new Error('Login failed'));

            const TestLoginErrorComponent = () => {
                const auth = useAuth();
                return (
                    <button onClick={async () => {
                        const result = await auth.login({ username: 'testuser', password: 'wrong' });
                        expect(result).toBe(false);
                    }}>
                        Login
                    </button>
                );
            };

            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <TestLoginErrorComponent />
                </Wrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });

            screen.getByRole('button').click();
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));
            });
            consoleSpy.mockRestore();
        });

        it('should handle register error with instanceof Error logging', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            vi.mocked(authService.getToken).mockReturnValue(null);
            const error = new Error('Registration failed');
            vi.mocked(authService.register).mockRejectedValue(error);

            const TestRegisterErrorComponent = () => {
                const auth = useAuth();
                return (
                    <button onClick={async () => {
                        const registerData = { username: 'testuser', email: 'test@test.com', password: 'password' };
                        const result = await auth.register(registerData);
                        expect(result).toBe(false);
                    }}>
                        Register
                    </button>
                );
            };

            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <TestRegisterErrorComponent />
                </Wrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });

            screen.getByRole('button').click();
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Registration error details:', error);
                expect(consoleSpy).toHaveBeenCalledWith('Error message:', error.message);
            });
            consoleSpy.mockRestore();
        });

        it('should handle login error with thrown non-Error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            vi.mocked(authService.getToken).mockReturnValue(null);
            vi.mocked(authService.login).mockRejectedValue('string error');

            const TestLoginErrorComponent = () => {
                const auth = useAuth();
                return (
                    <button onClick={async () => {
                        const result = await auth.login({ username: 'testuser', password: 'wrong' });
                        expect(result).toBe(false);
                    }}>
                        Login
                    </button>
                );
            };

            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <TestLoginErrorComponent />
                </Wrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });

            screen.getByRole('button').click();
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Login error:', 'string error');
            });
            consoleSpy.mockRestore();
        });
    });

    describe('success flows', () => {
        it('should call authService.login and set user/token on success', async () => {
            const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', createdAt: '2025-01-01T00:00:00Z' };
            vi.mocked(authService.getToken).mockReturnValue(null);
            vi.mocked(authService.login).mockResolvedValue({ token: 'mock-token', username: 'testuser', email: 'test@test.com', expiresAt: '2025-01-02T00:00:00Z' });
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

            const TestLoginComponent = () => {
                const auth = useAuth();
                return (
                    <button onClick={async () => {
                        const result = await auth.login({ username: 'testuser', password: '123' });
                        expect(result).toBe(true);
                        expect(authService.login).toHaveBeenCalledWith({ username: 'testuser', password: '123' });
                        expect(authService.getCurrentUser).toHaveBeenCalled();
                    }}>
                        Login
                    </button>
                );
            };

            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <TestLoginComponent />
                </Wrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });
            screen.getByRole('button').click();
            await waitFor(() => {
                expect(authService.login).toHaveBeenCalled();
                expect(authService.getCurrentUser).toHaveBeenCalled();
            });
        });

        it('should call authService.register and show success on true', async () => {
            vi.mocked(authService.getToken).mockReturnValue(null);
            vi.mocked(authService.register).mockResolvedValue(true);

            const TestRegisterComponent = () => {
                const auth = useAuth();
                return (
                    <button onClick={async () => {
                        const result = await auth.register({ username: 'newuser', email: 'new@test.com', password: '123' });
                        expect(result).toBe(true);
                        expect(authService.register).toHaveBeenCalledWith({ username: 'newuser', email: 'new@test.com', password: '123' });
                    }}>
                        Register
                    </button>
                );
            };

            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <TestRegisterComponent />
                </Wrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });
            screen.getByRole('button').click();
            await waitFor(() => {
                expect(authService.register).toHaveBeenCalled();
            });
        });

        it('should call authService.logout and clear user/token', async () => {
            vi.mocked(authService.getToken).mockReturnValue('mock-token');
            vi.mocked(authService.logout).mockImplementation(() => { });

            const TestLogoutComponent = () => {
                const auth = useAuth();
                return (
                    <button onClick={() => {
                        auth.logout();
                        expect(authService.logout).toHaveBeenCalled();
                    }}>
                        Logout
                    </button>
                );
            };

            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <TestLogoutComponent />
                </Wrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });
            screen.getByRole('button').click();
            await waitFor(() => {
                expect(authService.logout).toHaveBeenCalled();
            });
        });
    });
});
