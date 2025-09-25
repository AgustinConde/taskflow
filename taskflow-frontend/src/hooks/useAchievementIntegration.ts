import { useCallback } from 'react';
import { useAchievementTracker } from './useAchievementTracker';
import { AchievementEventType } from '../types/Achievement';

export const useAchievementIntegration = () => {
    const { trackEvent } = useAchievementTracker();

    const trackTaskCreated = (taskData: any) => {
        trackEvent(AchievementEventType.TASK_CREATED, taskData);
    };

    const trackTaskCompleted = (taskData: any) => {
        trackEvent(AchievementEventType.TASK_COMPLETED, taskData);

        if (taskData.dueDate) {
            const now = new Date();
            const dueDate = new Date(taskData.dueDate);

            if (now <= dueDate) {
                trackEvent(AchievementEventType.TASK_COMPLETED_ON_TIME, taskData);
            } else {
                trackEvent(AchievementEventType.TASK_COMPLETED_LATE, taskData);
            }
        }

        const hour = new Date().getHours();
        if (hour >= 4 && hour < 10) {
            trackEvent(AchievementEventType.EARLY_BIRD, taskData);
        }

        if (hour >= 21 || hour < 4) {
            trackEvent(AchievementEventType.NIGHT_OWL, taskData);
        }
    };

    const trackTaskUpdated = (taskData: any) => {
        trackEvent(AchievementEventType.TASK_UPDATED, taskData);
    };

    const trackTaskDeleted = (taskData: any) => {
        trackEvent(AchievementEventType.TASK_DELETED, taskData);
    };

    const trackCategoryCreated = (categoryData: any) => {
        trackEvent(AchievementEventType.CATEGORY_CREATED, categoryData);
    };

    const trackCategoryUpdated = (categoryData: any) => {
        trackEvent(AchievementEventType.CATEGORY_UPDATED, categoryData);
    };

    const trackCategoryDeleted = (categoryData: any) => {
        trackEvent(AchievementEventType.CATEGORY_DELETED, categoryData);
    };

    const trackAppOpened = useCallback(() => {
        trackEvent(AchievementEventType.APP_OPENED);
        trackEvent(AchievementEventType.DAILY_LOGIN);
    }, [trackEvent]);

    const trackCalendarViewed = () => {
        trackEvent(AchievementEventType.CALENDAR_VIEWED);
    };

    const trackDashboardViewed = () => {
        trackEvent(AchievementEventType.DASHBOARD_VIEWED);
    };

    const trackAllTasksCompletedToday = () => {
        trackEvent(AchievementEventType.ALL_TASKS_COMPLETED_TODAY);
    };

    const trackWeekendProductivity = () => {
        trackEvent(AchievementEventType.WEEKEND_PRODUCTIVITY);
    };

    return {
        trackTaskCreated,
        trackTaskCompleted,
        trackTaskUpdated,
        trackTaskDeleted,

        trackCategoryCreated,
        trackCategoryUpdated,
        trackCategoryDeleted,

        trackAppOpened,
        trackCalendarViewed,
        trackDashboardViewed,

        trackAllTasksCompletedToday,
        trackWeekendProductivity
    };
};