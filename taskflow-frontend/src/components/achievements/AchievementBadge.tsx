import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type { AchievementLevel } from '../../types/Achievement';

const LevelColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    diamond: '#B9F2FF'
};

const StyledBadge = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'level' && prop !== 'unlocked'
})<{ level: AchievementLevel; unlocked: boolean }>(({ theme, level, unlocked }) => ({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: '50%',
    border: `3px solid ${LevelColors[level]}`,
    backgroundColor: unlocked ? LevelColors[level] : theme.palette.grey[300],
    color: unlocked ? '#000' : theme.palette.grey[600],
    fontSize: '24px',
    fontWeight: 'bold',
    opacity: unlocked ? 1 : 0.5,
    transition: 'all 0.3s ease',
    boxShadow: unlocked ? `0 0 20px ${LevelColors[level]}40` : 'none',

    '&::before': {
        content: '""',
        position: 'absolute',
        inset: -5,
        borderRadius: '50%',
        background: unlocked
            ? `conic-gradient(from 0deg, ${LevelColors[level]}, transparent)`
            : 'none',
        opacity: 0.3,
        zIndex: -1
    }
}));

interface AchievementBadgeProps {
    level: AchievementLevel;
    unlocked: boolean;
    icon?: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    level,
    unlocked,
    icon,
    size = 'medium'
}) => {
    const sizeMap = {
        small: { width: 40, height: 40, fontSize: '16px' },
        medium: { width: 60, height: 60, fontSize: '24px' },
        large: { width: 80, height: 80, fontSize: '32px' }
    };

    return (
        <StyledBadge
            level={level}
            unlocked={unlocked}
            sx={sizeMap[size]}
        >
            {icon || level.charAt(0).toUpperCase()}
        </StyledBadge>
    );
};

interface AchievementProgressBarProps {
    current: number;
    target: number;
    level: AchievementLevel;
    showNumbers?: boolean;
}

export const AchievementProgressBar: React.FC<AchievementProgressBarProps> = ({
    current,
    target,
    level,
    showNumbers = true
}) => {
    const progress = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;

    return (
        <Box sx={{ width: '100%' }}>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'grey.300',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: isCompleted ? LevelColors[level] : 'primary.main',
                        borderRadius: 4,
                        boxShadow: isCompleted ? `0 0 10px ${LevelColors[level]}40` : 'none'
                    }
                }}
            />
            {showNumbers && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        {current} / {target}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {Math.round(progress)}%
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

interface AchievementTierChipProps {
    level: AchievementLevel;
    unlocked: boolean;
    points: number;
}

export const AchievementTierChip: React.FC<AchievementTierChipProps> = ({
    level,
    unlocked,
    points
}) => {
    const { t } = useTranslation();

    return (
        <Chip
            label={`${t(`achievementsDashboard.${level.toLowerCase()}`).toUpperCase()} (+${points})`}
            size="small"
            sx={{
                backgroundColor: unlocked ? LevelColors[level] : 'grey.300',
                color: unlocked ? '#000' : 'grey.600',
                fontWeight: 'bold',
                fontSize: '10px',
                opacity: unlocked ? 1 : 0.6
            }}
        />
    );
};