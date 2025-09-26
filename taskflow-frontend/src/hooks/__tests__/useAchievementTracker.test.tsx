import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAchievementTracker } from '../useAchievementTracker';
import { TestProviders } from '../../__tests__/utils/testProviders';

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
        trackEvent: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('../../services/authService', () => ({
    authService: {
        getToken: vi.fn(() => null),
        getCurrentUser: vi.fn().mockResolvedValue({ id: 1 })
    }
}));

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

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        expect(result.current.achievements).toEqual([]);
        expect(result.current.progress).toEqual([]);
        expect(result.current.userStats).toBeNull();
        expect(result.current.isInitialized).toBe(false);
        expect(typeof result.current.trackEvent).toBe('function');
    });

    it('should have trackEvent function available', () => {
        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        expect(typeof result.current.trackEvent).toBe('function');
    });

    it('should have initialized state as false initially', () => {
        const { result } = renderHook(() => useAchievementTracker(), {
            wrapper: createWrapper()
        });

        expect(result.current.isInitialized).toBe(false);
    });
});