import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import MetricsCards from '../MetricsCards';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

const defaultMetrics = { total: 50, completed: 30, pending: 15, completionRate: 60.0, overdue: 5, dueSoon: 3 };

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

const renderMetrics = (metrics = defaultMetrics) => (
    render(<TestWrapper><MetricsCards metrics={metrics} /></TestWrapper>)
);

describe('MetricsCards', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('Core Functionality', () => {
        it('should render all metric cards with values', () => {
            renderMetrics();

            ['totalTasks', 'completedTasks', 'pendingTasks', 'overdueTasks'].forEach(label => {
                expect(screen.getByText(label)).toBeInTheDocument();
            });

            ['50', '30', '15', '5'].forEach(value => {
                expect(screen.getByText(value)).toBeInTheDocument();
            });

            expect(screen.getByText('60.0% completion')).toBeInTheDocument();
            expect(screen.getByText('3 dueSoon')).toBeInTheDocument();

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '60');
            expect(progressBar).toHaveAttribute('aria-valuemin', '0');
            expect(progressBar).toHaveAttribute('aria-valuemax', '100');
        });

        it('should handle due soon chip visibility', () => {
            const { unmount: unmount1 } = renderMetrics();
            expect(screen.getByText('3 dueSoon')).toBeInTheDocument();
            unmount1();

            const { unmount: unmount2 } = renderMetrics({ ...defaultMetrics, dueSoon: 0 });
            expect(screen.queryByText(/dueSoon/)).not.toBeInTheDocument();
            unmount2();
        });
    });

    describe('Edge Cases & Validation', () => {
        it('should handle zero and extreme values', () => {
            const testCases = [
                { metrics: { total: 0, completed: 0, pending: 0, completionRate: 0, overdue: 0, dueSoon: 0 }, expectedCompletion: '0.0% completion' },
                { metrics: { total: 20, completed: 20, pending: 0, completionRate: 100.0, overdue: 0, dueSoon: 0 }, expectedCompletion: '100.0% completion' },
                { metrics: { total: 9999, completed: 5000, pending: 3000, completionRate: 50.1, overdue: 1999, dueSoon: 500 }, expectedCompletion: '50.1% completion' },
                { metrics: { ...defaultMetrics, completionRate: 33.333333 }, expectedCompletion: '33.3% completion' }
            ];

            testCases.forEach(({ metrics, expectedCompletion }) => {
                const { unmount } = renderMetrics(metrics);
                expect(screen.getByText(expectedCompletion)).toBeInTheDocument();

                const progressBars = screen.getAllByRole('progressbar');
                const progressBar = progressBars[0];
                const expectedValue = Math.round(metrics.completionRate).toString();
                expect(progressBar).toHaveAttribute('aria-valuenow', expectedValue);

                unmount();
            });
        });

        it('should handle negative values gracefully', () => {
            const negativeMetrics = { total: -1, completed: -5, pending: -2, completionRate: -10, overdue: -3, dueSoon: -1 };
            expect(() => renderMetrics(negativeMetrics)).not.toThrow();
        });

        it('should have proper layout and accessibility', () => {
            const { container } = renderMetrics();

            const gridContainer = container.firstChild;
            expect(gridContainer).toHaveStyle('display: grid');

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuemin', '0');
            expect(progressBar).toHaveAttribute('aria-valuemax', '100');

            const cards = screen.getAllByText(/Tasks|completion/).map(el => el.closest('.MuiCard-root')).filter(Boolean);
            expect(cards.length).toBeGreaterThan(0);

            const titles = screen.getAllByText(/totalTasks|completedTasks|pendingTasks|overdueTasks/);
            titles.forEach(title => expect(title).toBeVisible());
        });
    });
});
