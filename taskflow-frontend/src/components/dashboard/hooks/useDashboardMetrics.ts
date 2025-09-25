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
        const overdue = filteredTasks.filter(t => {
            if (!t.isCompleted && t.dueDate && t.dueDate.trim() !== '') {
                const dueDate = new Date(t.dueDate);
                return !isNaN(dueDate.getTime()) && isBefore(dueDate, now);
            }
            return false;
        }).length;

        const dueSoon = filteredTasks.filter(t => {
            if (!t.isCompleted && t.dueDate && t.dueDate.trim() !== '') {
                const dueDate = new Date(t.dueDate);
                return !isNaN(dueDate.getTime()) &&
                    isAfter(dueDate, now) &&
                    isBefore(dueDate, subDays(now, -DAYS_FOR_DUE_SOON_WARNING));
            }
            return false;
        }).length;

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
