import { useNotifications as useBaseNotifications } from '../contexts/NotificationContext';

const notificationCache = new Map<string, number>();
const DEBOUNCE_TIME = 1000; // 1s

export const useNotifications = () => {
    const baseNotifications = useBaseNotifications();

    const showNotificationOnce = (
        type: 'success' | 'error' | 'warning' | 'info',
        message: string,
        identifier?: string
    ) => {
        const key = identifier || `${type}-${message}`;
        const now = Date.now();

        if (notificationCache.has(key)) {
            const lastShown = notificationCache.get(key)!;
            if (now - lastShown < DEBOUNCE_TIME) {
                return;
            }
        }

        notificationCache.set(key, now);

        setTimeout(() => {
            notificationCache.delete(key);
        }, DEBOUNCE_TIME);

        switch (type) {
            case 'success':
                baseNotifications.showSuccess(message);
                break;
            case 'error':
                baseNotifications.showError(message);
                break;
            case 'warning':
                baseNotifications.showWarning(message);
                break;
            case 'info':
                baseNotifications.showInfo(message);
                break;
        }
    };

    return {
        ...baseNotifications,
        showSuccess: (message: string, identifier?: string) =>
            showNotificationOnce('success', message, identifier),
        showError: (message: string, identifier?: string) =>
            showNotificationOnce('error', message, identifier),
        showWarning: (message: string, identifier?: string) =>
            showNotificationOnce('warning', message, identifier),
        showInfo: (message: string, identifier?: string) =>
            showNotificationOnce('info', message, identifier),
    };
};