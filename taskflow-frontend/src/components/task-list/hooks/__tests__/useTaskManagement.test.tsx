import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTaskManagement } from '../useTaskManagement';
import type { ReactNode } from 'react';
import type { Task } from '../../../../types/Task';

vi.mock('../../../../services/taskService', () => ({
    taskService: {
        getTasks: vi.fn(),
        createTask: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn()
    }
}));

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock('../../../../contexts/NotificationContext', () => ({
    useNotifications: () => ({
        showSuccess: mockShowSuccess,
        showError: mockShowError
    })
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

import { taskService } from '../../../../services/taskService';

const mockTaskService = vi.mocked(taskService);

describe('useTaskManagement', () => {
    const setupMocks = () => {
        const mockTasks: Task[] = [
            {
                id: 1,
                title: 'Test Task 1',
                description: 'Description 1',
                isCompleted: false,
                dueDate: '2024-12-31T23:59:59Z',
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 2,
                title: 'Test Task 2',
                description: 'Description 2',
                isCompleted: true,
                dueDate: null,
                categoryId: 2,
                createdAt: '2024-01-01T00:00:00Z'
            }
        ];

        const mockGetTasks = vi.mocked(mockTaskService.getTasks);
        const mockCreateTask = vi.mocked(mockTaskService.createTask);
        const mockUpdateTask = vi.mocked(mockTaskService.updateTask);
        const mockDeleteTask = vi.mocked(mockTaskService.deleteTask);


        mockGetTasks.mockResolvedValue(mockTasks);
        mockCreateTask.mockResolvedValue(mockTasks[0]);
        mockUpdateTask.mockResolvedValue(mockTasks[0]);
        mockDeleteTask.mockResolvedValue(undefined);
        mockT.mockReturnValue('mocked-translation');

        return {
            mockTasks,
            mockGetTasks,
            mockCreateTask,
            mockUpdateTask,
            mockDeleteTask
        };
    };

    const renderUseTaskManagement = () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        });

        const wrapper = ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        return renderHook(() => useTaskManagement(), { wrapper });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockShowSuccess.mockClear();
        mockShowError.mockClear();
        mockT.mockReturnValue('mocked-translation');
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        vi.clearAllTimers();
    });

    describe('Core State Management', () => {
        it('should initialize with default state', () => {
            setupMocks();
            const { result } = renderUseTaskManagement();

            expect(result.current.tasks).toEqual([]);
            expect(result.current.loading).toBe(true);
            expect(result.current.creating).toBe(false);
            expect(result.current.deleteId).toBeNull();
            expect(result.current.deleteLoading).toBe(false);
        });

        it('should fetch tasks on mount', async () => {
            const { mockTasks, mockGetTasks } = setupMocks();
            const { result } = renderUseTaskManagement();

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockGetTasks).toHaveBeenCalled();
            expect(result.current.tasks).toEqual(mockTasks);
        });

        it('should handle fetch tasks error', async () => {
            const { mockGetTasks } = setupMocks();
            mockGetTasks.mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderUseTaskManagement();

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockShowError).toHaveBeenCalledWith('Network error');
            expect(result.current.tasks).toEqual([]);
        });
    });

    describe('Task Operations', () => {
        it('should create task successfully', async () => {
            const { mockCreateTask } = setupMocks();
            const newTask = {
                id: 3,
                title: 'New Task',
                description: 'New Description',
                isCompleted: false,
                dueDate: null,
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            };
            mockCreateTask.mockResolvedValueOnce(newTask);

            const { result } = renderUseTaskManagement();

            await act(async () => {
                await result.current.createTask({
                    title: 'New Task',
                    description: 'New Description',
                    dueDate: null,
                    categoryId: 1
                });
            });

            expect(mockCreateTask).toHaveBeenCalled();
            expect(mockShowSuccess).toHaveBeenCalled();
            expect(result.current.creating).toBe(false);
        });

        it('should handle task creation error', async () => {
            const { mockCreateTask } = setupMocks();
            mockCreateTask.mockRejectedValueOnce(new Error('Create failed'));

            const { result } = renderUseTaskManagement();

            await act(async () => {
                await result.current.createTask({
                    title: 'New Task',
                    description: 'New Description',
                    dueDate: null,
                    categoryId: 1
                });
            });

            expect(mockShowError).toHaveBeenCalledWith('Create failed');
            expect(result.current.creating).toBe(false);
        });

        it('should update task successfully', async () => {
            const { mockUpdateTask } = setupMocks();
            const updatedTask = {
                id: 1,
                title: 'Updated Task',
                description: 'Updated',
                isCompleted: true,
                dueDate: null,
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            };
            mockUpdateTask.mockResolvedValueOnce(updatedTask);

            const { result } = renderUseTaskManagement();

            await act(async () => {
                await result.current.updateTask({
                    id: 1,
                    title: 'Updated Task',
                    description: 'Updated',
                    isCompleted: true,
                    dueDate: null,
                    categoryId: 1,
                    createdAt: '2024-01-01T00:00:00Z'
                });
            });

            expect(mockUpdateTask).toHaveBeenCalled();
            expect(mockShowSuccess).toHaveBeenCalled();
        });

        it('should toggle task completion', async () => {
            const { mockUpdateTask } = setupMocks();
            const task = {
                id: 1,
                title: 'Test',
                description: 'Test',
                isCompleted: false,
                dueDate: null,
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            };
            mockUpdateTask.mockResolvedValueOnce({ ...task, isCompleted: true });

            const { result } = renderUseTaskManagement();

            await act(async () => {
                await result.current.toggleTaskCompleted(task);
            });

            expect(mockUpdateTask).toHaveBeenCalledWith(1, { ...task, isCompleted: true });
        });

        it('should delete task successfully', async () => {
            const { mockDeleteTask } = setupMocks();
            mockDeleteTask.mockResolvedValueOnce(undefined);

            const { result } = renderUseTaskManagement();

            act(() => {
                result.current.requestDeleteTask(1);
            });

            expect(result.current.deleteId).toBe(1);

            await act(async () => {
                await result.current.confirmDeleteTask();
            });

            expect(mockDeleteTask).toHaveBeenCalledWith(1);
            expect(mockShowSuccess).toHaveBeenCalled();
            expect(result.current.deleteId).toBeNull();
        });
    });

    describe('Edge Cases & Error Handling', () => {
        it('should handle empty tasks gracefully', async () => {
            const { mockGetTasks } = setupMocks();
            mockGetTasks.mockResolvedValueOnce([]);

            const { result } = renderUseTaskManagement();

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.tasks).toEqual([]);
        });

        it('should cancel delete operation', () => {
            setupMocks();
            const { result } = renderUseTaskManagement();

            act(() => {
                result.current.requestDeleteTask(1);
            });

            expect(result.current.deleteId).toBe(1);

            act(() => {
                result.current.cancelDeleteTask();
            });

            expect(result.current.deleteId).toBeNull();
        });

        it('should handle delete task error', async () => {
            const { mockDeleteTask } = setupMocks();
            mockDeleteTask.mockRejectedValueOnce(new Error('Delete failed'));

            const { result } = renderUseTaskManagement();

            act(() => {
                result.current.requestDeleteTask(1);
            });

            await act(async () => {
                await result.current.confirmDeleteTask();
            });

            expect(mockShowError).toHaveBeenCalledWith('Delete failed');
            expect(result.current.deleteLoading).toBe(false);
        });

        it('should handle update task error with optimistic rollback', async () => {
            const { mockUpdateTask } = setupMocks();
            mockUpdateTask.mockRejectedValueOnce(new Error('Update failed'));

            const { result } = renderUseTaskManagement();
            const task = {
                id: 1,
                title: 'Test',
                description: 'Test',
                isCompleted: false,
                dueDate: null,
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            };

            await act(async () => {
                await result.current.toggleTaskCompleted(task);
            });

            expect(mockShowError).toHaveBeenCalledWith('Update failed');
        });

        it('should provide fetchTasks function for manual refresh', async () => {
            const { mockGetTasks } = setupMocks();
            const { result } = renderUseTaskManagement();

            expect(typeof result.current.fetchTasks).toBe('function');

            await act(async () => {
                await result.current.fetchTasks();
            });

            expect(mockGetTasks).toHaveBeenCalled();
        });

        it('should handle task creation with empty dueDate string', async () => {
            const { mockCreateTask, mockTasks } = setupMocks();
            mockCreateTask.mockResolvedValueOnce(mockTasks[0]);

            const { result } = renderUseTaskManagement();

            await act(async () => {
                const success = await result.current.createTask({
                    title: 'Test',
                    description: 'Test',
                    dueDate: '',
                    categoryId: 1
                });
                expect(success).toBe(true);
            });

            expect(mockCreateTask).toHaveBeenCalledWith({
                title: 'Test',
                description: 'Test',
                isCompleted: false,
                dueDate: null,
                categoryId: 1
            });
        });

        it('should handle confirmDeleteTask when deleteId is null', async () => {
            const { result } = renderUseTaskManagement();

            const success = await result.current.confirmDeleteTask();
            expect(success).toBe(false);
        });

        it('should handle console error in fetchTasks', async () => {
            const { mockGetTasks } = setupMocks();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockGetTasks.mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderUseTaskManagement();

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(consoleSpy).toHaveBeenCalledWith('Error fetching tasks:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});
