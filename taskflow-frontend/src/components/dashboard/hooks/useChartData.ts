import { useMemo } from 'react';
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../../types/Task';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const getTimeRangeDays = (timeRange: TimeRange): number => {
    switch (timeRange) {
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        default: return 30;
    }
};

export const useFilteredTasks = (tasks: Task[], timeRange: TimeRange) => {
    return useMemo(() => {
        if (timeRange === 'all') return tasks;

        const now = new Date();
        const daysBack = getTimeRangeDays(timeRange);
        const startDate = subDays(now, daysBack);

        return tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return isAfter(taskDate, startDate);
        });
    }, [tasks, timeRange]);
};

export const useActivityChartData = (tasks: Task[], filteredTasks: Task[], timeRange: TimeRange) => {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'es' ? es : enUS;

    return useMemo(() => {
        const days = getTimeRangeDays(timeRange);
        const labels: string[] = [];
        const completedData: number[] = [];
        const createdData: number[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dayStart = startOfDay(date);
            const dayEnd = endOfDay(date);

            labels.push(format(date, 'MMM dd', { locale: dateLocale }));

            const dayCompleted = tasks.filter(t =>
                t.isCompleted &&
                t.createdAt &&
                isAfter(new Date(t.createdAt), dayStart) &&
                isBefore(new Date(t.createdAt), dayEnd)
            ).length;

            const dayCreated = tasks.filter(t =>
                t.createdAt &&
                isAfter(new Date(t.createdAt), dayStart) &&
                isBefore(new Date(t.createdAt), dayEnd)
            ).length;

            completedData.push(dayCompleted);
            createdData.push(dayCreated);
        }

        return {
            labels,
            datasets: [
                {
                    label: t('tasksCreated'),
                    data: createdData,
                    borderColor: 'rgb(124, 58, 237)',
                    backgroundColor: 'rgba(124, 58, 237, 0.2)',
                    tension: 0.1,
                },
                {
                    label: t('tasksCompleted'),
                    data: completedData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    tension: 0.1,
                }
            ]
        };
    }, [tasks, filteredTasks, timeRange, t, dateLocale]);
};
