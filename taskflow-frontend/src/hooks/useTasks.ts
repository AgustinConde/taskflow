import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { taskService } from '../services/taskService';
import type { Task } from '../types/Task';

// Query keys for better cache management
export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters: string) => [...taskKeys.lists(), { filters }] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: number) => [...taskKeys.details(), id] as const,
};

// Custom hook for fetching all tasks
export const useTasks = () => {
    return useQuery({
        queryKey: taskKeys.lists(),
        queryFn: () => taskService.getTasks(),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

// Custom hook for fetching a single task
export const useTask = (taskId: number) => {
    return useQuery({
        queryKey: taskKeys.detail(taskId),
        queryFn: () => taskService.getTask(taskId),
        enabled: !!taskId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Custom hook for creating tasks
export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (task: Omit<Task, 'id'>) => taskService.createTask(task),
        onSuccess: (newTask) => {
            // Optimistic update: add the new task to the cache
            queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks) => {
                return oldTasks ? [...oldTasks, newTask] : [newTask];
            });

            // Invalidate and refetch tasks to ensure consistency
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

            showSuccess(t('taskCreatedSuccessfully', 'Task created successfully'));
        },
        onError: (error) => {
            console.error('Error creating task:', error);
            showError(t('errorCreatingTask', 'Error creating task'));
        },
    });
};

// Custom hook for updating tasks
export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (task: Task) => taskService.updateTask(task.id!, task),
        onMutate: async (updatedTask) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());

            // Optimistically update to the new value
            queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks) => {
                return oldTasks?.map(task =>
                    task.id === updatedTask.id ? updatedTask : task
                ) || [];
            });

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (error, updatedTask, context) => {
            // If the mutation fails, use the context to roll back
        onError: (error, _updatedTask, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
            console.error('Error updating task:', error);
            showError(t('errorUpdatingTask', 'Error updating task'));
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
        onSuccess: () => {
            showSuccess(t('taskUpdatedSuccessfully', 'Task updated successfully'));
        },
    });
};

// Custom hook for deleting tasks
export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (taskId: number) => taskService.deleteTask(taskId),
        onMutate: async (deletedTaskId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());

            // Optimistically update to the new value
            queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks) => {
                return oldTasks?.filter(task => task.id !== deletedTaskId) || [];
            });

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (error, deletedTaskId, context) => {
            // If the mutation fails, use the context to roll back
        onError: (error, _deletedTaskId, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
            console.error('Error deleting task:', error);
            showError(t('errorDeletingTask', 'Error deleting task'));
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
        onSuccess: () => {
            showSuccess(t('taskDeletedSuccessfully', 'Task deleted successfully'));
        },
    });
};

// Custom hook for toggling task completion
export const useToggleTaskCompletion = () => {
    const queryClient = useQueryClient();
    const { showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (task: Task) => {
            const updatedTask = { ...task, isCompleted: !task.isCompleted };
            return taskService.updateTask(updatedTask.id!, updatedTask);
        },
        onMutate: async (task) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());

            // Optimistically update to the new value
            queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks) => {
                return oldTasks?.map(t =>
                    t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
                ) || [];
            });

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (error, task, context) => {
            // If the mutation fails, use the context to roll back
        onError: (error, _task, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
            console.error('Error toggling task completion:', error);
            showError(t('errorUpdatingTask', 'Error updating task'));
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
};
