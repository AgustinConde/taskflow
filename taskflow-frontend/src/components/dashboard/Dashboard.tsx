import { useState } from 'react';
import { Box } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import type { Task } from '../types/Task';
import type { Category } from '../types/Category';

import DashboardHeader from './dashboard/DashboardHeader';
import MetricsCards from './dashboard/MetricsCards';
import ActivityChart from './dashboard/ActivityChart';
import CategoryChart from './dashboard/CategoryChart';

import { useFilteredTasks, useActivityChartData } from './dashboard/hooks/useChartData';
import { useDashboardMetrics } from './dashboard/hooks/useDashboardMetrics';
import { useCategoryChartData } from './dashboard/hooks/useCategoryData';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface DashboardProps {
    tasks: Task[];
    categories: Category[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
    },
};

const Dashboard = ({ tasks, categories }: DashboardProps) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    const filteredTasks = useFilteredTasks(tasks, timeRange);
    const metrics = useDashboardMetrics(filteredTasks);
    const activityChartData = useActivityChartData(tasks, filteredTasks, timeRange);
    const categoryChartData = useCategoryChartData(filteredTasks, categories);

    const hasChartData = categoryChartData.datasets[0].data.some(d => d > 0);

    return (
        <Box sx={{ p: 3 }}>
            <DashboardHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
            />

            <MetricsCards metrics={metrics} />

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                gap: 3
            }}>
                <ActivityChart
                    data={activityChartData}
                    options={CHART_OPTIONS}
                />

                <CategoryChart
                    data={categoryChartData}
                    options={CHART_OPTIONS}
                    hasData={hasChartData}
                />
            </Box>
        </Box>
    );
};

export default Dashboard;
