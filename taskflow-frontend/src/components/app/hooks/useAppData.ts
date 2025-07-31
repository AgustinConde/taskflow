import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { taskService } from '../../../services/taskService';
import { categoryService } from '../../../services/categoryService';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

export const useAppData = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    const fetchData = async () => {
        try {
            setDataLoading(true);
            const [tasksData, categoriesData] = await Promise.all([
                taskService.getTasks(),
                categoryService.getCategories()
            ]);
            setTasks(tasksData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    return {
        tasks,
        categories,
        dataLoading,
        fetchData
    };
};
