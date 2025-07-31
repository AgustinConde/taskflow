import { useState, useMemo } from 'react';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

type FilterType = 'all' | 'completed' | 'pending' | number | 'none';

export const useTaskFiltering = (tasks: Task[], categories: Category[]) => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (search.trim() !== "") {
                const categoryName = task.categoryId ?
                    categories.find(cat => cat.id === task.categoryId)?.name || "" :
                    "";
                const text = (task.title + " " + (task.description || "") + " " + categoryName).toLowerCase();
                if (!text.includes(search.toLowerCase())) return false;
            }

            if (filter === 'completed') return task.isCompleted;
            if (filter === 'pending') return !task.isCompleted;
            if (filter === 'none') return task.categoryId === null || task.categoryId === undefined;
            if (typeof filter === 'number') return task.categoryId === filter;

            return true;
        });
    }, [tasks, search, filter, categories]);

    return {
        search,
        setSearch,
        filter,
        setFilter,
        filteredTasks
    };
};
