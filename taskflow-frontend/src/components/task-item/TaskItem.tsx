import React, { memo } from "react";
import { Paper, Box } from "@mui/material";
import type { Task } from "../../types/Task";
import type { Category } from "../../types/Category";

import TaskItemDisplay from './TaskItemDisplay';
import TaskItemMenu from './TaskItemMenu';
import TaskInfoDialog from './TaskInfoDialog';
import TaskEditDialog from './TaskEditDialog';

import { useTaskItemState } from './hooks/useTaskItemState';
import { useTaskItemMenu } from './hooks/useTaskItemMenu';
import { useTaskItemStyles } from './hooks/useTaskItemStyles';
import { useDateTimeUtils } from './hooks/useDateTimeUtils';

export interface TaskItemProps {
    task: Task;
    onEditSave: (updated: Task) => void;
    onDelete: () => void;
    onToggleCompleted: () => void;
    categories: Category[];
}

const TaskItem: React.FC<TaskItemProps> = memo(({
    task,
    onEditSave,
    onDelete,
    onToggleCompleted,
    categories,
}) => {
    const { backgroundColor } = useTaskItemStyles(task);
    const { anchorEl, menuOpen, handleMenuOpen, handleMenuClose } = useTaskItemMenu();
    const {
        localTitle,
        setLocalTitle,
        localDescription,
        setLocalDescription,
        localDueDate,
        setLocalDueDate,
        localCategoryId,
        setLocalCategoryId,
        editModalOpen,
        setEditModalOpen,
        infoOpen,
        setInfoOpen
    } = useTaskItemState(task);
    const { localDateTimeToUTCISOString } = useDateTimeUtils();

    const taskCategory = task.categoryId ? categories.find(cat => cat.id === task.categoryId) || null : null;

    const handleInfoOpen = () => {
        setInfoOpen(true);
        handleMenuClose();
    };

    const handleEditModalOpen = () => {
        setEditModalOpen(true);
        setLocalTitle(task.title);
        setLocalDescription(task.description || "");
        setLocalDueDate(task.dueDate ? task.dueDate : "");
        setLocalCategoryId(task.categoryId || undefined);
        handleMenuClose();
    };

    const handleEditSave = () => {
        const updatedTask: Task = {
            ...task,
            title: localTitle,
            description: localDescription,
            dueDate: localDateTimeToUTCISOString(localDueDate),
            categoryId: localCategoryId,
        };
        onEditSave(updatedTask);
        setEditModalOpen(false);
    };

    return (
        <Box>
            <Paper
                elevation={2}
                data-testid={`task-item-${task.id}`}
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor,
                    flexWrap: 'nowrap',
                    overflowX: 'auto'
                }}
            >
                <TaskItemDisplay
                    task={task}
                    onToggleCompleted={onToggleCompleted}
                    taskCategory={taskCategory}
                />

                <TaskItemMenu
                    anchorEl={anchorEl}
                    menuOpen={menuOpen}
                    onMenuOpen={handleMenuOpen}
                    onMenuClose={handleMenuClose}
                    onInfoOpen={handleInfoOpen}
                    onEditOpen={handleEditModalOpen}
                    onDelete={onDelete}
                />
            </Paper>

            <TaskInfoDialog
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                task={task}
            />

            <TaskEditDialog
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={handleEditSave}
                categories={categories}
                localTitle={localTitle}
                setLocalTitle={setLocalTitle}
                localDescription={localDescription}
                setLocalDescription={setLocalDescription}
                localDueDate={localDueDate}
                setLocalDueDate={setLocalDueDate}
                localCategoryId={localCategoryId}
                setLocalCategoryId={setLocalCategoryId}
            />
        </Box>
    );
});

export default TaskItem;
