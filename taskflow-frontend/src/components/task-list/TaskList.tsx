import { Box, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TaskListHeader from './TaskListHeader';
import TaskGrid from './TaskGrid';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import CategoryManager from '../category-manager';

import { useTaskManagement } from './hooks/useTaskManagement';
import { useTaskFiltering } from './hooks/useTaskFiltering';
import { useTaskSorting } from './hooks/useTaskSorting';
import { useCategoryManagement } from './hooks/useCategoryManagement';

const TaskList = () => {
    const { t } = useTranslation();

    const {
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
        confirmDeleteTask
    } = useTaskManagement();

    const {
        categories,
        categoryManagerOpen,
        openCategoryManager,
        closeCategoryManager,
        fetchCategories
    } = useCategoryManagement();

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

    if (loading) {
        return (
            <Box
                sx={{
                    maxWidth: 900,
                    margin: "0 auto",
                    padding: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh'
                }}
            >
                <CircularProgress size="3rem" />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, margin: "0 auto", padding: 2, position: 'relative' }}>
            <TaskListHeader
                categories={categories}
                onSubmit={createTask}
                creating={creating}
                search={search}
                onSearchChange={setSearch}
                filter={filter}
                onFilterChange={setFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onCategoryManagerOpen={openCategoryManager}
            />

            {sortedTasks.length === 0 ? (
                <Typography align="center" color="text.secondary">
                    {t('noTasks')}
                </Typography>
            ) : (
                <TaskGrid
                    tasks={sortedTasks}
                    categories={categories}
                    onEditSave={updateTask}
                    onDelete={requestDeleteTask}
                    onToggleCompleted={toggleTaskCompleted}
                    onDragEnd={handleDragEnd}
                    isDragEnabled={isCustomSort}
                />
            )}

            <DeleteConfirmDialog
                open={deleteId !== null}
                onCancel={cancelDeleteTask}
                onConfirm={confirmDeleteTask}
                loading={deleteLoading}
            />

            <CategoryManager
                open={categoryManagerOpen}
                onClose={closeCategoryManager}
                onCategoriesChange={fetchCategories}
            />
        </Box>
    );
};

export default TaskList;
