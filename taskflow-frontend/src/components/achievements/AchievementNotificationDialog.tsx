import React from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type { TransitionProps } from '@mui/material/transitions';
import * as Icons from '@mui/icons-material';
import { AchievementBadge } from './AchievementBadge';
import type { AchievementNotification } from '../../types/Achievement';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Slide,
    Zoom
} from '@mui/material';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CelebrationBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
    borderRadius: theme.spacing(2),
    position: 'relative',
    overflow: 'hidden',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: -50,
        left: -50,
        width: 100,
        height: 100,
        background: `radial-gradient(circle, ${theme.palette.primary.main}30, transparent)`,
        animation: 'float 3s ease-in-out infinite'
    },

    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -30,
        right: -30,
        width: 80,
        height: 80,
        background: `radial-gradient(circle, ${theme.palette.secondary.main}30, transparent)`,
        animation: 'float 3s ease-in-out infinite reverse'
    },

    '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' }
    }
}));

interface AchievementNotificationDialogProps {
    notification: AchievementNotification | null;
    open: boolean;
    onClose: () => void;
}

export const AchievementNotificationDialog: React.FC<AchievementNotificationDialogProps> = ({
    notification,
    open,
    onClose
}) => {
    const { t } = useTranslation();

    if (!notification) return null;

    const { achievement, tier, isNewAchievement } = notification;
    const IconComponent = (Icons as any)[achievement.icon] || Icons.EmojiEvents;

    return (
        <Dialog
            open={open}
            slots={{ transition: Transition }}
            keepMounted
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'visible'
                }
            }}
        >
            <DialogTitle>
                <Typography variant="h4" component="h2" textAlign="center" color="primary">
                    🎉 {isNewAchievement ? t('achievementUnlocked') : t('achievementUpgraded')}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <CelebrationBox>
                    <Zoom in={open} style={{ transitionDelay: '300ms' }}>
                        <Box>
                            <AchievementBadge
                                level={tier.level}
                                unlocked={true}
                                icon={<IconComponent />}
                                size="large"
                            />
                        </Box>
                    </Zoom>

                    <Typography variant="h5" component="h3" sx={{ mt: 2, mb: 1 }}>
                        {t(`achievementData.${achievement.key.split('.')[1]}.title`)}
                    </Typography>

                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        {tier.level.toUpperCase()} Level
                    </Typography>

                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 2,
                        py: 1,
                        borderRadius: 2
                    }}>
                        <Icons.Stars sx={{ fontSize: 20 }} />
                        <Typography variant="body1" fontWeight="bold">
                            +{tier.points} Points
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Keep up the great work! You're making excellent progress.
                    </Typography>
                </CelebrationBox>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    size="large"
                    sx={{ minWidth: 120 }}
                >
                    Awesome!
                </Button>
            </DialogActions>
        </Dialog>
    );
};