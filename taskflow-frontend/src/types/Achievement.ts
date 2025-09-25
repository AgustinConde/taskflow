export const AchievementLevel = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    DIAMOND: 'diamond'
} as const;

export type AchievementLevel = typeof AchievementLevel[keyof typeof AchievementLevel];

export const AchievementCategory = {
    PRODUCTIVITY: 'productivity',
    ORGANIZATION: 'organization',
    CONSISTENCY: 'consistency',
    EXPLORATION: 'exploration',
    MASTERY: 'mastery',
} as const;

export type AchievementCategory = typeof AchievementCategory[keyof typeof AchievementCategory];

export const AchievementType = {
    COUNTER: 'counter',
    STREAK: 'streak',
    MILESTONE: 'milestone',
    PERCENTAGE: 'percentage'
} as const;

export type AchievementType = typeof AchievementType[keyof typeof AchievementType];

export interface AchievementTier {
    level: AchievementLevel;
    target: number;
    points: number;
    unlocked: boolean;
    unlockedAt?: Date;
}

export interface Achievement {
    id: string;
    key: string;
    category: AchievementCategory;
    type: AchievementType;
    icon: string;
    color: string;
    tiers: AchievementTier[];
    isHidden: boolean;
    prerequisiteAchievements?: string[];
}

export interface AchievementProgress {
    achievementId: string;
    currentValue: number;
    lastUpdated: Date;
    streakCount?: number;
    lastStreakDate?: Date;
    unlockedTiers: AchievementLevel[];
}

export interface AchievementEvent {
    type: AchievementEventType;
    data?: any;
    timestamp: Date;
}

export const AchievementEventType = {
    TASK_CREATED: 'task_created' as const,
    TASK_COMPLETED: 'task_completed' as const,
    TASK_DELETED: 'task_deleted' as const,
    TASK_UPDATED: 'task_updated' as const,

    CATEGORY_CREATED: 'category_created' as const,
    CATEGORY_UPDATED: 'category_updated' as const,
    CATEGORY_DELETED: 'category_deleted' as const,

    APP_OPENED: 'app_opened' as const,
    CALENDAR_VIEWED: 'calendar_viewed' as const,
    DASHBOARD_VIEWED: 'dashboard_viewed' as const,

    DAILY_LOGIN: 'daily_login' as const,
    TASK_COMPLETED_ON_TIME: 'task_completed_on_time' as const,
    TASK_COMPLETED_LATE: 'task_completed_late' as const,

    ALL_TASKS_COMPLETED_TODAY: 'all_tasks_completed_today' as const,
    WEEKEND_PRODUCTIVITY: 'weekend_productivity' as const,
    EARLY_BIRD: 'early_bird' as const,
    NIGHT_OWL: 'night_owl' as const
} as const;

export type AchievementEventType = typeof AchievementEventType[keyof typeof AchievementEventType];

export interface UserAchievementStats {
    totalPoints: number;
    totalAchievements: number;
    unlockedAchievements: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    experiencePoints: number;
    nextLevelPoints: number;
}

export const USER_LEVELS = [
    { level: 1, minPoints: 0, titleKey: 'achievementsDashboard.beginner' },
    { level: 2, minPoints: 100, titleKey: 'achievementsDashboard.organized' },
    { level: 3, minPoints: 300, titleKey: 'achievementsDashboard.productive' },
    { level: 4, minPoints: 600, titleKey: 'achievementsDashboard.efficient' },
    { level: 5, minPoints: 1000, titleKey: 'achievementsDashboard.expert' },
    { level: 6, minPoints: 1500, titleKey: 'achievementsDashboard.master' },
    { level: 7, minPoints: 2200, titleKey: 'achievementsDashboard.guru' },
    { level: 8, minPoints: 3000, titleKey: 'achievementsDashboard.legend' }
];

export const calculateUserLevel = (totalPoints: number) => {
    const currentLevel = USER_LEVELS
        .slice()
        .reverse()
        .find(level => totalPoints >= level.minPoints) || USER_LEVELS[0];

    const currentLevelIndex = USER_LEVELS.findIndex(l => l.level === currentLevel.level);
    const nextLevel = USER_LEVELS[currentLevelIndex + 1];

    const experiencePoints = totalPoints - currentLevel.minPoints;
    const nextLevelPoints = nextLevel ? nextLevel.minPoints - currentLevel.minPoints : 0;

    return {
        level: currentLevel.level,
        titleKey: currentLevel.titleKey,
        experiencePoints,
        nextLevelPoints,
        progress: nextLevelPoints > 0 ? (experiencePoints / nextLevelPoints) * 100 : 100
    };
};

export interface AchievementNotification {
    achievement: Achievement;
    tier: AchievementTier;
    isNewAchievement: boolean; // true if first tier unlocked, false if tier upgrade
}