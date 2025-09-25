import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Tabs,
    Tab,
    LinearProgress,
    Chip,
    Avatar,
    Paper
} from '@mui/material';

import {
    EmojiEvents,
    TrendingUp,
    Category,
    FilterList,
    Stars
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAchievementTracker } from '../hooks/useAchievementTracker';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { AchievementNotificationDialog } from '../components/achievements/AchievementNotificationDialog';
import { calculateUserLevel, AchievementCategory } from '../types/Achievement';
import type { AchievementNotification } from '../types/Achievement';

interface UserLevelCardProps {
    totalPoints: number;
    level: number;
    experiencePoints: number;
    nextLevelPoints: number;
}

const UserLevelCard: React.FC<UserLevelCardProps> = ({
    totalPoints,
    level,
    experiencePoints,
    nextLevelPoints
}) => {
    const { t } = useTranslation();
    const levelProgress = nextLevelPoints > 0 ? (experiencePoints / nextLevelPoints) * 100 : 100;
    const levelInfo = calculateUserLevel(totalPoints);

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <EmojiEvents sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" component="h2">
                            {t('achievementsDashboard.level')} {level} - {t(levelInfo.titleKey)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('achievementsDashboard.totalPointsEarned', { points: totalPoints })}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" color="primary">
                            {totalPoints}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('achievementsDashboard.points')}
                        </Typography>
                    </Box>
                </Box>

                {nextLevelPoints > 0 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                                {t('achievementsDashboard.progressToLevel', { level: level + 1 })}
                            </Typography>
                            <Typography variant="body2">
                                {experiencePoints} / {nextLevelPoints}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={levelProgress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4
                                }
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'primary.main' }) => (
    <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
        <Box sx={{ color, mb: 1 }}>
            {icon}
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 0.5 }}>
            {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {title}
        </Typography>
    </Paper>
);

const AchievementsPage: React.FC = () => {
    const { t } = useTranslation();
    const { achievements, progress, userStats, isInitialized } = useAchievementTracker();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [notification, setNotification] = useState<AchievementNotification | null>(null);

    if (!isInitialized || !userStats) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <LinearProgress />
                <Typography sx={{ mt: 2 }}>{t('achievementsDashboard.loadingAchievements')}</Typography>
            </Box>
        );
    }

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === selectedCategory);

    const unlockedCount = achievements.filter(a =>
        progress.some(p => p.achievementId === a.id && p.unlockedTiers.length > 0)
    ).length;

    const categoryStats = (Object.values(AchievementCategory) as AchievementCategory[]).map(category => {
        const categoryAchievements = achievements.filter(a => a.category === category);
        const unlockedInCategory = categoryAchievements.filter(a =>
            progress.some(p => p.achievementId === a.id && p.unlockedTiers.length > 0)
        ).length;

        return {
            category,
            total: categoryAchievements.length,
            unlocked: unlockedInCategory,
            percentage: categoryAchievements.length > 0 ? (unlockedInCategory / categoryAchievements.length) * 100 : 0
        };
    });

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    🏆 {t('achievementsDashboard.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('achievementsDashboard.subtitle')}
                </Typography>
            </Box>

            {/* User Level Card */}
            <UserLevelCard
                totalPoints={userStats.totalPoints}
                level={userStats.level}
                experiencePoints={userStats.experiencePoints}
                nextLevelPoints={userStats.nextLevelPoints}
            />

            {/* Stats Overview */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Box sx={{ flex: { xs: '1 1 45%', sm: '1 1 22%' } }}>
                    <StatsCard
                        title={t('achievementsDashboard.achievementsCount')}
                        value={`${unlockedCount}/${userStats.totalAchievements}`}
                        icon={<EmojiEvents sx={{ fontSize: 32 }} />}
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 45%', sm: '1 1 22%' } }}>
                    <StatsCard
                        title={t('achievementsDashboard.totalPoints')}
                        value={userStats.totalPoints}
                        icon={<Stars sx={{ fontSize: 32 }} />}
                        color="warning.main"
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 45%', sm: '1 1 22%' } }}>
                    <StatsCard
                        title={t('achievementsDashboard.currentStreak')}
                        value={userStats.currentStreak}
                        icon={<TrendingUp sx={{ fontSize: 32 }} />}
                        color="success.main"
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 45%', sm: '1 1 22%' } }}>
                    <StatsCard
                        title={t('achievementsDashboard.bestStreak')}
                        value={userStats.longestStreak}
                        icon={<TrendingUp sx={{ fontSize: 32 }} />}
                        color="error.main"
                    />
                </Box>
            </Box>

            {/* Category Filter */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <FilterList />
                        <Typography variant="h6">{t('achievementsDashboard.filterByCategory')}</Typography>
                    </Box>

                    <Tabs
                        value={selectedCategory}
                        onChange={(_, value) => setSelectedCategory(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label={t('achievementsDashboard.allCategories')} value="all" />
                        {(Object.values(AchievementCategory) as AchievementCategory[]).map(category => (
                            <Tab
                                key={category}
                                label={t(`achievementsDashboard.${category}`)}
                                value={category}
                            />
                        ))}
                    </Tabs>

                    {/* Category Stats */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {categoryStats.map(stat => (
                            <Chip
                                key={stat.category}
                                label={`${t(`achievementsDashboard.${stat.category}`)}: ${stat.unlocked}/${stat.total} (${Math.round(stat.percentage)}%)`}
                                size="small"
                                color={stat.percentage === 100 ? 'success' : 'default'}
                                variant={selectedCategory === stat.category ? 'filled' : 'outlined'}
                            />
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* Achievements Grid */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {filteredAchievements.map(achievement => {
                    const achievementProgress = progress.find(p => p.achievementId === achievement.id);

                    return (
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', lg: '1 1 30%' } }} key={achievement.id}>
                            <AchievementCard
                                achievement={achievement}
                                progress={achievementProgress}
                                onClick={() => {
                                }}
                            />
                        </Box>
                    );
                })}
            </Box>

            {filteredAchievements.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Category sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        {t('achievementsDashboard.noAchievementsFound')}
                    </Typography>
                </Box>
            )}

            {/* Achievement Notification Dialog */}
            <AchievementNotificationDialog
                notification={notification}
                open={!!notification}
                onClose={() => setNotification(null)}
            />
        </Box>
    );
};

export default AchievementsPage;