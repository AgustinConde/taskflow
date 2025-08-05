import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTaskManagement } from '../useTaskManagement';
import type { ReactNode } from 'react';
import type { Task } from '../../../../types/Task';

const mockGetTasks = vi.fn();
const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock('../../../../services/taskService', () => ({
    taskService: {
        getTasks: () => mockGetTasks(),
        createTask: (...args: any[]) => mockCreateTask(...args),
        updateTask: (...args: any[]) => mockUpdateTask(...args),
        deleteTask: (...args: any[]) => mockDeleteTask(...args)
    }
}));

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

const mockTasks: Task[] = [
    {
        id: 1,
        title: 'Test Task 1',
        description: 'Description 1',
        isCompleted: false,
        dueDate: '2024-12-31T23:59:59.000Z',
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 2,
        title: 'Test Task 2',
        description: 'Description 2',
        isCompleted: true,
        dueDate: null,
        categoryId: 2,
        createdAt: '2024-01-01T00:00:00.000Z'
    }
];

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, refetchOnWindowFocus: false },
            mutations: { retry: false }
        }
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useTaskManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockGetTasks.mockResolvedValue(mockTasks);
        mockCreateTask.mockResolvedValue(mockTasks[0]);
        mockUpdateTask.mockResolvedValue(mockTasks[0]);
        mockDeleteTask.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State and Data Fetching', () => {
        it('should initialize with default state', () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            expect(result.current.tasks).toEqual([]);
            expect(result.current.loading).toBe(true);
            expect(result.current.creating).toBe(false);
            expect(result.current.deleteId).toBe(null);
            expect(result.current.deleteLoading).toBe(false);
        });

        it('should fetch tasks on mount', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockGetTasks).toHaveBeenCalledTimes(1);
            expect(result.current.tasks).toEqual(mockTasks);
        });

        it('should handle fetch tasks error', async () => {
            const errorMessage = 'Network error';
            mockGetTasks.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockShowError).toHaveBeenCalledWith(errorMessage);
            expect(result.current.tasks).toEqual([]);
        });

        it('should handle fetch tasks error without message', async () => {
            mockGetTasks.mockRejectedValueOnce(new Error());

            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockShowError).toHaveBeenCalledWith('Failed to fetch tasks');
        });
    });

    describe('Task Creation', () => {
        it('should create task successfully', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const taskData = {
                title: 'New Task',
                description: 'New Description',
                dueDate: '2024-12-31T23:59',
                categoryId: 1
            };

            let success: boolean;
            await act(async () => {
                success = await result.current.createTask(taskData);
            });

            expect(success!).toBe(true);
            expect(result.current.creating).toBe(false);
            expect(mockCreateTask).toHaveBeenCalledWith({
                title: 'New Task',
                description: 'New Description',
                isCompleted: false,
                dueDate: new Date('2024-12-31T23:59').toISOString(),
                categoryId: 1
            });
            expect(mockShowSuccess).toHaveBeenCalledWith('taskCreated');
        });

        it('should create task with null dueDate', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const taskData = {
                title: 'New Task',
                description: 'New Description',
                dueDate: null,
                categoryId: null
            };

            await act(async () => {
                await result.current.createTask(taskData);
            });

            expect(mockCreateTask).toHaveBeenCalledWith({
                title: 'New Task',
                description: 'New Description',
                isCompleted: false,
                dueDate: null,
                categoryId: null
            });
        });

        it('should handle create task error', async () => {
            const errorMessage = 'Creation failed';
            mockCreateTask.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const taskData = {
                title: 'New Task',
                description: 'New Description',
                dueDate: null,
                categoryId: 1
            };

            let success: boolean;
            await act(async () => {
                success = await result.current.createTask(taskData);
            });

            expect(success!).toBe(false);
            expect(mockShowError).toHaveBeenCalledWith(errorMessage);
        });

        it('should handle create task error without message', async () => {
            mockCreateTask.mockRejectedValueOnce(new Error());

            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const taskData = {
                title: 'New Task',
                description: 'New Description',
                dueDate: null,
                categoryId: 1
            };

            await act(async () => {
                await result.current.createTask(taskData);
            });

            expect(mockShowError).toHaveBeenCalledWith('errorCreatingTask');
        });

        it('should track creating state during task creation', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const taskData = {
                title: 'New Task',
                description: 'New Description',
                dueDate: null,
                categoryId: 1
            };

            expect(result.current.creating).toBe(false);

            act(() => {
                result.current.createTask(taskData);
            });

            expect(result.current.creating).toBe(true);

            await waitFor(() => {
                expect(result.current.creating).toBe(false);
            });
        });
    });

    describe('Task Updates', () => {
        it('should update task successfully', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current).not.toBeNull();
                expect(result.current.loading).toBe(false);
            });

            const updatedTask = { ...mockTasks[0], title: 'Updated Task' };

            let success: boolean;
            await act(async () => {
                success = await result.current.updateTask(updatedTask);
            });

            expect(success!).toBe(true);
            expect(mockUpdateTask).toHaveBeenCalledWith(1, updatedTask);
            expect(mockShowSuccess).toHaveBeenCalledWith('taskUpdated');
        });

        it('should handle update task error', async () => {
            const errorMessage = 'Update failed';
            mockUpdateTask.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const updatedTask = { ...mockTasks[0], title: 'Updated Task' };

            let success: boolean;
            await act(async () => {
                success = await result.current.updateTask(updatedTask);
            });

            expect(success!).toBe(false);
            expect(mockShowError).toHaveBeenCalledWith(errorMessage);
        });
    });

    describe('Toggle Task Completion', () => {
        it('should toggle task completion successfully', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const taskToToggle = mockTasks[0];

            await act(async () => {
                await result.current.toggleTaskCompleted(taskToToggle);
            });

            expect(mockUpdateTask).toHaveBeenCalledWith(1, {
                ...taskToToggle,
                isCompleted: true
            });

            expect(result.current.tasks.find(t => t.id === 1)?.isCompleted).toBe(true);
        });

        it('should revert optimistic update on error', async () => {
            const errorMessage = 'Toggle failed';
            mockUpdateTask.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const taskToToggle = mockTasks[0];
            const originalCompletedState = taskToToggle.isCompleted;

            await act(async () => {
                await result.current.toggleTaskCompleted(taskToToggle);
            });

            expect(mockShowError).toHaveBeenCalledWith(errorMessage);
            expect(result.current.tasks.find(t => t.id === 1)?.isCompleted).toBe(originalCompletedState);
        });
    });

    describe('Task Deletion', () => {
        it('should request delete task', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            act(() => {
                result.current.requestDeleteTask(1);
            });

            expect(result.current.deleteId).toBe(1);
        });

        it('should cancel delete task', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            act(() => {
                result.current.requestDeleteTask(1);
            });

            expect(result.current.deleteId).toBe(1);

            act(() => {
                result.current.cancelDeleteTask();
            });

            expect(result.current.deleteId).toBe(null);
        });

        it('should confirm delete task successfully', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            act(() => {
                result.current.requestDeleteTask(1);
            });

            let success: boolean;
            await act(async () => {
                success = await result.current.confirmDeleteTask();
            });

            expect(success!).toBe(true);
            expect(mockDeleteTask).toHaveBeenCalledWith(1);
            expect(result.current.deleteId).toBe(null);
            expect(mockShowSuccess).toHaveBeenCalledWith('taskDeleted');
        });

        it('should handle delete task error', async () => {
            const errorMessage = 'Delete failed';
            mockDeleteTask.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            act(() => {
                result.current.requestDeleteTask(1);
            });

            let success: boolean;
            await act(async () => {
                success = await result.current.confirmDeleteTask();
            });

            expect(success!).toBe(false);
            expect(mockShowError).toHaveBeenCalledWith(errorMessage);
        });

        it('should handle confirm delete without deleteId', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            let success: boolean;
            await act(async () => {
                success = await result.current.confirmDeleteTask();
            });

            expect(success!).toBe(false);
            expect(mockDeleteTask).not.toHaveBeenCalled();
        });

        it('should track delete loading state', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            act(() => {
                result.current.requestDeleteTask(1);
            });

            expect(result.current.deleteLoading).toBe(false);

            act(() => {
                result.current.confirmDeleteTask();
            });

            expect(result.current.deleteLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.deleteLoading).toBe(false);
            });
        });
    });

    describe('Fetch Tasks', () => {
        it('should allow manual fetch of tasks', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current).not.toBeNull();
                expect(result.current.loading).toBe(false);
            });

            vi.clearAllMocks();

            let fetchedTasks: Task[];
            await act(async () => {
                fetchedTasks = await result.current.fetchTasks();
            });

            expect(mockGetTasks).toHaveBeenCalledTimes(1);
            expect(fetchedTasks!).toEqual(mockTasks);
        });

        it('should return empty array on fetch error', async () => {
            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current).not.toBeNull();
                expect(result.current.loading).toBe(false);
            });

            vi.clearAllMocks();
            mockGetTasks.mockRejectedValueOnce(new Error('Fetch failed'));

            let fetchedTasks: Task[];
            await act(async () => {
                fetchedTasks = await result.current.fetchTasks();
            });

            expect(fetchedTasks!).toEqual([]);
        });
    });

    describe('Error Handling', () => {
        it('should handle errors without message gracefully', async () => {
            const errorWithoutMessage = {} as Error;
            mockUpdateTask.mockRejectedValueOnce(errorWithoutMessage);

            const { result } = renderHook(() => useTaskManagement(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current).not.toBeNull();
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.updateTask(mockTasks[0]);
            });

            expect(mockShowError).toHaveBeenCalledWith('errorUpdatingTask');
        });
    });
});
