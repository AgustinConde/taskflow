import { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../types/Task';
import type { Category } from '../../types/Category';

const Dashboard = lazy(() => import('./Dashboard'));

interface LazyDashboardProps {
    tasks: Task[];
    categories: Category[];
}

const DashboardLoading = () => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                gap: 2
            }}
        >
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
                {t('loadingDashboard', 'Loading Dashboard...')}
            </Typography>
        </Box>
    );
};

const LazyDashboard = ({ tasks, categories }: LazyDashboardProps) => {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <Dashboard tasks={tasks} categories={categories} />
        </Suspense>
    );
};

export default LazyDashboard;
