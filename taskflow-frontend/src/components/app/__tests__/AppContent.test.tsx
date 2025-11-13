import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTheme } from '@mui/material';
import AppContent from '../AppContent';
import { useAuth } from '../../../contexts/AuthContext';
import { useAppTheme, useAppNavigation, useAppData, useAppLanguage } from '../hooks';
import { useAchievementIntegration } from '../../../hooks/useAchievementIntegration';
import type { AuthContextType, User } from '../../../types/Auth';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

vi.mock('../../../contexts/AuthContext');
vi.mock('../hooks');
vi.mock('../../../hooks/useAchievementIntegration', () => ({
    useAchievementIntegration: vi.fn()
}));

vi.mock('../LoadingScreen', () => ({
    __esModule: true,
    default: () => <div data-testid="loading-screen">Loading...</div>
}));

vi.mock('../UnauthenticatedApp', () => ({
    __esModule: true,
    default: ({ onOpenAuthDialog, onOpenRegisterDialog, onToggleTheme, onLanguageChange }: any) => (
        <div data-testid="unauthenticated-app">
            <button data-testid="open-auth" onClick={onOpenAuthDialog}>Open Auth Dialog</button>
            <button data-testid="open-register" onClick={onOpenRegisterDialog}>Open Register Dialog</button>
            <button data-testid="toggle-theme" onClick={() => onToggleTheme?.()}>Toggle Theme</button>
            <button data-testid="change-language" onClick={() => onLanguageChange?.()}>Change Language</button>
        </div>
    )
}));

vi.mock('../AuthenticatedApp', () => ({
    __esModule: true,
    default: ({ currentTab, tasks, categories, dataLoading, onTabChange, onSetThemeMode, onSetLanguage }: any) => (
        <div data-testid="authenticated-app">
            <div data-testid="current-tab">{currentTab}</div>
            <div data-testid="tasks-count">{tasks?.length ?? 0}</div>
            <div data-testid="categories-count">{categories?.length ?? 0}</div>
            <div data-testid="data-loading">{String(Boolean(dataLoading))}</div>
            <button data-testid="calendar-tab" onClick={() => onTabChange({}, 'calendar')}>Calendar</button>
            <button data-testid="dashboard-tab" onClick={() => onTabChange({}, 'dashboard')}>Dashboard</button>
            <button data-testid="set-theme" onClick={() => onSetThemeMode?.('dark')}>Set Theme</button>
            <button data-testid="set-language" onClick={() => onSetLanguage?.('es')}>Set Language</button>
        </div>
    )
}));

vi.mock('../../auth-dialog', () => ({
    AuthDialog: ({ open, onClose, initialTab }: any) => open ? (
        <div data-testid="auth-dialog">
            <span data-testid="auth-dialog-tab">{initialTab}</span>
            <button onClick={onClose}>Close Dialog</button>
        </div>
    ) : null
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseAppTheme = vi.mocked(useAppTheme);
const mockUseAppNavigation = vi.mocked(useAppNavigation);
const mockUseAppData = vi.mocked(useAppData);
const mockUseAppLanguage = vi.mocked(useAppLanguage);
const mockUseAchievementIntegration = vi.mocked(useAchievementIntegration);

const defaultTheme = createTheme({
    palette: { mode: 'light' }
});

const renderAppContent = () => render(<AppContent />);

const createUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    username: 'test-user',
    email: 'user@example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    autoDeleteCompletedTasks: false,
    ...overrides
});

const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: 1,
    title: 'Test Task',
    isCompleted: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides
});

const createCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 1,
    name: 'Category',
    color: '#ffffff',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    userId: 1,
    ...overrides
});

const createAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
    user: null,
    setUser: vi.fn() as AuthContextType['setUser'],
    token: null,
    login: vi.fn() as AuthContextType['login'],
    register: vi.fn() as AuthContextType['register'],
    logout: vi.fn(),
    isAuthenticated: false,
    loading: false,
    ...overrides
});

const createNavigationContext = (overrides: Partial<ReturnType<typeof useAppNavigation>> = {}): ReturnType<typeof useAppNavigation> => ({
    currentTab: 'tasks',
    setCurrentTab: vi.fn() as ReturnType<typeof useAppNavigation>['setCurrentTab'],
    handleTabChange: vi.fn() as ReturnType<typeof useAppNavigation>['handleTabChange'],
    authDialogOpen: false,
    openAuthDialog: vi.fn(),
    closeAuthDialog: vi.fn(),
    ...overrides
});

const createThemeContext = (overrides: Partial<ReturnType<typeof useAppTheme>> = {}): ReturnType<typeof useAppTheme> => ({
    mode: 'light',
    theme: defaultTheme,
    toggleTheme: vi.fn(),
    setThemeMode: vi.fn() as ReturnType<typeof useAppTheme>['setThemeMode'],
    ...overrides
});

const createLanguageContext = (overrides: Partial<ReturnType<typeof useAppLanguage>> = {}): ReturnType<typeof useAppLanguage> => ({
    currentLanguage: 'en',
    handleLanguageChange: vi.fn(),
    setLanguage: vi.fn() as ReturnType<typeof useAppLanguage>['setLanguage'],
    ...overrides
});

const createDataContext = (overrides: Partial<ReturnType<typeof useAppData>> = {}): ReturnType<typeof useAppData> => ({
    tasks: [],
    categories: [],
    dataLoading: false,
    ...overrides
});

const createAchievementsContext = (overrides: Partial<ReturnType<typeof useAchievementIntegration>> = {}): ReturnType<typeof useAchievementIntegration> => ({
    trackAppOpened: vi.fn(),
    trackCalendarViewed: vi.fn(),
    trackDashboardViewed: vi.fn(),
    trackTaskCreated: vi.fn(),
    trackTaskCompleted: vi.fn(),
    trackTaskUpdated: vi.fn(),
    trackTaskDeleted: vi.fn(),
    trackCategoryCreated: vi.fn(),
    trackCategoryUpdated: vi.fn(),
    trackCategoryDeleted: vi.fn(),
    trackAllTasksCompletedToday: vi.fn(),
    trackWeekendProductivity: vi.fn(),
    ...overrides
});

describe('AppContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue(createAuthContext());

        mockUseAppTheme.mockReturnValue(createThemeContext());

        mockUseAppNavigation.mockReturnValue(createNavigationContext());

        mockUseAppData.mockReturnValue(createDataContext());

        mockUseAppLanguage.mockReturnValue(createLanguageContext());

        mockUseAchievementIntegration.mockReturnValue(createAchievementsContext());
    });

    describe('Loading State', () => {
        it('shows loading screen when auth is loading', () => {
            mockUseAuth.mockReturnValue(createAuthContext({
                loading: true
            }));

            renderAppContent();

            expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
            expect(screen.queryByTestId('unauthenticated-app')).not.toBeInTheDocument();
            expect(screen.queryByTestId('authenticated-app')).not.toBeInTheDocument();
        });

        it('renders content when auth is not loading', () => {
            renderAppContent();

            expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
        });
    });

    describe('Unauthenticated State', () => {
        it('renders unauthenticated app when user is not authenticated', () => {
            renderAppContent();

            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
            expect(screen.queryByTestId('authenticated-app')).not.toBeInTheDocument();
        });

        it('shows auth dialog when navigation opens it', () => {
            const closeAuthDialog = vi.fn();

            mockUseAppNavigation.mockReturnValue(createNavigationContext({
                authDialogOpen: true,
                closeAuthDialog
            }));

            renderAppContent();

            expect(screen.getByTestId('auth-dialog')).toBeInTheDocument();
            expect(screen.getByTestId('auth-dialog-tab')).toHaveTextContent('0');
        });

        it('invokes navigation and settings handlers from unauthenticated app', async () => {
            const user = userEvent.setup();
            const openAuthDialog = vi.fn();
            const toggleTheme = vi.fn();
            const handleLanguageChange = vi.fn();

            mockUseAppNavigation.mockReturnValue(createNavigationContext({
                authDialogOpen: false,
                openAuthDialog
            }));

            mockUseAppTheme.mockReturnValue(createThemeContext({
                toggleTheme
            }));

            mockUseAppLanguage.mockReturnValue(createLanguageContext({
                handleLanguageChange
            }));

            renderAppContent();

            await user.click(screen.getByTestId('open-auth'));
            await user.click(screen.getByTestId('open-register'));
            await user.click(screen.getByTestId('toggle-theme'));
            await user.click(screen.getByTestId('change-language'));

            expect(openAuthDialog).toHaveBeenCalledTimes(2);
            expect(toggleTheme).toHaveBeenCalledTimes(1);
            expect(handleLanguageChange).toHaveBeenCalledTimes(1);
        });

        it('closes auth dialog via provided handler', async () => {
            const user = userEvent.setup();
            const closeAuthDialog = vi.fn();

            mockUseAppNavigation.mockReturnValue(createNavigationContext({
                authDialogOpen: true,
                closeAuthDialog
            }));

            renderAppContent();

            await user.click(screen.getByText('Close Dialog'));

            expect(closeAuthDialog).toHaveBeenCalledTimes(1);
        });
    });

    describe('Authenticated State', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue(createAuthContext({
                isAuthenticated: true,
                loading: false,
                user: createUser(),
                token: 'token'
            }));
        });

        it('renders authenticated app when user is authenticated', () => {
            renderAppContent();

            expect(screen.getByTestId('authenticated-app')).toBeInTheDocument();
            expect(screen.queryByTestId('unauthenticated-app')).not.toBeInTheDocument();
        });

        it('passes data props to authenticated app', () => {
            mockUseAppData.mockReturnValue(createDataContext({
                tasks: [createTask()],
                categories: [createCategory()],
                dataLoading: true
            }));

            renderAppContent();

            expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
            expect(screen.getByTestId('categories-count')).toHaveTextContent('1');
            expect(screen.getByTestId('data-loading')).toHaveTextContent('true');
        });

        it('invokes navigation handler and tracking when tabs change', async () => {
            const user = userEvent.setup();
            const handleTabChange = vi.fn();
            const trackCalendarViewed = vi.fn();
            const trackDashboardViewed = vi.fn();

            mockUseAppNavigation.mockReturnValue(createNavigationContext({
                handleTabChange
            }));

            mockUseAchievementIntegration.mockReturnValue(createAchievementsContext({
                trackCalendarViewed,
                trackDashboardViewed
            }));

            renderAppContent();

            await user.click(screen.getByTestId('calendar-tab'));
            await user.click(screen.getByTestId('dashboard-tab'));

            expect(handleTabChange).toHaveBeenCalledWith(expect.anything(), 'calendar');
            expect(handleTabChange).toHaveBeenCalledWith(expect.anything(), 'dashboard');
            expect(trackCalendarViewed).toHaveBeenCalledTimes(1);
            expect(trackDashboardViewed).toHaveBeenCalledTimes(1);
        });

        it('forwards theme and language setters to authenticated app', async () => {
            const user = userEvent.setup();
            const setThemeMode = vi.fn();
            const setLanguage = vi.fn();

            mockUseAppTheme.mockReturnValue(createThemeContext({
                setThemeMode
            }));

            mockUseAppLanguage.mockReturnValue(createLanguageContext({
                setLanguage
            }));

            renderAppContent();

            await user.click(screen.getByTestId('set-theme'));
            await user.click(screen.getByTestId('set-language'));

            expect(setThemeMode).toHaveBeenCalledWith('dark');
            expect(setLanguage).toHaveBeenCalledWith('es');
        });
    });

    describe('Hook Integration', () => {
        it('invokes all supporting hooks on render', () => {
            renderAppContent();

            expect(mockUseAuth).toHaveBeenCalled();
            expect(mockUseAppTheme).toHaveBeenCalled();
            expect(mockUseAppNavigation).toHaveBeenCalled();
            expect(mockUseAppData).toHaveBeenCalled();
            expect(mockUseAppLanguage).toHaveBeenCalled();
            expect(mockUseAchievementIntegration).toHaveBeenCalled();
        });
    });

    describe('State Transitions', () => {
        it('transitions from loading to unauthenticated once auth resolves', () => {
            mockUseAuth.mockReturnValue(createAuthContext({
                loading: true
            }));

            const view = renderAppContent();
            expect(screen.getByTestId('loading-screen')).toBeInTheDocument();

            mockUseAuth.mockReturnValue(createAuthContext());

            view.rerender(<AppContent />);

            expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();
        });

        it('transitions from unauthenticated to authenticated when auth state changes', () => {
            const view = renderAppContent();
            expect(screen.getByTestId('unauthenticated-app')).toBeInTheDocument();

            mockUseAuth.mockReturnValue(createAuthContext({
                isAuthenticated: true,
                loading: false,
                user: createUser(),
                token: 'token'
            }));

            view.rerender(<AppContent />);

            expect(screen.getByTestId('authenticated-app')).toBeInTheDocument();
        });
    });

    describe('Achievement Tracking', () => {
        it('tracks app opened only once per session', () => {
            const trackAppOpened = vi.fn();

            mockUseAuth.mockReturnValue(createAuthContext({
                isAuthenticated: true,
                loading: false,
                user: createUser(),
                token: 'token'
            }));

            mockUseAchievementIntegration.mockReturnValue(createAchievementsContext({
                trackAppOpened
            }));

            const view = renderAppContent();
            expect(trackAppOpened).toHaveBeenCalledTimes(1);

            view.rerender(<AppContent />);
            expect(trackAppOpened).toHaveBeenCalledTimes(1);
        });

        it('tracks calendar view when calendar tab selected', async () => {
            const user = userEvent.setup();
            const trackCalendarViewed = vi.fn();

            mockUseAuth.mockReturnValue(createAuthContext({
                isAuthenticated: true,
                loading: false,
                user: createUser(),
                token: 'token'
            }));

            mockUseAchievementIntegration.mockReturnValue(createAchievementsContext({
                trackCalendarViewed
            }));

            renderAppContent();

            await user.click(screen.getByTestId('calendar-tab'));

            expect(trackCalendarViewed).toHaveBeenCalledTimes(1);
        });

        it('tracks dashboard view when dashboard tab selected', async () => {
            const user = userEvent.setup();
            const trackDashboardViewed = vi.fn();

            mockUseAuth.mockReturnValue(createAuthContext({
                isAuthenticated: true,
                loading: false,
                user: createUser(),
                token: 'token'
            }));

            mockUseAchievementIntegration.mockReturnValue(createAchievementsContext({
                trackDashboardViewed
            }));

            renderAppContent();

            await user.click(screen.getByTestId('dashboard-tab'));

            expect(trackDashboardViewed).toHaveBeenCalledTimes(1);
        });
    });
});
