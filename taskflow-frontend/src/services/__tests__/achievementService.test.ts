import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { achievementService } from '../achievementService';
import { API_ENDPOINTS } from '../../config/api';
import { AchievementEventType } from '../../types/Achievement';

const mockFetch = (responseData: any, ok = true, status = 200) => {
    return vi.fn().mockResolvedValue({
        ok,
        status,
        json: vi.fn().mockResolvedValue(responseData)
    });
};

const mockFetchReject = (error: Error) => {
    return vi.fn().mockRejectedValue(error);
};

vi.mock('../authService', () => ({
    authService: {
        getToken: vi.fn(() => 'mock-token')
    }
}));

describe('AchievementService', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('getAchievements', () => {
        it('should fetch achievements successfully', async () => {
            const mockAchievements = [
                {
                    id: 'test-achievement',
                    key: 'achievements.test',
                    category: 'productivity',
                    type: 'counter',
                    icon: 'CheckCircle',
                    color: '#4CAF50',
                    isHidden: false,
                    tiers: []
                }
            ];

            global.fetch = mockFetch(mockAchievements);
            const result = await achievementService.getAchievements();

            expect(global.fetch).toHaveBeenCalledWith(
                API_ENDPOINTS.achievements.base,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-token'
                    })
                })
            );
            expect(result).toEqual(mockAchievements);
        });

        it('should return empty array on error', async () => {
            global.fetch = mockFetchReject(new Error('Network error'));
            const result = await achievementService.getAchievements();
            expect(result).toEqual([]);
        });

        it('should return empty array on non-ok response', async () => {
            global.fetch = mockFetch({}, false, 500);
            const result = await achievementService.getAchievements();
            expect(result).toEqual([]);
        });
    });

    describe('getUserProgress', () => {
        it('should fetch user progress successfully', async () => {
            const mockProgress = [
                {
                    achievementId: 'test-achievement',
                    currentValue: 10,
                    unlockedTiers: ['bronze'],
                    lastUpdated: new Date().toISOString()
                }
            ];

            global.fetch = mockFetch(mockProgress);
            const result = await achievementService.getUserProgress();

            expect(global.fetch).toHaveBeenCalledWith(
                API_ENDPOINTS.achievements.progress,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-token'
                    })
                })
            );
            expect(result).toEqual(mockProgress);
        });
    });

    describe('trackEvent', () => {
        it('should track achievement event successfully', async () => {
            const mockEvent = {
                type: AchievementEventType.TASK_COMPLETED,
                data: { taskId: 1 },
                timestamp: new Date()
            };

            global.fetch = mockFetch({});
            await achievementService.trackEvent(mockEvent);

            expect(global.fetch).toHaveBeenCalledWith(
                API_ENDPOINTS.achievements.trackEvent,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mock-token'
                    }),
                    body: JSON.stringify({
                        Type: mockEvent.type,
                        Data: JSON.stringify(mockEvent.data)
                    })
                })
            );
        });

        it('should handle track event error', async () => {
            const mockEvent = {
                type: AchievementEventType.TASK_COMPLETED,
                data: { taskId: 1 },
                timestamp: new Date()
            };

            global.fetch = mockFetch({}, false, 500);

            await expect(achievementService.trackEvent(mockEvent)).rejects.toThrow();
        });
    });

    describe('getUserStats', () => {
        it('should fetch user stats successfully', async () => {
            const mockStats = {
                totalPoints: 100,
                totalAchievements: 10,
                unlockedAchievements: 3,
                currentStreak: 5,
                longestStreak: 10,
                level: 2,
                experiencePoints: 50,
                nextLevelPoints: 200
            };

            global.fetch = mockFetch(mockStats);
            const result = await achievementService.getUserStats();

            expect(result).toEqual(mockStats);
        });

        it('should return null on error', async () => {
            global.fetch = mockFetchReject(new Error('Network error'));
            const result = await achievementService.getUserStats();
            expect(result).toBeNull();
        });

        it('should return null on non-ok response', async () => {
            global.fetch = mockFetch({}, false, 500);
            const result = await achievementService.getUserStats();
            expect(result).toBeNull();
        });
    });

    describe('updateProgress', () => {
        const mockProgress = {
            achievementId: 'test-achievement',
            currentValue: 5,
            unlockedTiers: ['bronze' as const],
            lastUpdated: new Date()
        };

        it('should update progress successfully', async () => {
            global.fetch = mockFetch({});
            await achievementService.updateProgress(mockProgress);

            expect(global.fetch).toHaveBeenCalledWith(
                API_ENDPOINTS.achievements.progress,
                expect.objectContaining({
                    method: 'PUT',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mock-token'
                    }),
                    body: JSON.stringify(mockProgress)
                })
            );
        });

        it('should throw error on failed update', async () => {
            global.fetch = mockFetch({}, false, 500);

            await expect(achievementService.updateProgress(mockProgress)).rejects.toThrow();
        });

        it('should throw error on network failure', async () => {
            global.fetch = mockFetchReject(new Error('Network error'));

            await expect(achievementService.updateProgress(mockProgress)).rejects.toThrow();
        });
    });

    describe('initializeUserAchievements', () => {
        it('should initialize user achievements successfully', async () => {
            global.fetch = mockFetch({});
            await achievementService.initializeUserAchievements();

            expect(global.fetch).toHaveBeenCalledWith(
                API_ENDPOINTS.achievements.initialize,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-token'
                    })
                })
            );
        });

        it('should throw error on failed initialization', async () => {
            global.fetch = mockFetch({}, false, 500);

            await expect(achievementService.initializeUserAchievements()).rejects.toThrow();
        });

        it('should throw error on network failure', async () => {
            global.fetch = mockFetchReject(new Error('Network error'));

            await expect(achievementService.initializeUserAchievements()).rejects.toThrow();
        });
    });

    describe('getUserProgress error handling', () => {
        it('should return empty array on non-ok response', async () => {
            global.fetch = mockFetch({}, false, 500);
            const result = await achievementService.getUserProgress();
            expect(result).toEqual([]);
        });
    });

    describe('trackEvent with detailed error response', () => {
        it('should handle detailed error response', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                text: vi.fn().mockResolvedValue('Detailed error message')
            };
            global.fetch = vi.fn().mockResolvedValue(mockResponse);

            const mockEvent = {
                type: AchievementEventType.TASK_COMPLETED,
                data: { taskId: 1 },
                timestamp: new Date()
            };

            await expect(achievementService.trackEvent(mockEvent)).rejects.toThrow();
            expect(mockResponse.text).toHaveBeenCalled();
        });
    });

    describe('getAuthHeaders', () => {
        it('should include authorization header when token is present', async () => {
            const mockAuthService = await import('../authService');
            mockAuthService.authService.getToken = vi.fn(() => 'test-token');

            global.fetch = mockFetch([]);
            await achievementService.getAchievements();

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token'
                    })
                })
            );
        });

        it('should not include authorization header when token is null', async () => {
            const mockAuthService = await import('../authService');
            mockAuthService.authService.getToken = vi.fn(() => null);

            global.fetch = mockFetch([]);
            await achievementService.getAchievements();

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.not.objectContaining({
                        'Authorization': expect.any(String)
                    })
                })
            );
        });
    });

    describe('trackEvent data serialization', () => {
        it('should serialize event data when present', async () => {
            const mockEvent = {
                type: AchievementEventType.TASK_COMPLETED,
                data: { taskId: 1, title: 'Test Task' },
                timestamp: new Date()
            };

            global.fetch = mockFetch({});
            await achievementService.trackEvent(mockEvent);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({
                        Type: mockEvent.type,
                        Data: JSON.stringify(mockEvent.data)
                    })
                })
            );
        });

        it('should set data to null when event data is undefined', async () => {
            const mockEvent = {
                type: AchievementEventType.APP_OPENED,
                timestamp: new Date()
            };

            global.fetch = mockFetch({});
            await achievementService.trackEvent(mockEvent);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({
                        Type: mockEvent.type,
                        Data: null
                    })
                })
            );
        });
    });
});