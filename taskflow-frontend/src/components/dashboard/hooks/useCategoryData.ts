import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

const UNCATEGORIZED_COLOR = '#9CA3AF';

export const useCategoryChartData = (filteredTasks: Task[], categories: Category[]) => {
    const { t } = useTranslation();

    return useMemo(() => {
        const categoryStats = categories.map(category => {
            const categoryTasks = filteredTasks.filter(t => t.categoryId === category.id);
            return {
                name: category.name,
                count: categoryTasks.length,
                color: category.color
            };
        });

        const uncategorizedCount = filteredTasks.filter(t => !t.categoryId).length;
        if (uncategorizedCount > 0) {
            categoryStats.push({
                name: t('uncategorized'),
                count: uncategorizedCount,
                color: UNCATEGORIZED_COLOR
            });
        }

        return {
            labels: categoryStats.map(s => s.name),
            datasets: [{
                data: categoryStats.map(s => s.count),
                backgroundColor: categoryStats.map(s => s.color),
                borderWidth: 0,
            }]
        };
    }, [filteredTasks, categories, t]);
};
