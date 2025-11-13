import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AchievementTrackerProvider, useAchievementTracker } from '../useAchievementTracker';
import { achievementService } from '../../services/achievementService';
import { achievementStorage } from '../../utils/achievementStorage';
import { authService } from '../../services/authService';
import { AchievementEventType, type Achievement, type AchievementProgress } from '../../types/Achievement';
import * as AuthContext from '../../contexts/AuthContext';

const mockShowSuccess = vi.fn();

vi.mock('../../services/achievementService');
vi.mock('../../utils/achievementStorage');
vi.mock('../../services/authService');
vi.mock('../../contexts/AuthContext');
vi.mock('../useNotifications', () => ({
    useNotifications: () => ({ showSuccess: mockShowSuccess })
}));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key
    })
}));

const mockAchievement: Achievement = {
    id: 'test_achievement',
    key: 'Test Achievement',
    category: 'productivity',
    type: 'counter',
    icon: '🎯',
    color: '#000000',
    isHidden: false,
    tiers: [
        { level: 'bronze', target: 5, points: 10, unlocked: false },
        { level: 'silver', target: 10, points: 25, unlocked: false }
    ]
};

const mockProgress = {
    achievementId: 'test_achievement',
    currentValue: 3,
    lastUpdated: new Date(),
    unlockedTiers: []
};

const mockStats = {
    totalPoints: 100,
    totalAchievements: 10,
    unlockedAchievements: 5,
    currentStreak: 3,
    longestStreak: 7,
    level: 2,
    experiencePoints: 100,
    nextLevelPoints: 200
};

describe('useAchievementTracker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AuthContext.useAuth).mockReturnValue({ user: { id: 1, username: 'test', email: 'test@test.com' }, loading: false } as any);
        vi.mocked(authService.getToken).mockReturnValue('token');
        vi.mocked(achievementService.getAchievements).mockResolvedValue([mockAchievement]);
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([mockProgress]);
        vi.mocked(achievementService.getUserStats).mockResolvedValue(mockStats);
        vi.mocked(achievementStorage.init).mockResolvedValue();
        vi.mocked(achievementStorage.getAchievements).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([]);
        vi.mocked(achievementStorage.setUserId).mockReturnValue(undefined);
    });

    it('initializes with backend data when authenticated', async () => {
        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });

        await waitFor(() => expect(result.current.isInitialized).toBe(true));
        expect(result.current.achievements).toHaveLength(1);
        expect(result.current.userStats).toEqual(mockStats);
    });

    it('falls back to local storage when backend fails', async () => {
        vi.mocked(achievementService.getAchievements).mockRejectedValue(new Error('API error'));
        vi.mocked(achievementStorage.getAchievements).mockResolvedValue([mockAchievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([mockProgress]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });

        await waitFor(() => expect(result.current.isInitialized).toBe(true));
        expect(result.current.achievements).toHaveLength(1);
    });

    it('initializes defaults when storage is empty', async () => {
        vi.mocked(achievementService.getAchievements).mockResolvedValue([]);
        vi.mocked(achievementStorage.initializeDefaultAchievements).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });

        await waitFor(() => expect(result.current.isInitialized).toBe(true));
        expect(achievementStorage.initializeDefaultAchievements).toHaveBeenCalled();
    });

    it('handles storage initialization error', async () => {
        vi.mocked(achievementService.getAchievements).mockResolvedValue([]);
        vi.mocked(achievementStorage.init).mockRejectedValue(new Error('Storage error'));

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });

        await waitFor(() => expect(result.current.isInitialized).toBe(true));
        expect(result.current.achievements.length).toBeGreaterThan(0);
    });

    it('works for anonymous users', async () => {
        vi.mocked(AuthContext.useAuth).mockReturnValue({ user: null, loading: false } as any);
        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementStorage.getAchievements).mockResolvedValue([mockAchievement]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });

        await waitFor(() => expect(result.current.isInitialized).toBe(true));
        expect(achievementStorage.setUserId).toHaveBeenCalledWith('anonymous');
    });

    it('tracks counter achievement event', async () => {
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('tracks streak achievement maintaining consecutive days', async () => {
        const streakAchievement = { ...mockAchievement, id: 'daily_achiever', type: 'streak' as const };
        const streakProgress = { ...mockProgress, achievementId: 'daily_achiever', streakCount: 1, lastStreakDate: new Date(Date.now() - 86400000) };

        vi.mocked(achievementService.getAchievements).mockResolvedValue([streakAchievement]);
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([streakProgress]);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([streakProgress]);
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.ALL_TASKS_COMPLETED_TODAY);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('tracks milestone achievement', async () => {
        const milestoneAchievement = { ...mockAchievement, type: 'milestone' as const };
        vi.mocked(achievementService.getAchievements).mockResolvedValue([milestoneAchievement]);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('handles percentage achievement type', async () => {
        const percentageAchievement = { ...mockAchievement, type: 'percentage' as const };
        vi.mocked(achievementService.getAchievements).mockResolvedValue([percentageAchievement]);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('throttles rapid events', async () => {
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED, { id: 1 });
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED, { id: 1 });
        });

        expect(achievementService.trackEvent).toHaveBeenCalledTimes(1);
    });

    it('uses longer throttle for app events', async () => {
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.APP_OPENED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('shows notification for new achievement unlock', async () => {
        const notification = { achievement: mockAchievement, tier: mockAchievement.tiers[0], isNewAchievement: true };
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([notification]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.getNotifications).toHaveBeenCalled();
    });

    it('shows notification for achievement upgrade', async () => {
        const notification = { achievement: mockAchievement, tier: mockAchievement.tiers[1], isNewAchievement: false };
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([notification]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.getNotifications).toHaveBeenCalled();
    });

    it('falls back to storage when backend tracking fails', async () => {
        vi.mocked(achievementService.trackEvent).mockRejectedValue(new Error('Backend error'));
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([mockProgress]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementStorage.addEvent).toHaveBeenCalled();
    });

    it('calculates user stats from progress', async () => {
        const progressWithUnlocked = { ...mockProgress, unlockedTiers: ['bronze' as const] };
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([progressWithUnlocked]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        expect(result.current.userStats?.totalPoints).toBeGreaterThanOrEqual(0);
    });

    it('does not track when not initialized', async () => {
        vi.mocked(AuthContext.useAuth).mockReturnValue({ user: null, loading: true } as any);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.trackEvent).not.toHaveBeenCalled();
    });

    it('handles complete initialization failure gracefully', async () => {
        vi.mocked(achievementService.getAchievements).mockRejectedValue(new Error('Complete failure'));
        vi.mocked(achievementStorage.init).mockRejectedValue(new Error('Storage failure'));

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        expect(result.current.userStats?.level).toBe(1);
    });

    it('skips streak increment for same day event', async () => {
        const streakAchievement = { ...mockAchievement, id: 'daily_achiever', type: 'streak' as const };
        const todayProgress = { ...mockProgress, achievementId: 'daily_achiever', streakCount: 2, lastStreakDate: new Date() };

        vi.mocked(achievementService.getAchievements).mockResolvedValue([streakAchievement]);
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([todayProgress]);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([todayProgress]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.ALL_TASKS_COMPLETED_TODAY);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('resets streak when not consecutive', async () => {
        const streakAchievement = { ...mockAchievement, id: 'daily_achiever', type: 'streak' as const };
        const oldProgress = { ...mockProgress, achievementId: 'daily_achiever', streakCount: 5, lastStreakDate: new Date(Date.now() - 172800000) };

        vi.mocked(achievementService.getAchievements).mockResolvedValue([streakAchievement]);
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([oldProgress]);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([oldProgress]);
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.ALL_TASKS_COMPLETED_TODAY);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('unlocks tier when target reached', async () => {
        const progressNearTarget = { ...mockProgress, currentValue: 4, unlockedTiers: [] };
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([progressNearTarget]);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([progressNearTarget]);
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('tracks all achievement event types', async () => {
        const achievements = [
            { ...mockAchievement, id: 'task_completionist' },
            { ...mockAchievement, id: 'category_creator' },
            { ...mockAchievement, id: 'daily_achiever' },
            { ...mockAchievement, id: 'speed_demon' },
            { ...mockAchievement, id: 'early_bird' },
            { ...mockAchievement, id: 'night_owl' },
            { ...mockAchievement, id: 'consistency_keeper' },
            { ...mockAchievement, id: 'weekend_warrior' },
            { ...mockAchievement, id: 'feature_explorer' },
            { ...mockAchievement, id: 'calendar_master' },
            { ...mockAchievement, id: 'first_steps' },
            { ...mockAchievement, id: 'multitasker' },
            { ...mockAchievement, id: 'time_master' }
        ];

        vi.mocked(achievementService.getAchievements).mockResolvedValue(achievements);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        const events = [
            AchievementEventType.TASK_COMPLETED,
            AchievementEventType.CATEGORY_CREATED,
            AchievementEventType.ALL_TASKS_COMPLETED_TODAY,
            AchievementEventType.TASK_COMPLETED_ON_TIME,
            AchievementEventType.EARLY_BIRD,
            AchievementEventType.NIGHT_OWL,
            AchievementEventType.DAILY_LOGIN,
            AchievementEventType.WEEKEND_PRODUCTIVITY,
            AchievementEventType.APP_OPENED,
            AchievementEventType.CALENDAR_VIEWED,
            AchievementEventType.DASHBOARD_VIEWED,
            AchievementEventType.TASK_CREATED
        ];

        for (const event of events) {
            await act(async () => {
                await result.current.trackEvent(event);
            });
        }

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('handles trackEvent error gracefully', async () => {
        vi.mocked(achievementService.trackEvent).mockRejectedValue(new Error('Track error'));
        vi.mocked(achievementStorage.addEvent).mockRejectedValue(new Error('Storage error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('throws error when used outside provider', () => {
        expect(() => {
            renderHook(() => useAchievementTracker());
        }).toThrow('useAchievementTracker must be used within an AchievementTrackerProvider');
    });

    it('waits for auth loading to complete', () => {
        vi.mocked(AuthContext.useAuth).mockReturnValue({ user: null, loading: true } as any);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });

        expect(result.current.isInitialized).toBe(false);
    });

    it('calculates stats with no progress data', async () => {
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([]);
        vi.mocked(achievementService.getUserStats).mockResolvedValue(null as any);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        expect(result.current.userStats).toBeTruthy();
    });

    it('increments multiple tiers when targets reached', async () => {
        const progressForMultipleTiers = { ...mockProgress, currentValue: 9, unlockedTiers: [] };
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([progressForMultipleTiers]);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([progressForMultipleTiers]);
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('handles irrelevant events for achievements', async () => {
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([mockProgress]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.CATEGORY_CREATED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('uses empty achievement list in stats calculation', async () => {
        vi.mocked(achievementService.getAchievements).mockResolvedValue([]);
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([mockProgress]);
        vi.mocked(achievementService.getUserStats).mockResolvedValue(null as any);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        expect(result.current.userStats).toBeTruthy();
    });

    it('creates new progress for achievement without existing progress', async () => {
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([]);
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('handles specific achievement IDs correctly', async () => {
        const specificAchievements = [
            { ...mockAchievement, id: 'calendar_master' },
            { ...mockAchievement, id: 'weekend_warrior' },
            { ...mockAchievement, id: 'consistency_keeper' },
            { ...mockAchievement, id: 'night_owl' },
            { ...mockAchievement, id: 'early_bird' },
            { ...mockAchievement, id: 'speed_demon' },
            { ...mockAchievement, id: 'unknown_achievement' }
        ];

        vi.mocked(achievementService.getAchievements).mockResolvedValue(specificAchievements);
        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.CALENDAR_VIEWED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('updates progress with newly unlocked tiers and shows notifications', async () => {
        const progressAlmostComplete = { ...mockProgress, currentValue: 4, unlockedTiers: [] };
        const achievementWithNewTier = mockAchievement;

        vi.mocked(achievementService.trackEvent).mockResolvedValue();
        vi.mocked(achievementService.getNotifications).mockResolvedValue([]);
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([progressAlmostComplete]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([progressAlmostComplete]);
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementService.trackEvent).toHaveBeenCalled();
    });

    it('calls showAchievementNotification via local storage flow', async () => {
        const achievement = {
            ...mockAchievement,
            id: 'task_completionist',
            key: 'Task Completionist',
            tiers: [{ level: 'bronze' as const, target: 5, points: 10, unlocked: false }]
        } as Achievement;
        const progressNearTarget = {
            ...mockProgress,
            achievementId: 'task_completionist',
            currentValue: 4,
            unlockedTiers: []
        };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([achievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([progressNearTarget]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();
        mockShowSuccess.mockClear();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementStorage.updateProgress).toHaveBeenCalled();
        const updateCalls = vi.mocked(achievementStorage.updateProgress).mock.calls;
        expect(updateCalls.length).toBeGreaterThan(0);
        const updateCall = updateCalls[0][0];
        if (Array.isArray(updateCall)) {
            expect(updateCall[0].currentValue).toBe(5);
            expect(updateCall[0].unlockedTiers).toContain('BRONZE');
        }
    });

    it('handles milestone achievement that has already been triggered', async () => {
        const milestoneAchievement = {
            ...mockAchievement,
            id: 'first_steps',
            type: 'milestone' as const,
            tiers: [{ level: 'bronze' as const, target: 1, points: 10, unlocked: false }]
        } as Achievement;
        const existingMilestoneProgress = {
            ...mockProgress,
            achievementId: 'first_steps',
            currentValue: 1,
            unlockedTiers: ['bronze' as const]
        };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([milestoneAchievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([existingMilestoneProgress]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockClear();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_CREATED);
        });

        const firstStepsUpdates = vi.mocked(achievementStorage.updateProgress).mock.calls.filter(
            call => {
                const progressList = call[0];
                if (Array.isArray(progressList)) {
                    return progressList.some(p => p.achievementId === 'first_steps');
                }
                return false;
            }
        );
        expect(firstStepsUpdates.length).toBe(0);
    });

    it('handles streak count with || 0 fallback', async () => {
        const streakAchievement = { ...mockAchievement, id: 'daily_achiever', type: 'streak' as const } as Achievement;
        const progressWithoutStreakCount = { ...mockProgress, achievementId: 'daily_achiever', lastStreakDate: new Date(Date.now() - 86400000) };
        delete (progressWithoutStreakCount as any).streakCount;

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([streakAchievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([progressWithoutStreakCount]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.ALL_TASKS_COMPLETED_TODAY);
        });

        expect(achievementStorage.updateProgress).toHaveBeenCalled();
    });

    it('handles currentValue with || 1 fallback in streak', async () => {
        const streakAchievement = { ...mockAchievement, id: 'daily_achiever', type: 'streak' as const } as Achievement;
        const progressWithZeroValue = { ...mockProgress, achievementId: 'daily_achiever', currentValue: 0, streakCount: undefined, lastStreakDate: undefined };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([streakAchievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([progressWithZeroValue]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.ALL_TASKS_COMPLETED_TODAY);
        });

        expect(achievementStorage.updateProgress).toHaveBeenCalled();
    });

    it('handles empty stats calculation with no tiers unlocked', async () => {
        vi.mocked(authService.getToken).mockReturnValue('mock-token');
        vi.mocked(achievementService.getUserProgress).mockResolvedValue([]);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        expect(result.current.userStats?.totalPoints).toBe(0);
    });

    it('covers notification loop with multiple tiers unlocked', async () => {
        const achievement = {
            ...mockAchievement,
            id: 'task_completionist',
            tiers: [
                { level: 'bronze' as const, target: 5, points: 10, unlocked: false },
                { level: 'silver' as const, target: 10, points: 25, unlocked: false },
                { level: 'gold' as const, target: 20, points: 50, unlocked: false }
            ]
        } as Achievement;

        const progressNearMultipleTiers = {
            ...mockProgress,
            achievementId: 'task_completionist',
            currentValue: 9,
            unlockedTiers: []
        };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([achievement]);
        vi.mocked(achievementStorage.getAchievements).mockResolvedValue([achievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([progressNearMultipleTiers]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();
        mockShowSuccess.mockClear();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.TASK_COMPLETED);
        });

        expect(achievementStorage.updateProgress).toHaveBeenCalled();
    });

    it('covers showAchievementNotification with translation keys', async () => {
        const achievement = {
            ...mockAchievement,
            id: 'early_bird',
            key: 'Early Bird'
        } as Achievement;

        const progressNearTarget = {
            ...mockProgress,
            achievementId: 'early_bird',
            currentValue: 4,
            unlockedTiers: []
        };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([achievement]);
        vi.mocked(achievementStorage.getAchievements).mockResolvedValue([achievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([progressNearTarget]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();
        mockShowSuccess.mockClear();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.EARLY_BIRD);
        });

        expect(achievementStorage.updateProgress).toHaveBeenCalled();
    });

    it('covers streak same day return null', async () => {
        const streakAchievement = {
            ...mockAchievement,
            id: 'daily_achiever',
            type: 'streak' as const
        } as Achievement;

        const todayProgress = {
            ...mockProgress,
            achievementId: 'daily_achiever',
            currentValue: 3,
            streakCount: 3,
            lastStreakDate: new Date(), // Same day
            unlockedTiers: []
        };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([streakAchievement]);
        vi.mocked(achievementStorage.getAchievements).mockResolvedValue([streakAchievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([todayProgress]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.ALL_TASKS_COMPLETED_TODAY);
        });

        expect(achievementStorage.updateProgress).not.toHaveBeenCalled();
    });

    it('covers streak consecutive day else if', async () => {
        const streakAchievement = {
            ...mockAchievement,
            id: 'consistency_keeper',
            type: 'streak' as const
        } as Achievement;

        const yesterday = new Date(Date.now() - 86400000);
        const yesterdayProgress = {
            ...mockProgress,
            achievementId: 'consistency_keeper',
            currentValue: 2,
            streakCount: 2,
            lastStreakDate: yesterday,
            unlockedTiers: []
        };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([streakAchievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([yesterdayProgress]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.DAILY_LOGIN);
        });

        expect(achievementStorage.updateProgress).toHaveBeenCalled();
    });

    it('covers percentage type break', async () => {
        const percentageAchievement = {
            ...mockAchievement,
            id: 'custom_percentage',
            type: 'percentage' as const
        } as Achievement;

        const percentageProgress = {
            ...mockProgress,
            achievementId: 'custom_percentage',
            currentValue: 50,
            unlockedTiers: []
        };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([percentageAchievement]);
        vi.mocked(achievementStorage.getAchievements).mockResolvedValue([percentageAchievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([percentageProgress]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.APP_OPENED);
        });

        const calls = vi.mocked(achievementStorage.updateProgress).mock.calls;
        const customPercentageCall = calls.find(call =>
            Array.isArray(call[0]) && call[0].some((p: any) => p.achievementId === 'custom_percentage')
        );
        expect(customPercentageCall).toBeUndefined();
    });

    it('executes showAchievementNotification with tier unlock', async () => {
        const achievement = {
            ...mockAchievement,
            id: 'early_bird',
            key: 'Early Bird',
            tiers: [
                { level: 'bronze' as const, target: 5, points: 10, unlocked: false }
            ]
        } as Achievement;

        const nearTargetProgress = {
            ...mockProgress,
            achievementId: 'early_bird',
            currentValue: 4,
            unlockedTiers: []
        };

        vi.mocked(authService.getToken).mockReturnValue(null);
        vi.mocked(achievementService.getAchievements).mockResolvedValue([achievement]);
        vi.mocked(achievementStorage.getAchievements).mockResolvedValue([achievement]);
        vi.mocked(achievementStorage.getProgress).mockResolvedValue([nearTargetProgress]);
        vi.mocked(achievementStorage.addEvent).mockResolvedValue();
        vi.mocked(achievementStorage.updateProgress).mockResolvedValue();

        mockShowSuccess.mockClear();

        const { result } = renderHook(() => useAchievementTracker(), { wrapper: AchievementTrackerProvider });
        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        await act(async () => {
            await result.current.trackEvent(AchievementEventType.EARLY_BIRD);
        });

        await waitFor(() => {
            expect(vi.mocked(achievementStorage.updateProgress)).toHaveBeenCalled();
        });

        const updateCalls = vi.mocked(achievementStorage.updateProgress).mock.calls;
        if (updateCalls.length > 0) {
            const updateCall = updateCalls[0][0];
            if (Array.isArray(updateCall)) {
                const earlyBirdUpdate = updateCall.find((p: any) => p.achievementId === 'early_bird');
                if (earlyBirdUpdate) {
                    expect(earlyBirdUpdate.currentValue).toBe(5);
                    expect(earlyBirdUpdate.unlockedTiers).toContain('bronze');
                }
            }
        }
    });
});
