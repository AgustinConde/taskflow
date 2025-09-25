import type { Achievement } from '../types/Achievement';
import { AchievementLevel, AchievementCategory, AchievementType } from '../types/Achievement'; export const achievementDefinitions: Achievement[] = [
    // === PRODUCTIVITY ACHIEVEMENTS ===
    {
        id: 'task_completionist',
        key: 'achievements.taskCompletionist',
        category: AchievementCategory.PRODUCTIVITY,
        type: AchievementType.COUNTER,
        icon: 'CheckCircle',
        color: '#4CAF50',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 5, points: 10, unlocked: false },
            { level: AchievementLevel.SILVER, target: 25, points: 25, unlocked: false },
            { level: AchievementLevel.GOLD, target: 100, points: 50, unlocked: false },
            { level: AchievementLevel.DIAMOND, target: 500, points: 100, unlocked: false }
        ]
    },

    {
        id: 'daily_achiever',
        key: 'achievements.dailyAchiever',
        category: AchievementCategory.PRODUCTIVITY,
        type: AchievementType.COUNTER,
        icon: 'Today',
        color: '#FF9800',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 1, points: 15, unlocked: false },
            { level: AchievementLevel.SILVER, target: 7, points: 30, unlocked: false },
            { level: AchievementLevel.GOLD, target: 30, points: 75, unlocked: false },
            { level: AchievementLevel.DIAMOND, target: 100, points: 150, unlocked: false }
        ]
    },

    {
        id: 'speed_demon',
        key: 'achievements.speedDemon',
        category: AchievementCategory.PRODUCTIVITY,
        type: AchievementType.COUNTER,
        icon: 'Speed',
        color: '#E91E63',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 5, points: 20, unlocked: false },
            { level: AchievementLevel.SILVER, target: 20, points: 40, unlocked: false },
            { level: AchievementLevel.GOLD, target: 50, points: 80, unlocked: false },
            { level: AchievementLevel.DIAMOND, target: 150, points: 160, unlocked: false }
        ]
    },

    // === ORGANIZATION ACHIEVEMENTS ===
    {
        id: 'category_creator',
        key: 'achievements.categoryCreator',
        category: AchievementCategory.ORGANIZATION,
        type: AchievementType.COUNTER,
        icon: 'Category',
        color: '#9C27B0',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 3, points: 15, unlocked: false },
            { level: AchievementLevel.SILVER, target: 10, points: 30, unlocked: false },
            { level: AchievementLevel.GOLD, target: 25, points: 60, unlocked: false },
            { level: AchievementLevel.DIAMOND, target: 50, points: 120, unlocked: false }
        ]
    },

    {
        id: 'organizer_supreme',
        key: 'achievements.organizerSupreme',
        category: AchievementCategory.ORGANIZATION,
        type: AchievementType.MILESTONE,
        icon: 'FolderSpecial',
        color: '#673AB7',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.GOLD, target: 1, points: 100, unlocked: false }
        ]
    },

    // === CONSISTENCY ACHIEVEMENTS ===
    {
        id: 'consistency_keeper',
        key: 'achievements.consistencyKeeper',
        category: AchievementCategory.CONSISTENCY,
        type: AchievementType.STREAK,
        icon: 'Whatshot',
        color: '#FF5722',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 3, points: 25, unlocked: false },
            { level: AchievementLevel.SILVER, target: 7, points: 50, unlocked: false },
            { level: AchievementLevel.GOLD, target: 21, points: 100, unlocked: false },
            { level: AchievementLevel.DIAMOND, target: 60, points: 250, unlocked: false }
        ]
    },

    {
        id: 'weekend_warrior',
        key: 'achievements.weekendWarrior',
        category: AchievementCategory.CONSISTENCY,
        type: AchievementType.COUNTER,
        icon: 'Weekend',
        color: '#795548',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 2, points: 20, unlocked: false },
            { level: AchievementLevel.SILVER, target: 8, points: 40, unlocked: false },
            { level: AchievementLevel.GOLD, target: 20, points: 80, unlocked: false },
            { level: AchievementLevel.DIAMOND, target: 52, points: 160, unlocked: false }
        ]
    },

    // === EXPLORATION ACHIEVEMENTS ===
    {
        id: 'feature_explorer',
        key: 'achievements.featureExplorer',
        category: AchievementCategory.EXPLORATION,
        type: AchievementType.MILESTONE,
        icon: 'Explore',
        color: '#2196F3',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 1, points: 30, unlocked: false }
        ]
    },

    {
        id: 'calendar_master',
        key: 'achievements.calendarMaster',
        category: AchievementCategory.EXPLORATION,
        type: AchievementType.COUNTER,
        icon: 'CalendarToday',
        color: '#00BCD4',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 5, points: 15, unlocked: false },
            { level: AchievementLevel.SILVER, target: 25, points: 35, unlocked: false },
            { level: AchievementLevel.GOLD, target: 100, points: 70, unlocked: false }
        ]
    },

    // === MASTERY ACHIEVEMENTS ===
    {
        id: 'early_bird',
        key: 'achievements.earlyBird',
        category: AchievementCategory.MASTERY,
        type: AchievementType.COUNTER,
        icon: 'WbSunny',
        color: '#FFC107',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 5, points: 20, unlocked: false },
            { level: AchievementLevel.SILVER, target: 15, points: 40, unlocked: false },
            { level: AchievementLevel.GOLD, target: 50, points: 80, unlocked: false }
        ]
    },

    {
        id: 'night_owl',
        key: 'achievements.nightOwl',
        category: AchievementCategory.MASTERY,
        type: AchievementType.COUNTER,
        icon: 'NightsStay',
        color: '#3F51B5',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 5, points: 20, unlocked: false },
            { level: AchievementLevel.SILVER, target: 15, points: 40, unlocked: false },
            { level: AchievementLevel.GOLD, target: 50, points: 80, unlocked: false }
        ]
    },

    {
        id: 'perfectionist',
        key: 'achievements.perfectionist',
        category: AchievementCategory.MASTERY,
        type: AchievementType.MILESTONE,
        icon: 'Stars',
        color: '#E91E63',
        isHidden: true, // Hidden until discovered
        tiers: [
            { level: AchievementLevel.GOLD, target: 1, points: 150, unlocked: false }
        ]
    },

    // === SPECIAL ACHIEVEMENTS ===
    {
        id: 'first_steps',
        key: 'achievements.firstSteps',
        category: AchievementCategory.EXPLORATION,
        type: AchievementType.MILESTONE,
        icon: 'EmojiEvents',
        color: '#4CAF50',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 1, points: 5, unlocked: false }
        ]
    },

    {
        id: 'multitasker',
        key: 'achievements.multitasker',
        category: AchievementCategory.PRODUCTIVITY,
        type: AchievementType.COUNTER,
        icon: 'DynamicFeed',
        color: '#607D8B',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 10, points: 25, unlocked: false },
            { level: AchievementLevel.SILVER, target: 50, points: 50, unlocked: false },
            { level: AchievementLevel.GOLD, target: 200, points: 100, unlocked: false }
        ]
    },

    {
        id: 'time_master',
        key: 'achievements.timeMaster',
        category: AchievementCategory.MASTERY,
        type: AchievementType.COUNTER,
        icon: 'Schedule',
        color: '#FF6B6B',
        isHidden: false,
        tiers: [
            { level: AchievementLevel.BRONZE, target: 10, points: 30, unlocked: false },
            { level: AchievementLevel.SILVER, target: 50, points: 60, unlocked: false },
            { level: AchievementLevel.GOLD, target: 200, points: 120, unlocked: false }
        ]
    }
];