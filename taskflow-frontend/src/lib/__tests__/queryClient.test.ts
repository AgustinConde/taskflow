import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryClient } from '../queryClient';

describe('QueryClient Configuration', () => {
    it('should export a QueryClient instance', () => {
        expect(queryClient).toBeInstanceOf(QueryClient);
    });

    describe('Query default options', () => {
        it('should have correct staleTime configuration', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;

            expect(queryDefaults?.staleTime).toBe(1000 * 60 * 5);
        });

        it('should have correct gcTime configuration', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;

            expect(queryDefaults?.gcTime).toBe(1000 * 60 * 10);
        });

        it('should have correct retry configuration', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;

            expect(queryDefaults?.retry).toBe(3);
        });

        it('should have retry delay function configured', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;

            expect(typeof queryDefaults?.retryDelay).toBe('function');

            if (queryDefaults?.retryDelay && typeof queryDefaults.retryDelay === 'function') {
                const mockError = new Error('test');
                expect(queryDefaults.retryDelay(0, mockError)).toBe(1000); // 2^0 * 1000 = 1000
                expect(queryDefaults.retryDelay(1, mockError)).toBe(2000); // 2^1 * 1000 = 2000
                expect(queryDefaults.retryDelay(2, mockError)).toBe(4000); // 2^2 * 1000 = 4000
                expect(queryDefaults.retryDelay(3, mockError)).toBe(8000); // 2^3 * 1000 = 8000
                expect(queryDefaults.retryDelay(10, mockError)).toBe(30000); // Should cap at 30000
            }
        });

        it('should have refetchOnWindowFocus enabled', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;

            expect(queryDefaults?.refetchOnWindowFocus).toBe(true);
        });

        it('should have refetchOnReconnect enabled', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;

            expect(queryDefaults?.refetchOnReconnect).toBe(true);
        });
    });

    describe('Mutation default options', () => {
        it('should have correct retry configuration for mutations', () => {
            const mutationDefaults = queryClient.getDefaultOptions().mutations;

            expect(mutationDefaults?.retry).toBe(1);
        });

        it('should have correct retry delay for mutations', () => {
            const mutationDefaults = queryClient.getDefaultOptions().mutations;

            expect(mutationDefaults?.retryDelay).toBe(1000);
        });
    });

    describe('Retry delay function behavior', () => {
        it('should implement exponential backoff correctly', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;
            const retryDelay = queryDefaults?.retryDelay;

            if (retryDelay && typeof retryDelay === 'function') {
                const mockError = new Error('test');
                expect(retryDelay(0, mockError)).toBe(1000);
                expect(retryDelay(1, mockError)).toBe(2000);
                expect(retryDelay(2, mockError)).toBe(4000);
                expect(retryDelay(3, mockError)).toBe(8000);
                expect(retryDelay(4, mockError)).toBe(16000);

                // Cap at 30000
                expect(retryDelay(5, mockError)).toBe(30000);
                expect(retryDelay(10, mockError)).toBe(30000);
                expect(retryDelay(100, mockError)).toBe(30000);
            }
        });

        it('should handle edge cases in retry delay', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;
            const retryDelay = queryDefaults?.retryDelay;

            if (retryDelay && typeof retryDelay === 'function') {
                const mockError = new Error('test');
                expect(retryDelay(-1, mockError)).toBe(500);
                expect(retryDelay(0, mockError)).toBe(1000);
                expect(retryDelay(1000, mockError)).toBe(30000);
            }
        });
    });

    describe('QueryClient functionality', () => {
        it('should be able to set and get query data', () => {
            const testData = { id: 1, name: 'test' };
            const queryKey = ['test-query'];

            queryClient.setQueryData(queryKey, testData);
            const retrievedData = queryClient.getQueryData(queryKey);

            expect(retrievedData).toEqual(testData);
        });

        it('should be able to invalidate queries', () => {
            expect(() => {
                queryClient.invalidateQueries({ queryKey: ['test'] });
            }).not.toThrow();
        });

        it('should be able to clear all queries', () => {
            queryClient.setQueryData(['test-1'], { data: 'test1' });
            queryClient.setQueryData(['test-2'], { data: 'test2' });

            queryClient.clear();

            expect(queryClient.getQueryData(['test-1'])).toBeUndefined();
            expect(queryClient.getQueryData(['test-2'])).toBeUndefined();
        });

        it('should be able to get query cache', () => {
            const cache = queryClient.getQueryCache();

            expect(cache).toBeDefined();
            expect(typeof cache.find).toBe('function');
            expect(typeof cache.findAll).toBe('function');
        });

        it('should be able to get mutation cache', () => {
            const cache = queryClient.getMutationCache();

            expect(cache).toBeDefined();
            expect(typeof cache.find).toBe('function');
            expect(typeof cache.findAll).toBe('function');
        });
    });

    describe('Configuration validation', () => {
        it('should have reasonable staleTime (not too short, not too long)', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;
            const staleTime = queryDefaults?.staleTime as number;

            expect(staleTime).toBeGreaterThanOrEqual(60 * 1000);

            expect(staleTime).toBeLessThanOrEqual(60 * 60 * 1000);
        });

        it('should have reasonable gcTime (should be longer than staleTime)', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;
            const staleTime = queryDefaults?.staleTime as number;
            const gcTime = queryDefaults?.gcTime as number;

            expect(gcTime).toBeGreaterThan(staleTime);
        });

        it('should have reasonable retry attempts (not too aggressive)', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;
            const mutationDefaults = queryClient.getDefaultOptions().mutations;

            expect(queryDefaults?.retry).toBeLessThanOrEqual(5);
            expect(queryDefaults?.retry).toBeGreaterThanOrEqual(1);

            expect(mutationDefaults?.retry).toBeLessThanOrEqual(3);
            expect(mutationDefaults?.retry).toBeGreaterThanOrEqual(0);
        });

        it('should have refetch options that make sense for the app', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;

            expect(queryDefaults?.refetchOnWindowFocus).toBe(true);
            expect(queryDefaults?.refetchOnReconnect).toBe(true);
        });
    });

    describe('Performance considerations', () => {
        it('should have appropriate cache times for task management', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;
            const staleTime = queryDefaults?.staleTime as number;
            const gcTime = queryDefaults?.gcTime as number;

            expect(staleTime).toBe(5 * 60 * 1000);

            expect(gcTime).toBe(10 * 60 * 1000);
        });

        it('should have exponential backoff that prevents excessive requests', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;
            const retryDelay = queryDefaults?.retryDelay;

            if (retryDelay && typeof retryDelay === 'function') {
                const mockError = new Error('test');
                const totalRetryTime = retryDelay(0, mockError) + retryDelay(1, mockError) + retryDelay(2, mockError);

                expect(totalRetryTime).toBeLessThan(30000);

                expect(totalRetryTime).toBeGreaterThan(5000);
            }
        });

        it('should cap retry delay to prevent excessive waits', () => {
            const queryDefaults = queryClient.getDefaultOptions().queries;
            const retryDelay = queryDefaults?.retryDelay;

            if (retryDelay && typeof retryDelay === 'function') {
                const mockError = new Error('test');
                for (let i = 0; i < 20; i++) {
                    expect(retryDelay(i, mockError)).toBeLessThanOrEqual(30000);
                }
            }
        });
    });
});
