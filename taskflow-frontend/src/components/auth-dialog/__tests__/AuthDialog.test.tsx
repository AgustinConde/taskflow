import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthDialog from '../AuthDialog';
import { useAuthState, useAuthOperations } from '../hooks';

vi.mock('../hooks');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));
vi.mock('@mui/icons-material', () => ({
    Login: () => <div data-testid="LoginIcon" />,
    PersonAdd: () => <div data-testid="PersonAddIcon" />,
    Visibility: () => <div data-testid="VisibilityIcon" />,
    VisibilityOff: () => <div data-testid="VisibilityOffIcon" />
}));

const mockUseAuthState = useAuthState as any;
const mockUseAuthOperations = useAuthOperations as any;

const createAuthState = (overrides = {}) => ({
    activeTab: 0,
    loading: false,
    error: null,
    showLoginPassword: false,
    showRegisterPassword: false,
    loginData: { username: '', password: '' },
    registerData: { username: '', email: '', password: '' },
    setLoading: vi.fn(),
    setError: vi.fn(),
    setShowLoginPassword: vi.fn(),
    setShowRegisterPassword: vi.fn(),
    setLoginData: vi.fn(),
    setRegisterData: vi.fn(),
    resetForms: vi.fn(),
    handleTabChange: vi.fn(),
    ...overrides
});

const createAuthOperations = (overrides = {}) => ({
    handleLogin: vi.fn(),
    handleRegister: vi.fn(),
    ...overrides
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={createTheme()}>
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
};

const renderAuthDialog = (props = {}) => {
    const defaultProps = { open: true, onClose: vi.fn() };
    return render(
        <TestWrapper>
            <AuthDialog {...defaultProps} {...props} />
        </TestWrapper>
    );
};

describe('AuthDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuthState.mockReturnValue(createAuthState());
        mockUseAuthOperations.mockReturnValue(createAuthOperations());
    });

    describe('Basic Rendering', () => {
        it('should render dialog when open and hide when closed', async () => {
            const { rerender } = renderAuthDialog();

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('TaskFlow')).toBeInTheDocument();

            rerender(
                <TestWrapper>
                    <AuthDialog open={false} onClose={vi.fn()} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });

        it('should switch between login and register forms based on activeTab', () => {
            const { rerender } = renderAuthDialog();

            expect(screen.getByRole('tab', { name: /login/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
            expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
            expect(screen.queryByRole('textbox', { name: /email/i })).not.toBeInTheDocument();

            mockUseAuthState.mockReturnValue(createAuthState({ activeTab: 1 }));
            rerender(<TestWrapper><AuthDialog open onClose={vi.fn()} /></TestWrapper>);

            expect(screen.getByRole('tab', { name: 'register' })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
            expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should display error when present and hide when null', () => {
            const { rerender } = renderAuthDialog();

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();

            mockUseAuthState.mockReturnValue(createAuthState({ error: 'Test error' }));
            rerender(<TestWrapper><AuthDialog open onClose={vi.fn()} /></TestWrapper>);

            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Test error')).toBeInTheDocument();
        });
    });

    describe('Form Interactions', () => {
        it('should handle login form submission', async () => {
            const handleLogin = vi.fn();
            mockUseAuthOperations.mockReturnValue(createAuthOperations({ handleLogin }));

            renderAuthDialog();

            const actionButton = screen.getByRole('button', { name: 'login' });
            await userEvent.click(actionButton);

            expect(handleLogin).toHaveBeenCalledWith({ username: '', password: '' });
        });

        it('should handle register form submission', async () => {
            const handleRegister = vi.fn();
            mockUseAuthState.mockReturnValue(createAuthState({ activeTab: 1 }));
            mockUseAuthOperations.mockReturnValue(createAuthOperations({ handleRegister }));

            renderAuthDialog();

            const actionButton = screen.getByRole('button', { name: 'register' });
            await userEvent.click(actionButton);

            expect(handleRegister).toHaveBeenCalledWith({ username: '', email: '', password: '' });
        });

        it('should update form data when fields change', async () => {
            const setLoginData = vi.fn();
            mockUseAuthState.mockReturnValue(createAuthState({ setLoginData }));

            renderAuthDialog();

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            await userEvent.type(usernameField, 'testuser');

            expect(setLoginData).toHaveBeenCalled();
        });
    });

    describe('Dialog Actions', () => {
        it('should show correct action buttons based on state', () => {
            const { rerender } = renderAuthDialog();

            expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'login' })).toBeInTheDocument();

            mockUseAuthState.mockReturnValue(createAuthState({ activeTab: 1 }));
            rerender(<TestWrapper><AuthDialog open onClose={vi.fn()} /></TestWrapper>);
            expect(screen.getByRole('button', { name: 'register' })).toBeInTheDocument();

            mockUseAuthState.mockReturnValue(createAuthState({ loading: true }));
            rerender(<TestWrapper><AuthDialog open onClose={vi.fn()} /></TestWrapper>);

            const cancelButton = screen.getByRole('button', { name: 'cancel' });
            const actionButton = screen.getByRole('button', { name: 'loading' });

            expect(cancelButton).toBeDisabled();
            expect(actionButton).toBeDisabled();
        });

        it('should handle dialog close actions', async () => {
            const onClose = vi.fn();
            const resetForms = vi.fn();
            mockUseAuthState.mockReturnValue(createAuthState({ resetForms }));

            renderAuthDialog({ onClose });

            const cancelButton = screen.getByRole('button', { name: 'cancel' });
            await userEvent.click(cancelButton);

            expect(onClose).toHaveBeenCalled();
            expect(resetForms).toHaveBeenCalled();
        });
    });

    describe('Tab Navigation', () => {
        it('should handle tab changes', async () => {
            const handleTabChange = vi.fn();
            mockUseAuthState.mockReturnValue(createAuthState({ handleTabChange }));

            renderAuthDialog();

            const registerTab = screen.getByRole('tab', { name: 'register' });
            await userEvent.click(registerTab);

            expect(handleTabChange).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('should have proper accessibility attributes', () => {
            renderAuthDialog();

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
            expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'login' })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: 'login' })).toBeInTheDocument();
        });
    });

    describe('Success Flow', () => {
        it('should close dialog on successful authentication', async () => {
            const onClose = vi.fn();
            const handleLogin = vi.fn().mockResolvedValue(undefined);

            mockUseAuthOperations.mockImplementation(({ onSuccess }: any) => ({
                handleLogin: async (data: any) => {
                    await handleLogin(data);
                    onSuccess?.();
                },
                handleRegister: vi.fn()
            }));

            renderAuthDialog({ onClose });

            const actionButton = screen.getByRole('button', { name: 'login' });
            await userEvent.click(actionButton);

            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });
    });
});
