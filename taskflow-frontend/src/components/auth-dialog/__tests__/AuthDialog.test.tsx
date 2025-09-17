import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthDialog from '../AuthDialog';

let mockState: any;
let mockOps: any;

vi.mock('../hooks', () => ({
    useAuthState: () => mockState,
    useAuthOperations: () => mockOps
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
        <form data-testid="login-form" onSubmit={e => {
            props.onSubmit(e);
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
        }}>
            <button type="submit">Login</button>
        </form>
    )
}));
vi.mock('../RegisterForm', () => ({
    default: (props: any) => (
        <form data-testid="register-form" onSubmit={e => {
            props.onSubmit(e);
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
        }}>
            <button type="submit">Register</button>
        </form>
    )
}));

describe('AuthDialog submit handlers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
            handleRegister: vi.fn().mockResolvedValue(undefined)
        };
    });

    it('calls preventDefault and handleLogin on LoginForm submit', async () => {
        const preventDefaultSpy = vi.fn();
        mockOps.handleLogin.mockImplementation(() => undefined);
        render(<AuthDialog open={true} onClose={vi.fn()} />);
        const form = screen.getByTestId('login-form');
        form.onsubmit = e => preventDefaultSpy(e.preventDefault());
        fireEvent.submit(form);
        expect(mockOps.handleLogin).toHaveBeenCalledWith(mockState.loginData);
    });

    it('calls preventDefault and handleRegister on RegisterForm submit', async () => {
        mockState.activeTab = 1;
        const preventDefaultSpy = vi.fn();
        mockOps.handleRegister.mockImplementation(() => undefined);
        render(<AuthDialog open={true} onClose={vi.fn()} />);
        const form = screen.getByTestId('register-form');
        form.onsubmit = e => preventDefaultSpy(e.preventDefault());
        fireEvent.submit(form);
        expect(mockOps.handleRegister).toHaveBeenCalledWith(mockState.registerData);
    });
});

describe('AuthDialog logic and branches', () => {
    const onClose = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
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
            handleRegister: vi.fn().mockResolvedValue(undefined)
        };
    });

    it('calls resetForms and onClose when handleClose is triggered', () => {
        render(<AuthDialog open={true} onClose={onClose} />);
        fireEvent.click(screen.getByTestId('cancel-btn'));
        expect(mockState.resetForms).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('calls handleLogin in handleActionClick when activeTab is 0', async () => {
        render(<AuthDialog open={true} onClose={onClose} />);
        mockState.activeTab = 0;
        mockOps.handleLogin.mockClear();
        fireEvent.click(screen.getByTestId('action-btn'));
        expect(mockOps.handleLogin).toHaveBeenCalledWith(mockState.loginData);
    });

    it('calls handleRegister in handleActionClick when activeTab is 1', async () => {
        mockState.activeTab = 1;
        render(<AuthDialog open={true} onClose={onClose} />);
        mockOps.handleRegister.mockClear();
        fireEvent.click(screen.getByTestId('action-btn'));
        expect(mockOps.handleRegister).toHaveBeenCalledWith(mockState.registerData);
    });

    it('renders Alert when error is set', () => {
        mockState.error = 'Test error';
        render(<AuthDialog open={true} onClose={onClose} />);
        expect(screen.getByText('Test error')).toBeInTheDocument();
    });
});
