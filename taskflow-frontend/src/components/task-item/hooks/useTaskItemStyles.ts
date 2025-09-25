import { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { Task } from '../../../types/Task';

export const useTaskItemStyles = (task: Task) => {
    const backgroundColor = useMemo(() => {
        if (task.isCompleted) {
            return (theme: Theme) => alpha(theme.palette.primary.main, 0.6);
        }

        if (task.dueDate && task.dueDate.trim() !== '') {
            const now = new Date();
            const due = new Date(task.dueDate);

            if (!isNaN(due.getTime())) {
                const diffMs = due.getTime() - now.getTime();
                const diffHrs = diffMs / (1000 * 60 * 60);

                if (diffMs < 0) {
                    return (theme: Theme) => alpha(theme.palette.error.main, 0.7);
                } else if (diffHrs < 3) {
                    return (theme: Theme) => alpha(theme.palette.error.light, 0.4);
                } else if (diffHrs < 24) {
                    return (theme: Theme) => alpha(theme.palette.warning.main, 0.3);
                }
            }
        }

        return (theme: Theme) => theme.palette.background.paper;
    }, [task.isCompleted, task.dueDate]);

    return { backgroundColor };
};
