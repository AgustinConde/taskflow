import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAchievementIntegration } from '../useAchievementIntegration';
import { TestProviders } from '../../__tests__/utils/testProviders';

const mockTrackEvent = vi.fn();

vi.mock('../useAchievementTracker', () => ({
    useAchievementTracker: () => ({
        trackEvent: mockTrackEvent
    })
}));

const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestProviders>
            {children}
        </TestProviders>
    );
};

describe('useAchievementIntegration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should provide all tracking functions', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        expect(typeof result.current.trackTaskCreated).toBe('function');
        expect(typeof result.current.trackTaskCompleted).toBe('function');
        expect(typeof result.current.trackTaskUpdated).toBe('function');
        expect(typeof result.current.trackTaskDeleted).toBe('function');
        expect(typeof result.current.trackCategoryCreated).toBe('function');
        expect(typeof result.current.trackCategoryUpdated).toBe('function');
        expect(typeof result.current.trackCategoryDeleted).toBe('function');
        expect(typeof result.current.trackAppOpened).toBe('function');
        expect(typeof result.current.trackCalendarViewed).toBe('function');
        expect(typeof result.current.trackDashboardViewed).toBe('function');
        expect(typeof result.current.trackAllTasksCompletedToday).toBe('function');
        expect(typeof result.current.trackWeekendProductivity).toBe('function');
    });

    it('should track task completion with timing events', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const taskData = {
            id: 1,
            title: 'Test Task',
            dueDate: new Date(Date.now() + 86400000).toISOString()
        };

        result.current.trackTaskCompleted(taskData);

        expect(mockTrackEvent).toHaveBeenCalled();
    });

    it('should track early bird achievement in morning hours', () => {
        const originalDate = Date;
        const mockDate = new Date('2023-01-01T08:00:00Z');
        vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const taskData = { id: 1, title: 'Morning Task' };
        result.current.trackTaskCompleted(taskData);

        expect(mockTrackEvent).toHaveBeenCalledWith(
            expect.anything(),
            taskData
        );

        global.Date = originalDate;
    });

    it('should track app opened', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        result.current.trackAppOpened();

        expect(mockTrackEvent).toHaveBeenCalled();
    });
});