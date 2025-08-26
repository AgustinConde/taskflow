import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Warning, Info } from '@mui/icons-material';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
    persist?: boolean;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType, options?: { duration?: number; persist?: boolean }) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    hideNotification: (id: string) => void;
    clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
    maxNotifications?: number;
    defaultDuration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    maxNotifications = 3,
    defaultDuration = 4000,
    position = 'top-right'
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const generateId = useCallback(() => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showNotification = useCallback((
        message: string,
        type: NotificationType = 'info',
        options?: { duration?: number; persist?: boolean }
    ) => {
        const id = generateId();
        const duration = options?.duration ?? defaultDuration;
        const persist = options?.persist ?? false;

        const newNotification: Notification = {
            id,
            message,
            type,
            duration,
            persist
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            return updated.slice(0, maxNotifications);
        });

        if (!persist) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, [generateId, defaultDuration, maxNotifications, removeNotification]);

    const showSuccess = useCallback((message: string, duration?: number) => {
        return showNotification(message, 'success', { duration });
    }, [showNotification]);

    const showError = useCallback((message: string, duration?: number) => {
        return showNotification(message, 'error', { duration: duration ?? 6000 });
    }, [showNotification]);

    const showWarning = useCallback((message: string, duration?: number) => {
        return showNotification(message, 'warning', { duration: duration ?? 5000 });
    }, [showNotification]);

    const showInfo = useCallback((message: string, duration?: number) => {
        return showNotification(message, 'info', { duration });
    }, [showNotification]);

    const hideNotification = useCallback((id: string) => {
        removeNotification(id);
    }, [removeNotification]);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const getPositionStyles = () => {
        const positions = {
            'top-right': { top: 24, right: 24 },
            'top-left': { top: 24, left: 24 },
            'bottom-right': { bottom: 24, right: 24 },
            'bottom-left': { bottom: 24, left: 24 },
            'top-center': { top: 24, left: '50%', transform: 'translateX(-50%)' },
            'bottom-center': { bottom: 24, left: '50%', transform: 'translateX(-50%)' }
        };
        return positions[position];
    };

    const getIcon = (type: NotificationType) => {
        const icons = {
            success: <CheckCircle />,
            error: <ErrorIcon />,
            warning: <Warning />,
            info: <Info />
        };
        return icons[type];
    };

    const contextValue: NotificationContextType = {
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification,
        clearAll
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}

            <Box
                data-testid="notification-box"
                sx={{
                    position: 'fixed',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: position.includes('top') ? 'column' : 'column-reverse',
                    gap: 1,
                    maxWidth: 400,
                    width: 'auto',
                    ...getPositionStyles()
                }}
            >
                {notifications.map((notification) => (
                    <Snackbar
                        key={notification.id}
                        open={true}
                        sx={{
                            position: 'relative',
                            transform: 'none !important',
                            margin: 0,
                            width: '100%'
                        }}
                    >
                        <Alert
                            onClose={() => removeNotification(notification.id)}
                            variant="filled"
                            icon={getIcon(notification.type)}
                            sx={{
                                width: '100%',
                                borderRadius: 2,
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                '& .MuiAlert-icon': {
                                    fontSize: '1.25rem',
                                    color: '#fff !important'
                                },
                                '& .MuiAlert-message': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '2px 0',
                                    color: '#fff !important'
                                },
                                '& .MuiAlert-action': {
                                    color: '#fff !important'
                                },
                                '& .MuiIconButton-root': {
                                    color: '#fff !important'
                                },
                                backgroundColor: notification.type === 'success' ? '#7C3AED !important' :
                                    notification.type === 'error' ? '#EF4444 !important' :
                                        notification.type === 'warning' ? '#F59E0B !important' :
                                            notification.type === 'info' ? '#4F46E5 !important' : '#6B7280 !important',
                                color: '#fff !important',
                                border: 'none !important'
                            }}
                        >
                            {notification.message}
                        </Alert>
                    </Snackbar>
                ))}
            </Box>
        </NotificationContext.Provider>
    );
};
