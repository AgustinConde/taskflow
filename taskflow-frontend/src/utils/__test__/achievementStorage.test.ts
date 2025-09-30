import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AchievementStorage } from '../achievementStorage';
import type { Achievement, AchievementProgress, AchievementEvent } from '../../types/Achievement';
import { AchievementEventType, AchievementCategory, AchievementType } from '../../types/Achievement';

const mockDB = {
    createObjectStore: vi.fn().mockReturnValue({
        createIndex: vi.fn()
    }),
    deleteObjectStore: vi.fn(),
    objectStoreNames: {
        contains: vi.fn().mockReturnValue(false)
    },
    transaction: vi.fn()
};

const mockTransaction = {
    objectStore: vi.fn(),
    onerror: null,
    onsuccess: null
};

const mockObjectStore = {
    get: vi.fn(),
    getAll: vi.fn(),
    put: vi.fn(),
    add: vi.fn(),
    clear: vi.fn(),
    createIndex: vi.fn(),
    index: vi.fn()
};

const mockIndex = {
    getAll: vi.fn()
};

const mockRequest = {
    result: null,
    error: null,
    onerror: vi.fn(),
    onsuccess: vi.fn(),
    onupgradeneeded: vi.fn()
};

Object.defineProperty(global, 'indexedDB', {
    value: {
        open: vi.fn()
    },
    writable: true
});

describe('AchievementStorage', () => {
    let storage: AchievementStorage;
    let mockOpenRequest: any;

    beforeEach(() => {
        storage = new AchievementStorage();
        mockOpenRequest = { ...mockRequest };
        (global.indexedDB.open as any).mockReturnValue(mockOpenRequest);
        mockTransaction.objectStore.mockReturnValue(mockObjectStore);
        mockObjectStore.index.mockReturnValue(mockIndex);
        mockDB.transaction.mockReturnValue(mockTransaction);

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('setUserId', () => {
        it('should set user ID', () => {
            storage.setUserId('user123');
            expect(storage['currentUserId']).toBe('user123');
        });

        it('should handle null user ID', () => {
            storage.setUserId(null);
            expect(storage['currentUserId']).toBeNull();
        });
    });

    describe('init', () => {
        it('should initialize database successfully', async () => {
            const initPromise = storage.init();

            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();

            await expect(initPromise).resolves.toBeUndefined();
            expect(global.indexedDB.open).toHaveBeenCalledWith('TaskFlowAchievements', 2);
        });

        it('should handle database opening error', async () => {
            const initPromise = storage.init();

            const error = new Error('Failed to open database');
            mockOpenRequest.error = error;
            mockOpenRequest.onerror();

            await expect(initPromise).rejects.toThrow(error);
        });

        it('should handle database upgrade', async () => {
            const initPromise = storage.init();

            const upgradeEvent = {
                target: { result: mockDB }
            };
            mockOpenRequest.onupgradeneeded(upgradeEvent);

            expect(mockDB.createObjectStore).toHaveBeenCalledWith('achievements', { keyPath: 'id' });
            expect(mockDB.createObjectStore).toHaveBeenCalledWith('progress', { keyPath: ['userId', 'achievementId'] });
            expect(mockDB.createObjectStore).toHaveBeenCalledWith('events', { keyPath: 'id', autoIncrement: true });

            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();

            await expect(initPromise).resolves.toBeUndefined();
        });

        it('should delete existing object stores during upgrade', async () => {
            const initPromise = storage.init();

            mockDB.objectStoreNames.contains.mockReturnValue(true);

            const upgradeEvent = {
                target: { result: mockDB }
            };
            mockOpenRequest.onupgradeneeded(upgradeEvent);

            expect(mockDB.deleteObjectStore).toHaveBeenCalledWith('achievements');
            expect(mockDB.deleteObjectStore).toHaveBeenCalledWith('progress');
            expect(mockDB.deleteObjectStore).toHaveBeenCalledWith('events');

            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();

            await expect(initPromise).resolves.toBeUndefined();
        });
    });

    describe('get', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should get item from store successfully', async () => {
            const testData = { id: 'test', name: 'Test Item' };
            const getRequest = { ...mockRequest, result: testData };
            mockObjectStore.get.mockReturnValue(getRequest);

            const resultPromise = storage.get('achievements', 'test');
            getRequest.onsuccess();

            const result = await resultPromise;
            expect(result).toEqual(testData);
            expect(mockObjectStore.get).toHaveBeenCalledWith('test');
        });

        it('should handle get error', async () => {
            const error = new Error('Get failed');
            const getRequest = { ...mockRequest, error };
            mockObjectStore.get.mockReturnValue(getRequest);

            const resultPromise = storage.get('achievements', 'test');
            getRequest.onerror();

            await expect(resultPromise).rejects.toThrow(error);
        });

        it('should throw error if database not initialized', async () => {
            const uninitializedStorage = new AchievementStorage();
            await expect(uninitializedStorage.get('achievements', 'test')).rejects.toThrow('Database not initialized');
        });
    });

    describe('getAchievements', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should get all achievements', async () => {
            const achievements: Achievement[] = [
                {
                    id: 'test1',
                    key: 'Test 1',
                    icon: 'test-icon',
                    color: '#000000',
                    category: AchievementCategory.PRODUCTIVITY,
                    type: AchievementType.COUNTER,
                    tiers: [],
                    isHidden: false
                }
            ];

            const getAllRequest = { ...mockRequest, result: achievements };
            mockObjectStore.getAll.mockReturnValue(getAllRequest);

            const resultPromise = storage.getAchievements();
            getAllRequest.onsuccess();

            const result = await resultPromise;
            expect(result).toEqual(achievements);
        });

        it('should handle getAll error', async () => {
            const error = new Error('GetAll failed');
            const getAllRequest = { ...mockRequest, error };
            mockObjectStore.getAll.mockReturnValue(getAllRequest);

            const resultPromise = storage.getAchievements();
            getAllRequest.onerror();

            await expect(resultPromise).rejects.toThrow(error);
        });
    });

    describe('initializeDefaultAchievements', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should initialize default achievements', async () => {
            const achievements: Achievement[] = [
                {
                    id: 'test1',
                    key: 'Test 1',
                    icon: 'test-icon',
                    color: '#000000',
                    category: AchievementCategory.PRODUCTIVITY,
                    type: AchievementType.COUNTER,
                    tiers: [],
                    isHidden: false
                }
            ];

            const putRequest = { ...mockRequest };
            mockObjectStore.put.mockReturnValue(putRequest);

            const resultPromise = storage.initializeDefaultAchievements(achievements);
            putRequest.onsuccess();

            await expect(resultPromise).resolves.toBeUndefined();
            expect(mockObjectStore.put).toHaveBeenCalledWith(achievements[0]);
        });

        it('should throw error if database not initialized', async () => {
            const uninitializedStorage = new AchievementStorage();
            await expect(uninitializedStorage.initializeDefaultAchievements([])).rejects.toThrow('Database not initialized');
        });
    });

    describe('getProgress', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should return empty array when no user ID is set', async () => {
            const result = await storage.getProgress();
            expect(result).toEqual([]);
        });

        it('should get progress for current user', async () => {
            storage.setUserId('user123');

            const progress: AchievementProgress[] = [
                {
                    achievementId: 'test1',
                    currentValue: 5,
                    lastUpdated: new Date(),
                    unlockedTiers: ['bronze']
                }
            ];

            const getAllRequest = { ...mockRequest, result: progress };
            mockIndex.getAll.mockReturnValue(getAllRequest);

            const resultPromise = storage.getProgress();
            getAllRequest.onsuccess();

            const result = await resultPromise;
            expect(result).toEqual(progress);
            expect(mockIndex.getAll).toHaveBeenCalledWith('user123');
        });

        it('should throw error if database not initialized', async () => {
            const uninitializedStorage = new AchievementStorage();
            uninitializedStorage.setUserId('user123');
            await expect(uninitializedStorage.getProgress()).rejects.toThrow('Database not initialized');
        });
    });

    describe('updateProgress', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should update progress with user ID', async () => {
            storage.setUserId('user123');

            const progress: AchievementProgress = {
                achievementId: 'test1',
                currentValue: 5,
                lastUpdated: new Date(),
                unlockedTiers: ['bronze']
            };

            const putRequest = { ...mockRequest };
            mockObjectStore.put.mockReturnValue(putRequest);

            const resultPromise = storage.updateProgress(progress);
            putRequest.onsuccess();

            await expect(resultPromise).resolves.toBeUndefined();
            expect(mockObjectStore.put).toHaveBeenCalledWith({
                ...progress,
                userId: 'user123'
            });
        });

        it('should throw error if user ID not set', async () => {
            const progress: AchievementProgress = {
                achievementId: 'test1',
                currentValue: 5,
                lastUpdated: new Date(),
                unlockedTiers: ['bronze']
            };

            await expect(storage.updateProgress(progress)).rejects.toThrow('User ID not set');
        });

        it('should handle put error', async () => {
            storage.setUserId('user123');

            const progress: AchievementProgress = {
                achievementId: 'test1',
                currentValue: 5,
                lastUpdated: new Date(),
                unlockedTiers: ['bronze']
            };

            const error = new Error('Put failed');
            const putRequest = { ...mockRequest, error };
            mockObjectStore.put.mockReturnValue(putRequest);

            const resultPromise = storage.updateProgress(progress);
            putRequest.onerror();

            await expect(resultPromise).rejects.toThrow(error);
        });
    });

    describe('addEvent', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should add event with user ID', async () => {
            storage.setUserId('user123');

            const event: AchievementEvent = {
                type: AchievementEventType.TASK_COMPLETED,
                data: { taskId: 'task1' },
                timestamp: new Date()
            };

            const addRequest = { ...mockRequest };
            mockObjectStore.add.mockReturnValue(addRequest);

            const resultPromise = storage.addEvent(event);
            addRequest.onsuccess();

            await expect(resultPromise).resolves.toBeUndefined();
            expect(mockObjectStore.add).toHaveBeenCalledWith({
                ...event,
                userId: 'user123'
            });
        });

        it('should throw error if user ID not set', async () => {
            const event: AchievementEvent = {
                type: AchievementEventType.TASK_COMPLETED,
                data: { taskId: 'task1' },
                timestamp: new Date()
            };

            await expect(storage.addEvent(event)).rejects.toThrow('User ID not set');
        });

        it('should throw error if database not initialized', async () => {
            const uninitializedStorage = new AchievementStorage();
            uninitializedStorage.setUserId('user123');

            const event: AchievementEvent = {
                type: AchievementEventType.TASK_COMPLETED,
                data: { taskId: 'task1' },
                timestamp: new Date()
            };

            await expect(uninitializedStorage.addEvent(event)).rejects.toThrow('Database not initialized');
        });
    });

    describe('getEvents', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should return empty array when no user ID is set', async () => {
            const result = await storage.getEvents();
            expect(result).toEqual([]);
        });

        it('should get events for current user', async () => {
            storage.setUserId('user123');

            const events: AchievementEvent[] = [
                {
                    type: AchievementEventType.TASK_COMPLETED,
                    data: { taskId: 'task1' },
                    timestamp: new Date('2023-01-01')
                },
                {
                    type: AchievementEventType.TASK_CREATED,
                    data: { taskId: 'task2' },
                    timestamp: new Date('2023-01-02')
                }
            ];

            const getAllRequest = { ...mockRequest, result: events };
            mockIndex.getAll.mockReturnValue(getAllRequest);

            const resultPromise = storage.getEvents();
            getAllRequest.onsuccess();

            const result = await resultPromise;
            expect(result).toHaveLength(2);
            expect(mockIndex.getAll).toHaveBeenCalledWith('user123');
        });

        it('should limit events when limit specified', async () => {
            storage.setUserId('user123');

            const events: AchievementEvent[] = [
                {
                    type: AchievementEventType.TASK_COMPLETED,
                    data: { taskId: 'task1' },
                    timestamp: new Date('2023-01-03')
                },
                {
                    type: AchievementEventType.TASK_CREATED,
                    data: { taskId: 'task2' },
                    timestamp: new Date('2023-01-02')
                },
                {
                    type: AchievementEventType.TASK_COMPLETED,
                    data: { taskId: 'task3' },
                    timestamp: new Date('2023-01-01')
                }
            ];

            const getAllRequest = { ...mockRequest, result: events };
            mockIndex.getAll.mockReturnValue(getAllRequest);

            const resultPromise = storage.getEvents(2);
            getAllRequest.onsuccess();

            const result = await resultPromise;
            expect(result).toHaveLength(2);
            expect(result[0].timestamp).toEqual(new Date('2023-01-03'));
            expect(result[1].timestamp).toEqual(new Date('2023-01-02'));
        });

        it('should throw error if database not initialized', async () => {
            const uninitializedStorage = new AchievementStorage();
            uninitializedStorage.setUserId('user123');
            await expect(uninitializedStorage.getEvents()).rejects.toThrow('Database not initialized');
        });
    });

    describe('clearAll', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should clear all stores', async () => {
            const clearRequest1 = { ...mockRequest };
            const clearRequest2 = { ...mockRequest };
            const clearRequest3 = { ...mockRequest };

            mockObjectStore.clear
                .mockReturnValueOnce(clearRequest1)
                .mockReturnValueOnce(clearRequest2)
                .mockReturnValueOnce(clearRequest3);

            const resultPromise = storage.clearAll();

            clearRequest1.onsuccess();
            clearRequest2.onsuccess();
            clearRequest3.onsuccess();

            await expect(resultPromise).resolves.toBeUndefined();
            expect(mockObjectStore.clear).toHaveBeenCalledTimes(3);
        });

        it('should throw error if database not initialized', async () => {
            const uninitializedStorage = new AchievementStorage();
            await expect(uninitializedStorage.clearAll()).rejects.toThrow('Database not initialized');
        });
    });

    describe('error handling', () => {
        beforeEach(async () => {
            const initPromise = storage.init();
            mockOpenRequest.result = mockDB;
            mockOpenRequest.onsuccess();
            await initPromise;
        });

        it('should handle getAll error (covers line 76)', async () => {
            const error = new Error('getAll failed');
            const getAllRequest = { ...mockRequest, error };
            mockObjectStore.getAll.mockReturnValue(getAllRequest);

            const resultPromise = storage.getAchievements();
            getAllRequest.onerror();

            await expect(resultPromise).rejects.toThrow(error);
        });

        it('should handle put error (covers line 89)', async () => {
            const error = new Error('Put failed');
            const putRequest = { ...mockRequest, error };
            mockObjectStore.put.mockReturnValue(putRequest);

            const progress = {
                achievementId: 'test1',
                currentValue: 5,
                lastUpdated: new Date(),
                unlockedTiers: []
            };

            storage.setUserId('test-user');
            const resultPromise = storage.updateProgress(progress);
            putRequest.onerror();

            await expect(resultPromise).rejects.toThrow(error);
        });
    });
});
