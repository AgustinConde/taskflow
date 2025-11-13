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
    beforeEach(() => vi.clearAllMocks());

    const render = () => renderHook(() => useAchievementIntegration(), { wrapper: createWrapper() }).result.current;

    it('tracks task events', () => {
        const h = render();
        h.trackTaskCreated({ id: 1 });
        h.trackTaskUpdated({ id: 1 });
        h.trackTaskDeleted({ id: 1 });
        expect(mockTrackEvent).toHaveBeenCalledWith('task_created', { id: 1 });
        expect(mockTrackEvent).toHaveBeenCalledWith('task_updated', { id: 1 });
        expect(mockTrackEvent).toHaveBeenCalledWith('task_deleted', { id: 1 });
    });

    it('tracks category events', () => {
        const h = render();
        h.trackCategoryCreated({ id: 1 });
        h.trackCategoryUpdated({ id: 1 });
        h.trackCategoryDeleted({ id: 1 });
        expect(mockTrackEvent).toHaveBeenCalledWith('category_created', { id: 1 });
        expect(mockTrackEvent).toHaveBeenCalledWith('category_updated', { id: 1 });
        expect(mockTrackEvent).toHaveBeenCalledWith('category_deleted', { id: 1 });
    });

    it('tracks navigation events', () => {
        const h = render();
        h.trackCalendarViewed();
        h.trackDashboardViewed();
        h.trackAllTasksCompletedToday();
        h.trackWeekendProductivity();
        expect(mockTrackEvent).toHaveBeenCalledWith('calendar_viewed');
        expect(mockTrackEvent).toHaveBeenCalledWith('dashboard_viewed');
        expect(mockTrackEvent).toHaveBeenCalledWith('all_tasks_completed_today');
        expect(mockTrackEvent).toHaveBeenCalledWith('weekend_productivity');
    });

    it('tracks task completion with on-time event', () => {
        render().trackTaskCompleted({ dueDate: new Date(Date.now() + 86400000).toISOString() });
        expect(mockTrackEvent).toHaveBeenCalledWith('task_completed_on_time', expect.any(Object));
    });

    it('tracks task completion with late event', () => {
        render().trackTaskCompleted({ dueDate: new Date(Date.now() - 86400000).toISOString() });
        expect(mockTrackEvent).toHaveBeenCalledWith('task_completed_late', expect.any(Object));
    });

    it('tracks early bird (4-10am)', () => {
        vi.spyOn(global.Date.prototype, 'getHours').mockReturnValue(8);
        render().trackTaskCompleted({});
        expect(mockTrackEvent).toHaveBeenCalledWith('early_bird', expect.any(Object));
    });

    it('tracks night owl (21-4)', () => {
        vi.spyOn(global.Date.prototype, 'getHours').mockReturnValue(23);
        render().trackTaskCompleted({});
        expect(mockTrackEvent).toHaveBeenCalledWith('night_owl', expect.any(Object));
    });

    it('tracks app opened with daily login', () => {
        render().trackAppOpened();
        expect(mockTrackEvent).toHaveBeenCalledWith('app_opened');
        expect(mockTrackEvent).toHaveBeenCalledWith('daily_login');
    });
});