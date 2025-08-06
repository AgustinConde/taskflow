import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthDialogActions from '../AuthDialogActions';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

// Test helpers
const createProps = (overrides = {}) => ({
    loading: false,
    activeTab: 0,
    onCancel: vi.fn(),
    onAction: vi.fn(),
    ...overrides
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>
        {children}
    </ThemeProvider>
);

const renderAuthDialogActions = (props = {}) => {
    const finalProps = createProps(props);
    return {
        ...render(
            <TestWrapper>
                <AuthDialogActions {...finalProps} />
            </TestWrapper>
        ),
        props: finalProps
    };
};

// Test data for parameterized tests
const tabConfigs = [
    { activeTab: 0, expectedText: 'login' },
    { activeTab: 1, expectedText: 'register' },
    { activeTab: 99, expectedText: 'register' } // Edge case: invalid tab defaults to register
];

describe('AuthDialogActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Button Rendering', () => {
        it('should always render cancel button', () => {
            renderAuthDialogActions();
            expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument();
        });

        it.each(tabConfigs)('should render correct action button for activeTab $activeTab', ({ activeTab, expectedText }) => {
            renderAuthDialogActions({ activeTab });
            expect(screen.getByRole('button', { name: expectedText })).toBeInTheDocument();
        });

        it('should show loading button when loading', () => {
            renderAuthDialogActions({ loading: true });

            expect(screen.getByRole('button', { name: 'loading' })).toBeInTheDocument();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByText('login')).not.toBeInTheDocument();
        });
    });

    describe('Button States and Interactions', () => {
        it('should enable buttons when not loading and call handlers on click', async () => {
            const { props } = renderAuthDialogActions();

            const cancelButton = screen.getByRole('button', { name: 'cancel' });
            const actionButton = screen.getByRole('button', { name: 'login' });

            expect(cancelButton).not.toBeDisabled();
            expect(actionButton).not.toBeDisabled();

            await userEvent.click(cancelButton);
            await userEvent.click(actionButton);

            expect(props.onCancel).toHaveBeenCalledOnce();
            expect(props.onAction).toHaveBeenCalledOnce();
        });

        it('should disable buttons when loading and prevent interactions', async () => {
            const { props } = renderAuthDialogActions({ loading: true });

            const cancelButton = screen.getByRole('button', { name: 'cancel' });
            const actionButton = screen.getByRole('button', { name: 'loading' });

            expect(cancelButton).toBeDisabled();
            expect(actionButton).toBeDisabled();

            expect(props.onCancel).not.toHaveBeenCalled();
            expect(props.onAction).not.toHaveBeenCalled();
        });

        it('should handle rapid clicking', async () => {
            const { props } = renderAuthDialogActions();
            const actionButton = screen.getByRole('button', { name: 'login' });

            await userEvent.click(actionButton);
            await userEvent.click(actionButton);
            await userEvent.click(actionButton);

            expect(props.onAction).toHaveBeenCalledTimes(3);
        });
    });

    describe('Button Styling and Layout', () => {
        it('should have correct button variants and styling', () => {
            renderAuthDialogActions();

            const cancelButton = screen.getByRole('button', { name: 'cancel' });
            const actionButton = screen.getByRole('button', { name: 'login' });

            expect(cancelButton.closest('.MuiButton-root')).toHaveClass('MuiButton-text');
            expect(actionButton.closest('.MuiButton-root')).toHaveClass('MuiButton-contained');

            expect(actionButton).toHaveStyle({ minWidth: '120px' });

            const container = cancelButton.closest('.MuiDialogActions-root');
            expect(container).toBeInTheDocument();
            expect(container).toHaveStyle({
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingBottom: '24px'
            });

            const buttons = screen.getAllByRole('button');
            expect(buttons[0]).toHaveTextContent('cancel');
            expect(buttons[1]).toHaveTextContent('login');
        });

        it('should show loading spinner with correct properties', () => {
            renderAuthDialogActions({ loading: true });

            const spinner = screen.getByRole('progressbar');
            expect(spinner.closest('.MuiCircularProgress-root')).toHaveClass('MuiCircularProgress-colorPrimary');
        });
    });

    describe('Accessibility', () => {
        it('should be keyboard accessible', async () => {
            const { props } = renderAuthDialogActions();

            const cancelButton = screen.getByRole('button', { name: 'cancel' });
            const actionButton = screen.getByRole('button', { name: 'login' });

            cancelButton.focus();
            await userEvent.keyboard('{Enter}');
            expect(props.onCancel).toHaveBeenCalled();

            actionButton.focus();
            await userEvent.keyboard('{Enter}');
            expect(props.onAction).toHaveBeenCalled();
        });

        it('should indicate disabled state to screen readers', () => {
            renderAuthDialogActions({ loading: true });

            const cancelButton = screen.getByRole('button', { name: 'cancel' });
            const actionButton = screen.getByRole('button', { name: 'loading' });

            expect(cancelButton).toHaveAttribute('disabled');
            expect(actionButton).toHaveAttribute('disabled');
        });
    });

    describe('State Transitions', () => {
        it('should maintain state during loading transitions', () => {
            const { rerender } = renderAuthDialogActions();

            expect(screen.getByRole('button', { name: 'login' })).not.toBeDisabled();

            rerender(
                <TestWrapper>
                    <AuthDialogActions {...createProps({ loading: true })} />
                </TestWrapper>
            );
            expect(screen.getByRole('button', { name: 'loading' })).toBeDisabled();

            rerender(
                <TestWrapper>
                    <AuthDialogActions {...createProps({ loading: false })} />
                </TestWrapper>
            );
            expect(screen.getByRole('button', { name: 'login' })).not.toBeDisabled();
        });

        it('should update action text when tab changes', () => {
            const { rerender } = renderAuthDialogActions({ activeTab: 0 });

            expect(screen.getByText('login')).toBeInTheDocument();

            rerender(
                <TestWrapper>
                    <AuthDialogActions {...createProps({ activeTab: 1 })} />
                </TestWrapper>
            );

            expect(screen.getByText('register')).toBeInTheDocument();
            expect(screen.queryByText('login')).not.toBeInTheDocument();
        });
    });
});
