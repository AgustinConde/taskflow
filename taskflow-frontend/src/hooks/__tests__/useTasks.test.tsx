import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks, useTask, useCreateTask, useUpdateTask, useDeleteTask, useToggleTaskCompletion } from '../useTasks';
import { taskService } from '../../services/taskService';
import { NotificationProvider } from '../../contexts/NotificationContext';
import type { Task } from '../../types/Task';

vi.mock('../../services/taskService', () => ({
    taskService: { getTasks: vi.fn(), getTask: vi.fn(), createTask: vi.fn(), updateTask: vi.fn(), deleteTask: vi.fn() }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

describe('useTasks Hooks', () => {
    let queryClient: QueryClient;
    const mockTask: Task = { id: 1, title: 'Task 1', description: 'Desc 1', isCompleted: false, createdAt: '2024-01-01T00:00:00Z', categoryId: 1 };
    const mockTasks = [mockTask, { ...mockTask, id: 2, title: 'Task 2' }];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>{children}</NotificationProvider>
        </QueryClientProvider>
    );

    beforeEach(() => {
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should fetch tasks and single task', async () => {
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

        it('should handle CRUD operations', async () => {
            const newTask = { title: 'New Task', description: 'New Desc', isCompleted: false, createdAt: '2024-01-01T00:00:00Z', categoryId: 1 };
            const createdTask = { ...newTask, id: 3 };
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
        it('should handle all operation errors', async () => {
            const error = new Error('Operation failed');
            vi.mocked(taskService.getTasks).mockRejectedValue(error);
            vi.mocked(taskService.createTask).mockRejectedValue(error);
            vi.mocked(taskService.updateTask).mockRejectedValue(error);
            vi.mocked(taskService.deleteTask).mockRejectedValue(error);

            const { result: fetchResult } = renderHook(() => useTasks(), { wrapper });
            const { result: createResult } = renderHook(() => useCreateTask(), { wrapper });
            const { result: updateResult } = renderHook(() => useUpdateTask(), { wrapper });
            const { result: deleteResult } = renderHook(() => useDeleteTask(), { wrapper });

            createResult.current.mutate({ title: 'New', description: '', isCompleted: false, createdAt: '', categoryId: 1 });
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

    describe('Edge Cases', () => {
        it('should handle edge cases and state management', async () => {
            vi.mocked(taskService.getTasks).mockResolvedValue([]);
            vi.mocked(taskService.createTask).mockResolvedValue(mockTask);

            const { result: createResult } = renderHook(() => useCreateTask(), { wrapper });
            const { result: disabledResult } = renderHook(() => useTask(0), { wrapper });

            expect(createResult.current.isPending).toBe(false);
            expect(createResult.current.isSuccess).toBe(false);
            expect(disabledResult.current.isFetching).toBe(false);

            createResult.current.mutate({ title: 'New', description: '', isCompleted: false, createdAt: '', categoryId: 1 });

            await waitFor(() => expect(createResult.current.isSuccess).toBe(true));
        });

        it('should handle concurrent operations', async () => {
            vi.mocked(taskService.createTask).mockResolvedValue(mockTask);
            vi.mocked(taskService.updateTask).mockResolvedValue(mockTask);

            const { result: createResult } = renderHook(() => useCreateTask(), { wrapper });
            const { result: updateResult } = renderHook(() => useUpdateTask(), { wrapper });

            createResult.current.mutate({ title: 'New', description: '', isCompleted: false, createdAt: '', categoryId: 1 });
            updateResult.current.mutate(mockTask);

            await waitFor(() => {
                expect(createResult.current.isSuccess).toBe(true);
                expect(updateResult.current.isSuccess).toBe(true);
            });
        });
    });
});
