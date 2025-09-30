import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAchievementTracker } from '../useAchievementTracker';
import { TestProviders } from '../../__tests__/utils/testProviders';
import { AchievementEventType } from '../../types/Achievement';
import { achievementStorage } from '../../utils/achievementStorage';
import { authService } from '../../services/authService';
import { achievementService } from '../../services/achievementService';

const mockShowSuccess = vi.fn();

vi.mock('../../utils/achievementStorage', () => ({
    achievementStorage: {
        setUserId: vi.fn(),
        init: vi.fn().mockResolvedValue(undefined),
        getAchievements: vi.fn().mockResolvedValue([]),
        getProgress: vi.fn().mockResolvedValue([]),
        initializeDefaultAchievements: vi.fn().mockResolvedValue(undefined),
        addEvent: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('../../services/achievementService', () => ({
    achievementService: {
        getAchievements: vi.fn().mockResolvedValue([]),
        getUserProgress: vi.fn().mockResolvedValue([]),
        getUserStats: vi.fn().mockResolvedValue(null),
        trackEvent: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('../../services/authService', () => ({
    authService: {
        getToken: vi.fn().mockReturnValue(null as string | null),
        getCurrentUser: vi.fn().mockResolvedValue({ id: 1, username: 'test', email: 'test@test.com', createdAt: new Date().toISOString() })
    }
}));

vi.mock('../useNotifications', () => ({
    useNotifications: () => ({
        showSuccess: mockShowSuccess
    })
}));

const mockStorage = vi.mocked(achievementStorage);
const mockAuthService = vi.mocked(authService);
const mockAchievementService = vi.mocked(achievementService);

const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestProviders>
            {children}
        </TestProviders>
    );
};

describe('useAchievementTracker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        expect(result.current.achievements).toEqual([]);
        expect(result.current.progress).toEqual([]);
        expect(result.current.userStats).toBeNull();
        expect(result.current.isInitialized).toBe(false);
        expect(typeof result.current.trackEvent).toBe('function');
    });

    it('should handle authenticated user initialization', async () => {
        mockAuthService.getToken.mockReturnValue('test-token');

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        expect(mockStorage.setUserId).toHaveBeenCalledWith('1');
    });

    it('should initialize with stored achievements when available', async () => {
        mockAuthService.getToken.mockReturnValue(null);
        mockStorage.getAchievements.mockResolvedValue([{
            id: 'stored_test',
            key: 'Stored Test',
            category: 'productivity' as any,
            type: 'counter' as any,
            icon: 'test',
            color: '#000',
            tiers: [],
            isHidden: false
        }]);

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        expect(result.current.achievements.length).toBeGreaterThan(0);
    });

    it('should initialize default achievements when storage is empty', async () => {
        mockAuthService.getToken.mockReturnValue(null);
        mockStorage.getAchievements.mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        expect(mockStorage.initializeDefaultAchievements).toHaveBeenCalled();
    });

    it('should track events when initialized', async () => {
        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        await result.current.trackEvent(AchievementEventType.TASK_COMPLETED, { taskId: 'test' });
        expect(mockStorage.addEvent).toHaveBeenCalled();
    });

    it('should handle streak achievements correctly', async () => {
        mockAuthService.getToken.mockReturnValue(null);

        const yesterday = new Date(Date.now() - 86400000);
        const mockStreakProgress = [{
            achievementId: 'consistency_keeper',
            currentValue: 2,
            lastUpdated: yesterday,
            unlockedTiers: [],
            streakCount: 2,
            lastStreakDate: yesterday
        }];

        let getProgressCallCount = 0;
        mockStorage.getProgress.mockImplementation(() => {
            getProgressCallCount++;
            if (getProgressCallCount <= 2) {
                return Promise.resolve([]);
            }
            return Promise.resolve(mockStreakProgress);
        });

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        await result.current.trackEvent(AchievementEventType.DAILY_LOGIN, {});
        expect(mockStorage.addEvent).toHaveBeenCalled();
    });



    it('should handle backend success with stats', async () => {
        mockAuthService.getToken.mockReturnValue('test-token');
        mockAchievementService.getUserProgress.mockResolvedValue([]);
        mockAchievementService.getUserStats.mockResolvedValue({
            totalPoints: 10,
            level: 1,
            totalAchievements: 15,
            unlockedAchievements: 1,
            currentStreak: 0,
            longestStreak: 0,
            experiencePoints: 10,
            nextLevelPoints: 100
        });

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        await result.current.trackEvent(AchievementEventType.TASK_COMPLETED, { taskId: 'test' });
        expect(mockAchievementService.trackEvent).toHaveBeenCalled();
    });

    it('should handle event tracking correctly', async () => {
        mockAuthService.getToken.mockReturnValue(null);

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        mockStorage.addEvent.mockClear();

        await result.current.trackEvent(AchievementEventType.TASK_COMPLETED, { id: 'task1' });
        expect(mockStorage.addEvent).toHaveBeenCalledTimes(1);

        await result.current.trackEvent(AchievementEventType.CALENDAR_VIEWED, {});
        expect(mockStorage.addEvent).toHaveBeenCalledTimes(2);
    });

    it('should handle tracking errors gracefully', async () => {
        mockStorage.addEvent.mockRejectedValue(new Error('Storage error'));

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        await expect(result.current.trackEvent(AchievementEventType.TASK_COMPLETED, { taskId: 'test' }))
            .resolves.not.toThrow();
    });

    it('should throttle events within throttle window', async () => {
        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        mockStorage.addEvent.mockClear();

        const eventData = { id: 'throttle-test-task' };

        await result.current.trackEvent(AchievementEventType.TASK_COMPLETED, eventData);
        expect(mockStorage.addEvent).toHaveBeenCalledTimes(1);

        await result.current.trackEvent(AchievementEventType.TASK_COMPLETED, eventData);
        expect(mockStorage.addEvent).toHaveBeenCalledTimes(1);
    });

    it('should return early when backend processing succeeds', async () => {
        mockAuthService.getToken.mockReturnValue('test-token');
        mockAchievementService.trackEvent.mockResolvedValue(undefined);
        mockAchievementService.getUserProgress.mockResolvedValue([{
            achievementId: 'test',
            currentValue: 1,
            lastUpdated: new Date(),
            unlockedTiers: ['bronze']
        }]);
        mockAchievementService.getUserStats.mockResolvedValue({
            totalPoints: 10,
            level: 1,
            totalAchievements: 1,
            unlockedAchievements: 1,
            currentStreak: 0,
            longestStreak: 0,
            experiencePoints: 10,
            nextLevelPoints: 100
        });

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        mockStorage.addEvent.mockClear();
        await result.current.trackEvent(AchievementEventType.TASK_COMPLETED, { taskId: 'test' });

        expect(mockStorage.addEvent).not.toHaveBeenCalled();
    });




    it('should handle backend authentication and service integration', async () => {
        mockAuthService.getToken.mockReturnValue('test-token');
        mockAuthService.getCurrentUser.mockRejectedValue(new Error('Auth error'));

        const { result: result1 } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result1.current.isInitialized).toBe(true);
        });

        expect(mockStorage.setUserId).toHaveBeenCalledWith('anonymous');

        vi.clearAllMocks();

        mockAuthService.getToken.mockReturnValue('test-token');
        mockAuthService.getCurrentUser.mockResolvedValue({
            id: 123,
            username: 'testuser',
            email: 'test@example.com',
            createdAt: new Date().toISOString()
        });
        mockAchievementService.getAchievements.mockResolvedValue([{
            id: 'backend_achievement',
            key: 'Backend Achievement',
            category: 'productivity' as any,
            type: 'counter' as any,
            icon: 'backend',
            color: '#green',
            tiers: [{ level: 'bronze', target: 1, points: 10, unlocked: false }],
            isHidden: false
        }]);
        mockAchievementService.getUserProgress.mockResolvedValue([]);

        const { result: result2 } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result2.current.isInitialized).toBe(true);
        });

        expect(result2.current.achievements).toHaveLength(1);

        mockAchievementService.trackEvent.mockResolvedValue(undefined);
        mockAchievementService.getUserProgress.mockResolvedValue([]);
        mockAchievementService.getUserStats.mockResolvedValue({
            totalPoints: 10,
            level: 1,
            totalAchievements: 1,
            unlockedAchievements: 0,
            currentStreak: 0,
            longestStreak: 0,
            experiencePoints: 10,
            nextLevelPoints: 100
        });

        mockStorage.addEvent.mockClear();
        await result2.current.trackEvent(AchievementEventType.TASK_COMPLETED, { taskId: 'test' });

        expect(mockStorage.addEvent).not.toHaveBeenCalled();
        expect(mockAchievementService.trackEvent).toHaveBeenCalled();
    });



    it('should handle different achievement types and events', async () => {
        mockAuthService.getToken.mockReturnValue(null);

        mockStorage.getAchievements.mockResolvedValue([
            {
                id: 'calendar_master',
                key: 'Calendar Master',
                category: 'productivity' as any,
                type: 'percentage' as any,
                icon: 'calendar',
                color: '#blue',
                tiers: [{ level: 'bronze' as any, target: 50, points: 15, unlocked: false }],
                isHidden: false
            },
            {
                id: 'task_completionist',
                key: 'Task Completionist',
                category: 'productivity' as any,
                type: 'counter' as any,
                icon: 'task',
                color: '#green',
                tiers: [{ level: 'bronze' as any, target: 1, points: 10, unlocked: false }],
                isHidden: false
            }
        ]);

        mockStorage.getProgress.mockResolvedValue([]);

        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
        });

        await result.current.trackEvent(AchievementEventType.CALENDAR_VIEWED, { data: 'test' });
        await result.current.trackEvent(AchievementEventType.DAILY_LOGIN, {});

        expect(mockStorage.addEvent).toHaveBeenCalledTimes(2);
    });
});