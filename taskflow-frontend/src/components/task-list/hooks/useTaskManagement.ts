import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { taskService } from '../../../services/taskService';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { Task } from '../../../types/Task';

export const useTaskManagement = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { t } = useTranslation();
    const { showSuccess, showError } = useNotifications();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await taskService.getTasks();
            setTasks(data);
            return data;
        } catch (err: any) {
            console.error("Error fetching tasks:", err);
            showError(err.message || 'Failed to fetch tasks');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (taskData: {
        title: string;
        description: string;
        dueDate: string | null;
        categoryId: number | null;
    }) => {
        setCreating(true);

        const localDateTimeToUTCISOString = (local: string) => {
            if (!local) return null;
            return new Date(local).toISOString();
        };

        const newTask = {
            title: taskData.title,
            description: taskData.description,
            isCompleted: false,
            dueDate: taskData.dueDate ? localDateTimeToUTCISOString(taskData.dueDate) : null,
            categoryId: taskData.categoryId,
        };

        try {
            await taskService.createTask(newTask);
            await fetchTasks();
            showSuccess(t('taskCreated'));
            return true;
        } catch (err: any) {
            showError(err.message || t('errorCreatingTask'));
            return false;
        } finally {
            setCreating(false);
        }
    };

    const updateTask = async (task: Task) => {
        try {
            await taskService.updateTask(task.id, task);
            await fetchTasks();
            showSuccess(t('taskUpdated'));
            return true;
        } catch (err: any) {
            showError(err.message || t('errorUpdatingTask'));
            return false;
        }
    };

    const toggleTaskCompleted = async (task: Task) => {
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
        ));

        const updatedTask = { ...task, isCompleted: !task.isCompleted };

        try {
            await taskService.updateTask(task.id, updatedTask);
        } catch (err: any) {
            showError(err.message || t('errorUpdatingTask'));
            setTasks(prevTasks => prevTasks.map(t =>
                t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t
            ));
        }
    };

    const requestDeleteTask = (id: number) => {
        setDeleteId(id);
    };

    const cancelDeleteTask = () => {
        setDeleteId(null);
    };

    const confirmDeleteTask = async () => {
        if (deleteId == null) return false;

        setDeleteLoading(true);
        try {
            await taskService.deleteTask(deleteId);
            setDeleteId(null);
            await fetchTasks();
            showSuccess(t('taskDeleted'));
            return true;
        } catch (err: any) {
            showError(err.message || t('errorDeletingTask'));
            return false;
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return {
        tasks,
        loading,
        creating,
        deleteId,
        deleteLoading,
        createTask,
        updateTask,
        toggleTaskCompleted,
        requestDeleteTask,
        cancelDeleteTask,
        confirmDeleteTask,
        fetchTasks
    };
};
