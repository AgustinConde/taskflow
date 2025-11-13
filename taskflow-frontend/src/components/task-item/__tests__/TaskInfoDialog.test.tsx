import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaskInfoDialog from '../TaskInfoDialog';
import type { Task } from '../../../types/Task';

vi.mock('react-i18next', () => ({
    __esModule: true,
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('../../location', () => ({
    __esModule: true,
    LocationDisplay: () => <div data-testid="location-display" />
}));

const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    dueDate: '2024-12-31T23:59:59.000Z',
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
};

const renderDialog = (props = {}, themeMode: 'light' | 'dark' = 'light') => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        task: mockTask,
        ...props
    };

    return {
        ...render(
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <ThemeProvider theme={createTheme({ palette: { mode: themeMode } })}>
                    <TaskInfoDialog {...defaultProps} />
                </ThemeProvider>
            </QueryClientProvider>
        ),
        props: defaultProps
    };
};

describe('TaskInfoDialog', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders task information', () => {
        renderDialog();
        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('hides dialog when closed', () => {
        renderDialog({ open: false });
        expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    });

    it('shows completed status chip', () => {
        renderDialog({ task: { ...mockTask, isCompleted: true } });
        const chip = screen.getByText('completed');
        expect(chip.closest('.MuiChip-colorPrimary')).toBeInTheDocument();
    });

    it('shows pending status chip', () => {
        renderDialog();
        const chip = screen.getByText('pending');
        expect(chip.closest('.MuiChip-colorDefault')).toBeInTheDocument();
    });

    it('handles close action', async () => {
        const { props } = renderDialog();
        await userEvent.click(screen.getByText('close'));
        expect(props.onClose).toHaveBeenCalledOnce();
    });

    it('formats dates correctly', () => {
        renderDialog();
        expect(screen.getByText('12/31/2023, 09:00 PM')).toBeInTheDocument();
        expect(screen.getByText('12/31/2024, 08:59 PM')).toBeInTheDocument();
    });

    it('shows placeholders for null dates', () => {
        renderDialog({ task: { ...mockTask, createdAt: null, dueDate: null } });
        expect(screen.getAllByText('-')).toHaveLength(2);
    });

    it('shows placeholder for empty description', () => {
        renderDialog({ task: { ...mockTask, description: '' } });
        expect(screen.getAllByText('-')).toHaveLength(1);
    });

    it('shows placeholder for null description', () => {
        renderDialog({ task: { ...mockTask, description: '' } });
        expect(screen.getAllByText('-')).toHaveLength(1);
    });

    it('renders location when present', () => {
        const taskWithLocation = {
            ...mockTask,
            location: {
                address: '123 Main St',
                latitude: 40.7128,
                longitude: -74.0060,
                placeName: 'Test Place',
                placeId: 'test-123'
            }
        };
        renderDialog({ task: taskWithLocation });
        expect(screen.getByTestId('location-display')).toBeInTheDocument();
    });

    it('works with dark theme', () => {
        renderDialog({}, 'dark');
        expect(screen.getByText('close')).toBeInTheDocument();
    });

    it('works with light theme', () => {
        renderDialog({}, 'light');
        expect(screen.getByText('close')).toBeInTheDocument();
    });
});
