import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskList from '../TaskList';
import { NotificationProvider } from '../../../contexts/NotificationContext';

const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

vi.mock('../TaskListHeader', () => ({
    __esModule: true,
    default: ({ categories, onSubmit, creating, search, onSearchChange, filter, onFilterChange, sortBy, onSortChange, onCategoryManagerOpen }: any) => (
        <div data-testid="task-list-header">
            <input data-testid="search-input" value={search} onChange={(e) => onSearchChange?.(e.target.value)} />
            <select data-testid="filter-select" value={filter} onChange={(e) => onFilterChange?.(e.target.value)}>
                <option value="">All</option>
                {categories?.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <select data-testid="sort-select" value={sortBy} onChange={(e) => onSortChange?.(e.target.value)}>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
            </select>
            <button data-testid="create-task-btn" onClick={() => onSubmit?.({ title: 'New Task', description: 'Test' })} disabled={creating}>
                {creating ? 'Creating...' : 'Create Task'}
            </button>
            <button data-testid="category-manager-btn" onClick={onCategoryManagerOpen}>Manage Categories</button>
        </div>
    )
}));

vi.mock('../TaskGrid', () => ({
    __esModule: true,
    default: ({ tasks, onEditSave, onDelete, onToggleCompleted, isDragEnabled }: any) => (
        <div data-testid="task-grid">
            <div>Drag Enabled: {isDragEnabled?.toString()}</div>
            {tasks?.map((task: any) => (
                <div key={task.id} data-testid={`task-${task.id}`}>
                    <span>{task.title}</span>
                    <input type="checkbox" checked={task.isCompleted} onChange={() => onToggleCompleted?.(task)} data-testid={`task-checkbox-${task.id}`} />
                    <button onClick={() => onEditSave?.({ ...task, title: task.title + ' Updated' })} data-testid={`edit-task-${task.id}`}>Edit</button>
                    <button onClick={() => onDelete?.(task.id)} data-testid={`delete-task-${task.id}`}>Delete</button>
                </div>
            ))}
        </div>
    )
}));

vi.mock('../DeleteConfirmDialog', () => ({
    __esModule: true,
    default: ({ open, onConfirm, onCancel, loading }: any) => open ? (
        <div data-testid="delete-dialog">
            <button onClick={onConfirm} disabled={loading} data-testid="confirm-delete">{loading ? 'Deleting...' : 'Confirm'}</button>
            <button onClick={onCancel} data-testid="cancel-delete">Cancel</button>
        </div>
    ) : null
}));

vi.mock('../../category-manager', () => ({
    __esModule: true,
    default: ({ open, onClose }: any) => open ? <div data-testid="category-manager"><button onClick={onClose} data-testid="close-category-manager">Close</button></div> : null
}));

const mockTasks = [
    { id: 1, title: 'Complete project documentation', description: 'Write comprehensive docs', isCompleted: false, dueDate: '2024-12-31T23:59:59.000Z', categoryId: 1, createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 2, title: 'Review code changes', description: 'Check PR for issues', isCompleted: true, dueDate: null, categoryId: 2, createdAt: '2024-01-01T00:00:00.000Z' }
];

const mockCategories = [
    { id: 1, name: 'Development', color: '#FF5722', userId: 1, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    { id: 2, name: 'Review', color: '#2196F3', userId: 1, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
];

vi.mock('../../../hooks/useTasks', () => ({
    useTasks: vi.fn(), useCreateTask: vi.fn(), useUpdateTask: vi.fn(), useDeleteTask: vi.fn(), useToggleTaskCompletion: vi.fn()
}));
vi.mock('../../../hooks/useCategories', () => ({ useCategories: vi.fn() }));
vi.mock('../hooks/useTaskFiltering', () => ({ useTaskFiltering: vi.fn() }));
vi.mock('../hooks/useTaskSorting', () => ({ useTaskSorting: vi.fn() }));

import * as tasksHooks from '../../../hooks/useTasks';
import * as categoriesHooks from '../../../hooks/useCategories';
import * as filteringHooks from '../hooks/useTaskFiltering';
import * as sortingHooks from '../hooks/useTaskSorting';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
        <ThemeProvider theme={createTheme()}><NotificationProvider>{children}</NotificationProvider></ThemeProvider>
    </QueryClientProvider>
);

const createMockMutation = (resolved = true, value: any = mockTasks[0]) => ({
    mutateAsync: vi.fn()[resolved ? 'mockResolvedValue' : 'mockRejectedValue'](resolved ? value : new Error('Operation failed')),
    isPending: false, mutate: vi.fn(), isError: false, error: null
});

const setupMocks = (overrides: any = {}) => {
    const config = {
        tasks: mockTasks, categories: mockCategories, tasksLoading: false, categoriesLoading: false,
        createMutation: createMockMutation(), updateMutation: createMockMutation(), deleteMutation: createMockMutation(true, undefined), toggleMutation: createMockMutation(),
        filtering: { search: '', setSearch: vi.fn(), filter: '', setFilter: vi.fn(), filteredTasks: mockTasks },
        sorting: { sortBy: 'dueDate', setSortBy: vi.fn(), sortedTasks: mockTasks, handleDragEnd: vi.fn(), isCustomSort: false },
        ...overrides
    };

    vi.mocked(tasksHooks.useTasks).mockReturnValue({ data: config.tasks, isLoading: config.tasksLoading, error: null, refetch: vi.fn() } as any);
    vi.mocked(tasksHooks.useCreateTask).mockReturnValue(config.createMutation as any);
    vi.mocked(tasksHooks.useUpdateTask).mockReturnValue(config.updateMutation as any);
    vi.mocked(tasksHooks.useDeleteTask).mockReturnValue(config.deleteMutation as any);
    vi.mocked(tasksHooks.useToggleTaskCompletion).mockReturnValue(config.toggleMutation as any);
    vi.mocked(categoriesHooks.useCategories).mockReturnValue({ data: config.categories, isLoading: config.categoriesLoading, error: null, refetch: vi.fn() } as any);
    vi.mocked(filteringHooks.useTaskFiltering).mockReturnValue(config.filtering as any);
    vi.mocked(sortingHooks.useTaskSorting).mockReturnValue(config.sorting as any);
    return config;
};

const renderTaskList = () => render(<TestWrapper><TaskList /></TestWrapper>);

describe('TaskList', () => {
    beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

    describe('Core Functionality', () => {
        it('should render all components with correct data', async () => {
            renderTaskList();
            await waitFor(() => {
                expect(screen.getByTestId('task-list-header')).toBeInTheDocument();
                expect(screen.getByTestId('task-grid')).toBeInTheDocument();
                expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
            });
        });

        it('should handle loading states correctly', () => {
            setupMocks({ tasksLoading: true });
            renderTaskList();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.getByText('loading')).toBeInTheDocument();
        });

        it('should handle empty task list', async () => {
            setupMocks({ tasks: [], filtering: { search: '', setSearch: vi.fn(), filter: '', setFilter: vi.fn(), filteredTasks: [] }, sorting: { sortBy: 'dueDate', setSortBy: vi.fn(), sortedTasks: [], handleDragEnd: vi.fn(), isCustomSort: false } });
            renderTaskList();
            await waitFor(() => expect(screen.getByText('noTasks')).toBeInTheDocument());
        });

        it('should handle search and filter functionality', async () => {
            renderTaskList();
            const user = userEvent.setup();
            await waitFor(() => {
                expect(screen.getByTestId('search-input')).toBeInTheDocument();
                expect(screen.getByTestId('filter-select')).toBeInTheDocument();
            });
            await user.type(screen.getByTestId('search-input'), 'test');
            await user.selectOptions(screen.getByTestId('filter-select'), '1');
        });

        it('should handle task creation', async () => {
            const user = userEvent.setup();
            const mutateAsync = vi.fn().mockResolvedValue({});
            setupMocks({ createMutation: { mutateAsync, isPending: false } });
            renderTaskList();
            await waitFor(() => expect(screen.getByTestId('create-task-btn')).toBeInTheDocument());
            await user.click(screen.getByTestId('create-task-btn'));
            expect(mutateAsync).toHaveBeenCalledWith({ title: 'New Task', description: 'Test' });
        });
    });

    describe('Task Operations', () => {
        it('should handle task editing and completion toggle', async () => {
            const user = userEvent.setup();
            const editMutateAsync = vi.fn().mockResolvedValue({});
            const toggleMutateAsync = vi.fn().mockResolvedValue({});
            setupMocks({ updateMutation: { mutateAsync: editMutateAsync, isPending: false }, toggleMutation: { mutateAsync: toggleMutateAsync, isPending: false } });
            renderTaskList();

            await waitFor(() => {
                expect(screen.getByTestId('edit-task-1')).toBeInTheDocument();
                expect(screen.getByTestId('task-checkbox-1')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('edit-task-1'));
            await user.click(screen.getByTestId('task-checkbox-1'));
            expect(editMutateAsync).toHaveBeenCalled();
            expect(toggleMutateAsync).toHaveBeenCalledWith(mockTasks[0]);
        });

        it('should handle delete confirmation flow', async () => {
            const user = userEvent.setup();
            const mutateAsync = vi.fn().mockResolvedValue({});
            setupMocks({ deleteMutation: { mutateAsync, isPending: false } });
            renderTaskList();

            await waitFor(() => expect(screen.getByTestId('delete-task-1')).toBeInTheDocument());
            await user.click(screen.getByTestId('delete-task-1'));
            await waitFor(() => expect(screen.getByTestId('delete-dialog')).toBeInTheDocument());
            await user.click(screen.getByTestId('confirm-delete'));
            expect(mutateAsync).toHaveBeenCalledWith(1);
        });

        it('should handle delete cancellation and category manager', async () => {
            const user = userEvent.setup();
            renderTaskList();

            await waitFor(() => {
                expect(screen.getByTestId('delete-task-1')).toBeInTheDocument();
                expect(screen.getByTestId('category-manager-btn')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('delete-task-1'));
            await waitFor(() => expect(screen.getByTestId('delete-dialog')).toBeInTheDocument());
            await user.click(screen.getByTestId('cancel-delete'));
            await waitFor(() => expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument());

            await user.click(screen.getByTestId('category-manager-btn'));
            await waitFor(() => expect(screen.getByTestId('category-manager')).toBeInTheDocument());
            await user.click(screen.getByTestId('close-category-manager'));
            await waitFor(() => expect(screen.queryByTestId('category-manager')).not.toBeInTheDocument());
        });
    });

    describe('Error Handling & Edge Cases', () => {
        it('should show loading state when creating task', async () => {
            const mutateAsync = vi.fn().mockResolvedValue({});
            setupMocks({ createMutation: { mutateAsync, isPending: true } });
            renderTaskList();

            await waitFor(() => expect(screen.getByText('Creating...')).toBeInTheDocument());
        });

        it('should handle task creation when not loading', async () => {
            const user = userEvent.setup();
            const mutateAsync = vi.fn().mockResolvedValue({});
            setupMocks({ createMutation: { mutateAsync, isPending: false } });
            renderTaskList();

            await user.click(screen.getByTestId('create-task-btn'));
            expect(mutateAsync).toHaveBeenCalled();
        });

        it('should handle sort functionality with drag support', async () => {
            const setSortBy = vi.fn();
            const handleDragEnd = vi.fn();
            setupMocks({ sorting: { sortBy: 'dueDate', setSortBy, sortedTasks: mockTasks, handleDragEnd, isCustomSort: true } });
            renderTaskList();

            await waitFor(() => {
                expect(screen.getByTestId('task-grid')).toBeInTheDocument();
                expect(screen.getByText('Drag Enabled: true')).toBeInTheDocument();
            });
        });

        it('should handle console errors gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const user = userEvent.setup();

            const updateMutateAsync = vi.fn().mockRejectedValue(new Error('Update failed'));
            setupMocks({ updateMutation: { mutateAsync: updateMutateAsync, isPending: false } });
            renderTaskList();
            await waitFor(() => expect(screen.getByTestId('edit-task-1')).toBeInTheDocument());
            await user.click(screen.getByTestId('edit-task-1'));
            await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error updating task:', expect.any(Error)));

            consoleSpy.mockRestore();
        });

        it('should handle delete errors gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const user = userEvent.setup();

            const deleteMutateAsync = vi.fn().mockRejectedValue(new Error('Delete failed'));
            setupMocks({ deleteMutation: { mutateAsync: deleteMutateAsync, isPending: false } });
            renderTaskList();
            await waitFor(() => expect(screen.getByTestId('delete-task-1')).toBeInTheDocument());
            await user.click(screen.getByTestId('delete-task-1'));
            await waitFor(() => expect(screen.getByTestId('delete-dialog')).toBeInTheDocument());
            await user.click(screen.getByTestId('confirm-delete'));
            await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error deleting task:', expect.any(Error)));

            consoleSpy.mockRestore();
        });

        it('should handle toggle completion errors gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const user = userEvent.setup();

            const toggleMutateAsync = vi.fn().mockRejectedValue(new Error('Toggle failed'));
            setupMocks({ toggleMutation: { mutateAsync: toggleMutateAsync, isPending: false } });
            renderTaskList();
            await waitFor(() => expect(screen.getByTestId('task-checkbox-1')).toBeInTheDocument());
            await user.click(screen.getByTestId('task-checkbox-1'));
            await waitFor(() => {
                expect(toggleMutateAsync).toHaveBeenCalledWith(mockTasks[0]);
                expect(consoleSpy).toHaveBeenCalledWith('Error toggling task completion:', expect.any(Error));
            });

            consoleSpy.mockRestore();
        });

        it('should handle successful toggle completion', async () => {
            const user = userEvent.setup();
            const toggleMutateAsync = vi.fn().mockResolvedValue({});
            setupMocks({ toggleMutation: { mutateAsync: toggleMutateAsync, isPending: false } });
            renderTaskList();

            await waitFor(() => expect(screen.getByTestId('task-checkbox-1')).toBeInTheDocument());
            await user.click(screen.getByTestId('task-checkbox-1'));

            await waitFor(() => {
                expect(toggleMutateAsync).toHaveBeenCalledWith(mockTasks[0]);
            });
        });
    });
});
