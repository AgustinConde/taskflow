import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

type TimeRange = '7d' | '30d' | '90d' | 'all';

interface DashboardHeaderProps {
    timeRange: TimeRange;
    onTimeRangeChange: (timeRange: TimeRange) => void;
}

const DashboardHeader = ({ timeRange, onTimeRangeChange }: DashboardHeaderProps) => {
    const { t } = useTranslation();

    return (
        <Box sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
        }}>
            <Typography variant="h4" fontWeight={600}>
                {t('dashboard')}
            </Typography>

            <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={(_, newValue) => newValue && onTimeRangeChange(newValue)}
                size="small"
            >
                <ToggleButton value="7d">
                    {t('last7Days')}
                </ToggleButton>
                <ToggleButton value="30d">
                    {t('last30Days')}
                </ToggleButton>
                <ToggleButton value="90d">
                    {t('last90Days')}
                </ToggleButton>
                <ToggleButton value="all">
                    {t('allTime')}
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default DashboardHeader;
