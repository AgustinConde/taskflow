import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from './useNotifications';
import type {
    Achievement,
    AchievementProgress,
    AchievementEvent,
    AchievementNotification,
    UserAchievementStats
} from '../types/Achievement';
import { AchievementEventType } from '../types/Achievement';
import { achievementDefinitions } from '../data/achievements';
import { achievementStorage } from '../utils/achievementStorage';
import { achievementService } from '../services/achievementService';
import { authService } from '../services/authService';
import { calculateUserLevel } from '../types/Achievement';

export const useAchievementTracker = () => {
    const { showSuccess } = useNotifications();
    const { t } = useTranslation();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [progress, setProgress] = useState<AchievementProgress[]>([]);
    const [userStats, setUserStats] = useState<UserAchievementStats | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const eventThrottleRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        const initializeAchievements = async () => {
            try {
                const token = authService.getToken();
                let userId = 'anonymous';
                if (token) {
                    try {
                        const user = await authService.getCurrentUser();
                        userId = user.id.toString();
                    } catch (error) {
                    }
                }
                achievementStorage.setUserId(userId);

                let backendAchievements: Achievement[] = [];
                let backendProgress: AchievementProgress[] = [];
                let useBackend = false;

                if (token) {
                    try {
                        backendAchievements = await achievementService.getAchievements();
                        backendProgress = await achievementService.getUserProgress();

                        if (backendAchievements.length > 0) {
                            useBackend = true;
                            setAchievements(backendAchievements);
                            setProgress(backendProgress);
                        }
                    } catch (backendError) {
                    }
                }

                if (!useBackend) {
                    try {
                        await achievementStorage.init();

                        const storedAchievements = await achievementStorage.getAchievements();
                        const storedProgress = await achievementStorage.getProgress();

                        if (storedAchievements.length === 0) {
                            await achievementStorage.initializeDefaultAchievements(achievementDefinitions);
                            setAchievements(achievementDefinitions);
                        } else {
                            setAchievements(storedAchievements);
                        }

                        setProgress(storedProgress);
                    } catch (storageError) {
                        console.error('Failed to initialize local storage, using fallback:', storageError);
                        setAchievements(achievementDefinitions);
                        setProgress([]);
                    }
                }

                const progressData = useBackend ? backendProgress : await achievementStorage.getProgress();
                const stats = await calculateUserStats(progressData);
                setUserStats(stats);

                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize achievement system:', error);
                setAchievements(achievementDefinitions);
                setProgress([]);
                setUserStats({
                    totalPoints: 0,
                    totalAchievements: achievementDefinitions.length,
                    unlockedAchievements: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    level: 1,
                    experiencePoints: 0,
                    nextLevelPoints: 100
                });
                setIsInitialized(true);
            }
        };

        initializeAchievements();
    }, []);

    const calculateUserStats = async (progressData: AchievementProgress[]): Promise<UserAchievementStats> => {
        let totalPoints = 0;
        let unlockedAchievements = 0;

        for (const prog of progressData) {
            const achievement = achievementDefinitions.find(a => a.id === prog.achievementId);
            if (achievement) {
                for (const tier of achievement.tiers) {
                    if (prog.unlockedTiers.includes(tier.level)) {
                        totalPoints += tier.points;

                    }
                }
                if (prog.unlockedTiers.length > 0) {
                    unlockedAchievements++;
                }
            }
        }



        const levelInfo = calculateUserLevel(totalPoints);

        return {
            totalPoints,
            totalAchievements: achievementDefinitions.length,
            unlockedAchievements,
            currentStreak: 0,
            longestStreak: 0,
            level: levelInfo.level,
            experiencePoints: levelInfo.experiencePoints,
            nextLevelPoints: levelInfo.nextLevelPoints
        };
    };

    const trackEvent = useCallback(async (eventType: AchievementEventType, eventData?: any) => {
        if (!isInitialized) {
            return;
        }

        const now = Date.now();
        const throttleKey = `${eventType}_${JSON.stringify(eventData?.id || 'general')}`;
        const lastEventTime = eventThrottleRef.current.get(throttleKey);

        const THROTTLE_TIME = eventType.includes('app_') || eventType.includes('daily_') ? 60000 : 1000; // 1 minute vs 1 second

        if (lastEventTime && (now - lastEventTime) < THROTTLE_TIME) {
            return;
        }

        eventThrottleRef.current.set(throttleKey, now);

        const event: AchievementEvent = {
            type: eventType,
            data: eventData,
            timestamp: new Date()
        };

        try {
            const token = authService.getToken();
            if (token) {
                try {
                    await achievementService.trackEvent(event);

                    const notifications = await achievementService.getNotifications();

                    notifications.forEach((notification: any) => {
                        const { achievement, tier, isNewAchievement } = notification;
                        if (isNewAchievement) {
                            showSuccess(
                                `🏆 Achievement Unlocked: ${achievement.key} (${tier.level.toUpperCase()})!`,
                                `achievement-${achievement.id}-${tier.level}`
                            );
                        } else {
                            showSuccess(
                                `⭐ Achievement Upgraded: ${achievement.key} (${tier.level.toUpperCase()})!`,
                                `achievement-upgrade-${achievement.id}-${tier.level}`
                            );
                        }
                    });

                    const backendProgress = await achievementService.getUserProgress();
                    const backendStats = await achievementService.getUserStats();

                    if (backendProgress && backendStats) {
                        setProgress(backendProgress);
                        setUserStats(backendStats);
                        return;
                    }
                } catch (backendError) {
                    console.error('Error processing achievement event:', backendError);
                }
            }

            await achievementStorage.addEvent(event);

            const currentAchievements = achievements.length > 0 ? achievements : achievementDefinitions;
            const currentProgress = await achievementStorage.getProgress();

            const notifications = await checkAchievementProgress(event, currentAchievements, currentProgress);

            notifications.forEach(notification => {
                showAchievementNotification(notification);
            });

            setProgress(currentProgress);
            const stats = await calculateUserStats(currentProgress);
            setUserStats(stats);

        } catch (error) {
            console.error('Failed to track achievement event:', error);
        }
    }, [isInitialized]);

    const checkAchievementProgress = async (
        event: AchievementEvent,
        achievementsToCheck?: Achievement[],
        progressToCheck?: AchievementProgress[]
    ): Promise<AchievementNotification[]> => {
        const notifications: AchievementNotification[] = [];
        const currentAchievements = achievementsToCheck || achievements;
        const currentProgress = progressToCheck || progress;

        for (const achievement of currentAchievements) {
            const existingProgress = currentProgress.find(p => p.achievementId === achievement.id) || {
                achievementId: achievement.id,
                currentValue: 0,
                lastUpdated: new Date(),
                unlockedTiers: []
            };

            const updatedProgress = await updateAchievementProgress(achievement, existingProgress, event);

            if (updatedProgress && updatedProgress !== existingProgress) {
                const newlyUnlockedTiers = updatedProgress.unlockedTiers.filter(
                    tier => !existingProgress.unlockedTiers.includes(tier)
                );

                for (const tierLevel of newlyUnlockedTiers) {
                    const tier = achievement.tiers.find(t => t.level === tierLevel);
                    if (tier) {
                        notifications.push({
                            achievement,
                            tier,
                            isNewAchievement: existingProgress.unlockedTiers.length === 0
                        });
                    }
                }

                await achievementStorage.updateProgress(updatedProgress);
            }
        }

        return notifications;
    };

    const updateAchievementProgress = async (
        achievement: Achievement,
        currentProgress: AchievementProgress,
        event: AchievementEvent
    ): Promise<AchievementProgress | null> => {

        if (!isEventRelevantToAchievement(achievement, event)) {
            return null;
        }

        const newProgress = { ...currentProgress };
        let progressChanged = false;

        switch (achievement.type) {
            case 'counter':
                newProgress.currentValue++;
                progressChanged = true;
                break;

            case 'streak':
                const today = new Date().toDateString();
                const lastStreakDate = newProgress.lastStreakDate?.toDateString();

                if (lastStreakDate === today) {
                    return null;
                } else if (lastStreakDate === new Date(Date.now() - 86400000).toDateString()) {
                    newProgress.streakCount = (newProgress.streakCount || 0) + 1;
                } else {
                    newProgress.streakCount = 1;
                }

                newProgress.currentValue = newProgress.streakCount || 1;
                newProgress.lastStreakDate = new Date();
                progressChanged = true;
                break;

            case 'milestone':
                if (newProgress.currentValue === 0) {
                    newProgress.currentValue = 1;
                    progressChanged = true;
                }
                break;

            case 'percentage':
                break;
        }

        if (progressChanged) {
            newProgress.lastUpdated = new Date();

            for (const tier of achievement.tiers) {
                if (newProgress.currentValue >= tier.target && !newProgress.unlockedTiers.includes(tier.level)) {
                    newProgress.unlockedTiers.push(tier.level);
                }
            }

            return newProgress;
        }

        return null;
    };

    const isEventRelevantToAchievement = (achievement: Achievement, event: AchievementEvent): boolean => {
        switch (achievement.id) {
            case 'task_completionist':
                return event.type === AchievementEventType.TASK_COMPLETED;

            case 'category_creator':
                return event.type === AchievementEventType.CATEGORY_CREATED;

            case 'daily_achiever':
                return event.type === AchievementEventType.ALL_TASKS_COMPLETED_TODAY;

            case 'speed_demon':
                return event.type === AchievementEventType.TASK_COMPLETED_ON_TIME;

            case 'early_bird':
                return event.type === AchievementEventType.EARLY_BIRD;

            case 'night_owl':
                return event.type === AchievementEventType.NIGHT_OWL;

            case 'consistency_keeper':
                return event.type === AchievementEventType.DAILY_LOGIN;

            case 'weekend_warrior':
                return event.type === AchievementEventType.WEEKEND_PRODUCTIVITY;

            case 'feature_explorer':
                return event.type === AchievementEventType.APP_OPENED ||
                    event.type === AchievementEventType.CALENDAR_VIEWED ||
                    event.type === AchievementEventType.DASHBOARD_VIEWED;

            case 'calendar_master':
                return event.type === AchievementEventType.CALENDAR_VIEWED;

            case 'first_steps':
                return event.type === AchievementEventType.TASK_CREATED;

            case 'multitasker':
                return event.type === AchievementEventType.TASK_CREATED;

            case 'time_master':
                return event.type === AchievementEventType.TASK_COMPLETED_ON_TIME;

            default:
                return false;
        }
    };

    const showAchievementNotification = (notification: AchievementNotification) => {
        const { achievement, tier } = notification;

        const achievementKey = achievement.id.replace(/_/g, '');
        const achievementNameKey = `achievementData.${achievementKey}.title`;
        const achievementName = t(achievementNameKey, achievement.key);

        const tierNameKey = `achievementTiers.${tier.level.toLowerCase()}`;
        const tierName = t(tierNameKey, tier.level);

        const message = `${achievementName} (${tierName})`;

        showSuccess(
            message,
            `achievement-${achievement.id}-${tier.level}`
        );
    };

    return {
        achievements,
        progress,
        userStats,
        isInitialized,
        trackEvent
    };
};