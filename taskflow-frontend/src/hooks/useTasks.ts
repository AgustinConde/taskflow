import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { taskService } from '../services/taskService';
import type { Task } from '../types/Task';

export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters: string) => [...taskKeys.lists(), { filters }] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: number) => [...taskKeys.details(), id] as const,
};

export const useTasks = () => {
    const { isAuthenticated } = useAuth();
    return useQuery({
        queryKey: taskKeys.lists(),
        queryFn: () => taskService.getTasks(),
        staleTime: 1000 * 60 * 2,
        enabled: isAuthenticated,
    });
};

export const useTask = (taskId: number) => {
    return useQuery({
        queryKey: taskKeys.detail(taskId),
        queryFn: () => taskService.getTask(taskId),
        enabled: !!taskId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (task: Omit<Task, 'id'>) => taskService.createTask(task),
        onSuccess: (newTask) => {
            queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks) => {
                return oldTasks ? [...oldTasks, newTask] : [newTask];
            });

            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

            showSuccess(t('taskCreatedSuccessfully', 'Task created successfully'));
        },
        onError: (error) => {
            console.error('Error creating task:', error);
            showError(t('errorCreatingTask', 'Error creating task'));
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (task: Task) => taskService.updateTask(task.id!, task),
        onMutate: async (updatedTask) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());

            queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks) => {
                return oldTasks?.map(task =>
                    task.id === updatedTask.id ? updatedTask : task
                ) || [];
            });

            return { previousTasks };
        },
        onError: (error, _updatedTask, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
            console.error('Error updating task:', error);
            showError(t('errorUpdatingTask', 'Error updating task'));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
        onSuccess: () => {
            showSuccess(t('taskUpdatedSuccessfully', 'Task updated successfully'));
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (taskId: number) => taskService.deleteTask(taskId),
        onMutate: async (deletedTaskId) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());

            queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks) => {
                return oldTasks?.filter(task => task.id !== deletedTaskId) || [];
            });

            return { previousTasks };
        },
        onError: (error, _deletedTaskId, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
            console.error('Error deleting task:', error);
            showError(t('errorDeletingTask', 'Error deleting task'));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
        onSuccess: () => {
            showSuccess(t('taskDeletedSuccessfully', 'Task deleted successfully'));
        },
    });
};

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
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());

            queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks) => {
                return oldTasks?.map(t =>
                    t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
                ) || [];
            });

            return { previousTasks };
        },
        onError: (error, _task, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
            console.error('Error toggling task completion:', error);
            showError(t('errorUpdatingTask', 'Error updating task'));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
};
