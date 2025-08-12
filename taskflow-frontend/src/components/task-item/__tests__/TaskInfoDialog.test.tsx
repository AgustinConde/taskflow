import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaskInfoDialog from '../TaskInfoDialog';

const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test task description',
    isCompleted: false,
    dueDate: '2024-12-31T23:59:59.000Z',
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
        <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
    </QueryClientProvider>
);

const setupMocks = (overrides: any = {}) => {
    const config = {
        open: true,
        onClose: vi.fn(),
        task: mockTask,
        ...overrides
    };
    return config;
};

const renderTaskInfoDialog = (props = {}) => {
    const config = setupMocks(props);
    return {
        ...render(
            <TestWrapper>
                <TaskInfoDialog {...config} />
            </TestWrapper>
        ),
        ...config
    };
};

describe('TaskInfoDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render dialog with task information when open', () => {
            renderTaskInfoDialog();

            expect(screen.getByText('Test Task')).toBeInTheDocument();
            expect(screen.getByText('Test task description')).toBeInTheDocument();
            expect(screen.getByText('pending')).toBeInTheDocument();
        });

        it('should display completed status for completed task', () => {
            renderTaskInfoDialog({ task: { ...mockTask, isCompleted: true } });

            expect(screen.getByText('completed')).toBeInTheDocument();
        });

        it('should handle close button click', async () => {
            const user = userEvent.setup();
            const { onClose } = renderTaskInfoDialog();

            await user.click(screen.getByText('close'));
            expect(onClose).toHaveBeenCalledOnce();
        });

        it('should not render dialog when closed', () => {
            renderTaskInfoDialog({ open: false });

            expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
        });
    });

    describe('Date Display', () => {
        it('should format and display creation date', () => {
            renderTaskInfoDialog();

            expect(screen.getByText('created')).toBeInTheDocument();
            expect(screen.getByText('12/31/2023, 09:00 PM')).toBeInTheDocument();
        });

        it('should format and display due date', () => {
            renderTaskInfoDialog();

            expect(screen.getByText('due')).toBeInTheDocument();
            expect(screen.getByText('12/31/2024, 08:59 PM')).toBeInTheDocument();
        });

        it('should display dash when dates are null', () => {
            renderTaskInfoDialog({ task: { ...mockTask, createdAt: null, dueDate: null } });

            const dashElements = screen.getAllByText('-');
            expect(dashElements).toHaveLength(2);
        });
    }); describe('Edge Cases', () => {
        it('should handle empty description', () => {
            renderTaskInfoDialog({ task: { ...mockTask, description: '' } });

            expect(screen.getByText('description')).toBeInTheDocument();
            expect(screen.getByText('-')).toBeInTheDocument();
        });

        it('should handle null description', () => {
            renderTaskInfoDialog({ task: { ...mockTask, description: null } });

            expect(screen.getByText('description')).toBeInTheDocument();
            expect(screen.getByText('-')).toBeInTheDocument();
        });

        it('should display task title in dialog header', () => {
            const customTask = { ...mockTask, title: 'Custom Task Title' };
            renderTaskInfoDialog({ task: customTask });

            expect(screen.getByText('Custom Task Title')).toBeInTheDocument();
        });
    });
});
