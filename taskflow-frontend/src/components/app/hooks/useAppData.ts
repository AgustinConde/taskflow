import { useTasks } from '../../../hooks/useTasks';
import { useCategories } from '../../../hooks/useCategories';

export const useAppData = () => {
    const { data: tasks = [], isLoading: tasksLoading } = useTasks();
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    const dataLoading = tasksLoading || categoriesLoading;

    return {
        tasks,
        categories,
        dataLoading
    };
};
