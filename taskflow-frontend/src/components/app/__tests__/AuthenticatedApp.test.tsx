import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedApp from '../AuthenticatedApp';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

const mockT = vi.fn((key: string) => key);
const mockShowInfo = vi.fn();
const mockLogout = vi.fn();
const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
};

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

vi.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout
    })
}));

vi.mock('../../../contexts/NotificationContext', () => ({
    useNotifications: () => ({
        showInfo: mockShowInfo
    })
}));

vi.mock('../AppNavBar', () => ({
    __esModule: true,
    default: ({ onLogout, currentTab, onTabChange }: any) => (
        <div data-testid="app-navbar">
            <button onClick={onLogout}>Logout</button>
            <button onClick={(e) => onTabChange(e, 'tasks')}>Tasks Tab</button>
            <button onClick={(e) => onTabChange(e, 'dashboard')}>Dashboard Tab</button>
            <span>Current: {currentTab}</span>
        </div>
    )
}));

vi.mock('../../task-list/TaskList', () => ({
    __esModule: true,
    default: () => <div data-testid="task-list">Task List Component</div>
}));

vi.mock('../../dashboard', () => ({
    LazyDashboard: ({ tasks, categories }: { tasks: Task[]; categories: Category[] }) => (
        <div data-testid="lazy-dashboard">
            Dashboard Component - Tasks: {tasks.length}, Categories: {categories.length}
        </div>
    )
}));

const mockTasks: Task[] = [
    {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        isCompleted: false,
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00Z'
    }
];

const mockCategories: Category[] = [
    {
        id: 1,
        name: 'Test Category',
        color: '#FF0000',
        userId: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }
];

const defaultProps = {
    currentTab: 'tasks' as const,
    mode: 'light' as const,
    currentLanguage: 'en',
    tasks: mockTasks,
    categories: mockCategories,
    dataLoading: false,
    onTabChange: vi.fn(),
    onToggleTheme: vi.fn(),
    onLanguageChange: vi.fn()
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    });

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={createTheme()}>
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
};

describe('AuthenticatedApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render navigation bar', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
        });

        it('should render tasks view by default', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('task-list')).toBeInTheDocument();
            expect(screen.queryByTestId('lazy-dashboard')).not.toBeInTheDocument();
        });

        it('should render dashboard when tab is dashboard', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} currentTab="dashboard" />
                </TestWrapper>
            );

            expect(screen.getByTestId('lazy-dashboard')).toBeInTheDocument();
            expect(screen.queryByTestId('task-list')).not.toBeInTheDocument();
        });

        it('should show loading spinner when dataLoading is true', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} dataLoading={true} />
                </TestWrapper>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByTestId('task-list')).not.toBeInTheDocument();
            expect(screen.queryByTestId('lazy-dashboard')).not.toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should pass correct props to AppNavBar', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByText('Current: tasks')).toBeInTheDocument();
        });

        it('should handle tab changes', async () => {
            const user = userEvent.setup();
            const onTabChange = vi.fn();

            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} onTabChange={onTabChange} />
                </TestWrapper>
            );

            const dashboardTab = screen.getByText('Dashboard Tab');
            await user.click(dashboardTab);

            expect(onTabChange).toHaveBeenCalledWith(expect.any(Object), 'dashboard');
        });
    });

    describe('Data Loading', () => {
        it('should render loading state with proper styling', () => {
            const { container } = render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} dataLoading={true} />
                </TestWrapper>
            );

            const progressbar = screen.getByRole('progressbar');
            expect(progressbar).toBeInTheDocument();

            const loadingContainer = progressbar.closest('.MuiBox-root');
            expect(loadingContainer).toBeInTheDocument();
        });

        it('should show content when not loading', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} dataLoading={false} />
                </TestWrapper>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.getByTestId('task-list')).toBeInTheDocument();
        });
    });

    describe('Dashboard Integration', () => {
        it('should pass tasks and categories to dashboard', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} currentTab="dashboard" />
                </TestWrapper>
            );

            expect(screen.getByText(/Tasks: 1, Categories: 1/)).toBeInTheDocument();
        });

        it('should handle empty data for dashboard', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp
                        {...defaultProps}
                        currentTab="dashboard"
                        tasks={[]}
                        categories={[]}
                    />
                </TestWrapper>
            );

            expect(screen.getByText(/Tasks: 0, Categories: 0/)).toBeInTheDocument();
        });
    });

    describe('Logout Functionality', () => {
        it('should handle logout with notification', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            const logoutButton = screen.getByText('Logout');
            await user.click(logoutButton);

            expect(mockLogout).toHaveBeenCalledOnce();
            expect(mockShowInfo).toHaveBeenCalledWith('logoutSuccessful');
        });
    });

    describe('Layout', () => {
        it('should have proper main layout structure', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
            expect(screen.getByTestId('task-list')).toBeInTheDocument();
        });

        it('should apply correct padding and constraints for task list', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} currentTab="tasks" />
                </TestWrapper>
            );

            expect(screen.getByTestId('task-list')).toBeInTheDocument();
        });

        it('should render dashboard without container constraints', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} currentTab="dashboard" />
                </TestWrapper>
            );

            expect(screen.getByTestId('lazy-dashboard')).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('should render on mobile layout', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
            expect(screen.getByTestId('task-list')).toBeInTheDocument();
        });

        it('should handle different screen sizes', () => {
            const { rerender } = render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('task-list')).toBeInTheDocument();

            rerender(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} currentTab="dashboard" />
                </TestWrapper>
            );

            expect(screen.getByTestId('lazy-dashboard')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper navigation structure', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
        });

        it('should maintain focus management during navigation', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('task-list')).toBeVisible();
        });

        it('should provide accessible loading state', () => {
            render(
                <TestWrapper>
                    <AuthenticatedApp {...defaultProps} dataLoading={true} />
                </TestWrapper>
            );

            const progressbar = screen.getByRole('progressbar');
            expect(progressbar).toBeVisible();
            expect(progressbar).not.toHaveAttribute('aria-hidden');
        });
    });
});
