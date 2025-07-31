import { useState, useMemo, useEffect } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

type SortType = 'custom' | 'dueDate' | 'createdAt' | 'category';

export const useTaskSorting = (filteredTasks: Task[], categories: Category[], allTasks: Task[]) => {
    const [sortBy, setSortBy] = useState<SortType>('custom');
    const [customOrder, setCustomOrder] = useState<number[]>([]);

    useEffect(() => {
        if (customOrder.length === 0 && allTasks.length > 0) {
            setCustomOrder(allTasks.map(t => t.id));
        } else if (allTasks.length > 0) {
            const ids = allTasks.map(t => t.id);
            setCustomOrder(prev => [
                ...prev.filter(id => ids.includes(id)),
                ...ids.filter(id => !prev.includes(id))
            ]);
        }
    }, [allTasks, customOrder.length]);

    const sortedTasks = useMemo(() => {
        let sorted = [...filteredTasks];

        if (sortBy === 'dueDate') {
            sorted = sorted.sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
        } else if (sortBy === 'createdAt') {
            sorted = sorted.sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        } else if (sortBy === 'category') {
            sorted = sorted.sort((a, b) => {
                const aCategoryName = a.categoryId ?
                    categories.find(cat => cat.id === a.categoryId)?.name || "zzzz" :
                    "zzzz";
                const bCategoryName = b.categoryId ?
                    categories.find(cat => cat.id === b.categoryId)?.name || "zzzz" :
                    "zzzz";
                return aCategoryName.localeCompare(bCategoryName);
            });
        } else if (sortBy === 'custom') {
            sorted = sorted.sort((a, b) =>
                customOrder.indexOf(a.id) - customOrder.indexOf(b.id)
            );
        }

        return sorted;
    }, [filteredTasks, sortBy, categories, customOrder]);

    const handleDragEnd = (result: DropResult) => {
        if (sortBy !== 'custom') return;
        if (!result.destination) return;

        const from = result.source.index;
        const to = result.destination.index;
        if (from === to) return;

        const filteredIds = sortedTasks.map(t => t.id);
        const newOrder = [...customOrder];
        const idToMove = filteredIds[from];
        const oldIndex = newOrder.indexOf(idToMove);

        newOrder.splice(oldIndex, 1);
        let insertAt = newOrder.indexOf(filteredIds[to]);
        if (to > from) insertAt++;
        newOrder.splice(insertAt, 0, idToMove);

        setCustomOrder(newOrder);
    };

    return {
        sortBy,
        setSortBy,
        sortedTasks,
        handleDragEnd,
        isCustomSort: sortBy === 'custom'
    };
};
