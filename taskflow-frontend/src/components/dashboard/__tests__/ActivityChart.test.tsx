import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import ActivityChart from '../ActivityChart';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

vi.mock('react-chartjs-2', () => ({
    Line: ({ data, options }: any) => (
        <div data-testid="line-chart">
            <div data-testid="chart-data">{JSON.stringify(data)}</div>
            <div data-testid="chart-options">{JSON.stringify(options)}</div>
        </div>
    )
}));

const mockChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
        { label: 'Completed', data: [10, 15, 12, 18, 20], borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)' },
        { label: 'Created', data: [12, 18, 15, 20, 22], borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.2)' }
    ]
};

const mockChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } }
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

const renderChart = (data = mockChartData, options = mockChartOptions) => (
    render(<TestWrapper><ActivityChart data={data} options={options} /></TestWrapper>)
);

describe('ActivityChart', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('Core Functionality', () => {
        it('should render chart with title and data', () => {
            renderChart();

            expect(screen.getByText('taskActivityOverTime')).toBeInTheDocument();
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();

            const chartData = screen.getByTestId('chart-data');
            expect(chartData.textContent).toContain('Jan');
            expect(chartData.textContent).toContain('Completed');
            expect(chartData.textContent).toContain('Created');

            const chartOptions = screen.getByTestId('chart-options');
            expect(chartOptions.textContent).toContain('responsive');
            expect(chartOptions.textContent).toContain('maintainAspectRatio');
        });

        it('should have proper layout structure', () => {
            const { container } = renderChart();

            const paperElement = container.querySelector('.MuiPaper-root');
            expect(paperElement).toBeInTheDocument();
            expect(paperElement).toHaveStyle('height: 400px');

            const heading = screen.getByRole('heading', { level: 6 });
            expect(heading).toHaveTextContent('taskActivityOverTime');
        });
    });

    describe('Edge Cases & Validation', () => {
        it('should handle various data scenarios', () => {
            expect(() => {
                const { unmount } = renderChart({ labels: [], datasets: [] } as any);
                unmount();
            }).not.toThrow();

            const minimalData = {
                labels: ['Day 1', 'Day 2'],
                datasets: [{
                    label: 'Tasks',
                    data: [5, 8],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)'
                }]
            };

            const { unmount: unmountMinimal } = renderChart(minimalData as any);
            const chartData = screen.getByTestId('chart-data');
            expect(chartData.textContent).toContain('Tasks');
            expect(chartData.textContent).toContain('Day 1');
            unmountMinimal();

            expect(() => {
                const largeData = {
                    labels: Array.from({ length: 100 }, (_, i) => `Day ${i + 1}`),
                    datasets: [{
                        label: 'Large Dataset',
                        data: Array.from({ length: 100 }, () => Math.floor(Math.random() * 100)),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                    }]
                };
                const { unmount } = renderChart(largeData as any);
                unmount();
            }).not.toThrow();
        });

        it('should handle custom and minimal options', () => {
            const customOptions = { ...mockChartOptions, plugins: { ...mockChartOptions.plugins, title: { display: true, text: 'Custom Title' } } };
            renderChart(mockChartData, customOptions);
            expect(screen.getByTestId('chart-options').textContent).toContain('Custom Title');

            const minimalOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } } };
            expect(() => renderChart(mockChartData, minimalOptions)).not.toThrow();
        });

        it('should handle invalid props gracefully', () => {
            const invalidCases = [
                [undefined, mockChartOptions],
                [mockChartData, undefined],
                [null, null]
            ];

            invalidCases.forEach(([data, options]) => {
                expect(() => renderChart(data as any, options as any)).not.toThrow();
            });
        });
    });
});
