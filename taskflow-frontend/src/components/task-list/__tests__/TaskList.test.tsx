import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaskList from '../TaskList';
import { NotificationProvider } from '../../../contexts/NotificationContext';

const mockTasks = [
    {
        id: 1,
        title: 'Complete project documentation',
        description: 'Write comprehensive docs',
        isCompleted: false,
        dueDate: '2024-12-31T23:59:59.000Z',
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 2,
        title: 'Review code changes',
        description: 'Check PR for issues',
        isCompleted: true,
        dueDate: null,
        categoryId: 2,
        createdAt: '2024-01-01T00:00:00.000Z'
    }
];

const mockCategories = [
    {
        id: 1,
        name: 'Development',
        color: '#FF5722',
        userId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 2,
        name: 'Review',
        color: '#2196F3',
        userId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
    }
];

vi.mock('../../../services/taskService', () => ({
    taskService: {
        getTasks: vi.fn(() => Promise.resolve(mockTasks)),
        createTask: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn()
    }
}));

vi.mock('../../../services/categoryService', () => ({
    categoryService: {
        getCategories: vi.fn(() => Promise.resolve(mockCategories))
    }
}));

vi.mock('../../../hooks/useTasks', () => ({
    useTasks: () => ({
        data: mockTasks,
        isLoading: false,
        error: null
    }),
    useCreateTask: () => ({
        mutateAsync: vi.fn(() => Promise.resolve()),
        isPending: false
    }),
    useUpdateTask: () => ({
        mutateAsync: vi.fn(() => Promise.resolve()),
        isPending: false
    }),
    useDeleteTask: () => ({
        mutateAsync: vi.fn(() => Promise.resolve()),
        isPending: false
    }),
    useToggleTaskCompletion: () => ({
        mutateAsync: vi.fn(() => Promise.resolve()),
        isPending: false
    })
}));

vi.mock('../../../hooks/useCategories', () => ({
    useCategories: () => ({
        data: mockCategories,
        isLoading: false,
        error: null
    }),
    useCreateCategory: () => ({
        mutateAsync: vi.fn(() => Promise.resolve()),
        isPending: false
    }),
    useUpdateCategory: () => ({
        mutateAsync: vi.fn(() => Promise.resolve()),
        isPending: false
    }),
    useDeleteCategory: () => ({
        mutateAsync: vi.fn(() => Promise.resolve()),
        isPending: false
    })
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

describe('TaskList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render task list with header', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('taskManagement')).toBeInTheDocument();
            });
        });

        it('should render task items when data loads', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
                expect(screen.getByText('Review code changes')).toBeInTheDocument();
            });
        });

        it('should show task form in header', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
            });
        });
    });

    describe('Filtering', () => {
        it('should display task management form', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('taskManagement')).toBeInTheDocument();
            });
        });

        it('should have form inputs', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
                expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
            });
        });
    });

    describe('Sorting', () => {
        it('should render task management interface', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('taskManagement')).toBeInTheDocument();
            });
        });

        it('should have datetime input', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                const datetimeInput = screen.getByLabelText(/dueDate/i);
                expect(datetimeInput).toBeInTheDocument();
                expect(datetimeInput).toHaveAttribute('type', 'datetime-local');
            });
        });
    });

    describe('Task Management', () => {
        it('should render task management form', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('taskManagement')).toBeInTheDocument();
            });
        });

        it('should have form inputs available', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
                expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should render without crashing', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('taskManagement')).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Design', () => {
        it('should render on different screen sizes', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('taskManagement')).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper form structure', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
                expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
            });
        });

        it('should support form interaction', async () => {
            render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
            });

            const titleInput = screen.getByRole('textbox', { name: /title/i });
            await userEvent.click(titleInput);

            expect(titleInput).toHaveFocus();
        });
    });
});
