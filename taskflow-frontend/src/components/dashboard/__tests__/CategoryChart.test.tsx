import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import CategoryChart from '../CategoryChart';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

vi.mock('react-chartjs-2', () => ({
    Doughnut: ({ data, options }: any) => (
        <div data-testid="doughnut-chart">
            <div data-testid="chart-data">{JSON.stringify(data)}</div>
            <div data-testid="chart-options">{JSON.stringify(options)}</div>
        </div>
    )
}));

const mockChartData = {
    labels: ['Work', 'Personal', 'Urgent'],
    datasets: [
        {
            data: [12, 8, 5],
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 205, 86, 1)',
            ],
            borderWidth: 2,
        },
    ],
};

const mockChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
    },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>
        {children}
    </ThemeProvider>
);

const renderCategoryChart = (hasData = true, data = mockChartData, options: any = mockChartOptions) => {
    return render(
        <TestWrapper>
            <CategoryChart
                data={data}
                options={options}
                hasData={hasData}
            />
        </TestWrapper>
    );
};

describe('CategoryChart', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render chart with data and handle state transitions', () => {
            const { rerender } = renderCategoryChart(true);

            expect(screen.getByText('tasksByCategory')).toBeInTheDocument();
            expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
            expect(screen.queryByText('noDataAvailable')).not.toBeInTheDocument();

            const chartDataElement = screen.getByTestId('chart-data');
            expect(chartDataElement.textContent).toContain('Work');
            expect(chartDataElement.textContent).toContain('Personal');
            expect(chartDataElement.textContent).toContain('Urgent');

            const chartOptionsElement = screen.getByTestId('chart-options');
            expect(chartOptionsElement.textContent).toContain('"position":"bottom"');

            rerender(
                <TestWrapper>
                    <CategoryChart data={mockChartData} options={mockChartOptions} hasData={false} />
                </TestWrapper>
            );

            expect(screen.queryByTestId('doughnut-chart')).not.toBeInTheDocument();
            expect(screen.getByText('noDataAvailable')).toBeInTheDocument();
        });

        it('should handle no data state with proper styling', () => {
            renderCategoryChart(false);

            const noDataMessage = screen.getByText('noDataAvailable');
            expect(noDataMessage).toBeInTheDocument();
            expect(noDataMessage).toHaveStyle('text-align: center');
            expect(screen.queryByTestId('doughnut-chart')).not.toBeInTheDocument();
        });
    });

    describe('Layout & Accessibility', () => {
        it('should render within Paper component with correct layout', () => {
            const { container } = renderCategoryChart();

            const paperElement = container.querySelector('.MuiPaper-root');
            expect(paperElement).toBeInTheDocument();
            expect(paperElement).toHaveStyle('height: 400px');

            const heading = screen.getByRole('heading', { level: 6 });
            expect(heading).toHaveTextContent('tasksByCategory');
        });

        it('should handle accessibility for both states', () => {
            renderCategoryChart(true);
            expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();

            renderCategoryChart(false);
            const noDataMessage = screen.getByText('noDataAvailable');
            expect(noDataMessage).toBeVisible();
        });
    });

    describe('Data Handling & Edge Cases', () => {
        it('should handle various data scenarios', () => {
            expect(() => {
                const { unmount } = renderCategoryChart(false, { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 2 }] });
                unmount();
            }).not.toThrow();

            expect(() => {
                const singleData = {
                    labels: ['Work'],
                    datasets: [{ data: [10], backgroundColor: ['rgba(255, 99, 132, 0.8)'], borderColor: ['rgba(255, 99, 132, 1)'], borderWidth: 2 }]
                };
                const { unmount } = renderCategoryChart(true, singleData);
                unmount();
            }).not.toThrow();

            expect(() => {
                const manyData = {
                    labels: ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5', 'Cat6', 'Cat7', 'Cat8'],
                    datasets: [{
                        data: [1, 2, 3, 4, 5, 6, 7, 8],
                        backgroundColor: Array(8).fill('rgba(255, 99, 132, 0.8)'),
                        borderColor: Array(8).fill('rgba(255, 99, 132, 1)'),
                        borderWidth: 2
                    }]
                };
                const { unmount } = renderCategoryChart(true, manyData);
                unmount();
            }).not.toThrow();
        });

        it('should handle options variations', () => {
            expect(() => {
                const customOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' as const },
                        title: { display: true, text: 'Custom Title' }
                    }
                };
                const { unmount } = renderCategoryChart(true, mockChartData, customOptions);
                unmount();
            }).not.toThrow();

            expect(() => {
                const { unmount } = renderCategoryChart(true, mockChartData, {});
                unmount();
            }).not.toThrow();

            expect(() => {
                const defaultOptions = { responsive: true, plugins: { legend: { display: true } } };
                const { unmount } = renderCategoryChart(true, mockChartData, defaultOptions);
                unmount();
            }).not.toThrow();

            const customOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' as const },
                    title: { display: true, text: 'Custom Title' }
                }
            };
            const { unmount } = renderCategoryChart(true, mockChartData, customOptions);
            const chartOptionsElement = screen.getByTestId('chart-options');
            expect(chartOptionsElement.textContent).toContain('Custom Title');
            expect(chartOptionsElement.textContent).toContain('"position":"bottom"');
            unmount();
        });

        it('should handle invalid props gracefully', () => {
            const invalidCases = [
                { name: 'undefined data', data: undefined, options: mockChartOptions, hasData: false },
                { name: 'undefined options', data: mockChartData, options: undefined, hasData: true },
                { name: 'null hasData', data: mockChartData, options: mockChartOptions, hasData: null }
            ];

            invalidCases.forEach(({ name, data, options, hasData }) => {
                expect(() => {
                    render(
                        <TestWrapper>
                            <CategoryChart data={data as any} options={options as any} hasData={hasData as any} />
                        </TestWrapper>
                    );
                }, `${name} should not throw`).not.toThrow();
            });
        });
    });
});
