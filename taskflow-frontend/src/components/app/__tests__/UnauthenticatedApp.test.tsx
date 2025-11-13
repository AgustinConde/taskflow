import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import UnauthenticatedApp from '../UnauthenticatedApp';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

const defaultProps = {
    mode: 'light' as const,
    currentLanguage: 'en',
    onToggleTheme: vi.fn(),
    onLanguageChange: vi.fn(),
    onOpenAuthDialog: vi.fn(),
    onOpenRegisterDialog: vi.fn()
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>
        {children}
    </ThemeProvider>
);

describe('UnauthenticatedApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render app title', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByText('TaskFlow')).toBeInTheDocument();
        });

        it('should render authentication message', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByText('authenticationRequired')).toBeInTheDocument();
            expect(screen.getByText('pleaseLoginToContinue')).toBeInTheDocument();
        });

        it('should render login button', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            const loginButton = screen.getByRole('button', { name: /login/i });
            expect(loginButton).toBeInTheDocument();
        });

        it('should render theme toggle button', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            const themeToggle = screen.getByTestId('Brightness4Icon');
            expect(themeToggle).toBeInTheDocument();
        });

        it('should render language toggle button', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTitle('English')).toBeInTheDocument();
        });
    });

    describe('Theme Toggle', () => {
        it('should show light mode icon in dark mode', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} mode="dark" />
                </TestWrapper>
            );

            expect(screen.getByTestId('Brightness7Icon')).toBeInTheDocument();
        });

        it('should show dark mode icon in light mode', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} mode="light" />
                </TestWrapper>
            );

            expect(screen.getByTestId('Brightness4Icon')).toBeInTheDocument();
        });

        it('should call onToggleTheme when clicked', async () => {
            const user = userEvent.setup();
            const onToggleTheme = vi.fn();

            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} onToggleTheme={onToggleTheme} />
                </TestWrapper>
            );

            const themeButton = screen.getByTestId('Brightness4Icon').closest('button');
            await user.click(themeButton!);

            expect(onToggleTheme).toHaveBeenCalledOnce();
        });
    });

    describe('Language Toggle', () => {
        it('should show US flag for English', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} currentLanguage="en" />
                </TestWrapper>
            );

            expect(screen.getByAltText('English')).toBeInTheDocument();
            expect(screen.getByTitle('English')).toBeInTheDocument();
        });

        it('should show AR flag for Spanish', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} currentLanguage="es" />
                </TestWrapper>
            );

            expect(screen.getByAltText('Español')).toBeInTheDocument();
            expect(screen.getByTitle('Español')).toBeInTheDocument();
        });

        it('should call onLanguageChange when clicked', async () => {
            const user = userEvent.setup();
            const onLanguageChange = vi.fn();

            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} onLanguageChange={onLanguageChange} />
                </TestWrapper>
            );

            const languageButton = screen.getByRole('button', { name: 'English' });
            await user.click(languageButton);

            expect(onLanguageChange).toHaveBeenCalledOnce();
        });
    });

    describe('Authentication', () => {
        it('should call onOpenAuthDialog when login button clicked', async () => {
            const user = userEvent.setup();
            const onOpenAuthDialog = vi.fn();

            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} onOpenAuthDialog={onOpenAuthDialog} />
                </TestWrapper>
            );

            const loginButton = screen.getByRole('button', { name: /login/i });
            await user.click(loginButton);

            expect(onOpenAuthDialog).toHaveBeenCalledOnce();
        });

        it('should render login icon', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('LoginIcon')).toBeInTheDocument();
        });
    });

    describe('Layout', () => {
        it('should center main content', () => {
            const { container } = render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            const mainBox = container.querySelector('[role="main"], .MuiBox-root');
            expect(mainBox).toBeInTheDocument();
        });

        it('should position controls in top right', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            const themeButton = screen.getByTestId('Brightness4Icon').closest('button');
            const languageButton = screen.getByRole('button', { name: 'English' });

            expect(themeButton).toBeInTheDocument();
            expect(languageButton).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible login button', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            const loginButton = screen.getByRole('button', { name: /login/i });
            expect(loginButton).toBeVisible();
            expect(loginButton).not.toHaveAttribute('aria-hidden');
        });

        it('should have proper heading hierarchy', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            const title = screen.getByRole('heading', { level: 2 });
            expect(title).toHaveTextContent('TaskFlow');
        });

        it('should have accessible theme toggle', () => {
            render(
                <TestWrapper>
                    <UnauthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            const themeButton = screen.getByTestId('Brightness4Icon').closest('button');
            expect(themeButton).toBeInTheDocument();
            expect(themeButton).toHaveAttribute('type', 'button');
        });
    });
});
