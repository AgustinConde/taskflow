import { useMemo } from 'react';
import { isAfter, isBefore, subDays } from 'date-fns';
import type { Task } from '../../../types/Task';

const DAYS_FOR_DUE_SOON_WARNING = 3;

export const useDashboardMetrics = (filteredTasks: Task[]) => {
    return useMemo(() => {
        const total = filteredTasks.length;
        const completed = filteredTasks.filter(t => t.isCompleted).length;
        const pending = total - completed;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        const now = new Date();
        const overdue = filteredTasks.filter(t =>
            !t.isCompleted &&
            t.dueDate &&
            isBefore(new Date(t.dueDate), now)
        ).length;

        const dueSoon = filteredTasks.filter(t =>
            !t.isCompleted &&
            t.dueDate &&
            isAfter(new Date(t.dueDate), now) &&
            isBefore(new Date(t.dueDate), subDays(now, -DAYS_FOR_DUE_SOON_WARNING))
        ).length;

        return {
            total,
            completed,
            pending,
            completionRate,
            overdue,
            dueSoon
        };
    }, [filteredTasks]);
};
