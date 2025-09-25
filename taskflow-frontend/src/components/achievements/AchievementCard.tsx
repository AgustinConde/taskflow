import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import * as Icons from '@mui/icons-material';
import { AchievementBadge, AchievementProgressBar, AchievementTierChip } from './AchievementBadge';
import type { Achievement, AchievementProgress } from '../../types/Achievement';
import { AchievementLevel } from '../../types/Achievement';

const StyledCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'unlocked'
})<{ unlocked: boolean }>(({ theme, unlocked }) => ({
    height: '100%',
    position: 'relative',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: unlocked ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,

    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
    },

    '&::before': unlocked ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        borderRadius: '4px 4px 0 0'
    } : {}
}));

interface AchievementCardProps {
    achievement: Achievement;
    progress?: AchievementProgress;
    onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
    achievement,
    progress,
    onClick
}) => {
    const { t } = useTranslation();
    const hasProgress = progress && progress.unlockedTiers.length > 0;
    const currentProgress = progress?.currentValue || 0;

    const highestUnlockedTier = hasProgress
        ? achievement.tiers.find(tier =>
            progress.unlockedTiers.includes(tier.level) &&
            tier.level === progress.unlockedTiers[progress.unlockedTiers.length - 1]
        )
        : null;

    const nextTier = achievement.tiers.find(tier =>
        !progress?.unlockedTiers.includes(tier.level)
    );

    const IconComponent = (Icons as any)[achievement.icon] || Icons.EmojiEvents;

    return (
        <StyledCard unlocked={!!hasProgress} onClick={onClick}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <AchievementBadge
                        level={highestUnlockedTier?.level || AchievementLevel.BRONZE}
                        unlocked={!!hasProgress}
                        icon={<IconComponent />}
                    />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" component="h3" noWrap>
                            {t(`achievementData.${achievement.key.split('.')[1]}.title`)}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {t(`achievementsDashboard.${achievement.category}`)}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {t(`achievementData.${achievement.key.split('.')[1]}.description`)}
                        </Typography>
                    </Box>
                </Box>

                {/* Progress section */}
                {nextTier && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {t('achievementsDashboard.progressTo', { tier: t(`achievementsDashboard.${nextTier.level.toLowerCase()}`) })}
                        </Typography>
                        <AchievementProgressBar
                            current={currentProgress}
                            target={nextTier.target}
                            level={nextTier.level}
                        />
                    </Box>
                )}

                {/* All tiers overview */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {achievement.tiers.map((tier) => (
                        <AchievementTierChip
                            key={tier.level}
                            level={tier.level}
                            unlocked={progress?.unlockedTiers.includes(tier.level) || false}
                            points={tier.points}
                        />
                    ))}
                </Box>

                {/* Hidden achievement indicator */}
                {achievement.isHidden && !hasProgress && (
                    <Chip
                        label={t('achievementsDashboard.hidden')}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'warning.light'
                        }}
                    />
                )}
            </CardContent>
        </StyledCard>
    );
};