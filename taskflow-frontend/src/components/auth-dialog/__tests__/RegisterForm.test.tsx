import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RegisterForm from '../RegisterForm';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));
vi.mock('@mui/icons-material', () => ({
    Visibility: () => <div data-testid="VisibilityIcon" />,
    VisibilityOff: () => <div data-testid="VisibilityOffIcon" />
}));

// Test helpers
const createRegisterData = (overrides = {}) => ({
    username: '',
    email: '',
    password: '',
    ...overrides
});

const createProps = (overrides = {}) => ({
    registerData: createRegisterData(),
    onRegisterDataChange: vi.fn(),
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

const renderRegisterForm = (props = {}) => {
    const finalProps = createProps(props);
    return {
        ...render(
            <TestWrapper>
                <RegisterForm {...finalProps} />
            </TestWrapper>
        ),
        props: finalProps
    };
};

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Field Rendering', () => {
        it('should render all form fields with correct attributes', () => {
            renderRegisterForm();

            expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();

            const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;
            expect(passwordField).toBeInTheDocument();
            expect(passwordField).toHaveAttribute('type', 'password');

            expect(screen.getByText('passwordMinLength')).toBeInTheDocument();
        });

        it('should show/hide password based on showPassword prop', () => {
            const { rerender } = renderRegisterForm();

            expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
            expect(screen.getByTestId('VisibilityIcon')).toBeInTheDocument();

            rerender(
                <TestWrapper>
                    <RegisterForm {...createProps({ showPassword: true })} />
                </TestWrapper>
            );

            const passwordField = document.querySelector('input[autocomplete="new-password"]') as HTMLInputElement;
            expect(passwordField).toHaveAttribute('type', 'text');
            expect(screen.getByTestId('VisibilityOffIcon')).toBeInTheDocument();
        });
    });

    describe('Form Interactions', () => {
        it.each([
            ['username', 'testuser', { username: 'testuser', email: '', password: '' }],
            ['email', 'test@example.com', { username: '', email: 'test@example.com', password: '' }],
            ['password', 'testpassword', { username: '', email: '', password: 'testpassword' }]
        ])('should update %s field and call onRegisterDataChange', async (fieldName, value, expectedData) => {
            const { props } = renderRegisterForm();

            let field: HTMLElement;
            if (fieldName === 'password') {
                field = document.querySelector('input[type="password"]') as HTMLInputElement;
            } else {
                field = screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') });
            }

            fireEvent.change(field, { target: { value } });

            expect(props.onRegisterDataChange).toHaveBeenCalledWith(expectedData);
        });

        it('should handle password visibility toggle', async () => {
            const { props } = renderRegisterForm();

            const toggleButton = screen.getByTestId('VisibilityIcon').closest('button');
            await userEvent.click(toggleButton!);

            expect(props.onTogglePassword).toHaveBeenCalled();
        });

        it('should handle form submission', async () => {
            const { props } = renderRegisterForm();

            const form = document.querySelector('form');
            fireEvent.submit(form!);

            expect(props.onSubmit).toHaveBeenCalled();
        });
    });

    describe('Form Values and Validation', () => {
        it('should display current form values', () => {
            const testData = createRegisterData({
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpassword'
            });

            renderRegisterForm({ registerData: testData });

            expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
            expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
            expect(screen.getByDisplayValue('testpassword')).toBeInTheDocument();
        });

        it('should have proper validation attributes', () => {
            renderRegisterForm();

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const emailField = screen.getByRole('textbox', { name: /email/i });
            const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;

            expect(usernameField).toBeRequired();
            expect(emailField).toBeRequired();
            expect(passwordField).toBeRequired();

            expect(usernameField).toHaveAttribute('minlength', '3');
            expect(usernameField).toHaveAttribute('maxlength', '50');
            expect(emailField).toHaveAttribute('type', 'email');
            expect(passwordField).toHaveAttribute('minlength', '6');
            expect(passwordField).toHaveAttribute('maxlength', '100');

            expect(usernameField).toHaveAttribute('autocomplete', 'username');
            expect(emailField).toHaveAttribute('autocomplete', 'email');
            expect(passwordField).toHaveAttribute('autocomplete', 'new-password');
        });
    });

    describe('Accessibility and Layout', () => {
        it('should have proper accessibility attributes', () => {
            renderRegisterForm();

            expect(document.querySelector('form')).toBeInTheDocument();

            const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;
            const helperText = screen.getByText('passwordMinLength');
            const toggleButton = screen.getByTestId('VisibilityIcon').closest('button');

            expect(passwordField).toHaveAttribute('aria-describedby');
            expect(helperText).toBeInTheDocument();
            expect(toggleButton).toHaveAttribute('type', 'button');
        });

        it('should have full width fields and proper layout', () => {
            renderRegisterForm();

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const emailField = screen.getByRole('textbox', { name: /email/i });
            const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;

            expect(usernameField.closest('.MuiTextField-root')).toHaveClass('MuiFormControl-fullWidth');
            expect(emailField.closest('.MuiTextField-root')).toHaveClass('MuiFormControl-fullWidth');
            expect(passwordField.closest('.MuiTextField-root')).toHaveClass('MuiFormControl-fullWidth');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty data gracefully', () => {
            renderRegisterForm({ registerData: createRegisterData() });

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const emailField = screen.getByRole('textbox', { name: /email/i });
            const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;

            expect(usernameField).toHaveValue('');
            expect(emailField).toHaveValue('');
            expect(passwordField).toHaveValue('');
        });

        it('should handle special characters in input', async () => {
            const { props } = renderRegisterForm();
            const specialChars = 'user@domain.com!#$%';

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            fireEvent.change(usernameField, { target: { value: specialChars } });

            expect(props.onRegisterDataChange).toHaveBeenCalledWith({
                username: specialChars,
                email: '',
                password: ''
            });
        });
    });
});
