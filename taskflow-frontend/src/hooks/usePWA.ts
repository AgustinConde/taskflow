import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useNotifications } from './useNotifications';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export interface PWAState {
    isOnline: boolean;
    isInstallable: boolean;
    isInstalled: boolean;
    updateAvailable: boolean;
    syncInProgress: boolean;
}

export interface PWAActions {
    installApp: () => Promise<void>;
    updateApp: () => Promise<void>;
    syncData: () => Promise<void>;
}

export const usePWA = (): PWAState & PWAActions => {
    const { showSuccess, showInfo, showWarning } = useNotifications();

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    const {
        needRefresh: [needRefresh],
        offlineReady: [offlineReady],
        updateServiceWorker
    } = useRegisterSW({
        onRegistered(_r) {
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
        onNeedRefresh() {
            showInfo('App update available! Click to refresh.');
        },
        onOfflineReady() {
            showSuccess('App is ready for offline use!');
        }
    });

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            showInfo('Back online! Syncing data...');
            syncData();
        };

        const handleOffline = () => {
            setIsOnline(false);
            showWarning('You are now offline. Changes will be synced when connection is restored.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            showSuccess('App installed successfully!');
        };

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installApp = useCallback(async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                showSuccess('App installation started!');
            }

            setDeferredPrompt(null);
            setIsInstallable(false);
        } catch (error) {
            console.error('Installation failed:', error);
            showWarning('Installation failed. Please try again.');
        }
    }, [deferredPrompt, showSuccess, showWarning]);

    const updateApp = useCallback(async () => {
        try {
            await updateServiceWorker(true);
            showSuccess('App updated successfully!');
        } catch (error) {
            console.error('Update failed:', error);
            showWarning('Update failed. Please try again.');
        }
    }, [updateServiceWorker, showSuccess, showWarning]);

    const syncData = useCallback(async () => {
        if (!isOnline || syncInProgress) return;

        setSyncInProgress(true);
        try {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SYNC_REQUEST'
                });
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Data synced successfully!');
        } catch (error) {
            console.error('Sync failed:', error);
            showWarning('Sync failed. Please try again.');
        } finally {
            setSyncInProgress(false);
        }
    }, [isOnline, syncInProgress, showSuccess, showWarning]);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === 'SYNC_COMPLETE') {
                    setSyncInProgress(false);
                    showSuccess('Background sync completed!');
                }
            };

            navigator.serviceWorker.addEventListener('message', handleMessage);
            return () => {
                navigator.serviceWorker.removeEventListener('message', handleMessage);
            };
        }
    }, [showSuccess]);

    return {
        isOnline,
        isInstallable,
        isInstalled,
        updateAvailable: needRefresh || offlineReady,
        syncInProgress,
        installApp,
        updateApp,
        syncData
    };
};
