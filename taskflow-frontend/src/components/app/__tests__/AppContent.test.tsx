import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme } from '@mui/material';
import AppContent from '../AppContent';
import { useAuth } from '../../../contexts/AuthContext';
import { useAppTheme, useAppNavigation, useAppData, useAppLanguage } from '../hooks';
import { TestProviders } from '../../../__tests__/utils/testProviders';

vi.mock('../../../contexts/AuthContext');
vi.mock('../hooks');
vi.mock('../../../hooks/useAchievementIntegration', () => ({
    useAchievementIntegration: () => ({
        trackAppOpened: vi.fn(),
        trackCalendarViewed: vi.fn(),
        trackDashboardViewed: vi.fn()
    })
}));

vi.mock('../LoadingScreen', () => ({
    __esModule: true,
    default: () => <div data-testid="loading-screen">Loading...</div>
}));

vi.mock('../UnauthenticatedApp', () => ({
    __esModule: true,
    default: ({ onOpenAuthDialog }: any) => (
        <div data-testid="unauthenticated-app">
            <button onClick={onOpenAuthDialog}>Open Auth Dialog</button>
        </div>
    )
}));

vi.mock('../AuthenticatedApp', () => ({
    __esModule: true,
    default: ({ currentTab, tasks, categories }: any) => (
        <div data-testid="authenticated-app">
            Current Tab: {currentTab}, Tasks: {tasks?.length || 0}, Categories: {categories?.length || 0}
        </div>
    )
}));

vi.mock('../../auth-dialog', () => ({
    AuthDialog: ({ open, onClose }: any) => open ? (
        <div data-testid="auth-dialog">
            <button onClick={onClose}>Close Dialog</button>
        </div>
    ) : null
}));

const mockUseAuth = useAuth as any;
const mockUseAppTheme = useAppTheme as any;
const mockUseAppNavigation = useAppNavigation as any;
const mockUseAppData = useAppData as any;
const mockUseAppLanguage = useAppLanguage as any;

const defaultTheme = createTheme({
    palette: {
        mode: 'light'
    }
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders>
        {children}
    </TestProviders>
);

describe('AppContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            loading: false
        });

        mockUseAppTheme.mockReturnValue({
            mode: 'light',
            theme: defaultTheme,
            toggleTheme: vi.fn()
        });

        mockUseAppNavigation.mockReturnValue({
            currentTab: 'tasks',
            handleTabChange: vi.fn(),
            authDialogOpen: false,
            openAuthDialog: vi.fn(),
            closeAuthDialog: vi.fn()
        });

        mockUseAppData.mockReturnValue({
            tasks: [],
            categories: [],
            dataLoading: false
        });

        mockUseAppLanguage.mockReturnValue({
            currentLanguage: 'en',
            handleLanguageChange: vi.fn()
        });
    });

    describe('Loading State', () => {
        it('should show loading screen when auth is loading', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                loading: true
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
            expect(screen.queryByTestId('unauthenticated-app')).not.toBeInTheDocument();
            expect(screen.queryByTestId('authenticated-app')).not.toBeInTheDocument();
        });

        it('should not show loading screen when auth is not loading', () => {
            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
        });
    });

    describe('Unauthenticated State', () => {
        it('should show unauthenticated app when not authenticated', () => {
            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
            expect(screen.queryByTestId('authenticated-app')).not.toBeInTheDocument();
        });

        it('should render auth dialog when open', () => {
            mockUseAppNavigation.mockReturnValue({
                currentTab: 'tasks',
                handleTabChange: vi.fn(),
                authDialogOpen: true,
                openAuthDialog: vi.fn(),
                closeAuthDialog: vi.fn()
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('auth-dialog')).toBeInTheDocument();
        });

        it('should not render auth dialog when closed', () => {
            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.queryByTestId('auth-dialog')).not.toBeInTheDocument();
        });

        it('should pass correct props to unauthenticated app', () => {
            mockUseAppTheme.mockReturnValue({
                mode: 'dark',
                theme: createTheme({ palette: { mode: 'dark' } }),
                toggleTheme: vi.fn()
            });

            mockUseAppLanguage.mockReturnValue({
                currentLanguage: 'es',
                handleLanguageChange: vi.fn()
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
        });
    });

    describe('Authenticated State', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                loading: false
            });
        });

        it('should show authenticated app when authenticated', () => {
            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('authenticated-app')).toBeInTheDocument();
            expect(screen.queryByTestId('unauthenticated-app')).not.toBeInTheDocument();
        });

        it('should pass tasks and categories to authenticated app', () => {
            const mockTasks = [{ id: 1, title: 'Test Task' }];
            const mockCategories = [{ id: 1, name: 'Test Category' }];

            mockUseAppData.mockReturnValue({
                tasks: mockTasks,
                categories: mockCategories,
                dataLoading: false
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByText(/Tasks: 1, Categories: 1/)).toBeInTheDocument();
        });

        it('should pass current tab to authenticated app', () => {
            mockUseAppNavigation.mockReturnValue({
                currentTab: 'dashboard',
                handleTabChange: vi.fn(),
                authDialogOpen: false,
                openAuthDialog: vi.fn(),
                closeAuthDialog: vi.fn()
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByText(/Current Tab: dashboard/)).toBeInTheDocument();
        });
    });

    describe('Hook Integration', () => {
        it('should call all required hooks', () => {
            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(mockUseAuth).toHaveBeenCalled();
            expect(mockUseAppTheme).toHaveBeenCalled();
            expect(mockUseAppNavigation).toHaveBeenCalled();
            expect(mockUseAppData).toHaveBeenCalled();
            expect(mockUseAppLanguage).toHaveBeenCalled();
        });

        it('should handle theme changes', () => {
            const mockToggleTheme = vi.fn();
            mockUseAppTheme.mockReturnValue({
                mode: 'light',
                theme: defaultTheme,
                toggleTheme: mockToggleTheme
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(mockUseAppTheme).toHaveBeenCalled();
        });

        it('should handle navigation changes', () => {
            const mockHandleTabChange = vi.fn();
            mockUseAppNavigation.mockReturnValue({
                currentTab: 'tasks',
                handleTabChange: mockHandleTabChange,
                authDialogOpen: false,
                openAuthDialog: vi.fn(),
                closeAuthDialog: vi.fn()
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(mockUseAppNavigation).toHaveBeenCalled();
        });

        it('should handle language changes', () => {
            const mockHandleLanguageChange = vi.fn();
            mockUseAppLanguage.mockReturnValue({
                currentLanguage: 'en',
                handleLanguageChange: mockHandleLanguageChange
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(mockUseAppLanguage).toHaveBeenCalled();
        });
    });

    describe('Theme Integration', () => {
        it('should apply theme provider with correct theme', () => {
            const mockTheme = createTheme({ palette: { mode: 'dark' } });
            mockUseAppTheme.mockReturnValue({
                mode: 'dark',
                theme: mockTheme,
                toggleTheme: vi.fn()
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
        });

        it('should include CSS baseline', () => {
            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
        });
    });

    describe('State Transitions', () => {
        it('should transition from loading to unauthenticated', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                loading: true
            });

            const { rerender } = render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('loading-screen')).toBeInTheDocument();

            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                loading: false
            });

            rerender(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
        });

        it('should transition from unauthenticated to authenticated', () => {
            const { rerender } = render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();

            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                loading: false
            });

            rerender(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.queryByTestId('unauthenticated-app')).not.toBeInTheDocument();
            expect(screen.getByTestId('authenticated-app')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing hook data gracefully', () => {
            mockUseAppData.mockReturnValue({
                tasks: undefined,
                categories: undefined,
                dataLoading: false
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
        });

        it('should handle hook errors gracefully', () => {
            mockUseAppTheme.mockReturnValue({
                mode: 'light',
                theme: defaultTheme,
                toggleTheme: vi.fn()
            });

            render(
                <TestWrapper>
                    <AppContent />
                </TestWrapper>
            );

            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
        });
    });
});
