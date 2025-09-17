import { useState, memo, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TaskListHeader from './TaskListHeader';
import TaskGrid from './TaskGrid';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import CategoryManager from '../category-manager';

import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTaskCompletion } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { useTaskFiltering } from './hooks/useTaskFiltering';
import { useTaskSorting } from './hooks/useTaskSorting';

const TaskList = memo(() => {
    const { t } = useTranslation();

    const { data: tasks = [], isLoading: tasksLoading } = useTasks();
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const toggleCompletionMutation = useToggleTaskCompletion();

    const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const {
        search,
        setSearch,
        filter,
        setFilter,
        filteredTasks
    } = useTaskFiltering(tasks, categories);

    const {
        sortBy,
        setSortBy,
        sortedTasks,
        handleDragEnd,
        isCustomSort
    } = useTaskSorting(filteredTasks, categories, tasks);

    const handleCreateTask = useCallback(async (taskData: any): Promise<boolean> => {
        try {
            await createTaskMutation.mutateAsync(taskData);
            return true;
        } catch (error) {
            return false;
        }
    }, [createTaskMutation]);

    const handleUpdateTask = useCallback(async (task: any) => {
        try {
            await updateTaskMutation.mutateAsync(task);
        } catch (error) {
        }
    }, [updateTaskMutation]);

    const handleToggleCompleted = useCallback(async (task: any) => {
        try {
            await toggleCompletionMutation.mutateAsync(task);
        } catch (error) {
        }
    }, [toggleCompletionMutation]);

    const handleDeleteRequest = useCallback((taskId: number) => {
        setDeleteId(taskId);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (deleteId) {
            try {
                await deleteTaskMutation.mutateAsync(deleteId);
                setDeleteId(null);
            } catch (error) {
            }
        }
    }, [deleteId, deleteTaskMutation]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteId(null);
    }, []);

    const handleOpenCategoryManager = useCallback(() => {
        setCategoryManagerOpen(true);
    }, []);

    const handleCloseCategoryManager = useCallback(() => {
        setCategoryManagerOpen(false);
    }, []);

    const isLoading = tasksLoading || categoriesLoading;
    const isCreating = createTaskMutation.isPending;
    const isDeleting = deleteTaskMutation.isPending;

    if (isLoading) {
        return (
            <Box
                sx={{
                    maxWidth: 900,
                    margin: "0 auto",
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                    {t('loading')}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, margin: "0 auto", padding: 2, position: 'relative' }}>
            <TaskListHeader
                categories={categories}
                onSubmit={handleCreateTask}
                creating={isCreating}
                search={search}
                onSearchChange={setSearch}
                filter={filter}
                onFilterChange={setFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onCategoryManagerOpen={handleOpenCategoryManager}
            />

            {sortedTasks.length === 0 ? (
                <Typography align="center" color="text.secondary">
                    {t('noTasks')}
                </Typography>
            ) : (
                <TaskGrid
                    tasks={sortedTasks}
                    categories={categories}
                    onEditSave={handleUpdateTask}
                    onDelete={handleDeleteRequest}
                    onToggleCompleted={handleToggleCompleted}
                    onDragEnd={handleDragEnd}
                    isDragEnabled={isCustomSort}
                />
            )}

            <DeleteConfirmDialog
                open={!!deleteId}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                loading={isDeleting}
            />

            <CategoryManager
                open={categoryManagerOpen}
                onClose={handleCloseCategoryManager}
            />
        </Box>
    );
});

TaskList.displayName = 'TaskList';

export default TaskList;
