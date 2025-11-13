import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskItem from '../TaskItem';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

vi.mock('react-i18next', () => ({
    __esModule: true,
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() }
    })
}));

vi.mock('../../location/LocationPicker', () => ({
    __esModule: true,
    default: () => null
}));

// Test data
const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    dueDate: '2024-12-31T23:59:59.000Z',
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
};

const mockCategories: Category[] = [
    {
        id: 1,
        name: 'Work',
        color: '#7C3AED',
        description: 'Work tasks',
        userId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 2,
        name: 'Personal',
        color: '#3B82F6',
        description: 'Personal tasks',
        userId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
    }
];

const createQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false }
    }
});

const renderWithProviders = (
    task: Task,
    props: Partial<Parameters<typeof TaskItem>[0]> = {}
) => {
    const defaultProps = {
        task,
        onEditSave: vi.fn(),
        onDelete: vi.fn(),
        onToggleCompleted: vi.fn(),
        categories: mockCategories,
        ...props
    };

    return {
        ...render(
            <QueryClientProvider client={createQueryClient()}>
                <ThemeProvider theme={createTheme()}>
                    <TaskItem {...defaultProps} />
                </ThemeProvider>
            </QueryClientProvider>
        ),
        props: defaultProps
    };
};

describe('TaskItem', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders task', () => {
        renderWithProviders(mockTask);
        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('toggles completion', async () => {
        const { props } = renderWithProviders(mockTask);
        await userEvent.click(screen.getByRole('checkbox'));
        expect(props.onToggleCompleted).toHaveBeenCalledOnce();
    });

    it('opens info dialog', async () => {
        renderWithProviders(mockTask);
        await userEvent.click(screen.getByLabelText(/more/i));
        await userEvent.click(screen.getByText('info'));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes info dialog', async () => {
        renderWithProviders(mockTask);
        await userEvent.click(screen.getByLabelText(/more/i));
        await userEvent.click(screen.getByText('info'));
        await userEvent.click(screen.getByText('close'));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('calls delete', async () => {
        const { props } = renderWithProviders(mockTask);
        await userEvent.click(screen.getByLabelText(/more/i));
        await userEvent.click(screen.getByText('delete'));
        expect(props.onDelete).toHaveBeenCalled();
    });

    it('opens and closes edit dialog', async () => {
        renderWithProviders(mockTask);
        await userEvent.click(screen.getByLabelText(/more/i));
        await userEvent.click(screen.getByText('edit'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await userEvent.click(screen.getByText('cancel'));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('saves edited task', async () => {
        const { props } = renderWithProviders(mockTask);
        await userEvent.click(screen.getByLabelText(/more/i));
        await userEvent.click(screen.getByText('edit'));

        const titleInput = screen.getByLabelText(/title/i);
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, 'Updated Task');

        await userEvent.click(screen.getByText('save'));

        expect(props.onEditSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Task' }));
    });

    it('renders without category', () => {
        const taskWithoutCategory = { ...mockTask, categoryId: null };
        renderWithProviders(taskWithoutCategory);
        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('renders with unknown category', () => {
        const taskWithUnknownCategory = { ...mockTask, categoryId: 999 };
        renderWithProviders(taskWithUnknownCategory);
        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
});
