import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks, useTask, useCreateTask, useUpdateTask, useDeleteTask, useToggleTaskCompletion } from '../useTasks';
import { taskService } from '../../services/taskService';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { AuthProvider } from '../../contexts/AuthContext';
import type { Task } from '../../types/Task';

vi.mock('../../services/taskService', () => ({
    taskService: { getTasks: vi.fn(), getTask: vi.fn(), createTask: vi.fn(), updateTask: vi.fn(), deleteTask: vi.fn() }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('../../contexts/AuthContext', async () => {
    const actual = await vi.importActual<typeof import('../../contexts/AuthContext')>('../../contexts/AuthContext');
    return {
        ...actual,
        useAuth: () => ({ isAuthenticated: true })
    };
});

describe('useTasks hooks', () => {
    let queryClient: QueryClient;
    const mockTask: Task = { id: 1, title: 'Task 1', description: 'Desc 1', isCompleted: false, createdAt: '2024-01-01T00:00:00Z', categoryId: 1 };
    const mockTasks = [mockTask, { ...mockTask, id: 2, title: 'Task 2' }];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <NotificationProvider>{children}</NotificationProvider>
            </AuthProvider>
        </QueryClientProvider>
    );

    beforeEach(() => {
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        vi.clearAllTimers();
    });

    describe('Queries and Mutations', () => {
        it('fetches all tasks and a single task', async () => {
            vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks);
            vi.mocked(taskService.getTask).mockResolvedValue(mockTask);
            const { result: listResult } = renderHook(() => useTasks(), { wrapper });
            const { result: singleResult } = renderHook(() => useTask(1), { wrapper });
            await waitFor(() => {
                expect(listResult.current.isSuccess).toBe(true);
                expect(singleResult.current.isSuccess).toBe(true);
            });
            expect(listResult.current.data).toEqual(mockTasks);
            expect(singleResult.current.data).toEqual(mockTask);
        });
        it('creates, updates, deletes and toggles a task', async () => {
            const newTask = { title: 'New Task', description: 'New Desc', isCompleted: false, categoryId: 1 };
            const createdTask = { ...newTask, id: 3, createdAt: '2024-01-01T00:00:00Z' };
            const updatedTask = { ...mockTask, title: 'Updated' };
            vi.mocked(taskService.createTask).mockResolvedValue(createdTask);
            vi.mocked(taskService.updateTask).mockResolvedValue(updatedTask);
            vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);
            const { result: createResult } = renderHook(() => useCreateTask(), { wrapper });
            const { result: updateResult } = renderHook(() => useUpdateTask(), { wrapper });
            const { result: deleteResult } = renderHook(() => useDeleteTask(), { wrapper });
            const { result: toggleResult } = renderHook(() => useToggleTaskCompletion(), { wrapper });
            createResult.current.mutate(newTask);
            updateResult.current.mutate(updatedTask);
            deleteResult.current.mutate(1);
            toggleResult.current.mutate(mockTask);
            await waitFor(() => {
                expect(createResult.current.isSuccess).toBe(true);
                expect(updateResult.current.isSuccess).toBe(true);
                expect(deleteResult.current.isSuccess).toBe(true);
                expect(toggleResult.current.isSuccess).toBe(true);
            });
        });
    });

    describe('Error Handling', () => {
        it('handles errors for all operations', async () => {
            const error = new Error('Operation failed');
            vi.mocked(taskService.getTasks).mockRejectedValue(error);
            vi.mocked(taskService.createTask).mockRejectedValue(error);
            vi.mocked(taskService.updateTask).mockRejectedValue(error);
            vi.mocked(taskService.deleteTask).mockRejectedValue(error);
            const { result: fetchResult } = renderHook(() => useTasks(), { wrapper });
            const { result: createResult } = renderHook(() => useCreateTask(), { wrapper });
            const { result: updateResult } = renderHook(() => useUpdateTask(), { wrapper });
            const { result: deleteResult } = renderHook(() => useDeleteTask(), { wrapper });
            createResult.current.mutate({ title: 'New', description: '', isCompleted: false, categoryId: 1 });
            updateResult.current.mutate(mockTask);
            deleteResult.current.mutate(1);
            await waitFor(() => {
                expect(fetchResult.current.isError).toBe(true);
                expect(createResult.current.isError).toBe(true);
                expect(updateResult.current.isError).toBe(true);
                expect(deleteResult.current.isError).toBe(true);
            });
        });
    });

    describe('Edge Cases and Branch Coverage', () => {
        it('should handle delete when no tasks', async () => {
            vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);
            const { result } = renderHook(() => useDeleteTask(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], undefined);
            result.current.mutate(1);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([]);
        });

        it('should handle delete when empty array', async () => {
            vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);
            const { result } = renderHook(() => useDeleteTask(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], []);
            result.current.mutate(1);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([]);
        });

        it('should handle toggle when no tasks', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, id: 1, isCompleted: true });
            const { result } = renderHook(() => useToggleTaskCompletion(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], undefined);
            result.current.mutate(mockTask);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([]);
        });

        it('should handle toggle when empty array', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, id: 1, isCompleted: true });
            const { result } = renderHook(() => useToggleTaskCompletion(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], []);
            result.current.mutate(mockTask);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([]);
        });

        it('should delete task if id exists', async () => {
            vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);
            const { result } = renderHook(() => useDeleteTask(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], [mockTask, { ...mockTask, id: 2 }]);
            result.current.mutate(1);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([{ ...mockTask, id: 2 }]);
        });

        it('should not delete if id does not exist', async () => {
            vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);
            const { result } = renderHook(() => useDeleteTask(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], [mockTask, { ...mockTask, id: 2 }]);
            result.current.mutate(999);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([mockTask, { ...mockTask, id: 2 }]);
        });

        it('should toggle isCompleted if id exists', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, id: 1, isCompleted: true });
            const { result } = renderHook(() => useToggleTaskCompletion(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], [mockTask, { ...mockTask, id: 2 }]);
            result.current.mutate(mockTask);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([{ ...mockTask, id: 1, isCompleted: true }, { ...mockTask, id: 2 }]);
        });

        it('should not toggle if id does not exist', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, id: 999, isCompleted: true });
            const { result } = renderHook(() => useToggleTaskCompletion(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], [mockTask, { ...mockTask, id: 2 }]);
            result.current.mutate({ ...mockTask, id: 999 });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([mockTask, { ...mockTask, id: 2 }]);
        });

        it('should update only matching id', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, id: 1, title: 'Updated' });
            const { result } = renderHook(() => useUpdateTask(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], [mockTask, { ...mockTask, id: 2 }]);
            result.current.mutate({ ...mockTask, id: 1, title: 'Updated' });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([{ ...mockTask, id: 1, title: 'Updated' }, { ...mockTask, id: 2 }]);
        });

        it('should not update if id does not match', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, id: 3, title: 'Updated' });
            const { result } = renderHook(() => useUpdateTask(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], [mockTask, { ...mockTask, id: 2 }]);
            result.current.mutate({ ...mockTask, id: 3, title: 'Updated' });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([mockTask, { ...mockTask, id: 2 }]);
        });

        it('should restore previousTasks on update error', async () => {
            vi.mocked(taskService.updateTask).mockRejectedValue(new Error('fail'));
            const { result } = renderHook(() => useUpdateTask(), { wrapper });
            const previousTasks = [{ ...mockTask, id: 99 }];
            queryClient.setQueryData(['tasks', 'list'], previousTasks);
            result.current.mutate({ ...mockTask, id: 1, title: 'Updated' });
            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(queryClient.getQueryData(['tasks', 'list'])).toEqual(previousTasks);
        });

        it('should toggle only matching id', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, id: 1, isCompleted: true });
            const { result } = renderHook(() => useToggleTaskCompletion(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], [mockTask, { ...mockTask, id: 2 }]);
            result.current.mutate(mockTask);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([{ ...mockTask, id: 1, isCompleted: true }, { ...mockTask, id: 2 }]);
        });

        it('should not toggle if id does not match', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, id: 3, isCompleted: true });
            const { result } = renderHook(() => useToggleTaskCompletion(), { wrapper });
            queryClient.setQueryData(['tasks', 'list'], [mockTask, { ...mockTask, id: 2 }]);
            result.current.mutate({ ...mockTask, id: 3 });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const updated = queryClient.getQueryData(['tasks', 'list']);
            expect(updated).toEqual([mockTask, { ...mockTask, id: 2 }]);
        });

        it('should restore previousTasks on toggle error', async () => {
            vi.mocked(taskService.updateTask).mockRejectedValue(new Error('fail'));
            const { result } = renderHook(() => useToggleTaskCompletion(), { wrapper });
            const previousTasks = [{ ...mockTask, id: 99 }];
            queryClient.setQueryData(['tasks', 'list'], previousTasks);
            result.current.mutate(mockTask);
            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(queryClient.getQueryData(['tasks', 'list'])).toEqual(previousTasks);
        });

        it('should handle edge cases and state management', async () => {
            vi.mocked(taskService.getTasks).mockResolvedValue([]);
            vi.mocked(taskService.createTask).mockResolvedValue(mockTask);

            const { result: createResult } = renderHook(() => useCreateTask(), { wrapper });
            const { result: disabledResult } = renderHook(() => useTask(0), { wrapper });

            expect(createResult.current.isPending).toBe(false);
            expect(createResult.current.isSuccess).toBe(false);
            expect(disabledResult.current.isFetching).toBe(false);

            createResult.current.mutate({ title: 'New', description: '', isCompleted: false, categoryId: 1 });

            await waitFor(() => expect(createResult.current.isSuccess).toBe(true));
        });

        it('should handle concurrent operations', async () => {
            vi.mocked(taskService.createTask).mockResolvedValue(mockTask);
            vi.mocked(taskService.updateTask).mockResolvedValue(mockTask);

            const { result: createResult } = renderHook(() => useCreateTask(), { wrapper });
            const { result: updateResult } = renderHook(() => useUpdateTask(), { wrapper });

            createResult.current.mutate({ title: 'New', description: '', isCompleted: false, categoryId: 1 });
            updateResult.current.mutate(mockTask);

            await waitFor(() => {
                expect(createResult.current.isSuccess).toBe(true);
                expect(updateResult.current.isSuccess).toBe(true);
            });
        });
    });
});
