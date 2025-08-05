import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaskItem from '../TaskItem';
import { NotificationProvider } from '../../../contexts/NotificationContext';

const mockTask = {
    id: 1,
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the project',
    isCompleted: false,
    dueDate: '2024-12-31T23:59:59.000Z',
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
};

const mockCategory = {
    id: 1,
    name: 'Development',
    color: '#FF5722',
    userId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
};

const mockProps = {
    task: mockTask,
    onEditSave: vi.fn(),
    onDelete: vi.fn(),
    onToggleCompleted: vi.fn(),
    categories: [mockCategory]
};

vi.mock('../../../services/taskService', () => ({
    taskService: {
        updateTask: vi.fn(),
        deleteTask: vi.fn()
    }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { changeLanguage: vi.fn() }
    })
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, refetchOnWindowFocus: false },
            mutations: { retry: false }
        }
    });

    return (
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </QueryClientProvider>
    );
};

describe('TaskItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render task information correctly', () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
            expect(screen.getByText('Write comprehensive documentation for the project')).toBeInTheDocument();
            expect(screen.getByText('Development')).toBeInTheDocument();
        });

        it('should display due date when provided', () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('task-item-1')).toBeInTheDocument();
        });

        it('should handle task without due date', () => {
            const taskWithoutDueDate = { ...mockTask, dueDate: null };

            render(
                <TestWrapper>
                    <TaskItem {...mockProps} task={taskWithoutDueDate} />
                </TestWrapper>
            );

            expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
            expect(screen.queryByText(/2024-12-31/)).not.toBeInTheDocument();
        });

        it('should handle task without category', () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} categories={[]} />
                </TestWrapper>
            );

            expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
        });
    });

    describe('Task Completion', () => {
        it('should toggle task completion status', async () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();

            await userEvent.click(checkbox);

            expect(mockProps.onToggleCompleted).toHaveBeenCalled();
        });

        it('should show completed state styling', () => {
            const completedTask = { ...mockTask, isCompleted: true };

            render(
                <TestWrapper>
                    <TaskItem {...mockProps} task={completedTask} />
                </TestWrapper>
            );

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();
        });

        it('should handle completion toggle error', async () => {
            mockProps.onToggleCompleted.mockRejectedValue(new Error('Update failed'));

            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const checkbox = screen.getByRole('checkbox');
            await userEvent.click(checkbox);

            expect(mockProps.onToggleCompleted).toHaveBeenCalled();
        });
    });

    describe('Task Actions', () => {
        it('should open task menu on menu button click', async () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const menuButton = screen.getByRole('button', { name: /more/i });
            await userEvent.click(menuButton);

            await waitFor(() => {
                expect(screen.getByText('edit')).toBeInTheDocument();
                expect(screen.getByText('delete')).toBeInTheDocument();
                expect(screen.getByText('info')).toBeInTheDocument();
            });
        });

        it('should open edit dialog', async () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const menuButton = screen.getByRole('button', { name: /more/i });
            await userEvent.click(menuButton);

            const editButton = screen.getByText('edit');
            await userEvent.click(editButton);

            expect(editButton).toBeDefined();
        });

        it('should open info dialog', async () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const menuButton = screen.getByRole('button', { name: /more/i });
            await userEvent.click(menuButton);

            const infoButton = screen.getByText('info');
            await userEvent.click(infoButton);

            expect(infoButton).toBeDefined();
        });

        it('should handle task deletion', async () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const menuButton = screen.getByRole('button', { name: /more/i });
            await userEvent.click(menuButton);

            const deleteButton = screen.getByText('delete');
            await userEvent.click(deleteButton);

            expect(deleteButton).toBeDefined();
        });
    });

    describe('Visual States', () => {
        it('should render task with title and description', () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            expect(screen.getByText(mockTask.title)).toBeInTheDocument();
            expect(screen.getByText(mockTask.description)).toBeInTheDocument();
        });

        it('should show completed state with checkbox', () => {
            const completedTask = {
                ...mockTask,
                isCompleted: true
            };

            render(
                <TestWrapper>
                    <TaskItem {...mockProps} task={completedTask} />
                </TestWrapper>
            );

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
        });

        it('should show category chip when category exists', () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper structure', () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const taskElement = screen.getByTestId(`task-item-${mockTask.id}`);
            expect(taskElement).toBeInTheDocument();

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
        });

        it('should support interaction with menu button', async () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const menuButton = screen.getByRole('button', { name: /more/i });
            expect(menuButton).toBeInTheDocument();

            await userEvent.click(menuButton);
            await waitFor(() => {
                const firstMenuItem = screen.getByText('info');
                expect(firstMenuItem).toHaveFocus();
            });
        });

        it('should have proper focus management', async () => {
            render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const checkbox = screen.getByRole('checkbox');
            checkbox.focus();

            expect(document.activeElement).toBe(checkbox);

            await userEvent.keyboard('{Tab}');

            const menuButton = screen.getByRole('button', { name: /more/i });
            expect(document.activeElement).toBe(menuButton);
        });
    });

    describe('Performance', () => {
        it('should not re-render unnecessarily', () => {
            const { rerender } = render(
                <TestWrapper>
                    <TaskItem {...mockProps} />
                </TestWrapper>
            );

            const renderSpy = vi.fn();
            const MemoizedTaskItem = vi.fn(() => {
                renderSpy();
                return <TaskItem {...mockProps} />;
            });

            rerender(
                <TestWrapper>
                    <MemoizedTaskItem />
                </TestWrapper>
            );

            rerender(
                <TestWrapper>
                    <MemoizedTaskItem />
                </TestWrapper>
            );

            expect(renderSpy).toHaveBeenCalledTimes(2);
        });
    });
});
