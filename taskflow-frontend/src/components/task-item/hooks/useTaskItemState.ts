import { useState, useEffect } from 'react';
import type { Task } from '../../../types/Task';
import { useDateTimeUtils } from './useDateTimeUtils';

export const useTaskItemState = (task: Task) => {
    const { toLocalInputDateTime } = useDateTimeUtils();

    const [localTitle, setLocalTitle] = useState(task.title);
    const [localDescription, setLocalDescription] = useState(task.description || "");
    const [localDueDate, setLocalDueDate] = useState(
        task.dueDate ? toLocalInputDateTime(task.dueDate) : ""
    );
    const [localCategoryId, setLocalCategoryId] = useState<number | undefined>(
        task.categoryId || undefined
    );
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    useEffect(() => {
        setLocalTitle(task.title);
        setLocalDescription(task.description || "");
        setLocalDueDate(task.dueDate ? toLocalInputDateTime(task.dueDate) : "");
        setLocalCategoryId(task.categoryId || undefined);
    }, [task, toLocalInputDateTime]);

    return {
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
    };
};
