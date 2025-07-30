import { Box, Paper, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

interface ActivityChartProps {
    data: any;
    options: any;
}

const ActivityChart = ({ data, options }: ActivityChartProps) => {
    const { t } = useTranslation();

    return (
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
                {t('taskActivityOverTime')}
            </Typography>
            <Box sx={{ height: 300 }}>
                <Line data={data} options={options} />
            </Box>
        </Paper>
    );
};

export default ActivityChart;
