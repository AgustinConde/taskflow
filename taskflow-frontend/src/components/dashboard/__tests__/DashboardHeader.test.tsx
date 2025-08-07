import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import DashboardHeader from '../DashboardHeader';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>
        {children}
    </ThemeProvider>
);

const renderDashboardHeader = (timeRange: '7d' | '30d' | '90d' | 'all' = '30d', onTimeRangeChange = vi.fn()) => {
    return render(
        <TestWrapper>
            <DashboardHeader timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} />
        </TestWrapper>
    );
};

describe('DashboardHeader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render dashboard header with all time range options', () => {
            renderDashboardHeader();

            expect(screen.getByText('dashboard')).toBeInTheDocument();
            expect(screen.getByText('last7Days')).toBeInTheDocument();
            expect(screen.getByText('last30Days')).toBeInTheDocument();
            expect(screen.getByText('last90Days')).toBeInTheDocument();
            expect(screen.getByText('allTime')).toBeInTheDocument();
        });

        it('should highlight selected time range and handle selection', async () => {
            const user = userEvent.setup();
            const onTimeRangeChange = vi.fn();

            renderDashboardHeader('7d', onTimeRangeChange);

            const button7d = screen.getByText('last7Days').closest('button');
            expect(button7d).toHaveClass('Mui-selected');

            await user.click(screen.getByText('last90Days'));
            expect(onTimeRangeChange).toHaveBeenCalledWith('90d');

            await user.click(screen.getByText('allTime'));
            expect(onTimeRangeChange).toHaveBeenCalledWith('all');

            expect(onTimeRangeChange).toHaveBeenCalledTimes(2);
        });

        it('should not trigger callback when already selected option is clicked', async () => {
            const user = userEvent.setup();
            const onTimeRangeChange = vi.fn();

            renderDashboardHeader('30d', onTimeRangeChange);

            const button30d = screen.getByText('last30Days');
            await user.click(button30d);

            expect(onTimeRangeChange).not.toHaveBeenCalled();
        });
    });

    describe('Layout & Accessibility', () => {
        it('should use proper flex layout with responsive wrapping', () => {
            const { container } = renderDashboardHeader();

            const headerBox = container.firstChild;
            expect(headerBox).toHaveStyle({
                display: 'flex',
                'justify-content': 'space-between',
                'flex-wrap': 'wrap'
            });
        });

        it('should have accessible structure and hierarchy', () => {
            renderDashboardHeader();

            const title = screen.getByRole('heading', { level: 4 });
            expect(title).toHaveTextContent('dashboard');

            const buttonGroup = screen.getByRole('group');
            expect(buttonGroup).toBeInTheDocument();

            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toBeVisible();
                expect(button).not.toHaveAttribute('aria-hidden');
            });
        });
    });

    describe('Time Range Handling & Edge Cases', () => {
        it('should handle all possible timeRange values correctly', () => {
            const timeRanges = ['7d', '30d', '90d', 'all'] as const;

            timeRanges.forEach(timeRange => {
                const { unmount } = renderDashboardHeader(timeRange);

                const selectedButton = screen.getByRole('button', { pressed: true });
                expect(selectedButton).toBeInTheDocument();

                unmount();
            });
        });

        it('should handle individual time range selections', async () => {
            const user = userEvent.setup();
            const testCases = [
                { buttonText: 'last7Days', expectedValue: '7d' },
                { buttonText: 'last30Days', expectedValue: '30d' },
                { buttonText: 'last90Days', expectedValue: '90d' },
                { buttonText: 'allTime', expectedValue: 'all' }
            ];

            for (const { buttonText, expectedValue } of testCases) {
                const initialTimeRange = expectedValue === '30d' ? '7d' : '30d';
                const onTimeRangeChange = vi.fn();
                const { unmount } = renderDashboardHeader(initialTimeRange as any, onTimeRangeChange);

                await user.click(screen.getByText(buttonText));
                expect(onTimeRangeChange).toHaveBeenCalledWith(expectedValue);

                unmount();
            }
        });

        it('should handle missing onTimeRangeChange gracefully', () => {
            expect(() => {
                render(
                    <TestWrapper>
                        <DashboardHeader timeRange="30d" onTimeRangeChange={undefined as any} />
                    </TestWrapper>
                );
            }).not.toThrow();
        });
    });
});
