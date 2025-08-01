import { memo } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface MetricsData {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
    overdue: number;
    dueSoon: number;
}

interface MetricsCardsProps {
    metrics: MetricsData;
}

const MetricCard = memo(({ title, value, color, children }: {
    title: string;
    value: number;
    color?: string;
    children?: React.ReactNode;
}) => (
    <Card>
        <CardContent>
            <Typography color="textSecondary" gutterBottom variant="overline">
                {title}
            </Typography>
            <Typography variant="h3" fontWeight={700} color={color}>
                {value}
            </Typography>
            {children}
        </CardContent>
    </Card>
));

MetricCard.displayName = 'MetricCard';

const CompletionProgressCard = memo(({ completed, completionRate, t }: {
    completed: number;
    completionRate: number;
    t: (key: string) => string;
}) => (
    <Card>
        <CardContent>
            <Typography color="textSecondary" gutterBottom variant="overline">
                {t('completedTasks')}
            </Typography>
            <Typography variant="h3" fontWeight={700} color="success.main">
                {completed}
            </Typography>
            <Box sx={{ mt: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={completionRate}
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="textSecondary">
                    {completionRate.toFixed(1)}% {t('completion')}
                </Typography>
            </Box>
        </CardContent>
    </Card>
));

CompletionProgressCard.displayName = 'CompletionProgressCard';

const OverdueTasksCard = memo(({ overdue, dueSoon, t }: {
    overdue: number;
    dueSoon: number;
    t: (key: string) => string;
}) => (
    <Card>
        <CardContent>
            <Typography color="textSecondary" gutterBottom variant="overline">
                {t('overdueTasks')}
            </Typography>
            <Typography variant="h3" fontWeight={700} color="error.main">
                {overdue}
            </Typography>
            {dueSoon > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Chip
                        label={`${dueSoon} ${t('dueSoon')}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                    />
                </Box>
            )}
        </CardContent>
    </Card>
));

OverdueTasksCard.displayName = 'OverdueTasksCard';

const MetricsCards = memo(({ metrics }: MetricsCardsProps) => {
    const { t } = useTranslation();

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: 4
        }}>
            <MetricCard title={t('totalTasks')} value={metrics.total} />

            <CompletionProgressCard
                completed={metrics.completed}
                completionRate={metrics.completionRate}
                t={t}
            />

            <MetricCard
                title={t('pendingTasks')}
                value={metrics.pending}
                color="warning.main"
            />

            <OverdueTasksCard
                overdue={metrics.overdue}
                dueSoon={metrics.dueSoon}
                t={t}
            />
        </Box>
    );
});

MetricsCards.displayName = 'MetricsCards';

export default MetricsCards;
