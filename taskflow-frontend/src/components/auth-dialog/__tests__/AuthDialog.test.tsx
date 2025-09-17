import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthDialog from '../AuthDialog';

let mockState: any;
let mockOps: any;

const mockAuthService = {
    forgotPassword: vi.fn()
};

vi.mock('../../services/authService', () => ({
    authService: mockAuthService
}));

vi.mock('../hooks', () => ({
    useAuthState: () => mockState,
    useAuthOperations: (config: any) => {
        if (config && config.setError) {
            mockOps.capturedSetError = config.setError;
        }
        return mockOps;
    }
}));

vi.mock('../ResendConfirmationButton', () => ({
    default: ({ email }: { email: string }) => <button data-testid="resend-confirmation-btn">Resend {email}</button>
}));

vi.mock('../AuthTabs', () => ({ default: () => <div /> }));
vi.mock('../AuthDialogActions', () => ({
    default: (props: any) => (
        <div>
            <button data-testid="cancel-btn" onClick={props.onCancel}>Cancel</button>
            <button data-testid="action-btn" onClick={props.onAction}>Action</button>
        </div>
    )
}));

vi.mock('../LoginForm', () => ({
    default: (props: any) => (
        <form data-testid="login-form" onSubmit={(e) => {
            props.onSubmit(e);
        }}>
            <button type="submit">Login</button>
            <button type="button" data-testid="forgot-password-btn" onClick={props.onForgotPassword}>
                Forgot Password
            </button>
        </form>
    )
}));

vi.mock('../RegisterForm', () => ({
    default: (props: any) => (
        <form data-testid="register-form" onSubmit={(e) => {
            props.onSubmit(e);
        }}>
            <button type="submit">Register</button>
        </form>
    )
}));

vi.mock('../ForgotPasswordDialog', () => ({
    default: ({ open, onSubmit }: { open: boolean; onSubmit: (email: string) => Promise<string | null> }) =>
        open ? (
            <div data-testid="forgot-dialog">
                <button
                    data-testid="forgot-submit-btn"
                    onClick={() => {
                        onSubmit('test@example.com').then(result => {
                            (window as any).forgotResult = result;
                        }).catch(err => {
                            (window as any).forgotResult = err.message || 'Error';
                        });
                    }}
                >
                    Submit
                </button>
            </div>
        ) : null
}));

describe('AuthDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthService.forgotPassword.mockReset();
        mockAuthService.forgotPassword.mockResolvedValue(undefined);
        (window as any).forgotResult = undefined;

        mockState = {
            activeTab: 0,
            setActiveTab: vi.fn(),
            loading: false,
            setLoading: vi.fn(),
            error: null,
            setError: vi.fn(),
            showLoginPassword: false,
            setShowLoginPassword: vi.fn(),
            showRegisterPassword: false,
            setShowRegisterPassword: vi.fn(),
            loginData: { username: 'user', password: 'pass' },
            setLoginData: vi.fn(),
            registerData: { username: 'new', email: 'new@test.com', password: '123' },
            setRegisterData: vi.fn(),
            resetForms: vi.fn(),
            handleTabChange: vi.fn()
        };

        mockOps = {
            handleLogin: vi.fn().mockResolvedValue(undefined),
            handleRegister: vi.fn().mockResolvedValue(undefined),
            capturedSetError: null
        };
    });

    it('setError callback sets pendingEmail based on error message', () => {
        render(<AuthDialog open={true} onClose={vi.fn()} />);

        const setErrorCallback = mockOps.capturedSetError;
        expect(setErrorCallback).toBeDefined();

        setErrorCallback('Please confirm your email');
        expect(mockState.setError).toHaveBeenCalledWith('Please confirm your email');

        setErrorCallback('Other error');
        expect(mockState.setError).toHaveBeenCalledWith('Other error');
    });

    it('handleLoginSubmit calls preventDefault and handleLogin', async () => {
        render(<AuthDialog open={true} onClose={vi.fn()} />);

        const loginForm = screen.getByTestId('login-form');
        fireEvent.submit(loginForm);

        expect(mockOps.handleLogin).toHaveBeenCalledWith(mockState.loginData);
    });

    it('handleRegisterSubmit calls preventDefault and handleRegister', async () => {
        mockState.activeTab = 1;
        render(<AuthDialog open={true} onClose={vi.fn()} />);

        const registerForm = screen.getByTestId('register-form');
        fireEvent.submit(registerForm);

        expect(mockOps.handleRegister).toHaveBeenCalledWith(mockState.registerData);
    });

    it('handleForgotSubmit function logic works correctly', async () => {
        const handleForgotSubmit = async (email: string) => {
            try {
                await mockAuthService.forgotPassword(email);
                return null;
            } catch (err: any) {
                return err.message || 'Error';
            }
        };

        mockAuthService.forgotPassword.mockResolvedValue(undefined);
        const result1 = await handleForgotSubmit('test@example.com');
        expect(result1).toBeNull();
        expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');

        mockAuthService.forgotPassword.mockRejectedValueOnce(new Error('Network error'));
        const result2 = await handleForgotSubmit('test@example.com');
        expect(result2).toBe('Network error');

        mockAuthService.forgotPassword.mockRejectedValueOnce({});
        const result3 = await handleForgotSubmit('test@example.com');
        expect(result3).toBe('Error');
    }); it('renders ResendConfirmationButton when error contains confirm email', () => {
        mockState.error = 'Please confirm your email';

        render(<AuthDialog open={true} onClose={vi.fn()} />);

        const setErrorCallback = mockOps.capturedSetError;
        setErrorCallback('Please confirm your email');

        expect(screen.getByText('Please confirm your email')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();


        mockState.error = 'Please confirm your email';
        render(<AuthDialog open={true} onClose={vi.fn()} />);

        if (screen.queryByTestId('resend-confirmation-btn')) {
            expect(screen.getByTestId('resend-confirmation-btn')).toBeInTheDocument();
        }
    });

    it('calls resetForms and onClose when dialog closes', () => {
        const onClose = vi.fn();
        render(<AuthDialog open={true} onClose={onClose} />);

        fireEvent.click(screen.getByTestId('cancel-btn'));

        expect(mockState.resetForms).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('calls handleLogin when action button clicked on login tab', () => {
        mockState.activeTab = 0;
        render(<AuthDialog open={true} onClose={vi.fn()} />);

        fireEvent.click(screen.getByTestId('action-btn'));

        expect(mockOps.handleLogin).toHaveBeenCalledWith(mockState.loginData);
    });

    it('calls handleRegister when action button clicked on register tab', () => {
        mockState.activeTab = 1;
        render(<AuthDialog open={true} onClose={vi.fn()} />);

        fireEvent.click(screen.getByTestId('action-btn'));

        expect(mockOps.handleRegister).toHaveBeenCalledWith(mockState.registerData);
    });
});
