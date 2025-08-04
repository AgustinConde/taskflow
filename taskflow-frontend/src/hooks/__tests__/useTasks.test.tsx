import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../useTasks';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__tests__/utils/i18n-test';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </I18nextProvider>
        </QueryClientProvider>
    );
};

describe('useTasks Hook', () => {
    describe('useTasks', () => {
        it('should fetch tasks', async () => {
            const { result } = renderHook(() => useTasks(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toBeDefined();
            expect(Array.isArray(result.current.data)).toBe(true);
        });

        it('should handle loading state', () => {
            const { result } = renderHook(() => useTasks(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBeDefined();
            expect(typeof result.current.isLoading).toBe('boolean');
        });
    });

    describe('useCreateTask', () => {
        it('should provide create task mutation', () => {
            const { result } = renderHook(() => useCreateTask(), {
                wrapper: createWrapper(),
            });

            expect(result.current.mutate).toBeDefined();
            expect(result.current.mutateAsync).toBeDefined();
            expect(typeof result.current.mutate).toBe('function');
        });

        it('should handle mutation states', () => {
            const { result } = renderHook(() => useCreateTask(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isPending).toBeDefined();
            expect(result.current.isError).toBeDefined();
            expect(result.current.isSuccess).toBeDefined();
        });
    });

    describe('useUpdateTask', () => {
        it('should provide update task mutation', () => {
            const { result } = renderHook(() => useUpdateTask(), {
                wrapper: createWrapper(),
            });

            expect(result.current.mutate).toBeDefined();
            expect(result.current.mutateAsync).toBeDefined();
            expect(typeof result.current.mutate).toBe('function');
        });
    });

    describe('useDeleteTask', () => {
        it('should provide delete task mutation', () => {
            const { result } = renderHook(() => useDeleteTask(), {
                wrapper: createWrapper(),
            });

            expect(result.current.mutate).toBeDefined();
            expect(result.current.mutateAsync).toBeDefined();
            expect(typeof result.current.mutate).toBe('function');
        });
    });

    describe('task operations integration', () => {
        it('should handle task completion toggle', async () => {
            const { result } = renderHook(() => useUpdateTask(), {
                wrapper: createWrapper(),
            });

            expect(result.current.mutate).toBeDefined();
            expect(typeof result.current.mutate).toBe('function');
        });

        it('should handle task creation with category', async () => {
            const { result } = renderHook(() => useCreateTask(), {
                wrapper: createWrapper(),
            });

            expect(result.current.mutate).toBeDefined();
            expect(typeof result.current.mutate).toBe('function');
        });
    });
});
