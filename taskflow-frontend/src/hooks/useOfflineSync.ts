import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineStorage } from '../utils/offlineStorage';
import { useNotifications } from '../contexts/NotificationContext';
import type { Task } from '../types/Task';
import type { Category } from '../types/Category';

export const useOfflineSync = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError, showWarning } = useNotifications();

    const [isInitialized, setIsInitialized] = useState(false);
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(0);

    useEffect(() => {
        const initStorage = async () => {
            try {
                await offlineStorage.init();
                setIsInitialized(true);

                const changes = await offlineStorage.getPendingChanges();
                setPendingChanges(changes.length);
            } catch (error) {
                console.error('Failed to initialize offline storage:', error);
                showError('Failed to initialize offline storage');
            }
        };

        initStorage();
    }, [showError]);

    const syncToOfflineStorage = useCallback(async (tasks: Task[], categories: Category[]) => {
        if (!isInitialized) return;

        try {
            await offlineStorage.clear('tasks');
            await offlineStorage.clear('categories');

            for (const task of tasks) {
                await offlineStorage.saveTask(task);
            }

            for (const category of categories) {
                await offlineStorage.saveCategory(category);
            }

            await offlineStorage.setLastSync(Date.now());
        } catch (error) {
            console.error('Failed to sync to offline storage:', error);
        }
    }, [isInitialized]);

    const loadFromOfflineStorage = useCallback(async () => {
        if (!isInitialized) return { tasks: [], categories: [] };

        try {
            const tasks = await offlineStorage.getTasks();
            const categories = await offlineStorage.getCategories();

            return { tasks, categories };
        } catch (error) {
            console.error('Failed to load from offline storage:', error);
            return { tasks: [], categories: [] };
        }
    }, [isInitialized]);

    const savePendingChange = useCallback(async (
        type: 'CREATE' | 'UPDATE' | 'DELETE',
        entity: 'task' | 'category',
        data: any,
        entityId?: number
    ) => {
        if (!isInitialized) return;

        try {
            await offlineStorage.addPendingChange({
                type,
                entity,
                data,
                entityId
            });

            const changes = await offlineStorage.getPendingChanges();
            setPendingChanges(changes.length);

            showWarning(`Change saved for sync. ${changes.length} pending changes.`);
        } catch (error) {
            console.error('Failed to save pending change:', error);
            showError('Failed to save change for sync');
        }
    }, [isInitialized, showWarning, showError]);

    const syncPendingChanges = useCallback(async () => {
        if (!isInitialized || !navigator.onLine) {
            showWarning('Cannot sync while offline');
            return;
        }

        setSyncInProgress(true);

        try {
            const changes = await offlineStorage.getPendingChanges();
            let syncedCount = 0;
            const failedChanges = [];

            for (const change of changes) {
                try {
                    let url = '';
                    let method = '';
                    let body = null;

                    if (change.entity === 'task') {
                        switch (change.type) {
                            case 'CREATE':
                                url = '/api/tasks';
                                method = 'POST';
                                body = JSON.stringify(change.data);
                                break;
                            case 'UPDATE':
                                url = `/api/tasks/${change.entityId}`;
                                method = 'PUT';
                                body = JSON.stringify(change.data);
                                break;
                            case 'DELETE':
                                url = `/api/tasks/${change.entityId}`;
                                method = 'DELETE';
                                break;
                        }
                    } else if (change.entity === 'category') {
                        switch (change.type) {
                            case 'CREATE':
                                url = '/api/categories';
                                method = 'POST';
                                body = JSON.stringify(change.data);
                                break;
                            case 'UPDATE':
                                url = `/api/categories/${change.entityId}`;
                                method = 'PUT';
                                body = JSON.stringify(change.data);
                                break;
                            case 'DELETE':
                                url = `/api/categories/${change.entityId}`;
                                method = 'DELETE';
                                break;
                        }
                    }

                    if (url) {
                        const response = await fetch(url, {
                            method,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body
                        });

                        if (response.ok) {
                            syncedCount++;
                        } else {
                            failedChanges.push(change);
                        }
                    }
                } catch (error) {
                    console.error('Failed to sync change:', error);
                    failedChanges.push(change);
                }
            }

            if (syncedCount > 0) {
                await offlineStorage.clearPendingChanges();

                for (const failedChange of failedChanges) {
                    await offlineStorage.addPendingChange(failedChange);
                }

                setPendingChanges(failedChanges.length);

                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['categories'] });

                showSuccess(`Synced ${syncedCount} changes successfully`);

                if (failedChanges.length > 0) {
                    showWarning(`${failedChanges.length} changes failed to sync`);
                }
            } else {
                showError('No changes were synced');
            }

        } catch (error) {
            console.error('Sync failed:', error);
            showError('Sync failed');
        } finally {
            setSyncInProgress(false);
        }
    }, [isInitialized, queryClient, showSuccess, showWarning, showError]);

    const shouldUseOfflineData = useCallback(async () => {
        if (!isInitialized || navigator.onLine) return false;

        const lastSync = await offlineStorage.getLastSync();
        return lastSync !== null; // Have offline data available
    }, [isInitialized]);

    return {
        isInitialized,
        syncInProgress,
        pendingChanges,
        syncToOfflineStorage,
        loadFromOfflineStorage,
        savePendingChange,
        syncPendingChanges,
        shouldUseOfflineData
    };
};
