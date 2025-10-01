import React, { useState, useMemo } from 'react';
import { Box, Container } from '@mui/material';
import { Calendar, CalendarFiltersBar, CreateTaskDialog } from '../components/calendar';
import type { CalendarFilters } from '../components/calendar';
import TaskInfoDialog from '../components/task-item/TaskInfoDialog';
import { useTasks, useUpdateTask, useCreateTask } from '../hooks/useTasks';
import { useCategories } from '../hooks/useCategories';
import { useNotifications } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import type { Task } from '../types/Task';

const CalendarPage: React.FC = () => {
    const { t } = useTranslation();
    const { data: tasks = [] } = useTasks();
    const { data: categories = [] } = useCategories();
    const updateTaskMutation = useUpdateTask();
    const createTaskMutation = useCreateTask();
    const { showSuccess, showError } = useNotifications();

    const [filters, setFilters] = useState<CalendarFilters>({
        category: 'all',
        status: 'all'
    });

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskInfoOpen, setTaskInfoOpen] = useState(false);
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (filters.category !== 'all' && task.categoryId !== filters.category) {
                return false;
            }

            if (filters.status !== 'all') {
                const now = new Date();
                const isOverdue = task.dueDate && task.dueDate.trim() !== '' &&
                    !isNaN(new Date(task.dueDate).getTime()) &&
                    new Date(task.dueDate) < now && !task.isCompleted;

                switch (filters.status) {
                    case 'completed':
                        return task.isCompleted;
                    case 'pending':
                        return !task.isCompleted && !isOverdue;
                    case 'overdue':
                        return isOverdue;
                    default:
                        return true;
                }
            }

            return true;
        });
    }, [tasks, filters]);

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setTaskInfoOpen(true);
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setCreateTaskOpen(true);
    };

    const handleTaskDateChange = async (taskId: number, newDate: Date) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            const updatedDate = task.dueDate
                ? new Date(newDate.toDateString() + ' ' + new Date(task.dueDate).toTimeString())
                : new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 23, 59, 59);

            await updateTaskMutation.mutateAsync({
                ...task,
                dueDate: updatedDate.toISOString()
            });

            showSuccess(t('taskUpdated'));
        } catch (error) {
            showError(t('errorUpdatingTask'));
        }
    };

    const handleCreateTask = async (taskData: {
        title: string;
        description: string;
        dueDate: string;
        categoryId: number | null;
        location?: any;
    }) => {
        try {
            await createTaskMutation.mutateAsync({
                ...taskData,
                categoryId: taskData.categoryId || undefined,
                isCompleted: false
            });
            showSuccess(t('taskCreated'));
            return true;
        } catch (error) {
            showError(t('errorCreatingTask'));
            return false;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3, height: 'calc(100vh - 64px)' }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CalendarFiltersBar
                    categories={categories}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
                <Box sx={{ flex: 1 }}>
                    <Calendar
                        tasks={filteredTasks}
                        categories={categories}
                        onTaskClick={handleTaskClick}
                        onDateClick={handleDateClick}
                        onTaskDateChange={handleTaskDateChange}
                    />
                </Box>
            </Box>

            {selectedTask && (
                <TaskInfoDialog
                    open={taskInfoOpen}
                    onClose={() => setTaskInfoOpen(false)}
                    task={selectedTask}
                />
            )}

            <CreateTaskDialog
                open={createTaskOpen}
                onClose={() => setCreateTaskOpen(false)}
                onSubmit={handleCreateTask}
                categories={categories}
                initialDate={selectedDate || undefined}
                creating={createTaskMutation.isPending}
            />
        </Container>
    );
};

export default CalendarPage;