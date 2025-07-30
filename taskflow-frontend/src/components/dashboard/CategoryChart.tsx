import { Box, Paper, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

interface CategoryChartProps {
    data: any;
    options: any;
    hasData: boolean;
}

const CategoryChart = ({ data, options, hasData }: CategoryChartProps) => {
    const { t } = useTranslation();

    const chartOptions = {
        ...options,
        plugins: {
            ...options.plugins,
            legend: {
                position: 'bottom' as const,
            }
        }
    };

    return (
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
                {t('tasksByCategory')}
            </Typography>
            <Box sx={{
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {hasData ? (
                    <Doughnut data={data} options={chartOptions} />
                ) : (
                    <Typography color="textSecondary" textAlign="center">
                        {t('noDataAvailable')}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default CategoryChart;
