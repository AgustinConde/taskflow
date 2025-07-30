import { Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import type { Category } from '../../types/Category';

interface TaskListHeaderProps {
    categories: Category[];
    onSubmit: (taskData: {
        title: string;
        description: string;
        dueDate: string;
        categoryId: number | null;
    }) => Promise<boolean>;
    creating: boolean;
    search: string;
    onSearchChange: (search: string) => void;
    filter: any;
    onFilterChange: (filter: any) => void;
    sortBy: any;
    onSortChange: (sort: any) => void;
    onCategoryManagerOpen: () => void;
}

const TaskListHeader = ({
    categories,
    onSubmit,
    creating,
    search,
    onSearchChange,
    filter,
    onFilterChange,
    sortBy,
    onSortChange,
    onCategoryManagerOpen
}: TaskListHeaderProps) => {
    const { t } = useTranslation();

    return (
        <Paper
            elevation={3}
            sx={{
                mb: 4,
                p: 3,
                backgroundColor: theme => theme.palette.primary.light + '22',
                borderRadius: 3
            }}
        >
            <Typography
                variant="h6"
                align="center"
                gutterBottom
                sx={theme => ({
                    color: theme.palette.mode === 'dark'
                        ? theme.palette.text.primary
                        : theme.palette.primary.main,
                    textShadow: theme.palette.mode === 'dark'
                        ? '0 1px 6px rgba(0,0,0,0.25)'
                        : 'none',
                    fontWeight: 700,
                    letterSpacing: 1,
                    mb: 3,
                })}
            >
                {t('taskManagement')}
            </Typography>

            <TaskForm
                categories={categories}
                onSubmit={onSubmit}
                creating={creating}
            />

            <TaskFilters
                search={search}
                onSearchChange={onSearchChange}
                filter={filter}
                onFilterChange={onFilterChange}
                sortBy={sortBy}
                onSortChange={onSortChange}
                categories={categories}
                onCategoryManagerOpen={onCategoryManagerOpen}
            />
        </Paper>
    );
};

export default TaskListHeader;
