import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import Dashboard from '../Dashboard';
import { useFilteredTasks, useActivityChartData } from '../hooks/useChartData';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useCategoryChartData } from '../hooks/useCategoryData';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

vi.mock('chart.js', () => ({
    Chart: {
        register: vi.fn()
    },
    CategoryScale: {},
    LinearScale: {},
    PointElement: {},
    LineElement: {},
    Title: {},
    Tooltip: {},
    Legend: {},
    ArcElement: {}
}));

vi.mock('../DashboardHeader', () => ({
    __esModule: true,
    default: ({ timeRange, onTimeRangeChange }: any) => (
        <div data-testid="dashboard-header">
            <span>Current: {timeRange}</span>
            <button onClick={() => onTimeRangeChange('7d')}>7d</button>
            <button onClick={() => onTimeRangeChange('30d')}>30d</button>
        </div>
    )
}));

vi.mock('../MetricsCards', () => ({
    __esModule: true,
    default: ({ metrics }: any) => (
        <div data-testid="metrics-cards">
            Total: {metrics.total}, Completed: {metrics.completed}
        </div>
    )
}));

vi.mock('../ActivityChart', () => ({
    __esModule: true,
    default: ({ data, options }: any) => (
        <div data-testid="activity-chart">
            <div>Labels: {data.labels?.join(',')}</div>
            <div>Responsive: {options.responsive?.toString()}</div>
        </div>
    )
}));

vi.mock('../CategoryChart', () => ({
    __esModule: true,
    default: ({ data, hasData }: any) => (
        <div data-testid="category-chart">
            <div>Categories: {data.labels?.join(',')}</div>
            <div>Has Data: {hasData?.toString()}</div>
        </div>
    )
}));

vi.mock('../hooks/useChartData', () => ({
    useFilteredTasks: vi.fn(),
    useActivityChartData: vi.fn()
}));

vi.mock('../hooks/useDashboardMetrics', () => ({
    useDashboardMetrics: vi.fn()
}));

vi.mock('../hooks/useCategoryData', () => ({
    useCategoryChartData: vi.fn()
}));

const mockUseFilteredTasks = useFilteredTasks as any;
const mockUseActivityChartData = useActivityChartData as any;
const mockUseDashboardMetrics = useDashboardMetrics as any;
const mockUseCategoryChartData = useCategoryChartData as any;

const mockTasks = [
    { id: 1, title: 'Task 1', isCompleted: true, categoryId: 1, createdAt: '2024-01-01' },
    { id: 2, title: 'Task 2', isCompleted: false, categoryId: 2, createdAt: '2024-01-02' },
    { id: 3, title: 'Task 3', isCompleted: true, categoryId: 1, createdAt: '2024-01-03' }
];

const mockCategories = [
    { id: 1, name: 'Work', color: '#ff0000', createdAt: '2024-01-01', updatedAt: '2024-01-01', userId: 1 },
    { id: 2, name: 'Personal', color: '#00ff00', createdAt: '2024-01-01', updatedAt: '2024-01-01', userId: 1 }
];

const mockDefaults = {
    metrics: { total: 3, completed: 2, pending: 1, completionRate: 66.7, overdue: 0, dueSoon: 1 },
    activityData: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Completed', data: [5, 10, 8], borderColor: 'rgb(75, 192, 192)' }] },
    categoryData: { labels: ['Work', 'Personal'], datasets: [{ data: [2, 1], backgroundColor: ['#ff0000', '#00ff00'] }] }
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

const setupMocks = (overrides = {}, filteredTasks = mockTasks) => {
    const config = { ...mockDefaults, ...overrides };
    mockUseFilteredTasks.mockReturnValue(filteredTasks);
    mockUseDashboardMetrics.mockReturnValue(config.metrics);
    mockUseActivityChartData.mockReturnValue(config.activityData);
    mockUseCategoryChartData.mockReturnValue(config.categoryData);
};

const renderDashboard = (tasks = mockTasks, categories = mockCategories) => (
    render(<TestWrapper><Dashboard tasks={tasks} categories={categories} /></TestWrapper>)
);

describe('Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupMocks();
    });

    describe('Core Functionality', () => {
        it('should render all components with correct data', () => {
            renderDashboard();

            expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
            expect(screen.getByTestId('metrics-cards')).toBeInTheDocument();
            expect(screen.getByTestId('activity-chart')).toBeInTheDocument();
            expect(screen.getByTestId('category-chart')).toBeInTheDocument();

            expect(screen.getByText('Total: 3, Completed: 2')).toBeInTheDocument();
            expect(screen.getByText('Labels: Jan,Feb,Mar')).toBeInTheDocument();
            expect(screen.getByText('Categories: Work,Personal')).toBeInTheDocument();
            expect(screen.getByText('Current: 30d')).toBeInTheDocument();
        });

        it('should update time range correctly', async () => {
            const user = userEvent.setup();
            renderDashboard();

            const sevenDayButton = screen.getByText('7d');
            const thirtyDayButton = screen.getByText('30d');

            await user.click(sevenDayButton);
            await waitFor(() => {
                expect(screen.getByText('Current: 7d')).toBeInTheDocument();
            }, { timeout: 2000 });
            expect(mockUseFilteredTasks).toHaveBeenLastCalledWith(mockTasks, '7d');

            await user.click(thirtyDayButton);
            await waitFor(() => {
                expect(screen.getByText('Current: 30d')).toBeInTheDocument();
            }, { timeout: 2000 });
        });

        it('should call hooks with correct parameters', () => {
            renderDashboard();

            expect(mockUseFilteredTasks).toHaveBeenCalledWith(mockTasks, '30d');
            expect(mockUseDashboardMetrics).toHaveBeenCalledWith(mockTasks);
            expect(mockUseActivityChartData).toHaveBeenCalledWith(mockTasks, mockTasks, '30d');
            expect(mockUseCategoryChartData).toHaveBeenCalledWith(mockTasks, mockCategories);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty data', () => {
            setupMocks({
                metrics: { total: 0, completed: 0, pending: 0, completionRate: 0, overdue: 0, dueSoon: 0 },
                categoryData: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 2 }] }
            }, []);

            renderDashboard([], mockCategories);
            expect(mockUseFilteredTasks).toHaveBeenCalledWith([], '30d');
            expect(mockUseDashboardMetrics).toHaveBeenCalledWith([]);
        });

        it('should detect chart data correctly', () => {
            renderDashboard();
            expect(screen.getByText('Has Data: true')).toBeInTheDocument();

            setupMocks({
                categoryData: { labels: ['Work'], datasets: [{ data: [0], backgroundColor: ['#ff0000'] }] }
            });
            renderDashboard();
            expect(screen.getByText('Has Data: false')).toBeInTheDocument();
        });

        it('should handle performance correctly', () => {
            const { rerender } = renderDashboard();
            const initialCalls = mockUseDashboardMetrics.mock.calls.length;

            rerender(<TestWrapper><Dashboard tasks={mockTasks} categories={mockCategories} /></TestWrapper>);
            expect(mockUseDashboardMetrics.mock.calls.length).toBe(initialCalls);

            const newTasks = [...mockTasks, { id: 4, title: 'Task 4', isCompleted: false, categoryId: 1, createdAt: '2024-01-04' }];
            rerender(<TestWrapper><Dashboard tasks={newTasks} categories={mockCategories} /></TestWrapper>);
            expect(mockUseFilteredTasks).toHaveBeenCalledWith(newTasks, '30d');
        });
    });

    describe('Layout & Error Handling', () => {
        it('should render layout components correctly', () => {
            const { container } = renderDashboard();
            expect(container.querySelectorAll('[data-testid*="chart"]').length).toBeGreaterThan(0);
            expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
            expect(screen.getByText('Responsive: true')).toBeInTheDocument();
        });

        it('should handle errors gracefully', () => {
            setupMocks();
            mockUseDashboardMetrics.mockImplementation(() => { throw new Error('Hook error'); });
            expect(() => renderDashboard()).toThrow('Hook error');

            vi.clearAllMocks();
            setupMocks();
            expect(() => renderDashboard(undefined as any, undefined as any)).not.toThrow();
        });
    });
});
