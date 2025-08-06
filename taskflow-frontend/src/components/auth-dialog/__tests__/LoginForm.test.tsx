import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginForm from '../LoginForm';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));
vi.mock('@mui/icons-material', () => ({
    Visibility: () => <div data-testid="VisibilityIcon" />,
    VisibilityOff: () => <div data-testid="VisibilityOffIcon" />
}));

// Test helpers
const createLoginData = (overrides = {}) => ({
    username: '',
    password: '',
    ...overrides
});

const createProps = (overrides = {}) => ({
    loginData: createLoginData(),
    onLoginDataChange: vi.fn(),
    showPassword: false,
    onTogglePassword: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>
        {children}
    </ThemeProvider>
);

const renderLoginForm = (props = {}) => {
    const finalProps = createProps(props);
    return {
        ...render(
            <TestWrapper>
                <LoginForm {...finalProps} />
            </TestWrapper>
        ),
        props: finalProps
    };
};

// Test data for parameterized tests
const fieldTestData = [
    {
        name: 'username',
        value: 'testuser',
        expectedData: { username: 'testuser', password: '' },
        selector: () => screen.getByRole('textbox', { name: /username/i })
    },
    {
        name: 'password',
        value: 'testpass',
        expectedData: { username: '', password: 'testpass' },
        selector: () => document.querySelector('input[type="password"]') as HTMLInputElement
    }
];

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Field Rendering and Password Visibility', () => {
        it('should render username and password fields with correct attributes', () => {
            renderLoginForm();

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;

            expect(usernameField).toBeInTheDocument();
            expect(passwordField).toBeInTheDocument();
            expect(passwordField).toHaveAttribute('type', 'password');

            expect(usernameField).toBeRequired();
            expect(passwordField).toBeRequired();
            expect(usernameField).toHaveAttribute('autocomplete', 'username');
            expect(passwordField).toHaveAttribute('autocomplete', 'current-password');

            const toggleButton = screen.getByTestId('VisibilityIcon').closest('button');
            expect(toggleButton).toBeInTheDocument();
            expect(toggleButton).toHaveAttribute('type', 'button');
        });

        it('should toggle password visibility correctly', () => {
            const { rerender } = renderLoginForm();

            expect(document.querySelector('input[type="password"]')).toHaveAttribute('type', 'password');
            expect(screen.getByTestId('VisibilityIcon')).toBeInTheDocument();

            rerender(
                <TestWrapper>
                    <LoginForm {...createProps({ showPassword: true })} />
                </TestWrapper>
            );

            const passwordField = document.querySelector('input[autocomplete="current-password"]') as HTMLInputElement;
            expect(passwordField).toHaveAttribute('type', 'text');
            expect(screen.getByTestId('VisibilityOffIcon')).toBeInTheDocument();
        });
    });

    describe('Form Interactions', () => {
        it.each(fieldTestData)('should update $name field and call onLoginDataChange', async ({ value, expectedData, selector }) => {
            const { props } = renderLoginForm();

            const field = selector();
            fireEvent.change(field, { target: { value } });

            expect(props.onLoginDataChange).toHaveBeenCalledWith(expectedData);
        });

        it('should handle password visibility toggle', async () => {
            const { props } = renderLoginForm();

            const toggleButton = screen.getByTestId('VisibilityIcon').closest('button');
            await userEvent.click(toggleButton!);

            expect(props.onTogglePassword).toHaveBeenCalled();
        });

        it('should handle form submission', async () => {
            const { props } = renderLoginForm();

            const form = document.querySelector('form');
            fireEvent.submit(form!);

            expect(props.onSubmit).toHaveBeenCalled();
        });
    });

    describe('Form Values and State', () => {
        it('should display current form values', () => {
            const testData = createLoginData({
                username: 'testuser',
                password: 'testpass'
            });

            renderLoginForm({ loginData: testData });

            expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
            expect(screen.getByDisplayValue('testpass')).toBeInTheDocument();
        });

        it('should preserve values during prop updates', async () => {
            const initialData = createLoginData({ username: 'user1', password: 'pass1' });
            const updatedData = createLoginData({ username: 'user2', password: 'pass2' });

            const { rerender } = renderLoginForm({ loginData: initialData });

            expect(screen.getByDisplayValue('user1')).toBeInTheDocument();
            expect(screen.getByDisplayValue('pass1')).toBeInTheDocument();

            rerender(
                <TestWrapper>
                    <LoginForm {...createProps({ loginData: updatedData })} />
                </TestWrapper>
            );

            expect(screen.getByDisplayValue('user2')).toBeInTheDocument();
            expect(screen.getByDisplayValue('pass2')).toBeInTheDocument();
        });
    });

    describe('Layout and Accessibility', () => {
        it('should have proper form structure and layout', () => {
            renderLoginForm();

            const form = document.querySelector('form');
            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;

            expect(form).toBeInTheDocument();
            expect(form).toHaveStyle({ display: 'flex', flexDirection: 'column' });

            expect(usernameField.closest('.MuiTextField-root')).toHaveClass('MuiFormControl-fullWidth');
            expect(passwordField.closest('.MuiTextField-root')).toHaveClass('MuiFormControl-fullWidth');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty data and special characters', async () => {
            const { props } = renderLoginForm({ loginData: createLoginData() });

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;

            expect(usernameField).toHaveValue('');
            expect(passwordField).toHaveValue('');

            const specialChars = 'user@domain.com!#$%';
            fireEvent.change(usernameField, { target: { value: specialChars } });

            expect(props.onLoginDataChange).toHaveBeenCalledWith({
                username: specialChars,
                password: ''
            });
        });

        it('should prevent default form submission behavior', async () => {
            const { props } = renderLoginForm();

            const form = document.querySelector('form');
            fireEvent.submit(form!);

            expect(props.onSubmit).toHaveBeenCalled();
        });
    });
});
