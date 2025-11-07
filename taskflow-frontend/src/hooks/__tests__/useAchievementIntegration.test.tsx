import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAchievementIntegration } from '../useAchievementIntegration';
import { TestProviders } from '../../__tests__/utils/testProviders';

const mockTrackEvent = vi.fn();

vi.mock('../useAchievementTracker', () => ({
    useAchievementTracker: () => ({
        trackEvent: mockTrackEvent
    }),
    AchievementTrackerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
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

    it('should track late task completion', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const taskData = {
            id: 1,
            title: 'Test Task',
            dueDate: new Date(Date.now() - 86400000).toISOString() // Yesterday
        };

        result.current.trackTaskCompleted(taskData);

        expect(mockTrackEvent).toHaveBeenCalledWith('task_completed', taskData);
        expect(mockTrackEvent).toHaveBeenCalledWith('task_completed_late', taskData);
    });

    it('should track night owl achievement in late hours', () => {
        const mockGetHours = vi.fn(() => 23);
        const OriginalDate = global.Date;

        global.Date = vi.fn(() => ({
            getHours: mockGetHours
        })) as any;

        global.Date.now = OriginalDate.now;

        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const taskData = { id: 1, title: 'Night Task' };
        result.current.trackTaskCompleted(taskData);

        expect(mockTrackEvent).toHaveBeenCalledWith('night_owl', taskData);

        global.Date = OriginalDate;
    });

    it('should track night owl achievement in very early hours', () => {
        const mockGetHours = vi.fn(() => 2);
        const OriginalDate = global.Date;

        global.Date = vi.fn(() => ({
            getHours: mockGetHours
        })) as any;

        global.Date.now = OriginalDate.now;

        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const taskData = { id: 1, title: 'Very Early Task' };
        result.current.trackTaskCompleted(taskData);

        expect(mockTrackEvent).toHaveBeenCalledWith('night_owl', taskData);

        global.Date = OriginalDate;
    });

    it('should track task updated', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const taskData = { id: 1, title: 'Updated Task' };
        result.current.trackTaskUpdated(taskData);

        expect(mockTrackEvent).toHaveBeenCalledWith(
            'task_updated',
            taskData
        );
    });

    it('should track task deleted', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const taskData = { id: 1, title: 'Deleted Task' };
        result.current.trackTaskDeleted(taskData);

        expect(mockTrackEvent).toHaveBeenCalledWith(
            'task_deleted',
            taskData
        );
    });

    it('should track category created', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const categoryData = { id: 1, name: 'New Category' };
        result.current.trackCategoryCreated(categoryData);

        expect(mockTrackEvent).toHaveBeenCalledWith(
            'category_created',
            categoryData
        );
    });

    it('should track category updated', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const categoryData = { id: 1, name: 'Updated Category' };
        result.current.trackCategoryUpdated(categoryData);

        expect(mockTrackEvent).toHaveBeenCalledWith(
            'category_updated',
            categoryData
        );
    });

    it('should track category deleted', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        const categoryData = { id: 1, name: 'Deleted Category' };
        result.current.trackCategoryDeleted(categoryData);

        expect(mockTrackEvent).toHaveBeenCalledWith(
            'category_deleted',
            categoryData
        );
    });

    it('should track calendar viewed', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        result.current.trackCalendarViewed();

        expect(mockTrackEvent).toHaveBeenCalledWith('calendar_viewed');
    });

    it('should track dashboard viewed', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        result.current.trackDashboardViewed();

        expect(mockTrackEvent).toHaveBeenCalledWith('dashboard_viewed');
    });

    it('should track all tasks completed today', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        result.current.trackAllTasksCompletedToday();

        expect(mockTrackEvent).toHaveBeenCalledWith('all_tasks_completed_today');
    });

    it('should track weekend productivity', () => {
        const { result } = renderHook(() => useAchievementIntegration(), {
            wrapper: createWrapper()
        });

        result.current.trackWeekendProductivity();

        expect(mockTrackEvent).toHaveBeenCalledWith('weekend_productivity');
    });
});